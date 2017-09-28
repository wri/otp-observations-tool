// Pushes the current en.json file from LOCALES_PATH to transifex
const fetch = require('node-fetch');
require('dotenv').config();

// Get current translations
const translations = require(`../${process.env.LOCALES_PATH}/${process.env.TRANSIFEX_SOURCE}.json`);

// Endpoint for source language translations
const url = `${process.env.TRANSIFEX_URL}/${process.env.TRANSIFEX_PROJECT}/resource/${process.env.TRANSIFEX_SLUG}/content`;

// Request config
const json = {
  content: JSON.stringify(translations)
};

const fetchConfig = {
  headers: {
    Authorization: `Basic ${process.env.TRANSIFEX_API_TOKEN}`,
    'Content-Type': 'application/json'
  },
  method: 'PUT',
  body: JSON.stringify(json)
};

// PUT en.json
fetch(url, fetchConfig)
  .then(res => res.json())
  .then((json) => {
    console.log(json);
    console.log('Translation successfully uploaded!');
  })
  .catch((err) => {
    console.log(err);
  });
