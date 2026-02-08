import { Product } from '../api/products-api';

/**
 * Sample product data for testing
 */
export const sampleProduct: Partial<Product> = {
  title: 'Test Product',
  description: 'This is a test product for API testing',
  price: 99.99,
  discountPercentage: 10.5,
  rating: 4.5,
  stock: 100,
  brand: 'Test Brand',
  category: 'smartphones',
};

/**
 * Product data for updates
 */
export const productUpdate: Partial<Product> = {
  title: 'Updated Product Title',
  price: 149.99,
  rating: 4.8,
};

/**
 * Partial product update data
 */
export const partialUpdate: Partial<Product> = {
  price: 199.99,
};

/**
 * Invalid product data for negative testing
 */
export const invalidProduct = {
  title: '',
  price: -10,
};

/**
 * Test categories for category-based testing
 */
export const testCategories = [
  'smartphones',
  'laptops',
  'fragrances',
  'skincare',
  'groceries',
];

/**
 * Search queries for testing
 */
export const searchQueries = {
  valid: 'phone',
  noResults: 'xyznonexistent123',
  partial: 'sam',
  multiWord: 'iPhone 9',
};

/**
 * Known product IDs for testing
 */
export const knownProductIds = {
  valid: 1,
  invalid: 999999,
  boundary: 0,
};

/**
 * Pagination test data
 */
export const paginationData = {
  defaultLimit: 30,
  customLimit: 10,
  largeLimit: 100,
  skipFirst: 10,
  skipSecond: 20,
};
