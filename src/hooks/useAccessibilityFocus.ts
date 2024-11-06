import { useCallback, useRef } from 'react';
import { AccessibilityInfo, findNodeHandle } from 'react-native';

export function useAccessibilityFocus() {
  const ref = useRef(null);

  const setFocus = useCallback(() => {
    if (ref.current) {
      const nodeHandle = findNodeHandle(ref.current);
      if (nodeHandle) {
        AccessibilityInfo.setAccessibilityFocus(nodeHandle);
      }
    }
  }, []);

  const announceForAccessibility = useCallback((message: string) => {
    AccessibilityInfo.announceForAccessibility(message);
  }, []);

  return {
    ref,
    setFocus,
    announceForAccessibility,
  };
}
