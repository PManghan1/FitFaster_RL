import React, { useState, useCallback } from 'react';
import { ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import { Search, X } from 'react-native-feather';
import { useDebouncedCallback } from 'use-debounce';

const Container = styled.View`
  margin-vertical: 8px;
`;

const InputContainer = styled.View<{ isFocused: boolean }>`
  flex-direction: row;
  align-items: center;
  background-color: white;
  border-radius: 12px;
  padding: 12px;
  border-width: 1px;
  border-color: ${props => props.isFocused ? '#3B82F6' : '#E5E7EB'};
  shadow-color: #000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.05;
  shadow-radius: 2px;
  elevation: 2;
`;

const Input = styled.TextInput`
  flex: 1;
  font-size: 16px;
  color: #1F2937;
  margin-left: 8px;
  margin-right: 8px;
`;

const IconContainer = styled.View`
  width: 20px;
  height: 20px;
  justify-content: center;
  align-items: center;
`;

const ClearButton = styled.TouchableOpacity`
  padding: 4px;
`;

const ErrorText = styled.Text`
  color: #EF4444;
  font-size: 14px;
  margin-top: 4px;
`;

interface FoodSearchInputProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  error?: string | null;
  placeholder?: string;
  debounceMs?: number;
  testID?: string;
}

export const FoodSearchInput: React.FC<FoodSearchInputProps> = ({
  onSearch,
  isLoading = false,
  error = null,
  placeholder = 'Search for food...',
  debounceMs = 300,
  testID,
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const debouncedSearch = useDebouncedCallback(
    (searchQuery: string) => {
      if (searchQuery.trim()) {
        onSearch(searchQuery.trim());
      }
    },
    debounceMs
  );

  const handleChangeText = useCallback((text: string) => {
    setQuery(text);
    debouncedSearch(text);
  }, [debouncedSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    onSearch('');
  }, [onSearch]);

  return (
    <Container testID={testID}>
      <InputContainer isFocused={isFocused}>
        <IconContainer>
          <Search width={20} height={20} color="#6B7280" />
        </IconContainer>

        <Input
          value={query}
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          testID={`${testID}-input`}
        />

        {isLoading ? (
          <ActivityIndicator size="small" color="#3B82F6" />
        ) : query ? (
          <ClearButton
            onPress={handleClear}
            testID={`${testID}-clear`}
          >
            <X width={20} height={20} color="#6B7280" />
          </ClearButton>
        ) : null}
      </InputContainer>

      {error && (
        <ErrorText testID={`${testID}-error`}>
          {error}
        </ErrorText>
      )}
    </Container>
  );
};

// Preset configurations for different search contexts
export const SEARCH_PRESETS = {
  FOOD_DATABASE: {
    placeholder: 'Search food database...',
    debounceMs: 300,
  },
  MY_FOODS: {
    placeholder: 'Search my foods...',
    debounceMs: 200,
  },
  RECENT: {
    placeholder: 'Search recent entries...',
    debounceMs: 100,
  },
  FAVORITES: {
    placeholder: 'Search favorites...',
    debounceMs: 100,
  },
} as const;
