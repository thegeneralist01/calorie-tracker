import type { ProductDraft } from '../types';

export type ProductListItem = {
  id: string;
  name: string;
  brand: string | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  isGlobal: boolean;
  publicationStatus: string;
  isAiEstimated: boolean;
};

export interface ProductRepository {
  createLocalProduct(userId: string, draft: ProductDraft): Promise<ProductListItem>;
  listLocalProducts(userId: string): Promise<ProductListItem[]>;
  searchProducts(userId: string, query: string, includeGlobal: boolean): Promise<ProductListItem[]>;
  cloneGlobalProductToLocal(userId: string, productId: string): Promise<ProductListItem>;
  submitProductForModeration(input: {
    productId: string;
    userId: string;
    labelPhotoUrl?: string;
  }): Promise<void>;
  addContribution(input: {
    productId: string;
    userId: string;
    payloadJson: string;
  }): Promise<void>;
}
