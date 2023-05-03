import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { selectLoginState } from '@src/store';

import { listInvites } from '@services/backend';
import { updateInviteStatus } from '@utilities/backend.utils';
import { toastConfigs } from '@constants/toastConfig';

import type { InviteStatusType, InviteType } from '@components';
import { Invite } from '@components';

export const PokerBoardIvites = () => {
  const [invites, setInvites] = useState<Record<string, InviteType>>({});
  const { token } = selectLoginState();

  const getInvites = async () => {
    const response = await listInvites(token);
    const newInvites: Record<string, InviteType> = {};
    response.data.map((invite: InviteType) => {
      newInvites[invite.id] = invite;
    });
    setInvites(newInvites);
  };

  const updateStatus = async (
    id: string,
    status: InviteStatusType,
    key: string
  ) => {
    const response = await updateInviteStatus(token, status, key);
    if (response.status === 200)
      setInvites((prevInvites) => {
        const newInvites = { ...prevInvites };
        newInvites[id] = { ...prevInvites[id], status };
        return newInvites;
      });
    else toast.error('Something went wrong! Try agian later', toastConfigs);
  };

  useEffect(() => {
    getInvites();
  }, []);

  useEffect(() => {
    console.log(invites);
  });

  return (
    <>
      {Object.keys(invites).length ? (
        Object.keys(invites).map((id: string) => (
          <Invite updateStatus={updateStatus} invite={invites[id]} key={id} />
        ))
      ) : (
        <div>
          <p className='m-0'>No Invitations Available</p>
        </div>
      )}
    </>
  );
};
