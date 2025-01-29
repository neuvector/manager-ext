import { NV_MAP, NV_CONST } from '../types/neuvector';
import { getIpInfo } from '../plugins/dashboard-class';
import { getDisplayName, isIpV4, isIpV6, getI18Name } from '../utils/common';
import { getRowBasedPermission } from '../utils/auth';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ref } from 'vue';

dayjs.extend(relativeTime);

const EVENT_TYPE = {
    THREAT: 'threat',
    VIOLATION: 'violation',
    INCIDENT: 'incident'
};

const ENDPOINT = {
    DESTINATION: 'destination',
    SOURCE: 'source'
};

const TARGET = {
    SERVER: 'server',
    CLIENT: 'client'
};

const LABELS = {
    NETWORK: 'network',
    PRIVILEGE: 'privilege',
    FILE: 'file',
    TUNNEL: 'tunnel',
    PROCESS: 'process',
    HOST: 'host',
    CONTAINER: 'container',
    PACKAGE: 'package',
    OTHER: 'other'
};

export const secEventVar = {
  securityEventsServiceData: ref({
    cachedSecurityEvents: [] as any[],
    displayedSecurityEvents: [] as any[],
    domainList: [] as any[],
    autoCompleteData: {} as any,
    filterItems: {
      dateFrom:  0,
      dateTo:  0,
      severity:  [] as any[],
      location:  [] as any[],
      category:  [] as any[],
      other: [] as any[],
      host: '',
      source: '',
      destination: '',
      selectedDomains: [] as any[],
      includedKeyword: '',
      excludedKeyword: ''
    }
  }),
  dateSliderCtx: ref({
    page: 0,
    begin: 0,
    openedIndex: 0,
    openedPage: 0,
    limit: 0,
    array: [] as any[]
  }),
};


type FilterTypes = 'TimeFIlter' | 'QuickFilter' | 'AdvancedFIlter';


export async function combineSecurityEvents(securityEventsData: any, store: any, selectedRow: any) {
    console.log('combineSecurityEvents', store)
    let threatList = JSON.parse(securityEventsData.data[0]);
    let violationList = JSON.parse(securityEventsData.data[1]);
    let incidentList = JSON.parse(securityEventsData.data[2]);
    let cachedSecurityEvents: any[] = [];
    let displayedSecurityEvents = [];
    let domainList: string[] = [];
    let autoCompleteData = null;

    console.log('Security Events (raw): ', [
        threatList,
        violationList,
        incidentList,
    ]);

    let ipList = threatList.threats
      .flatMap((threat: any) => {
        let ips = [];
        if (
          threat.client_workload_id ===
          NV_MAP.securityEventLocation.EXTERNAL
        ) {
          ips.push(threat.client_ip);
        }
        if (
          threat.server_workload_id ===
          NV_MAP.securityEventLocation.EXTERNAL
        ) {
          ips.push(threat.server_ip);
        }
        return ips;
      })
      .concat(
        violationList.violations.flatMap((violation: any) => {
          let ips = [];
          if (
            violation.client_id === NV_MAP.securityEventLocation.EXTERNAL
          ) {
            ips.push(violation.client_ip);
          }
          if (
            violation.server_id === NV_MAP.securityEventLocation.EXTERNAL
          ) {
            ips.push(violation.server_ip);
          }
          return ips;
        })
      )
      .concat(
        incidentList.incidents.flatMap((incident: any) => {
          let ips = [];
          if (
            incident.workload_id === NV_MAP.securityEventLocation.EXTERNAL && incident.client_ip
          ) {
            ips.push(incident.client_ip);
          }
          if (
            incident.remote_workload_id ===
            NV_MAP.securityEventLocation.EXTERNAL && incident.server_ip
          ) {
            ips.push(incident.server_ip);
          }
          return ips;
        })
      );
    console.log('IP list: ', ipList);

    try {
        let ipInfoRes = await getIpInfo(ipList);
        let ipMap = ipInfoRes.data.ip_map;
        threatList = threatList.threats.map((threat: any) => {
          return editDisplayedThreat(threat, ipMap, store);
        });
        violationList = violationList.violations.map(
          (violation: any) => {
            return editDisplayedViolation(
              violation,
              ipMap,
              store
            );
          }
        );
        incidentList = incidentList.incidents.map((incident: any) => {
          return editDisplayedIncident(
            incident,
            ipMap,
            store
          );
        });

        cachedSecurityEvents =
          cachedSecurityEvents
            .concat(threatList)
            .concat(violationList)
            .concat(incidentList);
    
        if (cachedSecurityEvents.length > 0) {
            cachedSecurityEvents =
                cachedSecurityEvents.sort((a, b) => {
                return b.reportedTimestamp - a.reportedTimestamp;
                });
    
    
            console.log(
                'Security Events (After edited): ',
                JSON.parse(
                    JSON.stringify(cachedSecurityEvents)
                )
            );
    
            domainList = _getDomainList(
                cachedSecurityEvents
            );

            autoCompleteData = _prepareAutoCompleteData(
                cachedSecurityEvents,
                domainList
            );
    
            if (selectedRow && selectedRow !== 'null') {
                // this.onQuickFilterChange(
                //     this.datePipe.transform(
                //         this.selectedRow.reported_at,
                //         'MMM dd, yyyy HH:mm:ss'
                //     )!
                // );
            } else {
                displayedSecurityEvents = JSON.parse(
                    JSON.stringify(cachedSecurityEvents)
                );
                // this.printableData = this.getPrintableData(
                //     this.securityEventsService.displayedSecurityEvents
                // );
            }
        }
        // displayedSecurityEvents =
        //     displayedSecurityEvents.filter(event => {
        //         return this.advancedFilterModalService._includeFilter(event, this.filter.value);
        //     });
        // console.log("this.advFilterConf", this.advFilterConf);
        // this.setAdvancedFilter(this.advFilterConf);
        // this.onQuickFilterChange(this.filter.value);
        // this.isDataReady = true;

        secEventVar.securityEventsServiceData.value.cachedSecurityEvents = cachedSecurityEvents;
        secEventVar.securityEventsServiceData.value.displayedSecurityEvents = displayedSecurityEvents;
        secEventVar.securityEventsServiceData.value.domainList = domainList;
        secEventVar.securityEventsServiceData.value.autoCompleteData = autoCompleteData;

        return secEventVar.securityEventsServiceData;

    } catch(error) {
        console.error(error);
    }
};

