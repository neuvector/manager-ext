<script>
import Checkbox from '@components/Form/Checkbox/Checkbox';
import LabeledSelect from '@shell/components/form/LabeledSelect';
import { LabeledInput } from '@components/Form/LabeledInput';
import { NV_CONST } from '../../../types/neuvector';
import { UpdateType } from '../../../types/network-rules';
import { ToggleSwitch } from '@components/Form/ToggleSwitch';
import { updateGridData } from '../../../utils/network-rules';
import { mapGetters } from 'vuex';

export default {
    components: {
      Checkbox,
      LabeledSelect,
      LabeledInput,
      ToggleSwitch,
    },
    props: {
        isLightTheme: Boolean,
        autoCompleteData: Object,
        selectedRule: Object,
        selectedIndex: Number,
        opType: UpdateType,
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
      ...mapGetters({
        newId: 'neuvector/newId',
      }),
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
          isAllow: this.selectedRule.action === NV_CONST.PROCESS_PROFILE_RULE.ACTION.ALLOW,
        } :
        {
          comment: '',
          from: '',
          to: '',
          applications: [],
          ports: '',
          isAllow: false,
        };
      },
      updateRule() {
        if (this.opType === UpdateType.Edit) {
          let payload = this.getUpdatedPayload();
          updateGridData([payload], this.selectedIndex, UpdateType.Edit, null, this.$store);
        } else {
          let payload = this.getAddedPayload();
          updateGridData([payload], this.selectedIndex, this.opType, null, this.$store);
        }
        this.initializeForm();
        this.showSlideIn = false;
      },
      getAddedPayload() {
        this.$store.dispatch('neuvector/increaseNewId');
        return {
          ...this.rule,
          applications: this.rule.applications,
          action: this.rule.isAllow ?
            NV_CONST.PROCESS_PROFILE_RULE.ACTION.ALLOW :
            NV_CONST.PROCESS_PROFILE_RULE.ACTION.DENY,
          state: NV_CONST.NETWORK_RULES_STATE.NEW,
          disable: false,
          learned: false,
          id: this.newId,
        };
      },
      getUpdatedPayload() {
        return {
          ...this.rule,
          state: this.selectedRule.id >= NV_CONST.NEW_ID_SEED.NETWORK_RULE ?
            NV_CONST.NETWORK_RULES_STATE.NEW :
            NV_CONST.NETWORK_RULES_STATE.MODIFIED,
          disable: this.selectedRule.disable,
          learned: false,
        }
      },
    },
    data() {
      return {
        showSlideIn: false,
        rule: {
          comment: '',
          from: '',
          to: '',
          applications: [],
          ports: '',
          isAllow: false,
        },
        UpdateType: UpdateType,
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
    />
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
            <h5 :style="isLightTheme ? 'color: #888' : 'color: #fff'">
              {{ opType === UpdateType.Edit ? t('policy.editPolicy.TITLE') : t('policy.addPolicy.TITLE') }}
            </h5>
          </div>
        </div>
      </div>
      <div class="nv-modal">
        <div class="mt-2" v-if="opType === UpdateType.Edit">
          <LabeledInput
            class="nv-labal-input"
            v-model:value="rule.id"
            :disabled="true"
            :label="t('policy.editPolicy.POLICY_ID')"
            :mode="mode"
            @update:value="update"
          />
        </div>
        <div class="mt-2">
          <LabeledInput
            class="nv-labal-input"
            v-model:value="rule.comment"
            :label="t('policy.addPolicy.COMMENT')"
            :mode="mode"
            @update:value="update"
          />
        </div>
        <div class="mt-2">
          <LabeledSelect
            v-model:value="rule.from"
            :taggable="false"
            :searchable="true"
            :push-tags="true"
            :close-on-select="false"
            :mode="mode"
            :multiple="false"
            :label="t('policy.addPolicy.FROM')"
            :options="autoCompleteData.endpointOptions"
            :disabled="mode==='view'"
            @update:value="update"
          />
        </div>
        <div class="mt-2">
          <LabeledSelect
            v-model:value="rule.to"
            :taggable="false"
            :searchable="true"
            :push-tags="true"
            :close-on-select="false"
            :mode="mode"
            :multiple="false"
            :label="t('policy.addPolicy.TO')"
            :options="autoCompleteData.endpointOptions"
            :disabled="mode==='view'"
            @update:value="update"
          />
        </div>
        <div class="mt-2">
          <LabeledSelect
            v-model:value="rule.applications"
            :taggable="true"
            :searchable="true"
            :push-tags="true"
            :close-on-select="false"
            :mode="mode"
            :multiple="true"
            :label="t('policy.addPolicy.APP')"
            :options="autoCompleteData.applicationOptions"
            :disabled="mode==='view'"
            @update:value="update"
          />
        </div>
        
        <div class="mt-2">
          <LabeledInput
            class="nv-labal-input"
            v-model:value="rule.ports"
            :label="t('policy.editPolicy.PORT')"
            :mode="mode"
            @update:value="update"
          />
        </div>
        <div class="mt-2">
          <ToggleSwitch
            v-model:value="rule.isAllow"
            name="label-system-toggle"
            :off-label="t('policy.action.DENY')"
            :on-label="t('policy.action.ALLOW')"
          />
        </div>
        <div class="mt-2">
          <ToggleSwitch
            v-model:value="rule.disable"
            name="label-system-toggle"
            :off-value="true"
            :off-label="t('policy.status.DISABLED')"
            :on-value="false"
            :on-label="t('policy.status.ENABLED')"
          />
        </div>
        <div class="mt-3" style="text-align: right">
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
  </div>
</template>


<style lang="scss">
.vs__dropdown-menu {
    z-index: 1000 !important;
}
.nv-labal-input {
  label {
    left: 10px !important;
  }
}
.nv-modal {
  text-align: left;
}

:deep(.btn-sm) {
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