const esbuild = require("esbuild");
const watch = process.argv.includes("--watch");
const ctx = {
    entryPoints: [
        "src/extension.ts"
    ],
    bundle: true,
    outfile: "dist/extension.js",
    platform: "node",
    format: "cjs",
    external: [
        "vscode"
    ],
    sourcemap: true,
    minify: false,
    target: "node20"
};
if (watch) {
    esbuild.context(ctx).then(async (context) => {
        await context.watch();
        console.log("Watching...");
    });
}
else {
    esbuild.build(ctx);
}