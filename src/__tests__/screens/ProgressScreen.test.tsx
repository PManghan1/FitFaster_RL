// Updated to add an empty line between import groups
import { render } from '@testing-library/react-native';

import ProgressScreen from '../../screens/ProgressScreen';

describe('ProgressScreen', () => {
  it('renders correctly', () => {
    const { getByText } = render(<ProgressScreen />);
    expect(getByText('Progress')).toBeTruthy();
  });
});
