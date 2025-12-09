import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dir = path.join(__dirname, "public", "icons", "blade");

const files = fs.readdirSync(dir).filter((f) => f.endsWith(".svg"));

const icons = files.map((file) => {
  const id = file.replace(".svg", "");

  const label = id
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    id,
    label,
    url: `/icons/blade/${file}`,
  };
});

console.log("export const weaponIcons = ");
console.log(JSON.stringify(icons, null, 2));
console.log(";");
