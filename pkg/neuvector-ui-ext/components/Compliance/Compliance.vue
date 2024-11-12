<script>
    import AsyncButton from '@shell/components/AsyncButton';
    import Loading from '@shell/components/Loading';
    import ButtonDropdown from '@shell/components/ButtonDropdown';
    import SimpleBox from '@shell/components/SimpleBox';
    import LabeledSelect from '@shell/components/form/LabeledSelect';
    import TopImpactComplianceBarChart from './charts/TopImpactComplianceBarChart.vue';
    import TopImpactComplianceContainerBarChart from './charts/TopImpactComplianceContainerBarChart.vue';
    import ComplianceItemsTable from './contents/ComplianceItemsTable.vue';
    import ComplianceItemsDetail from './contents/ComplianceItemsDetail.vue';
    import ComplianceItemsChart from './contents/ComplianceItemsChart.vue';
    import { getDomains, getContainerBrief, getAvailableFilters, getCompliance } from '../../plugins/compliance-class';
    import { SERVICE } from '@shell/config/types';
    import { nvVariables, NV_CONST, RANCHER_CONST } from '../../types';
    import { arrayToCsv, setRisks } from '../../utils/common';
    import { refreshAuth } from '../../plugins/neuvector-class'; 
    import { getCsvData, preprocessCompliance } from '../../utils/compliance';
    import { saveAs } from 'file-saver';
    import dayjs from 'dayjs';

    export default {
        components: {
            AsyncButton,
            Loading,
            ButtonDropdown,
            SimpleBox,
            LabeledSelect,
            TopImpactComplianceBarChart,
            TopImpactComplianceContainerBarChart,
            ComplianceItemsTable,
            ComplianceItemsDetail,
            ComplianceItemsChart
        },
        async fetch() {
            if ( this.$store.getters['cluster/canList'](SERVICE) ) {
                this.allServices = await this.$store.dispatch('cluster/findAll', { type: SERVICE }, { root: true });
                if ( Array.isArray(this.allServices) && this.allServices.length ) {
                    nvVariables.ns = this.allServices.find(svc => svc?.id?.includes(NV_CONST.NV_SERVICE)).metadata.namespace
                }
            }
            this.currentCluster = this.$store.getters['currentCluster'];
            nvVariables.currentCluster = this.currentCluster.id;
            await this.loadData();
        },
        props: {
        },
        computed: {
            isLightTheme: function() {
                nvVariables.isLightTheme = sessionStorage.getItem(RANCHER_CONST.R_THEME) !== RANCHER_CONST.THEME.DARK;
                return nvVariables.isLightTheme;
            }
        },
        data() {
            return {
                pieChartActive: false,
                selectedCompliance: null,
                workloadMap: new Map(),
                complianceDist: {
                    error: 0,
                    high: 0,
                    warning: 0,
                    note: 0,
                    pass: 0,
                    info: 0,
                    platform: 0,
                    image: 0,
                    node: 0,
                    container: 0,
                },
                complianceData: Object,
                domains: Array,
                availableFilters: null,
            };
        },
        methods: {
            downloadCsv() {
                let csv = arrayToCsv(getCsvData(nvVariables.complianceData.filteredCis, nvVariables.complianceData.advFilter));
                let blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
                saveAs(blob, `compliance_${dayjs(new Date()).format('YYYYMMDDHHmmss')}.csv`);
            },
            updateCountDist() {
                this.complianceDist = {
                    error: 0,
                    high: 0,
                    warning: 0,
                    note: 0,
                    pass: 0,
                    info: 0,
                    platform: 0,
                    image: 0,
                    node: 0,
                    container: 0,
                };
                this.makeComplianceDist(nvVariables.complianceData.filteredCis);
            },
            async loadData() {
                try {
                    console.log('Compliance');
                    this.authRes = await refreshAuth();
                    nvVariables.user = this.authRes.data.token;
                    this.domains = (await getDomains()).data.domains
                        .map(domain => domain.name)
                        .filter(domain => domain.charAt(0) !== '_');
                    await this.makeWorkloadMap();
                    this.availableFilters = (await getAvailableFilters()).data.available_filter;
                    let complianceData = preprocessCompliance((await getCompliance()).data);
                    this.makeComplianceDist(complianceData.compliances);
                    this.complianceData = this.mapWorkloadService(complianceData);
                    setRisks(this.complianceData.compliances, this.workloadMap);
                    nvVariables.complianceData.filteredCis = this.complianceData.compliances;
                    console.log(this.domains, this.complianceData, this.complianceDist);
                } catch(error) {
                    console.error(error);
                }
            },
            makeComplianceDist(compliances) {
                compliances.forEach(compliance => {
                    if (compliance.level === 'WARN') this.complianceDist.warning += 1;
                    if (compliance.level === 'INFO') this.complianceDist.info += 1;
                    if (compliance.level === 'PASS') this.complianceDist.pass += 1;
                    if (compliance.level === 'NOTE') this.complianceDist.note += 1;
                    if (compliance.level === 'ERROR') this.complianceDist.error += 1;
                    if (compliance.level === 'HIGH') this.complianceDist.high += 1;
                    if (compliance.platforms.length) this.complianceDist.platform += 1;
                    if (compliance.images.length) this.complianceDist.image += 1;
                    if (compliance.nodes.length) this.complianceDist.node += 1;
                    if (compliance.workloads.length) this.complianceDist.container += 1;
                });
            },
            async makeWorkloadMap() {
                let workloads = await getContainerBrief();
                workloads.data.workloads.forEach(workload => {
                    this.workloadMap.set(workload.id, workload);
                    if (workload.children) {
                        workload.children.forEach(child => {
                            this.workloadMap.set(child.id, workload);
                        });
                    }
                });
                nvVariables.complianceData.workloadMap = this.workloadMap;
            },
            mapWorkloadService(compliance) {
                let compliances = compliance.compliances.map(item => {
                    let services = new Set();
                    item.workloads.forEach(workload => {
                        let workloadDetails = this.workloadMap.get(workload.id);
                        services.add(workloadDetails.service);
                    });
                    item.services = Array.from(services);
                    return item;
                });
                compliance.compliances = compliances;
                return compliance;
            },
            togglePieChart(value) {
                this.pieChartActive = value;
            },
            setSelectedCompliance(selectedCompliance) {
                this.selectedCompliance = selectedCompliance;
            },
            async refresh(buttonCb) {
                try {
                    await this.loadData();
                    buttonCb(true);
                } catch (err) {
                    buttonCb(false);
                }
            },
        }
    };
