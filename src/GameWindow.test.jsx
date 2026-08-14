import { act, render, screen } from '@testing-library/react';
import GameWindow from './GameWindow';

function createSocketMock() {
  const listeners = new Map();

  return {
    listeners,
    emit: vi.fn(),
    on: vi.fn((event, handler) => {
      listeners.set(event, handler);
    }),
    off: vi.fn(),
  };
}

describe('GameWindow', () => {
  test('shows a visible connecting state before the server sends game state', () => {
    const socket = createSocketMock();

    render(<GameWindow socket={socket} roomID="TEST" />);

    expect(screen.getByRole('status')).toHaveTextContent('Connecting to the game server');
  });

  test('renders the lobby when the server announces lobby state', () => {
    const socket = createSocketMock();

    render(<GameWindow socket={socket} roomID="TEST" />);

    act(() => {
      socket.listeners.get('gameState')('lobby');
    });

    expect(screen.getByText('To get started, please enter your name.')).toBeInTheDocument();
  });

  test('shows unexpected server state instead of rendering a blank screen', () => {
    const socket = createSocketMock();

    render(<GameWindow socket={socket} roomID="TEST" />);

    act(() => {
      socket.listeners.get('gameState')('mystery-state');
    });

    expect(screen.getByRole('status')).toHaveTextContent('Unknown game state: mystery-state');
  });
});
