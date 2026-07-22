import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Home,
  Search,
  Upload as UploadIcon,
  User,
  Bell,
  Sun,
  Moon,
  ArrowLeft,
  FileText,
  Sparkles,
  MoreVertical,
  Send,
  Mic,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Clock,
  Scale,
  CheckCircle2,
  AlertTriangle,
  FileUp,
  MessageSquarePlus,
  X,
  Gavel,
  BookOpen,
  Landmark,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Fingerprint,
  Globe,
  KeyRound,
  Check,
  BellRing,
  BellOff,
  Smartphone,
  MapPin,
  LocateFixed,
  ZoomIn,
  ZoomOut,
  Filter,
  Building2,
  ChevronDown,
} from "lucide-react";

/* ============================================================
   DESIGN TOKENS — derived from CaseMind Framework §10 / §11
   "Judicial Intelligence": Authoritative Minimalism +
   Intelligent Warmth + Civic Trust
   ============================================================ */

const COLORS = {
  // neutral "ink" scale replaces the old indigo scale — used for buttons,
  // active states, and structural accents. No blue anywhere in the UI now.
  primary50: "#F4F3F1",
  primary500: "#2A2A28",
  primary600: "#171716",
  primary700: "#0C0C0B",
  primary900: "#141312",
  primary950: "#080808",
  gold300: "#FFD9A8",
  gold500: "#F5A468",
  gold600: "#E07A3F",
  success: "#10B981",
  warning: "#E07A3F",
  error: "#E0553F",
  info: "#8A8A86",
  // warm coral/peach accent — reserved for AI moments only (orb, glow
  // cards, citation chips), echoing the reference's signature gradient.
  aiAccent: "#E8724A",
  aiGradientHeroLight: "linear-gradient(135deg, #FBD6B0, #F8B9C4)",
  aiGradientHeroDark: "linear-gradient(135deg, rgba(248,168,110,0.22), rgba(240,116,140,0.16))",
  iconAmber: "#B8791F",
  iconAmberBg: "rgba(217,151,40,0.16)",
  iconPlum: "#7A5AA6",
  iconPlumBg: "rgba(122,90,166,0.14)",
  iconClay: "#B8552E",
  iconClayBg: "rgba(184,85,46,0.14)",
};

const THEME = {
  light: {
    pageBg: "#FAF6EC",
    surface: "#FFFFFF",
    surfaceAlt: "#F5F0E3",
    border: "#E9E1D0",
    borderStrong: "#D8D2C8",
    textPrimary: "#161513",
    textSecondary: "#75726C",
    textFaint: "#A6A199",
    aiPanelBg: "linear-gradient(135deg, #FCEEE0, #FBE6E9)",
    navBg: "#151412",
    shadowCard: "0 1px 3px rgba(22,21,19,0.07), 0 1px 2px rgba(22,21,19,0.04)",
    shadowRaised: "0 14px 28px rgba(22,21,19,0.14)",
  },
  dark: {
    pageBg: "#0B0B0A",
    surface: "#181715",
    surfaceAlt: "#221F1C",
    border: "#332F2A",
    borderStrong: "#413C35",
    textPrimary: "#F2EFE9",
    textSecondary: "#A8A39A",
    textFaint: "#6B665E",
    aiPanelBg: "linear-gradient(135deg, rgba(248,168,110,0.14), rgba(240,116,140,0.09))",
    navBg: "#000000",
    shadowCard: "0 1px 3px rgba(0,0,0,0.35)",
    shadowRaised: "0 20px 40px rgba(0,0,0,0.5)",
  },
};

const STATUS_COLORS = {
  Active: COLORS.success,
  Adjourned: COLORS.warning,
  Reserved: COLORS.info,
  Disposed: "#6B7280",
  Urgent: COLORS.error,
};

const RECENT_CASES = [
  {
    id: "c1",
    title: "Smith vs State",
    cnr: "SC/CRL/2026/00481",
    status: "Active",
    note: "Summary generated · 2h ago",
  },
  {
    id: "c2",
    title: "Verma Textiles vs Union of India",
    cnr: "HC/DEL/2026/11294",
    status: "Adjourned",
    note: "Next hearing · 12 Aug 2026",
  },
  {
    id: "c3",
    title: "Rao Constructions — Arbitration",
    cnr: "ARB/2025/00097",
    status: "Disposed",
    note: "Final order uploaded · 5d ago",
  },
];

const SUGGESTED_PROMPTS = [
  "Precedent on circumstantial evidence in fraud cases",
  "Explain Section 420 IPC in plain language",
  "Cases where intent to deceive was not established",
];

const LANGUAGES = ["English", "Hindi", "Bengali", "Tamil", "Marathi"];

const NOTIFICATIONS_SEED = [
  {
    id: "n1",
    icon: Sparkles,
    title: "Summary ready",
    body: "Your AI summary for Smith vs State has finished generating.",
    time: "2h ago",
    read: false,
  },
  {
    id: "n2",
    icon: Gavel,
    title: "Hearing scheduled",
    body: "Verma Textiles vs Union of India — next hearing on 12 Aug 2026.",
    time: "1d ago",
    read: false,
  },
  {
    id: "n3",
    icon: FileText,
    title: "Order uploaded",
    body: "Final order for Rao Constructions — Arbitration is now available.",
    time: "5d ago",
    read: false,
  },
  {
    id: "n4",
    icon: ShieldCheck,
    title: "New sign-in detected",
    body: "Your account was accessed from a new device in Kolkata.",
    time: "6d ago",
    read: true,
  },
];

// Placeholder dataset — replace with the parsed bare-act PDF once uploaded.
// IPC (Indian Penal Code, 1860) was repealed and replaced by the Bharatiya
// Nyaya Sanhita, 2023 (BNS), effective 1 July 2024. IPC still governs
// offences committed before that date, so both are kept, clearly labeled.
const LEGAL_CODES = {
  ipc: [
    {
      section: "302",
      title: "Punishment for murder",
      description:
        "Whoever commits murder shall be punished with death, or imprisonment for life, and shall also be liable to fine.",
      punishment: "Death or life imprisonment + fine",
      chapter: "Offences Affecting the Human Body",
    },
    {
      section: "375",
      title: "Rape",
      description:
        "Defines the offence of rape, setting out the circumstances under which sexual intercourse constitutes the offence.",
      punishment: "See Section 376 for punishment",
      chapter: "Offences Against Women",
    },
    {
      section: "376",
      title: "Punishment for rape",
      description:
        "Prescribes rigorous imprisonment not less than 10 years, extendable to life imprisonment, and fine.",
      punishment: "Rigorous imprisonment (10 yrs–life) + fine",
      chapter: "Offences Against Women",
    },
    {
      section: "420",
      title: "Cheating and dishonestly inducing delivery of property",
      description:
        "Whoever cheats and thereby dishonestly induces the person deceived to deliver property, or alter/destroy a valuable security.",
      punishment: "Imprisonment up to 7 years + fine",
      chapter: "Offences Relating to Property",
    },
    {
      section: "34",
      title: "Acts done by several persons in furtherance of common intention",
      description:
        "When a criminal act is done by several persons in furtherance of common intention, each is liable as if done by them alone.",
      punishment: "Same as principal offence",
      chapter: "General Explanations",
    },
    {
      section: "120B",
      title: "Punishment of criminal conspiracy",
      description:
        "Whoever is party to a criminal conspiracy to commit an offence punishable with death, life imprisonment, or rigorous imprisonment of 2+ years.",
      punishment: "Same as abetting the offence",
      chapter: "Criminal Conspiracy",
    },
  ],
  bns: [
    {
      section: "103(1)",
      title: "Punishment for murder",
      description:
        "Whoever commits murder shall be punished with death or imprisonment for life, and fine (replaces IPC §302).",
      punishment: "Death or life imprisonment + fine",
      chapter: "Offences Affecting the Human Body",
    },
    {
      section: "63",
      title: "Rape",
      description:
        "Defines the offence of rape under the new code (replaces IPC §375).",
      punishment: "See Section 64 for punishment",
      chapter: "Offences Against Women and Children",
    },
    {
      section: "318",
      title: "Cheating",
      description:
        "Whoever cheats and dishonestly induces delivery of property or alteration of a valuable security (replaces IPC §420).",
      punishment: "Imprisonment up to 7 years + fine",
      chapter: "Offences Relating to Property",
    },
    {
      section: "3(5)",
      title: "Acts done by several persons in furtherance of common intention",
      description:
        "Restates the common-intention liability principle (replaces IPC §34).",
      punishment: "Same as principal offence",
      chapter: "General Explanations",
    },
    {
      section: "61(2)",
      title: "Punishment of criminal conspiracy",
      description:
        "Restates criminal conspiracy liability (replaces IPC §120B).",
      punishment: "Same as abetting the offence",
      chapter: "Criminal Conspiracy",
    },
  ],
};

