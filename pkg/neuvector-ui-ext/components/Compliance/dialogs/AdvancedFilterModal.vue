<script>
    import { Card } from '@components/Card';
    import Checkbox from '@components/Form/Checkbox/Checkbox';
    import LabeledSelect from '@shell/components/form/LabeledSelect';
    import ButtonDropdown from '@shell/components/ButtonDropdown';
    import Select from '@shell/components/form/Select';
    import { LabeledInput } from '@components/Form/LabeledInput';
    import { RadioGroup } from '@components/Form/Radio';
    import MultiRangeSlider from 'multi-range-slider-vue';
    import DatePicker from 'vue-datepicker-next';
    import 'vue-datepicker-next/index.css';

    export default {
        components: {
          Card,
          Checkbox,
          LabeledSelect,
          ButtonDropdown,
          Select,
          LabeledInput,
          RadioGroup,
          MultiRangeSlider,
          DatePicker,
        },
        props: {
          isLightTheme: Boolean,
          inputFilter: Object,
          domains: Array,
        },
        methods: {
          show() {
            this.showSlideIn = true;
          },
          hide() {
            this.showSlideIn = false;
          },
          reset() {
            this.$emit('close', { reset: true });
            this.hide();
          },
          apply() {
            this.$emit('close', this.advFilter);
            this.hide();
          },
          changeImpact(selectedImpact) {
            this.selectedImpact = selectedImpact;
          },
          clear(filterView) {
            switch (filterView) {
              case 'service':
                this.advFilter.serviceName = '';
                this.advFilter.matchTypes.Service = this.matchTypes[0].value;
                break;
              case 'image':
                this.advFilter.imageName = '';
                this.advFilter.matchTypes.Image = this.matchTypes[0].value;
                break;
              case 'node':
                this.advFilter.nodeName = '';
                this.advFilter.matchTypes.Node = this.matchTypes[0].value;
                break;
              case 'container':
                this.advFilter.containerName = '';
                this.advFilter.matchTypes.Container = this.matchTypes[0].value;
                break;
            }
          },
        },
        data() {
          return {
            advFilter: JSON.parse(JSON.stringify(this.inputFilter)),
            matchTypes: [
              { label: '=', value: 'equals' },
              {
                label: this.t('admissionControl.operators.CONTAINS'),
                value: 'contains',
              },
            ],
            scoredOptions: [
              { label: this.t('setting.ALL'), value: 'all' },
              { label: 'True', value: 'true' },
              { label: 'False', value: 'false' },
            ],
            profileOptions: [
              { label: this.t('setting.ALL'), value: 'all' },
              { label: 'Level 1', value: 'Level 1' },
              { label: 'Level 2', value: 'Level 2' },
            ],
            impactOptions: [
              { label: this.t('admissionControl.names.SERVICE'), value: { matchType: 'Service', name: 'serviceName' } },
              { label: this.t('admissionControl.names.IMAGE'), value: { matchType: 'Image', name: 'imageName' } },
              { label: this.t('admissionControl.names.NODE'), value: { matchType: 'Node', name: 'nodeName' } },
              { label: this.t('admissionControl.names.CONTAINER'), value: { matchType: 'Container', name: 'containerName' } },
            ],
            selectedImp: null,
            showSlideIn: false,
          };
        },
        watch: {
          inputFilter(newAdvFilter, oldAdvFilter) {
            this.advFilter = JSON.parse(JSON.stringify(newAdvFilter));
          }
        },
        computed: {
          filteredImpactOptions() {
            if (this.advFilter.selectedDomains.length === 0) {
              return this.impactOptions;
            } else {
              // exclude image and node
              return [this.impactOptions[0], this.impactOptions[3]];
            }
          },
          selectedImpact: {
            get() {
              return this.selectedImp ? this.selectedImp : this.filteredImpactOptions[0];
            },
            set(selectedImpact) {
              this.selectedImp = selectedImpact;
            }
          }
        }
    };
</script>

