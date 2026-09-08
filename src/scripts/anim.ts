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
		// A text caret still needs to be visible where text is selectable.
		document.body.append(dot);
	}
	document.documentElement.classList.add('has-cursor-dot');
	cleanups.push(() => document.documentElement.classList.remove('has-cursor-dot'));

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
		if (document.documentElement.classList.contains('is-scrolling')) return;
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
	const items = Array.from(hero.querySelectorAll<HTMLElement>('[data-hero-item]'));
	if (reduced()) return;

	// The exit is built from parallax, never from darkness: the photograph lags behind the
	// scroll and pushes in, while the type leaves ahead of it at staggered rates. Depth
	// comes from the speed difference, so nothing ever fades the viewport to black.
	const LEAD = [1.7, 1.0, 0.78, 1.35, 1.9];

	const started = performance.now();

	drivers.push(() => {
		const rect = hero.getBoundingClientRect();
		if (rect.bottom < 0) return;
		const progress = clamp(-rect.top / Math.max(rect.height, 1));
		const eased = progress * progress;

		if (images.length) {
			const intro = clamp((performance.now() - started) / 2200);
			const settle = 1.08 - 0.08 * (1 - Math.pow(1 - intro, 3));
			// Holds back against the scroll and pushes in, so it reads as further away.
			const scale = (settle + progress * 0.14).toFixed(4);
			const drift = (progress * 16).toFixed(2);
			for (const image of images)
				image.style.transform = `translate3d(0, ${drift}%, 0) scale(${scale})`;
		}

		if (type) {
			type.style.transform = `translate3d(0, ${(-progress * 40).toFixed(1)}px, 0)`;
			type.style.opacity = '1';
		}

		// Each line leaves at its own rate, so the block fans apart on the way out.
		items.forEach((item, i) => {
			const lead = LEAD[i % LEAD.length];
			item.style.transform = `translate3d(0, ${(-eased * 150 * lead).toFixed(1)}px, 0)`;
			item.style.opacity = String(clamp(1 - Math.max(0, progress - 0.5) / 0.42));
		});
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

/**
 * Case-study clips get our own controls. The browser's set cannot be trimmed
 * reliably -- Chromium still draws a fullscreen button under
 * controlsList="nofullscreen" and Safari ignores controlsList altogether -- so
 * download, fullscreen and picture-in-picture are removed by never offering
 * them. Playback is manual, never looped, and a finished clip rewinds to its
 * poster rather than holding on the last frame.
 */
function initClips() {
	document.querySelectorAll<HTMLElement>('[data-player]').forEach((player) => {
		const video = player.querySelector<HTMLVideoElement>('[data-clip]');
		const toggle = player.querySelector<HTMLButtonElement>('[data-clip-toggle]');
		const badge = player.querySelector<HTMLElement>('[data-clip-badge]');
		const bar = player.querySelector<HTMLElement>('[data-clip-bar]');
		const progress = player.querySelector<HTMLElement>('[data-clip-progress]');
		const time = player.querySelector<HTMLElement>('[data-clip-time]');
		const mute = player.querySelector<HTMLButtonElement>('[data-clip-mute]');
		const seek = player.querySelector<HTMLButtonElement>('[data-clip-seek]');
		if (!video || !toggle || !badge || !bar || !progress || !time || !mute || !seek) return;

		const label = toggle.getAttribute('aria-label')?.replace(/^Play: /, '') ?? '';
		const clock = (s: number) =>
			`${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

		const paint = () => {
			const playing = !video.paused && !video.ended;
			badge.style.opacity = playing ? '0' : '1';
			bar.style.opacity = playing ? '1' : '0';
			toggle.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'}: ${label}`);
		};
		const onToggle = () => {
			if (video.paused) video.play().catch(() => undefined);
			else video.pause();
		};
		const onTime = () => {
			const d = video.duration;
			if (!Number.isFinite(d) || d <= 0) return;
			progress.style.width = `${(video.currentTime / d) * 100}%`;
			time.textContent = clock(video.currentTime);
		};
		const onEnded = () => {
			// Back to the poster, not a frozen final frame.
			video.load();
			progress.style.width = '0%';
			time.textContent = '0:00';
			paint();
		};
		const onMute = (event: MouseEvent) => {
			event.stopPropagation();
			video.muted = !video.muted;
			mute.setAttribute('aria-label', video.muted ? 'Unmute' : 'Mute');
			mute.style.opacity = video.muted ? '0.45' : '1';
		};
		const onSeek = (event: MouseEvent) => {
			event.stopPropagation();
			const d = video.duration;
			if (!Number.isFinite(d) || d <= 0) return;
			const box = seek.getBoundingClientRect();
			video.currentTime = clamp((event.clientX - box.left) / box.width) * d;
			onTime();
		};
		const block = (event: Event) => event.preventDefault();

		toggle.addEventListener('click', onToggle);
		mute.addEventListener('click', onMute);
		seek.addEventListener('click', onSeek);
		video.addEventListener('play', paint);
		video.addEventListener('pause', paint);
		video.addEventListener('timeupdate', onTime);
		video.addEventListener('ended', onEnded);
		video.addEventListener('contextmenu', block);
		paint();

		cleanups.push(() => {
			toggle.removeEventListener('click', onToggle);
			mute.removeEventListener('click', onMute);
			seek.removeEventListener('click', onSeek);
			video.removeEventListener('play', paint);
			video.removeEventListener('pause', paint);
			video.removeEventListener('timeupdate', onTime);
			video.removeEventListener('ended', onEnded);
			video.removeEventListener('contextmenu', block);
		});
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

	if (introIsFresh && !reduced()) {
		const items = hero.querySelectorAll('[data-hero-item]');
		if (items.length) {
			animate(
				items,
				{ opacity: [0, 1], y: [36, 0], filter: ['blur(12px)', 'blur(0px)'] },
				{ duration: 1.1, delay: stagger(0.09), ease: EASE }
			);
		}
	}

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

/**
 * Overlapping project panels. All of them stay on screen; the open one grows and the
 * rest hold as spines, cycling on a timer that pauses on hover, focus, hidden tabs and
 * under reduced motion.
 */
function initWorkDeck() {
	const deck = document.querySelector<HTMLElement>('[data-deck]');
	if (!deck) return;
	const panels = Array.from(deck.querySelectorAll<HTMLElement>('[data-deck-panel]'));
	if (panels.length < 2) return;

	const HOLD = 4200;
	let index = 0;
	let paused = reduced();
	let hovered = false;
	let timer = 0;

	// Stacked as a column on small screens, so the open panel needs a bigger share of the
	// track there to fit its copy; side by side it only needs to dominate the row.
	const openGrow = () => (window.matchMedia('(min-width: 768px)').matches ? 7 : 12);

	const render = () => {
		const grow = openGrow();
		panels.forEach((panel, i) => {
			const open = i === index;
			// Grow the open panel; the rest keep just enough to read as a spine.
			panel.style.flexGrow = open ? String(grow) : '1';
			panel.style.zIndex = String(open ? panels.length + 1 : panels.length - i);
			panel.setAttribute('aria-current', open ? 'true' : 'false');

			const body = panel.querySelector<HTMLElement>('[data-deck-body]');
			const spine = panel.querySelector<HTMLElement>('[data-deck-spine]');
			const scrim = panel.querySelector<HTMLElement>('[data-deck-scrim]');
			if (body) body.style.opacity = open ? '1' : '0';
			if (spine) spine.style.opacity = open ? '0' : '1';
			if (scrim) scrim.style.opacity = open ? '1' : '0.82';
		});
	};

	const schedule = () => {
		clearTimeout(timer);
		if (paused || hovered || document.hidden) return;
		timer = window.setTimeout(() => go(index + 1), HOLD);
	};

	const go = (next: number) => {
		index = (next + panels.length) % panels.length;
		render();
		schedule();
	};

	// Pointing at a panel opens it directly; the timer resumes when the pointer leaves.
	panels.forEach((panel, i) => {
		const onEnter = () => {
			hovered = true;
			index = i;
			render();
			schedule();
		};
		panel.addEventListener('pointerenter', onEnter);
		panel.addEventListener('focus', onEnter);
		cleanups.push(() => {
			panel.removeEventListener('pointerenter', onEnter);
			panel.removeEventListener('focus', onEnter);
		});
	});

	const toggle = deck.querySelector<HTMLButtonElement>('[data-deck-toggle]');
	const setPaused = (value: boolean) => {
		paused = value;
		if (toggle) {
			toggle.textContent = value ? 'Play' : 'Pause';
			toggle.setAttribute('aria-pressed', String(value));
		}
		schedule();
	};

	const onPrev = () => go(index - 1);
	const onNext = () => go(index + 1);
	const onToggle = () => setPaused(!paused);
	const onLeave = () => {
		hovered = false;
		schedule();
	};
	const onVisibility = () => schedule();
	const onResize = () => render();
	window.addEventListener('resize', onResize);

	deck.querySelector('[data-deck-prev]')?.addEventListener('click', onPrev);
	deck.querySelector('[data-deck-next]')?.addEventListener('click', onNext);
	toggle?.addEventListener('click', onToggle);
	deck.addEventListener('pointerleave', onLeave);
	deck.addEventListener('focusout', onLeave);
	document.addEventListener('visibilitychange', onVisibility);

	cleanups.push(() => {
		clearTimeout(timer);
		deck.querySelector('[data-deck-prev]')?.removeEventListener('click', onPrev);
		deck.querySelector('[data-deck-next]')?.removeEventListener('click', onNext);
		toggle?.removeEventListener('click', onToggle);
		deck.removeEventListener('pointerleave', onLeave);
		deck.removeEventListener('focusout', onLeave);
		document.removeEventListener('visibilitychange', onVisibility);
		window.removeEventListener('resize', onResize);
	});

	if (reduced() && toggle) setPaused(true);
	render();
	schedule();
}

/** Gold wipe follows the pointer across list rows. */
function initRowHover() {
	document.querySelectorAll<HTMLElement>('[data-row]').forEach((row) => {
		cleanups.push(
			hover(row, () => {
				if (document.documentElement.classList.contains('is-scrolling')) return;
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
	const root = document.documentElement;
	root.classList.add('js');

	// On a slow connection the stylesheet can arrive long after the content has painted.
	// Running the entrance then would black out a headline the reader is already looking
	// at, so skip it whenever the first paint is already well behind us.
	const fcp = performance
		.getEntriesByType('paint')
		.find((e) => e.name === 'first-contentful-paint')?.startTime;
	// Nothing in the hero is hidden by CSS, so a late boot simply means no entrance —
	// never a headline that blacks out after the reader has already seen it.
	introIsFresh = fcp === undefined || performance.now() - fcp < 500;
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
	initWorkDeck();
	initProgress();
	initClips();
	initScrollFlag();
	startDrivers();
}

let booted = false;
let introIsFresh = true;

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
