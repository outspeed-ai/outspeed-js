/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */

const path = require("path");
const fs = require("fs");

const dist = path.resolve(path.join(process.cwd(), "dist"));

if (!fs.existsSync(dist)) {
  throw new Error(
    `${dist} doesn't exist. Make sure to run pnpm build before running pnpm update-exports. If you have run pnpm build, then make sure you are running pnpm update-exports from the packages/<package-name> directory.`
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
    if (!fs.existsSync(base.default)) {
      throw new Error(`${base.default} doesn't exist`);
    }
  }
}

function getAllExports(directory) {
  const files = fs.readdirSync(directory);
  let newExports = {};
  for (const file of files) {
    const filepath = path.join(directory, file);

    if (fs.lstatSync(filepath).isDirectory()) {
      newExports = { ...newExports, ...getAllExports(filepath) };
      continue;
    }

    if (
      !filepath.endsWith(".js") ||
      filepath.includes("index") ||
      filepath.includes("@types") ||
      filepath.includes("__internal")
    )
      continue;

    const relativePath = path.relative(dist, directory);
    const filename = file.replace(".js", "");
    const importName = relativePath ? `${relativePath}/${filename}` : filename;
    const typesPath = `./dist/${importName}.d.ts`;
    const importPath = `./dist/${importName}.mjs`;
    const requirePath = `./dist/${importName}.js`;
    const defaultPath = `./dist/${importName}.js`;

    newExports[`./${importName}`] = {
      types: typesPath,
      import: importPath,
      require: requirePath,
      default: defaultPath,
    };
  }

  return newExports;
}

const newExports = getAllExports(dist);
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

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
