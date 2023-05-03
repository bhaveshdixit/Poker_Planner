import { toast } from 'react-toastify';

import { toastConfigs } from '@constants/toastConfig';

export const getUniqueMails = (
  owner: string,
  emailList: string,
  selectedParticipants: Set<string>,
  selectedSpectators: Set<string>
) => {
  let alreadyInvited = new Boolean(false);
  const uniqueMails = emailList.split(',').filter((mail) => {
    if (mail.toLowerCase() === owner) {
      toast.error('Cannot invite yourself', toastConfigs);
      return false;
    } else if (selectedParticipants.has(mail) || selectedSpectators.has(mail)) {
      alreadyInvited = true;
      return false;
    }
    return true;
  });
  if (alreadyInvited.valueOf())
    toast.error('One or more user were already invited', toastConfigs);
  return uniqueMails;
};
