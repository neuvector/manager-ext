import { NV_MAP } from "../types/neuvector";
import dayjs from "dayjs";

export function getCsvData(vulnerabilityList: any) {
  console.log("DOWNLOAD CSV");
  let vulnerabilities4Csv: any[] = [];

  const listAssets = (entryData: any) => {
    let imageList = entryData.images
      ? entryData.images.map((image: any) => image.display_name)
      : [];
    let workloadList = entryData.workloads
      ? entryData.workloads.map((workload: any) => workload.display_name)
      : [];
    let serviceList = entryData.services || [];
    let domainList = entryData.domains || [];
    let nodeList = entryData.nodes
      ? entryData.nodes.map((node: any) => node.display_name)
      : [];
    let platformList = entryData.platforms
      ? entryData.platforms.map((platform: any) => platform.display_name)
      : [];
    let pv2fvList = Object.entries(entryData.packages).map(([k, v]) => {
      return `${k}:(${(v as any).reduce(
        (acc: any, curr: any) =>
          acc +
          curr.package_version +
          " -> " +
          (curr.fixed_version || "N/A") +
          " ",
        ""
      )})`;
    });
    let maxRow4Entry = Math.max(
      imageList?.length || 0,
      workloadList?.length || 0,
      serviceList?.length || 0,
      domainList?.length || 0,
      nodeList?.length || 0,
      platformList?.length || 0,
      pv2fvList.length || 0
    );
    maxRow4Entry = maxRow4Entry === 0 ? 1 : maxRow4Entry;
    let rows: any = [];
    for (let i = 0; i < maxRow4Entry; i++) {
      rows.push({
        name: i === 0 ? entryData.name : "",
        link: i === 0 ? entryData.link : "",
        severity: i === 0 ? entryData.severity : "",
        score: i === 0 ? entryData.score : "",
        score_v3: i === 0 ? entryData.score_v3 : "",
        vectors: i === 0 ? entryData.vectors : "",
        vectors_v3: i === 0 ? entryData.vectors_v3 : "",
        description: i === 0 ? entryData.description : "",
        platforms: i > platformList.length - 1 ? "" : platformList[i],
        nodes: i > (nodeList?.length || 0) - 1 ? "" : nodeList[i],
        domains: i > (domainList?.length || 0) - 1 ? "" : domainList[i],
        services: i > (serviceList?.length || 0) - 1 ? "" : serviceList[i],
        workloads: i > (workloadList?.length || 0) - 1 ? "" : workloadList[i],
        images: i > (imageList?.length || 0) - 1 ? "" : imageList[i],
        "package_versions->fixed_version":
          i > (pv2fvList?.length || 0) - 1 ? "" : pv2fvList[i],
        last_modified_datetime:
          i === 0
            ? dayjs
                .unix(entryData.last_modified_timestamp)
                .format("MMM DD, YYYY HH:mm:ss")
            : "",
        published_datetime:
          i === 0
            ? dayjs
                .unix(entryData.published_timestamp)
                .format("MMM DD, YYYY HH:mm:ss")
            : "",
      });
    }
    return rows;
  };

  const resolveExcelCellLimit = function (entryData: any) {
    let maxLen = Math.max(
      entryData.images ? entryData.images.length : 0,
      entryData.workloads ? entryData.workloads.length : 0,
      entryData.services ? entryData.services.length : 0,
      entryData.domains ? entryData.domains.length : 0,
      entryData["package_versions->fixed_version"]
        ? entryData["package_versions->fixed_version"].length
        : 0
    );
    let maxRow4Entry = Math.ceil(maxLen / NV_MAP.EXCEL_CELL_LIMIT);
    maxRow4Entry = maxRow4Entry === 0 ? 1 : maxRow4Entry;
    let rows: any = [];
    for (let i = 0; i < maxRow4Entry; i++) {
      rows.push({
        name: i === 0 ? entryData.name : "",
        link: i === 0 ? entryData.link : "",
        severity: i === 0 ? entryData.severity : "",
        score: i === 0 ? entryData.score : "",
        score_v3: i === 0 ? entryData.score_v3 : "",
        vectors: i === 0 ? entryData.vectors : "",
        vectors_v3: i === 0 ? entryData.vectors_v3 : "",
        description: i === 0 ? entryData.description : "",
        platforms: i === 0 ? entryData.platforms : "",
        nodes: i === 0 ? entryData.nodes || "" : "",
        domains: entryData.domains
          ? entryData.domains.length > NV_MAP.EXCEL_CELL_LIMIT * (i + 1)
            ? entryData.domains.substring(
                NV_MAP.EXCEL_CELL_LIMIT * i,
                NV_MAP.EXCEL_CELL_LIMIT * (i + 1)
              )
            : entryData.domains.substring(NV_MAP.EXCEL_CELL_LIMIT * i)
          : "",
        services: entryData.services
          ? entryData.services.length > NV_MAP.EXCEL_CELL_LIMIT * (i + 1)
            ? entryData.services.substring(
                NV_MAP.EXCEL_CELL_LIMIT * i,
                NV_MAP.EXCEL_CELL_LIMIT * (i + 1)
              )
            : entryData.services.substring(NV_MAP.EXCEL_CELL_LIMIT * i)
          : "",
        workloads: entryData.workloads
          ? entryData.workloads.length > NV_MAP.EXCEL_CELL_LIMIT * (i + 1)
            ? entryData.workloads.substring(
                NV_MAP.EXCEL_CELL_LIMIT * i,
                NV_MAP.EXCEL_CELL_LIMIT * (i + 1)
              )
            : entryData.workloads.substring(NV_MAP.EXCEL_CELL_LIMIT * i)
          : "",
        images: entryData.images
          ? entryData.images.length > NV_MAP.EXCEL_CELL_LIMIT * (i + 1)
            ? entryData.images.substring(
                NV_MAP.EXCEL_CELL_LIMIT * i,
                NV_MAP.EXCEL_CELL_LIMIT * (i + 1)
              )
            : entryData.images.substring(NV_MAP.EXCEL_CELL_LIMIT * i)
          : "",
        "package_versions->fixed_version": entryData[
          "package_versions->fixed_version"
        ]
          ? entryData["package_versions->fixed_version"].length >
            NV_MAP.EXCEL_CELL_LIMIT * (i + 1)
            ? entryData["package_versions->fixed_version"].substring(
                NV_MAP.EXCEL_CELL_LIMIT * i,
                NV_MAP.EXCEL_CELL_LIMIT * (i + 1)
              )
            : entryData["package_versions->fixed_version"].substring(
                NV_MAP.EXCEL_CELL_LIMIT * i
              )
          : "",
        last_modified_datetime: i === 0 ? entryData.last_modified_datetime : "",
        published_datetime: i === 0 ? entryData.published_datetime : "",
      });
    }
    return rows;
  };

  if (typeof vulnerabilityList === "object") {
    if (Array.isArray(vulnerabilityList)) {
      if (vulnerabilityList && vulnerabilityList.length > 0) {
        vulnerabilityList.forEach((cve) => {
          let entryData = prepareEntryData(
            JSON.parse(JSON.stringify(cve)),
            "vulnerability_view"
          );
          vulnerabilities4Csv = vulnerabilities4Csv.concat(
            resolveExcelCellLimit(entryData)
          );
        });
      }
    } else {
      vulnerabilities4Csv = vulnerabilities4Csv.concat(
        listAssets(vulnerabilityList)
      );
    }
  }

  return vulnerabilities4Csv;
}

