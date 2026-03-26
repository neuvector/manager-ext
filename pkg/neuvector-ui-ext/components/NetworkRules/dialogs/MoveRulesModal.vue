<script>
    import { Card } from '@components/Card';
    import { NV_CONST } from '../../../types/neuvector';
    import { RadioButton } from '@components/Form/Radio';
    import { LabeledInput } from '@components/Form/LabeledInput';
    import { updateGridData } from '../../../utils/network-rules';
    import { UpdateType } from '../../../types/network-rules';

    export default {
        components: {
            Card,
            RadioButton,
            LabeledInput,
        },
        props: {
            mode: { type: String, default: 'edit' }
        },
        data() {
            return {
                targetId: '',
                moveType: UpdateType.MoveBefore,
                UpdateType: UpdateType,
                selectedNetworkRules: [],
            };
        },
        computed: {
        },
        methods: {
          close() {
            this.$emit('close');
          },
          async moveRules() {
            console.log(this.moveType, this.targetId)
            this.selectedNetworkRules = await this.$store.getters['neuvector/selectedNetworkRules'];
            this.selectedNetworkRules = this.selectedNetworkRules.map(rule => {
                if (
                    rule.state !== NV_CONST.NETWORK_RULES_STATE.MODIFIED &&
                    rule.state !== NV_CONST.NETWORK_RULES_STATE.NEW
                ) {
                    rule.state = NV_CONST.NETWORK_RULES_STATE.MOVED;
                }
                return rule;
            });
            await updateGridData(this.selectedNetworkRules, 0, this.moveType, parseInt(this.targetId, 10), this.$store);
            let gridApi = await this.$store.getters['neuvector/networkRulesGridApi'];
            gridApi.setRowData(this.$store.getters['neuvector/networkRules']);
            this.$emit('close');
          },
        }
    };
</script>

<template>
    <div class="modal-backdrop">
        <div class="modal" style="position: absolute; z-index: 200; left: calc(100vw / 2 - 100px); min-width: 240px;">
            <Card :buttonAction="close" :buttonText="'Close'" :sticky="true" style="width: 240px;">
                <template v-slot:title>
                    <h5 class="p-10 modal-title">
                        {{ t('policy.TIP.MOVE') }}
                    </h5>
                </template>
                <template v-slot:body>
                    <div class="flex">
                        <RadioButton
                            :label="t('policy.toolBar.BEFORE_ROWS')"
                            v-model:value="moveType"
                            :val="UpdateType.MoveBefore"
                            :value="true"
                        />
                        <RadioButton
                            :label="t('policy.toolBar.AFTER_ROWS')"
                            v-model:value="moveType"
                            :val="UpdateType.MoveAfter"
                            :value="false"
                        />
                    </div>
                    <LabeledInput
                        class="nv-labal-input"
                        style="width: 100px;"
                        v-model:value="targetId"
                        label="ID"
                        :mode="mode"
                    />
                    <a
                        mat-button
                        class="btn role-primary mt-2"
                        style="width: 85px;"
                        aria-label="Add edit rule"
                        type="button"
                        @click="moveRules()">
                        {{ t('policy.toolBar.MOVE') }}
                    </a>
                </template>
            </Card>
        </div>
    </div>
</template>
<style lang="scss" scoped>
    .modal-backdrop {
        background-color: var(--overlay-bg);
    }
    .modal {
        background: var(--modal-bg);
    }
    .modal-title {
        color: var(--body-text);
    }
</style>
