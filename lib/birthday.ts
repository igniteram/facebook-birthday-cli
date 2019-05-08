import chalk from 'chalk';
import * as inquirer from 'inquirer';

import {ElementHandle} from 'puppeteer';
import {locators} from './helpers/locators';
import {PageHelper} from './helpers/pageHelper';
import {encryptCredentials} from './utils/config';

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
  public async login(credentials: any, config: any, savedConfig: any) {
    try {
      await this.page.init();
      await this.page.open(locators.url);
      await this.page.focusElement(locators.username);
      await this.page.clearElement(locators.username);
      await this.page.sendElementText(locators.username, credentials.username);
      await this.page.focusElement(locators.password);
      await this.page.clearElement(locators.password);
      await this.page.sendElementText(locators.password, credentials.password);
      try {
        await Promise.all([
          this.page.clickElement(locators.loginButton),
          this.page.waitForNavigation({waitUntil: 'networkidle2'}),
        ]);
        if (savedConfig.firstLogin) {
          await encryptCredentials(config, credentials);
          config.firstLogin = false;
        }
      } catch (Exception) {
        throw new Error(Exception);
      }
      await this.page.open(locators.url + '/events/birthdays');

    } catch (Exception) {
      try {
        config.firstLogin = true;
        config.username = '';
        config.password = '';
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
    return config;
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
  public async wishAll(
      birthdayNames: string[], birthdayTexts: ElementHandle[], wish: string, config: any) {
    await this.page.enterAllElementText(birthdayTexts, wish);
    console.log(chalk.green('\nSuccessfully wished:\n'));
    birthdayNames.forEach((name: string) => {
      console.log(chalk.green(name + '\n'));
    });
    config.birthdayNames = [];
    return config;
  }

  /**
   * @param  {string[]} birthdayNames
   * @param  {ElementHandle[]} birthdayTexts
   */
  public async birthdayWish(birthdayNames: string[], birthdayTexts: ElementHandle[], config: any) {
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
        await this.birthdayWish(birthdayNames, birthdayTexts, config);
      }
    }
    return config;
  }
  /**
   * @param  {any} credentials
   */
  public async findAndWish(config: any, savedConfig: any) {
    try {
      while (currentRetryCount < this.page.retryCount) {
        if (await this.page.isElementExists(locators.birthdayTodayCard)) {
          const today = new Date().getDay();
          const birthdayTexts: ElementHandle[] = await this.fetchAllTexts();
          if (savedConfig.firstLogin === false) {
            if (savedConfig.day === today) {
              if (savedConfig.birthdayNames.length > 0) {
                await this.birthdayWish(savedConfig.birthdayNames, birthdayTexts, savedConfig);
              }
            } else {
              config.day = today;
              const birthdayNames = await this.fetchBirthdayNames();
              await this.birthdayWish(birthdayNames, birthdayTexts, config);
            }
          } else {
            const birthdayNames = await this.fetchBirthdayNames();
            await this.birthdayWish(birthdayNames, birthdayTexts, config);
          }
          break;
        } else {
          currentRetryCount++;
          if (currentRetryCount === this.page.retryCount) {
            console.error(
                '\n' + chalk.red('Uh oh, looks like none of your friends have birthdays today!\n'));
            config.birthday = false;
          }
        }
      }
      await this.page.logout();
    } catch (Exception) {
      console.error(chalk.red('\n' + Exception.toString() + '\n'));
    }
    return config;
  }
  /**
   * @param  {any} credentials
   * @param  {string} wish
   */
  public async findAndWishAll(wish: string, config: any, savedConfig: any) {
    try {
      while (currentRetryCount < this.page.retryCount) {
        if (await this.page.isElementExists(locators.birthdayTodayCard)) {
          const today = new Date().getDay();
          const birthdayTexts: ElementHandle[] = await this.fetchAllTexts();
          if (!savedConfig.firstLogin) {
            if (savedConfig.day === today) {
              if (savedConfig.birthdayNames.length > 0) {
                await this.wishAll(savedConfig.birthdayNames, birthdayTexts, wish, savedConfig);
              }
            } else {
              config.day = today;
              const birthdayNames = await this.fetchBirthdayNames();
              await this.wishAll(birthdayNames, birthdayTexts, wish, config);
            }
          } else {
            const birthdayNames = await this.fetchBirthdayNames();
            await this.wishAll(birthdayNames, birthdayTexts, wish, config);
          }
          break;
        } else {
          currentRetryCount++;
          if (currentRetryCount === this.page.retryCount) {
            console.error(
                '\n' + chalk.red('Uh oh, looks like none of your friends have birthdays today!\n'));
            config.birthday = false;
          }
        }
      }
      await this.page.logout();
    } catch (Exception) {
      console.error(chalk.red('\n' + Exception.toString() + '\n'));
    }
    return config;
  }
}

export {BirthdayWisher, wishes};
