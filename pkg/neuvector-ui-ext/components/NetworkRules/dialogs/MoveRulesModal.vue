<script>
    import { Card } from '@components/Card';
    import { nvVariables, NV_CONST } from '../../../types/neuvector';
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
                isLightTheme: nvVariables.isLightTheme,
                selectedId: '',
                moveType: UpdateType.MoveBefore,
                UpdateType: UpdateType,
            };
        },
        methods: {
          close() {
            this.$emit('close');
          },
          moveRules() {
            console.log(this.moveType, this.selectedId)
            this.data.selectedNetworkRules = this.data.selectedNetworkRules.map(rule => {
                if (
                    rule.state !== NV_CONST.NETWORK_RULES_STATE.MODIFIED &&
                    rule.state !== NV_CONST.NETWORK_RULES_STATE.NEW
                ) {
                    rule.state = NV_CONST.NETWORK_RULES_STATE.MOVED;
                }
                return rule;
            });
            updateGridData(this.data.selectedNetworkRules, 0, this.moveType, this.selectedId, this.$store);
            this.$emit('close');
          },
        }
    };
</script>

<template>
    <div class="modal-backdrop">
        <div class="modal" :class="isLightTheme ? 'light' : 'dark'"  style="position: absolute; z-index: 200; left: calc(100vw / 2 - 100px); min-width: 240px;">
            <Card :buttonAction="close" :buttonText="'Close'" :sticky="true" style="width: 240px;">
                <template v-slot:title>
                    <h5 class="p-10" :style="isLightTheme ? 'color: #888' : 'color: #fff'">
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
                        v-model:value="selectedId"
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