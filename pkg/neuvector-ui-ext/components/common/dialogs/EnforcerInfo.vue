<script>
    import { Card } from '@components/Card';
import dayjs from 'dayjs';
    export default {
        components: {
            Card
        },
        props: {
            enforcer: Object
        },
        data() {
            return {
                dayjs: dayjs
            };
        },
        computed: {
            isLightTheme() { return !document.body.classList.contains('theme-dark'); }
        },
        methods: {
          close() {
            this.$emit('close');
          }
        }
    };
</script>

<template>
    <div class="modal-backdrop">
        <div class="modal" style="position: absolute; z-index: 200; left: calc(100vw / 2 - 400px)">
            <Card :buttonAction="close" :buttonText="'Close'" :sticky="true">
                <template v-slot:title>
                    <h5 class="p-10 modal-title">
                        {{ enforcer.display_name }}
                    </h5>
                </template>
                <template v-slot:body>
                    <ul class="row">
                        <li class="col-sm-12 p-2">
                            <div class="mda-list-item-text pb-0 pt-sm">
                                <span class="font-weight-bold host-item-key">
                                    {{ t('controllers.detail.ID') }}:
                                </span>
                                <span class="ml  auto-hide host-item-value">
                                    {{ enforcer.id }}
                                </span>
                            </div>
                        </li>
                        <li class="col-sm-6 p-2">
                            <div class="mda-list-item-text pb-0 pt-sm">
                                <span class="font-weight-bold host-item-key">
                                    {{ t('containers.detail.HOST_NAME') }}:
                                </span>
                                <span class="ml  auto-hide host-item-value">
                                    {{ enforcer.host_name }}
                                </span>
                            </div>
                        </li>
                        <li class="col-sm-6 p-2">
                            <div class="mda-list-item-text pb-0 pt-sm">
                                <span class="font-weight-bold host-item-key">
                                    {{ t('scan.gridHeader.DOMAIN') }}:
                                </span>
                                <span class="ml  auto-hide host-item-value">
                                    {{ enforcer.domain }}
                                </span>
                            </div>
                        </li>
                        <li class="col-sm-6 p-2">
                        <div class="mda-list-item-text pb-0 pt-sm">
                            <span class="font-weight-bold host-item-key">
                                {{ t('enforcers.detail.VERSION') }}:
                            </span>
                            <span class="ml  auto-hide host-item-value">
                                {{ enforcer.version }}
                            </span>
                        </div>
                        </li>
                        <li class="col-sm-6 p-2">
                            <div class="mda-list-item-text pb-0 pt-sm">
                                <span class="font-weight-bold host-item-key">
                                    {{ t('enforcers.detail.CLUSTER_IP') }}:
                                </span>
                                <span class="ml  auto-hide host-item-value">
                                    {{ enforcer.cluster_ip }}
                                </span>
                            </div>
                        </li>
                        <li class="col-sm-6 p-2">
                            <div class="mda-list-item-text pb-0 pt-sm">
                                <span class="font-weight-bold host-item-key">
                                    {{ t('controllers.detail.DURATION') }}:
                                </span>
                                <span class="ml  auto-hide host-item-value">
                                    {{ dayjs(enforcer.djoined_at).fromNow() }}
                                </span>
                            </div>
                        </li>
                    </ul>
                </template>
            </Card>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import '../../../styles/neuvector.scss';
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