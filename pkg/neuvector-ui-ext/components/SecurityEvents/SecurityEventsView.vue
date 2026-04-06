<script>

import { vTooltip } from 'floating-vue';
import { refreshAuth } from '../../plugins/neuvector-class';
import { getSecEvents } from '../../plugins/security-events-class';
import { NV_CONST, nvVariables } from '../../types/neuvector';
import { combineSecurityEvents, filterSecEvents, prepareContext4TwoWayInfinityScroll, secEventVar } from '../../utils/security-events';
import AdvancedFilter from './buttons/AdvancedFilter.vue';
import QuickFilter from './quickFilter/QuickFilter';
import TimeSlider from './timeSlider/TimeSlider';
import TimeSparklingChart from './timeSlider/TimeSparklingChart';
    // import { library } from '@fortawesome/fontawesome';
    import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
    // import { faSomeIcon } from '@fortawesome/fontawesome-free-regular'; 
    import Loading from '@shell/components/Loading';
import TwoWayInfinityScroll from '../../directives/TwoWayInfinityScroll';
import Refresh from '../common/buttons/Refresh';
import EnforcerInfo from '../common/dialogs/EnforcerInfo';
import NodeInfo from '../common/dialogs/NodeInfo';
import PodInfo from '../common/dialogs/PodInfo';
import Error from '../common/error/Error';
import DownloadCsv from './buttons/DownloadCsv';
import agGridTheme from '../../mixins/agGridTheme';
import BriefInfo from './contents/BriefInfo';
import Details from './contents/Details';
import Packet from './dialogs/Packet';

    // library.add(faSomeIcon);

    export default {
        mixins: [agGridTheme],
        components: {
            QuickFilter,
            TimeSparklingChart,
            TimeSlider,
            FontAwesomeIcon,
            BriefInfo,
            Details,
            AdvancedFilter,
            Packet,
            NodeInfo,
            PodInfo,
            EnforcerInfo,
            DownloadCsv,
            Refresh,
            Loading,
            Error,
        },
        async fetch() {
            this.currentCluster = this.$store.getters['currentCluster'];
            nvVariables.currentCluster = this.currentCluster.id;
            await this.loadData();
        },
        data() {
            return {
                secEvents: null,
                processedSecEvents: {
                    cachedSecurityEvents: null,
                    displayedSecurityEvents: null,
                    domainList: null,
                    autoCompleteData: null,
                },
                securityEventsDataCtx: null,
                errorRes: null,
            };
        },
        props: {
            mode: { type: String, default: 'edit' }
        },
        methods: {
            loadData: async function() {
                try {
                    console.log('Security Events');
                    this.authRes = await refreshAuth();
                    nvVariables.user = this.authRes.data.token;
                    this.secEvents = await getSecEvents();
                    this.processedSecEvents = await combineSecurityEvents(this.secEvents, this.$store);
                    console.log('processedSecEvents:', this.processedSecEvents);
                    this.securityEventsDataCtx = secEventVar.dateSliderCtx.value;
                    prepareContext4TwoWayInfinityScroll(this.securityEventsDataCtx);
                    console.log('this.securityEventsDataCtx', this.securityEventsDataCtx)
                    filterSecEvents();
                } catch(error) {
                    console.error(error);
                    this.errorRes = error;
                }
            },
            getOpenedRec: function(evt, index, page) {
                if (evt.target.checked) {
                    this.securityEventsDataCtx.openedIndex = index;
                    this.securityEventsDataCtx.openedPage = page;
                } else {
                    this.securityEventsDataCtx.openedIndex = -1;
                    this.securityEventsDataCtx.openedPage = -1;
                }
            },
            closeDetails: function(elemId) {
                console.log(elemId)
                document.getElementById(elemId)['checked'] = false;
                this.securityEventsDataCtx.openedIndex = -1;
                this.securityEventsDataCtx.openedPage = -1;
            },
            isTooltipDisabled: function(e) {
                console.log('e', e)
                return e[0].scrollWidth <= e[0].clientWidth;
            },
            closePacketModal: function() {
                nvVariables.showPacketModal.value = false;
            },
            closeHostInfoModal: function() {
                nvVariables.showHostInfoModal.value = false;
            },
            closeWorkloadInfoModal: function() {
                nvVariables.showWorkloadInfoModal.value = false;
            },
            closeEnforcerInfoModal: function() {
                nvVariables.showEnforcerInfoModal.value = false;
            },
            closeAdvFilterModal: function() {
                nvVariables.showAdvFilterModal.value = false;
            }
        },
        computed: {
            packetModalVisible: function() {
                return nvVariables.showPacketModal.value;
            },
            packetData: function() {
                return nvVariables.packet.value;
            },
            hostInfoModalVisible: function() {
                return nvVariables.showHostInfoModal.value;
            },
            hostData: function() {
                return nvVariables.host.value;
            },
            workloadInfoModalVisible: function() {
                return nvVariables.showWorkloadInfoModal.value;
            },
            workloadData: function() {
                return nvVariables.workload.value;
            },
            enforcerInfoModalVisible: function() {
                return nvVariables.showEnforcerInfoModal.value;
            },
            enforcerData: function() {
                return nvVariables.enforcer.value;
            }
        },
        directives: {
            'two-way-infinity-scroll': TwoWayInfinityScroll,
            'tooltip': vTooltip
        }
    };
</script>

