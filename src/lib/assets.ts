// Seed data — will migrate to MongoDB in Phase 2.
// Image imports re-use existing asset library to preserve current visual identity.
import featured from "@/assets/featured-estate.jpg";
import l1 from "@/assets/listing-1.jpg";
import l2 from "@/assets/listing-2.jpg";
import l3 from "@/assets/listing-3.jpg";
import l4 from "@/assets/listing-4.jpg";
import cardFarm from "@/assets/card-farmhouse.jpg";
import cardBuilder from "@/assets/card-builder.jpg";
import cardPent from "@/assets/card-penthouse.jpg";
import b1 from "@/assets/blog-1.jpg";
import b2 from "@/assets/blog-2.jpg";
import b3 from "@/assets/blog-3.jpg";
import legacy from "@/assets/legacy-courtyard.jpg";
import contactNight from "@/assets/contact-night.jpg";
import avatar1 from "@/assets/avatar-1.jpg";

export type PropertyCategory =
  | "Farmhouse"
  | "Builder Floor"
  | "Golf Villa"
  | "Penthouse";

export type PropertyStatus = "Draft" | "Published" | "Sold" | "Under Offer";

export interface Property {
  slug: string;
  title: string;
  category: PropertyCategory;
  status: PropertyStatus;
  featured: boolean;
  location: string;
  city: string;
  sqft: string;
  bedrooms: number;
  bathrooms: number;
  plotSize: string;
  priceLabel: string;
  shortDescription: string;
  description: string;
  amenities: string[];
  cover: string;
  gallery: string[];
}

