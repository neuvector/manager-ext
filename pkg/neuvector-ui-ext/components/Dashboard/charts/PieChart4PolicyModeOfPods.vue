<template>
  <div class="chart-container">
      <PieChart
          v-if="!isEmptyData"
          :chartData="chartData"
          :options="chartOptions"
          :width="width"
          :height="height"
      />
      <div class="message-content" v-else>
        <EmptyDataMessage icon="icon-checkmark" color="#FBC02D" :message="t('dashboard.body.message.NO_MANAGED_CONTAINERS')"/>
      </div>
  </div>
  
</template>

<script>
  import { PieChart } from 'vue-chart-3';
  import { Chart, registerables } from 'chart.js';
  import { ref, defineComponent } from 'vue';
  import EmptyDataMessage from '../contents/EmptyDataMessage';
  import { NV_CONST } from '../../../types/neuvector';

  Chart.register(...registerables);

  export default defineComponent({
      name: 'PieChart4PolicyModeOfPods',
      components: { PieChart },
      data() {
        return {
          isEmptyData: false,
        };
      },
      props: {
          width: { type: Number, default: 400 },
          height: { type: Number, default: 300 },
          podMode: Array,
          parentContext: Object,
      },
      setup(props) {
        const modes = _.cloneDeep(NV_CONST.MODES).reverse().concat(['quarantined']);
        let assetsPolicyModeLabels = new Array(modes.length);
        let assetsPolicyModeData = new Array(modes.length);
        assetsPolicyModeLabels = modes.map((mode) => {
          return props.parentContext.t(`enum.${mode.toUpperCase()}`);
        });
        let containerStateCount = {
          protect: 0,
          monitor: 0,
          discover: 0,
          quarantined: 0
        };
        if (props.podMode.length === 0) {
          props.isEmptyData = true;
        } else {
          props.isEmptyData = false;
          props.podMode.forEach(container => {
            containerStateCount[container.state.toLowerCase()] ++;
          });
        }
        assetsPolicyModeData = Object.values(containerStateCount);
        const chartData = ref({
          labels: assetsPolicyModeLabels,
          datasets: [
            {
              backgroundColor: ['rgba(24, 109, 51, 0.3)', 'rgba(78, 57, 193, 0.3)', 'rgba(33, 150, 243, 0.3)', 'rgba(233, 30, 99, 0.3)'],
              borderColor: ['#186d33', '#4E39C1', '#2196F3', '#E91E63'],
              hoverBackgroundColor: ['rgba(24, 109, 51, 0.3)', 'rgba(78, 57, 193, 0.3)','rgba(33, 150, 243, 0.3)', 'rgba(233, 30, 99, 0.3)'],
              hoverBorderColor: ['#186d33', '#4E39C1', '#2196F3', '#E91E63'],
              borderWidth: 2,
              data: assetsPolicyModeData,
            },
          ],
        });

        const chartOptions = ref({
          animation: false,
          plugins: {
            title: {
                display: false,
                text: props.parentContext.t('dashboard.body.panel_title.CONTAINER_MODE'),
            },
            legend: {
                display: true,
                position: 'right',
                labels: {
                boxWidth: 15,
                boxHeight: 15
                }
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