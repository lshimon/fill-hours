/* Fill Hours: fill the Hilan attendance grid from a pasted table.
 *
 * Three separate parts, on purpose:
 *   parse  - pasted text (TSV from Google Sheets or CSV) -> rows {date, entry, exit, office, note}
 *   check  - rows vs the calendar shown on this page -> per-row verdict
 *   fill   - select the days, press "ימים נבחרים", write into the grid rows
 *
 * The extension NEVER presses save. The user reviews the grid and clicks "שמירה".
 *
 * Runs in the page's main world so it can call Hilan's own day-select function (_dSD)
 * and wait on ASP.NET async postbacks (Sys.WebForms.PageRequestManager).
 */
(() => {
  'use strict';

  // ---------- constants and settings ----------
  // Report-type codes differ between Hilan tenants (home = 100 here, 120 or 15 elsewhere), so the
  // type is resolved by the option TEXT in the grid's own dropdown. Codes are only a last resort.
  const SYMBOL_FALLBACK = { office: '0', home: '100' };
  function symbolValue(select, office) {
    const want = office ? settings.officeType : settings.homeType;
    const opt = select && [...select.options].find((o) => o.text.trim().includes(want));
    return opt ? opt.value : SYMBOL_FALLBACK[office ? 'office' : 'home'];
  }
  const STORE_TEXT = 'hilanFill.text';
  const STORE_JOB = 'hilanFill.job';
  const STORE_SETTINGS = 'hilanFill.settings';

  const defaultSettings = {
    project: 'משרד הבריאות',      // substring matched against the project dropdown text; empty = do not touch
    officeWord: 'משרד',           // a row containing this word = office (נוכחות)
    homeWord: 'בית',              // a row containing this word = home (עבודה מהבית)
    defaultOffice: false,         // a row with neither word = office when true, home when false
    officeType: 'נוכחות',         // text of the office option in Hilan's "סוג דיווח" dropdown
    homeType: 'עבודה מהבית',      // text of the home option there
    orderText: '',                // substring for the הזמנה dropdown; empty = pick it when it is the only option
    taskText: '',                 // same for משימה
    writeNotes: false,            // copy the notes column into הערות
    updateReported: false,        // also rewrite days that already carry a saved report
  };
  const settings = Object.assign({}, defaultSettings, readJSON(localStorage, STORE_SETTINGS) || {});

  // ---------- small helpers ----------
  function readJSON(store, key) { try { return JSON.parse(store.getItem(key)); } catch (e) { return null; } }
  function writeJSON(store, key, val) { store.setItem(key, JSON.stringify(val)); }
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const pad2 = (n) => String(n).padStart(2, '0');

  // ---------- part 1: parse (parse.js, loaded before this file) ----------
  const P = window.HilanFillParse;
  if (!P) { console.error('Fill Hours: parse.js not loaded'); return; }
  function parseRows(text) { return P.parseRows(text, { officeWord: settings.officeWord, homeWord: settings.homeWord, defaultOffice: settings.defaultOffice }); }

  // ---------- part 2: check against the calendar on screen ----------
  function shownMonth() {
    const v = document.querySelector('[name="ctl00$mp$currentMonth"]')?.value || '';
    const m = v.match(/^\d{2}\/(\d{2})\/(\d{4})$/);
    return m ? { m: Number(m[1]), y: Number(m[2]) } : null;
  }
  function dayCell(days) { return document.querySelector(`td[days="${days}"]`); }
  function cellReported(td) {
    const msg = td.querySelector('.cDM');
    return !!(msg && msg.textContent.trim());
  }

  function checkRows(rows) {
    const month = shownMonth();
    return rows.map((r) => {
      const v = Object.assign({}, r, { status: 'ok', why: '' });
      if (!r.entry || !r.exit) { v.status = 'bad'; v.why = 'חסרה שעת כניסה או יציאה'; return v; }
      if (r.entry >= r.exit) { v.status = 'bad'; v.why = 'יציאה לפני כניסה'; return v; }
      if (/מפוצל/.test(r.note || '')) { v.status = 'bad'; v.why = 'יום מפוצל, מלא ידנית: ' + r.note.replace(/^מפוצל:?\s*/, ''); return v; }
      if (!month || r.date.m !== month.m || r.date.y !== month.y) { v.status = 'bad'; v.why = 'לא החודש המוצג'; return v; }
      const td = dayCell(r.days);
      if (!td) { v.status = 'bad'; v.why = 'היום לא נמצא בלוח'; return v; }
      if (td.classList.contains('cHD')) { v.status = 'skip'; v.why = 'סופ"ש או חג'; return v; }
      if (cellReported(td)) {
        if (!settings.updateReported) { v.status = 'skip'; v.why = 'כבר מדווח'; return v; }
        v.why = 'יעודכן (כבר מדווח)';
      }
      return v;
    });
  }

  // ---------- part 3: fill ----------
  function gridRows() {
    const out = [];
    document.querySelectorAll('input[id*="ManualEntry_EmployeeReports_row_"]').forEach((entry) => {
      const idx = entry.id.match(/_row_(\d+)_0/)?.[1];
      if (idx == null) return;
      const dateEl = document.querySelector(`[id*="cellOf_ReportDate_row_${idx}_"]`);
      const key = dateEl?.textContent.trim().match(/(\d{2}\/\d{2})/)?.[1];
      if (!key) return;
      out.push({
        idx, key, entry,
        exit: document.querySelector(`input[id*="ManualExit_EmployeeReports_row_${idx}_0"]`),
        symbol: document.querySelector(`select[id*="SymbolId_EmployeeReports_row_${idx}_0"]`),
        project: document.querySelector(`select[id*="ProjectStep1_EmployeeReports_row_${idx}_0"]`),
        order: document.querySelector(`select[id*="ProjectStep2_EmployeeReports_row_${idx}_0"]`),
        task: document.querySelector(`select[id*="ProjectStep3_EmployeeReports_row_${idx}_0"]`),
        comment: document.querySelector(`input[id*="Comment_EmployeeReports_row_${idx}_0"]`),
      });
    });
    return out;
  }

  function inAsyncPostback() {
    try { return window.Sys?.WebForms?.PageRequestManager?.getInstance().get_isInAsyncPostBack() === true; }
    catch (e) { return false; }
  }
  async function waitIdle(maxMs = 15000) {
    const t0 = Date.now();
    await sleep(150);
    while (inAsyncPostback() && Date.now() - t0 < maxMs) await sleep(150);
    await sleep(150);
  }

  function setText(input, value) {
    input.focus();
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.blur();
    input.dispatchEvent(new Event('blur', { bubbles: true }));
  }
  function setSelect(select, value) {
    if (!select || select.disabled || select.value === value) return false;
    select.value = value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }
  function projectValue(select) {
    if (!settings.project || !select) return null;
    const opt = [...select.options].find((o) => o.text.includes(settings.project));
    return opt ? opt.value : null;
  }
  // Cascade dropdowns (הזמנה, משימה): a placeholder option plus real ones. Pick the option whose text
  // contains wantText; with no wantText, pick the only real option; otherwise leave for the user.
  const isPlaceholder = (o) => o.value === '' || /^בחר/.test(o.text.trim());
  function cascadeValue(select, wantText) {
    if (!select || select.disabled) return { value: null, why: 'off' };
    const real = [...select.options].filter((o) => !isPlaceholder(o));
    if (!real.length) return { value: null, why: 'off' };
    if (wantText) { const o = real.find((x) => x.text.includes(wantText)); return o ? { value: o.value } : { value: null, why: 'no-match' }; }
    if (real.length === 1) return { value: real[0].value };
    return { value: null, why: 'many' };
  }

  // Step A: select the days on the calendar and press "ימים נבחרים" (postback).
  function selectDays(rows) {
    // clear any current selection first, so the grid holds exactly our days
    document.querySelectorAll('td[days].CSD').forEach((td) => td.click());
    let n = 0;
    rows.forEach((r) => { const td = dayCell(r.days); if (td && !td.classList.contains('CSD')) { td.click(); n++; } });
    return n;
  }

  // Step B: write into the grid. Re-queries rows by date after every select change,
  // because a postback can re-render the grid.
  const hasReal = (sel) => !!sel && !sel.disabled && [...sel.options].some((o) => !isPlaceholder(o));
  const refind = (key) => gridRows().find((x) => x.key === key);

  // After a dropdown change Hilan reloads the next dropdown with an async postback that may start
  // a moment later. Wait until the postback is over AND the dependent dropdown is usable, or time out.
  async function waitForNext(key, field, maxMs) {
    const t0 = Date.now();
    while (Date.now() - t0 < maxMs) {
      await sleep(150);
      if (inAsyncPostback()) continue;
      const g = refind(key);
      if (!g) continue;
      if (!field || hasReal(g[field])) { await sleep(100); return; }
    }
  }

  // What is still wrong in a grid row versus the wanted values. Empty list = row complete.
  function validateRow(r) {
    const g = refind(r.key);
    if (!g) return ['שורה לא נמצאה'];
    const bad = [];
    if (g.symbol && g.symbol.value !== symbolValue(g.symbol, r.office)) bad.push('סוג');
    const pv = projectValue(g.project);
    if (pv && g.project.value !== pv) bad.push('לקוח');
    for (const [field, label] of [['order', 'הזמנה'], ['task', 'משימה']]) {
      const sel = g[field];
      if (hasReal(sel) && isPlaceholder(sel.options[sel.selectedIndex] || { value: '', text: '' })) bad.push(label);
    }
    const norm = (v) => (v || '').replace(/[^\d]/g, '');
    if (norm(g.entry.value) !== norm(r.entry)) bad.push('כניסה');
    if (norm(g.exit.value) !== norm(r.exit)) bad.push('יציאה');
    return bad;
  }

  async function fillRow(r, warn) {
    let g = refind(r.key);
    if (!g) return 'missing';
    if (g.entry.disabled) return 'locked';

    if (setSelect(g.symbol, symbolValue(g.symbol, r.office))) await waitForNext(r.key, null, 4000);
    g = refind(r.key) || g;
    const pv = projectValue(g.project);
    if (pv && setSelect(g.project, pv)) await waitForNext(r.key, 'order', 6000);
    g = refind(r.key) || g;
    // cascade: הזמנה then משימה, each may trigger its own postback
    for (const [field, next, want, label] of [['order', 'task', settings.orderText, 'הזמנה'], ['task', null, settings.taskText, 'משימה']]) {
      const c = cascadeValue(g[field], want);
      if (c.value != null) { if (setSelect(g[field], c.value)) await waitForNext(r.key, next, 6000); g = refind(r.key) || g; }
      else if (c.why === 'many' || c.why === 'no-match') warn.push(`${r.key}: בחר ${label} ידנית`);
    }

    setText(g.entry, r.entry);
    setText(g.exit, r.exit);
    if (settings.writeNotes && r.note && g.comment) setText(g.comment, r.note.slice(0, 220));
    return 'ok';
  }

  let stopRequested = false;
  async function fillGrid(rows) {
    const done = []; const missing = []; const warn = []; const incomplete = []; const unchanged = [];
    stopRequested = false;
    ui.stop.hidden = false;
    let i = 0;
    for (const r of rows) {
      i++;
      if (stopRequested) { warn.push(`נעצר לפני ${r.key}`); break; }
      status(`ממלא ${r.key}... (${i}/${rows.length})`);
      // diff: a row that already holds exactly the wanted values is left untouched
      if (refind(r.key) && !validateRow(r).length) { unchanged.push(r.key); continue; }
      const res = await fillRow(r, warn);
      if (res === 'missing') { missing.push(r.key); continue; }
      if (res === 'locked') { missing.push(r.key + ' (נעול)'); continue; }
      done.push(r);
      await sleep(60);
    }
    // validation pass: retry rows that are not complete, once, then report what is left
    for (const r of done) {
      if (stopRequested) break;
      if (!validateRow(r).length) continue;
      status(`משלים ${r.key}...`);
      await waitForNext(r.key, null, 2000);
      await fillRow(r, []);
      const bad = validateRow(r);
      if (bad.length) incomplete.push(`${r.key} (${bad.join(', ')})`);
    }
    ui.stop.hidden = true;
    return { done: done.map((r) => r.key), missing, warn, incomplete, unchanged };
  }

  // ---------- job persistence across the postback ----------
  function saveJob(rows) { writeJSON(sessionStorage, STORE_JOB, { rows, at: Date.now() }); }
  function loadJob() { const j = readJSON(sessionStorage, STORE_JOB); return j && Date.now() - j.at < 120000 ? j : null; }
  function clearJob() { sessionStorage.removeItem(STORE_JOB); }

  // ---------- UI ----------
  const ui = {};
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => { if (k === 'text') el.textContent = v; else if (k.startsWith('on')) el.addEventListener(k.slice(2), v); else el.setAttribute(k, v); });
    kids.forEach((k) => el.append(k));
    return el;
  }
  function status(msg, cls) { ui.status.textContent = msg; ui.status.className = 'hf-status' + (cls ? ' ' + cls : ''); }

  const toMin = (t) => { const [hh, mm] = t.split(':').map(Number); return hh * 60 + mm; };
  const fmtMin = (m) => Math.floor(m / 60) + ':' + pad2(m % 60);
  const rowMinutes = (r) => (r.entry && r.exit && r.exit > r.entry) ? toMin(r.exit) - toMin(r.entry) : 0;

  let onlyProblems = false;
  function renderPreview(checked) {
    ui.preview.innerHTML = '';
    if (!checked.length) return;
    const shown = onlyProblems ? checked.filter((r) => r.status !== 'ok') : checked;
    const tbl = h('table', {}, h('thead', {}, h('tr', {}, ...['תאריך', 'סוג', 'כניסה', 'יציאה', 'שעות', 'מצב'].map((t) => h('th', { text: t })))));
    const tb = h('tbody');
    shown.forEach((r) => {
      const mins = rowMinutes(r);
      tb.append(h('tr', { class: r.status === 'ok' ? '' : 'hf-' + r.status },
        h('td', { text: r.key }),
        h('td', { text: (r.office ? 'נוכחות' : 'מהבית') + (r.typed ? '' : ' (ברירת מחדל)') }),
        h('td', { text: r.entry || '' }),
        h('td', { text: r.exit || '' }),
        h('td', { text: mins ? fmtMin(mins) : '' }),
        h('td', { text: r.status === 'ok' ? (r.why || 'ימולא') : r.why })));
    });
    if (!shown.length) tb.append(h('tr', {}, h('td', { colspan: '6', text: 'אין בעיות' })));
    const total = checked.filter((r) => r.status === 'ok').reduce((s, r) => s + rowMinutes(r), 0);
    tb.append(h('tr', { class: 'hf-total' },
      h('td', { colspan: '4', text: 'סה"כ שעות למילוי' }),
      h('td', { text: fmtMin(total) }),
      h('td', { class: 'hf-hint', text: `${(total / 60).toFixed(2)} בעשרוני` })));
    tbl.append(tb);
    ui.preview.append(tbl);
  }

  // ---------- PDF input: the file only fills the paste box, the rest of the flow is unchanged ----------
  // Latin tokens inside Hebrew text are wrapped in bidi isolates so they do not flip the line
  const ltr = (s) => '⁦' + s + '⁩';
  const FORMAT_NAMES = { malam: 'מל"מ', ok2go: ltr('ok2go'), generic: 'פורמט לא מוכר' };
  async function loadPdf(file) {
    const S = window.HilanFillPdf; const lib = window.pdfjsLib;
    if (!S || !lib) { status('קריאת PDF לא זמינה (הספרייה לא נטענה). רענן את הדף.', 'err'); return; }
    status(`קורא ${file.name}...`);
    try {
      const data = new Uint8Array(await file.arrayBuffer());
      const doc = await lib.getDocument({ data, isEvalSupported: false }).promise;
      let items = [];
      for (let p = 1; p <= doc.numPages; p++) items = items.concat((await (await doc.getPage(p)).getTextContent()).items);
      const res = S.parse(S.linesFromItems(items));
      if (!res.rows.length) { status('לא נמצאו ימים עם שעות ב-PDF. אם זה דוח נוכחות, פתח Issue וצרף אותו.', 'err'); return; }
      ui.text.value = res.text;
      ui.fill.disabled = true;
      doCheck();
      const sum = S.fmt(S.sumMinutes(res.rows));
      const parts = [`זוהה: ${FORMAT_NAMES[res.format]}`, `${res.rows.length} ימים`];
      if (res.total) parts.push(res.total === sum ? `סה"כ ב-${ltr('PDF')} ${ltr(res.total)}, תואם` : `סה"כ ב-${ltr('PDF')} ${ltr(res.total)} לעומת ${ltr(sum)} בטבלה, בדוק`);
      if (res.skipped.length) {
        const byWhy = new Map();
        for (const s of res.skipped) { if (!byWhy.has(s.why)) byWhy.set(s.why, []); byWhy.get(s.why).push(s.date.slice(0, 5)); }
        parts.push('דולגו: ' + [...byWhy].map(([why, dates]) => `${why}: ${dates.join(', ')}`).join('; '));
      }
      if (res.format === 'generic') parts.push('בדוק כל שורה לפני מילוי');
      const bad = res.total && res.total !== sum;
      status(parts.join(' | ') + '. ' + (ui.status.textContent || ''), bad || res.format === 'generic' ? 'err' : '');
    } catch (e) {
      status('קריאת ה-PDF נכשלה: ' + (e && e.message ? e.message : e), 'err');
    }
  }

  function doCheck() {
    const text = ui.text.value;
    localStorage.setItem(STORE_TEXT, text);
    const rows = parseRows(text);
    if (!rows.length) { renderPreview([]); status('לא נמצאו שורות עם תאריך. העתק את הטבלה מהגיליון (כולל עמודת התאריך).', 'err'); ui.fill.disabled = true; return null; }
    const checked = checkRows(rows);
    renderPreview(checked);
    const ok = checked.filter((r) => r.status === 'ok');
    const bad = checked.filter((r) => r.status === 'bad');
    const month = shownMonth();
    status(`חודש מוצג ${month ? pad2(month.m) + '/' + month.y : '?'} | למילוי: ${ok.length} | ידולגו: ${checked.length - ok.length - bad.length} | שגויים: ${bad.length}`, bad.length ? 'err' : '');
    const problems = checked.length - ok.length;
    ui.filter.hidden = !problems;
    ui.filter.textContent = onlyProblems ? 'הצג הכל' : `הצג רק בעיות (${problems})`;
    ui.fill.disabled = !ok.length;
    return ok;
  }

  async function doFill() {
    const ok = doCheck();
    if (!ok || !ok.length) return;
    ui.fill.disabled = true;
    const existing = gridRows();
    const allPresent = ok.every((r) => existing.some((g) => g.key === r.key));
    if (allPresent) {                                   // grid already shows exactly our days: no postback needed
      status('ממלא...');
      const res = await fillGrid(ok);
      finish(res);
      return;
    }
    saveJob(ok);
    const n = selectDays(ok);
    status(`נבחרו ${n} ימים, טוען את הטבלה...`);
    const btn = document.querySelector('#ctl00_mp_RefreshSelectedDays');
    if (!btn) { status('כפתור "ימים נבחרים" לא נמצא', 'err'); clearJob(); return; }
    btn.click();
    // If this is an async postback the page stays alive: continue here. If it is a full postback,
    // the script restarts and resumeJob() takes over.
    await waitIdle(20000);
    await resumeJob();
  }

  function finish(res) {
    clearJob();
    const inc = res.incomplete || [];
    const problems = res.missing.length + inc.length + (res.warn ? res.warn.length : 0);
    const unch = res.unchanged || [];
    const changedNote = unch.length ? ` שונו: ${res.done.length}, ללא שינוי: ${unch.length}.` : '';
    const msg = (inc.length ? `אומת: ${res.done.length - inc.length} ימים שלמים.${changedNote} לא הושלמו: ${inc.join('; ')}. תקן ידנית או לחץ "מלא" שוב.`
      : `אומת: ${res.done.length + unch.length} ימים שלמים.${changedNote} בדוק את הטבלה ולחץ "שמירה".`)
      + (res.missing.length ? ` לא נמצאו/נעולים: ${res.missing.join(', ')}.` : '')
      + (res.warn && res.warn.length ? ` ${res.warn.join('; ')}.` : '');
    status(msg, problems ? 'err' : 'ok');
    ui.panel.hidden = false;
  }

  async function resumeJob() {
    const job = loadJob();
    if (!job) return;
    const t0 = Date.now();
    while (Date.now() - t0 < 20000) {                    // wait for the grid rows to appear
      const g = gridRows();
      if (job.rows.some((r) => g.some((x) => x.key === r.key))) break;
      await sleep(250);
    }
    if (!gridRows().length) { status('הטבלה לא נטענה אחרי "ימים נבחרים". נסה שוב.', 'err'); clearJob(); return; }
    ui.panel.hidden = false;
    status('ממלא...');
    const res = await fillGrid(job.rows);
    finish(res);
  }

  function saveSettings() {
    settings.project = ui.project.value.trim();
    settings.officeWord = ui.officeWord.value.trim() || 'משרד';
    settings.homeWord = ui.homeWord.value.trim() || 'בית';
    settings.defaultOffice = ui.defaultType.value === 'office';
    settings.orderText = ui.orderText.value.trim();
    settings.writeNotes = ui.notes.checked;
    settings.updateReported = ui.updateReported.checked;
    writeJSON(localStorage, STORE_SETTINGS, settings);
  }

  function buildUI() {
    if (document.getElementById('hf-launch')) return;
    ui.text = h('textarea', { placeholder: 'הדבק כאן את השורות מהגיליון: תאריך, כניסה, יציאה, משרד/בית. או בחר קובץ PDF למטה.', oninput: () => { ui.fill.disabled = true; } });
    ui.text.value = localStorage.getItem(STORE_TEXT) || '';
    ui.pdf = h('input', { type: 'file', accept: '.pdf,application/pdf', onchange: () => { const f = ui.pdf.files && ui.pdf.files[0]; if (f) loadPdf(f); ui.pdf.value = ''; } });
    ui.project = h('input', { type: 'text', value: settings.project, size: '16', onchange: saveSettings });
    ui.orderText = h('input', { type: 'text', value: settings.orderText || '', size: '12', placeholder: 'ריק = היחידה', onchange: saveSettings });
    ui.officeWord = h('input', { type: 'text', value: settings.officeWord, size: '6', onchange: saveSettings });
    ui.homeWord = h('input', { type: 'text', value: settings.homeWord, size: '6', onchange: saveSettings });
    ui.defaultType = h('select', { onchange: saveSettings },
      h('option', { value: 'office', text: 'נוכחות' }), h('option', { value: 'home', text: 'עבודה מהבית' }));
    ui.defaultType.value = settings.defaultOffice ? 'office' : 'home';
    ui.notes = h('input', { type: 'checkbox', onchange: saveSettings }); ui.notes.checked = !!settings.writeNotes;
    ui.updateReported = h('input', { type: 'checkbox', onchange: () => { saveSettings(); if (ui.text.value) doCheck(); } }); ui.updateReported.checked = !!settings.updateReported;
    ui.check = h('button', { class: 'hf-secondary', text: 'בדוק', onclick: doCheck });
    ui.fill = h('button', { text: 'מלא', disabled: 'disabled', onclick: doFill });
    ui.stop = h('button', { class: 'hf-stop', text: 'עצור', hidden: 'hidden', onclick: () => { stopRequested = true; clearJob(); status('עוצר אחרי השורה הנוכחית...'); } });
    ui.filter = h('button', { class: 'hf-secondary', text: 'הצג רק בעיות', hidden: 'hidden', onclick: () => { onlyProblems = !onlyProblems; doCheck(); } });
    ui.clear = h('button', { class: 'hf-secondary', text: 'נקה', onclick: () => { ui.text.value = ''; localStorage.removeItem(STORE_TEXT); ui.preview.innerHTML = ''; ui.fill.disabled = true; ui.filter.hidden = true; status(''); ui.text.focus(); } });
    ui.preview = h('div');
    ui.status = h('div', { class: 'hf-status' });

    ui.panel = h('div', { id: 'hf-panel', hidden: 'hidden' },
      h('div', { class: 'hf-head' },
        h('h3', { text: 'מילוי שעות מטבלה' }),
        h('button', { class: 'hf-min', title: 'מזער', text: '−', onclick: () => { ui.panel.hidden = true; } })),
      h('div', { class: 'hf-body' },
        h('div', { class: 'hf-hint', text: 'שלב 1: בגיליון, סמן את שורות החודש (עם עמודת התאריך) והעתק. שלב 2: הדבק כאן, לחץ "בדוק" ואז "מלא". שלב 3: בדוק את הטבלה בחילן ולחץ "שמירה" בעצמך.' }),
        ui.text,
        h('div', { class: 'hf-row' }, h('label', { text: 'או קובץ PDF של דוח נוכחות:' }), ui.pdf),
        h('div', { class: 'hf-row' }, h('label', { text: 'פרויקט מכיל:' }), ui.project, h('label', { text: 'הזמנה מכיל:' }), ui.orderText),
        h('div', { class: 'hf-row' }, h('label', { text: 'מילת משרד:' }), ui.officeWord, h('label', { text: 'מילת בית:' }), ui.homeWord, h('label', { text: 'ללא סימון:' }), ui.defaultType),
        h('div', { class: 'hf-row' }, h('label', {}, ui.notes, ' להעתיק הערות'), h('label', {}, ui.updateReported, ' לעדכן גם ימים שכבר דווחו')),
        h('div', { class: 'hf-row' }, ui.check, ui.fill, ui.stop, ui.filter, ui.clear),
        ui.preview, ui.status));

    const launch = h('button', { id: 'hf-launch', text: 'מילוי שעות', onclick: () => { ui.panel.hidden = !ui.panel.hidden; if (!ui.panel.hidden && ui.text.value) doCheck(); } });
    document.body.append(launch, ui.panel);
    // click outside the panel minimizes it. Only real user clicks count: the fill clicks calendar
    // cells programmatically, and those must not hide the panel mid-run.
    document.addEventListener('click', (e) => {
      if (!e.isTrusted || ui.panel.hidden) return;
      if (ui.panel.contains(e.target) || launch.contains(e.target)) return;
      ui.panel.hidden = true;
    }, true);
  }

  buildUI();
  resumeJob();
})();
