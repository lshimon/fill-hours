/* The whole directory lives here. Adding a company, a system or a tool is a one-line edit.
 * Aliases: every spelling people type. Matching ignores case, quotes, geresh, dots, dashes,
 * spaces and Hebrew final letters, and forgives one typo. */
window.HOURS_DATA = {
  // Contact details. Empty = the button shows as "coming soon".
  contacts: [
    { name: 'שמעון', whatsapp: '', teams: '' },   // whatsapp: 9725XXXXXXXX, teams: work email
    { name: 'רבקה', whatsapp: '', teams: '' },
  ],

  // Tools that already work. key = payroll system key below.
  tools: {
    hilan: {
      name: 'Fill Hours (מילוי שעות)', owner: 'שמעון',
      desc: 'תוסף לכרום שממלא את השעות בחילנט מטבלה שמדביקים או מקובץ PDF. אתם רק צריכים ללחוץ על \'שמירה\' בסוף.',
      sources: ['sheet', 'malam', 'ok2go'],
      steps: [
        'מורידים ומתקינים בכרום. עד שיאושר לחנות, מתקינים דרך \'מצב מפתחים\' (ההוראות בקישור).',
        'נכנסים לחילנט, לעמוד דיווח ועדכון, ופותחים את החודש.',
        'לוחצים על הכפתור \'מילוי שעות\', מדביקים את הטבלה או בוחרים קובץ PDF, ולוחצים \'בדוק\'.',
        'בודקים את התצוגה המקדימה, לוחצים \'מלא\' ואז \'שמירה\' בחילנט.',
      ],
      links: [{ label: 'הורדה והוראות התקנה', url: 'https://github.com/lshimon/fill-hours' }],
    },
    synerion: {
      name: 'synerion_attendance', owner: 'רבקה',
      desc: 'תוכנה קטנה למחשב עם Windows שקוראת את קובץ ה-PDF החתום של דוח השעות ממל"מ וממלאת את השעות בסינריון.',
      sources: ['malam'],
      sourceNote: 'הכלי הזה קורא כרגע רק את דוח ה-PDF של מל"מ. השעות שלכם מגיעות ממקום אחר? כתבו לנו.',
      steps: [
        'מורידים את קובץ ה-ZIP העדכני מעמוד ההורדות ופותחים אותו לתיקייה.',
        'מפעילים בלחיצה כפולה על הקובץ \'התחל כאן\', ונפתח מסך בדפדפן.',
        'בוחרים את כתובת הסינריון של החברה ואת קובץ ה-PDF, ולוחצים \'דיווח שעות\'.',
        'מתחברים לסינריון בחלון שנפתח, מחכים לסיום ובודקים את השעות.',
      ],
      links: [{ label: 'עמוד ההורדות', url: 'https://github.com/RivkaAltshuler/synerion_attendance/releases' }],
    },
    tlushim: {
      name: 'תלושים', owner: 'רחל גרינצייג', pending: true,
      desc: 'למערכת \'תלושים\' יש פתרון שעובד אצל רחל. אנחנו מסדרים אותו כדי שיהיה זמין לכולם, ובינתיים אתם יכולים לכתוב לנו ונחבר אתכם.',
      sources: null, steps: [], links: [],
    },
  },

  // Contractor-side payroll and attendance systems.
  payroll: [
    { key: 'hilan', he: 'חילן / חילנט', en: 'Hilan / Hilanet', aliases: ['חילן', 'חילנט', 'hilan', 'hilanet', 'hilannet', 'net.hilan'] },
    { key: 'synerion', he: 'סינריון', en: 'Synerion', aliases: ['סינריון', 'סנריון', 'synerion', 'synerioncloud', 'sinerion'] },
    { key: 'tlushim', he: 'תלושים', en: 'Tlushim', aliases: ['תלושים', 'tlushim', 'tlooshim'] },
    { key: 'malampayroll', he: 'מלם שכר / TRM', en: 'Malam Payroll / TRM', aliases: ['מלם שכר', 'מלם תים', 'malam payroll', 'trm', 'web clock'] },
    { key: 'michpal', he: 'מיכפל', en: 'Michpal', aliases: ['מיכפל', 'michpal'] },
    { key: 'meckano', he: 'מקאנו', en: 'Meckano', aliases: ['מקאנו', 'meckano', 'mekano'] },
    { key: 'attenix', he: 'אטניקס (עובדים.נט)', en: 'AttenIX-TS', aliases: ['אטניקס', 'attenix', 'ovdimnet', 'עובדים נט', 'עובדיםנט'] },
    { key: 'timewatch', he: 'טיים-ווטש', en: 'Timewatch', aliases: ['טיים ווטש', 'טיימווטש', 'timewatch'] },
    { key: 'successfactors', he: 'SAP SuccessFactors', en: 'SAP SuccessFactors', aliases: ['successfactors', 'sap', 'סאפ'] },
  ],

  // Contractors. payroll = known system key (from employees or a verified source), '' = unknown.
  contractors: [
    { he: 'מטריקס', en: 'Matrix', aliases: ['מטריקס', 'matrix', 'matrix it', 'מטריקס אי טי', 'matrix dna', 'מטריקס גלובל'], payroll: 'hilan' },
    { he: 'פרולוג\'יק', en: 'Prologic', aliases: ['פרולוגיק', 'prologic', 'פרולוג'], payroll: 'synerion' },
    { he: 'קומבלק', en: 'Comblack', aliases: ['קומבלק', 'comblack', 'combalk'], payroll: 'synerion' },
    { he: 'סיסנת', en: 'Sysnet', aliases: ['סיסנת', 'sysnet', 'סיסנט'], payroll: 'synerion' },
    { he: 'וואן', en: 'One', aliases: ['וואן', 'one', 'one1', 'one technologies', 'וואן טכנולוגיות'], payroll: 'synerion' },
    { he: 'טלדור', en: 'Taldor', aliases: ['טלדור', 'taldor'], payroll: 'attenix' },
    { he: 'מלם תים', en: 'Malam Team', aliases: ['מלם תים', 'מלם טים', 'malam team', 'malamteam'], payroll: '' },
    { he: 'נס', en: 'Ness', aliases: ['נס', 'ness', 'נס טכנולוגיות'], payroll: '' },
    { he: 'בינת', en: 'Bynet', aliases: ['בינת', 'bynet'], payroll: '' },
    { he: 'אמן', en: 'Aman', aliases: ['אמן', 'aman', 'אמן גרופ'], payroll: '' },
    { he: 'אלעד מערכות', en: 'Elad Systems', aliases: ['אלעד', 'elad', 'elad systems'], payroll: '' },
    { he: 'לוג-און', en: 'Log-On', aliases: ['לוג און', 'logon', 'log-on'], payroll: '' },
    { he: 'מרטנס', en: 'Mertens', aliases: ['מרטנס', 'mertens'], payroll: '' },
  ],

  // Where the hours come from.
  sources: [
    { key: 'sheet', label: 'גיליון או טבלה שאני מנהל/ת' },
    { key: 'malam', label: 'דוח PDF של מל"מ' },
    { key: 'ok2go', label: 'דוח PDF של ok2go' },
    { key: 'other', label: 'משהו אחר' },
  ],

  captureDownload: 'downloads/page-structure-capture.zip',
};
