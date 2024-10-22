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
    <ExposureModal v-if="showModal" :selectedRow="selectedRow" :rancherTheme="rancherTheme" @close="closeModal"></ExposureModal>
  </div>
</template>
  
<script>
  import ExposureModal from '../panels/ExposureModal';
  import { createApp } from 'vue';
const vueApp = createApp({});
  import "ag-grid-community/styles/ag-grid.css";
  import "ag-grid-community/styles/ag-theme-balham.min.css";
  import { AgGridVue } from "ag-grid-vue3";
  import { NV_MAP } from '../../../types/neuvector';
  // import ExposedServicePodGridServicePodCellComponent from './components/ExposedServicePodGridServicePodCellComponent';
  
  export default {
    name: "App",
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
      ExposureModal
    },
    beforeMount() {
     
      this.columnDefs = [
        {
          headerName: this.t('dashboard.body.panel_title.SERVICE'),
          field: 'service',
          // cellRenderer: ExposedServicePodGridServicePodCellComponent,
          width: 280,
          minWidth: 110,
          sortable: false,
        },
        {
          headerName: this.t('dashboard.body.panel_title.PODS'),
          field: 'children',
          valueFormatter: params => {
            return params.value.length;
          },
          width: 70,
          minWidth: 50,
        },
        {
          headerName: 'Parent ID',
          field: 'parent_id',
          hide: true,
        },
        {
        headerName: this.t(
            'dashboard.body.panel_title.VULNERABILITIES'
          ),
          cellRenderer: params => {
            if (params && params.data) {
              return (
                `<span class="badge badge-danger">${params.data.high}</span>
                <span class="badge badge-warning">${params.data.medium}</span>`
              );
            }
            return '';
          },
          width: 110,
          maxWidth: 110,
          minWidth: 110,
          sortable: false,
        },
        {
          headerName: this.t('dashboard.body.panel_title.POLICY_MODE'),
          field: 'policy_mode',
          cellRenderer: params => {
            let mode = '';
            if (params.data && params.value) {
              mode = params.value;
              let labelCode = NV_MAP.colourMap[params.value];
              if (!labelCode) return null;
              else
                return `<span class='type-label policy_mode ${labelCode}'>${
                  this.t(`dashboard.body.panel_title.${mode.toUpperCase()}`)
                }</span>`;
            }
            return null;
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
            if (params.data && params.data.policy_action) {
              return `<span ng-class='{\'policy-remove\': data.remove}'
                    class='action-label px-1 ${
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
        onRowClicked: params => {
          if (params.node.isSelected()) {
            this.selectedRow = params.data;
            this.showModal = true;
          }
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
    },
    methods: {
      closeModal() {
        this.showModal = false;
      }
    }
  };
</script>

<style lang="scss" scoped>
  .badge {
    border-radius: 4px;
    color: #141823;
    font-size: .8em;
    line-height: 1.5;
    margin-left: 8px;
    padding: 4px 8px;
  }
  .badge-danger {
    background-color: #c5161f;
    color: #fff;
  }
  .badge-warning {
      color: #212529 !important;
      background-color: #ff9800;
  }
</style>