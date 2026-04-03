import { RowNode } from "ag-grid-community";
import { NV_MAP, nvVariables } from "../types/neuvector";
import { sortByDisplayName } from "./common";

const workloadMap = nvVariables.complianceData.workloadMap;

export function getRegulationCsv(tags: any) {
  let tags4Csv: any[] = [];
  const prepareTagData = (tag: any) => {
    tag.description = `${tag.description.replace(/\"/g, "'")}`;
    tag.title = `${tag.title.replace(/\"/g, "'")}`;
    return tag;
  };

  tags.forEach((tag: any) => {
    let entryData = prepareTagData(JSON.parse(JSON.stringify(tag)));
    tags4Csv = tags4Csv.concat({
      cis_subcontrol: entryData.CIS_Sub_Control,
      description: entryData.description,
      id: entryData.id,
      title: entryData.title,
    });
  });
  return tags4Csv;
}

export function getCsvData(complianceList: any, advFilter: any) {
  console.log("DOWNLOAD CSV");
  let compliance4Csv: any[] = [];
  if (typeof complianceList === "object") {
    if (Array.isArray(complianceList)) {
      if (complianceList && complianceList.length > 0) {
        complianceList.forEach((comp) => {
          let entryData = prepareEntryData(
            JSON.parse(JSON.stringify(comp)),
            advFilter
          );
          compliance4Csv = compliance4Csv.concat(
            resolveExcelCellLimit(entryData)
          );
        });
      }
    } else {
      compliance4Csv = compliance4Csv.concat(
        listAssets(complianceList, advFilter)
      );
    }
  }
  return compliance4Csv;
}

export function prepareEntryData(compliance: any, advFilter: any) {
  compliance.description = `${compliance.description.replace(/\"/g, "'")}`;
  compliance.platforms = compliance.platforms.reduce(
    (acc: any, curr: any) => acc + curr.display_name + " ",
    ""
  );
  compliance.tags = Object.keys(compliance.tags).join(", ");

  if (compliance.filteredImages && Array.isArray(compliance.filteredImages)) {
    compliance.images = compliance.filteredImages.reduce(
      (acc: any, curr: any) => acc + curr.display_name + " ",
      ""
    );
  }

  compliance.nodes = compliance.nodes.reduce(
    (acc: any, curr: any) => acc + curr.display_name + " ",
    ""
  );

  if (compliance.workloads && Array.isArray(compliance.workloads)) {
    let filteredWorkload = compliance.workloads.filter((workload: any) =>
      namespaceFilter(workload, advFilter)
    );

    filteredWorkload = filteredWorkload.filter((workload: any) =>
      serviceFilter(workload, advFilter)
    );

    filteredWorkload = filteredWorkload.filter((workload: any) =>
      workloadFilter(workload, advFilter)
    );

    compliance.workloads = Array.from(
      filteredWorkload.reduce(
        (acc: any, curr: any) => acc.add(curr.display_name),
        new Set()
      )
    ).join(" ");

    compliance.services = Array.from(
      filteredWorkload.reduce(
        (acc: any, curr: any) => acc.add(curr.service),
        new Set()
      )
    ).join(" ");

    compliance.domains = Array.from(
      filteredWorkload.reduce(
        (acc: any, curr: any) => acc.add(curr.domain),
        new Set()
      )
    ).join(" ");

    compliance.images = compliance.images.concat(
      Array.from(
        filteredWorkload.reduce(
          (acc: any, curr: any) => acc.add(curr.image),
          new Set()
        )
      ).join(" ")
    );
  }
  return compliance;
}

