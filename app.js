
(() => {
  "use strict";

  const K = { run: "kav_dak_run_v6", meta: "kav_dak_meta_v6" };
  const PH = { HOME: "HOME", RUNNING: "RUNNING", RESULT: "RESULT", ENDED: "ENDED" };
  const TABS = ["story", "actions", "assets", "relations", "family", "clues", "endings"];
  const WEEKS_IN_MONTH = 4;
  const MAX_ACTIONS = 3;
  const MAX_TURNS = 160;

  const NAMES = {
    male: ["אורי","נועם","יואב","איתן","רון","עידו","ליאור","תומר","גיא","דניאל","ברק","עומר","אלון","יותם","רועי","אסף","ניב","שחר","עומרי","עמית"],
    female: ["מאיה","נועה","תמר","יעל","איילת","שירה","רותם","מיכל","ליה","אופיר","גל","אדוה","רוני","הילה","דנה","נטע","ספיר","מור","קרן","יולי"],
    neutral: ["שי","לי","טל","בר","חן","עדי","סתיו","אור","יובל","אריאל"]
  };

  const INIT = { money:5000,cashflow:45,investments:35,assets:0,debts:0,energy:70,stress:25,exposure:15,trust:55,relationship:15,family:40,reputation:45 };
  const PCT = ["cashflow","investments","energy","stress","exposure","trust","relationship","family","reputation"];
  const LABEL = { money:"כסף",cashflow:"תזרים",investments:"השקעות",assets:"נכסים",debts:"חובות",energy:"אנרגיה",stress:"לחץ",exposure:"כמה יודעים עליך",trust:"כמה סומכים עליך",relationship:"קשר",family:"בית/משפחה",reputation:"מוניטין" };

  const ITEMS = [
    {id:"car",name:"רכב",price:42000,risk:"בינוני",note:"נוח לפגישות.",monthlyIncome:0,monthlyCost:1200,monthlyEffects:{energy:1,reputation:1}},
    {id:"small_apartment",name:"דירה קטנה",price:185000,risk:"בינוני",note:"אפשר לשכור או לגור.",monthlyIncome:2500,monthlyCost:700,monthlyEffects:{family:4,stress:-1}},
    {id:"business",name:"עסק",price:130000,risk:"גבוה",note:"יכול לקפוץ או ליפול.",monthlyIncome:5000,monthlyCost:2200,monthlyEffects:{cashflow:4,stress:2,reputation:2}},
    {id:"laptop",name:"מחשב חדש",price:9200,risk:"נמוך",note:"יותר שליטה.",monthlyIncome:0,monthlyCost:0,monthlyEffects:{energy:2,reputation:1}},
    {id:"phone",name:"טלפון יקר",price:6800,risk:"בינוני",note:"מושך עיניים.",monthlyIncome:0,monthlyCost:250,monthlyEffects:{relationship:2,exposure:2}},
    {id:"office",name:"משרד קטן",price:76000,risk:"בינוני",note:"יותר לקוחות רואים אותך.",monthlyIncome:2200,monthlyCost:1600,monthlyEffects:{reputation:3,cashflow:2}},
    {id:"second_car",name:"רכב שני",price:56000,risk:"גבוה",note:"נוח לחיים כפולים.",monthlyIncome:0,monthlyCost:1600,monthlyEffects:{exposure:4,relationship:2}},
    {id:"kids_room",name:"חדר ילדים",price:26000,risk:"נמוך",note:"בית נוח לילדים.",monthlyIncome:0,monthlyCost:500,monthlyEffects:{family:6,stress:-2}}
  ];

  const CLUES = [
    ["c001","מישהו צילם אותך",3,"חשיפה"],["c002","מסמך חסר",2,"ביזנס"],["c003","הודעה נמחקה",2,"קשר"],["c004","השם שלך עלה בשיחה",2,"חשיפה"],["c005","חתימה לא זהה",3,"ביזנס"],["c006","הבטחה בלי הוכחה",2,"השקעות"],["c007","מספר חסוי חוזר",1,"קשר"],["c008","מישהו עקב אחרי פגישה",2,"חשיפה"],["c009","העברה חזרה",2,"השקעות"],["c010","צד שלישי בתמונה",3,"חשיפה"],
    ["c011","מכתב מעורך דין",3,"חשיפה"],["c012","מישהו שיקר על סכום",2,"ביזנס"],["c013","פגישה אחרי חצות",2,"קשר"],["c014","הטלפון צלצל בזמן רע",2,"משפחה"],["c015","צילום מסך בקבוצה",3,"חשיפה"],["c016","חוזה בלי סעיף",2,"ביזנס"],["c017","שם של חשבון זר",3,"השקעות"],["c018","השומר זכר אותך",1,"חשיפה"],["c019","יד נגעה ביד",1,"קשר"],["c020","הבית דורש תשובה",2,"משפחה"],
    ["c021","השותף אוסף חומר",2,"ביזנס"],["c022","מספר חסום שוב",2,"קשר"],["c023","דוח חתוך",2,"השקעות"],["c024","יש מפתח נוסף",2,"חשיפה"],["c025","מישהו ראה אתכם יחד",3,"קשר"],["c026","שורה נמחקה בחוזה",2,"ביזנס"],["c027","ריבית לא כתובה",2,"השקעות"],["c028","שאלו איפה היית",2,"משפחה"],["c029","קובץ הגיע ליעד לא נכון",3,"חשיפה"],["c030","חיוך לחוץ",1,"קשר"],
    ["c031","נפתחה בדיקה",3,"ביזנס"],["c032","רווח מהיר מדי",3,"השקעות"],["c033","תמונה מהחניה",2,"חשיפה"],["c034","הילד שאל שאלה קשה",1,"משפחה"],["c035","מייל יצא מהחשבון שלך",2,"חשיפה"],["c036","השותף שמר העתק",2,"ביזנס"],["c037","איומי פרישה",2,"ביזנס"],["c038","השקעה נקייה מדי",1,"השקעות"],["c039","שיחה שקטה במסדרון",1,"קשר"],["c040","עורך דין בתמונה",3,"חשיפה"],
    ["c041","חוב ישן חזר",2,"משפחה"],["c042","השומר סימן אותך",1,"חשיפה"]
  ].map(([id,text,severity,category])=>({id,text,severity,category}));

  const ENDINGS = [
    ["cold_win","ניצחון קר","עשית הרבה כסף. נשארת לבד עם זה."],["family_win","ניצחון בית","בחרת בבית. פחות כסף, יותר שקט."],["scandal","כולם יודעים","הכול דלף. אין לאן לברוח."],["collapse","קריסה","חובות ותזרים גררו אותך למטה."],["burnout","נגמר הכוח","הלחץ ניצח לפני הסוף."],["betrayal","בגידה","שברת אמון בבית ובעסק."],["legal_trouble","תיק משפטי","המסמכים הגיעו לבית משפט."],["double_life","חיים כפולים","בינתיים אף אחד לא תפס. בינתיים."],["redemption","חזרה לחיים","נפלת וקמת מחדש."],["quiet_money","כסף שקט","בלי רעש, עם רווח יציב."],
    ["dirty_rich","עשיר אבל מלוכלך","הרווחת בגדול, השם שלך נפגע."],["alone_top","למעלה לבד","יש כוח וכסף. אין אנשים סביבך."],["broke_home","עני אבל בבית","פחות כסף, יותר בית."],["blackmail","סחיטה","מישהו מחזיק עליך חומר."],["divorce_public","פירוק פומבי","זה נגמר מול כולם."],["second_chance","הזדמנות שנייה","חתכת בזמן והתחלת דף חדש."],["business_empire","אימפריה","בניית עסק גדול עם שליטה מלאה."],["hidden_fire","אש שקטה","מבחוץ רגיל. בפנים הכול בוער."],["law_clear","יצאת נקי","בדקו אותך ולא מצאו כלום."],["long_run","ריצה ארוכה","שרדת הרבה זמן. זה הישג."]
  ].map(([id,title,summary])=>({id,title,summary}));

  const BADGES = [
    ["badge_apartment","דירה ראשונה","קנית דירה קטנה."],["badge_invest","השקעה מוצלחת","פעם אחת פגעת בול."],["badge_caught","כמעט נתפסת","החשד עלה גבוה וניצלת."],["badge_wedding","חתונה","עברת לנישואין."],["badge_business","עסק ראשון","פתחת עסק משלך."],["badge_kid","ילד ראשון","המשפחה גדלה."]
  ].map(([id,title,desc])=>({id,title,desc}));

  const ACTIONS = [
    {id:"invest",group:"financial",label:"להשקיע כסף",desc:"סיכון בינוני, תוצאה מאוחרת.",repeatable:true},
    {id:"loan",group:"financial",label:"לקחת הלוואה",desc:"כסף עכשיו, חוב אחר כך.",repeatable:true},
    {id:"repay",group:"financial",label:"להחזיר חוב",desc:"מוריד לחץ וחוב."},
    {id:"open_business",group:"financial",label:"לפתוח עסק",desc:"יקר, אבל פותח צמיחה."},
    {id:"buy_asset",group:"financial",label:"לקנות נכס",desc:"מחזק נכסים.",repeatable:true},
    {id:"sell_asset",group:"financial",label:"למכור נכס",desc:"מזומן מהיר."},
    {id:"romantic_text",group:"relationship",label:"לשלוח הודעה רומנטית",desc:"מקרב, קצת מסוכן."},
    {id:"private_meeting",group:"relationship",label:"לקבוע פגישה פרטית",desc:"קרבה גבוהה, יותר עיניים."},
    {id:"step_back",group:"relationship",label:"להתרחק",desc:"מוריד חום ומוריד חשד."},
    {id:"ask_commitment",group:"relationship",label:"לשאול על מחויבות",desc:"לדבר ברור על הקשר."},
    {id:"move_in",group:"relationship",label:"להציע לעבור לגור יחד",desc:"יציבות בבית, עלות גבוהה."},
    {id:"propose",group:"relationship",label:"להציע נישואין",desc:"צעד גדול."},
    {id:"try_child",group:"relationship",label:"לנסות להביא ילד",desc:"מעלה סיכון ומעלה משמעות."},
    {id:"init_intimacy",group:"tension",label:"ליזום אינטימיות",desc:"קרוב מאוד, לא תמיד חכם."},
    {id:"stay_night",group:"tension",label:"להישאר ללילה",desc:"קרבה חזקה וגם סיכון."},
    {id:"break_boundary",group:"tension",label:"לנתק גבול",desc:"מעלה חשיפה וחשד."},
    {id:"professional",group:"tension",label:"לשמור על מקצועיות",desc:"מוריד סיכון."},
    {id:"start_affair",group:"cheating",label:"להתחיל רומן",desc:"מסוכן מאוד."},
    {id:"hide_affair",group:"cheating",label:"להסתיר רומן",desc:"יכול לעבוד, יכול להתפוצץ."},
    {id:"end_affair",group:"cheating",label:"לסיים רומן",desc:"כואב עכשיו, מציל אחר כך."},
    {id:"family_trip",group:"family",label:"לקחת חופשה משפחתית",desc:"יקר, מוריד לחץ."},
    {id:"ignore_family",group:"family",label:"להתעלם ממשפחה בשביל עבודה",desc:"כסף מהיר, מחיר בבית."}
  ];
  const BEATS = [
    { id:"b1", min:1, w:2, build:(s)=>({ title:"5,000₪ על השולחן", text:["זה מה שנשאר זמין.","החלטה אחת קונה זמן. החלטה אחרת פותחת דלת שקשה לסגור."], bullets:["הבנק לוחץ","הבית מחכה"], choices:[
      {id:"a",label:"לשמור מזומן",result:"שמעת את הלחץ ושמרת מזומן.",effects:{cashflow:3,stress:2,exposure:-1}},
      {id:"b",label:"השקעה זהירה",result:"נכנסת קטן ומסודר.",effects:{money:-1800,investments:3,stress:1},delayed:[{afterWeeks:3,effects:{money:2600,cashflow:1},revealText:"הרווח חזר לאט."}]},
      {id:"c",label:"מהלך מהיר",result:"קיבלת כסף מהר, גם עיניים מהר.",effects:{money:2500,exposure:4,stress:4},clues:["c006"]}
    ]})},
    { id:"b2", min:3, w:1, build:(s)=>({ title:"הודעה מאוחרת", text:[`${s.characters.loveInterest} שלח/ה הודעה ב-00:47.`,`הטלפון נדלק בזמן רע.`], bullets:["דבר קטן יכול לגדול"], choices:[
      {id:"a",label:"לענות מיד",result:"המרחק ביניכם ירד.",effects:{relationship:5,exposure:2,stress:-1},clues:["c013"]},
      {id:"b",label:"להשאיר לבוקר",result:"שמרת גבול.",effects:{relationship:-2,trust:2}},
      {id:"c",label:"למחוק",result:"מחקת, אבל סימן נשאר.",effects:{trust:-2,stress:2},clues:["c003"]}
    ]})},
    { id:"b3", min:6, w:1, build:(s)=>({ title:"השותף לוחץ", text:[`${s.characters.businessPartner} רוצה קיצור דרך בחוזה.`,`המהלך מהיר, הסיכון לא קטן.`], bullets:["אפשר לעלות מהר","אפשר להסתבך"], choices:[
      {id:"a",label:"לסרב",result:"נשארת נקי.",effects:{trust:3,stress:1,cashflow:-1}},
      {id:"b",label:"לזרום",result:"הכסף זז. גם הסיכון זז.",effects:{cashflow:3,exposure:3,trust:-3},flags:{set:["legalRisk"]},clues:["c016"]},
      {id:"c",label:"לבדוק לעומק",result:"שילמת זמן, קיבלת שקט.",effects:{energy:-3,trust:2,stress:-1},clues:["c002"]}
    ]})},
    { id:"b4", min:8, w:1, when:(s)=>s.flags.isDating||s.flags.isMarried, build:(s)=>({ title:"השאלה בבית", text:[`${s.characters.officialPartner} שואל/ת איפה היית בלילה.`,`הפנים רגועות, הקול לא.`], bullets:["זה רגע רגיש"], choices:[
      {id:"a",label:"אמת חלקית",result:"לא סיפרת הכול.",effects:{trust:-3,stress:3},suspicion:4,clues:["c028"]},
      {id:"b",label:"שקיפות מלאה",result:"היה קשה, אבל נקי.",effects:{trust:4,stress:1}},
      {id:"c",label:"לברוח מהשיחה",result:"השיחה נדחתה, לא נפתרה.",effects:{trust:-4,stress:2},suspicion:5}
    ]})},
    { id:"b5", min:12, w:1, build:(s)=>({ title:"סוף שבוע בוועידה", text:[`${s.characters.loveInterest} מציע/ה פגישה פרטית אחרי האירוע.`,`מכירים אותך שם.`], bullets:["הגבול נהיה דק"], choices:[
      {id:"a",label:"לובי פתוח",result:"נשארת באזור בטוח יחסית.",effects:{relationship:3,exposure:1}},
      {id:"b",label:"פגישה פרטית",result:"זה הרגיש קרוב מדי.",effects:{relationship:7,exposure:5,stress:-2},suspicion:8,clues:["c025"]},
      {id:"c",label:"לחזור הביתה",result:"חתכת בזמן.",effects:{family:3,trust:2,relationship:-2}}
    ]})},
    { id:"b6", min:16, w:1, build:(s)=>({ title:"שמועה ברשת", text:["מישהו שלח צילום מסך שלך.",`${s.characters.businessPartner} אומר שזה לא יחזיק.`], bullets:["לפעמים זה רק מתחיל"], choices:[
      {id:"a",label:"להכחיש",result:"הכחשת, זה לא סגר עניין.",effects:{exposure:3,trust:-2,stress:2},clues:["c015"]},
      {id:"b",label:"לבדוק מקור",result:"מצאת קצה חוט.",effects:{energy:-3,exposure:-1},clues:["c001"]},
      {id:"c",label:"לשלם כדי לעצור",result:"עצרת עכשיו, יצרת סיכון אחר.",effects:{money:-2500,stress:-1},flags:{set:["blackmailRisk"]}}
    ]})},
    { id:"b7", min:20, w:1, when:(s)=>s.flags.hasKids, build:()=>({ title:"שיחה מהגן", text:["הילד חיכה לך שוב.","הטלפון הגיע באמצע פגישה."], bullets:["הבית זוכר הכול"], choices:[
      {id:"a",label:"לעזוב הכול ולחזור",result:"בחרת בבית.",effects:{family:7,money:-1200,stress:-1},clues:["c034"]},
      {id:"b",label:"לבקש עזרה מבחוץ",result:"פתרון מהיר, לב כבד.",effects:{family:-3,stress:2}},
      {id:"c",label:"להישאר בעבודה",result:"כסף נכנס, אמון יורד.",effects:{money:2200,family:-8,trust:-3,stress:3},clues:["c041"]}
    ]})},
    { id:"b8", min:25, w:1, build:()=>({ title:"הצעה מהירה מדי", text:["עסקה עם רווח גבוה ב-24 שעות.","זה נראה טוב מדי."], bullets:["זה יכול לשנות הכול"], choices:[
      {id:"a",label:"להיכנס חזק",result:"נכנסת עם כוח.",effects:{money:-10000,investments:8,stress:4},delayed:[{afterWeeks:4,type:"deal",risk:64,gain:30000,loss:22000}],clues:["c038"]},
      {id:"b",label:"להיכנס קטן",result:"מהלך בינוני.",effects:{money:-4000,investments:4,stress:2},delayed:[{afterWeeks:3,type:"deal",risk:45,gain:10000,loss:7000}]},
      {id:"c",label:"לוותר",result:"ויתרת על המתח הזה.",effects:{stress:-1,trust:1}}
    ]})},
    { id:"b9", min:32, w:1, build:()=>({ title:"מכתב משפטי", text:["נכנס מייל עם כותרת משפטית.","מבקשים הסבר על תשלומים."], bullets:["אפשר להסתבך אם תזניח"], choices:[
      {id:"a",label:"לעבוד עם עורך דין",result:"יקר, אבל מסודר.",effects:{money:-3500,trust:1,stress:-1},flags:{set:["investigationOpen"]},clues:["c011"]},
      {id:"b",label:"לענות לבד מהר",result:"מהיר, אבל חשוף.",effects:{stress:3,exposure:2},flags:{set:["legalRisk"]},clues:["c031"]},
      {id:"c",label:"לדחות",result:"זה לא נעלם.",effects:{stress:4,exposure:3},flags:{set:["legalRisk","investigationOpen"]}}
    ]})},
    { id:"b10", min:40, w:1, when:(s)=>s.flags.affairActive, build:(s)=>({ title:"הודעה בזמן ארוחה", text:[`${s.characters.loveInterest} שלח/ה לב בזמן ארוחת ערב.`,`כולם ראו שהמסך נדלק.`], bullets:["השקט נגמר מהר"], choices:[
      {id:"a",label:"להחביא מהר",result:"הצלחת כרגע.",effects:{trust:-2,stress:3},suspicion:8,clues:["c014"]},
      {id:"b",label:"לצאת לשיחה",result:"זה נראה רע מאוד.",effects:{trust:-4,exposure:3,stress:4},suspicion:12,clues:["c025"]},
      {id:"c",label:"לחתוך עכשיו",result:"סגרת כדי להציל את הבית.",effects:{relationship:-8,trust:3,stress:2},flags:{unset:["affairActive"],set:["rebuildStarted"]}}
    ]})},
    { id:"b11", min:55, w:1, build:(s)=>({ title:"לקוח ענק", text:[`${s.characters.businessPartner} רוצה לחתום מהר.`,`אין זמן בדיקה אמיתית.`], bullets:["כסף גדול, סיכון גדול"], choices:[
      {id:"a",label:"לחתום",result:"קיבלת קפיצה מיידית.",effects:{money:12000,cashflow:4,exposure:3,stress:2},clues:["c023"]},
      {id:"b",label:"לעכב לבדיקה",result:"שמרת על קו זהיר.",effects:{trust:2,stress:-1,cashflow:-1},clues:["c002"]},
      {id:"c",label:"לסרב",result:"איבדת עסקה, שמרת שקט.",effects:{trust:1,stress:1,exposure:-1}}
    ]})},
    { id:"b12", min:70, w:1, build:()=>({ title:"כולם מסתכלים", text:["אתה בנקודת לחץ גבוהה.","כסף, בית, קשר, שם."], bullets:["מה שתעשה עכשיו יחזור אליך"], choices:[
      {id:"a",label:"לשמור על אמון",result:"בחרת קו נקי.",effects:{trust:4,exposure:-2,reputation:2}},
      {id:"b",label:"לרדוף אחרי רווח",result:"הרווח עלה. גם הסיכון.",effects:{money:10000,exposure:4,trust:-3,stress:3}},
      {id:"c",label:"להשקיע בבית",result:"הבית נרגע.",effects:{family:6,stress:-3,money:-2500}}
    ]})}
  ];

  const EVENTS = [
    { text:"הבנק עצר העברה לשעה.", effects:{cashflow:-2,stress:2} },
    { text:"לקוח קטן הגיע מהמלצה.", effects:{money:1500,reputation:2,cashflow:1} },
    { text:"שוק ההון זז לטובתך.", effects:{money:2000,investments:2} },
    { text:"שוק ההון ירד חזק.", effects:{money:-2200,investments:-2,stress:2} },
    { text:"הבית ביקש עוד תשומת לב.", effects:{family:-2,stress:2} },
    { text:"הודעות לילה שוב.", effects:{relationship:2,exposure:2,stress:1}, clues:["c022"], flags:{set:["lateNightPattern"]} },
    { text:"מישהו שמר צילום מסך.", effects:{exposure:4,stress:3}, clues:["c015"], flags:{set:["leakActive"]} },
    { text:"קיבלת מכתב ייעוץ משפטי.", effects:{stress:2}, clues:["c040"] },
    { text:"הילד חיכה לך בדלת.", effects:{family:3,stress:-2}, needsFlags:["hasKids"] },
    { text:"מישהו זיהה אותך מחוץ למשרד.", effects:{exposure:3,stress:1}, clues:["c018"] }
  ];

  const itemMap = new Map(ITEMS.map((i)=>[i.id,i]));
  const clueMap = new Map(CLUES.map((c)=>[c.id,c]));
  const endingMap = new Map(ENDINGS.map((e)=>[e.id,e]));
  const badgeMap = new Map(BADGES.map((b)=>[b.id,b]));
  const actionMap = new Map(ACTIONS.map((a)=>[a.id,a]));

  const dom = {
    body: document.body,
    newGameBtn: document.getElementById("newGameBtn"), continueBtn: document.getElementById("continueBtn"), freeModeBtn: document.getElementById("freeModeBtn"), helpBtn: document.getElementById("helpBtn"), themeBtn: document.getElementById("themeBtn"),
    turnIndicator: document.getElementById("turnIndicator"), seasonIndicator: document.getElementById("seasonIndicator"), timeIndicator: document.getElementById("timeIndicator"), actionCounter: document.getElementById("actionCounter"),
    homeCard: document.getElementById("homeCard"), homeNewBtn: document.getElementById("homeNewBtn"), homeContinueBtn: document.getElementById("homeContinueBtn"), homeFreeBtn: document.getElementById("homeFreeBtn"),
    weekCard: document.getElementById("weekCard"), weekTitle: document.getElementById("weekTitle"), weekText: document.getElementById("weekText"), weekBullets: document.getElementById("weekBullets"), weekChoices: document.getElementById("weekChoices"), finishWeekStoryBtn: document.getElementById("finishWeekStoryBtn"),
    resultCard: document.getElementById("resultCard"), resultMain: document.getElementById("resultMain"), resultLines: document.getElementById("resultLines"), newClueBox: document.getElementById("newClueBox"), deltaBox: document.getElementById("deltaBox"), nextWeekBtn: document.getElementById("nextWeekBtn"),
    monthSummaryCard: document.getElementById("monthSummaryCard"), monthSummaryText: document.getElementById("monthSummaryText"),
    endingCard: document.getElementById("endingCard"), endingTitle: document.getElementById("endingTitle"), endingText: document.getElementById("endingText"), endingNewBtn: document.getElementById("endingNewBtn"), endingFreeBtn: document.getElementById("endingFreeBtn"),
    selectedActionsList: document.getElementById("selectedActionsList"), actionHint: document.getElementById("actionHint"), financialActions: document.getElementById("financialActions"), relationshipActions: document.getElementById("relationshipActions"), tensionActions: document.getElementById("tensionActions"), cheatingActions: document.getElementById("cheatingActions"), finishWeekActionsBtn: document.getElementById("finishWeekActionsBtn"), clearActionsBtn: document.getElementById("clearActionsBtn"),
    moneyLine: document.getElementById("moneyLine"), assetsLine: document.getElementById("assetsLine"), debtsLine: document.getElementById("debtsLine"), statsBars: document.getElementById("statsBars"),
    ownedItemsList: document.getElementById("ownedItemsList"), marketItemsList: document.getElementById("marketItemsList"), relationsList: document.getElementById("relationsList"), historyList: document.getElementById("historyList"), familyList: document.getElementById("familyList"), familyVacationBtn: document.getElementById("familyVacationBtn"), familyIgnoreBtn: document.getElementById("familyIgnoreBtn"), cluesList: document.getElementById("cluesList"), endingProgress: document.getElementById("endingProgress"), endingsGrid: document.getElementById("endingsGrid"), badgesGrid: document.getElementById("badgesGrid"),
    tabPanels: Array.from(document.querySelectorAll(".tab-panel")), tabButtons: Array.from(document.querySelectorAll("[data-tab-btn]")), toastBox: document.getElementById("toastBox"), helpDialog: document.getElementById("helpDialog"), closeHelpBtn: document.getElementById("closeHelpBtn"), simpleLanguageToggle: document.getElementById("simpleLanguageToggle")
  };
  const state = {
    phase: PH.HOME, tab: "story", turn: 1, week: 1, month: 1, season: 1, maxTurns: MAX_TURNS, freeMode: false,
    theme: "dark", simpleLanguage: true, mute: false,
    stats: { ...INIT },
    flags: { isDating:false,isMarried:false,hasKids:false,livingTogether:false,affairActive:false,affairSuspected:false,caughtCheating:false,breakupThreat:false,blackmailRisk:false,legalRisk:false,investigationOpen:false,leakActive:false,lateNightPattern:false,businessOpened:false,crossedBoundary:false,publicRumor:false,rebuildStarted:false,wasMarried:false },
    characters: null, childrenCount: 0, suspicion: 0,
    currentBeat: null, storyChoiceId: null, selectedActions: [], delayedQueue: [], cluesDiscovered: [], history: [], ownedItems: [],
    resultPayload: null, lastMonthSummary: "", endingId: null,
    unlockedEndings: [], unlockedBadges: [], warnState: {}, confrontationCooldown: 0, lastBeatIds: []
  };

  function c(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function cp(v) { return c(Math.round(v), 0, 100); }
  function r(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function pick(arr) { return arr.length ? arr[r(0, arr.length - 1)] : null; }
  function money(v) { const n = Math.round(v); return `${n < 0 ? "-" : ""}₪${Math.abs(n).toLocaleString("he-IL")}`; }

  function read(key, fallback) { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch (_e) { return fallback; } }
  function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

  function genChars() {
    const used = new Set();
    const pool = [...NAMES.male, ...NAMES.female, ...NAMES.neutral];
    const pickName = (list) => { const filtered = list.filter((n) => !used.has(n)); const name = pick(filtered.length ? filtered : list); used.add(name); return name; };
    return { loveInterest: pickName([...NAMES.female, ...NAMES.neutral]), officialPartner: pickName(pool), businessPartner: pickName(pool), familyMember: pickName(pool) };
  }

  function initState(freeMode) {
    state.phase = PH.RUNNING; state.tab = "story"; state.turn = 1; state.week = 1; state.month = 1; state.season = 1; state.maxTurns = freeMode ? 9999 : MAX_TURNS; state.freeMode = freeMode;
    state.stats = { ...INIT, reputation: INIT.reputation + (freeMode ? 10 : 0), investments: INIT.investments + (freeMode ? 10 : 0) };
    state.flags = { isDating:false,isMarried:false,hasKids:false,livingTogether:false,affairActive:false,affairSuspected:false,caughtCheating:false,breakupThreat:false,blackmailRisk:false,legalRisk:false,investigationOpen:false,leakActive:false,lateNightPattern:false,businessOpened:false,crossedBoundary:false,publicRumor:false,rebuildStarted:false,wasMarried:false };
    state.characters = genChars(); state.childrenCount = 0; state.suspicion = 0;
    state.currentBeat = null; state.storyChoiceId = null; state.selectedActions = []; state.delayedQueue = []; state.cluesDiscovered = []; state.history = []; state.ownedItems = [];
    state.resultPayload = null; state.lastMonthSummary = ""; state.endingId = null; state.warnState = {}; state.confrontationCooldown = 0; state.lastBeatIds = [];
    state.currentBeat = nextBeat();
  }

  function saveMeta() { write(K.meta, { theme: state.theme, simpleLanguage: state.simpleLanguage, mute: state.mute, unlockedEndings: state.unlockedEndings, unlockedBadges: state.unlockedBadges }); }

  function saveRun() {
    if (state.phase === PH.HOME) { localStorage.removeItem(K.run); return; }
    write(K.run, {
      phase: state.phase, tab: state.tab, turn: state.turn, week: state.week, month: state.month, season: state.season, maxTurns: state.maxTurns, freeMode: state.freeMode,
      stats: state.stats, flags: state.flags, characters: state.characters, childrenCount: state.childrenCount, suspicion: state.suspicion,
      currentBeat: state.currentBeat, storyChoiceId: state.storyChoiceId, selectedActions: state.selectedActions,
      delayedQueue: state.delayedQueue, cluesDiscovered: state.cluesDiscovered, history: state.history, ownedItems: state.ownedItems,
      resultPayload: state.resultPayload, lastMonthSummary: state.lastMonthSummary, endingId: state.endingId,
      warnState: state.warnState, confrontationCooldown: state.confrontationCooldown, lastBeatIds: state.lastBeatIds
    });
  }

  function loadAll() {
    const meta = read(K.meta, null);
    if (meta) {
      state.theme = meta.theme === "light" ? "light" : "dark";
      state.simpleLanguage = meta.simpleLanguage !== false;
      state.mute = !!meta.mute;
      state.unlockedEndings = Array.isArray(meta.unlockedEndings) ? meta.unlockedEndings.filter((id) => endingMap.has(id)) : [];
      state.unlockedBadges = Array.isArray(meta.unlockedBadges) ? meta.unlockedBadges.filter((id) => badgeMap.has(id)) : [];
    }
    const run = read(K.run, null);
    if (!run || !run.stats) { state.phase = PH.HOME; if (!state.characters) state.characters = genChars(); return; }

    state.phase = Object.values(PH).includes(run.phase) ? run.phase : PH.RUNNING;
    state.tab = TABS.includes(run.tab) ? run.tab : "story";
    state.turn = Math.max(1, Math.round(run.turn || 1)); state.week = Math.max(1, Math.round(run.week || 1)); state.month = Math.max(1, Math.round(run.month || 1)); state.season = Math.max(1, Math.round(run.season || 1));
    state.maxTurns = Math.max(80, Math.round(run.maxTurns || MAX_TURNS)); state.freeMode = !!run.freeMode;
    state.stats = { ...INIT, ...run.stats }; PCT.forEach((k) => state.stats[k] = cp(state.stats[k])); state.stats.money = Math.round(state.stats.money); state.stats.assets = Math.round(state.stats.assets); state.stats.debts = Math.round(state.stats.debts);
    state.flags = { ...state.flags, ...(run.flags || {}) };
    state.characters = run.characters && run.characters.loveInterest ? run.characters : genChars();
    state.childrenCount = Math.max(0, Math.round(run.childrenCount || 0)); state.suspicion = cp(run.suspicion || 0);
    state.currentBeat = run.currentBeat || null; state.storyChoiceId = run.storyChoiceId || null; state.selectedActions = Array.isArray(run.selectedActions) ? run.selectedActions.slice(0, MAX_ACTIONS) : [];
    state.delayedQueue = Array.isArray(run.delayedQueue) ? run.delayedQueue : []; state.cluesDiscovered = Array.isArray(run.cluesDiscovered) ? run.cluesDiscovered : []; state.history = Array.isArray(run.history) ? run.history : [];
    state.ownedItems = Array.isArray(run.ownedItems) ? run.ownedItems.filter((x) => itemMap.has(x.id)) : [];
    state.resultPayload = run.resultPayload || null; state.lastMonthSummary = run.lastMonthSummary || ""; state.endingId = run.endingId || null;
    state.warnState = run.warnState || {}; state.confrontationCooldown = Math.max(0, Math.round(run.confrontationCooldown || 0)); state.lastBeatIds = Array.isArray(run.lastBeatIds) ? run.lastBeatIds.slice(0, 8) : [];
    if ((state.phase === PH.RUNNING || state.phase === PH.RESULT) && !state.currentBeat) state.currentBeat = nextBeat();
  }

  function effect(effects, delta) {
    Object.keys(effects || {}).forEach((k) => {
      const v = Number(effects[k]); if (!Number.isFinite(v) || v === 0) return;
      if (["money","assets","debts"].includes(k)) state.stats[k] = Math.round(state.stats[k] + v); else if (PCT.includes(k)) state.stats[k] = cp(state.stats[k] + v);
      if (delta) delta[k] = (delta[k] || 0) + v;
    });
  }

  function setFlags(flags) { if (!flags) return; (flags.set || []).forEach((f) => { if (f in state.flags) state.flags[f] = true; }); (flags.unset || []).forEach((f) => { if (f in state.flags) state.flags[f] = false; }); }
  const hasClue = (id) => state.cluesDiscovered.some((c0) => c0.id === id);
  const hasClues = (ids) => ids.every((id) => hasClue(id));

  function addClue(id, payload) {
    if (!id || hasClue(id)) return;
    const base = clueMap.get(id); if (!base) return;
    const clue = { ...base, discoveredAtTurn: state.turn };
    state.cluesDiscovered.unshift(clue);
    if (payload) { payload.newClues.push(clue); payload.lines.push(`רמז חדש: ${clue.text}`); }
    if (clue.category === "חשיפה") state.suspicion = cp(state.suspicion + clue.severity + 1);
  }

  function queueDelayed(arr) { (arr || []).forEach((d) => state.delayedQueue.push({ ...d, weeksLeft: Math.max(1, Math.round(d.afterWeeks || 1)) })); }
  function processDelayed(payload) {
    const keep = [];
    state.delayedQueue.forEach((d) => {
      d.weeksLeft -= 1;
      if (d.weeksLeft > 0) { keep.push(d); return; }
      if (d.type === "deal") {
        const risk = c((d.risk || 50) + Math.round(state.stats.exposure * 0.15) - Math.round(state.stats.investments * 0.12), 8, 92);
        if (Math.random() * 100 > risk) {
          effect({ money: d.gain || 0, investments: 3, cashflow: 2 }, payload.delta);
          payload.lines.push(`עסקה נסגרה ברווח של ${money(d.gain || 0)}.`);
          addClue("c038", payload);
          unlockBadge("badge_invest");
        } else {
          effect({ money: -(d.loss || 0), stress: 5, trust: -2, exposure: 2 }, payload.delta);
          payload.lines.push(`עסקה נפלה בהפסד של ${money(d.loss || 0)}.`);
          addClue("c032", payload);
        }
        return;
      }
      effect(d.effects || {}, payload.delta);
      setFlags(d.flags);
      if (d.revealText) payload.lines.push(d.revealText);
      (d.clues || []).forEach((id) => addClue(id, payload));
      if (Number.isFinite(d.suspicion)) state.suspicion = cp(state.suspicion + d.suspicion);
    });
    state.delayedQueue = keep;
  }

  function nextBeat() {
    const available = BEATS.filter((b) => state.week >= (b.min || 1) && (!b.when || b.when(state)));
    if (!available.length) {
      return { id:"fallback", title:"שבוע שקט יחסית", text:["אין דרמה גדולה השבוע.","אבל צריך להמשיך לזוז."], bullets:["תבחר 1–3 פעולות"], choices:[
        {id:"a",label:"לעבוד חזק",result:"התקדמת בעבודה.",effects:{money:2200,energy:-3,stress:2}},
        {id:"b",label:"לנשום קצת",result:"נשמת קצת.",effects:{energy:4,stress:-3,money:-700}}
      ]};
    }
    const avoid = new Set(state.lastBeatIds.slice(0, 3));
    const weighted = [];
    available.forEach((b) => { const w = Math.max(1, b.w || 1); for (let i = 0; i < w; i += 1) weighted.push(b); });
    const clean = weighted.filter((b) => !avoid.has(b.id));
    const t = pick(clean.length ? clean : weighted);
    state.lastBeatIds.unshift(t.id); state.lastBeatIds = state.lastBeatIds.slice(0, 8);
    return t.build(state);
  }

  function actionAvailability(id, meta) {
    if (state.phase !== PH.RUNNING) return { ok:false, reason:"אפשר לבחור רק בזמן שבוע פתוח" };
    if (state.selectedActions.length >= MAX_ACTIONS) return { ok:false, reason:"כבר בחרת 3 פעולות" };
    const a = actionMap.get(id); if (!a) return { ok:false, reason:"פעולה לא קיימת" };
    if (!a.repeatable && state.selectedActions.some((x) => x.id === id)) return { ok:false, reason:"כבר בחרת את הפעולה הזו" };
    if (id === "repay" && state.stats.debts <= 0) return { ok:false, reason:"אין חוב פעיל" };
    if (id === "sell_asset" && !state.ownedItems.length) return { ok:false, reason:"אין נכס למכירה" };
    if (id === "move_in" && (!state.flags.isDating || state.flags.livingTogether)) return { ok:false, reason:"צריך זוגיות פעילה בלי מגורים משותפים" };
    if (id === "propose" && (!state.flags.livingTogether || state.flags.isMarried)) return { ok:false, reason:"צריך לגור יחד לפני נישואין" };
    if (id === "try_child" && !(state.flags.isMarried || state.flags.livingTogether)) return { ok:false, reason:"צריך בית משותף לפני ניסיון לילד" };
    if (["start_affair","hide_affair","end_affair"].includes(id) && !(state.flags.isDating || state.flags.isMarried)) return { ok:false, reason:"אין זוגיות רשמית כרגע" };
    if (id === "start_affair" && state.flags.affairActive) return { ok:false, reason:"כבר יש רומן פעיל" };
    if (["hide_affair","end_affair"].includes(id) && !state.flags.affairActive) return { ok:false, reason:"אין רומן פעיל" };
    if (id === "buy_asset" && meta?.itemId && state.ownedItems.some((x) => x.id === meta.itemId)) return { ok:false, reason:"הפריט כבר בבעלותך" };
    return { ok:true, reason:"" };
  }

  function queueAction(id, meta = null) {
    const ok = actionAvailability(id, meta);
    if (!ok.ok) { toast(ok.reason, "alert"); return; }
    state.selectedActions.push({ id, meta });
    renderActionsTab(); renderTop(); saveRun();
  }

  function removeAction(index) {
    if (state.phase !== PH.RUNNING) return;
    state.selectedActions.splice(index, 1);
    renderActionsTab(); renderTop(); saveRun();
  }

  function buyTarget(meta) {
    if (meta?.itemId) return itemMap.get(meta.itemId);
    const free = ITEMS.filter((i) => !state.ownedItems.some((o) => o.id === i.id));
    if (!free.length) return null;
    const afford = free.filter((i) => state.stats.money >= i.price);
    return (afford.length ? afford : free).sort((a, b) => a.price - b.price)[0];
  }

  function sellTarget(meta) {
    if (!state.ownedItems.length) return null;
    if (meta?.itemId) return itemMap.get(meta.itemId);
    const sort = [...state.ownedItems].sort((a, b) => (itemMap.get(b.id)?.price || 0) - (itemMap.get(a.id)?.price || 0));
    return itemMap.get(sort[0].id);
  }

  function runAction(entry, payload) {
    const lines = []; const d = {}; let susp = 0;
    const spend = (v) => { d.energy = (d.energy || 0) - v; };

    switch (entry.id) {
      case "invest": {
        const amt = Math.min(Math.max(2200, Math.round(state.stats.money * 0.24)), 14000);
        if (state.stats.money < 1500) { lines.push("רצית להשקיע, אבל אין מרווח."); d.stress = 2; break; }
        spend(3); d.money = -amt; d.investments = 4; d.stress = 1; lines.push(`השקעת ${money(amt)}.`);
        queueDelayed([{ afterWeeks:r(2,6), type:"deal", risk:45, gain:Math.round(amt * 1.55), loss:Math.round(amt * 0.75) }]);
        addClue("c006", payload);
        break;
      }
      case "loan": {
        spend(1); const loan = r(7000, 12000); d.money = loan; d.debts = Math.round(loan * 1.18); d.stress = 3; d.trust = -1; lines.push(`לקחת הלוואה: ${money(loan)}.`); break;
      }
      case "repay": {
        spend(1); if (state.stats.debts <= 0 || state.stats.money <= 0) { lines.push("אין כרגע מה להחזיר."); break; }
        const pay = Math.min(state.stats.debts, Math.max(1200, Math.round(state.stats.money * 0.4))); d.money = -pay; d.debts = -pay; d.stress = -2; d.trust = 2; lines.push(`החזרת חוב של ${money(pay)}.`); break;
      }
      case "open_business": {
        spend(4);
        if (!state.flags.businessOpened) {
          const cost = 16000;
          if (state.stats.money >= cost) d.money = -cost; else { const miss = cost - state.stats.money; d.money = -state.stats.money; d.debts = Math.round(miss * 1.2); d.stress = 2; lines.push("פתחת עסק דרך חוב."); }
          d.cashflow = 7; d.reputation = 4; d.stress = (d.stress || 0) + 2; state.flags.businessOpened = true; unlockBadge("badge_business"); lines.push("פתחת עסק חדש.");
        } else { d.money = -6200; d.cashflow = 4; d.reputation = 3; d.stress = 2; lines.push("הרחבת עסק קיים."); }
        break;
      }
      case "buy_asset": {
        spend(2); const item = buyTarget(entry.meta); if (!item) { lines.push("אין כרגע מה לקנות."); break; }
        if (state.ownedItems.some((o) => o.id === item.id)) { lines.push(`${item.name} כבר אצלך.`); break; }
        if (state.stats.money >= item.price) d.money = -item.price; else { const miss = item.price - state.stats.money; d.money = -state.stats.money; d.debts = Math.round(miss * 1.15); d.stress = 2; lines.push(`קנית ${item.name} עם מינוף.`); }
        d.assets = item.price; state.ownedItems.push({ id:item.id, boughtWeek:state.week }); lines.push(`קנית: ${item.name}.`); if (item.id === "small_apartment") unlockBadge("badge_apartment");
        break;
      }
      case "sell_asset": {
        spend(1); const item = sellTarget(entry.meta); if (!item) { lines.push("אין נכס למכירה."); break; }
        state.ownedItems = state.ownedItems.filter((o) => o.id !== item.id); const sale = Math.round(item.price * 0.76); d.money = sale; d.assets = -item.price; d.cashflow = -1; lines.push(`מכרת ${item.name} וקיבלת ${money(sale)}.`);
        break;
      }
      case "romantic_text": { spend(1); d.relationship = 4; d.trust = 1; d.exposure = 1; d.stress = -1; lines.push(`שלחת הודעה ל-${state.characters.loveInterest}.`); break; }
      case "private_meeting": { spend(3); d.relationship = 6; d.exposure = 4; d.stress = -2; state.flags.lateNightPattern = true; susp += state.flags.isDating || state.flags.isMarried ? 8 : 4; lines.push(`קבעת פגישה פרטית עם ${state.characters.loveInterest}.`); addClue("c013", payload); break; }
      case "step_back": { spend(1); d.relationship = -4; d.trust = 3; d.exposure = -2; d.stress = -2; susp -= 5; lines.push("לקחת צעד אחורה."); break; }
      case "ask_commitment": {
        spend(2);
        if (!state.flags.isDating && !state.flags.isMarried && state.stats.relationship >= 30) { state.flags.isDating = true; d.family = 6; d.trust = 4; lines.push(`דיברתם ברור. ${state.characters.officialPartner} הסכים/ה לקשר רציני.`); }
        else { d.trust = 2; lines.push("פתחת שיחה על מחויבות."); }
        break;
      }
      case "move_in": { spend(3); state.flags.isDating = true; state.flags.livingTogether = true; d.money = -3500; d.family = 10; d.stress = -2; lines.push(`עברתם לגור יחד: אתה ו-${state.characters.officialPartner}.`); break; }
      case "propose": { spend(4); state.flags.isDating = true; state.flags.livingTogether = true; state.flags.isMarried = true; d.money = -8000; d.family = 12; d.trust = 6; d.stress = 2; lines.push(`הצעת נישואין ל-${state.characters.officialPartner}.`); unlockBadge("badge_wedding"); break; }
      case "try_child": {
        spend(4); const chance = 30 + Math.round(state.stats.family * 0.2) + Math.round(state.stats.trust * 0.1);
        if (Math.random() * 100 < chance) { state.childrenCount += 1; state.flags.hasKids = true; state.flags.rebuildStarted = true; d.family = 10; d.stress = 4; d.money = -3200; lines.push("יש חדשות בבית: ילד בדרך."); addClue("c034", payload); unlockBadge("badge_kid"); }
        else { d.stress = 3; d.trust = -2; lines.push("זה עוד לא הצליח."); }
        break;
      }
      case "init_intimacy": {
        spend(2);
        if (state.stats.relationship >= 55) { d.stress = -7; d.relationship = 5; d.exposure = 2; lines.push("המרחק ביניכם הצטמצם."); lines.push("זה הרגיש קרוב מדי."); if (state.flags.isDating || state.flags.isMarried) susp += 7; }
        else { d.trust = -5; d.stress = 5; d.relationship = -2; lines.push("לא בטוח שזה היה חכם."); }
        break;
      }
      case "stay_night": {
        spend(5);
        if (state.stats.relationship < 45) { d.stress = 4; d.trust = -2; lines.push("זה לא זרם כמו שחשבת."); break; }
        d.relationship = 7; d.exposure = 6; d.stress = -3; state.flags.lateNightPattern = true; susp += state.flags.isDating || state.flags.isMarried ? 10 : 4; lines.push("נשארת ללילה. זה היה קרוב מדי."); addClue("c025", payload);
        break;
      }
      case "break_boundary": { spend(3); d.relationship = 4; d.exposure = 8; d.trust = -6; d.stress = 2; state.flags.crossedBoundary = true; susp += 12; lines.push("שברת גבול שהיה ברור עד עכשיו."); addClue("c024", payload); break; }
      case "professional": { spend(1); d.relationship = -2; d.trust = 4; d.exposure = -3; d.stress = 1; susp -= 6; lines.push("שמרת על מקצועיות."); break; }
      case "start_affair": { spend(2); state.flags.affairActive = true; state.flags.affairSuspected = true; d.relationship = 6; d.exposure = 4; d.trust = -7; susp += 16; lines.push(`התחלת רומן עם ${state.characters.loveInterest}.`); addClue(pick(["c001","c033","c013"]), payload); break; }
      case "hide_affair": {
        spend(3); d.stress = 3;
        if (Math.random() < 0.58) { d.exposure = -2; susp -= 8; lines.push("הסתרת את זה השבוע."); }
        else { d.trust = -4; d.exposure = 3; susp += 10; lines.push("ניסיון ההסתרה נראה חשוד."); addClue("c029", payload); }
        break;
      }
      case "end_affair": { spend(2); state.flags.affairActive = false; state.flags.rebuildStarted = true; d.relationship = -8; d.trust = 4; d.stress = 3; susp -= 14; lines.push("סיימת את הרומן."); break; }
      case "family_trip": { spend(2); d.money = -4200; d.family = 9; d.stress = -6; d.energy = 4; d.trust = 2; lines.push("יצאת לחופשה משפחתית."); if (state.flags.affairActive) susp += 4; break; }
      case "ignore_family": { spend(2); d.money = 3600; d.family = -8; d.stress = 5; d.trust = -4; d.reputation = 2; susp += state.flags.affairActive ? 5 : 2; lines.push("בחרת עבודה במקום הבית."); break; }
      default: lines.push("הפעולה לא בוצעה.");
    }

    effect(d, payload.delta);
    state.suspicion = cp(state.suspicion + susp);
    lines.forEach((line) => payload.lines.push(line));
  }
  function randomEvent(payload) {
    if (Math.random() > 0.62) return;
    const list = EVENTS.filter((e) => !e.needsFlags || e.needsFlags.every((f) => state.flags[f]));
    const e = pick(list); if (!e) return;
    effect(e.effects || {}, payload.delta); setFlags(e.flags); (e.clues || []).forEach((id) => addClue(id, payload));
    payload.lines.push(`אירוע: ${e.text}`);
  }

  function monthly(payload) {
    if (state.week % WEEKS_IN_MONTH !== 0) return;
    const biz = Math.round(state.stats.cashflow * 85 + state.stats.reputation * 40 + (state.flags.businessOpened ? 2500 : 0));
    const market = r(-6000, 8000);
    const inv = Math.round((state.stats.investments - 45) * 110 + market);
    let inItems = 0; let outItems = 0;

    state.ownedItems.forEach((owned) => {
      const item = itemMap.get(owned.id); if (!item) return;
      inItems += item.monthlyIncome || 0; outItems += item.monthlyCost || 0; effect(item.monthlyEffects || {}, payload.delta);
      if (item.risk === "גבוה" && Math.random() < 0.15) addClue(pick(["c002","c017","c035"]), payload);
    });

    let house = 2400; if (state.flags.livingTogether) house += 1300; if (state.flags.isMarried) house += 2200; house += state.childrenCount * 2600;
    let debtPay = 0;
    if (state.stats.debts > 0) { debtPay = Math.min(state.stats.debts, Math.max(1200, Math.round(state.stats.debts * 0.06))); effect({ debts: -debtPay }, payload.delta); }

    const delta = biz + inv + inItems - outItems - house - debtPay;
    effect({ money: delta }, payload.delta);
    effect(delta >= 0 ? { trust: 1 } : { stress: 2 }, payload.delta);
    if (state.childrenCount > 0) effect({ energy: -state.childrenCount, family: 1 }, payload.delta);

    state.lastMonthSummary = `החודש: עסק ${money(biz)}, השקעות ${money(inv)}, רכוש ${money(inItems - outItems)}, בית ${money(-house)}, חוב ${money(-debtPay)}.`;
    payload.lines.push(state.lastMonthSummary);
  }

  function drift(payload) {
    const hasRel = state.selectedActions.some((x) => ["relationship", "tension"].includes(actionMap.get(x.id)?.group));
    if (!hasRel && state.stats.relationship > 0) effect({ relationship: -1 }, payload.delta);
    if (state.flags.affairActive && (state.flags.isDating || state.flags.isMarried)) state.suspicion = cp(state.suspicion + 3);
    if (state.flags.lateNightPattern) { state.suspicion = cp(state.suspicion + 2); if (Math.random() < 0.25) state.flags.lateNightPattern = false; }
    if (state.stats.relationship > 70 && state.stats.trust < 40) state.suspicion = cp(state.suspicion + 3);
    if (state.stats.exposure > 70) state.suspicion = cp(state.suspicion + 2);
    if (!state.flags.affairActive && state.stats.trust > 60) state.suspicion = cp(state.suspicion - 2);
    if (state.flags.hasKids && state.flags.affairActive) state.suspicion = cp(state.suspicion + 3);
    if (state.suspicion >= 70 && state.suspicion < 90) unlockBadge("badge_caught");
  }

  function suspicionChain(payload) {
    if (state.confrontationCooldown > 0) { state.confrontationCooldown -= 1; return; }
    if (state.suspicion < 55) return;

    if (state.suspicion >= 55 && !state.flags.affairSuspected) {
      state.flags.affairSuspected = true;
      payload.lines.push("האווירה בבית מתוחה. יש חשד.");
      toast("אזהרה: יש חשד בבית", "alert");
      state.confrontationCooldown = 2;
      return;
    }

    if (state.suspicion >= 90) {
      const roll = Math.random();
      if (roll < 0.22) {
        payload.lines.push("אזהרה אחרונה בבית."); effect({ trust: -6, stress: 4 }, payload.delta);
      } else if (roll < 0.48) {
        if (state.flags.isMarried) {
          payload.lines.push(`שיחת גירושין התחילה מול ${state.characters.officialPartner}.`);
          state.flags.wasMarried = true; state.flags.isMarried = false; state.flags.isDating = false; state.flags.livingTogether = false; state.flags.caughtCheating = true;
          effect({ family: -18, trust: -14, stress: 8 }, payload.delta);
        } else {
          payload.lines.push(`הקשר הרשמי עם ${state.characters.officialPartner} נשבר.`);
          state.flags.isDating = false; state.flags.livingTogether = false; state.flags.caughtCheating = true;
          effect({ family: -12, trust: -12, stress: 7 }, payload.delta);
        }
      } else if (roll < 0.74) {
        payload.lines.push("הסיפור דלף החוצה.");
        state.flags.caughtCheating = true; state.flags.leakActive = true; state.flags.publicRumor = true;
        effect({ exposure: 12, reputation: -9, stress: 7 }, payload.delta);
        addClue("c001", payload); addClue("c015", payload);
      } else {
        payload.lines.push("מישהו ביקש כסף כדי לשתוק.");
        state.flags.blackmailRisk = true; state.flags.caughtCheating = true;
        effect({ money: -4500, stress: 8, trust: -6 }, payload.delta);
        addClue("c040", payload);
      }
      state.confrontationCooldown = 4;
      state.suspicion = cp(state.suspicion - 18);
      return;
    }

    if (state.suspicion >= 72 && (state.flags.isDating || state.flags.isMarried)) {
      payload.lines.push("עימות קצר בבית.");
      effect({ trust: -4, stress: 4 }, payload.delta);
      state.flags.breakupThreat = true;
      state.confrontationCooldown = 3;
    }
  }

  function warnings() {
    [
      ["money", state.stats.money < 0, "אזהרה: כסף במינוס"],
      ["cashflow", state.stats.cashflow < 25, "אזהרה: תזרים קריטי"],
      ["stress", state.stats.stress > 85, "לחץ חריג"],
      ["exposure", state.stats.exposure > 75, "אזהרה: יותר מדי אנשים יודעים עליך"],
      ["trust", state.stats.trust < 25, "אמינות נשחקת"],
      ["relationship", state.stats.relationship > 80, "הגבול נהיה דק"]
    ].forEach(([k, active, text]) => { if (active && !state.warnState[k]) toast(text, "alert"); state.warnState[k] = active; });
  }

  function unlockEnding(id) { if (!state.unlockedEndings.includes(id)) { state.unlockedEndings.push(id); saveMeta(); } }
  function unlockBadge(id) { if (id && badgeMap.has(id) && !state.unlockedBadges.includes(id)) { state.unlockedBadges.push(id); saveMeta(); toast(`באג׳ חדש: ${badgeMap.get(id).title}`); } }

  function ending(force) {
    if (state.freeMode) return null;
    if (state.stats.stress >= 100 || state.stats.energy <= 0) return "burnout";
    if (state.stats.money <= -120000 && state.stats.debts >= 250000 && state.stats.cashflow <= 18) return "collapse";
    if (state.stats.exposure >= 98 && hasClues(["c001", "c015"])) return "scandal";
    if (state.flags.caughtCheating && state.stats.trust <= 10 && state.suspicion >= 90) return "betrayal";
    if (!force && state.turn < 80) return null;

    if (state.stats.money >= 250000 && state.stats.assets >= 330000 && state.stats.trust >= 60 && state.stats.exposure <= 55) return "cold_win";
    if (state.stats.family >= 82 && state.stats.trust >= 65 && state.childrenCount >= 1 && !state.flags.affairActive) return "family_win";
    if (state.stats.exposure >= 90 && hasClues(["c001", "c015"])) return "scandal";
    if (state.stats.money <= -85000 && state.stats.debts >= 180000 && state.stats.cashflow < 25) return "collapse";
    if (state.stats.stress >= 97 || state.stats.energy <= 3) return "burnout";
    if (state.flags.caughtCheating && state.stats.trust < 18) return "betrayal";
    if (state.flags.legalRisk && hasClues(["c031", "c040"]) && state.stats.exposure > 72) return "legal_trouble";
    if (state.flags.affairActive && !state.flags.caughtCheating && state.suspicion < 55 && state.turn >= 100 && hasClues(["c013", "c033"])) return "double_life";
    if (state.flags.rebuildStarted && state.stats.trust >= 55 && state.stats.debts < 35000 && state.turn >= 95) return "redemption";
    if (state.stats.reputation >= 78 && state.stats.cashflow >= 72 && state.stats.exposure <= 45) return "quiet_money";
    if (state.stats.money >= 330000 && state.stats.trust < 35 && state.stats.exposure > 70) return "dirty_rich";
    if (state.stats.reputation >= 85 && state.stats.family < 35 && state.stats.relationship < 30) return "alone_top";
    if (state.stats.family >= 76 && state.stats.money < 30000 && state.stats.debts < 45000) return "broke_home";
    if (state.flags.blackmailRisk && hasClues(["c029", "c040"])) return "blackmail";
    if (state.flags.caughtCheating && state.flags.wasMarried && state.stats.exposure > 80) return "divorce_public";
    if (!state.flags.affairActive && state.flags.rebuildStarted && state.stats.relationship >= 70 && state.stats.trust >= 58) return "second_chance";
    if (state.stats.assets >= 520000 && state.stats.cashflow >= 80 && state.stats.reputation >= 82) return "business_empire";
    if (state.suspicion >= 75 && !state.flags.caughtCheating && state.stats.stress > 82) return "hidden_fire";
    if (state.flags.investigationOpen && !state.flags.legalRisk && state.stats.trust > 60 && hasClues(["c031", "c040"])) return "law_clear";
    if (force || state.turn >= state.maxTurns) return "long_run";
    return null;
  }

  function applyBeatChoice(payload) {
    if (!state.currentBeat) return;
    if (!state.storyChoiceId) {
      payload.lines.push("לא בחרת תגובה לסיפור השבוע.");
      effect({ stress: 1 }, payload.delta);
      state.history.unshift({ week: state.week, title: state.currentBeat.title, choice: "לא נבחרה תגובה" }); state.history = state.history.slice(0, 40);
      return;
    }
    const ch = state.currentBeat.choices.find((x) => x.id === state.storyChoiceId);
    if (!ch) return;
    payload.lines.push(ch.result); effect(ch.effects || {}, payload.delta); setFlags(ch.flags); queueDelayed(ch.delayed || []); (ch.clues || []).forEach((id) => addClue(id, payload));
    if (Number.isFinite(ch.suspicion)) state.suspicion = cp(state.suspicion + ch.suspicion);
    state.history.unshift({ week: state.week, title: state.currentBeat.title, choice: ch.label }); state.history = state.history.slice(0, 40);
  }

  function finishWeek() {
    if (state.phase !== PH.RUNNING) return;
    if (state.selectedActions.length < 1) { toast("צריך לבחור לפחות פעולה אחת", "alert"); return; }
    const payload = { main: "", lines: [], delta: {}, newClues: [], endingId: null };
    processDelayed(payload);
    applyBeatChoice(payload);
    state.selectedActions.forEach((entry) => runAction(entry, payload));
    randomEvent(payload); drift(payload); monthly(payload); suspicionChain(payload); warnings();
    if (state.ownedItems.some((x) => x.id === "small_apartment")) unlockBadge("badge_apartment");
    if (state.flags.businessOpened) unlockBadge("badge_business");
    if (state.flags.isMarried) unlockBadge("badge_wedding");
    payload.main = state.selectedActions.length === 1 ? "הפעולה שלך סגרה את השבוע." : "הפעולות שלך סגרו את השבוע.";
    payload.endingId = ending(false) || (!state.freeMode && state.turn >= state.maxTurns ? ending(true) : null);
    state.resultPayload = payload; state.phase = PH.RESULT; saveRun(); renderAll();
  }

  function endRun(id) {
    const eid = endingMap.has(id) ? id : "long_run";
    state.phase = PH.ENDED; state.endingId = eid; state.resultPayload = null; state.selectedActions = []; state.storyChoiceId = null;
    unlockEnding(eid); localStorage.removeItem(K.run); renderAll();
  }

  function nextWeek() {
    if (state.phase !== PH.RESULT) return;
    if (state.resultPayload?.endingId) { endRun(state.resultPayload.endingId); return; }
    state.turn += 1; state.week += 1; state.month = Math.floor((state.week - 1) / WEEKS_IN_MONTH) + 1; state.season = Math.min(4, Math.floor((state.month - 1) / 3) + 1);
    state.selectedActions = []; state.storyChoiceId = null; state.resultPayload = null; state.phase = PH.RUNNING; state.currentBeat = nextBeat();
    saveRun(); renderAll();
  }
  function toast(text, type = "normal") {
    const el = document.createElement("div");
    el.className = `toast${type === "alert" ? " alert" : ""}`;
    el.textContent = text;
    dom.toastBox.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }

  function renderTop() {
    dom.body.setAttribute("data-theme", state.theme);
    dom.themeBtn.textContent = `מצב: ${state.theme === "dark" ? "כהה" : "בהיר"}`;
    dom.turnIndicator.textContent = `שבוע ${state.turn}/${state.freeMode ? "∞" : state.maxTurns}`;
    dom.seasonIndicator.textContent = `עונה ${state.season}/4`;
    dom.timeIndicator.textContent = `שבוע ${state.week}, חודש ${state.month}`;
    dom.actionCounter.textContent = `פעולות השבוע: ${state.selectedActions.length}/${MAX_ACTIONS}`;
    dom.simpleLanguageToggle.checked = !!state.simpleLanguage;
  }

  function renderTabs() {
    dom.tabPanels.forEach((p) => { p.hidden = p.dataset.tab !== state.tab; });
    dom.tabButtons.forEach((b) => { b.classList.toggle("active", b.dataset.tabBtn === state.tab); });
  }

  function renderHomeButtons() {
    const hasRun = !!localStorage.getItem(K.run);
    const hasEnding = state.unlockedEndings.length > 0;
    dom.continueBtn.disabled = !hasRun;
    dom.homeContinueBtn.disabled = !hasRun;
    dom.freeModeBtn.hidden = !hasEnding;
    dom.homeFreeBtn.hidden = !hasEnding;
    dom.endingFreeBtn.hidden = !hasEnding;
  }

  function renderStory() {
    const home = state.phase === PH.HOME;
    dom.homeCard.hidden = !home;
    dom.weekCard.hidden = home || state.phase !== PH.RUNNING;
    dom.resultCard.hidden = state.phase !== PH.RESULT;
    dom.endingCard.hidden = state.phase !== PH.ENDED;
    if (home) return;

    if (state.phase === PH.RUNNING && state.currentBeat) {
      dom.weekTitle.textContent = state.currentBeat.title;
      dom.weekText.innerHTML = "";
      state.currentBeat.text.forEach((line) => { const p = document.createElement("p"); p.textContent = line; dom.weekText.appendChild(p); });
      dom.weekBullets.innerHTML = "";
      state.currentBeat.bullets.forEach((line) => { const li = document.createElement("li"); li.textContent = line; dom.weekBullets.appendChild(li); });
      dom.weekChoices.innerHTML = "";
      state.currentBeat.choices.forEach((ch) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `choice-btn${state.storyChoiceId === ch.id ? " btn-main" : ""}`;
        btn.dataset.choiceId = ch.id;
        btn.textContent = ch.label;
        dom.weekChoices.appendChild(btn);
      });
    }

    if (state.phase === PH.RESULT && state.resultPayload) {
      dom.resultMain.textContent = state.resultPayload.main;
      dom.resultLines.innerHTML = "";
      state.resultPayload.lines.forEach((line) => { const li = document.createElement("li"); li.textContent = line; dom.resultLines.appendChild(li); });
      dom.deltaBox.innerHTML = "";
      Object.entries(state.resultPayload.delta).forEach(([k, v]) => {
        if (!v) return;
        const chip = document.createElement("span");
        chip.className = `chip ${v > 0 ? "pos" : "neg"}`;
        chip.textContent = `${LABEL[k] || k} ${v > 0 ? "+" : ""}${Math.round(v)}`;
        dom.deltaBox.appendChild(chip);
      });
      if (state.resultPayload.newClues.length) {
        dom.newClueBox.hidden = false;
        dom.newClueBox.textContent = `רמז חדש: ${state.resultPayload.newClues.map((c0) => c0.text).join(" | ")}`;
      } else {
        dom.newClueBox.hidden = true;
      }
    }

    dom.monthSummaryCard.hidden = !state.lastMonthSummary;
    dom.monthSummaryText.textContent = state.lastMonthSummary;

    if (state.phase === PH.ENDED) {
      const e = endingMap.get(state.endingId) || endingMap.get("long_run");
      dom.endingTitle.textContent = e.title;
      dom.endingText.textContent = e.summary;
    }
  }

  function renderActionGroup(container, group) {
    container.innerHTML = "";
    ACTIONS.filter((a) => a.group === group).forEach((a) => {
      const ok = actionAvailability(a.id, null);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "action-btn";
      btn.dataset.actionId = a.id;
      btn.disabled = !ok.ok;
      btn.innerHTML = `<div>${a.label}</div><small>${ok.ok ? a.desc : ok.reason}</small>`;
      container.appendChild(btn);
    });
  }

  function renderActionsTab() {
    dom.selectedActionsList.innerHTML = "";
    if (!state.selectedActions.length) dom.actionHint.textContent = "עוד לא בחרת פעולות.";
    else {
      dom.actionHint.textContent = `נבחרו ${state.selectedActions.length}/${MAX_ACTIONS} פעולות.`;
      state.selectedActions.forEach((entry, i) => {
        const a = actionMap.get(entry.id); const item = entry.meta?.itemId ? itemMap.get(entry.meta.itemId) : null;
        const card = document.createElement("div");
        card.className = "list-item";
        card.innerHTML = `<h4>${i + 1}. ${a?.label || entry.id}</h4>${item ? `<p>פריט: ${item.name}</p>` : ""}<div class="inline-actions"><button class="btn" data-remove-index="${i}">הסר</button></div>`;
        dom.selectedActionsList.appendChild(card);
      });
    }
    renderActionGroup(dom.financialActions, "financial");
    renderActionGroup(dom.relationshipActions, "relationship");
    renderActionGroup(dom.tensionActions, "tension");
    renderActionGroup(dom.cheatingActions, "cheating");
    const lock = state.phase !== PH.RUNNING;
    dom.finishWeekStoryBtn.disabled = lock;
    dom.finishWeekActionsBtn.disabled = lock;
    dom.clearActionsBtn.disabled = lock;
  }

  function renderStats() {
    dom.moneyLine.textContent = `כסף: ${money(state.stats.money)}`;
    dom.assetsLine.textContent = `נכסים: ${money(state.stats.assets)}`;
    dom.debtsLine.textContent = `חובות: ${money(state.stats.debts)}`;
    dom.statsBars.innerHTML = "";
    PCT.forEach((k) => {
      const row = document.createElement("div");
      row.className = "bar-row";
      row.innerHTML = `<label>${LABEL[k]}<span>${state.stats[k]}</span></label><div class="bar"><span style="width:${state.stats[k]}%"></span></div>`;
      dom.statsBars.appendChild(row);
    });
  }

  function renderAssets() {
    dom.ownedItemsList.innerHTML = "";
    if (!state.ownedItems.length) dom.ownedItemsList.innerHTML = `<div class="list-item">אין רכוש כרגע.</div>`;
    else state.ownedItems.forEach((o) => {
      const i = itemMap.get(o.id); if (!i) return;
      const card = document.createElement("div");
      card.className = "list-item";
      card.innerHTML = `<h4>${i.name}</h4><p>שווי קנייה: ${money(i.price)} | סיכון: ${i.risk}</p><p>חודשי: ${money(i.monthlyIncome - i.monthlyCost)}</p><div class="inline-actions"><button class="btn" data-queue-action="sell_asset" data-item-id="${i.id}" ${state.phase !== PH.RUNNING ? "disabled" : ""}>הוסף מכירה לשבוע</button></div>`;
      dom.ownedItemsList.appendChild(card);
    });

    dom.marketItemsList.innerHTML = "";
    ITEMS.forEach((i) => {
      const own = state.ownedItems.some((x) => x.id === i.id);
      const card = document.createElement("div");
      card.className = "list-item";
      card.innerHTML = `<h4>${i.name}${own ? " (בבעלותך)" : ""}</h4><p>מחיר: ${money(i.price)} | סיכון: ${i.risk}</p><p>${i.note}</p>${own ? "" : `<div class="inline-actions"><button class="btn" data-queue-action="buy_asset" data-item-id="${i.id}" ${state.phase !== PH.RUNNING ? "disabled" : ""}>הוסף קנייה לשבוע</button></div>`}`;
      dom.marketItemsList.appendChild(card);
    });
  }

  function renderRelations() {
    dom.relationsList.innerHTML = "";
    [
      `דמות מרכזית: ${state.characters.loveInterest}`,
      `בן/בת זוג רשמי/ת: ${state.characters.officialPartner}`,
      `שותף/ה עסקי/ת: ${state.characters.businessPartner}`,
      `קרוב/ת משפחה: ${state.characters.familyMember}`,
      `סטטוס זוגיות: ${state.flags.isMarried ? "נישואין" : state.flags.isDating ? "זוגיות" : "לא מוגדר"}`,
      `רומן פעיל: ${state.flags.affairActive ? "כן" : "לא"}`,
      `חשד באוויר: ${state.suspicion >= 75 ? "גבוה" : state.suspicion >= 45 ? "בינוני" : "נמוך"}`
    ].forEach((line) => { const li = document.createElement("li"); li.className = "list-item"; li.textContent = line; dom.relationsList.appendChild(li); });

    dom.historyList.innerHTML = "";
    const h = state.history.slice(0, 7);
    if (!h.length) dom.historyList.innerHTML = `<li class="list-item">אין החלטות עדיין.</li>`;
    else h.forEach((x) => { const li = document.createElement("li"); li.className = "list-item"; li.textContent = `שבוע ${x.week}: ${x.title} | ${x.choice}`; dom.historyList.appendChild(li); });
  }

  function renderFamily() {
    dom.familyList.innerHTML = "";
    [
      `בן/בת זוג: ${state.characters.officialPartner}`,
      `גרים יחד: ${state.flags.livingTogether ? "כן" : "לא"}`,
      `נישואין: ${state.flags.isMarried ? "כן" : "לא"}`,
      `ילדים: ${state.childrenCount}`,
      `בית/משפחה: ${state.stats.family}`,
      `לחץ: ${state.stats.stress}`,
      `רומן פעיל: ${state.flags.affairActive ? "כן" : "לא"}`
    ].forEach((line) => { const li = document.createElement("li"); li.className = "list-item"; li.textContent = line; dom.familyList.appendChild(li); });
    const dis = state.phase !== PH.RUNNING;
    dom.familyVacationBtn.disabled = dis;
    dom.familyIgnoreBtn.disabled = dis;
  }

  function renderClues() {
    dom.cluesList.innerHTML = "";
    if (!state.cluesDiscovered.length) { dom.cluesList.innerHTML = `<li class="list-item">עדיין לא נאספו רמזים.</li>`; return; }
    state.cluesDiscovered.forEach((c0) => { const li = document.createElement("li"); li.className = "list-item"; li.textContent = `● ${c0.text} | ${c0.category} | חומרה ${c0.severity} | שבוע ${c0.discoveredAtTurn}`; dom.cluesList.appendChild(li); });
  }

  function renderEndings() {
    dom.endingProgress.textContent = `${state.unlockedEndings.length}/${ENDINGS.length}`;
    dom.endingsGrid.innerHTML = "";
    ENDINGS.forEach((e) => {
      const open = state.unlockedEndings.includes(e.id);
      const card = document.createElement("article");
      card.className = `end-card${open ? "" : " locked"}`;
      card.innerHTML = `<h4>${open ? e.title : "נעול"}</h4><p>${open ? e.summary : "תמשיך לשחק כדי לפתוח."}</p>`;
      dom.endingsGrid.appendChild(card);
    });
    dom.badgesGrid.innerHTML = "";
    BADGES.forEach((b) => {
      const open = state.unlockedBadges.includes(b.id);
      const card = document.createElement("article");
      card.className = `end-card${open ? "" : " locked"}`;
      card.innerHTML = `<h4>${open ? b.title : "נעול"}</h4><p>${open ? b.desc : "עדיין לא פתוח."}</p>`;
      dom.badgesGrid.appendChild(card);
    });
  }

  function renderAll() {
    renderTop();
    renderHomeButtons();
    renderTabs();
    renderStory();
    renderActionsTab();
    renderStats();
    renderAssets();
    renderRelations();
    renderFamily();
    renderClues();
    renderEndings();
  }
  function startNew() { initState(false); saveRun(); renderAll(); }
  function startFree() { if (!state.unlockedEndings.length) { toast("קודם צריך לפתוח סיום אחד לפחות", "alert"); return; } initState(true); saveRun(); renderAll(); }

  function continueRun() {
    loadAll();
    if (state.phase === PH.HOME) { toast("אין שמירה פעילה", "alert"); return; }
    if ((state.phase === PH.RUNNING || state.phase === PH.RESULT) && !state.currentBeat) state.currentBeat = nextBeat();
    renderAll();
  }

  function bind() {
    dom.newGameBtn.addEventListener("click", startNew);
    dom.homeNewBtn.addEventListener("click", startNew);
    dom.endingNewBtn.addEventListener("click", startNew);
    dom.continueBtn.addEventListener("click", continueRun);
    dom.homeContinueBtn.addEventListener("click", continueRun);
    dom.freeModeBtn.addEventListener("click", startFree);
    dom.homeFreeBtn.addEventListener("click", startFree);
    dom.endingFreeBtn.addEventListener("click", startFree);
    dom.finishWeekStoryBtn.addEventListener("click", finishWeek);
    dom.finishWeekActionsBtn.addEventListener("click", finishWeek);
    dom.nextWeekBtn.addEventListener("click", nextWeek);

    dom.clearActionsBtn.addEventListener("click", () => {
      if (state.phase !== PH.RUNNING) return;
      state.selectedActions = [];
      renderActionsTab();
      renderTop();
      saveRun();
    });

    dom.helpBtn.addEventListener("click", () => dom.helpDialog.showModal());
    dom.closeHelpBtn.addEventListener("click", () => dom.helpDialog.close());

    dom.themeBtn.addEventListener("click", () => {
      state.theme = state.theme === "dark" ? "light" : "dark";
      saveMeta();
      saveRun();
      renderAll();
    });

    dom.simpleLanguageToggle.addEventListener("change", () => {
      state.simpleLanguage = !!dom.simpleLanguageToggle.checked;
      saveMeta();
      toast(state.simpleLanguage ? "שפה פשוטה פעילה" : "הטקסט כרגע נשאר פשוט");
    });

    dom.tabButtons.forEach((btn) => btn.addEventListener("click", () => {
      if (!TABS.includes(btn.dataset.tabBtn)) return;
      state.tab = btn.dataset.tabBtn;
      renderTabs();
      saveRun();
    }));

    dom.weekChoices.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-choice-id]");
      if (!btn || state.phase !== PH.RUNNING) return;
      state.storyChoiceId = btn.dataset.choiceId;
      saveRun();
      renderStory();
    });

    [dom.financialActions, dom.relationshipActions, dom.tensionActions, dom.cheatingActions].forEach((container) => {
      container.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-action-id]");
        if (!btn) return;
        queueAction(btn.dataset.actionId);
      });
    });

    [dom.marketItemsList, dom.ownedItemsList].forEach((container) => {
      container.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-queue-action]");
        if (!btn) return;
        queueAction(btn.dataset.queueAction, { itemId: btn.dataset.itemId || null });
      });
    });

    dom.selectedActionsList.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-remove-index]");
      if (!btn) return;
      removeAction(Number(btn.dataset.removeIndex));
    });

    dom.familyVacationBtn.addEventListener("click", () => { queueAction("family_trip"); state.tab = "actions"; renderTabs(); saveRun(); });
    dom.familyIgnoreBtn.addEventListener("click", () => { queueAction("ignore_family"); state.tab = "actions"; renderTabs(); saveRun(); });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && dom.helpDialog.open) dom.helpDialog.close();
    });
  }

  function init() {
    state.characters = genChars();
    loadAll();
    if (state.phase !== PH.HOME && state.phase !== PH.ENDED && !state.currentBeat) state.currentBeat = nextBeat();
    bind();
    renderAll();
  }

  init();
})();
