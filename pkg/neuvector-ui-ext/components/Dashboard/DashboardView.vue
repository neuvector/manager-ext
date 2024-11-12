<script>
import Loading from '@shell/components/Loading';
import BarChart4TopVulnerableContainers from './charts/BarChart4TopVulnerableContainers';
import BarChart4TopVulnerableHosts from './charts/BarChart4TopVulnerableHosts';
import LineChart4SecurityEvents from './charts/LineChart4SecurityEvents';
import BarChart4TopSecurityEventsBySource from './charts/BarChart4TopSecurityEventsBySource';
import BarChart4TopSecurityEventsByDestination from './charts/BarChart4TopSecurityEventsByDestination';
import PieChart4PolicyModeOfPods from './charts/PieChart4PolicyModeOfPods';
import PieChart4PolicyModeOfServices from './charts/PieChart4PolicyModeOfServices';
import PolicyModeOfServices from './contents/PolicyModeOfServices';
import PolicyModeOfPods from './contents/PolicyModeOfPods';
import BarChart4Exposures from './charts/BarChart4Exposures';
import ScoreFactor from './contents/ScoreFactor';
import ExposureGrid from './grids/ExposureGrid';
import Instruction from './contents/Instruction';
import ScoreFactorCommentSlider from './contents/ScoreFactorCommentSlider';
import ScoreGauge from './charts/ScoreGauge';
import Exposures from './panels/Exposures';
import DashboardReport from './contents/DashboardReport';
import DashboardReportSection from './contents/DashboardReportSection';
import SSOMenu from './contents/SSOMenu';
import VulnerabilitiesInstruction from './contents/VulnerabilitiesInstruction';
import Tabbed from '@shell/components/Tabbed';
import Tab from '@shell/components/Tabbed/Tab';
import dayjs from 'dayjs';
import { getAuth, getScoreInfo, getNotifications, getDashboardDetails, getSummary } from '../../plugins/dashboard-class';
import { getSSOUrl } from '../../utils/common';
import { nvVariables } from '../../types/neuvector';