const editDisplayedThreat = function(threat: any, ipMap: any, store: any) {
    let displayedThreat: any = {
      id: '',
      name: '',
      name4Pdf: '',
      type: {
        name: '',
        cssColor: ''
      },
      reportedAt: '',
      reportedTimestamp: 0,
      relativeDate: '',
      endpoint: {
        source: {},
        destination: {}
      },
      applications: '',
      hostId: '',
      hostName: '',
      enforcerId: '',
      enforcerName: '',
      details: {},
      orgReportedAt: '',
      reportedOn: ''
    };
    let source = _getEndpointDirection(
      threat,
      EVENT_TYPE.THREAT,
      ENDPOINT.SOURCE
    );
    let destination = _getEndpointDirection(
      threat,
      EVENT_TYPE.THREAT,
      ENDPOINT.DESTINATION
    );
    displayedThreat.id = threat.id;
    displayedThreat.name = threat.name;
    displayedThreat.name4Pdf = threat.name;
    displayedThreat.type.name = EVENT_TYPE.THREAT;
    displayedThreat.type.cssColor = 'fa icon-size-2 fa-bug text-danger';
    displayedThreat.reportedAt = dayjs(threat.reported_at).format('MMM DD, YY HH:mm:ss');
    displayedThreat.relativeDate = dayjs(displayedThreat.reportedAt).fromNow();
    displayedThreat.orgReportedAt = dayjs(threat.reported_at).format('YYYY-MM-DDTHH:mm:ss');
    displayedThreat.reportedOn = dayjs(threat.reported_at).format('YYYYMMDD');
    displayedThreat.reportedTimestamp = threat.reported_timestamp;
    displayedThreat.endpoint.source = _getEndpointInfo(
      source,
      ENDPOINT.SOURCE,
      ipMap
    );
    displayedThreat.endpoint.destination = _getEndpointInfo(
      destination,
      ENDPOINT.DESTINATION,
      ipMap
    );
    displayedThreat.applications =
      threat.application && threat.application.length > 0 ? threat.application : null;
    displayedThreat.hostId = threat.host_id || '';
    displayedThreat.hostName = threat.host_name || '';
    displayedThreat.enforcerId = threat.enforcer_id || '';
    displayedThreat.enforcerName = threat.enforcer_name || '';
    displayedThreat.details = _editThreatDetails(
      threat,
      source,
      destination,
      store
    );
    return displayedThreat;
};

const editDisplayedViolation = function(
    violation: any,
    ipMap: any,
    store: any
) {
    let displayedViolation: any = {
      name: '',
      name4Pdf: '',
      ruleId: 0,
      reviewRulePermission: '',
      type: {
        name: '',
        cssColor: ''
      },
      reportedAt: '',
      reportedTimestamp: 0,
      relativeDate: '',
      endpoint: {
        source: {},
        destination: {}
      },
      fqdn: '',
      applications: '',
      hostId: '',
      hostName: '',
      enforcerId: '',
      enforcerName: '',
      details: {}
    };

    let source = _getEndpointDirection(
      violation,
      EVENT_TYPE.VIOLATION,
      ENDPOINT.SOURCE
    );
    let destination = _getEndpointDirection(
      violation,
      EVENT_TYPE.VIOLATION,
      ENDPOINT.DESTINATION
    );
    displayedViolation.name =
      violation.policy_id === 0
        ? violation.nbe
          ? store.getters['i18n/t']('securityEvent.CROSS_NAMESPACE_BOUNDARY')
          : store.getters['i18n/t']('securityEvent.VIOLATION_NAME_DEFAULT')
        : store.getters['i18n/t']('securityEvent.VIOLATION_NAME', {
            policy_id: violation.policy_id
          });
    displayedViolation.name4Pdf =
      violation.policy_id === 0
        ? violation.nbe
          ? store.getters['i18n/t'](
              'securityEvent.CROSS_NAMESPACE_BOUNDARY'
            )
          : store.getters['i18n/t'](
              'securityEvent.VIOLATION_NAME_DEFAULT'
            )
        : store.getters['i18n/t'](
            'securityEvent.VIOLATION_NAME',
            {
              policy_id: violation.policy_id
            }
          );
    displayedViolation.reviewRulePermission = getReviewRulePermission(source!.domain_name, destination!.domain_name);
    displayedViolation.ruleId = violation.policy_id;
    displayedViolation.type.name = EVENT_TYPE.VIOLATION;
    displayedViolation.type.cssColor = 'fa icon-size-2 fa-ban text-warning';
    displayedViolation.reportedAt = dayjs(violation.reported_at).format('MMM DD, YY HH:mm:ss');
    displayedViolation.relativeDate = dayjs(displayedViolation.reportedAt).fromNow();
    displayedViolation.orgReportedAt = dayjs(violation.reported_at).format('YYYY-MM-DDTHH:mm:ss');
    displayedViolation.reportedOn = dayjs(violation.reported_at).format('YYYYMMDD');
    displayedViolation.reportedTimestamp = violation.reported_timestamp;
    displayedViolation.endpoint.source = _getEndpointInfo(
      source,
      ENDPOINT.SOURCE,
      ipMap
    );
    displayedViolation.endpoint.destination = _getEndpointInfo(
      destination,
      ENDPOINT.DESTINATION,
      ipMap
    );
    let violationApps = violation.applications
      ? violation.applications.sort().join(', ')
      : null;
    displayedViolation.applications =
      violationApps!.length > 0 ? violationApps : '';
    displayedViolation.hostId = violation.host_id || '';
    displayedViolation.hostName = violation.host_name || '';
    displayedViolation.enforcerId = violation.enforcer_id || '';
    displayedViolation.enforcerName = violation.enforcer_name || '';
    displayedViolation.fqdn = violation.fqdn || '';
    displayedViolation.details = _editViolationDetails(violation, store);
    return displayedViolation;
};

