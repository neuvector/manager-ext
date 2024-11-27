<script>
    import { EOS_PIE_CHART_FILLED } from 'eos-icons-vue3';

    export default {
        components: {
            EOS_PIE_CHART_FILLED,
        },
        data() {
            return {
                pieChartActive: false
            }
        },
        methods: {
            togglePieChart() {
                this.pieChartActive = !this.pieChartActive;
                this.$emit('togglePieChart', this.pieChartActive);
            }
        }
    };
</script>

<template>
    <div class="mr-10">
        <button @click="togglePieChart()" class="btn role-secondary">
            <EOS_PIE_CHART_FILLED size="m" color="blue"></EOS_PIE_CHART_FILLED>
        </button>
    </div>
</template>