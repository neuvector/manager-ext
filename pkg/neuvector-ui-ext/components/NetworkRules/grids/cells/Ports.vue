<script>
    import ViewAllPortsModal from '../../dialogs/ViewAllPortsModal';
    export default {
        components: {
            ViewAllPortsModal,
        },
        props: {
            rule: Object,
        },
        methods: {
            showAllPorts() {
                this.showAllPortsModal = true;
            },
            closeAllPorts(event) {
                this.showAllPortsModal = false;
            },
        },
        computed: {
            getPorts() {
                let ports = '';
                if (this.rule && this.rule.id > -1) {
                    ports =
                    this.rule.ports === 'any'
                        ? this.t('enum.ANY')
                        : this.rule.ports.split(',').join(', ').toString();
                    if (this.rule.ports.split(',').length <= 3) {
                        return {
                            className: this.rule.remove ? 'policy-remove' : '',
                            text: ports,
                        };
                    } else {
                        ports = this.rule.ports
                            .split(',')
                            .slice(0, 2)
                            .join(',')
                            .toString();
                        return {
                            className: this.rule.remove ? 'policy-remove' : '',
                            text: `${ports} ...`,
                            hasViewAll: true,
                        }
                    }

                }
                return {
                    className: '',
                    text: '-',
                };
            }
        },
        data() {
            return {
                showAllPortsModal: false,
            };
        },
    }
</script>

<template>
    <div>
        <span v-if="getPorts.hasViewAll" style="word-wrap: break-word;" :class="getPorts.className" @click="showAllPorts(rule.id, rule.ports, $event)">{{ getPorts.text }}</span>
        <span v-else style="word-wrap: break-word;" :class="getPorts.className">{{ getPorts.text }}</span>
        <ViewAllPortsModal v-if="showAllPortsModal" @close="closeAllPorts" :ports="rule.ports"></ViewAllPortsModal>
    </div>
</template>

<style lang="scss" scoped>
@import '../../../../styles/network-rules.scss';
</style>