const editDisplayedIncident = function(incident: any, ipMap: any, store: any) {
    let source = _getEndpointDirection(
      incident,
      EVENT_TYPE.INCIDENT,
      ENDPOINT.SOURCE
    );
    let destination = _getEndpointDirection(
      incident,
      EVENT_TYPE.INCIDENT,
      ENDPOINT.DESTINATION
    );
    let container: any = {
      domain: '',
      name: '',
      icon: '',
      id: '',
      service: '',
      isHyperlinkEnabled: false
    };
    if (source!.workload_id || destination!.workload_id) {
      if (source!.workload_id) {
        container.domain = source!.domain_name
          ? `${source!.domain_name}`
          : '';
        container.name = source!.workload_name
          ? getDisplayName(source!.workload_name)
          : source!.workload_id;
        container.id = source!.workload_id;
        container.service = source!.service;
        container.isHyperlinkEnabled = source!.workload_id !== source!.client_ip;
      } else if (!source!.workload_id && destination!.workload_id) {
        container.domain = destination!.domain_name
          ? `${destination!.domain_name}`
          : '';
        container.name = destination!.workload_name
          ? getDisplayName(destination!.workload_name)
          : destination!.workload_id;
        container.id = destination!.workload_id;
        container.service = destination!.service;
        container.isHyperlinkEnabled = destination!.workload_id !== destination!.client_ip;
      }
    }

    let displayedIncident: any = {
      name: '',
      name4Pdf: '',
      reviewRulePermission: '',
      type: {
        name: '',
        cssColor: ''
      },
      reportedAt: '',
      reportedTimestamp: 0,
      relativeDate: '',
      endpoint: {
        source: {},
        destination: {}
      },
      host_name: '',
      container: {},
      applications: '',
      hostId: '',
      hostName: '',
      enforcerId: '',
      enforcerName: '',
      details: {},
      orgReportedAt: '',
      reportedOn: ''
    };

    const getIncidentName = (incident: any, container: any) => {
      const constName = incident.name.replace(/\./g, '_').toUpperCase();
        let translateConst = `securityEvent.${constName}`;
      const PROC_NAME_RELATED_INCIDENTS = [
        'HOST_SUSPICIOUS_PROCESS',
        'CONTAINER_SUSPICIOUS_PROCESS',
        'HOST_TUNNEL_DETECTED',
        'CONTAINER_TUNNEL_DETECTED',
        'PROCESS_PROFILE_VIOLATION',
        'HOST_PROCESS_VIOLATION',
        'CONTAINER_FILEACCESS_VIOLATION',
        'HOST_FILEACCESS_VIOLATION'
      ];
      const PROC_CMD_RELATED_INCIDENTS = [
        'HOST_PRIVILEGE_ESCALATION',
        'CONTAINER_PRIVILEGE_ESCALATION'
      ];
      if (!incident.proc_name && PROC_NAME_RELATED_INCIDENTS.includes(constName)) {
        translateConst = `securityEvent.${constName}_NO_PROC_NAME`;
      }
      if (!incident.proc_cmd && PROC_CMD_RELATED_INCIDENTS.includes(constName)) {
        translateConst = `securityEvent.${constName}_NO_PROC_CMD`;
      }
      return store.getters['i18n/t'](
        translateConst,
        {
          host_name: incident.host_name || '',
          container: container.id
            ? `${container.domain ? `${container.domain}:` : ''}${
                container.service ? `${container.service}:` : ''
              }${container.name}`
            : '',
          file_path: incident.file_path || '',
          proc_name: incident.proc_name || '',
          proc_cmd: incident.proc_cmd || ''
        }
      );
    };

    displayedIncident.name = getIncidentName(incident, container);
    displayedIncident.name4Pdf = displayedIncident.name;
    displayedIncident.reviewRulePermission = getReviewRulePermission(source!.domain_name, destination!.domain_name);
    displayedIncident.type.name = EVENT_TYPE.INCIDENT;
    displayedIncident.type.cssColor =
      'fa icon-size-2 fa-exclamation-triangle text-muted';
    displayedIncident.reportedAt = dayjs(incident.reported_at).format('MMM DD, YY HH:mm:ss');
    displayedIncident.relativeDate = dayjs(displayedIncident.reportedAt).fromNow();
    displayedIncident.orgReportedAt = dayjs(incident.reported_at).format('YYYY-MM-DDTHH:mm:ss');
    displayedIncident.reportedOn = dayjs(incident.reported_at).format('YYYYMMDD');
    displayedIncident.reportedTimestamp = incident.reported_timestamp;
    displayedIncident.endpoint.source = _getEndpointInfo(
      source,
      ENDPOINT.SOURCE,
      ipMap
    );
    displayedIncident.endpoint.destination = _getEndpointInfo(
      destination,
      ENDPOINT.DESTINATION,
      ipMap
    );
    displayedIncident.host_name = incident.host_name;
    displayedIncident.container = container;
    displayedIncident.applications = incident.proc_path || null;
    displayedIncident.hostId = incident.host_id || '';
    displayedIncident.hostName = incident.host_name || '';
    displayedIncident.enforcerId = incident.enforcer_id || '';
    displayedIncident.enforcerName = incident.enforcer_name || '';
    displayedIncident.details = _editIncidentDetails(
      incident,
      source,
      destination,
      store
    );
    return displayedIncident;
};

const _getEndpointDirection = function(secEvent: any, type: string, side:  string) {
    switch (type) {
      case EVENT_TYPE.THREAT:
        if (
          (secEvent.target === TARGET.SERVER && side == ENDPOINT.SOURCE) ||
          (secEvent.target !== TARGET.SERVER &&
            side == ENDPOINT.DESTINATION)
        ) {
          return {
            domain_name: secEvent.client_workload_domain || '',
            workload_id: secEvent.client_workload_id || '',
            workload_name: secEvent.client_workload_name || '',
            ip: secEvent.client_ip || '',
            port: secEvent.client_port || 0,
            server_conn_port: 0,
            service: secEvent.client_workload_service || '',
            isHyperlinkEnabled: secEvent.client_ip !== secEvent.client_workload_id,
            client_ip: secEvent.client_ip
          };
        } else {
          return {
            domain_name: secEvent.server_workload_domain || '',
            workload_id: secEvent.server_workload_id || '',
            workload_name: secEvent.server_workload_name || '',
            ip: secEvent.server_ip || '',
            port: secEvent.server_port || 0,
            server_conn_port: secEvent.server_conn_port || 0,
            service: secEvent.server_workload_service || '',
            isHyperlinkEnabled: secEvent.server_ip !== secEvent.server_workload_id,
            client_ip: secEvent.client_ip
          };
        }
      case EVENT_TYPE.VIOLATION:
        if (side == ENDPOINT.SOURCE) {
          return {
            domain_name: secEvent.client_domain || '',
            workload_id: secEvent.client_id || '',
            workload_name: secEvent.client_name || '',
            ip: secEvent.client_ip || '',
            port: 0,
            server_conn_port: 0,
            service: secEvent.client_service || '',
            isHyperlinkEnabled: secEvent.client_ip !== secEvent.client_id,
            client_ip: secEvent.client_ip
          };
        } else {
          return {
            domain_name: secEvent.server_domain || '',
            workload_id: secEvent.server_id || '',
            workload_name: secEvent.server_name || '',
            ip: secEvent.server_ip || '',
            port: secEvent.server_port || 0,
            server_conn_port: 0,
            service: secEvent.server_service || '',
            isHyperlinkEnabled: secEvent.server_ip !== secEvent.server_id,
            client_ip: secEvent.client_ip
          };
        }
      case EVENT_TYPE.INCIDENT:
        if (
          (secEvent.conn_ingress && side == ENDPOINT.SOURCE) ||
          (!secEvent.conn_ingress && side == ENDPOINT.DESTINATION)
        ) {
          return {
            domain_name: secEvent.remote_workload_domain || '',
            workload_id: secEvent.remote_workload_id || '',
            workload_name: secEvent.remote_workload_name || '',
            ip: secEvent.server_ip || '',
            port: secEvent.server_port || 0,
            server_conn_port: secEvent.server_conn_port || 0,
            service: secEvent.remote_workload_service || '',
            isHyperlinkEnabled: secEvent.server_ip !== secEvent.remote_workload_id,
            client_ip: secEvent.client_ip
          };
        } else {
          return {
            domain_name: secEvent.workload_domain || '',
            workload_id:  secEvent.workload_id || '',
            workload_name: secEvent.workload_name || '',
            ip: secEvent.client_ip || '',
            port: secEvent.client_port || 0,
            server_conn_port: 0,
            service: secEvent.workload_service || '',
            isHyperlinkEnabled: secEvent.client_ip !== secEvent.workload_id,
            client_ip: secEvent.client_ip
          };
        }
      default:
        return null;
    }
};

