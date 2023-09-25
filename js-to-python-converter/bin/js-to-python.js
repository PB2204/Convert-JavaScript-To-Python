#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { translateJSToPython } = require("../lib/converter");

const filePath = process.argv[2];
const outputFolder = process.argv[3];

if (!filePath || !outputFolder) {
  console.error("Usage: js2py <file_path> <output_folder>");
  process.exit(1);
}

try {
  const jsCode = fs.readFileSync(filePath, "utf-8");
  const pythonCode = translateJSToPython(jsCode);

  // Create the output directory if it doesn't exist
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
  }

  const outputPath = path.join(outputFolder, "output.py");
  fs.writeFileSync(outputPath, pythonCode);
  console.log(`JavaScript code converted and saved to ${outputPath}`);
} catch (err) {
  console.error("Error:", err);
  process.exit(1);
}