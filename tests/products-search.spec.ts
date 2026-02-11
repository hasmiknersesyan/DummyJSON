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
        const responseAll = await productsAPI.searchProducts(searchTerm);
        let data = responseAll.data;


        ProductAssertions.assertValidProductsResponse(data);
        expect(data.products.length).toBeGreaterThan(0);
        // Verify search term appears in at least one field of each product
        ProductAssertions.assertProductsMatchSearch(data.products, searchTerm);
    });

    test('should return empty results for non-existent search query', async () => {
        const searchTerm = searchQueries.noResults;
        const responseAll = await productsAPI.searchProducts(searchTerm);
        let data = responseAll.data;


        expect(data.products).toBeDefined();
        expect(Array.isArray(data.products)).toBeTruthy();
        expect(data.products.length).toBe(0);
        expect(data.total).toBe(0);
    });

    test('should search with partial product name', async () => {
        const searchTerm = searchQueries.partial;
        const responseAll = await productsAPI.searchProducts(searchTerm);
        let data = responseAll.data;
        ProductAssertions.assertValidProductsResponse(data);
        expect(data.products.length).toBeGreaterThan(0);

        // Validate each result contains the search term
        data.products.forEach(product => {
            const combinedText = `${product.title} ${product.description} ${product.brand}`.toLowerCase();
            expect(combinedText).toContain(searchTerm.toLowerCase());
        });
    });

    test('should search with multi-word query', async () => {
        const searchTerm = searchQueries.multiWord;
        const responseAll = await productsAPI.searchProducts(searchTerm);
        let data = responseAll.data;

        expect(data.products).toBeDefined();
        expect(Array.isArray(data.products)).toBeTruthy();

        if (data.products.length > 0) {
            ProductAssertions.assertValidProductsResponse(data);

            // Validate results match the multi-word search
            data.products.forEach(product => {
                const searchWords = searchTerm.toLowerCase().split(' ');
                const combinedText = `${product.title} ${product.description} ${product.brand}`.toLowerCase();

                // At least some words should match
                const hasMatch = searchWords.some(word => combinedText.includes(word));
                expect(hasMatch).toBeTruthy();
            });
        }
    });


    test('should search in product titles', async () => {
        const searchTerm = 'iPhone';
        const responseAll = await productsAPI.searchProducts(searchTerm);
        let data = responseAll.data;

        if (data.products.length > 0) {
            const hasMatchInTitle = data.products.some(product =>
                product.title.toLowerCase().includes(searchTerm.toLowerCase())
            );

            expect(hasMatchInTitle).toBeTruthy();
        }
    });

    test('should search in product descriptions', async () => {
        const searchTerm = 'smartphone';
        const responseAll = await productsAPI.searchProducts(searchTerm);
        let data = responseAll.data;

        if (data.products.length > 0) {
            const hasMatchInDescription = data.products.some(product =>
                product.description.toLowerCase().includes(searchTerm.toLowerCase())
            );

            expect(hasMatchInDescription).toBeTruthy();
        }
    });

    test('should search in product brands', async () => {
        const searchTerm = 'Apple';
        const responseAll = await productsAPI.searchProducts(searchTerm);
        let data = responseAll.data;

        if (data.products.length > 0) {
            const hasMatchInBrand = data.products.some(product =>
                product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
            );

            expect(hasMatchInBrand).toBeTruthy();
        }
    });

    test('should handle empty search query', async () => {
        const responseAll = await productsAPI.searchProducts('');
        let data = responseAll.data;

        expect(responseAll.ok).toBeTruthy();

        // Empty search should return all products or no products
        expect(data.products).toBeDefined();
        expect(Array.isArray(data.products)).toBeTruthy();
    });

    test('should handle special characters in search query', async () => {
        const specialChars = ['@', '#', '$', '%', '&', '*'];

        for (const char of specialChars) {
            const responseAll = await productsAPI.searchProducts(char);
            let data = responseAll.data;

            expect(responseAll.ok).toBeTruthy();
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
        const responseAll = await productsAPI.searchProducts('perfume');
        let data = responseAll.data;

        if (data.products.length > 0) {
            data.products.forEach(product => {
                ProductAssertions.assertValidProduct(product);
            });
        }
    });


    test('should search with very long query string', async ({ request }) => {
        const longQuery = 'a'.repeat(200);
        const responseAll = await productsAPI.searchProducts(longQuery);
        let data = responseAll.data;

        expect(responseAll.ok).toBeTruthy();
        expect(data.products).toBeDefined();
    });
});
