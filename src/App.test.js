import { render, screen, waitFor } from '@testing-library/react';
import io from 'socket.io-client';
import App from './App';

jest.mock('socket.io-client', () => ({
  __esModule: true,
  default: jest.fn()
}));

function createSocketMock() {
  return {
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    close: jest.fn()
  };
}

describe('App', () => {
  let socket;

  beforeEach(() => {
    socket = createSocketMock();
    io.mockReturnValue(socket);
  });

  test('renders the application heading', () => {
    render(<App />);

    expect(screen.getByRole('banner')).toHaveTextContent('AI Image Game');
  });

  test('requests the initial game state after connecting', async () => {
    render(<App />);

    await waitFor(() => {
      expect(socket.emit).toHaveBeenCalledWith('getGameState');
      expect(socket.emit).toHaveBeenCalledWith('getUsers');
    });
  });

  test('closes the socket when unmounted', async () => {
    const { unmount } = render(<App />);

    await waitFor(() => expect(io).toHaveBeenCalledTimes(1));
    unmount();

    expect(socket.close).toHaveBeenCalledTimes(1);
  });
});
