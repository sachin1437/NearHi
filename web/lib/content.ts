export const pexels = (
  id: number,
  width: number,
  height: number,
  ext: "jpeg" | "png" = "jpeg",
) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.${ext}?auto=compress&cs=tinysrgb&fit=crop&w=${width}&h=${height}`;

export type Person = {
  name: string;
  src: string;
  avatar: string;
  note?: string;
  muted?: boolean;
};

export const people: Record<string, Person> = {
  maya: {
    name: "Maya",
    src: pexels(5500446, 800, 1000),
    avatar: pexels(5500446, 160, 160),
    note: "bringing the tea",
  },
  leo: {
    name: "Leo",
    src: pexels(17910791, 800, 1000),
    avatar: pexels(17910791, 160, 160),
    note: "somewhere outside",
  },
  priya: {
    name: "Priya",
    src: pexels(33482275, 800, 1000),
    avatar: pexels(33482275, 160, 160),
    note: "golden hour rn",
  },
  theo: {
    name: "Theo",
    src: pexels(39592548, 800, 1000),
    avatar: pexels(39592548, 160, 160),
    note: "no thoughts, just vibes",
  },
  jace: {
    name: "Jace",
    src: pexels(11091224, 800, 1000),
    avatar: pexels(11091224, 160, 160),
    note: "camera off, still here",
    muted: true,
  },
  nova: {
    name: "Nova",
    src: pexels(14999138, 800, 1000),
    avatar: pexels(14999138, 160, 160),
    note: "last one to leave",
  },
  marcus: {
    name: "Marcus",
    src: pexels(6591121, 800, 1000),
    avatar: pexels(6591121, 160, 160),
  },
  olive: {
    name: "Olive",
    src: pexels(19501550, 800, 1000),
    avatar: pexels(19501550, 160, 160),
  },
  juno: {
    name: "Juno",
    src: pexels(11160638, 800, 1000),
    avatar: pexels(11160638, 160, 160),
  },
  callum: {
    name: "Callum",
    src: pexels(2379004, 800, 1000),
    avatar: pexels(2379004, 160, 160),
  },
};

export const groupPhotos = {
  kitchen: pexels(8111297, 1400, 1050),
  bedroom: pexels(5063102, 1400, 1050),
  games: pexels(8111327, 1400, 1050),
  cafe: pexels(5054648, 1400, 1050),
};

export const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Why NearHi", href: "#why" },
  { label: "Safety", href: "#safety" },
  { label: "Rooms", href: "/rooms/" },
  { label: "FAQ", href: "#faq" },
];

export const facts = [
  { name: "Video chat", className: "font-display text-[19px] font-bold tracking-[-0.05em]" },
  { name: "Text chat", className: "font-display text-[19px] font-extrabold tracking-[-0.03em]" },
  { name: "PICK YOUR RADIUS", className: "font-display text-[17px] font-medium tracking-[0.28em]" },
  { name: "Skip anytime", className: "font-sans text-[17px] font-bold italic tracking-[-0.03em]" },
  { name: "NO SIGN-UP TO CHAT", className: "font-sans text-[14px] font-bold tracking-[0.08em]" },
  { name: "Nothing recorded", className: "font-serif text-[21px] italic" },
  { name: "Adults only", className: "font-display text-[19px] font-bold tracking-[-0.05em]" },
  { name: "In your browser", className: "font-sans text-[17px] font-bold italic tracking-[-0.03em]" },
];
