(() => {
  "use strict";

  const STORAGE_KEYS = {
    run: "kav_dak_run_v3",
    meta: "kav_dak_meta_v3"
  };

  const PHASES = {
    HOME: "HOME",
    RUNNING: "RUNNING",
    RESULT: "RESULT",
    ENDED: "ENDED"
  };

  const TAB_IDS = ["story", "stats", "assets", "relations", "clues", "endings"];
  const MAX_STANDARD_TURNS = 120;
  const WEEKS_IN_MONTH = 4;

  const STAT_META = [
    { key: "money", label: "כסף", type: "number" },
    { key: "cashflow", label: "תזרים", type: "percent" },
    { key: "investments", label: "השקעות", type: "percent" },
    { key: "assets", label: "נכסים", type: "number" },
    { key: "debts", label: "חובות", type: "number" },
    { key: "energy", label: "אנרגיה", type: "percent" },
    { key: "stress", label: "לחץ", type: "percent" },
    { key: "exposure", label: "כמה יודעים עליך", type: "percent" },
    { key: "trust", label: "כמה סומכים עליך", type: "percent" },
    { key: "relationship", label: "קשר", type: "percent" },
    { key: "family", label: "בית/משפחה", type: "percent" },
    { key: "reputation", label: "מוניטין", type: "percent" }
  ];

  const PERCENT_KEYS = STAT_META.filter((item) => item.type === "percent").map((item) => item.key);

  const INITIAL_STATS = {
    money: 5000,
    cashflow: 45,
    investments: 35,
    assets: 0,
    debts: 0,
    energy: 70,
    stress: 25,
    exposure: 15,
    trust: 55,
    relationship: 15,
    family: 40,
    reputation: 45
  };

  const FLAG_KEYS = [
    "isDating",
    "isMarried",
    "hasKids",
    "affairActive",
    "affairSuspected",
    "caughtCheating",
    "breakupThreat",
    "blackmailRisk",
    "legalRisk",
    "rebuiltAfterFall",
    "highRiskMode",
    "partnerPressure",
    "familyNeedCash",
    "lateNightPattern",
    "leakActive",
    "investigationOpen",
    "mentorWarning",
    "goodDealHit",
    "badDealHit",
    "businessOpened"
  ];

  const CHARACTERS = {
    love: "מאיה",
    spouse: "בת הזוג",
    rival: "רוני"
  };

  const ITEM_CATALOG = [
    {
      id: "item_car",
      name: "רכב",
      price: 42000,
      risk: "בינוני",
      note: "עוזר להגיע מהר, אבל עולה כל חודש.",
      monthly: { money: -1200, reputation: 2, relationship: 1 }
    },
    {
      id: "item_small_apartment",
      name: "דירה קטנה",
      price: 185000,
      risk: "בינוני",
      note: "יכול לתת שכירות או בית יציב.",
      monthly: { money: 1900, family: 6, stress: -2 }
    },
    {
      id: "item_business",
      name: "עסק",
      price: 130000,
      risk: "גבוה",
      note: "אם זה עובד אתה קופץ, אם לא אתה נשרף.",
      monthly: { money: 4200, cashflow: 5, stress: 4, reputation: 3 }
    },
    {
      id: "item_laptop",
      name: "מחשב חדש",
      price: 9200,
      risk: "נמוך",
      note: "משפר קצב עבודה.",
      monthly: { energy: 2, reputation: 1 }
    },
    {
      id: "item_phone",
      name: "טלפון יקר",
      price: 6800,
      risk: "בינוני",
      note: "פותח קשרים, גם מביא עיניים.",
      monthly: { relationship: 2, exposure: 2 }
    },
    {
      id: "item_invest_account",
      name: "חשבון השקעות פרטי",
      price: 35000,
      risk: "גבוה",
      note: "יותר רווח, יותר סיכון.",
      monthly: { investments: 4, exposure: 3, stress: 2 }
    },
    {
      id: "item_kids_room",
      name: "חדר ילדים",
      price: 26000,
      risk: "נמוך",
      note: "עוזר לבית, אבל מוסיף הוצאות.",
      monthly: { money: -900, family: 5, stress: -1 }
    },
    {
      id: "item_second_car",
      name: "רכב שני",
      price: 56000,
      risk: "גבוה",
      note: "נוח לפגישות כפולות. גם מחשיד.",
      monthly: { money: -1500, exposure: 4, relationship: 2 }
    }
  ];

  const CLUES = [
    { id: "c001", text: "מישהו צילם אותך", severity: 3, category: "חשיפה" },
    { id: "c002", text: "מסמך חסר", severity: 2, category: "ביזנס" },
    { id: "c003", text: "הודעה נמחקה", severity: 2, category: "קשר" },
    { id: "c004", text: "השם שלך עלה בשיחה", severity: 2, category: "חשיפה" },
    { id: "c005", text: "חתימה לא נראית אותו דבר", severity: 3, category: "ביזנס" },
    { id: "c006", text: "הבטחה בלי הוכחה", severity: 2, category: "השקעות" },
    { id: "c007", text: "מאיה לא ענתה שעה", severity: 1, category: "קשר" },
    { id: "c008", text: "רוני שאלה יותר מדי", severity: 2, category: "קשר" },
    { id: "c009", text: "העברה חזרה", severity: 2, category: "השקעות" },
    { id: "c010", text: "צד שלישי בתמונה", severity: 3, category: "חשיפה" },
    { id: "c011", text: "מכתב מעורך דין", severity: 3, category: "חשיפה" },
    { id: "c012", text: "מישהו שיקר על סכום", severity: 2, category: "ביזנס" },
    { id: "c013", text: "פגישה אחרי חצות", severity: 2, category: "קשר" },
    { id: "c014", text: "הטלפון צלצל בזמן רע", severity: 2, category: "משפחה" },
    { id: "c015", text: "צילום מסך בקבוצה", severity: 3, category: "חשיפה" },
    { id: "c016", text: "חוזה בלי סעיף", severity: 2, category: "ביזנס" },
    { id: "c017", text: "שם של חשבון זר", severity: 3, category: "השקעות" },
    { id: "c018", text: "שומר הכניסה זכר אותך", severity: 1, category: "חשיפה" },
    { id: "c019", text: "היא נגעה ביד שלך", severity: 1, category: "קשר" },
    { id: "c020", text: "הבית ביקש תשובה עכשיו", severity: 2, category: "משפחה" },
    { id: "c021", text: "השותף אוסף חומר", severity: 2, category: "ביזנס" },
    { id: "c022", text: "מספר חסוי חוזר", severity: 2, category: "קשר" },
    { id: "c023", text: "הדוח הגיע חתוך", severity: 2, category: "השקעות" },
    { id: "c024", text: "מפתח נוסף קיים", severity: 2, category: "חשיפה" },
    { id: "c025", text: "מישהו ראה אתכם יחד", severity: 3, category: "קשר" },
    { id: "c026", text: "שורה נמחקה בחוזה", severity: 2, category: "ביזנס" },
    { id: "c027", text: "ריבית לא כתובה", severity: 2, category: "השקעות" },
    { id: "c028", text: "הבן זוג שאל איפה היית", severity: 2, category: "משפחה" },
    { id: "c029", text: "קובץ הגיע למי שלא צריך", severity: 3, category: "חשיפה" },
    { id: "c030", text: "מאיה מחייכת אבל לחוצה", severity: 1, category: "קשר" },
    { id: "c031", text: "בדיקה רשמית נפתחה", severity: 3, category: "ביזנס" },
    { id: "c032", text: "רמז על הלבנת כסף", severity: 3, category: "השקעות" },
    { id: "c033", text: "תמונה מהחניה", severity: 2, category: "חשיפה" },
    { id: "c034", text: "ילד שאל שאלה קשה", severity: 1, category: "משפחה" },
    { id: "c035", text: "מייל נשלח מהחשבון שלך", severity: 2, category: "חשיפה" },
    { id: "c036", text: "רוני שומרת העתק", severity: 2, category: "ביזנס" },
    { id: "c037", text: "השותף איים לעזוב", severity: 2, category: "ביזנס" },
    { id: "c038", text: "רווח מהר מדי", severity: 1, category: "השקעות" },
    { id: "c039", text: "שיחה שקטה במסדרון", severity: 1, category: "קשר" },
    { id: "c040", text: "עורך דין בתמונה", severity: 3, category: "חשיפה" },
    { id: "c041", text: "חוב ישן חזר", severity: 2, category: "משפחה" },
    { id: "c042", text: "שומר הלובי סימן אותך", severity: 1, category: "חשיפה" },
    { id: "c043", text: "מכתב לפני תביעה", severity: 3, category: "ביזנס" },
    { id: "c044", text: "הילד שמע שיחה", severity: 2, category: "משפחה" },
    { id: "c045", text: "מאיה אמרה: אל תאחר שוב", severity: 1, category: "קשר" }
  ];

  const ENDINGS = [
    { id: "cold_win", title: "ניצחון קר", summary: "עשית הרבה כסף. נשארת לבד עם זה." },
    { id: "family_win", title: "ניצחון בית", summary: "בחרת בבית. פחות כסף, יותר שקט." },
    { id: "scandal", title: "כולם יודעים", summary: "הכול דלף. אין לאן לברוח." },
    { id: "collapse", title: "קריסה", summary: "חובות ותזרים גררו אותך למטה." },
    { id: "burnout", title: "נגמר לך הכוח", summary: "הלחץ גמר אותך לפני הסוף." },
    { id: "betrayal", title: "בגידה", summary: "שברת אמון בבית ובעסק יחד." },
    { id: "legal_trouble", title: "תיק משפטי", summary: "המסמכים הגיעו לבית משפט." },
    { id: "double_life", title: "חיים כפולים", summary: "בינתיים אף אחד לא תפס. בינתיים." },
    { id: "redemption", title: "חזרה לחיים", summary: "נפלת, קמת, ובנית מחדש." },
    { id: "quiet_money", title: "כסף שקט", summary: "בלי רעש, בלי דרמה, עם רווח יציב." },
    { id: "dirty_rich", title: "עשיר אבל מלוכלך", summary: "הרווחת בגדול, ושילמת בשם שלך." },
    { id: "alone_top", title: "למעלה לבד", summary: "אתה בטופ, אבל בלי אנשים סביבך." },
    { id: "broke_home", title: "עני אבל בבית", summary: "לא נשאר הרבה כסף, אבל הבית מחזיק." },
    { id: "blackmail", title: "סחיטה", summary: "מישהו מחזיק עליך חומר ומושך בחוטים." },
    { id: "divorce_public", title: "פירוק פומבי", summary: "זה נגמר בבית מול כולם." },
    { id: "second_chance", title: "הזדמנות שנייה", summary: "חתכת בזמן והתחלת דף חדש." },
    { id: "business_empire", title: "אימפריה", summary: "בניית עסק ענק עם שליטה מלאה." },
    { id: "hidden_fire", title: "אש שקטה", summary: "הכול נראה רגיל, אבל הכול בוער בפנים." },
    { id: "law_clear", title: "יצאת נקי", summary: "בדקו אותך ולא מצאו כלום." },
    { id: "long_run", title: "ריצה ארוכה", summary: "שרדת הרבה זמן. זה גם ניצחון." }
  ];

  const BADGES = [
    { id: "badge_first_apartment", title: "דירה ראשונה", desc: "קנית דירה קטנה." },
    { id: "badge_good_invest", title: "השקעה מוצלחת", desc: "פעם אחת פגעת בול בהשקעה." },
    { id: "badge_almost_caught", title: "כמעט נתפסת", desc: "החשד עלה גבוה וניצלת." },
    { id: "badge_wedding", title: "חתונה", desc: "נכנסת לחיים משותפים אמיתיים." },
    { id: "badge_first_business", title: "עסק ראשון", desc: "פתחת עסק משלך." },
    { id: "badge_big_rebuild", title: "חזרה גדולה", desc: "אחרי נפילה חזרת חזק." },
    { id: "badge_secret_master", title: "שומר סוד", desc: "החזקת סוד הרבה זמן." },
    { id: "badge_legal_escape", title: "ברחת מתביעה", desc: "הצלחת לצאת מתיק משפטי." }
  ];

  const DEALS = [
    {
      id: "deal_green",
      title: "פרויקט תשתית קטן",
      line: "סכום קטן, סיכון נמוך.",
      baseGain: 5200,
      baseLoss: 2200,
      risk: 20,
      clueWin: "c038",
      clueLoss: "c027"
    },
    {
      id: "deal_blue",
      title: "הכנסה מחברת תוכנה",
      line: "יכול להיות יפה, יכול להתהפך.",
      baseGain: 12000,
      baseLoss: 7800,
      risk: 42,
      clueWin: "c023",
      clueLoss: "c032"
    },
    {
      id: "deal_red",
      title: "סיבוב מהיר בחו\"ל",
      line: "כסף גדול בזמן קצר. גם הרבה עיניים.",
      baseGain: 24000,
      baseLoss: 20000,
      risk: 68,
      clueWin: "c017",
      clueLoss: "c040"
    }
  ];

  const RANDOM_EVENTS = [
    { id: "re1", text: "הבנק עצר העברה לשעה.", effects: { cashflow: -3, stress: 3 } },
    { id: "re2", text: "מאיה שלחה: \"ערה?\"", effects: { relationship: 3, exposure: 2 }, clues: ["c013"] },
    { id: "re3", text: "הבית ביקש עוד עזרה כספית.", effects: { money: -900, family: 2, stress: 3 }, flags: { set: ["familyNeedCash"] } },
    { id: "re4", text: "רוני אמרה ששמעה שמועה.", effects: { trust: -2, exposure: 3 }, clues: ["c004"] },
    { id: "re5", text: "שוק ההון זז לטובתך.", effects: { money: 1800, investments: 2 } },
    { id: "re6", text: "מישהו חיכה ליד הרכב.", effects: { stress: 4, exposure: 2 }, clues: ["c018"] },
    { id: "re7", text: "הילד לא ישן וחיכה לך.", effects: { family: -2, stress: 2, relationship: -1 }, clues: ["c034"], needsFlags: ["hasKids"] },
    { id: "re8", text: "קיבלת לקוח קטן מהמלצה.", effects: { money: 1200, reputation: 2, cashflow: 2 } },
    { id: "re9", text: "צילום מסך עבר הלאה.", effects: { exposure: 5, stress: 4 }, clues: ["c015"], flags: { set: ["leakActive"] } },
    { id: "re10", text: "הבן זוג שאל איפה היית בלילה.", effects: { trust: -3, stress: 3 }, clues: ["c028"], needsFlags: ["isDating"] },
    { id: "re11", text: "צוות בעסק ביקש שיחה קשה.", effects: { energy: -2, trust: -2, cashflow: -2 } },
    { id: "re12", text: "מייל מעורך דין נכנס.", effects: { stress: 4, exposure: 2 }, clues: ["c011"], flags: { set: ["legalRisk"] } }
  ];

  const SCENARIOS = [
    {
      id: "biz_supplier",
      minTurn: 1,
      maxTurn: 120,
      tags: ["business"],
      title: "ספק לוחץ עליך",
      text: ["הספק רוצה תשלום עד הערב.", "אם לא תשלם, העבודה נעצרת."],
      bullets: ["הצוות מחכה", "גם בבית מחכים לכסף"],
      choices: [
        {
          id: "a",
          label: "לשלם עכשיו",
          result: "שילמת. העסק נרגע, הכיס נלחץ.",
          effects: { money: -3500, cashflow: 5, stress: 2 },
          clues: ["c002"]
        },
        {
          id: "b",
          label: "לבקש דחייה קשוחה",
          result: "קיבלת עוד יומיים, אבל הוא לא שכח.",
          effects: { cashflow: -4, trust: -2, stress: 4 },
          flags: { set: ["partnerPressure"] }
        },
        {
          id: "c",
          label: "לבקש ממאיה לקשר חלופי",
          result: "נפתח קו חדש. גם המתח עלה.",
          effects: { relationship: 5, exposure: 4, stress: 2 },
          flags: { set: ["lateNightPattern"] },
          clues: ["c039"]
        }
      ]
    },
    {
      id: "biz_hire",
      minTurn: 3,
      maxTurn: 120,
      tags: ["business"],
      title: "צריך עוד ידיים",
      text: ["העבודה גדלה.", "אין מי שיחזיק הכול."],
      bullets: ["שכירות עולה כסף", "עומס שוחק"],
      choices: [
        {
          id: "a",
          label: "לגייס עובד",
          result: "העומס ירד, העלות קבועה כל חודש.",
          effects: { money: -2500, cashflow: 4, energy: 3, stress: -2, reputation: 2 }
        },
        {
          id: "b",
          label: "להישאר לבד",
          result: "חסכת כסף. הגוף שלך משלם.",
          effects: { energy: -6, stress: 6, cashflow: 2 }
        },
        {
          id: "c",
          label: "להביא את רוני זמנית",
          result: "יש עזרה עכשיו. בעתיד זה יכול להתפוצץ.",
          effects: { money: -1000, cashflow: 3, trust: -1, exposure: 2 },
          clues: ["c036"],
          delayed: [
            { afterWeeks: 5, effects: { trust: -3, stress: 3 }, revealText: "רוני הזכירה שיש לה העתק מהמסמכים." }
          ]
        }
      ]
    },
    {
      id: "biz_partner",
      minTurn: 6,
      maxTurn: 120,
      tags: ["business"],
      title: "השותף עצבני",
      text: ["השותף אומר שאתה מסתיר דברים.", "הוא רוצה לראות הכול."],
      bullets: ["אמון בפנים נחלש"],
      choices: [
        {
          id: "a",
          label: "לפתוח הכול",
          result: "כאב בטווח קצר. אמון חוזר קצת.",
          effects: { trust: 6, stress: 2, money: -800 },
          flags: { unset: ["partnerPressure"] }
        },
        {
          id: "b",
          label: "לתת רק חלק",
          result: "הוא לא השתכנע.",
          effects: { trust: -4, stress: 4, exposure: 2 },
          flags: { set: ["partnerPressure"] },
          clues: ["c021"]
        },
        {
          id: "c",
          label: "לעקוף אותו עם משקיע אחר",
          result: "קיבלת כסף מהיר, אבל זה עשה רעש.",
          effects: { money: 6000, exposure: 5, trust: -6, reputation: -2 },
          flags: { set: ["highRiskMode"] }
        }
      ]
    },
    {
      id: "invest_hot_tip",
      minTurn: 8,
      maxTurn: 120,
      tags: ["invest"],
      title: "טיפ חם בקבוצה",
      text: ["אומרים שזה בטוח.", "כולם נכנסים מהר."],
      bullets: ["קל לפספס", "קל גם להישרף"],
      choices: [
        {
          id: "a",
          label: "להיכנס חזק",
          result: "נכנסת מהר. עכשיו תחכה לתוצאה.",
          effects: { money: -7000, investments: 7, stress: 4 },
          delayed: [
            { afterWeeks: 3, effects: { money: 16000, investments: 4, cashflow: 2 }, revealText: "הטיפ פגע. עשית סיבוב יפה.", clues: ["c038"] },
            { afterWeeks: 6, effects: { exposure: 4, stress: 3 }, revealText: "שאלו מאיפה הגיע המידע." }
          ]
        },
        {
          id: "b",
          label: "להיכנס קטן",
          result: "מהלך זהיר, פחות פחד.",
          effects: { money: -2500, investments: 3, stress: 1 },
          delayed: [
            { afterWeeks: 3, effects: { money: 4300, cashflow: 2 }, revealText: "יצאת ברווח קטן." }
          ]
        },
        {
          id: "c",
          label: "לוותר",
          result: "לא הרווחת. גם לא נשרפת.",
          effects: { stress: -1, trust: 1 }
        }
      ]
    },
    {
      id: "invest_leverage",
      minTurn: 12,
      maxTurn: 120,
      tags: ["invest"],
      title: "פיתוי מינוף",
      text: ["בנק מציע לך מינוף ללילה.", "רווח גדול או בור גדול."],
      bullets: ["סיכון גבוה מאוד"],
      choices: [
        {
          id: "a",
          label: "לקחת מינוף",
          result: "קפצת גבוה. זה יכול להכאיב מהר.",
          effects: { money: 10000, investments: 6, stress: 7, exposure: 5 },
          flags: { set: ["highRiskMode", "legalRisk"] },
          clues: ["c027"]
        },
        {
          id: "b",
          label: "מינוף קטן עם גבול",
          result: "הרווח נמוך יותר אבל אתה עוד שולט.",
          effects: { money: 3600, investments: 3, stress: 2, exposure: 1 }
        },
        {
          id: "c",
          label: "לא לגעת",
          result: "פספסת הזדמנות, שמרת על הראש.",
          effects: { stress: -2, trust: 1 }
        }
      ]
    },
    {
      id: "property_first",
      minTurn: 14,
      maxTurn: 120,
      tags: ["property"],
      title: "דירה קטנה למכירה",
      text: ["יש דירה במחיר טוב יחסית.", "צריך להחליט מהר."],
      bullets: ["נכס לטווח ארוך", "חוב קצר טווח"],
      choices: [
        {
          id: "a",
          label: "לקנות עם הון עצמי",
          result: "קנית נכס בלי חוב גדול.",
          effects: { money: -90000, assets: 120000, family: 5, reputation: 3 },
          clues: ["c016"]
        },
        {
          id: "b",
          label: "לקנות עם הלוואה",
          result: "קנית, אבל נכנסת לחוב חודשי.",
          effects: { money: -25000, assets: 140000, debts: 85000, stress: 4, family: 4 },
          flags: { set: ["legalRisk"] }
        },
        {
          id: "c",
          label: "לוותר",
          result: "שמעת לעצמך. אולי עוד תצטער.",
          effects: { stress: -1, cashflow: 1 }
        }
      ]
    },
    {
      id: "property_tenant",
      minTurn: 20,
      maxTurn: 120,
      tags: ["property"],
      title: "דייר עושה בעיות",
      text: ["הדייר לא שילם חודש.", "הוא גם מאיים ללכלך עליך."],
      bullets: ["כסף תקוע", "תדמית בסיכון"],
      requiresAnyFlag: ["businessOpened"],
      choices: [
        {
          id: "a",
          label: "לתת עוד זמן",
          result: "הרווחת שקט קצר.",
          effects: { money: -2500, stress: 2, family: -1 }
        },
        {
          id: "b",
          label: "ללכת לעורך דין",
          result: "דרך יקרה, אבל מסודרת.",
          effects: { money: -4000, trust: 2, exposure: -1 },
          clues: ["c040"]
        },
        {
          id: "c",
          label: "ללחוץ עליו חזק",
          result: "הוא נבהל. גם התחיל לדבר.",
          effects: { money: 1500, exposure: 5, reputation: -3, stress: 4 },
          clues: ["c029"]
        }
      ]
    },
    {
      id: "family_call",
      minTurn: 1,
      maxTurn: 120,
      tags: ["family"],
      title: "שיחה מהבית",
      text: ["מבקשים ממך כסף דחוף.", "אם לא תעזור, זה יתפוצץ."],
      bullets: ["לב מול מספרים"],
      choices: [
        {
          id: "a",
          label: "להעביר כסף",
          result: "הבית נרגע. העסק לוחץ.",
          effects: { money: -3000, family: 7, stress: 2, cashflow: -2 },
          flags: { set: ["familyNeedCash"] },
          clues: ["c020"]
        },
        {
          id: "b",
          label: "להגיד שאין עכשיו",
          result: "חסכת כסף. הבית נפגע.",
          effects: { family: -6, stress: 5, trust: -2 }
        },
        {
          id: "c",
          label: "לבקש עזרה ממאיה",
          result: "היא עזרה מהר. זה קרב ביניכם.",
          effects: { relationship: 6, exposure: 4, trust: -2 },
          clues: ["c030"]
        }
      ]
    },
    {
      id: "family_school",
      minTurn: 24,
      maxTurn: 120,
      tags: ["family"],
      title: "תשלום לבית ספר",
      text: ["הגיע חיוב גדול מהמסגרת של הילד.", "זה לא יכול לחכות."],
      bullets: ["עומס חודשי"],
      requiresFlagsAll: ["hasKids"],
      choices: [
        {
          id: "a",
          label: "לשלם מלא",
          result: "שילמת בזמן. הלחץ ירד בבית.",
          effects: { money: -4200, family: 6, stress: -1 }
        },
        {
          id: "b",
          label: "לבקש פריסה",
          result: "קיבלת פריסה, אבל זה ילווה אותך.",
          effects: { debts: 3000, family: -2, stress: 3 },
          clues: ["c041"]
        },
        {
          id: "c",
          label: "לדחות ולסגור בעבודה",
          result: "הבית הבין מה הבנת קודם: אתה לא שם.",
          effects: { family: -7, trust: -4, reputation: 2, stress: 5 },
          clues: ["c044"]
        }
      ]
    },
    {
      id: "romance_message",
      minTurn: 10,
      maxTurn: 120,
      tags: ["romance"],
      title: "הודעה ממאיה בלילה",
      text: ["\"אתה ער?\"", "הטלפון שלך על השולחן בבית."],
      bullets: ["צעד קטן יכול להיות גדול"],
      choices: [
        {
          id: "a",
          label: "לענות ולהמשיך לדבר",
          result: "השיחה התחממה מהר.",
          effects: { relationship: 8, exposure: 4, stress: 2 },
          flags: { set: ["lateNightPattern"] },
          clues: ["c003", "c013"],
          suspicion: 7
        },
        {
          id: "b",
          label: "לענות קצר ולעצור",
          result: "שמרת גבול דק.",
          effects: { relationship: 3, exposure: 1, stress: 1 }
        },
        {
          id: "c",
          label: "לא לענות",
          result: "נשאר שקט. לא נעים.",
          effects: { relationship: -2, trust: 1 }
        }
      ]
    },
    {
      id: "romance_meeting",
      minTurn: 16,
      maxTurn: 120,
      tags: ["romance"],
      title: "פגישה פרטית במשרד",
      text: ["הדלת נסגרת מאחוריכם.", "המרחק ביניכם קצר מדי."],
      bullets: ["הכול יכול לצאת משליטה"],
      choices: [
        {
          id: "a",
          label: "לשמור מקצועי",
          result: "עצרת בזמן.",
          effects: { trust: 3, relationship: -1, stress: 1 }
        },
        {
          id: "b",
          label: "להתקרב עוד",
          result: "המתח נהיה אמיתי.",
          effects: { relationship: 11, exposure: 7, stress: 3 },
          flags: { set: ["affairActive", "isDating"] },
          clues: ["c019", "c025"],
          suspicion: 12
        },
        {
          id: "c",
          label: "לצאת כי זה מסוכן",
          result: "יצאת. הלב נשאר בפנים.",
          effects: { relationship: 2, stress: 3, trust: 1 }
        }
      ]
    }
  ];

  const EXTRA_SCENARIOS = [
    {
      id: "romance_trip",
      minTurn: 28,
      maxTurn: 120,
      tags: ["romance"],
      title: "נסיעת עבודה מחוץ לעיר",
      text: ["המלון הוזמן לשניכם.", "אף אחד מהבית לא יודע את כל הפרטים."],
      bullets: ["סיכון גבוה"],
      choices: [
        {
          id: "a",
          label: "להישאר בחדר לבד",
          result: "שמרת קו. היה קשה.",
          effects: { stress: 2, trust: 2, relationship: -1 }
        },
        {
          id: "b",
          label: "לרדת לבר לשיחה ארוכה",
          result: "הגבול זז עוד קצת.",
          effects: { relationship: 10, exposure: 8, stress: 4 },
          flags: { set: ["affairActive", "lateNightPattern"] },
          clues: ["c025", "c033"],
          suspicion: 14
        },
        {
          id: "c",
          label: "לבטל נסיעה ולחזור הביתה",
          result: "איבדת עסקה, הרווחת אוויר בבית.",
          effects: { money: -2500, family: 4, trust: 3, relationship: -2 }
        }
      ]
    },
    {
      id: "jealous_phone",
      minTurn: 30,
      maxTurn: 120,
      tags: ["romance", "family"],
      title: "הטלפון רטט בזמן ארוחת ערב",
      text: ["המסך נדלק: \"מאיה\".", "כולם ראו."],
      bullets: ["רגע אחד לא נכון"],
      requiresAnyFlag: ["isDating", "isMarried"],
      choices: [
        {
          id: "a",
          label: "להפוך את המסך ולהמשיך",
          result: "זה לא עבר חלק.",
          effects: { trust: -5, family: -4, stress: 5 },
          clues: ["c014", "c028"],
          suspicion: 10
        },
        {
          id: "b",
          label: "לצאת ולענות בחוץ",
          result: "השיחה הייתה חמה. הבית שם לב.",
          effects: { relationship: 6, exposure: 6, trust: -4, stress: 4 },
          flags: { set: ["affairActive"] },
          clues: ["c022", "c042"],
          suspicion: 12
        },
        {
          id: "c",
          label: "לא לענות",
          result: "שמרת את הערב, אבל מאיה נפגעה.",
          effects: { relationship: -4, trust: 2, family: 2 }
        }
      ]
    },
    {
      id: "exposure_screenshot",
      minTurn: 18,
      maxTurn: 120,
      tags: ["exposure"],
      title: "צילום מסך רץ ברשת",
      text: ["מישהו העלה שיחה שלך.", "השם שלך מתחיל לרוץ."],
      bullets: ["זמן תגובה קצר"],
      choices: [
        {
          id: "a",
          label: "להגיב מהר עם הסבר",
          result: "עצר חלק מהאש.",
          effects: { exposure: -4, trust: 3, stress: 3, money: -1500 },
          clues: ["c015"]
        },
        {
          id: "b",
          label: "למחוק ולשתוק",
          result: "המחיקה יצרה עוד רעש.",
          effects: { exposure: 7, trust: -4, stress: 5 },
          clues: ["c029", "c035"]
        },
        {
          id: "c",
          label: "להפעיל עורך דין",
          result: "מהלך קשוח, יקר, אבל מרגיע חלקית.",
          effects: { money: -4200, exposure: -2, trust: 1, stress: 2 },
          flags: { set: ["legalRisk"] },
          clues: ["c011"]
        }
      ]
    },
    {
      id: "exposure_law_letter",
      minTurn: 35,
      maxTurn: 120,
      tags: ["exposure", "business"],
      title: "מכתב לפני תביעה",
      text: ["קיבלת מכתב אזהרה רשמי.", "יש 48 שעות להגיב."],
      bullets: ["אי אפשר להתעלם"],
      choices: [
        {
          id: "a",
          label: "להגיע לפשרה",
          result: "שילמת וסגרת זמנית.",
          effects: { money: -11000, exposure: -2, stress: 3 },
          clues: ["c043"]
        },
        {
          id: "b",
          label: "להילחם בבית משפט",
          result: "בחרת מלחמה.",
          effects: { money: -5000, stress: 8, trust: -2, reputation: -2 },
          flags: { set: ["investigationOpen", "legalRisk"] },
          clues: ["c031", "c040"]
        },
        {
          id: "c",
          label: "לנסות לעקוף בשקט",
          result: "זה נראה כמו טלאי מסוכן.",
          effects: { exposure: 6, trust: -5, stress: 6 },
          flags: { set: ["blackmailRisk"] },
          clues: ["c010"]
        }
      ]
    },
    {
      id: "business_expand",
      minTurn: 32,
      maxTurn: 120,
      tags: ["business"],
      title: "פתיחת סניף קטן",
      text: ["יש מקום פנוי במחיר טוב.", "זה יכול להקפיץ אותך או לשבור אותך."],
      bullets: ["צמיחה מול סיכון"],
      choices: [
        {
          id: "a",
          label: "לפתוח עכשיו",
          result: "פתחת מהר. כולם מסתכלים.",
          effects: { money: -28000, assets: 35000, cashflow: 7, reputation: 5, stress: 5 },
          flags: { set: ["businessOpened"] }
        },
        {
          id: "b",
          label: "לפתוח עם שותף",
          result: "חסכת כסף. ויתרת על שליטה.",
          effects: { money: -10000, cashflow: 5, trust: -2, reputation: 3 },
          flags: { set: ["partnerPressure", "businessOpened"] }
        },
        {
          id: "c",
          label: "לחכות עוד חודש",
          result: "נשארת זהיר.",
          effects: { stress: -2, cashflow: 1 }
        }
      ]
    },
    {
      id: "business_cash_crash",
      minTurn: 38,
      maxTurn: 120,
      tags: ["business"],
      title: "חור בתזרים",
      text: ["שלושה לקוחות לא שילמו.", "החודש עומד להיסגר באדום."],
      bullets: ["תשלום משכורות בסכנה"],
      choices: [
        {
          id: "a",
          label: "לקחת הלוואה קצרה",
          result: "קנית זמן בכסף יקר.",
          effects: { money: 14000, debts: 18000, stress: 5, cashflow: 4 },
          flags: { set: ["legalRisk"] },
          clues: ["c041"]
        },
        {
          id: "b",
          label: "לקצץ בשכר זמנית",
          result: "העסק שרד. הצוות כועס.",
          effects: { cashflow: 6, reputation: -3, trust: -3, stress: 3 }
        },
        {
          id: "c",
          label: "למכור ציוד",
          result: "נכנס מזומן מיידי.",
          effects: { money: 9000, assets: -7000, energy: -2, stress: 2 }
        }
      ]
    },
    {
      id: "family_move_in",
      minTurn: 26,
      maxTurn: 120,
      tags: ["family", "romance"],
      title: "מעבר לגור יחד",
      text: ["מאיה מציעה לגור יחד.", "זה רגע גדול וגם מפחיד."],
      bullets: ["יותר קרבה", "יותר אחריות"],
      requiresFlagsAll: ["isDating"],
      excludesFlags: ["isMarried"],
      choices: [
        {
          id: "a",
          label: "כן, עוברים",
          result: "הקשר עלה שלב.",
          effects: { relationship: 8, family: 8, money: -12000, stress: 2 },
          clues: ["c045"]
        },
        {
          id: "b",
          label: "עוד לא",
          result: "היא נפגעה, אבל הבינה חלקית.",
          effects: { relationship: -4, family: -2, stress: 2 }
        },
        {
          id: "c",
          label: "כן, אבל בסוד מהשותפים",
          result: "עברתם, אבל פתחת עוד סוד.",
          effects: { relationship: 6, family: 5, exposure: 5, stress: 4 },
          flags: { set: ["blackmailRisk"] },
          clues: ["c024"],
          suspicion: 8
        }
      ]
    },
    {
      id: "affair_blackmail",
      minTurn: 44,
      maxTurn: 120,
      tags: ["romance", "exposure"],
      title: "הודעה: יש לי הוכחה",
      text: ["מישהו שלח: \"יש לי תמונה שלך ושל מאיה\".", "הוא רוצה כסף."],
      bullets: ["סחיטה"],
      requiresFlagsAll: ["affairActive"],
      choices: [
        {
          id: "a",
          label: "לשלם ולסגור",
          result: "שילמת. אין הבטחה שזה נגמר.",
          effects: { money: -15000, stress: 6, exposure: -1 },
          flags: { set: ["blackmailRisk"] },
          clues: ["c001", "c033"]
        },
        {
          id: "b",
          label: "לאיים עליו",
          result: "הוא נבהל לרגע ואז דלף עוד חומר.",
          effects: { exposure: 8, stress: 7, trust: -4 },
          flags: { set: ["leakActive", "blackmailRisk"] },
          clues: ["c029"]
        },
        {
          id: "c",
          label: "לספר בבית לפני שזה יוצא",
          result: "זה כאב. אבל זה כבר לא סוד.",
          effects: { trust: -6, family: -5, exposure: -3, stress: 4 },
          flags: { set: ["affairSuspected", "breakupThreat"] },
          suspicion: -10
        }
      ]
    },
    {
      id: "rebuild_offer",
      minTurn: 52,
      maxTurn: 120,
      tags: ["rebuild"],
      title: "עבודה קטנה להצלה",
      text: ["יש פרויקט קטן אבל בטוח.", "לא נוצץ, כן יציב."],
      bullets: ["דרך חזרה איטית"],
      requiresStat: { moneyMax: 15000 },
      choices: [
        {
          id: "a",
          label: "לקחת ולחרוש",
          result: "הכניסה קטנה, אבל יציבה.",
          effects: { money: 8000, cashflow: 5, reputation: 3, energy: -3, stress: -2 },
          flags: { set: ["rebuiltAfterFall"] }
        },
        {
          id: "b",
          label: "לוותר ולחפש קפיצה",
          result: "שמרת זמן. כסף לא נכנס.",
          effects: { stress: 3, reputation: -1 }
        },
        {
          id: "c",
          label: "להביא את מאיה לפרויקט",
          result: "עבדתם צמוד. הקשר התחזק והעיניים גם.",
          effects: { money: 6500, relationship: 6, exposure: 4, trust: -2 },
          flags: { set: ["affairActive"] },
          suspicion: 8
        }
      ]
    },
    {
      id: "reputation_media",
      minTurn: 56,
      maxTurn: 120,
      tags: ["exposure", "business"],
      title: "ראיון פומבי",
      text: ["הציעו לך ראיון על הצלחה מהירה.", "גם שאלות קשות יבואו."],
      bullets: ["מוניטין יכול לקפוץ או ליפול"],
      choices: [
        {
          id: "a",
          label: "לעלות לראיון",
          result: "קיבלת חשיפה טובה, עם סיכון.",
          effects: { reputation: 7, exposure: 5, trust: 2, stress: 3 }
        },
        {
          id: "b",
          label: "לסרב בנימוס",
          result: "שמעת על עצמך פחות. נשארת בטוח יותר.",
          effects: { exposure: -2, reputation: 1, stress: -1 }
        },
        {
          id: "c",
          label: "לתאם מסרים עם מאיה בלילה",
          result: "הראיון עבר טוב מדי.",
          effects: { reputation: 6, relationship: 5, exposure: 7, trust: -3 },
          clues: ["c030", "c039"],
          suspicion: 6
        }
      ]
    },
    {
      id: "family_wedding",
      minTurn: 34,
      maxTurn: 120,
      tags: ["family"],
      title: "הצעה לחתונה",
      text: ["מאיה רוצה תשובה ברורה.", "להמשיך חצי חצי כבר לא עובד."],
      bullets: ["זה צעד גדול"],
      requiresFlagsAll: ["isDating"],
      excludesFlags: ["isMarried"],
      choices: [
        {
          id: "a",
          label: "כן, מתחתנים",
          result: "סגרת את זה ברור.",
          effects: { family: 10, trust: 6, money: -22000, stress: 2 },
          flags: { set: ["isMarried"] }
        },
        {
          id: "b",
          label: "עוד זמן",
          result: "נוצר סדק בקשר.",
          effects: { relationship: -6, family: -4, stress: 4 },
          flags: { set: ["breakupThreat"] }
        },
        {
          id: "c",
          label: "להתחמק עם הבטחות",
          result: "הרווחת שבוע. לא יותר.",
          effects: { trust: -5, relationship: -3, stress: 5 },
          clues: ["c006"]
        }
      ]
    },
    {
      id: "family_kids",
      minTurn: 48,
      maxTurn: 120,
      tags: ["family"],
      title: "שיחה על ילד",
      text: ["הבית רוצה לגדול.", "אתה יודע שזה גם כסף וגם זמן."],
      bullets: ["אחריות כבדה"],
      requiresFlagsAll: ["isMarried"],
      excludesFlags: ["hasKids"],
      choices: [
        {
          id: "a",
          label: "כן, הולכים על זה",
          result: "החיים נהיו אמיתיים יותר.",
          effects: { family: 12, stress: 4, money: -18000 },
          flags: { set: ["hasKids"] }
        },
        {
          id: "b",
          label: "לחכות שנה",
          result: "היא קיבלה. בקושי.",
          effects: { family: -2, relationship: -3, stress: 2 }
        },
        {
          id: "c",
          label: "לשנות נושא ולעבור לעבודה",
          result: "זה השאיר טעם רע בבית.",
          effects: { family: -6, trust: -4, reputation: 2, stress: 4 }
        }
      ]
    },
    {
      id: "invest_foreign",
      minTurn: 40,
      maxTurn: 120,
      tags: ["invest"],
      title: "חשבון השקעות זר",
      text: ["הציעו לך מסלול זר עם רווח מהיר.", "הבדיקה לא לגמרי נקייה."],
      bullets: ["כסף גדול", "גם סיכון משפטי"],
      choices: [
        {
          id: "a",
          label: "להיכנס",
          result: "נכנסת למסלול מהיר מאוד.",
          effects: { money: 18000, investments: 8, exposure: 7, stress: 5 },
          flags: { set: ["legalRisk", "highRiskMode"] },
          clues: ["c017", "c032"]
        },
        {
          id: "b",
          label: "לבדוק לעומק קודם",
          result: "זה עלה לך זמן, חסך סיכון.",
          effects: { energy: -4, stress: 2, trust: 2, exposure: -1 },
          clues: ["c023"]
        },
        {
          id: "c",
          label: "לסגור את זה",
          result: "ויתרת על רווח מהיר.",
          effects: { stress: -2, trust: 1 }
        }
      ]
    },
    {
      id: "business_investigation",
      minTurn: 58,
      maxTurn: 120,
      tags: ["business", "exposure"],
      title: "בדיקה רשמית",
      text: ["קיבלת הודעה על בדיקה בעסק.", "מבקשים מסמכים מייד."],
      bullets: ["אי אפשר לעכב"],
      choices: [
        {
          id: "a",
          label: "להגיש הכול",
          result: "כואב, אבל נקי.",
          effects: { trust: 5, stress: 4, money: -3500, exposure: -2 },
          flags: { set: ["investigationOpen"] }
        },
        {
          id: "b",
          label: "לסדר מסמכים מחדש",
          result: "נראה טוב מבחוץ. מסוכן מבפנים.",
          effects: { stress: 6, trust: -5, exposure: 5 },
          flags: { set: ["legalRisk", "investigationOpen"] },
          clues: ["c005", "c026"]
        },
        {
          id: "c",
          label: "להעביר לעורך דין",
          result: "העורך דין לקח שליטה.",
          effects: { money: -7200, stress: 3, trust: 2, exposure: -1 },
          clues: ["c040"]
        }
      ]
    },
    {
      id: "rebuild_sell",
      minTurn: 60,
      maxTurn: 120,
      tags: ["rebuild", "property"],
      title: "למכור נכס כדי לנשום",
      text: ["אין לך מרווח.", "מכירת נכס תחזיר אוויר."],
      bullets: ["כאב עכשיו מול הישרדות"],
      requiresStat: { debtsMin: 50000 },
      choices: [
        {
          id: "a",
          label: "למכור מהר",
          result: "נשמת. ויתרת על עתיד.",
          effects: { money: 42000, assets: -50000, debts: -22000, stress: -4 },
          flags: { set: ["rebuiltAfterFall"] }
        },
        {
          id: "b",
          label: "להחזיק ולסבול",
          result: "שמרת נכס, הלחץ קפץ.",
          effects: { stress: 8, cashflow: -5, family: -3 }
        },
        {
          id: "c",
          label: "לבקש עזרה מהבית",
          result: "קיבלת עזרה עם מחיר רגשי.",
          effects: { debts: -9000, family: -4, trust: -3, stress: 3 }
        }
      ]
    }
  ];

  const ALL_SCENARIOS = [...SCENARIOS, ...EXTRA_SCENARIOS];
  const CLUE_MAP = new Map(CLUES.map((clue) => [clue.id, clue]));
  const ENDING_MAP = new Map(ENDINGS.map((ending) => [ending.id, ending]));
  const ITEM_MAP = new Map(ITEM_CATALOG.map((item) => [item.id, item]));

  function createFlags() {
    return FLAG_KEYS.reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {});
  }

  function createInitialState() {
    return {
      phase: PHASES.HOME,
      tab: "story",
      turn: 1,
      week: 1,
      month: 1,
      freeMode: false,
      maxTurns: MAX_STANDARD_TURNS,
      stats: { ...INITIAL_STATS },
      flags: createFlags(),
      hidden: {
        suspicion: 0,
        danger: 0,
        dealContext: null,
        dealStep: null,
        pendingScenarioIds: []
      },
      currentScenario: null,
      resultPayload: null,
      history: [],
      clues: [],
      delayedQueue: [],
      lastMonthSummary: null,
      ownedItems: [],
      unlockedEndings: [],
      badges: [],
      endingId: null,
      theme: "dark"
    };
  }

  const state = createInitialState();

  const dom = {
    body: document.body,
    newGameBtn: document.getElementById("newGameBtn"),
    continueBtn: document.getElementById("continueBtn"),
    freeModeBtn: document.getElementById("freeModeBtn"),
    homeNewBtn: document.getElementById("homeNewBtn"),
    homeContinueBtn: document.getElementById("homeContinueBtn"),
    homeFreeBtn: document.getElementById("homeFreeBtn"),
    helpBtn: document.getElementById("helpBtn"),
    closeHelpBtn: document.getElementById("closeHelpBtn"),
    helpDialog: document.getElementById("helpDialog"),
    themeBtn: document.getElementById("themeBtn"),
    timeIndicator: document.getElementById("timeIndicator"),
    turnIndicator: document.getElementById("turnIndicator"),
    seasonIndicator: document.getElementById("seasonIndicator"),
    homeCard: document.getElementById("homeCard"),
    scenarioCard: document.getElementById("scenarioCard"),
    scenarioTitle: document.getElementById("scenarioTitle"),
    scenarioText: document.getElementById("scenarioText"),
    scenarioBullets: document.getElementById("scenarioBullets"),
    choicesBox: document.getElementById("choicesBox"),
    resultCard: document.getElementById("resultCard"),
    resultMain: document.getElementById("resultMain"),
    resultExtra: document.getElementById("resultExtra"),
    resultClue: document.getElementById("resultClue"),
    deltaBox: document.getElementById("deltaBox"),
    nextTurnBtn: document.getElementById("nextTurnBtn"),
    endingCard: document.getElementById("endingCard"),
    endingTitle: document.getElementById("endingTitle"),
    endingText: document.getElementById("endingText"),
    endingNewBtn: document.getElementById("endingNewBtn"),
    endingFreeBtn: document.getElementById("endingFreeBtn"),
    monthSummaryCard: document.getElementById("monthSummaryCard"),
    monthSummaryText: document.getElementById("monthSummaryText"),
    moneyLine: document.getElementById("moneyLine"),
    assetsLine: document.getElementById("assetsLine"),
    debtsLine: document.getElementById("debtsLine"),
    statsBars: document.getElementById("statsBars"),
    ownedList: document.getElementById("ownedList"),
    storeList: document.getElementById("storeList"),
    relationsList: document.getElementById("relationsList"),
    cluesList: document.getElementById("cluesList"),
    endingsGrid: document.getElementById("endingsGrid"),
    badgesGrid: document.getElementById("badgesGrid"),
    endingProgress: document.getElementById("endingProgress"),
    toastBox: document.getElementById("toastBox"),
    tabButtons: Array.from(document.querySelectorAll("[data-tab-btn]")),
    tabPanels: Array.from(document.querySelectorAll("[data-tab]"))
  };

  const SCENARIO_BY_ID = new Map(ALL_SCENARIOS.map((scenario) => [scenario.id, scenario]));

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pickRandom(arr) {
    if (!arr.length) return null;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function clampPercent(value) {
    return Math.max(0, Math.min(100, Math.round(value)));
  }

  function formatMoney(value) {
    return `₪${new Intl.NumberFormat("he-IL", { maximumFractionDigits: 0 }).format(Math.round(value))}`;
  }

  function seasonFromMonth(month) {
    const season = Math.min(4, Math.max(1, Math.floor((month - 1) / 6) + 1));
    return `עונה ${season}/4`;
  }

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (_) {
      return fallback;
    }
  }

  function writeJson(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  function applyTheme() {
    dom.body.setAttribute("data-theme", state.theme);
    dom.themeBtn.textContent = state.theme === "dark" ? "מצב: כהה" : "מצב: בהיר";
  }

  function saveMeta() {
    writeJson(STORAGE_KEYS.meta, {
      theme: state.theme,
      unlockedEndings: state.unlockedEndings,
      badges: state.badges
    });
  }

  function saveRun() {
    if (state.phase === PHASES.HOME || state.phase === PHASES.ENDED) return;
    writeJson(STORAGE_KEYS.run, {
      phase: state.phase,
      tab: state.tab,
      turn: state.turn,
      week: state.week,
      month: state.month,
      freeMode: state.freeMode,
      maxTurns: state.maxTurns,
      stats: state.stats,
      flags: state.flags,
      hidden: state.hidden,
      currentScenario: state.currentScenario,
      resultPayload: state.resultPayload,
      history: state.history,
      clues: state.clues,
      delayedQueue: state.delayedQueue,
      lastMonthSummary: state.lastMonthSummary,
      ownedItems: state.ownedItems,
      unlockedEndings: state.unlockedEndings,
      badges: state.badges,
      theme: state.theme
    });
  }

  function clearRun() {
    localStorage.removeItem(STORAGE_KEYS.run);
  }

  function loadAllStorage() {
    const meta = readJson(STORAGE_KEYS.meta, null);
    if (meta) {
      state.theme = meta.theme === "light" ? "light" : "dark";
      state.unlockedEndings = Array.isArray(meta.unlockedEndings) ? meta.unlockedEndings.filter((id) => ENDING_MAP.has(id)) : [];
      state.badges = Array.isArray(meta.badges) ? meta.badges.filter((id) => BADGES.some((badge) => badge.id === id)) : [];
    }

    const run = readJson(STORAGE_KEYS.run, null);
    if (!run) return;

    state.phase = run.phase === PHASES.RESULT ? PHASES.RESULT : PHASES.RUNNING;
    state.tab = TAB_IDS.includes(run.tab) ? run.tab : "story";
    state.turn = Number.isFinite(run.turn) ? run.turn : 1;
    state.week = Number.isFinite(run.week) ? run.week : 1;
    state.month = Number.isFinite(run.month) ? run.month : 1;
    state.freeMode = Boolean(run.freeMode);
    state.maxTurns = Number.isFinite(run.maxTurns) ? run.maxTurns : MAX_STANDARD_TURNS;
    state.stats = { ...INITIAL_STATS, ...(run.stats || {}) };
    state.flags = { ...createFlags(), ...(run.flags || {}) };
    state.hidden = {
      suspicion: 0,
      danger: 0,
      dealContext: null,
      dealStep: null,
      pendingScenarioIds: [],
      ...(run.hidden || {})
    };
    state.currentScenario = run.currentScenario || null;
    state.resultPayload = run.resultPayload || null;
    state.history = Array.isArray(run.history) ? run.history : [];
    state.clues = Array.isArray(run.clues) ? run.clues : [];
    state.delayedQueue = Array.isArray(run.delayedQueue) ? run.delayedQueue : [];
    state.lastMonthSummary = run.lastMonthSummary || null;
    state.ownedItems = Array.isArray(run.ownedItems) ? run.ownedItems.filter((itemId) => ITEM_MAP.has(itemId)) : [];
    if (Array.isArray(run.unlockedEndings)) {
      state.unlockedEndings = run.unlockedEndings.filter((id) => ENDING_MAP.has(id));
    }
    if (Array.isArray(run.badges)) {
      state.badges = run.badges.filter((id) => BADGES.some((badge) => badge.id === id));
    }
    if (run.theme === "light" || run.theme === "dark") {
      state.theme = run.theme;
    }
  }

  function resetRun(freeMode = false) {
    const savedEndings = [...state.unlockedEndings];
    const savedBadges = [...state.badges];
    const savedTheme = state.theme;
    Object.assign(state, createInitialState());
    state.unlockedEndings = savedEndings;
    state.badges = savedBadges;
    state.theme = savedTheme;
    state.phase = PHASES.RUNNING;
    state.freeMode = freeMode;
    state.maxTurns = freeMode ? 9999 : MAX_STANDARD_TURNS;

    if (freeMode) {
      state.stats.money += 8000;
      state.stats.reputation = clampPercent(state.stats.reputation + 10);
      state.stats.investments = clampPercent(state.stats.investments + 10);
    }

    state.currentScenario = buildNextScenario();
  }

  function unlockEnding(endingId) {
    if (!state.unlockedEndings.includes(endingId)) {
      state.unlockedEndings.push(endingId);
      saveMeta();
    }
  }

  function unlockBadge(badgeId) {
    if (!state.badges.includes(badgeId)) {
      state.badges.push(badgeId);
      showToast(`באג' חדש: ${BADGES.find((badge) => badge.id === badgeId)?.title || "חדש"}`);
      saveMeta();
    }
  }

  function getStatLabel(key) {
    const found = STAT_META.find((item) => item.key === key);
    return found ? found.label : key;
  }

  function showToast(text, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast ${type === "alert" ? "alert" : ""}`;
    toast.textContent = text;
    dom.toastBox.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
  }

  function setTab(tabId) {
    state.tab = TAB_IDS.includes(tabId) ? tabId : "story";
    renderTabs();
    saveRun();
  }

  function renderTabs() {
    dom.tabButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.tabBtn === state.tab);
    });
    dom.tabPanels.forEach((panel) => {
      panel.hidden = panel.dataset.tab !== state.tab;
    });
  }

  function renderTopLine() {
    dom.timeIndicator.textContent = `שבוע ${state.week}, חודש ${state.month}`;
    dom.turnIndicator.textContent = state.freeMode ? `תור ${state.turn}/חופשי` : `תור ${state.turn}/${state.maxTurns}`;
    dom.seasonIndicator.textContent = seasonFromMonth(state.month);
  }

  function renderStory() {
    const hasSave = Boolean(readJson(STORAGE_KEYS.run, null));
    const canFree = state.unlockedEndings.length > 0;

    dom.continueBtn.disabled = !hasSave || state.phase !== PHASES.HOME;
    dom.homeContinueBtn.disabled = !hasSave || state.phase !== PHASES.HOME;
    dom.freeModeBtn.hidden = !canFree || state.phase !== PHASES.HOME;
    dom.homeFreeBtn.hidden = !canFree || state.phase !== PHASES.HOME;
    dom.endingFreeBtn.hidden = !canFree;

    dom.homeCard.hidden = state.phase !== PHASES.HOME;
    dom.scenarioCard.hidden = state.phase !== PHASES.RUNNING && state.phase !== PHASES.RESULT;
    dom.resultCard.hidden = state.phase !== PHASES.RESULT;
    dom.endingCard.hidden = state.phase !== PHASES.ENDED;

    if (state.lastMonthSummary && (state.phase === PHASES.RESULT || state.phase === PHASES.RUNNING)) {
      dom.monthSummaryCard.hidden = false;
      dom.monthSummaryText.textContent = state.lastMonthSummary;
    } else {
      dom.monthSummaryCard.hidden = true;
      dom.monthSummaryText.textContent = "";
    }

    if (state.phase === PHASES.RUNNING || state.phase === PHASES.RESULT) {
      renderScenarioCard();
    }

    if (state.phase === PHASES.RESULT && state.resultPayload) {
      renderResultCard();
    }

    if (state.phase === PHASES.ENDED) {
      const ending = ENDING_MAP.get(state.endingId);
      dom.endingTitle.textContent = ending ? ending.title : "סיום";
      dom.endingText.textContent = ending ? ending.summary : "נגמר.";
    }
  }

  function renderScenarioCard() {
    if (!state.currentScenario) return;
    dom.scenarioTitle.textContent = state.currentScenario.title;
    dom.scenarioText.innerHTML = "";
    state.currentScenario.text.forEach((line) => {
      const p = document.createElement("p");
      p.textContent = line;
      dom.scenarioText.appendChild(p);
    });

    dom.scenarioBullets.innerHTML = "";
    (state.currentScenario.bullets || []).forEach((bullet) => {
      const li = document.createElement("li");
      li.textContent = bullet;
      dom.scenarioBullets.appendChild(li);
    });

    dom.choicesBox.innerHTML = "";
    state.currentScenario.choices.forEach((choice) => {
      const btn = document.createElement("button");
      btn.className = "choice-btn";
      btn.textContent = choice.label;
      btn.type = "button";
      btn.disabled = state.phase !== PHASES.RUNNING;
      btn.setAttribute("aria-label", `בחירה: ${choice.label}`);
      btn.addEventListener("click", () => handleChoice(choice.id));
      dom.choicesBox.appendChild(btn);
    });
  }

  function renderResultCard() {
    const payload = state.resultPayload;
    dom.resultMain.textContent = payload.main;

    dom.resultExtra.innerHTML = "";
    payload.lines.forEach((line) => {
      const li = document.createElement("li");
      li.textContent = line;
      dom.resultExtra.appendChild(li);
    });

    if (payload.newClues.length) {
      dom.resultClue.hidden = false;
      dom.resultClue.textContent = `רמז חדש: ${payload.newClues.map((clue) => clue.text).join(" | ")}`;
    } else {
      dom.resultClue.hidden = true;
      dom.resultClue.textContent = "";
    }

    dom.deltaBox.innerHTML = "";
    const changed = Object.entries(payload.delta).filter(([, value]) => value !== 0);
    if (!changed.length) {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = "לא היה שינוי גדול השבוע";
      dom.deltaBox.appendChild(chip);
      return;
    }

    changed.forEach(([key, value]) => {
      const chip = document.createElement("span");
      chip.className = `chip ${value > 0 ? "pos" : "neg"}`;
      const mark = value > 0 ? "+" : "";
      chip.textContent = `${getStatLabel(key)} ${mark}${value}`;
      dom.deltaBox.appendChild(chip);
    });
  }

  function renderStats() {
    dom.moneyLine.textContent = `כסף: ${formatMoney(state.stats.money)}`;
    dom.assetsLine.textContent = `נכסים: ${formatMoney(state.stats.assets)}`;
    dom.debtsLine.textContent = `חובות: ${formatMoney(state.stats.debts)}`;

    dom.statsBars.innerHTML = "";
    PERCENT_KEYS.forEach((key) => {
      const row = document.createElement("div");
      row.className = "bar-row";
      const label = document.createElement("label");
      label.textContent = getStatLabel(key);
      const val = document.createElement("span");
      val.textContent = `${state.stats[key]}`;
      label.appendChild(val);
      const bar = document.createElement("div");
      bar.className = "bar";
      const fill = document.createElement("span");
      fill.style.width = `${state.stats[key]}%`;
      bar.appendChild(fill);
      row.appendChild(label);
      row.appendChild(bar);
      dom.statsBars.appendChild(row);
    });
  }

  function renderAssets() {
    dom.ownedList.innerHTML = "";
    const owned = state.ownedItems.map((id) => ITEM_MAP.get(id)).filter(Boolean);

    if (!owned.length) {
      const empty = document.createElement("div");
      empty.className = "list-item";
      empty.textContent = "עוד לא קנית רכוש.";
      dom.ownedList.appendChild(empty);
    }

    owned.forEach((item) => {
      const card = document.createElement("div");
      card.className = "list-item";
      card.innerHTML = `<h4>${item.name}</h4><p>${item.note}</p><p>סיכון: ${item.risk}</p>`;

      const actions = document.createElement("div");
      actions.className = "inline-actions";
      const sellBtn = document.createElement("button");
      sellBtn.className = "btn";
      sellBtn.textContent = `למכור (${formatMoney(item.price * 0.75)})`;
      sellBtn.disabled = state.phase !== PHASES.RUNNING;
      sellBtn.addEventListener("click", () => sellItem(item.id));
      actions.appendChild(sellBtn);

      card.appendChild(actions);
      dom.ownedList.appendChild(card);
    });

    dom.storeList.innerHTML = "";
    ITEM_CATALOG.filter((item) => !state.ownedItems.includes(item.id)).forEach((item) => {
      const card = document.createElement("div");
      card.className = "list-item";
      card.innerHTML = `<h4>${item.name}</h4><p>${item.note}</p><p>מחיר: ${formatMoney(item.price)}</p><p>סיכון: ${item.risk}</p>`;

      const actions = document.createElement("div");
      actions.className = "inline-actions";
      const buyBtn = document.createElement("button");
      buyBtn.className = "btn btn-main";
      buyBtn.textContent = "לקנות";
      buyBtn.disabled = state.phase !== PHASES.RUNNING || state.stats.money < item.price;
      buyBtn.addEventListener("click", () => buyItem(item.id));
      actions.appendChild(buyBtn);

      card.appendChild(actions);
      dom.storeList.appendChild(card);
    });
  }

  function renderRelations() {
    dom.relationsList.innerHTML = "";

    const relationLevel = state.stats.relationship;
    let relationMood = "רחוק";
    if (relationLevel >= 70) relationMood = "קרוב מאוד";
    else if (relationLevel >= 45) relationMood = "קרוב";
    else if (relationLevel >= 25) relationMood = "פתוח";

    const houseMood =
      state.hidden.suspicion >= 75
        ? "הבית ממש חושד"
        : state.hidden.suspicion >= 45
          ? "הבית מרגיש שמשהו לא יושב"
          : "הבית שקט יחסית";

    const rows = [
      `${CHARACTERS.love}: קשר ${state.stats.relationship}/100 (${relationMood})`,
      `זוגיות רשמית: ${state.flags.isMarried ? "נשוי/ה" : state.flags.isDating ? "בזוגיות" : "לא רשמי"}`,
      `ילדים: ${state.flags.hasKids ? "יש" : "עדיין לא"}`,
      `רומן מהצד: ${state.flags.affairActive ? "פעיל" : "לא"}`,
      `מצב בבית: ${houseMood}`,
      `${CHARACTERS.rival}: ${state.flags.partnerPressure ? "לוחץ/ת עליך" : "שקט/ה כרגע"}`,
      `סיכון סחיטה: ${state.flags.blackmailRisk ? "כן" : "לא"}`
    ];

    rows.forEach((text) => {
      const li = document.createElement("li");
      li.className = "list-item";
      li.textContent = text;
      dom.relationsList.appendChild(li);
    });
  }

  function renderClues() {
    dom.cluesList.innerHTML = "";

    if (!state.clues.length) {
      const li = document.createElement("li");
      li.className = "list-item";
      li.textContent = "עוד אין רמזים.";
      dom.cluesList.appendChild(li);
      return;
    }

    const sorted = [...state.clues].sort((a, b) => b.discoveredAtTurn - a.discoveredAtTurn);
    sorted.forEach((clue) => {
      const li = document.createElement("li");
      li.className = "list-item";
      li.innerHTML = `<h4>${clue.text}</h4><p>${clue.category} | חומרה ${clue.severity} | תור ${clue.discoveredAtTurn}</p>`;
      dom.cluesList.appendChild(li);
    });
  }

  function renderEndings() {
    dom.endingProgress.textContent = `${state.unlockedEndings.length}/${ENDINGS.length}`;

    dom.endingsGrid.innerHTML = "";
    ENDINGS.forEach((ending) => {
      const card = document.createElement("div");
      const unlocked = state.unlockedEndings.includes(ending.id);
      card.className = `end-card ${unlocked ? "" : "locked"}`;
      card.innerHTML = unlocked
        ? `<h4>${ending.title}</h4><p>${ending.summary}</p>`
        : `<h4>נעול</h4><p>תנסה מסלול אחר.</p>`;
      dom.endingsGrid.appendChild(card);
    });

    dom.badgesGrid.innerHTML = "";
    BADGES.forEach((badge) => {
      const unlocked = state.badges.includes(badge.id);
      const card = document.createElement("div");
      card.className = `end-card ${unlocked ? "" : "locked"}`;
      card.innerHTML = unlocked
        ? `<h4>${badge.title}</h4><p>${badge.desc}</p>`
        : `<h4>נעול</h4><p>${badge.title}</p>`;
      dom.badgesGrid.appendChild(card);
    });
  }

  function renderAll() {
    applyTheme();
    renderTopLine();
    renderTabs();
    renderStory();
    renderStats();
    renderAssets();
    renderRelations();
    renderClues();
    renderEndings();
  }

  function applyEffects(effects, deltaBag) {
    if (!effects) return;

    Object.entries(effects).forEach(([key, raw]) => {
      if (!Object.prototype.hasOwnProperty.call(state.stats, key) || !Number.isFinite(raw)) return;

      const before = state.stats[key];
      let next = before + raw;

      if (PERCENT_KEYS.includes(key)) {
        next = clampPercent(next);
      } else if (key === "assets" || key === "debts") {
        next = Math.max(0, Math.round(next));
      } else {
        next = Math.round(next);
      }

      state.stats[key] = next;
      deltaBag[key] = (deltaBag[key] || 0) + (next - before);
    });
  }

  function setFlags(flagBlock) {
    if (!flagBlock) return;
    if (Array.isArray(flagBlock.set)) {
      flagBlock.set.forEach((flag) => {
        state.flags[flag] = true;
      });
    }
    if (Array.isArray(flagBlock.unset)) {
      flagBlock.unset.forEach((flag) => {
        state.flags[flag] = false;
      });
    }
  }

  function hasClue(clueId) {
    return state.clues.some((clue) => clue.id === clueId);
  }

  function addClue(clueId, resultPayload) {
    if (!CLUE_MAP.has(clueId) || hasClue(clueId)) return;
    const clue = CLUE_MAP.get(clueId);

    const discovered = {
      id: clue.id,
      text: clue.text,
      severity: clue.severity,
      category: clue.category,
      discoveredAtTurn: state.turn
    };

    state.clues.push(discovered);
    if (resultPayload) {
      resultPayload.newClues.push(discovered);
    }

    if (clue.category === "קשר" || clue.category === "חשיפה") {
      state.hidden.suspicion = clampPercent(state.hidden.suspicion + 2 + clue.severity);
    }
  }

  function scheduleDelayed(delayedList) {
    if (!Array.isArray(delayedList)) return;
    delayedList.forEach((event) => {
      if (!Number.isFinite(event.afterWeeks) || event.afterWeeks < 1) return;
      state.delayedQueue.push({
        weeksLeft: event.afterWeeks,
        effects: event.effects || {},
        revealText: event.revealText || "",
        clues: Array.isArray(event.clues) ? event.clues : [],
        flags: event.flags || null,
        suspicion: Number.isFinite(event.suspicion) ? event.suspicion : 0
      });
    });
  }

  function processDelayed(resultPayload) {
    if (!state.delayedQueue.length) return;

    const nextQueue = [];
    state.delayedQueue.forEach((event) => {
      event.weeksLeft -= 1;
      if (event.weeksLeft <= 0) {
        applyEffects(event.effects, resultPayload.delta);
        setFlags(event.flags);
        event.clues.forEach((clueId) => addClue(clueId, resultPayload));
        if (event.suspicion) {
          state.hidden.suspicion = clampPercent(state.hidden.suspicion + event.suspicion);
        }
        if (event.revealText) {
          resultPayload.lines.push(event.revealText);
        }
      } else {
        nextQueue.push(event);
      }
    });
    state.delayedQueue = nextQueue;
  }

  function scenarioIsAllowed(scenario) {
    if (state.turn < scenario.minTurn || state.turn > scenario.maxTurn) return false;

    if (Array.isArray(scenario.requiresFlagsAll) && !scenario.requiresFlagsAll.every((flag) => state.flags[flag])) {
      return false;
    }

    if (Array.isArray(scenario.requiresAnyFlag) && !scenario.requiresAnyFlag.some((flag) => state.flags[flag])) {
      return false;
    }

    if (Array.isArray(scenario.excludesFlags) && scenario.excludesFlags.some((flag) => state.flags[flag])) {
      return false;
    }

    if (scenario.requiresStat) {
      const r = scenario.requiresStat;
      if (Number.isFinite(r.moneyMin) && state.stats.money < r.moneyMin) return false;
      if (Number.isFinite(r.moneyMax) && state.stats.money > r.moneyMax) return false;
      if (Number.isFinite(r.debtsMin) && state.stats.debts < r.debtsMin) return false;
      if (Number.isFinite(r.debtsMax) && state.stats.debts > r.debtsMax) return false;
    }

    return true;
  }

  function shouldShowDeal() {
    return state.turn >= 8 && state.turn % 5 === 0 && !state.hidden.dealContext;
  }

  function shouldForceConfrontation() {
    return state.flags.affairSuspected && state.hidden.suspicion >= 78 && !state.flags.confrontationDone;
  }

  function shouldForceCaughtScene() {
    return state.flags.caughtCheating && !state.flags.caughtSceneDone;
  }

  function shouldForceDatingScene() {
    return !state.flags.isDating && state.stats.relationship >= 35 && state.turn >= 12 && !state.flags.dateSceneDone;
  }

  function buildDealPickScenario() {
    return {
      id: "special_deal_pick",
      title: "עסקה חדשה על השולחן",
      text: ["בחר סוג עסקה.", "בשבוע הבא תחליט אם לבדוק לעומק או לרוץ מהר."],
      bullets: ["בטוחה / בינונית / חמה"],
      choices: DEALS.map((deal) => ({
        id: `pick_${deal.id}`,
        label: `${deal.title} (${deal.line})`,
        result: `בחרת: ${deal.title}`,
        action: { type: "pickDeal", dealId: deal.id }
      }))
    };
  }

  function buildDealDueScenario() {
    const deal = DEALS.find((item) => item.id === state.hidden.dealContext?.dealId) || DEALS[0];
    return {
      id: "special_deal_due",
      title: `בדיקה לפני: ${deal.title}`,
      text: ["עוד רגע סוגרים.", "עכשיו אתה מחליט איך נכנסים."],
      bullets: ["בודק לעומק = יותר בטוח", "רץ מהר = יותר מסוכן"],
      choices: [
        {
          id: "due_deep",
          label: "בודק לעומק",
          result: "בדקת לעומק לפני סגירה.",
          action: { type: "dealDue", mode: "deep" }
        },
        {
          id: "due_fast",
          label: "רץ מהר",
          result: "סגרת מהר בלי בדיקה מלאה.",
          action: { type: "dealDue", mode: "fast" }
        }
      ]
    };
  }

  function buildDatingScene() {
    return {
      id: "special_date_offer",
      title: "מאיה רוצה תשובה",
      text: ["\"מה אנחנו?\" היא שואלת.", "אי אפשר להישאר באמצע."],
      bullets: ["צעד רגשי עם מחיר"],
      choices: [
        {
          id: "date_yes",
          label: "להגיד כן",
          result: "הפכתם לרשמיים.",
          effects: { relationship: 8, family: 4, stress: 1 },
          flags: { set: ["isDating", "dateSceneDone"] }
        },
        {
          id: "date_not_now",
          label: "עוד לא",
          result: "היא נעלבה.",
          effects: { relationship: -5, stress: 3 },
          flags: { set: ["dateSceneDone"] }
        }
      ]
    };
  }

  function buildConfrontScene() {
    return {
      id: "special_confront",
      title: "שיחה קשה בבית",
      text: ["הבית מרגיש שיש משהו מוסתר.", "אתה מול קיר."],
      bullets: ["פה נופלים או מצילים"],
      choices: [
        {
          id: "confess",
          label: "להגיד אמת חלקית",
          result: "האמת יצאה חלקית. זה כאב.",
          effects: { trust: -6, family: -4, stress: 3, exposure: -2 },
          flags: { set: ["affairSuspected", "confrontationDone"] },
          suspicion: -15
        },
        {
          id: "deny",
          label: "להכחיש הכול",
          result: "כרגע זה עבר. החשד נשאר.",
          effects: { trust: -8, stress: 5, exposure: 2 },
          flags: { set: ["breakupThreat", "confrontationDone"] },
          clues: ["c014", "c028"],
          suspicion: 10
        },
        {
          id: "attack",
          label: "לתקוף חזרה",
          result: "השיחה התפוצצה.",
          effects: { trust: -12, family: -10, stress: 8 },
          flags: { set: ["caughtCheating", "confrontationDone", "breakupThreat"] },
          suspicion: 12
        }
      ]
    };
  }

  function buildCaughtScene() {
    return {
      id: "special_caught",
      title: "נתפסת",
      text: ["הכול יצא החוצה.", "הבית והעסק נפגעו יחד."],
      bullets: ["צריך לבחור איך לקום מפה"],
      choices: [
        {
          id: "caught_break",
          label: "להתנצל ולבקש עוד צ'אנס",
          result: "לא בטוח שיסלחו. אבל ניסית.",
          effects: { trust: -8, family: -6, stress: 6, relationship: -5 },
          flags: { set: ["caughtSceneDone", "breakupThreat"] }
        },
        {
          id: "caught_run",
          label: "לברוח לעבודה ולהסתתר",
          result: "ברחת לרעש של העסק.",
          effects: { family: -10, stress: 8, reputation: -3, money: 3000 },
          flags: { set: ["caughtSceneDone", "breakupThreat", "blackmailRisk"] }
        }
      ]
    };
  }

  function buildFallbackScenario() {
    return {
      id: "fallback_week",
      title: "שבוע שקט יחסית",
      text: ["אין דרמה גדולה השבוע.", "אבל צריך להמשיך לזוז."],
      bullets: ["כסף קטן או מנוחה קצרה"],
      choices: [
        {
          id: "a",
          label: "לעבוד חזק",
          result: "שבוע עבודה מלא.",
          effects: { money: 2500, energy: -3, stress: 2, cashflow: 1 }
        },
        {
          id: "b",
          label: "לתת לעצמך אוויר",
          result: "נחת קצת.",
          effects: { energy: 5, stress: -4, money: -600, family: 2 }
        }
      ]
    };
  }

  function buildNextScenario() {
    if (Array.isArray(state.hidden.pendingScenarioIds) && state.hidden.pendingScenarioIds.length) {
      const nextId = state.hidden.pendingScenarioIds.shift();
      const special = SCENARIO_BY_ID.get(nextId);
      if (special) return clone(special);
    }

    if (state.hidden.dealContext && state.hidden.dealStep === "picked") {
      state.hidden.dealStep = "due";
      return buildDealDueScenario();
    }

    if (shouldForceCaughtScene()) {
      return buildCaughtScene();
    }

    if (shouldForceConfrontation()) {
      return buildConfrontScene();
    }

    if (shouldForceDatingScene()) {
      return buildDatingScene();
    }

    if (shouldShowDeal()) {
      return buildDealPickScenario();
    }

    const recent = state.history.slice(0, 5).map((item) => item.scenarioId);
    const candidates = ALL_SCENARIOS.filter((scenario) => scenarioIsAllowed(scenario) && !recent.includes(scenario.id));

    if (!candidates.length) {
      return buildFallbackScenario();
    }

    return clone(pickRandom(candidates));
  }

  function applyChoiceAction(action, resultPayload) {
    if (!action || !action.type) return;

    if (action.type === "pickDeal") {
      state.hidden.dealContext = { dealId: action.dealId };
      state.hidden.dealStep = "picked";
      resultPayload.lines.push("בשבוע הבא תחליט אם לבדוק לעומק או לרוץ מהר.");
      return;
    }

    if (action.type === "dealDue") {
      const deal = DEALS.find((item) => item.id === state.hidden.dealContext?.dealId);
      if (!deal) return;

      let riskScore = deal.risk;
      if (action.mode === "deep") {
        riskScore -= 18;
        applyEffects({ energy: -5, stress: 2, money: -900 }, resultPayload.delta);
      } else {
        riskScore += 16;
        applyEffects({ energy: -2, stress: 4, exposure: 3 }, resultPayload.delta);
      }

      riskScore += Math.round(state.stats.stress * 0.12);
      riskScore += Math.round(state.stats.exposure * 0.1);
      riskScore -= Math.round(state.stats.investments * 0.18);
      riskScore = Math.max(8, Math.min(92, riskScore));

      const success = Math.random() * 100 > riskScore;
      if (success) {
        const gain = Math.round(deal.baseGain * (action.mode === "deep" ? 1 : 1.15));
        applyEffects({ money: gain, investments: 4, reputation: 2, cashflow: 2 }, resultPayload.delta);
        resultPayload.lines.push(`העסקה הצליחה והכניסה ${formatMoney(gain)}.`);
        addClue(deal.clueWin, resultPayload);
        state.flags.goodDealHit = true;
      } else {
        const loss = Math.round(deal.baseLoss * (action.mode === "deep" ? 0.9 : 1.2));
        applyEffects({ money: -loss, investments: -5, stress: 6, trust: -3 }, resultPayload.delta);
        if (state.stats.money < 0) {
          const addDebt = Math.abs(state.stats.money);
          state.stats.debts = Math.max(0, Math.round(state.stats.debts + addDebt));
        }
        resultPayload.lines.push(`העסקה התרסקה ושרפה ${formatMoney(loss)}.`);
        addClue(deal.clueLoss, resultPayload);
        state.flags.badDealHit = true;
      }

      state.hidden.dealContext = null;
      state.hidden.dealStep = null;
      return;
    }
  }

  function applyChoice(choice, resultPayload) {
    applyEffects(choice.effects || {}, resultPayload.delta);
    setFlags(choice.flags);

    if (Array.isArray(choice.clues)) {
      choice.clues.forEach((clueId) => addClue(clueId, resultPayload));
    }

    if (Array.isArray(choice.delayed)) {
      scheduleDelayed(choice.delayed);
    }

    if (Number.isFinite(choice.suspicion)) {
      state.hidden.suspicion = clampPercent(state.hidden.suspicion + choice.suspicion);
    }

    if (Array.isArray(choice.queueScenarioIds)) {
      state.hidden.pendingScenarioIds.push(...choice.queueScenarioIds);
    }

    applyChoiceAction(choice.action, resultPayload);
  }

  function maybeAddRandomEvent(resultPayload) {
    if (state.turn < 4 || state.turn % 2 !== 0) return;
    if (Math.random() > 0.55) return;

    const available = RANDOM_EVENTS.filter((event) => {
      if (Array.isArray(event.needsFlags) && !event.needsFlags.every((flag) => state.flags[flag])) return false;
      return true;
    });

    const event = pickRandom(available);
    if (!event) return;

    applyEffects(event.effects || {}, resultPayload.delta);
    setFlags(event.flags);
    (event.clues || []).forEach((clueId) => addClue(clueId, resultPayload));
    resultPayload.lines.push(`אירוע צד: ${event.text}`);
  }

  function runMonthlyCycle(resultPayload) {
    if (state.week % WEEKS_IN_MONTH !== 0) return;

    let income = Math.round((state.stats.cashflow * 70) + (state.stats.reputation * 45));
    if (state.flags.businessOpened) {
      income += 4500;
    }

    const marketRoll = randInt(-12, 12);
    const investFlow = Math.round((state.stats.investments * 95) + marketRoll * 220);

    let familyCost = 1800;
    if (state.flags.isDating) familyCost += 900;
    if (state.flags.isMarried) familyCost += 2200;
    if (state.flags.hasKids) familyCost += 3800;
    if (state.flags.familyNeedCash) familyCost += 1200;

    let debtPay = 0;
    if (state.stats.debts > 0) {
      debtPay = Math.min(Math.max(1500, Math.round(state.stats.debts * 0.05)), state.stats.debts);
      state.stats.debts = Math.max(0, Math.round(state.stats.debts - debtPay));
    }

    let monthlyItemMoney = 0;
    state.ownedItems.forEach((itemId) => {
      const item = ITEM_MAP.get(itemId);
      if (!item) return;
      const monthly = item.monthly || {};
      monthlyItemMoney += Number.isFinite(monthly.money) ? monthly.money : 0;
      applyEffects({ ...monthly, money: 0 }, resultPayload.delta);
      if (item.risk === "גבוה" && Math.random() < 0.18) {
        addClue(pickRandom(["c002", "c024", "c035", "c042"]), resultPayload);
      }
    });

    const monthDelta = income + investFlow + monthlyItemMoney - familyCost - debtPay;
    applyEffects({ money: monthDelta }, resultPayload.delta);

    if (state.stats.money < 0) {
      const needDebt = Math.abs(state.stats.money);
      state.stats.debts += needDebt;
      state.stats.money = 0;
      applyEffects({ stress: 6, trust: -2, cashflow: -3 }, resultPayload.delta);
      resultPayload.lines.push("לא היה מספיק כסף. חלק עבר לחוב.");
    }

    const summary = `החודש: הכנסה ${formatMoney(income)} + השקעות ${formatMoney(investFlow)} + רכוש ${formatMoney(monthlyItemMoney)} - בית ${formatMoney(familyCost)} - חוב ${formatMoney(debtPay)}.`;
    state.lastMonthSummary = summary;
    resultPayload.lines.push(summary);

    if (state.flags.familyNeedCash && Math.random() < 0.35) {
      state.flags.familyNeedCash = false;
    }
  }

  function checkSuspicionAndConsequences(resultPayload) {
    if (state.flags.affairActive && (state.flags.isDating || state.flags.isMarried)) {
      state.hidden.suspicion = clampPercent(state.hidden.suspicion + 2);
    }

    if (state.hidden.suspicion >= 60 && !state.flags.affairSuspected) {
      state.flags.affairSuspected = true;
      showToast("האווירה בבית מתוחה. יש חשד.", "alert");
      resultPayload.lines.push("הבית מתחיל לחשוד ברצינות.");
    }

    if (state.hidden.suspicion >= 88 && state.flags.affairActive && !state.flags.caughtCheating) {
      state.flags.caughtCheating = true;
      showToast("מישהו תפס את הסיפור שלך.", "alert");
      resultPayload.lines.push("זהו. כבר אי אפשר להסתיר.");
    }

    if (state.hidden.suspicion >= 70 && !state.flags.caughtCheating) {
      unlockBadge("badge_almost_caught");
    }
  }

  function updateDangerMeter() {
    let dangerHit = 0;
    if (state.stats.money < -20000) dangerHit += 1;
    if (state.stats.debts > 90000) dangerHit += 1;
    if (state.stats.stress > 92) dangerHit += 1;
    if (state.stats.energy < 10) dangerHit += 1;
    if (state.stats.exposure > 88) dangerHit += 1;

    if (dangerHit >= 2) {
      state.hidden.danger = Math.min(7, state.hidden.danger + 1);
    } else {
      state.hidden.danger = Math.max(0, state.hidden.danger - 1);
    }
  }

  function maybeShowWarnings() {
    const checks = [
      { key: "m1", active: state.stats.money < 0, text: "אזהרה: אתה במינוס" },
      { key: "m2", active: state.stats.cashflow < 25, text: "אזהרה: תזרים נמוך" },
      { key: "m3", active: state.stats.stress > 85, text: "הלחץ קופץ גבוה" },
      { key: "m4", active: state.stats.exposure > 75, text: "הרבה אנשים כבר יודעים עליך" },
      { key: "m5", active: state.stats.trust < 25, text: "כמעט לא סומכים עליך" },
      { key: "m6", active: state.stats.relationship > 80, text: "הקשר חזק ומסוכן" }
    ];

    if (!state.hidden.warnState) {
      state.hidden.warnState = {};
    }

    checks.forEach((check) => {
      if (check.active && !state.hidden.warnState[check.key]) {
        showToast(check.text, "alert");
      }
      state.hidden.warnState[check.key] = check.active;
    });
  }

  function checkEnding(forced = false) {
    if (state.freeMode) return null;

    if (state.turn < 60 && !forced) {
      if (state.hidden.danger >= 4) {
        if (state.stats.stress >= 98 || state.stats.energy <= 2) return "burnout";
        if (state.stats.money < -45000 && state.stats.debts > 100000) return "collapse";
        if (state.stats.exposure > 95 && state.flags.leakActive) return "scandal";
      }
      return null;
    }

    if (state.stats.money >= 180000 && state.stats.assets >= 280000 && state.stats.trust >= 60 && state.stats.exposure <= 55) return "cold_win";
    if (state.stats.family >= 80 && state.stats.trust >= 65 && !state.flags.affairActive) return "family_win";
    if (state.stats.exposure >= 90 && (hasClue("c001") || hasClue("c029"))) return "scandal";
    if (state.stats.money < -50000 && state.stats.debts > 120000 && state.stats.cashflow < 20) return "collapse";
    if (state.stats.stress >= 96 || state.stats.energy <= 3) return "burnout";
    if (state.flags.caughtCheating && state.stats.trust < 18) return "betrayal";
    if (state.flags.legalRisk && (hasClue("c031") || hasClue("c040")) && state.stats.exposure > 70) return "legal_trouble";
    if (state.flags.affairActive && !state.flags.caughtCheating && state.stats.relationship > 75 && state.hidden.suspicion < 55 && state.turn >= 90) return "double_life";
    if (state.flags.rebuiltAfterFall && state.stats.trust >= 55 && state.stats.debts < 20000 && state.turn >= 90) return "redemption";
    if (state.stats.reputation >= 75 && state.stats.cashflow >= 70 && state.stats.exposure < 45) return "quiet_money";
    if (state.stats.money > 250000 && state.stats.trust < 35 && state.stats.exposure > 60) return "dirty_rich";
    if (state.stats.reputation > 82 && state.stats.family < 35 && state.stats.relationship < 25) return "alone_top";
    if (state.stats.family > 70 && state.stats.money < 20000 && state.stats.debts < 30000) return "broke_home";
    if (state.flags.blackmailRisk && state.stats.exposure > 65) return "blackmail";
    if (state.flags.caughtCheating && state.flags.isMarried && state.stats.family < 30) return "divorce_public";
    if (!state.flags.isMarried && state.stats.relationship >= 80 && state.stats.trust >= 55 && !state.flags.affairActive) return "second_chance";
    if (state.stats.assets > 400000 && state.stats.reputation > 80 && state.stats.cashflow > 75) return "business_empire";
    if (state.flags.affairSuspected && !state.flags.caughtCheating && state.stats.stress > 80 && state.stats.exposure < 60) return "hidden_fire";
    if (state.flags.investigationOpen && !state.flags.legalRisk && state.stats.trust > 55) return "law_clear";

    if (forced || state.turn >= state.maxTurns) return "long_run";
    return null;
  }

  function evaluateBadges() {
    if (state.ownedItems.includes("item_small_apartment")) unlockBadge("badge_first_apartment");
    if (state.flags.goodDealHit) unlockBadge("badge_good_invest");
    if (state.flags.isMarried) unlockBadge("badge_wedding");
    if (state.flags.businessOpened || state.ownedItems.includes("item_business")) unlockBadge("badge_first_business");
    if (state.flags.rebuiltAfterFall && state.stats.money > 40000) unlockBadge("badge_big_rebuild");
    if (state.flags.affairActive && state.hidden.suspicion < 40 && state.turn > 70) unlockBadge("badge_secret_master");
    if (state.flags.investigationOpen && !state.flags.legalRisk && state.turn > 80) unlockBadge("badge_legal_escape");
  }

  function handleChoice(choiceId) {
    if (state.phase !== PHASES.RUNNING || !state.currentScenario) return;

    const choice = state.currentScenario.choices.find((item) => item.id === choiceId);
    if (!choice) return;

    const resultPayload = {
      main: choice.result || "שבוע עבר.",
      lines: [],
      newClues: [],
      delta: {},
      endingId: null
    };

    processDelayed(resultPayload);
    applyChoice(choice, resultPayload);
    maybeAddRandomEvent(resultPayload);
    runMonthlyCycle(resultPayload);
    checkSuspicionAndConsequences(resultPayload);
    updateDangerMeter();
    maybeShowWarnings();

    state.history.unshift({
      turn: state.turn,
      scenarioId: state.currentScenario.id,
      title: state.currentScenario.title,
      choiceLabel: choice.label
    });
    state.history = state.history.slice(0, 40);

    evaluateBadges();

    const endingId = checkEnding(false);
    if (endingId) {
      resultPayload.endingId = endingId;
    } else if (!state.freeMode && state.turn >= state.maxTurns) {
      resultPayload.endingId = checkEnding(true);
    }

    state.resultPayload = resultPayload;
    state.phase = PHASES.RESULT;
    saveRun();
    renderAll();
  }

  function finalizeEnding(endingId) {
    const finalId = ENDING_MAP.has(endingId) ? endingId : "long_run";
    state.endingId = finalId;
    state.phase = PHASES.ENDED;
    state.resultPayload = null;
    unlockEnding(finalId);
    clearRun();
    saveMeta();
    renderAll();
  }

  function goNextTurn() {
    if (state.phase !== PHASES.RESULT) return;

    if (state.resultPayload?.endingId) {
      finalizeEnding(state.resultPayload.endingId);
      return;
    }

    state.turn += 1;
    state.week += 1;
    state.month = Math.floor((state.week - 1) / WEEKS_IN_MONTH) + 1;

    state.phase = PHASES.RUNNING;
    state.resultPayload = null;

    if (!state.freeMode && state.turn > state.maxTurns) {
      finalizeEnding(checkEnding(true));
      return;
    }

    state.currentScenario = buildNextScenario();
    saveRun();
    renderAll();
  }

  function buyItem(itemId) {
    if (state.phase !== PHASES.RUNNING) return;
    const item = ITEM_MAP.get(itemId);
    if (!item || state.ownedItems.includes(itemId)) return;
    if (state.stats.money < item.price) {
      showToast("אין לך מספיק כסף", "alert");
      return;
    }

    state.ownedItems.push(itemId);
    applyEffects({ money: -item.price, assets: item.price }, {});

    if (itemId === "item_business") {
      state.flags.businessOpened = true;
    }

    if (itemId === "item_small_apartment") {
      unlockBadge("badge_first_apartment");
    }

    showToast(`קנית: ${item.name}`);
    evaluateBadges();
    saveRun();
    renderAll();
  }

  function sellItem(itemId) {
    if (state.phase !== PHASES.RUNNING) return;
    const item = ITEM_MAP.get(itemId);
    if (!item) return;

    state.ownedItems = state.ownedItems.filter((id) => id !== itemId);
    applyEffects({ money: Math.round(item.price * 0.75), assets: -item.price }, {});

    showToast(`מכרת: ${item.name}`);
    saveRun();
    renderAll();
  }

  function startNewGame() {
    clearRun();
    resetRun(false);
    saveRun();
    renderAll();
  }

  function startFreeMode() {
    if (!state.unlockedEndings.length) return;
    clearRun();
    resetRun(true);
    saveRun();
    renderAll();
  }

  function continueGame() {
    const run = readJson(STORAGE_KEYS.run, null);
    if (!run) return;
    loadAllStorage();

    if (state.phase !== PHASES.RUNNING && state.phase !== PHASES.RESULT) {
      state.phase = PHASES.RUNNING;
    }

    if (!state.currentScenario) {
      state.currentScenario = buildNextScenario();
    }

    renderAll();
  }

  function goHome() {
    state.phase = PHASES.HOME;
    state.currentScenario = null;
    state.resultPayload = null;
    state.endingId = null;
    renderAll();
  }

  function bindEvents() {
    dom.newGameBtn.addEventListener("click", startNewGame);
    dom.homeNewBtn.addEventListener("click", startNewGame);
    dom.continueBtn.addEventListener("click", continueGame);
    dom.homeContinueBtn.addEventListener("click", continueGame);
    dom.freeModeBtn.addEventListener("click", startFreeMode);
    dom.homeFreeBtn.addEventListener("click", startFreeMode);
    dom.endingFreeBtn.addEventListener("click", startFreeMode);
    dom.endingNewBtn.addEventListener("click", startNewGame);
    dom.nextTurnBtn.addEventListener("click", goNextTurn);

    dom.helpBtn.addEventListener("click", () => dom.helpDialog.showModal());
    dom.closeHelpBtn.addEventListener("click", () => dom.helpDialog.close());

    dom.themeBtn.addEventListener("click", () => {
      state.theme = state.theme === "dark" ? "light" : "dark";
      saveMeta();
      saveRun();
      renderAll();
    });

    dom.tabButtons.forEach((button) => {
      button.addEventListener("click", () => setTab(button.dataset.tabBtn));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && dom.helpDialog.open) dom.helpDialog.close();
    });

    dom.endingCard.addEventListener("dblclick", goHome);
  }

  function init() {
    loadAllStorage();
    bindEvents();

    if (state.phase === PHASES.RUNNING || state.phase === PHASES.RESULT) {
      if (!state.currentScenario) state.currentScenario = buildNextScenario();
    } else {
      state.phase = PHASES.HOME;
    }

    renderAll();
  }

  init();
})();
