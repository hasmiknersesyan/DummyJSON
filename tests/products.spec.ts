import { test, expect } from '@playwright/test';
import { ProductsAPI, Category } from '@lib/api/products-api';
import { ProductAssertions } from '@lib/helpers/assertions';
import { knownProductIds, paginationData } from '@lib/fixtures/test-data';
import singleProductSchema from '@lib/fixtures/schemas/product.schema.json';
import { validateResponseSchema } from '@lib/helpers/ajv_schema_validator';


/**
 * Test suite for DummyJSON Products API - Basic Operations
 */
test.describe.only('Products API - Basic Operations', () => {
    let productsAPI: ProductsAPI;

    test.beforeEach(async ({ request }) => {
        productsAPI = new ProductsAPI(request);
    });

    test('should fetch all products with default pagination', async () => {
        const startTime = Date.now();
        const response = await productsAPI.getAllProducts();
        const responseTime = Date.now() - startTime;

        // Validate response structure
        ProductAssertions.assertValidProductsResponse(response.data);

        // Validate default pagination
        expect(response.data.limit).toBe(paginationData.defaultLimit);
        expect(response.data.skip).toBe(0);
        expect(response.data.products.length).toBeGreaterThan(0);
        expect(response.data.total).toBeGreaterThan(0);

        // Validate each product
        response.data.products.forEach(product => {
            ProductAssertions.assertValidProduct(product);
        });

        // Performance check - response should be under 2 seconds
        expect(responseTime).toBeLessThan(2000);
    });

    test('should fetch products with custom pagination (limit=10)', async () => {
        const limit = paginationData.customLimit;
        const response = await productsAPI.getAllProducts(limit, 0);

        ProductAssertions.assertValidProductsResponse(response.data);
        ProductAssertions.assertPagination(response.data, 0, limit);
        expect(response.data.products.length).toBeLessThanOrEqual(limit);
    });

    test('should fetch products with skip parameter', async () => {
        const limit = 10;
        const skip = paginationData.skipFirst;

        const response = await productsAPI.getAllProducts(limit, skip);

        ProductAssertions.assertValidProductsResponse(response.data);
        ProductAssertions.assertPagination(response.data, skip, limit);
    });

    test('should fetch a single product by valid ID', async () => {
        const productId = knownProductIds.valid;
       const response = await productsAPI.getProductById(productId);

        expect(response.data.id).toBe(productId);
        expect(validateResponseSchema(response.data, singleProductSchema), 'Schema validation should pass').toBe(true);

    });

    test('should return 404 for non-existent product ID', async () => {
        const productId = knownProductIds.invalid;
        const response = await productsAPI.getProductById(productId);

        expect(response.status).toBe(404);
    });

    test('should fetch all product categories', async () => {
        const categories = await productsAPI.getCategories();

        expect(Array.isArray(categories.data)).toBeTruthy();
        expect(categories.data.length).toBeGreaterThan(0);

        // Validate categories (can be strings or objects with slug/name)
        categories.data.forEach(category => {
            if (typeof category === 'string') {
                expect(category.length).toBeGreaterThan(0);
            } else {
                // TypeScript now knows this is a Category object
                const cat = category as Category;
                expect(cat.slug).toBeDefined();
                expect(cat.name).toBeDefined();
                expect(cat.url).toBeDefined();
                expect(cat.slug).toBeTruthy();
                expect(cat.name).toBeTruthy();
                expect(cat.url).toBeTruthy();
            }
        });
    });

    test('should handle large limit parameter', async () => {
        const limit = paginationData.largeLimit;
        const response = await productsAPI.getAllProducts(limit, 0);

        ProductAssertions.assertValidProductsResponse(response.data);
        expect(response.data.limit).toBe(limit);
        expect(response.data.products.length).toBeGreaterThan(0);
    });

    test('should fetch products from second page', async () => {
        const limit = 10;
        const firstPage = await productsAPI.getAllProducts(limit, 0);
        const secondPage = await productsAPI.getAllProducts(limit, limit);

        // Validate both pages
        ProductAssertions.assertValidProductsResponse(firstPage.data);
        ProductAssertions.assertValidProductsResponse(secondPage.data);

        // Ensure products are different
        const firstPageIds = firstPage.data.products.map(p => p.id);
        const secondPageIds = secondPage.data.products.map(p => p.id);

        // No overlap between pages
        const overlap = firstPageIds.filter(id => secondPageIds.includes(id));
        expect(overlap.length).toBe(0);
    });

    test('should return correct total count across all requests', async () => {
        const response1 = await productsAPI.getAllProducts(10, 0);
        const response2 = await productsAPI.getAllProducts(20, 5);

        // Total should be consistent across different pagination requests
        expect(response1.data.total).toBe(response2.data.total);
        expect(response1.data.total).toBeGreaterThan(0);
    });

    test('should validate product image URLs are valid', async () => {
        const response = await productsAPI.getAllProducts(5, 0);

        response.data.products.forEach(product => {
            // Validate thumbnail is a valid URL
            expect(product.thumbnail).toMatch(/^https?:\/\/.+/);

            // Validate all images are valid URLs
            product.images.forEach(image => {
                expect(image).toMatch(/^https?:\/\/.+/);
            });
        });
    });
});
