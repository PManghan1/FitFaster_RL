import AsyncStorage from '@react-native-async-storage/async-storage';
import { cacheService } from '../../services/cache';
import { createMockSupplement, createMockIntake } from '../utils/supplement-test-utils';

describe('CacheService', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('caches supplements in memory and storage', async () => {
    const supplements = [createMockSupplement()];
    await cacheService.setSupplements(supplements);

    const cachedSupplements = await cacheService.getSupplements();
    expect(cachedSupplements).toEqual(supplements);

    // Verify AsyncStorage was used
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'supplements_cache',
      JSON.stringify(supplements)
    );
  });

  it('caches intakes in memory and storage', async () => {
    const intakes = [createMockIntake()];
    await cacheService.setIntakes(intakes);

    const cachedIntakes = await cacheService.getIntakes();
    expect(cachedIntakes).toEqual(intakes);

    // Verify AsyncStorage was used
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('intakes_cache', JSON.stringify(intakes));
  });

  it('invalidates cache when version changes', async () => {
    // Set old version
    await AsyncStorage.setItem('cache_version', '0.9.0');

    // Initialize cache service
    await cacheService.getSupplements();

    // Should clear old cache
    expect(AsyncStorage.multiRemove).toHaveBeenCalled();
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('cache_version', '1.0.0');
  });

  it('returns empty arrays when cache is empty', async () => {
    const supplements = await cacheService.getSupplements();
    const intakes = await cacheService.getIntakes();

    expect(supplements).toEqual([]);
    expect(intakes).toEqual([]);
  });

  it('provides cache statistics', async () => {
    const stats = await cacheService.getCacheStats();

    expect(stats).toEqual({
      lastSync: expect.any(Number),
      version: '1.0.0',
      size: expect.any(Number),
    });
  });
});
