<template>
   <span v-if="scoreLevel === t('dashboard.body.panel_title.policy_evaluation.GOOD')">
        <span>{{ t('dashboard.heading.guideline.MAIN_SCORE_GOOD1') }}</span>
        <span class="text-bold text-success">{{ t('dashboard.heading.guideline.MAIN_SCORE_GOOD') }}</span>
        <span>{{ t('dashboard.heading.guideline.MAIN_SCORE_GOOD2') }}</span>
   </span>
   <span v-else>
        <span>{{ t('dashboard.heading.guideline.MAIN_SCORE_NOT_GOOD1') }}</span>
        <span :class="scoreLevel === t('dashboard.body.panel_title.policy_evaluation.POOR') ? 'text-bold nv-text-danger' : 'text-bold nv-text-warning'">{{ scoreLevel === t('dashboard.body.panel_title.policy_evaluation.POOR') ? t('dashboard.heading.guideline.MAIN_SCORE_POOR') : t('dashboard.heading.guideline.MAIN_SCORE_FAIR')}}</span>
        <span>{{ t('dashboard.heading.guideline.MAIN_SCORE_NOT_GOOD2') }}</span>
   </span>
</template>
<script>
    import { NV_CONST } from '../../../types/neuvector';
    export default {
        props: {
            score: Number
        },
        computed: {
            scoreLevel: function() {
                return this.score <= NV_CONST.SCORE_LEVEL.GOOD ? this.t('dashboard.body.panel_title.policy_evaluation.GOOD') :
                    this.score > NV_CONST.SCORE_LEVEL.FAIR ? this.t('dashboard.body.panel_title.policy_evaluation.POOR') : this.t('dashboard.body.panel_title.policy_evaluation.FAIR');
            },
        },
        methods: {
        }
    }
</script>

<style lang="scss">
    .text-bold {
        font-weight: bold !important;
    }
    .nv-text-success {
        color: #009688;
    }
    .nv-text-warning {
        color: #ff9800;
    }
    .nv-text-danger {
        color: #f44336;
    }
</style>