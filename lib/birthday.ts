import chalk from 'chalk';
import * as inquirer from 'inquirer';

import {ElementHandle} from 'puppeteer';
import {locators} from './helpers/locators';
import {PageHelper} from './helpers/pageHelper';
import {encryptCredentials, writeFile} from './utils/config';

const config = require('../resources/config.json');
const wishes: string[] = [
  'Happy Birthday!',
  'Happy Birthday Buddy!',
  'Happy Birthday my Friend!',
  'Wish you many many happy returns of the day!',
  'I want to write my own custom message!',
];
let currentRetryCount: number = 0;

class BirthdayWisher {
  public page = new PageHelper();
  /**
   * @param  {string[]} names
   */
  private async birthdayQuestions(names: string[]) {
    return await inquirer.prompt([
      {
        choices: names,
        message: 'Please select the people you wanna wish?',
        name: 'birthdayName',
        type: 'list',
      },
      {
        choices: wishes,
        message: 'Select your favourite birthday wish:',
        name: 'wish',
        type: 'list',
      },
      {
        message: 'Please write your own custom wish:',
        name: 'customWish',
        type: 'input',
        when: (birthdayAnswers: any) => birthdayAnswers.wish.indexOf('custom message') > -1,
      },
    ]);
  }
  /**
   * @param  {any} answers
   */
  public async login(answers: any) {
    try {
      await this.page.init();
      await this.page.open(locators.url);
      await this.page.focusElement(locators.username);
      await this.page.clearElement(locators.username);
      await this.page.sendElementText(locators.username, answers.username);
      await this.page.focusElement(locators.password);
      await this.page.clearElement(locators.password);
      await this.page.sendElementText(locators.password, answers.password);
      await Promise.all([
        this.page.clickElement(locators.loginButton),
        this.page.waitForNavigation({waitUntil: 'networkidle2'}),
      ]);
      await this.page.open(locators.url + '/events/birthdays');

    } catch (Exception) {
      try {
        config.firstLogin = true;
        config.username = '';
        config.password = '';
        await writeFile(config);
        const title = await this.page.getTitle();
        if (title.indexOf('Events') === -1) {
          throw new Error(
              'Login Failed! Most likely due to Invalid Credentials or below reason :' +
              '\n' + Exception.toString());
        }
      } catch (Exception) {
        throw Exception;
      }
    }
  }
  /**
   * @returns Promise<string[]>
   */
  public async fetchBirthdayNames(): Promise<string[]> {
    return await this.page.getText(locators.birthdayNames);
  }
  /**
   * @returns Promise<ElementHandle[]>
   */
  public async fetchAllTexts(): Promise<ElementHandle[]> {
    return await this.page.$$(locators.birthdayText);
  }

  /**
   * @param  {string[]} birthdayNames
   * @param  {ElementHandle[]} birthdayTexts
   */
  public async wishAll(birthdayNames: string[], birthdayTexts: ElementHandle[], wish: string) {
    await this.page.enterAllElementText(birthdayTexts, wish);
    console.log(chalk.green('\nSuccessfully wished:\n'));
    birthdayNames.forEach((name: string) => {
      console.log(chalk.green(name + '\n'));
    });
    config.birthdayNames = [];
    await writeFile(config);
  }

