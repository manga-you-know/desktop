const fs = require("fs");
const shell = require("shelljs");
const path = require("path");

const DIR = __dirname;
const FILE = "../src/constants/_secrets.ts";

const REPLACEMENTS = [
  {
    pattern: /export const DISCORD_WEBHOOK_URL = ["'`&]+;/,
    replacement: `export const DISCORD_WEBHOOK_URL = "${process.env.DISCORD_WEBHOOK_URL}";`,
  },
];

const fullPath = path.resolve(DIR, FILE);
REPLACEMENTS.forEach(({ pattern, replacement }) => {
  shell.sed("-i", pattern, replacement, fullPath);

  const updatedContent = fs.readFileSync(fullPath, "utf8");
  if (!updatedContent.includes(replacement)) {
    console.error(`Failed to apply: ${replacement.split(" ")[2]}`);
  } else {
    console.log(`Replaced with success: ${replacement.split(" ")[2]}`);
  }
});
