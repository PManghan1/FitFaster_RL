import React from 'react';

import { Text, TouchableOpacity, View } from '../components/styled';
import { useAuthStore } from '../store/auth.store';
import { hasEmail } from '../types/auth';

export const HomeScreen = () => {
  const { signOut, session } = useAuthStore();

  const userEmail =
    session?.user && hasEmail(session.user) ? session.user.email : 'No email available';

  return (
    <View style={{ flex: 1, backgroundColor: 'white', padding: 16 }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 16,
            color: '#2563EB',
          }}
        >
          Welcome to FitFaster
        </Text>

        <Text
          style={{
            fontSize: 16,
            color: '#4B5563',
            marginBottom: 8,
            textAlign: 'center',
          }}
        >
          Logged in as: {userEmail}
        </Text>

        {session?.user?.user_metadata?.full_name && (
          <Text
            style={{
              fontSize: 16,
              color: '#4B5563',
              marginBottom: 24,
              textAlign: 'center',
            }}
          >
            Name: {session.user.user_metadata.full_name}
          </Text>
        )}

        <TouchableOpacity
          style={{
            backgroundColor: '#EF4444',
            padding: 16,
            borderRadius: 8,
            marginTop: 24,
            width: '100%',
          }}
          onPress={signOut}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
