import { environment as local } from './environment.local';

// The local environment with the service worker on, to try offline use (page reloads
// included) on a real build. See "Offline use" in the README.
export const environment = {
  ...local,
  serviceWorker: true
};
