import * as program from 'commander';
import * as inquirer from 'inquirer';

const config = require('../resources/config.json');
import chalk from 'chalk';
import {BirthdayWisher, wishes} from './birthday';
import {decryptCredentials, writeFile} from './utils/config';

const pkg: any = require('../package.json');
const loginText: string = '\nPlease wait! Logging in...\n';

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
        if (options.reset) {
          config.firstLogin = true;
          config.save = false;
          const keys = Object.keys(config);
          for (let i: number = 2; i < 5; i++) {
            config[keys[i]] = '';
          }
          config.day = 1;
          config.birthdayNames = [];
          await writeFile(config);
          console.log(chalk.green(
              '\nSuccessfully reset to default values! Please run "facebook wish" to start over.\n'));
          process.exit(0);
        }
        const Wisher = new BirthdayWisher();
        let credentials: any;
        if (config.firstLogin) {
          console.log('\n');
          config.day = new Date().getDay();
          await writeFile(config);
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
          await Wisher.login(credentials);
        } else {
          const savedCredentials: any = {};
          decryptCredentials(savedCredentials);
          console.log(chalk.yellowBright(loginText));
          await Wisher.login(savedCredentials);
        }
        if (!options.all) {
          await Wisher.findAndWish(credentials);
        } else {
          if (!config.save) {
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
                message: 'Do you want to save this configuration?',
                name: 'config',
                type: 'confirm',
              },
            ]);
            if (answer.config) {
              config.save = true;
              config.wish = answer.wish;
              await writeFile(config);
            }
            await Wisher.findAndWishAll(credentials, answer.wish);
          } else {
            await Wisher.findAndWishAll(credentials, config.wish);
          }
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
