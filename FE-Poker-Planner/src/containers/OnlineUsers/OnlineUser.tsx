import { useEffect, useState } from 'react';

import manager from '@assets/manager.webp';
import participant from '@assets/participant.webp';
import spectator from '@assets/spectator.jpeg';

import type { UserProps } from '@containers';
import { Roles } from '@containers';
import styles from './OnlineUser.styles.module.scss';

interface OnlineUserProps {
  onlineUsers: Record<string, UserProps>;
  currentUserRole: string | null;
  currentTicketEstimationStarted: boolean;
}

export const OnlineUser = ({
  onlineUsers,
  currentUserRole,
  currentTicketEstimationStarted,
}: OnlineUserProps) => {
  const [currentonlineUsers, setCurrentOnlineUsers] = useState<
    Record<string, UserProps>
  >({});
  const [estimationStarted, setEstimationStarted] = useState<boolean>(false);

  useEffect(() => {
    setEstimationStarted(currentTicketEstimationStarted);
  }, [currentTicketEstimationStarted]);

  useEffect(() => {
    setCurrentOnlineUsers(onlineUsers);
  }, [onlineUsers]);

  return (
    <ul className={`${styles.configure} list-group my-3`}>
      <li className='list-group-item active' aria-current='true'>
        Online User
      </li>

      {Object.values(currentonlineUsers).map((user) => {
        return (
          <li key={user.userId} className='list-group-item'>
            <div className='d-flex align-items-center m-2'>
              <div className={styles.img_configure}>
                <img
                  src={
                    user.userRole === Roles.Spectator
                      ? spectator
                      : user.userRole === Roles.Manager
                      ? manager
                      : participant
                  }
                  alt='spectator'
                  className='ms-0 w-100 h-100 rounded'
                />
              </div>

              <div
                className={`d-flex flex-column ms-3 ${styles.user_name_role_config}`}
              >
                <p
                  className={`my-0 ${
                    user.hasEstimated && estimationStarted ? 'text-success' : ''
                  }`}
                >
                  {user.userName}
                </p>
                <p className='my-0'>{user.userRole}</p>
                {currentUserRole === Roles.Manager && estimationStarted && (
                  <div>
                    <span className='my-0 badge bg-success'>
                      {user.currentTicketEstimate}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};
