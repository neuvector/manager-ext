<script>
    import ViewAllPortsModal from '../../dialogs/ViewAllPortsModal';
    export default {
        components: {
            ViewAllPortsModal,
        },
        computed: {
            getPorts() {
                let ports = '';
                if (this.params.node.data && this.params.node.data.id > -1) {
                    ports =
                    this.params.value === 'any'
                        ? this.t('enum.ANY')
                        : this.params.value.split(',').join(', ').toString();
                    if (this.params.value.split(',').length <= 3) {
                        return {
                            className: this.params.node.data.remove ? 'policy-remove' : '',
                            text: ports,
                        };
                    } else {
                        ports = this.params.value
                            .split(',')
                            .slice(0, 2)
                            .join(',')
                            .toString();
                        return {
                            className: this.params.node.data.remove ? 'policy-remove' : '',
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
        methods: {
            refresh(params) {
                this.params = params
            },
            showAllPorts() {
                this.showAllPortsModal = true;
            },
            closeAllPorts(event) {
                this.showAllPortsModal = false;
            },
        },
    }
</script>

<template>
    <div>
        <span v-if="getPorts.hasViewAll" style="word-wrap: break-word;" :class="getPorts.className" @click="showAllPorts(params.node.data.id, params.value, $event)">{{ getPorts.text }}</span>
        <span v-else style="word-wrap: break-word;" :class="getPorts.className">{{ getPorts.text }}</span>
        <ViewAllPortsModal v-if="showAllPortsModal" @close="closeAllPorts" :ports="params.value"></ViewAllPortsModal>
    </div>
</template>

<style lang="scss" scoped>
@import '../../../../styles/network-rules.scss';
</style>