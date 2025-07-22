<script>
import { Doughnut } from 'vue-chartjs';

export default {
    props: {
        complianceDist: Object
    },
    components: {
        Doughnut,
    },
    computed: {
        targetDistChartData() {
            return {
                options: {
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
                            text: this.t('cis.report.others.SEVERITY_DIS'),
                        },
                        legend: {
                            display: true,
                            labels: {
                                boxWidth: 12,
                            },
                        },
                    },
                },
                data: {
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
                                this.complianceDist.error,
                                this.complianceDist.high,
                                this.complianceDist.warning,
                                this.complianceDist.note,
                                this.complianceDist.info,
                                this.complianceDist.pass,
                                this.complianceDist.manual,
                            ],
                        },
                    ],
                }
            };
        },
        severityDistChartData() {
            return {
                options: {
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
                            text: this.t('cis.report.others.TARGET_DIS'),
                        },
                        legend: {
                            display: true,
                            labels: {
                                boxWidth: 12,
                            },
                        },
                    },
                },
                data: {
                    labels: [['Platform'], ['Image'], ['Node'], ['Container']],
                    datasets: [
                        {
                            hoverBackgroundColor: ['#f22d3a', '#86aec2', '#4D5360', '#36A2EB'],
                            backgroundColor: ['#f22d3a', '#86aec2', '#4D5360', '#36A2EB'],
                            data: [
                                this.complianceDist.platform,
                                this.complianceDist.image,
                                this.complianceDist.node,
                                this.complianceDist.container,
                            ],
                        },
                    ],
                }
            };
        }
    },
}
</script>

<template>
    <div style="height: 400px">
        <div class="h-50" style="position: relative">
            <Doughnut
                style="height: 200px"
                :chartData="severityDistChartData.data"
                :chartOptions="severityDistChartData.options">
            </Doughnut>
        </div>
        <div class="h-50" style="position: relative">
            <Doughnut
                style="height: 200px"
                :chartData="targetDistChartData.data"
                :chartOptions="targetDistChartData.options">
            </Doughnut>
        </div>
    </div>
</template>