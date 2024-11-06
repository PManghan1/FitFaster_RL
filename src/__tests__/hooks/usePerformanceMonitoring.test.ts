import { renderHook, act } from '@testing-library/react-native';
import { usePerformanceMonitoring } from '../../hooks/usePerformanceMonitoring';
import { performanceMonitoring, MetricType } from '../../services/performance';

// Mock the performance service
jest.mock('../../services/performance', () => ({
  performanceMonitoring: {
    measureScreenLoad: jest.fn(),
    measureRender: jest.fn(),
    measureApiCall: jest.fn(),
    measureInteraction: jest.fn(),
    getMetrics: jest.fn(),
    getAverageMetric: jest.fn(),
  },
  MetricType: {
    SCREEN_LOAD: 'screen_load',
    API_CALL: 'api_call',
    RENDER: 'render',
    INTERACTION: 'interaction',
    RESOURCE: 'resource',
  },
}));

describe('usePerformanceMonitoring', () => {
  const mockOptions = {
    screenName: 'TestScreen',
    componentName: 'TestComponent',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock performance.now()
    global.performance.now = jest.fn(() => 1000);
  });

  it('measures screen load on mount', () => {
    renderHook(() => usePerformanceMonitoring(mockOptions));

    expect(performanceMonitoring.measureScreenLoad).toHaveBeenCalledWith(mockOptions.screenName);
  });

  it('tracks render time when enabled', () => {
    const { unmount } = renderHook(() =>
      usePerformanceMonitoring({
        ...mockOptions,
        enableRenderTracking: true,
      })
    );

    unmount();

    expect(performanceMonitoring.measureRender).toHaveBeenCalledWith(
      mockOptions.componentName,
      expect.any(Number)
    );
  });

  it('measures API calls with metadata', async () => {
    const { result } = renderHook(() => usePerformanceMonitoring(mockOptions));
    const mockPromise = Promise.resolve('test');
    const mockMetadata = { test: true };

    (performanceMonitoring.measureApiCall as jest.Mock).mockResolvedValueOnce('test');

    await act(async () => {
      await result.current.measureApiCall(mockPromise, 'testApi', mockMetadata);
    });

    expect(performanceMonitoring.measureApiCall).toHaveBeenCalledWith(
      mockPromise,
      'testApi',
      expect.objectContaining({
        screenName: mockOptions.screenName,
        componentName: mockOptions.componentName,
        test: true,
      })
    );
  });

  it('measures interactions with metadata', () => {
    const { result } = renderHook(() => usePerformanceMonitoring(mockOptions));
    const mockCallback = jest.fn();
    const mockMetadata = { test: true };

    act(() => {
      result.current.measureInteraction('testInteraction', mockCallback, mockMetadata);
    });

    expect(performanceMonitoring.measureInteraction).toHaveBeenCalledWith(
      'testInteraction',
      mockCallback,
      expect.objectContaining({
        screenName: mockOptions.screenName,
        componentName: mockOptions.componentName,
        test: true,
      })
    );
  });

  it('retrieves metrics', () => {
    const mockMetrics = [
      {
        type: MetricType.SCREEN_LOAD,
        name: 'test',
        startTime: 1000,
        duration: 100,
      },
    ];
    (performanceMonitoring.getMetrics as jest.Mock).mockReturnValue(mockMetrics);

    const { result } = renderHook(() => usePerformanceMonitoring(mockOptions));

    act(() => {
      const metrics = result.current.getMetrics();
      expect(metrics).toEqual(mockMetrics);
    });
  });

  it('retrieves average metric', () => {
    const mockAverage = 150;
    (performanceMonitoring.getAverageMetric as jest.Mock).mockReturnValue(mockAverage);

    const { result } = renderHook(() => usePerformanceMonitoring(mockOptions));

    act(() => {
      const average = result.current.getAverageMetric(MetricType.SCREEN_LOAD, 'test');
      expect(average).toBe(mockAverage);
    });

    expect(performanceMonitoring.getAverageMetric).toHaveBeenCalledWith(
      MetricType.SCREEN_LOAD,
      'test'
    );
  });

  it('handles API call errors', async () => {
    const { result } = renderHook(() => usePerformanceMonitoring(mockOptions));
    const error = new Error('API Error');
    const mockPromise = Promise.reject(error);

    (performanceMonitoring.measureApiCall as jest.Mock).mockRejectedValueOnce(error);

    await act(async () => {
      try {
        await result.current.measureApiCall(mockPromise, 'testApi');
      } catch (e) {
        expect(e).toBe(error);
      }
    });

    expect(performanceMonitoring.measureApiCall).toHaveBeenCalledWith(
      mockPromise,
      'testApi',
      expect.objectContaining({
        screenName: mockOptions.screenName,
        componentName: mockOptions.componentName,
      })
    );
  });
});
