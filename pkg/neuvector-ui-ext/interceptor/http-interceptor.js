import axios from 'axios';
import { NV_CONST } from '../types/neuvector';
import { getAuth } from '../plugins/neuvector-class';

const instance = axios.create({
  baseURL: '',
  timeout: 0, // Request timeout in milliseconds
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let count = 0;

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    // Add custom logic before sending the request
    // console.log('Request Interceptor:', config);
    count++;
    let authToken = sessionStorage.getItem('nv_token');
    if (authToken) {
      config.headers
      .set(NV_CONST.LOCAL_STORAGE_TOKEN, authToken)
      .set('Cache-Control', 'no-cache')
      .set('Pragma', 'no-cache');
    }
    return config;
  },
  (error) => {
    // Handle request errors
    console.error('Request Error Interceptor:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => {
    // Add custom logic to handle the response
    // console.log('Response Interceptor:', response);
    return response;
  },
  async (error) => {
    // Handle response errors
    console.error('Response Error Interceptor:', error);
    const originalRequest = error.config;
    if (
      error.response.status === NV_CONST.STATUS_AUTH_TIMEOUT ||
      error.response.status ===  NV_CONST.STATUS_UNAUTH ||
      (error.response.status === NV_CONST.STATUS_BAD_REQUEST && error.response.data === NV_CONST.TOKEN_REQUESTED_ERROR_MSG)
    ) {
      if (count < 3) {
        try {
          await sleep(1000);
          let authRes = await getAuth();  // Assume this refreshes the auth token
          sessionStorage.setItem('nv_token', authRes.data.token.token);
          originalRequest.headers.set(NV_CONST.LOCAL_STORAGE_TOKEN, authRes.data.token.token)
          .set('Cache-Control', 'no-cache')
          .set('Pragma', 'no-cache');
          return axios(originalRequest);
        } catch (authError) {
          // Handle the error in re-authentication
          console.error('Authentication failed:', authError);
          return Promise.reject(authError);
        }
      } else {
        count = 0;
        return Promise.reject(error);
      }
    } else {
      return Promise.reject(error);
    }
  }
);

export default instance;