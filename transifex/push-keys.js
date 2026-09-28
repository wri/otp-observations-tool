/**
 * Set translations for a few keys on Transifex, one string at a time, without
 * uploading whole files (which would overwrite every other key in them).
 *
 *   yarn transifex:push-keys translations.json            # dry run
 *   yarn transifex:push-keys translations.json --apply    # write
 *   yarn transifex:push-keys translations.json --apply --overwrite
 *
 * translations.json: { "fr": { "search.trigger": "Rechercher" }, "es": { ... } }
 *
 * Keys must already be in the source on Transifex (`yarn transifex:push` first).
 * Reviewed/proofread translations are never touched. Existing unreviewed ones
 * are skipped unless --overwrite. Writes are credited to the TX_TOKEN owner.
 */
const fs = require('fs');

const API = 'https://rest.api.transifex.com';
const HEADERS = {
  Authorization: `Bearer ${process.env.TX_TOKEN}`,
  'Content-Type': 'application/vnd.api+json',
  Accept: 'application/vnd.api+json'
};

const args = process.argv.slice(2);
const file = args.find(a => !a.startsWith('--'));
const apply = args.includes('--apply');
const overwrite = args.includes('--overwrite');

function fail(message) {
  console.error(message);
  process.exit(1);
}

// Same resource `tx` uses, so this can't drift from .tx/config
function getResourceId() {
  const config = fs.readFileSync('.tx/config', 'utf-8');
  const match = config.match(/^\[(o:[^\]]+:r:[^\]]+)\]/m);
  if (!match) fail('No resource section found in .tx/config');
  return match[1];
}

// KEYVALUEJSON treats dots as nesting, so literal dots in keys are stored escaped
const escapeKey = key => key.replace(/\./g, '\\.');

async function request(method, path, body) {
  const res = await fetch(`${API}${path}`, { method, headers: HEADERS, body: body && JSON.stringify(body) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = (json.errors || []).map(e => e.detail || e.title).join('; ');
    throw new Error(`${method} ${path} -> ${res.status} ${detail}`);
  }
  return json;
}

async function findTranslation(resource, lang, key) {
  const params = new URLSearchParams({
    'filter[resource]': resource,
    'filter[language]': `l:${lang}`,
    'filter[resource_string][key]': escapeKey(key)
  });
  const { data } = await request('GET', `/resource_translations?${params}`);
  return data[0];
}

function decide(translation, value) {
  if (!translation) return { action: 'skip', reason: 'key not in source (push source first?)' };

  const { strings, reviewed, proofread } = translation.attributes;
  if (strings && Object.keys(strings).some(k => k !== 'other')) return { action: 'skip', reason: 'plural string, not supported' };
  if (strings && strings.other === value) return { action: 'skip', reason: 'already has this translation' };
  if (reviewed || proofread) return { action: 'skip', reason: `${proofread ? 'proofread' : 'reviewed'}: "${strings && strings.other}"` };
  if (strings && !overwrite) return { action: 'skip', reason: `already translated: "${strings.other}" (--overwrite to replace)` };

  return { action: strings ? 'replace' : 'set', reason: strings ? `was "${strings.other}"` : 'untranslated' };
}

async function main() {
  if (!file) fail('Usage: yarn transifex:push-keys <translations.json> [--apply] [--overwrite]');
  if (!process.env.TX_TOKEN) fail('TX_TOKEN is not set');

  const input = JSON.parse(fs.readFileSync(file, 'utf-8'));
  const resource = getResourceId();
  const counts = { written: 0, skipped: 0, failed: 0 };

  console.info(`${apply ? 'APPLY' : 'DRY RUN'} on ${resource}\n`);

  for (const [lang, keys] of Object.entries(input)) {
    for (const [key, value] of Object.entries(keys)) {
      const label = `[${lang}] ${key}`;

      if (typeof value !== 'string' || !value.trim()) {
        console.info(`  skip     ${label}: empty or non-string value`);
        counts.skipped += 1;
        continue;
      }

      try {
        const translation = await findTranslation(resource, lang, key);
        const { action, reason } = decide(translation, value);

        if (action === 'skip') {
          console.info(`  skip     ${label}: ${reason}`);
          counts.skipped += 1;
          continue;
        }

        if (!apply) {
          console.info(`  ${action.padEnd(8)} ${label}: "${value}" (${reason})`);
          continue;
        }

        await request('PATCH', `/resource_translations/${encodeURIComponent(translation.id)}`, {
          data: { id: translation.id, type: 'resource_translations', attributes: { strings: { other: value } } }
        });

        // Read back so the reported state is Transifex's, not an assumption
        const written = await findTranslation(resource, lang, key);
        const { reviewed } = written.attributes;
        const translator = written.relationships?.translator?.data?.id || 'unknown';
        console.info(`  ${action.padEnd(8)} ${label}: "${written.attributes.strings?.other}" (reviewed: ${reviewed}, translator: ${translator})`);
        counts.written += 1;
      } catch (e) {
        console.info(`  FAILED   ${label}: ${e.message}`);
        counts.failed += 1;
      }
    }
  }

  console.info(`\n${apply ? `written: ${counts.written}, ` : ''}skipped: ${counts.skipped}, failed: ${counts.failed}`);
  if (!apply) console.info('Dry run - nothing was changed. Re-run with --apply to write.');
  if (counts.failed) process.exit(1);
}

main();
