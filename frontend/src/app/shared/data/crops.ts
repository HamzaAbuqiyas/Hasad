/**
 * The ONE list of crops in the app (before, 4 pages each had their own copy).
 * `value` is the exact name the Hassad ML model expects — don't change the spelling
 * (e.g. 'Yellow_Maize', 'palm trees', 'zucchini' are how the model knows them).
 */
export interface Crop {
  value: string;
  icon: string;
}

export const CROPS: readonly Crop[] = [
  { value: 'Almond', icon: '🌰' },
  { value: 'Apple', icon: '🍎' },
  { value: 'Apricot', icon: '🍑' },
  { value: 'Armenian Cucumber', icon: '🥒' },
  { value: 'Banana', icon: '🍌' },
  { value: 'Barley', icon: '🌾' },
  { value: 'Beans', icon: '🫘' },
  { value: 'Cabbage', icon: '🥬' },
  { value: 'Carrot', icon: '🥕' },
  { value: 'Cauliflower', icon: '🥦' },
  { value: 'Chickpeas', icon: '🧆' },
  { value: 'Chili Pepper', icon: '🌶️' },
  { value: 'Clementine', icon: '🍊' },
  { value: 'Common Vetch', icon: '🌿' },
  { value: 'Cowpea', icon: '🫘' },
  { value: 'Cucumber', icon: '🥒' },
  { value: 'Eggplant', icon: '🍆' },
  { value: 'Fig', icon: '🌳' },
  { value: 'Garlic', icon: '🧄' },
  { value: 'Grapefruit', icon: '🍊' },
  { value: 'Grapes', icon: '🍇' },
  { value: 'Green Fava Beans', icon: '🫘' },
  { value: 'Green Onion', icon: '🧅' },
  { value: 'Lemon', icon: '🍋' },
  { value: 'Lentils', icon: '🫘' },
  { value: 'Lettuce', icon: '🥬' },
  { value: 'Mandarin', icon: '🍊' },
  { value: 'Mediterranean Mandarin', icon: '🍊' },
  { value: 'Melon', icon: '🍈' },
  { value: 'Molokhia', icon: '🌿' },
  { value: 'Navel Orange', icon: '🍊' },
  { value: 'Nectarine', icon: '🍑' },
  { value: 'Okra', icon: '🌿' },
  { value: 'Olive', icon: '🫒' },
  { value: 'Onion', icon: '🧅' },
  { value: 'Oriental Tobacco', icon: '🍃' },
  { value: 'Parsley', icon: '🌿' },
  { value: 'Peach', icon: '🍑' },
  { value: 'Pear', icon: '🍐' },
  { value: 'Peas', icon: '🟢' },
  { value: 'Pomegranate', icon: '🔴' },
  { value: 'Pomelo', icon: '🍈' },
  { value: 'Potato', icon: '🥔' },
  { value: 'Radish', icon: '🌱' },
  { value: 'Sesame', icon: '🌱' },
  { value: 'Spinach', icon: '🥬' },
  { value: 'Sweet Pepper', icon: '🫑' },
  { value: 'Tomato', icon: '🍅' },
  { value: 'Turnip', icon: '🥕' },
  { value: 'Vicia', icon: '🍀' },
  { value: 'Watermelon', icon: '🍉' },
  { value: 'Wheat', icon: '🌾' },
  { value: 'White Maize', icon: '🌽' },
  { value: 'Yellow_Maize', icon: '🌽' },
  { value: 'palm trees', icon: '🌴' },
  { value: 'zucchini', icon: '🥒' }
];

const ICONS = new Map(CROPS.map(c => [c.value.toLowerCase(), c.icon]));

/** Icon for a crop name, whatever its upper/lower case ('Palm Trees' and 'palm trees' both work). */
export function cropIcon(crop: string | null | undefined): string {
  return ICONS.get((crop ?? '').trim().toLowerCase()) ?? '🌱';
}

/** "🍎 Apple" — text for dropdowns and chips. */
export function cropLabel(crop: Crop): string {
  return `${crop.icon} ${crop.value}`;
}

export const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'] as const;

/** This year and the next 10 years. */
export function upcomingYears(count = 11, from = new Date().getFullYear()): number[] {
  return Array.from({ length: count }, (_, i) => from + i);
}
