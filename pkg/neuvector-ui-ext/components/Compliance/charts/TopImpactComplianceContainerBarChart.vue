<template>
  <div class="chart-container">
      <BarChart
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
  import { complianceContainerComp } from '../../../utils/compliance';

  Chart.register(...registerables);

  export default defineComponent({
      name: 'TopImpactComplianceContainerBarChart',
      components: { BarChart },
      props: {
          width: { type: Number, default: 400 },
          height: { type: Number, default: 300 },
          compliances: Array,
          parentContext: Object,
      },
      setup(props) {
          const top5Containers = [...props.compliances].sort(complianceContainerComp).slice(0, 5);

          const chartData = ref({
            labels: top5Containers.map(c => [c.name]),
            datasets: [
              {
                data: top5Containers.map(c => c.workloads.length),
                label: props.parentContext.t(
                  'cis.report.others.TOP_COMP_CONTAINER'
                ),
                backgroundColor: '#f22d3a',
                hoverBackgroundColor: '#f22d3a',
                barThickness: 12,
                borderWidth: 0,
                barPercentage: 0.04,
              },
            ],
          });

          const chartOptions = ref({
            scales: {
              y: {
                beginAtZero: true,
              },
              x: {
                beginAtZero: true,
              },
            },
            maintainAspectRatio: false,
            plugins: {
              tooltip: {
                mode: 'point',
              },
              legend: {
                display: true,
                labels: {
                  boxWidth: 12,
                },
              },
            },
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