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
        <EmptyDataMessage icon="icon-checkmark" color="#8bc34a" :message="t('dashboard.body.message.NO_VULNERABLE_NODE')"/>
      </div>
  </div>
  
</template>

<script>
  import { BarChart } from 'vue-chart-3';
  import { Chart, registerables } from 'chart.js';
  import { ref, defineComponent } from 'vue';
  import EmptyDataMessage from '../contents/EmptyDataMessage';

  Chart.register(...registerables);

  export default defineComponent({
      name: 'BarChart4TopVulnerableHosts',
      components: { BarChart },
      data() {
        return {
          isEmptyData: false,
        };
      },
      props: {
          width: { type: Number, default: 400 },
          height: { type: Number, default: 300 },
          topVulHosts: Object,
          parentContext: Object,
      },
      setup(props) {
        let topVulnerableAssetsLabel = new Array(5);
        let topHighVulnerableAssetsData = new Array(5);
        let topMediumVulnerableAssetsData = new Array(5);
        topVulnerableAssetsLabel.fill('');
        topHighVulnerableAssetsData.fill(0);
        topMediumVulnerableAssetsData.fill(0);
        if (props.topVulHosts.top5Nodes.length === 0) {
          props.isEmptyData = true;
        } else {
          props.isEmptyData = false;
          props.topVulHosts.top5Nodes.forEach((asset, index) => {
            topVulnerableAssetsLabel[index] = asset.name;
            topHighVulnerableAssetsData[index] = asset.scan_summary.high;
            topMediumVulnerableAssetsData[index] = asset.scan_summary.medium;
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