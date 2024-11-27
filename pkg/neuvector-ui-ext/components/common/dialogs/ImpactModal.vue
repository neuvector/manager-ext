<script>
    import { Card } from '@components/Card';
    import Checkbox from '@components/Form/Checkbox/Checkbox';
    import ImpactModalWorkloadBrief from './components/ImpactModalWorkloadBrief.vue';
    import ImpactModalNodeBrief from './components/ImpactModalNodeBrief.vue';
    import { EOS_CHECK_BOX_BLANK_FILLED, EOS_STORAGE_FILLED } from 'eos-icons-vue3';

    export default {
        components: {
            Card,
            Checkbox,
            EOS_CHECK_BOX_BLANK_FILLED,
            EOS_STORAGE_FILLED,
            ImpactModalWorkloadBrief,
            ImpactModalNodeBrief,
        },
        props: {
            isLightTheme: Boolean,
            type: String,
            content: Object,
        },
        methods: {
            close() {
                this.$emit("close");
            },
        },
        data() {
            return {
                
            };
        },
    };
</script>

<template>
    <div class="modal-backdrop">
        <div class="modal" :class="isLightTheme ? 'light' : 'dark'">
            <Card
            :buttonAction="close"
            :buttonText="t('general.CLOSE')"
            :sticky="true"
            >
                <template v-slot:title>
                    <h5
                    class="p-10"
                    :style="isLightTheme ? 'color: #888' : 'color: #fff'"
                    >
                        <template v-if="type === 'workload'">
                            <EOS_CHECK_BOX_BLANK_FILLED size="base"></EOS_CHECK_BOX_BLANK_FILLED>
                            {{ content.display_name }}
                        </template>
                        <template v-else>
                            <EOS_STORAGE_FILLED size="base"></EOS_STORAGE_FILLED>
                            {{ content.name }}
                        </template>
                    </h5>
                </template>
                <template v-slot:body>
                    <ImpactModalWorkloadBrief :workload="content" v-if="type === 'workload'"></ImpactModalWorkloadBrief>
                    <ImpactModalNodeBrief :host="content" v-else></ImpactModalNodeBrief>
                </template>
            </Card>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import '../../../styles/neuvector.scss';
</style>
