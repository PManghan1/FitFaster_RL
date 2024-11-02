import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '../store/auth.store';
import { hasEmail } from '../types/auth';
import { styled } from 'nativewind';

// Style the components with NativeWind
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

export const HomeScreen = () => {
  const { signOut, session } = useAuthStore();

  const userEmail =
    session?.user && hasEmail(session.user) ? session.user.email : 'No email available';

  return (
    <StyledView className="flex-1 bg-white p-4">
      <StyledView className="flex-1 justify-center items-center">
        <StyledText className="text-2xl font-bold mb-4 text-primary">
          Welcome to FitFaster
        </StyledText>

        <StyledText className="text-base text-secondary mb-2 text-center">
          Logged in as: {userEmail}
        </StyledText>

        {session?.user?.user_metadata?.full_name && (
          <StyledText className="text-base text-secondary mb-6 text-center">
            Name: {session.user.user_metadata.full_name}
          </StyledText>
        )}

        <StyledTouchableOpacity
          className="bg-error px-4 py-4 rounded-lg mt-6 w-full"
          onPress={signOut}
        >
          <StyledText className="text-white text-center text-lg font-bold">Sign Out</StyledText>
        </StyledTouchableOpacity>
      </StyledView>
    </StyledView>
  );
};
