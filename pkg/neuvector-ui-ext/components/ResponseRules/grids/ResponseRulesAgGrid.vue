<script>
    import { NV_CONST } from '../../../types/neuvector';
    import Confirmation from '../../common/dialogs/Confirmation';
    import { getDisplayFlag } from '../../../utils/auth';
    import 'ag-grid-community/styles/ag-grid.css';
    import 'ag-grid-community/styles/ag-theme-balham.min.css';
    import { AgGridVue } from 'ag-grid-vue3';
    import agGridTheme from '../../../mixins/agGridTheme';
    import ActionsCellComponent from './agCells/ActionsCellComponent';
    import CategoryCellComponent from './agCells/CategoryCellComponent';
    import CfgTypeCellComponent from './agCells/CfgTypeCellComponent';
    import ActionButtonsComponent from './agCells/ActionButtonsComponent';
    import AddEditRuleModal from '../dialogs/AddEditRuleModal';
    import RemovalConfirmationModal from '../dialogs/RemovalConfirmationModal';
    import { UpdateType } from '../../../types/network-rules';
    import { toggleEnablement, deleteRule } from '../../../utils/response-rules';

    export default {
        mixins: [agGridTheme],
        components: {
          AgGridVue,
          Confirmation,
          ActionsCellComponent,
          CategoryCellComponent,
          CfgTypeCellComponent,
          ActionButtonsComponent,
          AddEditRuleModal,
          RemovalConfirmationModal,
        },
        props: {
          responseRules: Array,
          autoCompleteData: Object,
          webhooks: Array,
          source: String,
          refreshFn: Function,
          filterText: String,
        },
        created() {
            this.isResponseRuleWritable = getDisplayFlag('write_response_rule', this.$store) &&
            (this.source !== NV_CONST.NAV_SOURCE.GROUP &&
            this.source !== NV_CONST.NAV_SOURCE.SELF
              ? getDisplayFlag('multi_cluster_w', this.$store)
              : true);
        },
        data() {
          return {
            columnDefs: null,
            gridOptions: null,
            gridApi: null,
            context: { componentParent: this },
            menuOpen: false,
            actionMenuTargetElement:  null,
            actionMenuTargetEvent:    null,
            receiverActions:      [],
            selectedRuleId: 0,
            selectedRule: null,
            selectedIndex: 0,
            opType: UpdateType.Insert,
            confirmationMsg: '',
            removalConfirmationMsg: '',
            confirmedFn: null,
            removalConfirmationFn: null,
            showConfirmationModal: false,
            isResponseRuleWritable: false,
            showRemovalConfirmationModal: false,
            isReadOnly: false,
            isQuarantined: false,
          };
        },
        beforeMount() {
            this.columnDefs = [
            {
                headerName: this.t('responsePolicy.gridHeader.ID'),
                field: 'id',
                width: 80,
                minWidth: 80,
                maxWidth: 80,
            },
            {
                headerName: this.t('responsePolicy.gridHeader.TYPE'),
                field: 'event',
                cellRenderer: 'CategoryCellComponent',
                width: 120,
                minWidth: 120,
                maxWidth: 120,
            },
            {
                headerName: this.t('admissionControl.COMMENT'),
                field: 'comment',
                width: 200,
            },
            {
                headerName: this.t('responsePolicy.gridHeader.GROUP'),
                field: 'group',
                width: 200,
            },
            {
                headerName: this.t(
                    'responsePolicy.gridHeader.CRITERIA'
                ),
                field: 'conditions',
                width: 400,
            },
            {
                headerName: this.t('responsePolicy.gridHeader.ACTION'),
                field: 'actions',
                cellRenderer: 'ActionsCellComponent',
                width: 130,
                minWidth: 130,
                maxWidth: 130,
            },
            {
                headerName: this.t('policy.gridHeader.TYPE'),
                field: 'cfg_type',
                cellRenderer: 'CfgTypeCellComponent',
                cellClass: 'grid-center-align',
                width: 110,
                minWidth: 110,
                maxWidth: 110,
            },
            {
                cellRenderer: 'ActionButtonsComponent',
                cellClass: ['grid-right-align'],
                cellRendererParams: {
                  addRuleBelow: event => this.addRuleBelow(event),
                  editRule: event => this.editRule(event),
                  viewRule: event => this.viewRule(event),
                  deleteSelectedRule: event => this.deleteSelectedRule(event),
                  enableSelectedRule: event => this.enableSelectedRule(event),
                  disableSelectedRule: event => this.disableSelectedRule(event),
                  source: this.source,
                },
                width: 130,
                maxWidth: 130,
                minWidth: 130,
            },
          ];
          this.gridOptions = {
            defaultColDef: {
              flex: 1,
              autoHeight: true,
              sortable: true,
              resizable: true,
            },
            headerHeight: 30,
            rowHeight: 30,
            suppressDragLeaveHidesColumns: true,
            columnDefs: this.columnDefs,
            rowData: null,
            animateRows: true,
            rowSelection: 'single',
            rowClassRules: {
                'disabled-row': params => {
                    if (!params.data) return false;
                    return !!params.data.disable;

                },
            },
            icons: {
                sortAscending: '<em class="fa fa-sort-alpha-down"></em>',
                sortDescending: '<em class="fa fa-sort-alpha-up"></em>',
            },
            onSelectionChanged: this.onSelectionChanged.bind(this),
            onGridReady: this.onGridReadyFunc.bind(this),
            overlayNoRowsTemplate: this.t('general.NO_ROWS'),
          };
        },
        watch:  {
          filterText(newFilter, oldFilter) {
            this.gridApi.setQuickFilter(newFilter);
            const filteredCount = this.gridApi.getModel()['rootNode'].childrenAfterFilter.length;
            this.$emit('setFilteredCount', filteredCount);
            this.updateFiltered();
          },
        },
        methods: {
          onSelectionChanged: function() {
            this.selectedRule = this.gridApi.getSelectedRows()[0];
            this.selectedRuleId = this.selectedRule.id;
          },
          onGridReadyFunc: function(params) {
            const $win = $(window);
            if (params && params.api) {
              this.gridApi = params.api;
              // this.gridApi.setRowData(this.responseRules);
            }
            setTimeout(() => {
              if (params && params.api) {
                // if (this.useQuickFilterService) {
                //   this.quickFilterService.textInput$.subscribe((value) => {
                //     this.quickFilterService.onFilterChange(value, this.gridOptions, this.gridApi);
                //   });
                // }
                params.api.sizeColumnsToFit();
              }
            }, 300);
            $win.on(NV_CONST.AG_GRID_RESIZE, () => {

              setTimeout(() => {
                if (params && params.api) {
                  params.api.sizeColumnsToFit();
                }
              }, 100);
            });
          },
          async updateFiltered() {
            const filteredResponseRules = [];
            this.gridApi.forEachNodeAfterFilterAndSort(node => {
              filteredResponseRules.push(JSON.parse(JSON.stringify(node.data)));
            });
            await this.$store.dispatch('neuvector/updateResponseRules', filteredResponseRules);
            this.$emit('updateCountDist');
          },
          addRuleBelow: function(params) {
            this.selectedRule = params.data;
            this.opType = UpdateType.Insert;
            this.isReadOnly = false;
            this.$refs.addEditRule.show();
          },
          editRule: function(params) {
            this.selectedRule = params.data;
            this.opType = UpdateType.Edit;
            this.isReadOnly = false;
            this.$refs.addEditRule.show();
          },
          viewRule: function(params) {
            this.selectedRule = params.data;
            this.opType = UpdateType.Edit;
            this.isReadOnly = true;
            this.$refs.addEditRule.show();
          },
          deleteSelectedRule: function(params) {
            this.isQuarantined = params.data.actions.includes('quarantine');
            this.removalConfirmedFn = async (unquarantine) => {
              try {
                await deleteRule(params.data.id, unquarantine);
                this.refreshFn();
                this.showRemovalConfirmationModal = false;
              } catch(error) {
                console.log(error);
              }
            };
            this.showRemovalConfirmationModal = true;
            this.removalConfirmationMsg = `${this.t(
              'policy.dialog.REMOVE'
            )} ${params.data.id}`;
          },
          enableSelectedRule: async function(params) {
            try {
              await toggleEnablement(params.data, false);
              this.refreshFn();
            } catch(error) {
              console.error(error);
            }
          },
          disableSelectedRule: async function(params) {
            try {
              await toggleEnablement(params.data, true);
              this.refreshFn();
            } catch(error) {
              console.error(error);
            }
          },
          closeAddEditRuleModal: function() {
            this.showAddEditRuleModal = false;
          },
          closeConfirmationModal() {
            this.showConfirmationModal = false;
          },
          closeRemovalConfirmationModal() {
            this.showRemovalConfirmationModal = false;
          },
        },
        computed: {
        }
    };
