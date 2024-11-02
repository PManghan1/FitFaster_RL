// Updated to explicitly type the ui parameter
import { render } from '@testing-library/react-native';

export const renderWithProviders = (ui: React.ReactElement, { ...renderOptions } = {}) => {
  return render(ui, { ...renderOptions });
};
