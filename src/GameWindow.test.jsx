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
  afterEach(() => {
    delete document.startViewTransition;
    delete document.documentElement.dataset.gameTransitionDirection;
    delete document.documentElement.dataset.gameState;
  });

  test('shows a visible connecting state before the server sends game state', () => {
    const socket = createSocketMock();

    render(<GameWindow socket={socket} roomID="TEST" />);

    expect(screen.getByRole('status')).toHaveTextContent('Connecting to the game server');
  });

  test('renders the lobby as the current game state card and shared page theme', () => {
    const socket = createSocketMock();

    render(<GameWindow socket={socket} roomID="TEST" />);

    act(() => {
      socket.listeners.get('gameState')('lobby');
    });

    expect(screen.getByText('To get started, please enter your name.')).toBeInTheDocument();
    expect(screen.getByTestId('game-state-card')).toHaveClass('game-state-card-lobby');
    expect(screen.getByLabelText('Game room TEST')).toHaveAttribute('data-game-state', 'lobby');
    expect(document.documentElement).toHaveAttribute('data-game-state', 'lobby');
  });

  test('animates right and updates the shared theme when the server advances right', () => {
    const socket = createSocketMock();
    const startViewTransition = vi.fn((update) => {
      update();
      return {};
    });
    document.startViewTransition = startViewTransition;

    render(<GameWindow socket={socket} roomID="TEST" />);

    act(() => {
      socket.listeners.get('gameState')('lobby');
    });
    act(() => {
      socket.listeners.get('gameState')('ideation');
    });

    expect(startViewTransition).toHaveBeenCalledTimes(1);
    expect(document.documentElement).toHaveAttribute('data-game-transition-direction', 'right');
    expect(document.documentElement).toHaveAttribute('data-game-state', 'ideation');
    expect(screen.getByTestId('game-state-card')).toHaveClass('game-state-card-ideation');
    expect(screen.getByLabelText('Game room TEST')).toHaveAttribute('data-game-state', 'ideation');
  });

  test('animates left and updates the shared theme when the server moves back left', () => {
    const socket = createSocketMock();
    const startViewTransition = vi.fn((update) => {
      update();
      return {};
    });
    document.startViewTransition = startViewTransition;

    render(<GameWindow socket={socket} roomID="TEST" />);

    act(() => {
      socket.listeners.get('gameState')('voting');
    });
    act(() => {
      socket.listeners.get('gameState')('ideation');
    });

    expect(startViewTransition).toHaveBeenCalledTimes(1);
    expect(document.documentElement).toHaveAttribute('data-game-transition-direction', 'left');
    expect(document.documentElement).toHaveAttribute('data-game-state', 'ideation');
    expect(screen.getByTestId('game-state-card')).toHaveClass('game-state-card-ideation');
    expect(screen.getByLabelText('Game room TEST')).toHaveAttribute('data-game-state', 'ideation');
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
