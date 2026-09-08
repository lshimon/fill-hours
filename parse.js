/* Fill Hours: parse pasted table text into day rows. Pure, no DOM. Reusable.
 *
 * Input: TSV (Google Sheets copy) or CSV. Quoted cells with embedded newlines are handled.
 * Column mapping is lenient: the first date cell is the date, the next two HH:MM cells are
 * entry and exit (H:MM:SS durations are ignored), a cell containing officeWord marks office,
 * the longest remaining text is the note.
 *
 * Output rows: { key: 'DD/MM', date: {d,m,y}, entry: 'HH:MM'|null, exit: 'HH:MM'|null,
 *                office: bool, note: string, days: int (Hilan day index, days since 2000-01-01) }
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.HilanFillParse = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const EPOCH_MS = Date.UTC(2000, 0, 1);
  const pad2 = (n) => String(n).padStart(2, '0');

  function dayIndex(y, m, d) { return Math.round((Date.UTC(y, m - 1, d) - EPOCH_MS) / 86400000); }

  function parseDate(s) {
    const m = String(s || '').trim().match(/^(\d{1,2})[\/.](\d{1,2})[\/.](\d{2,4})$/);
    if (!m) return null;
    let y = Number(m[3]); if (y < 100) y += 2000;
    const d = Number(m[1]), mo = Number(m[2]);
    if (d < 1 || d > 31 || mo < 1 || mo > 12) return null;
    return { d, m: mo, y };
  }

  function parseTime(s) {
    const m = String(s || '').trim().match(/^(\d{1,2})[:.](\d{2})$/);
    if (!m) return null;
    const h = Number(m[1]), mi = Number(m[2]);
    if (h > 23 || mi > 59) return null;
    return pad2(h) + ':' + pad2(mi);
  }

  function splitTable(text) {
    const delim = text.includes('\t') ? '\t' : ',';
    const rows = []; let row = []; let cell = ''; let quoted = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (quoted) {
        if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else quoted = false; }
        else cell += c;
      } else if (c === '"' && cell === '') quoted = true;
      else if (c === delim) { row.push(cell); cell = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(cell); rows.push(row); row = []; cell = '';
      } else cell += c;
    }
    if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
    return rows;
  }

  // opts: officeWord (default 'משרד'), homeWord (default 'בית'), defaultOffice (default true):
  // a row with the office word = office, with the home word = home, with neither = defaultOffice.
  function parseRows(text, opts) {
    const officeWord = (opts && opts.officeWord) || 'משרד';
    const homeWord = (opts && opts.homeWord) || 'בית';
    const defaultOffice = !opts || opts.defaultOffice !== false;
    const out = [];
    for (const cells of splitTable(String(text || ''))) {
      const trimmed = cells.map((c) => String(c).trim());
      const di = trimmed.findIndex((c) => parseDate(c));
      if (di < 0) continue;
      const date = parseDate(trimmed[di]);
      const times = []; const rest = []; const after = [];
      for (const c of trimmed.slice(di + 1)) {
        const t = parseTime(c);
        if (t && times.length < 2) times.push(t);
        else if (c) { rest.push(c); if (times.length === 2) after.push(c); }
      }
      const isType = (c) => c === officeWord || c === homeWord || c.includes(officeWord) || c.includes(homeWord);
      const typeCell = rest.find(isType);
      const office = typeCell ? typeCell.includes(officeWord) : defaultOffice;
      // note: only cells after the exit time (skips the weekday-name column), never a duration or the type cell
      const note = after.filter((c) => !isType(c) && !/^\d{1,2}:\d{2}:\d{2}$/.test(c))
        .sort((a, b) => b.length - a.length)[0] || '';
      out.push({
        key: pad2(date.d) + '/' + pad2(date.m),
        date, entry: times[0] || null, exit: times[1] || null, office, typed: !!typeCell, note,
        days: dayIndex(date.y, date.m, date.d),
      });
    }
    return out;
  }

  return { parseRows, parseDate, parseTime, splitTable, dayIndex, pad2 };
});