const _getEndpointInfo = function(endpoint: any, side: string, ipMap: any) {
    /*
      function: prepareGroup
      description: It only serves for propose rule
    */
    const prepareGroup = function(service: any, endpointName: string) {
      if (service) {
        return service === NV_MAP.securityEventLocation.EXTERNAL
          ? service //external
          : (endpointName.startsWith(NV_MAP.securityEventLocation.IP_GROUP) ?
            `nv.ip.${service}`.replace(/\/|\?|\%|\&|\s/g, ':') /* Add 'nv.ip.' for IP service */:
            `nv.${service}`.replace(/\/|\?|\%|\&|\s/g, ':')); /* Add 'nv.' for learnt service */
            // replace(/\/|\?|\%|\&|\s/g, ':') is for resolving irregular symbol in service name
      } else {
        if (
          endpointName.startsWith(NV_MAP.securityEventLocation.HOST)//Host format is like Host:<host_name or IP>:host ID
        ) {
          let hostName = endpointName.substring(5);
          if (isIpV4(hostName) || isIpV6(hostName)) {
            return endpointName;
          } else {
            return 'nodes';
          }
        } else if (
          endpointName.startsWith(NV_MAP.securityEventLocation.WORKLOAD) // IP workload format is Workload:<workload IP>
        ) {
          let endpointNameParts = endpointName.split(':');
          return `${endpointNameParts[0].trim()}:${endpointNameParts[1].trim()}`;
        } else {
          return ''; //Exception fallback
        }
      }
    };
    if (endpoint.workload_id) {
      let id = endpoint.workload_id;
      let domain = endpoint.domain_name;
      let name = endpoint.workload_name || '';
      let ip = endpoint.ip || '';
      let port = endpoint.port.toString() || '0';
      let server_conn_port = endpoint.server_conn_port.toString() || '0';
      let service = endpoint.service || '';
      let displayName = '';
      let group4Rule = '';
      let endpointOut: any = {
        id: '',
        domain: '',
        icon: '',
        displayName: '',
        externalURL: '',
        service: '',
        countryCode: '',
        countryName: '',
        ip: '',
        group4Rule: '',
        hasDetail: false,
        isHyperlinkEnabled: endpoint.isHyperlinkEnabled
      };
      if (side === ENDPOINT.SOURCE) {
        displayName = getDisplayName(name);
        if (name !== ip && ip) {
          if (displayName) {
            displayName = `${displayName} (${ip})`;
          } else {
            displayName = ip;
          }
        }
        if (id === NV_MAP.securityEventLocation.EXTERNAL) {
          if (ip) {
            endpointOut.countryCode = ipMap[ip].country_code.toLowerCase();
            endpointOut.countryName = ipMap[ip].country_name;
            endpointOut.ip = ip;
            displayName = getDisplayName(name);
          }
          endpointOut.externalURL = `https://www.whois.com/whois/${ip}`;
        }
      } else {
        displayName = getDisplayName(name);
        if (name !== ip && ip) {
          if (displayName) {
            displayName = `${displayName} (${ip})`;
          } else {
            displayName = ip;
          }
        }
        if (id === NV_MAP.securityEventLocation.EXTERNAL) {
          if (ip) {
            endpointOut.countryCode = ipMap[ip].country_code.toLowerCase();
            endpointOut.countryName = ipMap[ip].country_name;
            endpointOut.ip = ip;
            displayName = getDisplayName(name);
          }
          endpointOut.externalURL = `https://www.whois.com/whois/${ip}`;
        } else {
          displayName = getDisplayName(name);
          if (port === server_conn_port && port) {
            if (displayName) {
              displayName = `${displayName}${port !== '0' ? `:${port}` : ''}`;
            } else {
              displayName = port;
            }
          } else {
            if (displayName) {
              displayName = `${displayName}${port !== '0' ? `:${port}` : ''}${server_conn_port !== '0' ? `(${server_conn_port})` : ''}`;
            } else {
              displayName = `${port !== '0' ? `${port}` : ''}${server_conn_port !== '0' ? `(${server_conn_port})` : ''}`;
            }
          }
        }
      }
      if (service) {
        endpointOut.service = service;
      }
      endpointOut.id = id;
      if (name.indexOf(NV_MAP.securityEventLocation.HOST) === 0) {
        endpointOut.icon = 'cluster';
        endpointOut.hasDetail = true;
      }
      else if (name.indexOf(NV_MAP.securityEventLocation.WORKLOAD) === 0) {
        endpointOut.icon = 'workload';
      }
      else if (name.indexOf(NV_MAP.securityEventLocation.EXTERNAL) === 0)
        endpointOut.icon = 'cloud';
      else if (name.indexOf(NV_MAP.securityEventLocation.IP_GROUP) === 0)
        endpointOut.icon = 'system_group';
      else {
        endpointOut.icon = 'workload';
        endpointOut.hasDetail = true;
      }
      endpointOut.displayName = displayName;
      endpointOut.domain = domain;
      endpointOut.group4Rule = prepareGroup(service, name);
      return endpointOut;
    }
    return '';
};

const _convertThreatAction = function(action: string): string {
    if (action.toLowerCase() === 'monitor') return 'alert';
    if (action.toLowerCase() === 'block') return 'deny';
    return action.toLowerCase();
};