// Sample court locations for the map — Supreme Court + all 25 High Courts
// have approximate real coordinates; district/local courts are illustrative
// placeholders. Swap in a full e-Courts dataset for production accuracy.
const COURTS = [
  { id: "sc1", name: "Supreme Court of India", type: "supreme", city: "New Delhi", lat: 28.6224, lng: 77.2411 },
  { id: "hc1", name: "Delhi High Court", type: "high", city: "New Delhi", lat: 28.6139, lng: 77.2431 },
  { id: "hc2", name: "Bombay High Court", type: "high", city: "Mumbai", lat: 18.9298, lng: 72.8324 },
  { id: "hc3", name: "Calcutta High Court", type: "high", city: "Kolkata", lat: 22.5658, lng: 88.3489 },
  { id: "hc4", name: "Madras High Court", type: "high", city: "Chennai", lat: 13.0942, lng: 80.2836 },
  { id: "hc5", name: "Karnataka High Court", type: "high", city: "Bengaluru", lat: 12.9789, lng: 77.5917 },
  { id: "hc6", name: "Telangana High Court", type: "high", city: "Hyderabad", lat: 17.3934, lng: 78.4737 },
  { id: "hc7", name: "Gujarat High Court", type: "high", city: "Ahmedabad", lat: 23.0891, lng: 72.5385 },
  { id: "hc8", name: "Allahabad High Court", type: "high", city: "Prayagraj", lat: 25.4358, lng: 81.8463 },
  { id: "hc9", name: "Punjab & Haryana High Court", type: "high", city: "Chandigarh", lat: 30.7484, lng: 76.7817 },
  { id: "hc10", name: "Rajasthan High Court", type: "high", city: "Jodhpur", lat: 26.2793, lng: 73.0243 },
  { id: "hc11", name: "Patna High Court", type: "high", city: "Patna", lat: 25.6127, lng: 85.1690 },
  { id: "hc12", name: "Orissa High Court", type: "high", city: "Cuttack", lat: 20.4686, lng: 85.8794 },
  { id: "hc13", name: "Kerala High Court", type: "high", city: "Kochi", lat: 9.9816, lng: 76.2820 },
  { id: "hc14", name: "Madhya Pradesh High Court", type: "high", city: "Jabalpur", lat: 23.1685, lng: 79.9457 },
  { id: "hc15", name: "Gauhati High Court", type: "high", city: "Guwahati", lat: 26.1445, lng: 91.7362 },
  { id: "hc16", name: "Jharkhand High Court", type: "high", city: "Ranchi", lat: 23.3441, lng: 85.3096 },
  { id: "hc17", name: "Chhattisgarh High Court", type: "high", city: "Bilaspur", lat: 22.0797, lng: 82.1391 },
  { id: "hc18", name: "Uttarakhand High Court", type: "high", city: "Nainital", lat: 29.3803, lng: 79.4636 },
  { id: "hc19", name: "Himachal Pradesh High Court", type: "high", city: "Shimla", lat: 31.1048, lng: 77.1734 },
  { id: "hc20", name: "Sikkim High Court", type: "high", city: "Gangtok", lat: 27.3325, lng: 88.6151 },
  { id: "hc21", name: "Meghalaya High Court", type: "high", city: "Shillong", lat: 25.5744, lng: 91.8789 },
  { id: "hc22", name: "Manipur High Court", type: "high", city: "Imphal", lat: 24.8074, lng: 93.9414 },
  { id: "hc23", name: "Tripura High Court", type: "high", city: "Agartala", lat: 23.8362, lng: 91.2758 },
  { id: "hc24", name: "Jammu & Kashmir and Ladakh High Court", type: "high", city: "Srinagar", lat: 34.0837, lng: 74.7973 },
  { id: "hc25", name: "Andhra Pradesh High Court", type: "high", city: "Amaravati", lat: 16.5062, lng: 80.6480 },
  { id: "dc1", name: "Saket District Court", type: "district", city: "New Delhi", lat: 28.5273, lng: 77.2153 },
  { id: "dc2", name: "Bandra District Court", type: "district", city: "Mumbai", lat: 19.0600, lng: 72.8347 },
  { id: "dc3", name: "Alipore District Court", type: "district", city: "Kolkata", lat: 22.5265, lng: 88.3315 },
  { id: "dc4", name: "Bengaluru City Civil Court", type: "district", city: "Bengaluru", lat: 12.9634, lng: 77.5855 },
];

const COURT_TYPE_META = {
  supreme: { label: "Supreme Court", color: "#E8724A" },
  high: { label: "High Court", color: "#171716" },
  district: { label: "District / Local Court", color: "#B8791F" },
};

// Simple equirectangular-ish projection of India's bounding box onto a
// 400x460 viewBox. Illustrative, not survey-accurate — good enough for a
// stylized locator UI without pulling in map-tile dependencies.
const MAP_BOUNDS = { latMin: 6, latMax: 37, lngMin: 68, lngMax: 98 };
function project(lat, lng) {
  const x = ((lng - MAP_BOUNDS.lngMin) / (MAP_BOUNDS.lngMax - MAP_BOUNDS.lngMin)) * 400;
  const y = ((MAP_BOUNDS.latMax - lat) / (MAP_BOUNDS.latMax - MAP_BOUNDS.latMin)) * 460;
  return { x, y };
}

// Real India coastline/border outline, derived from actual state-boundary
// geodata (GADM-derived, via geohacker/india), unioned into a single
// national silhouette, simplified, and projected with the same
// lat/lng -> viewBox transform used for court markers above -- so the
// outline and the pins line up accurately. No map-tile API or key needed.
const INDIA_MAIN_PATH =
  "M 38.4,241.7 L 33.8,240.3 L 29.1,236.9 L 23.2,227.8 L 12.5,218.0 L 14.2,215.5 L 14.3,216.7 L 15.9,216.3 L 15.4,217.9 L 16.4,218.8 L 28.8,214.4 L 29.9,212.7 L 30.0,212.3 L 29.8,212.2 L 30.1,212.1 L 30.0,211.7 L 30.7,211.3 L 31.4,209.7 L 32.3,208.7 L 33.0,207.6 L 33.2,206.6 L 28.7,207.3 L 22.7,211.8 L 21.8,210.8 L 15.9,210.1 L 7.8,204.5 L 8.4,204.6 L 9.0,203.7 L 8.4,203.4 L 9.7,203.4 L 10.0,203.2 L 10.1,202.8 L 6.5,198.3 L 10.2,194.8 L 8.1,195.1 L 7.1,196.5 L 6.9,195.5 L 8.8,194.1 L 7.2,193.7 L 11.0,188.3 L 26.4,190.5 L 41.7,187.1 L 35.5,167.7 L 27.9,164.1 L 28.9,155.1 L 20.1,152.1 L 21.0,145.9 L 31.5,133.4 L 38.5,138.0 L 52.0,134.2 L 58.5,122.2 L 65.9,118.3 L 71.9,104.8 L 79.4,101.1 L 79.1,97.0 L 89.1,88.0 L 86.7,87.0 L 88.0,75.9 L 98.1,70.8 L 89.2,66.9 L 89.3,61.7 L 87.1,63.2 L 80.2,56.4 L 82.5,52.6 L 79.4,48.7 L 83.5,44.9 L 78.6,44.0 L 76.9,39.0 L 84.1,32.6 L 103.3,36.9 L 134.7,22.5 L 136.6,34.2 L 146.5,39.8 L 142.8,43.4 L 143.1,50.2 L 152.1,56.7 L 154.2,64.2 L 146.4,69.1 L 143.3,63.9 L 138.8,65.9 L 143.6,74.2 L 142.9,81.8 L 173.6,100.1 L 164.9,107.6 L 161.0,121.3 L 185.2,135.7 L 196.1,137.7 L 196.5,140.9 L 221.6,143.4 L 221.9,147.7 L 229.5,152.0 L 235.2,150.3 L 238.0,154.8 L 267.1,157.8 L 268.3,134.3 L 274.9,131.6 L 278.5,135.6 L 276.7,146.3 L 281.7,151.2 L 320.7,150.6 L 321.6,144.1 L 315.3,141.2 L 313.9,135.7 L 327.5,136.2 L 337.8,124.0 L 345.7,123.6 L 355.0,113.5 L 366.0,118.2 L 374.5,111.9 L 378.6,114.9 L 375.6,120.1 L 380.3,117.5 L 381.5,122.0 L 376.9,127.4 L 392.0,130.6 L 391.9,135.1 L 385.3,139.2 L 388.6,146.9 L 382.8,142.7 L 376.5,144.2 L 362.1,154.0 L 362.5,162.0 L 355.1,172.3 L 356.3,178.9 L 348.8,195.1 L 338.0,191.2 L 338.6,205.7 L 335.1,207.0 L 336.1,218.7 L 332.1,223.4 L 329.6,220.3 L 328.1,222.9 L 323.7,197.0 L 319.5,196.9 L 314.9,208.6 L 308.9,198.8 L 311.7,191.3 L 318.7,190.9 L 322.2,186.6 L 325.8,177.6 L 291.1,173.7 L 289.1,159.7 L 287.7,163.7 L 284.7,163.1 L 281.4,157.4 L 278.0,159.7 L 272.0,153.9 L 273.7,157.9 L 268.2,166.2 L 280.2,173.7 L 272.6,175.2 L 266.8,183.0 L 276.5,188.8 L 274.2,198.2 L 277.3,200.4 L 276.3,204.0 L 279.9,204.6 L 279.3,212.8 L 277.4,211.4 L 279.2,214.1 L 275.6,214.2 L 277.0,215.1 L 277.1,215.3 L 277.4,216.0 L 277.6,216.2 L 278.0,216.2 L 277.9,216.8 L 278.1,217.2 L 278.3,217.3 L 278.4,217.3 L 278.3,217.3 L 278.0,217.2 L 277.6,217.2 L 276.4,219.7 L 275.5,217.5 L 274.8,223.9 L 271.7,223.0 L 271.9,225.6 L 271.4,225.2 L 271.6,224.1 L 271.6,224.0 L 271.5,223.7 L 271.3,223.7 L 270.1,224.5 L 270.9,224.9 L 270.7,225.1 L 270.4,225.2 L 270.2,225.3 L 270.1,225.4 L 270.1,225.5 L 270.2,225.7 L 270.4,226.1 L 270.0,225.5 L 270.4,226.2 L 270.2,226.6 L 270.3,226.2 L 268.8,224.4 L 269.7,221.5 L 269.4,220.1 L 266.5,218.9 L 266.0,216.6 L 265.6,216.1 L 265.1,216.0 L 265.9,218.7 L 266.4,219.4 L 266.8,219.6 L 268.5,219.8 L 269.2,221.2 L 266.1,221.1 L 264.1,227.0 L 254.8,229.7 L 252.1,232.4 L 252.9,240.5 L 251.8,240.4 L 251.0,240.8 L 250.1,243.2 L 253.9,241.7 L 243.3,251.5 L 243.2,251.9 L 244.5,252.7 L 244.2,253.0 L 244.9,252.9 L 238.7,254.7 L 232.3,257.9 L 223.0,265.0 L 222.7,265.4 L 222.8,265.5 L 222.9,265.6 L 222.9,265.7 L 223.0,265.8 L 223.5,266.0 L 223.3,266.4 L 215.0,277.3 L 191.6,295.0 L 190.0,297.8 L 191.4,297.3 L 189.9,301.1 L 190.2,303.2 L 190.7,303.1 L 190.8,303.2 L 178.2,306.3 L 172.6,315.8 L 171.0,315.9 L 170.7,313.9 L 170.3,313.6 L 169.2,313.4 L 163.6,316.5 L 161.1,321.8 L 161.2,323.2 L 160.6,323.3 L 160.6,325.3 L 164.2,349.7 L 163.5,347.8 L 162.0,345.4 L 161.8,347.0 L 161.4,345.6 L 160.7,347.4 L 164.4,350.7 L 164.3,349.8 L 164.3,349.6 L 164.3,349.5 L 164.6,351.8 L 162.1,364.0 L 160.2,365.9 L 160.8,365.8 L 159.3,367.7 L 160.1,367.2 L 157.7,372.7 L 157.3,372.7 L 157.2,372.8 L 156.8,377.4 L 157.4,382.3 L 158.1,383.1 L 157.7,388.5 L 158.0,388.4 L 158.4,396.2 L 155.1,395.3 L 150.5,396.9 L 145.3,408.2 L 149.2,411.3 L 144.4,411.5 L 142.1,413.1 L 139.8,413.3 L 136.8,415.2 L 135.6,417.2 L 136.4,419.2 L 134.7,420.7 L 134.2,424.8 L 127.7,428.3 L 127.3,429.2 L 113.9,416.9 L 111.2,409.3 L 109.8,401.1 L 111.4,407.7 L 111.8,408.0 L 113.4,407.6 L 112.2,407.2 L 111.9,403.3 L 111.4,402.0 L 110.9,402.3 L 111.0,402.2 L 110.9,402.2 L 110.9,402.1 L 110.8,402.0 L 110.9,401.9 L 110.7,401.6 L 110.8,401.4 L 110.7,401.6 L 110.7,401.7 L 110.2,400.2 L 110.0,400.2 L 110.2,399.5 L 109.4,398.5 L 109.5,399.3 L 109.7,399.8 L 109.6,399.6 L 109.8,400.2 L 109.7,400.4 L 109.8,400.4 L 109.8,400.7 L 109.9,400.7 L 109.9,401.0 L 109.9,401.1 L 109.7,401.0 L 107.6,392.6 L 105.5,388.9 L 104.8,383.8 L 97.9,370.3 L 96.0,370.9 L 96.3,369.9 L 95.9,369.0 L 90.9,358.3 L 88.4,343.5 L 85.0,332.8 L 78.8,325.2 L 78.6,320.3 L 76.9,319.1 L 75.5,314.5 L 72.7,310.8 L 68.5,284.5 L 66.5,279.0 L 65.7,278.7 L 66.2,277.8 L 67.8,279.7 L 67.8,277.1 L 64.7,271.6 L 67.1,267.1 L 66.2,266.2 L 64.1,268.7 L 64.5,263.1 L 62.0,254.6 L 63.4,253.3 L 63.2,248.7 L 65.3,243.5 L 65.2,241.2 L 63.0,236.9 L 63.6,236.4 L 62.7,236.3 L 62.9,235.3 L 62.4,235.1 L 62.2,235.1 L 62.2,235.2 L 62.0,236.3 L 61.7,236.3 L 61.2,233.3 L 62.6,230.5 L 62.3,229.7 L 63.2,229.4 L 63.2,229.3 L 62.4,229.4 L 61.7,230.1 L 61.3,229.2 L 64.5,227.5 L 60.1,227.2 L 60.1,222.9 L 61.2,219.5 L 63.4,220.0 L 64.1,218.9 L 65.0,219.3 L 65.5,219.0 L 65.5,218.5 L 59.8,219.7 L 59.9,218.9 L 59.6,219.0 L 59.1,218.1 L 58.5,218.0 L 58.8,217.3 L 58.6,216.9 L 58.2,217.0 L 55.3,222.8 L 57.4,228.1 L 54.3,232.9 L 54.8,234.5 L 46.9,238.2 L 45.8,239.4 L 45.0,239.3 L 41.0,241.3 L 39.5,241.3 L 40.0,241.6 L 39.7,241.8 L 38.4,241.7 Z";

