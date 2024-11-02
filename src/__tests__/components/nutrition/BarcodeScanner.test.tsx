// Updated to use default import for BarcodeScanner
import { render } from '@testing-library/react-native';

import BarcodeScanner from '../../../components/nutrition/BarcodeScanner';

describe('BarcodeScanner', () => {
  it('renders correctly', () => {
    const onScanSuccess = jest.fn();
    const { getByText } = render(<BarcodeScanner onScanSuccess={onScanSuccess} />);
    expect(getByText('Scan Barcode')).toBeTruthy();
  });
});
