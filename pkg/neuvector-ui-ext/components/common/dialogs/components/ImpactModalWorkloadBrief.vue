<script>
import { EOS_LAUNCH_FILLED } from 'eos-icons-vue3';
import { shortenString, getSSOUrl } from '../../../../utils/common';
import dayjs from 'dayjs';

export default {
    components: {
        EOS_LAUNCH_FILLED,
    },
    props: {
        workload: Object
    },
    data() {
        return {
            dayjs: dayjs,
            shortenString: shortenString,
            isScanStarted4Pod: false
        };
    },
    computed: {
        hasInterfaces() {
            return this.workload.interfaces && Object.entries(this.workload.interfaces).length > 0;
        },
        apps() {
            if (this.workload.ports && Object.entries(this.workload.app_ports).length > 0) {
                return Object.entries(this.workload.app_ports)
                    .map(([k, v]) => {
                        return `${k}/${v}`;
                    })
                    .join(', ');
            } else {
                return '';
            }
        }
    },
    methods: {
        goToNvGroup(group) {
            window.open(`${getSSOUrl('#/group')}?group=${group}`, '_blank');
        }
    }
}
</script>

<template>
    <div>
        <ul class="row mx-0">
            <li class="col-sm-12 p-1">
                <div class="pb-0 pt-1">
                    <span class="font-weight-bold pod-item-key">ID:</span>
                    <span class="ml auto-hide pod-item-value">
                        {{ workload.id }}
                    </span>
                </div>
            </li>
            <li class="col-sm-12 p-1">
                <div v-if="workload.children && workload.children.length > 1"
                    class="pb-0 pt-1">
                    <div>
                        <span class="font-weight-bold pod-item-key">
                            {{ t('network.nodeDetails.IMAGE') }}:
                        </span>
                    </div>
                    <div class="ml pod-item-value">
                        <div v-for="child in workload.children" class="row" :key="child">
                            <div v-if="child" class="auto-hide" style="margin-top: 2px; width: 620px">
                                <span class="font-weight-bold pl-lg" style="display: inline-block">
                                    <em class="fa fa-square-o mr-sm"></em>
                                    {{ child.display_name.slice(0, 55) }}{{ child.display_name.length > 35 ? '...' : '' }}
                                </span>
                                <label v-if="child.service_mesh_sidecar"
                                    class="label label-info-tran ml-lg mt-sm"
                                    style="display: inline-block">
                                    Sidecar:
                                </label>
                                <em class="fa fa-archive pl-lg mr-sm"></em>
                                <span class="auto-hide" style="margin-top: -2px">
                                    {{ child.image }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="!workload.children || workload.children.length <= 1"
                    class="pb-0 pt-1">
                    <div>
                        <span class="font-weight-bold pod-item-key">
                            {{ t('network.nodeDetails.IMAGE') }}:
                        </span>
                    </div>
                    <div class="ml pod-item-value">
                        <div v-for="image in workload.images" :key="image">
                            <span class="d-block">
                                {{ image }}
                            </span>
                        </div>
                    </div>
                </div>
            </li>
            <li class="col-sm-12 p-1" style="height: 29px;">
                <div class="row" style="margin-left: 1px;">
                    <div class="col-sm-6 pl-0 pb-0 pt-1">
                        <span class="font-weight-bold pod-item-key">
                            {{ t('network.nodeDetails.ENFORCER') }}:
                        </span>
                        <span class="ml auto-hide pod-item-value">
                            {{ workload.enforcer_name }}
                        </span>
                    </div>
                    <div class="col-sm-6 pl-0 pb-0 pt-1" v-if="workload.service_group">
                        <div>
                            <span class="font-weight-bold pod-item-key">
                                {{ t('network.legend.GROUP') }}:
                            </span>
                            <span class="pod-item-value">
                                <span v-tooltip.top="{ content: workload.service_group }" ref="ttWorkloadServiceGroup">
                                    {{ shortenString(workload.service_group, 30) }}
                                </span>
                                <a
                                    @click="goToNvGroup(workload.service_group)"
                                    style="display: table-cell; font-size: 11px; line-height: 15px; cursor: pointer;"
                                >
                                    <EOS_LAUNCH_FILLED size="base" color="#3D98D3"></EOS_LAUNCH_FILLED>
                                </a>
                            </span>
                        </div>
                    </div>
                </div>
            </li>
            <li class="col-sm-12 p-1">
                <div class="row" style="margin-left: 1px">
                    <div class="col-sm-6 pl-0 pb-0 pt-1">
                        <span class="font-weight-bold pod-item-key">
                            {{ t('group.gridHeader.DOMAIN') }}:
                        </span>
                        <span class="ml auto-hide pod-item-value">
                            {{ workload.domain }}
                        </span>
                    </div>
                    <div class="col-sm-6 pl-0 pb-0 pt-1">
                        <span class="font-weight-bold pod-item-key">
                            {{ t('network.nodeDetails.LOCATION') }}:
                        </span>
                        <span class="ml auto-hide pod-item-value">
                            {{ workload.host_name }}
                        </span>
                    </div>
                </div>
            </li>
            <li class="col-sm-12 p-1">
                <div class="row" style="margin-left: 1px">
                    <div class="col-sm-6 pl-0 pb-0 pt-1">
                        <span class="font-weight-bold pod-item-key">
                            {{ t('network.nodeDetails.STATE') }}:
                        </span>
                        <span class="badge text-white" style="background-color: #1154a2">
                            {{ workload.policy_mode }}
                        </span>
                        <span v-if="workload.state === 'quarantined'"
                            class="text-danger mr-lg auto-hide pod-item-value"
                            style="display: block; width: 180px">
                            {{ workload.quarantine_reason }}
                        </span>
                    </div>
                    <div class="col-sm-6 pl-0 pb-0 pt-1">
                        <span class="font-weight-bold pod-item-key">
                            {{ t('network.nodeDetails.CREATED_AT') }}:
                        </span>
                        <span class="ml auto-hide pod-item-value">
                            {{ dayjs(workload.started_at).format('MMM DD, YYYY HH:mm:ss') }}
                        </span>
                    </div>
                </div>
            </li>
            <li class="col-sm-12 p-1">
                <div class="row" style="margin-left: 1px">
                    <div v-if="!!workload.scan_summary.scanned_at"
                        class="col-sm-6 pl-0 pb-0 pt-1">
                        <span class="font-weight-bold pod-item-key">
                            {{ t('network.nodeDetails.SCANNED_AT') }}:
                        </span>
                        <span
                            class="ml mr-lg auto-hide pod-item-value"
                            style="width: 150px">
                            {{ dayjs(workload.scan_summary.scanned_at).format('MMM DD, YYYY HH:mm:ss') }}
                        </span>
                    </div>
                    <div class="col-sm-6 pl-0 mda-list-item-text pb-0 pt-1">
                        <span class="font-weight-bold pod-item-key">
                            {{ t('network.nodeDetails.PRIVILEGED') }}:
                        </span>
                        <span class="ml mr-lg auto-hide pod-item-value">
                            {{ workload.privileged }}
                        </span>
                    </div>
                </div>
            </li>
            <li class="col-sm-12 p-1">
                <div class="row" style="margin-left: 1px">
                    <div class="col-sm-6 pl-0 mda-list-item-text pb-0 pt-1">
                        <span class="font-weight-bold pod-item-key">
                            {{ t('network.nodeDetails.RUN_AS_ROOT') }}:
                        </span>
                        <span class="ml mr-lg auto-hide pod-item-value">
                            {{ workload.run_as_root }}
                        </span>
                    </div>
                    <div class="col-sm-6 pl-0 mda-list-item-text pb-0 pt-1">
                        <span class="font-weight-bold pod-item-key">
                            {{ t('group.gridHeader.VULNERABILITIES') }}:
                        </span>
                        <div class="pod-item-value d-inline">
                            <span v-if="workload.scan_summary.high"
                                class="badge badge-danger mr-sm">
                                {{ workload.scan_summary.high }}
                            </span>
                            <span v-if="workload.scan_summary.medium" class="badge badge-warning">
                                {{ workload.scan_summary.medium }}
                            </span>
                            <a v-if="workload.scan_summary.high || workload.scan_summary.medium"
                                style="display: table-cell; font-size: 11px; line-height: 15px">
                                <em class="fa fa-external-link ml-lg"></em>
                            </a>
                            <span v-if="workload.scan_summary.scanned_at &&
                                    workload.scan_summary.high === 0 &&
                                    workload.scan_summary.medium === 0"
                                class="badge badge-success">
                                <em class="fa fa-shield-alt text-protect mr-1"></em> Clean
                            </span>
                            <button v-if="!workload.scan_summary.scanned_at &&
                                    !workload.scan_summary.status &&
                                    !isScanStarted4Pod"
                                class="d-inline-flex justify-content-center align-items-center"
                                disabled
                                style="height: 25px">
                                {{ t('scan.SCAN') }}
                            </button>
                            <div v-if="isScanStarted4Pod" class="ml mt-sm pull-left">
                                <label class="mt-sm label label-info-tran">
                                    <em class="fa fa-cog fa-spin mr-sm"></em> Scanning...
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </li>
            <li v-if="workload.network_mode" class="col-sm-6 p-1">
                <div class="pb-0 pt-1">
                    <span class="font-weight-bold pod-item-key">
                        {{ t('network.nodeDetails.NETWORK_MODE') }}
                    </span>
                    <span class="ml auto-hide pod-item-value">
                        {{ workload.network_mode }}
                    </span>
                </div>
            </li>
            <li v-if="(!workload.children || workload.children.length <= 1) && apps" class="col-sm-12 p-1">
                <div class="pb-0 pt-1">
                    <div>
                        <span class="font-weight-bold pod-item-key">
                            {{ t('network.nodeDetails.APPLICATIONS') }}:
                        </span>
                    </div>
                    <div class="ml auto-hide pod-item-value">
                        <span>{{ apps }}</span>
                    </div>
                </div>
            </li>
            <li v-if="hasInterfaces" class="col-sm-12 p-1">
                <div class="pb-0 pt-1">
                    <div>
                        <span class="font-weight-bold">
                            {{ t('containers.detail.NETWORK_INTERFACES') }}:
                        </span>
                    </div>
                    <div v-for="(value, key) in workload.interfaces"
                        class="row ml"
                        style="width: 380px" :key="key">
                        <div class="col-sm-2 text-left pr0">
                            <span>{{ key }}</span>
                        </div>
                        <div class="col-sm-1"></div>
                        <div class="col-sm-9 pl-0">
                            <div v-for="net in value" :key="net">
                                <div class="col-sm-12">
                                    <div class="col-sm-6">IP:{{ net.ip }}/{{ net.ip_prefix }}</div>
                                    <div v-if="net.gateway" class="col-sm-6">
                                        <span style="color: #909fa7;">
                                            {{ t('general.GATEWAY') }}:{{ net.gateway }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </li>
        </ul>
    </div>
</template>


<style lang="scss" scoped>
    @import '../../../../styles/neuvector.scss';
    .tooltip {
    z-index: 1080;
    }
</style>