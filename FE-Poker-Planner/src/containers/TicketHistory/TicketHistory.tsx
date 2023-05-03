import { useEffect, useState } from 'react';

import { type EstimatedTicketProps } from '@containers';
import styles from './TicketHistory.styles.module.scss';

interface TicketHistoryProps {
  tickets: EstimatedTicketProps[];
}

export const TicketHistory = ({ tickets }: TicketHistoryProps) => {
  const [currentTicketHistory, setCurrentTicketHistory] =
    useState<EstimatedTicketProps[]>(tickets);

  useEffect(() => {
    setCurrentTicketHistory(tickets);
  }, [tickets]);

  return (
    <ul className={`${styles.configure} list-group my-3`}>
      <li className='list-group-item active' aria-current='true'>
        Ticket estimation
      </li>
      {currentTicketHistory.map((ticket, index) => {
        return (
          <li className='list-group-item' key={index}>
            <div>
              <div className='d-flex m-2'>
                <strong className='h-100'>{ticket.ticketId}</strong>
                <div className='ms-auto h-100 badge bg-success'>
                  Your Estimate : {ticket.ticketEstimation}
                </div>
              </div>
              <div className='d-flex justify-content-between'>
                <div>
                  <div className='m-2'>
                    Type <strong> : {ticket.ticketType}</strong>
                  </div>
                  <div className='m-2'>
                    Summary <strong> : {ticket.ticketSummary}</strong>
                  </div>
                </div>
                {ticket.ticketFinalEstimate && (
                  <div className=' mt-auto m-2 h-100 badge bg-success'>
                    Final Estimate : {ticket.ticketFinalEstimate}
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
