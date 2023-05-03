import type { FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { ActionMeta, InputActionMeta, MultiValue } from 'react-select';
import Select from 'react-select';
import { toast } from 'react-toastify';

import { APP_ROUTES } from '@src/constants/appRoutes';
import { selectLoginState } from '@src/store';

import { createGroup, searchUsers } from '@services/backend';
import { CONSTANTS } from '@constants/constants';

import { Button, InputBox } from '@components';

interface UserType {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface OptionType {
  label: string;
  value: number;
}

export const CreateGroup = () => {
  const { token } = selectLoginState();
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const selectedIds = useRef(new Set<number>());
  const groupName = useRef('');
  const [users, setUsers] = useState<OptionType[]>([]);
  const navigate = useNavigate();

  const selectHandleChange = (
    newValue: MultiValue<OptionType>,
    actionMeta: ActionMeta<OptionType>
  ) => {
    if (actionMeta.action === 'select-option') {
      setUsers([]);
      if (actionMeta.option?.value)
        selectedIds.current.add(actionMeta.option.value);
    } else if (
      actionMeta.action === 'remove-value' ||
      actionMeta.action === 'pop-value'
    ) {
      selectedIds.current.delete(actionMeta.removedValue.value);
    } else if (actionMeta.action === 'clear') {
      selectedIds.current.clear();
    }
  };

  const searchUser = (newValue: string, actionMeta: InputActionMeta) => {
    if (actionMeta.action === 'input-change') {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        searchUsers(token, newValue).then((response) => {
          const options = response.data.map((user: UserType) => ({
            label: `${user.first_name} ${user.last_name} (${user.email})`,
            value: user.id,
          }));
          setUsers(options);
        });
      }, 500);
    }
  };

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = {
      name: groupName.current,
      members: [...selectedIds.current],
    };
    const response = await createGroup(token, body);
    if (response && response.status === 201) {
      toast.success('Group created', {
        theme: 'dark',
        autoClose: 3000,
      });
      navigate(APP_ROUTES.HOME);
    } else {
      const message = response
        ? response.data.message[0]
        : 'Somethin went wrong! Try again later';

      toast.error(message, {
        theme: 'dark',
        autoClose: 3000,
      });
    }
  };

  useEffect(() => {
    return () => clearTimeout(timer.current);
  });

  return (
    <div className='w-50 bg-white container shadow mt-5 p-5 rounded'>
      <h2 className='mb-5'>Create Group</h2>
      <form onSubmit={submitForm} className='form'>
        <div className='mb-3'>
          <label htmlFor='gname' className='form-label'>
            Group Name
          </label>
          <InputBox
            type='text'
            className='form-control mb-3'
            id='gname'
            placeholder='Ex: Poker squad'
            name='gname'
            maxLength={CONSTANTS.GROUP_NAME_MAX_LENGTH}
            required
            onChange={(e) => (groupName.current = e.target.value)}
          />
        </div>
        <div className='mb-3'>
          <label htmlFor='users' className='form-label'>
            Search and select users
          </label>
          <Select
            id='users'
            name='users'
            className='mb-3'
            placeholder='Ex: John Doe'
            options={users}
            isMulti
            required
            onChange={selectHandleChange}
            onInputChange={searchUser}
          />
        </div>
        <Button type='submit' className='my-4 btn btn-primary'>
          Create
        </Button>
      </form>
    </div>
  );
};
