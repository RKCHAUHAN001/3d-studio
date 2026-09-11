const esbuild = require("esbuild");

const watch = process.argv.includes("--watch");

async function build() {
  await esbuild.build({
    entryPoints: ["src/extension.ts"],
    outfile: "dist/extension.js",
    bundle: true,
    platform: "node",
    format: "cjs",
    target: "node20",
    external: ["vscode"],
    sourcemap: true,
    minify: false,
    logLevel: "info"
  });

  await esbuild.build({
    entryPoints: ["media/viewer.ts"],
    outfile: "dist/viewer.js",
    bundle: true,
    platform: "browser",
    format: "iife",
    target: "es2020",
    sourcemap: true,
    minify: false,
    logLevel: "info"
  });

  console.log("3D Model Viewer build completed.");
}

async function main() {
  if (watch) {
    const extensionContext = await esbuild.context({
      entryPoints: ["src/extension.ts"],
      outfile: "dist/extension.js",
      bundle: true,
      platform: "node",
      format: "cjs",
      target: "node20",
      external: ["vscode"],
      sourcemap: true,
      logLevel: "info"
    });

    const viewerContext = await esbuild.context({
      entryPoints: ["media/viewer.ts"],
      outfile: "dist/viewer.js",
      bundle: true,
      platform: "browser",
      format: "iife",
      target: "es2020",
      sourcemap: true,
      logLevel: "info"
    });

    await extensionContext.watch();
    await viewerContext.watch();

    console.log("Watching...");
    return;
  }

  await build();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});