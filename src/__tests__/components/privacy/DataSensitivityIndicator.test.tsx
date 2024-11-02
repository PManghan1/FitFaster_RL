// Updated to add an empty line between import groups
import { render } from '@testing-library/react-native';

import { DataSensitivityIndicator } from '../../../components/privacy/DataSensitivityIndicator';

describe('DataSensitivityIndicator', () => {
  it('renders correctly', () => {
    const { getByText } = render(<DataSensitivityIndicator level="high" dataType="personal" />);
    expect(getByText('Data Sensitivity')).toBeTruthy();
  });
});
