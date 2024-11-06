import { mockDeepLink } from './mockDeepLink';

// Create a mock for the event emitter
const mockEmit = jest.fn();
jest.mock('@react-navigation/native', () => ({
  EventEmitter: {
    emit: mockEmit,
  },
}));

describe('mockDeepLink', () => {
  beforeEach(() => {
    mockEmit.mockClear();
  });

  it('emits a url event with the correct URL format', async () => {
    const path = 'supplements/details/123';
    await mockDeepLink(path);

    expect(mockEmit).toHaveBeenCalledWith('url', {
      url: `fitfaster://${path}`,
    });
  });

  it('handles paths with query parameters', async () => {
    const path = 'supplements/search?category=protein&sort=name';
    await mockDeepLink(path);

    expect(mockEmit).toHaveBeenCalledWith('url', {
      url: `fitfaster://${path}`,
    });
  });

  it('handles paths with special characters', async () => {
    const path = 'workout/log/Push Day & Cardio';
    await mockDeepLink(path);

    expect(mockEmit).toHaveBeenCalledWith('url', {
      url: `fitfaster://${path}`,
    });
  });

  it('resolves after emitting the event', async () => {
    let resolved = false;

    const promise = mockDeepLink('home').then(() => {
      resolved = true;
    });

    expect(resolved).toBe(false);
    expect(mockEmit).toHaveBeenCalled();

    await promise;
    expect(resolved).toBe(true);
  });

  it('maintains the correct order of operations', async () => {
    const operations: string[] = [];

    const promise = mockDeepLink('test').then(() => {
      operations.push('promise resolved');
    });

    operations.push('event emitted');
    await promise;

    expect(operations).toEqual(['event emitted', 'promise resolved']);
  });
});
