import { NV_CONST, nvVariables } from "../types/neuvector";
import dayjs from "dayjs";
import { SERVICE } from "@shell/config/types";
import { Store } from "vuex";
import axios from '../interceptor/http-interceptor'

const _keyStr: string =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

export function arrayToCsv(array: any, title: string = "") {
  let line: string = "";
  let result: string = "";
  let columns: string[] = [];
  if (title.length > 0) {
    result += title + "\r\n";
  }
  let i: number = 0;
  for (let key in array[0]) {
    let keyString = key + ",";
    columns[i] = key;
    line += keyString;
    i++;
  }

  line = line.slice(0, -1);
  result += line + "\r\n";

  for (let i = 0; i < array.length; i++) {
    let line = "";

    for (let j = 0; j < columns.length; j++) {
      let value = array[i][columns[j]];
      if (value === undefined || value === null) value = "";
      line += `"${value}"` + ",";
    }

    line = line.slice(0, -1);
    result += line + "\r\n";
  }
  return result;
}

export function getDisplayName(originalName: string) {
  if (originalName) {
    const kube = "k8s";
    let nameSec = originalName.split("_");
    if (nameSec[0] === kube) {
      return nameSec[2];
    } else {
      return originalName;
    }
  }
  return "";
}

export function isIpV4(str: string): boolean {
  let pattern = new RegExp(
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  );
  return pattern.test(str);
}

export function isIpV6(str: string): boolean {
  let pattern = new RegExp(
    /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/
  );
  return pattern.test(str);
}

export function getI18Name(name: any, store: any) {
  return store.getters["i18n/t"]("enum." + name.toUpperCase());
}

export function parseLocalDate(datetime: string) {
  return datetime.split("T")[0].replace(/-/g, "");
}

export function parseDatetimeStr(datetimeObj: any, pattern?: string) {
  return dayjs(datetimeObj).format(pattern ? pattern : "YYYYMMDDHHmmss");
}

export function getDateByInterval(
  base: string,
  interval: number,
  intervalUnit: dayjs.ManipulateType,
  pattern = "YYYYMMDDHHmmss"
) {
  // base format: "YYYYMMDDHHmmss"
  return dayjs(base).add(interval, intervalUnit).format(pattern);
}

export function getDuration(date1: string, date2: string) {
  //date format: "YYYYMMDD"
  let a = dayjs(
    `${date1.substring(0, 4)}-${date1.substring(4, 6)}-${date1.substring(6, 8)}`
  );
  let b = dayjs(
    `${date2.substring(0, 4)}-${date2.substring(4, 6)}-${date2.substring(6, 8)}`
  );
  return a.diff(b, "day");
}

export function groupBy(array: any, key: any) {
  return array.reduce(function (res: any, elem: any) {
    (res[elem[key]] = res[elem[key]] || []).push(elem);
    return res;
  }, {});
}

export function getSSOUrl(path: string) {
  return `/k8s/clusters/${nvVariables.currentCluster}/api/v1/namespaces/${nvVariables.ns}/services/https:${NV_CONST.NV_SERVICE}${NV_CONST.PROXY_VALUE}/${path}`;
}

export const debounced = (function (delay, fn) {
  let timerId: any;
  return function (delay: number, fn: Function, ...args: any[]) {
    if (timerId) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      fn(...args);
      timerId = null;
    }, delay);
  };
})();

export function toHex(number: number, length: number) {
  let s = number.toString(16).toUpperCase();
  while (s.length < length) {
    s = "0" + s;
  }
  return s;
}

export function toChar(number: number) {
  return number <= 32 ? " " : String.fromCharCode(number);
}

export function decode(input: string, arrayBuffer: ArrayBuffer | null = null) {
  //get last chars to see if are valid
  input = removePaddingChars(input);
  input = removePaddingChars(input);

  let bytes = (input.length / 4) * 3;

  let uarray;
  let chr1, chr2, chr3;
  let enc1, enc2, enc3, enc4;
  let i = 0;
  let j = 0;

  if (arrayBuffer) uarray = new Uint8Array(arrayBuffer);
  else uarray = new Uint8Array(bytes);

  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

  for (i = 0; i < bytes; i += 3) {
    //get the 3 octets in 4 ascii chars
    enc1 = _keyStr.indexOf(input.charAt(j++));
    enc2 = _keyStr.indexOf(input.charAt(j++));
    enc3 = _keyStr.indexOf(input.charAt(j++));
    enc4 = _keyStr.indexOf(input.charAt(j++));

    chr1 = (enc1 << 2) | (enc2 >> 4);
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    chr3 = ((enc3 & 3) << 6) | enc4;

    uarray[i] = chr1;
    if (enc3 !== 64) uarray[i + 1] = chr2;
    if (enc4 !== 64) uarray[i + 2] = chr3;
  }

  return uarray;
}

