import {writeFileSync, createReadStream, createWriteStream} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import pkg from '../package.json' with {type: 'json'};

const packageDirPath = resolve(fileURLToPath(import.meta.url), '../..');

createPackageJsonFile(packageDirPath);
copyFiles(packageDirPath);

function createPackageJsonFile(packageDirPath) {
  const {name, version, description, keywords, type, sideEffects, exports, files, author, license, engines} = pkg;
  const content = {name, version, description, keywords, type, sideEffects, exports, files, author, license, engines};
  writeFileSync(resolve(packageDirPath, 'dist/package.json'), JSON.stringify(content, null, 2), 'utf8');
}

function copyFiles(packageDirPath) {
  createReadStream(resolve(packageDirPath, 'README.md')).pipe(createWriteStream(resolve(packageDirPath, 'dist/README.md')));
  createReadStream(resolve(packageDirPath, '../../LICENSE')).pipe(createWriteStream(resolve(packageDirPath, 'dist/LICENSE')));
}
