# Chrome Web Store listing: Fill Hours

Source of truth: `manifest.json` 0.3.0 and `README.md`. Nothing below claims more than they show.
Visibility for the first release: **unlisted** (install by link only, not in store search).

## Name (10 chars)

Fill Hours

## Short description

Hebrew (primary locale, 93 chars):

מילוי שעות בחילנט מכל טבלה או מקובץ PDF של דוח נוכחות. מדביקים, בודקים, ולוחצים שמירה בעצמכם.

English (117 chars):

Fill your Hilanet attendance from any table or an attendance-report PDF. Paste, review the preview, save it yourself.

## Detailed description

Hebrew:

מילוי שעות הוא תוסף קטן לעמוד "דיווח ועדכון" בחילנט. במקום להקליד כל יום מחדש, מדביקים את שורות החודש מהטבלה שאתם כבר מנהלים (גיליון גוגל, אקסל, CSV) או בוחרים קובץ PDF של דוח נוכחות, בודקים את התצוגה המקדימה, ולוחצים "מלא". התוסף בוחר את הימים בלוח, ממלא סוג דיווח, פרויקט, כניסה ויציאה, ומאמת שכל שורה נכתבה נכון. את "שמירה" בחילן לוחצים אתם.

מה הוא עושה:
- קורא טבלה מודבקת: תאריך, כניסה, יציאה, ובאופן אופציונלי משרד או בית והערה.
- קורא קובץ PDF של דוח נוכחות של מל"מ שכר או של ok2go, בתוך הדפדפן.
- מציג תצוגה מקדימה עם סה"כ שעות לפני שנוגע בטבלה, ומסמן ימים שכבר דווחו, סופי שבוע, וימים מפוצלים.
- ממלא את הטבלה ומאמת אותה, ומדווח מה הושלם ומה נשאר לטיפול ידני.
- כפתור עצירה באמצע, ואפשרות לעדכן ימים שכבר דווחו.

מה הוא לא עושה:
- לא לוחץ "שמירה". השמירה תמיד שלכם.
- לא נוגע בהתחברות, לא שומר סיסמאות.
- לא שולח מידע לשום מקום. הטבלה שהדבקתם וההגדרות נשמרות בדפדפן שלכם בלבד.

עובד היום עם חילנט. עובדים עם מערכת אחרת? פתחו Issue ב-GitHub עם שם המערכת וצילום מסך של עמוד הדיווח. הקוד פתוח: github.com/lshimon/fill-hours

English:

Fill Hours is a small helper for the Hilanet attendance page ("דיווח ועדכון"). Instead of typing every day again, paste the month's rows from the table you already keep (Google Sheet, Excel, CSV) or pick an attendance-report PDF, review the preview, and click Fill. The extension selects the days on the calendar, fills report type, project, entry and exit, and verifies every row. You click Hilan's own Save.

What it does:
- Reads a pasted table: date, entry, exit, optionally office or home and a note.
- Reads attendance-report PDFs from Malam Payroll and ok2go, inside the browser.
- Shows a preview with total hours before touching the grid, flagging already-reported days, weekends and split days.
- Fills the grid and verifies it, reporting what is complete and what is left for manual handling.
- Stop button mid-run, and an option to update already-reported days.

What it does not do:
- Never clicks Save. Saving is always yours.
- Never touches login or stores passwords.
- Sends nothing anywhere. The pasted table and your settings stay in your browser.

Works today with Hilanet. Open source: github.com/lshimon/fill-hours

## Category

Productivity. It is a form-filling helper for a work system, the standard home for timesheet and attendance tools.

## Permissions justification (single purpose statement)

Single purpose: fill the attendance grid on the Hilanet "דיווח ועדכון" page from data the user provides.

Host access: content script on `https://*.net.hilan.co.il/Hilannetv2/Attendance/calendarpage.aspx*` only. Needed to add the panel to that page and write into its form fields. No other permissions are requested: no `storage` API (uses page-local `localStorage`), no `tabs`, no `scripting`, no network access.

Data use: no personal or sensitive data is collected, transmitted or sold. The extension does not contact any server.

## Keywords

Deferred. The listing is unlisted, so store search does not apply. Revisit if the listing goes public.

## Character counts

| Field | Count | Limit |
|---|---|---|
| Name | 10 | 45 |
| Short description (he) | 93 | 132 |
| Short description (en) | 117 | 132 |