const removePaddingChars = (input: string) => {
  let lkey = _keyStr.indexOf(input.charAt(input.length - 1));
  if (lkey === 64) {
    return input.substring(0, input.length - 1);
  }
  return input;
};

export function capitalize(word: string | undefined) {
  return !!word
    ? `${word.charAt(0).toUpperCase()}${word.substring(1).toLowerCase()}`
    : "";
}

export function shortenString(str: string, limit: number) {
  if (str.length > limit) {
    return `${str.substring(0, limit - 3)}...${str.substring(
      str.length - 3,
      str.length
    )}`;
  }
  return str;
}

export function sortByDisplayName(a: any, b: any) {
  const name_a = a.display_name.toLowerCase();
  const name_b = b.display_name.toLowerCase();
  if (name_a === name_b) return 0;
  return name_a > name_b ? 1 : -1;
}

export function sortByOrder<T>(array: T[], order: string[]): T[] {
  return array.map((item: any) => {
    const sortedKeys = Object.keys(item).sort((a, b) => {
      const indexA = order.indexOf(a);
      const indexB = order.indexOf(b);

      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }

      if (indexA !== -1) {
        return -1;
      }

      if (indexB !== -1) {
        return 1;
      }

      return 0;
    });

    const sortedItem: any = {};
    sortedKeys.forEach((key) => {
      sortedItem[key] = item[key];
    });

    return sortedItem;
  });
}

export function setRisks(risks: any, workloadMap: any) {
  return risks.map((risk: any) => {
    if (risk.workloads.length || risk.images.length) {
      let domains = new Set(),
        services = new Set();
      if (risk.workloads.length) {
        risk.workloads.forEach((workload: any) => {
          const theWorkload = workloadMap.get(workload.id);
          if (theWorkload && theWorkload.domain) {
            domains.add(theWorkload.domain);
            workload.domain = theWorkload.domain;
          }
          if (theWorkload && theWorkload.service_group.substring(3)) {
            services.add(theWorkload.service_group.substring(3));
            workload.service = theWorkload.service_group.substring(3);
          }
          if (theWorkload && theWorkload.image) {
            workload.image = theWorkload.image;
          }
        });
      }
      if (risk.images.length) {
        risk.images.forEach((image: any) => {
          if (Array.isArray(image.domains) && image.domains.length > 0) {
            image.domains.forEach((domain: any) => domains.add(domain));
          }
        });
      }
      risk.domains = Array.from(domains);
      risk.services = Array.from(services);
      return risk;
    } else {
      risk.domains = [];
      risk.services = [];
      return risk;
    }
  });
}

export async function cacheNvNamespace(store: Store<any>) {
  let currentCluster = store.getters["currentCluster"];
  nvVariables.currentCluster = currentCluster.id;
  if (store.getters["cluster/canList"](SERVICE)) {
    let allServices = await store.dispatch(
      "cluster/findAll",
      { type: SERVICE },
      { root: true }
    );
    if (Array.isArray(allServices) && allServices.length) {
      nvVariables.ns = allServices.find((svc) =>
        svc?.id?.includes(NV_CONST.NV_SERVICE)
      ).metadata.namespace;
    }
  }
}

export function loadPagedData(
  url: string,
  params: any,
  arrayName: string,
  cb: Function,
  handleError: Function,
  finalize_cb: Function,
  options: any = {}
) {
  axios({
    url: getSSOUrl(url),
    method: 'get',
    params: params
  }).then(
    (res: any) => {
      let data = arrayName ? res.data[arrayName] : res.data;
      let length = arrayName ? data.length : data.length;
      cb(data, options);
      if (length === params.limit) {
        params.start += params.limit;
        loadPagedData(url, params, arrayName, cb, handleError, finalize_cb, options);
      } else {
        finalize_cb();
      }
    }
  ).catch(e => {
      handleError(e);
      finalize_cb();
  });
}
