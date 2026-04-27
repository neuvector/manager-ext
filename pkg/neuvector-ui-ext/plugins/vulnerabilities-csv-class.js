import { saveAs } from "file-saver";
import { arrayToCsv } from "../utils/common";
import { NV_MAP } from "../types/neuvector";
import moment from "moment";

export function downloadCsv(vulnerabilityList, cveEntry) {
    console.log('DOWNLOAD CSV');
    let vulnerabilities4Csv = [];

    const listAssets = (entryData) => {
        let imageList = entryData.images ? entryData.images.map(image => image.display_name) : [];
        let workloadList = entryData.workloads ? entryData.workloads.map(workload => workload.display_name) : [];
        let serviceList = entryData.services || [];
        let domainList = entryData.domains || [];
        let nodeList = entryData.nodes ? entryData.nodes.map(node => node.display_name) : [];
        let platformList = entryData.platforms ? entryData.platforms.map(platform => platform.display_name) : [];
        let pv2fvList = entryData.packages ? Object.entries(entryData.packages).map(([k, v]) => {
            return `${k}:(${v.reduce(
                (acc, curr) =>
                    acc + curr.package_version + ' -> ' + (curr.fixed_version || 'N/A') + ' ',
                ''
            )})`;
        }) : [];
        let maxRow4Entry = Math.max(
            imageList.length || 0,
            workloadList.length || 0,
            serviceList.length || 0,
            domainList.length || 0,
            nodeList.length || 0,
            platformList.length || 0,
            pv2fvList.length || 0
        );
        maxRow4Entry = maxRow4Entry === 0 ? 1 : maxRow4Entry;
        let rows = [];
        for (let i = 0; i < maxRow4Entry; i++) {
            rows.push({
                name: i === 0 ? entryData.name : '',
                link: i === 0 ? entryData.link : '',
                severity: i === 0 ? entryData.severity : '',
                score: i === 0 ? entryData.score : '',
                score_v3: i === 0 ? entryData.score_v3 : '',
                vectors: i === 0 ? entryData.vectors : '',
                vectors_v3: i === 0 ? entryData.vectors_v3 : '',
                description: i === 0 ? entryData.description : '',
                platforms: i > platformList.length - 1 ? '' : platformList[i],
                nodes: i > (nodeList.length || 0) - 1 ? '' : nodeList[i],
                domains: i > (domainList.length || 0) - 1 ? '' : domainList[i],
                services: i > (serviceList.length || 0) - 1 ? '' : serviceList[i],
                workloads: i > (workloadList.length || 0) - 1 ? '' : workloadList[i],
                images: i > (imageList.length || 0) - 1 ? '' : imageList[i],
                'package_versions->fixed_version': i > (pv2fvList.length || 0) - 1 ? '' : pv2fvList[i],
                last_modified_datetime: i === 0 ? formatDate(entryData.last_modified_timestamp) : '',
                published_datetime: i === 0 ? formatDate(entryData.published_timestamp) : '',
            });
        }
        return rows;
    };

    const resolveExcelCellLimit = (entryData) => {
        let maxLen = Math.max(
            entryData.images ? entryData.images.length : 0,
            entryData.workloads ? entryData.workloads.length : 0,
            entryData.services ? entryData.services.length : 0,
            entryData.domains ? entryData.domains.length : 0,
            entryData['package_versions->fixed_version'] ? entryData['package_versions->fixed_version'].length : 0
        );
        let maxRow4Entry = Math.ceil(maxLen / NV_MAP.EXCEL_CELL_LIMIT);
        maxRow4Entry = maxRow4Entry === 0 ? 1 : maxRow4Entry;
        let rows = [];
        for (let i = 0; i < maxRow4Entry; i++) {
            rows.push({
                name: i === 0 ? entryData.name : '',
                link: i === 0 ? entryData.link : '',
                severity: i === 0 ? entryData.severity : '',
                score: i === 0 ? entryData.score : '',
                score_v3: i === 0 ? entryData.score_v3 : '',
                vectors: i === 0 ? entryData.vectors : '',
                vectors_v3: i === 0 ? entryData.vectors_v3 : '',
                description: i === 0 ? entryData.description : '',
                platforms: i === 0 ? entryData.platforms : '',
                nodes: i === 0 ? (entryData.nodes || '') : '',
                domains: entryData.domains ?
                    entryData.domains.length > NV_MAP.EXCEL_CELL_LIMIT * (i + 1)
                        ? entryData.domains.substring(NV_MAP.EXCEL_CELL_LIMIT * i, NV_MAP.EXCEL_CELL_LIMIT * (i + 1))
                        : entryData.domains.substring(NV_MAP.EXCEL_CELL_LIMIT * i)
                    : '',
                services: entryData.services ?
                    entryData.services.length > NV_MAP.EXCEL_CELL_LIMIT * (i + 1)
                        ? entryData.services.substring(NV_MAP.EXCEL_CELL_LIMIT * i, NV_MAP.EXCEL_CELL_LIMIT * (i + 1))
                        : entryData.services.substring(NV_MAP.EXCEL_CELL_LIMIT * i)
                    : '',
                workloads: entryData.workloads ?
                    entryData.workloads.length > NV_MAP.EXCEL_CELL_LIMIT * (i + 1)
                        ? entryData.workloads.substring(NV_MAP.EXCEL_CELL_LIMIT * i, NV_MAP.EXCEL_CELL_LIMIT * (i + 1))
                        : entryData.workloads.substring(NV_MAP.EXCEL_CELL_LIMIT * i)
                    : '',
                images: entryData.images ?
                    entryData.images.length > NV_MAP.EXCEL_CELL_LIMIT * (i + 1)
                        ? entryData.images.substring(NV_MAP.EXCEL_CELL_LIMIT * i, NV_MAP.EXCEL_CELL_LIMIT * (i + 1))
                        : entryData.images.substring(NV_MAP.EXCEL_CELL_LIMIT * i)
                    : '',
                'package_versions->fixed_version': entryData['package_versions->fixed_version'] ?
                    entryData['package_versions->fixed_version'].length > NV_MAP.EXCEL_CELL_LIMIT * (i + 1)
                        ? entryData['package_versions->fixed_version'].substring(NV_MAP.EXCEL_CELL_LIMIT * i, NV_MAP.EXCEL_CELL_LIMIT * (i + 1))
                        : entryData['package_versions->fixed_version'].substring(NV_MAP.EXCEL_CELL_LIMIT * i)
                    : '',
                last_modified_datetime: i === 0 ? entryData.last_modified_datetime : '',
                published_datetime: i === 0 ? entryData.published_datetime : '',
            });
        }
        return rows;
    };


    if (typeof vulnerabilityList === 'object') {
        if (Array.isArray(vulnerabilityList)) {
            if (vulnerabilityList.length > 0) {
                vulnerabilityList.forEach(cve => {
                    let entryData = prepareEntryData(JSON.parse(JSON.stringify(cve)), 'vulnerability_view');
                    vulnerabilities4Csv = vulnerabilities4Csv.concat(resolveExcelCellLimit(entryData));
                });
            }
        } else {
            vulnerabilities4Csv = vulnerabilities4Csv.concat(listAssets(vulnerabilityList));
        }
    }

    let csv = arrayToCsv(vulnerabilities4Csv);
    let blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    let filename = cveEntry && cveEntry.name
        ? `${cveEntry.name}_${parseDatetimeStr(new Date())}.csv`
        : `Vulnerabilities_View_${parseDatetimeStr(new Date())}.csv`;
    saveAs(blob, filename);
}

