<script>
import { DoughnutChart } from 'vue-chart-3';
import { Chart, registerables } from 'chart.js';
import { ref, defineComponent } from 'vue';

Chart.register(...registerables);

export default  defineComponent({
    props: {
        complianceDist: Object,
        parentContext: Object,
    },
    components: {
        DoughnutChart, 
    },
    setup(props) {
        const targetDistChartData = ref({
            labels: [
                ['Error'],
                ['High'],
                ['Warning'],
                ['Note'],
                ['Info'],
                ['Pass'],
                ['Manual'],
            ],
            datasets: [
                {
                    hoverBackgroundColor: [
                        '#f22d3a',
                        '#ef5350',
                        '#ff9800',
                        '#ffb661',
                        '#36A2EB',
                        '#6A8E6D',
                        '#0D47A1',
                    ],
                    backgroundColor: [
                        '#f22d3a',
                        '#ef5350',
                        '#ff9800',
                        '#ffb661',
                        '#36A2EB',
                        '#6A8E6D',
                        '#0D47A1',
                    ],
                    data: [
                        props.complianceDist.error,
                        props.complianceDist.high,
                        props.complianceDist.warning,
                        props.complianceDist.note,
                        props.complianceDist.info,
                        props.complianceDist.pass,
                        props.complianceDist.manual,
                    ],
                },
            ],
        });
        const targetDistChartOptions = ref({
            cutout: 60,
            elements: {
                arc: {
                    borderWidth: 0,
                },
            },
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    mode: 'point',
                },
                title: {
                    display: true,
                    text: props.parentContext.t('cis.report.others.SEVERITY_DIS'),
                },
                legend: {
                    display: true,
                    labels: {
                        boxWidth: 12,
                    },
                },
            },
        });
        const severityDistChartData = ref({
            labels: [['Platform'], ['Image'], ['Node'], ['Container']],
            datasets: [
                {
                    hoverBackgroundColor: ['#f22d3a', '#86aec2', '#4D5360', '#36A2EB'],
                    backgroundColor: ['#f22d3a', '#86aec2', '#4D5360', '#36A2EB'],
                    data: [
                        props.complianceDist.platform,
                        props.complianceDist.image,
                        props.complianceDist.node,
                        props.complianceDist.container,
                    ],
                },
            ],
        });
        const severityDistChartOption = ref({
            cutout: 60,
            elements: {
                arc: {
                    borderWidth: 0,
                },
            },
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    mode: 'point',
                },
                title: {
                    display: true,
                    text: props.parentContext.t('cis.report.others.TARGET_DIS'),
                },
                legend: {
                    display: true,
                    labels: {
                        boxWidth: 12,
                    },
                },
            },
        });
        return {
            targetDistChartData,
            severityDistChartData,
            targetDistChartOptions,
            severityDistChartOption,
        };
    },  
})
</script>

<template>
    <div style="height: 400px">
        <div class="h-50" style="position: relative">
            <DoughnutChart
                style="height: 200px"
                :chartData="severityDistChartData"
                :options="severityDistChartOption">
            </DoughnutChart>
        </div>
        <div class="h-50" style="position: relative">
            <DoughnutChart
                style="height: 200px"
                :chartData="targetDistChartData"
                :options="targetDistChartOptions">
            </DoughnutChart>
        </div>
    </div>
</template>