export function prepareEntryData(cve: any, reportType: string) {
  cve.description = cve.description
    ? `${cve.description.replace(/\"/g, "'")}`
    : "";
  if (cve.platforms && Array.isArray(cve.platforms)) {
    cve.platforms = cve.platforms.reduce(
      (acc: any, curr: any) => acc + curr.display_name + " ",
      ""
    );
  }
  if (cve.images && Array.isArray(cve.images)) {
    cve.images = cve.images.reduce(
      (acc: any, curr: any) => acc + curr.display_name + " ",
      ""
    );
  }
  if (cve.nodes && Array.isArray(cve.nodes)) {
    cve.nodes = cve.nodes.reduce(
      (acc: any, curr: any) => acc + curr.display_name + " ",
      ""
    );
  }
  if (cve.workloads && Array.isArray(cve.workloads)) {
    let filteredWorkload = cve.workloads;
    cve.workloads = Array.from(
      filteredWorkload.reduce(
        (acc: any, curr: any) => acc.add(curr.display_name),
        new Set()
      )
    ).join(" ");

    cve.services = Array.from(
      filteredWorkload.reduce(
        (acc: any, curr: any) => acc.add(curr.service),
        new Set()
      )
    ).join(" ");

    cve.domains = Array.from(
      filteredWorkload.reduce(
        (acc: any, curr: any) => acc.add(curr.domain),
        new Set()
      )
    ).join(" ");
    console.log(
      "cve.workloads: ",
      cve.workloads,
      "cve.services:",
      cve.services,
      "cve.domains:",
      cve.domains,
      "cve.images:",
      cve.images
    );
  }

  if (cve.packages) {
    cve["package_versions->fixed_version"] = Object.entries(cve.packages)
      .map(([k, v]) => {
        return `${k}:(${(v as any).reduce(
          (acc: any, curr: any) =>
            acc +
            curr.package_version +
            " -> " +
            (curr.fixed_version || "N/A") +
            " ",
          ""
        )})`;
      })
      .join(" ");
  }
  cve.last_modified_datetime = dayjs(cve.last_modified_timestamp).format(
    "MMM DD, YYYY HH:mm:ss"
  );
  cve.published_datetime = dayjs(cve.published_timestamp).format(
    "MMM DD, YYYY HH:mm:ss"
  );
  delete cve.package_versions;
  delete cve.packages;
  delete cve.published_timestamp;
  delete cve.last_modified_timestamp;
  if (reportType === "assets_view") {
    delete cve.workloads;
    delete cve.nodes;
    delete cve.platforms;
    delete cve.images;
  }
  return cve;
}

export function extractPodImage(vulnerabilities: any) {
  return vulnerabilities.map((vulnerability: any) => {
    let imageMap = new Map();
    vulnerability.workloads?.forEach((workload: any) => {
      imageMap.set(workload.image, {
        display_name: workload.image,
        policy_mode: workload.policy_mode,
      });
    });
    if (vulnerability.images) {
      vulnerability.images.push(...Array.from(imageMap.values()));
    } else {
      vulnerability.images = Array.from(imageMap.values());
    }
    return vulnerability;
  });
}

export function initVulQuery() {
  return JSON.parse(JSON.stringify(NV_MAP.INIT_VUL_ADV_FILTER));
}
