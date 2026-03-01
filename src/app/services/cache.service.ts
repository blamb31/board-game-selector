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

    getCache(username: string): any | null {
        try {
            const expiryTimeStr = localStorage.getItem(this.CACHE_EXPIRY_KEY_PREFIX + username);
            if (!expiryTimeStr) return null;

            const expiryTime = parseInt(expiryTimeStr, 10);
            if (new Date().getTime() > expiryTime) {
                this.clearCache(username);
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
