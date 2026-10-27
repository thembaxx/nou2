#!/usr/bin/env node
/**
 * Offline dependency guard: protect pnpm lockfile integrity and coordinated Prisma versions.
 * No credentials, filesystem writes, network or package installation.
 */
import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const lock = readFileSync(new URL("../pnpm-lock.yaml", import.meta.url), "utf8");
const importer = lock.split("\npackages:\n")[0];
const errors = [];

function specifier(name) {
  const key = name.startsWith("@") ? "'" + name + "'" : name;
  const marker = "      " + key + ":\n        specifier: ";
  const start = importer.indexOf(marker);
  if (start === -1) return null;
  return importer.slice(start + marker.length).split("\n", 1)[0].trim();
}

const cli = pkg.devDependencies?.prisma;
const client = pkg.dependencies?.["@prisma/client"];
if (!cli || !client || cli !== client) {
  errors.push("Prisma CLI and @prisma/client must have identical pinned versions.");
}
if (cli && !/^\d+\.\d+\.\d+$/.test(cli)) {
  errors.push("Use an exact stable Prisma release; never mix an RC with a stable client.");
}
for (const [name, version] of [
  ["prisma", cli],
  ["@prisma/client", client],
  ["next", pkg.dependencies?.next],
  ["better-auth", pkg.dependencies?.["better-auth"]],
]) {
  if (version && specifier(name) !== version) {
    errors.push(
      name + ": pnpm importer specifier " + JSON.stringify(specifier(name)) +
      " does not match " + JSON.stringify(version),
    );
  }
}
if (!lock.startsWith("lockfileVersion: '9.0'")) errors.push("Unexpected pnpm lockfile format.");
if (errors.length) {
  console.error("Dependency consistency check failed:\n" + errors.map((x) => "- " + x).join("\n"));
  process.exitCode = 1;
} else {
  console.log("Dependency consistency passed: Prisma versions and pnpm importer specifiers agree.");
}
