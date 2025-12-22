import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { supabase } from '@/integrations/supabase/client';

// Gender and Event types
export type GenderCategory = 'mens' | 'womens' | 'unisex';
export type EventCategory = 'casual' | 'party' | 'cocktail' | 'formal' | 'street' | 'vacation' | 'wedding' | 'office';

// Product interface
export interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    rentalPrice?: number;
    gender: GenderCategory;
    eventCategory: EventCategory;
    imageUrl: string;
    videoUrl?: string;
    color: string;
    sizes?: string[];
    leadTimeMinutes?: number;
    rating: number;
    stockQuantity?: number;
    isAvailable?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

// IndexedDB Schema for offline storage
interface ProductDB extends DBSchema {
    products: {
        key: string;
        value: Product;
        indexes: {
            'by-gender': GenderCategory;
            'by-event': EventCategory;
            'by-gender-event': [GenderCategory, EventCategory];
        };
    };
    sync_queue: {
        key: number;
        value: {
            id?: number;
            action: 'create' | 'update' | 'delete';
            productId: string;
            data?: Partial<Product>;
            timestamp: number;
        };
    };
    metadata: {
        key: string;
        value: {
            lastSync: number;
            version: number;
        };
    };
}

class ProductService {
    private db: IDBPDatabase<ProductDB> | null = null;
    private readonly DB_NAME = 'popclozet-products';
    private readonly DB_VERSION = 1;

    // Initialize IndexedDB
    async initDB(): Promise<IDBPDatabase<ProductDB>> {
        if (this.db) return this.db;

        this.db = await openDB<ProductDB>(this.DB_NAME, this.DB_VERSION, {
            upgrade(db) {
                // Products store
                if (!db.objectStoreNames.contains('products')) {
                    const productStore = db.createObjectStore('products', { keyPath: 'id' });
                    productStore.createIndex('by-gender', 'gender');
                    productStore.createIndex('by-event', 'eventCategory');
                    productStore.createIndex('by-gender-event', ['gender', 'eventCategory']);
                }

                // Sync queue store
                if (!db.objectStoreNames.contains('sync_queue')) {
                    db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
                }

                // Metadata store
                if (!db.objectStoreNames.contains('metadata')) {
                    db.createObjectStore('metadata', { keyPath: 'key' });
                }
            },
        });

        return this.db;
    }

    // Check if online
    private isOnline(): boolean {
        return navigator.onLine;
    }

    // Sync products from Supabase to IndexedDB
    async syncProducts(): Promise<void> {
        try {
            const db = await this.initDB();

            // Fetch all products from Supabase (with type assertion to avoid TS errors)
            const { data: products, error } = await (supabase as any)
                .from('products')
                .select('*')
                .eq('is_available', true);

            if (error) throw error;

            if (products && products.length > 0) {
                const tx = db.transaction('products', 'readwrite');
                const store = tx.objectStore('products');

                // Clear existing products and add new ones
                await store.clear();

                for (const product of products) {
                    await store.put(this.transformFromDB(product));
                }

                await tx.done;

                // Update last sync timestamp
                await db.put('metadata', {
                    key: 'lastSync',
                    lastSync: Date.now(),
                    version: this.DB_VERSION,
                });

                console.log(`✅ Synced ${products.length} products to IndexedDB`);
            }
        } catch (error) {
            console.error('❌ Error syncing products:', error);
            throw error;
        }
    }

    // Transform database product to app format
    private transformFromDB(dbProduct: any): Product {
        return {
            id: dbProduct.id,
            name: dbProduct.name,
            description: dbProduct.description,
            price: parseFloat(dbProduct.price),
            rentalPrice: dbProduct.rental_price ? parseFloat(dbProduct.rental_price) : undefined,
            gender: dbProduct.gender as GenderCategory,
            eventCategory: dbProduct.event_category as EventCategory,
            imageUrl: dbProduct.image_url,
            videoUrl: dbProduct.video_url,
            color: dbProduct.color,
            sizes: dbProduct.sizes,
            leadTimeMinutes: dbProduct.lead_time_minutes,
            rating: parseFloat(dbProduct.rating),
            stockQuantity: dbProduct.stock_quantity,
            isAvailable: dbProduct.is_available,
            createdAt: dbProduct.created_at,
            updatedAt: dbProduct.updated_at,
        };
    }

    // Transform app product to database format
    private transformToDB(product: Partial<Product>): any {
        return {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            rental_price: product.rentalPrice,
            gender: product.gender,
            event_category: product.eventCategory,
            image_url: product.imageUrl,
            video_url: product.videoUrl,
            color: product.color,
            sizes: product.sizes,
            lead_time_minutes: product.leadTimeMinutes,
            rating: product.rating,
            stock_quantity: product.stockQuantity,
            is_available: product.isAvailable,
        };
    }

