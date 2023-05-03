import { useNavigate } from 'react-router-dom';

import { APP_ROUTES } from '@constants/appRoutes';

import { Button } from '@components';

export enum InviteStatusType {
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  INVITED = 'invited',
}

export interface InviteType {
  id: string;
  board: Record<string, string | number>;
  status: InviteStatusType;
  key: string;
}

export interface InviteProps {
  invite: InviteType;
  updateStatus: (id: string, status: InviteStatusType, key: string) => void;
}

export const Invite = (props: InviteProps) => {
  const { id, board, status, key } = props.invite;
  const { updateStatus } = props;
  const navigate = useNavigate();

  return (
    <div className='my-3 card container-fluid shadow-sm'>
      <div className='row py-3'>
        <div className='col-lg-3 col-md-6'>
          <h5>Board</h5>
          <p className='mb-lg-0'>{board.name}</p>
        </div>
        <div className='col-lg-3 col-md-6'>
          <h5>Manager</h5>
          <p className='mb-lg-0'>{board.manager_name}</p>
        </div>
        <div className='col-lg-3 col-md-6'>
          <h5>Board Status</h5>
          <p className='mb-lg-0'>{board.status}</p>
        </div>
        {status === InviteStatusType.INVITED ? (
          <div className='col-lg-3 pt-2 col-md-6'>
            <Button
              className='btn me-4 btn-success'
              onClick={() => updateStatus(id, InviteStatusType.ACCEPTED, key)}
            >
              Accept
            </Button>
            <Button
              className='btn btn-danger'
              onClick={() => updateStatus(id, InviteStatusType.REJECTED, key)}
            >
              Reject
            </Button>
          </div>
        ) : (
          <div className='col-lg-3 col-md-6'>
            {status === InviteStatusType.REJECTED ? (
              <div>
                <h5>Invitation Status</h5>
                <p className='mb-lg-0'>{status}</p>
              </div>
            ) : (
              <div>
                <Button
                  className='btn btn-primary'
                  onClick={() =>
                    navigate(`${APP_ROUTES.ESTIMATION_GAME}${board.id}`)
                  }
                >
                  Estimation
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
