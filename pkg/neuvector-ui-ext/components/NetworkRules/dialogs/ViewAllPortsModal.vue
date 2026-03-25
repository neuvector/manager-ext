<script>
    import { Card } from '@components/Card';
    export default {
        components: {
            Card
        },
        props: {
            ports: String,
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
                        {{ t('policy.ALL_PORTS') }}
                    </h5>
                </template>
                <template v-slot:body>
                    <div class="col-sm-2" v-for="port in ports.split(',')" :key="port">
                        {{port}}
                    </div>
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
