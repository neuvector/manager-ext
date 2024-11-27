<template>
  <div class="chart-container">
      <BarChart
          v-if="!isEmptyData"
          :chartData="chartData"
          :options="chartOptions"
          :width="width"
          :height="height"
      />
      <div class="message-content" v-else>
        <EmptyDataMessage icon="icon-checkmark" color="#8bc34a" :message="t('dashboard.body.message.NO_VULNERABLE_CONTAINER')"/>
      </div>
  </div>
  
</template>

<script>
  import { BarChart } from 'vue-chart-3';
  import { Chart, registerables } from 'chart.js';
  import { ref, defineComponent, getCurrentInstance } from 'vue';
  import EmptyDataMessage from '../contents/EmptyDataMessage';

  Chart.register(...registerables);

  export default defineComponent({
      name: 'BarChart4TopVulnerableContainers',
      components: {
        BarChart,
        EmptyDataMessage,
      },
      data() {
        return {
          isEmptyData: false,
        };
      },
      props: {
          width: { type: Number, default: 400 },
          height: { type: Number, default: 300 },
          topVulContainers: Object,
          parentContext: Object,
      },
      setup(props) {
        const instance = getCurrentInstance();
        let topVulnerableAssetsLabel = new Array(5);
        let topHighVulnerableAssetsData = new Array(5);
        let topMediumVulnerableAssetsData = new Array(5);
        topVulnerableAssetsLabel.fill('');
        topHighVulnerableAssetsData.fill(0);
        topMediumVulnerableAssetsData.fill(0);
        if (props.topVulContainers.top5Containers.length === 0) {
          instance.isEmptyData = true;
        } else {
          instance.isEmptyData = false;
          props.topVulContainers.top5Containers.forEach((asset, index) => {
            topVulnerableAssetsLabel[index] = asset.display_name;
            topHighVulnerableAssetsData[index] = asset.high4Dashboard;
            topMediumVulnerableAssetsData[index] = asset.medium4Dashboard;
          });
        }
        const chartData = ref({
          labels: topVulnerableAssetsLabel,
          datasets: [
            {
              data: topHighVulnerableAssetsData,
              label: props.parentContext.t('enum.HIGH'),
              backgroundColor: 'rgba(239, 83, 80, 0.3)',
              borderColor: '#ef5350',
              hoverBackgroundColor: 'rgba(239, 83, 80, 0.3)',
              hoverBorderColor: '#ef5350',
              barThickness: 8,
              borderWidth: 2,
            },
            {
              data: topMediumVulnerableAssetsData,
              label: props.parentContext.t('enum.MEDIUM'),
              backgroundColor: 'rgba(255, 152, 0, 0.3)',
              borderColor: '#ff9800',
              hoverBackgroundColor: 'rgba(255, 152, 0, 0.3)',
              hoverBorderColor: '#ff9800',
              barThickness: 8,
              borderWidth: 2,
            },
          ],
        });

        const chartOptions = ref({
          animation: false,
          indexAxis: 'y',
          scales: {
            x: {
              ticks: {
                callback: (value) => {
                  if (value % 1 === 0) {
                    return value;
                  }
                },
              },
              beginAtZero: true,
            },
            y: {
              ticks: {
                crossAlign: "far",
                callback: function(value, index, values) {
                  let label = this.getLabelForValue(value);
                  return label.length > 22 ? `${label.substring(0, 22)}...` : label;
                },
              }
            }
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