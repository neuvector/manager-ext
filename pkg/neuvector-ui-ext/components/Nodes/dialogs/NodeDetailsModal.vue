<script>
    import { parseDatetimeStr } from '../../../utils/common';
    import NodeVulnerabilitiesGrid from '../grids/NodeVulnerabilitiesGrid';

    export default {
        components: {
          NodeVulnerabilitiesGrid
        },
        props: {
            host: Object,
            isLightTheme: Boolean,
        },
        async fetch(){
         
        },
        methods: {
          show() {
            this.showSlideIn = true;
          },
          hide() {
            this.showSlideIn = false;
          },
        },
        data() {
          return {
            showSlideIn: false,
            parseDatetimeStr: parseDatetimeStr,
          };
        },
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
              <h5>
                <span><span class="text-bold">ID:</span> {{ host.id }}</span>
                <span class="mx-3"><span class="text-bold">CVE DB Version:</span> {{ host.scanSummary.scanner_version }} ({{ parseDatetimeStr(host.scanSummary.cvedb_create_time, 'MMM DD, YYYY') }})</span>
              </h5>
            </div>
          </div>
        </div>
        <div class="nv-modal">
          <NodeVulnerabilitiesGrid v-if="showSlideIn" :host="host"></NodeVulnerabilitiesGrid>
        </div> 
      </div>
  </div>
</template>


<style lang="scss">
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

    .adv-filter-dialog {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 12;
      overflow-y: auto;

      $title-height: 50px;
      $padding: 5px;
      $slideout-width: 60%;
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