<script>
    import AsyncButton from '@shell/components/AsyncButton';
    import Loading from '@shell/components/Loading';
    import ButtonDropdown from '@shell/components/ButtonDropdown';
    import SimpleBox from '@shell/components/SimpleBox';
    import LabeledSelect from '@shell/components/form/LabeledSelect';
    import TopVulnerableNodesBarChart from './charts/TopVulnerableNodesBarChart.vue';
    import TopVulnerableImagesBarChart from './charts/TopVulnerableImagesBarChart.vue';
    import VulnerabilityItemsTable from './contents/VulnerabilityItemsTable.vue';
    import VulnerabilityItemsChart from './contents/VulnerabilityItemsChart.vue';
    import VulnerabilityItemsDetail from './contents/VulnerabilityItemsDetail.vue';
    import AdvancedFilterModal from './dialogs/AdvancedFilterModal.vue';
    import { getDomains, postVulnerabilityQuery } from '../../plugins/vulnerabilities-class';
    import { SERVICE } from '@shell/config/types';
    import { nvVariables, NV_CONST, RANCHER_CONST } from '../../types';
    import { refreshAuth } from '../../plugins/neuvector-class'; 
    import { initVulQuery } from '../../utils/vulnerabilities';
    import FileExportModal from './dialogs/FileExportModal.vue';
    import Error from '../common/error/Error';

    export default {
        components: {
            AsyncButton,
            Loading,
            ButtonDropdown,
            SimpleBox,
            LabeledSelect,
            TopVulnerableNodesBarChart,
            TopVulnerableImagesBarChart,
            VulnerabilityItemsTable,
            VulnerabilityItemsChart,
            VulnerabilityItemsDetail,
            AdvancedFilterModal,
            FileExportModal,
            Error,
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
            try {
                console.log('Vulnerabilities');
                this.authRes = await refreshAuth();
                nvVariables.user = this.authRes.data.token;
                this.domains = (await getDomains()).data.domains
                    .map(domain => domain.name)
                    .filter(domain => domain.charAt(0) !== '_');
                this.vulQueryData = (await postVulnerabilityQuery(this.vulQuery)).data;
                console.log(this.domains, this.vulQueryData);
            } catch(error) {
                console.error(error);
                this.errorRes = error;
            }
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
                vulnerabilityViewsOptions: [ 
                    this.t('scan.report.view.ALL'), 
                    this.t('scan.report.view.CONTAINERS'), 
                    this.t('scan.report.view.INFRASTRUCTURE'),
                    this.t('scan.report.view.REGISTRY')
                ],
                selectedView: this.t('scan.report.view.ALL'),
                vulQuery: initVulQuery(),
                pieChartActive: false,
                selectedVul: null,
                vulQueryData: Object,
                domains: Array,
                errorRes: null,
            };
        },
        methods: {
            triggerRefresh() {
               this.$refs.refresh.$el.click();
            },
            togglePieChart(value) {
                this.pieChartActive = value;
            },
            setSelectedVul(selectedVul) {
                this.selectedVul = selectedVul;
            },
            async setAdvFilter(filter) {
                if (filter) {
                    this.vulQuery = {...this.vulQuery, ...filter};
                } else {
                    this.vulQuery = {...initVulQuery(), viewType: this.vulQuery.viewType };
                }
                this.vulQueryData = (await postVulnerabilityQuery(this.vulQuery)).data;
            },
            openAdvFilter() {
                this.$refs.advFilter.show();
            },
            openFileExportDialog() {
                this.$refs.fileExport.show();
            },
            closeAdvFilter(filter) {
                if (filter.reset) {
                    this.setAdvFilter();
                } else {
                    this.setAdvFilter(filter);
                }
            },
            async changeView(value) {
                this.selectedView = value;
                this.vulQuery.viewType = this.selectedView.toLowerCase();
                this.vulQueryData = (await postVulnerabilityQuery(this.vulQuery)).data;
            },
            async refresh(buttonCb) {
                try {
                    this.vulQueryData = (await postVulnerabilityQuery(this.vulQuery)).data
                    buttonCb(true)
                } catch (err) {
                    buttonCb(false);
                }
            },
        }
    };
