/* Fill Hours: turn an attendance-report PDF into ROWS.md lines. Pure, no DOM.
 *
 * Input is pdf.js text content (items with a string and a transform). Items are grouped into
 * visual lines by their y position, and within a line sorted right to left (the reports are RTL
 * tables, so the entry column sits to the right of the exit column).
 *
 * Formats are detected by structure, not by company name, so one parser covers every customer
 * of that vendor:
 *   malam : "דוח נוכחות חודשי" by מלם שכר. Row: date, weekday, day type, activity, entry, exit,
 *           total, clock in, clock out, note. "עבודה מרחוק" = home, "." = office.
 *   ok2go : "דו"ח נוכחות מפורט" by ok2go (TCPDF). Row: date, weekday, task, entry, location,
 *           task, exit, location, total, cumulative. No type information. A date may repeat
 *           (several segments in one day).
 *   generic: any line with a date and at least two HH:MM values, right to left = entry, exit.
 *
 * Output: { format, rows: [{date:'DD/MM/YYYY', entry, exit, type:'משרד'|'בית'|'', note}],
 *           skipped: [{date, why}], total: 'H:MM'|null, text: ROWS.md lines }
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.HilanFillPdf = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const DATE = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const TIME = /^(\d{1,2}):(\d{2})$/;
  const SPLIT_WORD = 'מפוצל';

  // pdf.js textContent.items -> [{ y, items: [{ s, x }] }] top to bottom, items right to left
  function linesFromItems(items) {
    const byY = new Map();
    for (const it of items) {
      if (!it.str || !it.str.trim() || !it.transform) continue;
      const y = Math.round(it.transform[5] / 3) * 3;
      if (!byY.has(y)) byY.set(y, []);
      byY.get(y).push({ s: it.str.trim(), x: Math.round(it.transform[4]) });
    }
    return [...byY.keys()].sort((a, b) => b - a)
      .map((y) => ({ y, items: byY.get(y).sort((a, b) => b.x - a.x) }));
  }

  function detect(lines) {
    const text = lines.map((l) => l.items.map((i) => i.s).join(' ')).join('\n');
    if (/מלם שכר|דוח נוכחות חודשי/.test(text)) return 'malam';
    if (/דו"ח נוכחות מפורט|מצטבר/.test(text)) return 'ok2go';
    return 'generic';
  }

  const toMin = (t) => { const m = t.match(TIME); return Number(m[1]) * 60 + Number(m[2]); };
  const fmt = (min) => String(Math.floor(min / 60)).padStart(2, '0') + ':' + String(min % 60).padStart(2, '0');
  const validTime = (t) => { const m = t.match(TIME); return m && Number(m[1]) < 24 && Number(m[2]) < 60; };

  function monthTotal(lines, format) {
    // malam: the value sits on the line just above "סה"כ נוכחות חודשית מדווחת:"
    // ok2go: a header line "סה"כ שעות" and the values on the next line, aligned by x
    for (let i = 0; i < lines.length; i++) {
      const strs = lines[i].items.map((it) => it.s);
      if (format === 'malam' && strs.some((s) => /סה"כ נוכחות חודשית/.test(s))) {
        for (const l of [lines[i - 1], lines[i], lines[i + 1]].filter(Boolean)) {
          const v = l.items.find((it) => /^\d{1,3}:\d{2}$/.test(it.s));
          if (v) return v.s;
        }
      }
      if (format === 'ok2go') {
        const h = lines[i].items.find((it) => it.s === 'סה"כ שעות');
        if (h && lines[i + 1]) {
          const v = lines[i + 1].items.filter((it) => /^\d{1,3}:\d{2}$/.test(it.s))
            .sort((a, b) => Math.abs(a.x - h.x) - Math.abs(b.x - h.x))[0];
          if (v) return v.s;
        }
      }
    }
    return null;
  }

  function parse(lines) {
    const format = detect(lines);
    const byDate = new Map(); const skipped = [];
    for (const line of lines) {
      const dateItem = line.items.find((it) => DATE.test(it.s));
      if (!dateItem) continue;
      const date = dateItem.s;
      const strs = line.items.map((it) => it.s);
      const times = line.items.filter((it) => TIME.test(it.s) && validTime(it.s)).map((it) => it.s);
      let type = '';
      if (format === 'malam') {
        if (strs.includes('אין דיווח נוכחות')) { skipped.push({ date, why: 'אין דיווח נוכחות' }); continue; }
        if (strs.includes('עבודה מרחוק')) type = 'בית';
        else if (strs.includes('.')) type = 'משרד';
      }
      // day-off lines (weekend, holiday, ok2go cumulative-only) carry fewer than two clock times
      if (times.length < 2) continue;
      const entry = times[0], exit = times[1];
      if (toMin(exit) <= toMin(entry)) { skipped.push({ date, why: 'יציאה לפני כניסה' }); continue; }
      let note = '';
      if (format === 'malam') {
        // free text left of the clock columns, never a time, never the 040 clock codes
        note = line.items.filter((it) => it.x < 230 && !TIME.test(it.s) && !/^\d+$/.test(it.s)).map((it) => it.s).join(' ');
      }
      if (!byDate.has(date)) byDate.set(date, []);
      byDate.get(date).push({ date, entry, exit, type, note });
    }
    const rows = [];
    for (const [date, segs] of byDate) {
      if (segs.length === 1) { rows.push(segs[0]); continue; }
      // several segments on one day: report the span and flag it, the target must not guess
      const entry = fmt(Math.min(...segs.map((s) => toMin(s.entry))));
      const exit = fmt(Math.max(...segs.map((s) => toMin(s.exit))));
      const parts = segs.map((s) => `${s.entry}-${s.exit}`).join(' ');
      rows.push({ date, entry, exit, type: segs[0].type, note: `${SPLIT_WORD}: ${parts}`, segments: segs.map((s) => ({ entry: s.entry, exit: s.exit })) });
    }
    rows.sort((a, b) => a.date.split('/').reverse().join('') < b.date.split('/').reverse().join('') ? -1 : 1);
    const total = monthTotal(lines, format);
    return { format, rows, skipped, total, text: toText(rows) };
  }

  function toText(rows) {
    const q = (s) => (/[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s);
    return rows.map((r) => [r.date, r.entry, r.exit, r.type, q(r.note || '')].join(',')).join('\n');
  }

  // worked minutes: a split day counts its segments, not the span, so the sum can be checked
  // against the report's own total
  function sumMinutes(rows) {
    return rows.reduce((s, r) => s + (r.segments || [r]).reduce((t, g) => t + toMin(g.exit) - toMin(g.entry), 0), 0);
  }

  return { linesFromItems, detect, parse, toText, sumMinutes, fmt, SPLIT_WORD };
});
