import { useEffect, useRef, useState } from 'react';

import { faClock } from '@fortawesome/free-solid-svg-icons';

import { Button } from '@components';
import { Roles } from '@containers';

interface TimerProps {
  timeInSeconds: number;
  onTimerClick: React.MouseEventHandler<HTMLButtonElement>;
  timerDisabled: boolean;
  setTimerEndState: any;
  currentUserRole: string | null;
  currentTicketIsEstimated: boolean;
  setCurrentTimeStamps: any;
}

export const Timer = ({
  timeInSeconds,
  onTimerClick,
  timerDisabled,
  setTimerEndState,
  currentUserRole,
  currentTicketIsEstimated,
  setCurrentTimeStamps,
}: TimerProps) => {
  const [seconds, setSeconds] = useState<number>(timeInSeconds);
  const [started, setStarted] = useState<Boolean>(false);

  const initialRender = useRef(true);

  useEffect(() => {
    if (seconds === 0) {
      setCurrentTimeStamps(0);
      setTimerEndState(true);
      return;
    }
    if (initialRender.current) {
      initialRender.current = false;
    } else if (started) {
      const interval = setInterval(() => setSeconds(seconds - 1), 1000);
      setCurrentTimeStamps(seconds);
      return () => clearInterval(interval);
    }
  }, [seconds, started]);

  useEffect(() => {
    setStarted(timerDisabled);
  }, [timerDisabled]);

  useEffect(() => {
    setSeconds(timeInSeconds);
  }, [timeInSeconds]);

  return (
    <div className='d-flex flex-column justify-content-center align-items-center rounded'>
      <div className='mw-25 shadow m-2 p-3 py-1 rounded'>{seconds}</div>
      {currentUserRole === Roles.Manager && (
        <Button
          type='button'
          className='btn btn-secondary p-3 py-2'
          icon={faClock}
          onClick={onTimerClick}
          disabled={
            timerDisabled || currentTicketIsEstimated || timeInSeconds === 0
          }
        >
          Start
        </Button>
      )}
    </div>
  );
};
