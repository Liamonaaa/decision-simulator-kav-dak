(() => {
  "use strict";

  const STORAGE_KEYS = { run: "kav_dak_run_v8", meta: "kav_dak_meta_v8" };
  const PHASES = { HOME: "HOME", RUNNING: "RUNNING", RESULT: "RESULT", ENDED: "ENDED" };
  const MAX_ACTION_POINTS = 3;
  const WEEKS_IN_MONTH = 4;
  const MIN_NORMAL_ENDING_WEEK = 60;
  const MAX_WEEKS = 120;

  const NAME_POOLS = {
    male: ["אורי", "נועם", "יואב", "איתן", "רון", "עידו", "ליאור", "תומר", "גיא", "דניאל", "ברק", "עומר", "אלון", "יותם", "רועי", "אסף", "ניב", "שחר", "עומרי", "עמית"],
    female: ["מאיה", "נועה", "תמר", "יעל", "איילת", "שירה", "רותם", "מיכל", "ליה", "אופיר", "גל", "אדוה", "רוני", "הילה", "דנה", "נטע", "ספיר", "מור", "קרן", "יולי"],
    neutral: ["שי", "לי", "טל", "בר", "חן", "עדי", "סתיו", "אור", "יובל", "אריאל"]
  };

  const TRAITS = [
    { id: "impulsive", label: "אימפולסיבי", bonus: { riskBias: 12, romanceBias: 4 } },
    { id: "calculated", label: "מחושב", bonus: { riskBias: -10, workBias: 5 } },
    { id: "romantic", label: "רומנטי", bonus: { romanceBias: 10, trustBias: 4 } },
    { id: "cold", label: "קר", bonus: { romanceBias: -8, stressBias: -3 } },
    { id: "ambitious", label: "שאפתן", bonus: { workBias: 10, stressBias: 4 } },
    { id: "loyal", label: "נאמן", bonus: { affairBias: -14, trustBias: 8 } }
  ];

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
    reputation: 45,
    health: 72,
    social: 44,
    mood: 52
  };

  const STAT_LABELS = {
    money: "כסף",
    cashflow: "תזרים",
    investments: "השקעות",
    assets: "נכסים",
    debts: "חובות",
    energy: "אנרגיה",
    stress: "לחץ",
    exposure: "כמה יודעים עליך",
    trust: "כמה סומכים עליך",
    relationship: "קשר",
    family: "בית/משפחה",
    reputation: "מוניטין",
    health: "בריאות",
    social: "חברה",
    mood: "מצב רוח"
  };

  const BAR_KEYS = ["cashflow", "investments", "energy", "stress", "exposure", "trust", "relationship", "family", "reputation", "health", "social", "mood"];
  const PERCENT_KEYS = new Set(BAR_KEYS);

  const ASSET_CATALOG = {
    apartment: { id: "apartment", name: "דירה", value: 320000, upkeep: 1400, monthlyCashflow: 0, reputation: 4 },
    car: { id: "car", name: "רכב", value: 55000, upkeep: 900, monthlyCashflow: 0, reputation: 2 },
    renovation: { id: "renovation", name: "שיפוץ", value: 45000, upkeep: 300, monthlyCashflow: 600, reputation: 3 },
    rental_unit: { id: "rental_unit", name: "דירה להשכרה", value: 420000, upkeep: 1700, monthlyCashflow: 2800, reputation: 5 },
    office: { id: "office", name: "משרד", value: 160000, upkeep: 1900, monthlyCashflow: 1200, reputation: 4 }
  };

  const ACTIONS = [
    { id: "invest_safe", group: "financial", label: "להשקיע זהיר", hint: "סיכון נמוך" },
    { id: "invest_risky", group: "financial", label: "להשקיע מסוכן", hint: "רווח או מכה" },
    { id: "crypto_spec", group: "financial", label: "ספקולציה מהירה", hint: "זז חזק" },
    { id: "take_loan", group: "financial", label: "לקחת הלוואה", hint: "כסף עכשיו" },
    { id: "repay_debt", group: "financial", label: "להחזיר חוב", hint: "מוריד לחץ" },
    { id: "open_business", group: "financial", label: "לפתוח עסק", hint: "יקר בהתחלה" },

    { id: "search_job", group: "work", label: "לחפש עבודה", hint: "עוד אפשרויות" },
    { id: "ask_raise", group: "work", label: "לבקש קידום", hint: "סיכוי מול סיכון" },
    { id: "switch_job", group: "work", label: "להחליף עבודה", hint: "ריסט בקריירה" },
    { id: "overtime", group: "work", label: "לעבוד שעות נוספות", hint: "עוד כסף" },
    { id: "neglect_work", group: "work", label: "להזניח עבודה", hint: "מסוכן" },
    { id: "take_vacation_from_work", group: "work", label: "לקחת הפסקה קצרה", hint: "מנוחה מול ביצועים" },

    { id: "romantic_message", group: "relationship", label: "לשלוח הודעה רומנטית", hint: "מקרב" },
    { id: "private_meeting", group: "relationship", label: "לקבוע פגישה פרטית", hint: "טוב או מסוכן" },
    { id: "ask_commitment", group: "relationship", label: "לשאול על מחויבות", hint: "רגע כנה" },
    { id: "move_in", group: "relationship", label: "להציע לגור יחד", hint: "צעד גדול" },
    { id: "propose_marriage", group: "relationship", label: "להציע נישואין", hint: "אין דרך חזרה" },
    { id: "try_kid", group: "relationship", label: "לנסות להביא ילד", hint: "מעלה הימור" },

    { id: "open_relationship", group: "intimacy", label: "להציע לפתוח את הקשר", hint: "דורש אמון" },
    { id: "propose_threesome", group: "intimacy", label: "להציע שלישייה", hint: "רגיש מאוד" },
    { id: "initiate_intimacy", group: "intimacy", label: "ליזום אינטימיות", hint: "קרוב ומורכב" },
    { id: "stay_night", group: "intimacy", label: "להישאר ללילה", hint: "טעון" },
    { id: "break_boundary", group: "intimacy", label: "לנתק גבול", hint: "מסוכן" },
    { id: "stay_professional", group: "intimacy", label: "לשמור על מקצועיות", hint: "מוריד סיכון" },
    { id: "set_boundary", group: "intimacy", label: "לשים גבול", hint: "שומר על יציבות" },
    { id: "pull_back", group: "intimacy", label: "להתרחק", hint: "מוריד מתח" },

    { id: "start_affair", group: "affair", label: "להתחיל רומן", hint: "סיכון גבוה" },
    { id: "hide_affair", group: "affair", label: "להסתיר רומן", hint: "פחות חשיפה" },
    { id: "end_affair", group: "affair", label: "לסיים רומן", hint: "כואב אבל מרגיע" },

    { id: "exercise", group: "life", label: "לעשות ספורט", hint: "בריאות עולה" },
    { id: "sleep_early", group: "life", label: "לישון מוקדם", hint: "אנרגיה עולה" },
    { id: "party", group: "life", label: "לצאת למסיבה", hint: "חברה עולה" },
    { id: "social_media", group: "life", label: "להעלות פוסט", hint: "מוניטין או חשיפה" },
    { id: "meet_friends", group: "life", label: "להיפגש עם חברים", hint: "מרגיע" },
    { id: "doctor_visit", group: "life", label: "בדיקה רפואית", hint: "שקט בראש" },
    { id: "family_vacation", group: "life", label: "חופשה משפחתית", hint: "יקר אבל מחבר" },
    { id: "ignore_family", group: "life", label: "להתעלם ממשפחה בשביל עבודה", hint: "עוד תפוקה" },

    { id: "buy_apartment", group: "asset", label: "לקנות דירה", hint: "נכס כבד" },
    { id: "buy_car", group: "asset", label: "לקנות רכב", hint: "נוחות יקרה" },
    { id: "buy_rental", group: "asset", label: "לקנות דירה להשכרה", hint: "תזרים חודשי" },
    { id: "buy_office", group: "asset", label: "לקנות משרד", hint: "תדמית + עסק" },
    { id: "renovate", group: "asset", label: "שיפוץ", hint: "ערך עולה" },
    { id: "rent_asset", group: "asset", label: "להשכיר נכס", hint: "עוד תזרים" },
    { id: "sell_asset", group: "asset", label: "למכור נכס", hint: "מזומן מיידי" }
  ];

  const CLUE_BANK = [
    { id: "cl01", text: "מישהו צילם אותך", severity: 3, category: "חשיפה" },
    { id: "cl02", text: "הודעה נמחקה", severity: 2, category: "קשר" },
    { id: "cl03", text: "מסמך חסר", severity: 2, category: "ביזנס" },
    { id: "cl04", text: "השם שלך עלה בשיחה", severity: 2, category: "חשיפה" },
    { id: "cl05", text: "חוזה בלי סעיף", severity: 2, category: "ביזנס" },
    { id: "cl06", text: "מישהו ראה אתכם", severity: 3, category: "קשר" },
    { id: "cl07", text: "ריבית לא ברורה", severity: 2, category: "השקעות" },
    { id: "cl08", text: "הילד שאל שאלה קשה", severity: 1, category: "משפחה" },
    { id: "cl09", text: "צילום מסך בקבוצה", severity: 3, category: "חשיפה" },
    { id: "cl10", text: "עורך דין בתמונה", severity: 3, category: "חשיפה" },
    { id: "cl11", text: "מייל יצא מהחשבון שלך", severity: 2, category: "חשיפה" },
    { id: "cl12", text: "פגישה אחרי חצות", severity: 2, category: "קשר" },
    { id: "cl13", text: "שם של חשבון זר", severity: 3, category: "השקעות" },
    { id: "cl14", text: "השומר זיהה אותך", severity: 1, category: "חשיפה" },
    { id: "cl15", text: "הטלפון צלצל בזמן רע", severity: 2, category: "משפחה" },
    { id: "cl16", text: "דוח חתוך", severity: 2, category: "ביזנס" },
    { id: "cl17", text: "מכתב לפני תביעה", severity: 3, category: "ביזנס" },
    { id: "cl18", text: "שמועה ברחוב", severity: 1, category: "חשיפה" },
    { id: "cl19", text: "רווח מהיר מדי", severity: 2, category: "השקעות" },
    { id: "cl20", text: "מפתח נוסף קיים", severity: 2, category: "חשיפה" },
    { id: "cl21", text: "חיוב מוזר בחשבון", severity: 1, category: "השקעות" },
    { id: "cl22", text: "הוא דיבר איתה לפניך", severity: 2, category: "קשר" },
    { id: "cl23", text: "תמונה מטושטשת הועלתה", severity: 2, category: "חשיפה" },
    { id: "cl24", text: "פגישה בלי רישום", severity: 2, category: "ביזנס" },
    { id: "cl25", text: "העברה לשם לא מוכר", severity: 3, category: "השקעות" },
    { id: "cl26", text: "מישהו שאל על הילד", severity: 1, category: "משפחה" },
    { id: "cl27", text: "המנעול הוחלף", severity: 2, category: "קשר" },
    { id: "cl28", text: "חשבון ישן הופעל", severity: 2, category: "חשיפה" },
    { id: "cl29", text: "ההקלטה נשמרה", severity: 3, category: "חשיפה" },
    { id: "cl30", text: "שותף ביקש מסמך דחוף", severity: 1, category: "ביזנס" },
    { id: "cl31", text: "מישהו מחק צ'אט", severity: 2, category: "קשר" },
    { id: "cl32", text: "השקעה נקייה מדי", severity: 2, category: "השקעות" },
    { id: "cl33", text: "שיחת לילה נקלטה", severity: 3, category: "חשיפה" },
    { id: "cl34", text: "טופס בלי חתימה", severity: 2, category: "ביזנס" },
    { id: "cl35", text: "מישהו עוקב ברשת", severity: 1, category: "חשיפה" },
    { id: "cl36", text: "הוא ידע לפני שאמרת", severity: 2, category: "משפחה" },
    { id: "cl37", text: "הכסף חזר חלקית", severity: 1, category: "השקעות" },
    { id: "cl38", text: "תזמון שלא מסתדר", severity: 1, category: "קשר" },
    { id: "cl39", text: "קובץ נעול", severity: 2, category: "ביזנס" },
    { id: "cl40", text: "ביקור לא צפוי בבית", severity: 2, category: "משפחה" },
    { id: "cl41", text: "מישהו ביקש מחיר לשקט", severity: 3, category: "חשיפה" },
    { id: "cl42", text: "רואה החשבון נעלם", severity: 3, category: "ביזנס" },
    { id: "cl43", text: "תמונה נמחקה מאוחר", severity: 2, category: "קשר" },
    { id: "cl44", text: "הריבית קפצה שוב", severity: 2, category: "השקעות" },
    { id: "cl45", text: "שם שלך בחוזה צד", severity: 3, category: "ביזנס" }
  ];

  const ENDINGS = [
    { id: "business_empire", title: "אימפריה עסקית", summary: "בנית מערכת חזקה ושלטת במשחק." },
    { id: "stable_family", title: "משפחה יציבה", summary: "בחרת בבית ושמרת שקט." },
    { id: "scandal_collapse", title: "קריסה פומבית", summary: "שם וכסף נפלו יחד." },
    { id: "divorce", title: "גירושין", summary: "החשד ניצח את הבית." },
    { id: "burnout", title: "שחיקה", summary: "הגוף והראש עצרו אותך." },
    { id: "investigation", title: "חקירה", summary: "הקווים האפורים נהיו תיק." },
    { id: "quiet_survival", title: "הישרדות שקטה", summary: "בלי תהילה, אבל נשארת עומד." },
    { id: "double_life", title: "חיים כפולים", summary: "חיית כפול ואף אחד לא תפס בזמן." },
    { id: "redemption", title: "תיקון", summary: "נפלת, למדת, ועלית מחדש." },
    { id: "financial_ruin", title: "חור כלכלי", summary: "החובות סגרו עליך." },
    { id: "happy_relationship", title: "קשר בריא", summary: "שמרת אהבה גם בלחץ." },
    { id: "broken_trust", title: "אמון שבור", summary: "אנשים הפסיקו להאמין לך." },
    { id: "public_scandal", title: "שערורייה", summary: "כולם כבר יודעים." },
    { id: "isolation", title: "בדידות", summary: "נשארת לבד עם ההחלטות." },
    { id: "cold_money", title: "כסף קר", summary: "הרווחת הרבה ושילמת רגש." },
    { id: "family_over_money", title: "משפחה מעל הכול", summary: "ויתרת על חלק מהרווח כדי להציל בית." },
    { id: "blackmail", title: "סחיטה", summary: "מישהו מחזיק עליך חומר." },
    { id: "legal_escape", title: "כמעט נתפסת", summary: "יצאת נקי ברגע האחרון." },
    { id: "work_hero", title: "כוכב עבודה", summary: "קריירה חזקה בלי לפרק הכול." },
    { id: "long_run", title: "ריצה ארוכה", summary: "שרדת הרבה זמן. זה לא מובן מאליו." }
  ];

  const ACHIEVEMENTS = [
    { id: "a_apartment", title: "דירה ראשונה", desc: "קנית דירה." },
    { id: "a_affair", title: "רומן ראשון", desc: "פתחת רומן פעיל." },
    { id: "a_almost_caught", title: "כמעט נתפסת", desc: "חשד עבר 80." },
    { id: "a_fin_crash", title: "קריסה פיננסית", desc: "כסף ירד מתחת ל-30,000-." },
    { id: "a_business", title: "עסק מצליח", desc: "הכנסה עסקית עברה 15,000 בחודש." },
    { id: "a_wedding", title: "חתונה", desc: "נכנסת לנישואין." },
    { id: "a_first_kid", title: "ילד ראשון", desc: "נולד ילד ראשון." }
  ];

  const EVENT_TEXTS = {
    business_success: ["לקוח גדול חתם מהר.", "הצעה ישנה נסגרה לטובתך.", "הצוות בעבודה עמד ביעד.", "בוס חדש אהב את העבודה שלך.", "שותף הביא חוזה נקי.", "פרויקט תקוע פתאום זז.", "המלצה טובה הביאה לקוח חדש.", "המחלקה שלך קיבלה בונוס."],
    business_crisis: ["לקוח ביטל ברגע האחרון.", "ספק העלה מחיר בלי אזהרה.", "צוות קטן נכנס לעימות.", "הבוס ביקש הסברים קשים.", "פרויקט מרכזי עוכב שוב.", "טעות בדוח יצרה לחץ.", "מייל פנימי דלף החוצה.", "הלקוח טען שהובטח לו משהו אחר."],
    family_emergency: ["קרוב משפחה ביקש עזרה דחופה.", "הילד חולה וצריך להישאר בבית.", "שיחה לחוצה מהבית קפצה באמצע יום.", "הורה ביקש ליווי רפואי מיידי.", "חשבון ביתי קפץ בלי תכנון.", "ארוחת ערב הפכה לריב.", "המשפחה דורשת יותר זמן שלך.", "הבית מרגיש שאתה לא באמת שם."],
    health_issue: ["קמת מותש לגמרי.", "כאב ראש חזק עצר את היום.", "בדיקות דם חזרו לא משהו.", "לילה בלי שינה הוריד אותך.", "תחושת חולשה באמצע פגישה.", "הגב נתפס בגלל עומס.", "סחרחורת קטנה הפכה ליום אבוד.", "הרופא ביקש להאט קצב."],
    gossip: ["שמועה חדשה עליך רצה בקבוצה.", "מישהו כתב עליך פוסט עוקצני.", "תמונה שלך הופיעה במקום לא צפוי.", "חבר סיפר ששמע שם שלך בשיחה.", "בקפה דיברו עליך יותר מדי.", "עוקב חדש התחיל לשאול שאלות.", "אקס הזכיר אותך מול אנשים.", "סיפור ישן חזר לרשת."],
    legal_risk: ["מכתב משפטי נכנס במייל.", "עורך דין ביקש מסמכים.", "בדיקה רשמית נפתחה.", "סעיף בחוזה נראה בעייתי.", "לקוח איים בתלונה רשמית.", "ביקורת פתע הגיעה למשרד.", "החתימה שלך נבדקת שוב.", "קיבלת התראה לפני תביעה."],
    romantic_tension: ["הודעה קצרה הגיעה מאוחר בלילה.", "היה מבט ארוך מדי בפגישה.", "רגע טעון נשאר באוויר.", "שיחה פרטית נסגרה מאחורי דלת.", "קנאה קטנה עלתה בבית.", "מגע קל שינה את האווירה.", "מישהו שם לב לקרבה ביניכם.", "הטלפון רטט בזמן לא נכון."],
    surprise_opportunity: ["הזדמנות השקעה חדשה עלתה.", "חבר הציע כניסה לפרויקט טוב.", "נפתח מכרז שמתאים בדיוק לך.", "הצעה לרכישת נכס ירדה במחיר.", "לקוח חו\"ל ביקש פגישה מיידית.", "הצעה לשיתוף פעולה הגיעה במפתיע.", "בנק הציע תנאים נדירים.", "מנהל ותיק פתח לך דלת."],
    betrayal: ["מישהו קרוב העביר מידע החוצה.", "שותף עקף אותך בשקט.", "הודעה פרטית הגיעה לאדם הלא נכון.", "אדם שסמכת עליו שינה גרסה.", "חבר קרוב שיתף צילום מסך.", "בן זוג בדק לך את הטלפון.", "עובד לשעבר דיבר נגדך.", "מישהו שיקר כדי להגן על עצמו."],
    sudden_expense: ["תיקון יקר נפל פתאום.", "קנס לא צפוי הגיע בדואר.", "חיוב כפול פגע בחשבון.", "הביטוח עלה בחדות.", "רכב נכנס למוסך.", "המחשב המרכזי קרס.", "צריך לשלם מקדמה עכשיו.", "תשלום ישן חזר פתאום."]
  };

  const SITUATION_SEEDS = [
    { id: "s01", category: "work", title: "שיחה מהבוס", text: "הבוס ביקש אותך עכשיו.", bullets: ["זה יכול להעלות אותך", "זה גם יכול להתפוצץ"] },
    { id: "s02", category: "work", title: "עובד עוזב", text: "עובד חשוב הודיע שהוא עוזב.", bullets: ["העומס נופל עליך", "הצוות מסתכל עליך"] },
    { id: "s03", category: "business", title: "שותף לוחץ", text: "{business} לוחץ לחתום בלי בדיקה.", bullets: ["יש כסף מהיר", "יש גם ריח לא טוב"] },
    { id: "s04", category: "business", title: "לקוח גדול", text: "לקוח גדול רוצה תשובה עד הלילה.", bullets: ["אפשר לסגור הכנסה", "אין זמן לבדיקה עמוקה"] },
    { id: "s05", category: "investments", title: "הזדמנות מהירה", text: "יש עסקה שנראית נקייה מדי.", bullets: ["רווח מהיר", "קשה לראות מאיפה הכסף בא"] },
    { id: "s06", category: "investments", title: "הבנק מתקשר", text: "הבנק מציע מינוף בתנאים אגרסיביים.", bullets: ["יכול לקפיץ רווח", "יכול לפתוח בור"] },
    { id: "s07", category: "family", title: "שיחה מהבית", text: "{family} ביקש/ה עזרה כספית דחופה.", bullets: ["זה חשוב", "זה יפגע בתזרים"] },
    { id: "s08", category: "family", title: "ערב מתוח", text: "הבית מרגיש שאתה לא שם.", bullets: ["אפשר לתקן", "אפשר להתעלם"] },
    { id: "s09", category: "romance", title: "הודעה בלילה", text: "{love} כתב/ה: ער/ה?", bullets: ["יש מתח", "יש סיכון שיראו"] },
    { id: "s10", category: "romance", title: "פגישה פרטית", text: "{love} הציע/ה פגישה במקום שלא אמורים לראות אתכם.", bullets: ["קרבה חזקה", "סיכון גבוה"] },
    { id: "s11", category: "exposure", title: "צילום מסך", text: "מישהו שלח צילום מסך עם השם שלך.", bullets: ["זה לא נראה טוב", "אפשר לנסות לכבות"] },
    { id: "s12", category: "exposure", title: "שמועה", text: "שמועה עליך כבר רצה במשרד.", bullets: ["אפשר להכחיש", "אפשר להקדים ולדבר"] },
    { id: "s13", category: "work", title: "הצעה מבחוץ", text: "חברה אחרת הציעה ראיון דחוף.", bullets: ["אולי שכר טוב יותר", "חוסר יציבות"] },
    { id: "s14", category: "business", title: "ספק בעייתי", text: "ספק מבקש תשלום מראש מלא.", bullets: ["אפשר לשמור את העבודה", "אפשר לעצור ולבדוק"] },
    { id: "s15", category: "investments", title: "קרן חדשה", text: "קרן חדשה מבטיחה תשואה קבועה.", bullets: ["נשמע מושלם", "אולי מושלם מדי"] },
    { id: "s16", category: "family", title: "בקשה מהילד", text: "הילד ביקש שתגיע השבוע מוקדם.", bullets: ["זה חשוב לבית", "העבודה עמוסה"] },
    { id: "s17", category: "romance", title: "מבט ארוך", text: "{love} נשאר/ה קרוב/ה יותר מדי זמן.", bullets: ["זה מחמם", "זה גם מסמן"] },
    { id: "s18", category: "exposure", title: "מייל חשוד", text: "מייל פנימי עם השם שלך דלף.", bullets: ["צריך תגובה מהר", "כל מילה חשובה"] },
    { id: "s19", category: "work", title: "דוח לא שלם", text: "חסר סעיף חשוב בדוח ששלחת.", bullets: ["אפשר לתקן עכשיו", "אפשר לקוות שלא יראו"] },
    { id: "s20", category: "business", title: "פגישה עם עורך דין", text: "עורך דין מבקש מסמכים מייד.", bullets: ["שווה לשתף פעולה", "אפשר למשוך זמן"] },
    { id: "s21", category: "investments", title: "תנודת שוק", text: "השוק זז חזק ביום אחד.", bullets: ["למכור מהר", "להישאר רגוע"] },
    { id: "s22", category: "family", title: "אירוע משפחתי", text: "יש אירוע משפחתי בדיוק ביום עמוס.", bullets: ["נוכחות חשובה", "העבודה בוערת"] },
    { id: "s23", category: "romance", title: "דלת נסגרת", text: "דלת נסגרה מאחוריכם באמצע שיחה.", bullets: ["רגע טעון", "מישהו יכול להיכנס"] },
    { id: "s24", category: "exposure", title: "פנייה מעיתונאי", text: "עיתונאי ביקש תגובה על שמועה.", bullets: ["תגובה יכולה להרגיע", "תגובה יכולה להדליק"] },
    { id: "s25", category: "work", title: "עומס קיצוני", text: "נחתו עליך שתי משימות דחופות.", bullets: ["צריך לבחור", "אי אפשר הכול"] },
    { id: "s26", category: "business", title: "שותף נעלם", text: "{business} לא עונה כבר יומיים.", bullets: ["מסמך חשוב ביד שלו", "הזמן רץ"] },
    { id: "s27", category: "investments", title: "קריפטו קופץ", text: "הספקולציה טסה למעלה פתאום.", bullets: ["לנעול רווח", "לחכות עוד"] },
    { id: "s28", category: "family", title: "שאלה קשה", text: "שאלו אותך בבית אם אתה מסתיר משהו.", bullets: ["אפשר לדבר", "אפשר להתחמק"] },
    { id: "s29", category: "romance", title: "נסיעה משותפת", text: "{love} מציע/ה טרמפ ארוך לבד.", bullets: ["קרבה", "גם חשד"] },
    { id: "s30", category: "exposure", title: "מסך פתוח", text: "המחשב שלך נשאר פתוח מול אנשים.", bullets: ["אפשר להסביר", "אפשר להאשים טעות"] },
    { id: "s31", category: "business", title: "עסקה כפולה", text: "יש שתי עסקאות, אין זמן לשתיהן.", bullets: ["בטוח קטן", "מסוכן גדול"] },
    { id: "s32", category: "family", title: "סוף שבוע עמוס", text: "הבית ביקש שתישאר כולך שם בסופ\"ש.", bullets: ["זה יחזק קשר", "יפגע בקצב העבודה"] }
  ];

  const SITUATION_CHOICES = {
    work: [
      { label: "לוקח אחריות מלאה", text: "לקחת הכול עליך.", effects: { reputation: 4, stress: 6, energy: -6, cashflow: 2 } },
      { label: "מחלק עומס לצוות", text: "ניהלת את זה רגוע יותר.", effects: { reputation: 2, stress: 1, energy: -2, trust: 1 } },
      { label: "דוחה לשבוע הבא", text: "קנית זמן אבל המחיר שם.", effects: { stress: 3, reputation: -3, energy: 2, cashflow: -2 } }
    ],
    business: [
      { label: "בודק לעומק", text: "שילמת זמן בשביל שקט.", effects: { energy: -4, stress: -1, trust: 2, reputation: 2 }, clues: ["cl03"] },
      { label: "רץ מהר על העסקה", text: "סגרת מהר בלי כל התמונה.", effects: { money: 2600, cashflow: 3, exposure: 4, stress: 2 }, clues: ["cl05"] },
      { label: "מוותר כרגע", text: "שמעת לבטן והתרחקת.", effects: { stress: -2, cashflow: -1, reputation: 1 } }
    ],
    investments: [
      { label: "נשאר שמרני", text: "שמרת קו רגוע.", effects: { investments: 2, stress: -1, cashflow: 1 } },
      { label: "נכנס חזק", text: "הלכת על מהלך חד.", effects: { money: 1700, investments: 4, exposure: 3, stress: 3 }, clues: ["cl19"] },
      { label: "יוצא מהפוזיציה", text: "חתכת סיכון בזמן.", effects: { money: -900, stress: -2, investments: -2, trust: 1 } }
    ],
    family: [
      { label: "נמצא בבית", text: "בחרת בבית השבוע.", effects: { family: 5, trust: 3, stress: -3, money: -900 } },
      { label: "עוזר חלקית", text: "ניסית להחזיק שני צדדים.", effects: { family: 2, stress: 1, money: -400 } },
      { label: "שם עבודה קודם", text: "החלטת לשים קריירה ראשון.", effects: { money: 1400, family: -5, trust: -3, stress: 3 } }
    ],
    romance: [
      { label: "נכנס לשיחה עמוקה", text: "היה רגע טעון.", effects: { relationship: 6, stress: -2, exposure: 3 }, clues: ["cl12"] },
      { label: "שומר מרחק", text: "בחרת לא לפתוח את זה.", effects: { relationship: -2, trust: 2, exposure: -2, stress: 1 } },
      { label: "זורם בלי לחשוב", text: "הלכת עם הרגע.", effects: { relationship: 8, exposure: 7, trust: -4, stress: 3 }, clues: ["cl06"] }
    ],
    exposure: [
      { label: "מגיב בשקיפות", text: "דיברת פתוח לפני שזה התפשט.", effects: { trust: 4, exposure: -3, reputation: 2 } },
      { label: "מכחיש הכול", text: "נתת תשובה קצרה וקרה.", effects: { exposure: 2, trust: -3, stress: 2 }, clues: ["cl09"] },
      { label: "מכבה בשקט", text: "פעלת מאחורי הקלעים.", effects: { money: -1200, exposure: -2, stress: 1, reputation: -1 }, clues: ["cl10"] }
    ]
  };

  const DOM = {
    body: document.body,
    timeIndicator: byId("timeIndicator"),
    weekIndicator: byId("weekIndicator"),
    seasonIndicator: byId("seasonIndicator"),
    apIndicator: byId("apIndicator"),
    newGameBtn: byId("newGameBtn"),
    continueBtn: byId("continueBtn"),
    freeModeBtn: byId("freeModeBtn"),
    helpBtn: byId("helpBtn"),
    themeBtn: byId("themeBtn"),
    homeCard: byId("homeCard"),
    homeNewBtn: byId("homeNewBtn"),
    homeContinueBtn: byId("homeContinueBtn"),
    homeFreeBtn: byId("homeFreeBtn"),
    traitCount: byId("traitCount"),
    traitsBox: byId("traitsBox"),
    weekCard: byId("weekCard"),
    situationTitle: byId("situationTitle"),
    situationText: byId("situationText"),
    situationBullets: byId("situationBullets"),
    situationChoices: byId("situationChoices"),
    weekActionLog: byId("weekActionLog"),
    finishWeekBtn: byId("finishWeekBtn"),
    statusCard: byId("statusCard"),
    moneyLine: byId("moneyLine"),
    assetsLine: byId("assetsLine"),
    debtsLine: byId("debtsLine"),
    statsBars: byId("statsBars"),
    resultCard: byId("resultCard"),
    weeklyMoneyFlow: byId("weeklyMoneyFlow"),
    weeklyStressFlow: byId("weeklyStressFlow"),
    weeklyRelationsFlow: byId("weeklyRelationsFlow"),
    weeklyWorkFlow: byId("weeklyWorkFlow"),
    weeklyCoupleFlow: byId("weeklyCoupleFlow"),
    weeklyMainEvents: byId("weeklyMainEvents"),
    weeklyDeltaBox: byId("weeklyDeltaBox"),
    nextWeekBtn: byId("nextWeekBtn"),
    monthSummaryCard: byId("monthSummaryCard"),
    monthSummaryText: byId("monthSummaryText"),
    endingCard: byId("endingCard"),
    endingTitle: byId("endingTitle"),
    endingText: byId("endingText"),
    endingNewBtn: byId("endingNewBtn"),
    endingFreeBtn: byId("endingFreeBtn"),
    apHint: byId("apHint"),
    actionFeedback: byId("actionFeedback"),
    financialActions: byId("financialActions"),
    workActions: byId("workActions"),
    relationshipActions: byId("relationshipActions"),
    intimacyActions: byId("intimacyActions"),
    affairActions: byId("affairActions"),
    lifeActions: byId("lifeActions"),
    ownedAssetsList: byId("ownedAssetsList"),
    assetActions: byId("assetActions"),
    relationsList: byId("relationsList"),
    memoryList: byId("memoryList"),
    familyList: byId("familyList"),
    cluesList: byId("cluesList"),
    endingProgress: byId("endingProgress"),
    endingsGrid: byId("endingsGrid"),
    achievementsGrid: byId("achievementsGrid"),
    tabPanels: Array.from(document.querySelectorAll(".tab-panel")),
    tabButtons: Array.from(document.querySelectorAll("[data-tab-btn]")),
    toastBox: byId("toastBox"),
    helpDialog: byId("helpDialog"),
    closeHelpBtn: byId("closeHelpBtn"),
    simpleLanguageToggle: byId("simpleLanguageToggle")
  };

  let meta = loadMeta();
  let state = createHomeState();

  init();

  function init() {
    applyTheme(meta.theme);
    if (DOM.simpleLanguageToggle) DOM.simpleLanguageToggle.checked = meta.simpleLanguage;
    bindStaticListeners();
    const saved = loadRun();
    if (saved) {
      state = hydrateRun(saved);
      state.phase = PHASES.HOME;
    }
    renderAll();
  }

  function bindStaticListeners() {
    if (DOM.newGameBtn) DOM.newGameBtn.addEventListener("click", () => startNewGame(false));
    if (DOM.homeNewBtn) DOM.homeNewBtn.addEventListener("click", () => startNewGame(false));
    if (DOM.endingNewBtn) DOM.endingNewBtn.addEventListener("click", () => startNewGame(false));
    if (DOM.continueBtn) DOM.continueBtn.addEventListener("click", continueRun);
    if (DOM.homeContinueBtn) DOM.homeContinueBtn.addEventListener("click", continueRun);
    if (DOM.freeModeBtn) DOM.freeModeBtn.addEventListener("click", () => startNewGame(true));
    if (DOM.homeFreeBtn) DOM.homeFreeBtn.addEventListener("click", () => startNewGame(true));
    if (DOM.endingFreeBtn) DOM.endingFreeBtn.addEventListener("click", () => startNewGame(true));
    if (DOM.helpBtn) DOM.helpBtn.addEventListener("click", openHelp);
    if (DOM.closeHelpBtn) DOM.closeHelpBtn.addEventListener("click", closeHelp);
    if (DOM.themeBtn) DOM.themeBtn.addEventListener("click", () => { meta.theme = meta.theme === "dark" ? "light" : "dark"; applyTheme(meta.theme); saveMeta(); renderThemeButton(); });
    if (DOM.simpleLanguageToggle) DOM.simpleLanguageToggle.addEventListener("change", () => { meta.simpleLanguage = DOM.simpleLanguageToggle.checked; saveMeta(); toast("שפה פשוטה נשמרה"); });
    if (DOM.finishWeekBtn) DOM.finishWeekBtn.addEventListener("click", finishWeek);
    if (DOM.nextWeekBtn) DOM.nextWeekBtn.addEventListener("click", moveToNextWeek);
    DOM.tabButtons.forEach((btn) => btn.addEventListener("click", () => { state.ui.activeTab = btn.getAttribute("data-tab-btn") || "story"; saveRunSafe(); renderTabs(); }));
    if (DOM.traitsBox) DOM.traitsBox.addEventListener("click", (e) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      const traitId = t.getAttribute("data-trait");
      if (traitId) toggleTraitDraft(traitId);
    });
  }

  function createHomeState() {
    return {
      version: 8,
      phase: PHASES.HOME,
      week: 1,
      month: 1,
      season: 1,
      actionPoints: MAX_ACTION_POINTS,
      freeMode: false,
      stats: clone(INITIAL_STATS),
      traits: [],
      traitDraft: [],
      flags: defaultFlags(),
      characters: {},
      work: defaultWorkState(),
      finance: defaultFinanceState(),
      assetsOwned: [],
      childrenCount: 0,
      clues: [],
      clueIds: [],
      history: [],
      weekActionLog: [],
      weekEventLog: [],
      actionFeedback: [],
      currentSituation: null,
      situationAnswered: false,
      weekStartSnapshot: clone(INITIAL_STATS),
      weekMeta: defaultWeekMeta(),
      currentSummary: null,
      currentMonthlySummary: "",
      ui: { activeTab: "story" },
      ending: null,
      alertState: {},
      unlockedAchievements: meta.unlockedAchievements.slice()
    };
  }

  function defaultFlags() {
    return { isDating: false, isMarried: false, livingTogether: false, hasKids: false, affairActive: false, affairSuspected: false, caughtCheating: false, breakupThreat: false, blackmailRisk: false, openRelationship: false, legalRisk: false, mentorWarning: false };
  }

  function defaultWorkState() {
    return { status: "ללא עבודה", monthlySalary: 0, performance: 45, businessOpen: false, businessLevel: 0, businessIncome: 0 };
  }

  function defaultFinanceState() {
    return { riskLevel: 35, investedCapital: 0, leverageLevel: 0, lastInvestmentResult: 0 };
  }

  function defaultWeekMeta() {
    return { romanceActions: 0, workActions: 0, familyActions: 0, lateNightActions: 0, professionalActions: 0, actionCount: 0, messages: [] };
  }

  function renderAll() {
    renderTopBar();
    renderHomeArea();
    renderTabs();
    renderSituation();
    renderStatusCard();
    renderActionButtons();
    renderActionFeedback();
    renderOwnedAssets();
    renderRelations();
    renderFamily();
    renderClues();
    renderEndings();
    renderResult();
    renderMonthSummary();
    renderEndingCard();
    renderContinueButtons();
    renderThemeButton();
    renderTraitDraft();
  }

  function renderTopBar() {
    if (DOM.timeIndicator) DOM.timeIndicator.textContent = `שבוע ${state.week}, חודש ${state.month}`;
    if (DOM.weekIndicator) DOM.weekIndicator.textContent = `שבוע ${state.week}/${state.freeMode ? "∞" : MAX_WEEKS}`;
    state.season = Math.min(4, Math.max(1, Math.floor((state.week - 1) / 30) + 1));
    if (DOM.seasonIndicator) DOM.seasonIndicator.textContent = `עונה ${state.season}/4`;
    if (DOM.apIndicator) DOM.apIndicator.textContent = `נק׳ פעולה: ${state.actionPoints}/${MAX_ACTION_POINTS}`;
    if (DOM.apHint) DOM.apHint.textContent = `נק׳ פעולה זמינות: ${state.actionPoints}`;
  }

  function renderHomeArea() {
    const isHome = state.phase === PHASES.HOME;
    toggleHidden(DOM.homeCard, !isHome);
    toggleHidden(DOM.weekCard, isHome || state.phase === PHASES.ENDED);
    toggleHidden(DOM.statusCard, isHome || state.phase === PHASES.ENDED);
    toggleHidden(DOM.resultCard, state.phase !== PHASES.RESULT);
    toggleHidden(DOM.endingCard, state.phase !== PHASES.ENDED);
    if (DOM.finishWeekBtn) DOM.finishWeekBtn.disabled = state.phase !== PHASES.RUNNING;
  }

  function renderTabs() {
    const active = state.ui.activeTab || "story";
    DOM.tabPanels.forEach((p) => { p.hidden = p.getAttribute("data-tab") !== active; });
    DOM.tabButtons.forEach((b) => { const tab = b.getAttribute("data-tab-btn"); b.classList.toggle("active", tab === active); b.setAttribute("aria-pressed", tab === active ? "true" : "false"); });
  }

  function renderTraitDraft() {
    const selected = state.traitDraft || [];
    if (DOM.traitCount) DOM.traitCount.textContent = `נבחרו ${selected.length}/2`;
    if (!DOM.traitsBox) return;
    Array.from(DOM.traitsBox.querySelectorAll("[data-trait]"))
      .forEach((chip) => {
        const id = chip.getAttribute("data-trait");
        chip.classList.toggle("active", selected.includes(String(id)));
        chip.setAttribute("aria-pressed", selected.includes(String(id)) ? "true" : "false");
      });
  }

  function renderSituation() {
    if (!DOM.situationTitle || !DOM.situationText || !DOM.situationBullets || !DOM.situationChoices || !state.currentSituation) return;
    const s = state.currentSituation;
    DOM.situationTitle.textContent = s.title;
    DOM.situationText.innerHTML = "";
    s.textLines.forEach((line) => { const p = document.createElement("p"); p.textContent = line; DOM.situationText.appendChild(p); });
    DOM.situationBullets.innerHTML = "";
    (s.bullets || []).forEach((line) => { const li = document.createElement("li"); li.textContent = line; DOM.situationBullets.appendChild(li); });
    DOM.situationChoices.innerHTML = "";
    s.choices.forEach((choice, i) => {
      const btn = document.createElement("button");
      btn.className = "choice-btn";
      btn.textContent = choice.label;
      btn.disabled = state.phase !== PHASES.RUNNING || state.situationAnswered;
      btn.addEventListener("click", () => respondToSituation(i));
      DOM.situationChoices.appendChild(btn);
    });
    if (DOM.weekActionLog) {
      DOM.weekActionLog.innerHTML = "";
      state.weekActionLog.slice(-12).forEach((entry) => { const li = document.createElement("li"); li.textContent = entry; DOM.weekActionLog.appendChild(li); });
    }
  }

  function renderStatusCard() {
    if (!DOM.moneyLine || !DOM.assetsLine || !DOM.debtsLine || !DOM.statsBars) return;
    recalcAssetsStat();
    DOM.moneyLine.textContent = `כסף: ${formatCurrency(state.stats.money)}`;
    DOM.assetsLine.textContent = `נכסים: ${formatCurrency(state.stats.assets)}`;
    DOM.debtsLine.textContent = `חובות: ${formatCurrency(state.stats.debts)}`;
    DOM.statsBars.innerHTML = "";
    BAR_KEYS.forEach((k) => {
      const row = document.createElement("div");
      row.className = "bar-row";
      const label = document.createElement("label");
      label.textContent = STAT_LABELS[k];
      const val = document.createElement("span");
      val.textContent = String(Math.round(state.stats[k]));
      label.appendChild(val);
      const bar = document.createElement("div");
      bar.className = "bar";
      const fill = document.createElement("span");
      fill.style.width = `${clamp(state.stats[k], 0, 100)}%`;
      bar.appendChild(fill);
      row.appendChild(label);
      row.appendChild(bar);
      DOM.statsBars.appendChild(row);
    });
  }

  function renderActionButtons() {
    renderGroup("financial", DOM.financialActions);
    renderGroup("work", DOM.workActions);
    renderGroup("relationship", DOM.relationshipActions);
    renderGroup("intimacy", DOM.intimacyActions);
    renderGroup("affair", DOM.affairActions);
    renderGroup("life", DOM.lifeActions);
    renderGroup("asset", DOM.assetActions);
  }

  function renderGroup(group, container) {
    if (!container) return;
    container.innerHTML = "";
    ACTIONS.filter((a) => a.group === group).forEach((a) => {
      const b = document.createElement("button");
      b.className = "action-btn";
      b.disabled = state.phase !== PHASES.RUNNING || state.actionPoints <= 0;
      b.innerHTML = `<span>${a.label}</span><small>${a.hint}</small>`;
      b.addEventListener("click", () => performAction(a.id));
      container.appendChild(b);
    });
  }

  function renderActionFeedback() {
    if (!DOM.actionFeedback) return;
    DOM.actionFeedback.innerHTML = "";
    state.actionFeedback.slice(-8).forEach((item) => {
      const box = document.createElement("div");
      box.className = "list-item";
      box.innerHTML = `<h4>${item.title}</h4><p>${item.text}</p><p>השלכות: ${item.effectsText || "ללא שינוי"}</p>`;
      DOM.actionFeedback.appendChild(box);
    });
  }

  function renderOwnedAssets() {
    if (!DOM.ownedAssetsList) return;
    DOM.ownedAssetsList.innerHTML = "";
    const entries = Object.values(ASSET_CATALOG)
      .map((a) => ({ a, c: getAssetCount(a.id) }))
      .filter((x) => x.c > 0);
    if (!entries.length) {
      const empty = document.createElement("div");
      empty.className = "list-item";
      empty.textContent = "אין לך עדיין נכסים.";
      DOM.ownedAssetsList.appendChild(empty);
      return;
    }
    entries.forEach((x) => {
      const card = document.createElement("div");
      card.className = "list-item";
      card.innerHTML = `<h4>${x.a.name} × ${x.c}</h4><p>שווי יחידה: ${formatCurrency(x.a.value)}</p><p>תחזוקה חודשית: ${formatCurrency(x.a.upkeep)}</p>`;
      DOM.ownedAssetsList.appendChild(card);
    });
  }

  function renderRelations() {
    if (!DOM.relationsList || !DOM.memoryList) return;
    const labels = { loveInterest: "דמות קרובה", officialPartner: "בן/בת זוג רשמי/ת", businessPartner: "שותף/ה עסקי/ת", familyMember: "קרוב/ת משפחה" };
    DOM.relationsList.innerHTML = "";
    Object.keys(state.characters).forEach((role) => {
      const c = state.characters[role];
      if (!c) return;
      const card = document.createElement("div");
      card.className = "list-item";
      card.innerHTML = `<h4>${c.name} · ${labels[role] || role}</h4><p>אמון ${Math.round(c.trust)} | משיכה ${Math.round(c.attraction)} | רצון ${Math.round(c.desire)}</p><p>קנאה ${Math.round(c.jealousy)} | מצב ${charMoodText(c)} | חשד ${suspicionText(c.suspicion)}</p>`;
      DOM.relationsList.appendChild(card);
    });
    const memories = [];
    Object.values(state.characters).forEach((c) => (c.memory || []).forEach((m) => memories.push(`${c.name}: ${m}`)));
    DOM.memoryList.innerHTML = "";
    if (!memories.length) {
      const row = document.createElement("div");
      row.className = "list-item";
      row.textContent = "עדיין אין זיכרונות משמעותיים.";
      DOM.memoryList.appendChild(row);
      return;
    }
    memories.slice(-10).reverse().forEach((m) => {
      const row = document.createElement("div");
      row.className = "list-item";
      row.textContent = m;
      DOM.memoryList.appendChild(row);
    });
  }

  function renderFamily() {
    if (!DOM.familyList) return;
    const hasPartner = state.flags.isDating || state.flags.isMarried;
    DOM.familyList.innerHTML = "";
    [
      `מצב זוגיות: ${state.flags.isMarried ? "נשוי/אה" : state.flags.isDating ? "בזוגיות" : "לא רשמי"}`,
      `בן/בת זוג: ${state.characters.officialPartner ? state.characters.officialPartner.name : "-"}`,
      `גרים יחד: ${state.flags.livingTogether ? "כן" : "לא"}`,
      `ילדים: ${state.childrenCount}`,
      `מצב בית/משפחה: ${Math.round(state.stats.family)}`,
      `רומן פעיל: ${state.flags.affairActive ? "כן" : "לא"}`,
      `קשר פתוח: ${state.flags.openRelationship ? "כן" : "לא"}`,
      hasPartner && state.flags.affairActive && state.childrenCount > 0 ? "האזור רגיש מאוד: רומן + ילדים." : ""
    ].filter(Boolean).forEach((line) => {
      const li = document.createElement("li");
      li.textContent = line;
      DOM.familyList.appendChild(li);
    });
  }

  function renderClues() {
    if (!DOM.cluesList) return;
    DOM.cluesList.innerHTML = "";
    if (!state.clues.length) {
      const li = document.createElement("li");
      li.textContent = "עדיין אין רמזים.";
      DOM.cluesList.appendChild(li);
      return;
    }
    state.clues.slice().sort((a, b) => b.discoveredAtWeek - a.discoveredAtWeek).forEach((c) => {
      const li = document.createElement("li");
      const dots = c.severity === 3 ? "●●●" : c.severity === 2 ? "●●" : "●";
      li.textContent = `${dots} ${c.text} (${c.category}) · שבוע ${c.discoveredAtWeek}`;
      DOM.cluesList.appendChild(li);
    });
  }

  function renderEndings() {
    if (!DOM.endingProgress || !DOM.endingsGrid || !DOM.achievementsGrid) return;
    DOM.endingProgress.textContent = `${meta.unlockedEndings.length}/${ENDINGS.length}`;
    DOM.endingsGrid.innerHTML = "";
    ENDINGS.forEach((e) => {
      const u = meta.unlockedEndings.includes(e.id);
      const card = document.createElement("div");
      card.className = `end-card${u ? "" : " locked"}`;
      card.innerHTML = u ? `<h4>${e.title}</h4><p>${e.summary}</p>` : "<h4>נעול</h4><p>תמשיך לשחק כדי לפתוח.</p>";
      DOM.endingsGrid.appendChild(card);
    });
    DOM.achievementsGrid.innerHTML = "";
    ACHIEVEMENTS.forEach((a) => {
      const u = meta.unlockedAchievements.includes(a.id);
      const card = document.createElement("div");
      card.className = `end-card${u ? "" : " locked"}`;
      card.innerHTML = u ? `<h4>${a.title}</h4><p>${a.desc}</p>` : `<h4>נעול</h4><p>${a.title}</p>`;
      DOM.achievementsGrid.appendChild(card);
    });
  }

  function renderResult() {
    if (!DOM.resultCard || !DOM.weeklyMoneyFlow) return;
    toggleHidden(DOM.resultCard, state.phase !== PHASES.RESULT);
    if (state.phase !== PHASES.RESULT || !state.currentSummary) return;
    const s = state.currentSummary;
    DOM.weeklyMoneyFlow.textContent = `כסף התחיל ב ${formatCurrency(s.start.money)} → הסתיים ב ${formatCurrency(s.end.money)}`;
    DOM.weeklyStressFlow.textContent = `שינוי לחץ: ${signed(Math.round(s.end.stress - s.start.stress))}`;
    DOM.weeklyRelationsFlow.textContent = `שינוי קשר/אמון: קשר ${signed(Math.round(s.end.relationship - s.start.relationship))}, אמון ${signed(Math.round(s.end.trust - s.start.trust))}`;
    DOM.weeklyWorkFlow.textContent = `מצב עבודה: ${state.work.status} | ביצועים ${Math.round(state.work.performance)}`;
    DOM.weeklyCoupleFlow.textContent = `מצב זוגיות: ${coupleStatusLine()}`;
    DOM.weeklyMainEvents.innerHTML = "";
    s.events.forEach((line) => { const li = document.createElement("li"); li.textContent = line; DOM.weeklyMainEvents.appendChild(li); });
    DOM.weeklyDeltaBox.innerHTML = "";
    Object.keys(s.deltas).forEach((k) => {
      const v = s.deltas[k];
      if (!v) return;
      const chip = document.createElement("span");
      chip.className = `chip ${v >= 0 ? "pos" : "neg"}`;
      chip.textContent = `${STAT_LABELS[k] || k} ${signed(Math.round(v))}`;
      DOM.weeklyDeltaBox.appendChild(chip);
    });
  }

  function renderMonthSummary() {
    if (!DOM.monthSummaryCard || !DOM.monthSummaryText) return;
    if (!state.currentMonthlySummary) { toggleHidden(DOM.monthSummaryCard, true); return; }
    toggleHidden(DOM.monthSummaryCard, false);
    DOM.monthSummaryText.textContent = state.currentMonthlySummary;
  }

  function renderEndingCard() {
    if (!DOM.endingCard || !DOM.endingTitle || !DOM.endingText) return;
    toggleHidden(DOM.endingCard, state.phase !== PHASES.ENDED);
    if (state.phase !== PHASES.ENDED || !state.ending) return;
    DOM.endingTitle.textContent = state.ending.title;
    DOM.endingText.textContent = state.ending.summary;
    toggleHidden(DOM.endingFreeBtn, !meta.endlessUnlocked);
  }

  function renderContinueButtons() {
    const hasSaved = Boolean(loadRun());
    const hasFree = Boolean(meta.endlessUnlocked);
    if (DOM.continueBtn) DOM.continueBtn.disabled = !hasSaved;
    if (DOM.homeContinueBtn) DOM.homeContinueBtn.disabled = !hasSaved;
    toggleHidden(DOM.freeModeBtn, !hasFree);
    toggleHidden(DOM.homeFreeBtn, !hasFree);
    toggleHidden(DOM.endingFreeBtn, !hasFree);
  }

  function renderThemeButton() {
    if (DOM.themeBtn) DOM.themeBtn.textContent = `מצב: ${meta.theme === "dark" ? "כהה" : "בהיר"}`;
  }

  function toggleTraitDraft(id) {
    const cur = state.traitDraft ? state.traitDraft.slice() : [];
    if (cur.includes(id)) state.traitDraft = cur.filter((x) => x !== id);
    else {
      if (cur.length >= 2) { toast("אפשר לבחור רק 2 תכונות", true); return; }
      cur.push(id);
      state.traitDraft = cur;
    }
    renderTraitDraft();
  }

  function startNewGame(freeMode) {
    const selectedTraits = state.traitDraft && state.traitDraft.length === 2 ? state.traitDraft.slice() : [];
    if (selectedTraits.length !== 2) { toast("בחר 2 תכונות כדי להתחיל", true); return; }
    state = createHomeState();
    state.phase = PHASES.RUNNING;
    state.traits = selectedTraits;
    state.traitDraft = selectedTraits.slice();
    state.characters = generateCharacters();
    state.freeMode = Boolean(freeMode && meta.endlessUnlocked);
    if (state.freeMode) applyEffects({ money: 8000, reputation: 10, investments: 10, energy: 6 }, "free-mode");
    ensureSituation();
    saveRunSafe();
    renderAll();
  }

  function continueRun() {
    const saved = loadRun();
    if (!saved) { toast("אין שמירה להמשך", true); return; }
    state = hydrateRun(saved);
    if (state.phase === PHASES.HOME) state.phase = PHASES.RUNNING;
    ensureSituation();
    renderAll();
  }

  function loadMeta() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.meta);
      if (!raw) return { theme: "dark", simpleLanguage: true, unlockedEndings: [], unlockedAchievements: [], endlessUnlocked: false };
      const p = JSON.parse(raw);
      return {
        theme: p.theme || "dark",
        simpleLanguage: p.simpleLanguage !== false,
        unlockedEndings: Array.isArray(p.unlockedEndings) ? p.unlockedEndings : [],
        unlockedAchievements: Array.isArray(p.unlockedAchievements) ? p.unlockedAchievements : [],
        endlessUnlocked: Boolean(p.endlessUnlocked)
      };
    } catch (_e) {
      return { theme: "dark", simpleLanguage: true, unlockedEndings: [], unlockedAchievements: [], endlessUnlocked: false };
    }
  }

  function saveMeta() {
    try { localStorage.setItem(STORAGE_KEYS.meta, JSON.stringify(meta)); } catch (_e) {}
  }

  function loadRun() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.run);
      return raw ? JSON.parse(raw) : null;
    } catch (_e) { return null; }
  }

  function saveRunSafe() {
    if (!state || state.phase === PHASES.HOME) return;
    try { localStorage.setItem(STORAGE_KEYS.run, JSON.stringify(state)); } catch (_e) {}
  }

  function hydrateRun(run) {
    const merged = createHomeState();
    Object.assign(merged, run || {});
    merged.stats = Object.assign(clone(INITIAL_STATS), run.stats || {});
    merged.flags = Object.assign(defaultFlags(), run.flags || {});
    merged.work = Object.assign(defaultWorkState(), run.work || {});
    merged.finance = Object.assign(defaultFinanceState(), run.finance || {});
    merged.weekMeta = Object.assign(defaultWeekMeta(), run.weekMeta || {});
    merged.ui = Object.assign({ activeTab: "story" }, run.ui || {});
    merged.traits = Array.isArray(run.traits) ? run.traits : [];
    merged.traitDraft = Array.isArray(run.traitDraft) ? run.traitDraft : merged.traits.slice(0, 2);
    merged.assetsOwned = Array.isArray(run.assetsOwned) ? run.assetsOwned : [];
    merged.clues = Array.isArray(run.clues) ? run.clues : [];
    merged.clueIds = Array.isArray(run.clueIds) ? run.clueIds : merged.clues.map((c) => c.id);
    merged.history = Array.isArray(run.history) ? run.history : [];
    merged.weekActionLog = Array.isArray(run.weekActionLog) ? run.weekActionLog : [];
    merged.weekEventLog = Array.isArray(run.weekEventLog) ? run.weekEventLog : [];
    merged.actionFeedback = Array.isArray(run.actionFeedback) ? run.actionFeedback : [];
    merged.unlockedAchievements = Array.isArray(run.unlockedAchievements) ? run.unlockedAchievements : meta.unlockedAchievements.slice();
    if (!merged.characters || !merged.characters.loveInterest) merged.characters = generateCharacters();
    hydrateCharacters(merged.characters);
    if (!merged.weekStartSnapshot) merged.weekStartSnapshot = clone(merged.stats);
    return merged;
  }

  function ensureSituation() {
    if (!state.currentSituation) {
      state.currentSituation = generateSituation();
      state.situationAnswered = false;
      state.weekStartSnapshot = clone(state.stats);
    }
  }

  function respondToSituation(index) {
    if (state.phase !== PHASES.RUNNING || state.situationAnswered || !state.currentSituation) return;
    const choice = state.currentSituation.choices[index];
    if (!choice) return;
    applyOutcome(choice, { source: `תגובה למצב: ${choice.label}`, logToWeekActions: true, feedbackTitle: `תגובה: ${choice.label}` });
    state.situationAnswered = true;
    state.history.push({ week: state.week, title: state.currentSituation.title, choice: choice.label });
    state.weekEventLog.push(`בחרת תגובה: ${choice.label}`);
    saveRunSafe();
    renderAll();
  }

  function performAction(actionId) {
    if (state.phase !== PHASES.RUNNING) return;
    if (state.actionPoints <= 0) { toast("נגמרו נקודות הפעולה לשבוע הזה", true); return; }
    const action = ACTIONS.find((a) => a.id === actionId);
    if (!action) return;
    const outcome = resolveAction(action);
    applyOutcome(outcome, { source: action.label, logToWeekActions: true, feedbackTitle: action.label });
    state.actionPoints -= 1;
    state.weekMeta.actionCount += 1;
    if (["relationship", "intimacy", "affair"].includes(action.group)) state.weekMeta.romanceActions += 1;
    if (action.group === "work") state.weekMeta.workActions += 1;
    if (action.group === "life" && ["family_vacation", "ignore_family"].includes(action.id)) state.weekMeta.familyActions += 1;
    if (["private_meeting", "stay_night", "hide_affair"].includes(action.id)) state.weekMeta.lateNightActions += 1;
    if (["stay_professional", "set_boundary"].includes(action.id)) state.weekMeta.professionalActions += 1;
    checkWarnings();
    checkAchievements();
    saveRunSafe();
    renderAll();
  }

  function result(text, effects, extra) { return Object.assign({ text, effects: effects || {} }, extra || {}); }

  function applyOutcome(outcome, options) {
    const source = options?.source || "פעולה";
    const title = options?.feedbackTitle || source;
    applyEffects(outcome.effects || {}, source);
    if (Array.isArray(outcome.clues)) outcome.clues.forEach((id) => addClueById(id));
    if (Array.isArray(outcome.flagsSet)) outcome.flagsSet.forEach((f) => { state.flags[f] = true; });
    if (Array.isArray(outcome.flagsUnset)) outcome.flagsUnset.forEach((f) => { state.flags[f] = false; });
    state.actionFeedback.push({ title, text: outcome.text || "", effectsText: effectsToText(outcome.effects || {}) });
    if (options?.logToWeekActions) state.weekActionLog.push(`${source}: ${outcome.text}`);
    state.weekMeta.messages.push(`${source}: ${outcome.text}`);
    if (outcome.text) toast(outcome.text);
  }

  function resolveAction(action) {
    const love = state.characters.loveInterest;
    const partner = state.characters.officialPartner;
    const business = state.characters.businessPartner;
    const hasPartner = state.flags.isDating || state.flags.isMarried;

    switch (action.id) {
      case "invest_safe": {
        const amount = Math.max(1200, Math.round(1200 + state.stats.money * 0.05));
        state.finance.investedCapital += amount;
        state.finance.riskLevel = clamp(state.finance.riskLevel - 2, 0, 100);
        return result(`${business.name} אהב/ה את הגישה הזהירה.`, { money: -amount, investments: 3, stress: -1, cashflow: 1, reputation: 1 });
      }
      case "invest_risky": {
        const amount = Math.max(1800, Math.round(1800 + state.stats.money * 0.08));
        state.finance.investedCapital += amount;
        state.finance.riskLevel = clamp(state.finance.riskLevel + 7 + traitBonus("riskBias") * 0.2, 0, 100);
        return result("הלכת על מהלך מסוכן.", { money: -amount, investments: 5, stress: 3, exposure: 2 }, { clues: ["cl19"] });
      }
      case "crypto_spec": {
        const amount = Math.max(1000, Math.round(1000 + Math.max(0, state.stats.money) * 0.05));
        state.finance.investedCapital += amount;
        state.finance.riskLevel = clamp(state.finance.riskLevel + 12 + traitBonus("riskBias") * 0.3, 0, 100);
        return result("נכנסת לספקולציה חדה.", { money: -amount, investments: 4, stress: 4, exposure: 3, mood: 2 }, { clues: ["cl32"] });
      }
      case "take_loan":
        return result("לקחת הלוואה מהירה.", { money: 12000, debts: 13440, stress: 2, cashflow: 1 }, { clues: ["cl44"] });
      case "repay_debt": {
        const pay = Math.min(7000, Math.max(0, state.stats.debts));
        if (pay <= 0) return result("ניסית לסגור חוב, כרגע אין חוב אמיתי.", { stress: -1, trust: 1 });
        return result("סגרת חלק מהחוב.", { money: -pay, debts: -pay, stress: -4, trust: 2, cashflow: 1 });
      }
      case "open_business":
        if (!state.work.businessOpen) {
          state.work.businessOpen = true; state.work.businessLevel = 1;
          return result(`פתחת עסק קטן עם ${business.name}.`, { money: -15000, stress: 7, reputation: 4, cashflow: 2 }, { clues: ["cl30"] });
        }
        state.work.businessLevel = clamp(state.work.businessLevel + 1, 1, 6);
        return result("הרחבת את העסק הקיים.", { money: -6000, stress: 4, reputation: 3, cashflow: 3 });
      case "search_job": {
        const chance = 46 + (state.stats.mood - 50) * 0.12 + traitBonus("workBias") + state.stats.reputation * 0.2;
        if (roll(chance)) {
          state.work.status = "שכיר"; state.work.monthlySalary = Math.max(state.work.monthlySalary, randInt(9000, 14500)); state.work.performance = clamp(state.work.performance + 3, 0, 100);
          return result("מצאת כיוון עבודה טוב.", { stress: -2, reputation: 2, mood: 3, cashflow: 2 });
        }
        return result("עוד לא נסגרה עבודה.", { stress: 2, energy: -3, mood: -2 });
      }
      case "ask_raise": {
        const chance = 40 + state.work.performance * 0.35 + state.stats.reputation * 0.2 + traitBonus("workBias");
        if (roll(chance)) {
          state.work.monthlySalary += randInt(1200, 2800);
          state.work.status = state.work.monthlySalary > 18000 ? "תפקיד בכיר" : state.work.status;
          return result("קיבלת שיפור בתנאים.", { trust: 2, stress: -1, reputation: 2, mood: 2 });
        }
        return result("הבקשה נדחתה כרגע.", { stress: 3, reputation: -2, mood: -2 });
      }
      case "switch_job": {
        const d = randInt(-2500, 4200);
        state.work.monthlySalary = Math.max(0, state.work.monthlySalary + d);
        state.work.status = state.work.monthlySalary > 0 ? (state.work.monthlySalary > 18000 ? "תפקיד בכיר" : "שכיר") : "ללא עבודה";
        return result("עברת מסלול עבודה.", { stress: 2, reputation: d >= 0 ? 2 : -2, mood: d >= 0 ? 3 : -3, cashflow: d >= 0 ? 2 : -2 });
      }
      case "overtime":
        state.work.performance = clamp(state.work.performance + 7, 0, 100);
        return result("נתת שעות נוספות.", { money: 1400, energy: -10, stress: 6, reputation: 2, cashflow: 2 });
      case "neglect_work":
        state.work.performance = clamp(state.work.performance - 10, 0, 100);
        return result("שחררת מהעבודה השבוע.", { energy: 5, stress: -3, reputation: -3, cashflow: -2, mood: 1 }, { clues: ["cl16"] });
      case "take_vacation_from_work":
        state.work.performance = clamp(state.work.performance - 3, 0, 100);
        return result("לקחת הפסקה קצרה.", { energy: 8, stress: -6, mood: 4, cashflow: -1 });

      case "romantic_message":
        remember(love, "הודעה קצרה פתחה דלת.");
        return result(`${love.name} ענה/תה מהר מהצפוי.`, { relationship: 4, stress: -1, exposure: 1, mood: 2 });
      case "private_meeting":
        adjustSuspicion("officialPartner", hasPartner ? 7 : 1);
        remember(love, "הפגישה הייתה קרובה מדי.");
        return result(`נפגשת עם ${love.name} בפרטיות.`, { relationship: 6, exposure: 4, stress: 1, energy: -2 }, { clues: ["cl12"] });
      case "ask_commitment": {
        const c = evaluateConsent(partner, "commitment");
        if (c.accepted) {
          state.flags.isDating = true;
          remember(partner, "נפתח דיבור רציני.");
          return result(`הייתה שיחה כנה עם ${partner.name}.`, { trust: 6 + traitBonus("trustBias") * 0.3, family: 4, relationship: 4, stress: -2 });
        }
        remember(partner, "השיחה הרגישה מוקדמת.");
        return result(`השיחה עם ${partner.name} הלכה קשה.`, { trust: -5, relationship: -3, stress: 4 });
      }
      case "move_in": {
        const c = evaluateConsent(partner, "move_in");
        if (c.accepted) {
          state.flags.isDating = true; state.flags.livingTogether = true;
          remember(partner, "עברתם לשלב משותף.");
          return result(`עברתם לגור יחד: אתה ו-${partner.name}.`, { family: 9, trust: 5, money: -2200, stress: 2, relationship: 5 });
        }
        return result(`הצעת מגורים יחד ו-${partner.name} לא היה/הייתה מוכן/ה.`, { trust: -6, relationship: -4, stress: 5 });
      }
      case "propose_marriage": {
        const c = evaluateConsent(partner, "marriage");
        if (c.accepted) {
          state.flags.isDating = true; state.flags.isMarried = true; state.flags.livingTogether = true;
          unlockAchievement("a_wedding");
          remember(partner, "אמרתם כן.");
          return result(`הצעת נישואין ל-${partner.name} וקיבלת כן.`, { trust: 8, family: 12, stress: -2, money: -3500, relationship: 6 });
        }
        state.flags.breakupThreat = true;
        return result(`הצעת נישואין ו-${partner.name} לקח/ה צעד אחורה.`, { trust: -9, relationship: -7, stress: 7, family: -3 });
      }
      case "try_kid": {
        const c = evaluateConsent(partner, "kid");
        if (c.accepted) {
          state.flags.hasKids = true; state.childrenCount += 1;
          unlockAchievement("a_first_kid");
          remember(partner, "קיבלתם החלטה משפחתית גדולה.");
          return result("החלטתם לגדול כמשפחה.", { family: 12, trust: 4, money: -2800, stress: 8, energy: -6, relationship: 3 }, { clues: ["cl08"] });
        }
        return result("השיחה על ילד הייתה כבדה מדי כרגע.", { trust: -4, stress: 4, relationship: -2 });
      }

      case "open_relationship": {
        const c = evaluateConsent(partner, "open");
        if (c.accepted) {
          state.flags.openRelationship = true;
          remember(partner, "נפתחו כללים חדשים.");
          return result(`הייתה הסכמה זהירה בינך לבין ${partner.name}.`, { relationship: 4, trust: 1, exposure: 4, stress: 1 });
        }
        adjustSuspicion("officialPartner", 8);
        return result(`ההצעה לא התקבלה טוב אצל ${partner.name}.`, { trust: -8, stress: 6, relationship: -4 }, { clues: ["cl22"] });
      }
      case "propose_threesome": {
        const c = evaluateConsent(partner, "threesome");
        if (c.accepted) { state.flags.openRelationship = true; return result("הייתה שיחה פתוחה ומפתיעה.", { relationship: 5, exposure: 5, stress: 2, trust: 1 }, { clues: ["cl38"] }); }
        adjustSuspicion("officialPartner", 10);
        return result("ההצעה יצרה מרחק מיידי.", { trust: -10, relationship: -6, stress: 7, family: -3 });
      }
      case "initiate_intimacy": {
        const good = state.stats.relationship >= 45 || love.desire >= 60;
        if (good) {
          adjustSuspicion("officialPartner", hasPartner ? 6 : 0);
          remember(love, "המרחק ביניכם הצטמצם.");
          return result("המרחק ביניכם הצטמצם.", { relationship: 7, stress: -5, exposure: 3, mood: 3 });
        }
        return result("זה הרגיש קרוב מדי מוקדם מדי.", { relationship: -2, trust: -4, stress: 5 });
      }
      case "stay_night":
        adjustSuspicion("officialPartner", hasPartner ? 12 : 3);
        remember(love, "לילה ארוך השאיר סימן.");
        return result(`נשארת עד מאוחר עם ${love.name}.`, { relationship: 8, exposure: 6, stress: 2, energy: -7, mood: 3 }, { clues: ["cl33"] });
      case "break_boundary":
        state.flags.affairSuspected = true;
        adjustSuspicion("officialPartner", hasPartner ? 18 : 7);
        return result("שברת גבול שהיה חשוב לשמור.", { relationship: 10, trust: -8, exposure: 9, stress: 5 }, { clues: ["cl06"] });
      case "stay_professional":
        adjustSuspicion("officialPartner", -10);
        return result("שמרת קו מקצועי וברור.", { trust: 4, exposure: -4, relationship: -1, stress: -2 });
      case "set_boundary":
        adjustSuspicion("officialPartner", -7);
        return result("שמת גבול נקי בזמן.", { trust: 3, stress: -3, exposure: -2, relationship: -2 });
      case "pull_back":
        return result("לקחת צעד אחורה.", { stress: -4, exposure: -2, relationship: -5, mood: -1 });

      case "start_affair":
        state.flags.affairActive = true; state.flags.affairSuspected = hasPartner;
        if (hasPartner) adjustSuspicion("officialPartner", 20 + Math.round(traitBonus("affairBias") * -0.2));
        unlockAchievement("a_affair");
        remember(love, "נפתח ערוץ סודי.");
        return result("פתחת רומן נסתר.", { relationship: 8, exposure: 7, trust: hasPartner ? -10 : -2, stress: 4, mood: 3 }, { clues: ["cl31"] });
      case "hide_affair":
        if (!state.flags.affairActive) return result("ניסית לסדר קצוות שלא באמת פתוחים.", { stress: 1, trust: -1 });
        if (roll(35 + state.stats.exposure * 0.35)) {
          adjustSuspicion("officialPartner", 14); state.flags.affairSuspected = true;
          return result("ההסתרה נראתה חשודה.", { exposure: 3, stress: 6, trust: -5 }, { clues: ["cl43"] });
        }
        adjustSuspicion("officialPartner", -4);
        return result("הצלחת להוריד רעש זמני.", { exposure: -4, stress: 2, trust: -1 });
      case "end_affair":
        if (!state.flags.affairActive) return result("סגרת דלת שהייתה כבר סגורה.", { stress: -1, trust: 1 });
        state.flags.affairActive = false; state.flags.affairSuspected = false;
        adjustSuspicion("officialPartner", -12);
        return result("סיימת את הרומן.", { relationship: -7, stress: -4, trust: 3, family: 2 });

      case "exercise": return result("עשית אימון והגוף נרגע.", { health: 8, energy: 5, stress: -5, mood: 4 });
      case "sleep_early": return result("נתת לעצמך לילה רגוע.", { energy: 9, stress: -4, mood: 3, health: 2 });
      case "party":
        adjustSuspicion("officialPartner", hasPartner ? 4 : 1);
        return result("יצאת ושחררת קצת.", { social: 7, mood: 6, exposure: 6, money: -700, energy: -4, stress: -1 }, { clues: ["cl18"] });
      case "social_media":
        if (roll(45 + state.stats.reputation * 0.3 - state.stats.exposure * 0.15)) return result("הפוסט עבד לטובתך.", { reputation: 4, social: 3, exposure: 2, mood: 2 });
        return result("הפוסט משך תשומת לב לא טובה.", { exposure: 5, trust: -2, stress: 2, reputation: -2 }, { clues: ["cl35"] });
      case "meet_friends": return result("מפגש חברים הוריד עומס.", { social: 5, stress: -5, mood: 4, trust: 1 });
      case "doctor_visit": return result("בדיקה שקטה שיפרה ביטחון.", { money: -900, health: 10, stress: -2, energy: 2 });
      case "family_vacation": return result("לקחתם חופשה משפחתית קצרה.", { money: -2600, family: 10, trust: 4, stress: -6, energy: 3 });
      case "ignore_family": return result("בחרת שוב עבודה לפני בית.", { money: 1600, family: -8, trust: -4, stress: 4, reputation: 1 }, { clues: ["cl36"] });

      case "buy_apartment": return buyAsset("apartment");
      case "buy_car": return buyAsset("car");
      case "buy_rental": return buyAsset("rental_unit");
      case "buy_office": return buyAsset("office");
      case "renovate": return renovateAsset();
      case "rent_asset": return rentAsset();
      case "sell_asset": return sellAsset();
      default: return result("לא קרה שינוי משמעותי.", {});
    }
  }

  function buyAsset(id) {
    const a = ASSET_CATALOG[id];
    if (!a) return result("הנכס לא זמין.", {});
    addAsset(id, 1);
    const price = a.value;
    const shortage = Math.max(0, price - state.stats.money);
    const debtAdd = shortage > 0 ? Math.round(shortage * 1.1) : 0;
    return result(`קנית ${a.name}.`, { money: -price, debts: debtAdd, stress: 3, reputation: a.reputation, cashflow: a.monthlyCashflow > 0 ? 1 : -1 }, { clues: id === "apartment" ? ["cl40"] : [] });
  }

  function renovateAsset() {
    const hasAny = getAssetCount("apartment") + getAssetCount("rental_unit") + getAssetCount("office") > 0;
    if (!hasAny) return result("עשית שדרוג קטן בלי נכס משמעותי.", { money: -1200, reputation: 1, stress: 1 });
    addAsset("renovation", 1);
    return result("ביצעת שיפוץ ששיפר ערך.", { money: -15000, reputation: 3, stress: 2, assets: 6000, cashflow: 1 });
  }

  function rentAsset() {
    const count = getAssetCount("rental_unit") + getAssetCount("apartment");
    if (count <= 0) return result("פרסמת מודעה בלי נכס מתאים.", { stress: 1, reputation: -1 });
    return result("סגרת השכרה לחודש הקרוב.", { cashflow: 3, stress: -1, reputation: 2, exposure: 1 }, { clues: ["cl24"] });
  }

  function sellAsset() {
    const owned = Object.keys(ASSET_CATALOG).find((k) => getAssetCount(k) > 0);
    if (!owned) return result("אין נכס למכור כרגע.", { stress: 1 });
    removeAsset(owned, 1);
    const a = ASSET_CATALOG[owned];
    const ret = Math.round(a.value * randRange(0.68, 0.92));
    return result(`מכרת ${a.name}.`, { money: ret, stress: -2, reputation: -1, cashflow: a.monthlyCashflow > 0 ? -2 : 0 });
  }

  function finishWeek() {
    if (state.phase !== PHASES.RUNNING) return;
    if (!state.situationAnswered && state.currentSituation) {
      const fallback = state.currentSituation.choices[state.currentSituation.defaultChoice || 0] || { text: "לא הגבת בזמן.", effects: { stress: 2, trust: -1 }, label: "לא הגבת" };
      applyOutcome(fallback, { source: "תגובה אוטומטית", logToWeekActions: true, feedbackTitle: "לא נבחרה תגובה" });
      state.weekEventLog.push("התגובה למצב נבחרה אוטומטית.");
      state.situationAnswered = true;
    }

    const reactive = runReactiveCharacterAction();
    if (reactive) { applyOutcome(reactive, { source: "תגובה מאדם קרוב", feedbackTitle: "תגובה רגשית" }); state.weekEventLog.push(`תגובה דינמית: ${reactive.text}`); }

    const rnd = rollRandomEvent();
    if (rnd) { applyOutcome(rnd, { source: "אירוע שבועי", feedbackTitle: "אירוע שבועי" }); state.weekEventLog.push(`אירוע: ${rnd.text}`); }

    applyBackgroundDrift();
    processSuspicionChains();
    if (state.week % WEEKS_IN_MONTH === 0) applyMonthlyCycle(); else state.currentMonthlySummary = "";

    recalcAssetsStat();
    state.currentSummary = buildWeeklySummary();
    state.phase = PHASES.RESULT;
    checkWarnings();
    checkAchievements();

    const end = checkEnding();
    if (end) finalizeEnding(end);

    saveRunSafe();
    renderAll();
  }

  function moveToNextWeek() {
    if (state.phase !== PHASES.RESULT) return;
    state.week += 1;
    state.month = Math.floor((state.week - 1) / WEEKS_IN_MONTH) + 1;
    state.actionPoints = MAX_ACTION_POINTS;
    state.weekActionLog = [];
    state.weekEventLog = [];
    state.actionFeedback = [];
    state.weekMeta = defaultWeekMeta();
    state.weekStartSnapshot = clone(state.stats);
    state.currentSummary = null;

    if (!state.freeMode && state.week > MAX_WEEKS) {
      finalizeEnding(chooseLateEnding());
      saveRunSafe();
      renderAll();
      return;
    }

    state.currentSituation = generateSituation();
    state.situationAnswered = false;
    state.phase = PHASES.RUNNING;
    saveRunSafe();
    renderAll();
  }

  function runReactiveCharacterAction() {
    Object.keys(state.characters).forEach((role) => updateCharacterMind(state.characters[role], role));
    const partner = state.characters.officialPartner;
    const love = state.characters.loveInterest;
    const business = state.characters.businessPartner;
    const fam = state.characters.familyMember;

    if (partner.suspicion >= 65) return result(`${partner.name} אמר/ה: "אני מרגיש/ה שמשהו לא בסדר".`, { stress: 5, trust: -4, relationship: -2 }, { clues: ["cl15"] });

    const picked = weightedPick([
      { weight: 26, role: "loveInterest", type: "romance" },
      { weight: 28, role: "officialPartner", type: "partner" },
      { weight: 22, role: "businessPartner", type: "business" },
      { weight: 24, role: "familyMember", type: "family" }
    ]);
    if (!picked) return null;

    if (picked.type === "romance") {
      const text = pick([`"בוא/י ניפגש מאוחר", כתב/ה ${love.name}.`, `${love.name} אמר/ה: "אני רוצה יותר רצינות".`, `${love.name} לחש/ה: "אולי ננסה משהו חדש".`]);
      return result(text, roll(50 + love.desire * 0.25) ? { relationship: 4, stress: -2, exposure: 2 } : { relationship: -2, stress: 3, trust: -1 }, { clues: roll(20) ? ["cl02"] : [] });
    }
    if (picked.type === "partner") {
      const hasPartner = state.flags.isDating || state.flags.isMarried;
      return result(hasPartner ? `${partner.name} אמר/ה: "בוא/י נעשה סדר בינינו".` : `${partner.name} בודק/ת אם אתה באמת שם.`, hasPartner ? { trust: 3, family: 3, stress: -1 } : { trust: 1, relationship: 1, stress: 0 }, { clues: roll(16) ? ["cl38"] : [] });
    }
    if (picked.type === "business") return result(`${business.name} הציע/ה מהלך עסקי לשבוע הבא.`, roll(55 + state.stats.reputation * 0.2) ? { cashflow: 3, reputation: 2, stress: 1 } : { cashflow: -2, stress: 3, exposure: 2 }, { clues: roll(20) ? ["cl39"] : [] });
    return result(`${fam.name} אמר/ה: "אתה חסר בבית".`, roll(45 + state.stats.family * 0.2) ? { family: 4, trust: 2, stress: -2 } : { family: -3, trust: -2, stress: 3 }, { clues: roll(15) ? ["cl26"] : [] });
  }

  function updateCharacterMind(ch, role) {
    const hasPartner = state.flags.isDating || state.flags.isMarried;
    ch.stress = clamp(ch.stress + (state.stats.stress - 50) * 0.05 + randRange(-2, 2), 0, 100);
    ch.trust = clamp(ch.trust + (state.stats.trust - 50) * 0.04 - (state.flags.affairActive ? 0.8 : 0), 0, 100);
    ch.jealousy = clamp(ch.jealousy + (state.stats.exposure - 45) * 0.06 + (state.flags.affairActive ? 2 : 0), 0, 100);
    ch.desire = clamp(ch.desire + (state.stats.relationship - 50) * 0.06 + randRange(-2, 2), 0, 100);
    if (role === "officialPartner" && hasPartner) {
      const gain = (state.flags.affairActive ? 5 : 0) + (state.weekMeta.lateNightActions > 0 ? 4 : 0) + (state.stats.exposure > 70 ? 2 : 0) + (state.stats.trust < 35 ? 3 : 0);
      ch.suspicion = clamp(ch.suspicion + gain - (state.weekMeta.professionalActions > 0 ? 3 : 0), 0, 100);
    }
    if (role === "businessPartner") {
      ch.ambition = clamp(ch.ambition + (state.stats.reputation > 60 ? 1.5 : -0.5), 0, 100);
      ch.suspicion = clamp(ch.suspicion + (state.stats.exposure > 75 ? 3 : 0), 0, 100);
    }
    ch.anger = clamp(ch.anger + (ch.jealousy > 65 ? 2 : -1) + (ch.suspicion > 70 ? 2 : 0), 0, 100);
    ch.mood = clamp(55 + (ch.trust - ch.anger) * 0.4 - ch.stress * 0.2 + randRange(-4, 4), 0, 100);
    if (roll(10 + ch.mood * 0.1)) remember(ch, pick(["בוא נעבור לגור יחד", "אני רוצה יותר רצינות", "אולי ננסה משהו חדש", "אני מרגיש שמשהו לא בסדר"]));
  }

  function processSuspicionChains() {
    const p = state.characters.officialPartner;
    if (!p) return;
    if (p.suspicion > 80) unlockAchievement("a_almost_caught");
    if (p.suspicion >= 92) {
      state.flags.caughtCheating = true;
      state.flags.affairSuspected = true;
      if (state.flags.isMarried && roll(58)) {
        state.flags.isMarried = false; state.flags.isDating = false; state.flags.livingTogether = false; state.flags.breakupThreat = true;
        applyEffects({ family: -22, trust: -18, stress: 12, exposure: 8 }, "עימות כבד");
        state.weekEventLog.push("עימות חריף בבית. הקשר הרשמי נשבר.");
        addClueById("cl41");
        return;
      }
      if (roll(42 + state.stats.exposure * 0.25)) {
        state.flags.blackmailRisk = true;
        applyEffects({ stress: 10, exposure: 9, money: -4500, trust: -8 }, "סחיטה");
        state.weekEventLog.push("מישהו רמז שיש לו חומר עליך.");
        addClueById("cl41");
      }
      return;
    }
    if (p.suspicion >= 78) {
      state.flags.breakupThreat = true;
      applyEffects({ stress: 6, trust: -6, relationship: -4, family: -5 }, "איום פרידה");
      state.weekEventLog.push("הייתה שיחה קשה מאוד על אמון.");
      addClueById("cl22");
      return;
    }
    if (p.suspicion >= 65) {
      applyEffects({ stress: 3, trust: -3 }, "אזהרה זוגית");
      state.weekEventLog.push("קיבלת אזהרה ברורה מהצד השני.");
    }
  }

  function rollRandomEvent() {
    const category = weightedRandomCategory();
    const text = pick(EVENT_TEXTS[category]);
    const effects = eventEffectsByCategory(category);
    const clues = [];
    if (roll(8)) clues.push(findUndiscoveredClueByCategory("חשיפה", 2));
    if (roll(5)) clues.push(findUndiscoveredClueByCategory("ביזנס", 2));
    return result(text, effects, { clues: clues.filter(Boolean) });
  }

  function weightedRandomCategory() {
    const w = {
      business_success: 11 + state.stats.reputation * 0.12,
      business_crisis: 10 + (100 - state.stats.cashflow) * 0.14,
      family_emergency: 9 + (100 - state.stats.family) * 0.13,
      health_issue: 8 + (100 - state.stats.health) * 0.14,
      gossip: 8 + state.stats.exposure * 0.12,
      legal_risk: 7 + state.stats.exposure * 0.1 + (state.flags.legalRisk ? 8 : 0),
      romantic_tension: 9 + state.stats.relationship * 0.11 + (state.flags.affairActive ? 8 : 0),
      surprise_opportunity: 8 + state.stats.reputation * 0.1,
      betrayal: 7 + (100 - state.stats.trust) * 0.12,
      sudden_expense: 8 + (100 - state.stats.cashflow) * 0.1
    };
    return (weightedPick(Object.keys(w).map((k) => ({ role: k, weight: Math.max(1, w[k]) }))) || { role: "business_crisis" }).role;
  }

  function eventEffectsByCategory(c) {
    switch (c) {
      case "business_success": return { money: randInt(900, 3600), cashflow: randInt(1, 4), reputation: randInt(1, 4), stress: randInt(-2, 1) };
      case "business_crisis": addClueById("cl03"); return { money: -randInt(1200, 4800), cashflow: -randInt(1, 5), stress: randInt(3, 8), reputation: -randInt(1, 3) };
      case "family_emergency": addClueById("cl40"); return { money: -randInt(700, 3200), family: -randInt(1, 4), stress: randInt(3, 7), trust: -randInt(1, 3) };
      case "health_issue": return { health: -randInt(2, 8), energy: -randInt(3, 8), stress: randInt(2, 6) };
      case "gossip": addClueById("cl18"); return { exposure: randInt(2, 7), reputation: -randInt(1, 4), stress: randInt(1, 5) };
      case "legal_risk": state.flags.legalRisk = true; addClueById("cl17"); return { money: -randInt(1200, 5000), exposure: randInt(2, 6), stress: randInt(4, 8), trust: -randInt(1, 3) };
      case "romantic_tension": addClueById("cl12"); adjustSuspicion("officialPartner", state.flags.isDating || state.flags.isMarried ? 5 : 1); return { relationship: randInt(1, 6), exposure: randInt(1, 5), stress: randInt(-2, 4), mood: randInt(1, 4) };
      case "surprise_opportunity": return { money: randInt(700, 4200), cashflow: randInt(1, 3), investments: randInt(1, 4), mood: randInt(1, 3) };
      case "betrayal": addClueById("cl29"); return { trust: -randInt(3, 8), exposure: randInt(2, 6), stress: randInt(3, 8), reputation: -randInt(1, 4) };
      default: return { money: -randInt(900, 4600), stress: randInt(2, 6), cashflow: -randInt(1, 3) };
    }
  }

  function applyBackgroundDrift() {
    const e = { energy: -1 };
    if (state.stats.debts > 0) { e.stress = (e.stress || 0) + 2; e.cashflow = (e.cashflow || 0) - 1; }
    if (state.stats.cashflow < 35) e.stress = (e.stress || 0) + 1;
    if (state.weekMeta.actionCount === 0) { e.reputation = (e.reputation || 0) - 2; e.mood = (e.mood || 0) - 2; e.stress = (e.stress || 0) + 2; }
    if (state.weekMeta.romanceActions === 0 && state.flags.isDating) e.relationship = (e.relationship || 0) - 1;
    if (state.stats.relationship > 65) e.stress = (e.stress || 0) - 1;
    if (state.stats.health < 35) { e.energy = (e.energy || 0) - 3; e.stress = (e.stress || 0) + 2; }
    if (state.flags.affairActive && state.childrenCount > 0) { e.stress = (e.stress || 0) + 3; adjustSuspicion("officialPartner", 5); }
    if (state.flags.openRelationship) { e.exposure = (e.exposure || 0) + 1; e.relationship = (e.relationship || 0) + 1; }
    applyEffects(e, "דינמיקה שבועית");
    state.weekEventLog.push("עדכון רקע: לחץ, אנרגיה וקשרים השתנו קצת.");
  }

  function applyMonthlyCycle() {
    recalcAssetsStat();
    const salary = state.work.monthlySalary;
    const businessIncome = calculateBusinessIncome();
    const investmentReturn = calculateInvestmentReturn();
    const assetIncome = calculateAssetIncome();
    const assetUpkeep = calculateAssetUpkeep();
    const debtPayment = Math.min(state.stats.debts, Math.max(800, Math.round(state.stats.debts * 0.05)));
    const familyCosts = 1800 + (state.flags.isMarried ? 1200 : 0) + state.childrenCount * 2200;
    const baseCosts = 2600;
    const net = salary + businessIncome + investmentReturn + assetIncome - assetUpkeep - debtPayment - familyCosts - baseCosts;
    applyEffects({ money: net, debts: -debtPayment, cashflow: net > 0 ? 4 : -4, stress: net > 0 ? -2 : 4, family: state.childrenCount > 0 ? 1 : 0 }, "סיכום חודשי");
    state.work.businessIncome = businessIncome;
    state.finance.lastInvestmentResult = investmentReturn;
    if (state.stats.money < 0) applyEffects({ debts: Math.round(Math.abs(state.stats.money) * 0.12), stress: 2 }, "גלגול מינוס");
    if (businessIncome > 15000) unlockAchievement("a_business");
    state.currentMonthlySummary = `שכר ${formatCurrency(salary)}, עסק ${formatCurrency(businessIncome)}, השקעות ${formatCurrency(investmentReturn)}, נכסים ${formatCurrency(assetIncome - assetUpkeep)}. נטו החודש: ${formatCurrency(net)}.`;
    state.weekEventLog.push("סיכום חודש הוחל על כל המערכות.");
  }

  function calculateBusinessIncome() {
    if (!state.work.businessOpen) return 0;
    const base = 2500 + state.work.businessLevel * 1800;
    return Math.max(-2500, Math.round(base * (1 + state.stats.reputation / 180) * (1 + state.stats.cashflow / 220) * (1 - Math.max(0, state.stats.stress - 65) / 220) + randInt(-1200, 1900)));
  }

  function calculateInvestmentReturn() {
    const cap = state.finance.investedCapital;
    if (cap <= 0) return 0;
    let rate = 0.01 + state.finance.riskLevel / 600 + state.stats.reputation / 1800 + randRange(-0.08, 0.09) + (state.stats.exposure > 70 ? -0.02 : 0);
    if (state.flags.legalRisk && state.finance.riskLevel > 60) { rate -= 0.03; addClueById("cl13"); }
    const out = Math.round(cap * rate);
    if (state.finance.riskLevel > 75 && state.stats.exposure > 70 && state.stats.trust < 35 && roll(26)) {
      state.flags.legalRisk = true;
      addClueById("cl42");
      applyEffects({ exposure: 5, stress: 6, trust: -4 }, "בדיקה על השקעות");
      state.weekEventLog.push("ההשקעות שלך משכו תשומת לב לא טובה.");
    }
    return out;
  }

  function calculateAssetIncome() {
    let t = getAssetCount("rental_unit") * ASSET_CATALOG.rental_unit.monthlyCashflow + getAssetCount("office") * ASSET_CATALOG.office.monthlyCashflow + getAssetCount("renovation") * ASSET_CATALOG.renovation.monthlyCashflow;
    if (state.flags.livingTogether && getAssetCount("apartment") > 0) t += 400;
    return t;
  }

  function calculateAssetUpkeep() {
    let total = 0;
    Object.keys(ASSET_CATALOG).forEach((id) => { total += getAssetCount(id) * ASSET_CATALOG[id].upkeep; });
    return total;
  }

  function buildWeeklySummary() {
    const start = state.weekStartSnapshot || clone(state.stats);
    const end = clone(state.stats);
    const deltas = {};
    Object.keys(end).forEach((k) => { deltas[k] = (end[k] || 0) - (start[k] || 0); });
    const events = [];
    state.weekActionLog.slice(-3).forEach((l) => events.push(l));
    state.weekEventLog.slice(-3).forEach((l) => events.push(l));
    if (!events.length) events.push("שבוע שקט יחסית.");
    return { start, end, deltas, events };
  }

  function generateSituation() {
    const w = { work: 1, business: 1, investments: 1, family: 1, romance: 1, exposure: 1 };
    if (state.stats.stress > 70) w.family += 0.5;
    if (state.stats.cashflow < 35) w.business += 0.7;
    if (state.flags.affairActive) w.romance += 0.8;
    if (state.stats.exposure > 60) w.exposure += 0.8;
    if (state.stats.investments > 55) w.investments += 0.5;
    const cat = (weightedPick(Object.keys(w).map((k) => ({ role: k, weight: w[k] }))) || { role: "work" }).role;
    const seed = pick(SITUATION_SEEDS.filter((s) => s.category === cat));
    const choices = clone(SITUATION_CHOICES[cat] || SITUATION_CHOICES.work).map((c) => ({ label: template(c.label), text: template(c.text), effects: c.effects || {}, clues: c.clues || [] }));
    return { id: seed.id, title: template(seed.title), textLines: [template(seed.text)], bullets: (seed.bullets || []).map((b) => template(b)), choices, defaultChoice: 1 };
  }

  function checkEnding() {
    const hasPartner = state.flags.isDating || state.flags.isMarried;
    if (state.stats.money <= -250000 && state.stats.debts >= 180000) return "financial_ruin";
    if (state.stats.stress >= 98 || (state.stats.energy <= 3 && state.stats.health <= 20)) return "burnout";
    if (state.stats.exposure >= 96 && state.stats.trust <= 15) return "public_scandal";
    if (state.flags.blackmailRisk && state.stats.money < 0 && state.stats.trust < 30) return "blackmail";
    if (state.flags.caughtCheating && hasPartner && state.stats.trust <= 20) return state.flags.isMarried ? "divorce" : "broken_trust";
    if (state.week < MIN_NORMAL_ENDING_WEEK) return null;
    if (state.stats.money >= 450000 && state.stats.assets >= 650000 && state.stats.reputation >= 75 && state.stats.stress <= 80) return "business_empire";
    if (state.flags.isMarried && state.childrenCount > 0 && state.stats.family >= 75 && state.stats.trust >= 60 && state.stats.exposure <= 55) return "stable_family";
    if (state.stats.money >= 220000 && state.stats.relationship >= 65 && state.stats.trust >= 62 && !state.flags.affairActive) return "happy_relationship";
    if (state.stats.exposure >= 88 && state.flags.legalRisk && state.clueIds.includes("cl42")) return "investigation";
    if (state.flags.affairActive && state.stats.relationship >= 70 && state.stats.exposure < 65 && state.week >= 80) return "double_life";
    if (state.stats.reputation >= 70 && state.work.monthlySalary >= 18000 && state.stats.energy >= 45 && state.stats.stress <= 70) return "work_hero";
    if (state.stats.money >= 300000 && state.stats.trust < 35 && state.stats.family < 40) return "cold_money";
    if (state.flags.isMarried && state.stats.family >= 70 && state.stats.money < 180000 && state.week >= 70) return "family_over_money";
    if (state.clueIds.includes("cl41") && state.clueIds.includes("cl29") && state.stats.exposure > 70) return "scandal_collapse";
    if (state.stats.money < 50000 && state.stats.stress > 75 && state.stats.trust < 40 && state.week >= 75) return "quiet_survival";
    if (state.stats.money < 0 && state.stats.trust > 50 && state.stats.reputation > 55 && state.week >= 85) return "redemption";
    if (state.flags.legalRisk && state.stats.exposure < 60 && state.clueIds.includes("cl10") && state.week >= 80) return "legal_escape";
    if (state.stats.trust <= 22 && state.stats.relationship <= 18 && state.week >= 70) return "isolation";
    if (!state.freeMode && state.week >= MAX_WEEKS) return chooseLateEnding();
    return null;
  }

  function chooseLateEnding() {
    if (state.stats.money > 200000 && state.stats.reputation > 65) return "long_run";
    if (state.stats.family > 65) return "stable_family";
    if (state.stats.trust > 55) return "quiet_survival";
    return "long_run";
  }

  function finalizeEnding(id) {
    const end = ENDINGS.find((e) => e.id === id) || ENDINGS[ENDINGS.length - 1];
    state.phase = PHASES.ENDED;
    state.ending = end;
    if (!meta.unlockedEndings.includes(end.id)) { meta.unlockedEndings.push(end.id); meta.endlessUnlocked = true; saveMeta(); }
    saveRunSafe();
    toast(`סיומת נפתחה: ${end.title}`);
  }

  function checkAchievements() {
    if (getAssetCount("apartment") > 0) unlockAchievement("a_apartment");
    if (state.stats.money <= -30000) unlockAchievement("a_fin_crash");
  }

  function unlockAchievement(id) {
    if (!id || meta.unlockedAchievements.includes(id)) return;
    meta.unlockedAchievements.push(id);
    state.unlockedAchievements = meta.unlockedAchievements.slice();
    saveMeta();
    const ach = ACHIEVEMENTS.find((a) => a.id === id);
    if (ach) toast(`הישג נפתח: ${ach.title}`);
  }

  function addClueById(id) {
    if (!id || state.clueIds.includes(id)) return;
    const clue = CLUE_BANK.find((c) => c.id === id);
    if (!clue) return;
    state.clues.push({ id: clue.id, text: clue.text, severity: clue.severity, category: clue.category, discoveredAtWeek: state.week });
    state.clueIds.push(clue.id);
    toast(`רמז חדש: ${clue.text}`);
  }

  function findUndiscoveredClueByCategory(category, minSeverity) {
    const arr = CLUE_BANK.filter((c) => c.category === category && c.severity >= (minSeverity || 1) && !state.clueIds.includes(c.id));
    return arr.length ? pick(arr).id : null;
  }

  function applyEffects(effects, source) {
    Object.keys(effects).forEach((k) => {
      const d = Number(effects[k]);
      if (!Number.isFinite(d) || d === 0 || !(k in state.stats)) return;
      let next = state.stats[k] + d;
      if (PERCENT_KEYS.has(k)) next = clamp(next, 0, 100);
      state.stats[k] = next;
    });
    recalcAssetsStat();
    if (source) {
      state.history.push({ week: state.week, title: source, choice: effectsToText(effects) });
      if (state.history.length > 220) state.history = state.history.slice(-220);
    }
  }

  function recalcAssetsStat() {
    let total = 0;
    Object.keys(ASSET_CATALOG).forEach((id) => { total += getAssetCount(id) * ASSET_CATALOG[id].value; });
    if (state.work.businessOpen) total += state.work.businessLevel * 55000;
    state.stats.assets = total;
  }

  function addAsset(id, count) {
    const cur = state.assetsOwned.find((x) => x.id === id);
    if (cur) cur.count += count; else state.assetsOwned.push({ id, count });
  }

  function removeAsset(id, count) {
    const cur = state.assetsOwned.find((x) => x.id === id);
    if (!cur) return;
    cur.count -= count;
    if (cur.count <= 0) state.assetsOwned = state.assetsOwned.filter((x) => x.id !== id);
  }

  function getAssetCount(id) {
    const cur = state.assetsOwned.find((x) => x.id === id);
    return cur ? cur.count : 0;
  }

  function adjustSuspicion(role, d) {
    const c = state.characters[role];
    if (c) c.suspicion = clamp(c.suspicion + d, 0, 100);
  }

  function evaluateConsent(c, kind) {
    const base = c.trust * 0.3 + c.attraction * 0.24 + c.desire * 0.2 + c.openness * 0.16 + (100 - c.jealousy) * 0.1 + c.mood * 0.12 - c.anger * 0.17 - c.stress * 0.08;
    let th = 52;
    if (kind === "move_in") th = 56;
    if (kind === "marriage") th = 64;
    if (kind === "kid") th = 66;
    if (kind === "open") th = 72;
    if (kind === "threesome") th = 78;
    if (["open", "threesome"].includes(kind) && c.morality > 65) th += 8;
    const hasPartner = state.flags.isDating || state.flags.isMarried;
    if (["open", "threesome"].includes(kind) && hasPartner && !state.flags.openRelationship) th += 4;
    const score = base + randRange(-12, 12) + state.stats.mood * 0.08 + traitBonus("trustBias");
    return { accepted: score >= th, score, threshold: th };
  }

  function generateCharacters() {
    const used = new Set();
    return {
      loveInterest: randomCharacter(pickUniqueName(used), "loveInterest", { attraction: 62, desire: 60, trust: 48, openness: 55 }),
      officialPartner: randomCharacter(pickUniqueName(used), "officialPartner", { trust: 58, jealousy: 42, morality: 60, openness: 40 }),
      businessPartner: randomCharacter(pickUniqueName(used), "businessPartner", { ambition: 68, trust: 50, morality: 48 }),
      familyMember: randomCharacter(pickUniqueName(used), "familyMember", { trust: 60, jealousy: 30, morality: 66 })
    };
  }

  function randomCharacter(name, role, overrides) {
    return Object.assign({ name, role, attraction: randInt(35, 75), trust: randInt(35, 70), jealousy: randInt(20, 65), anger: randInt(10, 35), desire: randInt(30, 70), ambition: randInt(35, 75), morality: randInt(35, 75), openness: randInt(30, 70), stress: randInt(20, 55), mood: randInt(40, 65), suspicion: randInt(8, 20), memory: [] }, overrides || {});
  }

  function pickUniqueName(used) {
    const all = [...NAME_POOLS.male, ...NAME_POOLS.female, ...NAME_POOLS.neutral];
    const options = all.filter((n) => !used.has(n));
    const chosen = pick(options.length ? options : all);
    used.add(chosen);
    return chosen;
  }

  function hydrateCharacters(chars) {
    Object.keys(chars).forEach((k) => {
      const b = chars[k] || {};
      chars[k] = Object.assign(randomCharacter(b.name || k, b.role || k), b);
      if (!Array.isArray(chars[k].memory)) chars[k].memory = [];
    });
  }

  function remember(c, line) {
    if (!c || !line) return;
    c.memory.push(line);
    if (c.memory.length > 16) c.memory = c.memory.slice(-16);
  }

  function traitBonus(key) {
    let t = 0;
    (state.traits || []).forEach((id) => {
      const f = TRAITS.find((x) => x.id === id);
      if (f && f.bonus) t += Number(f.bonus[key] || 0);
    });
    return t;
  }

  function coupleStatusLine() {
    if (state.flags.isMarried) return "נשוי/אה";
    if (state.flags.isDating) return "בזוגיות";
    if (state.flags.affairActive) return "רומן נסתר";
    return "לא יציב";
  }

  function checkWarnings() {
    thresholdWarning("moneyMinus", state.stats.money < 0, "אזהרה: כסף במינוס");
    thresholdWarning("cashflowCritical", state.stats.cashflow < 25, "אזהרה: תזרים קריטי");
    thresholdWarning("stressHigh", state.stats.stress > 85, "לחץ חריג");
    thresholdWarning("exposureHigh", state.stats.exposure > 75, "חשיפה גבוהה");
    thresholdWarning("trustLow", state.stats.trust < 25, "אמינות נשחקת");
    thresholdWarning("relationshipThin", state.stats.relationship > 80, "הגבול נהיה דק");
  }

  function thresholdWarning(key, condition, text) {
    const was = Boolean(state.alertState[key]);
    if (condition && !was) { toast(text, true); state.alertState[key] = true; return; }
    if (!condition && was) state.alertState[key] = false;
  }

  function toast(text, alert) {
    if (!DOM.toastBox) return;
    const div = document.createElement("div");
    div.className = `toast${alert ? " alert" : ""}`;
    div.textContent = text;
    DOM.toastBox.appendChild(div);
    window.setTimeout(() => div.remove(), 2500);
  }

  function openHelp() { if (DOM.helpDialog && !DOM.helpDialog.open) DOM.helpDialog.showModal(); }
  function closeHelp() { if (DOM.helpDialog && DOM.helpDialog.open) DOM.helpDialog.close(); }
  function applyTheme(t) { DOM.body.setAttribute("data-theme", t === "light" ? "light" : "dark"); }

  function template(v) {
    if (!v) return "";
    return String(v)
      .replaceAll("{love}", state.characters.loveInterest ? state.characters.loveInterest.name : "")
      .replaceAll("{partner}", state.characters.officialPartner ? state.characters.officialPartner.name : "")
      .replaceAll("{business}", state.characters.businessPartner ? state.characters.businessPartner.name : "")
      .replaceAll("{family}", state.characters.familyMember ? state.characters.familyMember.name : "");
  }

  function effectsToText(effects) {
    const arr = [];
    Object.keys(effects).forEach((k) => {
      const v = Number(effects[k]);
      if (!v) return;
      const l = STAT_LABELS[k] || k;
      arr.push(["money", "assets", "debts"].includes(k) ? `${l} ${signedCurrency(v)}` : `${l} ${signed(Math.round(v))}`);
    });
    return arr.join(" | ");
  }

  function charMoodText(c) { if (c.mood >= 75) return "רגוע/ה"; if (c.mood >= 55) return "בסדר"; if (c.mood >= 35) return "מתוח/ה"; return "כועס/ת"; }
  function suspicionText(v) { if (v >= 85) return "גבוה מאוד"; if (v >= 65) return "עולה"; if (v >= 40) return "בינוני"; return "נמוך"; }
  function signed(v) { return v > 0 ? `+${v}` : String(v); }
  function signedCurrency(v) { const r = Math.round(v); return r > 0 ? `+₪${r.toLocaleString("he-IL")}` : `-₪${Math.abs(r).toLocaleString("he-IL")}`; }
  function formatCurrency(v) { const r = Math.round(v); const a = Math.abs(r).toLocaleString("he-IL"); return r < 0 ? `-₪${a}` : `₪${a}`; }
  function roll(p) { return Math.random() * 100 < p; }
  function randInt(min, max) { return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) + Math.ceil(min); }
  function randRange(min, max) { return Math.random() * (max - min) + min; }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function pick(arr) { return arr && arr.length ? arr[randInt(0, arr.length - 1)] : null; }
  function weightedPick(items) {
    if (!items || !items.length) return null;
    const total = items.reduce((s, x) => s + Math.max(0, Number(x.weight) || 0), 0);
    if (total <= 0) return pick(items);
    let r = Math.random() * total;
    for (let i = 0; i < items.length; i += 1) {
      r -= Math.max(0, Number(items[i].weight) || 0);
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  }
  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function byId(id) { return document.getElementById(id); }
  function toggleHidden(el, hidden) { if (el) el.hidden = Boolean(hidden); }
})();