export function resolveExcelCellLimit(entryData: any) {
  let maxLen = Math.max(
    entryData.images.length,
    entryData.workloads.length,
    entryData.services.length,
    entryData.domains.length
  );
  let maxRow4Entry = Math.ceil(maxLen / NV_MAP.EXCEL_CELL_LIMIT);
  maxRow4Entry = maxRow4Entry === 0 ? 1 : maxRow4Entry;
  let rows: any = [];
  for (let i = 0; i < maxRow4Entry; i++) {
    rows.push({
      name: i === 0 ? entryData.name : "",
      description: i === 0 ? entryData.description : "",
      category: i === 0 ? entryData.category : "",
      level: i === 0 ? entryData.level : "",
      message: i === 0 ? entryData.message : "",
      profile: i === 0 ? entryData.profile : "",
      remediation: i === 0 ? entryData.remediation : "",
      scored: i === 0 ? entryData.scored : "",
      tags: i === 0 ? entryData.tags : "",
      type: i === 0 ? entryData.type : "",
      platforms: i === 0 ? entryData.platforms : "",
      nodes: i === 0 ? entryData.nodes : "",
      domains:
        entryData.domains.length > NV_MAP.EXCEL_CELL_LIMIT * (i + 1)
          ? entryData.domains.substring(
              NV_MAP.EXCEL_CELL_LIMIT * i,
              NV_MAP.EXCEL_CELL_LIMIT * (i + 1)
            )
          : entryData.domains.substring(NV_MAP.EXCEL_CELL_LIMIT * i),
      services:
        entryData.services.length > NV_MAP.EXCEL_CELL_LIMIT * (i + 1)
          ? entryData.services.substring(
              NV_MAP.EXCEL_CELL_LIMIT * i,
              NV_MAP.EXCEL_CELL_LIMIT * (i + 1)
            )
          : entryData.services.substring(NV_MAP.EXCEL_CELL_LIMIT * i),
      workloads:
        entryData.workloads.length > NV_MAP.EXCEL_CELL_LIMIT * (i + 1)
          ? entryData.workloads.substring(
              NV_MAP.EXCEL_CELL_LIMIT * i,
              NV_MAP.EXCEL_CELL_LIMIT * (i + 1)
            )
          : entryData.workloads.substring(NV_MAP.EXCEL_CELL_LIMIT * i),
      images:
        entryData.images.length > NV_MAP.EXCEL_CELL_LIMIT * (i + 1)
          ? entryData.images.substring(
              NV_MAP.EXCEL_CELL_LIMIT * i,
              NV_MAP.EXCEL_CELL_LIMIT * (i + 1)
            )
          : entryData.images.substring(NV_MAP.EXCEL_CELL_LIMIT * i),
    });
  }
  return rows;
}

export function listAssets(entryData: any, advFilter: any) {
  let regulationsList = Object.entries(entryData.tags).filter(
    ([tagName, tags]) => {
      return advFilter.tags[tagName] && (tags as any[]).length;
    }
  );
  let imageList = entryData.images.map((image: any) => image.display_name);
  let workloadList = entryData.workloads.map(
    (workload: any) => workload.display_name
  );
  let nodeList = entryData.nodes.map((node: any) => node.display_name);
  let platformList = entryData.platforms.map(
    (platform: any) => platform.display_name
  );
  let maxRow4Entry = Math.max(
    imageList.length,
    workloadList.length,
    nodeList.length,
    platformList.length,
    Math.max(...regulationsList.map(([_, tags]) => (tags as any[]).length))
  );
  maxRow4Entry = maxRow4Entry === 0 ? 1 : maxRow4Entry;
  let rows: any = [];
  for (let i = 0; i < maxRow4Entry; i++) {
    let row = {
      name: i === 0 ? entryData.name : "",
      description: i === 0 ? entryData.description : "",
      category: i === 0 ? entryData.category : "",
      level: i === 0 ? entryData.level : "",
      message: i === 0 ? entryData.message : "",
      profile: i === 0 ? entryData.profile : "",
      remediation: i === 0 ? entryData.remediation : "",
      scored: i === 0 ? entryData.scored : "",
      tags: i === 0 ? Object.keys(entryData.tags).join(", ") : "",
      type: i === 0 ? entryData.type : "",
      platforms: i > platformList.length - 1 ? "" : platformList[i],
      nodes: i > nodeList.length - 1 ? "" : nodeList[i],
      workloads: i > workloadList.length - 1 ? "" : workloadList[i],
      images: i > imageList.length - 1 ? "" : imageList[i],
    };
    for (let [tagName, tags] of regulationsList) {
      row = {
        ...row,
        [`${tagName}_cis_subcontrol`]:
          i > (tags as any[]).length - 1
            ? ""
            : (tags as any[])[i].CIS_Sub_Control,
        [`${tagName}_description`]:
          i > (tags as any[]).length - 1 ? "" : (tags as any[])[i].description,
        [`${tagName}_id`]:
          i > (tags as any[]).length - 1 ? "" : (tags as any[])[i].id,
        [`${tagName}_title`]:
          i > (tags as any[]).length - 1 ? "" : (tags as any[])[i].title,
      };
    }
    rows.push(row);
  }
  return rows;
}

export function complianceImpactComp(a: any, b: any) {
  const aTotal =
    a.images.length + a.nodes.length + a.workloads.length + a.platforms.length;
  const bTotal =
    b.images.length + b.nodes.length + b.workloads.length + b.platforms.length;
  if (aTotal === bTotal) return 0;
  return aTotal > bTotal ? -1 : 1;
}

