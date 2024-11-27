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
  import { complianceImpactComp } from '../../../utils/compliance';

  Chart.register(...registerables);

  export default defineComponent({
      name: 'TopImpactComplianceBarChart',
      components: { BarChart },
      props: {
          width: { type: Number, default: 400 },
          height: { type: Number, default: 300 },
          compliances: Array,
      },
      setup(props) {
          const top5Compliance = [...props.compliances].sort(complianceImpactComp).slice(0, 5);

          const chartData = ref({
            labels: top5Compliance.map(c => [c.name]),
            datasets: [
              {
                data: top5Compliance.map(c => c.workloads.length),
                label: 'Container',
                backgroundColor: '#4D5360',
                hoverBackgroundColor: '#4D5360',
                barThickness: 12,
                borderWidth: 0,
                barPercentage: 0.04,
              },
              {
                data: top5Compliance.map(c => c.nodes.length),
                label: 'Node',
                backgroundColor: '#36A2EB',
                hoverBackgroundColor: '#36A2EB',
                barThickness: 12,
                borderWidth: 0,
                barPercentage: 0.04,
              },
              {
                data: top5Compliance.map(c => c.images.length),
                label: 'Image',
                backgroundColor: '#86aec2',
                hoverBackgroundColor: '#86aec2',
                barThickness: 12,
                borderWidth: 0,
                barPercentage: 0.04,
              },
              {
                data: top5Compliance.map(c => c.platforms.length),
                label: 'Platform',
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
                stacked: true,
              },
              x: {
                stacked: true,
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