  /**
   * @param  {string[]} birthdayNames
   * @param  {ElementHandle[]} birthdayTexts
   */
  public async birthdayWish(
      credentials: any, birthdayNames: string[], birthdayTexts: ElementHandle[]) {
    let indexOfBirthdayName: number;
    const birthdayAnswers: any = await this.birthdayQuestions(birthdayNames);
    indexOfBirthdayName = birthdayNames.indexOf(birthdayAnswers.birthdayName);

    if (birthdayAnswers.wish.indexOf('custom message') > 0) {
      await this.page.enterElementText(
          indexOfBirthdayName, birthdayTexts, birthdayAnswers.customWish);

    } else {
      await this.page.enterElementText(indexOfBirthdayName, birthdayTexts, birthdayAnswers.wish);
    }
    console.log(chalk.green('\nSuccessfully wished ' + birthdayAnswers.birthdayName) + '\n');
    birthdayNames.splice(indexOfBirthdayName, 1);
    config.birthdayNames = birthdayNames;
    await writeFile(config);

    if (birthdayNames.length > 0) {
      const moreWishes: any = await inquirer.prompt([
        {
          default: true,
          message: 'Do you want to wish more of your friends?',
          name: 'friends',
          type: 'confirm',
        },
      ]);
      if (moreWishes.friends) {
        await this.birthdayWish(credentials, birthdayNames, birthdayTexts);
      }
    }
  }
  /**
   * @param  {any} credentials
   */
  public async findAndWish(credentials: any) {  // add a while loop to try 3 times
    try {
      while (currentRetryCount < this.page.retryCount) {
        if (await this.page.isElementExists(locators.birthdayTodayCard)) {
          const today = new Date().getDay();
          const birthdayTexts: ElementHandle[] = await this.fetchAllTexts();
          if (config.firstLogin === false) {
            if (config.day === today) {
              if (config.birthdayNames.length > 0) {
                await this.birthdayWish(credentials, config.birthdayNames, birthdayTexts);
              }
            } else {
              config.day = today;
              config.birthdayNames = await this.fetchBirthdayNames();
              await writeFile(config);
              await this.birthdayWish(credentials, config.birthdayNames, birthdayTexts);
            }
          } else {
            config.birthdayNames = await this.fetchBirthdayNames();
            await this.birthdayWish(credentials, config.birthdayNames, birthdayTexts);
            await encryptCredentials(credentials);
            config.firstLogin = false;
            await writeFile(config);
          }
          break;
        } else {
          currentRetryCount++;
          if (currentRetryCount === this.page.retryCount) {
            console.error(
                '\n' + chalk.red('Uh oh, looks like none of your friends have birthdays today!\n'));
            await this.page.logout();
            process.exit(0);
          }
        }
      }
      await this.page.logout();
      process.exit(0);
    } catch (Exception) {
      console.error(chalk.red('\n' + Exception.toString() + '\n'));
      try {
        await this.page.logout();
        process.exit(0);
      } catch (Exception) {
        throw Exception;
      }
    }
  }
  /**
   * @param  {any} credentials
   * @param  {string} wish
   */
  public async findAndWishAll(credentials: any, wish: string) {
    try {
      while (currentRetryCount < this.page.retryCount) {
        if (await this.page.isElementExists(locators.birthdayTodayCard)) {
          const today = new Date().getDay();
          const birthdayTexts: ElementHandle[] = await this.fetchAllTexts();
          if (!config.firstLogin) {
            if (config.day === today) {
              if (config.birthdayNames.length > 0) {
                await this.wishAll(config.birthdayNames, birthdayTexts, wish);
              }
            } else {
              config.day = today;
              config.birthdayNames = await this.fetchBirthdayNames();
              await writeFile(config);
              await this.wishAll(config.birthdayNames, birthdayTexts, wish);
            }
          } else {
            config.birthdayNames = await this.fetchBirthdayNames();
            await this.wishAll(config.birthdayNames, birthdayTexts, wish);
            await encryptCredentials(credentials);
            config.firstLogin = false;
            await writeFile(config);
          }
          break;
        } else {
          currentRetryCount++;
          if (currentRetryCount === this.page.retryCount) {
            console.error(
                '\n' + chalk.red('Uh oh, looks like none of your friends have birthdays today!\n'));
            await this.page.logout();
            process.exit(0);
          }
        }
      }
      await this.page.logout();
      process.exit(0);
    } catch (Exception) {
      console.error(chalk.red('\n' + Exception.toString() + '\n'));
      try {
        await this.page.logout();
        process.exit(0);
      } catch (Exception) {
        throw Exception;
      }
    }
  }
}

export {BirthdayWisher, wishes};
