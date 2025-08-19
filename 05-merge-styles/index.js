const fs = require("fs/promises");
const path = require("path");

const stylesDir = path.join(__dirname, "05-merge-styles", "styles");
const bundlePath = path.join(__dirname, "project-dist", "bundle.css");

async function mergeStyles() {
  try {
    // Ensure output directory exists
    await fs.mkdir(path.dirname(bundlePath), { recursive: true });

    // Get all style files
    const items = await fs.readdir(stylesDir, { withFileTypes: true });
    const cssFiles = items
      .filter(item => item.isFile() && path.extname(item.name) === ".css")
      .map(item => path.join(stylesDir, item.name));

    // Read all CSS files in order
    const contents = await Promise.all(
      cssFiles.map(file => fs.readFile(file, "utf-8"))
    );

    // Write them into one file
    await fs.writeFile(bundlePath, contents.join("\n"));
    console.log("CSS merged successfully into bundle.css");
  } catch (err) {
    console.error("Error merging CSS:", err);
  }
}

mergeStyles();