    // Get all products (online or offline)
    async getAllProducts(): Promise<Product[]> {
        if (this.isOnline()) {
            try {
                const { data, error } = await (supabase as any)
                    .from('products')
                    .select('*')
                    .eq('is_available', true)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                // Cache in IndexedDB
                const db = await this.initDB();
                const tx = db.transaction('products', 'readwrite');
                for (const product of data || []) {
                    await tx.objectStore('products').put(this.transformFromDB(product));
                }
                await tx.done;

                return (data || []).map(this.transformFromDB);
            } catch (error) {
                console.warn('⚠️ Online fetch failed, falling back to offline cache:', error);
                return this.getProductsOffline();
            }
        } else {
            return this.getProductsOffline();
        }
    }

    // Get products from IndexedDB (offline)
    private async getProductsOffline(): Promise<Product[]> {
        const db = await this.initDB();
        return await db.getAll('products');
    }

    // Get products by gender
    async getProductsByGender(gender: GenderCategory): Promise<Product[]> {
        if (this.isOnline()) {
            try {
                const { data, error } = await (supabase as any)
                    .from('products')
                    .select('*')
                    .eq('gender', gender)
                    .eq('is_available', true)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                return (data || []).map(this.transformFromDB);
            } catch (error) {
                console.warn('⚠️ Falling back to offline:', error);
                const db = await this.initDB();
                return await db.getAllFromIndex('products', 'by-gender', gender);
            }
        } else {
            const db = await this.initDB();
            return await db.getAllFromIndex('products', 'by-gender', gender);
        }
    }

    // Get products by event
    async getProductsByEvent(event: EventCategory): Promise<Product[]> {
        if (this.isOnline()) {
            try {
                const { data, error } = await (supabase as any)
                    .from('products')
                    .select('*')
                    .eq('event_category', event)
                    .eq('is_available', true)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                return (data || []).map(this.transformFromDB);
            } catch (error) {
                console.warn('⚠️ Falling back to offline:', error);
                const db = await this.initDB();
                return await db.getAllFromIndex('products', 'by-event', event);
            }
        } else {
            const db = await this.initDB();
            return await db.getAllFromIndex('products', 'by-event', event);
        }
    }

    // Get products by gender AND event
    async getProductsByGenderAndEvent(gender: GenderCategory, event: EventCategory): Promise<Product[]> {
        if (this.isOnline()) {
            try {
                const { data, error } = await (supabase as any)
                    .from('products')
                    .select('*')
                    .eq('gender', gender)
                    .eq('event_category', event)
                    .eq('is_available', true)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                return (data || []).map(this.transformFromDB);
            } catch (error) {
                console.warn('⚠️ Falling back to offline:', error);
                const db = await this.initDB();
                return await db.getAllFromIndex('products', 'by-gender-event', [gender, event]);
            }
        } else {
            const db = await this.initDB();
            return await db.getAllFromIndex('products', 'by-gender-event', [gender, event]);
        }
    }

    // Get product by ID
    async getProductById(id: string): Promise<Product | undefined> {
        if (this.isOnline()) {
            try {
                const { data, error } = await (supabase as any)
                    .from('products')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                return this.transformFromDB(data);
            } catch (error) {
                console.warn('⚠️ Falling back to offline:', error);
                const db = await this.initDB();
                return await db.get('products', id);
            }
        } else {
            const db = await this.initDB();
            return await db.get('products', id);
        }
    }

    // Search products
    async searchProducts(query: string, filters?: {
        gender?: GenderCategory;
        event?: EventCategory;
    }): Promise<Product[]> {
        const allProducts = filters?.gender && filters?.event
            ? await this.getProductsByGenderAndEvent(filters.gender, filters.event)
            : filters?.gender
                ? await this.getProductsByGender(filters.gender)
                : filters?.event
                    ? await this.getProductsByEvent(filters.event)
                    : await this.getAllProducts();

        const lowerQuery = query.toLowerCase();
        return allProducts.filter(product =>
            product.name.toLowerCase().includes(lowerQuery) ||
            product.description?.toLowerCase().includes(lowerQuery) ||
            product.color.toLowerCase().includes(lowerQuery)
        );
    }

    // Get featured products
    async getFeaturedProducts(limit: number = 10): Promise<Product[]> {
        const products = await this.getAllProducts();
        return products
            .sort((a, b) => b.rating - a.rating)
            .slice(0, limit);
    }

    // Get last sync time
    async getLastSyncTime(): Promise<number | null> {
        try {
            const db = await this.initDB();
            const metadata = await db.get('metadata', 'lastSync');
            return metadata?.lastSync || null;
        } catch {
            return null;
        }
    }
}

// Export singleton instance
export const productService = new ProductService();
