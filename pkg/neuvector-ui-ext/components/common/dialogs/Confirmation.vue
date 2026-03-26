<script>
    import { Card } from '@components/Card';

    export default {
        components: {
            Card
        },
        props: {
            message: String,
            okFn: Function,
        },
        computed: {
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
                        {{ t('general.CONFIRMATION') }}
                    </h5>
                </template>
                <template v-slot:body>
                    <div>{{ message }}</div>
                    <a
                        mat-button
                        class="btn role-primary mt-2"
                        aria-label="ok"
                        type="button"
                        style="width: 65px;"
                        @click="okFn()">
                        OK
                    </a>
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
