import Lenis from 'lenis';
import { animate, hover, inView, stagger } from 'motion';

const EASE = [0.16, 1, 0.3, 1] as const;
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let lenis: Lenis | null = null;
let cleanups: Array<() => void> = [];

/** Smooth, weighted scrolling — the single biggest "Framer feel" factor. */
function initSmoothScroll() {
	if (reduced()) return;

	// Lenis and its frame loop are created once and survive client-side navigation;
	// the listeners below are torn down by cleanup, so they must be re-bound every init.
	if (!lenis) {
		lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9, touchMultiplier: 1.6 });
		const raf = (time: number) => {
			lenis?.raf(time);
			runDrivers();
			rafId = requestAnimationFrame(raf);
		};
		rafId = requestAnimationFrame(raf);
	}

	// A stationary cursor should not light up every row and card that slides under it.
	// Suppressing pointer events while the page moves kills that flicker, CSS :hover included.
	// Keep in-page anchors working through Lenis.
	document.querySelectorAll<HTMLAnchorElement>('a[href^="#"], a[href^="/#"]').forEach((a) => {
		const onClick = (e: MouseEvent) => {
			const id = a.getAttribute('href')!.split('#')[1];
			const target = id && document.getElementById(id);
			if (!target) return;
			e.preventDefault();
			lenis?.scrollTo(target, { offset: -90 });
		};
		a.addEventListener('click', onClick);
		cleanups.push(() => a.removeEventListener('click', onClick));
	});
}

/** Blur + rise reveal, staggered across a group. */
function initReveals() {
	if (reduced()) {
		document
			.querySelectorAll<HTMLElement>('[data-anim="rise"]')
			.forEach((el) => (el.style.opacity = '1'));
		return;
	}
	const groups = new Map<Element | null, Element[]>();
	document.querySelectorAll('[data-anim="rise"]').forEach((el) => {
		const group = el.closest('[data-anim-group]');
		const list = groups.get(group) ?? [];
		list.push(el);
		groups.set(group, list);
	});

	for (const [, els] of groups) {
		els.forEach((el, i) => {
			// Reveals are a one-time entrance. inView fires on every re-entry, so without
			// this guard the element replays its slide-in each time you scroll back to it.
			if (el.closest('[data-anim-unit]')) return;
			let played = false;
			const stop = inView(
				el,
				() => {
					if (played) return;
					played = true;
					stop();
					animate(
						el,
						{ opacity: [0, 1], y: [28, 0], filter: ['blur(8px)', 'blur(0px)'] },
						{ duration: 0.85, delay: Math.min(i, 5) * 0.06, ease: EASE }
					);
				},
				{ amount: 0.1, margin: '0px 0px 6% 0px' }
			);
			cleanups.push(stop);
		});
	}
}

/**
 * Frames are scroll-linked, not one-shot: the picture grows and unclips as it crosses the
 * viewport, so the motion tracks the scroll wheel the way the reference does.
 */
function initImageReveals() {
	document.querySelectorAll<HTMLElement>('[data-reveal-frame]').forEach((frame) => {
		if (frame.closest('[data-hero]')) return; // the hero runs its own pinned sequence
		if (reduced()) {
			frame.style.opacity = '1';
			return;
		}
		let settled = false;
		drivers.push(() => {
			const rect = frame.getBoundingClientRect();
			if (rect.bottom < -100 || rect.top > window.innerHeight + 100) return;
			const p = enterProgress(frame, 1.02, 0.52);
			const eased = 1 - Math.pow(1 - p, 3);

			if (eased > 0.999) {
				if (!settled) {
					settled = true;
					frame.style.opacity = '1';
					frame.style.transform = '';
					frame.style.willChange = 'auto';
				}
				return;
			}

			settled = false;
			frame.style.willChange = 'transform, opacity';
			frame.style.opacity = (0.25 + 0.75 * eased).toFixed(3);
			frame.style.transform = `scale(${(0.9 + 0.1 * eased).toFixed(4)})`;
		});
	});
}

