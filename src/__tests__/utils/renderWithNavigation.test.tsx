import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { useNavigation, ParamListBase } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { renderWithNavigation } from './renderWithNavigation';

// Test component that uses navigation
const TestComponent = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  return (
    <TouchableOpacity onPress={() => navigation.navigate('Home')}>
      <Text>Navigate to Home</Text>
    </TouchableOpacity>
  );
};

// Simple text component
const SimpleComponent = () => <Text>Hello World</Text>;

describe('renderWithNavigation', () => {
  it('renders a component successfully', () => {
    const { getByText } = renderWithNavigation(<SimpleComponent />);
    expect(getByText('Hello World')).toBeTruthy();
  });

  it('provides navigation context to the rendered component', () => {
    const { getByText } = renderWithNavigation(<TestComponent />);
    expect(getByText('Navigate to Home')).toBeTruthy();
  });

  it('returns all standard render API methods', () => {
    const result = renderWithNavigation(<SimpleComponent />);

    // Verify essential render API methods are present
    expect(result).toHaveProperty('getByText');
    expect(result).toHaveProperty('queryByText');
    expect(result).toHaveProperty('findByText');
    expect(result).toHaveProperty('getAllByText');
    expect(result).toHaveProperty('queryAllByText');
    expect(result).toHaveProperty('findAllByText');
    expect(result).toHaveProperty('rerender');
    expect(result).toHaveProperty('unmount');
    expect(result).toHaveProperty('toJSON');
  });

  it('allows component updates through rerender', () => {
    const { getByText, rerender } = renderWithNavigation(<Text>Initial</Text>);
    expect(getByText('Initial')).toBeTruthy();

    rerender(<Text>Updated</Text>);
    expect(getByText('Updated')).toBeTruthy();
  });

  it('properly unmounts components', () => {
    const { unmount, queryByText } = renderWithNavigation(<SimpleComponent />);
    expect(queryByText('Hello World')).toBeTruthy();

    unmount();
    expect(queryByText('Hello World')).toBeNull();
  });
});