const _editThreatDetails = function(threat: any, source: any, destination: any, store: any) {
    const iconMap = {
      Info: 'fa-info',
      Low: 'fa-support',
      Medium: 'fa-bell',
      High: 'fa-bug',
      Critical: 'fa-bomb'
    };
    let details: any = {
      id: '',
      level: {
        name: '',
        cssColor: ''
      },
      action: {
        name: '',
        name4Pdf: '',
        cssColor: ''
      },
      count: 0,
      clusterName: '',
      message: {
        sourceLink: '',
        destinationLink: '',
        icon: '',
        cssColor: '',
        content: '',
        cap_len: 0
      },
      labels: []
    };
    details.id = threat.id;
    details.level.name = threat.level;
    let levelKey: keyof typeof NV_MAP.colourMap = threat.level;
    details.level.cssColor =
      `label-${NV_MAP.colourMap[levelKey]}` || 'label-info';
    details.action.name = getI18Name(
      _convertThreatAction(threat.action),
      store
    );
    details.action.name4pdf = _convertThreatAction(threat.action);
    let actionKey: keyof typeof NV_MAP.colourMap = _convertThreatAction(threat.action) as keyof typeof NV_MAP.colourMap;
    details.action.cssColor =
      `${NV_MAP.colourMap[actionKey]}` || 'info';
    details.count = threat.count;
    details.clusterName = threat.cluster_name;
    details.message.sourceLink = `${source.ip}:${source.port}`;
    details.message.destinationLink = 
      destination.port !== destination.server_conn_port
        ? `${destination.ip}:${destination.port}(${
            destination.server_conn_port
          })`
        : `${destination.ip}:${destination.port}`;
    let severityKey1: keyof typeof iconMap = threat.severity;
    details.message.icon = iconMap[severityKey1];
    let severityKey2: keyof typeof NV_MAP.colourMap = threat.severity;
    details.message.cssColor = NV_MAP.colourMap[severityKey2];
    details.message.content = threat.message
                              .replace('&amp;', '&')
                              .replace('&lt;', '<')
                              .replace('&gt;', '>');
    details.message.cap_len = threat.cap_len;
    details.labels.push(LABELS.NETWORK);
    return details;
};

const _editViolationDetails = function(violation: any, store: any) {
    let details: any = {
      level: {
        name: '',
        cssColor: ''
      },
      port: 0,
      serverPort: '',
      servers: '',
      serverImage: '',
      clusterName: '',
      action: {
        name: '',
        name4Pdf: '',
        cssColor: ''
      },
      message: {
        cssColor: ''
      },
      labels: []
    };
    details.level.name = violation.level;
    let levelKey: keyof typeof NV_MAP.colourMap = violation.level;
    details.level.cssColor =
      `label-${NV_MAP.colourMap[levelKey]}` || 'label-info';
    details.message.cssColor = NV_MAP.colourMap[levelKey];
    details.port = violation.server_port || 0;
    details.serverPort = _getViolationPort(
      violation.ip_proto,
      violation.server_port
    );
    details.serverImage = violation.server_image
      ? violation.server_image
      : null;
    details.clusterName = violation.cluster_name;
    details.action.name = getI18Name(violation.policy_action, store);
    details.action.name4Pdf = violation.policy_action;
    let actionKey: keyof typeof NV_MAP.colourMap = violation.policy_action;
    details.action.cssColor = NV_MAP.colourMap[actionKey] || 'info';
    details.labels.push(LABELS.NETWORK);
    return details;
};

const _editIncidentDetails = function(incident: any, source: any, destination: any, store: any) {
    const iconMap = {
      'Host.File.Modified': 'fa-server',
      'Host.Package.Updated': 'fa-server',
      'Host.Privilege.Escalation': 'fa-server',
      'Host.Suspicious.Process': 'fa-server',
      'Host.Tunnel.Detected': 'fa-server',
      'Host.FileAccess.Violation': 'fa-server',
      'Container.Tunnel.Detected': 'fa-cube',
      'Container.Suspicious.Process': 'fa-cube',
      'Container.Privilege.Escalation': 'fa-cube',
      'Container.File.Modified': 'fa-cube',
      'Container.Package.Updated': 'fa-cube',
      'Container.FileAccess.Violation': 'fa-cube'
    };
    const messageCategoryMap = {
      'Host.File.Modified': 'hostFileModified',
      'Host.Package.Updated': 'hostPackageUpdated',
      'Host.Privilege.Escalation': 'hostPrivilegeEscalation',
      'Container.Privilege.Escalation': 'containerPrivilegeEscalation',
      'Host.Suspicious.Process': 'hostSuspiciousProcess',
      'Container.Suspicious.Process': 'containerSuspiciousProcess',
      'Host.Tunnel.Detected': 'hostTunnelDetected',
      'Container.Tunnel.Detected': 'containerTunnelDetected',
      'Container.File.Modified': 'containerFileModified',
      'Container.Package.Updated': 'containerPackageUpdated',
      'Process.Profile.Violation': 'processProfileViolation',
      'Host.Process.Violation': 'hostProcessViolation',
      'Container.FileAccess.Violation': 'containerFileAccessViolation',
      'Host.FileAccess.Violation': 'hostFileAccessViolation'
    };
    const labelMap = {
      'Host.File.Modified': [LABELS.HOST, LABELS.FILE],
      'Host.Package.Updated': [LABELS.HOST, LABELS.PACKAGE],
      'Host.Privilege.Escalation': [LABELS.HOST, LABELS.PRIVILEGE],
      'Container.Privilege.Escalation': [
        LABELS.CONTAINER,
        LABELS.PRIVILEGE
      ],
      'Host.Suspicious.Process': [LABELS.HOST, LABELS.PROCESS],
      'Container.Suspicious.Process': [LABELS.CONTAINER, LABELS.PROCESS],
      'Host.Tunnel.Detected': [LABELS.HOST, LABELS.TUNNEL],
      'Container.Tunnel.Detected': [LABELS.CONTAINER, LABELS.TUNNEL],
      'Container.File.Modified': [LABELS.CONTAINER, LABELS.FILE],
      'Container.Package.Updated': [LABELS.CONTAINER, LABELS.PACKAGE],
      'Process.Profile.Violation': [LABELS.CONTAINER, LABELS.PROCESS],
      'Host.Process.Violation': [LABELS.HOST, LABELS.PROCESS],
      'Host.FileAccess.Violation': [
        LABELS.HOST,
        LABELS.PROCESS,
        LABELS.FILE
      ],
      'Container.FileAccess.Violation': [
        LABELS.CONTAINER,
        LABELS.PROCESS,
        LABELS.FILE
      ]
    };
    const getAction = (action: string) => {
      return {
        name: getI18Name(action ? action.toUpperCase() : 'ALERT', store),
        name4Pdf: action ? action : 'Alert',
        color: action ? action.toLowerCase() : 'alert'
      };
    };
    let action = getAction(incident.action);
    let details: any = {
      level: {
        name: '',
        cssColor: ''
      },
      action: {
        name: '',
        name4Pdf: '',
        cssColor: ''
      },
      clusterName: '',
      message: {
        content: '',
        icon: '',
        cssColor: '',
        group: '',
        procName: '',
        procPath: '',
        procCmd: '',
        procRealUid: '',
        procRealUser: '',
        procEffectiveUid: '',
        procEffectiveUser: '',
        procParentName: '',
        procParentPath: '',
        etherType: '',
        ipProto: '',
        localIP: '',
        remoteIP: '',
        localPort: '',
        remotePort: '',
        filePath: '',
        fileNames: '',
        messageCategory: '',
        labels: [],
        count: 0
      }
    };
    details.level.name = incident.level;
    let levelKey: keyof typeof NV_MAP.colourMap = incident.level;
    details.level.cssColor =
      `label-${NV_MAP.colourMap[levelKey]}` || 'label-info';
    details.action.name = action.name;
    details.action.name4Pdf = action.name4Pdf;
    let actionKey: keyof typeof NV_MAP.colourMap = action.color as keyof typeof NV_MAP.colourMap;
    details.action.cssColor = NV_MAP.colourMap[actionKey];
    details.clusterName = incident.cluster_name;
    details.message.content = incident.message
                              .replace('&amp;', '&')
                              .replace('&lt;', '<')
                              .replace('&gt;', '>');
    let nameKey1: keyof typeof iconMap = incident.name;
    details.message.icon = iconMap[nameKey1];
    details.message.cssColor = NV_MAP.colourMap[levelKey];
    let nameKey2: keyof typeof messageCategoryMap = incident.name;
    details.message.messageCategory = messageCategoryMap[nameKey2];
    details.message.group = incident.group || '';
    details.message.procName = incident.proc_name || '';
    details.message.procPath = incident.proc_path || '';
    details.message.procCmd = incident.proc_cmd || '';
    details.message.procRealUid = incident.proc_real_uid || '';
    details.message.procEffectiveUid = incident.proc_effective_uid || '';
    details.message.procRealUser = incident.proc_real_user || '';
    details.message.procEffectiveUser = incident.proc_effective_user || '';
    details.message.procParentName = incident.proc_parent_name || '';
    details.message.procParentPath = incident.proc_parent_path || '';
    details.message.etherType = incident.ether_type || '';
    details.message.ipProto = incident.ip_proto || '';
    if (
      incident.server_ip &&
      incident.client_ip &&
      incident.server_port &&
      incident.client_port
    ) {
      details.message.localIP = source.ip;
      details.message.remoteIP = destination.ip;
      details.message.localPort = source.port;
      details.message.remotePort = destination.port;
    } else {
      details.message.localIP = '';
      details.message.remoteIP = '';
      details.message.localPort = '';
      details.message.remotePort = '';
    }
    details.message.filePath = incident.file_path || '';
    details.message.fileNames = incident.file_name
      ? incident.file_name.join(', ')
      : '';
    details.message.count = incident.count ? incident.count : 0;
    let nameKey3: keyof typeof labelMap = incident.name;
    details.labels = labelMap[nameKey3];
    return details;
};

