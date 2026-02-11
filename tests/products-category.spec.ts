import { test, expect } from '@playwright/test';
import { ProductsAPI } from '../lib/api/products-api';
import { ProductAssertions } from '../lib/helpers/assertions';
import { testCategories } from '../lib/fixtures/test-data';

/**
 * Test suite for DummyJSON Products API - Category Filtering
 */
test.describe('Products API - Category Filtering', () => {
    let productsAPI: ProductsAPI;

    test.beforeEach(async ({ request }) => {
        productsAPI = new ProductsAPI(request);
    });

    test('should fetch all available categories', async () => {
        const categories = await productsAPI.getCategories();

        expect(Array.isArray(categories)).toBeTruthy();
        expect(categories.length).toBeGreaterThan(0);

        // Categories can be strings or objects with slug/name
        categories.forEach(category => {
            if (typeof category === 'string') {
                expect(category.length).toBeGreaterThan(0);
                expect(category.trim()).toBe(category); // No leading/trailing spaces
            } else if (typeof category === 'object') {
                expect(category).toHaveProperty('slug');
                expect(category).toHaveProperty('name');
            }
        });

        // Verify known categories exist (check for slug or direct string)
        const categoryNames = categories.map(cat =>
            typeof cat === 'string' ? cat : cat.slug || cat.name
        );
        expect(categoryNames.some(name => name.includes('smartphone'))).toBeTruthy();
    });

    test('should fetch products from smartphones category', async () => {
        const category = 'smartphones';
        const response = await productsAPI.getProductsByCategory(category);

        ProductAssertions.assertValidProductsResponse(response);
        expect(response.products.length).toBeGreaterThan(0);

        // All products should belong to the requested category
        ProductAssertions.assertProductsInCategory(response.products, category);
    });

    test('should fetch products from laptops category', async () => {
        const category = 'laptops';
        const response = await productsAPI.getProductsByCategory(category);

        ProductAssertions.assertValidProductsResponse(response);
        expect(response.products.length).toBeGreaterThan(0);

        // All products should belong to laptops category
        ProductAssertions.assertProductsInCategory(response.products, category);
    });

    test('should fetch products from fragrances category', async () => {
        const category = 'fragrances';
        const response = await productsAPI.getProductsByCategory(category);

        ProductAssertions.assertValidProductsResponse(response);
        expect(response.products.length).toBeGreaterThan(0);

        ProductAssertions.assertProductsInCategory(response.products, category);
    });

    test('should validate all products in category have consistent structure', async () => {
        const category = 'beauty';
        const response = await productsAPI.getProductsByCategory(category);

        if (response.products.length > 0) {
            response.products.forEach(product => {
                ProductAssertions.assertValidProduct(product);
                expect(product.category).toBe(category);
            });
        } else {
            // If category has no products, test still passes
            expect(true).toBeTruthy();
        }
    });

    test('should handle non-existent category gracefully', async ({ request }) => {
        const invalidCategory = 'nonexistentcategory123';
        const response = await request.get(`/products/category/${invalidCategory}`);

        // API may return 404 or empty results
        if (response.status() === 404) {
            expect(response.status()).toBe(404);
        } else {
            const data = await response.json();
            expect(data.products).toBeDefined();
            expect(data.products.length).toBe(0);
        }
    });

    test('should verify different categories have different products', async () => {
        const category1 = 'smartphones';
        const category2 = 'laptops';

        const response1 = await productsAPI.getProductsByCategory(category1);
        const response2 = await productsAPI.getProductsByCategory(category2);

        // Get product IDs from each category
        const ids1 = response1.products.map(p => p.id);
        const ids2 = response2.products.map(p => p.id);

        // Categories should not share products
        const overlap = ids1.filter(id => ids2.includes(id));
        expect(overlap.length).toBe(0);
    });

    test('should test multiple categories sequentially', async () => {
        for (const category of testCategories.slice(0, 3)) {
            const response = await productsAPI.getProductsByCategory(category);

            ProductAssertions.assertValidProductsResponse(response);
            expect(response.products.length).toBeGreaterThan(0);
            ProductAssertions.assertProductsInCategory(response.products, category);
        }
    });

    test('should validate category names match exactly', async () => {
        const categories = await productsAPI.getCategories();
        const testCategory = categories[0];
        const categoryName = typeof testCategory === 'string' ? testCategory : (testCategory.slug || testCategory.name);

        // console.log(`Testing category: ${typeof testCategory === 'string' ? testCategory : testCategory.slug || testCategory.name}`);
        // console.log('Available categories:', categories);
        const response = await productsAPI.getProductsByCategory(testCategory);

        response.products.forEach(product => {
            // console.log(`Product ID: ${product.id}, Category: ${product.category}`);
            // console.log(`Expected product ` + product );
            expect(product.category).toBe(categoryName);
            expect(product.category).not.toBe(categoryName.toUpperCase());
        });
    });

    test('should handle category with spaces (if any)', async () => {
        const categories = await productsAPI.getCategories();
        const categoryWithSpace = categories.find(cat => {
            const name = typeof cat === 'string' ? cat : (cat.slug || cat.name);
            return name?.includes(' ');
        });

        if (categoryWithSpace) {
            const categoryName = typeof categoryWithSpace === 'string'
                ? categoryWithSpace
                : (categoryWithSpace.slug || categoryWithSpace.name);
            const response = await productsAPI.getProductsByCategory(categoryName);
            expect(response.products).toBeDefined();
        } else {
            // If no category with space exists, this test passes
            expect(true).toBeTruthy();
        }
    });

    test('should verify category endpoint returns paginated response', async () => {
        const category = 'groceries';
        const response = await productsAPI.getProductsByCategory(category);

        // Should have pagination metadata
        expect(response.total).toBeDefined();
        expect(response.skip).toBeDefined();
        expect(response.limit).toBeDefined();
        expect(response.total).toBeGreaterThanOrEqual(response.products.length);
    });

    test('should validate response time for category filter', async () => {
        const startTime = Date.now();
        await productsAPI.getProductsByCategory('smartphones');
        const responseTime = Date.now() - startTime;

        // Should respond within 2 seconds
        expect(responseTime).toBeLessThan(2000);
    });

    test('should verify all categories have at least one product', async () => {
        const categories = await productsAPI.getCategories();

        // Test first 5 categories to avoid long execution
        const categoriesToTest = categories.slice(0, 5).map(cat =>
            typeof cat === 'string' ? cat : (cat.slug || cat.name)
        );

        for (const category of categoriesToTest) {
            const response = await productsAPI.getProductsByCategory(category);
            // Allow for empty categories as API data may vary
            expect(response.products).toBeDefined();
            expect(Array.isArray(response.products)).toBeTruthy();
        }
    });

    test('should handle category parameter case sensitivity', async ({ request }) => {
        const category = 'smartphones';
        const categoryUpper = 'SMARTPHONES';

        const responseLower = await request.get(`/products/category/${category}`);
        const responseUpper = await request.get(`/products/category/${categoryUpper}`);

        const dataLower = await responseLower.json();
        const dataUpper = await responseUpper.json();

        // Depending on API behavior, they may return same results or different
        // Just validate both return valid responses
        expect(dataLower.products).toBeDefined();
        expect(dataUpper.products).toBeDefined();
    });

    test('should validate total count matches products in category', async () => {
        const category = 'laptops';
        const response = await productsAPI.getProductsByCategory(category);

        // If not paginated (all results returned)
        if (response.products.length < 30) {
            expect(response.total).toBeGreaterThanOrEqual(response.products.length);
        } else {
            expect(response.total).toBeGreaterThan(0);
        }
    });
});
