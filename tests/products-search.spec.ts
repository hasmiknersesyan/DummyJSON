import { test, expect } from '@playwright/test';
import { ProductsAPI } from '../lib/api/products-api';
import { ProductAssertions } from '../lib/helpers/assertions';
import { searchQueries } from '../lib/fixtures/test-data';

/**
 * Test suite for DummyJSON Products API - Search Functionality
 */
test.describe('Products API - Search Functionality', () => {
  let productsAPI: ProductsAPI;

  test.beforeEach(async ({ request }) => {
    productsAPI = new ProductsAPI(request);
  });

  test('should search products with valid query', async () => {
    const searchTerm = searchQueries.valid;
    const response = await productsAPI.searchProducts(searchTerm);

    // Validate response structure
    ProductAssertions.assertValidProductsResponse(response);
    
    // Validate search results contain the search term
    expect(response.products.length).toBeGreaterThan(0);
    
    // Verify search term appears in at least one field of each product
    ProductAssertions.assertProductsMatchSearch(response.products, searchTerm);
  });

  test('should return empty results for non-existent search query', async () => {
    const searchTerm = searchQueries.noResults;
    const response = await productsAPI.searchProducts(searchTerm);

    expect(response.products).toBeDefined();
    expect(Array.isArray(response.products)).toBeTruthy();
    expect(response.products.length).toBe(0);
    expect(response.total).toBe(0);
  });

  test('should search with partial product name', async () => {
    const searchTerm = searchQueries.partial;
    const response = await productsAPI.searchProducts(searchTerm);

    ProductAssertions.assertValidProductsResponse(response);
    expect(response.products.length).toBeGreaterThan(0);
    
    // Validate each result contains the search term
    response.products.forEach(product => {
      const combinedText = `${product.title} ${product.description} ${product.brand}`.toLowerCase();
      expect(combinedText).toContain(searchTerm.toLowerCase());
    });
  });

  test('should search with multi-word query', async () => {
    const searchTerm = searchQueries.multiWord;
    const response = await productsAPI.searchProducts(searchTerm);

    expect(response.products).toBeDefined();
    expect(Array.isArray(response.products)).toBeTruthy();
    
    if (response.products.length > 0) {
      ProductAssertions.assertValidProductsResponse(response);
      
      // Validate results match the multi-word search
      response.products.forEach(product => {
        const searchWords = searchTerm.toLowerCase().split(' ');
        const combinedText = `${product.title} ${product.description} ${product.brand}`.toLowerCase();
        
        // At least some words should match
        const hasMatch = searchWords.some(word => combinedText.includes(word));
        expect(hasMatch).toBeTruthy();
      });
    }
  });

  test('should search case-insensitively', async ({ request }) => {
    const searchTermLower = 'phone';
    const searchTermUpper = 'PHONE';
    const searchTermMixed = 'PhOnE';

    const responseLower = await request.get('https://dummyjson.com/products/search', {
      params: { q: searchTermLower },
    });
    
    const responseUpper = await request.get('https://dummyjson.com/products/search', {
      params: { q: searchTermUpper },
    });
    
    const responseMixed = await request.get('https://dummyjson.com/products/search', {
      params: { q: searchTermMixed },
    });

    const dataLower = await responseLower.json();
    const dataUpper = await responseUpper.json();
    const dataMixed = await responseMixed.json();

    // All searches should return the same results
    expect(dataLower.total).toBe(dataUpper.total);
    expect(dataLower.total).toBe(dataMixed.total);
    expect(dataLower.products.length).toBe(dataUpper.products.length);
  });

  test('should search in product titles', async () => {
    const searchTerm = 'iPhone';
    const response = await productsAPI.searchProducts(searchTerm);

    if (response.products.length > 0) {
      const hasMatchInTitle = response.products.some(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      expect(hasMatchInTitle).toBeTruthy();
    }
  });

  test('should search in product descriptions', async () => {
    const searchTerm = 'smartphone';
    const response = await productsAPI.searchProducts(searchTerm);

    if (response.products.length > 0) {
      const hasMatchInDescription = response.products.some(product =>
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      expect(hasMatchInDescription).toBeTruthy();
    }
  });

  test('should search in product brands', async () => {
    const searchTerm = 'Apple';
    const response = await productsAPI.searchProducts(searchTerm);

    if (response.products.length > 0) {
      const hasMatchInBrand = response.products.some(product =>
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      expect(hasMatchInBrand).toBeTruthy();
    }
  });

  test('should handle empty search query', async ({ request }) => {
    const response = await request.get('https://dummyjson.com/products/search', {
      params: { q: '' },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    // Empty search should return all products or no products
    expect(data.products).toBeDefined();
    expect(Array.isArray(data.products)).toBeTruthy();
  });

  test('should handle special characters in search query', async ({ request }) => {
    const specialChars = ['@', '#', '$', '%', '&', '*'];
    
    for (const char of specialChars) {
      const response = await request.get('https://dummyjson.com/products/search', {
        params: { q: char },
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.products).toBeDefined();
    }
  });

  test('should validate search response performance', async () => {
    const startTime = Date.now();
    await productsAPI.searchProducts('laptop');
    const responseTime = Date.now() - startTime;

    // Search should complete within 2 seconds
    expect(responseTime).toBeLessThan(2000);
  });

  test('should search and validate product structure', async () => {
    const response = await productsAPI.searchProducts('perfume');

    if (response.products.length > 0) {
      response.products.forEach(product => {
        ProductAssertions.assertValidProduct(product);
      });
    }
  });

  test('should handle numeric search query', async ({ request }) => {
    const response = await request.get('https://dummyjson.com/products/search', {
      params: { q: '500' },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.products).toBeDefined();
  });

  test('should search with very long query string', async ({ request }) => {
    const longQuery = 'a'.repeat(200);
    const response = await request.get('https://dummyjson.com/products/search', {
      params: { q: longQuery },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.products).toBeDefined();
  });
});
