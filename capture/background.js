/* Page Structure Capture: on icon click, sanitize the active tab (all frames the click grants
 * access to), keep the result in session storage, and open the preview page. Nothing is sent
 * anywhere; the user downloads the file from the preview page and sends it themselves. */
importScripts('sanitize.js');

chrome.action.onClicked.addListener(async (tab) => {
  let results;
  try {
    results = await chrome.scripting.executeScript({ target: { tabId: tab.id, allFrames: true }, func: pscSanitizeFrame });
  } catch (e) {
    // a cross-origin frame the click does not cover: fall back to the main page only
    try { results = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: pscSanitizeFrame }); }
    catch (e2) { results = [{ result: { error: String(e2 && e2.message || e2) } }]; }
  }
  const frames = results.map((r) => r.result).filter(Boolean);
  const id = String(Date.now());
  await chrome.storage.session.set({ [id]: { at: new Date().toISOString(), frames } });
  chrome.tabs.create({ url: chrome.runtime.getURL('preview.html') + '?id=' + id });
});