export const PROPERTIES: Property[] = [
  {
    slug: "the-sandstone-estate",
    title: "The Sandstone Estate",
    category: "Farmhouse",
    status: "Published",
    featured: true,
    location: "Chattarpur",
    city: "South Delhi",
    sqft: "18,500",
    bedrooms: 7,
    bathrooms: 8,
    plotSize: "2.4 acres",
    priceLabel: "Price on application",
    shortDescription:
      "A monumental sandstone-clad estate set within 2.4 acres of landscaped privacy.",
    description:
      "Conceived as a private sanctuary, The Sandstone Estate balances monumental Indian architecture with a contemporary, museum-grade interior. Soaring 6m ceilings, floor-to-ceiling glazing, an internal courtyard and a 30m infinity pool define the principal residence. The grounds include a separate guest wing, mature mango orchard and a discreetly housed service quarter — engineered for living, entertaining and long-horizon stewardship.",
    amenities: [
      "30m infinity pool with deck pavilion",
      "Climate-controlled wine cellar (1,400 labels)",
      "Private cinema & lounge",
      "Internal courtyard with reflecting pool",
      "Spa, gym & steam room",
      "Staff quarters (4 keys)",
      "5-car covered motor court",
      "Backup power, water harvesting, smart home automation",
    ],
    cover: featured,
    gallery: [featured, l1, l4, cardFarm, legacy],
  },
  {
    slug: "westend-greens-farmhouse",
    title: "Westend Greens Farmhouse",
    category: "Farmhouse",
    status: "Published",
    featured: false,
    location: "Westend Greens",
    city: "South Delhi",
    sqft: "12,400",
    bedrooms: 6,
    bathrooms: 7,
    plotSize: "1.6 acres",
    priceLabel: "On request",
    shortDescription:
      "A walled farmhouse retreat with mature gardens, pool pavilion and double-height living room.",
    description:
      "Tucked behind a 12-foot perimeter wall, this Westend Greens farmhouse delivers absolute privacy without sacrificing proximity to the city's diplomatic core. The principal living room opens through full-height glazing to a poolside lawn, with a separate entertaining wing for formal receptions.",
    amenities: [
      "20m pool with cabana",
      "Double-height drawing room",
      "Outdoor dining pavilion",
      "Service block with 3 staff rooms",
      "EV-ready 4-car garage",
      "Mature gardens with lily pond",
    ],
    cover: l1,
    gallery: [l1, cardFarm, legacy, featured],
  },
  {
    slug: "lutyens-penthouse-residence",
    title: "Lutyens' Penthouse Residence",
    category: "Penthouse",
    status: "Published",
    featured: false,
    location: "Lutyens' Delhi",
    city: "New Delhi",
    sqft: "6,200",
    bedrooms: 4,
    bathrooms: 5,
    plotSize: "Penthouse floor",
    priceLabel: "Available for private viewing",
    shortDescription:
      "A full-floor penthouse with skyline terraces overlooking the Lutyens canopy.",
    description:
      "A rare full-floor penthouse in the heart of Lutyens' Delhi, with three wrap-around terraces and bespoke joinery in Italian walnut. The principal suite enjoys a private dressing pavilion, freestanding tub and uninterrupted views across the green canopy.",
    amenities: [
      "Three wrap-around terraces",
      "Private elevator with biometric access",
      "Bespoke walnut joinery throughout",
      "Chef's kitchen with butler's pantry",
      "2 parking bays + valet",
      "24/7 concierge & security",
    ],
    cover: l2,
    gallery: [l2, cardPent, contactNight, featured],
  },
  {
    slug: "vasant-vihar-builder-floor",
    title: "Vasant Vihar Builder Floor",
    category: "Builder Floor",
    status: "Published",
    featured: false,
    location: "Vasant Vihar",
    city: "South Delhi",
    sqft: "4,800",
    bedrooms: 4,
    bathrooms: 5,
    plotSize: "Independent floor",
    priceLabel: "On enquiry",
    shortDescription:
      "An independent ultra-premium floor finished in book-matched marble and warm oak.",
    description:
      "Architected to feel like a private home rather than an apartment, this Vasant Vihar floor pairs Calacatta-Borghini book-matched marble with hand-laid oak parquet. A dedicated lift opens directly into the residence — an arrival sequence reserved for the most exclusive Delhi properties.",
    amenities: [
      "Private lift lobby",
      "Calacatta marble flooring",
      "Hand-laid European oak in bedrooms",
      "Italian modular kitchen",
      "Smart home automation",
      "2 covered parking",
    ],
    cover: l3,
    gallery: [l3, cardBuilder, legacy],
  },
  {
    slug: "dlf-camellias-golf-villa",
    title: "DLF Camellias Golf Villa",
    category: "Golf Villa",
    status: "Published",
    featured: false,
    location: "DLF Camellias",
    city: "Gurugram",
    sqft: "9,100",
    bedrooms: 5,
    bathrooms: 6,
    plotSize: "Villa within enclave",
    priceLabel: "Private offer",
    shortDescription:
      "A signature villa within India's most coveted gated enclave, fronting the golf course.",
    description:
      "Set within the Camellias enclave with the Arnold Palmer-designed golf course as backdrop, this villa offers two principal levels above a generous basement entertainment floor. Every primary room enjoys course-facing aspect through floor-to-ceiling glazing.",
    amenities: [
      "Course-facing aspect from all living rooms",
      "Basement cinema + game lounge",
      "Private heated pool",
      "Home gym & wellness suite",
      "5-car basement parking",
      "Camellias clubhouse access",
    ],
    cover: l4,
    gallery: [l4, cardFarm, featured],
  },
  {
    slug: "the-aurangzeb-residence",
    title: "The Aurangzeb Residence",
    category: "Penthouse",
    status: "Published",
    featured: false,
    location: "Aurangzeb Road",
    city: "New Delhi",
    sqft: "7,800",
    bedrooms: 5,
    bathrooms: 6,
    plotSize: "Top two floors",
    priceLabel: "POA",
    shortDescription:
      "A duplex residence on Delhi's most storied avenue, with rooftop garden and reflecting pool.",
    description:
      "Occupying the top two floors of a discrete low-rise on Aurangzeb Road, this duplex pairs museum-grade interiors with one of the most prestigious addresses in India. A private rooftop garden with reflecting pool tops the composition — a place to entertain in absolute privacy.",
    amenities: [
      "Private rooftop garden & reflecting pool",
      "Duplex layout with internal stair in travertine",
      "Library lounge with bespoke bar",
      "Chef's kitchen + show kitchen",
      "Staff quarters (2 keys)",
      "Biometric private entry",
    ],
    cover: cardPent,
    gallery: [cardPent, l2, contactNight],
  },
];

export const PROPERTY_CATEGORIES: ("All" | PropertyCategory)[] = [
  "All",
  "Farmhouse",
  "Builder Floor",
  "Golf Villa",
  "Penthouse",
];

export interface BlogBlock {
  type: "h2" | "p";
  text: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  tag: "Market" | "Lifestyle" | "Investment" | "Design";
  cover: string;
  excerpt: string;
  body: BlogBlock[];
  author: string;
  authorRole: string;
  publishedAt: string;
  readTime: string;
  status: "Draft" | "Published";
}

