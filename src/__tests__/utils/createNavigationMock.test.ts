import { createNavigationMock, NavigationMock } from './createNavigationMock';

describe('createNavigationMock', () => {
  let navigation: NavigationMock;

  beforeEach(() => {
    navigation = createNavigationMock();
  });

  it('creates a mock navigation object with all required methods', () => {
    expect(navigation).toHaveProperty('navigate');
    expect(navigation).toHaveProperty('goBack');
    expect(navigation).toHaveProperty('dispatch');
    expect(navigation).toHaveProperty('setParams');
    expect(navigation).toHaveProperty('addListener');
    expect(navigation).toHaveProperty('removeListener');
    expect(navigation).toHaveProperty('reset');
    expect(navigation).toHaveProperty('isFocused');
    expect(navigation).toHaveProperty('canGoBack');
  });

  it('returns mock functions that can be called', () => {
    navigation.navigate('Home');
    expect(navigation.navigate).toHaveBeenCalledWith('Home');

    navigation.goBack();
    expect(navigation.goBack).toHaveBeenCalled();

    navigation.setParams({ id: '123' });
    expect(navigation.setParams).toHaveBeenCalledWith({ id: '123' });
  });

  it('provides default return values for specific methods', () => {
    expect(navigation.isFocused()).toBe(true);
    expect(navigation.canGoBack()).toBe(true);
  });

  it('allows mocking return values', () => {
    navigation.isFocused.mockReturnValueOnce(false);
    expect(navigation.isFocused()).toBe(false);

    navigation.canGoBack.mockReturnValueOnce(false);
    expect(navigation.canGoBack()).toBe(false);
  });

  it('handles navigation listeners correctly', () => {
    const listener = jest.fn();
    const unsubscribe = jest.fn();

    navigation.addListener.mockReturnValue(unsubscribe);

    const result = navigation.addListener('focus', listener);

    expect(navigation.addListener).toHaveBeenCalledWith('focus', listener);
    expect(result).toBe(unsubscribe);

    navigation.removeListener('focus', listener);
    expect(navigation.removeListener).toHaveBeenCalledWith('focus', listener);
  });

  it('handles navigation dispatch correctly', () => {
    const action = { type: 'NAVIGATE', payload: { name: 'Home' } };
    navigation.dispatch(action);
    expect(navigation.dispatch).toHaveBeenCalledWith(action);
  });

  it('handles navigation reset correctly', () => {
    const state = {
      index: 0,
      routes: [{ name: 'Home' }],
    };
    navigation.reset(state);
    expect(navigation.reset).toHaveBeenCalledWith(state);
  });
});
