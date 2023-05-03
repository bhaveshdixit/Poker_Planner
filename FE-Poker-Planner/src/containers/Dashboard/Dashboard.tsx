import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { selectLoginState } from '@src/store';

import { listBoards, listGroups, listTickets } from '@services/backend';
import { updateInviteStatus } from '@utilities/backend.utils';
import { APP_ROUTES } from '@constants/appRoutes';

import {
  type BoardType,
  Button,
  type Group,
  type TicketType,
  type UserProfileProps,
  InviteStatusType,
} from '@components';
import { Loader, UserProfile } from '@components';
import {
  UserGroups,
  UserPokerBoards,
  PokerBoardIvites,
  UserTickets,
} from '@containers';
import styles from './Dashboard.styles.module.scss';

export const Dashboard = () => {
  const { token, first_name, last_name, email } = selectLoginState();
  const params = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserProfileProps>();
  const [error, setError] = useState<string>();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [boards, setBoards] = useState<BoardType[]>([]);
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  const tabs = [
    { id: 0, name: 'Poker Boards' },
    { id: 1, name: 'Tickets Estimated' },
    { id: 2, name: 'Groups' },
    { id: 3, name: 'Invitations' },
  ];

  const getBoards = async () => {
    const response = await listBoards(token);
    setBoards(response.data);
  };

  const getTickets = async () => {
    const response = await listTickets(token);
    setTickets(response.data);
  };

  const getGroups = async () => {
    const response = await listGroups(token);
    setGroups(response.data);
  };

  const getUserDetail = () => {
    const newUser: UserProfileProps = {
      firstName: first_name,
      lastName: last_name,
      email,
    };
    setUser(newUser);
    setError('');
  };

  const handleInvites = async () => {
    if (params?.key) {
      const { data, status } = await updateInviteStatus(
        token,
        InviteStatusType.ACCEPTED,
        params.key
      );
      if (status === 200) {
        navigate(`${APP_ROUTES.ESTIMATION_GAME}${data.board_id}/`);
      } else {
        navigate(APP_ROUTES.HOME);
      }
    }
  };

  useEffect(() => {
    handleInvites();
    getUserDetail();
    getBoards();
    getTickets();
    getGroups();
  }, []);

  const ProfileSection = () => {
    if (error)
      return (
        <h2 className='p-5 bg-white text-center fs-4 text-danger'>{error}</h2>
      );
    if (!user)
      return (
        <h2 className='p-5 bg-white text-center fs-4'>
          <Loader />
        </h2>
      );
    else return <UserProfile {...user} />;
  };

  return (
    <div className='container py-5'>
      <ProfileSection />
      <div className='card p-3 shadow container-fluid shadow-sm'>
        <ul className='nav nav-tabs'>
          {tabs.map((tab) => (
            <li key={tab.id} className={`${styles['nav-tab']} nav-item`}>
              <Button
                onClick={() => setActiveTab(tab.id)}
                className={`nav-link ${activeTab === tab.id && 'active'}`}
              >
                {tab.name}
              </Button>
            </li>
          ))}
        </ul>
        {activeTab === 0 && (
          <div className='border border-top-0 p-5'>
            <UserPokerBoards boards={boards} />
          </div>
        )}
        {activeTab === 1 && (
          <div className='border border-top-0 p-5'>
            <UserTickets tickets={tickets} />
          </div>
        )}
        {activeTab === 2 && (
          <div className='border border-top-0 p-5'>
            <UserGroups groups={groups} />
          </div>
        )}
        <div className={activeTab !== 3 ? 'd-none' : ''}>
          <div className='border border-top-0 p-5'>
            <PokerBoardIvites />
          </div>
        </div>
      </div>
    </div>
  );
};
