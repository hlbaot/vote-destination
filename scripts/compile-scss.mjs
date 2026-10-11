import fs from "fs";
import path from "path";
import * as sass from "sass";

const fontImport = `@import url("https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap");`;
const tailwindImport = `@import "tailwindcss";`;

const scssEntry = path.resolve("src/scss/index.scss");
const cssOutput = path.resolve("src/app/globals.css");

try {
  const result = sass.compile(scssEntry, {
    style: "expanded",
    sourceMap: false,
  });

  // Remove duplicate charset or font imports from compiled output
  let compiledCss = result.css
    .replace(/^@charset "[^"]*";\s*/g, "")
    .replace(/@import url\([^)]+\);\s*/g, "");

  const finalCss = `${fontImport}\n${tailwindImport}\n\n${compiledCss}`;
  fs.writeFileSync(cssOutput, finalCss, "utf8");
  console.log("Successfully compiled SCSS to src/app/globals.css");
} catch (err) {
  console.error("Error compiling SCSS:", err);
  process.exit(1);
}
