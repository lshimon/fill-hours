/* Preview page: shows exactly what the file will contain, lets the user search it for their own
 * details, and downloads it only on click. */
(async function () {
  const id = new URLSearchParams(location.search).get('id');
  const data = (await chrome.storage.session.get(id))[id];
  const $ = (s) => document.querySelector(s);
  if (!data || !data.frames.length) { $('#summary').textContent = 'לא נמצא מידע. חזרו לעמוד ולחצו שוב על אייקון התוסף.'; return; }

  const frames = data.frames.filter((f) => !f.error);
  const errors = data.frames.filter((f) => f.error);
  const file = [
    '<!-- Page Structure Capture ' + data.at + ' | frames: ' + frames.length + ' -->',
    ...frames.map((f, i) => '<!-- ===== frame ' + (i + 1) + ' (' + f.frame + '): ' + f.url + ' ===== -->\n' +
      '<!-- sources:\n' + f.sources.join('\n') + '\n-->\n' + f.html),
  ].join('\n\n');

  const top = frames.find((f) => f.frame === 'top') || frames[0];
  const host = top ? top.url.replace(/^https?:\/\//, '').split('/')[0] : 'page';
  $('#summary').innerHTML = '';
  const sum = document.createElement('div');
  sum.textContent = 'עמוד: ' + (top ? top.url : '?') + ' | מסגרות: ' + frames.length + (errors.length ? ' | מסגרות שלא נקראו: ' + errors.length : '');
  $('#summary').append(sum);

  const total = (k) => frames.reduce((s, f) => s + (f.stats[k] || 0), 0);
  const rows = [
    ['קטעי טקסט שהוחלפו', total('textNodes')],
    ['ערכים בשדות ובתוויות שהוסרו', total('attributes')],
    ['שדות נסתרים שרוקנו', total('hiddenFields')],
    ['סקריפטים שהתוכן שלהם הוסר', total('scripts')],
    ['מספרים ארוכים (מזהים) שאופסו', total('longNumbers')],
    ['כתובות שנוקו מפרמטרים', total('urls')],
  ];
  for (const [k, v] of rows) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td></td><td></td>';
    tr.children[0].textContent = k; tr.children[1].textContent = String(v);
    $('#stats').append(tr);
  }

  $('#html').value = file.length > 400000 ? file.slice(0, 400000) + '\n\n[... ' + (file.length - 400000) + ' more chars in the file]' : file;

  $('#probe').addEventListener('input', () => {
    const q = $('#probe').value.trim();
    const out = $('#probeResult');
    if (!q) { out.textContent = ''; out.className = ''; return; }
    const hits = file.split(q).length - 1;
    out.textContent = hits ? 'נמצא ' + hits + ' פעמים. אל תשלחו, כתבו לנו.' : 'לא נמצא בקובץ.';
    out.className = hits ? 'bad' : 'ok';
  });

  $('#download').addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([file], { type: 'text/html' }));
    a.download = 'page-structure-' + host + '-' + data.at.slice(0, 10) + '.html';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  });
  $('#close').addEventListener('click', async () => { await chrome.storage.session.remove(id); window.close(); });
})();
