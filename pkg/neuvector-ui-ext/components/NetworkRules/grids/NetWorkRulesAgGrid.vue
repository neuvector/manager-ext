<script>
    import { NV_CONST } from '../../../types/neuvector';
    import IdCellComponent from './agCells/IdCellComponent';
    import FromToCellComponent from './agCells/FromToCellComponent';
    import ApplicationsCellComponent from './agCells/ApplicationsCellComponent';
    import PortsCellComponent from './agCells/PortsCellComponent';
    import ActionCellComponent from './agCells/ActionCellComponent';
    import CfgTypeCellComponent from './agCells/CfgTypeCellComponent';
    import UpdateAtCellComponent from './agCells/UpdateAtCellComponent'
    import ActionButtonsComponent from './agCells/ActionButtonsComponent';
    import AddEditRuleModal from '../dialogs/AddEditRuleModal';
    import { UpdateType } from '../../../types/network-rules';
    import Confirmation from '../../common/dialogs/Confirmation';
    import { toggleDeleteRule } from '../../../utils/network-rules';
    import { promoteNetworkRulesData } from '../../../plugins/network-rule-class';
    import { getDisplayFlag } from '../../../utils/auth';
    import 'ag-grid-community/styles/ag-grid.css';
    import 'ag-grid-community/styles/ag-theme-balham.min.css';
    import { AgGridVue } from 'ag-grid-vue3';

    export default {
        components: {
          AgGridVue,
          IdCellComponent,
          FromToCellComponent,
          ApplicationsCellComponent,
          PortsCellComponent,
          ActionCellComponent,
          CfgTypeCellComponent,
          UpdateAtCellComponent,
          ActionButtonsComponent,
          AddEditRuleModal,
          Confirmation,
        },
        props: {
          networkRules: Array,
          autoCompleteData: Object,
          source: String,
          isWriteNetworkRuleAuthorized: Boolean,
          reloadData: Function,
          filterText: String,
        },
        created() {
          this.isNetworkRuleWritable =
            getDisplayFlag('write_network_rule', this.$store) &&
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
            selectedNetworkRules: [],
            isIncludingCRD: false,
            isIncludingFed: false,
            containsUnpromotableEndpoint: false,
            opType: UpdateType.Insert,
            confirmationMsg: '',
            confirmedFn: null,
            showConfirmationModal: false,
            isNetworkRuleWritable: false,
            READONLY_RULE_MODIFIED: 46,
            UNPROMOTABLE_ENDPOINT_PATTERN: new RegExp(/^Host\:*|^Workload\:*/)
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
        beforeMount() {
          this.columnDefs = [
            {
              headerName: this.t('policy.gridHeader.ID'),
              headerCheckboxSelection: this.isWriteNetworkRuleAuthorized && this.source !== NV_CONST.NAV_SOURCE.GROUP,
              headerCheckboxSelectionFilteredOnly: this.isWriteNetworkRuleAuthorized && this.source !== NV_CONST.NAV_SOURCE.GROUP,
              field: 'id',
              checkboxSelection: this.checkboxSelectionFunc.bind(this),
              cellRenderer: 'IdCellComponent',
              width: 100,
              minWidth: 100,
              maxWidth: 100,
            },
            {
              headerName: this.t('policy.gridHeader.FROM'),
              field: 'from',
              cellRenderer: 'FromToCellComponent',
              colSpan: function (params) {
                if (params.data && params.data.id === -1) {
                  return this.isWriteNetworkRuleAuthorized ? 9 : 8;
                }
                return 1;
              },
              comparator: this.fromComparator.bind(this),
              width: 280,
            },
            {
              headerName: this.t('policy.gridHeader.TO'),
              field: 'to',
              cellRenderer: 'FromToCellComponent',
              comparator: this.toComparator.bind(this),
              width: 280,
            },
            {
              headerName: this.t('policy.gridHeader.APPLICATIONS'),
              field: 'applications',
              cellRenderer: 'ApplicationsCellComponent',
              width: 200,
            },
            {
              headerName: this.t('policy.gridHeader.PORT'),
              field: 'ports',
              cellRenderer: 'PortsCellComponent',
              width: 200,
            },
            {
              headerName: this.t('policy.gridHeader.ACTION'),
              field: 'action',
              cellRenderer: 'ActionCellComponent',
              width: 85,
              minWidth: 85,
              maxWidth: 85,
            },
            {
              headerName: this.t('policy.gridHeader.TYPE'),
              field: 'cfg_type',
              cellRenderer: 'CfgTypeCellComponent',
              cellClass: 'grid-center-align',
              width: 110,
              minWidth: 110,
              maxWidth: 110,
              // hide: this.isScoreImprovement,
            },
            {
              headerName: this.t('policy.gridHeader.UPDATE_AT'),
              field: 'last_modified_timestamp',
              cellRenderer: 'UpdateAtCellComponent',
              comparator: this.dateComparator.bind(this),
              icons: {
                sortAscending: '<em class="fas fa-sort-numeric-up"/>',
                sortDescending: '<em class="fas fa-sort-numeric-down"/>',
              },
              width: 200,
            },
            {
              cellRenderer: 'ActionButtonsComponent',
              cellClass: ['grid-right-align'],
              cellRendererParams: {
                addRuleBelow: event => this.addRuleBelow(event),
                editRule: event => this.editRule(event),
                deleteSelectedRule: event => this.deleteSelectedRule(event),
                undeleteSelectedRule: event => this.undeleteSelectedRule(event),
              },
              width: 120,
              maxWidth: 120,
              minWidth: 120,
              hide: !this.isWriteNetworkRuleAuthorized || this.source === NV_CONST.NAV_SOURCE.GROUP,
            },
          ];
          this.gridOptions = {
            defaultColDef: {
              resizable: true,
              sortable: this.source === NV_CONST.NAV_SOURCE.GROUP,
            },
            headerHeight:  30,
            rowHeight: 30,
            animateRows: true,
            suppressDragLeaveHidesColumns: true,
            rowSelection: 'multiple',
            isRowSelectable: this.idSelectionFunc.bind(this),
            rowClassRules: {
              'disabled-row': function (params) {
                if (!params.data) return false;
                return !!params.data.disable;
              },
              'critical-row': function (params) {
                if (!params.data) return;
                return params.data.id === -1 && params.data.critical;
              },
            },
            onSelectionChanged: this.onSelectionChanged.bind(this),
            onGridReady: this.onGridReadyFunc.bind(this),
            overlayNoRowsTemplate: this.t('general.NO_ROWS'),
          };
        },
        methods: {
          onSelectionChanged: async function() {
            this.selectedNetworkRules = this.gridApi.getSelectedRows();
            await this.$store.dispatch('neuvector/updateSelectedNetworkRules', this.selectedNetworkRules);
            this.isIncludingCRD = this.selectedNetworkRules.some(rule => {
              return rule.cfg_type === NV_CONST.CFG_TYPE.GROUND;
            });
            this.isIncludingFed = this.selectedNetworkRules.some(rule => {
              return (
                rule.cfg_type === NV_CONST.CFG_TYPE.FED &&
                this.source === NV_CONST.NAV_SOURCE.SELF
              );
            });
            this.containsUnpromotableEndpoint = this.selectedNetworkRules.some(
              rule => {
                return (
                  this.UNPROMOTABLE_ENDPOINT_PATTERN.test(rule.from) ||
                  this.UNPROMOTABLE_ENDPOINT_PATTERN.test(rule.to)
                );
              }
            );
          },
          onGridReadyFunc: function(params) {
            const $win = $(window);
            if (params && params.api) {
              this.gridApi = params.api;
              this.$store.dispatch('neuvector/saveNetworkRulesGridApi', this.gridApi);
              // this.gridApi.setRowData(this.networkRules);
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
          checkboxSelectionFunc: function(params) {
            if (params.data && params.data.id > -1) {
              if (this.source === NV_CONST.NAV_SOURCE.FED_POLICY) {
                if (params.data) {
                  return params.data.cfg_type !== NV_CONST.CFG_TYPE.GROUND;
                }
                return false;
              } else {
                return (
                  params.data.cfg_type !== NV_CONST.CFG_TYPE.GROUND &&
                  params.data.cfg_type !== NV_CONST.CFG_TYPE.FED &&
                  !(
                    params.data.disable &&
                    params.data.cfg_type === NV_CONST.CFG_TYPE.FED
                  ) &&
                  this.isWriteNetworkRuleAuthorized &&
                  this.source !== NV_CONST.NAV_SOURCE.GROUP
                );
              }
            }
            return false;
          },
          fromComparator: function(value1, value2, node1, node2) {
            /** From as primary sort, to as secondary sort */
            return `${node1.data.from}-${node1.data.to}`.localeCompare(`${node2.data.from}-${node2.data.to}`);
          },
          toComparator: function(value1, value2, node1, node2) {
            /** To as primary sort, from as secondary sort */
            return `${node1.data.to}-${node1.data.from}`.localeCompare(`${node2.data.to}-${node2.data.from}`);
          },
          dateComparator: function(value1, value2, node1, node2) {
            /** @namespace node1.data.last_modified_timestamp */
            return (
              node1.data.last_modified_timestamp - node2.data.last_modified_timestamp
            );
          },
          idSelectionFunc: function(params) {
            if (params.data) {
              return (
                this.isWriteNetworkRuleAuthorized &&
                params.data.category !== NV_CONST.GLOBAL
              );
            }
            return false;
          },
          async updateFiltered() {
            const filteredNetworkRules = [];
            this.gridApi.forEachNodeAfterFilterAndSort(node => {
              filteredNetworkRules.push(JSON.parse(JSON.stringify(node.data)));
            });
            await this.$store.dispatch('neuvector/updateNetworkRules', filteredNetworkRules);
            this.$emit('updateCountDist');
          },
          addRuleBelow: function(event) {
            this.opType = UpdateType.Insert;
            this.selectedIndex = parseInt(event.node.id, 10);
            this.$refs.addEditRule.show();
          },
          editRule: function(event) {
            this.opType = UpdateType.Edit;
            this.selectedIndex = parseInt(event.node.id, 10);
            this.selectedRule = event.node.data;
            this.$refs.addEditRule.show();
          },
          deleteSelectedRule: async function(event) {
            this.confirmedFn = async () => {
              this.selectedIndex = parseInt(event.node.id, 10);
              await toggleDeleteRule(this.networkRules[this.selectedIndex], this.selectedIndex, false, this.$store);
              this.gridApi.setRowData(this.$store.getters['neuvector/networkRules']);
              this.showConfirmationModal = false;
            };
            this.showConfirmationModal = true;
            this.confirmationMsg = `${this.t(
              'policy.dialog.REMOVE'
            )} ${this.selectedRuleId}`;
          },
          undeleteSelectedRule: async function(event) {
            this.confirmedFn = async () => {
              this.selectedIndex = parseInt(event.node.id, 10);
              await toggleDeleteRule(this.networkRules[this.selectedIndex], this.selectedIndex, true, this.$store);
              this.gridApi.setRowData(this.$store.getters['neuvector/networkRules']);
              this.showConfirmationModal = false;
            };
            this.showConfirmationModal = true;
            this.confirmationMsg = `${this.t(
              'policy.dialog.UNREMOVE'
            )} ${this.selectedRuleId}`;
          },
          closeAddEditRuleModal: function() {
            this.showAddEditRuleModal = false;
          },
          closeConfirmationModal() {
            this.showConfirmationModal = false;
          },
          promoteNeworkRuleOnEntry: async function(event) {
            let selectedNetworkRules = await this.$store.getters['neuvector/selectedNetworkRules'];
            let payload = {
                request: {
                    ids: [event.node.data.id],
                },
            };
            try {
                await promoteNetworkRulesData(payload);
                if (this.gridApi) {
                  this.gridApi.setRowData(this.$store.getters['neuvector/networkRules']);
                } else {
                  try {
                    await this.reloadData();
                  } catch (error) {
                    console.error(error);
                  }
                }
            } catch(error) {
                console.error(error);
            };
          },
          revertNetworkRule: async function(event) {
            let networkRulesBackup = await this.$store.getters['neuvector/networkRulesBackup'];
            let networkRules = await this.$store.getters['neuvector/networkRules'];
            let indexAtBackup = networkRulesBackup.findIndex(
              rule => rule.id === id
            );
            let indexAtCurr = parseInt(event.node.id, 10);
            networkRules[indexAtCurr] = JSON.parse(
              JSON.stringify(networkRulesBackup[indexAtBackup])
            );
            this.gridApi.setRowData(
              networkRules
            );
            await this.$store.dispatch('neuvector/updateNetworkRules', networkRules);
            await this.$store.dispatch('neuvector/updateIsNetworkRuleListDirty', true);
            setTimeout(() => {
              let row =
              this.gridApi.getDisplayedRowAtIndex(
                  indexAtCurr
                );
              row.setSelected(true);
              this.gridApi.ensureIndexVisible(
                indexAtCurr,
                'top'
              );
            }, 500);
          },
        },
        computed: {
          isLightTheme() {
            return !document.body.classList.contains('theme-dark');
          },
        },
    };
</script>

<template>
    <div>
      <ag-grid-vue
        id="policy-grid"
        v-if="networkRules && networkRules.length > 0"
        style="width: 100%; height: calc(100vh - 200px)"
        :class="isLightTheme ? 'ag-theme-balham' : 'ag-theme-balham-dark'"
        :columnDefs="columnDefs"
        :gridOptions="gridOptions"
        :rowData="networkRules"
        :context="context"
      >
      </ag-grid-vue>
      <AddEditRuleModal
        ref="addEditRule"
        :autoCompleteData="autoCompleteData"
        :selectedRule="selectedRule"
        :selectedIndex="selectedIndex"
        :opType="opType"
        :gridApi="gridApi"
        @close="closeAddEditRuleModal">
      </AddEditRuleModal>
      <Confirmation v-if="showConfirmationModal" :message="confirmationMsg" @close="closeConfirmationModal" :okFn="confirmedFn"></Confirmation>
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