<template>
    <Loading v-if="$fetchState.pending" />
    <div v-else-if="errorRes" class="container">
        <Error :error="errorRes"></Error>
    </div>
    <div v-else class="screen-area">
        <div id="sec-event" class="padding-top-0">
            <header style="margin-bottom: 10px;" id="security-events-title">
                <div class="title">
                    <h1 class="m-0">{{ t('sidebar.nav.SECURITY_EVENT') }}</h1>
                </div>
                <div class="actions-container">
                    <div class="pull-right" style="margin-left: 8px;">
                        <Refresh :reloadData="loadData"/>
                    </div>
                    <div class="pull-right"
                        v-if="processedSecEvents.cachedSecurityEvents && processedSecEvents.cachedSecurityEvents.length > 0">
                        <DownloadCsv />
                    </div>
                    <div v-if="processedSecEvents.cachedSecurityEvents && processedSecEvents.cachedSecurityEvents.length > 0" class="pull-right" style="margin-right: 10px;">
                        <AdvancedFilter 
                            :autoCompleteData="processedSecEvents.autoCompleteData" 
                        />
                    </div>
                    <div class="pull-right"  style="margin-right: 20px;">
                        <QuickFilter />
                    </div>
                </div>
            </header>
            <div v-if="processedSecEvents.cachedSecurityEvents && processedSecEvents.cachedSecurityEvents.length > 0">
                <span v-if="processedSecEvents.displayedSecurityEvents.length === processedSecEvents.cachedSecurityEvents.length">{{ t('enum.OUT_OF') }}</span>
                <span v-if="processedSecEvents.displayedSecurityEvents.length < processedSecEvents.cachedSecurityEvents.length">{{ t('enum.FOUND') }}</span>
                <span>{{ processedSecEvents.displayedSecurityEvents.length }}</span><span v-if="processedSecEvents.displayedSecurityEvents.length < processedSecEvents.cachedSecurityEvents.length"> / <span>{{ processedSecEvents.cachedSecurityEvents.length }}</span></span>
            </div>
            <div style="height: 95px; position: relative" class="mt-2" v-if="processedSecEvents.cachedSecurityEvents && processedSecEvents.cachedSecurityEvents.length > 0">
                <TimeSparklingChart
                    v-if="processedSecEvents.cachedSecurityEvents"
                    :securityEventsList="processedSecEvents.cachedSecurityEvents"
                    :height="70"
                />
                <TimeSlider
                    :securityEventsList="processedSecEvents.cachedSecurityEvents"
                />
            </div>
        </div>
        <div id="sec-event-list"
            v-if="
                    processedSecEvents.cachedSecurityEvents && processedSecEvents.cachedSecurityEvents.length > 0
                "
            :class="'timeline-nv' + (isLightTheme ? '' : '-dark') + ' normal'"
            style="margin-top: 12px"
            v-two-way-infinity-scroll:ctx="securityEventsDataCtx"
        >
            <ul id="timeline">
                <li
                    class="sec-event-row"
                    :id="'sec-wrap-' + index "
                    v-for="
                        (secEvent, index) in processedSecEvents.displayedSecurityEvents
                        .slice(securityEventsDataCtx.begin, securityEventsDataCtx.begin + securityEventsDataCtx.limit)
                    "
                    :key="index"
                >
                    <input
                        class="radio"
                        :id="'sec-' + index "
                        name="secEvt"
                        type="radio"
                        @click="
                            getOpenedRec(
                                $event,
                                index,
                                securityEventsDataCtx.page
                            )
                        " />
                    <div class="relative">
                        <label :for="'sec-' + index">
                            <div class="heading">
                                <BriefInfo :secEvent="secEvent" :index="index"/>
                            </div>
                        </label>
                        <span class="date">{{ secEvent.relativeDate }}</span>
                        <span class="circle"></span>
                    </div>
                    <div class="sec-event-content">
                        <button
                            id="detail-close"
                            class="btn-link pull-right sec-fixed-close"
                            @click="closeDetails('sec-' + index)">
                            <em class="icon-close"></em>
                        </button>
                        <Details :secEvent="secEvent"/>
                    </div>
                </li>
            </ul>
            <Packet v-if="packetModalVisible" :packet="packetData" @close="closePacketModal"></Packet>
            <NodeInfo v-if="hostInfoModalVisible" :host="hostData" @close="closeHostInfoModal"></NodeInfo>
            <PodInfo v-if="workloadInfoModalVisible" :workload="workloadData" @close="closeWorkloadInfoModal"></PodInfo>
            <EnforcerInfo v-if="enforcerInfoModalVisible" :enforcer="enforcerData" @close="closeEnforcerInfoModal"></EnforcerInfo>
        </div>
        <div v-else class="text-center mt-5">
            {{ t('general.NO_ROWS') }}
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import '../../styles/security-events.scss';
    @import '../../styles/neuvector.scss';

    @media print {
    @page {
        size: landscape;
        @bottom-right {
        content: counter(page) ' of ' counter(pages);
        }
    }
    .screen-area,
    #__layout nav,
    #__layout header {
        display: none;
        width: 0;
        height: 0;
    }
    // #__layout main {
    //   margin-top: 0;
    //   margin-bottom: 0;
    //   margin-left: 0;
    //   border: none;
    // }
    // .nv-section {
    //   border-top: none;
    //   padding-top: 4px;
    //   padding-bottom: 0;
    //   padding-left: 0;
    //   padding-right: 0;
    // }
    .printable-area {
        visibility: visible;
        position: absolute;
        top: 0;
        left: 0;
        overflow-y: auto;
        height: auto;
        width: 1000px;
    }
    .pagebreak {
        clear: both;
        page-break-after: always;
    }
    }
    @media screen {
    .printable-area {
        visibility: hidden;
        position: absolute;
        height: 0;
        overflow: hidden;
        width: 1000px;
    }
    }
</style>