/**
 * A section animates as one composition — image and copy on a single staggered timeline —
 * instead of each element independently tripping its own threshold.
 */
function initUnits() {
	document.querySelectorAll<HTMLElement>('[data-anim-unit]').forEach((unit) => {
		const frames = Array.from(unit.querySelectorAll<HTMLElement>('[data-reveal-frame]'));
		const items = Array.from(unit.querySelectorAll<HTMLElement>('[data-anim="rise"]'));
		const masks = Array.from(unit.querySelectorAll<HTMLElement>('[data-anim="mask"]'));
		if (!frames.length && !items.length && !masks.length) return;

		let played = false;
		const stop = inView(
			unit,
			() => {
				if (played) return;
				played = true;
				stop();
				if (reduced()) {
					items.forEach((el) => (el.style.opacity = '1'));
					return;
				}
				masks.forEach((el, i) => {
					el.dataset.maskDone = 'true';
					animate(el, { y: ['108%', '0%'] }, { duration: 1.05, delay: i * 0.08, ease: EASE });
					animate(el, { opacity: [0, 1] }, { duration: 0.5, delay: i * 0.08, ease: 'linear' });
				});
				items.forEach((el, i) => {
					el.dataset.riseDone = 'true';
					animate(
						el,
						{ opacity: [0, 1], y: [30, 0], filter: ['blur(8px)', 'blur(0px)'] },
						{ duration: 0.95, delay: 0.06 + i * 0.09, ease: EASE }
					);
				});
				void frames; // frames are scroll-linked in initImageReveals
			},
			{ amount: 0.14, margin: '0px 0px 4% 0px' }
		);
		cleanups.push(stop);
	});
}

/** Headings rise out of a mask, line by line. */
function initMaskReveals() {
	document.querySelectorAll<HTMLElement>('[data-anim="mask"]').forEach((el) => {
		if (reduced() || el.closest('[data-anim-unit]')) return;
		// Observe the overflow-hidden clip, not the h2: the keyframe pushes the heading out
		// of its own clip box, so observing it makes IntersectionObserver retrigger forever.
		const clip = el.parentElement ?? el;
		let played = false;
		const stop = inView(
			clip,
			() => {
				if (played) return;
				played = true;
				stop();
				animate(el, { y: ['108%', '0%'] }, { duration: 1.05, ease: EASE });
				animate(el, { opacity: [0, 1] }, { duration: 0.5, ease: 'linear' });
			},
			{ amount: 0.35, margin: '0px 0px 4% 0px' }
		);
		cleanups.push(stop);
	});
}

