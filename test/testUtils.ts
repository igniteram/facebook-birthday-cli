/**
 * Below Test Utils code taken directly
 * from angular/protractor-cookbook repository
 */

import * as child_process from 'child_process';
import * as fs from 'fs';

const spawnSync = child_process.spawnSync;

export class TestUtils {
  /**
   * Run a terminal command.
   * @param {string} task
   * @param {string[]} taskArgs arguments to the task
   * @param {Object} options
   */
  public static runCommand(task: string, args: string[], options: any): string[] {
    const child = spawnSync(task, args, options);
    return child.output;
  }

  /**
   * Read the file contents and return a list of lines.
   * @param {string} file the file path
   * @returns {string[]} lines of a file
   */
  public static getFileLines(filePath: string): string[] {
    const contents = fs.readFileSync(filePath).toString();
    const lines = contents.split('\n');
    return lines;
  }

  /**
   * Check if contents contains a line.
   * @param {string} check
   * @param {string[]} file contents
   * @returns {boolean} if the line exists, return true
   */
  public static checkContent(content: string, fileLines: string[]): boolean {
    for (let pos = 0; pos < fileLines.length; pos++) {
      const line = fileLines[pos];
      if (line.indexOf(content) >= 0) {
        return true;
      }
    }
    return false;
  }

  public static checkContents(lines: string[], findLines: string[]): boolean {
    let found = true;
    findLines.forEach((line) => {
      found = found && TestUtils.checkContent(line, lines);
    });
    if (!found) {
      console.log(lines.join('\n'));
    }
    return found;
  }
}
