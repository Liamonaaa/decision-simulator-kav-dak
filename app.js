(() => {
  "use strict";

  const STORAGE_KEYS = {
    run: "קו_דק_run_v1",
    meta: "קו_דק_meta_v1"
  };

  const PHASES = {
    HOME: "HOME",
    RUNNING: "RUNNING",
    RESULT: "RESULT",
    ENDED: "ENDED"
  };

  const MAX_TURNS = 16;

  const INITIAL_STATS = {
    money: 5000,
    cashflow: 45,
    portfolio: 35,
    energy: 70,
    stress: 25,
    exposure: 15,
    credibility: 55,
    closeness: 15
  };

  const STAT_ORDER = ["cashflow", "portfolio", "energy", "stress", "exposure", "credibility", "closeness"];
  const STAT_LABELS = {
    money: "כסף",
    cashflow: "תזרים",
    portfolio: "תיק השקעות",
    energy: "אנרגיה",
    stress: "לחץ",
    exposure: "חשיפה",
    credibility: "אמינות",
    closeness: "קרבה"
  };

  const FLAG_KEYS = [
    "overdue_debt",
    "family_emergency",
    "family_secret",
    "borrowed_from_family",
    "promised_family_support",
    "investor_interest",
    "signed_term_sheet",
    "found_red_flags",
    "partner_pressure",
    "leaked_screenshot",
    "late_night_meeting",
    "crossed_boundary",
    "jealousy_triggered",
    "hidden_document",
    "legal_risk",
    "mentor_warning",
    "family_emergency_resolved",
    "rumor_active"
  ];

  const WARNING_RULES = [
    { key: "money_minus", check: (s) => s.money < 0, text: "אזהרה: כסף במינוס", level: "alert" },
    { key: "cashflow_critical", check: (s) => s.cashflow < 25, text: "אזהרה: תזרים קריטי", level: "alert" },
    { key: "stress_extreme", check: (s) => s.stress > 85, text: "לחץ חריג", level: "alert" },
    { key: "exposure_high", check: (s) => s.exposure > 75, text: "חשיפה גבוהה", level: "alert" },
    { key: "credibility_low", check: (s) => s.credibility < 25, text: "אמינות נשחקת", level: "alert" },
    { key: "closeness_edge", check: (s) => s.closeness > 80, text: "הגבול נהיה דק", level: "alert" }
  ];

  const CLUES = [
    { id: "c01", text: "מסמך שלא אמור להיות כאן", severity: 3, category: "ביזנס" },
    { id: "c02", text: "המספר חסום — שוב", severity: 2, category: "קשר" },
    { id: "c03", text: "מישהו שמר צילום מסך", severity: 3, category: "חשיפה" },
    { id: "c04", text: "הוא ידע לפני שסיפרת", severity: 2, category: "משפחה" },
    { id: "c05", text: "הסכם בלי סעיף אחד", severity: 2, category: "ביזנס" },
    { id: "c06", text: "השקעה שנראית נקייה מדי", severity: 2, category: "השקעות" },
    { id: "c07", text: "הוא לא בא לבד", severity: 3, category: "קשר" },
    { id: "c08", text: "שם של עורך דין", severity: 2, category: "חשיפה" },
    { id: "c09", text: "חשבון זמני בחו\"ל", severity: 3, category: "השקעות" },
    { id: "c10", text: "חתימה שלא תואמת", severity: 3, category: "ביזנס" },
    { id: "c11", text: "העברה בשעה 03:14", severity: 2, category: "חשיפה" },
    { id: "c12", text: "מילה שנמחקה מהחוזה", severity: 2, category: "ביזנס" },
    { id: "c13", text: "היא שאלה על הילדים שלך", severity: 2, category: "קשר" },
    { id: "c14", text: "אחיך מכיר את השם", severity: 2, category: "משפחה" },
    { id: "c15", text: "הבטחה מוקלטת", severity: 3, category: "חשיפה" },
    { id: "c16", text: "הדוח הגיע בלי עמוד אחרון", severity: 2, category: "השקעות" },
    { id: "c17", text: "קבלה כפולה לאותו ספק", severity: 2, category: "ביזנס" },
    { id: "c18", text: "מפתח גיבוי אצל מישהו אחר", severity: 2, category: "חשיפה" },
    { id: "c19", text: "מונית חיכתה כבר קודם", severity: 1, category: "קשר" },
    { id: "c20", text: "מספר תיק בבית משפט", severity: 3, category: "חשיפה" },
    { id: "c21", text: "היא לחצה על השתקה", severity: 2, category: "קשר" },
    { id: "c22", text: "הכסף חזר ממקור לא צפוי", severity: 1, category: "השקעות" },
    { id: "c23", text: "פתק בתוך התיק המשפחתי", severity: 3, category: "משפחה" },
    { id: "c24", text: "הלו\"ז שלה לא תאם", severity: 2, category: "קשר" }
  ];

  const ENDINGS = [
    { id: "cold_win", title: "ניצחון קר", summary: "הרווחת חזק, שמרת שליטה, והשארת לבבות מאחור." },
    { id: "collapse", title: "קריסה", summary: "התזרים נשבר והמינוס סגר על כל אפשרות." },
    { id: "exposed", title: "נחשפת", summary: "הצילומים והלחישות הפכו לכותרת ברורה מדי." },
    { id: "red_line", title: "קו אדום", summary: "לחצת עוד צעד אחד, והמערכת הפסיקה לסלוח." },
    { id: "last_minute_save", title: "הצלה ברגע האחרון", summary: "לא ניצחון מבריק, אבל נשארת עומד." },
    { id: "credibility_hold", title: "אמינות שנשמרה", summary: "ויתרת על קיצורים ושמרת את השם שלך נקי." },
    { id: "burnout", title: "עייפות מוחלטת", summary: "הלחץ אכל אנרגיה עד שלא נשאר מה לנהל." },
    { id: "dirty_deal", title: "עסקה מפוקפקת", summary: "החתימה נסגרה, אבל הריח לא ירד מהחדר." },
    { id: "boxed_in", title: "סגרו עליך", summary: "משפטית, תדמיתית ואישית, כל הדלתות הצטמצמו." },
    { id: "silent_betrayal", title: "בגידה שקטה", summary: "אף אחד לא צעק, אבל הקו נשבר מבפנים." },
    { id: "dangerous_closeness", title: "התקרבות מסוכנת", summary: "המשיכה הפכה למנוף, והמנוף הפך למלכודת." },
    { id: "family_first", title: "משפחה מעל הכול", summary: "שמעת את הבית, גם כשהמספרים התנגדו." },
    { id: "quiet_deal", title: "עסקה שקטה", summary: "סגרת נכון, בלי רעש ובלי שריפה מיותרת." },
    { id: "we_both_knew", title: "שניכם ידעתם", summary: "אף מילה לא נאמרה עד הסוף, ושניכם הבנתם הכול." }
  ];

  const RANDOM_EVENTS = [
    { id: "e01", text: "הבנק עצר העברה לשעתיים.", effects: { cashflow: -3, stress: 3 } },
    { id: "e02", text: "מספר חסוי שלח: \"נדבר לבד?\"", effects: { closeness: 3, exposure: 2, stress: 2 }, clueId: "c02", clueChance: 0.35 },
    { id: "e03", text: "ספק שלח תיקון מחיר קטן, אבל לא בזמן.", effects: { money: -450, cashflow: -2, stress: 2 }, clueId: "c17", clueChance: 0.2 },
    { id: "e04", text: "הודעה קולית מהבית: \"אנחנו מחכים לך\".", effects: { stress: 4, credibility: 1 }, flags: { set: ["family_emergency"] } },
    { id: "e05", text: "צילום ישן הופיע בקבוצה הלא נכונה.", effects: { exposure: 5, stress: 3 }, clueId: "c03", clueChance: 0.25, flags: { set: ["leaked_screenshot"] } },
    { id: "e06", text: "השוק זז לטובתך לרגע קצר.", effects: { money: 600, portfolio: 2, cashflow: 1 } },
    { id: "e07", text: "מצלמת חניה קלטה מפגש שלא תכננת להסביר.", effects: { exposure: 4, stress: 2 }, clueId: "c19", clueChance: 0.45 },
    { id: "e08", text: "מנטור ותיק כתב: \"תבדוק את העמוד האחרון\".", effects: { credibility: 2, stress: 1 }, clueId: "c16", clueChance: 0.4, flags: { set: ["mentor_warning"] } },
    { id: "e09", text: "נכנסה העברה זעירה ממקור לא מוכר.", effects: { money: 320, exposure: 1 }, clueId: "c22", clueChance: 0.5 },
    { id: "e10", text: "שם של עורך דין עלה בשיחה צדדית.", effects: { stress: 2, exposure: 2 }, clueId: "c20", clueChance: 0.12, flags: { set: ["legal_risk"] } }
  ];

  const SCENARIOS = [
    {
      id: "s001",
      title: "5,000₪ על השולחן",
      text: ["זה מה שנשאר זמין.", "החלטה אחת קונה זמן.", "החלטה אחרת פותחת דלת שלא תוכל לסגור."],
      bullets: ["אין כרית ביטחון", "כל צעד נרשם"],
      choices: [
        {
          id: "s001_c1",
          label: "לשמור מזומן",
          immediateEffects: { cashflow: 4, exposure: -4, stress: 3, energy: -1 },
          delayed: [{ afterTurns: 2, effects: { stress: 6, cashflow: 2 }, revealText: "שמרת אוויר, אבל לא נרדמת." }],
          flags: { set: ["overdue_debt"] },
          resultText: "הכסף נשאר קרוב. הזמן נשאר קצר.",
          next: "s002"
        },
        {
          id: "s001_c2",
          label: "השקעה זהירה",
          immediateEffects: { money: -1200, portfolio: 7, stress: 4, cashflow: 1 },
          delayed: [{ afterTurns: 2, effects: { money: 1800, cashflow: 5, portfolio: 3, stress: -2 }, revealText: "המהלך החזיר קצת אוויר." }],
          clues: ["c06"],
          resultText: "נכנסת בזהירות. העיניים כבר על התשואה.",
          next: "s003"
        },
        {
          id: "s001_c3",
          label: "מהלך מהיר",
          immediateEffects: { money: 2400, portfolio: 10, exposure: 9, stress: 8, cashflow: 3 },
          delayed: [{ afterTurns: 2, effects: { cashflow: -7, exposure: 5, stress: 5 }, revealText: "המחיר של מהירות התחיל להופיע.", clues: ["c09"] }],
          flags: { set: ["legal_risk", "investor_interest"] },
          resultText: "נכנס הרבה כסף מהר מדי. גם אור זרקורים.",
          next: "s004"
        }
      ]
    },
    {
      id: "s002",
      title: "הספק חוסם אספקה",
      text: ["בלי מקדמה, הקו נעצר.", "הצוות מחכה לתשובה בתוך שעה."],
      bullets: ["הפסקה עכשיו פוגעת במכירות", "בבית כבר לוחצים"],
      choices: [
        {
          id: "s002_c1",
          label: "לשלם ממקור משפחתי",
          immediateEffects: { money: -1800, cashflow: 8, credibility: 2, stress: 4 },
          delayed: [{ afterTurns: 3, effects: { money: -900, stress: 4 }, revealText: "המשפחה מזכירה שהחוב עוד פתוח.", clues: ["c14"] }],
          flags: { set: ["borrowed_from_family", "promised_family_support"] },
          resultText: "העסק נשם. הבית קיבל משקל חדש.",
          next: "s005"
        },
        {
          id: "s002_c2",
          label: "לדחות תשלום ולחתוך הזמנות",
          immediateEffects: { cashflow: -5, energy: -3, stress: 6, exposure: 2 },
          flags: { set: ["overdue_debt"] },
          clues: ["c17"],
          resultText: "קנית יום. איבדת אמון אצל הספק.",
          next: "s006"
        },
        {
          id: "s002_c3",
          label: "לחפש ספק חלופי דרך קשר אישי",
          immediateEffects: { money: -500, cashflow: 3, exposure: 5, closeness: 4, stress: 3 },
          flags: { set: ["late_night_meeting"] },
          resultText: "נפתח ערוץ חדש. לא ברור מי שולט בו.",
          next: "s007"
        }
      ]
    },
    {
      id: "s003",
      title: "הודעה ממשקיעה ותיקה",
      text: ["היא כתבה: \"אפשר לקצר דרך?\"", "הטון מקצועי מדי, ואישי מדי."],
      bullets: ["הזדמנות מהירה", "מסלול דק בין עניין ללחץ"],
      choices: [
        {
          id: "s003_c1",
          label: "לקבוע פגישה רשמית בבוקר",
          immediateEffects: { credibility: 6, stress: 2, energy: -2 },
          flags: { set: ["investor_interest"] },
          resultText: "שמרת מסגרת. המשחק עדיין פתוח.",
          next: "s006"
        },
        {
          id: "s003_c2",
          label: "לענות בלילה ולזרז",
          immediateEffects: { closeness: 8, exposure: 6, stress: 3 },
          flags: { set: ["late_night_meeting"] },
          clues: ["c02"],
          resultText: "התגובה הייתה מהירה. המרחק הצטמצם.",
          next: "s007"
        },
        {
          id: "s003_c3",
          label: "לשלוח תחזית אגרסיבית",
          immediateEffects: { money: 700, exposure: 4, credibility: -3, portfolio: 4, stress: 4 },
          delayed: [{ afterTurns: 2, effects: { cashflow: -4, stress: 3 }, revealText: "ביקשו הוכחה למספרים שהבטחת." }],
          flags: { set: ["partner_pressure"] },
          resultText: "יצרת רושם חזק. גם ציפייה מסוכנת.",
          next: "s008"
        }
      ]
    },
    {
      id: "s004",
      title: "דסק הון מהיר",
      text: ["ההצעה מונחת עד חצות.", "ריבית חדה, כסף מיידי."],
      bullets: ["מהיר זה יקר", "הרשומות נשארות"],
      choices: [
        {
          id: "s004_c1",
          label: "לחתום על הלוואת גישור",
          immediateEffects: { money: 3500, cashflow: 7, stress: 6, exposure: 6 },
          delayed: [{ afterTurns: 3, effects: { money: -4200, cashflow: -12, stress: 8 }, revealText: "הריבית התחילה לנשוך.", clues: ["c20"] }],
          flags: { set: ["legal_risk", "overdue_debt"] },
          resultText: "פתרת את הלילה. הכנסת בוקר קשוח.",
          next: "s008"
        },
        {
          id: "s004_c2",
          label: "לבקש 24 שעות לבדיקה",
          immediateEffects: { credibility: 4, energy: -2, stress: 1 },
          resultText: "הרווחת זמן קצר לבדיקה עמוקה.",
          next: "s009"
        },
        {
          id: "s004_c3",
          label: "לקבוע פגישה פרטית במלון",
          immediateEffects: { closeness: 10, exposure: 8, stress: 4 },
          flags: { set: ["late_night_meeting"] },
          clues: ["c19"],
          resultText: "החדר היה שקט מדי בשביל עסקה רגילה.",
          next: "s007"
        }
      ]
    },
    {
      id: "s005",
      title: "מיון לילה",
      text: ["הבית מתקשר מהמסדרון.", "בדיוק עכשיו יש חלון למשקיע."],
      bullets: ["משפחה מול פגישה קריטית", "אין בחירה נקייה"],
      choices: [
        {
          id: "s005_c1",
          label: "להעביר כסף עכשיו ולבטל פגישה",
          immediateEffects: { money: -2300, energy: -6, stress: 8, cashflow: -4, credibility: 4 },
          delayed: [{ afterTurns: 2, effects: { credibility: 3, stress: -2 }, revealText: "בבית זכרו שנשארת." }],
          flags: { set: ["family_emergency", "promised_family_support"] },
          resultText: "כיבית אש בבית. פתחת חור בעסק.",
          next: "s010"
        },
        {
          id: "s005_c2",
          label: "לבקש דחייה בבית ולהופיע למשקיע",
          immediateEffects: { cashflow: 4, credibility: -6, stress: 10, exposure: 2 },
          flags: { set: ["family_emergency", "family_secret"] },
          clues: ["c04"],
          resultText: "שמעת את השתיקה בקו לפני שניתקת.",
          next: "s011"
        },
        {
          id: "s005_c3",
          label: "לגייס מקדמה מהספק לטובת הבית",
          immediateEffects: { money: 1400, cashflow: -3, stress: 7, exposure: 6 },
          flags: { set: ["family_emergency", "legal_risk"] },
          clues: ["c17"],
          resultText: "סגרת חור אחד ופתחת שאלה משפטית.",
          next: "s006"
        }
      ]
    },
    {
      id: "s006",
      title: "חוזה בלי סעיף",
      text: ["הטיוטה נקייה מדי.", "שורה אחת חסרה במקום הלא נכון."],
      bullets: ["חתימה מהירה תקנה מזומן", "בדיקה תעלה זמן"],
      choices: [
        {
          id: "s006_c1",
          label: "לעצור ולשלוח לעו\"ד",
          immediateEffects: { credibility: 7, stress: 2, money: -600 },
          flags: { set: ["mentor_warning"] },
          clues: ["c05", "c08"],
          resultText: "הקצב ירד. השליטה עלתה.",
          next: "s009"
        },
        {
          id: "s006_c2",
          label: "לחתום מהר כדי לא לפספס",
          immediateEffects: { money: 2200, cashflow: 6, exposure: 7, credibility: -5, stress: 6 },
          delayed: [{ afterTurns: 2, effects: { exposure: 6, stress: 4 }, revealText: "מישהו הראה את המילה שנמחקה.", clues: ["c12"] }],
          flags: { set: ["signed_term_sheet", "legal_risk"] },
          resultText: "סגרת מהר. האוויר בחדר השתנה.",
          next: "s013"
        },
        {
          id: "s006_c3",
          label: "לבקש הסבר אחד על אחד",
          immediateEffects: { closeness: 7, exposure: 5, credibility: 1, stress: 3 },
          flags: { set: ["late_night_meeting"] },
          resultText: "קיבלת תשובה. קיבלת גם מבט נוסף.",
          next: "s012"
        }
      ]
    },
    {
      id: "s007",
      title: "קפה אחרי חצות",
      text: ["השיחה עברה ממספרים לשתיקות.", "הכיסא שלה קרוב מדי."],
      bullets: ["משיכה כמנוף", "גבולות נבחנים"],
      choices: [
        {
          id: "s007_c1",
          label: "לשמור מרחק ולחזור לנתונים",
          immediateEffects: { credibility: 5, closeness: -2, stress: 1, exposure: -1 },
          flags: { set: ["late_night_meeting"] },
          resultText: "המתח נשאר. השליטה נשארה אצלך.",
          next: "s011"
        },
        {
          id: "s007_c2",
          label: "לאפשר קרבה כדי לקדם עסקה",
          immediateEffects: { closeness: 14, exposure: 9, stress: 4, credibility: -3 },
          flags: { set: ["crossed_boundary", "late_night_meeting"] },
          clues: ["c13"],
          resultText: "העסקה נפתחה. גם גבול נסדק.",
          next: "s012"
        },
        {
          id: "s007_c3",
          label: "לשתף סוד משפחתי כדי לרכך",
          immediateEffects: { closeness: 10, exposure: 7, stress: 5, credibility: -2 },
          flags: { set: ["family_secret"] },
          clues: ["c23"],
          resultText: "היא הקשיבה. אתה איבדת שכבה.",
          next: "s015"
        }
      ]
    },
    {
      id: "s008",
      title: "פער שכר בצוות",
      text: ["מחר יום תשלום.", "היתרה לא מכסה את כל השמות."],
      bullets: ["אמון פנימי", "תזרים מול מורל"],
      choices: [
        {
          id: "s008_c1",
          label: "למשוך מהשקעות ולשלם",
          immediateEffects: { money: 1000, portfolio: -6, cashflow: 5, stress: 3 },
          delayed: [{ afterTurns: 2, effects: { cashflow: -4, portfolio: -2 }, revealText: "התיק נחלש בדיוק כשצריך כרית." }],
          resultText: "הצוות נרגע. השוק פתח חוב חדש.",
          next: "s010"
        },
        {
          id: "s008_c2",
          label: "לדחות בונוסים ולדבר שקוף",
          immediateEffects: { cashflow: 2, credibility: 4, stress: 4, energy: -2 },
          resultText: "לא כולם אהבו, אבל שמעו אותך עד הסוף.",
          next: "s013"
        },
        {
          id: "s008_c3",
          label: "להציע אופציות במקום",
          immediateEffects: { cashflow: 6, credibility: -2, stress: 5, exposure: 3 },
          delayed: [{ afterTurns: 3, effects: { credibility: -3, stress: 2 }, revealText: "לא כולם קנו את ההבטחה." }],
          flags: { set: ["partner_pressure"] },
          resultText: "נשאר כסף בקופה. נשאר ספק בחדר.",
          next: "s014"
        }
      ]
    },
    {
      id: "s009",
      title: "חדר בדיקת נאותות",
      text: ["ארבע תיקיות. שעה אחת.", "מישהו קיווה שלא תגיע לעמוד האחרון."],
      bullets: ["סימנים קטנים", "החלטה על עומק"],
      choices: [
        {
          id: "s009_c1",
          label: "לחפור עד הסוף",
          immediateEffects: { energy: -5, stress: 5, credibility: 6 },
          flags: { set: ["found_red_flags", "hidden_document"] },
          clues: ["c01", "c16"],
          resultText: "מצאת משהו שלא היה אמור להיות שם.",
          next: { type: "conditional", rules: [{ if: { flagsAll: ["found_red_flags"] }, goto: "s019" }], default: "s013" }
        },
        {
          id: "s009_c2",
          label: "בדיקה חלקית ולהמשיך",
          immediateEffects: { money: 1500, portfolio: 4, exposure: 4, stress: 3 },
          delayed: [{ afterTurns: 3, effects: { cashflow: -8, exposure: 5 }, revealText: "פער שלא בדקת חזר אליך.", clues: ["c10"] }],
          resultText: "חסכת זמן. קנית אי ודאות.",
          next: "s013"
        },
        {
          id: "s009_c3",
          label: "לתת לה להוביל את הבדיקה",
          immediateEffects: { closeness: 8, exposure: 6, energy: 1, credibility: -1 },
          flags: { set: ["late_night_meeting"] },
          clues: ["c24"],
          resultText: "העבודה זרמה. השליטה זזה ממך.",
          next: "s012"
        }
      ]
    },
    {
      id: "s010",
      title: "בקשה מאחיך",
      text: ["הוא צריך כסף מיידי.", "מחר בבוקר יש לך קמפיין תשלום."],
      bullets: ["משפחה מול צמיחה", "זמן קצר להחליט"],
      choices: [
        {
          id: "s010_c1",
          label: "להלוות לו ולחתוך קמפיין",
          immediateEffects: { money: -1700, cashflow: -5, credibility: 3, stress: 6 },
          flags: { set: ["borrowed_from_family", "promised_family_support"] },
          resultText: "בחרת בית. העסק שילם את המחיר.",
          next: "s015"
        },
        {
          id: "s010_c2",
          label: "לסרב ולשמור תקציב לעסק",
          immediateEffects: { cashflow: 4, credibility: -4, stress: 5 },
          flags: { set: ["family_secret"] },
          resultText: "המספרים נשמרו. הקול שלו לא.",
          next: "s011"
        },
        {
          id: "s010_c3",
          label: "לצרף אותו לעבודה זמנית",
          immediateEffects: { money: -400, cashflow: 2, stress: 4, exposure: 3, credibility: -1 },
          delayed: [{ afterTurns: 2, effects: { energy: -3, stress: 3 }, revealText: "בית ועסק התחילו להתערבב." }],
          flags: { set: ["family_secret"] },
          resultText: "פתרת את הלילה. העלית סיכון חדש.",
          next: "s016"
        }
      ]
    },
    {
      id: "s011",
      title: "שמועה בחלל עבודה",
      text: ["השם שלך עלה בשולחן הלא נכון.", "מישהו מחבר נקודות."],
      bullets: ["תדמית נשחקת מהר", "תגובה לא מדויקת תדליק אש"],
      choices: [
        {
          id: "s011_c1",
          label: "להכחיש פומבית",
          immediateEffects: { exposure: -3, credibility: 3, stress: 3, energy: -2 },
          resultText: "הרעש ירד לרגע. המבטים נשארו.",
          next: "s016"
        },
        {
          id: "s011_c2",
          label: "לשתוק ולחכות",
          immediateEffects: { stress: 1, exposure: 6, credibility: -2 },
          delayed: [{ afterTurns: 2, effects: { exposure: 5 }, revealText: "השתיקה יצרה גרסה משלה.", clues: ["c15"] }],
          resultText: "לא נגעת. השמועה כן.",
          next: "s017"
        },
        {
          id: "s011_c3",
          label: "לברר מי הדליף",
          immediateEffects: { energy: -4, stress: 5 },
          flags: { set: ["rumor_active"] },
          clues: ["c18"],
          resultText: "גילית רשת קטנה של לחישות.",
          next: "s018"
        }
      ]
    },
    {
      id: "s012",
      title: "דלת סגורה במשרד",
      text: ["היא ביקשה שיחה בלי עדים.", "החדר קרוב מדי ושקט מדי."],
      bullets: ["גבול מקצועי", "כוח דרך קרבה"],
      choices: [
        {
          id: "s012_c1",
          label: "להשאיר דלת פתוחה",
          immediateEffects: { credibility: 5, closeness: -1, exposure: -2, stress: 1 },
          resultText: "סימנת גבול ברור. לא כולם אוהבים גבולות.",
          next: "s017"
        },
        {
          id: "s012_c2",
          label: "לנעול דלת ל\"שיחה פרטית\"",
          immediateEffects: { closeness: 15, exposure: 10, stress: 6, credibility: -4 },
          flags: { set: ["crossed_boundary"] },
          clues: ["c07"],
          resultText: "המרחק נעלם. גם השוליים.",
          next: "s020"
        },
        {
          id: "s012_c3",
          label: "לבקש ממנה להתרחק שבוע",
          immediateEffects: { closeness: -6, stress: 4, credibility: 2 },
          flags: { set: ["jealousy_triggered"] },
          resultText: "הקרבה נבלמה. המתח לא.",
          next: "s017"
        }
      ]
    },
    {
      id: "s013",
      title: "טיוטת תנאי השקעה",
      text: ["המספרים מפתים.", "האותיות הקטנות עוד יותר."],
      bullets: ["מהירות מול הגנה", "אמון מול פיתוי"],
      choices: [
        {
          id: "s013_c1",
          label: "לדרוש סעיפי הגנה",
          immediateEffects: { credibility: 6, stress: 3, money: -500 },
          flags: { set: ["investor_interest"] },
          resultText: "העסקה האטה. השליטה גדלה.",
          next: "s018"
        },
        {
          id: "s013_c2",
          label: "לחתום ולסגור היום",
          immediateEffects: { money: 3000, cashflow: 8, exposure: 5, credibility: -3 },
          delayed: [{ afterTurns: 3, effects: { cashflow: -6, stress: 4 }, revealText: "הסעיפים הפעילו לחץ תזרימי.", clues: ["c12"] }],
          flags: { set: ["signed_term_sheet"] },
          resultText: "החתימה נסגרה. השקט היה קצר.",
          next: "s019"
        },
        {
          id: "s013_c3",
          label: "לדחות ולתת זמן לבית",
          immediateEffects: { energy: 3, stress: -3, cashflow: -2, credibility: 1 },
          flags: { set: ["promised_family_support", "family_emergency_resolved"] },
          resultText: "ויתרת על קצב לטובת קשרים.",
          next: "s021"
        }
      ]
    },
    {
      id: "s014",
      title: "פיתוי מינוף",
      text: ["מכשיר חדש, תנאים נוצצים.", "הפסד קטן שם מוחק חודש."],
      bullets: ["מינוף מגדיל הכול", "גם טעות"],
      choices: [
        {
          id: "s014_c1",
          label: "מינוף מתון עם הגנות",
          immediateEffects: { money: 1800, portfolio: 6, stress: 4, exposure: 3 },
          delayed: [{ afterTurns: 2, effects: { cashflow: 4, portfolio: 2 }, revealText: "המינוף עבד זמנית לטובתך." }],
          resultText: "קיבלת דחיפה. עדיין בשליטה.",
          next: "s018"
        },
        {
          id: "s014_c2",
          label: "מינוף אגרסיבי על הכול",
          immediateEffects: { money: 5200, portfolio: 12, stress: 10, exposure: 8 },
          delayed: [{ afterTurns: 2, effects: { cashflow: -14, stress: 8, exposure: 6 }, revealText: "המרווח נסגר מולך.", clues: ["c09", "c22"] }],
          flags: { set: ["legal_risk"] },
          resultText: "הקפיצה מרשימה. הנחיתה פחות.",
          next: "s021"
        },
        {
          id: "s014_c3",
          label: "לוותר ולשמור נזילות",
          immediateEffects: { money: -500, portfolio: -2, cashflow: 6, stress: -2, credibility: 2 },
          resultText: "בחרת יציבות על פני סיפור גדול.",
          next: "s022"
        }
      ]
    },
    {
      id: "s015",
      title: "שיחה מהבית",
      text: ["\"איך אתה באמת?\"", "השאלה נשמעת פשוטה מדי."],
      bullets: ["הסתרה שוחקת", "כנות עולה מחיר"],
      choices: [
        {
          id: "s015_c1",
          label: "לספר אמת חלקית",
          immediateEffects: { stress: -2, credibility: 3, energy: 2 },
          flags: { set: ["family_secret"] },
          clues: ["c04"],
          resultText: "אמרת מספיק כדי לא לשקר לגמרי.",
          next: "s022"
        },
        {
          id: "s015_c2",
          label: "להבטיח תמיכה חודשית",
          immediateEffects: { money: -1200, cashflow: -4, stress: 5, credibility: 4 },
          delayed: [{ afterTurns: 3, effects: { money: -1200, stress: 4 }, revealText: "ההתחייבות חזרה שוב בסוף החודש." }],
          flags: { set: ["promised_family_support", "family_emergency"] },
          resultText: "קיבלת שקט קצר בבית.",
          next: "s016"
        },
        {
          id: "s015_c3",
          label: "לנתק ולחזור לעסק",
          immediateEffects: { energy: 1, stress: 7, credibility: -5, exposure: 2 },
          flags: { set: ["family_secret"] },
          resultText: "חזרת לעבודה. הלחץ נשאר איתך.",
          next: "s017"
        }
      ]
    },
    {
      id: "s016",
      title: "הודעה: \"יש צילום\"",
      text: ["קובץ קטן הגיע בלי שם שולח.", "מישהו מחכה שתיבהל."],
      bullets: ["שליטה בנרטיב", "זמן תגובה קצר"],
      choices: [
        {
          id: "s016_c1",
          label: "לפנות ישירות ולבקש מחיקה",
          immediateEffects: { exposure: -4, stress: 4, credibility: 1 },
          flags: { set: ["leaked_screenshot"] },
          clues: ["c03"],
          resultText: "השיחה הייתה קצרה. האיום נשאר באוויר.",
          next: { type: "conditional", rules: [{ if: { cluesAll: ["c03", "c15"] }, goto: "s021" }], default: "s017" }
        },
        {
          id: "s016_c2",
          label: "לאיים משפטית מיד",
          immediateEffects: { exposure: 2, stress: 6, credibility: -3 },
          flags: { set: ["legal_risk"] },
          clues: ["c08"],
          resultText: "שידרת כוח. גם סימנת יעד.",
          next: "s021"
        },
        {
          id: "s016_c3",
          label: "לשלם כדי לקבור את זה",
          immediateEffects: { money: -1800, exposure: -2, stress: 3, credibility: -4 },
          delayed: [{ afterTurns: 2, effects: { exposure: 8 }, revealText: "הצילום הופיע בכל זאת.", clues: ["c11"] }],
          flags: { set: ["legal_risk"] },
          resultText: "קנית שקט שנשבר מהר.",
          next: "s017"
        }
      ]
    },
    {
      id: "s017",
      title: "אולטימטום מהשותף",
      text: ["\"או שקיפות מלאה, או שאני בחוץ\".", "הוא רציני."],
      bullets: ["אמון פנימי קריטי", "עקיפה תעלה ביוקר"],
      choices: [
        {
          id: "s017_c1",
          label: "לפתוח ספרים ולשתף",
          immediateEffects: { credibility: 7, stress: 3, energy: -2 },
          flags: { unset: ["partner_pressure"] },
          resultText: "החדר התקרר. השותפות נותרה בחיים.",
          next: "s019"
        },
        {
          id: "s017_c2",
          label: "לעקוף אותו עם משקיע חיצוני",
          immediateEffects: { money: 1200, exposure: 5, credibility: -6, stress: 5 },
          flags: { set: ["partner_pressure", "investor_interest"] },
          resultText: "השגת כסף. איבדת שכבת אמון.",
          next: "s023"
        },
        {
          id: "s017_c3",
          label: "לרכך דרך מפגש טעון",
          immediateEffects: { closeness: 9, exposure: 7, stress: 4, credibility: -2 },
          flags: { set: ["crossed_boundary", "jealousy_triggered"] },
          resultText: "הוויכוח נמס. המחיר נדחה.",
          next: "s024"
        }
      ]
    },
    {
      id: "s018",
      title: "איזון תיק השקעות",
      text: ["שוק תנודתי. החלטה שקטה או הימור.", "כל תנועה תיגע בתזרים בעוד יומיים."],
      bullets: ["ניהול סיכון", "תוצאה מושהית"],
      choices: [
        {
          id: "s018_c1",
          label: "מסלול הגנתי",
          immediateEffects: { portfolio: 4, cashflow: 3, stress: -2, money: -600 },
          delayed: [{ afterTurns: 2, effects: { cashflow: 5, stress: -1 }, revealText: "ההגנה שחררה קצת תזרים." }],
          resultText: "מתון, אבל יציב.",
          next: "s023"
        },
        {
          id: "s018_c2",
          label: "כניסה חדה לסקטור חם",
          immediateEffects: { money: 2100, portfolio: 8, stress: 5, exposure: 4 },
          delayed: [{ afterTurns: 2, effects: { cashflow: -7, stress: 5 }, revealText: "הסקטור זז נגדך ביום הלא נכון.", clues: ["c06"] }],
          resultText: "עלית מהר. הרצפה רועדת.",
          next: "s025"
        },
        {
          id: "s018_c3",
          label: "להקפיא מסחר לשבוע",
          immediateEffects: { energy: 4, stress: -4, portfolio: -1, cashflow: 1 },
          resultText: "נשימה קצרה לפני סבב הבא.",
          next: "s021"
        }
      ]
    },
    {
      id: "s019",
      title: "נספח מוסתר",
      text: ["קובץ נוסף נקרא \"טיוטה סופית_2\".", "החתימות לא נראות אותו דבר."],
      bullets: ["להדליק אור", "או להחביא עוד"],
      choices: [
        {
          id: "s019_c1",
          label: "לחשוף לשותף מיד",
          immediateEffects: { credibility: 6, stress: 3, exposure: 2 },
          flags: { set: ["hidden_document"] },
          clues: ["c10", "c12"],
          resultText: "שיתפת מוקדם. נוצר קו הגנה.",
          next: "s021"
        },
        {
          id: "s019_c2",
          label: "להסתיר ולהתקדם",
          immediateEffects: { money: 2000, cashflow: 4, credibility: -7, stress: 5 },
          delayed: [{ afterTurns: 3, effects: { exposure: 7 }, revealText: "המסמך צף אצל מישהו אחר.", clues: ["c01"] }],
          flags: { set: ["hidden_document"] },
          resultText: "המספרים הסתדרו. העקבות נשארו.",
          next: "s024"
        },
        {
          id: "s019_c3",
          label: "להעביר רק אליה",
          immediateEffects: { closeness: 11, exposure: 8, credibility: -3, stress: 4 },
          flags: { set: ["hidden_document", "crossed_boundary"] },
          clues: ["c01", "c24"],
          resultText: "יצרת ברית פרטית. צמצמת מרחב תמרון.",
          next: "s026"
        }
      ]
    },
    {
      id: "s020",
      title: "הודעת קנאה ב-01:37",
      text: ["\"ראיתי אותך היום\".", "שלוש נקודות. בלי הסבר."],
      bullets: ["קנאה יכולה להדליק עסקה", "או לחשוף הכול"],
      choices: [
        {
          id: "s020_c1",
          label: "לענות ברוגע ולהרגיע",
          immediateEffects: { closeness: 4, stress: 2, exposure: 3 },
          flags: { set: ["jealousy_triggered"] },
          clues: ["c21"],
          resultText: "הטון ירד, אבל המעקב נשאר.",
          next: "s024"
        },
        {
          id: "s020_c2",
          label: "להשתמש בקנאה כדי לסגור התחייבות",
          immediateEffects: { money: 1500, closeness: 10, exposure: 9, credibility: -4, stress: 6 },
          flags: { set: ["jealousy_triggered", "crossed_boundary"] },
          resultText: "קיבלת הבטחה. נתת מפתח.",
          next: "s025"
        },
        {
          id: "s020_c3",
          label: "להתעלם",
          immediateEffects: { closeness: -5, stress: 5, exposure: 4, credibility: 1 },
          resultText: "השקט נראה כמו תשובה.",
          next: "s026"
        }
      ]
    },
    {
      id: "s021",
      title: "שיחת עו\"ד קצרה",
      text: ["שלוש דקות. שני סיכונים.", "העצה ברורה, לא זולה."],
      bullets: ["תגובה מוקדמת חוסכת כאב", "דחייה מסכנת חשיפה"],
      choices: [
        {
          id: "s021_c1",
          label: "לפתוח תיק הגנה עכשיו",
          immediateEffects: { money: -1300, cashflow: -2, credibility: 4, exposure: -5, stress: 2 },
          flags: { set: ["mentor_warning", "legal_risk"] },
          clues: ["c08", "c20"],
          resultText: "שילמת עכשיו כדי לא לשלם כפול.",
          next: "s023"
        },
        {
          id: "s021_c2",
          label: "לחכות ולחסוך כסף",
          immediateEffects: { cashflow: 2, exposure: 6, stress: 5, credibility: -2 },
          flags: { set: ["legal_risk"] },
          resultText: "הקופה נשמרה. ההגנה לא.",
          next: "s026"
        },
        {
          id: "s021_c3",
          label: "לשלוח מסר פרטי במקום מכתב",
          immediateEffects: { closeness: 7, exposure: 7, stress: 3, credibility: -3 },
          flags: { set: ["crossed_boundary"] },
          resultText: "עקפת את הדרך הרשמית. גם את הגבול.",
          next: "s027"
        }
      ]
    },
    {
      id: "s022",
      title: "העברה דחופה לבית",
      text: ["צריך סכום עוד הלילה.", "בבוקר מחכה חשבון ספקים."],
      bullets: ["חיתוך דו-כיווני", "תשלום אחד לא מכסה הכול"],
      choices: [
        {
          id: "s022_c1",
          label: "להעביר הכול ולדחות ספקים",
          immediateEffects: { money: -2600, cashflow: -7, stress: 8, credibility: 3 },
          delayed: [{ afterTurns: 2, effects: { stress: -2, credibility: 2 }, revealText: "בבית זכרו מי עמד מולם." }],
          flags: { set: ["family_emergency", "promised_family_support"] },
          resultText: "שמעת תודה בבית. כעס בעסק.",
          next: "s027"
        },
        {
          id: "s022_c2",
          label: "לחלק חצי-חצי",
          immediateEffects: { money: -1400, cashflow: -2, stress: 5, credibility: 1 },
          flags: { set: ["family_emergency"] },
          resultText: "אף צד לא קיבל הכול. שניהם קיבלו מעט.",
          next: "s023"
        },
        {
          id: "s022_c3",
          label: "לקחת גישור לשני הצדדים",
          immediateEffects: { money: 2200, cashflow: 3, stress: 7, exposure: 5 },
          delayed: [{ afterTurns: 3, effects: { money: -2500, cashflow: -8 }, revealText: "ההחזר פגע בבית ובעסק יחד." }],
          flags: { set: ["family_emergency", "legal_risk", "overdue_debt"] },
          resultText: "פתרת את הרגע. חיזקת את הלחץ הבא.",
          next: "s025"
        }
      ]
    },
    {
      id: "s023",
      title: "חדר ישיבות לילי",
      text: ["הלוח מלא מספרים.", "העיניים על מי ימצמץ ראשון."],
      bullets: ["תנאי עסקה אחרונים", "נוכחות שקטה בחדר"],
      choices: [
        {
          id: "s023_c1",
          label: "עסקה שקופה ואיטית",
          immediateEffects: { money: 900, cashflow: 4, credibility: 5, stress: 2, exposure: -2 },
          resultText: "זה לא נוצץ, אבל מחזיק מים.",
          next: "s028"
        },
        {
          id: "s023_c2",
          label: "תחזית אגרסיבית לסגירה מהירה",
          immediateEffects: { money: 2600, cashflow: 6, credibility: -4, stress: 5, exposure: 4 },
          delayed: [{ afterTurns: 2, effects: { credibility: -4 }, revealText: "נדרשה הוכחה שלא הייתה אצלך.", clues: ["c16"] }],
          flags: { set: ["signed_term_sheet"] },
          resultText: "המספרים עבדו על החדר. לא על הזמן.",
          next: "s028"
        },
        {
          id: "s023_c3",
          label: "לבקש שיחה לבד במסדרון",
          immediateEffects: { closeness: 8, exposure: 6, stress: 3 },
          flags: { set: ["late_night_meeting"] },
          resultText: "הדיון יצא מהשולחן ונכנס לאזור אפור.",
          next: "s024"
        }
      ]
    },
    {
      id: "s024",
      title: "מרפסת מלון, רוח קרה",
      text: ["היא קרובה מדי בשביל חוזה.", "המילים קצרות, הכוונות כבדות."],
      bullets: ["משיכה", "מינוף", "סיכון הדדי"],
      choices: [
        {
          id: "s024_c1",
          label: "לשמור קו מקצועי",
          immediateEffects: { credibility: 5, closeness: -2, exposure: -1, stress: 2 },
          resultText: "שמעת את האכזבה, אבל שמרת ציר נקי.",
          next: "s028"
        },
        {
          id: "s024_c2",
          label: "להתקרב ולסגור בלחישה",
          immediateEffects: { closeness: 14, exposure: 10, stress: 5, credibility: -3 },
          flags: { set: ["crossed_boundary", "late_night_meeting"] },
          clues: ["c02", "c19"],
          resultText: "היא חייכה. המחיר נדחה לשלב הבא.",
          next: { type: "conditional", rules: [{ if: { stats: { closeness: { gte: 70 } }, cluesAll: ["c07", "c02"] }, goto: "s029" }], default: "s028" }
        },
        {
          id: "s024_c3",
          label: "לחשוף רמז על מסמך",
          immediateEffects: { closeness: 9, exposure: 8, credibility: -2, stress: 4 },
          flags: { set: ["hidden_document"] },
          clues: ["c01"],
          resultText: "הקלף נפתח. אי אפשר להחזיר אותו לכיס.",
          next: "s029"
        }
      ]
    },
    {
      id: "s025",
      title: "לחץ נזילות לפני בוקר",
      text: ["עוד שעתיים נסגרת מסגרת.", "הבחירה היא מחיר או זמן."],
      bullets: ["תזרים מיידי", "עלות מושהית"],
      choices: [
        {
          id: "s025_c1",
          label: "למכור הפסדים עכשיו",
          immediateEffects: { money: 1700, portfolio: -8, cashflow: 5, stress: 4 },
          delayed: [{ afterTurns: 2, effects: { cashflow: -6, stress: 3 }, revealText: "הנזילות המהירה חזרה כמו קנס." }],
          resultText: "הבוקר ניצל. המחר נפגע.",
          next: "s028"
        },
        {
          id: "s025_c2",
          label: "לקחת מינוף נוסף ללילה",
          immediateEffects: { money: 2800, portfolio: 7, cashflow: 4, stress: 8, exposure: 7 },
          delayed: [{ afterTurns: 2, effects: { cashflow: -12, stress: 9 }, revealText: "הלילה נסגר, החוב נפתח.", clues: ["c22"] }],
          flags: { set: ["legal_risk"] },
          resultText: "הכנסת אוויר בצינור צר מדי.",
          next: "s030"
        },
        {
          id: "s025_c3",
          label: "לעצור ולבקש דחייה",
          immediateEffects: { cashflow: -3, credibility: 2, stress: 2, energy: 1 },
          resultText: "הפסדת גובה, הרווחת נשימה קצרה.",
          next: "s026"
        }
      ]
    },
    {
      id: "s026",
      title: "פנייה מעיתונאית",
      text: ["היא יודעת יותר ממה שפרסמו.", "השאלה הראשונה כבר נשלחה."],
      bullets: ["תגובה רשמית", "או משחק כפול"],
      choices: [
        {
          id: "s026_c1",
          label: "תגובה רשמית קצרה",
          immediateEffects: { exposure: -3, credibility: 4, stress: 3 },
          clues: ["c18"],
          resultText: "לא נתת כותרת. אולי דחית אותה.",
          next: "s029"
        },
        {
          id: "s026_c2",
          label: "להדליף עליה מידע נגדי",
          immediateEffects: { exposure: 7, credibility: -5, stress: 5 },
          flags: { set: ["legal_risk"] },
          clues: ["c03"],
          resultText: "המהלך היה חד. גם מסוכן.",
          next: "s029"
        },
        {
          id: "s026_c3",
          label: "להזמין לשיחה פרטית אחרי שעות",
          immediateEffects: { closeness: 8, exposure: 9, stress: 4, credibility: -2 },
          flags: { set: ["late_night_meeting", "crossed_boundary"] },
          resultText: "הכותרת נדחתה. נפתח ערוץ טעון.",
          next: "s030"
        }
      ]
    },
    {
      id: "s027",
      title: "ארוחת שישי, שתיקה כבדה",
      text: ["כולם סביב השולחן.", "אף אחד לא שואל ישירות."],
      bullets: ["אמון ביתי", "זמן מול אחריות"],
      choices: [
        {
          id: "s027_c1",
          label: "לפתוח הכול ולבקש אמון",
          immediateEffects: { credibility: 6, stress: 4, energy: -3 },
          flags: { set: ["family_secret", "family_emergency_resolved"] },
          clues: ["c23"],
          resultText: "היה קשה, אבל שקט אמיתי חזר לשולחן.",
          next: "s028"
        },
        {
          id: "s027_c2",
          label: "להסתיר ולעבור נושא",
          immediateEffects: { credibility: -4, stress: 6, exposure: 3 },
          flags: { set: ["family_secret"] },
          resultText: "המבטים נמשכו גם אחרי הקינוח.",
          next: "s029"
        },
        {
          id: "s027_c3",
          label: "להתחייב לסכום קבוע מהעסק",
          immediateEffects: { money: -1500, cashflow: -5, credibility: 5, stress: 5 },
          delayed: [{ afterTurns: 2, effects: { cashflow: -4, money: -900 }, revealText: "התחייבות חודשית חזרה בדיוק בזמן הלא נכון." }],
          flags: { set: ["promised_family_support", "family_emergency"] },
          resultText: "קיבלת שקט משפחתי במחיר עסקי קבוע.",
          next: "s030"
        }
      ]
    },
    {
      id: "s028",
      title: "טיוטה אחרונה לחתימה",
      text: ["זה הלילה האחרון לפני סגירה.", "או לפני נסיגה."],
      bullets: ["בדיקה כפולה", "פיתוי לסיים מהר"],
      choices: [
        {
          id: "s028_c1",
          label: "לחתום רק אחרי אימות כפול",
          immediateEffects: { credibility: 7, stress: 2, money: -600 },
          flags: { set: ["found_red_flags"] },
          resultText: "בחרת דיוק במקום אדרנלין.",
          next: { type: "conditional", rules: [{ if: { cluesAll: ["c05", "c10"] }, goto: "s030" }], default: "s029" }
        },
        {
          id: "s028_c2",
          label: "לחתום עכשיו ולנעול",
          immediateEffects: { cashflow: 8, money: 3200, exposure: 5, credibility: -4 },
          delayed: [{ afterTurns: 2, effects: { exposure: 6, stress: 4 }, revealText: "האותיות הקטנות התעוררו אחרי החתימה.", clues: ["c12"] }],
          flags: { set: ["signed_term_sheet"] },
          resultText: "העסקה נסגרה מהר. החדר לא נרגע.",
          next: "s029"
        },
        {
          id: "s028_c3",
          label: "לסגת ברגע האחרון",
          immediateEffects: { credibility: 5, cashflow: -4, stress: 3, exposure: -2 },
          flags: { set: ["mentor_warning"] },
          resultText: "ויתרת על כסף כדי להציל מרחב תמרון.",
          next: "s030"
        }
      ]
    },
    {
      id: "s029",
      title: "סערת הדלפה ברשת",
      text: ["השם שלך מתחיל להתרוצץ.", "יש עוד שעה לפני שכולם רואים."],
      bullets: ["תגובה מהירה", "או מחיקה מסוכנת"],
      choices: [
        {
          id: "s029_c1",
          label: "הודעה מלאה עם ראיות",
          immediateEffects: { exposure: -7, credibility: 5, stress: 5, money: -700 },
          resultText: "היוזמה חזרה לידיים שלך, חלקית.",
          next: { type: "conditional", rules: [{ if: { stats: { exposure: { lte: 40 }, credibility: { gte: 55 } } }, goto: "s030" }], default: "END:boxed_in" }
        },
        {
          id: "s029_c2",
          label: "למחוק עקבות בלילה",
          immediateEffects: { money: -900, exposure: 6, stress: 6, credibility: -6 },
          flags: { set: ["legal_risk", "leaked_screenshot"] },
          clues: ["c03", "c11"],
          resultText: "מחיקה חלקית השאירה סימנים חדים.",
          next: "END:exposed"
        },
        {
          id: "s029_c3",
          label: "להקריב קשר כדי לעצור פרסום",
          immediateEffects: { closeness: -10, exposure: -4, credibility: 2, stress: 7 },
          flags: { unset: ["crossed_boundary"] },
          resultText: "הלהבה ירדה. המחיר אישי.",
          next: "s030"
        }
      ]
    },
    {
      id: "s030",
      title: "שחר. החלטה אחרונה",
      text: ["הטלפון ביד אחת.", "טיוטת חתימה ביד השנייה."],
      bullets: ["מסלול נקי", "מהלך מהיר", "לב מול לוח"],
      choices: [
        {
          id: "s030_c1",
          label: "לבחור מסלול נקי גם אם איטי",
          immediateEffects: { money: 1200, cashflow: 3, credibility: 7, stress: 2, exposure: -3 },
          flags: { set: ["family_emergency_resolved"] },
          resultText: "בחרת יציבות. עכשיו הכול ייבחן במספרים.",
          next: "END:last_minute_save"
        },
        {
          id: "s030_c2",
          label: "ללחוץ על עסקה מהירה",
          immediateEffects: { money: 3800, cashflow: 6, portfolio: 5, stress: 6, exposure: 5 },
          resultText: "הדלת נסגרה מאחוריך מהר.",
          next: "END:quiet_deal"
        },
        {
          id: "s030_c3",
          label: "להתקשר הביתה לפני חתימה",
          immediateEffects: { energy: 3, stress: -4, credibility: 4, money: -800, cashflow: -2 },
          flags: { set: ["family_emergency_resolved"] },
          resultText: "הקול בצד השני שינה את הכיוון.",
          next: "END:family_first"
        },
        {
          id: "s030_c4",
          label: "לשלוח: \"נפגשים לבד\"",
          immediateEffects: { closeness: 12, exposure: 9, stress: 5, credibility: -3 },
          flags: { set: ["crossed_boundary"] },
          resultText: "כתבת שורה קצרה עם השלכות ארוכות.",
          next: "END:we_both_knew"
        }
      ]
    }
  ];

  const CLUE_BY_ID = new Map(CLUES.map((c) => [c.id, c]));
  const ENDING_BY_ID = new Map(ENDINGS.map((e) => [e.id, e]));
  const SCENARIO_BY_ID = new Map(SCENARIOS.map((s) => [s.id, s]));

  const dom = {
    body: document.body,
    startBtn: document.getElementById("startBtn"),
    continueBtn: document.getElementById("continueBtn"),
    helpBtn: document.getElementById("helpBtn"),
    themeBtn: document.getElementById("themeBtn"),
    muteBtn: document.getElementById("muteBtn"),
    turnIndicator: document.getElementById("turnIndicator"),
    chapterIndicator: document.getElementById("chapterIndicator"),
    homeScreen: document.getElementById("homeScreen"),
    gameScreen: document.getElementById("gameScreen"),
    startHomeBtn: document.getElementById("startHomeBtn"),
    continueHomeBtn: document.getElementById("continueHomeBtn"),
    scenarioCard: document.getElementById("scenarioCard"),
    scenarioTitle: document.getElementById("scenarioTitle"),
    scenarioText: document.getElementById("scenarioText"),
    scenarioBullets: document.getElementById("scenarioBullets"),
    choicesContainer: document.getElementById("choicesContainer"),
    resultBox: document.getElementById("resultBox"),
    resultText: document.getElementById("resultText"),
    resultReveals: document.getElementById("resultReveals"),
    resultClue: document.getElementById("resultClue"),
    deltaChips: document.getElementById("deltaChips"),
    nextTurnBtn: document.getElementById("nextTurnBtn"),
    endingBox: document.getElementById("endingBox"),
    endingTitle: document.getElementById("endingTitle"),
    endingSummary: document.getElementById("endingSummary"),
    restartFromEndBtn: document.getElementById("restartFromEndBtn"),
    backHomeBtn: document.getElementById("backHomeBtn"),
    moneyDisplay: document.getElementById("moneyDisplay"),
    statsBars: document.getElementById("statsBars"),
    historyList: document.getElementById("historyList"),
    cluesList: document.getElementById("cluesList"),
    endingsGrid: document.getElementById("endingsGrid"),
    endingProgress: document.getElementById("endingProgress"),
    toastContainer: document.getElementById("toastContainer"),
    helpModal: document.getElementById("helpModal"),
    closeHelpBtn: document.getElementById("closeHelpBtn")
  };

  let audioCtx = null;

  const state = {
    phase: PHASES.HOME,
    turn: 1,
    maxTurns: MAX_TURNS,
    currentScenarioId: null,
    stats: { ...INITIAL_STATS },
    flags: createBaseFlags(),
    cluesDiscovered: [],
    history: [],
    delayedQueue: [],
    pendingNext: null,
    pendingEnding: null,
    resultPayload: null,
    endingId: null,
    warningState: {
      money_minus: false,
      cashflow_critical: false,
      stress_extreme: false,
      exposure_high: false,
      credibility_low: false,
      closeness_edge: false
    },
    prefs: {
      theme: "dark",
      mute: false,
      unlockedEndings: []
    }
  };
  function createBaseFlags() {
    return FLAG_KEYS.reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {});
  }

  function loadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (_) {
      return fallback;
    }
  }

  function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function loadPrefs() {
    const meta = loadJson(STORAGE_KEYS.meta, null);
    if (!meta) return;
    state.prefs.theme = meta.theme === "light" ? "light" : "dark";
    state.prefs.mute = Boolean(meta.mute);
    state.prefs.unlockedEndings = Array.isArray(meta.unlockedEndings)
      ? meta.unlockedEndings.filter((id) => ENDING_BY_ID.has(id))
      : [];
  }

  function savePrefs() {
    saveJson(STORAGE_KEYS.meta, {
      theme: state.prefs.theme,
      mute: state.prefs.mute,
      unlockedEndings: state.prefs.unlockedEndings
    });
  }

  function loadRun() {
    return loadJson(STORAGE_KEYS.run, null);
  }

  function saveRun() {
    if (state.phase === PHASES.HOME || state.phase === PHASES.ENDED) return;
    saveJson(STORAGE_KEYS.run, {
      phase: state.phase,
      currentScenarioId: state.currentScenarioId,
      turn: state.turn,
      stats: state.stats,
      flags: state.flags,
      cluesDiscovered: state.cluesDiscovered,
      history: state.history,
      delayedQueue: state.delayedQueue,
      pendingNext: state.pendingNext,
      pendingEnding: state.pendingEnding,
      resultPayload: state.resultPayload,
      unlockedEndings: state.prefs.unlockedEndings,
      theme: state.prefs.theme,
      mute: state.prefs.mute
    });
  }

  function clearRun() {
    localStorage.removeItem(STORAGE_KEYS.run);
  }

  function hydrateRun(saved) {
    state.phase = saved.phase === PHASES.RESULT ? PHASES.RESULT : PHASES.RUNNING;
    state.currentScenarioId = SCENARIO_BY_ID.has(saved.currentScenarioId) ? saved.currentScenarioId : "s001";
    state.turn = Number.isFinite(saved.turn) ? saved.turn : 1;
    state.stats = { ...INITIAL_STATS, ...(saved.stats || {}) };
    state.flags = { ...createBaseFlags(), ...(saved.flags || {}) };
    state.cluesDiscovered = Array.isArray(saved.cluesDiscovered) ? saved.cluesDiscovered : [];
    state.history = Array.isArray(saved.history) ? saved.history : [];
    state.delayedQueue = Array.isArray(saved.delayedQueue) ? saved.delayedQueue : [];
    state.pendingNext = saved.pendingNext || null;
    state.pendingEnding = saved.pendingEnding || null;
    state.resultPayload = saved.resultPayload || null;
    state.endingId = null;
  }

  function resetRun() {
    state.phase = PHASES.RUNNING;
    state.turn = 1;
    state.currentScenarioId = "s001";
    state.stats = { ...INITIAL_STATS };
    state.flags = createBaseFlags();
    state.cluesDiscovered = [];
    state.history = [];
    state.delayedQueue = [];
    state.pendingNext = null;
    state.pendingEnding = null;
    state.resultPayload = null;
    state.endingId = null;
    Object.keys(state.warningState).forEach((key) => {
      state.warningState[key] = false;
    });
  }

  function applyTheme() {
    dom.body.setAttribute("data-theme", state.prefs.theme);
    dom.themeBtn.textContent = state.prefs.theme === "dark" ? "מצב: כהה" : "מצב: בהיר";
  }

  function formatMoney(value) {
    const formatted = new Intl.NumberFormat("he-IL", { maximumFractionDigits: 0 }).format(value);
    return `₪${formatted}`;
  }

  function chapterLabel(turn) {
    if (turn <= 5) return "מערכה 1/3";
    if (turn <= 10) return "מערכה 2/3";
    return "מערכה 3/3";
  }

  function clampStat(key, value) {
    if (key === "money") return Math.round(value);
    return Math.max(0, Math.min(100, Math.round(value)));
  }

  function hasClue(id) {
    return state.cluesDiscovered.some((clue) => clue.id === id);
  }

  function hasClues(ids) {
    return ids.every((id) => hasClue(id));
  }

  function applyEffects(effects, deltaBag) {
    if (!effects) return;
    Object.entries(effects).forEach(([key, amount]) => {
      if (!Number.isFinite(amount) || !Object.prototype.hasOwnProperty.call(state.stats, key)) return;
      const oldValue = state.stats[key];
      const newValue = clampStat(key, oldValue + amount);
      const delta = newValue - oldValue;
      state.stats[key] = newValue;
      deltaBag[key] = (deltaBag[key] || 0) + delta;
    });
  }

  function applyFlagChanges(flagBlock) {
    if (!flagBlock) return;
    if (Array.isArray(flagBlock.set)) {
      flagBlock.set.forEach((flag) => {
        if (FLAG_KEYS.includes(flag)) state.flags[flag] = true;
      });
    }
    if (Array.isArray(flagBlock.unset)) {
      flagBlock.unset.forEach((flag) => {
        if (FLAG_KEYS.includes(flag)) state.flags[flag] = false;
      });
    }
  }

  function addClue(clueId, targetTurn, resultPack) {
    if (!CLUE_BY_ID.has(clueId) || hasClue(clueId)) return false;
    const source = CLUE_BY_ID.get(clueId);
    const discovered = {
      id: source.id,
      text: source.text,
      severity: source.severity,
      category: source.category,
      discoveredAtTurn: targetTurn
    };
    state.cluesDiscovered.push(discovered);
    if (resultPack) resultPack.newClues.push(discovered);
    return true;
  }

  function scheduleDelayed(delayedList) {
    if (!Array.isArray(delayedList)) return;
    delayedList.forEach((entry) => {
      if (!entry || !Number.isFinite(entry.afterTurns) || entry.afterTurns < 1) return;
      if (Number.isFinite(entry.chance) && Math.random() > entry.chance) return;
      state.delayedQueue.push({
        remainingTurns: entry.afterTurns,
        effects: entry.effects || {},
        revealText: entry.revealText || "",
        clues: Array.isArray(entry.clues) ? entry.clues : [],
        flags: entry.flags || null
      });
    });
  }

  function processDelayed(resultPack) {
    if (!state.delayedQueue.length) return;
    const pending = [];
    state.delayedQueue.forEach((item) => {
      item.remainingTurns -= 1;
      if (item.remainingTurns <= 0) {
        applyEffects(item.effects, resultPack.delta);
        applyFlagChanges(item.flags);
        item.clues.forEach((clueId) => addClue(clueId, state.turn, resultPack));
        if (item.revealText) {
          resultPack.reveals.push(item.revealText);
          showToast(`התפתחות מושהית: ${item.revealText}`);
        }
      } else {
        pending.push(item);
      }
    });
    state.delayedQueue = pending;
  }

  function triggerRandomEvent(resultPack) {
    if (state.turn % 3 !== 0) return;
    const randomEvent = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
    applyEffects(randomEvent.effects, resultPack.delta);
    applyFlagChanges(randomEvent.flags);
    if (randomEvent.clueId && Math.random() <= (randomEvent.clueChance || 1)) addClue(randomEvent.clueId, state.turn, resultPack);
    resultPack.reveals.push(`אירוע צד: ${randomEvent.text}`);
    showToast(`אירוע צד: ${randomEvent.text}`);
  }

  function evaluateStatRule(value, rule) {
    if (!rule || typeof rule !== "object") return true;
    if (Number.isFinite(rule.lt) && !(value < rule.lt)) return false;
    if (Number.isFinite(rule.lte) && !(value <= rule.lte)) return false;
    if (Number.isFinite(rule.gt) && !(value > rule.gt)) return false;
    if (Number.isFinite(rule.gte) && !(value >= rule.gte)) return false;
    if (Number.isFinite(rule.eq) && !(value === rule.eq)) return false;
    if (Array.isArray(rule.between) && rule.between.length === 2) {
      const [min, max] = rule.between;
      if (!(value >= min && value <= max)) return false;
    }
    return true;
  }

  function matchCondition(condition) {
    if (!condition) return true;
    if (condition.stats && typeof condition.stats === "object") {
      for (const [statKey, rule] of Object.entries(condition.stats)) {
        if (!Object.prototype.hasOwnProperty.call(state.stats, statKey)) return false;
        if (!evaluateStatRule(state.stats[statKey], rule)) return false;
      }
    }
    if (Array.isArray(condition.flagsAll) && !condition.flagsAll.every((flag) => state.flags[flag])) return false;
    if (Array.isArray(condition.flagsAny) && !condition.flagsAny.some((flag) => state.flags[flag])) return false;
    if (Array.isArray(condition.flagsNot) && !condition.flagsNot.every((flag) => !state.flags[flag])) return false;
    if (Array.isArray(condition.cluesAll) && !condition.cluesAll.every((clueId) => hasClue(clueId))) return false;
    if (Array.isArray(condition.cluesAny) && !condition.cluesAny.some((clueId) => hasClue(clueId))) return false;
    if (Array.isArray(condition.cluesNot) && !condition.cluesNot.every((clueId) => !hasClue(clueId))) return false;
    if (Number.isFinite(condition.turnGte) && !(state.turn >= condition.turnGte)) return false;
    if (Number.isFinite(condition.turnLte) && !(state.turn <= condition.turnLte)) return false;
    return true;
  }

  function resolveNext(nextConfig) {
    if (typeof nextConfig === "string") return nextConfig;
    if (nextConfig && nextConfig.type === "conditional") {
      const rules = Array.isArray(nextConfig.rules) ? nextConfig.rules : [];
      for (const rule of rules) {
        if (matchCondition(rule.if)) return rule.goto;
      }
      return nextConfig.default || "s030";
    }
    return "s030";
  }

  function checkEnding(forced = false) {
    const s = state.stats;
    if (s.exposure >= 85 && hasClues(["c03", "c08"])) return "exposed";
    if (s.stress >= 95 || s.energy <= 0) return "burnout";
    if (s.money <= -1500 && s.cashflow <= 20) return "collapse";
    if (s.credibility <= 15 && state.flags.crossed_boundary && hasClues(["c01", "c04"])) return "silent_betrayal";
    if (s.closeness >= 80 && s.exposure >= 70 && state.flags.crossed_boundary) return "dangerous_closeness";
    if (state.flags.legal_risk && s.exposure >= 75 && hasClues(["c20"])) return "boxed_in";
    if (state.flags.signed_term_sheet && state.flags.crossed_boundary && hasClues(["c05", "c06"])) return "dirty_deal";
    if (hasClues(["c02", "c07"]) && s.closeness >= 68 && state.flags.crossed_boundary) return "we_both_knew";
    if (s.stress >= 85 && s.closeness >= 80 && s.credibility < 35) return "red_line";
    if (state.flags.family_emergency && !state.flags.family_emergency_resolved && s.money >= 11000) return "family_first";
    if (s.money >= 14000 && s.portfolio >= 70 && s.exposure <= 55 && s.credibility >= 60) return "cold_win";
    if (s.credibility >= 70 && s.exposure <= 45 && state.flags.mentor_warning) return "credibility_hold";
    if (s.money >= 7500 && s.cashflow >= 55 && s.exposure < 65 && !state.flags.legal_risk) return "quiet_deal";
    if (!forced) return null;
    if (state.flags.family_emergency && !state.flags.family_emergency_resolved) return "family_first";
    if (s.money < 0 || s.cashflow < 30) return "red_line";
    if (s.credibility >= 60 && s.exposure <= 50) return "credibility_hold";
    return "last_minute_save";
  }

  function checkWarnings() {
    WARNING_RULES.forEach((rule) => {
      const triggered = rule.check(state.stats);
      if (triggered && !state.warningState[rule.key]) showToast(rule.text, rule.level);
      state.warningState[rule.key] = triggered;
    });
  }

  function unlockEnding(endingId) {
    if (!state.prefs.unlockedEndings.includes(endingId)) {
      state.prefs.unlockedEndings.push(endingId);
      savePrefs();
    }
  }

  function renderStats() {
    dom.moneyDisplay.textContent = `כסף: ${formatMoney(state.stats.money)}`;
    dom.statsBars.innerHTML = "";
    STAT_ORDER.forEach((key) => {
      const row = document.createElement("div");
      row.className = "stat-row";
      const label = document.createElement("label");
      label.textContent = STAT_LABELS[key];
      const valueText = document.createElement("span");
      valueText.textContent = String(state.stats[key]);
      label.appendChild(valueText);
      const bar = document.createElement("div");
      bar.className = "bar";
      const fill = document.createElement("span");
      fill.style.width = `${state.stats[key]}%`;
      fill.setAttribute("aria-hidden", "true");
      bar.appendChild(fill);
      row.appendChild(label);
      row.appendChild(bar);
      dom.statsBars.appendChild(row);
    });
  }

  function renderHistory() {
    dom.historyList.innerHTML = "";
    if (!state.history.length) {
      const li = document.createElement("li");
      li.textContent = "עדיין אין החלטות.";
      dom.historyList.appendChild(li);
      return;
    }
    state.history.slice(0, 7).forEach((entry) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>תור ${entry.turn}: ${entry.title}</strong><span class="history-line">נבחר: ${entry.choiceLabel}</span>`;
      dom.historyList.appendChild(li);
    });
  }

  function renderClues() {
    dom.cluesList.innerHTML = "";
    if (!state.cluesDiscovered.length) {
      const li = document.createElement("li");
      li.textContent = "עדיין אין רמזים.";
      dom.cluesList.appendChild(li);
      return;
    }
    const sorted = [...state.cluesDiscovered].sort((a, b) => b.discoveredAtTurn - a.discoveredAtTurn);
    sorted.forEach((clue) => {
      const li = document.createElement("li");
      const top = document.createElement("div");
      top.className = "clue-top";
      const text = document.createElement("strong");
      text.textContent = clue.text;
      const dot = document.createElement("span");
      dot.className = `clue-sev s${clue.severity}`;
      dot.setAttribute("title", `חומרה ${clue.severity}`);
      top.appendChild(text);
      top.appendChild(dot);
      const meta = document.createElement("div");
      meta.className = "clue-meta";
      meta.textContent = `${clue.category} | תור ${clue.discoveredAtTurn}`;
      li.appendChild(top);
      li.appendChild(meta);
      dom.cluesList.appendChild(li);
    });
  }

  function renderCollection() {
    dom.endingsGrid.innerHTML = "";
    ENDINGS.forEach((ending) => {
      const card = document.createElement("article");
      const unlocked = state.prefs.unlockedEndings.includes(ending.id);
      card.className = `ending-card ${unlocked ? "" : "locked"}`;
      const title = document.createElement("h4");
      title.textContent = unlocked ? ending.title : "נעול";
      const summary = document.createElement("p");
      summary.textContent = unlocked ? ending.summary : "צריך לחשוף מסלול נוסף.";
      card.appendChild(title);
      card.appendChild(summary);
      dom.endingsGrid.appendChild(card);
    });
    dom.endingProgress.textContent = `${state.prefs.unlockedEndings.length}/${ENDINGS.length}`;
  }

  function renderScenario() {
    const scenario = SCENARIO_BY_ID.get(state.currentScenarioId);
    if (!scenario) return;
    dom.scenarioTitle.textContent = scenario.title;
    dom.scenarioText.innerHTML = "";
    scenario.text.forEach((line) => {
      const p = document.createElement("p");
      p.textContent = line;
      dom.scenarioText.appendChild(p);
    });
    dom.scenarioBullets.innerHTML = "";
    if (Array.isArray(scenario.bullets) && scenario.bullets.length) {
      scenario.bullets.forEach((bullet) => {
        const li = document.createElement("li");
        li.textContent = bullet;
        dom.scenarioBullets.appendChild(li);
      });
      dom.scenarioBullets.classList.remove("hidden");
    } else {
      dom.scenarioBullets.classList.add("hidden");
    }
    dom.choicesContainer.innerHTML = "";
    scenario.choices.forEach((choice) => {
      const button = document.createElement("button");
      button.className = "choice-btn";
      button.textContent = choice.label;
      button.type = "button";
      button.disabled = state.phase !== PHASES.RUNNING;
      button.setAttribute("aria-label", `בחירה: ${choice.label}`);
      button.addEventListener("click", () => handleChoice(scenario.id, choice.id));
      dom.choicesContainer.appendChild(button);
    });
  }

  function renderResult() {
    const payload = state.resultPayload;
    if (!payload) return;
    dom.resultText.textContent = payload.mainText;
    dom.resultReveals.innerHTML = "";
    payload.reveals.forEach((line) => {
      const li = document.createElement("li");
      li.textContent = line;
      dom.resultReveals.appendChild(li);
    });
    if (payload.newClues.length) {
      dom.resultClue.hidden = false;
      dom.resultClue.textContent = `רמז חדש: ${payload.newClues.map((clue) => clue.text).join(" | ")}`;
    } else {
      dom.resultClue.hidden = true;
      dom.resultClue.textContent = "";
    }
    dom.deltaChips.innerHTML = "";
    const affected = Object.entries(payload.delta).filter(([, value]) => value !== 0);
    if (!affected.length) {
      const chip = document.createElement("span");
      chip.className = "chip neu";
      chip.textContent = "ללא שינוי מיידי";
      dom.deltaChips.appendChild(chip);
    } else {
      affected.forEach(([key, value]) => {
        const chip = document.createElement("span");
        chip.className = `chip ${value > 0 ? "pos" : "neg"}`;
        const sign = value > 0 ? "+" : "";
        chip.textContent = `${STAT_LABELS[key]} ${sign}${value}`;
        dom.deltaChips.appendChild(chip);
      });
    }
  }
  function renderTurnInfo() {
    if (state.phase === PHASES.HOME) {
      dom.turnIndicator.textContent = "תור 0/16";
      dom.chapterIndicator.textContent = "מערכה 1/3";
      return;
    }
    dom.turnIndicator.textContent = `תור ${Math.min(state.turn, MAX_TURNS)}/${MAX_TURNS}`;
    dom.chapterIndicator.textContent = chapterLabel(state.turn);
  }

  function renderVisibility() {
    const inGame = state.phase === PHASES.RUNNING || state.phase === PHASES.RESULT || state.phase === PHASES.ENDED;
    dom.homeScreen.hidden = inGame;
    dom.gameScreen.hidden = !inGame;
    dom.resultBox.hidden = state.phase !== PHASES.RESULT;
    dom.endingBox.hidden = state.phase !== PHASES.ENDED;
    dom.scenarioCard.hidden = state.phase === PHASES.ENDED;
    const hasSavedRun = Boolean(loadRun());
    const canResume = hasSavedRun && state.phase === PHASES.HOME;
    dom.continueBtn.disabled = !canResume;
    dom.continueHomeBtn.disabled = !canResume;
  }

  function renderControls() {
    dom.muteBtn.textContent = state.prefs.mute ? "צליל: כבוי" : "צליל: פועל";
    applyTheme();
  }

  function renderEnding() {
    const ending = ENDING_BY_ID.get(state.endingId);
    if (!ending) return;
    dom.endingTitle.textContent = ending.title;
    dom.endingSummary.textContent = ending.summary;
  }

  function render() {
    renderVisibility();
    renderControls();
    renderTurnInfo();
    renderStats();
    renderHistory();
    renderClues();
    renderCollection();
    if (state.phase === PHASES.RUNNING || state.phase === PHASES.RESULT) renderScenario();
    if (state.phase === PHASES.RESULT) renderResult();
    if (state.phase === PHASES.ENDED) renderEnding();
  }

  function showToast(text, level = "warn") {
    const toast = document.createElement("div");
    toast.className = `toast ${level}`;
    toast.textContent = text;
    dom.toastContainer.appendChild(toast);
    playTone(level === "alert" ? 220 : 300, 0.07, level === "alert" ? 0.07 : 0.04);
    setTimeout(() => toast.remove(), 3400);
  }

  function unlockAudio() {
    if (audioCtx || state.prefs.mute) return;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (_) {
      audioCtx = null;
    }
  }

  function playTone(freq, duration, gain) {
    if (state.prefs.mute || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const amp = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    amp.gain.value = gain;
    osc.connect(amp);
    amp.connect(audioCtx.destination);
    const now = audioCtx.currentTime;
    amp.gain.setValueAtTime(gain, now);
    amp.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.start(now);
    osc.stop(now + duration);
  }

  function handleChoice(scenarioId, choiceId) {
    if (state.phase !== PHASES.RUNNING) return;
    const scenario = SCENARIO_BY_ID.get(scenarioId);
    if (!scenario || scenario.id !== state.currentScenarioId) return;
    const choice = scenario.choices.find((item) => item.id === choiceId);
    if (!choice) return;

    playTone(360, 0.04, 0.03);
    state.phase = PHASES.RESULT;

    const resultPack = { mainText: choice.resultText, delta: {}, reveals: [], newClues: [] };
    applyEffects(choice.immediateEffects, resultPack.delta);
    applyFlagChanges(choice.flags);
    if (Array.isArray(choice.clues)) choice.clues.forEach((clueId) => addClue(clueId, state.turn, resultPack));
    scheduleDelayed(choice.delayed);
    processDelayed(resultPack);
    triggerRandomEvent(resultPack);

    state.history.unshift({ turn: state.turn, title: scenario.title, choiceLabel: choice.label });
    if (state.history.length > 24) state.history = state.history.slice(0, 24);

    checkWarnings();
    const route = resolveNext(choice.next);
    state.pendingNext = route;
    const forcedByState = checkEnding(false);
    state.pendingEnding = forcedByState;
    if (!state.pendingEnding && typeof route === "string" && route.startsWith("END:")) state.pendingEnding = route.slice(4);
    if (!state.pendingEnding && state.turn >= state.maxTurns) state.pendingEnding = checkEnding(true);

    state.resultPayload = resultPack;
    saveRun();
    render();
  }

  function finalizeEnding(endingId) {
    const finalId = ENDING_BY_ID.has(endingId) ? endingId : "last_minute_save";
    state.phase = PHASES.ENDED;
    state.endingId = finalId;
    state.pendingNext = null;
    state.pendingEnding = null;
    state.resultPayload = null;
    unlockEnding(finalId);
    clearRun();
    render();
  }

  function goNextTurn() {
    if (state.phase !== PHASES.RESULT) return;
    if (state.pendingEnding) {
      finalizeEnding(state.pendingEnding);
      return;
    }
    const route = state.pendingNext;
    if (typeof route === "string" && route.startsWith("END:")) {
      finalizeEnding(route.slice(4));
      return;
    }

    state.turn += 1;
    state.currentScenarioId = SCENARIO_BY_ID.has(route) ? route : "s030";
    state.phase = PHASES.RUNNING;
    state.pendingNext = null;
    state.pendingEnding = null;
    state.resultPayload = null;

    if (state.turn > state.maxTurns) {
      finalizeEnding(checkEnding(true));
      return;
    }

    saveRun();
    render();
  }

  function startNewGame() {
    clearRun();
    resetRun();
    saveRun();
    render();
  }

  function continueGame() {
    const saved = loadRun();
    if (!saved) return;
    hydrateRun(saved);
    render();
  }

  function backHome() {
    state.phase = PHASES.HOME;
    state.currentScenarioId = null;
    state.pendingNext = null;
    state.pendingEnding = null;
    state.resultPayload = null;
    state.endingId = null;
    render();
  }

  function bindListeners() {
    dom.startBtn.addEventListener("click", startNewGame);
    dom.startHomeBtn.addEventListener("click", startNewGame);
    dom.continueBtn.addEventListener("click", continueGame);
    dom.continueHomeBtn.addEventListener("click", continueGame);
    dom.nextTurnBtn.addEventListener("click", goNextTurn);
    dom.restartFromEndBtn.addEventListener("click", startNewGame);
    dom.backHomeBtn.addEventListener("click", backHome);

    dom.helpBtn.addEventListener("click", () => dom.helpModal.showModal());
    dom.closeHelpBtn.addEventListener("click", () => dom.helpModal.close());

    dom.themeBtn.addEventListener("click", () => {
      state.prefs.theme = state.prefs.theme === "dark" ? "light" : "dark";
      savePrefs();
      applyTheme();
      render();
    });

    dom.muteBtn.addEventListener("click", () => {
      state.prefs.mute = !state.prefs.mute;
      if (!state.prefs.mute) unlockAudio();
      savePrefs();
      renderControls();
    });

    document.addEventListener("pointerdown", () => unlockAudio(), { once: true });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && dom.helpModal.open) dom.helpModal.close();
    });
  }

  function init() {
    loadPrefs();
    applyTheme();
    bindListeners();
    render();
  }

  init();
})();

