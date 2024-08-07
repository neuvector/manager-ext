import axios from 'axios';
import { NV_CONST } from '../types/neuvector';
import { getAuth } from '../plugins/neuvector-class';

const instance = axios.create({
  baseURL: '',
  timeout: 0, // Request timeout in milliseconds
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    // Add custom logic before sending the request
    // console.log('Request Interceptor:', config);
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
    if (
      error.response.status === NV_CONST.STATUS_AUTH_TIMEOUT ||
      error.response.status ===  NV_CONST.STATUS_UNAUTH
    ) {
      return getAuth().then(
        response => {
          return response;
        } 
      ).catch(
        error => {
          return Promise.reject(error);
        }
      )
    } else {
      return Promise.reject(error);
    }
  }
);

export default instance;