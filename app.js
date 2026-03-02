(() => {
  'use strict';

  const STORAGE_RUN = 'kav_dak_run_v3';
  const STORAGE_META = 'kav_dak_meta_v3';

  const SPEED_MAP = {
    slow: 3,
    normal: 5,
    crazy: 8,
  };

  const STAT_META = [
    { key: 'happiness', label: 'אושר' },
    { key: 'health', label: 'בריאות' },
    { key: 'energy', label: 'אנרגיה' },
    { key: 'stress', label: 'לחץ' },
    { key: 'trust', label: 'כמה סומכים עליך' },
    { key: 'exposure', label: 'כמה יודעים עליך' },
    { key: 'reputation', label: 'מוניטין' },
    { key: 'relationship', label: 'קשר' },
    { key: 'family', label: 'משפחה' },
    { key: 'career', label: 'קריירה' },
    { key: 'investments', label: 'השקעות' },
  ];

  const STAT_LABELS = {
    money: 'כסף',
    happiness: 'אושר',
    health: 'בריאות',
    energy: 'אנרגיה',
    stress: 'לחץ',
    trust: 'כמה סומכים עליך',
    exposure: 'כמה יודעים עליך',
    reputation: 'מוניטין',
    relationship: 'קשר',
    family: 'משפחה',
    career: 'קריירה',
    investments: 'השקעות',
    debts: 'חובות',
    suspicion: 'חשד',
    scandalRisk: 'סיכון סקנדל',
    children: 'ילדים',
  };

  const TAB_ORDER = ['life', 'work', 'love', 'family', 'assets', 'health', 'education', 'business', 'investments', 'journal'];

  const TAB_LABELS = {
    life: 'חיים',
    work: 'עבודה',
    love: 'אהבה',
    family: 'משפחה',
    assets: 'נכסים',
    health: 'בריאות',
    education: 'לימודים',
    business: 'עסקים',
    investments: 'השקעות',
    journal: 'יומן',
  };

  const NAME_POOLS = {
    male: ['איתי', 'יונתן', 'נועם', 'אלון', 'רן', 'גיא', 'אורן', 'תומר', 'דניאל', 'ליאור', 'אביתר', 'אדם', 'מיכאל', 'עידו', 'שחר', 'עומרי', 'בר', 'יואב', 'אמיר', 'ניר', 'דור', 'יהב'],
    female: ['מאיה', 'נועה', 'רותם', 'שירה', 'ליה', 'יעל', 'טליה', 'דנה', 'אופיר', 'עמית', 'קרן', 'ליאור', 'איילת', 'נעמה', 'גילי', 'מיכל', 'אביגיל', 'נטע', 'אדר', 'סיון', 'רוני', 'עדן'],
    neutral: ['אריאל', 'שי', 'יובל', 'ניב', 'ים', 'ברי', 'הלל', 'לי', 'עדי', 'דרור', 'אור', 'שקד'],
  };

  const JOB_TITLES = ['ללא עבודה', 'נציג/ת שירות', 'אנליסט/ית', 'מנהל/ת צוות', 'מנהל/ת תחום', 'סמנכ"ל/ית'];

  const ASSET_CATALOG = {
    car: { key: 'car', name: 'רכב', price: 28000, maintenance: 2500, income: 0, rep: 3, stress: -2 },
    apartment: { key: 'apartment', name: 'דירה', price: 220000, maintenance: 8500, income: 12000, rep: 5, stress: -4 },
    smallOffice: { key: 'smallOffice', name: 'משרד קטן', price: 90000, maintenance: 6000, income: 6500, rep: 4, stress: 1 },
    premiumPhone: { key: 'premiumPhone', name: 'טלפון יקר', price: 4800, maintenance: 400, income: 0, rep: 2, stress: -1 },
    gamingPc: { key: 'gamingPc', name: 'מחשב חדש', price: 9500, maintenance: 600, income: 0, rep: 1, stress: -2 },
  };

  const PERKS = [
    { id: 'cash', label: '+₪12,000 פתיחה', apply: (s) => { s.stats.money += 12000; } },
    { id: 'social', label: '+10 אמון ומוניטין', apply: (s) => { s.stats.trust += 10; s.stats.reputation += 10; } },
    { id: 'wellbeing', label: '+10 בריאות ואנרגיה', apply: (s) => { s.stats.health += 10; s.stats.energy += 10; s.stats.happiness += 10; } },
  ];

  const CATEGORY_TITLES = {
    work: 'עבודה',
    money: 'כסף',
    love: 'אהבה',
    family: 'משפחה',
    health: 'בריאות',
    reputation: 'מוניטין',
    business: 'עסקים',
    investments: 'השקעות',
    lifestyle: 'חיים',
    education: 'לימודים',
  };

  const EVENT_PARTS = {
    work: {
      a: ['הבוס מבקש ממך לסגור משימה בדקה ה־90', 'קולגה זורק/ת הערה ליד כולם', 'לקוח חשוב מחכה לתשובה שלך', 'הצוות לחוץ ויש בלגן', 'מישהו בעבודה מנסה לעקוף אותך'],
      b: ['זה יכול לקדם אותך', 'זה גם יכול להתפוצץ עליך', 'כולם מסתכלים מה תעשה', 'זה משפיע על השם שלך', 'ההחלטה הזאת תיזכר'],
    },
    money: {
      a: ['הכרטיס חויב בסכום שלא ציפית', 'נפתחה הזדמנות להכנסה מהירה', 'מגיע תשלום ישן ששכחת ממנו', 'הבנק מציע מסלול חדש', 'חבר מציע "סידור"'],
      b: ['זה מרגיש טוב מדי', 'יש פה סיכון קטן', 'צריך להחליט עכשיו', 'אין זמן לבדיקה ארוכה', 'זה יכול לשנות את החודש'],
    },
    love: {
      a: ['{partner} שולח/ת הודעה מאוחרת', '{temptation} נשאר/ת לידך קצת יותר מהרגיל', 'המבט ביניכם לא יורד', 'אתם לבד בסוף ערב ארוך', 'הטלפון רוטט בזמן לא טוב'],
      b: ['זה מרגיש קרוב מדי', 'אפשר לשמור על גבול, או לא', 'מישהו עלול לראות', 'הלב שלך מגיב מהר', 'זה לא רגע תמים'],
    },
    family: {
      a: ['{family} מבקש/ת עזרה דחופה', 'יש מתח בבית כבר כמה ימים', 'שיחה משפחתית נהיית כבדה', 'נופל עליך עוד תשלום משפחתי', 'מזכירים לך שלא היית מספיק נוכח/ת'],
      b: ['אי אפשר לדחות יותר', 'אם תתחמק/י זה יחזור אליך', 'זה בודק את הגבולות שלך', 'כולם רוצים ממך משהו', 'זה פוגש אותך בעיתוי רע'],
    },
    health: {
      a: ['את/ה קם/ה עייף/ה מאוד', 'כאב קטן לא עובר כבר שבוע', 'השינה שלך נשברת בלילה', 'יש סימן שהגוף מבקש הפסקה', 'הלחץ יושב על הגוף'],
      b: ['אם תדחה/י, זה יגדל', 'כדאי לטפל בזה עכשיו', 'אפשר למשוך עוד קצת', 'הראש לא שקט', 'זה משפיע גם על מצב הרוח'],
    },
    reputation: {
      a: ['צילום מסך שלך מסתובב בקבוצה', 'מישהו מספר חצי אמת עליך', 'שם שלך עולה בשיחה לא נכונה', 'פוסט קטן מתחיל לרוץ', 'מכתב רשמי מגיע במייל'],
      b: ['כבר כמה אנשים שמעו', 'אפשר לסגור את זה בשקט', 'זה יכול להפוך לרעש', 'צריך תגובה חכמה', 'כל מילה פה חשובה'],
    },
    business: {
      a: ['נפתחת עסקה עם מרווח יפה', '{business} מציע/ה מהלך אגרסיבי', 'ספק מעלה מחיר בלי הודעה', 'עובד מבקש תנאים חדשים', 'פרויקט גדול נתקע באמצע'],
      b: ['הכסף שם, אבל הסיכון גם', 'אפשר לשמור על קצב בטוח', 'השם שלך על הכף', 'צריך לבחור שותפים נכון', 'טעות פה עולה ביוקר'],
    },
    investments: {
      a: ['נכס שנראה נקי מדי עולה על הרדאר', 'מניה חמה קופצת שוב', 'יש הצעת מינוף גבוהה', 'קרן חדשה מציגה תשואה מפתה', 'השוק זז מהר השבוע'],
      b: ['רווח מהיר לא תמיד נשאר', 'בדיקה עמוקה תעלה זמן', 'מי שנכנס מאוחר משלם', 'הזדמנות טובה או מלכודת', 'זה משחק עצבים'],
    },
    lifestyle: {
      a: ['חברים מושכים אותך ללילה ארוך', 'יש מחשבה לעבור עיר', 'הסופ"ש נפתח בלי תוכנית', 'הלו"ז נחנק ואת/ה רוצה לנשום', 'יש הזדמנות לחוויה חדשה'],
      b: ['זה יכול להרים אותך', 'זה גם יכול לשבור שגרה טובה', 'תלוי כמה רחוק תלך/י', 'הכול מתחיל בהחלטה קטנה', 'זה נראה תמים אבל לא בטוח'],
    },
    education: {
      a: ['נפתח קורס שיכול לעזור לקריירה', 'מרצה מציע/ה מסלול מהיר', 'יש בחינה שמתקרבת', 'חבר/ה מהלימודים מציע/ה לשתף חומר', 'מסלול חדש נהיה זמין'],
      b: ['צריך זמן ופוקוס', 'זה יעלה כסף', 'יכול לפתוח דלתות בהמשך', 'אפשר גם לוותר כרגע', 'הבחירה תשפיע על הקריירה'],
    },
  };

  const EVENT_TEMPLATES = buildEventTemplates();

  const ENDINGS = [
    { id: 'empire', title: 'אימפריה שקטה', summary: 'בנית עסק גדול ושמרת שליטה.', early: false, condition: (s) => s.stats.money >= 900000 && s.stats.career >= 85 && s.stats.reputation >= 75 && s.stats.exposure <= 60 },
    { id: 'rich_stable', title: 'עשיר/ה ויציב/ה', summary: 'יש כסף, יש בית, ויש שקט יחסי.', early: false, condition: (s) => s.stats.money >= 550000 && s.stats.family >= 65 && s.stats.health >= 55 },
    { id: 'rich_scandal', title: 'עשיר/ה אבל חשוף/ה', summary: 'הכסף הגיע, אבל כולם יודעים עליך.', early: false, condition: (s) => s.stats.money >= 600000 && s.stats.exposure >= 80 },
    { id: 'family_win', title: 'משפחה מעל הכול', summary: 'ויתרת על חלק מהחלומות ושמרת על הבית.', early: false, condition: (s) => s.stats.family >= 80 && s.relationship.children >= 1 && s.stats.stress <= 60 },
    { id: 'happy_love', title: 'אהבה יציבה', summary: 'הקשר החזיק והפך לבית בטוח.', early: false, condition: (s) => s.flags.isMarried && s.stats.relationship >= 75 && s.flags.affairActive === false },
    { id: 'double_life', title: 'חיים כפולים', summary: 'הצלחת להחזיק שני עולמות, בינתיים.', early: false, condition: (s) => s.flags.affairActive && s.hidden.suspicion < 55 && s.stats.exposure < 60 },
    { id: 'caught_scandal', title: 'נתפסת בגדול', summary: 'הרומן יצא החוצה ושבר הכול.', early: false, condition: (s) => s.flags.caughtCheating && s.stats.exposure >= 85 },
    { id: 'divorce_spiral', title: 'סחרור גירושים', summary: 'הקשר קרס והשלכות כלכליות הגיעו.', early: false, condition: (s) => s.flags.divorced && s.stats.money < 50000 && s.stats.stress >= 75 },
    { id: 'burnout', title: 'שחיקה מלאה', summary: 'הגוף והראש אמרו די.', early: true, condition: (s) => s.stats.stress >= 98 || s.stats.energy <= 2 },
    { id: 'health_break', title: 'נפילת בריאות', summary: 'הזנחת יותר מדי זמן והגוף עצר אותך.', early: true, condition: (s) => s.stats.health <= 5 },
    { id: 'financial_ruin', title: 'קריסה פיננסית', summary: 'החובות סגרו עליך.', early: true, condition: (s) => s.stats.money <= -120000 && s.debts >= 150000 },
    { id: 'broke_happy', title: 'עני/ה אבל נושם/ת', summary: 'אין הרבה כסף, אבל הראש שקט.', early: false, condition: (s) => s.stats.money <= 10000 && s.stats.happiness >= 70 && s.stats.stress <= 40 },
    { id: 'broke_alone', title: 'לבד במינוס', summary: 'גם הכסף הלך, גם הקשר נעלם.', early: false, condition: (s) => s.stats.money < 0 && !hasPartnerState(s) && s.stats.happiness <= 30 },
    { id: 'quiet_survival', title: 'הישרדות שקטה', summary: 'לא ניצחת, אבל נשארת במשחק.', early: false, condition: (s) => s.stats.money > 0 && s.stats.money < 120000 && s.stats.stress < 70 && s.stats.health > 40 },
    { id: 'legal_trouble', title: 'צרות משפטיות', summary: 'מכתב אחד פתח שרשרת בעיות.', early: false, condition: (s) => s.flags.legalRisk && s.stats.exposure >= 70 && s.stats.trust <= 35 },
    { id: 'redemption', title: 'תיקון', summary: 'נפלת, קמת, ובנית מחדש.', early: false, condition: (s) => s.flags.hadCollapse && s.stats.money >= 220000 && s.stats.health >= 55 && s.stats.trust >= 55 },
    { id: 'work_machine', title: 'מכונת עבודה', summary: 'קריירה חזקה, חיים אישיים חלשים.', early: false, condition: (s) => s.stats.career >= 90 && s.stats.family <= 40 },
    { id: 'study_success', title: 'מסלול לימודים מנצח', summary: 'הלימודים שילמו בחזרה.', early: false, condition: (s) => s.flags.finishedDegree && s.stats.career >= 75 },
    { id: 'small_business', title: 'עסק קטן יציב', summary: 'לא אימפריה, אבל עסק שמחזיק.', early: false, condition: (s) => s.flags.businessOpen && s.stats.money >= 180000 && s.stats.stress < 75 },
    { id: 'scandal_survivor', title: 'שרדת סקנדל', summary: 'היית על הקצה והצלחת לייצב.', early: false, condition: (s) => s.flags.wasExposed && s.stats.trust >= 55 && s.stats.reputation >= 55 },
    { id: 'family_collapse', title: 'בית שהתפרק', summary: 'העומס והסודות פרקו את הבית.', early: false, condition: (s) => s.stats.family <= 20 && s.relationship.children >= 1 },
    { id: 'risk_king', title: 'מלך סיכון', summary: 'לקחת מהלכים חדים ויצאת למעלה.', early: false, condition: (s) => s.stats.investments >= 85 && s.stats.money >= 450000 && s.stats.exposure < 75 },
    { id: 'public_face', title: 'פנים מוכרות', summary: 'הפכת לשם מוכר, עם כל המחיר.', early: false, condition: (s) => s.stats.reputation >= 88 && s.stats.exposure >= 70 },
    { id: 'isolation', title: 'בידוד', summary: 'בחרת רק עבודה וכסף, ונשארת לבד.', early: false, condition: (s) => !hasPartnerState(s) && s.stats.family <= 25 && s.stats.happiness <= 25 },
    { id: 'legacy', title: 'מורשת', summary: 'השארת עסק, נכסים ומשפחה מאחוריך.', early: false, condition: (s) => s.relationship.children >= 2 && s.assets.length >= 2 && s.stats.money >= 350000 && s.stats.family >= 70 },
  ];

  const ACHIEVEMENTS = [
    { id: 'first_apartment', title: 'דירה ראשונה', check: (s) => s.assets.some((a) => a.kind === 'apartment') },
    { id: 'first_affair', title: 'רומן ראשון', check: (s) => s.flags.affairActive || s.flags.hadAffair },
    { id: 'almost_caught', title: 'כמעט נתפסת', check: (s) => s.hidden.suspicion >= 75 },
    { id: 'financial_crash', title: 'קריסה פיננסית', check: (s) => s.stats.money < -30000 },
    { id: 'business_success', title: 'עסק מצליח', check: (s) => s.flags.businessOpen && s.stats.career >= 70 },
    { id: 'married', title: 'חתונה', check: (s) => s.flags.isMarried },
    { id: 'first_child', title: 'ילד ראשון', check: (s) => s.relationship.children >= 1 },
  ];

  const dom = cacheDom();

  let meta = loadMeta();
  let state = loadRun() || createNewState();
  let lockChoice = false;

  const ACTION_DEFS = buildActionDefinitions();

  init();

  function cacheDom() {
    return {
      body: document.body,
      newGameBtn: document.getElementById('newGameBtn'),
      continueBtn: document.getElementById('continueBtn'),
      helpBtn: document.getElementById('helpBtn'),
      closeHelpBtn: document.getElementById('closeHelpBtn'),
      themeBtn: document.getElementById('themeBtn'),
      speedSelect: document.getElementById('speedSelect'),
      advanceYearBtn: document.getElementById('advanceYearBtn'),
      ageYearLine: document.getElementById('ageYearLine'),
      queueIndicator: document.getElementById('queueIndicator'),
      relationshipIndicator: document.getElementById('relationshipIndicator'),
      jobIndicator: document.getElementById('jobIndicator'),
      homeCard: document.getElementById('homeCard'),
      ngpBox: document.getElementById('ngpBox'),
      perkButtons: document.getElementById('perkButtons'),
      moneyLine: document.getElementById('moneyLine'),
      statsBars: document.getElementById('statsBars'),
      eventCard: document.getElementById('eventCard'),
      eventTitle: document.getElementById('eventTitle'),
      eventText: document.getElementById('eventText'),
      eventChoices: document.getElementById('eventChoices'),
      nextEventBtn: document.getElementById('nextEventBtn'),
      consequenceCard: document.getElementById('consequenceCard'),
      consequenceChips: document.getElementById('consequenceChips'),
      whyLine: document.getElementById('whyLine'),
      yearSummaryCard: document.getElementById('yearSummaryCard'),
      yearMoneyFlow: document.getElementById('yearMoneyFlow'),
      yearWorkFlow: document.getElementById('yearWorkFlow'),
      yearLoveFlow: document.getElementById('yearLoveFlow'),
      yearFamilyFlow: document.getElementById('yearFamilyFlow'),
      yearHealthFlow: document.getElementById('yearHealthFlow'),
      yearHighlights: document.getElementById('yearHighlights'),
      tabCard: document.getElementById('tabCard'),
      tabTitle: document.getElementById('tabTitle'),
      tabSummary: document.getElementById('tabSummary'),
      tabActions: document.getElementById('tabActions'),
      journalCard: document.getElementById('journalCard'),
      journalList: document.getElementById('journalList'),
      endingCollectionCard: document.getElementById('endingCollectionCard'),
      endingProgress: document.getElementById('endingProgress'),
      endingGrid: document.getElementById('endingGrid'),
      endingCard: document.getElementById('endingCard'),
      endingTitle: document.getElementById('endingTitle'),
      endingText: document.getElementById('endingText'),
      endingNewGameBtn: document.getElementById('endingNewGameBtn'),
      tabButtons: Array.from(document.querySelectorAll('.tab-btn')),
      toastBox: document.getElementById('toastBox'),
      helpDialog: document.getElementById('helpDialog'),
    };
  }

  function defaultStats() {
    return {
      money: 5000,
      happiness: 55,
      health: 75,
      energy: 70,
      stress: 25,
      trust: 55,
      exposure: 15,
      reputation: 45,
      relationship: 0,
      family: 50,
      career: 10,
      investments: 20,
    };
  }

  function defaultFlags() {
    return {
      isDating: false,
      isMarried: false,
      livingTogether: false,
      affairActive: false,
      hadAffair: false,
      caughtCheating: false,
      divorced: false,
      openRelationship: false,
      businessOpen: false,
      studying: false,
      finishedDegree: false,
      hasJob: false,
      legalRisk: false,
      wasExposed: false,
      hadCollapse: false,
      blackmailRisk: false,
    };
  }

  function createNewState(perkId) {
    const chars = generateCharacters();
    const fresh = {
      age: 18,
      yearCount: 1,
      stats: defaultStats(),
      flags: defaultFlags(),
      debts: 0,
      activeTab: 'life',
      settings: {
        speed: meta.settings.speed || 'normal',
        theme: meta.settings.theme || 'dark',
      },
      relationship: {
        partnerName: chars.partner.name,
        affairName: chars.temptation.name,
        children: 0,
      },
      job: {
        title: 'ללא עבודה',
        salary: 0,
        level: 0,
      },
      business: {
        open: false,
        employees: 0,
        partnerName: chars.business.name,
        brand: 'סטודיו קטן',
      },
      investments: {
        capital: 0,
        risk: 30,
      },
      assets: [],
      characters: chars,
      hidden: {
        suspicion: 0,
        scandalRisk: 12,
      },
      delayed: [],
      eventQueue: [],
      currentEvent: null,
      history: [],
      journal: [],
      yearHighlights: [],
      lastSummary: null,
      gameOver: false,
      currentEnding: null,
      actionsThisYear: 0,
      incomingReason: '',
    };

    if (perkId) {
      const perk = PERKS.find((p) => p.id === perkId);
      if (perk) {
        perk.apply(fresh);
      }
    }

    clampAllStats(fresh.stats);
    return fresh;
  }

  function hasPartner() {
    return state.flags.isDating || state.flags.isMarried;
  }

  function hasPartnerState(s) {
    return s.flags.isDating || s.flags.isMarried;
  }

  function relationshipStatus() {
    if (state.flags.isMarried) {
      return 'נשוי/אה';
    }
    if (state.flags.isDating) {
      return 'בזוגיות';
    }
    return 'רווק/ה';
  }

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function chance(percent) {
    return Math.random() * 100 < percent;
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function clampAllStats(stats) {
    STAT_META.forEach((metaEntry) => {
      stats[metaEntry.key] = clamp(stats[metaEntry.key], 0, 100);
    });
  }

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function formatMoney(n) {
    return `₪${Math.round(n).toLocaleString('he-IL')}`;
  }

  function formatSigned(value) {
    const rounded = Math.round(value);
    return rounded > 0 ? `+${rounded}` : `${rounded}`;
  }

  function randomNamePool() {
    return [...NAME_POOLS.male, ...NAME_POOLS.female, ...NAME_POOLS.neutral];
  }

  function generateCharacters() {
    const names = randomNamePool();
    const used = new Set();
    const takeUnique = () => {
      let candidate = pick(names);
      let guard = 0;
      while (used.has(candidate) && guard < 60) {
        candidate = pick(names);
        guard += 1;
      }
      used.add(candidate);
      return candidate;
    };

    return {
      partner: createCharacter(takeUnique(), 'partner'),
      temptation: createCharacter(takeUnique(), 'temptation'),
      business: createCharacter(takeUnique(), 'business'),
      family: createCharacter(takeUnique(), 'family'),
    };
  }

  function createCharacter(name, role) {
    return {
      name,
      role,
      attraction: rand(30, 85),
      trust: rand(35, 75),
      jealousy: rand(20, 70),
      anger: rand(5, 35),
      desire: rand(25, 80),
      openness: rand(20, 80),
      commitment: rand(25, 85),
      mood: rand(40, 70),
      suspicion: 0,
      memory: [],
    };
  }

  function buildEventTemplates() {
    const list = [];
    Object.entries(EVENT_PARTS).forEach(([category, blocks]) => {
      blocks.a.forEach((left, i) => {
        blocks.b.forEach((right, j) => {
          list.push({
            id: `${category}_${i}_${j}`,
            category,
            title: CATEGORY_TITLES[category],
            text: `${left}. ${right}.`,
          });
        });
      });
    });
    return list;
  }

  function textWithNames(text) {
    return text
      .replaceAll('{partner}', state.characters.partner.name)
      .replaceAll('{temptation}', state.characters.temptation.name)
      .replaceAll('{business}', state.characters.business.name)
      .replaceAll('{family}', state.characters.family.name);
  }

  function loadMeta() {
    const fallback = {
      unlockedEndings: [],
      unlockedAchievements: [],
      settings: { theme: 'dark', speed: 'normal' },
    };

    try {
      const raw = localStorage.getItem(STORAGE_META);
      if (!raw) {
        return fallback;
      }
      const parsed = JSON.parse(raw);
      return {
        unlockedEndings: Array.isArray(parsed.unlockedEndings) ? parsed.unlockedEndings : [],
        unlockedAchievements: Array.isArray(parsed.unlockedAchievements) ? parsed.unlockedAchievements : [],
        settings: {
          theme: parsed.settings?.theme || 'dark',
          speed: parsed.settings?.speed || 'normal',
        },
      };
    } catch (error) {
      console.error(error);
      return fallback;
    }
  }

  function saveMeta() {
    localStorage.setItem(STORAGE_META, JSON.stringify(meta));
  }

  function loadRun() {
    try {
      const raw = localStorage.getItem(STORAGE_RUN);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') {
        return null;
      }
      if (!parsed.stats || !parsed.flags) {
        return null;
      }
      clampAllStats(parsed.stats);
      parsed.settings = parsed.settings || { theme: meta.settings.theme, speed: meta.settings.speed };
      parsed.activeTab = TAB_ORDER.includes(parsed.activeTab) ? parsed.activeTab : 'life';
      parsed.relationship = parsed.relationship || { partnerName: parsed.characters?.partner?.name || 'מאיה', affairName: parsed.characters?.temptation?.name || 'נועם', children: 0 };
      parsed.hidden = parsed.hidden || { suspicion: 0, scandalRisk: 12 };
      parsed.delayed = Array.isArray(parsed.delayed) ? parsed.delayed : [];
      parsed.eventQueue = Array.isArray(parsed.eventQueue) ? parsed.eventQueue : [];
      parsed.history = Array.isArray(parsed.history) ? parsed.history : [];
      parsed.journal = Array.isArray(parsed.journal) ? parsed.journal : [];
      parsed.yearHighlights = Array.isArray(parsed.yearHighlights) ? parsed.yearHighlights : [];
      parsed.assets = Array.isArray(parsed.assets) ? parsed.assets : [];
      parsed.debts = Number.isFinite(parsed.debts) ? parsed.debts : 0;
      parsed.investments = parsed.investments || { capital: 0, risk: 30 };
      parsed.job = parsed.job || { title: 'ללא עבודה', salary: 0, level: 0 };
      parsed.business = parsed.business || { open: false, employees: 0, partnerName: parsed.characters?.business?.name || 'אור', brand: 'סטודיו קטן' };
      parsed.actionsThisYear = Number.isFinite(parsed.actionsThisYear) ? parsed.actionsThisYear : 0;

      if (!parsed.characters || !parsed.characters.partner || !parsed.characters.temptation || !parsed.characters.business || !parsed.characters.family) {
        parsed.characters = generateCharacters();
      }

      return parsed;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  function saveRun() {
    localStorage.setItem(STORAGE_RUN, JSON.stringify(state));
  }

  function clearRun() {
    localStorage.removeItem(STORAGE_RUN);
  }

  function buildActionDefinitions() {
    return {
      life: [
        { id: 'life_friends', label: 'לצאת עם חברים' },
        { id: 'life_selfwork', label: 'לעבוד על עצמך' },
        { id: 'life_move_city', label: 'לעבור עיר' },
        { id: 'life_small_risk', label: 'לקחת סיכון קטן' },
        { id: 'life_show_endings', label: 'לפתוח סיומות' },
      ],
      work: [
        { id: 'work_search', label: 'לחפש עבודה' },
        { id: 'work_quit', label: 'להתפטר' },
        { id: 'work_raise', label: 'לבקש העלאה' },
        { id: 'work_hard', label: 'לעבוד קשה השנה' },
        { id: 'work_slack', label: 'להתחמק מעבודה' },
      ],
      love: [
        { id: 'love_meet', label: 'להכיר מישהו/י' },
        { id: 'love_date', label: 'לצאת לדייט' },
        { id: 'love_move_together', label: 'להציע לגור יחד' },
        { id: 'love_marry', label: 'להציע נישואין' },
        { id: 'love_intimacy', label: 'ליזום אינטימיות' },
        { id: 'love_open', label: 'להציע לפתוח קשר' },
        { id: 'love_threesome', label: 'להציע שלישייה' },
        { id: 'love_affair_start', label: 'להתחיל רומן' },
        { id: 'love_affair_end', label: 'לסיים רומן' },
        { id: 'love_breakup', label: 'להיפרד' },
      ],
      family: [
        { id: 'family_help', label: 'לעזור למשפחה' },
        { id: 'family_ignore', label: 'להתעלם מהמשפחה' },
        { id: 'family_try_kid', label: 'לנסות להביא ילד' },
        { id: 'family_time_kids', label: 'לבלות זמן עם הילדים' },
      ],
      assets: [
        { id: 'asset_buy_car', label: 'לקנות רכב' },
        { id: 'asset_buy_apartment', label: 'לקנות דירה' },
        { id: 'asset_sell', label: 'למכור נכס' },
        { id: 'asset_renovate', label: 'לשפץ' },
        { id: 'asset_rent', label: 'להשכיר דירה' },
      ],
      health: [
        { id: 'health_sport', label: 'לעשות ספורט' },
        { id: 'health_doctor', label: 'ללכת לרופא' },
        { id: 'health_rest', label: 'לנוח שבוע' },
        { id: 'health_neglect', label: 'להזניח בריאות' },
      ],
      education: [
        { id: 'edu_start', label: 'להתחיל לימודים' },
        { id: 'edu_course', label: 'לקחת קורס קצר' },
        { id: 'edu_self', label: 'ללמוד לבד' },
        { id: 'edu_drop', label: 'לעזוב לימודים' },
      ],
      business: [
        { id: 'biz_open', label: 'לפתוח עסק קטן' },
        { id: 'biz_hire', label: 'להעסיק עובד' },
        { id: 'biz_close', label: 'לסגור עסק' },
        { id: 'biz_partner', label: 'למצוא שותף' },
        { id: 'biz_marketing', label: 'לעשות שיווק' },
      ],
      investments: [
        { id: 'inv_safe', label: 'השקעה סולידית' },
        { id: 'inv_risky', label: 'השקעה מסוכנת' },
        { id: 'inv_raise_risk', label: 'להגדיל סיכון' },
        { id: 'inv_withdraw', label: 'למשוך כסף' },
        { id: 'inv_leverage', label: 'לקחת הלוואה להשקעה' },
      ],
      journal: [],
    };
  }

  function actionResult(text, effects, why, delayed = []) {
    return { text, effects: effects || {}, why: why || '', delayed };
  }

  function applyAction(id) {
    if (state.gameOver) {
      toast('המשחק נגמר. תתחיל/י חדש כדי להמשיך.', true);
      return;
    }

    if (state.currentEvent) {
      const minor = actionResult('קודם נסיים את האירוע הפתוח.', { stress: 1, energy: -1 }, 'כי הראש כבר עמוס');
      handleResult(minor, 'פעולה בזמן אירוע', false);
      return;
    }

    const result = runActionLogic(id);
    if (!result) {
      return;
    }

    state.actionsThisYear += 1;
    if (state.actionsThisYear > 6) {
      result.effects.stress = (result.effects.stress || 0) + 4;
      result.effects.energy = (result.effects.energy || 0) - 3;
      result.why = result.why || 'כי דחפת יותר מדי פעולות השנה';
    }

    const actionLabel = findActionLabel(id);
    handleResult(result, actionLabel, false);

    driftAfterAction();
    checkAchievements();
    checkEndings('action');

    renderAll();
    saveRun();
  }

  function findActionLabel(id) {
    for (const list of Object.values(ACTION_DEFS)) {
      const found = list.find((entry) => entry.id === id);
      if (found) {
        return found.label;
      }
    }
    return 'פעולה';
  }

  function runActionLogic(id) {
    const partner = state.characters.partner;
    const temptation = state.characters.temptation;

    switch (id) {
      case 'life_friends':
        return actionResult('יצאת לערב קליל. זה הוריד קצת לחץ.', { happiness: 7, stress: -6, money: -240, energy: -4, reputation: 1 }, 'כי יצאת מהשגרה');
      case 'life_selfwork':
        return actionResult('השקעת בעצמך. זה נתן פוקוס.', { happiness: 4, career: 3, trust: 2, energy: -3 }, 'כי בנית הרגל טוב', [{ afterYears: 1, effects: { career: 4, reputation: 2 }, text: 'ההשקעה בעצמך התחילה להשתלם.', why: 'כי התמדה נותנת תוצאות' }]);
      case 'life_move_city': {
        const cost = rand(7000, 24000);
        return actionResult('ארזת ועברת עיר. התחלה חדשה, אבל יקרה.', { money: -cost, stress: 8, happiness: 5, career: 2, family: -4 }, 'כי מעבר עיר תמיד יוצר עומס');
      }
      case 'life_small_risk': {
        const win = chance(52);
        if (win) {
          return actionResult('לקחת סיכון קטן וזה עבד.', { money: rand(1500, 5500), stress: 3, reputation: 2 }, 'כי לפעמים אומץ קטן משתלם');
        }
        return actionResult('המהלך הקטן הסתבך יותר ממה שחשבת.', { money: -rand(1500, 6000), stress: 8, trust: -2 }, 'כי לא כל סיכון נגמר טוב');
      }
      case 'life_show_endings':
        state.activeTab = 'life';
        dom.endingCollectionCard.hidden = false;
        return actionResult('פתחת את אוסף הסיומות שלך.', { happiness: 1 }, 'כי זה נותן פרספקטיבה');

      case 'work_search': {
        if (state.flags.hasJob) {
          return actionResult('כבר יש לך עבודה. חיפוש מקביל העלה קצת לחץ.', { stress: 4, energy: -2, career: 1 }, 'כי קשה להחזיק שני כיוונים');
        }
        const accepted = chance(65 + Math.floor(state.stats.career / 5));
        if (accepted) {
          state.flags.hasJob = true;
          state.job.level = clamp(Math.floor(state.stats.career / 20) + 1, 1, 5);
          state.job.title = JOB_TITLES[state.job.level] || 'עובד/ת';
          state.job.salary = 42000 + state.job.level * 12000;
          return actionResult(`מצאת עבודה חדשה: ${state.job.title}.`, { career: 6, trust: 2, happiness: 4, stress: 3, energy: -4 }, 'כי יציבות תעסוקתית נותנת אוויר');
        }
        return actionResult('עוד לא נסגרה עבודה. שלחת קורות חיים והמשכת הלאה.', { stress: 5, energy: -3, happiness: -2 }, 'כי אי־ודאות שוחקת');
      }
      case 'work_quit':
        if (!state.flags.hasJob) {
          return actionResult('אין לך עבודה להתפטר ממנה. זה מרגיש מוקדם מדי.', { stress: 2, happiness: -1 }, 'כי כרגע אין מקור הכנסה קבוע');
        }
        state.flags.hasJob = false;
        state.job = { title: 'ללא עבודה', salary: 0, level: 0 };
        return actionResult('עזבת את העבודה. זה נתן שקט רגעי אבל הוריד יציבות.', { happiness: 5, stress: -3, career: -4, trust: -2 }, 'כי שינוי חד תמיד עולה במשהו');
      case 'work_raise':
        if (!state.flags.hasJob) {
          return actionResult('ביקשת העלאה בלי עבודה פעילה. זה פשוט לא רלוונטי כרגע.', { stress: 2, trust: -1 }, 'כי זה מוקדם מדי');
        }
        if (chance(50 + state.stats.career / 4)) {
          const raise = rand(4000, 11000);
          state.job.salary += raise;
          return actionResult('ביקשת העלאה וקיבלת.', { money: Math.round(raise / 2), career: 4, trust: 2, stress: 2 }, 'כי הראית ערך לאורך זמן');
        }
        return actionResult('הבקשה נדחתה. קיבלת "אולי בהמשך".', { stress: 6, happiness: -4, trust: -2 }, 'כי הטיימינג לא היה טוב');
      case 'work_hard':
        if (!state.flags.hasJob) {
          return actionResult('אין כרגע עבודה מסודרת לעבוד קשה בה.', { energy: -2, stress: 2, career: 1 }, 'כי המאמץ התפזר');
        }
        return actionResult('נתת השנה עבודה חזקה במיוחד.', { career: 7, money: 2500, stress: 8, energy: -8, reputation: 3 }, 'כי מאמץ גבוה מקדם מהר', [{ afterYears: 1, effects: { career: 6, money: 6000 }, text: 'העבודה הקשה פתחה לך דלת חדשה.', why: 'כי התמדה בלטה למנהלים' }]);
      case 'work_slack':
        if (!state.flags.hasJob) {
          return actionResult('אין עבודה להתחמק ממנה. פשוט בזבוז זמן.', { happiness: -1, career: -1 }, 'כי זה לא קידם שום דבר');
        }
        if (chance(28)) {
          state.flags.hasJob = false;
          state.job = { title: 'ללא עבודה', salary: 0, level: 0 };
          return actionResult('התחמקת יותר מדי ופוטרת.', { stress: 12, money: -9000, career: -8, trust: -6, happiness: -7 }, 'כי זה חזר אליך מהר');
        }
        return actionResult('התחמקת קצת והצלחת לעבור מתחת לרדאר.', { energy: 6, career: -4, trust: -3, stress: -1 }, 'כי הרווח היה קצר טווח');
      case 'love_meet':
        if (hasPartner()) {
          return actionResult(`כבר יש קשר עם ${state.relationship.partnerName}. עוד היכרות עכשיו יצרה רעש.`, { exposure: 5, stress: 4, trust: -4 }, 'כי הגבול נהיה דק');
        }
        state.flags.isDating = true;
        state.stats.relationship = clamp(state.stats.relationship + rand(15, 25), 0, 100);
        partner.trust = clamp(partner.trust + 8, 0, 100);
        return actionResult(`הכרת את ${state.relationship.partnerName}. התחיל חיבור אמיתי.`, { relationship: 12, happiness: 10, stress: -3, trust: 4 }, 'כי נכנסה תקווה חדשה');
      case 'love_date':
        if (!hasPartner()) {
          return actionResult('יצאת לדייט אקראי. היה נחמד אבל לא נבנה מזה הרבה.', { money: -320, happiness: 3, stress: -1, exposure: 2 }, 'כי עדיין אין בסיס רגשי יציב');
        }
        partner.trust = clamp(partner.trust + 5, 0, 100);
        partner.desire = clamp(partner.desire + 4, 0, 100);
        return actionResult(`יצאת לדייט עם ${state.relationship.partnerName}.`, { relationship: 6, happiness: 7, money: -450, stress: -4 }, 'כי זמן איכות הוריד לחץ');
      case 'love_move_together': {
        const score = partner.trust + partner.commitment + state.stats.relationship - partner.jealousy;
        if (!hasPartner()) {
          return actionResult('ניסית להציע מגורים משותפים מוקדם מדי.', { trust: -4, stress: 4, happiness: -2 }, 'כי זה היה מהיר בלי בסיס');
        }
        if (score > 150) {
          state.flags.livingTogether = true;
          return actionResult('החלטתם לעבור לגור יחד.', { relationship: 10, family: 8, stress: 3, money: -9000, happiness: 6 }, 'כי שניכם רציתם יותר קרבה');
        }
        partner.jealousy = clamp(partner.jealousy + 6, 0, 100);
        return actionResult('ההצעה פגשה היסוס. עדיין לא הזמן.', { relationship: -4, stress: 6, trust: -5 }, 'כי חוסר ביטחון היה באוויר');
      }
      case 'love_marry': {
        const score = partner.trust + partner.commitment + state.stats.family + state.stats.relationship;
        if (!hasPartner()) {
          return actionResult('הצעת נישואין בלי קשר יציב. זה הרגיש לא קשור.', { stress: 5, trust: -3, happiness: -2 }, 'כי זה מוקדם מדי');
        }
        if (score > 230 && state.stats.money > 15000) {
          state.flags.isDating = true;
          state.flags.isMarried = true;
          return actionResult('הצעת נישואין ונענית בחיוב.', { relationship: 12, family: 12, trust: 6, money: -18000, happiness: 10 }, 'כי נוצר ביטחון להמשך');
        }
        partner.anger = clamp(partner.anger + 8, 0, 100);
        return actionResult('ההצעה נדחתה כרגע.', { relationship: -8, stress: 8, trust: -7, happiness: -5 }, 'כי הפערים עדיין גדולים');
      }
      case 'love_intimacy': {
        const desireScore = partner.desire + partner.trust + state.stats.relationship - partner.anger;
        if (!hasPartner() && !state.flags.affairActive) {
          return actionResult('ניסית ליזום קרבה בלי חיבור יציב. זה היה מביך.', { trust: -5, stress: 6, happiness: -3 }, 'כי לא נבנה אמון מראש');
        }
        if (desireScore >= 150) {
          const bonusSuspicion = state.flags.isMarried ? 8 : 2;
          adjustSuspicion(bonusSuspicion, 'רגע אינטימי חזק');
          return actionResult('המרחק ביניכם הצטמצם. זה הרגיש קרוב מאוד.', { relationship: 8, happiness: 7, stress: -8, exposure: 4, trust: 3 }, 'כי היה חיבור הדדי ברור');
        }
        partner.trust = clamp(partner.trust - 6, 0, 100);
        partner.anger = clamp(partner.anger + 5, 0, 100);
        return actionResult('זה הרגיש קרוב מדי ולא במקום.', { relationship: -6, trust: -8, stress: 8, happiness: -4 }, 'כי לא הייתה התאמה באותו רגע');
      }
      case 'love_open': {
        if (!hasPartner()) {
          return actionResult('ניסית לדבר על קשר פתוח בלי קשר קיים. זה הלך לאיבוד.', { stress: 3, trust: -2 }, 'כי אין בסיס לשיחה הזאת');
        }
        const openScore = partner.openness + partner.trust - partner.jealousy + state.stats.relationship;
        if (openScore > 140) {
          state.flags.openRelationship = true;
          adjustSuspicion(6, 'נפתחו גבולות בקשר');
          return actionResult('פתחתם את הקשר בהסכמה. זה מרגש אבל עדין.', { relationship: 3, exposure: 8, stress: 4, trust: 1 }, 'כי שינוי גבולות מושך תשומת לב');
        }
        partner.jealousy = clamp(partner.jealousy + 10, 0, 100);
        return actionResult('הצעה לקשר פתוח יצרה ריחוק מיידי.', { relationship: -10, trust: -10, stress: 10 }, 'כי הפער בציפיות היה גדול');
      }
      case 'love_threesome': {
        if (!hasPartner()) {
          return actionResult('הצעה כזאת בלי קשר יציב הרגישה מנותקת מהמצב.', { trust: -3, stress: 4 }, 'כי זה מוקדם מדי');
        }
        const consentScore = partner.openness + partner.desire - partner.jealousy + partner.trust;
        if (consentScore > 170 && state.flags.openRelationship) {
          adjustSuspicion(12, 'מהלך אמיץ מדי');
          return actionResult('היה רגע טעון מאוד. משהו השתנה ביניכם.', { relationship: 6, happiness: 6, exposure: 12, stress: 7 }, 'כי זה מהלך עם מחיר חברתי');
        }
        partner.anger = clamp(partner.anger + 14, 0, 100);
        return actionResult('ההצעה התקבלה קשה מאוד.', { relationship: -14, trust: -12, stress: 12, happiness: -6 }, 'כי זה חצה גבול לצד השני');
      }
      case 'love_affair_start': {
        if (!hasPartner()) {
          return actionResult(`ניסית להתחיל רומן עם ${temptation.name}, אבל אין כרגע קשר רשמי להסתבך ממנו.`, { exposure: 5, stress: 3, happiness: 2 }, 'כי זה נשאר פלירטוט בלי עומק');
        }
        state.flags.affairActive = true;
        state.flags.hadAffair = true;
        adjustSuspicion(20, 'נפתח רומן פעיל');
        temptation.desire = clamp(temptation.desire + 8, 0, 100);
        return actionResult(`התחיל רומן שקט עם ${temptation.name}.`, { relationship: 4, happiness: 5, exposure: 10, trust: -8, stress: 6 }, 'כי סוד כזה יוצר לחץ מתמשך');
      }
      case 'love_affair_end':
        if (!state.flags.affairActive) {
          return actionResult('אין רומן פעיל לסיים כרגע.', { stress: -1, trust: 1 }, 'כי לפחות נשמר גבול');
        }
        state.flags.affairActive = false;
        adjustSuspicion(-12, 'ניסיון לנקות שולחן');
        return actionResult('סגרת את הרומן. זה לא מוחק הכול, אבל מוריד סיכון.', { trust: 4, stress: -6, happiness: -2, exposure: -2 }, 'כי עצירה בזמן חוסכת נזק');
      case 'love_breakup':
        if (!hasPartner()) {
          return actionResult('אין קשר פעיל להיפרד ממנו.', { stress: 1, happiness: -1 }, 'כי את/ה כרגע לבד');
        }
        state.flags.isDating = false;
        state.flags.isMarried = false;
        state.flags.livingTogether = false;
        state.flags.openRelationship = false;
        state.flags.affairActive = false;
        state.flags.divorced = true;
        return actionResult('החלטת להיפרד. שקט הגיע, אבל גם חלל.', { relationship: -25, happiness: -8, stress: 4, family: -10, trust: -6 }, 'כי פרידה משנה הכול');

      case 'family_help':
        return actionResult(`עזרת ל${state.characters.family.name}. זה קירב, אבל עלה לך זמן וכסף.`, { money: -2200, family: 9, trust: 4, stress: 3, energy: -4 }, 'כי אחריות משפחתית תמיד דורשת מחיר');
      case 'family_ignore':
        return actionResult('בחרת עבודה במקום משפחה. זה נתן זמן עכשיו, אבל השאיר סימן.', { money: 1200, family: -8, trust: -4, stress: 4 }, 'כי ריחוק משפחתי מצטבר עם הזמן', [{ afterYears: 1, effects: { family: -6, happiness: -3 }, text: 'המרחק מהמשפחה חזר אליך השנה.', why: 'כי פצע משפחתי לא נעלם לבד' }]);
      case 'family_try_kid': {
        const possible = hasPartner() && (state.flags.isMarried || state.flags.livingTogether);
        const stable = state.stats.money > 25000 && state.stats.relationship >= 45 && state.stats.family >= 45;
        if (possible && stable && chance(42)) {
          state.relationship.children += 1;
          return actionResult('הצטרף ילד למשפחה. השמחה גדולה וגם האחריות.', { family: 16, happiness: 10, stress: 9, energy: -8, money: -12000 }, 'כי ילד משנה את כל הקצב');
        }
        return actionResult('ניסיתם, אבל זה לא היה הזמן הנכון או התנאים לא הספיקו.', { stress: 6, family: -2, trust: -1, happiness: -2 }, 'כי צריך יציבות כדי שזה יעבוד');
      }
      case 'family_time_kids':
        if (state.relationship.children <= 0) {
          return actionResult('אין עדיין ילדים, אז ניסית להשקיע במשפחה בדרך אחרת.', { family: 2, happiness: 2, money: -600 }, 'כי נוכחות משפחתית חשובה בכל שלב');
        }
        return actionResult('בילית זמן אמיתי עם הילדים.', { family: 10, happiness: 7, stress: -5, energy: -4, money: -1100 }, 'כי זמן איכות מחזק בית');
      case 'asset_buy_car':
        return buyAsset('car');
      case 'asset_buy_apartment':
        return buyAsset('apartment');
      case 'asset_sell': {
        if (!state.assets.length) {
          return actionResult('אין כרגע נכס למכור. הלחץ נשאר.', { stress: 2 }, 'כי אין מה לממש');
        }
        const sold = state.assets.shift();
        const saleValue = Math.round(sold.value * rand(70, 105) / 100);
        return actionResult(`מכרת ${sold.name}.`, { money: saleValue, stress: -4, reputation: -1 }, 'כי מכירה נתנה נזילות מיידית');
      }
      case 'asset_renovate': {
        if (!state.assets.length) {
          return actionResult('אין מה לשפץ כרגע. זה בזבז אנרגיה לשווא.', { energy: -2, stress: 1 }, 'כי בלי נכס אין ערך לשיפוץ');
        }
        const cost = rand(4000, 16000);
        state.assets.forEach((asset) => {
          asset.value = Math.round(asset.value * 1.05);
          if (asset.kind === 'apartment') {
            asset.income += 1300;
          }
        });
        return actionResult('שיפצת ושיפרת את הנכסים.', { money: -cost, reputation: 3, happiness: 3, stress: 2 }, 'כי שיפוץ מעלה ערך לטווח ארוך');
      }
      case 'asset_rent': {
        const apartment = state.assets.find((asset) => asset.kind === 'apartment');
        if (!apartment) {
          return actionResult('אין דירה להשכיר כרגע.', { stress: 2 }, 'כי צריך נכס מתאים');
        }
        apartment.isRented = true;
        return actionResult('סגרת שוכר לדירה.', { money: 2000, reputation: 2, stress: 1 }, 'כי הנכס התחיל לייצר תזרים');
      }

      case 'health_sport':
        return actionResult('עשית אימון. הגוף והראש הרוויחו.', { health: 7, stress: -5, energy: -3, happiness: 4 }, 'כי תנועה משפרת מצב');
      case 'health_doctor':
        return actionResult('הלכת לרופא ובדקת מה צריך.', { money: -850, health: 6, stress: -4, trust: 1 }, 'כי טיפול מוקדם חוסך בעיות');
      case 'health_rest':
        return actionResult('לקחת מנוחה אמיתית.', { energy: 11, stress: -7, happiness: 5, money: -1200 }, 'כי הגוף ביקש הפסקה');
      case 'health_neglect':
        return actionResult('דחית את הבריאות לעוד שבוע.', { health: -7, stress: 5, energy: -5, money: 400 }, 'כי הזנחה נותנת מחיר בהמשך', [{ afterYears: 1, effects: { health: -8, stress: 4 }, text: 'מה שדחית בבריאות חזר עכשיו.', why: 'כי הגוף שומר חשבון' }]);

      case 'edu_start':
        if (state.flags.studying || state.flags.finishedDegree) {
          return actionResult('כבר יש לך מסלול לימודים פעיל או שסיימת.', { energy: -2, stress: 2, career: 1 }, 'כי פיצלת פוקוס');
        }
        state.flags.studying = true;
        return actionResult('נרשמת ללימודים.', { money: -12000, career: 5, stress: 5, energy: -6, happiness: 3 }, 'כי התחלה חדשה דורשת השקעה', [{ afterYears: 2, effects: { career: 12, reputation: 6, trust: 3 }, text: 'הלימודים פתחו לך דלת מקצועית.', why: 'כי התמדה בלימודים משתלמת' }]);
      case 'edu_course':
        return actionResult('לקחת קורס קצר ומעשי.', { money: -3200, career: 4, energy: -3, stress: 2, trust: 1 }, 'כי שיפור כישורים מקדם מהר');
      case 'edu_self':
        return actionResult('ישבת ולמדת לבד.', { career: 3, energy: -2, stress: -1, happiness: 2 }, 'כי התמקדות עצמית בונה ביטחון');
      case 'edu_drop':
        if (!state.flags.studying) {
          return actionResult('אין לימודים פעילים לעזוב כרגע.', { stress: 1 }, 'כי זה לא היה רלוונטי');
        }
        state.flags.studying = false;
        return actionResult('עזבת את הלימודים באמצע.', { stress: -2, career: -3, trust: -2, happiness: -1 }, 'כי ויתור כזה מורגש ברקורד');

      case 'biz_open':
        if (state.flags.businessOpen) {
          return actionResult('העסק כבר פתוח. צריך לייצב אותו.', { stress: 3, career: 1 }, 'כי ניהול עסק דורש התמדה');
        }
        state.flags.businessOpen = true;
        state.business.open = true;
        state.business.brand = pick(['קו דק פתרונות', 'סטודיו דופק גבוה', 'פוקוס פיננסי', 'נגיעה חכמה']);
        return actionResult(`פתחת עסק קטן: ${state.business.brand}.`, { money: -30000, career: 8, reputation: 4, stress: 9, energy: -7 }, 'כי התחלה עסקית דורשת סיכון');
      case 'biz_hire':
        if (!state.flags.businessOpen) {
          return actionResult('אין עסק פתוח להעסיק בו עובד.', { stress: 2, reputation: -1 }, 'כי זה מוקדם מדי');
        }
        state.business.employees += 1;
        return actionResult('העסקת עובד חדש.', { money: -6000, career: 4, stress: 4, reputation: 2 }, 'כי צוות עוזר לצמיחה אבל עולה כסף');
      case 'biz_close':
        if (!state.flags.businessOpen) {
          return actionResult('אין עסק פעיל לסגור.', { stress: 1 }, 'כי כרגע אין מה לסיים');
        }
        state.flags.businessOpen = false;
        state.business.open = false;
        state.business.employees = 0;
        return actionResult('סגרת את העסק.', { stress: -7, money: -8000, career: -6, reputation: -4 }, 'כי סגירה נותנת שקט אבל עולה ביוקר');
      case 'biz_partner':
        if (!state.flags.businessOpen) {
          return actionResult('חיפשת שותף בלי עסק פעיל.', { stress: 3, reputation: -1 }, 'כי חסר בסיס לשותפות');
        }
        state.business.partnerName = state.characters.business.name;
        return actionResult(`צירפת את ${state.business.partnerName} כשותף/ה.`, { career: 5, reputation: 3, trust: 2, exposure: 3, stress: 2 }, 'כי שותפות פותחת דלתות וגם סיכונים');
      case 'biz_marketing':
        if (!state.flags.businessOpen) {
          return actionResult('אין עסק לשווק כרגע.', { money: -500, stress: 2 }, 'כי המהלך לא ממוקד');
        }
        return actionResult('עשית קמפיין חכם לעסק.', { money: -4500, reputation: 8, career: 4, stress: 3 }, 'כי חשיפה טובה בונה ביקוש', [{ afterYears: 1, effects: { money: 18000, reputation: 4 }, text: 'השיווק של שנה שעברה הביא לקוחות חדשים.', why: 'כי המותג התחזק' }]);

      case 'inv_safe': {
        const amount = Math.min(Math.max(1500, Math.round(state.stats.money * 0.1)), 15000);
        state.investments.capital += amount;
        return actionResult('בחרת השקעה סולידית.', { money: -amount, investments: 4, stress: 1, trust: 1 }, 'כי זה מהלך שקול', [{ afterYears: 1, effects: { money: Math.round(amount * 0.09), investments: 2 }, text: 'השקעה סולידית החזירה רווח קטן ויציב.', why: 'כי סיכון נמוך נותן תשואה מתונה' }]);
      }
      case 'inv_risky': {
        const amount = Math.min(Math.max(2500, Math.round(state.stats.money * 0.14)), 30000);
        state.investments.capital += amount;
        const shock = chance(45) ? 1 : -1;
        const immediate = shock > 0 ? Math.round(amount * 0.18) : -Math.round(amount * 0.14);
        return actionResult('נכנסת להשקעה מסוכנת.', { money: -amount + immediate, investments: 7, stress: 6, exposure: 4 }, 'כי תנודתיות גבוהה מעלה דופק', [{ afterYears: 1, effects: { money: Math.round(amount * (chance(50) ? 0.26 : -0.22)), investments: chance(50) ? 3 : -6, stress: 4 }, text: 'ההשקעה המסוכנת סגרה שנה תנודתית.', why: 'כי סיכון גבוה לא צפוי' }]);
      }
      case 'inv_raise_risk':
        state.investments.risk = clamp(state.investments.risk + 12, 0, 100);
        state.hidden.scandalRisk = clamp(state.hidden.scandalRisk + 4, 0, 100);
        return actionResult('הגדלת את רמת הסיכון בתיק.', { investments: 5, stress: 5, exposure: 3 }, 'כי מינוף מגדיל רווח וגם נפילה');
      case 'inv_withdraw': {
        if (state.investments.capital <= 0) {
          return actionResult('אין כרגע מה למשוך מהשקעות.', { stress: 1 }, 'כי אין יתרה זמינה');
        }
        const out = Math.min(state.investments.capital, rand(3000, 18000));
        state.investments.capital -= out;
        return actionResult('משכת חלק מהשקעות בחזרה לנזילות.', { money: out, investments: -2, stress: -3 }, 'כי נזילות הורידה לחץ');
      }
      case 'inv_leverage': {
        const loan = rand(12000, 50000);
        state.debts += loan;
        state.investments.capital += loan;
        state.hidden.scandalRisk = clamp(state.hidden.scandalRisk + 7, 0, 100);
        return actionResult('לקחת הלוואה כדי להשקיע.', { money: loan, investments: 8, stress: 8, exposure: 5 }, 'כי מינוף מגדיל סיכון מערכתי');
      }
      default:
        return actionResult('הפעולה לא קיימת כרגע.', { stress: 1 }, 'כי משהו לא נטען נכון');
    }
  }

  function buyAsset(kind) {
    const template = ASSET_CATALOG[kind];
    if (!template) {
      return actionResult('הנכס הזה לא זמין כרגע.', { stress: 1 }, 'כי אין לו הגדרה');
    }

    let effects = { money: -template.price, reputation: template.rep, stress: template.stress };
    if (state.stats.money < template.price) {
      const gap = template.price - state.stats.money;
      state.debts += gap;
      effects = {
        money: -template.price,
        debts: gap,
        reputation: template.rep,
        stress: template.stress + 7,
      };
    }

    state.assets.push({
      id: `asset_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      kind: template.key,
      name: template.name,
      value: template.price,
      maintenance: template.maintenance,
      income: template.income,
      isRented: false,
    });

    return actionResult(`קנית ${template.name}.`, effects, 'כי רכוש נותן כוח אבל גם עלויות');
  }

  function driftAfterAction() {
    if (state.flags.affairActive) {
      adjustSuspicion(3, 'רומן פעיל מעלה חשד');
    }

    if (state.stats.exposure > 70) {
      adjustSuspicion(2, 'חשיפה גבוהה מסכנת סוד');
    }

    if (state.stats.relationship > 65 && state.stats.trust < 40) {
      adjustSuspicion(3, 'קרבה גבוהה בלי אמון מעלה שאלות');
    }
  }

  function adjustSuspicion(delta, reason) {
    state.hidden.suspicion = clamp(state.hidden.suspicion + delta, 0, 100);
    state.characters.partner.suspicion = clamp(state.characters.partner.suspicion + delta, 0, 100);
    if (delta > 0 && chance(30)) {
      addJournal(`החשד עולה: ${reason}`);
    }
  }

  function pickWeightedCategory(poolMode = 'mixed') {
    const base = {
      work: 10,
      money: 10,
      love: 10,
      family: 10,
      health: 10,
      reputation: 10,
      business: 10,
      investments: 10,
      lifestyle: 10,
      education: 10,
    };

    if (poolMode === 'moneyWork') {
      base.work += 25;
      base.money += 20;
      base.business += 15;
      base.investments += 15;
      base.family -= 4;
      base.love -= 4;
    }

    if (poolMode === 'lifeFamily') {
      base.family += 25;
      base.love += 18;
      base.health += 14;
      base.lifestyle += 12;
    }

    if (state.stats.stress > 70) {
      base.health += 16;
      base.family += 8;
    }

    if (state.stats.exposure > 60) {
      base.reputation += 18;
      base.love += 10;
    }

    if (state.stats.money < 0) {
      base.money += 18;
      base.work += 8;
      base.investments += 8;
    }

    if (state.relationship.children > 0) {
      base.family += 20;
      base.money += 7;
    }

    if (state.flags.businessOpen) {
      base.business += 20;
      base.reputation += 8;
    }

    if (state.flags.studying) {
      base.education += 14;
      base.work += 5;
    }

    const positiveEntries = Object.entries(base).filter(([, weight]) => weight > 0);
    const total = positiveEntries.reduce((sum, [, weight]) => sum + weight, 0);
    let roll = Math.random() * total;

    for (const [category, weight] of positiveEntries) {
      roll -= weight;
      if (roll <= 0) {
        return category;
      }
    }

    return 'lifestyle';
  }

  function buildEventFromTemplate(template) {
    return {
      id: template.id,
      title: template.title,
      text: textWithNames(template.text),
      category: template.category,
      choices: makeEventChoices(template.category),
    };
  }

  function makeEventChoices(category) {
    const byCategory = {
      work: ['לקחת אחריות', 'להעביר לחץ הלאה', 'לשחק בטוח'],
      money: ['לבדוק לפני צעד', 'לרוץ מהר', 'לוותר הפעם'],
      love: ['להישאר מקצועי/ת', 'ללכת עם הרגש', 'לשמור מרחק'],
      family: ['לעזור מיד', 'לדחות קצת', 'להציב גבול ברור'],
      health: ['לטפל עכשיו', 'למשוך עוד קצת', 'לעשות מינימום'],
      reputation: ['להגיב שקוף', 'לטפל בשקט', 'להתעלם כרגע'],
      business: ['להעמיק בדיקה', 'לסגור עסקה מהר', 'להמתין'],
      investments: ['סיכון נמוך', 'סיכון גבוה', 'לצאת רגע לצד'],
      lifestyle: ['לזרום', 'לשמור שגרה', 'לקחת מרחק'],
      education: ['להשקיע בלימוד', 'לעשות מינימום', 'לדחות להמשך'],
    };

    const labels = byCategory[category] || ['לבחור בזהירות', 'לבחור מהר', 'לא לבחור כרגע'];
    return labels.map((label, index) => ({
      label,
      resolve: () => resolveEventChoice(category, index),
    }));
  }

  function resolveEventChoice(category, index) {
    const style = index === 0 ? 'safe' : index === 1 ? 'bold' : 'avoid';
    let effects = {};
    let text = 'החלטת ופעלת.';
    let why = '';
    const delayed = [];

    if (category === 'work') {
      if (style === 'safe') {
        effects = { career: 5, trust: 2, stress: 3, energy: -4, money: 1800 };
        text = 'לקחת אחריות וזה הוערך.';
        why = 'כי שמו לב ליציבות שלך';
      } else if (style === 'bold') {
        effects = chance(55) ? { career: 8, money: 5200, stress: 7, exposure: 4 } : { career: -4, stress: 9, trust: -4, exposure: 6 };
        text = 'הלכת על מהלך חד בעבודה.';
        why = 'כי מהלך אגרסיבי יכול להצליח או להתפוצץ';
      } else {
        effects = { stress: -2, career: -2, reputation: -1 };
        text = 'בחרת להוריד הילוך.';
        why = 'כי שקט קצר לפעמים עולה בקידום';
      }
    }

    if (category === 'money') {
      if (style === 'safe') {
        effects = { money: rand(800, 3200), stress: -2, trust: 1 };
        text = 'בדקת לעומק והמהלך היה נקי.';
        why = 'כי בדיקה חוסכת טעויות';
      } else if (style === 'bold') {
        effects = chance(50) ? { money: rand(3500, 12000), stress: 5, exposure: 3 } : { money: -rand(3000, 13000), stress: 8, trust: -3 };
        text = 'רצת מהר על הזדמנות כספית.';
        why = 'כי מהירות נותנת יתרון אבל גם סיכון';
      } else {
        effects = { stress: 1, money: 0, happiness: -1 };
        text = 'ויתרת על המהלך.';
        why = 'כי לפעמים לא לבחור זה לבחור';
      }
    }

    if (category === 'love') {
      if (style === 'safe') {
        effects = { trust: 3, relationship: 2, stress: -2, exposure: -1 };
        text = 'שמרת על גבול ברור.';
        why = 'כי כבוד הדדי מחזק אמון';
      } else if (style === 'bold') {
        const positive = chance(55 + Math.floor(state.stats.relationship / 5));
        if (positive) {
          effects = { relationship: 7, happiness: 6, stress: -5, exposure: 5 };
          text = 'היה רגע טעון. המבט נמשך.';
          adjustSuspicion(hasPartner() ? 7 : 2, 'רגע קרוב מדי');
          why = 'כי קרבה מושכת גם עיניים מבחוץ';
        } else {
          effects = { relationship: -7, trust: -8, stress: 9, exposure: 4 };
          text = 'זה הרגיש לא נכון בזמן הזה.';
          why = 'כי בלי אמון הקרבה נשברת';
        }
      } else {
        effects = { relationship: -2, stress: 1, trust: 1 };
        text = 'בחרת לקחת מרחק.';
        why = 'כי לפעמים מרחק מגן על הקשר';
      }
    }

    if (category === 'family') {
      if (style === 'safe') {
        effects = { family: 8, trust: 3, money: -1200, stress: 2 };
        text = 'היית שם בשביל המשפחה.';
        why = 'כי נוכחות בונה יציבות';
      } else if (style === 'bold') {
        effects = chance(48) ? { money: 2600, family: -5, stress: 5 } : { family: -10, trust: -5, stress: 8 };
        text = 'דחפת את העניין המשפחתי הצידה.';
        why = 'כי פתרון מהיר לא תמיד מחזיק';
      } else {
        effects = { family: -3, stress: -1 };
        text = 'ניסית לאזן בלי החלטה חדה.';
        why = 'כי חצי פתרון משאיר שאריות';
      }
    }

    if (category === 'health') {
      if (style === 'safe') {
        effects = { health: 7, stress: -4, money: -900, energy: 4 };
        text = 'טיפלת בזמן.';
        why = 'כי טיפול מוקדם שומר אנרגיה';
      } else if (style === 'bold') {
        effects = chance(45) ? { health: 3, money: 1200, stress: 5 } : { health: -8, stress: 9, energy: -6 };
        text = 'משכת עוד קצת בלי טיפול מלא.';
        why = 'כי דחייה בריאותית מסוכנת';
      } else {
        effects = { health: -3, stress: 2, energy: -2 };
        text = 'עשית רק את המינימום.';
        why = 'כי הגוף ביקש יותר';
      }
    }

    if (category === 'reputation') {
      if (style === 'safe') {
        effects = { trust: 4, reputation: 5, exposure: 2, stress: 3 };
        text = 'ענית בצורה שקופה ומדויקת.';
        why = 'כי שקיפות בונה מחדש אמון';
      } else if (style === 'bold') {
        effects = chance(50) ? { exposure: -6, reputation: 4, money: -2500 } : { exposure: 12, trust: -7, stress: 9, reputation: -6 };
        text = 'ניסית לסגור את זה בשקט.';
        why = 'כי מהלך מאחורי הקלעים יכול לעבוד או להתפוצץ';
      } else {
        effects = { exposure: 7, stress: 6, trust: -3 };
        text = 'בחרת להתעלם כרגע.';
        why = 'כי שתיקה לפעמים מייצרת שמועות';
      }
      if (effects.exposure && effects.exposure > 8) {
        state.flags.wasExposed = true;
      }
      if (effects.exposure && effects.exposure > 10) {
        state.flags.legalRisk = chance(35) ? true : state.flags.legalRisk;
      }
    }

    if (category === 'business') {
      if (style === 'safe') {
        effects = { career: 6, reputation: 4, money: 3200, stress: 4 };
        text = 'בדקת לעומק לפני החלטה עסקית.';
        why = 'כי בדיקת עומק מונעת בור';
      } else if (style === 'bold') {
        effects = chance(52) ? { money: 14000, career: 8, exposure: 5, stress: 7 } : { money: -11000, trust: -5, stress: 10, reputation: -4 };
        text = 'סגרת עסקה מהר.';
        why = 'כי מהירות בעסק היא חרב דו־צדדית';
        delayed.push({ afterYears: 1, effects: chance(50) ? { money: 9000, reputation: 3 } : { money: -9500, stress: 7, exposure: 4 }, text: 'העסקה המהירה נסגרה חשבון השנה.', why: 'כי סעיפים קטנים חוזרים מאוחר' });
      } else {
        effects = { stress: -2, money: 0, career: -1 };
        text = 'בחרת להמתין.';
        why = 'כי לפעמים לא למהר שווה שקט';
      }
    }

    if (category === 'investments') {
      if (style === 'safe') {
        effects = { investments: 4, stress: -1, money: -1200 };
        delayed.push({ afterYears: 1, effects: { money: 2500, investments: 2 }, text: 'המהלך השמרני נתן תשואה קטנה.', why: 'כי סיכון נמוך זז לאט' });
        text = 'שמרת על תיק יציב.';
        why = 'כי שמרנות מורידה תנודתיות';
      } else if (style === 'bold') {
        effects = chance(50) ? { investments: 8, money: 7000, stress: 6, exposure: 4 } : { investments: -7, money: -8500, stress: 10, exposure: 7 };
        delayed.push({ afterYears: 1, effects: chance(45) ? { money: 11000, exposure: 5 } : { money: -12000, stress: 8, trust: -4 }, text: 'המהלך המסוכן נסגר חזק השנה.', why: 'כי תנודתיות לא נעלמת' });
        text = 'הלכת על מהלך השקעה אגרסיבי.';
        why = 'כי תשואה גבוהה באה עם סיכון גבוה';
      } else {
        effects = { stress: -2, investments: -1 };
        text = 'בחרת לעצור ולצפות מהצד.';
        why = 'כי לפעמים סבלנות שומרת על הון';
      }
    }

    if (category === 'lifestyle') {
      if (style === 'safe') {
        effects = { happiness: 5, stress: -4, money: -700 };
        text = 'בחרת זמן לעצמך.';
        why = 'כי איזון משפר החלטות';
      } else if (style === 'bold') {
        effects = chance(55) ? { happiness: 9, money: -2200, exposure: 4 } : { stress: 7, money: -3600, health: -3 };
        text = 'זרמת עם מהלך ספונטני.';
        why = 'כי ספונטניות יכולה להרים או לשבור';
      } else {
        effects = { stress: -1, happiness: -1, money: 200 };
        text = 'שמרת קו רגוע בלי תנודות.';
        why = 'כי יציבות שומרת אנרגיה';
      }
    }

    if (category === 'education') {
      if (style === 'safe') {
        effects = { career: 5, trust: 2, energy: -3, stress: 2 };
        text = 'השקעת בלמידה אמיתית.';
        why = 'כי ידע מעלה ערך לאורך זמן';
      } else if (style === 'bold') {
        effects = chance(50) ? { career: 6, energy: -5, stress: 4 } : { career: -2, stress: 5, happiness: -2 };
        text = 'עשית קיצור דרך בלמידה.';
        why = 'כי קיצורים לפעמים מצליחים ולפעמים פוגעים';
      } else {
        effects = { career: -1, stress: -1 };
        text = 'דחית את ההשקעה בלימודים.';
        why = 'כי דחייה שומרת כוח עכשיו, פחות אחר כך';
      }
    }

    return { text, effects, why, delayed };
  }

  function startAdvanceYear() {
    if (state.gameOver) {
      toast('המשחק נגמר. תתחיל/י משחק חדש.', true);
      return;
    }

    if (state.currentEvent) {
      toast('יש אירוע פתוח. תסיים/י אותו קודם.', true);
      return;
    }

    state.yearHighlights = [];
    const delayedNotes = processDelayedBeforeYear();
    delayedNotes.forEach((note) => {
      state.yearHighlights.push(note);
    });

    const queue = buildYearEventsQueue();
    state.eventQueue = queue;
    state.currentEvent = state.eventQueue.shift() || null;

    if (!state.currentEvent) {
      finishYear();
      return;
    }

    state.yearSnapshot = {
      money: state.stats.money,
      health: state.stats.health,
      stress: state.stats.stress,
      relationship: state.stats.relationship,
      family: state.stats.family,
      career: state.stats.career,
      status: relationshipStatus(),
    };

    dom.consequenceCard.hidden = true;
    dom.yearSummaryCard.hidden = true;
    dom.eventCard.hidden = false;
    renderAll();
    saveRun();
  }

  function buildYearEventsQueue() {
    const total = SPEED_MAP[state.settings.speed] || SPEED_MAP.normal;
    const queue = [];

    queue.push(randomEventByMode('moneyWork'));
    queue.push(randomEventByMode('lifeFamily'));

    const incoming = buildIncomingCharacterEvent();
    if (incoming) {
      queue.push(incoming);
    }

    while (queue.length < total) {
      queue.push(randomEventByMode('mixed'));
    }

    for (let i = queue.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = queue[i];
      queue[i] = queue[j];
      queue[j] = temp;
    }

    return queue.slice(0, total);
  }

  function randomEventByMode(mode) {
    const category = pickWeightedCategory(mode);
    const pool = EVENT_TEMPLATES.filter((event) => event.category === category);
    const template = pick(pool.length ? pool : EVENT_TEMPLATES);
    return buildEventFromTemplate(template);
  }

  function buildIncomingCharacterEvent() {
    const events = [];
    const partner = state.characters.partner;
    const temptation = state.characters.temptation;
    const familyMember = state.characters.family;

    if (hasPartner()) {
      if (partner.suspicion >= 70 || state.hidden.suspicion >= 72) {
        events.push({
          id: 'incoming_confront',
          title: 'שיחה קשה בבית',
          text: `${partner.name} אומר/ת: "אני מרגיש/ה שמשהו לא בסדר."`,
          category: 'love',
          choices: [
            {
              label: 'להודות חלקית',
              resolve: () => {
                const heavy = state.flags.affairActive && chance(55);
                if (heavy) {
                  state.flags.caughtCheating = true;
                  state.flags.divorced = state.flags.isMarried && chance(50);
                  state.flags.isDating = state.flags.divorced ? false : state.flags.isDating;
                  state.flags.isMarried = state.flags.divorced ? false : state.flags.isMarried;
                  state.flags.affairActive = false;
                  return { text: 'האמת יצאה. הבית רעד.', effects: { trust: -18, relationship: -15, stress: 15, exposure: 12, family: -10 }, why: 'כי הודאה מאוחרת כואבת יותר' };
                }
                adjustSuspicion(-18, 'שיחה פתוחה הורידה חשד');
                return { text: 'היית כנה חלקית וזה הרגיע קצת.', effects: { trust: -4, relationship: -2, stress: -3 }, why: 'כי שקיפות חלקית עדיין עוזרת' };
              },
            },
            {
              label: 'להכחיש הכול',
              resolve: () => {
                const exposed = chance(45);
                if (exposed) {
                  state.flags.caughtCheating = state.flags.affairActive || state.flags.caughtCheating;
                  state.flags.blackmailRisk = chance(40);
                  return { text: 'ההכחשה לא עברה. משהו נחשף.', effects: { trust: -16, exposure: 10, stress: 12, reputation: -8 }, why: 'כי כשאין אמון, הכחשה נראית כמו אשמה' };
                }
                adjustSuspicion(8, 'הכחשה העלתה חשד');
                return { text: 'הכחשת והמצב נשאר באוויר.', effects: { stress: 8, trust: -7, relationship: -5 }, why: 'כי התחושה לא נעלמה' };
              },
            },
            {
              label: 'לבקש זמן ומרחק',
              resolve: () => ({ text: 'לקחתם מרחק לזמן קצר.', effects: { relationship: -6, stress: -2, family: -3 }, why: 'כי מרחק נותן אוויר אבל מרחיק' }),
            },
          ],
        });
      }

      if (chance(30)) {
        events.push({
          id: 'incoming_partner_msg',
          title: 'הודעה מאוחרת',
          text: `${partner.name} כותב/ת: "בוא/י נדבר רגע לבד הלילה."`,
          category: 'love',
          choices: [
            { label: 'לענות בחום', resolve: () => ({ text: 'השיחה קירבה אתכם.', effects: { relationship: 6, stress: -3, happiness: 4, exposure: 2 }, why: 'כי קרבה מורידה מתח' }) },
            { label: 'לענות קצר', resolve: () => ({ text: 'שמרת על מרחק רגשי.', effects: { relationship: -2, trust: -2, stress: 2 }, why: 'כי קור מרגיש כמו דחייה' }) },
            { label: 'להתעלם', resolve: () => ({ text: 'ההודעה נשארה בלי מענה.', effects: { relationship: -5, trust: -5, stress: 4 }, why: 'כי שתיקה בקשר צורבת' }) },
          ],
        });
      }
    }

    if (chance(22)) {
      events.push({
        id: 'incoming_temptation',
        title: 'מסר לא צפוי',
        text: `${temptation.name} כותב/ת: "את/ה ער/ה?"`,
        category: 'love',
        choices: [
          { label: 'להגיב', resolve: () => ({ text: 'השיחה הייתה טעונה.', effects: { happiness: 3, exposure: 6, stress: 4, trust: -3 }, why: 'כי הודעות לילה מושכות סיכון' }) },
          { label: 'למחוק', resolve: () => ({ text: 'מחקת והמשכת.', effects: { trust: 2, stress: -1 }, why: 'כי עצירה מוקדמת מורידה סיכון' }) },
        ],
      });
    }

    if (chance(26)) {
      events.push({
        id: 'incoming_family',
        title: 'טלפון מהמשפחה',
        text: `${familyMember.name} מבקש/ת שתגיע/י הערב.`,
        category: 'family',
        choices: [
          { label: 'להגיע', resolve: () => ({ text: 'היית שם בזמן.', effects: { family: 7, stress: 2, money: -900 }, why: 'כי תמיכה משפחתית עולה גם זמן וכסף' }) },
          { label: 'לדחות', resolve: () => ({ text: 'דחית את הבקשה.', effects: { family: -5, stress: 3, money: 800 }, why: 'כי הדחייה פוגעת באמון' }) },
        ],
      });
    }

    if (!events.length) {
      return null;
    }

    return pick(events);
  }

  function processDelayedBeforeYear() {
    if (!state.delayed.length) {
      return [];
    }

    const pending = [];
    const notes = [];

    state.delayed.forEach((item) => {
      item.afterYears -= 1;
      if (item.afterYears <= 0) {
        const chips = applyEffects(item.effects || {});
        if (item.text) {
          notes.push(item.text);
          addJournal(item.text);
        }
        if (chips.length) {
          showConsequence(chips, item.why || 'זה חזר אליך אחר כך');
        }
      } else {
        pending.push(item);
      }
    });

    state.delayed = pending;
    return notes;
  }

  function updateCharacterMind() {
    const partner = state.characters.partner;
    const temptation = state.characters.temptation;
    const family = state.characters.family;

    partner.mood = clamp(partner.mood + rand(-8, 8) - Math.floor(state.stats.stress / 20), 0, 100);
    partner.trust = clamp(partner.trust + Math.floor((state.stats.trust - 50) / 14), 0, 100);
    partner.jealousy = clamp(partner.jealousy + (state.flags.affairActive ? 8 : -2) + (state.stats.exposure > 65 ? 3 : 0), 0, 100);
    partner.anger = clamp(partner.anger + (state.flags.affairActive ? 6 : -3) + (state.stats.relationship < 30 ? 4 : -1), 0, 100);

    temptation.mood = clamp(temptation.mood + rand(-10, 10), 0, 100);
    temptation.desire = clamp(temptation.desire + (state.flags.affairActive ? 6 : -1), 0, 100);

    family.mood = clamp(family.mood + (state.stats.family > 60 ? 3 : -4) + rand(-5, 5), 0, 100);

    if (state.flags.affairActive) {
      adjustSuspicion(8, 'רומן פעיל לאורך שנה');
    }

    if (state.stats.exposure > 70) {
      adjustSuspicion(5, 'חשיפה גבוהה לאורך שנה');
    }

    if (state.stats.relationship > 70 && state.stats.trust < 40) {
      adjustSuspicion(5, 'קרבה בלי אמון');
    }
  }

  function handleEventChoice(index) {
    if (lockChoice || !state.currentEvent) {
      return;
    }

    const choice = state.currentEvent.choices[index];
    if (!choice) {
      return;
    }

    lockChoice = true;
    const result = choice.resolve();
    handleResult(result, `${state.currentEvent.title}: ${choice.label}`, true);

    dom.nextEventBtn.hidden = false;
    renderAll();
    saveRun();
  }

  function handleResult(result, label, fromEvent) {
    if (!result) {
      return;
    }

    const chips = applyEffects(result.effects || {});

    if (Array.isArray(result.delayed) && result.delayed.length) {
      result.delayed.forEach((item) => {
        if (Number.isFinite(item.afterYears)) {
          state.delayed.push(deepClone(item));
        }
      });
    }

    const logLine = `${label} | ${result.text || ''}`.trim();
    state.history.unshift({
      year: state.yearCount,
      age: state.age,
      label,
      text: result.text || '',
    });
    state.history = state.history.slice(0, 120);

    if (result.text) {
      addJournal(result.text);
      state.yearHighlights.push(result.text);
    }

    showConsequence(chips, result.why || randomWhy());
    runWarningToasts();

    if (!fromEvent) {
      toast(logLine, false);
    }
  }

  function applyEffects(effects) {
    const chips = [];

    Object.entries(effects).forEach(([key, rawValue]) => {
      if (!rawValue || !Number.isFinite(rawValue)) {
        return;
      }

      if (key === 'money') {
        state.stats.money += rawValue;
      } else if (key === 'debts') {
        state.debts = Math.max(0, state.debts + rawValue);
      } else if (key === 'suspicion') {
        state.hidden.suspicion = clamp(state.hidden.suspicion + rawValue, 0, 100);
      } else if (key === 'scandalRisk') {
        state.hidden.scandalRisk = clamp(state.hidden.scandalRisk + rawValue, 0, 100);
      } else if (key === 'children') {
        state.relationship.children = Math.max(0, state.relationship.children + rawValue);
      } else if (Object.prototype.hasOwnProperty.call(state.stats, key)) {
        state.stats[key] += rawValue;
      }

      chips.push({ key, value: rawValue });
    });

    clampAllStats(state.stats);
    state.hidden.suspicion = clamp(state.hidden.suspicion, 0, 100);
    state.hidden.scandalRisk = clamp(state.hidden.scandalRisk, 0, 100);

    if (state.stats.money < -40000) {
      state.flags.hadCollapse = true;
    }

    return chips;
  }

  function showConsequence(chips, why) {
    dom.consequenceCard.hidden = false;
    dom.consequenceChips.innerHTML = '';

    chips.forEach((chipData) => {
      const chip = document.createElement('span');
      chip.className = `chip ${chipData.value >= 0 ? 'pos' : 'neg'}`;
      const label = STAT_LABELS[chipData.key] || chipData.key;
      chip.textContent = `${chipData.value >= 0 ? '+' : '-'} ${label} ${Math.abs(Math.round(chipData.value))}`;
      dom.consequenceChips.appendChild(chip);
    });

    dom.whyLine.textContent = why || '';
  }

  function randomWhy() {
    return pick(['כי הלחץ היה גבוה', 'כי לקחת סיכון גדול', 'כי היה חוסר אמון', 'כי שמרת על קו יציב', 'כי היו יותר מדי עיניים עליך']);
  }

  function nextEvent() {
    if (!state.currentEvent) {
      return;
    }

    lockChoice = false;
    dom.nextEventBtn.hidden = true;

    if (state.eventQueue.length) {
      state.currentEvent = state.eventQueue.shift();
      renderAll();
      saveRun();
      return;
    }

    state.currentEvent = null;
    finishYear();
  }

  function finishYear() {
    const finance = applyAnnualFinances();
    updateCharacterMind();

    const snapshot = state.yearSnapshot || {
      money: state.stats.money,
      health: state.stats.health,
      stress: state.stats.stress,
      relationship: state.stats.relationship,
      family: state.stats.family,
      career: state.stats.career,
      status: relationshipStatus(),
    };

    const summary = {
      startMoney: snapshot.money,
      endMoney: state.stats.money,
      work: finance.workLine,
      love: `סטטוס: ${relationshipStatus()}${state.flags.affairActive ? ' | רומן פעיל' : ''}`,
      family: `משפחה: ${state.stats.family} | ילדים: ${state.relationship.children}`,
      health: `בריאות: ${snapshot.health} → ${state.stats.health} | לחץ: ${snapshot.stress} → ${state.stats.stress}`,
      highlights: state.yearHighlights.slice(0, 3),
    };

    state.lastSummary = summary;
    state.yearHighlights = [];
    state.actionsThisYear = 0;

    checkAchievements();
    checkEndings('year');

    if (!state.gameOver) {
      state.age += 1;
      state.yearCount += 1;
    }

    dom.yearSummaryCard.hidden = false;
    dom.eventCard.hidden = true;
    renderAll();
    saveRun();
  }

  function applyAnnualFinances() {
    let income = 0;
    let costs = 0;
    let workLine = 'עבודה: שנה רגילה.';

    if (state.flags.hasJob) {
      const salary = state.job.salary || 0;
      income += salary;
      workLine = `עבודה: ${state.job.title} | הכנסה שנתית ${formatMoney(salary)}`;
      if (chance(8) && state.stats.stress > 80) {
        state.flags.hasJob = false;
        state.job = { title: 'ללא עבודה', salary: 0, level: 0 };
        workLine = 'עבודה: איבדת את העבודה בגלל עומס.';
        addJournal('עומס גבוה פגע ביציבות בעבודה.');
        applyEffects({ stress: 8, career: -5, trust: -3 });
      }
    }

    if (state.flags.businessOpen) {
      const pressure = state.business.employees * 22000;
      const businessIncome = Math.round(20000 + state.stats.reputation * 450 + state.stats.career * 220 - pressure + rand(-18000, 18000));
      if (businessIncome >= 0) {
        income += businessIncome;
      } else {
        costs += Math.abs(businessIncome);
      }
      addJournal(`סיכום עסק: ${formatMoney(businessIncome)}.`);
    }

    if (state.investments.capital > 0) {
      const risk = state.investments.risk / 100;
      const quality = state.stats.investments / 100;
      const reputationFactor = (state.stats.reputation - state.stats.exposure) / 120;
      const baseReturn = (quality * 0.12) + (risk * 0.18) + reputationFactor - 0.08;
      const randomMove = rand(-18, 18) / 100;
      const rate = baseReturn + randomMove;
      const pnl = Math.round(state.investments.capital * rate);
      if (pnl >= 0) {
        income += pnl;
      } else {
        costs += Math.abs(pnl);
      }
      state.stats.investments = clamp(state.stats.investments + Math.round(rate * 20), 0, 100);
      addJournal(`השקעות השנה: ${formatMoney(pnl)}.`);
    }

    const assetMaintenance = state.assets.reduce((sum, asset) => sum + (asset.maintenance || 0), 0);
    const assetIncome = state.assets.reduce((sum, asset) => {
      if (asset.kind === 'apartment' && asset.isRented) {
        return sum + asset.income;
      }
      if (asset.kind !== 'apartment') {
        return sum + Math.round(asset.income * 0.25);
      }
      return sum;
    }, 0);

    income += assetIncome;
    costs += assetMaintenance;

    const familyCost = 12000 + state.relationship.children * 9000 + (state.flags.isMarried ? 5000 : 0);
    costs += familyCost;

    if (state.debts > 0) {
      const interest = Math.round(state.debts * 0.14);
      state.debts += interest;
      const payment = Math.min(state.debts, Math.max(4000, Math.round(Math.abs(state.stats.money) * 0.04) + 2000));
      state.debts -= payment;
      costs += payment;
      addJournal(`תשלום חוב שנתי: ${formatMoney(payment)}.`);
    }

    state.stats.money += income - costs;

    if (income - costs > 0) {
      applyEffects({ happiness: 3, stress: -2 });
    } else {
      applyEffects({ happiness: -4, stress: 5 });
    }

    if (state.stats.money < -20000) {
      state.flags.hadCollapse = true;
      applyEffects({ trust: -3, stress: 6 });
    }

    return {
      income,
      costs,
      workLine,
    };
  }

  function renderAll() {
    renderTop();
    renderStats();
    renderEvent();
    renderSummary();
    renderTab();
    renderJournal();
    renderEndingCollection();
    renderEndingState();
    renderNgp();
    updateContinueState();
  }

  function renderTop() {
    dom.body.setAttribute('data-theme', state.settings.theme);
    dom.themeBtn.textContent = `מצב: ${state.settings.theme === 'dark' ? 'כהה' : 'בהיר'}`;
    dom.speedSelect.value = state.settings.speed;

    dom.ageYearLine.textContent = `גיל: ${state.age} | שנה: ${state.yearCount}`;
    dom.queueIndicator.textContent = `אירועי השנה: ${state.currentEvent ? state.eventQueue.length + 1 : 0}`;
    dom.relationshipIndicator.textContent = `סטטוס אהבה: ${relationshipStatus()}${state.flags.affairActive ? ' | רומן פעיל' : ''}`;
    dom.jobIndicator.textContent = `עבודה: ${state.job.title}`;

    dom.advanceYearBtn.disabled = Boolean(state.currentEvent) || state.gameOver;

    dom.tabButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tab === state.activeTab);
    });
  }

  function renderStats() {
    dom.moneyLine.textContent = `כסף: ${formatMoney(state.stats.money)} | חובות: ${formatMoney(state.debts)}`;
    dom.statsBars.innerHTML = '';

    STAT_META.forEach((entry) => {
      const row = document.createElement('div');
      row.className = 'bar-row';

      const label = document.createElement('label');
      label.textContent = entry.label;
      const value = document.createElement('span');
      value.textContent = String(Math.round(state.stats[entry.key]));
      label.appendChild(value);

      const bar = document.createElement('div');
      bar.className = 'bar';
      const fill = document.createElement('span');
      fill.style.width = `${state.stats[entry.key]}%`;
      bar.appendChild(fill);

      row.appendChild(label);
      row.appendChild(bar);
      dom.statsBars.appendChild(row);
    });
  }

  function renderEvent() {
    if (!state.currentEvent) {
      dom.eventCard.hidden = true;
      return;
    }

    dom.eventCard.hidden = false;
    dom.eventTitle.textContent = state.currentEvent.title;
    dom.eventText.textContent = state.currentEvent.text;
    dom.eventChoices.innerHTML = '';

    state.currentEvent.choices.forEach((choice, index) => {
      const btn = document.createElement('button');
      btn.className = 'event-choice';
      btn.type = 'button';
      btn.textContent = choice.label;
      btn.disabled = lockChoice;
      btn.addEventListener('click', () => handleEventChoice(index));
      dom.eventChoices.appendChild(btn);
    });
  }

  function renderSummary() {
    if (!state.lastSummary || state.currentEvent) {
      dom.yearSummaryCard.hidden = true;
      return;
    }

    dom.yearSummaryCard.hidden = false;
    dom.yearMoneyFlow.textContent = `כסף: התחיל ${formatMoney(state.lastSummary.startMoney)} → הסתיים ${formatMoney(state.lastSummary.endMoney)}`;
    dom.yearWorkFlow.textContent = state.lastSummary.work;
    dom.yearLoveFlow.textContent = `אהבה: ${state.lastSummary.love}`;
    dom.yearFamilyFlow.textContent = `משפחה: ${state.lastSummary.family}`;
    dom.yearHealthFlow.textContent = state.lastSummary.health;

    dom.yearHighlights.innerHTML = '';
    const highlights = state.lastSummary.highlights.length ? state.lastSummary.highlights : ['שנה יציבה יחסית ללא אירוע בולט.'];
    highlights.slice(0, 3).forEach((line) => {
      const li = document.createElement('li');
      li.textContent = line;
      dom.yearHighlights.appendChild(li);
    });
  }

  function renderTab() {
    if (state.activeTab === 'journal') {
      dom.tabCard.hidden = true;
      dom.journalCard.hidden = false;
      dom.endingCollectionCard.hidden = true;
      return;
    }

    dom.tabCard.hidden = false;
    dom.journalCard.hidden = true;

    dom.tabTitle.textContent = TAB_LABELS[state.activeTab] || 'חיים';
    dom.tabSummary.innerHTML = '';

    getTabSummary(state.activeTab).forEach((line) => {
      const li = document.createElement('li');
      li.textContent = line;
      dom.tabSummary.appendChild(li);
    });

    dom.tabActions.innerHTML = '';
    const actions = ACTION_DEFS[state.activeTab] || [];
    actions.forEach((action) => {
      const btn = document.createElement('button');
      btn.className = 'action-btn';
      btn.type = 'button';
      btn.textContent = action.label;
      btn.addEventListener('click', () => applyAction(action.id));
      dom.tabActions.appendChild(btn);
    });

    dom.endingCollectionCard.hidden = state.activeTab !== 'life';
  }

  function getTabSummary(tab) {
    const partnerName = state.relationship.partnerName;
    const assetsCount = state.assets.length;
    switch (tab) {
      case 'life':
        return [
          `מצב כללי: ${state.stats.happiness >= 60 ? 'סביר' : 'לחוץ'}`,
          `חשד נסתר: ${state.hidden.suspicion}`,
          `אירועים השנה: ${SPEED_MAP[state.settings.speed] || 5}`,
        ];
      case 'work':
        return [
          `תפקיד: ${state.job.title}`,
          `שכר שנתי: ${formatMoney(state.job.salary)}`,
          `קריירה: ${state.stats.career}`,
        ];
      case 'love':
        return [
          `סטטוס: ${relationshipStatus()}`,
          `בן/בת זוג: ${hasPartner() ? partnerName : 'אין קשר קבוע'}`,
          `רומן פעיל: ${state.flags.affairActive ? 'כן' : 'לא'}`,
        ];
      case 'family':
        return [
          `משפחה: ${state.stats.family}`,
          `ילדים: ${state.relationship.children}`,
          `קרוב/ת משפחה מרכזי/ת: ${state.characters.family.name}`,
        ];
      case 'assets':
        return [
          `נכסים בבעלותך: ${assetsCount}`,
          `שווי משוער: ${formatMoney(state.assets.reduce((s, a) => s + a.value, 0))}`,
          `חובות: ${formatMoney(state.debts)}`,
        ];
      case 'health':
        return [
          `בריאות: ${state.stats.health}`,
          `אנרגיה: ${state.stats.energy}`,
          `לחץ: ${state.stats.stress}`,
        ];
      case 'education':
        return [
          `לומד/ת כרגע: ${state.flags.studying ? 'כן' : 'לא'}`,
          `תואר הושלם: ${state.flags.finishedDegree ? 'כן' : 'לא'}`,
          `קריירה: ${state.stats.career}`,
        ];
      case 'business':
        return [
          `עסק פתוח: ${state.flags.businessOpen ? 'כן' : 'לא'}`,
          `עובדים: ${state.business.employees}`,
          `שותף/ה: ${state.business.partnerName}`,
        ];
      case 'investments':
        return [
          `הון מושקע: ${formatMoney(state.investments.capital)}`,
          `סיכון תיק: ${state.investments.risk}`,
          `מדד השקעות: ${state.stats.investments}`,
        ];
      default:
        return [];
    }
  }

  function renderJournal() {
    dom.journalList.innerHTML = '';
    const lines = state.journal.slice(0, 40);
    if (!lines.length) {
      const empty = document.createElement('div');
      empty.className = 'list-item';
      empty.textContent = 'עדיין אין רישום ביומן.';
      dom.journalList.appendChild(empty);
      return;
    }

    lines.forEach((entry) => {
      const item = document.createElement('div');
      item.className = 'list-item';
      item.textContent = `גיל ${entry.age}, שנה ${entry.year}: ${entry.text}`;
      dom.journalList.appendChild(item);
    });
  }

  function renderEndingCollection() {
    dom.endingProgress.textContent = `נפתחו ${meta.unlockedEndings.length}/${ENDINGS.length}`;
    dom.endingGrid.innerHTML = '';

    ENDINGS.forEach((ending) => {
      const open = meta.unlockedEndings.includes(ending.id);
      const card = document.createElement('div');
      card.className = `end-card ${open ? '' : 'locked'}`;
      card.innerHTML = open ? `<strong>${ending.title}</strong><p>${ending.summary}</p>` : '<strong>נעול</strong><p>עוד לא פתחת את הסיום הזה.</p>';
      dom.endingGrid.appendChild(card);
    });
  }

  function renderEndingState() {
    if (!state.gameOver || !state.currentEnding) {
      dom.endingCard.hidden = true;
      return;
    }
    const ending = ENDINGS.find((item) => item.id === state.currentEnding);
    if (!ending) {
      dom.endingCard.hidden = true;
      return;
    }
    dom.endingCard.hidden = false;
    dom.endingTitle.textContent = ending.title;
    dom.endingText.textContent = ending.summary;
  }

  function renderNgp() {
    const hasUnlockedEnding = meta.unlockedEndings.length > 0;
    dom.ngpBox.hidden = !hasUnlockedEnding;
    dom.perkButtons.innerHTML = '';

    if (!hasUnlockedEnding) {
      return;
    }

    PERKS.forEach((perk) => {
      const btn = document.createElement('button');
      btn.className = 'perk-btn';
      btn.type = 'button';
      btn.textContent = perk.label;
      btn.addEventListener('click', () => {
        startNewGame(perk.id);
      });
      dom.perkButtons.appendChild(btn);
    });
  }

  function addJournal(text) {
    if (!text) {
      return;
    }
    state.journal.unshift({ year: state.yearCount, age: state.age, text });
    state.journal = state.journal.slice(0, 200);
  }

  function checkAchievements() {
    ACHIEVEMENTS.forEach((achievement) => {
      if (!meta.unlockedAchievements.includes(achievement.id) && achievement.check(state)) {
        meta.unlockedAchievements.push(achievement.id);
        toast(`הישג נפתח: ${achievement.title}`);
      }
    });
    saveMeta();
  }

  function checkEndings(source) {
    if (state.gameOver) {
      return;
    }

    for (const ending of ENDINGS) {
      if (!ending.early && state.age < 30) {
        continue;
      }
      if (ending.condition(state)) {
        state.gameOver = true;
        state.currentEnding = ending.id;

        if (!meta.unlockedEndings.includes(ending.id)) {
          meta.unlockedEndings.push(ending.id);
          toast(`סיום חדש נפתח: ${ending.title}`);
        } else {
          toast(`הגעת לסיום: ${ending.title}`);
        }

        addJournal(`סיום: ${ending.title} (${source})`);
        saveMeta();
        clearRun();
        break;
      }
    }
  }

  function runWarningToasts() {
    if (state.stats.money < 0) {
      toast('אזהרה: כסף במינוס', true);
    }
    if (state.stats.stress > 85) {
      toast('לחץ חריג', true);
    }
    if (state.stats.health < 20) {
      toast('בריאות נמוכה מאוד', true);
    }
    if (state.stats.exposure > 75) {
      toast('חשיפה גבוהה', true);
    }
    if (state.stats.trust < 25) {
      toast('אמון נשחק', true);
    }
    if (state.hidden.suspicion > 80) {
      toast('חשד גבוה מאוד', true);
    }
  }

  function toast(message, alert = false) {
    const item = document.createElement('div');
    item.className = `toast${alert ? ' alert' : ''}`;
    item.textContent = message;
    dom.toastBox.appendChild(item);
    setTimeout(() => {
      item.remove();
    }, 2600);
  }

  function toggleTheme() {
    state.settings.theme = state.settings.theme === 'dark' ? 'light' : 'dark';
    meta.settings.theme = state.settings.theme;
    saveMeta();
    saveRun();
    renderAll();
  }

  function setSpeed(value) {
    state.settings.speed = SPEED_MAP[value] ? value : 'normal';
    meta.settings.speed = state.settings.speed;
    saveMeta();
    saveRun();
    renderAll();
  }

  function updateContinueState() {
    dom.continueBtn.disabled = !loadRun();
  }

  function startNewGame(perkId = null) {
    state = createNewState(perkId);
    dom.consequenceCard.hidden = true;
    dom.yearSummaryCard.hidden = true;
    dom.eventCard.hidden = true;
    lockChoice = false;
    saveRun();
    renderAll();
  }

  function continueRun() {
    const loaded = loadRun();
    if (!loaded) {
      toast('אין שמירה זמינה.');
      return;
    }
    state = loaded;
    renderAll();
  }

  function bindListeners() {
    dom.newGameBtn.addEventListener('click', () => startNewGame());
    dom.continueBtn.addEventListener('click', continueRun);
    dom.themeBtn.addEventListener('click', toggleTheme);
    dom.speedSelect.addEventListener('change', (event) => setSpeed(event.target.value));
    dom.helpBtn.addEventListener('click', () => dom.helpDialog.showModal());
    dom.closeHelpBtn.addEventListener('click', () => dom.helpDialog.close());
    dom.advanceYearBtn.addEventListener('click', startAdvanceYear);
    dom.nextEventBtn.addEventListener('click', nextEvent);
    dom.endingNewGameBtn.addEventListener('click', () => startNewGame());

    dom.tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        state.activeTab = btn.dataset.tab;
        renderAll();
        saveRun();
      });
    });

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && dom.helpDialog.open) {
        dom.helpDialog.close();
      }
    });
  }

  function init() {
    bindListeners();

    if (!TAB_ORDER.includes(state.activeTab)) {
      state.activeTab = 'life';
    }

    if (!SPEED_MAP[state.settings.speed]) {
      state.settings.speed = meta.settings.speed || 'normal';
    }

    if (!['dark', 'light'].includes(state.settings.theme)) {
      state.settings.theme = meta.settings.theme || 'dark';
    }

    meta.settings.theme = state.settings.theme;
    meta.settings.speed = state.settings.speed;

    saveMeta();
    if (!state.gameOver) {
      saveRun();
    }

    renderAll();
    addJournal(`משחק חדש נטען. גיל ${state.age}.`);
  }
})();
