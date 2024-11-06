import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text, View } from 'react-native';

describe('Testing Setup Verification', () => {
  it('renders components correctly', () => {
    const TestComponent = () => (
      <View>
        <Text>Testing setup works!</Text>
      </View>
    );

    render(<TestComponent />);
    expect(screen.getByText('Testing setup works!')).toBeTruthy();
  });
});
