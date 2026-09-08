# Fill Hours: Privacy Policy

Last updated: 2026-09-08

Fill Hours is a Chrome extension that fills the attendance grid on the Hilanet "דיווח ועדכון" page
from data you provide (a pasted table or an attendance-report PDF you select).

## What the extension accesses

- It runs only on pages matching `https://*.net.hilan.co.il/Hilannetv2/Attendance/calendarpage.aspx*`.
  It does not run anywhere else.
- On that page it reads the calendar and the attendance grid in order to fill them, and writes the
  values you asked for into the form fields. It never presses the page's Save button.
- It reads the text you paste into its panel and any PDF file you choose. The PDF is parsed inside
  your browser with a bundled copy of pdf.js.

## What is stored, and where

- The last pasted table, the PDF summary line, and your panel settings (project name, office and
  home words, default type, checkboxes) are stored in your browser's local storage for the Hilanet
  site, on your computer only. Chrome may sync nothing of this; the extension does not use the
  Chrome storage API.
- A short "fill in progress" marker is kept in session storage for up to two minutes so a fill can
  continue after Hilanet reloads the page.
- Nothing is stored on any server.

## What is sent

Nothing. The extension makes no network requests. It has no server, no analytics, no telemetry,
no crash reporting. Your hours, your name, your login and your session are never transmitted by it.

## Login and credentials

The extension does not touch the login page and does not read, store or send usernames, passwords
or session tokens. You log in to Hilanet yourself, as usual.

## Permissions

The extension requests no Chrome permissions beyond running its content script on the Hilanet
attendance page listed above.

## Removing your data

Uninstalling the extension removes it. To clear the stored table and settings without uninstalling,
click "נקה" in the panel, or clear site data for your Hilanet site in Chrome.

## Open source

The full source code is public at https://github.com/lshimon/fill-hours so anyone can verify
this policy against what the code does.

## Contact

Open an issue at https://github.com/lshimon/fill-hours/issues
