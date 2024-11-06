import { renderHook, act } from '@testing-library/react-native';
import { useSupplementAnalytics } from '../../hooks/useSupplementAnalytics';
import { trackSupplementEvent } from '../../analytics/supplement-events';
import { createMockSupplement } from '../utils/supplement-test-utils';
import { usePerformanceMonitoring } from '../../hooks/usePerformanceMonitoring';

jest.mock('../../analytics/supplement-events', () => ({
  trackSupplementEvent: jest.fn(),
  SupplementEvents: {
    ADD_SUPPLEMENT: 'add_supplement',
    DELETE_SUPPLEMENT: 'delete_supplement',
    LOG_INTAKE: 'log_supplement_intake',
    UPDATE_REMINDERS: 'update_supplement_reminders',
    VIEW_DETAILS: 'view_supplement_details',
    VIEW_LIST: 'view_supplement_list',
  },
}));

jest.mock('../../hooks/usePerformanceMonitoring', () => ({
  usePerformanceMonitoring: jest.fn(),
}));

describe('useSupplementAnalytics', () => {
  const mockMeasurePerformance = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (usePerformanceMonitoring as jest.Mock).mockReturnValue({
      measurePerformance: mockMeasurePerformance,
    });
  });

  it('tracks adding a supplement', async () => {
    const { result } = renderHook(() => useSupplementAnalytics());
    const mockSupplement = createMockSupplement();

    await act(async () => {
      result.current.trackAddSupplement(mockSupplement);
    });

    expect(trackSupplementEvent).toHaveBeenCalledWith(
      'add_supplement',
      expect.objectContaining({
        supplementId: mockSupplement.id,
        supplementName: mockSupplement.name,
      })
    );
  });

  it('tracks deleting a supplement', async () => {
    const { result } = renderHook(() => useSupplementAnalytics());
    const mockSupplement = createMockSupplement();

    await act(async () => {
      result.current.trackDeleteSupplement(mockSupplement);
    });

    expect(trackSupplementEvent).toHaveBeenCalledWith(
      'delete_supplement',
      expect.objectContaining({
        supplementId: mockSupplement.id,
        supplementName: mockSupplement.name,
      })
    );
  });

  it('tracks logging intake', async () => {
    const { result } = renderHook(() => useSupplementAnalytics());

    await act(async () => {
      result.current.trackLogIntake('123', 1000, 'reminder');
    });

    expect(trackSupplementEvent).toHaveBeenCalledWith(
      'log_supplement_intake',
      expect.objectContaining({
        supplementId: '123',
        dosage: 1000,
        source: 'reminder',
      })
    );
  });

  it('tracks viewing details with performance metrics', async () => {
    mockMeasurePerformance.mockResolvedValue(150); // 150ms load time
    const { result } = renderHook(() => useSupplementAnalytics());

    await act(async () => {
      await result.current.trackViewDetails('123');
    });

    expect(mockMeasurePerformance).toHaveBeenCalledWith('supplement_details_load');
    expect(trackSupplementEvent).toHaveBeenCalledWith(
      'view_supplement_details',
      expect.objectContaining({
        supplementId: '123',
        timeToLoad: 150,
      })
    );
  });
});
