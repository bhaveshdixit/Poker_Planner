import { useRef } from 'react';

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { InvitationCard } from '@components';
import type { GroupType } from '@containers';

jest.mock('@assets/card_frame.png', () => '');

describe('rendering invitation card', () => {
  const InvitationConatiner = () => {
    const groupUsers = useRef<Set<GroupType>>(new Set());

    return (
      <InvitationCard
        name='testname'
        options={[{ id: '1', name: 'asc' }]}
        users={'testusers'}
        setUsers={() => {}}
        groupUsers={groupUsers}
        addUser={() => {}}
        removeUser={() => {}}
        selectedUsers={new Set()}
        selectChangeHandler={() => {}}
      />
    );
  };

  test('display heading', () => {
    render(<InvitationConatiner />);
    const heading = screen.getByRole('heading');
    expect(heading).toHaveTextContent('testname');
  });

  test('display group select', async () => {
    render(<InvitationConatiner />);
    expect(screen.getByText(/Select.../)).toBeVisible();
  });

  test('email input box', async () => {
    render(<InvitationConatiner />);
    const inputBox = screen.getByPlaceholderText(
      /example1@gmail.com, example2@gmail.com/
    );
    const button = screen.getByRole('button', { name: 'Add' });
    expect(inputBox).toHaveValue('testusers');
    expect(button).toBeVisible();
  });
});
