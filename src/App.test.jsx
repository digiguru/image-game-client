import { render, screen, waitFor } from '@testing-library/react';
import { io } from 'socket.io-client';
import App from './App';

vi.mock('socket.io-client', () => ({ io: vi.fn() }));

function createSocketMock() {
  const listeners = new Map();
  return {
    listeners,
    emit: vi.fn(),
    on: vi.fn((event, handler) => listeners.set(event, handler)),
    off: vi.fn(),
    close: vi.fn(),
  };
}

describe('App', () => {
  let socket;

  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, '', '/?room=TEST123');
    socket = createSocketMock();
    io.mockReturnValue(socket);
  });

  test('renders the application heading', () => {
    render(<App />);
    expect(screen.getByRole('banner')).toHaveTextContent('AI Image Game');
  });

  test('joins the selected room and syncs state after connecting', async () => {
    render(<App />);
    await waitFor(() => expect(socket.listeners.has('connect')).toBe(true));

    socket.listeners.get('connect')();

    expect(socket.emit).toHaveBeenCalledWith('joinGame', { roomID: 'TEST123' });
    expect(socket.emit).toHaveBeenCalledWith('getGameState');
    expect(socket.emit).toHaveBeenCalledWith('getUsers');
  });

  test('closes the socket when unmounted', async () => {
    const { unmount } = render(<App />);
    await waitFor(() => expect(io).toHaveBeenCalledTimes(1));
    unmount();
    expect(socket.close).toHaveBeenCalledTimes(1);
  });
});
