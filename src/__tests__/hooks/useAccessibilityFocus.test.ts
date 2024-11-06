import { renderHook, act } from '@testing-library/react-native';
import { AccessibilityInfo, findNodeHandle } from 'react-native';
import { useAccessibilityFocus } from '../../hooks/useAccessibilityFocus';

// Mock dependencies
jest.mock('react-native', () => ({
  AccessibilityInfo: {
    setAccessibilityFocus: jest.fn(),
    announceForAccessibility: jest.fn(),
  },
  findNodeHandle: jest.fn(),
}));

describe('useAccessibilityFocus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sets focus on the referenced element', async () => {
    const mockNodeHandle = 123;
    const mockElement = {
      setNativeProps: jest.fn(),
      measure: jest.fn(),
      measureInWindow: jest.fn(),
      measureLayout: jest.fn(),
    };
    (findNodeHandle as jest.Mock).mockReturnValue(mockNodeHandle);

    const { result } = renderHook(() => useAccessibilityFocus());

    // Use Object.defineProperty to modify the readonly ref
    Object.defineProperty(result.current.ref, 'current', {
      value: mockElement,
      writable: true,
    });

    await act(async () => {
      result.current.setFocus();
    });

    expect(findNodeHandle).toHaveBeenCalledWith(mockElement);
    expect(AccessibilityInfo.setAccessibilityFocus).toHaveBeenCalledWith(mockNodeHandle);
  });

  it('does not set focus when ref is null', async () => {
    const { result } = renderHook(() => useAccessibilityFocus());

    await act(async () => {
      result.current.setFocus();
    });

    expect(findNodeHandle).not.toHaveBeenCalled();
    expect(AccessibilityInfo.setAccessibilityFocus).not.toHaveBeenCalled();
  });

  it('announces messages for accessibility', async () => {
    const { result } = renderHook(() => useAccessibilityFocus());
    const message = 'Test announcement';

    await act(async () => {
      result.current.announceForAccessibility(message);
    });

    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(message);
  });

  it('handles null node handle', async () => {
    const mockElement = {
      setNativeProps: jest.fn(),
      measure: jest.fn(),
      measureInWindow: jest.fn(),
      measureLayout: jest.fn(),
    };
    (findNodeHandle as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(() => useAccessibilityFocus());
    Object.defineProperty(result.current.ref, 'current', {
      value: mockElement,
      writable: true,
    });

    await act(async () => {
      result.current.setFocus();
    });

    expect(AccessibilityInfo.setAccessibilityFocus).not.toHaveBeenCalled();
  });
});
