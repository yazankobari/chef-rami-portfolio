export const profile = {
	name: 'Rami Al Maket',
	role: 'Consultant Chef',
	tagline: 'Your partner in culinary innovation and restaurant success.',
	intro:
		'With a wealth of experience in kitchens around the globe, I offer a unique perspective and expertise to help you bring your restaurant vision to life.',
	bio: 'As an award-winning chef recognised for my ability to create exceptional dining experiences, I understand the intricacies of restaurant management and the importance of delivering high-quality cuisine. Whether you are launching a new venture or elevating an existing concept, I provide comprehensive services to support every aspect of your restaurant journey.',
	quote:
		'Together, let us build a restaurant that stands out in a competitive market and leaves a lasting impression on diners.',
	creed: 'My recipe for success is made of passion, experience, and continuous learning.',
};

const phoneHref = '+971505089654';

export const contact = {
	email: 'rami@ramialmaket.com',
	phone: '+971 50 508 9654',
	phoneHref,
	// wa.me wants the number bare — no plus, no spaces — or it silently opens an empty chat.
	whatsappUrl: `https://wa.me/${phoneHref.slice(1)}`,
	instagram: 'cheframi.almaket',
	instagramUrl: 'https://www.instagram.com/cheframi.almaket',
	base: 'Dubai, United Arab Emirates',
};

/** Build credit, shown once in the footer's bottom bar. */
export const builtBy = {
	name: 'KMTS Digital Solutions',
	url: 'https://www.kmts.ltd',
};

export const stats = [
	{ value: '26', label: 'Years of experience' },
	{ value: '10', label: 'Countries worked in' },
	{ value: '10+', label: 'Cuisines mastered' },
	{ value: '7+', label: 'Restaurants developed' },
];

export const countries = [
	'Syria',
	'Saudi Arabia',
	'United Arab Emirates',
	'China',
	'India',
	'Austria',
	'Spain',
	'Malaysia',
	'Netherlands',
	'United Kingdom',
];

export const services = [
	{
		title: 'Concept Development',
		body: "Defining the restaurant's concept, theme, and branding strategies to create a unique dining experience.",
	},
	{
		title: 'Kitchen Design & Layout',
		body: 'Advising on the optimal kitchen layout, equipment selection, and workflow to maximise efficiency and productivity.',
	},
	{
		title: 'Recipe Development',
		body: "Creating unique and innovative recipes that showcase the restaurant's culinary identity while meeting cost and quality standards.",
	},
	{
		title: 'Menu Development',
		body: "Designing menus that align with the concept, cater to the target audience, and consider cuisine type, dietary restrictions, and seasonality.",
	},
	{
		title: 'Staff Recruiting & Training',
		body: 'Conducting training sessions for kitchen staff on cooking techniques, food safety standards, menu execution, and customer service.',
	},
	{
		title: 'Supplier Selection & Negotiation',
		body: 'Assisting in sourcing high-quality ingredients from reliable suppliers at competitive prices to maintain consistency in food quality and control costs.',
	},
	{
		title: 'Food Cost Analysis & Control',
		body: 'Implementing systems to monitor food costs, portion sizes, inventory management, and waste reduction strategies to maximise profitability.',
	},
	{
		title: 'Quality Control',
		body: 'Establishing standards for food quality, consistency, and presentation to ensure customer satisfaction and maintain brand reputation.',
	},
	{
		title: 'Operational Support',
		body: 'Offering ongoing support and guidance to address challenges, refine processes, and adapt to changing market trends for long-term success.',
	},
	{
		title: 'Menu Engineering',
		body: 'Analysing menu performance, identifying popular and profitable items, and making strategic adjustments to optimise revenue and profitability.',
	},
];

export const process = [
	{
		title: 'Discovery',
		body: 'Read the site, the market and the numbers. Who are we cooking for, what will they pay, and what can this kitchen realistically produce every night?',
	},
	{
		title: 'Concept & menu',
		body: 'Theme, branding and culinary identity, then a costed menu: recipes tested, portions fixed, dietary and seasonal needs built in.',
	},
	{
		title: 'Build & train',
		body: 'Kitchen layout and equipment, supplier selection and negotiation, hiring, and hands-on training on technique, food safety and service.',
	},
	{
		title: 'Open & optimise',
		body: 'Launch support, then quality control, food cost analysis and menu engineering until the numbers hold without me in the room.',
	},
];

