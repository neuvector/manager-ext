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
    import 'ag-grid-community/styles/ag-grid.css';
    import 'ag-grid-community/styles/ag-theme-balham.min.css';
    import { AgGridVue } from 'ag-grid-vue3';

    export default {
        props: {
            regulationData: Array,
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
            AgGridVue
        },
        beforeMount() {
            this.columnDefs = [
                {
                    headerName: this.t('cis.report.gridHeader.SUBCONTROL'),
                    field: 'CIS_Sub_Control',
                    sortable: true,
                    resizable: true,
                },
                {
                    headerName: this.t('cis.report.gridHeader.DESC'),
                    field: 'description',
                    sortable: true,
                    resizable: true,
                },
                {
                    headerName: this.t('cis.report.gridHeader.CONTROL_ID'),
                    field: 'id',
                    sortable: true,
                    resizable: true,
                },
                {
                    headerName: this.t('cis.report.gridHeader.TITLE'),
                    field: 'title',
                    sortable: true,
                    resizable: true,
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
                    this.gridApi.setRowData(this.regulationData);
                    setTimeout(() => {
                        this.gridApi.sizeColumnsToFit();
                    }, 300);
                    window.addEventListener('resize.#agGrid', () => {
                        setTimeout(() => {
                            this.gridApi.sizeColumnsToFit();
                        }, 100);
                    });
                },
                overlayNoRowsTemplate: `<span class="overlay">No rows to show</span>`,
            };
        }
    };
</script>

<style scoped>
</style>