export default {
  name: 'Dashboard',
  components: {
    Loading,
    BarChart4TopVulnerableContainers,
    BarChart4TopVulnerableHosts,
    LineChart4SecurityEvents,
    BarChart4TopSecurityEventsBySource,
    BarChart4TopSecurityEventsByDestination,
    PieChart4PolicyModeOfPods,
    PieChart4PolicyModeOfServices,
    PolicyModeOfServices,
    PolicyModeOfPods,
    BarChart4Exposures,
    ScoreFactor,
    ExposureGrid,
    ScoreGauge,
    Instruction,
    ScoreFactorCommentSlider,
    Exposures,
    DashboardReport,
    DashboardReportSection,
    SSOMenu,
    Tabbed,
    Tab,
    VulnerabilitiesInstruction,
  },

  mixins: [],

  async fetch() {
    this.scoreInfo = null;
    this.notificationInfo = null;
    this.detailsInfo = null;
    this.summaryInfo = null;
    this.currentCluster = this.$store.getters['currentCluster'];
    nvVariables.currentCluster = this.currentCluster.id;
    nvVariables.ns = this.ns;

    try {
      let authRes = await getAuth();
      this.token =  authRes.data.token.token;
      sessionStorage.nv_token = this.token;

      let scoreRes = await getScoreInfo();
      let notificationsRes = await getNotifications();
      let dashboardDetailsRes = await getDashboardDetails();
      let summaryRes = await getSummary();
      this.scoreInfo = scoreRes.data;
      this.notificationInfo = notificationsRes.data;
      this.detailsInfo = dashboardDetailsRes.data;
      this.summaryInfo = summaryRes.data.summary;
    } catch(error) {
      if (error.response.status === 401 || error.response.status === 408) {
        this.isAuthErr = true;
      }
    }
  },

  data() {
    return  {
      scoreInfo: null,
      notificationInfo: null,
      detailsInfo: null,
      summaryInfo: null,
      isAuthErr: false,
      token: null,
      isRefreshed: false,
      currentCluster: null
    }
  },

  props: {
    ns: String,
    rancherTheme: String
  },

  computed: {
    getServiceConnRisk: function() {
      return {
        title: this.t('dashboard.heading.SERVICE_CONN'),
        factors: [
          {
            category: this.t('enum.DISCOVER'),
            amount: this.scoreInfo.header_data.groups.discover_groups,
            type: this.t('enum.ZERODRIFT_TYPE'),
            comment: this.scoreInfo.header_data.groups.discover_groups_zero_drift
          },
          {
            category: this.t('enum.MONITOR'),
            amount: this.scoreInfo.header_data.groups.monitor_groups,
            type: this.t('enum.ZERODRIFT_TYPE'),
            comment: this.scoreInfo.header_data.groups.monitor_groups_zero_drift
          },
          {
            category: this.t('enum.PROTECT'),
            amount: this.scoreInfo.header_data.groups.protect_groups,
            type: this.t('enum.ZERODRIFT_TYPE'),
            comment: this.scoreInfo.header_data.groups.protect_groups_zero_drift
          },
        ],
        subScore: 'height: 33%',
        isFactorError: false,
      }
    },
    getExposureRisk: function() {
      return {
        title: this.t('dashboard.heading.INGRESS_EGRESS'),
        factors: [
          {
            category: this.t('enum.DISCOVER'),
            amount: this.scoreInfo.header_data.workloads.discover_ext_eps
          },
          {
            category: this.t('dashboard.heading.THREATS'),
            amount: this.scoreInfo.header_data.workloads.threat_ext_eps
          },
          {
            category: this.t('dashboard.heading.VIOLATIONS'),
            amount: this.scoreInfo.header_data.workloads.violate_ext_eps
          },
        ],
        subScore: 'height: 81%',
        isFactorError: false,
      }
    },
    getVulnerabilityRisk: function() {
      return {
        title: this.t('dashboard.heading.VUL_EXPLOIT'),
        factors: [
          {
            category: this.t('enum.DISCOVER'),
            amount: this.scoreInfo.header_data.cves.discover_cves
          },
          {
            category: this.t('enum.MONITOR'),
            amount: this.scoreInfo.header_data.cves.monitor_cves
          },
          {
            category: this.t('enum.PROTECT'),
            amount: this.scoreInfo.header_data.cves.protect_cves
          },
        ],
        factorComment: [
          `${this.t('dashboard.heading.CVE_DB_VERSION')}: ${this.summaryInfo.cvedb_version}`,
          `(${dayjs(this.summaryInfo.cvedb_create_time).format('MMM DD, YYYY')})`
        ],
        subScore: 'height: 11%',
        isFactorError: false,
      }
    },
    getInstructions4Exposures: function() {
      return {
        textLines: [
          this.t('dashboard.help.exposure.txt1'),
          this.t('dashboard.help.exposure.txt2')
        ]
      };
    },
    getInstructions4SecurityEvents: function() {
      return {
        textLines: [
          this.t('dashboard.help.criticalEvent.txt1'),
          this.t('dashboard.help.criticalEvent.txt2')
        ]
      };
    },
    getInstructions4TopSecurityEventsInSource: function() {
      return {
        textLines: [
          this.t('dashboard.help.top_security_events.txt1'),
          this.t('dashboard.help.top_security_events.txt2'),
          this.t('dashboard.help.top_security_events.txt2_1'),
          this.t('dashboard.help.top_security_events.txt2_2'),
          this.t('dashboard.help.top_security_events.txt2_3')
        ]
      };
    },
    getInstructions4TopSecurityEventsInDestination: function() {
      return {
        textLines: [
          this.t('dashboard.help.top_security_events.txt3'),
          this.t('dashboard.help.top_security_events.txt4'),
          this.t('dashboard.help.top_security_events.txt4_1'),
          this.t('dashboard.help.top_security_events.txt4_2'),
          this.t('dashboard.help.top_security_events.txt4_3')
        ]
      };
    },
    getInstructions4TopVulnerablePods: function() {
      return {
        textLines: [
          this.t('dashboard.help.top_vulnerable_pod.txt1'),
          this.t('dashboard.help.top_vulnerable_pod.txt2')
        ]
      };
    },
    getInstructions4TopVulnerableNodes: function() {
      return {
        textLines: [
          this.t('dashboard.help.top_vulnerable_node.txt1'),
          this.t('dashboard.help.top_vulnerable_node.txt2')
        ]
      };
    },
    getInstructions4PodsMode: function() {
      return {
        textLines: [
          this.t('dashboard.help.policy_mode_pod.txt1'),
          this.t('dashboard.help.policy_mode_pod.txt2')
        ]
      };
    },
    ssoLink: function() {
      return getSSOUrl('#/');
    }
  },

  methods: {
    changeTab: function(event) {
      //This logic is a workaround for line chart's size initilization issue in chart.js lib
      if (event.selectedName === '1-security-events'){
        this.isRefreshed = false;
        setTimeout(() => {
          this.isRefreshed = true;
        }, 5);
      }
    }
  }
};
</script>

