import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import {
  type IconDefinition,
  faBarsProgress,
  faIndent,
  faList,
  faStopwatch,
  faUserTie,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { RootState, selectLoginState } from '@src/store';

import { getBoardDetails } from '@services/backend';
import { toastConfigs } from '@constants/toastConfig';

import { TicketCard, type TicketType } from '@components';

export interface BoardDetailsType {
  name: string;
  status: string;
  manager_name: string;
  description: string;
  estimation_time: number;
  estimation_type: string;
  tickets: TicketType[];
}

interface BoardDetailProps {
  label: string;
  text: string;
  icon: IconDefinition;
}

const BoardDetail = (props: BoardDetailProps) => {
  const { label, text, icon } = props;
  return (
    <div className='mt-3 col-lg-6'>
      <h6 className='text-secondary'>
        {label} <FontAwesomeIcon icon={icon} />
      </h6>
      <h5 className='text-justify'>{text}</h5>
    </div>
  );
};

export const PokerBoardDetails = () => {
  const [boardDetails, setBoardDetails] = useState<BoardDetailsType>({
    name: 'Board name',
    status: 'status',
    manager_name: 'manager name',
    description: 'Description of the board',
    estimation_time: 0,
    estimation_type: 'Estimation choice type',
    tickets: [],
  });
  const { token } = selectLoginState();
  const params = useParams();

  useEffect(() => {
    (async () => {
      const response = await getBoardDetails(token, Number(params.id) ?? 0);
      if (!response) toast.error('Internal Server Error', toastConfigs);
      else if (response.status === 404)
        toast.error('Board id incorrect', toastConfigs);
      else if (response.status === 200) setBoardDetails(response.data);
      else toast.error(response.data.detail, toastConfigs);
    })();
  }, []);
  1;

  return (
    <div>
      <div className='container bg-white rounded shadow p-5 mt-5'>
        <h2>Board Summary</h2>
        <div className='row'>
          <div className='col-lg-6'>
            <div className='card p-4 h-100'>
              <h4>{boardDetails.name}</h4>
              <hr className='mt-0' />
              <div className='row'>
                <BoardDetail
                  label='Manager'
                  icon={faUserTie}
                  text={boardDetails.manager_name}
                />
                <BoardDetail
                  label='Status'
                  icon={faBarsProgress}
                  text={boardDetails.status}
                />
                <BoardDetail
                  label='Estimation Time'
                  icon={faStopwatch}
                  text={`${boardDetails.estimation_time}s`}
                />
                <BoardDetail
                  label='Estimation Type'
                  icon={faList}
                  text={boardDetails.estimation_type}
                />
              </div>
            </div>
          </div>
          <div className='col-lg-6'>
            <div className='card p-4 h-100'>
              <h6 className='text-secondary'>
                Board Description <FontAwesomeIcon icon={faIndent} />
              </h6>
              <p className='mb-0'>{boardDetails.description}</p>
            </div>
          </div>
        </div>
      </div>
      <div className='container bg-white rounded shadow p-5 my-5'>
        <h2>Estimated Tickets</h2>
        <div className='card p-4'>
          {boardDetails.tickets.length ? (
            boardDetails.tickets.map((ticket, index) => (
              <TicketCard ticket={ticket} key={index} />
            ))
          ) : (
            <div>
              <p className='m-0'>No tickets are estimated on the board yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