/** A soft dot that trails the pointer and swells over anything clickable. */
function initCursor() {
	if (reduced() || !window.matchMedia('(pointer: fine)').matches) return;
	let dot = document.querySelector<HTMLElement>('[data-cursor]');
	if (!dot) {
		dot = document.createElement('div');
		dot.setAttribute('data-cursor', '');
		dot.setAttribute('aria-hidden', 'true');
		dot.className =
			'pointer-events-none fixed top-0 left-0 z-[60] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold opacity-0 mix-blend-difference';
		document.body.append(dot);
	}
	const pos = { x: innerWidth / 2, y: innerHeight / 2 };
	const target = { ...pos };
	let scale = 1;
	let targetScale = 1;

	const onMove = (e: PointerEvent) => {
		target.x = e.clientX;
		target.y = e.clientY;
		dot!.style.opacity = '1';
	};
	const onOver = (e: PointerEvent) => {
		targetScale = (e.target as Element)?.closest?.('a, button, summary, [data-row]') ? 3.4 : 1;
	};
	window.addEventListener('pointermove', onMove, { passive: true });
	window.addEventListener('pointerover', onOver, { passive: true });
	cleanups.push(() => {
		window.removeEventListener('pointermove', onMove);
		window.removeEventListener('pointerover', onOver);
	});

	let frame = 0;
	const tick = () => {
		pos.x += (target.x - pos.x) * 0.18;
		pos.y += (target.y - pos.y) * 0.18;
		scale += (targetScale - scale) * 0.14;
		dot!.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%) scale(${scale})`;
		frame = requestAnimationFrame(tick);
	};
	tick();
	cleanups.push(() => cancelAnimationFrame(frame));
}

/**
 * Scroll-linked layer.
 *
 * Motion's scroll() resolves its pixel ranges once, at attach time — before fonts and
 * images settle — so every range ends up stale and the animations barely move. These
 * effects measure themselves each frame instead, which also survives view transitions.
 */
type Driver = () => void;
const drivers: Driver[] = [];
let rafId = 0;
let ownsRaf = false;

const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** 0 when the element's top is at `from` (fraction of viewport), 1 when it reaches `to`. */
function enterProgress(el: Element, from: number, to: number) {
	const rect = el.getBoundingClientRect();
	const startY = window.innerHeight * from;
	const endY = window.innerHeight * to;
	return clamp((startY - rect.top) / (startY - endY));
}

function runDrivers() {
	for (const driver of drivers) driver();
}

/** Lenis already runs a frame loop; only start our own when it is absent. */
function startDrivers() {
	if (!drivers.length || reduced()) return;
	if (!lenis) {
		ownsRaf = true;
		const raf = () => {
			runDrivers();
			rafId = requestAnimationFrame(raf);
		};
		rafId = requestAnimationFrame(raf);
	}
	cleanups.push(() => {
		if (ownsRaf) {
			cancelAnimationFrame(rafId);
			ownsRaf = false;
		}
		drivers.length = 0;
	});
}

/** Split into words and brighten them one by one as the block crosses the viewport. */
function initSplitText() {
	document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
		if (!el.dataset.splitDone) {
			const words = (el.textContent ?? '').split(/\s+/).filter(Boolean);
			el.textContent = '';
			for (const word of words) {
				const span = document.createElement('span');
				span.className = 'inline-block will-change-[opacity]';
				span.textContent = word;
				el.append(span, document.createTextNode(' '));
			}
			el.dataset.splitDone = 'true';
		}

		const spans = Array.from(el.querySelectorAll('span')) as HTMLElement[];
		if (!spans.length) return;
		if (reduced()) {
			spans.forEach((span) => (span.style.opacity = '1'));
			return;
		}

		// Words overlap so the line reads as a wave rather than a queue.
		const span = 1 / (spans.length + 7);
		// Reveal is one-way. Without the high-water mark the text un-reveals when you
		// scroll back up, which reads as flickering rather than as an effect.
		let peak = 0;
		drivers.push(() => {
			if (peak >= 1) return;
			const rect = el.getBoundingClientRect();
			if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
			const progress = enterProgress(el, 0.92, 0.38);
			if (progress <= peak) return;
			peak = progress;
			spans.forEach((word, i) => {
				const local = clamp((peak - i * span) / (span * 8));
				word.style.opacity = String(0.2 + 0.8 * local);
			});
		});
	});
}

/** Depth: images drift slower than the page. */
function initParallax() {
	if (reduced()) return;
	document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
		const distance = Number(el.dataset.parallax) || 8;
		const frame = el.parentElement ?? el;
		drivers.push(() => {
			const rect = frame.getBoundingClientRect();
			if (rect.bottom < 0 || rect.top > window.innerHeight) return;
			// -0.5 when the frame is entering, +0.5 when it is leaving.
			const centred =
				(rect.top + rect.height / 2 - window.innerHeight / 2) / (window.innerHeight + rect.height);
			el.style.transform = `translate3d(0, ${(centred * 2 * distance).toFixed(2)}%, 0)`;
		});
	});
}

/** Hero: type drifts up and dissolves as the section leaves. */
function initHeroScroll(hero: HTMLElement) {
	const type = hero.querySelector<HTMLElement>('[data-hero-type]');
	// Art direction means two <img> elements share this attribute; only one is displayed,
	// so drive both rather than whichever happens to be first in the DOM.
	const images = Array.from(hero.querySelectorAll<HTMLElement>('[data-hero-image]'));
	if (reduced()) return;

	const curtain = hero.querySelector<HTMLElement>('[data-hero-curtain]');
	// Only a hero with its own scroll track can be pinned and collapsed. Without one the
	// travel distance is a single pixel, so the clip snapped between 0% and 100% instantly.
	const wrap = hero.closest<HTMLElement>('[data-hero-wrap]');
	const track = wrap ?? hero;

	const started = performance.now();

	drivers.push(() => {
		const rect = track.getBoundingClientRect();
		if (rect.bottom < 0) return;
		const travel = wrap
			? Math.max(rect.height - window.innerHeight, 1)
			: Math.max(rect.height, 1);
		const progress = clamp(-rect.top / travel);

		// The picture collapses from the bottom while the type stays anchored — the
		// reference's hero exit. Unpinned heroes keep their opening wipe instead.
		if (curtain) {
			// The curtain both opens the hero on load and closes it again on scroll, so a
			// single writer owns it and no clip edge ever sweeps across a photograph.
			const intro = clamp((performance.now() - started) / 1300);
			const opening = Math.pow(1 - intro, 3);
			curtain.style.transform = `scaleY(${(wrap ? Math.max(progress, opening) : opening).toFixed(4)})`;
		}
		if (images.length) {
			const intro = clamp((performance.now() - started) / 2200);
			const settle = 1.08 - 0.08 * (1 - Math.pow(1 - intro, 3));
			const scale = (settle + progress * 0.06).toFixed(4);
			for (const image of images) image.style.transform = `scale(${scale})`;
		}
		if (type) {
			type.style.transform = `translate3d(0, ${(-progress * 90).toFixed(1)}px, 0)`;
			type.style.opacity = String(clamp(1 - Math.max(0, progress - 0.62) / 0.3));
		}
	});
}

/**
 * While the page is actually moving, suppress pointer events: otherwise every row and
 * card that slides under a stationary cursor lights up its hover state and flickers.
 * Gated on real scroll movement rather than on Lenis, which keeps reporting activity.
 */
function initScrollFlag() {
	if (reduced()) return;
	const root = document.documentElement;
	let lastY = window.scrollY;
	let lastMoved = 0;
	let active = false;

	const release = () => {
		if (!active) return;
		active = false;
		root.classList.remove('is-scrolling');
	};
	window.addEventListener('pointermove', release, { passive: true });
	cleanups.push(() => {
		window.removeEventListener('pointermove', release);
		release();
	});

	drivers.push(() => {
		const now = performance.now();
		if (Math.abs(window.scrollY - lastY) > 1.5) {
			lastY = window.scrollY;
			lastMoved = now;
			if (!active) {
				active = true;
				root.classList.add('is-scrolling');
			}
		} else if (active && now - lastMoved > 130) {
			release();
		}
	});
}

/** Thin gold bar tracking reading position. */
function initProgress() {
	const bar = document.querySelector<HTMLElement>('[data-progress]');
	if (!bar || reduced()) return;
	drivers.push(() => {
		const max = document.documentElement.scrollHeight - window.innerHeight;
		bar.style.transform = `scaleX(${max > 0 ? clamp(window.scrollY / max) : 0})`;
	});
}

/** Numbers count up once, the first time they are seen. */
function initCounters() {
	document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
		const raw = el.dataset.count ?? el.textContent ?? '';
		const target = parseFloat(raw);
		if (Number.isNaN(target)) return;
		const suffix = raw.replace(/^[\d.]+/, '');
		if (reduced()) return;

		let done = false;
		const stop = inView(
			el,
			() => {
				if (done) return;
				done = true;
				stop();
				el.textContent = `0${suffix}`;
				animate(0, target, {
					duration: 1.6,
					ease: EASE,
					onUpdate: (v) => (el.textContent = `${Math.round(v)}${suffix}`),
				});
				return () => {};
			},
			{ amount: 0.6 }
		);
		cleanups.push(stop);
	});
}

/** Hero: the entrance itself is CSS (see hero-in) so it never waits on this bundle. */
function initHero() {
	const hero = document.querySelector<HTMLElement>('[data-hero]');
	if (!hero) return;
	initHeroScroll(hero);
}

/** Marquee: position is driven by us, so scroll velocity can push it without stalling. */
function initMarquee() {
	document.querySelectorAll<HTMLElement>('[data-marquee]').forEach((el) => {
		if (reduced()) return;
		// The track holds two copies of the list, so one full loop is half its width.
		const basePxPerSecond = el.scrollWidth / 2 / (Number(el.dataset.marquee) || 42);
		let offset = 0;
		let boost = 0;
		let paused = false;
		let last = performance.now();

		const onScroll = ({ velocity }: { velocity: number }) => {
			boost = Math.max(-3, Math.min(3, velocity / 220));
		};
		lenis?.on('scroll', onScroll);
		cleanups.push(() => lenis?.off('scroll', onScroll));

		drivers.push(() => {
			const now = performance.now();
			const delta = Math.min((now - last) / 1000, 0.05);
			last = now;
			boost *= 0.9;
			if (!paused) offset += basePxPerSecond * (1 + boost) * delta;
			const loop = el.scrollWidth / 2;
			if (loop > 0) offset = ((offset % loop) + loop) % loop;
			el.style.transform = `translate3d(${-offset.toFixed(2)}px, 0, 0)`;
		});

		const toggle = el.parentElement?.querySelector<HTMLButtonElement>('[data-marquee-toggle]');
		if (toggle) {
			const onToggle = () => {
				paused = !paused;
				toggle.setAttribute('aria-pressed', String(paused));
				toggle.textContent = paused ? 'Play' : 'Pause';
			};
			toggle.addEventListener('click', onToggle);
			cleanups.push(() => toggle.removeEventListener('click', onToggle));
		}
	});
}

/** Gold wipe follows the pointer across list rows. */
function initRowHover() {
	document.querySelectorAll<HTMLElement>('[data-row]').forEach((row) => {
		cleanups.push(
			hover(row, () => {
				animate(row, { backgroundColor: 'rgba(201,171,124,0.05)' }, { duration: 0.4, ease: EASE });
				const marker = row.querySelector('[data-row-marker]');
				if (marker) animate(marker, { scaleX: [0, 1] }, { duration: 0.6, ease: EASE });
				return () => {
					animate(row, { backgroundColor: 'rgba(201,171,124,0)' }, { duration: 0.5, ease: EASE });
					if (marker) animate(marker, { scaleX: 0 }, { duration: 0.4, ease: EASE });
				};
			})
		);
	});
}

function init() {
	cleanups.forEach((fn) => fn());
	cleanups = [];
	document.documentElement.classList.add('js');
	document.documentElement.dataset.animReady = 'true';
	initSmoothScroll();
	initHero();
	initUnits();
	initReveals();
	initMaskReveals();
	initImageReveals();
	initCursor();
	initSplitText();
	initCounters();
	initParallax();
	initMarquee();
	initRowHover();
	initProgress();
	initScrollFlag();
	startDrivers();
}

let booted = false;

init();
booted = true;

document.addEventListener('astro:page-load', () => {
	// astro:page-load also fires once for the document we just initialised on module eval.
	// Skip only that first one — every later navigation swaps in fresh DOM that needs
	// wiring, including navigating to the page you are already on.
	if (booted) {
		booted = false;
		return;
	}
	init();
});
document.addEventListener('astro:before-swap', () => {
	lenis?.scrollTo(0, { immediate: true });
});
