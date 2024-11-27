<script>
import { EOS_LAUNCH_FILLED } from 'eos-icons-vue3';
import { capitalize, getSSOUrl } from '../../../../utils/common';
import dayjs from 'dayjs';

export default {
    components: {
        EOS_LAUNCH_FILLED,
    },
    props: {
        host: Object
    },
    data() {
        return {
            dayjs: dayjs,
            capitalize: capitalize,
        };
    },
    methods: {
        goToNvHosts() {
            window.open(`${getSSOUrl('#/hosts')}`, '_blank');
        },
        goToNvGroup(group) {
            window.open(`${getSSOUrl('#/group')}?group=${group}`, '_blank');
        }
    }
}
</script>

<template>
    <div>
        <ul class="row">
            <li class="col-sm-12 p-2">
                <div class="mda-list-item-text pb-0 pt-sm">
                    <span class="font-weight-bold host-item-key">ID:</span>
                    <span class="ml auto-hide host-item-value">
                        {{ host.id }}
                    </span>
                </div>
            </li>
            <li class="col-sm-6 p-2">
                <div class="mda-list-item-text pb-0 pt-sm">
                    <span class="font-weight-bold host-item-key">
                        {{ t('nodes.detail.NUM_OF_CPUS') }}:
                    </span>
                    <span class="ml auto-hide host-item-value">
                        {{ host.cpus }}
                    </span>
                </div>
            </li>
            <li class="col-sm-6 p-2">
                <div class="mda-list-item-text pb-0 pt-sm">
                    <span class="font-weight-bold host-item-key">
                        {{ t('nodes.detail.MEMORY') }}:
                    </span>
                    <span class="ml auto-hide host-item-value">
                        {{ host.memory }}
                    </span>
                </div>
            </li>
            <li class="col-sm-6 p-2">
                <div class="mda-list-item-text pb-0 pt-sm">
                    <span class="font-weight-bold host-item-key">
                        {{ t('nodes.detail.OS') }}:
                    </span>
                    <span class="ml auto-hide host-item-value">
                        {{ host.os }}
                    </span>
                </div>
            </li>
            <li class="col-sm-6 p-2">
                <div class="mda-list-item-text pb-0 pt-sm">
                    <span class="font-weight-bold host-item-key">
                        {{ t('nodes.detail.KERNEL_VERSION') }}:
                    </span>
                    <span class="ml auto-hide host-item-value">
                        {{ host.kernel }}
                    </span>
                </div>
            </li>
            <li class="col-sm-6 p-2">
                <div class="mda-list-item-text pb-0 pt-sm">
                    <span class="font-weight-bold host-item-key">
                        {{ capitalize(host.runtime) }}:&nbsp;{{
                            t('nodes.detail.VERSION')
                        }}
                    </span>
                    <span class="ml auto-hide host-item-value">
                        {{ host.runtime_version }}
                    </span>
                </div>
            </li>
            <li class="col-sm-6 p-2">
                <div class="mda-list-item-text pb-0 pt-sm">
                    <span class="font-weight-bold host-item-key">
                        {{ capitalize(host.runtime) }}:&nbsp;{{
                            t('nodes.detail.API_VERSION')
                        }}
                    </span>
                    <span class="ml auto-hide host-item-value">
                        {{ host.runtime_api_version }}
                    </span>
                </div>
            </li>
            <li class="col-sm-6 p-2">
                <div class="mda-list-item-text pb-0 pt-sm">
                    <span class="font-weight-bold host-item-key">
                        {{ t('network.hostDetails.CONTAINERS') }}:
                    </span>
                    <span class="ml auto-hide host-item-value">
                        {{ host.containers }}
                    </span>
                </div>
            </li>
            <li v-if="!!host.scan_summary?.scanned_at" class="col-sm-6 p-2">
                <div class="mda-list-item-text pb-0 pt-sm">
                    <span class="font-weight-bold host-item-key">
                        {{ t('network.nodeDetails.SCANNED_AT') }}:
                    </span>
                    <span class="ml mr-lg auto-hide host-item-key">
                        {{ dayjs(host.scan_summary.scanned_at).format('MMM DD, YYYY HH:mm:ss') }}
                    </span>
                </div>
            </li>
            <li class="col-sm-6 p-2">
                <div class="mda-list-item-text pb-0 pt-sm">
                    <span class="font-weight-bold host-item-key">
                        {{ t('group.gridHeader.VULNERABILITIES') }}:
                    </span>
                    <div class="d-inline">
                        <span v-if="host.scan_summary?.high"
                            class="badge badge-danger mr-sm">
                            {{ host.scan_summary.high }}
                        </span>
                        <span v-if="host.scan_summary?.medium" class="badge badge-warning">
                            {{ host.scan_summary.medium }}
                        </span>
                        <span v-if="host.scan_summary?.low" class="badge badge-success">
                            {{ host.scan_summary.low }}
                        </span>
                        <a v-if="host.scan_summary?.high || host.scan_summary?.medium"
                            @click="goToNvHosts()"
                            style="display: table-cell; font-size: 11px; line-height: 15px; cursor: pointer;">
                            <EOS_LAUNCH_FILLED size="base" color="#3D98D3"></EOS_LAUNCH_FILLED>
                        </a>
                        <label v-if="host.scan_summary?.scanned_at &&
                                host.scan_summary?.high === 0 &&
                                host.scan_summary?.medium === 0"
                            class="label label-success-tran">
                            <em class="fa fa-smile-o mr-sm"></em> Clean
                        </label>
                    </div>
                </div>
            </li>
            <li class="col-sm-6 p-2">
                <div class="mda-list-item-text pb-0 pt-sm">
                    <span class="font-weight-bold host-item-key">
                        {{ t('network.legend.GROUP') }}:
                    </span>
                    <span class="ml mr-lg auto-hide host-item-key">
                        nodes
                        <a
                            @click="goToNvGroup('nodes')"
                            style="display: table-cell; font-size: 11px; line-height: 15px; cursor: pointer;">
                            <EOS_LAUNCH_FILLED size="base" color="#3D98D3"></EOS_LAUNCH_FILLED>
                        </a>
                    </span>
                </div>
            </li>
            <li v-if="host.interfaces" class="col-sm-12 p-2">
                <div class="mda-list-item-text pb-0 pt-sm">
                    <div class="font-weight-bold text-muted">
                        {{ t('containers.detail.NETWORK_INTERFACES') }}:
                    </div>
                    <div v-for="(value, key) in host.interfaces"
                        class="row pl"
                        style="width: 380px" :key="key">
                        <div class="col-sm-2 text-right pr-0 text-muted">
                            {{ key }}
                        </div>
                        <div class="col-sm-1"></div>
                        <div class="col-sm-9 pl0">
                            <div v-for="net of value">
                                <div class="col-sm-12">
                                    <div class="col-sm-6 text-muted">
                                        IP:{{ net.ip }}/{{ net.ip_prefix }}
                                    </div>
                                    <div v-if="net.gateway" class="col-sm-6 text-muted">
                                        {{ t('general.GATEWAY') }}:{{ net.gateway }}
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
</style>