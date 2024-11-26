import { defineConfig } from "tsup";
import { copyFileSync } from "fs";
import { join, resolve } from "path";

export default defineConfig({
  entry: ["src/**/*.(ts|tsx)"],
  dts: true,
  format: ["cjs", "esm"],
  outDir: "dist",
  tsconfig: "./tsconfig.json",
  sourcemap: true,

  // Bundle settings
  clean: true,
  splitting: true,
  treeshake: true,
  minify: false, // minification not recommended for libraries/packages

  // Don't bundle these
  external: [
    'react',
    'react-dom',
    '@radix-ui/react-*'
  ],
  onSuccess: async () => {
    const destPath = join(__dirname, "dist");
    const licensePath = join(__dirname, "..", "..", "LICENSE");
    const styles = join(__dirname, "styles.css");
    copyFileSync(resolve(licensePath), join(__dirname, "LICENSE"));
    copyFileSync(resolve(styles), join(destPath, "styles.css"));
  },
});