<template>
  <Loading v-if="$fetchState.pending" />
  <div v-else-if="isAuthErr" :rancherTheme="rancherTheme" class="container">
    <div class="title p-10">
      <h1 class="mb-20" data-testid="nv-auth-error">
        {{ t('neuvector.dashboard.error.auth') }}
      </h1>
      <div class="chart-route">
        <Banner color="warning">
          <button class="ml-10 btn role-primary" @click="$fetch">
            {{ t('generic.reload') }}
          </button>
        </Banner>
      </div>
    </div>
  </div>
  <div v-else class="dashboard">
    <DashboardReport/>
    <div class="screen-area">
      <div class="head-title">
        <h1 data-testid="nv-dashboard-title" class="mb-20">
          {{ t('dashboard.TITLE') }}
        </h1>
        <!-- <span v-if="version">{{ version }}</span> -->
      </div>
      <div v-if="scoreInfo">
        <div class="get-started" style="margin-bottom: 15px;">
          <ScoreGauge :rancherTheme="rancherTheme" :scoreInfo="scoreInfo"/>
          <ScoreFactorCommentSlider v-if="detailsInfo && currentCluster" :rancherTheme="rancherTheme" :token="token" :ns="ns" :score="scoreInfo.score.securityRiskScore" :autoScan="detailsInfo.autoScanConfig" :currentClusterId="currentCluster.id" class="m-0"/>
          <!-- <DashboardReportSection /> -->
          <SSOMenu v-if="this.currentCluster" :ns="ns" :ssoLink="ssoLink"/>
        </div>
        <div class="get-started">
          <ScoreFactor
            :riskFactor="getServiceConnRisk"
          />
          <ScoreFactor
            :riskFactor="getExposureRisk"
          />
          <ScoreFactor
            v-if="summaryInfo"
            :riskFactor="getVulnerabilityRisk"
          />
        </div>
      </div>


      <Tabbed defaultTab="" style="margin: 30px 0;" @changed="changeTab"> <!-- background-color: var(--scrollbar-thumb-dropdown)-->
        <Tab :weight="2" name="3-exposure" :label="t('dashboard.body.panel_title.CONTAINER_SEC')">
          <div>
            <Instruction style="display: inline-block;"
              :instructions="getInstructions4Exposures"
              instructionId="exposures"
            />
          </div>
          <div v-if="scoreInfo">
            <Exposures v-if="currentCluster" :currentClusterId="currentCluster.id" :ingress="scoreInfo.ingress.filter(ingress => ingress.policy_action !== 'open')" :egress="scoreInfo.egress.filter(egress => egress.policy_action !== 'open')" :token="token" :ns="ns" :rancherTheme="rancherTheme"/>
          </div>
        </Tab>
        <Tab :weight="0" name="4-top-vulnerable-assets" :label="t('dashboard.body.panel_title.TOP_VULNERABLE_ASSETS')">
          <div v-if="detailsInfo && !detailsInfo.autoScanConfig && detailsInfo.highPriorityVulnerabilities.containers.top5Containers.length === 0 && detailsInfo.highPriorityVulnerabilities.nodes.top5Nodes.length === 0"
            class="text-center" style="width: 100%; height: 200px; display: table;">
            <div style="display: table-cell; vertical-align: middle;">
              <i class="icon-warning" style="font-size: 40px; color: #FBC02D"></i>
              <VulnerabilitiesInstruction  :token="token" :currentClusterId="currentCluster.id" :ns="ns" :autoScan="autoScan"/>
            </div>
          </div>
          <div v-else class="get-started">
            <div>
              <div class="mb-10" style="line-height: 15px;">
                <span class="mr-10">{{ t('dashboard.body.panel_title.TOP_VULNERABLE_CONTAINERS') }}</span>
                <Instruction style="display: inline-block;"
                  :instructions="getInstructions4TopVulnerablePods"
                  instructionId="top-vul-pods"
                />
              </div>
              <BarChart4TopVulnerableContainers v-if="detailsInfo" :topVulContainers="detailsInfo.highPriorityVulnerabilities.containers"/>
            </div>
            <div>
              <div class="mb-10" style="line-height: 15px;">
                <span class="mr-10">{{ t('dashboard.body.panel_title.TOP_VULNERABLE_NODES') }}</span>
                <Instruction style="display: inline-block;"
                  :instructions="getInstructions4TopVulnerableNodes"
                  instructionId="top-vul-nodes"
                />
              </div>
              <BarChart4TopVulnerableHosts v-if="detailsInfo" :topVulHosts="detailsInfo.highPriorityVulnerabilities.nodes"/>
            </div>
          </div>
        </Tab>
        <Tab :weight="3" name="1-security-events" :label="t('dashboard.body.panel_title.SEC_EVENTS')">
          <div>
            <div>
              <Instruction style="display: inline-block;"
                :instructions="getInstructions4SecurityEvents"
                  instructionId="sec-event"
              />
            </div>
            <LineChart4SecurityEvents v-if="notificationInfo && isRefreshed" :securityEventSummaryInfo="notificationInfo.criticalSecurityEvents.summary"/>
          </div>
          <div class="get-started">
            <div>
              <div>
                <Instruction style="display: inline-block;"
                  :instructions="getInstructions4TopSecurityEventsInSource"
                  instructionId="top-sec-events-source"
                />
              </div>
              <BarChart4TopSecurityEventsBySource v-if="notificationInfo" :securityEventTop5BySource="notificationInfo.criticalSecurityEvents.top_security_events.source"/>
            </div>
            <div>
              <div>
                <Instruction style="display: inline-block;"
                  :instructions="getInstructions4TopSecurityEventsInDestination"
                  instructionId="top-sec-events-destination"
                />
              </div>
              <BarChart4TopSecurityEventsByDestination v-if="notificationInfo" :securityEventTop5ByDestination="notificationInfo.criticalSecurityEvents.top_security_events.destination"/>
            </div>
          </div>
        </Tab>
        <Tab :weight="1" name="2-policy-mode" :label="t('dashboard.body.panel_title.POLICY_MODE')">
          <div class="get-started">
            <div>
              <div class="mb-10" style="line-height: 15px;">
                <span class="mr-10">{{ t('dashboard.body.panel_title.CONTAINER_MODE') }}</span>
                <Instruction style="display: inline-block;"
                  :instructions="getInstructions4PodsMode"
                  instructionId="policy-mode-pods"
                />
              </div>
              <PieChart4PolicyModeOfPods v-if="detailsInfo" :podMode="detailsInfo.containers"/>
              <PolicyModeOfPods />
            </div>
            <div>
              <div class="mb-10" style="line-height: 15px;">
                <span class="mr-10">{{ t('dashboard.body.panel_title.SERVICE_MODE') }}</span>
                <Instruction style="display: inline-block;"
                  :instructions="getInstructions4PodsMode"
                  instructionId="policy-mode-services"
                />
              </div>
              <PieChart4PolicyModeOfServices v-if="detailsInfo && scoreInfo" :serviceMode="detailsInfo.services" :groupInfo="scoreInfo.header_data.groups"/>
              <PolicyModeOfServices />
            </div>
          </div>
        </Tab>
      </Tabbed>
    </div>
  </div>
