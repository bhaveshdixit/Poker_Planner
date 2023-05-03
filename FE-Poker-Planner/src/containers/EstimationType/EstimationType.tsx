import { useEffect, useState } from 'react';

import styles from '@containers/EstimationType/EstimationType.styles.module.scss';

import { Card, Timer } from '@components';
import { Roles } from '@containers';

interface EstimationTypeProps {
  onTimerClickHandler: React.MouseEventHandler<HTMLButtonElement>;
  estimationTypeChoices: number[];
  timerStarted: boolean;
  setTimerEndState: React.Dispatch<React.SetStateAction<boolean>>;
  userRole: string | null;
  currentTicketEstimated: boolean;
  estimationTime: number;
  setCurrentTimeStamps: React.Dispatch<React.SetStateAction<number | null>>;
  sendSocketMessage: any;
  setEstimated: React.Dispatch<React.SetStateAction<boolean>>;
}

export const EstimationType = ({
  onTimerClickHandler,
  estimationTypeChoices,
  timerStarted,
  setTimerEndState,
  userRole,
  currentTicketEstimated,
  estimationTime,
  setCurrentTimeStamps,
  sendSocketMessage,
  setEstimated,
}: EstimationTypeProps) => {
  const [choices, setChoices] = useState<number[]>([]);
  const [currentTicketIsEstimated, setCurrentTicketIsEstimated] =
    useState<boolean>(currentTicketEstimated);

  useEffect(() => {
    setChoices(estimationTypeChoices);
  }, [estimationTypeChoices]);

  useEffect(() => {
    setCurrentTicketIsEstimated(currentTicketEstimated);
  }, [currentTicketEstimated]);

  return (
    <div
      className={`${styles.configure} bg-white p-3 my-5 square centered rounded-3 shadow d-flex flex-column justify-content-around`}
    >
      <Timer
        currentUserRole={userRole}
        onTimerClick={onTimerClickHandler}
        timeInSeconds={estimationTime}
        timerDisabled={timerStarted}
        setTimerEndState={setTimerEndState}
        currentTicketIsEstimated={currentTicketEstimated}
        setCurrentTimeStamps={setCurrentTimeStamps}
      />

      {userRole !== Roles.Spectator && (
        <div>
          {timerStarted ? (
            <div className='d-flex justify-content-around mt-5'>
              {choices.map((choice, index) => {
                return (
                  <Card
                    cardValue={choice}
                    key={index}
                    onClick={() => {
                      sendSocketMessage({
                        msg: 'user_estimated',
                        estimate: choice,
                      });
                      setEstimated(true);
                    }}
                    disabled={currentTicketIsEstimated}
                  />
                );
              })}
            </div>
          ) : (
            <div className='d-flex justify-content-center m-5'>
              <h4> Estimation Choices will appear here</h4>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
