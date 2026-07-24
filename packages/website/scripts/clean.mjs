import {rm} from 'node:fs/promises';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const DIRECTORY_PATH = dirname(fileURLToPath(import.meta.url));
const DIST_PATH = join(dirname(DIRECTORY_PATH), 'dist');

await rm(DIST_PATH, {recursive: true, force: true});