const INDIA_ISLAND_PATHS = [
  "M 344.6,441.7 L 346.0,445.2 L 344.4,448.8 L 343.3,445.7 L 342.2,445.1 L 342.1,443.3 L 344.6,441.7 Z",
  "M 333.2,348.3 L 332.7,351.0 L 333.8,354.9 L 333.0,355.9 L 332.5,354.9 L 331.9,355.3 L 331.2,358.0 L 331.2,350.2 L 331.6,350.2 L 331.8,349.8 L 331.6,349.1 L 332.4,348.7 L 332.2,348.2 L 333.2,348.3 Z",
  "M 329.4,367.5 L 329.1,373.7 L 330.0,372.0 L 330.5,372.4 L 328.9,376.1 L 330.1,375.9 L 329.5,378.7 L 326.8,373.2 L 328.1,372.9 L 329.4,367.5 Z",
  "M 332.0,357.4 L 332.9,363.6 L 330.5,364.0 L 331.9,366.2 L 330.3,366.2 L 329.6,366.5 L 332.0,357.4 Z",
  "M 327.0,387.4 L 327.6,392.1 L 325.1,392.7 L 325.0,389.0 L 327.0,387.4 Z",
];

/* ============================================================
   SMALL PRIMITIVES
   ============================================================ */

function useTheme(dark) {
  return dark ? THEME.dark : THEME.light;
}

function Pill({ children, tone = "neutral", t, mono = false }) {
  const toneMap = {
    neutral: { bg: t.surfaceAlt, fg: t.textSecondary, bd: t.border },
    primary: { bg: t.aiPanelBg, fg: COLORS.aiAccent, bd: "transparent" },
    gold: { bg: "rgba(245,158,11,0.12)", fg: COLORS.gold600, bd: "transparent" },
  };
  const s = toneMap[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "5px 10px",
        borderRadius: 999,
        fontSize: 11.5,
        fontWeight: 600,
        letterSpacing: 0.1,
        background: s.bg,
        color: s.fg,
        border: `1px solid ${s.bd}`,
        fontFamily: mono ? "'JetBrains Mono', monospace" : "inherit",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function StatusBadge({ status, t }) {
  const color = STATUS_COLORS[status] || t.textSecondary;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 9px 3px 7px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        color,
        background: `${color}1A`,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 999, background: color }} />
      {status}
    </span>
  );
}

function AIOrb({ size = 28, spinning = false }) {
  return (
    <div
      className={spinning ? "orb-spin" : ""}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        background:
          "conic-gradient(from 180deg, #F5A468, #F0748C, #F5A468)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 0 0 1px rgba(232,114,74,0.28), 0 0 14px rgba(232,114,74,0.30)",
      }}
    >
      <div
        style={{
          width: size - 8,
          height: size - 8,
          borderRadius: "50%",
          background: "#141312",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Sparkles size={Math.max(size - 20, 11)} color="#FBD6B0" strokeWidth={2} />
      </div>
    </div>
  );
}

function IconButton({ children, onClick, t, ariaLabel, badge }) {
  return (
    <button
      aria-label={ariaLabel}
      onClick={onClick}
      style={{
        position: "relative",
        width: 38,
        height: 38,
        borderRadius: 12,
        border: `1px solid ${t.border}`,
        background: t.surface,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: t.textPrimary,
        cursor: "pointer",
        transition: "transform 150ms ease, background 150ms ease",
      }}
      className="press-scale"
    >
      {children}
      {badge && (
        <span
          style={{
            position: "absolute",
            top: 7,
            right: 8,
            width: 7,
            height: 7,
            borderRadius: 999,
            background: COLORS.error,
            border: `2px solid ${t.surface}`,
          }}
        />
      )}
    </button>
  );
}

function ScreenHeader({ t, title, onBack, right }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "22px 24px 18px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {onBack && (
          <button
            aria-label="Go back"
            onClick={onBack}
            className="press-scale"
            style={{
              width: 36,
              height: 36,
              borderRadius: 11,
              border: `1px solid ${t.border}`,
              background: t.surface,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: t.textPrimary,
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={17} strokeWidth={1.75} />
          </button>
        )}
        <h1
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700,
            fontSize: 20,
            color: t.textPrimary,
            margin: 0,
            letterSpacing: -0.3,
          }}
        >
          {title}
        </h1>
      </div>
      {right}
    </div>
  );
}

/* ============================================================
   SCREEN: SPLASH
   ============================================================ */

function ScreenSplash({ dark }) {
  return (
    <div
      className="fade-in"
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(120% 100% at 50% 20%, #201E1B 0%, #0A0A09 65%)",
        zIndex: 50,
      }}
    >
      <div className="splash-emblem" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: 24,
            background: "conic-gradient(from 180deg, #F5A468, #F0748C, #F5A468)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 0 1px rgba(232,114,74,0.35), 0 0 40px rgba(232,114,74,0.4)",
          }}
        >
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: 18,
              background: "#141312",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Scale size={30} color="#FBD6B0" strokeWidth={1.75} />
          </div>
        </div>
        <div
          style={{
            marginTop: 22,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800,
            fontSize: 24,
            letterSpacing: -0.4,
            color: "#F2EFE9",
          }}
        >
          CaseMind
        </div>
        <div style={{ marginTop: 6, fontSize: 12.5, color: "#C9A78E", letterSpacing: 0.3 }}>
          Judicial Intelligence, on demand
        </div>
      </div>
      <div className="splash-loader" style={{ position: "absolute", bottom: 64 }}>
        <span className="typing-dot" style={{ animationDelay: "0ms" }} />
        <span className="typing-dot" style={{ animationDelay: "150ms" }} />
        <span className="typing-dot" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}

/* ============================================================
   SCREEN: AUTH (Login / Sign up)
   ============================================================ */

