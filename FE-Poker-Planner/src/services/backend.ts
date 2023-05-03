import ApiRequest from '@services/common';
import { BACKEND_URLS } from '@constants/apiEndPoints';

export const getUser = async (token: string) => {
  const url = BACKEND_URLS.GET_CREATE_USER;
  const headers = { Authorization: `Token ${token}` };
  const response = await ApiRequest.getRequest({ url, headers });
  return response;
};

export const signUp = async (body: Record<string, string> | undefined) => {
  const url = BACKEND_URLS.GET_CREATE_USER;
  const response = await ApiRequest.postRequest({ url, body });
  return response;
};

export const login = async (body: Record<string, string> | undefined) => {
  const url = BACKEND_URLS.LOGIN;
  const response = await ApiRequest.postRequest({ url, body });
  return response;
};

export const logout = async (token: string) => {
  const url = BACKEND_URLS.LOGOUT;
  const headers = { Authorization: `Token ${token}` };
  const response = await ApiRequest.deleteRequest({ url, headers });
  return response;
};

export const createPokerBoard = async (
  body: Record<string, string> | undefined,
  token: string
) => {
  const url = BACKEND_URLS.POKERBOARDS;
  const headers = { Authorization: `Token ${token}` };
  const response = await ApiRequest.postRequest({ url, body, headers });
  return response;
};

export const getTickets = async (jqlQuery: string, token: string) => {
  const url = BACKEND_URLS.FETCH_TICKETS;
  const headers = { Authorization: `Token ${token}` };
  const body = {
    jql: jqlQuery,
  };
  const response = await ApiRequest.postRequest({ url, body, headers });
  return response;
};

export const createJiraUser = async (
  token: string,
  body: Record<string, string> | undefined
) => {
  const url = BACKEND_URLS.CREATE_JIRA_USER;
  const headers = { Authorization: `Token ${token}` };
  const response = await ApiRequest.postRequest({ url, body, headers });
  return response;
};

export const listInvites = async (token: string) => {
  const url = BACKEND_URLS.LIST_INVITES;
  const headers = { Authorization: `Token ${token}` };
  const response = await ApiRequest.getRequest({ url, headers });
  return response;
};

export const updateInvite = async (
  token: string,
  body: Record<string, string>
) => {
  const url = BACKEND_URLS.UPDATE_INVITE_STATUS;
  const headers = { Authorization: `Token ${token}` };
  const response = await ApiRequest.patchRequest({ url, body, headers });
  return response;
};

export const getEmailForNotification = async (key: string) => {
  const url = BACKEND_URLS.GET_EMAIL_FOR_NOTIFICATION + key;
  const response = await ApiRequest.getRequest({ url });
  return response;
};

export const sendInvites = async (
  token: string,
  body: { [key: string]: string | number | string[] | number[] }
) => {
  const url = BACKEND_URLS.SET_BOARD_INVITES;
  const headers = { Authorization: `Token ${token}` };
  const response = await ApiRequest.postRequest({ url, body, headers });
  return response;
};

export const searchUsers = async (token: string, searchQuery: string) => {
  const url = BACKEND_URLS.SEARCH_USER + `?search=${searchQuery}`;
  const headers = { Authorization: `Token ${token}` };
  const response = await ApiRequest.getRequest({ url, headers });
  return response;
};

export const sendResetPasswordMail = async (body: {
  [key: string]: string;
}) => {
  const url = BACKEND_URLS.RESET_PASSWORD_MAIL;
  const response = await ApiRequest.postRequest({ url, body });
  return response;
};

export const resetPassword = async (body: Record<string, string>) => {
  const url = BACKEND_URLS.RESET_PASSWORD;
  const response = await ApiRequest.postRequest({ url, body });
  return response;
};

export const verifyUser = async (body: { token_key: string }) => {
  const url = BACKEND_URLS.VERIFY_USER;
  const response = await ApiRequest.patchRequest({ url, body });
  return response;
};

export const createGroup = async (
  token: string,
  body: Record<string, string | number[]>
) => {
  const url = BACKEND_URLS.GROUPS;
  const headers = { Authorization: `Token ${token}` };
  const response = await ApiRequest.postRequest({ url, body, headers });
  return response;
};

export const saveTickets = async (
  body: any[],
  token: string,
  boardId: string
) => {
  const url = BACKEND_URLS.CREATE_TICKETS + boardId + '/';
  const headers = { Authorization: `Token ${token}` };
  const response = await ApiRequest.postRequest({ url, body, headers });
  return response;
};

export const resetPasswordAccessible = async (key: string) => {
  const url = BACKEND_URLS.RESET_PASSWORD + key + '/';
  const response = await ApiRequest.getRequest({ url });
  return response;
};

export const listBoards = async (token: string) => {
  const url = BACKEND_URLS.GET_USER_BOARDS;
  const headers = { Authorization: `Token ${token}` };
  const response = await ApiRequest.getRequest({ url, headers });
  return response;
};

export const listTickets = async (token: string) => {
  const url = BACKEND_URLS.GET_USER_TICKETS;
  const headers = { Authorization: `Token ${token}` };
  const response = await ApiRequest.getRequest({ url, headers });
  return response;
};

export const listGroups = async (token: string) => {
  const url = BACKEND_URLS.GET_USER_GROUPS;
  const headers = { Authorization: `Token ${token}` };
  const response = await ApiRequest.getRequest({ url, headers });
  return response;
};

export const getGroups = async (token: string) => {
  const url = BACKEND_URLS.GROUPS;
  const headers = { Authorization: `Token ${token}` };
  const response = await ApiRequest.getRequest({ url, headers });
  return response;
};

export const getBoardDetails = async (token: string, id: number) => {
  const url = BACKEND_URLS.POKERBOARDS + id;
  const headers = { Authorization: `Token ${token}` };
  const response = await ApiRequest.getRequest({ url, headers });
  return response;
};
