/**
 * Collect the i18n keys this branch adds or changes (source file vs its
 * merge-base with develop) into transifex/pending/<branch>.json, one object per
 * language - the input for `yarn transifex:push-keys`.
 *
 *   yarn transifex:branch-keys            # against develop
 *   yarn transifex:branch-keys master     # against another base branch
 *
 * A language is prefilled where the branch itself changed its file (en, usually);
 * the rest start empty for translating. Re-running keeps values already filled in.
 * Only reads git and local files - no Transifex calls.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const baseBranch = process.argv[2] || 'develop';

const git = (...args) => execFileSync('git', args, { encoding: 'utf-8' }).trim();

function readConfig() {
  const config = fs.readFileSync('.tx/config', 'utf-8');
  const sourceFile = config.match(/^source_file\s*=\s*(.+)$/m)[1].trim();
  const fileFilter = config.match(/^file_filter\s*=\s*(.+)$/m)[1].trim();
  return { sourceFile, fileFilter };
}

// The file at the merge-base; {} if it didn't exist yet
function readAtBase(base, file) {
  try {
    return JSON.parse(git('show', `${base}:${file}`));
  } catch (e) {
    return {};
  }
}

const readJSON = file => JSON.parse(fs.readFileSync(file, 'utf-8'));

function main() {
  const { sourceFile, fileFilter } = readConfig();
  const base = git('merge-base', baseBranch, 'HEAD');
  const branch = git('rev-parse', '--abbrev-ref', 'HEAD');

  // Working tree, so uncommitted edits count too
  const source = readJSON(sourceFile);
  const baseSource = readAtBase(base, sourceFile);
  const keys = Object.keys(source).filter(k => source[k] !== baseSource[k]);

  if (!keys.length) {
    console.info(`No new or changed keys in ${sourceFile} since ${baseBranch} (${base.slice(0, 8)}).`);
    return;
  }

  const [prefix, suffix] = fileFilter.split('<lang>');
  const langs = fs.readdirSync(path.dirname(fileFilter))
    .map(f => path.join(path.dirname(fileFilter), f))
    .filter(f => f.startsWith(prefix) && f.endsWith(suffix) && f !== sourceFile)
    .map(f => f.slice(prefix.length, f.length - suffix.length))
    .sort();

  const outFile = path.join('transifex', 'pending', `${branch.replace(/[^\w.-]+/g, '-')}.json`);
  const previous = fs.existsSync(outFile) ? readJSON(outFile) : {};

  const out = {};
  const prefilled = {};
  langs.forEach((lang) => {
    const file = fileFilter.replace('<lang>', lang);
    const current = readJSON(file);
    const atBase = readAtBase(base, file);

    out[lang] = {};
    prefilled[lang] = 0;
    keys.forEach((key) => {
      const kept = previous[lang] && previous[lang][key];
      const changedOnBranch = current[key] !== undefined && current[key] !== atBase[key];
      if (changedOnBranch) prefilled[lang] += 1;
      out[lang][key] = kept || (changedOnBranch ? current[key] : '');
    });
  });

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, `${JSON.stringify(out, null, 2)}\n`);

  console.info(`${keys.length} new/changed keys in ${sourceFile} since ${baseBranch} (${base.slice(0, 8)})`);
  langs.forEach((lang) => {
    const empty = keys.filter(k => !out[lang][k]).length;
    console.info(`  ${lang.padEnd(6)} ${keys.length - empty}/${keys.length} filled${prefilled[lang] ? ` (${prefilled[lang]} from the branch)` : ''}`);
  });
  console.info(`\nWrote ${outFile} - fill in the empty values, then: yarn transifex:push-keys ${outFile}`);
}

main();