function AuthField({ t, icon: Icon, type, value, onChange, placeholder, label, showToggle, visible, onToggleVisible }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 650, color: t.textSecondary, marginBottom: 7 }}>{label}</div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 14px",
          borderRadius: 14,
          background: t.surfaceAlt,
          border: `1px solid ${t.border}`,
        }}
      >
        <Icon size={16} color={t.textFaint} strokeWidth={1.75} />
        <input
          type={showToggle ? (visible ? "text" : "password") : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: 13.5,
            color: t.textPrimary,
            fontFamily: "'Inter', sans-serif",
            minWidth: 0,
          }}
        />
        {showToggle && (
          <button
            type="button"
            onClick={onToggleVisible}
            className="press-scale"
            aria-label={visible ? "Hide password" : "Show password"}
            style={{ border: "none", background: "transparent", cursor: "pointer", color: t.textFaint, display: "flex" }}
          >
            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}

function ScreenAuth({ t, dark, onAuthenticated }) {
  const [mode, setMode] = useState("login"); // login | signup
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    email.trim().length > 3 &&
    password.trim().length >= 4 &&
    (mode === "login" || name.trim().length > 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) {
      setError(
        mode === "signup"
          ? "Enter your name, a valid email, and a password (4+ characters)."
          : "Enter a valid email and password (4+ characters)."
      );
      return;
    }
    setError("");
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onAuthenticated({ name: mode === "signup" ? name : "Alex Carter", email });
    }, 900);
  };

  return (
    <div
      className="fade-in"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "40px 24px 34px",
        overflowY: "auto",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 30 }}>
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            background: `linear-gradient(135deg, ${COLORS.primary600}, ${COLORS.primary900})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Scale size={20} color="#fff" strokeWidth={1.75} />
        </div>
        <div>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 18, color: t.textPrimary, letterSpacing: -0.3 }}>
            CaseMind
          </div>
          <div style={{ fontSize: 11.5, color: t.textSecondary }}>Judicial Intelligence, on demand</div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          padding: 4,
          borderRadius: 13,
          background: t.surfaceAlt,
          border: `1px solid ${t.border}`,
          marginBottom: 26,
        }}
      >
        {["login", "signup"].map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setError("");
            }}
            className="press-scale"
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "'Inter', sans-serif",
              background: mode === m ? t.surface : "transparent",
              color: mode === m ? t.textPrimary : t.textSecondary,
              boxShadow: mode === m ? t.shadowCard : "none",
            }}
          >
            {m === "login" ? "Log in" : "Sign up"}
          </button>
        ))}
      </div>

      <div
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 700,
          fontSize: 19,
          color: t.textPrimary,
          letterSpacing: -0.3,
          marginBottom: 4,
        }}
      >
        {mode === "login" ? "Welcome back" : "Create your account"}
      </div>
      <div style={{ fontSize: 12.5, color: t.textSecondary, marginBottom: 24 }}>
        {mode === "login"
          ? "Log in to pick up where you left off."
          : "Set up access to your matters and AI research."}
      </div>

      <form onSubmit={handleSubmit}>
        {mode === "signup" && (
          <AuthField
            t={t}
            icon={User}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Carter"
            label="Full name"
          />
        )}
        <AuthField
          t={t}
          icon={Mail}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@lawfirm.com"
          label="Work email"
        />
        <AuthField
          t={t}
          icon={Lock}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          label="Password"
          showToggle
          visible={showPw}
          onToggleVisible={() => setShowPw((v) => !v)}
        />

        {error && (
          <div style={{ fontSize: 12, color: COLORS.error, marginTop: 4, marginBottom: 10 }}>{error}</div>
        )}

        {mode === "login" && (
          <div style={{ textAlign: "right", marginBottom: 18 }}>
            <button
              type="button"
              className="press-scale"
              style={{ border: "none", background: "transparent", color: t.textPrimary, fontSize: 12, fontWeight: 650, cursor: "pointer" }}
            >
              Forgot password?
            </button>
          </div>
        )}

        <button
          type="submit"
          className="btn-primary press-scale"
          disabled={submitting}
          style={{ width: "100%", justifyContent: "center", marginTop: mode === "signup" ? 20 : 0 }}
        >
          {submitting ? (
            <>
              <span className="spinner" /> {mode === "login" ? "Logging in…" : "Creating account…"}
            </>
          ) : (
            <>{mode === "login" ? "Log in" : "Create account"}</>
          )}
        </button>
      </form>

      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "26px 0" }}>
        <div style={{ flex: 1, height: 1, background: t.border }} />
        <span style={{ fontSize: 11, color: t.textFaint }}>or</span>
        <div style={{ flex: 1, height: 1, background: t.border }} />
      </div>

      <button
        type="button"
        onClick={() => onAuthenticated({ name: "Alex Carter", email: "guest@casemind.ai" })}
        className="btn-secondary press-scale"
        style={{ width: "100%", justifyContent: "center" }}
      >
        Continue as guest
      </button>

      <div style={{ textAlign: "center", fontSize: 11.5, color: t.textFaint, marginTop: "auto", paddingTop: 26 }}>
        By continuing you agree to CaseMind's Terms and Privacy Policy.
      </div>
    </div>
  );
}

/* ============================================================
   NOTIFICATIONS PANEL
   ============================================================ */

function NotificationsPanel({ t, notifications, onMarkAllRead, onDismiss, onClose }) {
  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.28)", zIndex: 40 }}
        className="fade-in"
      />
      <div
        className="scale-in"
        style={{
          position: "absolute",
          top: 70,
          right: 16,
          left: 16,
          maxWidth: 360,
          marginLeft: "auto",
          borderRadius: 18,
          background: t.surface,
          border: `1px solid ${t.border}`,
          boxShadow: t.shadowRaised,
          zIndex: 41,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            borderBottom: `1px solid ${t.border}`,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: t.textPrimary }}>Notifications</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={onMarkAllRead}
              className="press-scale"
              style={{ border: "none", background: "transparent", color: t.textPrimary, fontSize: 11.5, fontWeight: 650, cursor: "pointer" }}
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              aria-label="Close notifications"
              className="press-scale"
              style={{ border: "none", background: "transparent", color: t.textFaint, cursor: "pointer", display: "flex" }}
            >
              <X size={16} />
            </button>
          </div>
        </div>
        <div style={{ maxHeight: 340, overflowY: "auto" }}>
          {notifications.length === 0 && (
            <div style={{ padding: 24, textAlign: "center", fontSize: 12.5, color: t.textFaint }}>
              You're all caught up.
            </div>
          )}
          {notifications.map((n) => (
            <div
              key={n.id}
              style={{
                display: "flex",
                gap: 12,
                padding: "13px 16px",
                borderBottom: `1px solid ${t.border}`,
                background: n.read ? "transparent" : t.aiPanelBg,
                position: "relative",
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 10,
                  background: t.surfaceAlt,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <n.icon size={14} color={COLORS.aiAccent} strokeWidth={1.8} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: t.textPrimary }}>{n.title}</div>
                <div style={{ fontSize: 11.5, color: t.textSecondary, marginTop: 3, lineHeight: 1.5 }}>{n.body}</div>
                <div style={{ fontSize: 10.5, color: t.textFaint, marginTop: 5 }}>{n.time}</div>
              </div>
              <button
                onClick={() => onDismiss(n.id)}
                aria-label="Dismiss notification"
                className="press-scale"
                style={{
                  border: "none",
                  background: "transparent",
                  color: t.textFaint,
                  cursor: "pointer",
                  alignSelf: "flex-start",
                  display: "flex",
                }}
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ============================================================
   SCREEN: HOME
   ============================================================ */

function ScreenHome({ t, dark, setDark, goTo, user, unreadCount, onOpenNotifications }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const initials = (user?.name || "Alex Carter")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="fade-in">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "24px 24px 8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: `linear-gradient(135deg, ${COLORS.primary600}, ${COLORS.primary900})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 12.5, color: t.textSecondary, fontWeight: 500 }}>
              {greeting}
            </div>
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 18,
                fontWeight: 700,
                color: t.textPrimary,
                letterSpacing: -0.3,
                marginTop: 1,
              }}
            >
              {user?.name || "Alex Carter"}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <IconButton t={t} ariaLabel="Toggle theme" onClick={() => setDark((d) => !d)}>
            {dark ? <Sun size={17} strokeWidth={1.75} /> : <Moon size={17} strokeWidth={1.75} />}
          </IconButton>
          <IconButton t={t} ariaLabel="Notifications" badge={unreadCount > 0} onClick={onOpenNotifications}>
            <Bell size={17} strokeWidth={1.75} />
          </IconButton>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ padding: "30px 24px 0" }}>
        <SectionLabel t={t}>Quick actions</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <QuickAction
            t={t}
            icon={<FileUp size={19} strokeWidth={1.75} color={COLORS.iconAmber} />}
            iconBg={COLORS.iconAmberBg}
            title="Upload case file"
            sub="PDF, DOCX, scans"
            onClick={() => goTo("upload")}
          />
          <QuickAction
            t={t}
            icon={<Search size={19} strokeWidth={1.75} color={COLORS.iconPlum} />}
            iconBg={COLORS.iconPlumBg}
            title="Ask CaseMind"
            sub="AI legal research"
            onClick={() => goTo("research")}
          />
          <QuickAction
            t={t}
            icon={<Gavel size={19} strokeWidth={1.75} color={COLORS.iconClay} />}
            iconBg={COLORS.iconClayBg}
            title="Legal codes"
            sub="IPC & BNS sections"
            onClick={() => goTo("legalcodes")}
          />
          <QuickAction
            t={t}
            icon={<MapPin size={19} strokeWidth={1.75} color={COLORS.aiAccent} />}
            iconBg={t.aiPanelBg}
            title="Court locator"
            sub="Courts across India"
            onClick={() => goTo("courtmap")}
          />
        </div>
      </div>

      {/* AI suggestion glow card */}
      <div style={{ padding: "26px 24px 0" }}>
        <div
          className="ai-glow"
          style={{
            borderRadius: 22,
            padding: 22,
            background: dark ? COLORS.aiGradientHeroDark : COLORS.aiGradientHeroLight,
            border: `1px solid ${dark ? "rgba(232,114,74,0.30)" : "rgba(232,114,74,0.16)"}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <AIOrb size={32} />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: 15,
                  color: t.textPrimary,
                  letterSpacing: -0.1,
                }}
              >
                3 filings are waiting on you
              </div>
              <div style={{ fontSize: 13, color: t.textSecondary, marginTop: 6, lineHeight: 1.6 }}>
                Summarizing them now could save roughly 2.5 hours of review time.
              </div>
              <button
                className="btn-primary press-scale"
                onClick={() => goTo("summary")}
                style={{ marginTop: 16 }}
              >
                Review Smith vs State
                <ChevronRight size={15} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div style={{ padding: "32px 24px 110px" }}>
        <SectionLabel t={t}>Recent activity</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {RECENT_CASES.map((c) => (
            <CaseRow
              key={c.id}
              t={t}
              c={c}
              onClick={() => c.id === "c1" && goTo("summary")}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ t, children }) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 0.6,
        textTransform: "uppercase",
        color: t.textFaint,
        marginBottom: 14,
      }}
    >
      {children}
    </div>
  );
}

function QuickAction({ t, icon, iconBg, title, sub, onClick }) {
  return (
    <button
      onClick={onClick}
      className="press-scale"
      style={{
        textAlign: "left",
        borderRadius: 18,
        padding: 18,
        background: t.surface,
        border: `1px solid ${t.border}`,
        boxShadow: t.shadowCard,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 11,
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: t.textPrimary }}>{title}</div>
        <div style={{ fontSize: 11.5, color: t.textSecondary, marginTop: 3 }}>{sub}</div>
      </div>
    </button>
  );
}

function CaseRow({ t, c, onClick }) {
  return (
    <button
      onClick={onClick}
      className="press-scale"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "14px 16px",
        borderRadius: 16,
        background: t.surface,
        border: `1px solid ${t.border}`,
        cursor: onClick ? "pointer" : "default",
        textAlign: "left",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            background: t.surfaceAlt,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Scale size={16} strokeWidth={1.6} color={t.textSecondary} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 13.5,
              fontWeight: 650,
              color: t.textPrimary,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {c.title}
          </div>
          <div
            style={{
              fontSize: 11,
              color: t.textFaint,
              fontFamily: "'JetBrains Mono', monospace",
              marginTop: 3,
            }}
          >
            {c.cnr}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
        <StatusBadge status={c.status} t={t} />
        <div style={{ fontSize: 10.5, color: t.textFaint }}>{c.note}</div>
      </div>
    </button>
  );
}

/* ============================================================
   SCREEN: UPLOAD
   ============================================================ */

function ScreenUpload({ t, dark, goTo }) {
  const [stage, setStage] = useState("idle"); // idle -> selected -> generating
  const [length, setLength] = useState("Medium");
  const [focus, setFocus] = useState(["Key Arguments"]);

  const toggleFocus = (f) =>
    setFocus((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));

  const handleSelectFile = () => setStage("selected");

  const handleGenerate = () => {
    setStage("generating");
    setTimeout(() => goTo("summary"), 1400);
  };

  return (
    <div className="fade-in">
      <ScreenHeader t={t} title="New Case File" onBack={() => goTo("home")} />

      <div style={{ padding: "0 24px" }}>
        {stage === "idle" && (
          <button
            onClick={handleSelectFile}
            className="press-scale"
            style={{
              width: "100%",
              borderRadius: 20,
              border: `1.5px dashed ${t.borderStrong}`,
              background: t.surfaceAlt,
              padding: "42px 20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 17,
                background: t.surface,
                border: `1px solid ${t.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UploadIcon size={22} strokeWidth={1.6} color={t.textPrimary} />
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: t.textPrimary }}>
                Drop your legal brief here
              </div>
              <div style={{ fontSize: 12.5, color: t.textSecondary, marginTop: 5 }}>
                or tap to browse · PDF, DOCX, scanned images
              </div>
            </div>
          </button>
        )}

        {stage !== "idle" && (
          <div
            className="scale-in"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: 16,
              borderRadius: 17,
              background: t.surface,
              border: `1px solid ${t.border}`,
              boxShadow: t.shadowCard,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 13,
                background: COLORS.iconClayBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <FileText size={19} strokeWidth={1.6} color={COLORS.iconClay} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: 13.5,
                  fontWeight: 650,
                  color: t.textPrimary,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Smith_vs_State_2026.pdf
              </div>
              <div style={{ fontSize: 11.5, color: t.textFaint, marginTop: 3 }}>
                14.2 MB · 148 pages
              </div>
            </div>
            <CheckCircle2 size={18} color={COLORS.success} strokeWidth={2} />
          </div>
        )}

        {stage !== "idle" && (
          <div className="fade-in" style={{ marginTop: 30 }}>
            <SectionLabel t={t}>Summary length</SectionLabel>
            <div style={{ display: "flex", gap: 10 }}>
              {["Short", "Medium", "Detailed"].map((l) => (
                <Chip key={l} t={t} active={length === l} onClick={() => setLength(l)}>
                  {l}
                </Chip>
              ))}
            </div>

            <div style={{ marginTop: 26 }}>
              <SectionLabel t={t}>Focus area</SectionLabel>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {["Key Arguments", "Judgment", "Legal Risks", "Timeline"].map((f) => (
                  <Chip key={f} t={t} active={focus.includes(f)} onClick={() => toggleFocus(f)}>
                    {f}
                  </Chip>
                ))}
              </div>
            </div>

            <div
              className="ai-glow"
              style={{
                marginTop: 26,
                borderRadius: 17,
                padding: 18,
                background: t.aiPanelBg,
                borderLeft: `3px solid ${COLORS.aiAccent}`,
              }}
            >
              <div style={{ display: "flex", gap: 12 }}>
                <AIOrb size={26} />
                <div style={{ fontSize: 12.5, color: t.textPrimary, lineHeight: 1.6 }}>
                  <strong>Detected:</strong> criminal matter involving alleged financial
                  fraud, Supreme Court bench. Summary will prioritize evidentiary findings
                  and precedent citations.
                </div>
              </div>
            </div>

            <button
              className="btn-primary press-scale"
              onClick={handleGenerate}
              disabled={stage === "generating"}
              style={{ width: "100%", justifyContent: "center", marginTop: 28, marginBottom: 34 }}
            >
              {stage === "generating" ? (
                <>
                  <span className="spinner" /> Generating summary…
                </>
              ) : (
                <>
                  <Sparkles size={15} strokeWidth={2} /> Generate Summary
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({ t, active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="press-scale"
      style={{
        padding: "9px 16px",
        borderRadius: 999,
        fontSize: 12.5,
        fontWeight: 650,
        cursor: "pointer",
        border: active ? `1px solid ${t.textPrimary}` : `1px solid ${t.border}`,
        background: active ? t.textPrimary : t.surface,
        color: active ? t.pageBg : t.textSecondary,
      }}
    >
      {children}
    </button>
  );
}

/* ============================================================
   SCREEN: AI SUMMARY
   ============================================================ */

function ScreenSummary({ t, dark, goTo, askFollowUp }) {
  return (
    <div className="fade-in">
      <ScreenHeader
        t={t}
        title="AI Summary"
        onBack={() => goTo("home")}
        right={
          <IconButton t={t} ariaLabel="More options">
            <MoreVertical size={17} strokeWidth={1.75} />
          </IconButton>
        }
      />

      <div style={{ padding: "0 24px 110px" }}>
        <div
          style={{
            borderRadius: 20,
            padding: 20,
            background: `linear-gradient(150deg, ${COLORS.primary950}, ${COLORS.primary900})`,
            color: "#fff",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: 17,
                letterSpacing: -0.3,
              }}
            >
              Smith vs State, 2026
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#D8C3B0", fontSize: 11.5, flexShrink: 0 }}>
              <Clock size={12.5} strokeWidth={2} /> 6 min read
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
            <Pill t={{ surfaceAlt: "rgba(255,255,255,0.12)", textSecondary: "#F2EFE9", border: "transparent" }}>
              Supreme Court
            </Pill>
            <Pill t={{ surfaceAlt: "rgba(255,255,255,0.12)", textSecondary: "#F2EFE9", border: "transparent" }}>
              Criminal Law
            </Pill>
            <Pill t={{ surfaceAlt: "rgba(255,255,255,0.12)", textSecondary: "#F2EFE9", border: "transparent" }} mono>
              148 pages
            </Pill>
          </div>
        </div>

        <div style={{ marginTop: 32 }}>
          <SectionLabel t={t}>Key points</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              "Defendant is accused of second-degree fraud involving structured financial instruments.",
              "Evidence includes digital transaction records and two witness depositions.",
              "The court found probable cause sufficient to proceed to trial.",
            ].map((point, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 12,
                  padding: 14,
                  borderRadius: 15,
                  background: t.surface,
                  border: `1px solid ${t.border}`,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 8,
                    background: t.aiPanelBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Sparkles size={12} color={COLORS.aiAccent} strokeWidth={2} />
                </div>
                <div style={{ fontSize: 13, color: t.textPrimary, lineHeight: 1.6 }}>{point}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 32 }}>
          <SectionLabel t={t}>Legal analysis</SectionLabel>
          <div
            className="ai-glow"
            style={{
              borderRadius: 17,
              padding: 18,
              background: t.aiPanelBg,
              borderLeft: `3px solid ${COLORS.aiAccent}`,
              fontSize: 13,
              lineHeight: 1.65,
              color: t.textPrimary,
            }}
          >
            The case leans heavily on precedent from contract-law principles set in 2019.
            The prosecution's argument centers on intent to deceive — a standard that may be
            difficult to establish beyond reasonable doubt given the circumstantial nature of
            the digital evidence presented so far.
          </div>
        </div>

        <div style={{ marginTop: 32 }}>
          <SectionLabel t={t}>Risk &amp; outcome analysis</SectionLabel>
          <div
            style={{
              borderRadius: 17,
              padding: 18,
              background: t.surface,
              border: `1px solid ${t.border}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: "rgba(245,158,11,0.14)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={15} color={COLORS.gold600} strokeWidth={1.8} />
              </div>
              <div style={{ fontSize: 13, color: t.textPrimary, lineHeight: 1.6 }}>
                <strong>65%</strong> likelihood of appeal, driven by procedural gaps in
                evidence handling.
              </div>
            </div>
            <div
              style={{
                marginTop: 16,
                height: 7,
                borderRadius: 999,
                background: t.surfaceAlt,
                overflow: "hidden",
              }}
            >
              <div
                className="bar-grow"
                style={{
                  width: "65%",
                  height: "100%",
                  borderRadius: 999,
                  background: `linear-gradient(90deg, ${COLORS.gold500}, ${COLORS.error})`,
                }}
              />
            </div>
          </div>
        </div>

        <button
          className="btn-secondary press-scale"
          onClick={() =>
            askFollowUp(
              "What precedents support the prosecution's intent-to-deceive argument in Smith vs State?"
            )
          }
          style={{ width: "100%", justifyContent: "center", marginTop: 32 }}
        >
          <MessageSquarePlus size={15} strokeWidth={2} /> Ask a follow-up question
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   SCREEN: RESEARCH (AI Chat)
   ============================================================ */

function CANNED_REPLY(question) {
  return {
    text:
      "Courts have generally required more than financial irregularity alone to prove intent to deceive — a pattern of concealment or false representation typically needs to be shown. Two precedents are directly relevant here.",
    citations: [
      "State of Maharashtra v. Doshi, 2019",
      "R.K. Dalmia v. Delhi Admin., 1962",
    ],
  };
}

function ScreenResearch({ t, dark, goTo, messages, setMessages, isTyping, setIsTyping }) {
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const send = (text) => {
    const q = (text ?? input).trim();
    if (!q) return;
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      const reply = CANNED_REPLY(q);
      setMessages((prev) => [...prev, { role: "ai", ...reply }]);
      setIsTyping(false);
    }, 1300);
  };

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <ScreenHeader
        t={t}
        title="CaseMind Research"
        onBack={() => goTo("home")}
        right={<AIOrb size={26} />}
      />

      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "0 24px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {messages.length === 0 && (
          <div style={{ marginTop: 8 }}>
            <div
              style={{
                borderRadius: 17,
                padding: 18,
                background: t.aiPanelBg,
                borderLeft: `3px solid ${COLORS.aiAccent}`,
                fontSize: 13,
                color: t.textPrimary,
                lineHeight: 1.6,
              }}
            >
              Ask about precedents, sections, or judgments in natural language — I'll
              search across Supreme Court, High Court, and tribunal records.
            </div>
            <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
              {SUGGESTED_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="press-scale"
                  style={{
                    textAlign: "left",
                    padding: "13px 15px",
                    borderRadius: 14,
                    border: `1px solid ${t.border}`,
                    background: t.surface,
                    color: t.textPrimary,
                    fontSize: 12.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    cursor: "pointer",
                  }}
                >
                  {p}
                  <ChevronRight size={14} color={t.textFaint} style={{ flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} style={{ display: "flex", justifyContent: "flex-end" }} className="slide-up">
              <div
                style={{
                  maxWidth: "82%",
                  padding: "10px 14px",
                  borderRadius: "16px 16px 4px 16px",
                  background: COLORS.primary600,
                  color: "#fff",
                  fontSize: 13.5,
                  lineHeight: 1.5,
                }}
              >
                {m.text}
              </div>
            </div>
          ) : (
            <div key={i} style={{ display: "flex", gap: 9 }} className="slide-up">
              <AIOrb size={26} />
              <div
                style={{
                  maxWidth: "84%",
                  padding: 13,
                  borderRadius: "4px 16px 16px 16px",
                  background: t.aiPanelBg,
                  borderLeft: `3px solid ${COLORS.aiAccent}`,
                }}
              >
                <div style={{ fontSize: 13.5, color: t.textPrimary, lineHeight: 1.55 }}>{m.text}</div>
                {m.citations && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                    {m.citations.map((c) => (
                      <Pill key={c} t={t} tone="primary" mono>
                        {c}
                      </Pill>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        )}

        {isTyping && (
          <div style={{ display: "flex", gap: 9 }} className="fade-in">
            <AIOrb size={26} spinning />
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "4px 16px 16px 16px",
                background: t.aiPanelBg,
                display: "flex",
                gap: 4,
                alignItems: "center",
              }}
            >
              <span className="typing-dot" style={{ animationDelay: "0ms" }} />
              <span className="typing-dot" style={{ animationDelay: "150ms" }} />
              <span className="typing-dot" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div style={{ height: 8 }} />
      </div>

      <div
        style={{
          padding: "10px 16px",
          borderTop: `1px solid ${t.border}`,
          background: t.surface,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 12px",
            borderRadius: 999,
            background: t.surfaceAlt,
            border: `1px solid ${t.border}`,
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask a legal question…"
            aria-label="Ask CaseMind a legal question"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 13.5,
              color: t.textPrimary,
              fontFamily: "'Inter', sans-serif",
            }}
          />
          <Mic size={16} color={t.textFaint} strokeWidth={1.75} />
        </div>
        <button
          aria-label="Send question"
          onClick={() => send()}
          className="press-scale"
          style={{
            width: 40,
            height: 40,
            borderRadius: 999,
            border: "none",
            background: input.trim() ? COLORS.primary600 : t.surfaceAlt,
            color: input.trim() ? "#fff" : t.textFaint,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <Send size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   SCREEN: LEGAL CODES (IPC / BNS browser)
   ============================================================ */

function LegalCodeCard({ t, entry, expanded, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="press-scale"
      style={{
        width: "100%",
        textAlign: "left",
        borderRadius: 16,
        border: `1px solid ${t.border}`,
        background: t.surface,
        padding: 14,
        cursor: "pointer",
        display: "block",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            minWidth: 42,
            height: 32,
            borderRadius: 9,
            background: t.surfaceAlt,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            fontWeight: 700,
            color: t.textPrimary,
            padding: "0 8px",
            flexShrink: 0,
          }}
        >
          §{entry.section}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: t.textPrimary }}>{entry.title}</div>
          <div style={{ fontSize: 11, color: t.textFaint, marginTop: 2 }}>{entry.chapter}</div>
        </div>
        <ChevronDown
          size={16}
          color={t.textFaint}
          style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 180ms ease", flexShrink: 0 }}
        />
      </div>
      {expanded && (
        <div className="fade-in" style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${t.border}` }}>
          <div style={{ fontSize: 12.5, color: t.textSecondary, lineHeight: 1.6 }}>{entry.description}</div>
          <div
            style={{
              marginTop: 10,
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              padding: 10,
              borderRadius: 11,
              background: t.aiPanelBg,
            }}
          >
            <Gavel size={13} color={COLORS.aiAccent} strokeWidth={1.8} style={{ marginTop: 1, flexShrink: 0 }} />
            <div style={{ fontSize: 11.5, color: t.textPrimary, lineHeight: 1.5 }}>
              <strong>Punishment: </strong>
              {entry.punishment}
            </div>
          </div>
        </div>
      )}
    </button>
  );
}

function ScreenLegalCodes({ t, dark, goTo }) {
  const [code, setCode] = useState("bns"); // bns | ipc
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const entries = LEGAL_CODES[code].filter((e) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      e.section.toLowerCase().includes(q) ||
      e.title.toLowerCase().includes(q) ||
      e.chapter.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fade-in">
      <ScreenHeader t={t} title="Legal Codes" onBack={() => goTo("home")} />
      <div style={{ padding: "0 24px 110px" }}>
        <div
          style={{
            display: "flex",
            padding: 4,
            borderRadius: 13,
            background: t.surfaceAlt,
            border: `1px solid ${t.border}`,
            marginBottom: 16,
          }}
        >
          {[
            { key: "bns", label: "BNS (from 2024)" },
            { key: "ipc", label: "IPC (till 2024)" },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => {
                setCode(opt.key);
                setExpandedId(null);
              }}
              className="press-scale"
              style={{
                flex: 1,
                padding: "10px 0",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "'Inter', sans-serif",
                background: code === opt.key ? t.surface : "transparent",
                color: code === opt.key ? t.textPrimary : t.textSecondary,
                boxShadow: code === opt.key ? t.shadowCard : "none",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            borderRadius: 999,
            background: t.surfaceAlt,
            border: `1px solid ${t.border}`,
            marginBottom: 18,
          }}
        >
          <Search size={15} color={t.textFaint} strokeWidth={1.75} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search section, offence, or chapter…"
            aria-label="Search legal codes"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 13,
              color: t.textPrimary,
              fontFamily: "'Inter', sans-serif",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "flex-start",
            padding: 12,
            borderRadius: 13,
            background: t.aiPanelBg,
            marginBottom: 18,
          }}
        >
          <BookOpen size={14} color={COLORS.aiAccent} strokeWidth={1.8} style={{ marginTop: 1, flexShrink: 0 }} />
          <div style={{ fontSize: 11.5, color: t.textPrimary, lineHeight: 1.55 }}>
            The Bharatiya Nyaya Sanhita replaced the IPC on 1 July 2024. Use{" "}
            <strong>BNS</strong> for new matters and <strong>IPC</strong> for offences committed before that date.
            This is a sample set — upload the full bare-act PDF to load every section.
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {entries.map((entry) => (
            <LegalCodeCard
              key={entry.section}
              t={t}
              entry={entry}
              expanded={expandedId === entry.section}
              onToggle={() => setExpandedId((id) => (id === entry.section ? null : entry.section))}
            />
          ))}
          {entries.length === 0 && (
            <div style={{ textAlign: "center", padding: 30, fontSize: 12.5, color: t.textFaint }}>
              No sections match "{query}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SCREEN: COURT MAP (India — Supreme / High / District courts)
   Rendered as a lightweight custom SVG projection instead of a tile
   map, since react-leaflet / leaflet aren't available in this
   environment's sandbox. Illustrative, not survey-accurate.
   ============================================================ */

function CourtMapControls({ scale, setScale, onReset, t }) {
  return (
    <div style={{ position: "absolute", right: 14, bottom: 150, display: "flex", flexDirection: "column", gap: 8, zIndex: 20 }}>
      <button
        aria-label="Zoom in"
        onClick={() => setScale((s) => Math.min(s + 0.35, 3))}
        className="press-scale"
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          border: `1px solid ${t.border}`,
          background: t.surface,
          boxShadow: t.shadowCard,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: t.textPrimary,
        }}
      >
        <ZoomIn size={16} strokeWidth={1.9} />
      </button>
      <button
        aria-label="Zoom out"
        onClick={() => setScale((s) => Math.max(s - 0.35, 1))}
        className="press-scale"
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          border: `1px solid ${t.border}`,
          background: t.surface,
          boxShadow: t.shadowCard,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: t.textPrimary,
        }}
      >
        <ZoomOut size={16} strokeWidth={1.9} />
      </button>
      <button
        aria-label="Reset view"
        onClick={onReset}
        className="press-scale"
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          border: "none",
          background: COLORS.aiAccent,
          boxShadow: "0 8px 18px rgba(232,114,74,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "#fff",
        }}
      >
        <LocateFixed size={16} strokeWidth={2} />
      </button>
    </div>
  );
}

