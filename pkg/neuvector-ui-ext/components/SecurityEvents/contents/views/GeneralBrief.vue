<script>
    import { EOS_BUG_REPORT_FILLED, EOS_DO_NOT_DISTURB_FILLED, EOS_WARNING_FILLED } from "eos-icons-vue3";
    import { NV_CONST } from '../../../../types/neuvector';
    export default {
        components: {
            EOS_BUG_REPORT_FILLED,
            EOS_DO_NOT_DISTURB_FILLED,
            EOS_WARNING_FILLED
        },
        props: {
            secEvent: Object
        },
        data() {
            return {
                NV_CONST: NV_CONST
            };
        }
    };
</script>

<template>
    <div class="row mx-0">
        <div class="col-sm-7 pl-0">
            <div
                class="sec-event-name pl-0 auto-hide"
                v-tooltip.top="{
                    content: secEvent.name,
                }"
                ref="ttSecEventName">
                <EOS_BUG_REPORT_FILLED v-if="secEvent.type.name === NV_CONST.SEC_EVENT.TYPE.THREAT" size="base"/>
                <EOS_DO_NOT_DISTURB_FILLED v-if="secEvent.type.name === NV_CONST.SEC_EVENT.TYPE.VIOLATION" size="base"/>
                <EOS_WARNING_FILLED v-if="secEvent.type.name === NV_CONST.SEC_EVENT.TYPE.INCIDENT" size="base"/>
                <span
                    :class="'pull-left mt-1 '+ secEvent.type.cssColor"
                    aria-hidden="true">
                </span>
                <strong>{{ secEvent.name }}</strong>
            </div>
        </div>
        <div class="col-sm-3 pl-0 label-wrap">
            <span
                :class="'severity-label ' + secEvent.details.level.cssColor"
            >{{
                t('enum.' + secEvent.details.level.name.toUpperCase())
            }}
            </span>
            <span
                class="severity-label label-primary"
                v-for="label in secEvent.details.labels"
            :key="label">{{
                t('securityEvent.label.' + label.toUpperCase())
            }}
            </span>
            <span
                class="severity-label label-muted"
                v-if="secEvent.details.labels.length === 0"
            >{{ t('securityEvent.label.OTHER') }}
            </span>
        </div>
        <div
            class="col-sm-2 sec-event-time text-muted pl-0 auto-hide"
            v-tooltip.top="{
                content: secEvent.reportedAt,
            }"
            ref="ttSecEventReportedAt">
            <span>{{ secEvent.reportedAt }}</span>
        </div>
    </div>
    
</template>

<style lang="scss" scoped>
    @import '../../../../styles/security-events.scss';
    @import '../../../../styles/neuvector.scss';
</style>