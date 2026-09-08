# Fill Hours (מילוי שעות)

## מילוי שעות

**עובד היום עם חילנט.** מערכות נוספות יתווספו לפי ביקוש.

זהו תוסף כרום שממלא את דף השעות שלכם (בחילנט: עמוד 'דיווח ועדכון') ישירות מטבלה שאתם מנהלים בצד. אפשר להעתיק ולהדביק מגיליון גוגל, מאקסל או מקובץ CSV, או לבחור קובץ PDF של דוח נוכחות.

**קבצי PDF שהתוסף מזהה:** דוח נוכחות חודשי של מלם שכר, ודו"ח נוכחות מפורט של ok2go. כל קובץ אחר עם תאריך ושתי שעות בשורה נקרא בזהירות ומסומן "פורמט לא מוכר", ואז בודקים כל שורה לפני המילוי. הקובץ נקרא בתוך הדפדפן ולא נשלח לשום מקום. יום עם כמה קטעי עבודה מסומן "מפוצל" ונשאר למילוי ידני, כדי לא לדווח יותר ממה שעבדתם.

**פרטיות:** הכל רץ מקומית בתוך הדפדפן שלכם. התוסף שומר רק את הטבלה האחרונה שהדבקתם ואת ההגדרות שלכם, וגם זה רק על המחשב שלכם. הוא לא שולח מידע לשום מקום, לא נוגע בפרטי ההתחברות שלכם, ולעולם לא לוחץ על כפתור השמירה בחילן. את השמירה הסופית אתם מבצעים בעצמכם, אחרי שווידאתם שהכל תקין.

### איך משתמשים?
1. בגיליון שלכם, סמנו את כל שורות החודש הרצוי (כולל עמודת התאריך) והעתיקו (Ctrl+C).
2. היכנסו לחילנט ופתחו את החודש שאתם רוצים למלא בעמוד 'דיווח ועדכון'.
3. לחצו על הכפתור החדש 'מילוי שעות' שיופיע בפינה השמאלית התחתונה. בחלון שייפתח, הדביקו את הטבלה ולחצו 'בדוק'.
4. בדקו את התצוגה המקדימה וודאו שהשעות נקראו נכון. אם כן, לחצו 'מלא'.
5. ודאו שהטבלה בחילן התמלאה כמו שצריך, ואז לחצו על כפתור ה'שמירה' הרגיל של חילן.

### התקנה (עד שהתוסף יעלה לחנות הרשמית)
1. הורידו את קוד המקור: לחצו על כפתור ה-Code הירוק למעלה, בחרו Download ZIP, וחלצו את הקבצים לתיקייה במחשב.
2. בדפדפן כרום, היכנסו לכתובת `chrome://extensions` והדליקו את המתג של 'מצב מפתח' (Developer mode) בפינה העליונה.
3. לחצו על הכפתור 'טען תוסף לא ארוז' (Load unpacked) ובחרו את התיקייה שחילצתם בסעיף 1.
4. רעננו את עמוד חילן. כפתור 'מילוי שעות' יופיע.

התוסף עובד היום עם מערכת חילנט. עובדים עם מערכת אחרת? פתחו Issue כאן עם שם המערכת וצרפו צילום מסך של עמוד דיווח השעות.

---

## English

Chrome extension that fills your attendance hours from any table you keep on the side
(a Google Sheet, Excel, a CSV from another tool). Paste, check the preview, fill, and click save yourself.

Works today with Hilanet (חילנט), on the "דיווח ועדכון" page. More systems can be added; open an issue
with the system's name and a screenshot of its reporting page.

**Privacy:** everything runs inside your browser. The extension stores only the pasted text and your
settings, locally. It sends nothing anywhere, never touches login, and never presses the system's save button.

The day-row format shared with other tools (sources and targets) is in [ROWS.md](ROWS.md).

## Use

1. In your hours sheet, select the month's rows including the date column and copy (Cmd+C).
2. Log in to Hilan, open the month on `Hilannetv2/Attendance/calendarpage.aspx`.
3. Click the "מילוי שעות" button (bottom left), paste, click "בדוק", review the preview, click "מלא".
4. The extension selects the days, presses "ימים נבחרים", and writes type, project, entry and exit into every row.
5. Check the grid, click "שמירה".

## Input format

Any table with, per row: a date (`dd/mm/yyyy`), an entry time (`HH:MM`), an exit time (`HH:MM`),
and optionally a cell containing the office word (default `משרד`) or the home word (default `בית`).
Rows with neither word get the "ללא סימון" default from the panel (עבודה מהבית unless changed) and are marked
"(ברירת מחדל)" in the preview. Durations like `9:05:00` are ignored.
Header rows and rows without a date are skipped. Weekends, holidays and days already reported are skipped.

Example of a sheet that copies cleanly: תאריך, יום, כניסה, יציאה, סך שעות, הערות, משרד/בית.

### PDF input

Pick an attendance-report PDF in the panel. The file is read inside the browser with a bundled copy of
pdf.js (`vendor/`, Apache 2.0, Mozilla) and turned into the same rows as a paste, so the check, preview
and fill are unchanged. Formats are detected by structure, not by company name, so one parser covers
every customer of that vendor:

| Report | Detected by | Type column | Notes |
|---|---|---|---|
| מלם שכר "דוח נוכחות חודשי" | vendor footer or title | "עבודה מרחוק" = home, "." = office | free text kept as note, "אין דיווח נוכחות" days skipped, month total checked |
| ok2go "דו"ח נוכחות מפורט" | title or "מצטבר" column | none (panel default applies) | repeated dates (several segments) flagged "מפוצל" and left for manual fill; total checked by segments |
| anything else | a date plus two HH:MM per line | none | marked "פורמט לא מוכר", review every row |

To add a vendor: drop a sample under `test/fixtures/` (gitignored), run `node test/pdf.test.js`, and
add a branch in `pdfsource.js` keyed on a structural fingerprint.

## Settings (in the panel, saved in the browser)

- **פרויקט מכיל**: substring of the project name to pick in the "לקוח" dropdown. Empty = leave untouched.
- **הזמנה מכיל**: substring for the "הזמנה" dropdown that opens after the project. Empty = pick it automatically
  when it is the only option; if there are several, the row is left for you and the status says so. "משימה" behaves the same.
- The panel minimizes with the "−" button; the bottom-left button reopens it.
- **מילת משרד** / **מילת בית**: the words that mark an office day or a home day.
- **ללא סימון**: what a row with neither word becomes (נוכחות or עבודה מהבית).
- **להעתיק הערות**: also copy the notes column into "הערות".

## Install (unpacked)

1. `chrome://extensions`, enable Developer mode.
2. "Load unpacked", pick this folder.
3. Reload the Hilan page.

## Files

- `parse.js`: pasted text to rows. Pure, no DOM, also loads in Node for tests.
- `content.js`: panel UI, calendar checks, day selection, grid fill.
- `panel.css`, `manifest.json`, `icons/`.
- `test/parse.test.js`: `node test/parse.test.js`.

## Verified on

matrix.net.hilan.co.il, September 2026. Grid selectors: `ManualEntry_EmployeeReports_row_N_0`,
`ManualExit_...`, `Symbol.SymbolId_...`, `Project.ProjectStep1_...`, date cell `cellOf_ReportDate_row_N_`,
day cells `td[days]` (days since 2000-01-01), select button `#ctl00_mp_RefreshSelectedDays`.
Report type codes on this tenant: 0 נוכחות, 100 עבודה מהבית. Other tenants use other codes: check the dropdown.
