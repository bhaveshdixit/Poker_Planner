import type {
  Dispatch,
  FormEvent,
  MutableRefObject,
  SetStateAction,
} from 'react';
import type { ActionMeta, MultiValue } from 'react-select';
import Select from 'react-select';

import { BadgeList, Button, InputBox } from '@components';
import type { GroupType } from '@containers';

export interface InvitationProps {
  name: string;
  options: GroupType[];
  users: string;
  setUsers: Dispatch<SetStateAction<string>>;
  groupUsers: MutableRefObject<Set<GroupType>>;
  addUser: (event: FormEvent<HTMLFormElement>) => void;
  removeUser: (email: string) => void;
  selectedUsers: Set<string>;
  selectChangeHandler: (
    newValue: MultiValue<GroupType>,
    actionMeta: ActionMeta<GroupType>,
    groupUsers: MutableRefObject<Set<GroupType>>
  ) => void;
}

export const InvitationCard = (props: InvitationProps) => {
  const {
    name,
    options,
    users,
    addUser,
    setUsers,
    groupUsers,
    removeUser,
    selectedUsers,
    selectChangeHandler,
  } = props;

  return (
    <div className='card p-4'>
      <h4 className='mb-4'>{name}</h4>
      <label className='mb-3'>Invite {name} via groups</label>
      <Select
        getOptionLabel={(option) => option.name}
        getOptionValue={(option) => option.id}
        options={options}
        onChange={(newValue, actionMeta) =>
          selectChangeHandler(newValue, actionMeta, groupUsers)
        }
        isMulti
      />
      <form onSubmit={addUser} className='form mt-5'>
        <label className='mb-3' htmlFor={name}>
          Invite {name} via email Ids
        </label>
        <div className='input-group' style={{ zIndex: 0 }}>
          <InputBox
            id={name}
            name={name}
            className='form-control'
            type='email'
            placeholder='example1@gmail.com, example2@gmail.com'
            value={users}
            onChange={(e) => setUsers(e.target.value)}
            multiple
          />
          <Button
            className='px-4 btn btn-primary fs-5'
            type='submit'
            disabled={!users.length}
          >
            Add
          </Button>
        </div>
        <small className='text-primary-emphasis'>
          Enter emails of {name} separated by comma(,)
        </small>
        <div className='fs-4 mt-4'>
          <BadgeList remove={removeUser} list={[...selectedUsers]} />
        </div>
      </form>
    </div>
  );
};
