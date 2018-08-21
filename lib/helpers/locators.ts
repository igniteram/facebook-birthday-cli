interface Locator {
  url: string;
  username: string;
  password: string;
  loginButton: string;
  logoutLink: string;
  logoutButton: string;
  birthdayTodayCard: string;
  birthdayNames: string;
  birthdayText: string;
}
const locators: Locator = {
  url: 'https://www.facebook.com/events/birthdays/',
  username: '#email',
  password: '#pass',
  loginButton: '#loginbutton',
  logoutLink: 'a#pageLoginAnchor',
  logoutButton: '//span[contains(text(),"Log Out")]',
  birthdayTodayCard: 'div#birthdays_today_card',
  birthdayNames: 'div._fbBirthdays__todayCard > div:nth-child(2) a:not([href*="friendship"])',
  birthdayText: 'div._fbBirthdays__todayCard > div:nth-child(2) textarea',
};

export {locators};
