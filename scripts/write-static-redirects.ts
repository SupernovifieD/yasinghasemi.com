import { mkdir, writeFile } from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";

import { getStaticRedirectOutputs } from "../lib/static-redirects";

async function main() {
  const outputRoot = resolve(process.cwd(), "out");
  const redirects = getStaticRedirectOutputs();

  for (const output of redirects) {
    const outputPath = resolve(outputRoot, output.outputPath);
    const relativePath = relative(outputRoot, outputPath);

    if (relativePath.startsWith(`..${sep}`) || relativePath === "..") {
      throw new Error(
        `Refusing to write outside the export: ${output.outputPath}`,
      );
    }

    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, output.content, "utf8");
  }

  console.log(`Generated ${redirects.length} legacy redirect documents.`);
}

void main();
