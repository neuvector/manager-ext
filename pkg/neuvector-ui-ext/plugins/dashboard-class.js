import axios from '../interceptor/http-interceptor';
import { getSSOUrl } from '../utils/common';
import { PATH } from '../types/path';

export async function getAuth() {
    return axios({
        url: getSSOUrl(PATH.LOGIN_URL),
        method: 'post',
        data: {
            username: '',
            password: '',
            isRancherSSOUrl: true
        }
    });
}

export async function getScoreInfo() {
    return axios({
        url: getSSOUrl(PATH.DASHBOARD_SCORES_URL),
        method: 'get',
        params: {
          isGlobalUser: true,
          domain: 'null'
        }
    });
}

export async function getNotifications() {
    return axios({
        url: getSSOUrl(PATH.DASHBOARD_NOTIFICATIONS_URL),
        method: 'get'
    });
}

export async function getDashboardDetails() {
    return axios({
        url: getSSOUrl(PATH.DASHBOARD_DETAILS_URL),
        method: 'get'
    });
}

export async function getSummary() {
    return axios({
        url: getSSOUrl(PATH.DASHBOARD_SUMMARY_URL),
        method: 'get'
    });
}

export async function getIpInfo(ipList) {
    return axios({
        url: getSSOUrl(PATH.IP_GEO_URL),
        method: 'patch',
        data: ipList
    });
}

export async function updateAutoScan(autoScan) {
    return axios({
        url: getSSOUrl(PATH.SCAN_CONFIG_URL),
        method: 'post',
        data: {config: {
            enable_auto_scan_host: autoScan,
            enable_auto_scan_workload: autoScan,
        }}
    });
}

