// Previous imports...

jest.mock('@react-native-community/datetimepicker', () => {
  const MockDateTimePicker = ({
    onChange: _onChange,
  }: {
    onChange: (event: DateTimePickerEvent, date?: Date) => void;
  }) => {
    // Mock implementation...
    return null;
  };
  return MockDateTimePicker;
});

// Rest of the test file...
