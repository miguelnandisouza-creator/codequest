import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const avatarDir = path.join(root, "public", "assets", "avatars", "generated");
const petDir = path.join(root, "public", "assets", "pets", "generated");

const avatars = [
  { slug: "byte-aprendiz", title: "Byte Aprendiz", hair: "#1e3a8a", robe: "#2563eb", trim: "#dbeafe", prop: "wand" },
  { slug: "guarda-query", title: "Guarda Query", hair: "#334155", robe: "#475569", trim: "#e7c66a", prop: "shield" },
  { slug: "alquimista-join", title: "Alquimista JOIN", hair: "#1f2937", robe: "#16a34a", trim: "#c084fc", prop: "flask" },
  { slug: "cartografa-dados", title: "Cartografa dos Dados", hair: "#7c2d12", robe: "#0f766e", trim: "#9ec0ff", prop: "map" },
  { slug: "ferreiro-select", title: "Ferreiro SELECT", hair: "#422006", robe: "#b45309", trim: "#fed7aa", prop: "hammer" },
  { slug: "sentinela-where", title: "Sentinela WHERE", hair: "#111827", robe: "#991b1b", trim: "#fbbf24", prop: "spear" },
  { slug: "bibliotecaria-group", title: "Bibliotecaria GROUP", hair: "#4c1d95", robe: "#7c3aed", trim: "#fef3c7", prop: "book" },
  { slug: "ninja-limit", title: "Ninja LIMIT", hair: "#020617", robe: "#0f172a", trim: "#38bdf8", prop: "blade" },
  { slug: "oraculo-having", title: "Oraculo HAVING", hair: "#581c87", robe: "#a21caf", trim: "#fde68a", prop: "orb" },
  { slug: "lorde-subquery", title: "Lorde Subquery", hair: "#0f172a", robe: "#be185d", trim: "#22d3ee", prop: "crown" },
];

const pets = [
  { slug: "slime-sql", title: "Slime SQL", main: "#5ee6a8", dark: "#15724c", light: "#bbf7d0", kind: "slime" },
  { slug: "morcego-byte", title: "Morcego Byte", main: "#7e22ce", dark: "#2e1065", light: "#f472b6", kind: "bat" },
  { slug: "poring-dados", title: "Poring Dados", main: "#f9a8d4", dark: "#831843", light: "#fff7ff", kind: "poring" },
  { slug: "raposa-query", title: "Raposa Query", main: "#f97316", dark: "#7c2d12", light: "#fde68a", kind: "fox" },
  { slug: "sapo-debug", title: "Sapo Debug", main: "#22c55e", dark: "#14532d", light: "#bbf7d0", kind: "frog" },
  { slug: "lobo-cache", title: "Lobo Cache", main: "#94a3b8", dark: "#1e293b", light: "#e2e8f0", kind: "wolf" },
  { slug: "fada-index", title: "Fada Index", main: "#a78bfa", dark: "#4c1d95", light: "#fef3c7", kind: "fairy" },
  { slug: "tartaruga-backup", title: "Tartaruga Backup", main: "#84cc16", dark: "#365314", light: "#d9f99d", kind: "turtle" },
  { slug: "serpente-join", title: "Serpente JOIN", main: "#22d3ee", dark: "#164e63", light: "#a7f3d0", kind: "snake" },
  { slug: "grifo-root", title: "Grifo Root", main: "#e7c66a", dark: "#4c1d95", light: "#fef3c7", kind: "griffin" },
];

await mkdir(avatarDir, { recursive: true });
await mkdir(petDir, { recursive: true });

for (const avatar of avatars) {
  await writeFile(
    path.join(avatarDir, `${avatar.slug}.svg`),
    avatarSvg(avatar),
    "utf8"
  );
}

for (const pet of pets) {
  await writeFile(
    path.join(petDir, `${pet.slug}.svg`),
    petSvg(pet),
    "utf8"
  );
}

