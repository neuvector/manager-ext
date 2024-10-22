<template>
    <div>
      <ag-grid-vue
        id="agGrid"
        style="width: 100%; height: 235px"
        :class="isLightTheme ? 'ag-theme-balham' : 'ag-theme-balham-dark'"
        :columnDefs="columnDefs"
        :gridOptions="gridOptions"
      >
      </ag-grid-vue>
    </div>
</template>
    
<script>
    import { nvVariables } from '../../../types';
    import 'ag-grid-community/styles/ag-grid.css';
    import 'ag-grid-community/styles/ag-theme-balham.min.css';
    import { AgGridVue } from 'ag-grid-vue3';
    import { arrayToCsv } from '../../../utils/common';
    import { complianceImpactComparator, getCsvData } from '../../../utils/compliance';
    import ComplianceCategoryCellComponent from './components/ComplianceCategoryCellComponent.vue';
    import ComplianceStatusCellComponent from './components/ComplianceStatusCellComponent.vue';
    import ComplianceImpactCellComponent from './components/ComplianceImpactCellComponent.vue';
    import ComplianceCSVCellComponent from './components/ComplianceCSVCellComponent.vue';
    import { saveAs } from 'file-saver';
    import dayjs from 'dayjs';

    export default {
        props: {
            complianceData: Object,
            advFilter: Object,
            filterText: String,
            isLightTheme: Boolean,
        },
        data() {
            return {
                columnDefs: null,
                gridOptions: null,
                gridApi: null,
            };
        },
        components: {
            AgGridVue,
            ComplianceCategoryCellComponent,
            ComplianceStatusCellComponent,
            ComplianceImpactCellComponent,
            ComplianceCSVCellComponent
        },
        beforeMount() {
            this.columnDefs = [
                {
                    headerName: this.t('cis.report.gridHeader.CATEGORY'),
                    field: 'category',
                    sortable: true,
                    resizable: true,
                    cellRenderer: 'ComplianceCategoryCellComponent',
                    cellRendererParams: {
                        kubeType: this.complianceData.kubernetes_cis_version,
                    },
                    cellClass: ['d-flex', 'align-items-center'],
                },
                {
                    headerName: this.t('cis.report.gridHeader.NAME'),
                    field: 'name',
                    sortable: true,
                    resizable: true,
                },
                {
                    headerName: this.t('responsePolicy.gridHeader.STATUS'),
                    field: 'level',
                    sortable: true,
                    resizable: true,
                    cellRenderer: 'ComplianceStatusCellComponent',
                },
                {
                    headerName: this.t('cis.report.gridHeader.SCORED'),
                    field: 'score',
                    sortable: true,
                    resizable: true,
                    valueFormatter: params => (params?.node?.data.scored ? 'Y' : 'N'),
                },
                {
                    headerName: this.t('cis.report.gridHeader.PROFILE'),
                    field: 'profile',
                    sortable: true,
                    resizable: true,
                },
                {
                    headerName: this.t('cis.report.gridHeader.IMPACT'),
                    colId: 'impact',
                    sortable: true,
                    resizable: true,
                    comparator: complianceImpactComparator,
                    cellRenderer: 'ComplianceImpactCellComponent',
                },
                {
                    headerName: 'CSV',
                    cellRenderer: 'ComplianceCSVCellComponent',
                    cellRendererParams: {
                        downloadCsv: event => this.downloadCsv(event),
                    },
                }
            ];

            this.gridOptions = {
                headerHeight: 30,
                rowHeight: 30,
                suppressDragLeaveHidesColumns: true,
                animateRows: true,
                rowSelection: 'single',
                onGridReady: params => {
                    this.gridApi = params.api;
                    this.complianceData.compliances = this.complianceData.compliances.map(compliance => {
                        compliance.filteredImages = compliance.images;
                        compliance.filteredWorkloads = compliance.workloads;
                        return compliance;
                    });
                    this.gridApi.setRowData(this.complianceData.compliances);
                    setTimeout(() => {
                        this.gridApi.sizeColumnsToFit();
                    }, 300);
                    window.addEventListener('resize.#agGrid', () => {
                        setTimeout(() => {
                            this.gridApi.sizeColumnsToFit();
                        }, 100);
                    });
                },
                onModelUpdated: params => {
                    const firstRowNode = this.gridApi.getDisplayedRowAtIndex(0);
                    if (firstRowNode) {
                        firstRowNode.setSelected(true);
                    }
                },
                onSelectionChanged: params => {
                    this.$emit('togglePieChart', false);
                    if (params.api.getSelectedNodes()[0]) {
                        this.$emit('setSelectedCompliance', params.api.getSelectedNodes()[0].data);
                    }
                },
                doesExternalFilterPass: node => {
                    if (!this.isAdvFilterOn) {
                        return true;
                    } else {
                        return this.filterFn(node.data);
                    }
                },
                isExternalFilterPresent: params => {
                    return this.isAdvFilterOn;
                },
                overlayNoRowsTemplate: `<span class="overlay">No rows to show</span>`,
            };
        },
        computed: {
            isAdvFilterOn() {
                return (
                    this.advFilter.scoredType !== 'all' ||
                    this.advFilter.profileType !== 'all' ||
                    !this.advFilter.category.custom ||
                    !this.advFilter.category.docker ||
                    !this.advFilter.category.kubernetes ||
                    !this.advFilter.category.image ||
                    Object.keys(this.advFilter.tags).some(
                        filter => !!this.advFilter.tags[filter]
                    ) ||
                    this.advFilter.selectedDomains.length > 0 ||
                    !!this.advFilter.serviceName ||
                    !!this.advFilter.imageName ||
                    !!this.advFilter.nodeName ||
                    !!this.advFilter.containerName
                );
            }
        },
        methods: {
            downloadCsv(event) {
                let csv = arrayToCsv(getCsvData(event.node.data, this.advFilter));
                let blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
                saveAs(blob, `${event.node.data.name}_${dayjs(new Date()).format('YYYYMMDDHHmmss')}.csv`);
            },
            updateFiltered() {
                const filteredCis = [];
                this.gridApi.forEachNodeAfterFilterAndSort(node => {
                    filteredCis.push(JSON.parse(JSON.stringify(node.data)));
                });
                nvVariables.complianceData.filteredCis = filteredCis;
                this.$emit('updateCountDist');
            },
            checkEntity(matchType, entities, pattern, result) {
                const patterns = pattern.split(',').map(item => item.trim());
                const theEntity = entities.find(entity => {
                if (entity && entity.display_name) {
                    if (matchType === 'equals')
                    return patterns.some(item => item === entity.display_name);
                    else return new RegExp(patterns.join('|')).test(entity.display_name);
                } else {
                    if (matchType === 'equals')
                    return patterns.some(item => item === entity);
                    else return new RegExp(patterns.join('|')).test(entity);
                }
                });
                result = result && !!theEntity;
                return result;
            },
            filterFn(compliance) {
                let result = true;
                if (
                    !this.advFilter.category.custom ||
                    !this.advFilter.category.docker ||
                    !this.advFilter.category.kubernetes ||
                    !this.advFilter.category.image
                ) {
                    if (!this.advFilter.category.docker)
                        result = result && compliance.category !== 'docker';
                    if (!this.advFilter.category.custom)
                        result = result && compliance.category !== 'custom';
                    if (!this.advFilter.category.kubernetes)
                        result = result && compliance.category !== 'kubernetes';
                    if (!this.advFilter.category.image)
                        result = result && compliance.category !== 'image';
                }
                if (
                    Object.keys(this.advFilter.tags).some(tag => this.advFilter.tags[tag])
                ) {
                    let comlianceTags = Object.keys(compliance.tags);
                    if (comlianceTags && comlianceTags.length > 0) {
                        let res = Object.keys(this.advFilter.tags).filter(
                            filter => this.advFilter.tags[filter]
                        );
                        return comlianceTags.some(tag => res.includes(tag));
                    } else return false;
                }
                if (this.advFilter.scoredType !== 'all') {
                    result =
                        result && compliance.scored.toString() === this.advFilter.scoredType;
                }
                if (this.advFilter.profileType !== 'all') {
                    result = result && compliance.profile === this.advFilter.profileType;
                }
                if (this.advFilter.containerName) {
                    if (compliance.workloads.length) {
                        result = this.checkEntity(
                            this.advFilter.matchTypes['Container'],
                            compliance.workloads,
                            this.advFilter.containerName,
                            result
                        );
                    } else return false;
                }
                if (this.advFilter.nodeName) {
                    if (compliance.nodes.length) {
                        result = this.checkEntity(
                            this.advFilter.matchTypes['Node'],
                            compliance.nodes,
                            this.advFilter.nodeName,
                            result
                        );
                    } else return false;
                }
                if (this.advFilter.imageName) {
                    if (compliance.images.length) {
                        result = this.checkEntity(
                            this.advFilter.matchTypes['Image'],
                            compliance.images,
                            this.advFilter.imageName,
                            result
                        );
                    } else return false;
                }
                if (this.advFilter.selectedDomains.length) {
                    result = this.checkEntity(
                        this.advFilter.matchType4Ns,
                        compliance.domains,
                        this.advFilter.selectedDomains.join(','),
                        result
                    );
                }
                if (this.advFilter.serviceName) {
                    if (compliance.services && compliance.services.length) {
                        result = this.checkEntity(
                            this.advFilter.matchTypes['Service'],
                            compliance.services,
                            this.advFilter.serviceName,
                            result
                        );
                    } else return false;
                }
                if (
                    Array.isArray(this.advFilter.selectedDomains) &&
                    this.advFilter.selectedDomains.length > 0
                ) {
                    if (this.advFilter.matchType4Ns === 'contains') {
                        let matchExp = new RegExp(this.advFilter.selectedDomains.join('|'));
                        compliance.filteredWorkloads = compliance.workloads.filter(workload => {
                            if (Array.isArray(workload.domains)) {
                                return workload.domains.reduce((res, curr) => {
                                return res || matchExp.test(curr);
                                }, false);
                            } else {
                                return false;
                            }
                        });
                        compliance.filteredImages = compliance.images.filter(image => {
                            if (Array.isArray(image.domains)) {
                                return image.domains.reduce((res, curr) => {
                                return res || matchExp.test(curr);
                                }, false);
                            } else {
                                return false;
                            }
                        });
                    } else {
                        compliance.filteredWorkloads = compliance.workloads.filter(workload => {
                            if (Array.isArray(workload.domains)) {
                                return workload.domains.reduce((res, curr) => {
                                return res || this.advFilter.selectedDomains.includes(curr);
                                }, false);
                            } else {
                                return false;
                            }
                        });
                        compliance.filteredImages = compliance.images.filter(image => {
                            if (Array.isArray(image.domains)) {
                                return image.domains.reduce((res, curr) => {
                                return res || this.advFilter.selectedDomains.includes(curr);
                                }, false);
                            } else {
                                return false;
                            }
                        });
                    }
                }
                return result;
            }
        },
        watch:  {
            complianceData(newComp, oldComp) {
                this.complianceData.compliances = this.complianceData.compliances.map(compliance => {
                    compliance.filteredImages = compliance.images;
                    compliance.filteredWorkloads = compliance.workloads;
                    return compliance;
                });
                if (this.gridApi) this.gridApi.setRowData(this.complianceData.compliances);
            },
            filterText(newFilter, oldFilter) {
                this.gridApi.setQuickFilter(newFilter);
                const filteredCount = this.gridApi.getModel()['rootNode'].childrenAfterFilter.length;
                this.$emit('setFilteredCount', filteredCount);
                this.updateFiltered();
            },
            advFilter(newAdvFilter, oldAdvFilter) {
                this.complianceData.compliances = this.complianceData.compliances.map(compliance => {
                    compliance.filteredImages = compliance.images;
                    compliance.filteredWorkloads = compliance.workloads;
                    return compliance;
                });
                this.gridApi.onFilterChanged();
                const filteredCount = this.gridApi.getModel()['rootNode'].childrenAfterFilter.length;
                this.$emit('setFilteredCount', filteredCount);
                this.updateFiltered();
            }
        }
    };
</script>

<style scoped>
.flex-cell {
    display: flex;
    align-items: center;
}
</style>