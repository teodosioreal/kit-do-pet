// Gera os PDFs dos guias bônus (adestramento e petiscos, versões cão e gato).
//
// Uso:  node scripts/guias/build.mjs
// Saída: assets/guias/*.pdf  (depois envie cada um em /admin/guias)
//
// Precisa do Playwright com Chromium e do pdfunite (pacote poppler-utils). Se não tiver: npm i -D playwright && npx playwright install chromium
// Os textos ficam em content-*.mjs; as ilustrações em art.mjs.

import { createRequire } from "node:module";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ICONS, FOODS, PALETTE as C } from "./art.mjs";
import { GUIDES } from "./content.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const outDir = path.join(root, "assets", "guias");

const require = createRequire(import.meta.url);
function loadPlaywright() {
  try {
    return require("playwright");
  } catch {
    // instalação global (ex.: ambiente com NODE_PATH)
    return require(path.join(process.env.NODE_PATH ?? "", "playwright"));
  }
}

const fontPath = (w) => path.join(root, "assets", "fonts", `nunito-latin-${w}-normal.woff`);
// fonte embutida em base64 (a página é carregada sem origem, então file:// não funciona)
const font = (w) => `data:font/woff;base64,${readFileSync(fontPath(w)).toString("base64")}`;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
/** **negrito** e quebras simples */
const rich = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
const icon = (name, size = 44) => (name && ICONS[name] ? `<span class="ico" style="width:${size}px;height:${size}px">${ICONS[name]()}</span>` : "");
const food = (name) => (FOODS[name] ? `<span class="food">${FOODS[name]()}</span>` : "");

function renderBlock(b) {
  switch (b.type) {
    case "p":
      return `<p>${rich(b.text)}</p>`;
    case "h2":
      return `<h2>${icon(b.icon, 38)}<span>${rich(b.text)}</span></h2>`;
    case "list":
      return `<ul class="list">${b.items.map((i) => `<li>${rich(i)}</li>`).join("")}</ul>`;
    case "steps":
      return `<div class="steps">${b.title ? `<p class="steps-title">${rich(b.title)}</p>` : ""}<ol>${b.items
        .map((i) => `<li><span>${rich(i)}</span></li>`)
        .join("")}</ol></div>`;
    case "tip":
      return `<div class="box tip">${icon("star", 34)}<div><p class="box-title">${rich(b.title ?? "Dica")}</p><p>${rich(b.text)}</p></div></div>`;
    case "warn":
      return `<div class="box warn">${icon("warn", 34)}<div><p class="box-title">${rich(b.title ?? "Atenção")}</p><p>${rich(b.text)}</p></div></div>`;
    case "vet":
      return `<div class="box vet">${icon("vet", 34)}<div><p class="box-title">${rich(b.title ?? "Fale com o veterinário")}</p><p>${rich(b.text)}</p></div></div>`;
    case "cards":
      return `<div class="cards">${b.items
        .map((c) => `<div class="card">${icon(c.icon, 40)}<p class="card-title">${rich(c.title)}</p><p>${rich(c.text)}</p></div>`)
        .join("")}</div>`;
    case "table":
      return `<table><thead><tr>${b.head.map((h) => `<th>${rich(h)}</th>`).join("")}</tr></thead><tbody>${b.rows
        .map((r) => `<tr>${r.map((c) => `<td>${rich(c)}</td>`).join("")}</tr>`)
        .join("")}</tbody></table>`;
    case "twocol":
      return `<div class="twocol"><div class="col good"><p class="col-title">✓ ${rich(b.leftTitle)}</p><ul>${b.left
        .map((i) => `<li>${rich(i)}</li>`)
        .join("")}</ul></div><div class="col bad"><p class="col-title">✕ ${rich(b.rightTitle)}</p><ul>${b.right
        .map((i) => `<li>${rich(i)}</li>`)
        .join("")}</ul></div></div>`;
    case "checklist":
      return `<ul class="checklist">${b.items.map((i) => `<li><span class="cb"></span>${rich(i)}</li>`).join("")}</ul>`;
    case "recipe":
      return `<section class="recipe">
        <div class="recipe-head">
          <div class="recipe-foods">${(b.foods ?? []).map(food).join("")}</div>
          <div><p class="recipe-kicker">Receita ${b.number}</p><h3>${rich(b.name)}</h3>
          <p class="recipe-meta"><span>⏱ ${esc(b.time)}</span><span>🍽 ${esc(b.yields)}</span>${b.level ? `<span>★ ${esc(b.level)}</span>` : ""}</p></div>
        </div>
        <div class="recipe-body">
          <div class="ingredients"><p class="rb-title">Ingredientes</p><ul>${b.ingredients.map((i) => `<li>${rich(i)}</li>`).join("")}</ul></div>
          <div class="method"><p class="rb-title">Modo de preparo</p><ol>${b.steps.map((i) => `<li>${rich(i)}</li>`).join("")}</ol></div>
        </div>
        <div class="recipe-foot">
          <p><strong>Como servir:</strong> ${rich(b.serve)}</p>
          <p><strong>Conservação:</strong> ${rich(b.storage)}</p>
          ${b.note ? `<p class="recipe-note">${rich(b.note)}</p>` : ""}
        </div>
      </section>`;
    case "figure":
      return `<figure class="figure">${b.art}${b.caption ? `<figcaption>${rich(b.caption)}</figcaption>` : ""}</figure>`;
    case "pagebreak":
      return `<div class="pagebreak"></div>`;
    default:
      throw new Error(`Bloco desconhecido: ${b.type}`);
  }
}

