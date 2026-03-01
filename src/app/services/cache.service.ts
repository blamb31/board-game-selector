import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CacheService {
    private readonly CACHE_KEY_PREFIX = 'bgg_collection_cache_v4_';
    private readonly CACHE_EXPIRY_KEY_PREFIX = 'bgg_collection_cache_expiry_v4_';
    private readonly CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

    constructor() { }

    setCache(username: string, data: any): void {
        const expiryTime = new Date().getTime() + this.CACHE_DURATION_MS;
        try {
            localStorage.setItem(this.CACHE_KEY_PREFIX + username, JSON.stringify(data));
            localStorage.setItem(this.CACHE_EXPIRY_KEY_PREFIX + username, expiryTime.toString());
        } catch (e) {
            console.warn('Error saving to localStorage', e);
        }
    }

    getCache(username: string, ignoreExpiry: boolean = false): any | null {
        try {
            let expiryTimeStr = localStorage.getItem(this.CACHE_EXPIRY_KEY_PREFIX + username);
            let cacheDataStr = localStorage.getItem(this.CACHE_KEY_PREFIX + username);

            if (!expiryTimeStr || !cacheDataStr) {
                // Fallback to legacy v3 cache without a username prefix if v4 is missing
                expiryTimeStr = localStorage.getItem('bgg_collection_cache_expiry_v3');
                cacheDataStr = localStorage.getItem('bgg_collection_cache_v3');

                if (!expiryTimeStr || !cacheDataStr) {
                    return null;
                }
            }

            const expiryTime = parseInt(expiryTimeStr, 10);
            if (!ignoreExpiry && new Date().getTime() > expiryTime) {
                return null; // Cache expired
            }

            const cacheData = localStorage.getItem(this.CACHE_KEY_PREFIX + username);
            return cacheData ? JSON.parse(cacheData) : null;
        } catch (e) {
            console.warn('Error reading from localStorage', e);
            return null;
        }
    }

    clearCache(username: string): void {
        try {
            localStorage.removeItem(this.CACHE_KEY_PREFIX + username);
            localStorage.removeItem(this.CACHE_EXPIRY_KEY_PREFIX + username);
        } catch (e) { }
    }
}
