// node test/pdf.test.js [file.pdf ...]
// Structural tests on synthetic lines always run. Real PDFs are parsed when paths are given
// (or found in test/fixtures/*.pdf, which is gitignored) and the result is printed for eyeballing.
const fs = require('fs');
const path = require('path');
const S = require('../pdfsource.js');

let failures = 0;
function eq(actual, expected, label) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a !== e) { failures++; console.log('FAIL', label, '\n  got     ', a, '\n  expected', e); }
  else console.log('ok  ', label);
}
const line = (y, pairs) => ({ y, items: pairs.map(([s, x]) => ({ s, x })).sort((a, b) => b.x - a.x) });

// malam-shaped: office day, home day with note, no-report day, weekend, total block
const malam = [
  line(760, [['דוח נוכחות חודשי', 242]]),
  line(564, [['02/08/2026', 559], ['ראשון', 532], ['.', 473], ['07:29', 386], ['15:25', 352], ['07:56', 317], ['040', 285], ['040', 247]]),
  line(537, [['04/08/2026', 559], ['שלישי', 531], ['עבודה מרחוק', 424], ['08:20', 386], ['17:20', 352], ['09:00', 317], ['מעבר לתשתית חדשה', 55]]),
  line(450, [['10/08/2026', 559], ['שני', 542], ['אין דיווח נוכחות', 416]]),
  line(480, [['08/08/2026', 559], ['שבת', 536], ['שבת', 500]]),
  line(117, [['16:56', 327]]),
  line(114, [['סה"כ נוכחות חודשית מדווחת:', 371]]),
  line(6, [['כל הזכויות שמורות למלם שכר בע"מ', 480]]),
];
const m = S.parse(malam);
eq(m.format, 'malam', 'malam detected');
eq(m.rows.map((r) => [r.date, r.entry, r.exit, r.type]), [['02/08/2026', '07:29', '15:25', 'משרד'], ['04/08/2026', '08:20', '17:20', 'בית']], 'malam rows, office and home');
eq(m.rows[1].note, 'מעבר לתשתית חדשה', 'malam note kept, clock codes dropped');
eq(m.skipped, [{ date: '10/08/2026', why: 'אין דיווח נוכחות' }], 'malam no-report day skipped with reason');
eq(m.total, '16:56', 'malam month total read');
eq(S.fmt(S.sumMinutes(m.rows)), '16:56', 'sum of rows equals the report total');

// ok2go-shaped: normal day, day-off line with cumulative only, split day, totals block
const ok2go = [
  line(804, [['דו"ח נוכחות מפורט', 156]]),
  line(738, [['תאריך', 530], ['כניסה', 369], ['יציאה', 208], ['סה"כ', 100], ['מצטבר', 44]]),
  line(720, [['03/08/2026', 523], ['ב', 485], ['08:12', 370], ['172.69.128.185', 301], ['17:15', 209], ['09:03', 101], ['09:03', 47]]),
  line(666, [['07/08/2026', 523], ['ו', 486], ['09:03', 47]]),
  line(504, [['19/08/2026', 523], ['ד', 485], ['08:19', 370], ['10:02', 209], ['01:43', 101], ['10:46', 45]]),
  line(495, [['19/08/2026', 523], ['ד', 485], ['13:58', 370], ['18:30', 209], ['04:32', 101], ['15:18', 45]]),
  line(327, [['סה"כ ימי עבודה', 484], ['סה"כ שעות', 385], ['סה"כ העדרויות', 270]]),
  line(312, [['2', 505], ['15:18', 383], ['0', 294]]),
];
const o = S.parse(ok2go);
eq(o.format, 'ok2go', 'ok2go detected');
eq(o.rows.length, 2, 'ok2go: day-off line skipped, split day merged into one row');
eq([o.rows[0].entry, o.rows[0].exit, o.rows[0].type], ['08:12', '17:15', ''], 'ok2go row, no type');
eq([o.rows[1].entry, o.rows[1].exit], ['08:19', '18:30'], 'split day spans first entry to last exit');
eq(o.rows[1].note.startsWith(S.SPLIT_WORD), true, 'split day flagged in the note');
eq(o.total, '15:18', 'ok2go month total read');
eq(S.fmt(S.sumMinutes(o.rows)), '15:18', 'split day counted by segments, sum equals the report total');
eq(o.text.split('\n')[1], '19/08/2026,08:19,18:30,,מפוצל: 08:19-10:02 13:58-18:30', 'ROWS text line for the split day');

// generic: any date with two times
const g = S.parse([line(100, [['01/09/2026', 500], ['09:00', 400], ['18:00', 300]])]);
eq([g.format, g.rows[0].entry, g.rows[0].exit], ['generic', '09:00', '18:00'], 'generic fallback');

// the output text round-trips through parse.js
const P = require('../parse.js');
const rt = P.parseRows(o.text);
eq(rt.map((r) => [r.key, r.entry, r.exit, r.typed]), [['03/08', '08:12', '17:15', false], ['19/08', '08:19', '18:30', false]], 'parse.js reads the generated text');
eq(rt[1].note.includes('מפוצל'), true, 'split flag survives the round trip');

console.log(failures ? `${failures} FAILED` : 'all pdf tests passed');

// ---- real files, printed for eyeballing ----
const files = process.argv.slice(2);
const fixtures = path.join(__dirname, 'fixtures');
if (!files.length && fs.existsSync(fixtures)) for (const f of fs.readdirSync(fixtures)) if (f.endsWith('.pdf')) files.push(path.join(fixtures, f));
if (files.length) {
  const vendor = path.join(__dirname, '..', 'vendor');
  globalThis.pdfjsWorker = require(path.join(vendor, 'pdf.worker.min.js'));
  const pdfjsLib = require(path.join(vendor, 'pdf.min.js'));
  (async () => {
    for (const file of files) {
      const doc = await pdfjsLib.getDocument({ data: new Uint8Array(fs.readFileSync(file)), isEvalSupported: false }).promise;
      let items = [];
      for (let p = 1; p <= doc.numPages; p++) items = items.concat((await (await doc.getPage(p)).getTextContent()).items);
      const res = S.parse(S.linesFromItems(items));
      console.log(`\n=== ${path.basename(file)}: ${res.format}, ${res.rows.length} rows, skipped ${res.skipped.length}, total ${res.total}, sum ${S.fmt(S.sumMinutes(res.rows))}`);
      console.log(res.text);
      if (res.skipped.length) console.log('skipped:', res.skipped.map((s) => `${s.date} (${s.why})`).join(', '));
    }
  })().catch((e) => { console.error('real-file parse failed:', e.message); process.exit(1); });
}
if (failures) process.exit(1);
