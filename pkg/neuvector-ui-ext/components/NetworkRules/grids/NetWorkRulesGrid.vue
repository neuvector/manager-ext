<script>
    import ResourceTable from '@shell/components/ResourceTable';
    import { NV_CONST } from '../../../types/neuvector';
    import Action from './cells/Action';
    import CfgType from './cells/CfgType';
    import Ports from './cells/Ports';
    import FromTo from './cells/FromTo';
    import Applications from './cells/Applications';
    import UpdateAt from './cells/UpdateAt';
    import Id from './cells/Id';
    // import ActionMenu from '@shell/components/ActionMenu';
    import AddEditRuleModal from '../dialogs/AddEditRuleModal';
    import { UpdateType } from '../../../types/network-rules';
    import Confirmation from '../../common/dialogs/Confirmation';
    import { toggleDeleteRule } from '../../../utils/network-rules';
    import { getDisplayFlag } from '../../../utils/auth';

    export default {
        components: {
            ResourceTable,
            Action,
            CfgType,
            Ports,
            FromTo,
            Applications,
            UpdateAt,
            Id,
            // ActionMenu,
            AddEditRuleModal,
            Confirmation,
        },
        props: {
          networkRules: Array,
          autoCompleteData: Object,
          source: String,
        },
        fetch() {
          this.isNetworkRuleWritable =
            getDisplayFlag('write_network_rule', this.$store) &&
            (this.source !== NV_CONST.NAV_SOURCE.GROUP &&
            this.source !== NV_CONST.NAV_SOURCE.SELF
              ? getDisplayFlag('multi_cluster_w', this.$store)
              : true);
        },
        data() {
          return {
            NETWORK_RULES_HEADER: [
              {
                name:  'id',
                value: 'id',
                label: this.t('policy.gridHeader.ID'),
                sort:  'id',
              },
              {
                name:  'from',
                value: 'from',
                label: this.t('policy.gridHeader.FROM'),
                sort:  'form',
              },
              {
                name:  'to',
                value: 'to',
                label: this.t('policy.gridHeader.TO'),
                sort:  'to',
              },
              {
                name:  'applications',
                value: 'applications',
                label: this.t('policy.gridHeader.APPLICATIONS'),
                sort:  'applications'
              },
              {
                name:  'ports',
                value: 'ports',
                label: this.t('policy.gridHeader.PORT'),
                sort:  'ports',
              },
              {
                name:  'action',
                value: 'action',
                label: this.t('policy.gridHeader.ACTION'),
                sort:  'action',
              },
              {
                name:  'cfg_type',
                value: 'cfg_type',
                label: this.t('policy.gridHeader.TYPE'),
                sort:  'cfg_type',
              },
              {
                name:  'last_modified_timestamp',
                value: 'last_modified_timestamp',
                label: this.t('policy.gridHeader.UPDATE_AT'),
                sort:  'last_modified_timestamp',
              },
            ],
            menuOpen: false,
            actionMenuTargetElement:  null,
            actionMenuTargetEvent:    null,
            receiverActions:      [],
            selectedRuleId: 0,
            selectedRule: null,
            selectedIndex: 0,
            opType: UpdateType.Insert,
            confirmationMsg: '',
            confirmedFn: null,
            showConfirmationModal: false,
            isNetworkRuleWritable: false,
          };
        },
        methods: {
          setActionMenuState: function(eventData) {
            const { event, targetElement } = eventData;
            this.menuOpen = !!event;
            if (event) {
              this.selectedRuleId = parseInt(targetElement.parentNode.parentNode.children[1].children[0].textContent, 10);
              this.selectedIndex = this.networkRules.findIndex(networkRule => networkRule.id === this.selectedRuleId);
              this.actionMenuTargetElement = targetElement;
              this.actionMenuTargetEvent = event;
            } else {
              this.actionMenuTargetElement = undefined;
              this.actionMenuTargetEvent = undefined;
            }
          },
          addRuleBelow: function() {
            this.opType = UpdateType.Insert;
            this.$refs.addEditRule.show();
          },
          editRule: function() {
            this.opType = UpdateType.Edit;
            this.selectedRule = this.networkRules.filter(networkRule => networkRule.id === this.selectedRuleId)[0];
            this.$refs.addEditRule.show();
          },
          deleteSelectedRule: function() {
            this.confirmedFn = async () => {
              await toggleDeleteRule(this.networkRules[this.selectedIndex], this.selectedIndex, false, this.$store);
              this.showConfirmationModal = false;
            };
            this.showConfirmationModal = true;
            this.confirmationMsg = `${this.t(
              'policy.dialog.REMOVE'
            )} ${this.selectedRuleId}`;
          },
          undeleteSelectedRule: function() {
            this.confirmedFn = async () => {
              await toggleDeleteRule(this.networkRules[this.selectedIndex], this.selectedIndex, true, this.$store);
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
        },
        computed: {
          menuActions() {
            const menuActions = [];
            menuActions.push({
              action:  'addRule',
              label:   this.t('policy.TIP.ADD'),
              enabled: true
            });

            menuActions.push({
              action:  'editRule',
              label:   this.t('policy.TIP.EDIT'),
              enabled: true
            });

            menuActions.push({
              action:  'deleteRule',
              label:   this.t('policy.TIP.DELETE'),
              enabled: true
            });
            
            menuActions.push({
              action:  'undeleteRule',
              label:   this.t('policy.TIP.UNDELETE'),
              enabled: true
            });
            
            menuActions.push({
              action:  'promoteRule',
              label:   this.t('policy.PROMOTE'),
              enabled: true
            });

            if (!this.showCatalogList) {
              menuActions.push({
                action:  'revertRule',
                label:   this.t('policy.TIP.REVERT'),
                enabled: true
              });
            }

            return menuActions;
          },
          isWriteNetworkRuleAuthorized: function() {
            return getDisplayFlag('write_network_rule', this.$store);
          },
        }
    };
</script>

<template>
  <div>
    <div class="network-rules-wrap">
      {{ $refs.networkRules?.selectedRows }}
      <ResourceTable
        ref="networkRules"
        data-testid="nv-network-rules-sortable-table"
        id="nv-network-rules-sortable-table"
        :rows="networkRules"
        :headers="NETWORK_RULES_HEADER"
        :table-actions="isNetworkRuleWritable"
        :row-actions="isNetworkRuleWritable"
        :paging="true"
        @clickedActionButton="setActionMenuState"
      >
        <template #col:id="{row}">
          <td>
            <Id :rule="row"></Id>
          </td>
        </template>

        <template #col:from="{row}">
          <td>
            <FromTo :isFrom="true" :rule="row"></FromTo>
          </td>
        </template>

        <template #col:to="{row}">
          <td>
            <FromTo :isFrom="false" :rule="row"></FromTo>
          </td>
        </template>

        <template #col:applications="{row}">
          <td>
            <Applications :rule="row"></Applications>
          </td>
        </template>

        <template #col:ports="{row}">
          <td>
            <Ports :rule="row"></Ports>
          </td>
        </template>

        <template #col:action="{row}">
          <td>
            <Action :rule="row"></Action>
          </td>
        </template>

        <template #col:cfg_type="{row}">
          <td>
            <CfgType :rule="row"></CfgType>
          </td>
        </template>

        <template #col:last_modified_timestamp="{row}">
          <td>
            <UpdateAt :rule="row"></UpdateAt>
          </td>
        </template>

      </ResourceTable>
    </div>

    <AddEditRuleModal
      ref="addEditRule"
      :autoCompleteData="autoCompleteData"
      :selectedRule="selectedRule"
      :selectedIndex="selectedIndex"
      :opType="opType"
      @close="closeAddEditRuleModal">
    </AddEditRuleModal>
    <Confirmation v-if="showConfirmationModal" :message="confirmationMsg" @close="closeConfirmationModal" :okFn="confirmedFn"></Confirmation>
  </div>
  
</template>


<style lang="scss">
    @import '../../../styles/neuvector.scss';
    #nv-network-rules-sortable-table table thead tr {
        background-color: var(--sortable-table-header-bg) !important;
        color: var(--body-text);
        text-align: left;
    }
   
    .network-rules-wrap {
        position: relative;
        .download-btn {
            position: absolute;
            left: 0;
            top: 0;
            z-index: 20;
        }
    }

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