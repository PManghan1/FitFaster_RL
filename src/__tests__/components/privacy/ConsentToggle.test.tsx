// Updated to use named import for ConsentToggle
import { render } from '@testing-library/react-native';

import { ConsentToggle } from '../../../components/privacy/ConsentToggle';

describe('ConsentToggle', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <ConsentToggle
        title="Consent"
        description="Agree to terms"
        isEnabled={true}
        onToggle={jest.fn()}
      />,
    );
    expect(getByText('Consent')).toBeTruthy();
  });
});
