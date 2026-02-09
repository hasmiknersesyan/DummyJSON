import { expect } from '@playwright/test';
import { Product, ProductsResponse } from '../api/products-api';

/**
 * Custom assertions for product validation
 */
export class ProductAssertions {
  /**
   * Assert that a product has all required fields
   */
  static assertValidProduct(product: Product): void {
    expect(product).toBeDefined();
    expect(product.id).toBeGreaterThan(0);
    expect(product.title).toBeTruthy();
    expect(product.description).toBeTruthy();
    expect(product.price).toBeGreaterThan(0);
    expect(product.discountPercentage).toBeGreaterThanOrEqual(0);
    expect(product.rating).toBeGreaterThanOrEqual(0);
    expect(product.rating).toBeLessThanOrEqual(5);
    expect(product.stock).toBeGreaterThanOrEqual(0);
    // Brand is optional in some products
    if (product.brand) {
      expect(product.brand).toBeTruthy();
    }
    expect(product.category).toBeTruthy();
    expect(product.thumbnail).toBeTruthy();
    expect(Array.isArray(product.images)).toBeTruthy();
  }

  /**
   * Assert that a products response has valid structure
   */
  static assertValidProductsResponse(response: ProductsResponse): void {
    expect(response).toBeDefined();
    expect(Array.isArray(response.products)).toBeTruthy();
    expect(response.total).toBeGreaterThan(0);
    expect(response.skip).toBeGreaterThanOrEqual(0);
    expect(response.limit).toBeGreaterThan(0);
    expect(response.products.length).toBeLessThanOrEqual(response.limit);
  }

  /**
   * Assert that two products match (for update validation)
   */
  static assertProductsMatch(actual: Product, expected: Partial<Product>): void {
    if (expected.title) expect(actual.title).toBe(expected.title);
    if (expected.price) expect(actual.price).toBe(expected.price);
    if (expected.description) expect(actual.description).toBe(expected.description);
    if (expected.rating) expect(actual.rating).toBe(expected.rating);
    if (expected.stock) expect(actual.stock).toBe(expected.stock);
    if (expected.brand) expect(actual.brand).toBe(expected.brand);
    if (expected.category) expect(actual.category).toBe(expected.category);
  }

  /**
   * Assert that all products in array belong to specified category
   */
  static assertProductsInCategory(products: Product[], category: string): void {
    products.forEach(product => {
      expect(product.category).toBe(category);
    });
  }

  /**
   * Assert that products array contains search term
   */
  static assertProductsMatchSearch(products: Product[], searchTerm: string): void {
    products.forEach(product => {
      const searchableTerm = searchTerm.toLowerCase();
      const titleMatch = product.title.toLowerCase().includes(searchableTerm);
      const descMatch = product.description.toLowerCase().includes(searchableTerm);
      const brandMatch = product.brand.toLowerCase().includes(searchableTerm);
      
      expect(titleMatch || descMatch || brandMatch).toBeTruthy();
    });
  }

  /**
   * Assert pagination is working correctly
   */
  static assertPagination(response: ProductsResponse, expectedSkip: number, expectedLimit: number): void {
    expect(response.skip).toBe(expectedSkip);
    expect(response.limit).toBe(expectedLimit);
    expect(response.products.length).toBeLessThanOrEqual(expectedLimit);
  }
}
