<script>
import BarChart4Exposures from '../charts/BarChart4Exposures';
import ExposureReport from '../buttons/ExposureReport';
import ExposureGrid from '../grids/ExposureGrid';
import Tabbed from '@shell/components/Tabbed';
import Tab from '@shell/components/Tabbed/Tab';
import { v4 as uuidv4 } from 'uuid';
import { getIpInfo } from '../../../plugins/dashboard-class';
import { NV_CONST } from '../../../types/neuvector';

export default {
    components: {
        BarChart4Exposures,
        ExposureReport,
        ExposureGrid,
        Tabbed,
        Tab,
    },

    async fetch() {
        let ipList = this.getIpList(this.ingress, this.egress);
        this.hierarchicalIngressList = null,
        this.hierarchicalEgressList = null

        try {
            let ipInfoRes = await getIpInfo(ipList);

            this.ipMap = ipInfoRes.data.ip_map;
            this.hierarchicalIngressList = this.parseExposureHierarchicalData(
                this.addIpLocation(this.ingress, this.ipMap, NV_CONST.INGRESS)
            ) || [];
            this.hierarchicalEgressList = this.parseExposureHierarchicalData(
                this.addIpLocation(this.egress, this.ipMap, NV_CONST.EGRESS)
            ) || [];
            console.log("this.hierarchicalIngressList", this.hierarchicalIngressList, this.hierarchicalEgressList)
        } catch(error) {
            console.error(error);
        }
    },

    methods: {
        getIpList: function(ingress, egress) {
            return ingress.flatMap(ingress => {
                return ingress.entries ? ingress.entries.map(entry => entry.client_ip) : [];
            }).concat(egress.flatMap(egress => {
                return egress.entries ? egress.entries.map(entry => entry.server_ip) : [];
            }));
        },
        groupBy: function(arr, key) {
            return arr.reduce((groups, item) => {
                (groups[item[key]] ||= []).push(item);
                return groups;
            }, {});
        },
        parseExposureHierarchicalData: function(exposure) {
            let hierarchicalExposures = [];
            if (exposure.length === 0) return hierarchicalExposures;
            let groupedExposure = this.groupBy(exposure, 'service');

            Object.entries(groupedExposure).forEach(([k, v]) => {
                let applicationSet = new Set();
                v.forEach(child => {
                if (child.applications) {
                    child.applications.forEach(app => {
                    applicationSet.add(app);
                    });
                }
                if (child.ports) {
                    child.ports.forEach(port => {
                    applicationSet.add(port);
                    });
                }
                });
                let hierarchicalExposure = {
                    workload_id: '',
                    peerEndpoint: '',
                    service: k,
                    policy_mode: v[0].policy_mode,
                    high: v[0].high,
                    medium: v[0].medium,
                    workload: '',
                    bytes: 0,
                    sessions: 0,
                    severity: '',
                    policy_action: v[0].policy_action,
                    event_type: '',
                    protocols: '',
                    applications: Array.from(applicationSet),
                    ports: [],
                    entries: this.summarizeEntries(v),
                    children: v.map(child => ({
                        ...child,
                        service: '',
                    })),
                };
                if (hierarchicalExposure.policy_action !== NV_CONST.POLICY_ACTION.OPEN) {
                    hierarchicalExposures.push(
                        JSON.parse(JSON.stringify(hierarchicalExposure))
                    );
                }
            });
            return hierarchicalExposures;
        },
        addIpLocation: function(exposureList, ipMap, direction) {
            return exposureList
            .sort((a, b) => (a.service + a.pod_name).localeCompare(b.service + b.pod_name))
            .map((exposure) => {
                exposure.entries = exposure.entries?.map(entry => {
                    entry.id = uuidv4();
                    entry.ip = direction === NV_CONST.INGRESS ? entry.client_ip : entry.server_ip;
                    entry.country_code = ipMap[entry.ip || ''].country_code.toLowerCase();
                    entry.country_name = ipMap[entry.ip || ''].country_name;
                    return entry;
                }) || [];
                return exposure;
            });
        },
        summarizeEntries: function(exposedPods) {
            let entryMap = {};
            exposedPods.forEach(expsosedPod => {
                expsosedPod.entries.forEach(entry => {
                if (entryMap[entry.ip]) {
                    if (entry.application) {
                        entryMap[entry.ip].applications = this.accumulateProtocols(
                            entryMap[entry.ip].applications,
                            entry.application
                        );
                    }
                    if (entry.port) {
                        entryMap[entry.ip].applications = this.accumulateProtocols(
                            entryMap[entry.ip].applications,
                            entry.port
                        );
                    }
                    entryMap[entry.ip].applications = entryMap[entry.ip].applications.filter(app => !!app);
                    entryMap[entry.ip].sessions += entry.sessions;
                        entryMap[entry.ip].policy_action = this.accumulateActionLevel(
                        entryMap[entry.ip].action,
                    entry.policy_action
                    );
                } else {
                    entryMap[entry.ip] = {
                        applications: [entry.application],
                        sessions: entry.sessions,
                        policy_action: entry.policy_action,
                        ip: entry.ip,
                        fqdn: entry.fqdn || '',
                        country_code: entry.country_code,
                        country_name: entry.country_name,
                    };
                }
                });
            });
            return Object.values(entryMap);
        },
        accumulateActionLevel: function(
            accuAction = 'allow',
            currAction
        ) {
            const actionMap = {
                deny: 3,
                alert: 2,
                allow: 1,
            };
            return actionMap[accuAction.toLowerCase()] >
                actionMap[currAction.toLowerCase()]
                ? accuAction
                : currAction;
        },
        accumulateProtocols: function(accuApps, currApp) {
            if (!accuApps.includes(currApp)) accuApps.push(currApp);
            return accuApps;
        }
    },

    props: {
        token: String,
        ns: String,
        ingress: Array,
        egress: Array,
        rancherTheme: String,
        currentClusterId: String
    },

    data() {
        return {
            ipMap: null,
            hierarchicalIngressList: null,
            hierarchicalEgressList: null
        }
    },

    computed: {
        
    }
};
</script>

<template>
    <div class="get-started" v-if="hierarchicalIngressList && hierarchicalEgressList">
        <BarChart4Exposures :parentContext="this" :hierarchicalIngressList="hierarchicalIngressList" :hierarchicalEgressList="hierarchicalEgressList"/>
        <Tabbed defaultTab="" class="exposure-grid-group">
            <Tab name="ingress" :label="t('dashboard.body.panel_title.INGRESS')">
                <ExposureGrid :exposureInfo="hierarchicalIngressList" exposureType="ingress" :rancherTheme="rancherTheme"/>
            </Tab>
            <Tab name="egress" :label="t('dashboard.body.panel_title.EGRESS')">
                <ExposureGrid :exposureInfo="hierarchicalEgressList" exposureType="egress" :rancherTheme="rancherTheme"/>
            </Tab>
            <ExposureReport class="exposure-report-btn" :ingress="ingress" :egress="egress"/>
        </Tabbed>
    </div>
</template>

<style>
    .exposure-grid-group {
        position: relative;
    }
    .exposure-report-btn {
        position: absolute;
        top: 10px;
        right: 10px;
    }
</style>../../../plugins/dashboard-class