<template>
  <div
    class="adv-filter-panel"
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
          class="adv-filter-content"
        >
          <div class="adv-filter-header pb-10">
            <div class="slideIn__header__buttons">
              <button class="btn btn-sm role-link" @click="hide">
                <span>Close</span>
                <i class="icon icon-chevron-right" />
              </button>
            </div>
          </div>

          <div class="adv-filter-title mt-20">
            <h5 :style="isLightTheme ? 'color: #888' : 'color: #fff'">
              {{ t('general.FILTER_MATCH_ALL') }}
            </h5>
          </div>
        </div>
      </div>
      <div class="adv-filter-modal">
        <div>
          <div class="row align-items-center mt-2">
            <div class="col-3 text-bold">{{ t('nodes.gridHeader.CATEGORY') }}</div>
            <div class="col-9">
                <Checkbox v-model:value="advFilter.category.docker" label="Docker"/>
                <Checkbox v-model:value="advFilter.category.kubernetes" label="Kubernetes"/>
                <Checkbox v-model:value="advFilter.category.custom" label="Custom"/>
                <Checkbox v-model:value="advFilter.category.image" label="Image"/>
            </div>
          </div>
          <div class="row align-items-center mt-2">
            <div class="col-3 text-bold">{{ t('cis.profile.REGULATIONS') }}</div>
            <div class="col-9">
                <Checkbox v-for="(_, key) in advFilter.tags" v-model:value="advFilter.tags[key]" :label="key" :key="key" />
            </div>
          </div>
          <div class="row align-items-center mt-2">
            <div class="col-3 text-bold">{{ t('cis.report.gridHeader.SCORED') }}</div>
            <div class="col-9">
              <RadioGroup v-model:value="advFilter.scoredType" name="score_filter" :options="scoredOptions" :row="true" class="vul-radio-group" />
            </div>
          </div>
          <div class="row align-items-center mt-2">
            <div class="col-3 text-bold">{{ t('profile.TITLE') }}</div>
            <div class="col-9">
              <RadioGroup v-model:value="advFilter.profileType" name="severity_filter" :options="profileOptions" :row="true" class="vul-radio-group" />
            </div>
          </div>
          <div class="row align-items-center mt-2">
            <div class="col-3 text-bold">{{ t('ldap.gridHeader.DOMAINS') }}</div>
            <div class="col-3">
              <Select
                v-model:value="advFilter.matchType4Ns"
                :options="matchTypes"
              />
            </div>
            <div class="col-6">
              <LabeledSelect
                v-model:value="advFilter.selectedDomains"
                :taggable="true"
                :options="domains"
                :searchable="true"
                :push-tags="true"
                :multiple="true"
              />
            </div>
          </div>
          <div class="row align-items-center mt-2">
            <div class="col-3">
              <ButtonDropdown
                :buttonLabel="selectedImpact.label"
                :value="selectedImpact.label"
                :dropdownOptions="filteredImpactOptions" 
                size="sm"
                @click-action="changeImpact" 
              />
            </div>
            <div class="col-3">
              <Select
                v-model:value="advFilter.matchTypes[selectedImpact.value.matchType]"
                :options="matchTypes"
              />
            </div>
            <div class="col-6">
              <LabeledInput v-model:value="advFilter[selectedImpact.value.name]" />
            </div>
          </div>
          <div class="mt-15">
            <span v-if="advFilter.serviceName" class="badge badge-secondary mb-1 mr-5 d-inline-flex justify-content-center align-items-center">
              {{ t('admissionControl.names.SERVICE') }}
              {{ advFilter.matchTypes.Service === 'equals' ? '=' : '~' }}
              {{ advFilter.serviceName }}
              <button
                id="remove-service"
                class="remove-button p-1"
                @click="clear('service')">
                <em class="icon icon-close"></em>
              </button>
            </span>
            <span v-if="advFilter.imageName" class="badge badge-secondary mb-1 mr-5 d-inline-flex justify-content-center align-items-center">
              {{ t('admissionControl.names.IMAGE') }}
              {{ advFilter.matchTypes.Image === 'equals' ? '=' : '~' }}
              {{ advFilter.imageName }}
              <button
                id="remove-image"
                class="remove-button p-1"
                @click="clear('image')">
                <em class="icon icon-close"></em>
              </button>
            </span>
            <span v-if="advFilter.nodeName" class="badge badge-secondary mb-1 mr-5 d-inline-flex justify-content-center align-items-center">
              {{ t('admissionControl.names.NODE') }}
              {{ advFilter.matchTypes.Node === 'equals' ? '=' : '~' }}
              {{ advFilter.nodeName }}
              <button
                id="remove-node"
                class="remove-button p-1"
                @click="clear('node')">
                <em class="icon icon-close"></em>
              </button>
            </span>
            <span v-if="advFilter.containerName" class="badge badge-secondary mb-1 mr-5 d-inline-flex justify-content-center align-items-center">
              {{ t('admissionControl.names.CONTAINER') }}
              {{ advFilter.matchTypes.Container === 'equals' ? '=' : '~' }}
              {{ advFilter.containerName }}
              <button
                id="remove-container"
                class="remove-button p-1"
                @click="clear('container')">
                <em class="icon icon-close"></em>
              </button>
            </span>
          </div>
        </div>
        <div class="mt-3" style="text-align: right;">
          <a
            mat-button
            class="btn role-secondary"
            aria-label="Reset all filters"
            type="button"
            @click="reset()">
            {{ t('enum.RESET') }}
          </a>
          <a
            mat-button
            class="btn role-primary"
            aria-label="Apply filters"
            type="button"
            @click="apply()">
            {{ t('enum.APPLY') }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>


<style lang="scss" scoped>
  @import '../../../styles/vulnerabilities.scss';

  .vs__dropdown-menu {
      z-index: 1000 !important;
  }

  .vul-radio-group :deep(.row > *) {
    width: auto;
  }

  :deep(.btn-sm) {
    padding: 0 7px 0 0;
  }

  .adv-filter-panel {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 10;
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

      .adv-filter-content {
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

      .adv-filter-header {
        border-bottom: 1px solid var(--border);
        display: flex;
        align-items: center;

        .adv-filter-title {
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

      .adv-filter-modal {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      
      &__show {
        right: 0;
      }
    }
  }
</style>