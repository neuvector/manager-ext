<script>
    import { nvVariables } from '../../../types';
    import AdvancedFilter from '../buttons/AdvancedFilter.vue';
    import PieChartView from '../buttons/PieChartView.vue';
    import QuickFilter from '../quickFilter/QuickFilter.vue';
    import ComplianceItemsGrid from '../grids/ComplianceItemsGrid.vue';
    import AdvancedFilterModal from '../dialogs/AdvancedFilterModal.vue';
    import { initCompFilter } from '../../../utils/compliance';

    export default {
        components: {
            AdvancedFilter,
            PieChartView,
            QuickFilter,
            ComplianceItemsGrid,
            AdvancedFilterModal
        },
        props: {
            complianceData: Object,
            availableFilters: Array,
            domains: Array,
        },
        data() {
            return {
                filterText: '',
                filteredCount: null,
                advFilter: this.initFilter(),
            }
        },
        computed: {
            totalCount() {
                return this.complianceData.compliances.length;
            },
            isLightTheme() { return !document.body.classList.contains('theme-dark'); }
        },
        methods: {
            initFilter() {
                let advFilter = initCompFilter();
                if (this.availableFilters) {
                    advFilter.tags = this.availableFilters.reduce(
                        (acc, curr) => ({ ...acc, [curr]: false }),
                        {}
                    )
                }
                nvVariables.complianceData.advFilter = advFilter;
                return advFilter;
            },
            setQuickFilter(filterText) {
                this.filterText = filterText;
            },
            togglePieChart(pieChartActive) {
                this.$emit('togglePieChart', pieChartActive);
            },
            setSelectedCompliance(selectedCompliance) {
                this.$emit('setSelectedCompliance', selectedCompliance);
            },
            setFilteredCount(filteredCount) {
                this.filteredCount = filteredCount;
            },
            updateCountDist() {
                this.$emit('updateCountDist');
            },
            openAdvFilter() {
                this.$refs.advFilter.show();
            },
            setAdvFilter(filter) {
                if (filter) {
                    this.advFilter = filter;
                    nvVariables.complianceData.advFilter = this.advFilter;
                } else {
                    this.advFilter = this.initFilter();
                }
            },
            closeAdvFilter(filter) {
                if (filter.reset) {
                    this.setAdvFilter();
                } else {
                    this.setAdvFilter(filter);
                }
            },
        },
    };
</script>

<template>
    <div>
        <div class="fixed-header-actions">
            <div class="bulk bulk flex center">
                <span class="d-block font-weight-bold text-info">
                    <span v-if="filteredCount !== null && filteredCount !== totalCount">
                        {{ t('enum.FOUND') }} {{ filteredCount }}&nbsp;/
                    </span>
                    <span v-else>
                        {{ t('enum.OUT_OF') }}&nbsp;
                    </span>
                    {{ totalCount }}
                </span>
            </div>
            <div class="middle">
                <div class="flex">
                    <PieChartView @togglePieChart="togglePieChart"></PieChartView>
                    <AdvancedFilter @openAdvFilter="openAdvFilter"></AdvancedFilter>
                </div>
            </div>
            <div class="search row">
                <QuickFilter @quickFilter="setQuickFilter" class="w-auto mr-10"></QuickFilter>
            </div>
        </div>
        <ComplianceItemsGrid 
            :filterText="filterText" 
            :advFilter="advFilter"
            :complianceData="complianceData"
            @togglePieChart="togglePieChart"
            @setSelectedCompliance="setSelectedCompliance" 
            @setFilteredCount="setFilteredCount"
            @updateCountDist="updateCountDist">
        </ComplianceItemsGrid>
        <AdvancedFilterModal
            ref="advFilter"
            :inputFilter="advFilter" 
            :domains="domains"
            @close="closeAdvFilter"
        ></AdvancedFilterModal>
    </div>
</template>

<style lang="scss" scoped>
.flex {
    display: flex;
    &.center {
        align-items: center;
    }
}
</style>