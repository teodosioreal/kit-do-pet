// Ilustrações vetoriais (SVG) usadas nos guias. Estilo "flat", no padrão visual do Kit do Pet.

const C = {
  orange: "#f97316",
  orangeSoft: "#ffedd5",
  teal: "#14b8a6",
  tealSoft: "#ccfbf1",
  sky: "#bae6fd",
  pink: "#fbcfe8",
  ink: "#1f2937",
  cream: "#fffaf5",
};

const svg = (w, h, body, extra = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" ${extra}>${body}</svg>`;

/** Cão sentado, de corpo inteiro. */
export function dogSitting({ bg = C.sky, collar = "#ef4444" } = {}) {
  return svg(
    400,
    400,
    `
    <circle cx="200" cy="200" r="190" fill="${bg}"/>
    <ellipse cx="200" cy="372" rx="120" ry="14" fill="#000" opacity=".08"/>
    <path d="M300 300 Q350 260 335 215" stroke="#b97a47" stroke-width="22" fill="none" stroke-linecap="round"/>
    <ellipse cx="200" cy="290" rx="95" ry="85" fill="#d29a64"/>
    <ellipse cx="200" cy="300" rx="50" ry="62" fill="#f5deb3"/>
    <ellipse cx="150" cy="360" rx="30" ry="16" fill="#c08457"/>
    <ellipse cx="250" cy="360" rx="30" ry="16" fill="#c08457"/>
    <rect x="160" y="290" width="26" height="72" rx="13" fill="#d29a64"/>
    <rect x="214" y="290" width="26" height="72" rx="13" fill="#d29a64"/>
    <ellipse cx="128" cy="140" rx="34" ry="70" fill="#7c4a2d" transform="rotate(18 128 140)"/>
    <ellipse cx="272" cy="140" rx="34" ry="70" fill="#7c4a2d" transform="rotate(-18 272 140)"/>
    <ellipse cx="200" cy="160" rx="90" ry="88" fill="#d29a64"/>
    <ellipse cx="200" cy="200" rx="52" ry="42" fill="#f5deb3"/>
    <circle cx="168" cy="148" r="13" fill="${C.ink}"/><circle cx="232" cy="148" r="13" fill="${C.ink}"/>
    <circle cx="172" cy="143" r="4" fill="#fff"/><circle cx="236" cy="143" r="4" fill="#fff"/>
    <ellipse cx="200" cy="184" rx="19" ry="13" fill="${C.ink}"/>
    <path d="M200 197 Q200 215 184 217 M200 197 Q200 215 216 217" stroke="${C.ink}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    <path d="M192 220 Q200 244 208 220 Z" fill="#f87171"/>
    <rect x="140" y="236" width="120" height="16" rx="8" fill="${collar}"/>
    <circle cx="200" cy="262" r="12" fill="#fbbf24"/>
    `,
  );
}

/** Gato sentado, de corpo inteiro. */
export function catSitting({ bg = C.pink, collar = "#8b5cf6" } = {}) {
  return svg(
    400,
    400,
    `
    <circle cx="200" cy="200" r="190" fill="${bg}"/>
    <ellipse cx="200" cy="372" rx="115" ry="14" fill="#000" opacity=".08"/>
    <path d="M285 350 Q360 340 345 260 Q338 225 360 205" stroke="#6b7280" stroke-width="20" fill="none" stroke-linecap="round"/>
    <ellipse cx="200" cy="290" rx="85" ry="88" fill="#9ca3af"/>
    <ellipse cx="200" cy="305" rx="45" ry="60" fill="#e5e7eb"/>
    <ellipse cx="160" cy="362" rx="26" ry="14" fill="#9ca3af"/>
    <ellipse cx="240" cy="362" rx="26" ry="14" fill="#9ca3af"/>
    <path d="M120 120 L132 40 L190 92 Z" fill="#6b7280"/><path d="M280 120 L268 40 L210 92 Z" fill="#6b7280"/>
    <path d="M135 105 L141 62 L172 92 Z" fill="#f9a8d4"/><path d="M265 105 L259 62 L228 92 Z" fill="#f9a8d4"/>
    <ellipse cx="200" cy="155" rx="92" ry="80" fill="#9ca3af"/>
    <path d="M172 88 L178 116 M200 84 L200 114 M228 88 L222 116" stroke="#6b7280" stroke-width="7" stroke-linecap="round"/>
    <ellipse cx="200" cy="188" rx="46" ry="34" fill="#e5e7eb"/>
    <ellipse cx="168" cy="148" rx="15" ry="18" fill="#84cc16"/><ellipse cx="232" cy="148" rx="15" ry="18" fill="#84cc16"/>
    <ellipse cx="168" cy="148" rx="5" ry="15" fill="${C.ink}"/><ellipse cx="232" cy="148" rx="5" ry="15" fill="${C.ink}"/>
    <path d="M191 176 L209 176 L200 187 Z" fill="#f472b6"/>
    <path d="M200 187 Q200 202 187 203 M200 187 Q200 202 213 203" stroke="${C.ink}" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M160 186 L100 176 M160 194 L102 200 M240 186 L300 176 M240 194 L298 200" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>
    <rect x="148" y="226" width="104" height="14" rx="7" fill="${collar}"/>
    `,
  );
}

// ---------- Ícones (viewBox 100x100, fundo circular) ----------
const badge = (bg, body) => svg(100, 100, `<circle cx="50" cy="50" r="48" fill="${bg}"/>${body}`);

export const ICONS = {
  treat: () =>
    badge(C.orangeSoft, `<path d="M28 42a9 9 0 1 1 12-11h20a9 9 0 1 1 12 11 9 9 0 1 1-12 11H40a9 9 0 1 1-12-11z" fill="#d97706"/>`),
  hand: () =>
    badge(
      C.tealSoft,
      `<rect x="30" y="44" width="40" height="30" rx="14" fill="#f2c9a0"/><rect x="33" y="26" width="9" height="26" rx="4.5" fill="#f2c9a0"/><rect x="44" y="22" width="9" height="28" rx="4.5" fill="#f2c9a0"/><rect x="55" y="24" width="9" height="26" rx="4.5" fill="#f2c9a0"/><circle cx="50" cy="60" r="7" fill="#d97706"/>`,
    ),
  clock: () =>
    badge(C.orangeSoft, `<circle cx="50" cy="50" r="26" fill="#fff" stroke="${C.orange}" stroke-width="6"/><path d="M50 36v15l10 7" stroke="${C.ink}" stroke-width="5" fill="none" stroke-linecap="round"/>`),
  heart: () => badge(C.pink, `<path d="M50 74 L26 50a14 14 0 0 1 24-16 14 14 0 0 1 24 16z" fill="#ec4899"/>`),
  star: () =>
    badge(C.orangeSoft, `<path d="M50 22l8 17 19 2-14 13 4 19-17-10-17 10 4-19-14-13 19-2z" fill="${C.orange}"/>`),
  leash: () =>
    badge(C.tealSoft, `<path d="M28 30 Q50 20 60 40 T74 72" stroke="${C.teal}" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="74" cy="72" r="7" fill="${C.ink}"/><rect x="20" y="24" width="16" height="16" rx="4" fill="${C.teal}"/>`),
  ball: () =>
    badge(C.tealSoft, `<circle cx="50" cy="50" r="24" fill="#a3e635"/><path d="M30 38 Q50 50 30 64 M70 38 Q50 50 70 64" stroke="#fff" stroke-width="4" fill="none"/>`),
  home: () =>
    badge(C.orangeSoft, `<path d="M26 50 L50 28 L74 50 V74 H26 Z" fill="${C.orange}"/><rect x="43" y="56" width="14" height="18" rx="3" fill="#fff"/>`),
  warn: () =>
    badge("#fee2e2", `<path d="M50 24 L78 72 H22 Z" fill="#ef4444"/><rect x="47" y="40" width="6" height="18" rx="3" fill="#fff"/><circle cx="50" cy="64" r="3.5" fill="#fff"/>`),
  check: () => badge("#dcfce7", `<path d="M30 52 L44 66 L72 36" stroke="#16a34a" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
  litter: () =>
    badge(C.tealSoft, `<path d="M22 48 H78 L72 74 H28 Z" fill="${C.teal}"/><ellipse cx="50" cy="48" rx="28" ry="6" fill="#fde68a"/><circle cx="40" cy="46" r="2" fill="#d97706"/><circle cx="56" cy="47" r="2" fill="#d97706"/>`),
  scratcher: () =>
    badge(C.orangeSoft, `<rect x="40" y="22" width="20" height="50" rx="4" fill="#d6a76b"/><path d="M40 30h20M40 38h20M40 46h20M40 54h20M40 62h20" stroke="#a16207" stroke-width="2.5"/><rect x="28" y="70" width="44" height="8" rx="3" fill="${C.orange}"/>`),
  carrier: () =>
    badge(C.tealSoft, `<rect x="22" y="36" width="56" height="38" rx="10" fill="${C.teal}"/><rect x="34" y="46" width="22" height="20" rx="4" fill="#fff"/><path d="M38 46v20M44 46v20M50 46v20" stroke="${C.teal}" stroke-width="2.5"/><path d="M38 36 Q50 22 62 36" stroke="${C.ink}" stroke-width="5" fill="none"/>`),
  brush: () =>
    badge(C.pink, `<rect x="24" y="34" width="38" height="20" rx="6" fill="#ec4899"/><path d="M28 54v12M34 54v12M40 54v12M46 54v12M52 54v12M58 54v12" stroke="${C.ink}" stroke-width="3"/><rect x="60" y="40" width="20" height="8" rx="4" fill="#ec4899"/>`),
  wand: () =>
    badge(C.orangeSoft, `<path d="M26 76 L62 30" stroke="${C.ink}" stroke-width="4" stroke-linecap="round"/><path d="M62 30 Q78 40 70 56" stroke="${C.orange}" stroke-width="3" fill="none"/><circle cx="70" cy="58" r="6" fill="#ec4899"/>`),
  bowl: () =>
    badge(C.orangeSoft, `<path d="M22 50 H78 Q74 76 50 76 Q26 76 22 50 Z" fill="${C.orange}"/><ellipse cx="50" cy="50" rx="28" ry="7" fill="#d97706"/><circle cx="42" cy="46" r="4" fill="#92400e"/><circle cx="56" cy="45" r="4" fill="#92400e"/>`),
  oven: () =>
    badge(C.orangeSoft, `<rect x="24" y="26" width="52" height="50" rx="6" fill="${C.ink}"/><rect x="30" y="40" width="40" height="28" rx="4" fill="#fbbf24"/><circle cx="34" cy="32" r="2.5" fill="#fff"/><circle cx="42" cy="32" r="2.5" fill="#fff"/>`),
  snow: () =>
    badge("#e0f2fe", `<path d="M50 24v52M28 37l44 26M28 63l44-26" stroke="#0284c7" stroke-width="6" stroke-linecap="round"/>`),
  jar: () =>
    badge(C.tealSoft, `<rect x="30" y="34" width="40" height="42" rx="8" fill="#fff" stroke="${C.teal}" stroke-width="5"/><rect x="34" y="24" width="32" height="12" rx="4" fill="${C.teal}"/><circle cx="44" cy="56" r="5" fill="#d97706"/><circle cx="57" cy="62" r="5" fill="#d97706"/>`),
  scale: () =>
    badge(C.orangeSoft, `<rect x="24" y="56" width="52" height="18" rx="6" fill="${C.ink}"/><path d="M30 56 Q50 30 70 56" fill="${C.orange}"/><path d="M50 56 L58 42" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>`),
  vet: () =>
    badge("#dcfce7", `<rect x="28" y="28" width="44" height="44" rx="10" fill="#16a34a"/><path d="M50 38v24M38 50h24" stroke="#fff" stroke-width="8" stroke-linecap="round"/>`),
};

// ---------- Ingredientes / receitas (viewBox 100x100) ----------
export const FOODS = {
  banana: () => svg(100, 100, `<path d="M22 60 Q40 84 74 66 Q84 60 80 50 Q66 68 40 56 Q30 52 22 60Z" fill="#facc15"/><path d="M80 50 l4 -6" stroke="#713f12" stroke-width="4" stroke-linecap="round"/>`),
  oats: () => svg(100, 100, `<path d="M22 54 H78 Q74 80 50 80 Q26 80 22 54Z" fill="#a16207"/><ellipse cx="50" cy="54" rx="28" ry="8" fill="#fde68a"/><ellipse cx="40" cy="50" rx="5" ry="3" fill="#d6a76b"/><ellipse cx="55" cy="49" rx="5" ry="3" fill="#d6a76b"/><ellipse cx="62" cy="53" rx="5" ry="3" fill="#d6a76b"/>`),
  egg: () => svg(100, 100, `<ellipse cx="50" cy="54" rx="24" ry="30" fill="#fff" stroke="#e5e7eb" stroke-width="3"/><circle cx="50" cy="60" r="10" fill="#fbbf24"/>`),
  pumpkin: () => svg(100, 100, `<ellipse cx="50" cy="58" rx="32" ry="24" fill="#f97316"/><path d="M50 36 v44 M34 40 Q28 58 34 78 M66 40 Q72 58 66 78" stroke="#c2410c" stroke-width="3" fill="none"/><rect x="47" y="26" width="6" height="12" rx="2" fill="#4d7c0f"/>`),
  carrot: () => svg(100, 100, `<path d="M30 30 L74 70 Q78 76 70 74 L30 34 Z" fill="#f97316" transform="rotate(8 50 50)"/><path d="M28 30 l-8 -10 M30 28 l-2 -12 M32 30 l8 -10" stroke="#16a34a" stroke-width="5" stroke-linecap="round"/>`),
  sweetPotato: () => svg(100, 100, `<ellipse cx="50" cy="54" rx="34" ry="18" fill="#9a3412" transform="rotate(-15 50 54)"/><ellipse cx="50" cy="54" rx="22" ry="10" fill="#fb923c" transform="rotate(-15 50 54)"/>`),
  chicken: () => svg(100, 100, `<ellipse cx="44" cy="46" rx="24" ry="20" fill="#d97706"/><rect x="58" y="56" width="22" height="8" rx="4" fill="#fde68a" transform="rotate(35 58 56)"/><circle cx="80" cy="74" r="6" fill="#fde68a"/><circle cx="76" cy="80" r="6" fill="#fde68a"/>`),
  fish: () => svg(100, 100, `<ellipse cx="46" cy="50" rx="28" ry="16" fill="#fb7185"/><path d="M72 50 L88 36 V64 Z" fill="#fb7185"/><circle cx="32" cy="46" r="3.5" fill="${C.ink}"/><path d="M44 42 Q50 50 44 58 M54 42 Q60 50 54 58" stroke="#fff" stroke-width="2.5" fill="none"/>`),
  apple: () => svg(100, 100, `<path d="M50 34 Q28 24 24 48 Q22 76 44 80 Q50 78 56 80 Q78 76 76 48 Q72 24 50 34Z" fill="#ef4444"/><path d="M50 34 Q52 22 58 18" stroke="#713f12" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="62" cy="24" rx="8" ry="4" fill="#16a34a" transform="rotate(-20 62 24)"/>`),
  yogurt: () => svg(100, 100, `<path d="M30 34 H70 L64 80 H36 Z" fill="#fff" stroke="#93c5fd" stroke-width="4"/><rect x="26" y="28" width="48" height="10" rx="4" fill="#93c5fd"/><circle cx="50" cy="58" r="7" fill="#f472b6"/>`),
  broth: () => svg(100, 100, `<path d="M20 46 H80 Q78 78 50 78 Q22 78 20 46Z" fill="${C.teal}"/><ellipse cx="50" cy="46" rx="30" ry="8" fill="#fde68a"/><circle cx="40" cy="44" r="3" fill="#f97316"/><circle cx="58" cy="46" r="3" fill="#16a34a"/><path d="M40 30 q4 -6 0 -12 M54 30 q4 -6 0 -12" stroke="#9ca3af" stroke-width="3" fill="none"/>`),
  peanut: () => svg(100, 100, `<rect x="30" y="34" width="40" height="44" rx="8" fill="#b45309"/><rect x="28" y="26" width="44" height="12" rx="4" fill="#7c2d12"/><rect x="36" y="48" width="28" height="16" rx="3" fill="#fde68a"/>`),
  liver: () => svg(100, 100, `<path d="M24 54 Q30 30 56 34 Q80 36 76 56 Q72 74 48 72 Q26 72 24 54Z" fill="#7f1d1d"/>`),
  bone: () => svg(100, 100, `<path d="M26 44a9 9 0 1 1 12-11h24a9 9 0 1 1 12 11 9 9 0 1 1-12 11H38a9 9 0 1 1-12-11z" fill="#d6a76b" transform="translate(0 6)"/>`),
};

export const PALETTE = C;