function shell({ width, height, title, body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(title)}" shape-rendering="crispEdges">
  <title>${escapeXml(title)}</title>
  <rect x="0" y="0" width="${width}" height="${height}" fill="none"/>
  ${body}
</svg>
`;
}

function avatarSvg({ title, hair, robe, trim, prop }) {
  return shell({
    width: 160,
    height: 192,
    title,
    body: `
  <rect x="38" y="168" width="84" height="8" fill="#000000" opacity="0.28"/>
  <rect x="34" y="28" width="92" height="140" fill="#050a14"/>
  <rect x="42" y="20" width="76" height="20" fill="${hair}"/>
  ${avatarHeadgear(prop, trim, hair)}
  <rect x="50" y="44" width="60" height="58" fill="#f0b98a"/>
  <rect x="46" y="38" width="68" height="20" fill="${hair}"/>
  <rect x="58" y="62" width="8" height="8" fill="#111827"/>
  <rect x="92" y="62" width="8" height="8" fill="#111827"/>
  <rect x="76" y="74" width="8" height="6" fill="#b45309"/>
  <rect x="68" y="88" width="26" height="6" fill="#fff7ed"/>
  <rect x="42" y="100" width="76" height="58" fill="${robe}"/>
  <rect x="50" y="108" width="60" height="8" fill="${trim}"/>
  <rect x="58" y="118" width="44" height="8" fill="#ffffff" opacity="0.18"/>
  <rect x="30" y="108" width="18" height="44" fill="${robe}"/>
  <rect x="112" y="108" width="18" height="44" fill="${robe}"/>
  <rect x="34" y="150" width="18" height="12" fill="#f0b98a"/>
  <rect x="108" y="150" width="18" height="12" fill="#f0b98a"/>
  <rect x="54" y="158" width="22" height="14" fill="#111827"/>
  <rect x="84" y="158" width="22" height="14" fill="#111827"/>
  ${avatarProp(prop, trim, robe)}
  <rect x="34" y="28" width="8" height="132" fill="#ffffff" opacity="0.08"/>
  <rect x="118" y="36" width="8" height="124" fill="#000000" opacity="0.18"/>`,
  });
}

function avatarHeadgear(prop, trim, hair) {
  if (prop === "crown") {
    return `<rect x="50" y="10" width="10" height="18" fill="${trim}"/><rect x="75" y="4" width="10" height="24" fill="${trim}"/><rect x="100" y="10" width="10" height="18" fill="${trim}"/><rect x="46" y="28" width="68" height="10" fill="${trim}"/>`;
  }

  if (prop === "blade" || prop === "spear" || prop === "shield") {
    return `<rect x="42" y="22" width="76" height="14" fill="${trim}"/><rect x="50" y="14" width="60" height="10" fill="${hair}"/>`;
  }

  return `<rect x="44" y="18" width="72" height="10" fill="${trim}"/><rect x="54" y="10" width="52" height="10" fill="${hair}"/>`;
}

function avatarProp(prop, trim, robe) {
  const props = {
    wand: `<rect x="124" y="72" width="6" height="82" fill="${trim}"/><rect x="118" y="62" width="18" height="18" fill="#9ec0ff"/><rect x="122" y="66" width="10" height="10" fill="${trim}"/>`,
    shield: `<rect x="118" y="90" width="24" height="42" fill="${trim}"/><rect x="124" y="98" width="12" height="22" fill="${robe}"/>`,
    flask: `<rect x="118" y="104" width="24" height="30" fill="#9ec0ff"/><rect x="124" y="94" width="12" height="12" fill="${trim}"/><rect x="122" y="118" width="16" height="8" fill="#72e6a8"/>`,
    map: `<rect x="118" y="92" width="28" height="42" fill="#fef3c7"/><rect x="124" y="100" width="14" height="6" fill="${trim}"/><rect x="124" y="116" width="18" height="4" fill="${robe}"/>`,
    hammer: `<rect x="122" y="74" width="8" height="76" fill="#7c2d12"/><rect x="112" y="68" width="28" height="14" fill="${trim}"/>`,
    spear: `<rect x="126" y="48" width="6" height="108" fill="${trim}"/><rect x="120" y="34" width="18" height="18" fill="#e5e7eb"/>`,
    book: `<rect x="114" y="100" width="34" height="28" fill="${trim}"/><rect x="119" y="106" width="10" height="16" fill="${robe}"/><rect x="132" y="106" width="10" height="16" fill="#fef3c7"/>`,
    blade: `<rect x="122" y="70" width="8" height="76" fill="#cbd5e1"/><rect x="118" y="136" width="16" height="10" fill="${trim}"/>`,
    orb: `<rect x="118" y="90" width="28" height="28" fill="${trim}"/><rect x="124" y="96" width="16" height="16" fill="#f0abfc"/><rect x="128" y="100" width="8" height="8" fill="#ffffff" opacity="0.4"/>`,
    crown: `<rect x="116" y="90" width="28" height="44" fill="${trim}"/><rect x="122" y="98" width="16" height="28" fill="${robe}"/>`,
  };

  return props[prop] ?? props.wand;
}

function petSvg({ title, main, dark, light, kind }) {
  return shell({
    width: 128,
    height: 128,
    title,
    body: `
  <rect x="26" y="104" width="76" height="8" fill="#000000" opacity="0.26"/>
  ${petBody({ main, dark, light, kind })}
  <rect x="30" y="34" width="10" height="10" fill="#ffffff" opacity="0.16"/>
  <rect x="92" y="42" width="8" height="8" fill="#ffffff" opacity="0.12"/>
  <rect x="82" y="24" width="6" height="6" fill="${light}" opacity="0.75"/>`,
  });
}

function petBody({ main, dark, light, kind }) {
  const map = {
    slime: `
  <rect x="40" y="52" width="48" height="12" fill="${main}"/>
  <rect x="32" y="64" width="64" height="28" fill="${main}"/>
  <rect x="40" y="92" width="48" height="8" fill="${dark}"/>
  <rect x="48" y="70" width="8" height="8" fill="${dark}"/>
  <rect x="76" y="70" width="8" height="8" fill="${dark}"/>
  <rect x="56" y="84" width="20" height="4" fill="${light}"/>
  <rect x="44" y="58" width="18" height="6" fill="${light}" opacity="0.75"/>`,
    bat: `
  <rect x="46" y="44" width="36" height="38" fill="${main}"/>
  <rect x="20" y="50" width="30" height="18" fill="${dark}"/>
  <rect x="78" y="50" width="30" height="18" fill="${dark}"/>
  <rect x="28" y="68" width="20" height="14" fill="${main}"/>
  <rect x="80" y="68" width="20" height="14" fill="${main}"/>
  <rect x="54" y="56" width="6" height="6" fill="${light}"/>
  <rect x="70" y="56" width="6" height="6" fill="${light}"/>
  <rect x="56" y="74" width="18" height="5" fill="#fff7ff"/>`,
    poring: `
  <rect x="44" y="42" width="40" height="16" fill="${main}"/>
  <rect x="34" y="58" width="60" height="34" fill="${main}"/>
  <rect x="42" y="92" width="44" height="8" fill="${dark}"/>
  <rect x="50" y="66" width="8" height="8" fill="${dark}"/>
  <rect x="74" y="66" width="8" height="8" fill="${dark}"/>
  <rect x="58" y="82" width="18" height="4" fill="${light}"/>
  <rect x="48" y="48" width="18" height="6" fill="${light}" opacity="0.7"/>`,
    fox: `
  <rect x="42" y="46" width="46" height="38" fill="${main}"/>
  <rect x="32" y="30" width="18" height="24" fill="${main}"/>
  <rect x="80" y="30" width="18" height="24" fill="${main}"/>
  <rect x="38" y="36" width="8" height="12" fill="${light}"/>
  <rect x="84" y="36" width="8" height="12" fill="${light}"/>
  <rect x="52" y="62" width="7" height="7" fill="${dark}"/>
  <rect x="74" y="62" width="7" height="7" fill="${dark}"/>
  <rect x="56" y="76" width="20" height="10" fill="${light}"/>
  <rect x="84" y="76" width="28" height="16" fill="${main}"/>
  <rect x="104" y="80" width="12" height="8" fill="${light}"/>`,
    frog: `
  <rect x="36" y="54" width="56" height="40" fill="${main}"/>
  <rect x="32" y="40" width="20" height="20" fill="${main}"/>
  <rect x="78" y="40" width="20" height="20" fill="${main}"/>
  <rect x="39" y="46" width="6" height="6" fill="${dark}"/>
  <rect x="85" y="46" width="6" height="6" fill="${dark}"/>
  <rect x="52" y="76" width="28" height="5" fill="${light}"/>
  <rect x="42" y="90" width="14" height="10" fill="${dark}"/>
  <rect x="78" y="90" width="14" height="10" fill="${dark}"/>`,
    wolf: `
  <rect x="40" y="42" width="50" height="46" fill="${main}"/>
  <rect x="34" y="26" width="18" height="26" fill="${main}"/>
  <rect x="78" y="26" width="18" height="26" fill="${main}"/>
  <rect x="48" y="58" width="8" height="8" fill="${dark}"/>
  <rect x="76" y="58" width="8" height="8" fill="${dark}"/>
  <rect x="58" y="74" width="22" height="12" fill="${light}"/>
  <rect x="90" y="78" width="24" height="12" fill="${main}"/>
  <rect x="108" y="74" width="8" height="8" fill="${light}"/>`,
    fairy: `
  <rect x="54" y="42" width="22" height="44" fill="${main}"/>
  <rect x="24" y="46" width="30" height="34" fill="${light}" opacity="0.82"/>
  <rect x="76" y="46" width="30" height="34" fill="${light}" opacity="0.82"/>
  <rect x="58" y="50" width="6" height="6" fill="${dark}"/>
  <rect x="68" y="50" width="6" height="6" fill="${dark}"/>
  <rect x="60" y="68" width="12" height="4" fill="${light}"/>
  <rect x="48" y="86" width="34" height="10" fill="${dark}"/>`,
    turtle: `
  <rect x="32" y="64" width="64" height="30" fill="${main}"/>
  <rect x="44" y="48" width="42" height="36" fill="${dark}"/>
  <rect x="52" y="56" width="26" height="20" fill="${main}"/>
  <rect x="92" y="68" width="20" height="16" fill="${main}"/>
  <rect x="100" y="70" width="6" height="6" fill="${dark}"/>
  <rect x="38" y="92" width="14" height="8" fill="${light}"/>
  <rect x="78" y="92" width="14" height="8" fill="${light}"/>`,
    snake: `
  <rect x="26" y="82" width="76" height="16" fill="${main}"/>
  <rect x="82" y="52" width="28" height="34" fill="${main}"/>
  <rect x="92" y="60" width="7" height="7" fill="${dark}"/>
  <rect x="106" y="60" width="7" height="7" fill="${dark}"/>
  <rect x="98" y="76" width="22" height="4" fill="${light}"/>
  <rect x="34" y="86" width="12" height="4" fill="${light}"/>
  <rect x="58" y="86" width="12" height="4" fill="${dark}"/>
  <rect x="76" y="86" width="12" height="4" fill="${light}"/>`,
    griffin: `
  <rect x="42" y="44" width="46" height="40" fill="${main}"/>
  <rect x="22" y="50" width="28" height="36" fill="${dark}"/>
  <rect x="78" y="50" width="28" height="36" fill="${dark}"/>
  <rect x="50" y="58" width="8" height="8" fill="#05030a"/>
  <rect x="74" y="58" width="8" height="8" fill="#05030a"/>
  <rect x="58" y="74" width="20" height="8" fill="${light}"/>
  <rect x="50" y="30" width="32" height="16" fill="${dark}"/>
  <rect x="60" y="22" width="12" height="10" fill="${light}"/>`,
  };

  return map[kind] ?? map.slime;
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
