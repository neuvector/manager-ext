<script>
    import { Card } from '@components/Card';
    import { nvVariables } from '../../../types/neuvector';
    export default {
        components: {
            Card
        },
        props: {
            ports: String,
        },
        data() {
            return {
                isLightTheme: nvVariables.isLightTheme,
            };
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
        <div class="modal" :class="isLightTheme ? 'light' : 'dark'"  style="position: absolute; z-index: 200; left: calc(100vw / 2 - 400px)">
            <Card :buttonAction="close" :buttonText="'Close'" :sticky="true">
                <template v-slot:title>
                    <h5 class="p-10" :style="isLightTheme ? 'color: #888' : 'color: #fff'">
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