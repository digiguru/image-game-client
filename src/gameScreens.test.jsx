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

test('lobby exposes a labelled player form and submits a trimmed name', async () => {
  const user = userEvent.setup();
  const handleAddUser = vi.fn();
  const { rerender } = render(<Lobby userName="" handleAddUser={handleAddUser} />);

  const input = screen.getByRole('textbox', { name: 'Your name' });
  expect(input).toHaveAttribute('maxlength', '60');
  await user.type(input, '  Alice  ');
  await user.click(screen.getByRole('button', { name: 'Join game' }));
  expect(handleAddUser).toHaveBeenCalledWith('Alice');

  rerender(<Lobby userName="Alice" handleAddUser={handleAddUser} />);
  expect(screen.getByRole('heading', { name: 'Thank you, Alice' })).toBeInTheDocument();
});

test('ideation exposes a labelled prompt form and shows generated image progress', async () => {
  const user = userEvent.setup();
  const handleAddPrompt = vi.fn();
  const { rerender } = render(
    <Ideation userName="Alice" prompt="" users={[alice, bob]} handleAddPrompt={handleAddPrompt} image="" />,
  );

  const input = screen.getByRole('textbox', { name: 'Image prompt' });
  expect(input).toHaveAttribute('maxlength', '1000');
  await user.type(input, '  A moon fox  ');
  await user.click(screen.getByRole('button', { name: 'Create image' }));
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
  expect(screen.getByText(/Players ready: 2 \/ 2/)).toBeInTheDocument();
});

test('voting uses accessible buttons and blocks voting for your own image', async () => {
  const user = userEvent.setup();
  const socket = socketMock();
  render(<Voting initialUsers={[alice, bob]} currentUserID="alice" socket={socket} />);

  expect(screen.getByRole('button', { name: 'Your image: Alice robot' })).toBeDisabled();

  const voteButton = screen.getByRole('button', { name: 'Vote for Bob castle' });
  expect(voteButton).toHaveAttribute('aria-pressed', 'false');
  await user.click(voteButton);
  expect(socket.emit).toHaveBeenCalledWith('vote', { votedBy: 'alice', votedFor: 'bob' });

  const removeVoteButton = screen.getByRole('button', { name: 'Remove vote for Bob castle' });
  expect(removeVoteButton).toHaveAttribute('aria-pressed', 'true');
  await user.click(removeVoteButton);
  expect(socket.emit).toHaveBeenCalledWith('unvote', { votedBy: 'alice', votedFor: 'bob' });
});

test('results render players in ascending vote order so the winner appears last', () => {
  render(<Results users={[alice, bob]} />);
  const items = screen.getAllByRole('listitem');

  expect(items[0]).toHaveTextContent('Bob');
  expect(items[1]).toHaveTextContent('Alice');
  expect(items[1]).toHaveTextContent('1 votes');
});

test('host controls expose slug, phase state, provider selection and reset confirmation', async () => {
  const user = userEvent.setup();
  const socket = socketMock();
  render(<Host socket={socket} roomID="ROOM42" />);

  expect(screen.getByText('ROOM42')).toBeInTheDocument();
  expect(screen.getByText(/Create and switch games from the Image Game Server dashboard/)).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Create new room' })).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Player join link' })).toHaveAttribute('href', expect.stringContaining('room=ROOM42'));

  const lobbyButton = screen.getByRole('button', { name: 'LOBBY' });
  expect(lobbyButton).toHaveAttribute('aria-pressed', 'true');
  await user.click(screen.getByRole('button', { name: 'IDEATION' }));
  expect(socket.emit).toHaveBeenCalledWith('setGameState', 'ideation');

  await user.click(screen.getByLabelText('Mock'));
  expect(socket.emit).toHaveBeenCalledWith('setGenerator', 'Mock');

  await user.click(screen.getByRole('button', { name: 'Reset Game' }));
  expect(screen.getByRole('group', { name: 'Confirm game reset' })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Cancel reset' }));
  expect(screen.queryByRole('group', { name: 'Confirm game reset' })).not.toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Reset Game' }));
  await user.click(screen.getByRole('button', { name: 'Really Reset This Game?' }));
  expect(socket.emit).toHaveBeenCalledWith('reset');
});
