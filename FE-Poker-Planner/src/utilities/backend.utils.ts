import { updateInvite } from '@services/backend';

export const updateInviteStatus = async (
  token: string,
  status: string,
  key: string
) => {
  const body: Record<string, string> = {
    key,
    status: status === 'accepted' ? '1' : '2',
  };
  return await updateInvite(token, body);
};
