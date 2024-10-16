/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */

const path = require("path");
const fs = require("fs");

const dist = path.resolve(path.join(process.cwd(), "dist"));

if (!fs.existsSync(dist)) {
  throw new Error(
    `${dist} doesn't exist. Make sure to run pnpm build before running pnpm check-exports. If you have run pnpm build, then make sure you are running pnpm check-exports from the packages/<package-name> directory.`
  );
}

function checkAllPathsInExport(exportPaths) {
  for (const exportEntry in exportPaths) {
    const base = exportPaths[exportEntry];

    if (!fs.existsSync(base.types)) {
      throw new Error(`${base.types} doesn't exist`);
    }
    if (!fs.existsSync(base.import)) {
      throw new Error(`${base.import} doesn't exist`);
    }
    if (!fs.existsSync(base.require)) {
      throw new Error(`${base.require} doesn't exist`);
    }
  }
}

function getAllExports(directory) {
  const files = fs.readdirSync(directory);
  let newExports = {};
  let typesVersions = {};
  for (const file of files) {
    const filepath = path.join(directory, file);

    if (fs.lstatSync(filepath).isDirectory()) {
      const { newExports: _n, typesVersions: _t } = getAllExports(filepath);
      newExports = { ...newExports, ..._n };
      typesVersions = { ...typesVersions, ..._t };
      continue;
    }

    if (
      !filepath.endsWith(".js") ||
      filepath.includes("index") ||
      filepath.includes("__internal")
    )
      continue;

    const relativePath = path.relative(dist, directory);
    const filename = file.replace(".js", "");
    const relativeImportPath = relativePath
      ? `${relativePath}/${filename}`
      : filename;

    // Exports
    const typesPath = `./dist/${relativeImportPath}.d.ts`;
    const importPath = `./dist/${relativeImportPath}.mjs`;
    const requirePath = `./dist/${relativeImportPath}.js`;

    newExports[`./${filename}`] = {
      types: typesPath,
      import: importPath,
      require: requirePath,
    };
    typesVersions[filename] = [typesPath];
  }

  return { newExports, typesVersions };
}

const { newExports, typesVersions } = getAllExports(dist);
checkAllPathsInExport(newExports);

// Reading package.json
const packageJsonPath = path.resolve("package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath));

const additional = process.argv.slice(2);
const additionalExport = {};
for (const entry of additional) {
  additionalExport[`./${entry}`] = `./dist/${entry}`;
}

packageJson.exports = {
  ".": {
    import: {
      types: "./dist/index.d.mts",
      default: "./dist/index.mjs",
    },
    require: {
      types: "./dist/index.d.ts",
      default: "./dist/index.js",
    },
  },
  ...newExports,
  ...additionalExport,
};

packageJson.typesVersions = {
  "*": typesVersions,
};

console.log(
  "All exports exist, you can copy the following exports object into your package.json."
);

console.log("All exports");
console.log(JSON.stringify(packageJson.exports, undefined, 2));

console.log("All typesVersions");
console.log(JSON.stringify(packageJson.typesVersions, undefined, 2));
