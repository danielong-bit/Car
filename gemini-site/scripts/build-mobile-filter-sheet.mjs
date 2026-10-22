import {build} from 'esbuild';
import {mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export async function buildMobileFilterSheet(outputDirectory) {
  const assetsDirectory = path.join(outputDirectory, 'assets');
  await mkdir(assetsDirectory, {recursive: true});
  await build({
    absWorkingDir: projectRoot,
    entryPoints: ['src/mobile-filter-sheet.tsx'],
    outfile: path.join(assetsDirectory, 'mobile-filter-sheet.js'),
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
