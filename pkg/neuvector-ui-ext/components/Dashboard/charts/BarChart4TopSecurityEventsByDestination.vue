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
      <EmptyDataMessage icon="icon-checkmark" color="#8bc34a" :message="t('dashboard.body.message.NO_SEC_EVENTS')"/>
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
      name: 'BarChart4TopSecurityEventsByDestination',
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
          securityEventTop5ByDestination: Array,
          parentContext: Object,
      },
      setup(props) {
        const instance = getCurrentInstance();
        let topSecurityEventsLabels = new Array(5);
        let topSecurityEventsData = new Array(5);
        let barChartColors = new Array(5);
        let barChartBorderColors = new Array(5);
        topSecurityEventsLabels.fill('');
        topSecurityEventsData.fill(0);
        barChartColors.fill('rgba(239, 83, 80, 0.3)');
        barChartBorderColors.fill('#ef5350');
        if (props.securityEventTop5ByDestination.length === 0) {
          instance.isEmptyData = true;
        } else {
          instance.isEmptyData = false;
          props.securityEventTop5ByDestination.forEach((workloadEvents, index) => {
            topSecurityEventsLabels[index] = workloadEvents[0]['destination_workload_name'];
            topSecurityEventsData[index] = workloadEvents.length;
          });
        }
        const chartData = ref({
          labels: topSecurityEventsLabels,
          datasets: [
            {
            label: `${props.parentContext.t('dashboard.body.panel_title.TOP_SEC_EVENTS')} - ${props.parentContext.t('dashboard.body.panel_title.DESTINATION')}`,
            data: topSecurityEventsData,
            backgroundColor: barChartColors,
            borderColor: barChartBorderColors,
            hoverBackgroundColor: barChartColors,
            hoverBorderColor: barChartBorderColors,
            barThickness: 15,
            borderWidth: 2
            }
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