import chalk from 'chalk';
import {Browser, ElementHandle, launch, Page, Response} from 'puppeteer';

import {locators} from './locators';

class PageHelper {
  private browser: Browser;
  private page: Page;
  public retryCount: number = 2;

  constructor() {
    this.browser = null;
    this.page = null;
  }

  public async init() {
    this.browser = await launch({
      headless: true,
      args: ['--disable-notifications', '--start-maximized'],
    });
    this.page = await this.browser.newPage();
  }
  /**
   * @param  {string} url
   * @returns Promise
   */
  public async open(url: string): Promise<Response> {
    let i: number = 0;
    while (i < this.retryCount) {
      try {
        return await this.page.goto(url);
      } catch (Exception) {
        i++;
        if (i === this.retryCount) {
          throw Exception;
        }
      }
    }
  }
  /**
   * @returns Promise
   */
  public async getTitle(): Promise<string> {
    let i: number = 0;
    while (i < this.retryCount) {
      try {
        return await this.page.title();
      } catch (Exception) {
        i++;
        if (i === this.retryCount) {
          throw Exception;
        }
      }
    }
  }
  /**
   * @param  {string} element
   * @returns Promise
   */
  public async $$(element: string): Promise<ElementHandle[]> {
    let i: number = 0;
    while (i < this.retryCount) {
      try {
        return await this.page.$$(element);
      } catch (Exception) {
        i++;
        if (i === this.retryCount) {
          throw Exception;
        }
      }
    }
  }
  /**
   * @param  {string} element
   * @returns Promise
   */
  public async focusElement(element: string): Promise<void> {
    let i: number = 0;
    while (i < this.retryCount) {
      try {
        await this.page.waitForSelector(element);
        return await this.page.focus(element);
      } catch (Exception) {
        try {
          i++;
          await this.page.waitForSelector(element);
          await this.page.evaluate('arguments[0].click()', element);
          continue;
        } catch (Exception) {
          i++;
          if (i === this.retryCount) {
            throw Exception;
          }
        }
      }
    }
  }
  /**
   * @param  {string} element
   * @returns Promise
   */
  public async clickElement(element: string): Promise<void> {
    let i: number = 0;
    while (i < this.retryCount) {
      try {
        await this.page.waitForSelector(element);
        return await this.page.click(element);
      } catch (Exception) {
        try {
          i++;
          await this.page.waitForSelector(element);
          await this.page.evaluate('arguments[0].click()', element);
          continue;
        } catch (Exception) {
          i++;
          if (i === this.retryCount) {
            throw Exception;
          }
        }
      }
    }
  }
  /**
   * @param  {string} element
   * @returns Promise
   */
  public async xpathClick(element: string): Promise<void> {
    let i: number = 0;
    while (i < this.retryCount) {
      try {
        await this.page.waitForXPath(element);
        const xpathElement = await this.page.$x(element);
        return await xpathElement[0].click();
      } catch (Exception) {
        try {
          i++;
          await this.page.waitForXPath(element);
          await this.page.evaluate('arguments[0].click()', element);
          continue;
        } catch (Exception) {
          i++;
          if (i === this.retryCount) {
            throw Exception;
          }
        }
      }
    }
  }
  /**
   * @param  {string} element
   * @returns Promise
   */
  public async clearElement(element: string): Promise<void> {
    let i: number = 0;
    while (i < this.retryCount) {
      try {
        return await this.page.type(element, '');
      } catch (Exception) {
        try {
          i++;
          await this.page.waitForSelector(element);
          await this.page.evaluate('arguments[0].click()', element);
          continue;
        } catch (Exception) {
          i++;
          if (i === this.retryCount) {
            throw Exception;
          }
        }
      }
    }
  }
  /**
   * @param  {string} element
   * @param  {string} text
   * @returns Promise
   */
  public async sendElementText(element: string, text: string): Promise<void> {
    let i: number = 0;
    while (i < this.retryCount) {
      try {
        return await this.page.type(element, text);
      } catch (Exception) {
        try {
          i++;
          await this.page.waitForSelector(element);
          await this.page.evaluate('arguments[0].click()', element);
          continue;
        } catch (Exception) {
          i++;
          if (i === this.retryCount) {
            throw Exception;
          }
        }
      }
    }
  }
  /**
   * @param  {string} keys
   * @returns Promise
   */
  public async enterKeys(keys: string): Promise<void> {
    let i: number = 0;
    while (i < this.retryCount) {
      try {
        return await this.page.keyboard.press(keys);
      } catch (Exception) {
        i++;
        if (i === this.retryCount) {
          throw Exception;
        }
      }
    }
  }
  /**
   * @param  {ElementHandle} element
   * @param  {any} answers
   * @returns Promise
   */
  public async enterText(element: ElementHandle, text: string): Promise<void> {
    await element.focus();
    await element.type('');
    await element.type(text);
    await this.enterKeys('Enter');
    await this.page.waitFor(500);
  }
  /**
   * @param  {ElementHandle[]} elements
   * @param  {any} answers
   * @returns Promise
   */
  public async enterAllElementText(elements: ElementHandle[], text: string): Promise<any> {
    try {
      if (elements.length > 0) {
        for (let i = 0; i < elements.length; i++) {
          await this.enterText(elements[i], text);
        }
      } else {
        throw new Error('No textboxes present!');
      }

    } catch (Exception) {
      console.error(chalk.red(
          '\nFailed to wish! Most likely you have already wished your friends or due to below reason:'));
      throw Exception;
    }
  }

