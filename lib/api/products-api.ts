import { APIRequestContext } from '@playwright/test';

/**
 * Product interface representing the DummyJSON product structure
 */
export interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
    discountPercentage: number;
    rating: number;
    stock: number;
    brand: string;
    category: string;
    thumbnail: string;
    images: string[];
}

/**
 * ProductsResponse interface for paginated product lists
 */
export interface ProductsResponse {
    products: Product[];
    total: number;
    skip: number;
    limit: number;
}

/**
 * Category interface representing product category
 */
export interface Category {
  slug: string;
  name: string;
  url: string;
}


/**
 * API client for DummyJSON Products endpoints
 */
export class ProductsAPI {
    private request: APIRequestContext;
    private baseURL: string;

    constructor(request: APIRequestContext, baseURL: string = 'https://dummyjson.com') {
        this.request = request;
        this.baseURL = baseURL;
    }

    /**
     * Get all products with optional pagination
     * @param limit - Number of products to return (default: 30)
     * @param skip - Number of products to skip (default: 0)
     */
    async getAllProducts(limit: number = 30, skip: number = 0): Promise<ProductsResponse> {
        const response = await this.request.get(`${this.baseURL}/products`, {
            params: { limit, skip },
        });

        return response.json();
    }

    /**
     * Get a single product by ID
     * @param id - Product ID
     */
    async getProductById(id: number): Promise<Product> {
        const response = await this.request.get(`${this.baseURL}/products/${id}`);
        return response.json();
    }

    /**
     * Search products by query
     * @param query - Search query string
     */
    async searchProducts(query: string): Promise<ProductsResponse> {
        const response = await this.request.get(`${this.baseURL}/products/search`, {
            params: { q: query },
        });

        return response.json();
    }

    /**
     * Get all product categories
     */
  async getCategories(): Promise<(string | Category)[]> {
        const response = await this.request.get(`${this.baseURL}/products/categories`);
        return response.json();
    }

    /**
     * Get products by category
     * @param category - Category name
     */
    async getProductsByCategory(category: string | Category): Promise<ProductsResponse> {
        const response = await this.request.get(`${this.baseURL}/products/category/${category}`);
        return response.json();
    }

    /**
     * Add a new product (simulated - doesn't persist)
     * @param product - Product data to add
     */
    async addProduct(product: Partial<Product>): Promise<Product> {
        const response = await this.request.post(`${this.baseURL}/products/add`, {
            data: product,
        });

        return response.json();
    }

    /**
     * Update a product (simulated - doesn't persist)
     * @param id - Product ID
     * @param updates - Product fields to update
     */
    async updateProduct(id: number, updates: Partial<Product>): Promise<Product> {
        const response = await this.request.put(`${this.baseURL}/products/${id}`, {
            data: updates,
        });

        return response.json();
    }

    /**
     * Partially update a product (simulated - doesn't persist)
     * @param id - Product ID
     * @param updates - Product fields to update
     */
    async patchProduct(id: number, updates: Partial<Product>): Promise<Product> {
        const response = await this.request.patch(`${this.baseURL}/products/${id}`, {
            data: updates,
        });

        return response.json();
    }

    /**
     * Delete a product (simulated - doesn't persist)
     * @param id - Product ID
     */
    async deleteProduct(id: number): Promise<Product & { isDeleted: boolean; deletedOn: string }> {
        const response = await this.request.delete(`${this.baseURL}/products/${id}`);
        return response.json();
    }
}
