/**
 * Frontend size conversion utilities.
 * Converts canonical sizes (alpha for clothing, EU for shoes) to
 * the user's selected display system (EU, UK, US).
 */

const ALPHA_SORT_ORDER = [
  "XXS", "XS", "S", "M", "L", "XL",
  "2XL", "3XL", "4XL", "5XL", "6XL",
  "7XL", "8XL", "9XL", "10XL",
];

const WOMEN_CLOTHING = [
  { alpha: "XXS",  eu: "32", uk: "4",  us: "0"  },
  { alpha: "XS",   eu: "34", uk: "6",  us: "2"  },
  { alpha: "S",    eu: "36", uk: "8",  us: "4"  },
  { alpha: "M",    eu: "38", uk: "10", us: "6"  },
  { alpha: "L",    eu: "40", uk: "12", us: "8"  },
  { alpha: "XL",   eu: "42", uk: "14", us: "10" },
  { alpha: "2XL",  eu: "44", uk: "16", us: "12" },
  { alpha: "3XL",  eu: "46", uk: "18", us: "14" },
  { alpha: "4XL",  eu: "48", uk: "20", us: "16" },
  { alpha: "5XL",  eu: "50", uk: "22", us: "18" },
  { alpha: "6XL",  eu: "52", uk: "24", us: "20" },
];

const MEN_CLOTHING = [
  { alpha: "XXS",  eu: "40", uk: "32", us: "32" },
  { alpha: "XS",   eu: "42", uk: "34", us: "34" },
  { alpha: "S",    eu: "44", uk: "36", us: "36" },
  { alpha: "M",    eu: "46", uk: "38", us: "38" },
  { alpha: "L",    eu: "48", uk: "40", us: "40" },
  { alpha: "XL",   eu: "50", uk: "42", us: "42" },
  { alpha: "2XL",  eu: "52", uk: "44", us: "44" },
  { alpha: "3XL",  eu: "54", uk: "46", us: "46" },
  { alpha: "4XL",  eu: "56", uk: "48", us: "48" },
  { alpha: "5XL",  eu: "58", uk: "50", us: "50" },
  { alpha: "6XL",  eu: "60", uk: "52", us: "52" },
  { alpha: "7XL",  eu: "62", uk: "54", us: "54" },
  { alpha: "8XL",  eu: "64", uk: "56", us: "56" },
  { alpha: "9XL",  eu: "66", uk: "58", us: "58" },
  { alpha: "10XL", eu: "68", uk: "60", us: "60" },
];

const WOMEN_SHOES = [
  { eu: "34",   uk: "1",    us: "4"    },
  { eu: "34.5", uk: "1.5",  us: "4.5"  },
  { eu: "35",   uk: "2",    us: "5"    },
  { eu: "35.5", uk: "2.5",  us: "5.5"  },
  { eu: "36",   uk: "3",    us: "6"    },
  { eu: "36.5", uk: "3.5",  us: "6.5"  },
  { eu: "37",   uk: "4",    us: "7"    },
  { eu: "37.5", uk: "4.5",  us: "7.5"  },
  { eu: "38",   uk: "5",    us: "8"    },
  { eu: "38.5", uk: "5.5",  us: "8.5"  },
  { eu: "39",   uk: "6",    us: "9"    },
  { eu: "39.5", uk: "6.5",  us: "9.5"  },
  { eu: "40",   uk: "7",    us: "10"   },
  { eu: "40.5", uk: "7.5",  us: "10.5" },
  { eu: "41",   uk: "8",    us: "11"   },
  { eu: "42",   uk: "9",    us: "12"   },
];

const MEN_SHOES = [
  { eu: "38",   uk: "4",    us: "5"    },
  { eu: "38.5", uk: "4.5",  us: "5.5"  },
  { eu: "39",   uk: "5",    us: "6"    },
  { eu: "39.5", uk: "5.5",  us: "6.5"  },
  { eu: "40",   uk: "6",    us: "7"    },
  { eu: "40.5", uk: "6.5",  us: "7.5"  },
  { eu: "41",   uk: "7",    us: "8"    },
  { eu: "41.5", uk: "7.5",  us: "8.5"  },
  { eu: "42",   uk: "8",    us: "9"    },
  { eu: "42.5", uk: "8.5",  us: "9.5"  },
  { eu: "43",   uk: "9",    us: "10"   },
  { eu: "43.5", uk: "9.5",  us: "10.5" },
  { eu: "44",   uk: "10",   us: "11"   },
  { eu: "44.5", uk: "10.5", us: "11.5" },
  { eu: "45",   uk: "11",   us: "12"   },
  { eu: "45.5", uk: "11.5", us: "12.5" },
  { eu: "46",   uk: "12",   us: "13"   },
  { eu: "47",   uk: "13",   us: "14"   },
];

const shoeEuMap = new Map();
for (const row of [...WOMEN_SHOES, ...MEN_SHOES]) {
  if (!shoeEuMap.has(row.eu)) shoeEuMap.set(row.eu, row);
}

/**
 * Convert a shoe EU canonical to the display system.
 */
export function shoeDisplaySize(euCanonical, system = "eu") {
  if (system === "eu") return euCanonical;
  const row = shoeEuMap.get(String(euCanonical));
  if (!row) return euCanonical;
  return row[system] || euCanonical;
}

/**
 * Sort shoe sizes by EU numeric order.
 */
export function sortShoesByEU(sizes) {
  return [...sizes].sort((a, b) => parseFloat(a.value) - parseFloat(b.value));
}

const ALPHA_IDX = new Map(ALPHA_SORT_ORDER.map((v, i) => [v, i]));

/**
 * Check if a value is a known alpha size.
 */
export function isAlphaSize(value) {
  return ALPHA_IDX.has(value);
}

/**
 * Check if a value is a waist size (W##).
 */
export function isWaistSize(value) {
  return /^W\d+$/.test(value);
}

/**
 * Check if a value is a valid EU shoe size (numeric, 15-50 range).
 */
export function isShoeEUSize(value) {
  const n = parseFloat(value);
  return !isNaN(n) && n >= 15 && n <= 55;
}

/**
 * Sort clothing sizes: alpha first (XXS→10XL), then waist (W24→W60),
 * then anything else alphabetically.
 */
export function sortClothingSizes(sizes) {
  return [...sizes].sort((a, b) => {
    const ai = ALPHA_IDX.get(a.value);
    const bi = ALPHA_IDX.get(b.value);
    if (ai != null && bi != null) return ai - bi;
    if (ai != null) return -1;
    if (bi != null) return 1;
    const aW = a.value.match(/^W(\d+)/);
    const bW = b.value.match(/^W(\d+)/);
    if (aW && bW) return parseInt(aW[1]) - parseInt(bW[1]);
    if (aW) return 1;
    if (bW) return -1;
    const an = parseFloat(a.value);
    const bn = parseFloat(b.value);
    if (!isNaN(an) && !isNaN(bn)) return an - bn;
    return a.value.localeCompare(b.value);
  });
}

export const SHOE_SYSTEMS = [
  { key: "eu", label: "EU" },
  { key: "uk", label: "UK" },
  { key: "us", label: "US" },
];

export const SIZE_STORAGE_KEY = "aayeu_shoe_size_system";

export {
  ALPHA_SORT_ORDER,
  WOMEN_CLOTHING,
  MEN_CLOTHING,
  WOMEN_SHOES,
  MEN_SHOES,
};
