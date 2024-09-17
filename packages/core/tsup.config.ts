import { defineConfig } from "tsup";
import { copyFileSync } from "fs";
import { join, resolve } from "path";

export default defineConfig({
  entry: ["src/**/*.ts", "!**/*/__tests__/**/*", "!**/*/__mocks__/**/*"],
  dts: true,
  format: ["cjs", "esm"],
  clean: true,
  outDir: "./dist",
  tsconfig: "./tsconfig.json",
  sourcemap: true,
  minify: false,
  splitting: false,
  onSuccess: async () => {
    const destPath = join(__dirname, "dist");
    const licensePath = join(__dirname, "..", "..", "LICENSE");
    copyFileSync(resolve(licensePath), join(destPath, "LICENSE"));
  },
});
