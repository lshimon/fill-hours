/* Page Structure Capture: the sanitizer. Runs inside the page, on a CLONE of the document, and
 * returns markup with every piece of content removed and only the structure kept.
 *
 * Removed:  every text node (each character masked: digit 0, Hebrew א, Latin x, space kept),
 *           every value-like attribute (value, title, alt, placeholder, aria-label, content...),
 *           inline script bodies, hidden-field payloads, comments, data: URLs, srcdoc,
 *           query strings and fragments from every URL,
 *           every run of 5+ digits inside ids, names, classes and other attributes (employee ids).
 * Kept:     tags, nesting, ids/classes/names (with long numbers zeroed), roles, types, styles,
 *           external script and stylesheet addresses (the "sources"), form and button structure.
 *
 * Pure function of the live DOM; nothing is sent anywhere. Also loaded by test/capture.test.html.
 */
function pscSanitizeFrame() {
  const MASK_ATTRS = new Set(['value', 'title', 'alt', 'placeholder', 'aria-label', 'aria-valuetext',
    'aria-valuenow', 'aria-description', 'content', 'label', 'summary', 'abbr', 'data-original-title',
    'data-title', 'data-tooltip', 'data-content', 'data-value', 'data-text']);
  const URL_ATTRS = new Set(['href', 'src', 'action', 'formaction', 'poster', 'cite', 'background', 'data-src', 'data-href']);
  const DROP_ATTRS = new Set(['srcdoc', 'srcset', 'integrity', 'nonce']);
  const stats = { textNodes: 0, attributes: 0, scripts: 0, hiddenFields: 0, urls: 0, longNumbers: 0 };

  const maskText = (s) => s.replace(/[0-9٠-٩]/g, '0').replace(/[֐-׿]/g, 'א')
    .replace(/[A-Za-zÀ-ɏ]/g, 'x').replace(/[^\s0אx.,:;\/\-()\[\]{}!?"'׳״]/g, '*');
  const zeroLongNumbers = (s) => s.replace(/\d{5,}/g, (m) => { stats.longNumbers++; return '0'.repeat(m.length); });
  const cleanUrl = (u) => {
    if (!u) return u;
    if (/^\s*(data|blob|javascript):/i.test(u)) return u.replace(/^\s*([a-z]+):.*/i, '$1:[removed]');
    stats.urls++;
    return zeroLongNumbers(u.replace(/[?#].*$/, ''));
  };

  const root = document.documentElement.cloneNode(true);

  // comments
  const cw = document.createTreeWalker(root, NodeFilter.SHOW_COMMENT);
  const comments = []; while (cw.nextNode()) comments.push(cw.currentNode);
  comments.forEach((c) => c.remove());

  // scripts: keep the address of external ones, drop every inline body (may embed user data)
  root.querySelectorAll('script').forEach((s) => {
    stats.scripts++;
    if (s.hasAttribute('src')) s.textContent = '';
    else s.textContent = '/* inline script removed: ' + s.textContent.length + ' chars */';
  });
  root.querySelectorAll('noscript, template').forEach((n) => { n.innerHTML = ''; });

  // text nodes (skip <style>, which is layout, not content)
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const texts = []; while (tw.nextNode()) texts.push(tw.currentNode);
  for (const t of texts) {
    const p = t.parentNode && t.parentNode.nodeName;
    if (p === 'STYLE' || p === 'SCRIPT') continue;
    if (t.nodeValue.trim()) { t.nodeValue = maskText(t.nodeValue); stats.textNodes++; }
  }

  // attributes
  root.querySelectorAll('*').forEach((el) => {
    const isHidden = el.nodeName === 'INPUT' && (el.getAttribute('type') || '').toLowerCase() === 'hidden';
    for (const a of [...el.attributes]) {
      const n = a.name.toLowerCase(); let v = a.value;
      if (DROP_ATTRS.has(n)) { el.removeAttribute(a.name); continue; }
      if (isHidden && n === 'value') { el.setAttribute('value', '[removed ' + v.length + ' chars]'); stats.hiddenFields++; continue; }
      if (MASK_ATTRS.has(n)) { el.setAttribute(a.name, v.length > 60 ? '[removed ' + v.length + ' chars]' : maskText(v)); stats.attributes++; continue; }
      if (URL_ATTRS.has(n)) { el.setAttribute(a.name, cleanUrl(v)); continue; }
      if (n === 'style') continue;
      // event handlers can carry ids, emails and names as string arguments: mask every quoted literal
      if (n.startsWith('on')) v = v.replace(/(['"])(?:\\.|(?!\1).)*\1/g, (q) => q[0] + maskText(q.slice(1, -1)) + q[0]);
      const z = zeroLongNumbers(v);
      if (z !== a.value) el.setAttribute(a.name, z);
    }
    // live form state is not an attribute, but make sure nothing survives serialization
    if (el.nodeName === 'TEXTAREA') el.textContent = '';
    if (el.nodeName === 'OPTION' && el.hasAttribute('selected')) el.removeAttribute('selected');
  });

  const sources = [...root.querySelectorAll('script[src], link[href]')]
    .filter((n) => n.nodeName === 'SCRIPT' || /stylesheet/i.test(n.getAttribute('rel') || ''))
    .map((n) => n.getAttribute('src') || n.getAttribute('href'));

  return {
    url: cleanUrl(location.origin + location.pathname),
    frame: window === window.top ? 'top' : 'iframe',
    html: '<!doctype html>\n' + root.outerHTML,
    sources,
    stats,
  };
}