export const BLOGS: BlogPost[] = [
  {
    slug: "south-delhi-luxury-trends-2026",
    title: "South Delhi Luxury Trends in 2026",
    tag: "Market",
    cover: b1,
    excerpt: "How private estates are outperforming traditional asset classes.",
    body: [
      {
        type: "p",
        text: "The 2026 luxury cycle in South Delhi is defined less by volume and more by curation. Buyers — many of them second-generation principals of family offices — are now treating ultra-prime residences as a long-horizon, generationally-held asset class rather than a tradable instrument.",
      },
      { type: "h2", text: "Private estates outperform" },
      {
        type: "p",
        text: "Across our advisory book, walled farmhouse estates above 1.5 acres have appreciated at a compounded 14% over the past 36 months, materially ahead of comparable trophy real estate in London Mayfair, Singapore Sentosa Cove and Dubai Emirates Hills.",
      },
      { type: "h2", text: "What the new buyer wants" },
      {
        type: "p",
        text: "Privacy, architecture and provenance — in that order. Floor plate metrics matter less than the discretion of arrival, the integrity of materials, and the long-term defensibility of the address.",
      },
    ],
    author: "Aarav Mehra",
    authorRole: "Principal, MDL Advisory",
    publishedAt: "2026-01-12",
    readTime: "6 min read",
    status: "Published",
  },
  {
    slug: "why-farmhouses-define-modern-prestige",
    title: "Why Farmhouses Define Modern Prestige",
    tag: "Lifestyle",
    cover: b2,
    excerpt: "The new architecture of privacy, light and landscape.",
    body: [
      {
        type: "p",
        text: "The Indian luxury farmhouse is no longer a weekend retreat — it is the primary residence of choice for the country's most discerning families.",
      },
      { type: "h2", text: "A new architectural language" },
      {
        type: "p",
        text: "Where 1990s farmhouses imitated European chateaux, today's principals commission honest, regionally-grounded architecture — kota stone, terrazzo, indigenous teak, internal courtyards and shaded verandahs that respond to the Delhi climate rather than fight it.",
      },
    ],
    author: "Ishaan Kapur",
    authorRole: "Editor at Large",
    publishedAt: "2026-01-04",
    readTime: "4 min read",
    status: "Published",
  },
  {
    slug: "architecture-as-an-investment",
    title: "Architecture as an Investment",
    tag: "Investment",
    cover: b3,
    excerpt: "Reading value through material, provenance and proportion.",
    body: [
      {
        type: "p",
        text: "Material integrity is the single highest predictor of long-term price defensibility in trophy real estate. Calacatta-Borghini marble, hand-laid oak parquetry and bespoke joinery from named Italian houses appreciate; trend finishes depreciate within a cycle.",
      },
      { type: "h2", text: "The provenance premium" },
      {
        type: "p",
        text: "Addresses with documented architectural provenance — a named architect, a published interior, a celebrated former owner — consistently command a 22–35% premium over comparable square footage on the same street.",
      },
    ],
    author: "Dr. Niharika Rao",
    authorRole: "Investment Counsel",
    publishedAt: "2025-12-18",
    readTime: "5 min read",
    status: "Published",
  },
  {
    slug: "timeless-interior-design",
    title: "Timeless Interior Design",
    tag: "Design",
    cover: b1,
    excerpt: "Editorial restraint over decoration — the new Indian luxury home.",
    body: [
      {
        type: "p",
        text: "The defining shift of this cycle is the move away from decorative excess toward editorial restraint. The new Indian luxury home reads like a private gallery — disciplined, material-led, and unmistakably resolved.",
      },
      { type: "h2", text: "Restraint as a luxury signal" },
      {
        type: "p",
        text: "Where decoration once signalled wealth, it now signals the absence of confidence. Material restraint, considered proportion and intentional emptiness are the new vocabulary of prestige interiors.",
      },
    ],
    author: "Meera Suri",
    authorRole: "Design Correspondent",
    publishedAt: "2025-12-02",
    readTime: "3 min read",
    status: "Published",
  },
];

export const BLOG_TAGS: ("All" | BlogPost["tag"])[] = [
  "All",
  "Market",
  "Lifestyle",
  "Investment",
  "Design",
];

export interface FounderStat {
  value: string;
  label: string;
}

export interface Founder {
  name: string;
  role: string;
  portrait: string;
  tagline: string;
  bio: [string, string];
  quote: string;
  stats: FounderStat[];
}

export const FOUNDER: Founder = {
  name: "Aarav Mehra",
  role: "Founder & Principal",
  portrait: avatar1,
  tagline:
    "Two decades of curating South Delhi's most private addresses — one family at a time.",
  bio: [
    "Aarav founded South Delhi Farms & Floors after a decade with two of India's largest real estate consultancies, where he led the ultra-prime residential desk and quietly transacted some of the most consequential off-market estates in Lutyens', Chattarpur and the Aerocity corridor. He is recognised across the industry as one of the most discreet practitioners in the country — known equally to family offices, returning NRIs and a small circle of global collectors.",
    "The firm was conceived as a deliberate counterpoint to the volume-driven brokerage model. Every address is hand-selected, every introduction is vetted, and every transaction is handled with the kind of discretion you would expect from a private bank rather than a real estate agency. It is the only way Aarav has ever known how to work.",
  ],
  quote:
    "We do not list properties. We introduce homes — one principal, one address, one quiet handshake at a time.",
  stats: [
    { value: "20+", label: "Years in luxury real estate" },
    { value: "₹3,400 Cr+", label: "Cumulative transactions advised" },
    { value: "240+", label: "Principal families served" },
  ],
};
