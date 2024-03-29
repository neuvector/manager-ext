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
        const colourMap = {
          'security-event': 'threat',
          Debug: 'inverse',
          Info: 'info',
          Notice: 'idle',
          Warning: 'warning',
          error: 'pink',
          Error: 'pink',
          ERROR: 'pink',
          Critical: 'danger',
          critical: 'danger',
          Alert: 'pink',
          Emergency: 'danger',
          Low: 'success',
          Medium: 'warning',
          High: 'danger',
          HIGH: 'danger',
          Moderate: 'warning',
          Important: 'danger',
          disconnected: 'warning',
          discover: 'discover',
          protect: 'protect',
          unmanaged: 'warning',
          monitor: 'monitor',
          quarantined: 'pink',
          connected: 'success',
          stopped: 'inverse',
          Discover: 'discover',
          Monitor: 'monitor',
          Protect: 'protect',
          allow: 'allow',
          exception: 'success',
          deny: 'deny',
          alert: 'warning',
          block_access: 'deny',
          monitor_change: 'info',
          LEARNED: 'learn-rule',
          CUSTOM: 'customer-rule',
          GROUND: 'ground-rule',
          FED: 'fed-rule',
          USER_CREATED: 'customer-rule',
          FEDERAL: 'fed-rule',
          SYSTEM_DEFINED: 'predefined',
          learned: 'learn-rule',
          user_created: 'customer-rule',
          'new-rule': 'new-rule',
          'modified-rule': 'modified-rule',
          'disabled-rule': 'disabled-rule',
          ground: 'ground-rule',
          'removed-rule': 'removed-rule',
          federal: 'fed-rule',
          'readonly-rule': 'readonly-rule',
          'moved-rule': 'moved-rule',
          modify: 'modify-permission',
          view: 'view-permission',
          finished: 'info',
          idle: 'idle',
          scanning: 'primary',
          running: 'primary',
          scheduled: 'inverse',
          failed: 'danger',
          unsupported: 'warning',
          NOTE: 'note',
          PASS: 'success',
          WARN: 'warning',
          INFO: 'info',
          violate: 'warning',
          threat: 'threat',
          violation: 'violation',
          incident: 'incident',
          event: 'event',
          'cve-report': 'cve-report',
          compliance: 'benchmark',
          quarantine: 'quarantine',
          webhook: 'webhook',
          'suppress-log': 'suppress-log',
          disabled_background: 'disabled-action',
          disabled_color: 'disabled-action-2',
          err: 'danger',
          block: 'danger',
          'admission-control': 'admission-control',
          mc_active: 'info',
          mc_pinging: 'idle',
          mc_unknown_cmd: 'idle',
          mc_notified: 'info',
          mc_req_error: 'warning',
          mc_master_upgrade_required: 'warning',
          mc_joint_upgrade_required: 'warning',
          mc_cluster_upgrade_ongoing: 'warning',
          mc_joint_version_too_new: 'warning',
          mc_connected: 'success',
          mc_disconnected: 'danger',
          mc_joined: 'joined',
          mc_pending: 'warning',
          mc_out_of_sync: 'danger-tran',
          mc_synced: 'success',
          mc_syncing: 'idle',
          mc_kicked: 'danger',
          mc_left: 'danger',
          mc_license_disallow: 'danger',
          comment: 'idle',
          url: 'info',
          response: 'success',
          images: 'idle',
        };
        this.columnDefs = [
          {
            headerName: this.t('dashboard.body.panel_title.EXTERNAL_HOST'),
            field: 'ip',
            tooltipField: 'ip',
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
                      class='action-label px-1 ${
                       colourMap[params.data.policy_action.toLowerCase()]
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