const _getViolationPort = function(ipProto: number, port: number)  {
    let protocol = ipProto;
    if (protocol === 1) return 'icmp';
    else if (protocol === 6) return 'tcp/' + port;
    else if (protocol === 17) return 'udp/' + port;
    else return port;
};

const _getDomainList = function(allSecurityEvents: any[]): any[] {
    let domainSet = new Set();
    allSecurityEvents.forEach(event => {
      if (event.endpoint.source && event.endpoint.source.domain) {
        domainSet.add(event.endpoint.source.domain);
      }
      if (event.endpoint.destination && event.endpoint.destination.domain) {
        domainSet.add(event.endpoint.destination.domain);
      }
    });
    console.log('Domain set: ', domainSet);
    return Array.from(domainSet);
};

const _prepareAutoCompleteData = function(cachedSecurityEvents: any[], domainList: string[]) {
    return {
      domain: domainList,
      host: getAutoCompleteData(e => e.hostName, cachedSecurityEvents),
      source: getAutoCompleteData(
        e => e.endpoint.source.displayName,
        cachedSecurityEvents
      ),
      destination: getAutoCompleteData(
        e => e.endpoint.destination.displayName,
        cachedSecurityEvents
      ),
    };
};

const getAutoCompleteData = function(
    cb: (e: any) => any,
    secEvents: Array<any>
): string[] {
    return Array.from(new Set(secEvents.map(e => cb(e))))
      .filter(s => !!s)
      .sort();
};

const getReviewRulePermission = function(sourceDomain: string, destinationDomain: string) {
    let sourceDomainPermission = getRowBasedPermission(sourceDomain, 'rt_policy');
    let destinationDomainPermission = getRowBasedPermission(destinationDomain, 'rt_policy');
    if (sourceDomainPermission === 'w' && destinationDomainPermission === 'w') {
      return 'w';
    } else if (sourceDomainPermission === '' && destinationDomainPermission === '') {
      return '';
    } else {
      return 'r';
    }
};

export const prepareContext4TwoWayInfinityScroll = function(context: any = null) {
  console.log('securityEventsService.displayedSecurityEvents',  secEventVar.securityEventsServiceData.value.displayedSecurityEvents);
  secEventVar.dateSliderCtx.value.page = context?.page || NV_CONST.TWO_WAY_INFINITE_SCROLL_ARG.page;
  secEventVar.dateSliderCtx.value.begin = context?.begin || NV_CONST.TWO_WAY_INFINITE_SCROLL_ARG.begin;
  secEventVar.dateSliderCtx.value.openedIndex = context?.openedIndex || NV_CONST.TWO_WAY_INFINITE_SCROLL_ARG.openedIndex;
  secEventVar.dateSliderCtx.value.openedPage = context?.openedPage || NV_CONST.TWO_WAY_INFINITE_SCROLL_ARG.openedPage;
  secEventVar.dateSliderCtx.value.limit = context?.limit || NV_CONST.TWO_WAY_INFINITE_SCROLL_ARG.limit;
  secEventVar.dateSliderCtx.value.array = secEventVar.securityEventsServiceData.value.displayedSecurityEvents;
  console.log("secEventVar.dateSliderCtx.value", secEventVar.dateSliderCtx.value);
};

