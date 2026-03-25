<script>
import Checkbox from '@components/Form/Checkbox/Checkbox';
import LabeledSelect from '@shell/components/form/LabeledSelect';
import { LabeledInput } from '@components/Form/LabeledInput';
import { NV_CONST, NV_MAP } from '../../../types/neuvector';
import { UpdateType } from '../../../types/network-rules';
import { ToggleSwitch } from '@components/Form/ToggleSwitch';
import { filterSelectedOptions, mapWebwooks } from '../../../utils/response-rules';
import { insertUpdateResponseRuleData } from '../../../plugins/response-rules-class';
import { mapGetters } from 'vuex';

export default {
    components: {
      Checkbox,
      LabeledSelect,
      LabeledInput,
      ToggleSwitch,
    },
    props: {
        startId: Number,
        autoCompleteData: Object,
        webhooks: Array,
        source: String,
        selectedRule: Object,
        selectedIndex: Number,
        opType: UpdateType,
        isReadOnly: Boolean,
        refreshFn: Function,
        mode: { type: String, default: 'edit' }
    },
    watch: {
      showSlideIn(newShowSlideIn, oldShowSlideIn) {
        if (!!newShowSlideIn) {
          this.initializeForm();
        }
      }
    },
    computed: {
        isLightTheme() {
            return !document.body.classList.contains('theme-dark');
        },
        getConditionOptions() {
            let name = this.autoCompleteData.conditionOptions[this.rule.event].name ?
                this.autoCompleteData.conditionOptions[this.rule.event].name : [];
            let level = this.autoCompleteData.conditionOptions[this.rule.event].level ?
                this.autoCompleteData.conditionOptions[this.rule.event].level : [];
            let list = name.concat(level);
            return list.sort();
        },
        isWebhookSelected() {
            return this.opType === UpdateType.Edit ?
                this.selectedRule.actions.includes('webhook') :
                this.rule.actions[
                    NV_CONST.RESPONSE_RULE[NV_MAP.responseRuleActionMap[this.rule.event]].findIndex(action => action === 'webhook')
                ];
        }
    },
    methods: {
      show() {
        this.showSlideIn = true;
      },
      hide() {
        this.showSlideIn = false;
      },
      update() {},
      initializeForm() {
        this.rule = this.opType === UpdateType.Edit ?
        {
            ...this.selectedRule,
            actions: this.selectedRule.actions.map(action => {
                return NV_CONST.RESPONSE_RULE[NV_MAP.responseRuleActionMap[this.selectedRule.event]].includes(action);
            }),
            webhooks: mapWebwooks(
                this.selectedRule ? this.selectedRule.webhooks : [],
                this.webhooks
            ),
        } :
        {
            id: this.startId,
            event: NV_CONST.RESPONSE_RULE.EVENTS_K8S[0],
            group: '',
            comment: '',
            conditions: [],
            actions: [false, false, false],
            disable: false,
            webhooks: [],
        };
        this.shouldHideWebhookList =
            (
                this.opType === NV_CONST.MODAL_OP.EDIT &&
                (
                    this.selectedRule.cfg_type === NV_CONST.CFG_TYPE.FED ||
                    this.selectedRule.cfg_type === NV_CONST.CFG_TYPE.GROUND
                ) && this.isReadOnly
            ) && this.source !== NV_CONST.NAV_SOURCE.FED_POLICY;
      },
      async updateRule() {
        try {
            await insertUpdateResponseRuleData(
            this.rule,
            NV_CONST.RESPONSE_RULE[NV_MAP.responseRuleActionMap[this.rule.event]],
            this.opType,
            this.webhooks,
            NV_CONST.SCOPE.LOCAL,
        )
        this.refreshFn();
        this.initializeForm();
        } catch (error) {
            console.error(error);
        } finally {
            this.showSlideIn = false;
        }
      },
    },
    data() {
      return {
        showSlideIn: false,
        rule: {
            event: NV_CONST.RESPONSE_RULE.EVENTS_K8S[0],
            group: '',
            comment: '',
            conditions: [],
            actions: [false, false, false],
            disable: false,
            webhooks: [],
        },
        UpdateType: UpdateType,
        NV_CONST: NV_CONST,
        NV_MAP: NV_MAP,
        shouldHideWebhookList: false,
      }
    }
};
</script>

