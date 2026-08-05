import axios from '../interceptor/http-interceptor';
import { getSSOUrl } from '../utils/common';
import { PATH } from '../types/path';

export async function postVulnerabilityQuery(vulQuery) {
    return axios({
        url: getSSOUrl(PATH.VUL_ASSET_URL),
        method: 'post',
        data: vulQuery
    });
}

export async function getVulnerabilitiesQuery(params) {
    return axios({
        url: getSSOUrl(PATH.VUL_ASSET_URL),
        method: 'get',
        params: params
    });
}

export async function postCVEProfile(config) {
    return axios({
        url: getSSOUrl(PATH.CVE_PROFILE_ENTRY),
        method: 'post',
        data: config
    });
}

export async function getNodeBriefById(id) {
    return axios({
        url: getSSOUrl(PATH.NODES_URL),
        method: 'get',
        params: {
            id,
        }
    });
}

export async function getContainerBriefById(id) {
    return axios({
        url: getSSOUrl(PATH.PLAIN_CONTAINER_URL),
        method: 'get',
        params: {
            id,
        }
    });
}

export async function getDomains() {
    return axios({
        url: getSSOUrl(PATH.DOMAIN_URL),
        method: 'get'
    })
}

export async function patchAssetsViewData(queryId, lastModifiedTime) {
    return axios.patch(
        getSSOUrl(PATH.ASSETS_VULS_URL),
        { last_modified_timestamp: lastModifiedTime },
        {
            params: { queryId: queryId }
        }
    )
}