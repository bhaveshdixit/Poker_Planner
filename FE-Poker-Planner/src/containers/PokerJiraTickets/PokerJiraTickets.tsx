import { useEffect, useRef, useState } from 'react';
import {
  useNavigate,
  useParams,
  useSearchParams,
  createSearchParams,
} from 'react-router-dom';
import { toast } from 'react-toastify';

import { selectLoginState } from '@src/store';

import { getTickets, saveTickets } from '@services/backend';
import { convertToJQL } from '@utilities/jira.utils';
import { APP_ROUTES } from '@constants/appRoutes';
import { toastConfigs } from '@constants/toastConfig';

import { Button, InputBox, Loader } from '@components';
import styles from './PokerJiraTickets.styles.module.scss';

export type TicketType = {
  summary: string;
  description: string | null;
  jira_ticket_id: string;
  ticket_type: number;
};

export const PokerJiraTickets = () => {
  const navigate = useNavigate();
  const params = useParams();
  const dragItem = useRef<any>();
  const dragOverItem = useRef<any>();
  const [importType, setImportType] = useState(-1);
  const [ticketIds, setTicketIds] = useState('');
  const [sprintId, setSprintId] = useState('');
  const [jqlQuery, setJqlQuery] = useState('');
  const [fetchedTickets, setFetchedTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(false);
  const [refresLoading, setRefershLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const { token } = selectLoginState();
  const [searchParams, setSearchParams] = useSearchParams();
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const dragStart = (
    e: React.DragEvent<HTMLDivElement>,
    position: number
  ): void => {
    dragItem.current = position;
  };

  const dragEnter = (
    e: React.DragEvent<HTMLDivElement>,
    position: number
  ): void => {
    dragOverItem.current = position;
  };

  const drop = (e: React.DragEvent<HTMLDivElement>): void => {
    const copyListItems = [...fetchedTickets];
    const dragItemContent = copyListItems[dragItem.current];
    copyListItems.splice(dragItem.current, 1);
    copyListItems.splice(dragOverItem.current, 0, dragItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setFetchedTickets(copyListItems);
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setFetchedTickets([]);
    let currentJQLQuery = jqlQuery;
    if (importType === 0) {
      currentJQLQuery = convertToJQL.idsToJQLQuery(ticketIds);
    } else if (importType === 1) {
      currentJQLQuery = convertToJQL.sprintToJQL(sprintId);
    }
    setSearchParams({ jql: currentJQLQuery });
    setJqlQuery(currentJQLQuery);
    setLoading(true);
    const response = await getTickets(currentJQLQuery, token);
    if (!response) {
      setLoading(false);
      setError('Import Failed');
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setError(undefined);
      }, 3500);
    } else if (response.status === 200) {
      setFetchedTickets(response.data);
    } else {
      setError(response.data.errorMessages[0]);
      clearTimeout(timer.current);
      setTimeout(() => {
        setError(undefined);
      }, 3500);
    }
    setLoading(false);
  };

  const getTicketDefualt = async () => {
    setFetchedTickets([]);
    let currentJQLQuery = jqlQuery;
    setJqlQuery(jqlQuery);
    setRefershLoading(true);
    const response = await getTickets(currentJQLQuery, token);
    if (response === undefined) {
      setRefershLoading(false);
      setError('Import Failed');
      setTimeout(() => {
        setError(undefined);
      }, 3500);
    } else if (response.status === 200) {
      createSearchParams({ jql: currentJQLQuery });
      setFetchedTickets(response.data);
    } else {
      setError('Misspelled the IDs or JQL');
      setTimeout(() => {
        setError(undefined);
      }, 3500);
    }
    setRefershLoading(false);
  };

  const moveNext = async () => {
    const currentBoardId = params.id;
    if (currentBoardId === undefined) return;
    const boardTickets = fetchedTickets.map((ticket, index) => ({
      ...ticket,
      index,
    }));
    const response = await saveTickets(boardTickets, token, currentBoardId);

    if (response.status === 201)
      navigate(APP_ROUTES.POKERBOARD + currentBoardId + '/invite');
    else {
      response.data.forEach((error: any) => {
        // eslint-disable-next-line no-prototype-builtins
        if (error.hasOwnProperty('non_field_errors'))
          toast.error(error.non_field_errors[0], toastConfigs);
      });
    }
  };

  const get_ticket_type = (typeChoiceNum: number) => {
    const typeChoice = ['Epic', 'Story', 'Task', 'Bug', 'Subtask'];
    return typeChoice[typeChoiceNum];
  };

  useEffect(() => {
    if (jqlQuery !== '') {
      getTicketDefualt();
    }
  }, [jqlQuery]);

  useEffect(() => {
    if (searchParams.get('jql') !== null) {
      setJqlQuery(searchParams.get('jql') as string);
    }
  }, []);

  return (
    <>
      {refresLoading ? (
        <div className='d-flex justify-content-center align-itemd-center w-100 h- mt-5'>
          <Loader />
        </div>
      ) : (
        <div
          className={`${styles.board__container} p-5 rounded bg-white shadow my-5`}
        >
          <h3 className='px-2 mb-5'>Import Tickets</h3>
          <div className='form-floating m-2'>
            <select
              className='form-select'
              required
              onChange={(e) => {
                setImportType(Number(e.target.value));
              }}
            >
              <option value='3'>Select import option</option>
              <option value='0'>Ticket IDs</option>
              <option value='1'>Sprint</option>
              <option value='2'>JQL</option>
            </select>
            <label>Import via</label>
          </div>
          {importType === 0 && (
            <form onSubmit={handleSubmit}>
              <label className='m-2 mb-1'>Import Via Ticket IDs</label>
              <div className='input-group'>
                <textarea
                  className='form-control m-2'
                  rows={2}
                  placeholder='Ticket IDs with comma sepration like 1000, 1002, 1003...'
                  name='ticket-ids'
                  onChange={(e) => setTicketIds(e.target.value)}
                  required
                />
              </div>
              <Button
                type='submit'
                className='btn btn-primary m-2'
                disabled={loading}
              >
                Import
              </Button>
              {loading && <Loader />}
            </form>
          )}
          {importType === 1 && (
            <form onSubmit={handleSubmit} className='mt-3'>
              <label className='m-2 mb-1'>Import Via Sprint</label>
              <div className='input-group'>
                <InputBox
                  className='form-control m-2'
                  placeholder='Sprint ID'
                  type='text'
                  required
                  onChange={(e) => setSprintId(e.target.value)}
                />
              </div>
              <Button
                type='submit'
                className='btn btn-primary m-2'
                disabled={loading}
              >
                Import
              </Button>
              {loading && <Loader />}
            </form>
          )}

          {importType === 2 && (
            <form onSubmit={handleSubmit} className='mt-3'>
              <label className='m-2 mb-1'>Import Via JQL</label>
              <div className='input-group'>
                <textarea
                  className='form-control m-2'
                  rows={3}
                  placeholder='Insert JQL Query here'
                  onChange={(e) => setJqlQuery(e.target.value)}
                  required
                />
              </div>
              <Button
                type='submit'
                className='btn btn-primary m-2'
                disabled={loading}
              >
                Import
              </Button>
              {loading && <Loader />}
            </form>
          )}
          {error && (
            <div className='d-flex justify-content-center mt-2'>
              <div
                className='alert mb-0 text-center alert-danger w-25'
                role='alert'
              >
                {error}
              </div>
            </div>
          )}

          {fetchedTickets.length > 0 && error === undefined && (
            <div className='m-2 mt-4 d-flex flex-column justify-content-center align-items-center'>
              <div className='container py-3 h-100'>
                <div className='row d-flex justify-content-center align-items-center h-100'>
                  <div className='col col-xl-10'>
                    {fetchedTickets?.map((ticket: TicketType, index) => (
                      <div
                        key={index}
                        className='card mb-3 border border-secondary rounded-4 shadow'
                      >
                        <div
                          className='card-body p-4 d-flex'
                          onDragStart={(e) => dragStart(e, index)}
                          onDragEnter={(e) => dragEnter(e, index)}
                          onDragEnd={drop}
                          draggable
                        >
                          <div className='w-50'>
                            <h3 className='mb-3'>
                              {ticket.jira_ticket_id}: {ticket.summary}
                            </h3>
                            <p className='small mb-0'>
                              <i className='far fa-star fa-lg'></i>
                              <span className='mx-2'>|</span> Type :
                              <strong>
                                {' '}
                                {get_ticket_type(ticket.ticket_type)}
                              </strong>
                            </p>
                          </div>
                          <div className='m-2 mx-5 w-50 d-flex justify-content-center align-items-center'>
                            <h6 className='card-subtitle align-middle text-center ms-2'>
                              {ticket.description === null
                                ? 'Not Assigned'
                                : ticket.description}
                            </h6>
                          </div>
                          <Button
                            type='button'
                            className='btn-close'
                            onClick={() => {
                              let arr = [...fetchedTickets];
                              arr.splice(index, 1);
                              setFetchedTickets(arr);
                            }}
                          ></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <Button
                onClick={moveNext}
                type='submit'
                className='btn px-3 btn-primary'
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
};