export const filterSecEvents = function(): void {

  console.log('Filter', secEventVar.securityEventsServiceData.value.filterItems);

  secEventVar.securityEventsServiceData.value.displayedSecurityEvents = secEventVar.securityEventsServiceData.value.cachedSecurityEvents.filter(event => {
    return (
      _dateFilter(secEventVar.securityEventsServiceData.value.filterItems.dateFrom, secEventVar.securityEventsServiceData.value.filterItems.dateTo, event.reportedTimestamp) && 
      _severityFilter(event.details.level.name, secEventVar.securityEventsServiceData.value.filterItems.severity) &&
      _locationFilter(event.details.labels, secEventVar.securityEventsServiceData.value.filterItems.location) &&
      _categoryFilter(event.details.labels, secEventVar.securityEventsServiceData.value.filterItems.category) &&
      _otherFilter(event.details.labels, secEventVar.securityEventsServiceData.value.filterItems.other) &&
      _sourceFilter(
        event.endpoint.source.displayName,
        secEventVar.securityEventsServiceData.value.filterItems.source
      ) &&
      _destinationFilter(
        event.endpoint.destination.displayName,
        secEventVar.securityEventsServiceData.value.filterItems.destination
      ) &&
      _nodeFilter(event.host_name, secEventVar.securityEventsServiceData.value.filterItems.host) &&
      _domainFilter(
        event.endpoint.source.domain,
        event.endpoint.destination.domain,
        secEventVar.securityEventsServiceData.value.filterItems.selectedDomains
      ) &&
      _includeFilter(event, secEventVar.securityEventsServiceData.value.filterItems.includedKeyword) &&
      _excludeFilter(event, secEventVar.securityEventsServiceData.value.filterItems.excludedKeyword)
    );
  });
  prepareContext4TwoWayInfinityScroll();
};

export const parseAdvFilterParam = function(filters: any) {
  let category = parseBooleanObject2TrueKeys(filters.category);
  let location = parseBooleanObject2TrueKeys(filters.location);
  let severity = parseBooleanObject2TrueKeys(filters.severity);
  let other = filters.other ? ['other'] : [];
  let selectedDomains = filters.domains;
  return {
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    severity: severity,
    location: location,
    category: category,
    other: other,
    host: filters.host,
    source: filters.source,
    destination: filters.destination,
    selectedDomains: selectedDomains,
    includedKeyword: filters.includedKeyword,
    excludedKeyword: filters.excludedKeyword
  }
};

export const loadFilters = function(filters: any) {
  secEventVar.securityEventsServiceData.value.filterItems.dateFrom = filters.dateFrom;
  secEventVar.securityEventsServiceData.value.filterItems.dateTo = filters.dateTo;
  secEventVar.securityEventsServiceData.value.filterItems.severity = filters.severity;
  secEventVar.securityEventsServiceData.value.filterItems.location = filters.location;
  secEventVar.securityEventsServiceData.value.filterItems.category = filters.category;
  secEventVar.securityEventsServiceData.value.filterItems.other = filters.other;
  secEventVar.securityEventsServiceData.value.filterItems.host = filters.host;
  secEventVar.securityEventsServiceData.value.filterItems.source = filters.source;
  secEventVar.securityEventsServiceData.value.filterItems.destination = filters.destination;
  secEventVar.securityEventsServiceData.value.filterItems.selectedDomains = filters.selectedDomains;
  secEventVar.securityEventsServiceData.value.filterItems.includedKeyword = filters.includedKeyword;
  secEventVar.securityEventsServiceData.value.filterItems.excludedKeyword = filters.excludedKeyword;
  console.log('secEventVar.securityEventsServiceData.value.filterItems', secEventVar.securityEventsServiceData.value.filterItems)
}

const parseBooleanObject2TrueKeys = function(obj: any) {
  return Object.entries(obj).filter(([k, v]) => v).map(([k, v]) => k);
};

const _dateFilter = function(dateFrom: number, dataTo: number, reportedTimestamp: number) {
  return dateFrom === 0 && dataTo === 0 || reportedTimestamp * 1000 >= dateFrom && reportedTimestamp * 1000 <= dataTo;
};

const _severityFilter = function(severity: string, selectedSeverities: string[]) {
  return selectedSeverities.length > 0
    ? selectedSeverities.includes(severity.toLowerCase())
    : true;
};

const _locationFilter = function(location: string[], selectedLocations: string[]) {
  let res = false;
  for (let selectedLocation of selectedLocations) {
    if (selectedLocation) {
      if (location.includes(selectedLocation.toLowerCase())) {
        res = true;
        break;
      }
    }
  }
  return selectedLocations.length > 0 ? res : true;
};

const _categoryFilter = function(category: string[], selectedCategories: string[]) {
  let res = false;
  for (let selectedCategory of selectedCategories) {
    if (selectedCategory) {
      if (category.includes(selectedCategory.toLowerCase())) {
        res = true;
        break;
      }
    }
  }
  return selectedCategories.length > 0 ? res : true;
};

const _otherFilter = function(other: string[], selectedOther: string[]) {
  return selectedOther[0] ? other.length === 0 : true;
};

const _sourceFilter = function(source: string, selectedSource: string) {
  return selectedSource ? source === selectedSource : true;
};

const _destinationFilter = function(destination: string, selectedDestination: string) {
  return selectedDestination ? destination === selectedDestination : true;
};

const _nodeFilter = function(host: string, selectedHost: string) {
  return selectedHost ? host === selectedHost : true;
};

const _domainFilter = function(
  sourceDomain: string,
  destinationDomain: string,
  selectedDomains: string[]
) {
  return selectedDomains.length > 0
    ? selectedDomains.includes(sourceDomain) ||
        selectedDomains.includes(destinationDomain)
    : true;
};

const _includeFilter = function(event: any, keyword: string) {
  if (!keyword) return true;
  const _event = Object.assign({}, event);
  _event.reported_at = dayjs(event.reported_at).format('MMM DD, YY HH:mm:ss') as string;
  return getValueString(_event).includes(keyword.toLowerCase());
};

const _excludeFilter = function(event: any, keyword: string) {
  if (!keyword) return true;
  const _event = Object.assign({}, event);
  _event.reported_at = dayjs(event.reported_at).format('MMM DD, YY HH:mm:ss') as string;
  return !getValueString(_event).includes(keyword.toLowerCase());
};

const getValueString = function(event: any): any {
  return Object.values(event)
    .map((value: any) => {
      if (typeof value === 'object' && !!value) {
        return getValueString(value);
      } else if (typeof value === 'string' || typeof value === 'number') {
        return value.toString().toLowerCase();
      } else {
        return value;
      }
    })
    .join(',');
};

export function getCsvData(secEvents: any[], metadata: any) {
  return secEvents.map((secEvent, $index) => {
    return _organizeSecEventTblRow(secEvent, $index, metadata, 'csv');
  });
};

