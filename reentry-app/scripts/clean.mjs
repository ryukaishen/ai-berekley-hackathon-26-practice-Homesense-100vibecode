import { rm } from "node:fs/promises";
import { join } from "node:path";

const workspaces = [
  "apps/web/dist",
  "apps/api/dist",
  "packages/ui/dist",
  "packages/shared/dist"
];

await Promise.all(
  workspaces.map((folder) =>
    rm(join(process.cwd(), folder), { recursive: true, force: true })
  )
);

console.log("Cleaned build outputs.");

