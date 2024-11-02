import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { styled } from 'nativewind';
import { Feather } from '@expo/vector-icons';
import { syncService } from '../../services/sync';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

interface OfflineNoticeProps {
  onRetry?: () => void;
}

export const OfflineNotice: React.FC<OfflineNoticeProps> = ({ onRetry }) => {
  const [syncState, setSyncState] = React.useState(syncService.getState());
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    // Subscribe to sync state changes
    const unsubscribe = syncService.subscribe(state => {
      setSyncState(state);
    });

    // Slide in animation
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();

    return () => {
      unsubscribe();
    };
  }, [slideAnim]);

  const handleRetry = async () => {
    if (onRetry) {
      onRetry();
    } else {
      await syncService.sync();
    }
  };

  const AnimatedStyledView = Animated.createAnimatedComponent(StyledView);

  return (
    <AnimatedStyledView
      className="bg-error px-4 py-3 shadow-lg"
      style={{
        transform: [{ translateY: slideAnim }],
      }}
    >
      <StyledView className="flex-row items-center justify-between">
        <StyledView className="flex-row items-center flex-1">
          <Feather name="wifi-off" size={20} color="white" />
          <StyledView className="ml-2 flex-1">
            <StyledText className="text-white font-medium">You&apos;re offline</StyledText>
            {syncState.pendingActions > 0 && (
              <StyledText className="text-white text-sm opacity-80">
                {syncState.pendingActions} {syncState.pendingActions === 1 ? 'change' : 'changes'}{' '}
                pending sync
              </StyledText>
            )}
          </StyledView>
        </StyledView>

        {syncState.pendingActions > 0 && (
          <StyledTouchableOpacity
            className="bg-white/20 rounded-lg px-3 py-1.5 ml-2"
            onPress={handleRetry}
          >
            <StyledView className="flex-row items-center">
              <Feather name="refresh-cw" size={16} color="white" />
              <StyledText className="text-white ml-1 font-medium">Retry</StyledText>
            </StyledView>
          </StyledTouchableOpacity>
        )}
      </StyledView>

      {syncState.isSyncing && (
        <StyledView className="mt-1">
          <StyledText className="text-white text-sm opacity-80">Syncing changes...</StyledText>
        </StyledView>
      )}

      {syncState.lastSyncTime && !syncState.isSyncing && syncState.pendingActions === 0 && (
        <StyledView className="mt-1">
          <StyledText className="text-white text-sm opacity-80">
            Last synced: {new Date(syncState.lastSyncTime).toLocaleTimeString()}
          </StyledText>
        </StyledView>
      )}
    </AnimatedStyledView>
  );
};
