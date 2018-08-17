interface Locator {
  url: string;
  username: string;
  password: string;
  loginButton: string;
  logoutLink: string;
  logoutButton: string;
  birthdayTodayCard: string;
  birthdayDivCard: string;
  birthdays: string;
  birthdayNames: string;
  birthdayText: string;
  recentBirthdayCard: string;
  recentBirthdayNames: string;
  recentBirthText: string;
}
const locators: Locator = {
  url : 'https://www.facebook.com/events/birthdays/',
  username : '#email',
  password : '#pass',
  loginButton : '#loginbutton',
  logoutLink : 'a#pageLoginAnchor',
  logoutButton : '//span[contains(text(),"Log Out")]',
  birthdayTodayCard : 'div#birthdays_today_card',
  birthdayDivCard : 'div._fbBirthdays__todayCard',
  birthdays : 'div._fbBirthdays__todayCard > div:nth-child(2) >ul >li',
  birthdayNames :
      'div._fbBirthdays__todayCard > div:nth-child(2) a:not([href*="friendship"])',
  birthdayText : 'div._fbBirthdays__todayCard > div:nth-child(2) textarea',
  recentBirthdayCard : 'div#birthdays_recent_card',
  recentBirthdayNames :
      'div._fbBirthdays__recentCard > div:nth-child(2) a:not([href*="friendship"])',
  recentBirthText : 'div._fbBirthdays__recentCard > div:nth-child(2) textarea',

};

export {locators};
