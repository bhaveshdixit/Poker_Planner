import { NavLink } from 'react-router-dom';

import { APP_ROUTES } from '@constants/appRoutes';

import styles from '@components/BoardCard/BoardCard.styles.module.scss';

export interface BoardType {
  id: number;
  name: string;
  description: string;
  manager_name: string;
  status: string;
}

interface BoardProps {
  board: BoardType;
  key: Number;
}

export const BoardCard = ({ board }: BoardProps) => {
  const getNavLink = (status: string) => {
    const navMap: Record<string, string> = {
      created: APP_ROUTES.POKERBOARD + board.id + '/tickets',
      'added tickets': APP_ROUTES.POKERBOARD + board.id + '/invite',
      finished: APP_ROUTES.POKERBOARD + board.id,
    };
    return navMap[status] ?? APP_ROUTES.ESTIMATION_GAME + board.id;
  };

  return (
    <NavLink className='text-decoration-none' to={getNavLink(board.status)}>
      <div
        className={`my-3 mt-4 card container-fluid shadow-sm ${styles['board--hover']}`}
      >
        <div className='row p-4'>
          <div className='col-lg-2 col-md-6'>
            <h5>Board</h5>
            <p className='mb-lg-0'>{board.name}</p>
          </div>
          <div className='col-lg-3 col-md-6'>
            <h5>Manager</h5>
            <p className='mb-lg-0'>{board.manager_name}</p>
          </div>
          <div className='col-lg-5 pe-5 col-md-6'>
            <h5>Description</h5>
            <p className='mb-lg-0 text-nowrap overflow-hidden text-truncate'>
              {board.description || 'NA'}
            </p>
          </div>
          <div className='col-lg-2 col-md-6'>
            <h5>Board Status</h5>
            <p className='mb-lg-0'>{board.status}</p>
          </div>
        </div>
      </div>
    </NavLink>
  );
};