export const beyondKitchen = {
	lede:
		'A restaurant is more than what leaves the pass. I take care of the parts that surround it with the specialists I work with, so you open with one team instead of five.',
	items: [
		{
			title: 'Brand & identity',
			body: 'Your name, logo, colours, menu design and signage developed into one identity that holds together on the door, on the plate and on a phone screen.',
		},
		{
			title: 'Website & presence',
			body: 'A site your guests actually use, with the menu, location, hours, bookings and photography that does the food justice. Plus the listings people check before they choose you.',
		},
		{
			title: 'Digital menus',
			body: 'Menus your guests scan at the table, priced, photographed and grouped the way you serve. Change a dish in the morning and it is live by lunch, with nothing to reprint.',
		},
		{
			title: 'Ordering & payments',
			body: 'The system that takes the order and the payment, set up around how you actually serve. Your full menu, sizes, extras and prices loaded correctly, and your team confident on it before you open.',
		},
		{
			title: 'Stock, suppliers & costing',
			body: 'Stock counts, supplier orders and recipe costs kept in one place, so you can see what a dish costs and what it earns without chasing the numbers.',
		},
		{
			title: 'One connected system',
			body: 'Ordering, payments, stock and suppliers connected so they share the same information, giving you one set of numbers to work from instead of several that disagree.',
		},
	],
};

export const awards = [
	{
		title: 'ACE Rising Star Award',
		org: 'Marriott Middle East & Africa',
		year: '2017',
		note: 'Winner — Continent Winner, Classic Luxury Brand Segment.',
	},
	{
		title: 'Best Lebanese Restaurant in Dubai',
		org: 'FACT Dining Awards — Amaseena',
		year: '2018',
		note: 'Winner, The Ritz-Carlton Dubai, JBR.',
	},
	{
		title: 'Caterer Middle East Award',
		org: 'Amaseena, The Ritz-Carlton',
		year: '2018',
		note: 'Restaurant Team of the Year.',
	},
	{
		title: '5 Star Quarter 2 Winner',
		org: 'The Ritz-Carlton — Leader of the Quarter',
		year: '2015',
		note: 'Nominated again as Leader of the Quarter in 2016.',
	},
	{
		title: '5 Years Excellence Award',
		org: 'The Ritz-Carlton',
		year: '2017',
		note: 'Nominee — Excellent Service with the Company.',
	},
];

export const career = [
	{
		group: 'The Ritz-Carlton Dubai — JBR',
		roles: [
			{
				title: 'Oriental Chef / Junior Executive Sous Chef',
				org: 'The Ritz-Carlton Dubai, JBR',
				period: 'Jul 2018 — Feb 2020',
				body: 'Provided effective leadership in implementing Ritz-Carlton brand standards. Managed culinary experiences, addressed performance issues, identified training needs, and facilitated team development through coaching interventions.',
			},
			{
				title: 'Oriental Chef',
				org: 'The Ritz-Carlton Dubai, JBR',
				period: 'Dec 2012 — Jul 2018',
				body: 'Ensured quality and consistency of Arabic food, led staff, and managed all food-related functions. Planned and executed menus for special occasions and promotions.',
			},
		],
	},
	{
		group: 'Dubai',
		roles: [
			{
				title: 'Chef de Cuisine',
				org: 'Royal Catering Company, Dubai',
				period: '2011 — 2012',
				body: 'Arabic, Continental, Moroccan, and Gulf cuisine.',
			},
			{
				title: 'Head Chef',
				org: 'Al Habtoor Group Catering Company, Dubai',
				period: '2010 — 2011',
				body: 'Eastern and Western cuisines.',
			},
			{
				title: 'Head Chef',
				org: 'Designlab Events, Dubai',
				period: '2008 — 2010',
				body: 'Private chef for a Saudi and American family.',
			},
			{
				title: 'Oriental Chef',
				org: 'Wafi Gourmet Restaurants, Dubai',
				period: '2005 — 2008',
				body: 'Arabic, Continental, Moroccan, and Gulf cuisine.',
			},
		],
	},
	{
		group: 'Syria & KSA',
		roles: [
			{
				title: 'Banquet Sous Chef',
				org: 'Sheraton Hotel, Damascus',
				period: '2004 — 2005',
				body: 'Arabic, Continental, Moroccan, and Gulf cuisine.',
			},
			{
				title: 'Culinary Professor',
				org: 'Hotel and Tourism Centre, Damascus',
				period: '2002 — 2004',
				body: 'Training and development: identified training needs across levels, mapped skills required for particular positions, and analysed existing competencies.',
			},
			{
				title: 'Chef in Charge',
				org: 'Fun Town Restaurant, Damascus',
				period: '2002 — 2004',
				body: 'Arabic, Continental, Moroccan, and Gulf cuisine.',
			},
			{
				title: 'Private Chef',
				org: 'Prince Palace, Riyadh — KSA',
				period: '2001 — 2002',
				body: 'Arabic and Continental cuisine.',
			},
			{
				title: 'Chef de Partie',
				org: 'Monte Rosa Hotel, Syria',
				period: '1999 — 2001',
				body: 'Arabic, Continental, Moroccan, and Gulf cuisine.',
			},
			{
				title: 'Demi Chef de Partie',
				org: 'Le Royal Meridien, Damascus',
				period: '1998 — 1999',
				body: 'Arabic, Continental, Moroccan, and Gulf cuisine.',
			},
		],
	},
];

