const BACKEND_BASE_URL = 'http://localhost:8000/api';
const ACCOUNTS = '/accounts';
const TICKETS = '/tickets';
const POKERBOARDS = '/pokerboards';
const JIRA = '/jira';
const INVITATIONS = '/invitations';
const NOTIFICATIONS = '/notifications';
const GROUPS = '/groups';

export const BACKEND_URLS = {
  LOGIN: BACKEND_BASE_URL + ACCOUNTS + '/login/',
  LOGOUT: BACKEND_BASE_URL + ACCOUNTS + '/logout/',
  GET_CREATE_USER: BACKEND_BASE_URL + ACCOUNTS + '/user/',
  VERIFY_USER: BACKEND_BASE_URL + ACCOUNTS + '/verify/',
  RESET_PASSWORD_MAIL: BACKEND_BASE_URL + NOTIFICATIONS + '/forgotpassword/',
  RESET_PASSWORD: BACKEND_BASE_URL + ACCOUNTS + '/resetpassword/',
  GET_USER_BOARDS: BACKEND_BASE_URL + ACCOUNTS + '/pokerboards/',
  GET_USER_TICKETS: BACKEND_BASE_URL + ACCOUNTS + '/tickets/',
  GET_USER_GROUPS: BACKEND_BASE_URL + ACCOUNTS + '/groups/',
  SEARCH_USER: BACKEND_BASE_URL + ACCOUNTS + '/search/',
  POKERBOARDS: BACKEND_BASE_URL + POKERBOARDS + '/',
  FETCH_TICKETS: BACKEND_BASE_URL + TICKETS + '/fetch/',
  CREATE_TICKETS: BACKEND_BASE_URL + TICKETS + '/create/',
  CREATE_JIRA_USER: BACKEND_BASE_URL + JIRA + '/create/',
  LIST_INVITES: BACKEND_BASE_URL + INVITATIONS + '/invites/',
  UPDATE_INVITE_STATUS: BACKEND_BASE_URL + NOTIFICATIONS + '/invite/status/',
  GET_EMAIL_FOR_NOTIFICATION: BACKEND_BASE_URL + NOTIFICATIONS + '/getemail/',
  SET_BOARD_INVITES: BACKEND_BASE_URL + NOTIFICATIONS + '/invite/',
  GROUPS: BACKEND_BASE_URL + GROUPS + '/',
  SOCKET_CONNECT_BASE_URL: 'ws://127.0.0.1:8000/ws/estimation/pokerboard',
};
