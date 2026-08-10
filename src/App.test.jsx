import { render, screen, waitFor } from '@testing-library/react';
import io from 'socket.io-client';
import App from './App';

vi.mock('socket.io-client', () => ({
  default: vi.fn(),
}));

function createSocketMock() {
  return {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    close: vi.fn(),
  };
}

describe('App', () => {
  let socket;

  beforeEach(() => {
    vi.clearAllMocks();
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
