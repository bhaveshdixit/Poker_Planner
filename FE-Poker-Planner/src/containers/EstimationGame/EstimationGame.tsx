import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import useWebSocket from 'react-use-websocket';

import { selectLoginState } from '@src/store';

import { BACKEND_URLS } from '@constants/apiEndPoints';
import { APP_ROUTES } from '@constants/appRoutes';
import { toastConfigs } from '@constants/toastConfig';

import { Button } from '@components';
import {
  EstimationJIRA,
  EstimationType,
  OnlineUser,
  PokerboardTicket,
  TicketHistory,
} from '@containers';
import styles from './EstimationGame.styles.module.scss';

export enum Roles {
  Manager = 'Manager',
  Participant = 'Participant',
  Spectator = 'Spectator',
}

export interface UserProps {
  userName: string;
  userRole: string;
  userId: number;
  hasEstimated: boolean;
  currentTicketEstimate: number | null;
}

export interface EstimatedTicketProps {
  ticketId: string;
  ticketSummary: string;
  ticketType: string;
  ticketEstimation: number;
  ticketFinalEstimate: string | null;
}

export interface TicketProps {
  summary: string;
  description: string | null;
  jira_ticket_id: string;
  ticket_type: string;
  estimate?: string;
}

export const EstimationGame = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { token } = selectLoginState();
  const [onlineUsersObject, setOnlineUsersObject] = useState<
    Record<string, UserProps>
  >({});
  const [estimationStarted, setEstimationStarted] = useState<boolean>(false);
  const [timerStarted, setTimerStarted] = useState<boolean>(false);
  const [timerEnded, setTimerEnded] = useState<boolean>(false);
  const [currentTicket, setCurrentTicket] = useState<TicketProps | null>(null);
  const [estimationTypeChoices, setEstimationTypeChoices] = useState<number[]>(
    []
  );
  const [userRole, setUserRole] = useState<string | null>(null);
  const [ticketArray, setTicketArray] = useState<EstimatedTicketProps[]>([]);
  const [estimated, setEstimated] = useState<boolean>(false);
  const [estimationTime, setEstimationTime] = useState<number>(10);
  const [currentTimeStamps, setCurrentTimeStamps] = useState<number | null>(
    null
  );
  const [userId, setUserId] = useState<string | null>(null);
  const [finalEstimatedTickets, setFinalEstimatedTickets] = useState<
    Record<string, string>
  >({});
  const [nextLoader, setNextLoader] = useState<boolean>(false);

  const handleCurrentUserEstimationStatus = (user_id: string) => {
    const currentUserHasEstimated = onlineUsersObject[user_id].hasEstimated;
    setEstimationStarted(currentUserHasEstimated);
    setEstimated(currentUserHasEstimated);
  };

  const resetUserEstimationStatus = () => {
    const user_ids = Object.keys(onlineUsersObject);
    user_ids.forEach((user_id) => {
      let onlineUsersObjectTemp = { ...onlineUsersObject };
      onlineUsersObjectTemp[user_id].hasEstimated = false;
      onlineUsersObjectTemp[user_id].currentTicketEstimate = null;
      setOnlineUsersObject(onlineUsersObjectTemp);
    });
  };

  const onTimerClickHandler = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setTimerEnded(false);
    setTimerStarted(true);
    setEstimationStarted(true);
    sendJsonMessage({
      msg: 'timer_started',
    });
  };

  const syncJiraHandle = (e: any) => {
    e.preventDefault();
    setNextLoader(true);
    sendJsonMessage({
      msg: 'final_estimate',

      estimate: e.target.elements.estimate.value,
      comment: e.target.elements.comment.value,
    });
  };

  const skipTicketHandler = (e: React.MouseEvent<HTMLElement>) => {
    sendJsonMessage({
      msg: 'skip_ticket',
    });
  };

  const { readyState, sendJsonMessage } = useWebSocket(
    `${BACKEND_URLS.SOCKET_CONNECT_BASE_URL}/${params.pokerboard_id}/user/${token}/`,
    {
      onOpen: () => {
        console.log('Connected!');
      },
      onClose: () => {
        console.log('Disconnected!');
      },
      onMessage: (event) => {
        const data = JSON.parse(event.data);

        switch (data.msg) {
          case 'onconnect_data': {
            setUserRole(data.user_role);
            setCurrentTicket(data.ticket);
            setEstimationTypeChoices(data.choices);
            setEstimationTime(data.time);
            setCurrentTimeStamps(
              data.currentTime !== null ? Math.floor(data.currentTime) : null
            );
            setTicketArray(
              data.tickets_estimated_history.map((ticket: TicketProps) => {
                return {
                  ticketId: ticket.jira_ticket_id,
                  ticketSummary: ticket.summary,
                  ticketType: ticket.ticket_type,
                  ticketEstimation: ticket.estimate,
                  ticketFinalEstimate: null,
                };
              })
            );
            setFinalEstimatedTickets(data.final_estimate_status);
            setUserId(data.user_id);
            break;
          }

          case 'add_user': {
            setOnlineUsersObject({
              ...onlineUsersObject,
              [data.user_id]: {
                userName: data.user_name,
                userRole: data.user_role,
                userId: data.user_id,
                hasEstimated: data.hasEstimated,
                currentTicketEstimate: data.currentTicketEstimate,
              },
            });
            break;
          }

          case 'remove_member': {
            setOnlineUsersObject((prevOnlineUser) => {
              const temp = { ...prevOnlineUser };
              delete temp[data.user_id];
              return temp;
            });
            break;
          }

          case 'add_ticket': {
            setTicketArray([
              ...ticketArray,
              {
                ticketId: data.jira_ticket_id,
                ticketSummary: data.summary,
                ticketType: data.ticket_type,
                ticketEstimation: data.estimate,
                ticketFinalEstimate: null,
              },
            ]);
            break;
          }

          case 'timer_started': {
            setEstimationStarted(true);
            setTimerStarted(true);
            break;
          }

          case 'timer_ended': {
            setTimerEnded(true);
            setCurrentTimeStamps(0);
            if (userRole !== Roles.Manager) {
              toast.success(
                'Your Estimation has been Succesfully Submitted!',
                toastConfigs
              );
            }
            break;
          }

          case 'estimation_status': {
            let onlineUsersObjectTemp = { ...onlineUsersObject };
            onlineUsersObjectTemp[data.user_id].hasEstimated = true;
            setOnlineUsersObject(onlineUsersObjectTemp);
            break;
          }

          case 'user_estimated_card': {
            onlineUsersObject[data.user_id].currentTicketEstimate =
              data.estimate;
            break;
          }

          case 'final_estimate': {
            let finalEstimateStatusTemp = { ...finalEstimatedTickets };
            finalEstimateStatusTemp[
              data.jira_ticket_id as keyof typeof finalEstimateStatusTemp
            ] = data.estimate;
            setFinalEstimatedTickets(finalEstimateStatusTemp);
            break;
          }

          case 'jira_final_estimate': {
            const response = data.response;
            toast.info(response.story_points, toastConfigs);
            toast.info(response.comment, toastConfigs);
            break;
          }

          case 'next_ticket':
            setNextLoader(false);
            setCurrentTicket(data.ticket);
            setTimerEnded(false);
            setTimerStarted(false);
            setEstimated(false);
            setEstimationStarted(false);
            setCurrentTimeStamps(null);
            resetUserEstimationStatus();
            break;

          case 'no_ticket_found': {
            setNextLoader(false);
            toast.info('Game Session Finished');
            if (userRole === Roles.Manager) {
              sendJsonMessage({
                msg: 'session_finished',
              });
            }
            navigate(`${APP_ROUTES.POKERBOARD}${params.pokerboard_id}`);
            break;
          }
        }
      },
    }
  );

  useEffect(() => {
    if (timerEnded) {
      setTimerStarted(false);
      sendJsonMessage({
        msg: 'timer_ended',
      });
    }
  }, [timerEnded]);

  useEffect(() => {
    if (currentTimeStamps === 0) {
      setTimerEnded(true);
    } else if (currentTimeStamps !== null) {
      setTimerStarted(true);
      setTimerEnded(false);
      setEstimationStarted(true);
    }
  }, [currentTimeStamps]);

  useEffect(() => {
    if (userId) {
      handleCurrentUserEstimationStatus(userId);
    }
  }, [userId]);

  useEffect(() => {
    let ticketsArrayCopy = [...ticketArray];
    ticketsArrayCopy.forEach((ticket, index) => {
      let currentTicketId = ticket.ticketId;
      if (currentTicketId in finalEstimatedTickets) {
        ticketsArrayCopy[index].ticketFinalEstimate =
          finalEstimatedTickets[currentTicketId];
      }
    });
    setTicketArray(ticketsArrayCopy);
  }, [finalEstimatedTickets]);

  return (
    <div className='d-flex justify-content-around my-3'>
      <OnlineUser
        currentTicketEstimationStarted={estimationStarted}
        currentUserRole={userRole}
        onlineUsers={onlineUsersObject}
      />
      <div
        className={`${styles.configure} d-flex flex-column justify-content-between align-items-center m-3`}
      >
        <div className='d-flex flex-column justify-content-around'>
          <PokerboardTicket
            currentUserRole={userRole}
            timerStarted={timerStarted}
            ticket={currentTicket}
          />
          <EstimationType
            estimationTime={currentTimeStamps ?? estimationTime}
            setCurrentTimeStamps={setCurrentTimeStamps}
            userRole={userRole}
            onTimerClickHandler={onTimerClickHandler}
            estimationTypeChoices={estimationTypeChoices}
            timerStarted={timerStarted}
            setTimerEndState={setTimerEnded}
            currentTicketEstimated={estimated}
            sendSocketMessage={sendJsonMessage}
            setEstimated={setEstimated}
          />
        </div>
        {userRole === Roles.Manager && !estimationStarted && (
          <div>
            <Button
              className='btn btn-primary btn-md'
              onClick={skipTicketHandler}
            >
              Skip
            </Button>
          </div>
        )}
        {timerEnded && userRole === Roles.Manager && (
          <EstimationJIRA
            onSubmitHandler={syncJiraHandle}
            nextLoader={nextLoader}
          />
        )}
      </div>
      <TicketHistory tickets={ticketArray} />
    </div>
  );
};
