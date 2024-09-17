import { defineConfig } from "tsup";
import { copyFileSync } from "fs";
import path from "path";

export default defineConfig({
  entry: ["src/**/*.(ts|tsx)"],
  dts: true,
  format: ["cjs", "esm"],
  clean: true,
  outDir: "dist",
  tsconfig: "./tsconfig.json",
  sourcemap: true,
  minify: false,
  splitting: false,
  onSuccess: async () => {
    const destPath = path.join(__dirname, "dist");
    const licensePath = path.join(__dirname, "..", "..", "LICENSE");
    copyFileSync(path.resolve(licensePath), path.join(destPath, "LICENSE"));
  },
});
