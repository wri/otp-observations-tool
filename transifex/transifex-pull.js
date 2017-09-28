// Script to request all active languages on transifex and then fetch their respective translations
const fetch = require('node-fetch');
const fs = require('fs');
require('dotenv').config();

// Create the folder if it doesn't exist
if (!fs.existsSync(process.env.LOCALES_PATH)) {
  console.info('Creating lang folder...');
  fs.mkdirSync(process.env.LOCALES_PATH);
  console.info('Created!');
}

// Endpoint for fetching available languages
const langUrl = `${process.env.TRANSIFEX_URL}/${process.env.TRANSIFEX_PROJECT}/resource/${process.env.TRANSIFEX_SLUG}/?details`;

// Endpoint for fetching translations
const transUrl = `${process.env.TRANSIFEX_URL}/${process.env.TRANSIFEX_PROJECT}/resource/${process.env.TRANSIFEX_SLUG}/translation`;

// Fetch config
const fetchConfig = {
  headers: {
    Authorization: `Basic ${process.env.TRANSIFEX_API_TOKEN}`
  },
  method: 'GET'
};

// Lets start
console.info('Fetching available languages...');
fetch(langUrl, fetchConfig)
    .then((res) => {
      console.info('Languages found!');
      return res.json();
    })
    .then((json) => {
      const languages = json.available_languages.map(language => language.code);
      return languages;
    })
    .then((languages) => {
      languages.forEach((lang) => {
        fetch(`${transUrl}/${lang}`, fetchConfig)
          .then(res => res.json())
          .then((json) => {
            fs.writeFile(`${process.env.LOCALES_PATH}/${lang}.json`, JSON.stringify(JSON.parse(json.content), null, 4), (err) => {
              if (err) throw err;
              console.info(`Translations for ${lang} successfully saved!`);
            });
          });
      });
    })
    .catch((err) => {
      console.error(err);
    });
