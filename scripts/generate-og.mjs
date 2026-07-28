import sharp from "sharp";

const W = 1200;
const H = 630;

const hero = await sharp("public/images/hero.png")
  .resize(W, H, { fit: "cover", position: "attention" })
  .jpeg({ quality: 88 })
  .toBuffer();

const overlay = Buffer.from(`
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000" stop-opacity="0.15"/>
      <stop offset="45%" stop-color="#000" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#0F2A1D" stop-opacity="0.92"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <text x="64" y="470" fill="#C9A84C" font-family="Georgia, serif" font-size="22" letter-spacing="4">MERIDIAN CPA &amp; ADVISORY</text>
  <text x="64" y="530" fill="#FFFFFF" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="700">Hong Kong Compliance &amp; Advisory, Simplified.</text>
  <text x="64" y="575" fill="#FFFFFF" fill-opacity="0.85" font-family="Arial, Helvetica, sans-serif" font-size="22">Audit · Tax · Corporate Services</text>
</svg>
`);

await sharp(hero)
  .composite([{ input: await sharp(overlay).png().toBuffer() }])
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile("public/og-image.jpg");

const meta = await sharp("public/og-image.jpg").metadata();
console.log(`og-image.jpg ${meta.width}x${meta.height} (${meta.size} bytes)`);
