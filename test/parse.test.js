// node test/parse.test.js
// Uses test/august-2026.tsv (local, gitignored, real sheet copy) when present, plus a built-in sample.
const fs = require('fs');
const path = require('path');
const P = require('../parse.js');

let failures = 0;
function eq(actual, expected, label) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a !== e) { failures++; console.log('FAIL', label, '\n  got     ', a, '\n  expected', e); }
  else console.log('ok  ', label);
}

// day index anchor verified on the live page: 02/08/2026 -> 9710
eq(P.dayIndex(2026, 8, 2), 9710, 'dayIndex 2026-08-02');
eq(P.dayIndex(2026, 8, 1), 9709, 'dayIndex 2026-08-01');

// sheet-shaped sample: header, plain day, office day, split day with quoted multi-line notes, duration ignored
const sample = [
  'תאריך\tיום\tכניסה\tיציאה\tסך שעות\tהערות\tמשרד/בית',
  '03/08/2026\tשני\t08:00\t17:00\t9:00:00\t\tמשרד',
  '04/08/2026\tשלישי\t10:00\t18:10\t8:10:00',
  '12/08/2026\tרביעי\t09:00\t17:00\t8:00:00\t"09:00\t13:00\t4:00:00\n15:00\t19:00\t4:00:00"\tמשרד',
  '13/08/2026\tחמישי\t09:00\t\t',
].join('\n');
const rows = P.parseRows(sample);
eq(rows.length, 4, 'sample: 4 date rows, header skipped');
eq(rows[0], { key: '03/08', date: { d: 3, m: 8, y: 2026 }, entry: '08:00', exit: '17:00', office: true, typed: true, note: '', days: 9711 }, 'office row');
eq([rows[1].office, rows[1].typed], [true, false], 'no type word = default (office), flagged as untyped');
eq(P.parseRows('04/08/2026\t10:00\t18:10', { defaultOffice: false })[0].office, false, 'no type word, default set to home');
eq(P.parseRows('04/08/2026\t10:00\t18:10\tבית', { defaultOffice: true })[0], Object.assign({}, P.parseRows('04/08/2026\t10:00\t18:10\tבית')[0], { office: false, typed: true }), 'home word wins over default');
eq([rows[2].entry, rows[2].exit, rows[2].office], ['09:00', '17:00', true], 'split day keeps C and D, not the segments');
eq(rows[2].note.includes('15:00'), true, 'split day note kept');
eq([rows[3].entry, rows[3].exit], ['09:00', null], 'missing exit -> null');

// minimal 4-column contract (colleague's tool): date, entry, exit, type
const min = '01/09/2026,09:00,18:00,בית\n02/09/2026,08:30,17:00,משרד\n';
const mrows = P.parseRows(min);
eq(mrows.map((r) => [r.key, r.entry, r.exit, r.office, r.typed]), [['01/09', '09:00', '18:00', false, true], ['02/09', '08:30', '17:00', true, true]], 'csv 4-column contract');

// custom office word
eq(P.parseRows('05/09/2026\t09:00\t17:00\toffice', { officeWord: 'office' })[0].office, true, 'custom office word');

const fixture = path.join(__dirname, 'august-2026.tsv');
if (fs.existsSync(fixture)) {
  const real = P.parseRows(fs.readFileSync(fixture, 'utf8'));
  console.log(`real fixture: ${real.length} rows`);
  const bad = real.filter((r) => !r.entry || !r.exit || r.entry >= r.exit);
  console.log('  incomplete/invalid rows:', bad.map((r) => r.key + ' ' + r.entry + '-' + r.exit).join(', ') || 'none');
  console.log('  office days:', real.filter((r) => r.office).map((r) => r.key).join(', '));
  console.log('  first/last:', real[0]?.key, real[real.length - 1]?.key);
}

if (failures) { console.log(`\n${failures} failure(s)`); process.exit(1); }
console.log('\nall parse tests passed');