export function downloadAssetsViewCsv(data) {
    console.log("data", data);

    let csvWorkloads = arrayToCsv(prepareContainersData(data.workloads));
    let csvNodes = arrayToCsv(prepareNodesData(data.nodes));
    let csvPlatforms = arrayToCsv(preparePlatformsData(data.platforms));
    let csvImages = arrayToCsv(prepareImagesData(data.images));
    let csvVuls = arrayToCsv(preprocessVulnerabilityCsvData(data.vulnerabilities));

    let csvData =
        'Containers\r\n'
            .concat(csvWorkloads)
            .concat('\r\n')
            .concat('Nodes\r\n')
            .concat(csvNodes)
            .concat('\r\n')
            .concat('Platforms\r\n')
            .concat(csvPlatforms)
            .concat('\r\n')
            .concat('Images\r\n')
            .concat(csvImages)
            .concat('\r\n')
            .concat('Vulnerability Details\r\n')
            .concat(csvVuls);

    let blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
    let filename = `Assets_View_${parseDatetimeStr(new Date())}.csv`;
    saveAs(blob, filename);
};

function isoToTimestamp(isoDateStr) {
    const dateObj = new Date(isoDateStr);
    return Math.floor(dateObj.getTime() / 1000);
}

function formatDate(timestamp) {
    const dateObj = new Date(timestamp * 1000);

    const options = {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    };

    return dateObj.toLocaleString('en-US', options).replace(',', '');
}

function parseDatetimeStr(datetimeObj, pattern = 'YYYYMMDDHHmmss') {
    const date = moment(datetimeObj);
    return date.format(pattern);
}

