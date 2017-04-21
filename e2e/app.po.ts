import { browser, element, by } from 'protractor';

export class OtpObservationsToolPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('otp-root h1')).getText();
  }
}
