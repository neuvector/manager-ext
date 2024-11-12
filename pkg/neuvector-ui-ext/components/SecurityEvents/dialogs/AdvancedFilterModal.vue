<script>
    import Checkbox from '@components/Form/Checkbox/Checkbox';
    import LabeledSelect from '@shell/components/form/LabeledSelect';
    import { LabeledInput } from '@components/Form/LabeledInput';
    import { parseAdvFilterParam, filterSecEvents, loadFilters } from '../../../utils/security-events';
    import { nvVariables } from '../../../types/neuvector';

    export default {
        components: {
          Checkbox,
          LabeledSelect,
          LabeledInput
        },
        props: {
            isLightTheme: Boolean,
            autoCompleteData: Object,
            mode: { type: String, default: 'edit' }
        },
        fetch(){
          console.log("autoCompleteData", this.autoCompleteData)
        },
        methods: {
          show() {
            this.showSlideIn = true;
          },
          hide() {
            this.showSlideIn = false;
          },
          update() {},
          reset() {
            this.filters = {
              dateFrom: nvVariables.securityEventsServiceData.filterItems.dateFrom,
              dateTo: nvVariables.securityEventsServiceData.filterItems.dateTo,
              severity: {
                error: false,
                critical: false,
                warning: false,
                info: false
              },
              location: {
                host: false,
                container: false
              },
              category: {
                network: false,
                package: false,
                file: false,
                tunnel: false,
                process: false,
                priviledge: false,
              },
              other: false,
              host: '',
              source: '',
              destination: '',
              domains: [],
              includedKeyword: '',
              excludedKeyword: ''
            };
            document.getElementById('quick-filter').value = '';
            let filterParam = parseAdvFilterParam(this.filters);
            loadFilters(filterParam);
            filterSecEvents();
            this.showSlideIn = false;
          },
          apply() {
            this.filters.dateFrom = nvVariables.securityEventsServiceData.filterItems.dateFrom;
            this.filters.dateTo = nvVariables.securityEventsServiceData.filterItems.dateTo;
            let filterParam = parseAdvFilterParam(this.filters);
            loadFilters(filterParam);
            filterSecEvents();
            this.showSlideIn = false;
          }
        },
        data() {
          return {
            filters: {
              dateFrom: 0,
              dateTo: 0,
              severity: {
                error: nvVariables.securityEventsServiceData.filterItems.severity.includes('error'),
                critical: nvVariables.securityEventsServiceData.filterItems.severity.includes('critical'),
                warning: nvVariables.securityEventsServiceData.filterItems.severity.includes('warning'),
                info: nvVariables.securityEventsServiceData.filterItems.severity.includes('info'),
              },
              location: {
                host: nvVariables.securityEventsServiceData.filterItems.location.includes('host'),
                container: nvVariables.securityEventsServiceData.filterItems.location.includes('container'),
              },
              category: {
                network: nvVariables.securityEventsServiceData.filterItems.category.includes('network'),
                package: nvVariables.securityEventsServiceData.filterItems.category.includes('package'),
                file: nvVariables.securityEventsServiceData.filterItems.category.includes('file'),
                tunnel: nvVariables.securityEventsServiceData.filterItems.category.includes('tunnel'),
                process: nvVariables.securityEventsServiceData.filterItems.category.includes('process'),
                priviledge: nvVariables.securityEventsServiceData.filterItems.category.includes('priviledge'),
              },
              other: nvVariables.securityEventsServiceData.filterItems.other.length > 0,
              host: nvVariables.securityEventsServiceData.filterItems.host,
              source: nvVariables.securityEventsServiceData.filterItems.source,
              destination: nvVariables.securityEventsServiceData.filterItems.destination,
              domains: nvVariables.securityEventsServiceData.filterItems.selectedDomains,
              includedKeyword: nvVariables.securityEventsServiceData.filterItems.includedKeyword,
              excludedKeyword: nvVariables.securityEventsServiceData.filterItems.excludedKeyword
            },
            showSlideIn: false
          }
        }
    };
</script>