const _organizeSecEventTblRow = function(
  secEvent: any,
  index: number,
  metadata: any,
  format: string
) {
  let resPrototype = {
    ID: '',
    Title: '',
    Severity: '',
    Location: '',
    Details: '',
    Action: '',
    Datetime: '',
  };
  const lineBreak = format === 'csv' ? '\n' : '<br/>';
  resPrototype.ID = (index + 1).toString();
  resPrototype.Title = `${secEvent.name.replace(/\"/g, "'")}`;
  resPrototype.Severity = secEvent.details.level
    ? secEvent.details.level.name
    : '';
  resPrototype.Location = `${_organizeLocation(
    secEvent,
    metadata
  ).stack[0].ul.join(lineBreak)}`;
  resPrototype.Details = `${_organizeSecEventDetails(secEvent, metadata)!
    .stack.map(function (elem) {
      return typeof elem === 'string' ? elem : elem.ul.join(lineBreak);
    })
    .join(lineBreak)
    .replace(/\"/g, "'")}`;
  resPrototype.Action = secEvent.details.action
    ? secEvent.details.action.name
    : '';
  resPrototype.Datetime = `${secEvent.reportedAt}`;
  return resPrototype;
};

const _organizeLocation = function(secEvent: any, metadata: any) {
  if (secEvent.endpoint.source && secEvent.endpoint.destination) {
    return {
      stack: [
        {
          ul: [
            `${metadata.items.source}: ${
              secEvent.endpoint.source.domain
                ? `${secEvent.endpoint.source.domain}: `
                : ''
            }${secEvent.endpoint.source.displayName}`,
            `${metadata.items.destination}: ${
              secEvent.endpoint.destination.domain
                ? `${secEvent.endpoint.destination.domain}: `
                : ''
            }${secEvent.endpoint.destination.displayName} (${secEvent.endpoint.destination.ip})`,
          ],
        },
      ],
    };
  } else if (
    secEvent.endpoint.source &&
    !secEvent.details.labels.includes('host')
  ) {
    return {
      stack: [
        {
          ul: [
            `${metadata.items.host}: ${secEvent.host_name}`,
            `${metadata.items.container}: ${
              secEvent.endpoint.source.domain
                ? `${secEvent.endpoint.source.domain}: `
                : ''
            }${secEvent.endpoint.source.displayName}`,
          ],
        },
      ],
    };
  } else if (
    secEvent.endpoint.destination &&
    !secEvent.details.labels.includes('host')
  ) {
    return {
      stack: [
        {
          ul: [
            `${metadata.items.host}: ${secEvent.host_name}`,
            `${metadata.items.container}: ${
              secEvent.endpoint.destination.domain
                ? `${secEvent.endpoint.destination.domain}: `
                : ''
            }${secEvent.endpoint.destination.displayName}`,
          ],
        },
      ],
    };
  } else {
    return {
      stack: [
        {
          ul: [`${metadata.items.host}: ${secEvent.host_name}`],
        },
      ],
    };
  }
};

const _organizeSecEventDetails = function(secEvent: any, metadata: any) {
  let ul: any[] = [];

  switch (secEvent.type.name) {
    case 'threat':
      if (secEvent.details.clusterName)
        ul.push(
          `${metadata.items.clusterName}: ${secEvent.details.clusterName}`
        );
      if (secEvent.applications)
        ul.push(
          `${metadata.items.applications}: ${secEvent.applications}`
        );
      if (secEvent.details.count)
        ul.push(`${metadata.items.count}: ${secEvent.details.count}`);
      if (secEvent.details.message.content)
        ul.push(
          `${metadata.items.description}: ${secEvent.details.message.content}`
        );
      return { stack: [{ ul: ul }] };
    case 'violation':
      if (secEvent.details.clusterName)
        ul.push(
          `${metadata.items.clusterName}: ${secEvent.details.clusterName}`
        );
      if (secEvent.applications)
        ul.push(
          `${metadata.items.applications}: ${secEvent.applications}`
        );
      if (secEvent.details.serverPort)
        ul.push(
          `${
            secEvent.details.port > 0
              ? metadata.items.serverPort
              : metadata.items.protocol
          }: ${secEvent.details.serverPort}`
        );
      if (secEvent.details.serverImage)
        ul.push(
          `${metadata.items.serverImage}: ${secEvent.details.serverImage}`
        );
      return { stack: [{ ul: ul }] };
    case 'incident':
      if (secEvent.details.clusterName)
        ul.push(
          `${metadata.items.clusterName}: ${secEvent.details.clusterName}`
        );
      if (secEvent.details.message.group)
        ul.push(
          `${metadata.items.group}: ${secEvent.details.message.group}`
        );
      if (secEvent.details.message.procName)
        ul.push(
          `${metadata.items.procName}: ${secEvent.details.message.procName}`
        );
      if (secEvent.details.message.procPath)
        ul.push(
          `${metadata.items.procPath}: ${secEvent.details.message.procPath}`
        );
      if (secEvent.details.message.procCmd)
        ul.push(
          `${metadata.items.procCmd}: ${secEvent.details.message.procCmd}`
        );
      if (
        secEvent.details.message.procCmd &&
        secEvent.name.toLowerCase().indexOf('process') < 0 &&
        secEvent.name.toLowerCase().indexOf('escalation') < 0 &&
        secEvent.name.toLowerCase().indexOf('detected') < 0
      )
        ul.push(
          `${metadata.items.cmd}: ${secEvent.details.message.procCmd}`
        );
      if (secEvent.details.message.procEffectiveUid)
        ul.push(
          `${metadata.items.procEffectedUid}: ${secEvent.details.message.procEffectiveUid}`
        );
      if (secEvent.details.message.procEffectiveUser)
        ul.push(
          `${metadata.items.procEffectedUser}: ${secEvent.details.message.procEffectiveUser}`
        );
      if (secEvent.details.message.localIP)
        ul.push(
          `${metadata.items.localIp}: ${secEvent.details.message.localIP}`
        );
      if (secEvent.details.message.remoteIP)
        ul.push(
          `${metadata.items.remoteIp}: ${secEvent.details.message.remoteIP}`
        );
      if (secEvent.details.message.localPort)
        ul.push(
          `${metadata.items.localPort}: ${secEvent.details.message.localPort}`
        );
      if (secEvent.details.message.localPort)
        ul.push(
          `${metadata.items.remotePort}: ${secEvent.details.message.localPort}`
        );
      if (secEvent.details.message.ipProto)
        ul.push(
          `${metadata.items.ipProto}: ${secEvent.details.message.ipProto}`
        );
      if (secEvent.details.message.filePath)
        ul.push(
          `${metadata.items.filePath}: ${secEvent.details.message.filePath}`
        );
      if (secEvent.details.message.fileNames)
        ul.push(
          `${metadata.items.fileNames}: ${secEvent.details.message.fileNames}`
        );
      return {
        stack: [secEvent.details.message.content, { ul: ul }],
      };
    default:
      return null;
  }
};
