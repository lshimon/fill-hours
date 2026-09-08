# ROWS: the shared day-row contract

One row per worked day. Any source (Google Sheet, Excel, a Malam PDF, an ok2go PDF, a CSV
exported by another tool) is turned into these rows first. Any target (Hilanet, Synerion)
reads only these rows. Sources and targets never need to know about each other.

## Columns

| # | Column | Format | Required | Notes |
|---|--------|--------|----------|-------|
| 1 | date   | `DD/MM/YYYY` | yes | `DD/MM` is accepted when the year is obvious from context |
| 2 | entry  | `HH:MM` 24h | yes | first entry of the day |
| 3 | exit   | `HH:MM` 24h | yes | last exit of the day. Must be after entry |
| 4 | type   | text | no | `משרד` = office, `בית` = home. Empty = the tool's default. Absence types (חופשה, מחלה) are out of scope for v1 and stay manual |
| 5 | note   | text | no | free text, may contain newlines when quoted |

Extra columns between them (day name, duration, anything else) are allowed and ignored.
A header row is allowed and skipped. Separator is tab or comma.

## Examples

Minimal, comma separated:

```
03/08/2026,08:00,17:00,משרד
04/08/2026,10:00,18:10,בית
05/08/2026,09:00,17:30
```

As copied from a Google Sheet (tab separated, extra columns present):

```
תאריך	יום	כניסה	יציאה	סך שעות	הערות	משרד/בית
03/08/2026	שני	08:00	17:00	9:00:00		משרד
04/08/2026	שלישי	10:00	18:10	8:10:00
```

## Rules every source must follow

- One row per day. A day with several work segments is either collapsed to first entry and
  last exit by the source (only if the source guarantees the total is right), or emitted as
  a row flagged in `note` with the word `מפוצל` so the target leaves it for a human.
- Weekends and days without work are simply absent. The target skips days it does not receive.
- Times are local, no seconds, no AM/PM.
- Nothing else is inferred. If the source does not know the type, it leaves it empty.

## Rules every target must follow

- Show the rows to the user before writing anything.
- Never press the system's save button. The user does.
- Report per row what was written and what was left, with the reason.

Reference implementation of the parser: `parse.js` in this repo (JavaScript, no dependencies).
