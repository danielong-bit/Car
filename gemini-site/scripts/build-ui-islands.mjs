import {build} from 'esbuild';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildMobileFilterSheet} from './build-mobile-filter-sheet.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function buildIsland(entryPoint, outfile) {
  await build({
    absWorkingDir: projectRoot,
    entryPoints: [entryPoint],
    outfile,
    bundle: true,
    minify: true,
    format: 'esm',
    platform: 'browser',
    target: ['es2022'],
    jsx: 'automatic',
    nodePaths: [path.join(projectRoot, 'node_modules')],
    define: {'process.env.NODE_ENV': '"production"'},
  });
}

export async function buildUiIslands(outputDirectory, {includeOwner = false} = {}) {
  const assetsDirectory = path.join(outputDirectory, 'assets');
  await mkdir(assetsDirectory, {recursive: true});
  await buildMobileFilterSheet(outputDirectory);
  await buildIsland('src/inventory-count.tsx', path.join(assetsDirectory, 'inventory-count.js'));
  if (includeOwner) {
    await buildIsland('src/workbench-ui.tsx', path.join(assetsDirectory, 'workbench-ui.js'));
    const ownerCss = await readFile(path.join(projectRoot, 'src/workbench-ui.css'), 'utf8');
    await writeFile(path.join(assetsDirectory, 'workbench-ui.css'), ownerCss);
  }
}
