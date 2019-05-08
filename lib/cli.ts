import chalk from 'chalk';
import * as program from 'commander';
import * as inquirer from 'inquirer';

import {BirthdayWisher, wishes} from './birthday';
import {configFileExists, decryptCredentials, getConfigPath, writeFile} from './utils/config';

const configBirthdayNames: string[] = [];

let config: any = {
  firstLogin: true,
  save: false,
  username: '',
  password: '',
  birthday: true,
  wish: '',
  day: 1,
  birthdayNames: configBirthdayNames,
};

const pkg: any = require('../package.json');
const loginText: string = '\nPlease wait! Logging & Fetching Birthdays!...\n';

program.version(pkg.version)
    .description('Facebook Birthday CLI')
    .command('*', '', {noHelp: true, isDefault: true})
    .action(() => {
      program.help();
    });

program.command('wish')
    .alias('w')
    .description('Facebook wish command')
    .option('-a, --all', 'wish all friends')
    .option('-r, --reset', 'resets all config values to default')
    .action(async (options: any) => {
      try {
        if (!await configFileExists()) {
          await writeFile(config);
        }
        const savedConfig = require(await getConfigPath());
        if (options.reset) {
          await writeFile(config);
          console.log(chalk.green(
              '\nSuccessfully reset to default values! Please run "facebook wish" to start over.\n'));
        } else {
          const today = new Date().getDay();
          const Wisher = new BirthdayWisher();
          let credentials: any;
          if (savedConfig.firstLogin === true) {
            console.log('\n');
            config.day = today;
            credentials = await inquirer.prompt([
              {
                message: 'Please enter your facebook username:',
                name: 'username',
                type: 'input',
              },
              {
                message: 'Please enter your facebook password:',
                name: 'password',
                mask: '*',
                type: 'password',
              },
            ]);
            console.log(chalk.yellowBright(loginText));
            config = await Wisher.login(credentials, config, savedConfig);
          } else {
            if (savedConfig.birthday === false) {
              console.error(chalk.red(
                  '\n' +
                  'Today none of your friends have birthdays, Please try tomorrow!' +
                  '\n'));
              process.exit(0);
            }
            if (savedConfig.day === today && savedConfig.birthdayNames.length === 0) {
              console.error(chalk.red(
                  '\n' +
                  'You have wished all your friends, Please try tomorrow!' +
                  '\n'));
              process.exit(0);
            }
            const savedCredentials: any = {};
            decryptCredentials(savedConfig, savedCredentials);
            console.log(chalk.yellowBright(loginText));
            config = await Wisher.login(savedCredentials, config, savedConfig);
          }
          if (!options.all) {
            config = await Wisher.findAndWish(config, savedConfig);
          } else {
            if (!savedConfig.save) {
              wishes.splice(wishes.indexOf('custom message'), 1);
              const answer: any = await inquirer.prompt([
                {
                  choices: wishes,
                  message: 'Select your favourite birthday wish:',
                  name: 'wish',
                  type: 'list',
                },
                {
                  default: true,
                  message: 'Do you want to save this message?',
                  name: 'message',
                  type: 'confirm',
                },
              ]);
              if (answer.message) {
                config.save = true;
                config.wish = answer.wish;
              }
              config = await Wisher.findAndWishAll(answer.wish, config, savedConfig);
            } else {
              config = await Wisher.findAndWishAll(savedConfig.wish, config, savedConfig);
            }
          }
          await writeFile(config);
          process.exit(0);
        }
      } catch (Exception) {
        console.error(chalk.red('\n' + Exception.toString() + '\n'));
        process.exit(0);
      }
    });

program.parse(process.argv);

if (!program.args.length) {
  program.help();
}