  /**
   * @param  {number} index
   * @param  {ElementHandle[]} elements
   * @param  {string} text
   * @returns Promise
   */
  public async enterElementText(index: number, elements: ElementHandle[], text: string):
      Promise<void> {
    try {
      if (elements.length > 0) {
        return await this.enterText(elements[index], text);
      } else {
        throw new Error('No textboxes present!');
      }
    } catch (Exception) {
      console.error(chalk.red(
          '\nFailed to wish! Most likely you have already wished your friend or due to below reason:'));
      throw Exception;
    }
  }
  /**
   * @param  {string} element
   * @returns Promise
   */
  public async getText(element: string): Promise<string[]> {
    let i: number = 0;
    while (i < this.retryCount) {
      try {
        return await this.page.evaluate((element) => {
          const els = Array.from(document.querySelectorAll(element));
          return els.map((el) => {
            return el.textContent;
          });
        }, element);
      } catch (Exception) {
        try {
          i++;
          await this.page.waitForSelector(element);
          await this.page.evaluate('arguments[0].click()', element);
          continue;
        } catch (Exception) {
          i++;
          if (i === this.retryCount) {
            throw Exception;
          }
        }
      }
    }
  }
  /**
   * @param  {any} options?
   * @returns Promise
   */
  public async waitForNavigation(options?: any): Promise<Response> {
    try {
      return await this.page.waitForNavigation(options);
    } catch (Exception) {
      throw new Error(Exception.toString());
    }
  }
  /**
   * @param  {string} element
   * @returns Promise
   */
  public async isElementExists(element: string): Promise<boolean> {
    let i: number = 0;
    while (i < this.retryCount) {
      try {
        await this.page.waitForSelector(element, {timeout: 1000});
        if ((await this.page.$(element)) !== null) {
          return true;
        } else {
          return false;
        }
      } catch (Exception) {
        i++;
        if (i === this.retryCount) {
          return false;
        }
      }
    }
  }
  /**
   * @returns Promise
   */
  public async logout(): Promise<void> {
    try {
      await this.clickElement(locators.logoutLink);
      await this.xpathClick(locators.loginButton);
      await this.page.waitFor(500);
    } catch (Exception) {
      console.error('\nLogout Failed! Most likely due to below reason');
      throw Exception;
    }
  }
}

export {PageHelper};
