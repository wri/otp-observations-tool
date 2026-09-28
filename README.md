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