<template>
  <div
    class="adv-filter-dialog"
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
      <div class="nv-modal">
        <div class="row mt-2">
            <div class="text-bold">{{ t('securityEvent.SEVERITY') }}</div>
            <div class="mt-2">
              <Checkbox v-model="filters.severity.error" :label="t('enum.ERROR')" @input="update"/>
              <Checkbox v-model="filters.severity.critical" :label="t('enum.CRITICAL')" @input="update"/>
              <Checkbox v-model="filters.severity.warning" :label="t('enum.WARNING')" @input="update"/>
              <Checkbox v-model="filters.severity.info" :label="t('enum.INFO')" @input="update"/>
            </div>
          </div>
          <div class="row mt-2">
            <div class="text-bold">{{ t('securityEvent.LOCATION') }}</div>
            <div class="mt-2">
              <Checkbox v-model="filters.location.host" :label="t('securityEvent.label.HOST')" @input="update"/>
              <Checkbox v-model="filters.location.container" :label="t('securityEvent.label.CONTAINER')" @input="update"/>
            </div>
          </div>
          <div class="row mt-2">
            <div class="text-bold">{{ t('event.gridHeader.CATEGORY') }}</div>
            <div class="mt-2">
              <Checkbox v-model="filters.category.network" :label="t('securityEvent.label.NETWORK')" @input="update"/>
              <Checkbox v-model="filters.category.package" :label="t('securityEvent.label.PACKAGE')" @input="update"/>
              <Checkbox v-model="filters.category.file" :label="t('securityEvent.label.FILE')" @input="update"/>
              <Checkbox v-model="filters.category.tunnel" :label="t('securityEvent.label.TUNNEL')" @input="update"/>
              <Checkbox v-model="filters.category.process" :label="t('securityEvent.label.PROCESS')" @input="update"/>
              <Checkbox v-model="filters.category.priviledge" :label="t('securityEvent.label.PRIVILEDGE')" @input="update"/>
              <Checkbox v-model="filters.other" :label="t('securityEvent.label.OTHER')" @input="update"/>
            </div>
          </div>
          <hr />
          <div class="mt-2">
            <LabeledSelect
              v-model="filters.host"
              :taggable="false"
              :searchable="true"
              :push-tags="true"
              :close-on-select="false"
              :mode="mode"
              :multiple="false"
              :label="t('securityEvent.HOST')"
              :options="autoCompleteData.host"
              :disabled="mode==='view'"
              @input="update"
            />
          </div>
          <div class="mt-2">
            <LabeledSelect
              v-model="filters.source"
              :taggable="false"
              :searchable="true"
              :push-tags="true"
              :close-on-select="false"
              :mode="mode"
              :multiple="false"
              :label="t('securityEvent.SOURCE')"
              :options="autoCompleteData.source"
              :disabled="mode==='view'"
              @input="update"
            />
          </div>
          <div class="mt-2">
            <LabeledSelect
              v-model="filters.destination"
              :taggable="false"
              :searchable="true"
              :push-tags="true"
              :close-on-select="false"
              :mode="mode"
              :multiple="false"
              :label="t('securityEvent.DESTINATION')"
              :options="autoCompleteData.destination"
              :disabled="mode==='view'"
              @input="update"
            />
          </div>
          <div class="mt-2">
            <LabeledSelect
              v-model="filters.domains"
              :taggable="true"
              :searchable="true"
              :push-tags="true"
              :close-on-select="false"
              :mode="mode"
              :multiple="true"
              :label="t('securityEvent.DOMAIN')"
              :options="autoCompleteData.domain"
              :disabled="mode==='view'"
              @input="update"
            />
          </div>
          <div class="mt-2">
            <LabeledInput
              class="nv-labal-input"
              v-model="filters.includedKeyword"
              :label="t('securityEvent.OTHER_KEYWORD')"
              :mode="mode"
              @input="update"
            />
          </div>
          <div class="mt-2">
            <LabeledInput
              class="nv-labal-input"
              v-model="filters.excludedKeyword"
              :label="t('securityEvent.EXCLUDED_KEYWORD')"
              :mode="mode"
              @input="update"
            />
          </div>
          <div class="mt-3" style="text-align: right">
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
    @import '../../../styles/neuvector.scss';
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

    ::v-deep(.btn-sm) {
      padding: 0 7px 0 0;
    }

    .adv-filter-dialog {
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

        &__show {
          right: 0;
        }
      }
    }
</style>