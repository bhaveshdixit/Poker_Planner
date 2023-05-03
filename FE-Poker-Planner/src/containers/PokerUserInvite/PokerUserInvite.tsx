import type { FormEvent, MutableRefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import type { ActionMeta, MultiValue } from 'react-select';
import { toast } from 'react-toastify';

import { APP_ROUTES } from '@src/constants/appRoutes';
import { RootState, selectLoginState } from '@src/store';

import { getGroups, sendInvites } from '@services/backend';
import { toastConfigs } from '@constants/toastConfig';

import { Button, InvitationCard } from '@components';
import style from './PokerUserInvite.styles.module.scss';
import { getUniqueMails } from './utils';

export interface GroupType {
  id: string;
  name: string;
}

export const PokerUserInvite = () => {
  const PARTICIPANTS = 0;
  const SPECTATORS = 1;

  const { token, email } = selectLoginState();
  const navigate = useNavigate();
  const params = useParams();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [groups, setGroups] = useState<GroupType[]>([]);
  const groupParticipants = useRef<Set<GroupType>>(new Set());
  const groupSpectators = useRef<Set<GroupType>>(new Set());
  const [participants, setParticipants] = useState<string>('');
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(
    new Set()
  );
  const [spectators, setSpectators] = useState<string>('');
  const [selectedSpectators, setSelectedSpectators] = useState<Set<string>>(
    new Set()
  );

  const sendInvitations = async () => {
    setLoading(true);
    let flag = true;
    let size = selectedParticipants.size + groupParticipants.current.size;
    if (size && params.id) {
      const body: { [key: string]: string | string[] | number | number[] } = {
        role: PARTICIPANTS,
        board_id: params.id,
      };
      if (selectedParticipants.size) body['emails'] = [...selectedParticipants];
      if (groupParticipants.current.size)
        body['groups'] = [...groupParticipants.current].map(
          (group) => group.id
        );
      const res = await sendInvites(token, body);
      if (!res || res.status !== 201) {
        toast.error(
          'Something went wrong while inviting participants',
          toastConfigs
        );
        flag = false;
      }
    }
    size = selectedSpectators.size + groupSpectators.current.size;
    if (selectedSpectators.size && params.id) {
      const body: { [key: string]: string | string[] | number | number[] } = {
        role: SPECTATORS,
        board_id: params.id,
      };
      if (selectedSpectators.size) body['emails'] = [...selectedSpectators];
      if (groupSpectators.current.size)
        body['groups'] = [...groupSpectators.current].map((group) => group.id);
      const res = await sendInvites(token, body);
      if (!res || res.status !== 201) {
        toast.error(
          'Something went wrong while inviting spectators',
          toastConfigs
        );
        flag = false;
      }
    }
    setLoading(false);
    if (flag) {
      toast.success('Invitations sent', toastConfigs);
      navigate(`${APP_ROUTES.ESTIMATION_GAME}${params.id}`);
    }
  };

  const fetchGroups = async () => {
    const response = await getGroups(token);
    if (response.status === 200) {
      setGroups(response.data);
    }
  };

  const addParticipants = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (participants) {
      const uniqueEmails = getUniqueMails(
        email,
        participants,
        selectedParticipants,
        selectedSpectators
      );
      setSelectedParticipants(
        (oldMails) => new Set([...oldMails, ...uniqueEmails])
      );
      setParticipants('');
    }
  };

  const removeParticipants = (email: string) => {
    setSelectedParticipants((prev) => {
      const temp = new Set(prev);
      temp.delete(email);
      return temp;
    });
  };

  const addSpectators = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (spectators) {
      const uniqueEmails = getUniqueMails(
        email,
        spectators,
        selectedParticipants,
        selectedSpectators
      );
      setSelectedSpectators(
        (oldMails) => new Set([...oldMails, ...uniqueEmails])
      );
      setSpectators('');
    }
  };

  const removeSpectators = (email: string) => {
    setSelectedSpectators((prev) => {
      const temp = new Set(prev);
      temp.delete(email);
      return temp;
    });
  };

  const selectChangeHandler = (
    newValue: MultiValue<GroupType>,
    actionMeta: ActionMeta<GroupType>,
    groupUsers: MutableRefObject<Set<GroupType>>
  ) => {
    if (actionMeta.action === 'select-option') {
      if (actionMeta.option) groupUsers.current.add(actionMeta.option);
      setGroups((groups) => {
        return groups.filter((group) => group.id !== actionMeta.option?.id);
      });
    } else if (
      (actionMeta.action === 'remove-value' ||
        actionMeta.action === 'pop-value') &&
      actionMeta.removedValue
    ) {
      groupUsers.current.delete(actionMeta.removedValue);

      setGroups((groups) => [...groups, actionMeta.removedValue]);
    } else if (actionMeta.action === 'clear') {
      groupUsers.current.clear();
      setGroups((groups) => [...groups, ...actionMeta.removedValues]);
    }
  };

  const totalInvites = () =>
    selectedParticipants.size +
    selectedSpectators.size +
    groupParticipants.current.size +
    groupSpectators.current.size;

  const moveNext = () => {
    if (totalInvites()) sendInvitations();
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div className='container bg-white p-5 my-5 rounded shadow'>
      <h3>Invite Users</h3>
      <div className='row mt-4'>
        <div className='col-lg-6 mt-3'>
          <InvitationCard
            name='Participants'
            users={participants}
            options={groups}
            groupUsers={groupParticipants}
            setUsers={setParticipants}
            addUser={addParticipants}
            removeUser={removeParticipants}
            selectedUsers={selectedParticipants}
            selectChangeHandler={selectChangeHandler}
          />
        </div>
        <div className='col-lg-6 mt-3'>
          <InvitationCard
            name='Spectators'
            users={spectators}
            options={groups}
            groupUsers={groupSpectators}
            setUsers={setSpectators}
            addUser={addSpectators}
            removeUser={removeSpectators}
            selectedUsers={selectedSpectators}
            selectChangeHandler={selectChangeHandler}
          />
        </div>
        <div className='d-flex mt-5'>
          {error && (
            <div className='alert alert-danger' role='alert'>
              {error}
            </div>
          )}
          <Button
            onClick={moveNext}
            disabled={loading || !totalInvites()}
            className={`btn btn-primary ms-auto btn-lg ${style['height-fir-content']}`}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
