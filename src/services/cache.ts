// Previous imports...

class CacheService {
  private static instance: CacheService;
  private memoryCache: Map<string, unknown>;
  private lastSync: number;

  private constructor() {
    this.memoryCache = new Map();
    this.lastSync = Date.now();
    this.initializeCache();
  }

  // Rest of the implementation...

  public async getCacheStats(): Promise<{
    lastSync: number;
    version: string;
    size: number;
  }> {
    const size = await AsyncStorage.getAllKeys().then(keys => keys.length);
    return {
      lastSync: this.lastSync,
      version: CACHE_VERSION,
      size,
    };
  }
}

export const cacheService = CacheService.getInstance();
