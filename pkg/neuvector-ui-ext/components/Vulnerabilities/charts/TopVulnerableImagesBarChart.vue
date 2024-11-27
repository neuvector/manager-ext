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
    import { ref, defineComponent, getCurrentInstance } from 'vue';

    Chart.register(...registerables);

    export default defineComponent({
        name: 'TopVulnerableImagesBarChart',
        components: { BarChart },
        props: {
            width: { type: Number, default: 400 },
            height: { type: Number, default: 300 },
            topVulImages: Array,
            parentContext: Object,
        },
        setup(props) {
            let topVulnerableAssetsLabel = new Array(5);
            let topHighVulnerableAssetsData = new Array(5);
            let topMediumVulnerableAssetsData = new Array(5);
            let topLowVulnerableAssetsData = new Array(5);
            topVulnerableAssetsLabel.fill('');
            topHighVulnerableAssetsData.fill(0);
            topMediumVulnerableAssetsData.fill(0);
            topLowVulnerableAssetsData.fill(0);
            props.topVulImages.forEach((asset, index) => {
                topVulnerableAssetsLabel[index] = asset.display_name;
                topHighVulnerableAssetsData[index] = asset.high;
                topMediumVulnerableAssetsData[index] = asset.medium;
                topLowVulnerableAssetsData[index] = asset.low;
            });
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
                {
                    data: topLowVulnerableAssetsData,
                    label: props.parentContext.t('enum.LOW'),
                    backgroundColor: 'rgba(61, 204, 91, 0.3)',
                    borderColor: '#4caf50',
                    hoverBackgroundColor: 'rgba(61, 204, 91, 0.3)',
                    hoverBorderColor: '#4caf50',
                    barThickness: 8,
                    borderWidth: 2,
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