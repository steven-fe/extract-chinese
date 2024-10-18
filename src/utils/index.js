import * as fsPromise from 'node:fs/promises';

export async function readJsonFile(filePath) {
  return JSON.parse(await fsPromise.readFile(filePath));
}

export async function importLocalFile(filePath) {
  return await import(`file:///${filePath}`);
}
