import * as crypto from 'crypto';
/**
 * @param  {string} text
 */
function encrypt(text: string) {
  const cipher = crypto.createCipher('aes-256-cbc', 'd6F3Efeq');
  let crypted = cipher.update(text, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
}
/**
 * @param  {string} text
 */
function decrypt(text: string) {
  const decipher = crypto.createDecipher('aes-256-cbc', 'd6F3Efeq');
  let deciphered = decipher.update(text, 'hex', 'utf8');
  deciphered += decipher.final('utf8');
  return deciphered;
}

export {encrypt, decrypt};
