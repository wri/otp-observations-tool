export const environment = {
  // Off for Cypress: the background download would match the tests' request intercepts
  autoPrepareOffline: false,
  serviceWorker: false,
  production: true,
  apiUrl: 'http://localhost:3000',
  OTP_API_KEY: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjozfQ.1Ze20XwvVchcOzokQAiSsoUYatboK7Ii1E0e8Mqnj38',
  LOCALES_PATH: 'lang',
  GOOGLE_ANALYTICS_ID: '',
  HOTJAR_ID: undefined,
  HOTJAR_VERSION: undefined,
  SENTRY_DSN: undefined
};