</script>

<template>
    <div>
        <ag-grid-vue
            id="policy-grid"
            v-if="responseRules && responseRules.length > 0"
            style="width: 100%; height: calc(100vh - 200px)"
            :class="isLightTheme ? 'ag-theme-balham' : 'ag-theme-balham-dark'"
            :columnDefs="columnDefs"
            :gridOptions="gridOptions"
            :rowData="responseRules"
            :context="context"
        >
        </ag-grid-vue>
        <AddEditRuleModal 
            ref="addEditRule"
            :autoCompleteData="autoCompleteData"
            :startId="selectedRuleId"
            :isReadOnly="isReadOnly"
            :selectedRule = "selectedRule"
            :webhooks="webhooks"
            :source="source"
            :opType="opType"
            :refreshFn="refreshFn"
            @close="closeAddEditRuleModal">
        </AddEditRuleModal>
        <Confirmation
            v-if="showConfirmationModal"
            :message="confirmationMsg"
            @close="closeConfirmationModal"
            :okFn="confirmedFn"
        ></Confirmation>
        <RemovalConfirmationModal
            v-if="showRemovalConfirmationModal"
            :isQuarantined="isQuarantined"
            :message="removalConfirmationMsg"
            @close="closeRemovalConfirmationModal"
            :okFn="removalConfirmedFn">
        </RemovalConfirmationModal>
    </div>
</template>


<style lang="scss">
    @import '../../../styles/neuvector.scss';
    .badge {
      border-radius: 4px;
    }

    .vul-cnt {
      display: block;
      margin: 3px 5px;
      span {
        margin: 0 5px;
      }
    }
</style>