function ScreenCourtMap({ t, dark, goTo }) {
  const [filter, setFilter] = useState("all"); // all | supreme | high | district
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [scale, setScale] = useState(1);

  const filtered = COURTS.filter((c) => {
    if (filter !== "all" && c.type !== filter) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q);
  });

  const vbW = 400 / scale;
  const vbH = 460 / scale;
  const vbX = (400 - vbW) / 2;
  const vbY = (460 - vbH) / 2;

  return (
    <div className="fade-in" style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 20, padding: "18px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <button
            aria-label="Go back"
            onClick={() => goTo("home")}
            className="press-scale"
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              border: `1px solid ${t.border}`,
              background: t.surface,
              boxShadow: t.shadowCard,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: t.textPrimary,
              flexShrink: 0,
            }}
          >
            <ArrowLeft size={17} strokeWidth={1.75} />
          </button>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              borderRadius: 999,
              background: t.surface,
              border: `1px solid ${t.border}`,
              boxShadow: t.shadowCard,
            }}
          >
            <Search size={15} color={t.textFaint} strokeWidth={1.75} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courts or city…"
              aria-label="Search courts"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: 13,
                color: t.textPrimary,
                fontFamily: "'Inter', sans-serif",
              }}
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
          {[
            { key: "all", label: "All courts" },
            { key: "supreme", label: "Supreme Court" },
            { key: "high", label: "High Courts" },
            { key: "district", label: "District / Local" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="press-scale"
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                fontSize: 11.5,
                fontWeight: 650,
                whiteSpace: "nowrap",
                cursor: "pointer",
                border: filter === f.key ? `1px solid ${t.textPrimary}` : `1px solid ${t.border}`,
                background: filter === f.key ? t.textPrimary : t.surface,
                color: filter === f.key ? t.pageBg : t.textSecondary,
                boxShadow: t.shadowCard,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, position: "relative", background: t.surfaceAlt, overflow: "hidden" }}>
        <svg
          viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
          width="100%"
          height="100%"
          style={{ display: "block", transition: "all 220ms ease" }}
        >
          {/* subtle grid backdrop */}
          <defs>
            <pattern id="mapGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke={t.border} strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="400" height="460" fill="url(#mapGrid)" />

          {/* Actual India outline, projected from real state-boundary geodata */}
          <path
            d={INDIA_MAIN_PATH}
            fill={dark ? "rgba(232,114,74,0.07)" : "rgba(23,23,22,0.05)"}
            stroke={dark ? "rgba(232,114,74,0.32)" : "rgba(23,23,22,0.22)"}
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          {INDIA_ISLAND_PATHS.map((d, i) => (
            <path
              key={i}
              d={d}
              fill={dark ? "rgba(232,114,74,0.07)" : "rgba(23,23,22,0.05)"}
              stroke={dark ? "rgba(232,114,74,0.32)" : "rgba(23,23,22,0.22)"}
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          ))}

          {filtered.map((c) => {
            const { x, y } = project(c.lat, c.lng);
            const meta = COURT_TYPE_META[c.type];
            const isSel = selected?.id === c.id;
            const r = isSel ? 8 : c.type === "supreme" ? 6.5 : c.type === "high" ? 5 : 4;
            return (
              <g key={c.id} onClick={() => setSelected(c)} style={{ cursor: "pointer" }}>
                {isSel && (
                  <circle cx={x} cy={y} r={r + 6} fill={meta.color} opacity="0.18" />
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={r}
                  fill={meta.color}
                  stroke="#fff"
                  strokeWidth={isSel ? 2.5 : 1.5}
                />
              </g>
            );
          })}
        </svg>
        <CourtMapControls scale={scale} setScale={setScale} onReset={() => setScale(1)} t={t} />

        {/* legend */}
        <div
          style={{
            position: "absolute",
            left: 14,
            bottom: 150,
            display: "flex",
            flexDirection: "column",
            gap: 6,
            padding: "10px 12px",
            borderRadius: 13,
            background: t.surface,
            border: `1px solid ${t.border}`,
            boxShadow: t.shadowCard,
          }}
        >
          {Object.entries(COURT_TYPE_META).map(([key, meta]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: meta.color, display: "inline-block" }} />
              <span style={{ fontSize: 10.5, color: t.textSecondary, fontWeight: 600 }}>{meta.label}</span>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div
          className="sheet-up"
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            bottom: 96,
            borderRadius: 18,
            background: t.surface,
            border: `1px solid ${t.border}`,
            boxShadow: t.shadowRaised,
            padding: 16,
            zIndex: 25,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                background: `${COURT_TYPE_META[selected.type].color}1A`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Landmark size={17} color={COURT_TYPE_META[selected.type].color} strokeWidth={1.75} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: t.textPrimary }}>{selected.name}</div>
              <div style={{ fontSize: 11.5, color: t.textSecondary, marginTop: 2 }}>
                {COURT_TYPE_META[selected.type].label} · {selected.city}
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              aria-label="Close"
              className="press-scale"
              style={{ border: "none", background: t.surfaceAlt, borderRadius: 10, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", color: t.textFaint, cursor: "pointer", flexShrink: 0 }}
            >
              <X size={13} />
            </button>
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${selected.lat},${selected.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary press-scale"
            style={{ width: "100%", justifyContent: "center", marginTop: 14, textDecoration: "none" }}
          >
            <MapPin size={15} strokeWidth={2} /> Get directions
          </a>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   SETTINGS PANELS (Notifications / Language / Security)
   ============================================================ */

function ToggleSwitch({ t, on, onClick, ariaLabel }) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="press-scale"
      style={{
        width: 46,
        height: 26,
        borderRadius: 999,
        border: "none",
        background: on ? COLORS.primary600 : t.borderStrong,
        position: "relative",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: on ? 23 : 3,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 180ms ease",
        }}
      />
    </button>
  );
}

function SettingsSheet({ t, title, onClose, children }) {
  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.32)", zIndex: 42 }}
        className="fade-in"
      />
      <div
        className="sheet-up"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          maxHeight: "80%",
          borderRadius: "22px 22px 0 0",
          background: t.surface,
          border: `1px solid ${t.border}`,
          borderBottom: "none",
          boxShadow: t.shadowRaised,
          zIndex: 43,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: `1px solid ${t.border}`,
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, color: t.textPrimary }}>{title}</div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="press-scale"
            style={{ border: "none", background: t.surfaceAlt, borderRadius: 10, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", color: t.textFaint, cursor: "pointer" }}
          >
            <X size={15} />
          </button>
        </div>
        <div style={{ padding: 20, overflowY: "auto" }}>{children}</div>
      </div>
    </>
  );
}

function SettingsRow({ t, icon: Icon, label, sub, right }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "13px 0",
        borderBottom: `1px solid ${t.border}`,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          background: t.surfaceAlt,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={15} color={t.textSecondary} strokeWidth={1.75} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 650, color: t.textPrimary }}>{label}</div>
        {sub && <div style={{ fontSize: 11.5, color: t.textSecondary, marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

function NotificationSettingsBody({ t, prefs, setPrefs }) {
  const rows = [
    { key: "push", icon: BellRing, label: "Push notifications", sub: "Alerts on this device" },
    { key: "email", icon: Mail, label: "Email alerts", sub: "Summaries and case updates" },
    { key: "hearings", icon: Gavel, label: "Hearing reminders", sub: "24 hours before a hearing" },
    { key: "research", icon: Sparkles, label: "AI research replies", sub: "When CaseMind finishes a query" },
  ];
  return (
    <div>
      {rows.map((r) => (
        <SettingsRow
          key={r.key}
          t={t}
          icon={r.icon}
          label={r.label}
          sub={r.sub}
          right={
            <ToggleSwitch
              t={t}
              on={prefs[r.key]}
              ariaLabel={`Toggle ${r.label}`}
              onClick={() => setPrefs((p) => ({ ...p, [r.key]: !p[r.key] }))}
            />
          }
        />
      ))}
    </div>
  );
}

function LanguageSettingsBody({ t, language, setLanguage, onClose }) {
  return (
    <div>
      {LANGUAGES.map((lang) => (
        <button
          key={lang}
          onClick={() => {
            setLanguage(lang);
            onClose();
          }}
          className="press-scale"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "13px 4px",
            borderBottom: `1px solid ${t.border}`,
            border: "none",
            borderBottomWidth: 1,
            background: "transparent",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <span style={{ fontSize: 13.5, fontWeight: 600, color: t.textPrimary }}>{lang}</span>
          {language === lang && <Check size={16} color={t.textPrimary} strokeWidth={2.2} />}
        </button>
      ))}
    </div>
  );
}

function SecuritySettingsBody({ t, security, setSecurity }) {
  return (
    <div>
      <SettingsRow
        t={t}
        icon={Fingerprint}
        label="Biometric login"
        sub="Use Face ID or fingerprint to unlock"
        right={
          <ToggleSwitch
            t={t}
            on={security.biometric}
            ariaLabel="Toggle biometric login"
            onClick={() => setSecurity((s) => ({ ...s, biometric: !s.biometric }))}
          />
        }
      />
      <SettingsRow
        t={t}
        icon={ShieldCheck}
        label="Two-factor authentication"
        sub="Extra verification at sign-in"
        right={
          <ToggleSwitch
            t={t}
            on={security.twoFactor}
            ariaLabel="Toggle two-factor authentication"
            onClick={() => setSecurity((s) => ({ ...s, twoFactor: !s.twoFactor }))}
          />
        }
      />
      <div style={{ paddingTop: 16 }}>
        <button
          className="btn-secondary press-scale"
          style={{ width: "100%", justifyContent: "center" }}
        >
          <KeyRound size={15} strokeWidth={2} /> Change password
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   SCREEN: PROFILE
   ============================================================ */

function ScreenProfile({ t, dark, setDark, user, language, setLanguage, notifPrefs, setNotifPrefs, security, setSecurity, onLogout }) {
  const [openPanel, setOpenPanel] = useState(null); // null | 'notifications' | 'language' | 'security'
  const initials = (user?.name || "Alex Carter")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="fade-in" style={{ position: "relative", height: "100%" }}>
      <ScreenHeader t={t} title="Profile" />
      <div style={{ padding: "0 20px 100px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 13,
            padding: 16,
            borderRadius: 18,
            background: t.surface,
            border: `1px solid ${t.border}`,
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 15,
              background: `linear-gradient(135deg, ${COLORS.primary600}, ${COLORS.primary900})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: 17,
            }}
          >
            {initials}
          </div>
          <div>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15.5, color: t.textPrimary }}>
              {user?.name || "Alex Carter"}
            </div>
            <div style={{ fontSize: 12.5, color: t.textSecondary, marginTop: 1 }}>
              Senior Associate · Litigation
            </div>
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          <SectionLabel t={t}>Preferences</SectionLabel>
          <div
            style={{
              marginTop: 10,
              borderRadius: 16,
              background: t.surface,
              border: `1px solid ${t.border}`,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "13px 15px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {dark ? <Moon size={16} color={t.textSecondary} /> : <Sun size={16} color={t.textSecondary} />}
                <span style={{ fontSize: 13.5, color: t.textPrimary, fontWeight: 550 }}>Appearance</span>
              </div>
              <ToggleSwitch t={t} on={dark} ariaLabel="Toggle appearance" onClick={() => setDark((d) => !d)} />
            </div>

            <button
              onClick={() => setOpenPanel("notifications")}
              className="press-scale"
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "13px 15px",
                borderTop: `1px solid ${t.border}`,
                border: "none",
                borderTopWidth: 1,
                background: "transparent",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: 13.5, color: t.textPrimary, fontWeight: 550 }}>Notifications</span>
              <ChevronRight size={15} color={t.textFaint} />
            </button>

            <button
              onClick={() => setOpenPanel("language")}
              className="press-scale"
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "13px 15px",
                borderTop: `1px solid ${t.border}`,
                border: "none",
                borderTopWidth: 1,
                background: "transparent",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: 13.5, color: t.textPrimary, fontWeight: 550 }}>Language — {language}</span>
              <ChevronRight size={15} color={t.textFaint} />
            </button>

            <button
              onClick={() => setOpenPanel("security")}
              className="press-scale"
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "13px 15px",
                borderTop: `1px solid ${t.border}`,
                border: "none",
                borderTopWidth: 1,
                background: "transparent",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: 13.5, color: t.textPrimary, fontWeight: 550 }}>Security</span>
              <ChevronRight size={15} color={t.textFaint} />
            </button>
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          <SectionLabel t={t}>About CaseMind</SectionLabel>
          <div
            style={{
              marginTop: 10,
              borderRadius: 16,
              padding: 14,
              background: t.surface,
              border: `1px solid ${t.border}`,
              fontSize: 12.5,
              color: t.textSecondary,
              lineHeight: 1.6,
            }}
          >
            AI-powered legal intelligence for the Indian judiciary — document
            understanding, semantic research, and case workflow in one place.
          </div>
        </div>

        <button
          onClick={onLogout}
          className="press-scale"
          style={{
            width: "100%",
            marginTop: 22,
            padding: "13px 0",
            borderRadius: 14,
            border: `1px solid ${t.border}`,
            background: t.surface,
            color: COLORS.error,
            fontSize: 13.5,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Log out
        </button>
      </div>

      {openPanel === "notifications" && (
        <SettingsSheet t={t} title="Notifications" onClose={() => setOpenPanel(null)}>
          <NotificationSettingsBody t={t} prefs={notifPrefs} setPrefs={setNotifPrefs} />
        </SettingsSheet>
      )}
      {openPanel === "language" && (
        <SettingsSheet t={t} title="Language" onClose={() => setOpenPanel(null)}>
          <LanguageSettingsBody t={t} language={language} setLanguage={setLanguage} onClose={() => setOpenPanel(null)} />
        </SettingsSheet>
      )}
      {openPanel === "security" && (
        <SettingsSheet t={t} title="Security" onClose={() => setOpenPanel(null)}>
          <SecuritySettingsBody t={t} security={security} setSecurity={setSecurity} />
        </SettingsSheet>
      )}
    </div>
  );
}

/* ============================================================
   BOTTOM NAV
   ============================================================ */

function BottomNav({ t, screen, goTo }) {
  const items = [
    { key: "home", label: "Home", icon: Home },
    { key: "upload", label: "Upload", icon: UploadIcon },
    { key: "research", label: "Research", icon: Sparkles },
    { key: "profile", label: "Profile", icon: User },
  ];
  return (
    <div
      style={{
        position: "absolute",
        left: 16,
        right: 16,
        bottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
        padding: "10px 10px",
        background: t.navBg,
        borderRadius: 999,
        boxShadow: "0 12px 28px rgba(0,0,0,0.28)",
        display: "flex",
        justifyContent: "space-around",
      }}
    >
      {items.map(({ key, label, icon: Icon }) => {
        const active = screen === key;
        return (
          <button
            key={key}
            onClick={() => goTo(key)}
            aria-label={label}
            className="press-scale"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              border: "none",
              background: active ? "rgba(255,255,255,0.12)" : "transparent",
              borderRadius: 14,
              cursor: "pointer",
              color: active ? "#FBD6B0" : "rgba(242,239,233,0.45)",
              minWidth: 48,
              minHeight: 44,
              justifyContent: "center",
              padding: "4px 2px",
            }}
          >
            <Icon size={19} strokeWidth={active ? 2.1 : 1.7} />
            <span style={{ fontSize: 9.5, fontWeight: active ? 700 : 500 }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================
   ROOT APP
   ============================================================ */

export default function CaseMindApp() {
  const [dark, setDark] = useState(true);
  const [stage, setStage] = useState("splash"); // splash -> auth -> app
  const [screen, setScreen] = useState("home");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [user, setUser] = useState(null);

  const [notifications, setNotifications] = useState(NOTIFICATIONS_SEED);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState({ push: true, email: true, hearings: true, research: false });
  const [language, setLanguage] = useState("English");
  const [security, setSecurity] = useState({ biometric: false, twoFactor: false });

  const t = useTheme(dark);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const timer = setTimeout(() => {
      setStage((s) => (s === "splash" ? "auth" : s));
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const goTo = useCallback((s) => {
    setScreen(s);
  }, []);

  const handleAuthenticated = (u) => {
    setUser(u);
    setStage("app");
  };

  const handleLogout = () => {
    setUser(null);
    setScreen("home");
    setStage("auth");
  };

  const askFollowUp = (question) => {
    setScreen("research");
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "ai", ...CANNED_REPLY(question) }]);
      setIsTyping(false);
    }, 1300);
  };

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const dismissNotification = (id) => setNotifications((prev) => prev.filter((n) => n.id !== id));

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: dark
          ? "radial-gradient(120% 100% at 50% 0%, #1A1917 0%, #080808 60%)"
          : "radial-gradient(120% 100% at 50% 0%, #F6F1E4 0%, #E9E0CB 60%)",
        fontFamily: "'Inter', sans-serif",
        padding: "24px 12px",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');

        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 0; height: 0; }

        .press-scale { transition: transform 120ms ease, opacity 120ms ease; }
        .press-scale:active { transform: scale(0.96); opacity: 0.9; }

        .fade-in { animation: fadeIn 260ms ease-out; }
        .scale-in { animation: scaleIn 220ms cubic-bezier(0.175,0.885,0.32,1.275); }
        .slide-up { animation: slideUp 260ms ease-out; }
        .sheet-up { animation: sheetUp 260ms cubic-bezier(0.175,0.885,0.32,1.275); }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes sheetUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

        .orb-spin { animation: orbSpin 2.4s linear infinite; }
        @keyframes orbSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .splash-emblem { animation: splashPop 700ms cubic-bezier(0.175,0.885,0.32,1.275); }
        @keyframes splashPop { from { opacity: 0; transform: scale(0.85) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }

        .bar-grow { animation: barGrow 700ms cubic-bezier(0.4,0,0.2,1) both; }
        @keyframes barGrow { from { width: 0%; } }

        .typing-dot {
          width: 6px; height: 6px; border-radius: 999px;
          background: ${COLORS.aiAccent};
          animation: typingBounce 1s ease-in-out infinite;
        }
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-4px); opacity: 1; }
        }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 12px 18px; border-radius: 13px; border: none;
          background: linear-gradient(135deg, ${COLORS.primary600}, ${COLORS.primary700});
          color: #fff; font-size: 13.5px; font-weight: 700; cursor: pointer;
          font-family: 'Inter', sans-serif;
          box-shadow: 0 8px 20px rgba(0,0,0,0.22);
        }
        .btn-primary:disabled { opacity: 0.75; cursor: default; }

        .btn-secondary {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 12px 18px; border-radius: 13px;
          border: 1px solid ${t.border};
          background: ${t.surface}; color: ${t.textPrimary};
          font-size: 13.5px; font-weight: 700; cursor: pointer;
          font-family: 'Inter', sans-serif;
        }

        .spinner {
          width: 13px; height: 13px; border-radius: 999px;
          border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff;
          animation: spin 700ms linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        input::placeholder { color: ${t.textFaint}; }
      `}</style>

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 412,
          height: 860,
          maxHeight: "92vh",
          background: t.pageBg,
          borderRadius: 34,
          overflow: "hidden",
          boxShadow: t.shadowRaised,
          border: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(17,24,39,0.06)"}`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {stage === "splash" && <ScreenSplash dark={dark} />}

        {stage === "auth" && (
          <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", position: "relative" }}>
            <ScreenAuth t={t} dark={dark} onAuthenticated={handleAuthenticated} />
          </div>
        )}

        {stage === "app" && (
          <>
            <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", position: "relative" }}>
              {screen === "home" && (
                <ScreenHome
                  t={t}
                  dark={dark}
                  setDark={setDark}
                  goTo={goTo}
                  user={user}
                  unreadCount={unreadCount}
                  onOpenNotifications={() => setShowNotifPanel(true)}
                />
              )}
              {screen === "upload" && <ScreenUpload t={t} dark={dark} goTo={goTo} />}
              {screen === "summary" && (
                <ScreenSummary t={t} dark={dark} goTo={goTo} askFollowUp={askFollowUp} />
              )}
              {screen === "research" && (
                <ScreenResearch
                  t={t}
                  dark={dark}
                  goTo={goTo}
                  messages={messages}
                  setMessages={setMessages}
                  isTyping={isTyping}
                  setIsTyping={setIsTyping}
                />
              )}
              {screen === "legalcodes" && <ScreenLegalCodes t={t} dark={dark} goTo={goTo} />}
              {screen === "courtmap" && <ScreenCourtMap t={t} dark={dark} goTo={goTo} />}
              {screen === "profile" && (
                <ScreenProfile
                  t={t}
                  dark={dark}
                  setDark={setDark}
                  user={user}
                  language={language}
                  setLanguage={setLanguage}
                  notifPrefs={notifPrefs}
                  setNotifPrefs={setNotifPrefs}
                  security={security}
                  setSecurity={setSecurity}
                  onLogout={handleLogout}
                />
              )}

              {showNotifPanel && (
                <NotificationsPanel
                  t={t}
                  notifications={notifications}
                  onMarkAllRead={markAllRead}
                  onDismiss={dismissNotification}
                  onClose={() => setShowNotifPanel(false)}
                />
              )}
            </div>
            <BottomNav t={t} screen={screen} goTo={goTo} />
          </>
        )}
      </div>
    </div>
  );
}