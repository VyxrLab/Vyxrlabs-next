// Single source of truth for site copy, contact details and navigation.

/** The live address; canonical URLs, the sitemap and robots.txt are built from it. */
export const siteUrl = "https://vyxrlabs.com";

export const contact = {
  whatsappDisplay: "+971 56 645 7591",
  whatsappNumber: "971566457591",
  email: "support@vyxrlabs.com",
  office: "Business Centre, Sharjah Publishing City Free Zone, Sharjah, UAE",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Sharjah+Publishing+City+Free+Zone",
};

export const whatsappLink = (text?: string) =>
  `https://wa.me/${contact.whatsappNumber}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

export const navItems = [
  { name: "Services", href: "/services" },
  { name: "Work", href: "/#work" },
  { name: "About", href: "/#about" },
  { name: "Contact", href: "/contact" },
];

export const stats = [
  { value: "500+", label: "client reviews" },
  { value: "$120,242,101", label: "revenue driven for clients" },
  { value: "Sharjah", label: "based in the UAE" },
];

export type Service = {
  slug: string;
  title: string;
  short: string;
  pitch: string;
  outcomes: string[];
  example?: string;
};

export const services: Service[] = [
  {
    slug: "custom-solutions",
    title: "Custom Solutions & Products",
    short: "Software built around how you sell, so you close more and lose fewer leads.",
    pitch:
      "Off-the-shelf tools make you work their way. We build the product your team actually needs, inside the systems you already run on, so every lead gets worked and every sale gets closed faster.",
    outcomes: [
      "Features your CRM is missing, built in",
      "Faster follow-up on every lead",
      "Higher close rates and bigger margins",
      "Tools your team adopts on day one",
    ],
    example: "BlueSwan: iMessage inside GoHighLevel, built for Black Swan Refunds.",
  },
  {
    slug: "automation",
    title: "Business Automation",
    short: "Hand the repetitive work to software and get your hours back.",
    pitch:
      "We map the copy-paste, chasing and double entry that eats your week, then automate it end to end. Your team spends its time on customers, and your costs stop growing with every new client.",
    outcomes: [
      "Hours of manual work removed every week",
      "Fewer errors from re-typed data",
      "Workflows that run while you sleep",
      "Lower cost per client as you grow",
    ],
  },
  {
    slug: "saas",
    title: "Custom SaaS Platforms",
    short: "Turn your know-how into a product other businesses pay you for.",
    pitch:
      "Have a process that works? We turn it into a SaaS platform or marketplace app you can sell, with billing, accounts and the polish customers expect, so it earns revenue on its own.",
    outcomes: [
      "A product you own and can sell",
      "Recurring revenue, not one-off fees",
      "Built for marketplaces like GoHighLevel's",
      "Launch-ready billing and onboarding",
    ],
    example: "Swan Power Dialer: sold on a flat monthly plan per sub-account.",
  },
  {
    slug: "ai",
    title: "Custom AI",
    short: "AI that knows every lead and client, because it's wired into your company.",
    pitch:
      "Generic chatbots don't know your business. We build AI that connects to your CRM, inbox and documents, so it answers, follows up and qualifies with the full context of every lead and client.",
    outcomes: [
      "Full context on every lead and client",
      "Instant, accurate replies around the clock",
      "Qualification and follow-up on autopilot",
      "Runs inside the tools you already use",
    ],
    example: "Swan AI: in-house AI that handles Black Swan Refunds' legal work, cases and probates.",
  },
];

/** The client the Swan tools were built for. */
export const client = {
  name: "Black Swan Refunds",
  result: "$5M+ in sales",
};

export type Product = {
  slug: "blueswan" | "dialer" | "whatsapp" | "swan-ai";
  name: string;
  logo: string;
  /** Brand colour sampled from the logo, used for the glow behind it. */
  color: string;
  tagline: string;
  description: string;
  facts: string[];
  /** What Black Swan had before this tool (or couldn't buy at all), and what they have now. */
  impact: { before: string; after: string };
  /** The same before/after, short enough for the orbit card. */
  tag: { before?: string; after: string };
  href?: string;
  /** Which service a "build something like this" enquiry should preselect. */
  need: Service["slug"];
};

export const products: Product[] = [
  {
    slug: "blueswan",
    name: "BlueSwan",
    logo: "/products/blueswan.webp",
    color: "#1f8bff",
    tagline: "iMessage, inside GoHighLevel",
    description:
      "Black Swan's team sends and receives iMessages straight from GoHighLevel conversations, so texts land as blue bubbles from a person, not a marketer.",
    facts: ["Native iMessage from GoHighLevel", "Works from the conversations tab", "Blue bubbles, not green"],
    impact: { before: "$10,000 a year for 6 lines", after: "$0, unlimited lines" },
    tag: { before: "$10k/yr", after: "$0" },
    need: "custom-solutions",
  },
  {
    slug: "dialer",
    name: "Swan Power Dialer",
    logo: "/products/swan-power-dialer.webp",
    color: "#46b52f",
    tagline: "Dial GoHighLevel lists 3× faster",
    description:
      "Turns smart lists into fast calling sessions: call, log the outcome in one click and move to the next contact, all inside GoHighLevel. Any agency can now use it too.",
    facts: ["$0 per minute on GHL's own dialer", "One-click dispositions", "Smart lists become calling sessions"],
    impact: { before: "$7,200 a year for 6 sales reps", after: "$0, unlimited users" },
    tag: { before: "$7.2k/yr", after: "$0" },
    href: "https://swanpowerdialer.com/",
    need: "saas",
  },
  {
    slug: "whatsapp",
    name: "WhatsApp Swan",
    logo: "/products/whatsapp-swan.webp",
    color: "#13a874",
    tagline: "Native WhatsApp texting for GoHighLevel",
    description:
      "Text customers on WhatsApp from inside GoHighLevel, the way you would from your phone. No pre-approved templates standing between you and the conversation.",
    facts: ["No message templates", "Texts from inside GoHighLevel", "Replies sync to the contact"],
    impact: { before: "Setup fees plus a cost on every message", after: "Unlimited lines, $0 per message" },
    tag: { before: "Per-message fees", after: "$0" },
    need: "custom-solutions",
  },
  {
    slug: "swan-ai",
    name: "Swan AI",
    logo: "/products/swan-ai.webp",
    color: "#d9a93c",
    tagline: "In-house AI for legal work and probates",
    description:
      "A custom AI built in-house around how Black Swan works. It handles their legal work, manages cases and was built to handle probates. There's nothing like it on the market.",
    facts: ["Handles legal work", "Manages every case", "Built to handle probates"],
    impact: { before: "No tool on the market could do this", after: "Built in-house, around their cases" },
    tag: { after: "One of a kind" },
    need: "ai",
  },
];

export type Testimonial = {
  name: string;
  company: string;
  /** A line lifted word for word from the quote. */
  pull: string;
  quote: string;
  video: string;
  poster: string;
  /** Width / height to play the video at; "cover" crops away letterboxing baked into the file. */
  aspect: number;
  fit: "cover" | "contain";
};

export const testimonials: Testimonial[] = [
  {
    name: "Jesse Rooney",
    company: "Black Swan Refunds",
    pull: "They just took care of us.",
    quote:
      "I've had nothing but positive things to say about VyxrLabs. Phenomenal at helping us bring an idea back to life and overcoming some of the challenges we were not aware of. They just took care of us. It was fantastic to work with them. The communication made it very easy to work with them. Great people to work with, I would highly recommend VyxrLabs.",
    video: "https://cdn.jsdelivr.net/gh/VyxrLab/media-storage/vyxreact/vedios/jesse-rooney.mp4",
    poster: "/testimonials/jesse.webp",
    aspect: 480 / 848,
    fit: "cover",
  },
  {
    name: "Mathew Wainwright",
    company: "Plentia Capital",
    pull: "Always coming up with solutions to the problems we faced.",
    quote:
      "It's been an absolute pleasure. VyxrLabs is very reliable, works on time, is very responsive and is willing to get projects across the line in a timely manner. They're always coming up with solutions to the problems we faced. We've managed to be a lot more productive because of their involvement with us. Thanks a lot VyxrLabs, it's been a pleasure.",
    video: "https://cdn.jsdelivr.net/gh/VyxrLab/media-storage/vyxreact/vedios/mathew-wainwright.mp4",
    poster: "/testimonials/mathew.webp",
    aspect: 576 / 360,
    fit: "contain",
  },
];

export const founder = {
  name: "Mansoor Khan",
  role: "Founder, VyxrLabs",
  photo: "/team/mansoor-khan.webp",
  bio: [
    "Helping businesses scale to millions in sales with AI, custom products and solutions built around how they work.",
    "Mansoor tailors every build to the company's needs and the latest market trends, and works with each client directly.",
  ],
  facts: [
    { value: 7, suffix: "+", label: "years in business automation" },
    { value: 200, suffix: "+", label: "projects delivered" },
    { value: 5, prefix: "$", suffix: "M+", label: "in sales for Black Swan Refunds" },
  ],
};

export const clientLogos = [
  "/logo1.png",
  "/logo2.png",
  "/logo3.png",
  "/logo4.png",
  "/logo5.png",
  "/logo6.png",
  "/logo8.png",
  "/logo9.png",
];
