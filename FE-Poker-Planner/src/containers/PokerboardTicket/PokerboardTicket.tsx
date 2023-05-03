import { type TicketProps } from '@containers';
import { Roles } from '@containers';
import styles from './PokerboardTicket.styles.module.scss';

interface PokerboardTicketProps {
  ticket: TicketProps | null;
  timerStarted: boolean;
  currentUserRole: string | null;
}

export const PokerboardTicket = ({
  ticket,
  timerStarted,
  currentUserRole,
}: PokerboardTicketProps) => (
  <div>
    {(currentUserRole === Roles.Participant ||
      currentUserRole === Roles.Spectator) &&
    !timerStarted ? (
      <div
        className={`${styles.configure} mw-75 m-3 mt-1 mx-auto square centered d-flex flex-column align-items-center`}
      >
        <h4 className='m-2 mb-5'> Sample Ticket </h4>
        <div className='card mb-3 border border-secondary rounded-4 shadow'>
          <div className='card-body p-4 d-flex'>
            <div className='w-50'>
              <h5 className='mb-3'>Ticket ID : Ticket Summary</h5>
              <p className='small mb-0'>
                <i className='far fa-star fa-lg'></i>
                <span className='mx-2'>|</span> Type :
                <strong>Ticket Type</strong>
              </p>
            </div>
            <div className='m-2 mx-5 w-50 d-flex justify-content-center align-items-center'>
              <h6 className='card-subtitle align-middle text-center ms-2'>
                Description of Ticket
              </h6>
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div>
        {(currentUserRole === 'Manager' ||
          ((currentUserRole === Roles.Participant ||
            currentUserRole === Roles.Spectator) &&
            timerStarted)) && (
          <div
            className={`${styles.configure} mw-75 my-3 mx-auto square centered d-flex flex-column align-items-center`}
          >
            <h4 className='m-2 mb-5'> Ongoing Ticket </h4>
            <div className='card mb-3 border border-secondary rounded-4 shadow'>
              <div className='card-body p-4 d-flex'>
                <div className='w-50'>
                  <h5 className='mb-3'>
                    {ticket ? ticket.jira_ticket_id : 'Ticket ID'} :
                    {ticket ? ticket.summary : 'Ticket Summary'}
                  </h5>
                  <p className='small mb-0'>
                    <i className='far fa-star fa-lg'></i>
                    <span className='mx-2'>|</span> Type :
                    <strong>
                      {ticket ? ticket.ticket_type : 'Ticket Type'}
                    </strong>
                  </p>
                </div>
                <div className='m-2 mx-5 w-50 d-flex justify-content-center align-items-center'>
                  <h6 className='card-subtitle align-middle text-center ms-2'>
                    {ticket
                      ? ticket.description ??
                        'No Description has been set on this ticket'
                      : 'Dwscription of Ticket'}
                  </h6>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )}
  </div>
);