function renderGuide(g) {
  const theme = g.theme;
  const chapters = g.chapters.map((ch, i) => ({ ...ch, n: i + 1 }));
  const toc = chapters
    .map((ch) => `<li>${icon(ch.icon, 30)}<span class="toc-n">${String(ch.n).padStart(2, "0")}</span><span>${esc(ch.title)}</span></li>`)
    .join("");

  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${esc(g.title)}</title>
<style>
@font-face{font-family:Nunito;font-weight:400;src:url(${font(400)}) format("woff")}
@font-face{font-family:Nunito;font-weight:700;src:url(${font(700)}) format("woff")}
@font-face{font-family:Nunito;font-weight:800;src:url(${font(800)}) format("woff")}
@page{size:A4;margin:18mm 16mm 20mm 16mm}
@page:first{margin:0}
*{box-sizing:border-box}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{margin:0;font-family:Nunito,sans-serif;color:${C.ink};font-size:11pt;line-height:1.55}
p{margin:0 0 9px}
strong{font-weight:800}
.ico{display:inline-block;flex:none}.ico svg{width:100%;height:100%;display:block}
.pagebreak{break-after:page}

/* capa */
.cover{width:210mm;height:297mm;position:relative;overflow:hidden;background:${theme.coverBg};break-after:page;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:30mm 22mm}
.cover .blob{position:absolute;border-radius:50%;opacity:.55}
.cover .brand{position:absolute;top:18mm;left:0;right:0;font-weight:800;color:${theme.dark};letter-spacing:.18em;font-size:11pt}
.cover .art{width:118mm;height:118mm;margin-bottom:12mm;position:relative}
.cover .art svg{width:100%;height:100%}
.cover .kicker{display:inline-block;background:#fff;color:${theme.dark};font-weight:800;border-radius:999px;padding:5px 16px;font-size:10pt;letter-spacing:.06em;text-transform:uppercase;margin-bottom:8mm;position:relative}
.cover h1{font-size:38pt;line-height:1.08;margin:0 0 5mm;font-weight:800;color:${C.ink};position:relative}
.cover .sub{font-size:13.5pt;max-width:150mm;color:#374151;position:relative}
.cover .foot{position:absolute;bottom:16mm;left:0;right:0;font-size:9pt;color:#4b5563}

/* abertura */
.intro{break-after:page}
.intro .cards{margin-top:4mm}
.intro h1,.chapter-head h1{font-size:24pt;margin:0 0 4mm;line-height:1.15}
.lead{font-size:12.5pt;color:#374151}
.toc{list-style:none;padding:0;margin:4mm 0 0;display:grid;grid-template-columns:1fr 1fr;gap:6px}
.toc li{display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:12px;background:${theme.soft};font-weight:700;font-size:10pt}
.toc-n{color:${theme.main};font-weight:800;min-width:22px}

/* capítulos */
.chapter{margin-top:9mm}
.chapter-head{break-inside:avoid}
.keep{break-inside:avoid}
.chapter-head{display:flex;align-items:center;gap:14px;background:${theme.soft};border-radius:18px;padding:14px 18px;margin-bottom:6mm;border-left:8px solid ${theme.main}}
.chapter-head .num{font-size:10pt;font-weight:800;color:${theme.main};letter-spacing:.12em;text-transform:uppercase;margin:0}
.chapter-head h1{margin:0}
h2{display:flex;align-items:center;gap:10px;font-size:15pt;margin:7mm 0 3mm;break-after:avoid;color:${theme.dark}}
h3{font-size:15pt;margin:0;line-height:1.2}
.list{padding-left:20px;margin:0 0 10px}.list li{margin-bottom:4px}
.steps{background:#fff;border:2px solid ${theme.soft};border-radius:16px;padding:12px 16px 6px;margin:0 0 12px;break-inside:avoid}
.steps-title{font-weight:800;color:${theme.dark}}
.steps ol{list-style:none;counter-reset:s;padding:0;margin:0}
.steps li{counter-increment:s;display:flex;gap:10px;margin-bottom:8px;align-items:flex-start}
.steps li::before{content:counter(s);flex:none;width:24px;height:24px;border-radius:50%;background:${theme.main};color:#fff;font-weight:800;font-size:10pt;display:flex;align-items:center;justify-content:center;margin-top:1px}
.box{display:flex;gap:12px;align-items:flex-start;border-radius:14px;padding:12px 14px;margin:0 0 12px;break-inside:avoid}
.box p{margin:0 0 4px}.box-title{font-weight:800}
.tip{background:#fff7ed;border:1.5px solid #fed7aa}
.warn{background:#fef2f2;border:1.5px solid #fecaca}
.vet{background:#f0fdf4;border:1.5px solid #bbf7d0}
.cards{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 12px}
.card{border-radius:14px;background:${theme.soft};padding:12px 14px;break-inside:avoid}
.card-title{font-weight:800;margin:6px 0 3px}
.card p{margin-bottom:2px;font-size:10.5pt}
table{width:100%;border-collapse:separate;border-spacing:0;margin:0 0 12px;font-size:10pt;break-inside:avoid;border-radius:12px;overflow:hidden;border:1.5px solid #e5e7eb}
th{background:${theme.main};color:#fff;text-align:left;padding:7px 10px;font-weight:800}
td{padding:7px 10px;border-top:1px solid #e5e7eb;vertical-align:top}
tr:nth-child(even) td{background:#fafafa}
.twocol{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 12px;break-inside:avoid}
.col{border-radius:14px;padding:12px 14px}.col ul{margin:0;padding-left:18px}.col li{margin-bottom:3px;font-size:10.5pt}
.col-title{font-weight:800;font-size:12pt}
.good{background:#f0fdf4;border:1.5px solid #bbf7d0}.good .col-title{color:#15803d}
.bad{background:#fef2f2;border:1.5px solid #fecaca}.bad .col-title{color:#b91c1c}
.checklist{list-style:none;padding:0;margin:0 0 12px;break-inside:avoid}
.checklist li{display:flex;gap:10px;align-items:flex-start;padding:6px 0;border-bottom:1px dashed #e5e7eb}
.cb{flex:none;width:16px;height:16px;border:2px solid ${theme.main};border-radius:4px;margin-top:3px}
.figure{margin:2mm auto 6mm;text-align:center;break-inside:avoid}
.figure svg{width:60mm;height:60mm}
.figure figcaption{font-size:9.5pt;color:#6b7280}

/* receitas */
.recipe{break-inside:avoid;border:2px solid ${theme.soft};border-radius:18px;overflow:hidden;margin:0 0 7mm}
.recipe-head{display:flex;gap:14px;align-items:center;background:${theme.soft};padding:12px 16px}
.recipe-foods{display:flex;gap:2px;flex:none}
.food{display:inline-block;width:46px;height:46px;background:#fff;border-radius:50%;padding:4px}.food svg{width:100%;height:100%}
.recipe-kicker{margin:0;font-size:9pt;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:${theme.main}}
.recipe-meta{margin:3px 0 0;font-size:9.5pt;color:#4b5563;display:flex;gap:14px}
.recipe-body{display:grid;grid-template-columns:38% 1fr;gap:14px;padding:12px 16px 4px}
.rb-title{font-weight:800;color:${theme.dark};margin-bottom:4px}
.ingredients ul{padding-left:18px;margin:0}.ingredients li{margin-bottom:3px;font-size:10.5pt}
.method ol{padding-left:18px;margin:0}.method li{margin-bottom:4px;font-size:10.5pt}
.recipe-foot{padding:4px 16px 10px;font-size:10pt}
.recipe-foot p{margin:0 0 4px}
.recipe-note{background:#fff7ed;border-radius:10px;padding:6px 10px}

/* fechamento */
.closing{break-before:page;text-align:center;padding-top:20mm}
.closing .art{width:70mm;height:70mm;margin:0 auto 8mm}.closing .art svg{width:100%;height:100%}
.closing h1{font-size:24pt;margin:0 0 4mm}
.legal{margin-top:14mm;font-size:8.5pt;color:#6b7280;text-align:left;border-top:1px solid #e5e7eb;padding-top:4mm}
</style></head><body>

<section class="cover">
  <div class="blob" style="width:120mm;height:120mm;background:${theme.blob1};top:-30mm;right:-40mm"></div>
  <div class="blob" style="width:90mm;height:90mm;background:${theme.blob2};bottom:-20mm;left:-30mm"></div>
  <p class="brand">🐾 KIT DO PET</p>
  <div class="art">${g.coverArt}</div>
  <span class="kicker">${esc(g.kicker)}</span>
  <h1>${esc(g.title)}</h1>
  <p class="sub">${esc(g.subtitle)}</p>
  <p class="foot">Guia bônus do Kit do Pet · Edição ${esc(g.edition)}</p>
</section>

<section class="intro">
  <h1>${esc(g.introTitle)}</h1>
  ${g.intro.map((b) => renderBlock(b)).join("")}
  <h2>${icon("star", 34)}<span>O que você vai encontrar</span></h2>
  <ol class="toc">${toc}</ol>
</section>

${chapters
  .map(
    (ch) => `<section class="chapter">
  ${(() => {
    // título + primeiros blocos (até o primeiro passo a passo/tabela/receita) ficam juntos na mesma página
    const firstBig = ch.blocks.findIndex((x) => ["steps", "table", "recipe", "cards", "twocol"].includes(x.type));
    const keep = firstBig === -1 ? Math.min(2, ch.blocks.length) : Math.min(firstBig + 1, 3);
    const head = `<div class="chapter-head">${icon(ch.icon, 56)}<div><p class="num">Capítulo ${ch.n}</p><h1>${esc(ch.title)}</h1></div></div>`;
    // cada subtítulo (h2) fica na mesma página que o bloco seguinte
    const rest = ch.blocks.slice(keep);
    let restHtml = "";
    for (let i = 0; i < rest.length; i++) {
      if (rest[i].type === "h2" && rest[i + 1]) {
        restHtml += `<div class="keep">${renderBlock(rest[i])}${renderBlock(rest[i + 1])}</div>`;
        i++;
      } else restHtml += renderBlock(rest[i]);
    }
    return `<div class="keep">${head}${ch.blocks.slice(0, keep).map((b) => renderBlock(b)).join("")}</div>${restHtml}`;
  })()}
</section>`,
  )
  .join("")}

<section class="closing">
  <div class="art">${g.closingArt}</div>
  <h1>${esc(g.closingTitle)}</h1>
  ${g.closing.map((b) => renderBlock(b)).join("")}
  <p class="legal">${esc(g.legal)}</p>
</section>
</body></html>`;
}

async function main() {
  mkdirSync(outDir, { recursive: true });
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch();
  const only = process.argv[2];
  for (const g of GUIDES) {
    if (only && !g.file.includes(only)) continue;
    const page = await browser.newPage();
    await page.setContent(renderGuide(g), { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    const file = path.join(outDir, g.file);
    const coverFile = file.replace(/\.pdf$/, ".capa.tmp.pdf");
    const bodyFile = file.replace(/\.pdf$/, ".miolo.tmp.pdf");
    // capa (página 1) sem rodapé
    await page.pdf({ path: coverFile, format: "A4", printBackground: true, preferCSSPageSize: true, pageRanges: "1" });
    // miolo com rodapé e numeração
    await page.pdf({
      path: bodyFile,
      pageRanges: "2-",
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      footerTemplate: `<div style="width:100%;font-size:8px;color:#9ca3af;padding:0 16mm;display:flex;justify-content:space-between;font-family:sans-serif">
        <span>Kit do Pet · ${esc(g.title)}</span><span>página <span class="pageNumber"></span></span></div>`,
    });
    execFileSync("pdfunite", [coverFile, bodyFile, file]);
    rmSync(coverFile);
    rmSync(bodyFile);
    if (process.argv.includes("--html")) {
      const { writeFileSync } = await import("node:fs");
      writeFileSync(file.replace(/\.pdf$/, ".html"), renderGuide(g));
    }
    console.log("ok", path.relative(root, file));
    await page.close();
  }
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
