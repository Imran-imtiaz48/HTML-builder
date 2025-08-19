const fs = require("fs/promises");
const path = require("path");

const distDir = path.join(__dirname, "project-dist");
const assetsSrc = path.join(__dirname, "assets");
const assetsDist = path.join(distDir, "assets");
const htmlDist = path.join(distDir, "index.html");
const cssDist = path.join(distDir, "style.css");
const templateFile = path.join(__dirname, "template.html");
const componentsDir = path.join(__dirname, "components");
const stylesDir = path.join(__dirname, "styles");

// Ensure directories exist
async function prepareDist() {
  await fs.mkdir(distDir, { recursive: true });
  await fs.mkdir(assetsDist, { recursive: true });
  await fs.writeFile(htmlDist, "");
  await fs.writeFile(cssDist, "");
}

// Copy assets folder recursively
async function copyAssets(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyAssets(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

// Build HTML by replacing components
async function buildHtml() {
  let template = await fs.readFile(templateFile, "utf-8");
  const components = await fs.readdir(componentsDir, { withFileTypes: true });

  for (const comp of components) {
    if (comp.isFile() && path.extname(comp.name) === ".html") {
      const placeholder = `{{${path.basename(comp.name, ".html")}}}`;
      const content = await fs.readFile(path.join(componentsDir, comp.name), "utf-8");
      template = template.replace(placeholder, content);
    }
  }

  await fs.writeFile(htmlDist, template);
}

// Merge all CSS into one
async function buildCss() {
  const styles = await fs.readdir(stylesDir, { withFileTypes: true });
  const cssContents = [];

  for (const file of styles) {
    if (file.isFile() && path.extname(file.name) === ".css") {
      const content = await fs.readFile(path.join(stylesDir, file.name), "utf-8");
      cssContents.push(content);
    }
  }

  await fs.writeFile(cssDist, cssContents.join("\n"));
}

// Main build process
async function build() {
  try {
    await prepareDist();
    await copyAssets(assetsSrc, assetsDist);
    await buildHtml();
    await buildCss();
    console.log("Build completed successfully!");
  } catch (err) {
    console.error("Build failed:", err);
  }
}

build();
