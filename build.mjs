import * as esbuild from "esbuild";
import { copyFileSync, mkdirSync, rmSync, existsSync, readdirSync, statSync } from "fs";
import { join } from "path";

const isWatch = process.argv.includes("--watch");

const common = {
  bundle: true,
  outdir: "dist",
  minify: !isWatch,
  sourcemap: isWatch,
};

/**
 * 递归复制目录
 */
function copyDirRecursive(src, dest) {
  mkdirSync(dest, { recursive: true });
  const entries = readdirSync(src);
  for (const entry of entries) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    if (statSync(srcPath).isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * 将静态文件（manifest、HTML、icons）复制到 dist/
 * Chrome 加载 dist/ 作为扩展根目录
 */
function copyStaticFiles() {
  // manifest.json
  copyFileSync("manifest.json", "dist/manifest.json");

  // HTML 文件
  copyFileSync("popup.html", "dist/popup.html");
  copyFileSync("options.html", "dist/options.html");

  // CSS 文件
  copyFileSync("options.css", "dist/options.css");

  // 图标
  copyDirRecursive("icons", "dist/icons");
}

/**
 * 清理 dist 目录
 */
function cleanDist() {
  if (existsSync("dist")) {
    rmSync("dist", { recursive: true, force: true });
  }
  mkdirSync("dist", { recursive: true });
}

if (isWatch) {
  const [bgCtx, contentCtx] = await Promise.all([
    esbuild.context({
      ...common,
      entryPoints: { background: "src/background/index.ts" },
      format: "esm",
    }),
    esbuild.context({
      ...common,
      entryPoints: {
        content: "src/content/index.ts",
        popup: "src/popup/index.ts",
        options: "src/options/index.tsx",
      },
      format: "iife",
      jsx: "automatic",
      jsxImportSource: "react",
    }),
  ]);
  copyStaticFiles();
  await Promise.all([bgCtx.watch(), contentCtx.watch()]);
  console.log("Watching for changes...");
} else {
  // 先清理，再构建，最后复制静态文件
  cleanDist();

  await Promise.all([
    esbuild.build({
      ...common,
      entryPoints: { background: "src/background/index.ts" },
      format: "esm",
    }),
    esbuild.build({
      ...common,
      entryPoints: {
        content: "src/content/index.ts",
        popup: "src/popup/index.ts",
        options: "src/options/index.tsx",
      },
      format: "iife",
      jsx: "automatic",
      jsxImportSource: "react",
    }),
  ]);

  copyStaticFiles();
  console.log("Build complete.");
}
