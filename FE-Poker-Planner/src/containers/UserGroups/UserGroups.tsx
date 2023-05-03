import type { Group } from '@components';
import { GroupCard } from '@components';

interface UserGroupsProps {
  groups: Group[];
}

export const UserGroups = ({ groups }: UserGroupsProps) => {
  return (
    <>
      {groups.length ? (
        <div className='row'>
          {groups.map((group, index) => (
            <GroupCard group={group} key={index} />
          ))}
        </div>
      ) : (
        <div>
          <p className='m-0'>No Groups Joined</p>
        </div>
      )}
    </>
  );
};
