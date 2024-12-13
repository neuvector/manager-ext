<template>
    <div>
      <p class="text-center">
        <small
          ><span :style="{ 'color': scoreLevel.gaugeLabelColor }">{{ scoreLevel.gaugeLabel }}</span> ({{ scoreInfo.security_scores.security_risk_score }})</small
        >
      </p>
      <vue-gauge
        class="text-center"
        refid="score-gauge"
        :options="myOptions"
      />
      <table style=" margin: -20px auto 0 auto;">
        <tr class="text-center dashboard-summary-title">
            <td>{{ t('dashboard.heading.NODES') }}</td>
            <td>{{ t("dashboard.heading.PODS") }}</td>
        </tr>
        <tr class="text-center dashboard-summary-value">
            <td>{{ scoreInfo.metrics.hosts }}</td>
            <td>{{ scoreInfo.metrics.workloads.running_pods }}</td>
        </tr>
      </table>
    </div>
  </template>
  
  <script>
  import VueGauge from "vue-gauge";
  import { NV_CONST, RANCHER_CONST } from '../../../types/neuvector';

  export default {
    components: { VueGauge },
    props: {
      scoreInfo: Object,
      rancherTheme: String
    },
    computed: {
      scoreLevel: function() {
        let value = this.scoreInfo.security_scores.security_risk_score;
        let gaugeLabel = '';
        let gaugeLabelColor = '';
        if (value <= NV_CONST.SCORE_LEVEL.GOOD) {
          gaugeLabel = this.t(
            'dashboard.body.policy_evaluation.GOOD'
          );
          gaugeLabelColor = NV_CONST.SCORE_COLOR.GOOD;
        } else if (value <= NV_CONST.SCORE_LEVEL.FAIR) {
          gaugeLabel = this.t(
            'dashboard.body.policy_evaluation.FAIR'
          );
          gaugeLabelColor = NV_CONST.SCORE_COLOR.FAIR;
        } else {
          gaugeLabel = this.t(
            'dashboard.body.policy_evaluation.POOR'
          );
          gaugeLabelColor = NV_CONST.SCORE_COLOR.POOR;
        }
        return {
          gaugeLabel,
          gaugeLabelColor,
        };
      }
    },
    data() {
      return {
        myOptions: {
          chartWidth: 150,
          needleValue: this.scoreInfo.security_scores.security_risk_score,
          needleColor: this.rancherTheme === RANCHER_CONST.THEME.LIGHT ? 'black' : 'white',
          arcDelimiters: [20, 50],
          arcColors: ["rgb(61,204,91)", "rgb(239,214,19)", "rgb(255,84,84)"],
          rangeLabel: ["", ""],
          rangeLabelFontSize: 14,
        },
      };
    }
  };
  </script>
  
  <!-- Add "scoped" attribute to limit CSS to this component only -->
  <style scoped>
    .vue-gauge-item > svg > text {
        color: white;
    }
    .dashboard-summary-title {
        line-height: 16px;
        & > td {
            float: left;
            height: 16px;
            width: 50px;
            color: #7e8da2;
            line-height: 16px;
        }
        td:first-child {
            border-right: #7e8da2 1px solid;
        }
        td:last-child {
            border-left: #7e8da2 1px solid;
        }
    }
    .dashboard-summary-value {
        line-height: 16px;
        & > td {
            float: left;
            height: 16px;
            background-color: transparent;
            -webkit-print-color-adjust: exact;
            color: #fff;
            width: 50px;
            line-height: 16px;
        }
        td:first-child {
            border-right: #fff 1px solid;
            border-bottom-left-radius: 2px;
            border-top-left-radius: 2px;
        }
        td:last-child {
            border-left: #fff 1px solid;
            border-bottom-right-radius: 2px;
            border-top-right-radius: 2px;
        }                   
    }
  </style>
  