/* Soleia Wellness page validator.
   Dependency-free. Checks every HTML page:
   - has a <title> and meta description
   - all internal href/src (local relative) files exist
   - inline application/ld+json parses
   - robots.txt and sitemap.xml exist and sitemap URLs match local files
   Run: node verify-pages.js */
"use strict";

const fs = require("fs");
const path = require("path");

const BASE = __dirname;
const homes = ["https://ari-builds.github.io/soleia-wellness"];
const htmlFiles = fs.readdirSync(BASE).filter((f) => f.endsWith(".html"));
const errors = [];
const warns = [];

function exists(p) {
  try { return fs.statSync(path.join(BASE, p)).isFile(); } catch (e) { return false; }
}

for (const file of htmlFiles) {
  const src = fs.readFileSync(path.join(BASE, file), "utf8");
  const show = (why) => `${file}: ${why}`;

  if (!/<title>[^<]+<\/title>/.test(src)) errors.push(show("missing <title>"));
  if (!/<meta name="description" content="[^"]+/.test(src)) errors.push(show("missing meta description"));
  if (!/link rel="canonical"/.test(src)) errors.push(show("missing canonical"));
  if (!/"@context":\s*"https:\/\/schema.org"/.test(src)) errors.push(show("missing JSON-LD"));
  if (!/<body data-page="([a-z0-9-]+)"/.test(src)) errors.push(show("missing data-page on body"));

  let m;
  const refRe = /(?:href|src)="([^"#]+)"/g;
  while ((m = refRe.exec(src)) !== null) {
    const ref = m[1];
    if (!ref) continue;
    if (/^(https?:|data:|mailto:|tel:|javascript:|sms:)/.test(ref)) {
      if (!ref.startsWith("https:")) continue;
      if (ref.startsWith(homes[0] + "/")) {
        const local = ref.replace(homes[0] + "/", "");
        if (local && !exists(local) && !/[(#]/.test(ref.split("#")[1])) warns.push(show(`https ref missing locally: ${ref}`));
      }
      continue;
    }
    const clean = ref.split("#")[0].length ? ref.split("#")[0] : ref;
    if (clean && !exists(clean)) errors.push(show(`missing target: ${clean}`));
  }

  const ld = [...src.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  for (const block of ld) {
    try { JSON.parse(block[1]); } catch (e) { errors.push(show(`invalid JSON-LD: ${e.message}`)); }
  }

  // every page keeps a consistent <html lang>
  if (!/<html lang="en">/.test(src)) warns.push(show("html lang not 'en'"));
}

// robots + sitemap cross-check
if (!exists("robots.txt")) errors.push("robots.txt missing");
else {
  const robots = fs.readFileSync(path.join(BASE, "robots.txt"), "utf8");
  if (!/Sitemap:\s*https:\/\/ari-builds\.github\.io\/soleia-wellness\/sitemap\.xml/.test(robots))
    errors.push("robots.txt missing sitemap pointer");
}
if (!exists("sitemap.xml")) errors.push("sitemap.xml missing");
else {
  const sitemap = fs.readFileSync(path.join(BASE, "sitemap.xml"), "utf8");
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  for (const url of urls) {
    const local = url.replace(homes[0] + "/", "") || "index.html";
    if (!exists(local)) errors.push(`sitemap references missing file: ${local}`);
  }
  const pageUrls = new Set(["/", ...htmlFiles.map((f) => "/" + f)]);
  for (const p of pageUrls) {
    if (!urls.includes(homes[0] + p)) warns.push(`page not in sitemap: ${p}`);
  }
}

console.log(`checked ${htmlFiles.length} html pages + robots.txt + sitemap.xml\n`);
if (warns.length) { console.log("WARNINGS:"); warns.forEach((w) => console.log("  - " + w)); console.log(); }
if (errors.length) {
  console.log("ERRORS:"); errors.forEach((e) => console.log("  - " + e));
  console.log(`\n${errors.length} error(s) found.`); process.exit(1);
}
console.log("All checks passed.");
process.exit(0);