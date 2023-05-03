import type { TicketType } from '@components';
import { TicketCard } from '@components';

export const UserTickets = ({ tickets }: { tickets: TicketType[] }) => {
  return (
    <>
      {tickets.length ? (
        tickets.map((ticket, index) => (
          <TicketCard ticket={ticket} key={index} />
        ))
      ) : (
        <div>
          <p className='m-0'>No Tickets Estimated</p>
        </div>
      )}
    </>
  );
};
