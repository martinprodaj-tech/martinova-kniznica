import { readFile, writeFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../app/books.ts", import.meta.url), "utf8");
const executable = source
  .replace(/export type Book = \{[\s\S]*?\};\s*/, "")
  .replace("(title: string)", "(title)")
  .replace("export const books: Book[] =", "const books =")
  .concat("\nbooks;");

const books = vm.runInNewContext(executable, { encodeURIComponent });
await writeFile(
  new URL("../books.json", import.meta.url),
  `${JSON.stringify(books, null, 2)}\n`,
  "utf8",
);

console.log(`Exported ${books.length} books.`);
