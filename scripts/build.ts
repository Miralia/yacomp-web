import { createHash } from "crypto";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const root = join(import.meta.dir, "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf-8"));
const banner = readFileSync(join(root, "meta", "banner.txt"), "utf-8")
  .trimEnd()
  .replace("__VERSION__", pkg.version);
const watch = process.argv.includes("--watch");

async function buildUserscript() {
  const result = await Bun.build({
    entrypoints: [join(root, "src", "index.ts")],
    outdir: join(root, "dist"),
    naming: "yacomp.user.js",
    target: "browser",
    format: "iife",
    minify: false,
    sourcemap: "none",
  });

  if (!result.success) {
    console.error("Build failed:");
    for (const msg of result.logs) {
      console.error(msg);
    }
    process.exit(1);
  }

  // Prepend the userscript banner
  const outPath = join(root, "dist", "yacomp.user.js");
  const bundled = readFileSync(outPath, "utf-8");
  writeFileSync(outPath, banner + "\n\n" + bundled);

  console.log(`✓ dist/yacomp.user.js (${(bundled.length / 1024).toFixed(1)} KB)`);
}

async function buildWebEmbed() {
  const result = await Bun.build({
    entrypoints: [join(root, "src", "embed.ts")],
    outdir: join(root, "dist"),
    naming: "yacomp-web.esm.js",
    target: "browser",
    format: "esm",
    minify: true,
    sourcemap: "none",
  });

  if (!result.success) {
    console.error("Web embed build failed:");
    for (const msg of result.logs) console.error(msg);
    process.exit(1);
  }

  const outPath = join(root, "dist", "yacomp-web.esm.js");
  const bundled = readFileSync(outPath);
  const sha256 = createHash("sha256").update(bundled).digest("hex");
  const manifest = {
    name: pkg.name,
    version: pkg.version,
    upstreamVersion: pkg.upstreamVersion,
    file: "yacomp-web.esm.js",
    sha256,
  };

  writeFileSync(
    join(root, "dist", "yacomp-web.manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n",
  );
  writeFileSync(
    join(root, "dist", "yacomp-web.esm.js.sha256"),
    `${sha256}  yacomp-web.esm.js\n`,
  );

  console.log(`✓ dist/yacomp-web.esm.js (${(bundled.length / 1024).toFixed(1)} KB)`);
}

async function build() {
  await buildUserscript();
  await buildWebEmbed();
}

if (watch) {
  const { watch: fsWatch } = await import("fs");
  console.log("Watching src/ for changes...");
  await build();
  fsWatch(join(root, "src"), { recursive: true }, async () => {
    try { await build(); } catch (e) { console.error(e); }
  });
} else {
  await build();
}
