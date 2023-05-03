export const convertToJQL = {
  idsToJQLQuery: (ticketsStr: string) => `key in (${ticketsStr})`,
  sprintToJQL: (sprintId: string) => `Sprint=${sprintId}`,
};
