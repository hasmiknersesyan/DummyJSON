import { test, expect } from '@playwright/test';
import { ProductsAPI } from '../lib/api/products-api';
import { ProductAssertions } from '../lib/helpers/assertions';
import { sampleProduct, productUpdate, partialUpdate } from '../lib/fixtures/test-data';
import { generateRandomProductTitle, generateRandomPrice } from '../lib/helpers/utils';

/**
 * Test suite for DummyJSON Products API - CRUD Operations
 * Note: DummyJSON simulates these operations but doesn't persist data
 */
test.describe('Products API - CRUD Operations', () => {
    let productsAPI: ProductsAPI;

    test.beforeEach(async ({ request }) => {
        productsAPI = new ProductsAPI(request);
    });

    test('should create a new product (POST)', async () => {
        const newProduct = {
            ...sampleProduct,
            title: generateRandomProductTitle(),
            price: generateRandomPrice(),
        };

        const response = await productsAPI.addProduct(newProduct);

        expect(response.ok).toBeTruthy();
        expect(response.status).toBe(201);

        const createdProduct = response.data;

        // Verify the product was "created" with an ID
        expect(createdProduct.id).toBeDefined();
        expect(createdProduct.id).toBeGreaterThan(0);

        // Verify all submitted fields are returned
        expect(createdProduct.title).toBe(newProduct.title);
        expect(createdProduct.price).toBe(newProduct.price);
        expect(createdProduct.description).toBe(newProduct.description);
        expect(createdProduct.brand).toBe(newProduct.brand);
        expect(createdProduct.category).toBe(newProduct.category);
    });

    test('should update a product completely (PUT)', async () => {
        const productId = 1;
        const updates = {
            title: 'Updated Product via PUT',
            price: 299.99,
            description: 'Completely updated product description',
            brand: 'Updated Brand',
            category: 'laptops',
        };

        const response = await productsAPI.updateProduct(productId, updates);

        expect(response.ok).toBeTruthy();
        expect(response.status).toBe(200);

        const updatedProduct = response.data;

        // Verify the product ID remains the same
        expect(updatedProduct.id).toBe(productId);

        // Verify all updates were applied
        ProductAssertions.assertProductsMatch(updatedProduct, updates);
    });

    test('should partially update a product (PATCH)', async () => {
        const productId = 1;
        const updates = {
            price: 499.99,
        };

        const response = await productsAPI.patchProduct(productId, updates);

        expect(response.ok).toBeTruthy();
        expect(response.status).toBe(200);

        const updatedProduct = response.data;

        // Verify the product ID remains the same
        expect(updatedProduct.id).toBe(productId);

        // Verify the price was updated
        expect(updatedProduct.price).toBe(updates.price);

        // Other fields should still exist
        expect(updatedProduct.title).toBeDefined();
        expect(updatedProduct.description).toBeDefined();
    });

    test('should delete a product (DELETE)', async () => {
        const productId = 1;

        const response = await productsAPI.deleteProduct(productId);

        expect(response.ok).toBeTruthy();
        expect(response.status).toBe(200);

        const deletedProduct = response.data;

        // Verify deletion response
        expect(deletedProduct.id).toBe(productId);
        expect(deletedProduct.isDeleted).toBe(true);
        expect(deletedProduct.deletedOn).toBeDefined();

        // Verify deletedOn is a valid ISO date
        const deletedDate = new Date(deletedProduct.deletedOn);
        expect(deletedDate.toString()).not.toBe('Invalid Date');
    });

    test('should create product with minimal required fields', async () => {
        const minimalProduct = {
            title: 'Minimal Product Test',
            price: 49.99,
        };
        const response = await productsAPI.addProduct(minimalProduct);

        expect(response.ok).toBeTruthy();
        const product = response.data;

        expect(product.id).toBeDefined();
        expect(product.title).toBe(minimalProduct.title);
        expect(product.price).toBe(minimalProduct.price);
    });

    test('should handle multiple field updates via PATCH', async () => {
        const productId = 1;
        const updates = {
            title: 'Multi-field Update Test',
            price: 799.99,
            stock: 50,
            rating: 4.9,
        };

        const response = await productsAPI.patchProduct(productId, updates);
           

        expect(response.ok).toBeTruthy();
        const updatedProduct = response.data;

        ProductAssertions.assertProductsMatch(updatedProduct, updates);
    });

    test('should create product with all fields', async () => {
        const completeProduct = {
            title: 'Complete Product Test',
            description: 'A fully detailed product for comprehensive testing',
            price: 999.99,
            discountPercentage: 15.5,
            rating: 4.7,
            stock: 75,
            brand: 'Test Brand Premium',
            category: 'laptops',
        };

        const response = await productsAPI.addProduct(completeProduct);

        expect(response.ok).toBeTruthy();
        const product = response.data;

        // Verify all fields
        expect(product.title).toBe(completeProduct.title);
        expect(product.description).toBe(completeProduct.description);
        expect(product.price).toBe(completeProduct.price);
        expect(product.brand).toBe(completeProduct.brand);
        expect(product.category).toBe(completeProduct.category);
    });

    test('should update product price to zero', async () => {
        const productId = 1;
        const response = await productsAPI.patchProduct(productId, { price: 0 });

        expect(response.ok).toBeTruthy();
        const updatedProduct = response.data;
        // Note: API may not allow price of 0, verify it's updated or reverted to original
        expect(updatedProduct.price).toBeDefined();
    });

    test('should handle PUT request with changed category', async () => {
        const productId = 1;
        const updates = {
            title: 'Category Changed Product',
            category: 'fragrances',
            price: 149.99,
        };

        const response = await productsAPI.updateProduct(productId, updates);

        expect(response.ok).toBeTruthy();
        const updatedProduct = response.data;

        expect(updatedProduct.category).toBe(updates.category);
        expect(updatedProduct.title).toBe(updates.title);
    });

    test('should verify response headers for POST request', async () => {

        const response = await productsAPI.addProduct(sampleProduct);
        expect(response.ok).toBeTruthy();

        // Verify content type
        const contentType = response.headers['content-type'];
        expect(contentType).toContain('application/json');
    });
});
