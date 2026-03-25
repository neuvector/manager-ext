<script>
    import ResourceTable from '@shell/components/ResourceTable';
    import { NV_CONST } from '../../../types/neuvector';
    import ActionMenu from '@shell/components/ActionMenu';
    import AddEditRuleModal from '../dialogs/AddEditRuleModal';
    import { UpdateType } from '../../../types/network-rules';
    import Confirmation from '../../common/dialogs/Confirmation';
    import RemovalConfirmationModal from '../dialogs/RemovalConfirmationModal';
    import Category from './cells/Category';
    import Actions from './cells/Actions';
    import CfgType from './cells/CfgType';
    import { getDisplayFlag } from '../../../utils/auth';
    import { toggleEnablement, deleteRule } from '../../../utils/response-rules';

    export default {
        components: {
            ResourceTable,
            ActionMenu,
            AddEditRuleModal,
            Confirmation,
            RemovalConfirmationModal,
            Category,
            Actions,
            CfgType,
        },
        props: {
          responseRules: Array,
          autoCompleteData: Object,
          webhooks: Array,
          source: String,
          refreshFn: Function,
        },
        fetch() {
          this.isResponseRuleWritable = getDisplayFlag('write_response_rule', this.$store) &&
            (this.source !== NV_CONST.NAV_SOURCE.GROUP &&
            this.source !== NV_CONST.NAV_SOURCE.SELF
              ? getDisplayFlag('multi_cluster_w', this.$store)
              : true);
        },
        data() {
          return {
            RESPONSE_RULES_HEADER: [
              {
                name:  'id',
                value: 'id',
                label: this.t('responsePolicy.gridHeader.ID'),
                sort:  'id',
              },
              {
                name:  'event',
                value: 'event',
                label: this.t('responsePolicy.gridHeader.TYPE'),
                sort:  'event',
              },
              {
                name:  'comment',
                value: 'comment',
                label: this.t('admissionControl.COMMENT'),
                sort:  'comment',
              },
              {
                name:  'group',
                value: 'group',
                label: this.t('responsePolicy.gridHeader.GROUP'),
                sort:  'group',
              },
              {
                name:  'conditions',
                value: 'conditions',
                label: this.t('responsePolicy.gridHeader.CRITERIA'),
                sort:  'conditions',
              },
              {
                name:  'actions',
                value: 'actions',
                label: this.t('policy.gridHeader.ACTION'),
                sort:  'actions',
              },
              {
                name:  'cfg_type',
                value: 'cfg_type',
                label: this.t('policy.gridHeader.TYPE'),
                sort:  'cfg_type',
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
        methods: {
          setActionMenuState: function(eventData) {
            const { event, targetElement } = eventData;
            this.menuOpen = !!event;
            if (event) {
              this.selectedRuleId = parseInt(targetElement.parentNode.parentNode.children[0].textContent, 10);
              this.selectedIndex = this.responseRules.findIndex(responseRule => responseRule.id === this.selectedRuleId);
              this.selectedRule = this.responseRules[this.selectedIndex];
              this.actionMenuTargetElement = targetElement;
              this.actionMenuTargetEvent = event;
            } else {
              this.actionMenuTargetElement = undefined;
              this.actionMenuTargetEvent = undefined;
            }
          },
          addRuleBelow: function() {
            this.opType = UpdateType.Insert;
            this.isReadOnly = false;
            this.$refs.addEditRule.show();
          },
          editRule: function() {
            this.opType = UpdateType.Edit;
            this.isReadOnly = false;
            this.$refs.addEditRule.show();
          },
          viewRule: function() {
            this.opType = UpdateType.Edit;
            this.isReadOnly = true;
            this.$refs.addEditRule.show();
          },
          deleteSelectedRule: function() {
            this.isQuarantined = this.selectedRule.actions.includes('quarantine');
            this.removalConfirmedFn = async (unquarantine) => {
              try {
                await deleteRule(this.selectedRuleId, unquarantine);
                this.refreshFn();
                this.showRemovalConfirmationModal = false;
              } catch(error) {
                console.log(error);
              }
            };
            this.showRemovalConfirmationModal = true;
            this.removalConfirmationMsg = `${this.t(
              'policy.dialog.REMOVE'
            )} ${this.selectedRuleId}`;
          },
          enableSelectedRule: async function() {
            try {
              await toggleEnablement(this.selectedRule, false);
              this.refreshFn();
            } catch(error) {
              console.error(error);
            }
          },
          disableSelectedRule: async function() {
            try {
              await toggleEnablement(this.selectedRule, true);
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
          }
        },
        computed: {
          isLightTheme() {
            return !document.body.classList.contains('theme-dark');
          },
          menuActions() {
            let selectedResponseRule = this.responseRules[this.selectedIndex];
            const menuActions = [];
            if(this.isResponseRuleWritable) {
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

              if (selectedResponseRule.disable) {
                menuActions.push({
                  action:  'enableRule',
                  label:   this.t('policy.TIP.ENABLE'),
                  enabled: true
                });
              } else {
                menuActions.push({
                  action:  'disableRule',
                  label:   this.t('policy.TIP.DISABLE'),
                  enabled: true
                });
              }

              menuActions.push({
                action:  'deleteRule',
                label:   this.t('policy.TIP.DELETE'),
                enabled: true
              });
            } else {
              menuActions.push({
                action:  'viewRule',
                label:   this.t('policy.editPolicy.VIEW'),
                enabled: true
              });
            }

            return menuActions;
          },
        }
    };
</script>

<template>
  <div>
    <div class="response-rules-wrap">
      <ResourceTable
        v-bind="$attrs"
        data-testid="nv-response-rules-sortable-table"
        id="nv-response-rules-sortable-table"
        :rows="responseRules"
        :headers="RESPONSE_RULES_HEADER"
        :table-actions="false"
        :row-actions="true"
        :paging="true"
        default-sort-by="from"
        @clickedActionButton="setActionMenuState"
      >
        <template #col:id="{row}">
          <td>
            {{ row.id || '-' }}
          </td>
        </template>

        <template #col:event="{row}">
          <td>
            <Category :eventType="row.event" :disable="row.disable"></Category>
          </td>
        </template>

        <template #col:comment="{row}">
          <td :class="row.disable ? 'disabled-row' : ''">
            {{ row.comment || '-' }}
          </td>
        </template>

        <template #col:group="{row}">
          <td :class="row.disable ? 'disabled-row' : ''">
            {{ row.group || '-' }}
          </td>
        </template>

        <template #col:conditions="{row}">
          <td :class="row.disable ? 'disabled-row' : ''">
            {{ row.conditions || '-' }}
          </td>
        </template>

        <template #col:actions="{row}">
          <td>
            <Actions :actions="row.actions" :disable="row.disable"></Actions>
          </td>
        </template>

        <template #col:cfg_type="{row}">
          <td>
            <CfgType :cfgType="row.cfg_type" :disable="row.disable"></CfgType>
          </td>
        </template>

      </ResourceTable>
    </div>
    <ActionMenu
        :custom-actions="menuActions"
        :open="menuOpen"
        :use-custom-target-element="true"
        :custom-target-element="actionMenuTargetElement"
        :custom-target-event="actionMenuTargetEvent"
        @close="setActionMenuState(false)"
        @addRule="addRuleBelow"
        @editRule="editRule"
        @viewRule="viewRule"
        @deleteRule="deleteSelectedRule"
        @enableRule="enableSelectedRule"
        @disableRule="disableSelectedRule"
    />
    <AddEditRuleModal 
      ref="addEditRule"
      :autoCompleteData="autoCompleteData"
      :startId="selectedRuleId"
      :isReadOnly="isReadOnly"
      :selectedRule = "responseRules[selectedIndex]"
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
    #nv-response-rules-sortable-table table thead tr {
        background-color: var(--sortable-table-header-bg) !important;
        color: var(--body-text);
        text-align: left;
    }
   
    .response-rules-wrap {
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