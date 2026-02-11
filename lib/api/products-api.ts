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
 * API Response wrapper including HTTP metadata
 */
export interface ApiResponse<T> {
  data: T;
  status: number;
  ok: boolean;
  statusText: string;
  headers: Record<string, string>;
}


/**
 * API client for DummyJSON Products endpoints
 */
export class ProductsAPI {
    private request: APIRequestContext;

    constructor(request: APIRequestContext) {
        this.request = request;
    }

    /**
     * Get all products with optional pagination
     * @param limit - Number of products to return (default: 30)
     * @param skip - Number of products to skip (default: 0)
     */
    async getAllProducts(limit: number = 30, skip: number = 0): Promise<ApiResponse<ProductsResponse>> {
        const response = await this.request.get('/products', {
            params: { limit, skip },
        });

        return {
            data: await response.json(),
            status: response.status(),
            ok: response.ok(),
            statusText: response.statusText(),
            headers: response.headers(),
        };
    }

    /**
     * Get a single product by ID
     * @param id - Product ID
     */
    async getProductById(id: number): Promise<ApiResponse<Product>> {
        const response = await this.request.get(`/products/${id}`);
        return {
            data: await response.json(),
            status: response.status(),
            ok: response.ok(),
            statusText: response.statusText(),
            headers: response.headers(),
        };
    }

    /**
     * Search products by query
     * @param query - Search query string
     */
    async searchProducts(query: string): Promise<ApiResponse<ProductsResponse>> {
        const response = await this.request.get('/products/search', {
            params: { q: query },
        });

        return {
            data: await response.json(),
            status: response.status(),
            ok: response.ok(),
            statusText: response.statusText(),
            headers: response.headers(),
        };
    }

    /**
     * Get all product categories
     */
    async getCategories(): Promise<ApiResponse<(string | Category)[]>> {
        const response = await this.request.get('/products/categories');
        return {
            data: await response.json(),
            status: response.status(),
            ok: response.ok(),
            statusText: response.statusText(),
            headers: response.headers(),
        };
    }

    /**
     * Get products by category
     * @param category - Category name
     */
    async getProductsByCategory(category: string | Category): Promise<ApiResponse<ProductsResponse>> {
        const categorySlug = typeof category === 'string' ? category : category.slug;
        const response = await this.request.get(`/products/category/${categorySlug}`);
        return {
            data: await response.json(),
            status: response.status(),
            ok: response.ok(),
            statusText: response.statusText(),
            headers: response.headers(),
        };
    }

    /**
     * Add a new product (simulated - doesn't persist)
     * @param product - Product data to add
     */
    async addProduct(product: Partial<Product>): Promise<ApiResponse<Product>> {
        const response = await this.request.post('/products/add', {
            data: product,
        });

        return {
            data: await response.json(),
            status: response.status(),
            ok: response.ok(),
            statusText: response.statusText(),
            headers: response.headers(),
        };
    }

    /**
     * Update a product (simulated - doesn't persist)
     * @param id - Product ID
     * @param updates - Product fields to update
     */
    async updateProduct(id: number, updates: Partial<Product>): Promise<ApiResponse<Product>> {
        const response = await this.request.put(`/products/${id}`, {
            data: updates,
        });

        return {
            data: await response.json(),
            status: response.status(),
            ok: response.ok(),
            statusText: response.statusText(),
            headers: response.headers(),
        };
    }

    /**
     * Partially update a product (simulated - doesn't persist)
     * @param id - Product ID
     * @param updates - Product fields to update
     */
    async patchProduct(id: number, updates: Partial<Product>): Promise<ApiResponse<Product>> {
        const response = await this.request.patch(`/products/${id}`, {
            data: updates,
        });

        return {
            data: await response.json(),
            status: response.status(),
            ok: response.ok(),
            statusText: response.statusText(),
            headers: response.headers(),
        };
    }

    /**
     * Delete a product (simulated - doesn't persist)
     * @param id - Product ID
     */
    async deleteProduct(id: number): Promise<ApiResponse<Product & { isDeleted: boolean; deletedOn: string }>> {
        const response = await this.request.delete(`/products/${id}`);
        return {
            data: await response.json(),
            status: response.status(),
            ok: response.ok(),
            statusText: response.statusText(),
            headers: response.headers(),
        };
    }
}