</template>

<style lang="scss">
.dashboard {
  display: flex;
  flex-direction: column;

  .head {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: $space-m;
    outline: 1px solid var(--border);
    border-radius: var(--border-radius);
    margin: 0 0 64px 0;
    padding: $space-m;
    gap: $space-m;

    &-title {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 10px;

      h1 {
        margin: 0;
      }

      span {
        // background: var(--primary);
        border-radius: var(--border-radius);
        padding: 4px 8px;
      }
    }

    &-subheader {
      font-size: 1.2rem;
      font-weight: 500;
      color: var(--text-secondary);
    }

    &-links {
      display: flex;
      gap: 10px;
    }
  }

  .get-started {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    grid-gap: 20px;

    // .card-container {
    //   min-height: 420px;
    //   padding: 0;
    // }
  }
}
.container {
  & .title {
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    margin: 100px 0;
  }

  & .description {
    line-height: 20px;
  }

  & .chart-route {
    position: relative;
  }

  & .airgap-align {
    justify-content: start;
  }
}

.pull-right {
  float: right !important;
}
.links {
    position: fixed;
    bottom: 20px;
    display: flex;
    flex-wrap: wrap;
    width: 100%;
}
.links .link-container {
    position: relative;
    background-color: var(--input-bg);
    border-radius: var(--border-radius);
    border: solid 1px var(--input-border);
    display: flex;
    flex-basis: 40%;
    margin: 0 10px 10px 0;
    max-width: 325px;
    min-height: 100px;
    border-left: solid 10px var(--primary);
}

