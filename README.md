# OtpObservationsTool

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.0.0.

## Development server

Run `yarn dev` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive/pipe/service/class/module`.

## Build

Run `yarn build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running end-to-end tests

We are using cypress for e2e testing and the whole setup lies in `e2e` folder.
To run e2e tests you need to have backend project installed in sibiling directory named `otp-api`.

Go to `e2e` folder and run `npm install` to install all the dependencies.
Then start both backend and frontend projects running `./start-server.sh` script. If both servers are running you can either run `cypress run` or `cypress open` to run the tests.

## Offline use

Offline, the app is only for drafting observations: creating new ones and continuing the drafts saved on the device. Everything else (the observation list, editing existing observations and QC, CSV import, advanced editing, My OTP) needs a connection and shows a notice instead while offline (`*otpOnlineOnly` in `src/app/shared/online-only/`). The profile can be viewed offline but not saved.

- `ngsw-config.json` configures the Angular service worker, enabled in the staging and production builds only (`environment.serviceWorker`). The server must send `Cache-Control: no-cache` for `index.html` and `ngsw.json`, otherwise users keep an old version.
- `src/app/services/offline/` holds the rest: the API interceptor caches reference-data GET responses in IndexedDB and answers them when offline (`api-cache.service.ts`); the reference data of the observer's countries is downloaded in the background after login and when the connection comes back, at most once a day per organization and language (`offline-preparation.service.ts`; off in the e2e build, see `autoPrepareOffline`); new observations are autosaved to an outbox (`outbox.service.ts`) and sent by `observation-submission.service.ts`, which resumes when the connection is back.

### Trying offline use locally

`yarn dev` has no service worker: you can go offline in an open tab (DevTools, Network, "Offline"), but a reload while offline fails, and so does opening a page whose code was never loaded. To try the real thing, build with the service worker and serve the build:

```
yarn dev:offline    # local environment + service worker, served on http://localhost:4200 (stop yarn dev first)
```

There is no live reload: run it again after a change, then reload twice (the worker serves the previous build until the new one is downloaded) or accept the "new version" prompt. When you go back to `yarn dev`, the worker notices there is no `ngsw.json` and unregisters itself, but the first page load may still be the old build; unregister it in DevTools (Application, Service workers) to be sure.

## Translations

Translations live in `src/assets/locale/` and are managed on Transifex. The source file is `zu.json`; add new keys there (and to `en.json`). The scripts need the [Transifex CLI](https://developers.transifex.com/docs/cli) and `TX_TOKEN` in `.env`.

```
yarn transifex:push    # upload the source file (new keys)
yarn transifex:pull    # download all translations and format them
```

To add translations for the keys your branch introduces, without uploading whole language files (which would overwrite everyone else's work on Transifex):

```
yarn transifex:branch-keys                                  # collect keys changed since develop into transifex/pending/<branch>.json
# fill in the empty values in that file
yarn transifex:push                                         # the keys must exist in the source on Transifex first
yarn transifex:push-keys transifex/pending/<branch>.json    # dry run, shows what would change
yarn transifex:push-keys transifex/pending/<branch>.json --apply
```

`push-keys` never touches reviewed or proofread translations and skips existing ones unless `--overwrite` is passed. `transifex/pending/` is git-ignored.
