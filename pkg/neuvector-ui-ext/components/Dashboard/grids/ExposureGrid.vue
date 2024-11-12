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
  import Vue from 'vue';
  import "ag-grid-community/styles/ag-grid.css";
  import "ag-grid-community/styles/ag-theme-balham.min.css";
  import { AgGridVue } from "ag-grid-vue";
  import { NV_MAP } from '../../../types/neuvector';
  // import ExposedServicePodGridServicePodCellComponent from './components/ExposedServicePodGridServicePodCellComponent';
  
  const ExposedServicePodGridServicePodCellComponent = Vue.extend(
    {template: '<span>{{ valueCubed() }}</span>',
   methods: {
       valueCubed() {
           return 'test'+this.params.value;
       }
   }}
  )

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
                `<span class="nv-badge nv-badge-danger">${params.data.high}</span>
                <span class="nv-badge nv-badge-warning">${params.data.medium}</span>`
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
                return `<span class='nv-type-label policy_mode ${labelCode}'>${
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

<style lang="scss">
  .nv-badge {
    border-radius: 4px;
    color: #141823;
    font-size: .8em;
    line-height: 1.5;
    margin-left: 8px;
    padding: 4px 8px;
  }
  .nv-badge-danger {
    background-color: #c5161f;
    color: #fff;
  }
  .nv-badge-warning {
      color: #212529 !important;
      background-color: #ff9800;
  }
  .nv-type-label {
    @media print {
      height: 15px;
      line-height: 15px;
      font-size: 10px;
      color: #111;
    }
    @media screen {
      height: 20px;
      line-height: 20px;
      font-size: 11px;
      font-weight: bold;
      color: #fff;
    }
    min-width: 75px;
    border-radius: 4px;
    text-align: center;
    display: inline-block;
    &.customer-rule {
      border: 1px solid #e6e600;
      background-color: #ffffe6;
      color: #45505c;
    }
  
    &.local-rule {
      border: 1px solid #ebe3e4;
      background-image: linear-gradient(to right, #ffffe6, #e6d9f1);
      color: #45505c;
    }
  
    &.learn-rule {
      border: 1px solid #d2aff1;
      background-color: #e6d9f1;
      color: #45505c;
    }
  
    &.ground-rule {
      border: 1px solid #ff8a65;
      background-color: #fdb69f;
      color: #45505c;
    }
  }

  .discover {
    background-color: #2196f3;
  }
  
  .monitor {
    background-color: #4e39c1;
  }
  
  .protect {
    background-color: #186d33;
  }

  .pull-left {
    display: block;
    float: left;
  }

  .pull-right {
    display: block;
    float: right;
  }

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