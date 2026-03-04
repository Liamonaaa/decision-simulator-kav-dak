const SHAWARMA_OPTION_GROUPS = [
  {
    id: 'salads',
    titleHe: 'סלטים',
    type: 'multi',
    required: false,
    min: 0,
    max: 8,
    items: [
      { id: 'עגבנייה', labelHe: 'עגבנייה', priceDelta: 0, defaultSelected: false },
      { id: 'מלפפון', labelHe: 'מלפפון', priceDelta: 0, defaultSelected: false },
      { id: 'בצל', labelHe: 'בצל', priceDelta: 0, defaultSelected: false },
      { id: 'כרוב', labelHe: 'כרוב', priceDelta: 0, defaultSelected: false },
      { id: 'חציל', labelHe: 'חציל', priceDelta: 0, defaultSelected: false },
      { id: 'פטרוזיליה', labelHe: 'פטרוזיליה', priceDelta: 0, defaultSelected: false },
      { id: 'סלט חריף', labelHe: 'סלט חריף', priceDelta: 0, defaultSelected: false },
      { id: 'סלט ירוק', labelHe: 'סלט ירוק', priceDelta: 0, defaultSelected: false },
    ],
  },
  {
    id: 'sauces',
    titleHe: 'רטבים',
    type: 'multi',
    required: false,
    min: 0,
    max: 6,
    items: [
      { id: 'טחינה', labelHe: 'טחינה', priceDelta: 0, defaultSelected: false },
      { id: 'עמבה', labelHe: 'עמבה', priceDelta: 0, defaultSelected: false },
      { id: 'שום', labelHe: 'שום', priceDelta: 0, defaultSelected: false },
      { id: 'חריף', labelHe: 'חריף', priceDelta: 0, defaultSelected: false },
      { id: 'ברביקיו', labelHe: 'ברביקיו', priceDelta: 0, defaultSelected: false },
      { id: 'מיונז', labelHe: 'מיונז', priceDelta: 0, defaultSelected: false },
    ],
  },
  {
    id: 'pickles',
    titleHe: 'חמוצים',
    type: 'multi',
    required: false,
    min: 0,
    max: 4,
    items: [
      { id: 'מלפפון חמוץ', labelHe: 'מלפפון חמוץ', priceDelta: 0, defaultSelected: false },
      { id: 'לפת', labelHe: 'לפת', priceDelta: 0, defaultSelected: false },
      { id: 'זיתים', labelHe: 'זיתים', priceDelta: 0, defaultSelected: false },
      { id: 'פלפל חריף', labelHe: 'פלפל חריף', priceDelta: 0, defaultSelected: false },
    ],
  },
  {
    id: 'extras',
    titleHe: 'תוספות',
    type: 'multi',
    required: false,
    min: 0,
    max: 3,
    items: [
      { id: 'hummus', labelHe: 'חומוס', priceDelta: 6, defaultSelected: false },
      { id: 'egg', labelHe: 'ביצה קשה', priceDelta: 5, defaultSelected: false },
      { id: 'double-meat', labelHe: 'בשר כפול', priceDelta: 18, defaultSelected: false },
    ],
  },
  {
    id: 'spiceLevel',
    titleHe: 'רמת חריפות',
    type: 'single',
    required: false,
    min: 0,
    max: 1,
    items: [
      { id: 'עדין', labelHe: 'עדין', priceDelta: 0, defaultSelected: false },
      { id: 'בינוני', labelHe: 'בינוני', priceDelta: 0, defaultSelected: false },
      { id: 'חריף', labelHe: 'חריף', priceDelta: 0, defaultSelected: false },
    ],
  },
];

const DRINK_TYPE_GROUP = [
  {
    id: 'drinkType',
    titleHe: 'סוג שתייה',
    type: 'single',
    required: true,
    min: 1,
    max: 1,
    items: [
      { id: 'קוקה קולה', labelHe: 'קוקה קולה', priceDelta: 0, defaultSelected: false },
      { id: 'קוקה קולה זירו', labelHe: 'קוקה קולה זירו', priceDelta: 0, defaultSelected: false },
      { id: 'ספרייט', labelHe: 'ספרייט', priceDelta: 0, defaultSelected: false },
      { id: 'פאנטה תפוזים', labelHe: 'פאנטה תפוזים', priceDelta: 0, defaultSelected: false },
      { id: 'מים מינרליים', labelHe: 'מים מינרליים', priceDelta: 0, defaultSelected: false },
    ],
  },
];

const FRIES_OPTION_GROUPS = [
  {
    id: 'spiceLevel',
    titleHe: 'רמת חריפות',
    type: 'single',
    required: false,
    min: 0,
    max: 1,
    items: [
      { id: 'ללא חריף', labelHe: 'ללא חריף', priceDelta: 0, defaultSelected: true },
      { id: 'מעט חריף', labelHe: 'מעט חריף', priceDelta: 0, defaultSelected: false },
      { id: 'חריף', labelHe: 'חריף', priceDelta: 0, defaultSelected: false },
    ],
  },
];

export const PRODUCT_OPTION_GROUPS_CONFIG = {
  'pita-veal': SHAWARMA_OPTION_GROUPS,
  'pita-turkey': SHAWARMA_OPTION_GROUPS,
  'laffa-veal': SHAWARMA_OPTION_GROUPS,
  'laffa-turkey': SHAWARMA_OPTION_GROUPS,
  'fries-small': FRIES_OPTION_GROUPS,
  'fries-large': FRIES_OPTION_GROUPS,
  'drink-can': DRINK_TYPE_GROUP,
  'drink-bottle-05': DRINK_TYPE_GROUP,
  'drink-bottle-15': DRINK_TYPE_GROUP,
};
