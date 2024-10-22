<script>
    import { NV_MAP } from '../../../../types/neuvector';
    import Packet from '../../dialogs/Packet';
    import { getPackets, getHost, getWorkload } from '../../../../plugins/security-events-class';
    import { nvVariables } from '../../../../types/neuvector';
    import { EOS_CLOUD_FILLED, EOS_NAMESPACE_FILLED, EOS_SYSTEM_GROUP_FILLED, EOS_POD_FILLED } from "eos-icons-vue3";
    export default {
        components: {
            Packet,
            EOS_CLOUD_FILLED,
            EOS_NAMESPACE_FILLED,
            EOS_SYSTEM_GROUP_FILLED,
            EOS_POD_FILLED
        },
        props: {
            index: Number,
            secEvent: Object
        },
        computed: {
            isEditRuleAuthorized: function(){
                return true;
            }
        },
        methods: {
            isInternalGroup: function(group){
                return NV_MAP.INTERNAL_GROUPS.includes(group);
            },
            showPacket: async function(threatId, event) {
                try {
                    let packetRes = await getPackets(threatId);
                    nvVariables.packet.value = packetRes.threat.packet;
                    nvVariables.showPacketModal.value = true;
                } catch(error) {
                    console.error(error);
                }
            },
            showHostDetails: async function(hostId, event) {
                try {
                    let hostRes = await getHost(hostId);
                    nvVariables.host.value = hostRes.data.host;
                    nvVariables.showHostInfoModal.value = true;
                } catch(error) {
                    console.error(error);
                }
            },
            showContainerDetails: async function(event, endpoint, hostName) {
                if (
                    endpoint.displayName &&
                    endpoint.displayName.startsWith(NV_MAP.securityEventLocation.HOST)
                ) {
                    this.showHostDetails(ev, endpoint.id.substring(5), hostName);
                    return;
                }
                event.stopPropagation();
                try {
                    let workloadRes = await getWorkload(endpoint.id);
                    nvVariables.workload.value = workloadRes.data.workload;
                    nvVariables.showWorkloadInfoModal.value = true;
                } catch(error) {
                    console.error(error);
                }
            }
        }
    };
</script>

<template>
    <div>
        <div class="row ml-0">
        <div
            class="col-sm-10 pl-0 auto-hide"
            v-tooltip.top="{
                content: secEvent.host_name
            }"
            ref="#ttSecEventHostName">
            <strong>{{ t('securityEvent.HOST') }}:</strong>
            <span
                class="link"
                @click="
                    showHostDetails(
                        secEvent.hostId,
                        $event
                    )
                "
            >
                {{ secEvent.host_name }}
            </span>
        </div>
        <div
            v-if="secEvent.details.action"
            class="col-sm-2 pl-0 auto-hide"
            v-tooltip.top="{
                content: secEvent.details.action.name
            }">
            <strong>{{ t('threat.gridHeader.ACTION') }}:</strong>&nbsp;&nbsp;
            <span
                :class="'type-label sec-event-action-label px-1 ' + secEvent.details.action.cssColor"
            >
                {{ secEvent.details.action.name }}
            </span>
        </div>
        </div>
        <div class="row ml-0">
            <div class="col-sm-10 pl-0">
                <div
                    v-if="secEvent.container.id !== ''"
                    class="auto-hide"
                    v-tooltip.top="{
                        content: secEvent.container.name
                    }"
                    ref="#ttSecEventContainerName">
                    <strong>{{ t('securityEvent.CONTAINER') }}:</strong>
                    <span>
                        <span v-if="secEvent.container.domain !== ''">
                            <EOS_NAMESPACE_FILLED size="base" />
                            <span>
                                {{ secEvent.container.domain }} |
                            </span>
                        </span>
                        <span>
                            <span v-if="secEvent.container.service">
                                <EOS_SYSTEM_GROUP_FILLED size="base" />
                                <span>
                                    {{ secEvent.container.service }} |
                                </span>
                            </span>
                            <EOS_POD_FILLED size="base" />
                            <span
                                class="link"
                                v-if="secEvent.container.isHyperlinkEnabled"
                                @click="
                                    showContainerDetails(
                                        $event,
                                        secEvent.container,
                                        secEvent.host_name
                                    )
                                ">
                                {{ secEvent.container.name }}
                            </span>
                            <span
                                v-if="!secEvent.container.isHyperlinkEnabled">
                                {{ secEvent.container.name }}
                            </span>
                        </span>
                    </span>
                </div>
            </div>
            <div
                class="mt-1 col-sm-2 p-0"
                v-if="secEvent.type.name === 'threat'"
            >
                <button
                    v-if="secEvent.details.message.cap_len"
                    class="mat-button btn-sec-event role-primary pull-left"
                    style="color: #fff"
                    @click="showPacket(secEvent.details.id, $event)">
                    <em class="icon-envelope-letter mr-sm"></em>
                    {{ t('threat.VIEW_PACKET') }}
                </button>
            </div>
            <!-- <div
                class="mt-1 col-sm-2 p-0"
                v-if="
                    secEvent.type.name === 'violation' &&
                    isEditRuleAuthorized &&
                    (secEvent.endpoint.source.service ||
                        secEvent.endpoint.source.id === 'external') &&
                    (secEvent.endpoint.destination.service ||
                        secEvent.endpoint.destination.id === 'external') &&
                    secEvent.reviewRulePermission
                ">
                <button
                    class="mat-button btn-sec-event pull-left"
                    style="color: #fff"
                    @click="reviewRule('violation', secEvent)">
                    <em class="fa fa-edit fa-lg mr-sm"></em>
                    {{ t('securityEvent.REVIEW_RULE') }}
                </button>
            </div>
            <div
                class="mt-1 col-sm-2 p-0"
                v-if="
                    secEvent.type.name === 'incident' &&
                    secEvent.details.message.group &&
                    isEditRuleAuthorized &&
                    !isInternalGroup(secEvent.details.message.group) &&
                    secEvent.reviewRulePermission
                ">
                <button
                    class="mat-button btn-sec-event pull-left"
                    style="color: #fff"
                    v-if="
                        secEvent.details.message.messageCategory
                        .toLowerCase()
                        .indexOf('process') >= 0
                    "
                    @click="reviewRule('incident', secEvent)">
                    <em class="fa fa-edit fa-lg mr-sm"></em>
                    {{ t('securityEvent.REVIEW_RULE') }}
                </button>
            </div> -->
        </div>
    </div>
</template>