function prepareEntryData(cve, reportType) {
    cve.description = cve.description
        ? `${cve.description.replace(/\"/g, "'")}`
        : '';

    if (cve.platforms && Array.isArray(cve.platforms)) {
        cve.platforms = cve.platforms.reduce(
            (acc, curr) => acc + curr.display_name + ' ',
            ''
        );
    }

    if (cve.images && Array.isArray(cve.images)) {
        cve.images = cve.images.reduce(
            (acc, curr) => acc + curr.display_name + ' ',
            ''
        );
    }

    if (cve.nodes && Array.isArray(cve.nodes)) {
        cve.nodes = cve.nodes.reduce(
            (acc, curr) => acc + curr.display_name + ' ',
            ''
        );
    }

    if (cve.workloads && Array.isArray(cve.workloads)) {
        let filteredWorkload = cve.workloads;

        cve.workloads = Array.from(
            filteredWorkload.reduce(
                (acc, curr) => acc.add(curr.display_name),
                new Set()
            )
        ).join(' ');

        cve.services = Array.from(
            filteredWorkload.reduce(
                (acc, curr) => acc.add(curr.service),
                new Set()
            )
        ).join(' ');

        cve.domains = Array.from(
            filteredWorkload.reduce(
                (acc, curr) => acc.add(curr.domain),
                new Set()
            )
        ).join(' ');

        console.log(
            'cve.workloads: ',
            cve.workloads,
            'cve.services:',
            cve.services,
            'cve.domains:',
            cve.domains,
            'cve.images:',
            cve.images
        );
    }

    if (cve.packages) {
        cve['package_versions->fixed_version'] = Object.entries(cve.packages)
            .map(([k, v]) => {
                return `${k}:(${v.reduce(
                    (acc, curr) =>
                        acc +
                        curr.package_version +
                        ' -> ' +
                        (curr.fixed_version || 'N/A') +
                        ' ',
                    ''
                )})`;
            })
            .join(' ');
    }

    cve.last_modified_datetime = formatDate(
        cve.last_modified_timestamp
    );
    cve.published_datetime = formatDate(cve.published_timestamp);

    delete cve.package_versions;
    delete cve.packages;
    delete cve.published_timestamp;
    delete cve.last_modified_timestamp;

    if (reportType === 'assets_view') {
        delete cve.workloads;
        delete cve.nodes;
        delete cve.platforms;
        delete cve.images;
    }

    return cve;
}

const preprocessVulnerabilityCsvData = (vuls) => {
    return vuls.map(cve => {
        return prepareEntryData(cve, 'assets_view');
    });
};

const prepareContainersData = (workloads) => {
    return workloads.map(workload => {
        return {
            'Name': workload.name,
            'ID': workload.id,
            'Namespace': workload.domain,
            'Service Group': workload.service_group,
            'Policy Mode': workload.policy_mode,
            'Image': workload.image,
            'Applications': workload.applications,
            'Critical': workload.critical,
            'High': workload.high,
            'Medium': workload.medium,
            'Low': workload.low,
            'Vulnerabilities': workload.vulnerabilities.map(vul => reformCveName(vul)),
            'Scanned at': formatDate(isoToTimestamp(workload.scanned_at))
        };
    });
};

const prepareNodesData = (nodes) => {
    return nodes.map(node => {
        return {
            'Name': node.name,
            'ID': node.id,
            'Containers': node.containers,
            'CPUs': node.cpus,
            'OS': node.os,
            'Kernel': node.kernel,
            'Memory': formatBytes(node.memory),
            'Policy Mode': node.policy_mode,
            'Critical': node.critical,
            'High': node.high,
            'Medium': node.medium,
            'Low': node.low,
            'Vulnerabilities': node.vulnerabilities.map(vul => reformCveName(vul)),
            'Scanned at': formatDate(isoToTimestamp(node.scanned_at))
        };
    });
};

const preparePlatformsData = (platforms) => {
    return platforms.map(platform => {
        return {
            'Name': platform.name,
            'Version': platform.version,
            'Base OS': platform.base_os,
            'Critical': platform.critical,
            'High': platform.high,
            'Medium': platform.medium,
            'Low': platform.low,
            'Vulnerabilities': platform.vulnerabilities.map(vul => reformCveName(vul)),
            'Scanned at': formatDate(isoToTimestamp(platform.scanned_at))
        };
    });
};

const prepareImagesData = (images) => {
    return images.map(image => {
        return {
            'Name': image.platform,
            'ID': image.id,
            'Critical': image.critical,
            'High': image.high,
            'Medium': image.medium,
            'Low': image.low,
            'Vulnerabilities': image.vulnerabilities.map(vul => reformCveName(vul))
        };
    });
};

const reformCveName = (cveName) => {
    let cveNameArray = cveName.split('_');
    return `${cveNameArray[1]} (${cveNameArray[0]})`;
};


const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Byte';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
