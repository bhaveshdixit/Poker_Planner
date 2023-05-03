export interface TicketType {
  summary: string;
  description: string;
  jira_ticket_id: string;
  ticket_type_display: string;
  final_estimate: number;
}

interface TicketProps {
  ticket: TicketType;
  key: Number;
}

export const TicketCard = ({ ticket }: TicketProps) => {
  const {
    summary,
    description,
    jira_ticket_id,
    ticket_type_display,
    final_estimate,
  } = ticket;
  return (
    <div className='my-3 mt-4 card container-fluid shadow-sm'>
      <div className='row p-4'>
        <div className='col-lg-2 col-md-6'>
          <h5>Ticket ID</h5>
          <p className='mb-lg-0'>{jira_ticket_id}</p>
        </div>
        <div className='col-lg-3 col-md-6'>
          <h5>Summary</h5>
          <p className='mb-lg-0'>{summary}</p>
        </div>
        <div className='col-lg-3 col-md-6'>
          <h5>Description</h5>
          <p className='mb-lg-0'>{description || 'NA'}</p>
        </div>
        <div className='col-lg-2 col-md-6'>
          <h5>Ticket Type</h5>
          <p className='mb-lg-0'>{ticket_type_display}</p>
        </div>
        <div className='col-lg-2 col-md-6'>
          <h5>Final Estimate</h5>
          <p className='mb-lg-0'>{final_estimate || 'Not set yet'}</p>
        </div>
      </div>
    </div>
  );
};
