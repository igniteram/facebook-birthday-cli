import {decrypt, encrypt} from './crypto';
const config = require('../../resources/config.json');
const {getInstalledPath} = require('get-installed-path');

import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import {promisify} from 'util';

const writeFileAsync = promisify(fs.writeFile.bind(fs));

/**
 * @param  {any} file
 */
async function writeFile(file: any) {
  try {
    await writeFileAsync(
        path.join(await getInstalledPath('facebook-birthday-cli'), '/resources/config.json'),
        JSON.stringify(file, null, 4));
  } catch (Exception) {
    console.error(
        chalk.red('\nFailed to update config.json file! Most likely due to below reason: ') + '\n' +
        Exception.toString());
  }
}

/**
 * @param  {any} answers
 */
function encryptCredentials(answers: any) {
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
function decryptCredentials(answers: any) {
  try {
    answers.username = decrypt(config.username);
    answers.password = decrypt(config.password);
  } catch (Exception) {
    throw new Error(Exception);
  }
}

export {encryptCredentials, decryptCredentials, writeFile};
