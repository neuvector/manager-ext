<template>
  <div class="chart-container">
      <LineChart
          v-if="!isEmptyData"
          :chartData="chartData"
          :options="chartOptions"
          :height="height"
      />
      <div class="message-content" v-else>
        <EmptyDataMessage icon="icon-checkmark" color="#8bc34a" :message="t('dashboard.body.message.NO_CRITICAL_SECURITY_EVENT')"/>
      </div>
  </div>
</template>

<script>
  import { LineChart } from 'vue-chart-3';
  import { Chart, registerables } from 'chart.js';
  import { ref, defineComponent, getCurrentInstance } from 'vue';
  import EmptyDataMessage from '../contents/EmptyDataMessage';

  Chart.register(...registerables);

  export default defineComponent({
      name: 'LineChart4SecurityEvents',
      components: {
        LineChart,
        EmptyDataMessage,
      },
      data() {
        return {
          isEmptyData: false,
        };
      },
      props: {
          height: { type: Number, default: 180 },
          securityEventSummaryInfo: Object,
          parentContext: Object,
      },
      setup(props) {
        const instance = getCurrentInstance();
        let securityEventsLabels = new Set();
        props.securityEventSummaryInfo.critical.forEach((critical) => {
          securityEventsLabels.add(critical[0]);
        });
        props.securityEventSummaryInfo.warning.forEach((warning) => {
          securityEventsLabels.add(warning[0]);
        });
        securityEventsLabels = Array.from(securityEventsLabels).sort((a, b) => a - b);

        let labelListLength = securityEventsLabels.length;
        let criticalTotal = 0;
        let warningTotal = 0
        let criticalDataList = new Array(labelListLength);
        let warningDataList = new Array(labelListLength);
        if (props.securityEventSummaryInfo.critical.length === 0 && props.securityEventSummaryInfo.warning.length === 0) {
          instance.isEmptyData = true;
        } else {
          instance.isEmptyData = false;
          props.securityEventSummaryInfo.critical.forEach((critical) => {
            let index = securityEventsLabels.findIndex(label => label === critical[0]);
            criticalDataList[index] = critical[1];
            criticalTotal += critical[1];
          });
          props.securityEventSummaryInfo.warning.forEach((warning) => {
            let index = securityEventsLabels.findIndex(label => label === warning[0]);
            warningDataList[index] = warning[1];
            warningTotal += warning[1];
          });
        }
        const chartData = ref({
          labels: securityEventsLabels,
          datasets: [
            {
                label: `${props.parentContext.t('enum.CRITICAL')}: ${criticalTotal}`,
                data: criticalDataList,
                backgroundColor: 'rgba(239, 83, 80, 0.3)',
                borderColor: '#ef5350',
                hoverBackgroundColor: 'rgba(239, 83, 80, 0.3)',
                hoverBorderColor: '#ef5350',
                pointColor: '#ef5350',
                pointStrokeColor: '#ef5350',
                pointHighlightFill: '#ef5350',
                pointHighlightStroke: '#ef5350',
                tension: 0.2,
            },
            {
                label: `${props.parentContext.t('enum.WARNING')}: ${warningTotal}`,
                data: warningDataList,
                backgroundColor: 'rgba(239, 83, 80, 0.3)',
                borderColor: '#ff9800',
                hoverBackgroundColor: 'rgba(239, 83, 80, 0.3)',
                hoverBorderColor: '#ff9800',
                pointColor: '#ff9800',
                pointStrokeColor: '#ff9800',
                pointHighlightFill: '#ff9800',
                pointHighlightStroke: '#ff9800',
                tension: 0.2,
            }
          ],
        });

        const chartOptions = ref({
          animation: false,
          scales: {
            y: {
                ticks: {
                callback: (value) => {
                    if (parseFloat(value) % 1 === 0) return value;
                    return null;
                }
                }
            },
          },
          plugins: {
            legend: {
                position: 'right',
                labels: {
                boxWidth: 15,
                boxHeight: 15
                }
            },
            title: {
                display: true,
                text: props.parentContext.t('dashboard.body.panel_title.SEC_EVENTS')
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
      margin: auto;
  }
</style>