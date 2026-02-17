export type Locale = 'en' | 'de';

export type GoalType =
  | 'LOSE_WEIGHT'
  | 'GAIN_WEIGHT'
  | 'MAINTAIN_WEIGHT'
  | 'BUILD_MUSCLE'
  | 'JUST_TRACKING';

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACKS';

export type QuantityUnit = 'g' | 'ml' | 'serving' | 'piece';

export type ProductDraft = {
  name: string;
  brand?: string;
  barcode?: string;
  qrCode?: string;
  region?: string;
  packageSizeLabel?: string;
  servingSizeLabel?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  source: 'MANUAL' | 'VERIFIED_LABEL' | 'BARCODE_DB' | 'USER_EDITED' | 'AI_ESTIMATE';
  isAiEstimated: boolean;
};

export type ProfileSnapshot = {
  id: string;
  username: string;
  email: string;
  locale: Locale;
  isAdmin: boolean;
};