export function complianceContainerComp(a: any, b: any) {
  if (a.workloads.length === b.workloads.length) return 0;
  return a.workloads.length > b.workloads.length ? -1 : 1;
}

export function preprocessCompliance(complianceData: any) {
  complianceData.compliances.forEach((compliance: any) => {
    let domains = new Set();
    compliance.nodes = compliance.nodes.map((nodeId: any) => {
      if (!complianceData.nodes?.[nodeId]?.[0]) return null;
      complianceData.nodes[nodeId][0].id = nodeId;
      complianceData.nodes[nodeId][0].domains?.forEach((domain: any) => {
        domains.add(domain);
      });
      return complianceData.nodes[nodeId][0];
    }).filter((item: any) => item !== null);
    compliance.workloads = compliance.workloads.map((workloadId: any) => {
      if (!complianceData.workloads?.[workloadId]?.[0]) return null;
      complianceData.workloads[workloadId][0].id = workloadId;
      complianceData.workloads[workloadId][0].domains?.forEach(
        (domain: any) => {
          domains.add(domain);
        }
      );
      return complianceData.workloads[workloadId][0];
    }).filter((item: any) => item !== null);
    compliance.platforms = compliance.platforms.map((platformId: any) => {
      if (!complianceData.platforms?.[platformId]?.[0]) return null;
      complianceData.platforms[platformId][0].id = platformId;
      complianceData.platforms[platformId][0].domains?.forEach(
        (domain: any) => {
          domains.add(domain);
        }
      );
      return complianceData.platforms[platformId][0];
    }).filter((item: any) => item !== null);
    compliance.images = compliance.images.map((imageId: any) => {
      if (!complianceData.images?.[imageId]?.[0]) return null;
      complianceData.images[imageId][0].id = imageId;
      complianceData.images[imageId][0].domains?.forEach((domain: any) => {
        domains.add(domain);
      });
      return complianceData.images[imageId][0];
    }).filter((item: any) => item !== null);
    compliance.domains = [...domains];
    compliance.images.sort(sortByDisplayName);
    compliance.workloads.sort(sortByDisplayName);
    compliance.nodes.sort(sortByDisplayName);
    compliance.platforms.sort(sortByDisplayName);
  });
  return complianceData;
}

export function complianceImpactComparator(
  value1: any,
  value2: any,
  node1: RowNode,
  node2: RowNode
) {
  const cve1 = node1.data;
  const cve2 = node2.data;
  if (cve1.platforms.length === cve2.platforms.length) {
    if (cve1.images.length === cve2.images.length) {
      if (cve1.nodes.length === cve2.nodes.length) {
        return cve1.workloads.length - cve2.workloads.length;
      } else return cve1.nodes.length - cve2.nodes.length;
    } else return cve1.images.length - cve2.images.length;
  } else {
    return cve1.platforms.length - cve2.platforms.length;
  }
}

export function namespaceFilter(workload: any, advFilter: any) {
  if (advFilter.selectedDomains.length) {
    const container = workloadMap.get(workload.id);
    if (container && container.domain) {
      if (advFilter.matchType4Ns.id === "contains")
        return new RegExp(advFilter.selectedDomains.join("|")).test(
          container.domain
        );
      else
        return advFilter.selectedDomains.some(
          (item: any) => container.domain === item
        );
    } else return false;
  } else return true;
}

export function serviceFilter(workload: any, advFilter: any) {
  if (advFilter.serviceName) {
    const container = workloadMap.get(workload.id);
    if (container && container.service_group) {
      if (advFilter.matchTypes.Service.id === "contains")
        return new RegExp(advFilter.serviceName).test(
          container.service_group.substring(3)
        );
      else
        return advFilter.serviceName === container.service_group.substring(3);
    } else return false;
  } else return true;
}

export function workloadFilter(workload: any, advFilter: any) {
  if (advFilter.containerName) {
    const container = workloadMap.get(workload.id);
    if (container && container.display_name) {
      if (advFilter.matchTypes.Container.id === "contains")
        return new RegExp(advFilter.containerName).test(container.display_name);
      else return advFilter.containerName === container.display_name;
    } else return false;
  } else return true;
}

export function initCompFilter() {
  return JSON.parse(JSON.stringify(NV_MAP.INIT_COMPLIANCE_ADV_FILTER));
}