</script>

<template>
    <Loading v-if="$fetchState.pending" />
    <div v-else-if="errorRes" :rancherTheme="rancherTheme" class="container">
        <Error :error="errorRes"></Error>
    </div>
    <div v-else class="vulnerabilities">
        <div class="screen-area">
            <div id="scan" class="padding-top-0">
                <div class="clearfix">
                    <div class="fixed-header-actions">
                        <div class="bulk bulk d-flex align-items-center">
                            <h1 class="font-weight-light" id="vulnerabilities-title">
                                {{ t('sidebar.nav.SCAN') }}
                            </h1>
                            <LabeledSelect
                                class="view-select ml-15"
                                v-model="selectedView"
                                :close-on-select="true"
                                :multiple="false"
                                :label="t('scan.report.view.TITLE')"
                                :options="vulnerabilityViewsOptions"
                                @input="changeView"
                            />
                        </div>
                        <div class="search row">
                            <div class="d-flex align-items-center">
                                <button @click="openFileExportDialog()" class="mr-10 btn role-secondary">
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
                    <div class="vul-charts">
                        <div>
                            <div class="mb-10 chart-title" style="line-height: 15px;">
                                <span class="mr-10">{{ t('scan.report.others.TOP_VULNERABLE_HOSTS') }}</span>
                            </div>
                            <TopVulnerableNodesBarChart 
                                v-if="vulQueryData?.summary?.top_nodes" 
                                :topVulHosts="vulQueryData.summary.top_nodes"
                            />
                        </div>
                        <div>
                            <div class="mb-10 chart-title" style="line-height: 15px;">
                                <span class="mr-10">{{ t('scan.report.others.TOP_VULNERABLE_IMAGES') }}</span>
                            </div>
                            <TopVulnerableImagesBarChart 
                                v-if="vulQueryData?.summary?.top_images"     
                                :topVulImages="vulQueryData.summary.top_images"
                            />
                        </div>
                    </div>
                    <SimpleBox class="mt-10">
                        <div class="grid-area">
                            <VulnerabilityItemsTable 
                                v-if="vulQueryData && vulQuery"
                                :isLightTheme="isLightTheme" 
                                :vulQueryData="vulQueryData" 
                                :vulQuery="vulQuery" 
                                @refresh="triggerRefresh" 
                                @togglePieChart="togglePieChart" 
                                @selectedVul="setSelectedVul" 
                                @openAdvFilter="openAdvFilter"
                            ></VulnerabilityItemsTable>
                            <div v-if="selectedVul">
                                <VulnerabilityItemsChart 
                                    v-if="pieChartActive"
                                    :countDistribution="vulQueryData?.summary?.count_distribution" 
                                ></VulnerabilityItemsChart>
                                <VulnerabilityItemsDetail 
                                    v-else
                                    :selectedVul="selectedVul" 
                                    :isLightTheme="isLightTheme" 
                                ></VulnerabilityItemsDetail>
                            </div>
                        </div>
                    </SimpleBox>
                </div>
            </div>
        </div>
        <AdvancedFilterModal 
            ref="advFilter" 
            :isLightTheme="isLightTheme" 
            :vulQuery="vulQuery" 
            :domains="domains" 
            @close="closeAdvFilter"
        ></AdvancedFilterModal>
        <FileExportModal
            ref="fileExport"
            :isLightTheme="isLightTheme"
            :title="'Export Vulnerabilities Report'"
            :queryToken="vulQueryData?.query_token"
        > 
        </FileExportModal>
    </div>
</template>

<style lang="scss" scoped>
    @import '../../styles/vulnerabilities.scss';
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