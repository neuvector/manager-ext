<template>
    <div>
      <ag-grid-vue
        id="agGrid"
        style="width: 100%; height: 200px"
        :class="rancherTheme === 'light' ? 'ag-theme-balham' : 'ag-theme-balham-dark'"
        :columnDefs="columnDefs"
        :rowData="rowData"
        :gridOptions="gridOptions"
      >
      </ag-grid-vue>
    </div>
  </template>
    
  <script>
    import "ag-grid-community/styles/ag-grid.css";
    import "ag-grid-community/styles/ag-theme-balham.min.css";
    import { AgGridVue } from "ag-grid-vue";
    import ExposureChildHostCellComponent from "./components/ExposureChildHostCellComponent";
    import { NV_MAP } from "../../../types/neuvector";

    export default {
      props: {
        exposureInfo: Array,
        exposureType: String,
        rancherTheme: String
      },
      data() {
        return {
          columnDefs: null,
          rowData: null,
          gridOptions: null,
          selectedRow: null,
          showModal: false
        };
      },
      components: {
        AgGridVue,
        ExposureChildHostCellComponent
      },
      beforeMount() {
        this.columnDefs = [
          {
            headerName: this.t('dashboard.body.panel_title.EXTERNAL_HOST'),
            field: 'ip',
            tooltipValueGetter: (params) => {
              return `${params.data.country_name}: ${params.value}`;
            },
            cellRenderer: 'ExposureChildHostCellComponent',
            width: 280,
            minWidth: 280,
            sortable: false
          },
          {
            headerName: this.t('dashboard.body.panel_title.SESSIONS'),
            field: 'sessions',
            width: 150,
            minWidth: 150,
            sortable: false
          },
          {
            headerName: this.t('dashboard.body.panel_title.APPLICATIONS'),
            field: 'applications',
            valueFormatter: params => {
              return params.value.join(', ');
            },
            width: 150,
            maxWidth: 150,
            minWidth: 150,
            sortable: false,
          },
          {
            headerName: this.t('dashboard.body.panel_title.POLICY_ACTION'),
            field: 'policy_action',
            cellRenderer: params => {
              if (params.data) {
                return `<span ng-class='{\'policy-remove\': data.remove}'
                      class='nv-action-label px-1 ${
                        NV_MAP.colourMap[params.data.policy_action.toLowerCase()]
                      }'>
                      ${this.t(`dashboard.body.panel_title.${params.data.policy_action.toUpperCase()}`)}
                    </span>`;
              }
              return null;
            },
            width: 130,
            maxWidth: 130,
            minWidth: 130,
            sortable: false,
          }
        ];
    
        this.rowData = this.exposureInfo;
        this.gridOptions = {
          defaultColDef: {
            sortable: true,
            flex: 1,
            autoHeight: true,
            sortable: true,
            resizable: true,
            cellClass: ['d-flex', 'align-items-center', 'cell-wrap-text'],
          },
          headerHeight: 30,
          rowHeight: 30,
          suppressDragLeaveHidesColumns: true,
          rowData: null,
          animateRows: true,
          rowSelection: 'single',
          icons: {
            sortAscending: '<em class="fa fa-sort-alpha-down"></em>',
            sortDescending: '<em class="fa fa-sort-alpha-up"></em>',
          },
          onGridReady: params => {
            setTimeout(() => {
              params.api.sizeColumnsToFit();
            }, 300);
            window.addEventListener('resize.#agGrid', () => {
              setTimeout(() => {
                params.api.sizeColumnsToFit();
              }, 100);
            });
          },
          overlayNoRowsTemplate: `<span class="overlay">No rows to show</span>`,
        };
      }
    };
    </script>

    <style lang="scss">
    .nv-action-label {
      @media print {
        height: 15px;
        line-height: 15px;
        font-size: 10px;
      }
      @media screen {
        height: 20px;
        line-height: 20px;
        font-size: 11px;
        font-weight: bold;
      }
      min-width: 50px;
      border-radius: 4px;
      text-align: center;
      display: inline-block;
      color: #fff;

      &.deny {
        background-color: #EF5350;
        -webkit-print-color-adjust: exact;
      }

      &.allow {
        background-color: #8BC34A;
        -webkit-print-color-adjust: exact;
      }
    }
    </style>