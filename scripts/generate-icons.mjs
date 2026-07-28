import sharp from "sharp";

const svg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180">
  <rect width="180" height="180" rx="36" fill="#0F2A1D"/>
  <path d="M48 128 V52 L90 98 L132 52 V128" stroke="#FFFFFF" stroke-width="10" fill="none" stroke-linejoin="miter"/>
  <rect x="87" y="36" width="6" height="108" fill="#C9A84C"/>
</svg>
`);

await sharp(svg).png().toFile("public/apple-touch-icon.png");
console.log("apple-touch-icon.png written");
