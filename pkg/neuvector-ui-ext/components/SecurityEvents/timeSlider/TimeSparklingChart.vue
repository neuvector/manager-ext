<template>
    <div class="chart-container">
        <LineChart
            :chartData="chartData"
            :options="chartOptions"
            :height="height"
        />
    </div>
</template>
  
<script>
    import { LineChart } from 'vue-chart-3';
    import { Chart, registerables } from 'chart.js';
    import { ref, defineComponent } from 'vue';
    import { groupBy, parseLocalDate, parseDatetimeStr, getDuration, getDateByInterval } from '../../../utils/common';

    Chart.register(...registerables);

    export default defineComponent({
        name: 'SecurityTimelineLineChart',
        components: { LineChart },
        props: {
            height: { type: Number, default: 70 },
            securityEventsList: Array,
            parentContext: Object,
        },
        setup(props) {
            let securityEventsLineChartData = [];
            let secEventByReportDate = groupBy(props.securityEventsList, 'reportedOn');
            let earliestDateStr = parseLocalDate(
                props.securityEventsList[
                    props.securityEventsList.length - 1
                ].orgReportedAt
            );
            let nowDateObj = new Date();
            let nowDateStr = parseDatetimeStr(nowDateObj, 'YYYYMMDD');
            let date = earliestDateStr;
            let startDate = date;
            let maxTimeGap = getDuration(
                nowDateStr,
                earliestDateStr
            );
            for (
                ;
                date <= nowDateStr;
                date = getDateByInterval(
                    `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`,
                    1,
                    "day").substring(0, 8)
            ) {
                securityEventsLineChartData.push(
                    secEventByReportDate.hasOwnProperty(date)
                    ? secEventByReportDate[date].length
                    : 0
                );
            }
            if (maxTimeGap === 0) {
                securityEventsLineChartData.push(
                    secEventByReportDate.hasOwnProperty(startDate)
                    ? secEventByReportDate[startDate].length
                    : 0
                );
            }
            console.log("securityEventsLineChartData", securityEventsLineChartData);
            const chartData = ref({
                    labels: new Array(securityEventsLineChartData.length).fill(''),
                    datasets: [
                        {
                            data: securityEventsLineChartData,
                            pointRadius: 0,
                            backgroundColor: 'rgba(61, 152, 211, 0.4)',
                            borderColor: 'rgb(61, 152, 211)',
                            hoverBackgroundColor: 'rgba(61, 152, 211, 0.4)',
                            hoverBorderColor: 'rgb(61, 152, 211)',
                            fill: true,
                            tension: 0.2,
                        },
                    ]
                });

            const chartOptions = ref({
                animation: false,
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                x: {
                    grid: {
                    display:false
                    },
                    ticks: {
                    display: false
                    }
                },
                y: {
                    grid: {
                    display:false
                    }
                }
                },
                layout: {
                    autoPadding: false
                },
                plugins: {
                    title: {
                        display: false
                    },
                    legend: {
                        display: false
                    }
                } 
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