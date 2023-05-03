import axios from 'axios';

interface RequestParameters {
  url: string;
  headers?: Record<string, string>;
  body?: any;
}

const getRequest = async ({
  url,
  headers,
}: RequestParameters): Promise<any> => {
  try {
    return await axios.get(url, { headers });
  } catch (error: any) {
    return error.response;
  }
};

const postRequest = async ({
  url,
  body,
  headers,
}: RequestParameters): Promise<any> => {
  try {
    return await axios.post(url, body, { headers });
  } catch (error: any) {
    return error.response;
  }
};

const patchRequest = async ({
  url,
  body,
  headers,
}: RequestParameters): Promise<any> => {
  try {
    return await axios.patch(url, body, { headers });
  } catch (error: any) {
    return error.response;
  }
};

const deleteRequest = async ({
  url,
  headers,
}: RequestParameters): Promise<any> => {
  try {
    return await axios.delete(url, { headers });
  } catch (error: any) {
    return error.response;
  }
};

const ApiRequest = {
  getRequest,
  postRequest,
  patchRequest,
  deleteRequest,
};

export default ApiRequest;