export const education = [
	{ title: 'Hotel Management Institute', org: 'Syria', period: '1999 — 2001' },
	{ title: 'Hotel and Tourism High School', org: 'Syria', period: '1999' },
];

export const training: { title: string; detail?: string }[] = [
	{
		title: 'A study on effectiveness of training and development',
		detail: 'Delivered through the hotel and Marriott Global Source (MGS), alongside safety training.',
	},
	{ title: 'A study on employee motivation' },
	{
		title: 'Green Book Training',
		detail:
			'Quality Leadership & Development programme: Dynamic Team, Impact Leadership, Marriott Global Source (MGS), Rouxbe Training — certified.',
	},
	{
		title: 'Food Safety Training',
		detail:
			'Great Food Safe Food, Person in Charge Level 3 — certified PIC, allergen training (annual).',
	},
];

export const pressFeatured = [
	{
		outlet: 'Al Bayan News',
		note: 'Feature on Chef Rami (Arabic)',
		url: 'https://x.com/albayannews/status/1400422022174240773?s=24',
	},
	{
		outlet: 'Nawrass Media',
		note: 'Beloved Chefs in the UAE — Chef Rami Al Maket, Ritz-Carlton Dubai (video, Arabic)',
		url: 'https://www.youtube.com/watch?v=E-Lj3uUd--8',
	},
	{
		outlet: 'Gulf News',
		note: 'Iftar of the day: Mamemo Majlis, Ritz-Carlton Dubai',
		url: 'https://gulfnews.com/going-out/iftar-of-the-day-mamemo-majlis-ritz-carlton-dubai-1.2039493',
	},
	{
		outlet: 'The Hindu',
		note: 'Flavours of the land',
		url: 'https://www.thehindu.com/todays-paper/tp-features/tp-metroplus/flavours-of-the-land/article18236501.ece',
	},
	{
		outlet: 'Bangalore Mirror',
		note: 'Tales from the City of Jasmine',
		url: 'https://bangaloremirror.indiatimes.com/opinion/food/tales-from-the-city-of-jasmine/articleshow/58437480.cms',
	},
	{
		outlet: 'RITZ Magazine',
		note: 'Taste of Arabia',
		url: 'https://www.ritzmagazine.in/taste-of-arabia/',
	},
];

export const pressMore = [
	{
		outlet: "Life'n'Spices",
		note: "'Taste of Arabia' — the Middle Eastern food festival at The Market, Ritz-Carlton",
		url: 'https://lifenspices.blogspot.com/2015/10/taste-of-arabia-middle-eastern-food.html',
	},
	{
		outlet: 'Truly Rubilicious',
		note: 'Getting Rizty!',
		url: 'https://rubichakravarti.wordpress.com/2015/10/getting-rizty/',
	},
	{
		outlet: 'World of Ari',
		note: 'Taste of Arabia with Chef Rami @ The Market, Ritz-Carlton',
		url: 'https://www.worldofari.com/single-post/2017/04/27/Taste-of-Arabia-with-Chef-Rami-The-Market-Ritz-Carlton',
	},
	{
		outlet: 'CARMA Insight',
		note: 'Authentic cultures helped me to mix tastes, says Rami Al Maqt',
		url: 'https://insight.carma.com/a/e1a02efe-ee6e-4514-b38d-046325c64514',
	},
];
