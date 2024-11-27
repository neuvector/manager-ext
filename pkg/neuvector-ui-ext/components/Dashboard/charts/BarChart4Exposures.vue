<template>
  <div class="chart-container">
      <BarChart
          v-if="!isEmptyData"
          :chartData="chartData"
          :options="chartOptions"
          :width="width"
          :height="height"
      />
  </div>
  
</template>

<script>
  import { BarChart } from 'vue-chart-3';
  import { Chart, registerables } from 'chart.js';
  import { ref, defineComponent } from 'vue';
  import { NV_CONST } from '../../../types/neuvector';

  Chart.register(...registerables);

  export default defineComponent({
      name: 'BarChart4TopSecurityEventsBySource',
      components: { BarChart },
      props: {
          width: { type: Number, default: 400 },
          height: { type: Number, default: 300 },
          hierarchicalIngressList: Array,
          hierarchicalEgressList: Array,
          parentContext: Object,
      },
      methods: {
        accumulateData: function(exposedContainers, chartNumbers, direction) {
          exposedContainers.forEach(exposedContainer => {
            if (exposedContainer.severity) {
              chartNumbers[direction].set(NV_CONST.POLICY_ACTION.THREAT, chartNumbers[direction].get(NV_CONST.POLICY_ACTION.THREAT) + 1);
            } else {
              let policyAction = exposedContainer.policy_action.toLowerCase();
              chartNumbers[direction].set(policyAction, chartNumbers[direction].get(policyAction) + 1);
            }
          });
        }
      },
      setup(props) {
        const accumulateData = function(exposedContainers, chartNumbers, direction) {
          exposedContainers.forEach(exposedContainer => {
            if (exposedContainer.severity) {
              chartNumbers[direction].set(NV_CONST.POLICY_ACTION.THREAT, chartNumbers[direction].get(NV_CONST.POLICY_ACTION.THREAT) + 1);
            } else {
              let policyAction = exposedContainer.policy_action.toLowerCase();
              chartNumbers[direction].set(policyAction, chartNumbers[direction].get(policyAction) + 1);
            }
          });
        }
        let egressContainers = props.hierarchicalEgressList.flatMap(service => {
          return service.children;
        });
        let ingressContainers = props.hierarchicalIngressList.flatMap(service => {
          return service.children;
        });
        let chartNumbers = {
          ingress: new Map([
            [NV_CONST.POLICY_ACTION.ALLOW, 0],
            [NV_CONST.POLICY_ACTION.DENY, 0],
            [NV_CONST.POLICY_ACTION.VIOLATE, 0],
            [NV_CONST.POLICY_ACTION.THREAT, 0]
          ]),
          egress: new Map([
            [NV_CONST.POLICY_ACTION.ALLOW, 0],
            [NV_CONST.POLICY_ACTION.DENY, 0],
            [NV_CONST.POLICY_ACTION.VIOLATE, 0],
            [NV_CONST.POLICY_ACTION.THREAT, 0]
          ])
        };
        accumulateData(ingressContainers, chartNumbers, NV_CONST.INGRESS);
        accumulateData(egressContainers, chartNumbers, NV_CONST.EGRESS);
        const chartData = ref({
          labels: [
            props.parentContext.t('dashboard.body.panel_title.ALLOW'),
            props.parentContext.t('dashboard.body.panel_title.DENY'),
            props.parentContext.t('dashboard.body.panel_title.ALERT'),
            props.parentContext.t('dashboard.body.panel_title.THREAT')
          ],
          datasets: [
            {
              data: Array.from(chartNumbers.ingress.values()),
              label: props.parentContext.t('dashboard.body.panel_title.INGRESS_CONTAINERS'),
              backgroundColor: 'rgba(255, 13, 129, 0.2)',
              borderColor: '#ff0d81',
              hoverBackgroundColor: 'rgba(255, 13, 129, 0.2)',
              hoverBorderColor: '#ff0d81',
              borderWidth: 2,
            },
            {
              data: Array.from(chartNumbers.egress.values()),
              label: props.parentContext.t('dashboard.body.panel_title.EGRESS_CONTAINERS'),
              backgroundColor: 'rgba(255, 113, 1, 0.2)',
              borderColor: '#ff7101',
              hoverBackgroundColor: 'rgba(255, 113, 1, 0.2)',
              hoverBorderColor: '#ff7101',
              borderWidth: 2,
            }
          ]
        });

        const chartOptions = ref({
          animation: false,
          indexAxis: 'x',
          scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true,
                ticks: {
                    callback: (value) => {
                        if (parseFloat(value) % 1 === 0) return value;
                        return null;
                    }
                }
            },
            },
            elements: {
            bar: {
                borderWidth: 4,
            },
          },
          plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                boxWidth: 15,
                boxHeight: 15
                }
            },
            title: {
                display: true,
                text: props.parentContext.t('dashboard.body.panel_title.EXPOSURES'),
            },
          },
          maintainAspectRatio: false
        });

        return { chartData, chartOptions };
      },
  });
</script>

<style scoped>
  .chart-container {
      position: relative;
      width: 100%;
      max-width: 600px;
      margin: auto;
  }
</style>