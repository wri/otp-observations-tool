import { French } from 'flatpickr/dist/l10n/fr.js';
import { Spanish } from 'flatpickr/dist/l10n/es.js';
import en from 'flatpickr/dist/l10n/default.js';

// Only the languages exposed by the header's language switcher are bundled here.
// Importing 'flatpickr/dist/l10n' instead would pull in all 58 locales (~37kB).
export const LOCALE: { [lang: string]: any } = {
  en: en,
  fr: French,
  es: Spanish
};
