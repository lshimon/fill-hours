# Chrome Web Store listing: Fill Hours

Source of truth: `manifest.json` 0.3.0 and `README.md`. Nothing below claims more than they show.
Visibility for the first release: **unlisted** (install by link only, not in store search).

## Name (10 chars)

Fill Hours

## Short description

Hebrew (primary locale, 93 chars):

מילוי שעות בחילנט מכל טבלה או מקובץ PDF של דוח נוכחות: מדביקים, בודקים, לוחצים שמירה בעצמכם.

English (117 chars):

Fill your Hilanet attendance from any table or an attendance-report PDF. Paste, review the preview, save it yourself.

## Detailed description

Hebrew:

התוסף Fill Hours, בעברית "מילוי שעות", הוא תוסף קטן לעמוד "דיווח ועדכון" בחילנט. במקום להקליד כל יום מחדש, מדביקים את שורות החודש מהטבלה שאתם כבר מנהלים (גיליון גוגל, אקסל, CSV) או בוחרים קובץ PDF של דוח נוכחות, בודקים את התצוגה המקדימה, ולוחצים "מלא". התוסף מנקה את בחירת הימים בלוח, בוחר את ימי הטבלה ולוחץ "ימים נבחרים" (הדף עשוי להיטען מחדש והחלון חוזר לבד וממשיך), ממלא סוג דיווח, פרויקט (לפי ההגדרה "פרויקט מכיל" בחלון), כניסה ויציאה, ומאמת בכל שורה שסוג, פרויקט, כניסה ויציאה נכתבו נכון. את "שמירה" בחילן לוחצים אתם.

מה הוא עושה:
- קורא טבלה מודבקת: תאריך, כניסה, יציאה, ובאופן אופציונלי משרד או בית. שורה בלי המילה "משרד" או "בית" תמולא לפי ההגדרה "ללא סימון" בחלון (ברירת המחדל: עבודה מהבית). הערות מועתקות רק אם סימנתם "להעתיק הערות".
- קורא קובץ PDF של דוח נוכחות של מלם שכר או של ok2go, בתוך הדפדפן.
- מציג תצוגה מקדימה עם סה"כ שעות לפני שנוגע בטבלה. מדלג על ימים שכבר דווחו (אלא אם סימנתם לעדכן אותם) ועל סופי שבוע וחגים, ומסמן ימים מפוצלים מתוך PDF למילוי ידני.
- ממלא את הטבלה ומאמת אותה, ומדווח מה הושלם ומה נשאר לטיפול ידני.
- יש כפתור "עצור" באמצע המילוי, ואפשרות לעדכן גם ימים שכבר דווחו.

מה הוא לא עושה:
- לא לוחץ "שמירה". השמירה תמיד שלכם.
- לא נוגע בהתחברות, לא שומר סיסמאות.
- התוסף עצמו לא שולח מידע לשום מקום; הוא רק מפעיל את הכפתורים של חילנט בדף. הטבלה שהדבקתם וההגדרות נשמרות ב-localStorage של אתר חילנט בדפדפן שלכם (לתוסף אין שרת). הן נשארות שם גם אחרי הסרת התוסף; הכפתור "נקה" מוחק אותן.

עובד היום עם חילנט. תוסף עצמאי, לא קשור לחברת חילן ולא מטעמה. עובדים עם מערכת אחרת? פתחו Issue ב-GitHub עם שם המערכת וצילום מסך של עמוד הדיווח. הקוד פתוח: github.com/lshimon/fill-hours

English:

Fill Hours is a small helper for the Hilanet attendance page ("דיווח ועדכון"). Instead of typing every day again, paste the month's rows from the table you already keep (Google Sheet, Excel, CSV) or pick an attendance-report PDF, review the preview, and click Fill. The extension clears the current day selection on the calendar, selects the table's days and presses "ימים נבחרים" (the page may reload; the panel reopens and continues), fills report type, project (per the "project contains" setting in the panel), entry and exit, and verifies type, project, entry and exit on every row. You click Hilan's own Save.

What it does:
- Reads a pasted table: date, entry, exit, optionally office or home. A row with neither word uses the panel's "no mark" setting (default: work from home). Notes are copied only when "copy notes" is checked.
- Reads attendance-report PDFs from Malam Payroll (מלם שכר) and ok2go, inside the browser.
- Shows a preview with total hours before touching the grid. Skips already-reported days (unless you tick "update reported days"), weekends and holidays, and flags split days from a PDF for manual entry.
- Fills the grid and verifies it, reporting what is complete and what is left for manual handling.
- A Stop button during the fill, and an option to update already-reported days.

What it does not do:
- Never clicks Save. Saving is always yours.
- Never touches login or stores passwords.
- The extension itself sends nothing anywhere; it only operates Hilanet's own page controls. The pasted table and your settings are kept in the Hilanet site's localStorage in your browser (the extension has no server). They remain after uninstall; the "נקה" button clears them.

Works today with Hilanet. Independent tool, not affiliated with or endorsed by Hilan Ltd. Open source: github.com/lshimon/fill-hours

## Category

Productivity. It is a form-filling helper for a work system, the standard home for timesheet and attendance tools.

## Permissions justification (single purpose statement)

Single purpose: fill the attendance grid on the Hilanet "דיווח ועדכון" page from data the user provides.

Host access: content script on `https://*.net.hilan.co.il/Hilannetv2/Attendance/calendarpage.aspx*` only. Needed to add the panel to that page and write into its form fields. The script runs in the page's main world (`world: MAIN`) so it can wait on Hilanet's ASP.NET partial-page updates (`Sys.WebForms.PageRequestManager`) between grid changes; it calls no page APIs beyond DOM reads, clicks and input events. No other permissions are requested: no `storage` API (uses the site's `localStorage` and `sessionStorage`), no `tabs`, no `scripting`, no network access.

Data use: attendance data the user pastes or loads (which may include their name and employee id, as printed on the reports) is processed locally in the browser and never transmitted. Nothing is collected, sold or sent to any server. The extension makes no network requests.

## Assets (all in `store/`)

| Field in the dashboard | File | Size |
|---|---|---|
| Package | `../dist/fill-hours-0.3.0.zip` (rebuild with the zip command in the README after any code change) | |
| Screenshot 1 (value first: paste and preview) | `shots/shot1.png` | 1280x800 |
| Screenshot 2 (PDF input, total verified) | `shots/shot2.png` | 1280x800 |
| Screenshot 3 (filled and verified, save is yours) | `shots/shot3.png` | 1280x800 |
| Small promo tile | `promo-440x280.png` | 440x280 |
| Store icon | `../icons/icon128.png` | 128x128 |
| Privacy policy URL | https://lshimon.github.io/fill-hours/privacy | |
| Homepage URL | https://github.com/lshimon/fill-hours | |
| Support URL | https://github.com/lshimon/fill-hours/issues | |

Screenshots are rendered from `shots/mock.html` (the real `panel.css`, fictional data) with headless Chrome:

```
cd store/shots && for s in 1 2 3; do "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size=1280,800 --screenshot="shot$s.png" "file://$PWD/mock.html?scene=$s"; done
```

## Keywords

Deferred. The listing is unlisted, so store search does not apply. Revisit if the listing goes public.

## Character counts

| Field | Count | Limit |
|---|---|---|
| Name | 10 | 45 |
| Short description (he) | 93 | 132 |
| Short description (en) | 117 | 132 |
