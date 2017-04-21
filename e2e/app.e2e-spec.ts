import { OtpObservationsToolPage } from './app.po';

describe('otp-observations-tool App', () => {
  let page: OtpObservationsToolPage;

  beforeEach(() => {
    page = new OtpObservationsToolPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('otp works!');
  });
});
