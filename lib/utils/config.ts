import {decrypt, encrypt} from './crypto';
const {getInstalledPath} = require('get-installed-path');

import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import {promisify} from 'util';

const writeFileAsync = promisify(fs.writeFile.bind(fs));

async function getConfigPath(): Promise<string> {
  return path.join(await getInstalledPath('facebook-birthday-cli'), '/config.json');
}
/**
 * @param  {any} file
 */
async function writeFile(file: any) {
  try {
    await writeFileAsync(await getConfigPath(), JSON.stringify(file, null, 4));
  } catch (Exception) {
    console.error(
        chalk.red('\nFailed to update config.json file! Most likely due to below reason: ') + '\n' +
        Exception.toString());
  }
}

async function configFileExists(): Promise<boolean> {
  if (fs.existsSync(await getConfigPath())) {
    return true;
  }
  return false;
}

/**
 * @param  {any} answers
 */
function encryptCredentials(config: any, answers: any) {
  try {
    config.username = encrypt(answers.username);
    config.password = encrypt(answers.password);
  } catch (Exception) {
    throw new Error(Exception);
  }
}

/**
 * @param  {any} answers
 */
function decryptCredentials(config: any, answers: any) {
  try {
    answers.username = decrypt(config.username);
    answers.password = decrypt(config.password);
  } catch (Exception) {
    throw new Error(Exception);
  }
}

export {getConfigPath, writeFile, configFileExists, encryptCredentials, decryptCredentials};
