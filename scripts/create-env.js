const fs = require("fs");
const shell = require("shelljs");
const path = require("path");

const DIR = __dirname;
const FILE = "../src/constants/secrets.ts";

const REPLACEMENTS = [
  {
    pattern: /export const DISCORD_WEBHOOK_URL\s*=\s*["'`].*?["'`];/,
    replacement: `export const DISCORD_WEBHOOK_URL = "${process.env.DISCORD_WEBHOOK_URL}";`,
  },
  {
    pattern: /export const DISCORD_FEEDBACK_WEBHOOK\s*=\s*["'`].*?["'`];/,
    replacement: `export const DISCORD_FEEDBACK_WEBHOOK = "${process.env.DISCORD_FEEDBACK_WEBHOOK}";`,
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
