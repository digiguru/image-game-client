import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Lobby } from './Lobby';
import { Ideation } from './Ideation';
import { Voting } from './Voting';
import { Results } from './Results';
import Host from './Host';

function socketMock() {
  const listeners = new Map();
  return {
    listeners,
    emit: vi.fn(),
    on: vi.fn((event, handler) => listeners.set(event, handler)),
    off: vi.fn(),
  };
}

const alice = {
  userID: 'alice',
  name: 'Alice',
  prompt: 'Alice robot',
  image: 'https://example.com/alice.png',
  time: 1,
  votes: ['bob'],
};
const bob = {
  userID: 'bob',
  name: 'Bob',
  prompt: 'Bob castle',
  image: 'https://example.com/bob.png',
  time: 2,
  votes: [],
};

test('lobby submits a player name and then shows the waiting state', async () => {
  const user = userEvent.setup();
  const handleAddUser = vi.fn();
  const { rerender } = render(<Lobby userName="" handleAddUser={handleAddUser} />);

  await user.type(screen.getByPlaceholderText('Type your name'), 'Alice{enter}');
  expect(handleAddUser).toHaveBeenCalledWith('Alice');

  rerender(<Lobby userName="Alice" handleAddUser={handleAddUser} />);
  expect(screen.getByRole('heading', { name: 'Thank you, Alice' })).toBeInTheDocument();
});

test('ideation submits a prompt and shows generated image progress', async () => {
  const user = userEvent.setup();
  const handleAddPrompt = vi.fn();
  const { rerender } = render(
    <Ideation userName="Alice" prompt="" users={[alice, bob]} handleAddPrompt={handleAddPrompt} image="" />,
  );

  await user.type(screen.getByPlaceholderText('Type your prompt'), 'A moon fox{enter}');
  expect(handleAddPrompt).toHaveBeenCalledWith('A moon fox');

  rerender(
    <Ideation
      userName="Alice"
      prompt="A moon fox"
      users={[{ ...alice, prompt: 'A moon fox' }, { ...bob, prompt: 'Bob castle' }]}
      handleAddPrompt={handleAddPrompt}
      image="https://example.com/moon-fox.png"
    />,
  );
  expect(screen.getByRole('img', { name: 'A moon fox' })).toBeInTheDocument();
  expect(screen.getByText(/Playes ready: 2 \/ 2/)).toBeInTheDocument();
});

test('voting emits votes for other players but not the current player', async () => {
  const user = userEvent.setup();
  const socket = socketMock();
  render(<Voting initialUsers={[alice, bob]} currentUserID="alice" socket={socket} />);

  await user.click(screen.getByRole('img', { name: 'Alice robot' }));
  expect(socket.emit).not.toHaveBeenCalledWith('vote', expect.anything());

  await user.click(screen.getByRole('img', { name: 'Bob castle' }));
  expect(socket.emit).toHaveBeenCalledWith('vote', { votedBy: 'alice', votedFor: 'bob' });

  await user.click(screen.getByRole('img', { name: 'Bob castle' }));
  expect(socket.emit).toHaveBeenCalledWith('unvote', { votedBy: 'alice', votedFor: 'bob' });
});

test('results render players in ascending vote order so the winner appears last', () => {
  render(<Results users={[alice, bob]} />);
  const items = screen.getAllByRole('listitem');

  expect(items[0]).toHaveTextContent('Bob');
  expect(items[1]).toHaveTextContent('Alice');
  expect(items[1]).toHaveTextContent('1 votes');
});

test('host controls emit game state, provider and reset actions for its room', async () => {
  const user = userEvent.setup();
  const socket = socketMock();
  render(<Host socket={socket} roomID="ROOM42" />);

  expect(screen.getByText('ROOM42')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Player join link' })).toHaveAttribute('href', expect.stringContaining('room=ROOM42'));

  await user.click(screen.getByRole('button', { name: 'IDEATION' }));
  expect(socket.emit).toHaveBeenCalledWith('setGameState', 'ideation');

  await user.click(screen.getByLabelText('Mock'));
  expect(socket.emit).toHaveBeenCalledWith('setGenerator', 'Mock');

  await user.click(screen.getByRole('button', { name: 'Reset Game' }));
  await user.click(screen.getByRole('button', { name: 'Really Reset This Game?' }));
  expect(socket.emit).toHaveBeenCalledWith('reset');
});