.links .link-container>* {
    align-items: center;
    display: flex;
    flex: 1 0;
    padding: 10px;
}
.links .link-container>* .link-content {
    width: 100%;
    margin-left: 10px;
}
.links .link-container>* .link-logo {
    text-align: center;
    width: 60px;
    height: 60px;
    border-radius: calc(var(--border-radius)*2);
    background-color: #fff;
}
.links .link-container>* .link-content, .links .link-container>* .link-logo {
    display: inline-block;
    height: 100%;
}
A {
    color: var(--link);
    text-decoration: none;
}

@media print {
  @page {
    size: landscape;
    @bottom-right {
      content: counter(page) ' of ' counter(pages);
    }
  }
  .screen-area,
  #__layout nav,
  #__layout header {
    display: none;
    width: 0;
    height: 0;
  }
  // #__layout main {
  //   margin-top: 0;
  //   margin-bottom: 0;
  //   margin-left: 0;
  //   border: none;
  // }
  // .nv-section {
  //   border-top: none;
  //   padding-top: 4px;
  //   padding-bottom: 0;
  //   padding-left: 0;
  //   padding-right: 0;
  // }
  .printable-area {
    visibility: visible;
    position: absolute;
    top: 0;
    left: 0;
    overflow-y: auto;
    height: auto;
    width: 1000px;
  }
  .pagebreak {
    clear: both;
    page-break-after: always;
  }
}
@media screen {
  .printable-area {
    visibility: hidden;
    position: absolute;
    height: 0;
    overflow: hidden;
    width: 1000px;
  }
}
</style>