</script>

<template>
    <Loading v-if="$fetchState.pending" />
    <div v-else class="compliance">
        <div class="screen-area">
            <div id="bench" class="padding-top-0">
                <div class="clearfix">
                    <div class="fixed-header-actions">
                        <div class="bulk bulk d-flex align-items-center">
                            <h1 class="font-weight-light" id="vulnerabilities-title">
                                {{ t('sidebar.nav.BENCH') }}
                            </h1>
                        </div>
                        <div class="search row">
                            <div class="d-flex align-items-center justify-content-end">
                                <button @click="downloadCsv()" class="btn role-secondary mr-10">
                                    <i class="icon icon-lg icon-file"></i>
                                    <span>{{ t('scan.EXPORT') }}</span>
                                </button>
                                <AsyncButton
                                    ref="refresh"
                                    class=" d-flex justify-content-center align-items-center" 
                                    :actionLabel="t('general.REFRESH')" 
                                    :waitingLabel="t('general.REFRESHING')"  
                                    :successLabel="t('general.REFRESH')" 
                                    icon="icon-refresh" 
                                    @click="refresh"
                                >
                                </AsyncButton>
                            </div>
                        </div>
                    </div>
                    <div class="bench-charts">
                        <div>
                            <div class="mb-10 chart-title" style="line-height: 15px;">
                                <span class="mr-10">{{ t('cis.report.others.TOP_IMPACTFUL_COMP') }}</span>
                            </div>
                            <TopImpactComplianceBarChart 
                                v-if="complianceData"
                                :compliances="complianceData.compliances"
                            />
                        </div>
                        <div>
                            <TopImpactComplianceContainerBarChart 
                                v-if="complianceData"
                                :compliances="complianceData.compliances"
                            />
                        </div>
                    </div>
                    <SimpleBox class="mt-10">
                        <div class="grid-area">
                            <ComplianceItemsTable 
                                v-if="complianceData" 
                                :isLightTheme="isLightTheme"
                                :complianceData="complianceData"
                                :domains="domains"
                                :availableFilters="availableFilters"
                                @togglePieChart="togglePieChart"
                                @setSelectedCompliance="setSelectedCompliance"
                                @updateCountDist="updateCountDist"
                            ></ComplianceItemsTable>
                            <div v-if="selectedCompliance">
                                <ComplianceItemsChart
                                    v-if="pieChartActive"
                                    :complianceDist="complianceDist"
                                ></ComplianceItemsChart>
                                <ComplianceItemsDetail
                                    v-else
                                    :selectedCompliance="selectedCompliance"
                                    :isLightTheme="isLightTheme"
                                ></ComplianceItemsDetail>
                            </div>
                        </div>
                    </SimpleBox>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import '../../styles/compliance.scss';
    @import '../../styles/neuvector.scss';

    @media print {
        @page {
            size: landscape;
            @bottom-right {
            content: counter(page) ' of ' counter(pages);
            }
        }
        .screen-area,
        #__layout nav,
        #__layout header {
            display: none;
            width: 0;
            height: 0;
        }
        .printable-area {
            visibility: visible;
            position: absolute;
            top: 0;
            left: 0;
            overflow-y: auto;
            height: auto;
            width: 1000px;
        }
        .pagebreak {
            clear: both;
            page-break-after: always;
        }
    }
    @media screen {
        .printable-area {
            visibility: hidden;
            position: absolute;
            height: 0;
            overflow: hidden;
            width: 1000px;
        }
    }
</style>