<template>
  <div
    class="add-edit-rule-dialog"
    :style="`--banner-top-offset: 0px`"
  >
    <div
      v-if="showSlideIn"
      class="glass"
      @click="hide()"
    ></div>
    <div
      class="slideIn"
      :class="{'hide': false, 'slideIn__show': showSlideIn}"
    >
      <div class="slideIn__header">
        <div
          class="add-edit-rule-content"
        >
          <div class="add-edit-rule-header pb-10">
            <div class="slideIn__header__buttons">
              <button class="btn btn-sm role-link" @click="hide">
                <span>Close</span>
                <i class="icon icon-chevron-right" />
              </button>
            </div>
          </div>

          <div class="add-edit-rule-title mt-20">
            <h5 class="modal-title">
              {{ opType === UpdateType.Edit ? 
                (isReadOnly ? t('policy.editPolicy.VIEW') : t('policy.editPolicy.TITLE')) :
                t('policy.addPolicy.TITLE') }}
            </h5>
          </div>
        </div>
      </div>
      <div class="nv-modal">
        <div class="mt-2" v-if="opType === UpdateType.Edit">
          <LabeledInput
            class="nv-labal-input"
            v-model="rule.id"
            :disabled="true"
            :label="t('responsePolicy.gridHeader.ID')"
            :mode="mode"
            @input="update"
          />
        </div>
        <div class="mt-2">
          <LabeledSelect
            v-model="rule.event"
            :taggable="false"
            :push-tags="true"
            :close-on-select="false"
            :mode="mode"
            :multiple="false"
            :label="t('responsePolicy.gridHeader.TYPE')"
            :options="NV_CONST.RESPONSE_RULE.EVENTS_K8S"
            :disabled="isReadOnly"
            @input="update"
          />
        </div>
        <div class="mt-2">
          <LabeledSelect
            v-if="!NV_MAP.EVENT_WITHOUT_GROUP.includes(rule.event)"
            v-model="rule.group"
            :taggable="false"
            :searchable="true"
            :push-tags="true"
            :close-on-select="false"
            :mode="mode"
            :multiple="false"
            :label="t('responsePolicy.gridHeader.GROUP')"
            :options="autoCompleteData.groups"
            :disabled="isReadOnly"
            @input="update"
          />
        </div>
        <div class="mt-2">
          <LabeledInput
            class="nv-labal-input"
            v-model="rule.comment"
            :label="t('policy.addPolicy.COMMENT')"
            :mode="mode"
            :disabled="isReadOnly"
            @input="update"
          />
        </div>
        <div class="mt-2">
          <LabeledSelect
            v-model="rule.conditions"
            :taggable="true"
            :searchable="true"
            :push-tags="true"
            :close-on-select="false"
            :mode="mode"
            :multiple="true"
            :label="t('responsePolicy.message.ADD_CRITERIA')"
            :options="getConditionOptions"
            :disabled="mode==='view'"
            @input="update"
          />
        </div>
        <div class="mt-1">{{ t('responsePolicy.dialog.content.HINT')}}{{ NV_MAP.responseRuleCriteriaSampleMap[rule.event] || '' }}</div>
        <div class="text-bold mt-2">{{ t('responsePolicy.gridHeader.ACTION') }}</div>
            <div class="mt-2">
                <Checkbox 
                    v-for="(action, index) in NV_CONST.RESPONSE_RULE[NV_MAP.responseRuleActionMap[rule.event]]"
                    :key="index"
                    v-model="rule.actions[index]"
                    :label="t('responsePolicy.actions.' + action.toUpperCase())"
                    @input="update"
                />
            </div>
        </div>
        <div class="mt-2" v-if="isWebhookSelected && webhooks.length > 0 && !shouldHideWebhookList">
            <div class="text-bold">{{ t('setting.WEBHOOKS') }}</div>
            <div class="mt-2">
                <Checkbox 
                    v-for="(webhook, index) in webhooks"
                    :key="index"
                    v-model="rule.webhooks[index]"
                    :label="webhook"
                    @input="update"
                />
            </div>
        </div>
        <div class="mt-2">
          <ToggleSwitch
            v-model="rule.disable"
            name="label-system-toggle"
            :off-value="true"
            :off-label="t('policy.status.DISABLED')"
            :on-value="false"
            :on-label="t('policy.status.ENABLED')"
          />
        </div>
        <div class="mt-3" style="text-align: right" v-if="!isReadOnly">
          <a
            mat-button
            class="btn role-primary"
            aria-label="Add edit rule"
            type="button"
            @click="updateRule()">
            {{ opType === UpdateType.Edit ? t('policy.editPolicy.UPDATE') : t('policy.addPolicy.ADD') }}
          </a>
        </div>
      </div>
    </div>
</template>


<style lang="scss">
.vs__dropdown-menu {
    z-index: 1000 !important;
}
.modal-title { color: var(--body-text); }
.nv-labal-input {
  label {
    left: 10px !important;
  }
}
.nv-modal {
  text-align: left;
}

::v-deep(.btn-sm) {
  padding: 0 7px 0 0;
}

.add-edit-rule-dialog {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 20;
  overflow-y: auto;

  $slideout-width: 35%;
  $title-height: 50px;
  $padding: 5px;
  $slideout-width: 45%;
  --banner-top-offset: 0;
  $header-height: calc(54px + var(--banner-top-offset));

  .glass {
    position: fixed;
    top: $header-height;
    height: calc(100% - $header-height);
    left: 0;
    width: 100%;
    opacity: 0;
    overflow-y: auto;
  }

  .slideIn {
    border-left: var(--header-border-size) solid var(--header-border);
    position: fixed;
    top: $header-height;
    right: -$slideout-width;
    height: calc(100% - $header-height);
    background-color: var(--topmenu-bg);
    width: $slideout-width;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    box-shadow: -3px 0 5px rgba(0, 0, 0, 0.1);

    padding: 10px;

    transition: right .5s ease;

    &__header {
      text-transform: capitalize;
    }

    .add-edit-rule-content {
      display: flex;
      flex-direction: column;
      overflow-y: auto;
    }

    h3 {
      font-size: 14px;
      margin: 0;
      opacity: 0.7;
      text-transform: uppercase;
    }

    .add-edit-rule-header {
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;

      .add-edit-rule-title {
        flex: 1;
      }
    }

    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      &__buttons {
        display: flex;
        align-items: center;
      }

      &__button {
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;

        > i {
          font-size: 20px;
          opacity: 0.5;
        }

        &:hover {
          background-color: var(--wm-closer-hover-bg);
        }
      }
    }

    &__show {
      right: 0;
    }
  }
}
</style>