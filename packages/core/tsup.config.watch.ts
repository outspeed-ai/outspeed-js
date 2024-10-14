import buildConfig from "./tsup.config";
import { defineConfig } from "tsup";

export default defineConfig({
  ...buildConfig,
  dts: false,
  tsconfig: "./tsconfig.watch.json",
});
