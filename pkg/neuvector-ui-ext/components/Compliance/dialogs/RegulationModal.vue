<script>
    import { Card } from '@components/Card';
    import RegulationItemGrid from '../grids/RegulationItemGrid.vue';
    import { getRegulationCsv } from '../../../utils/compliance';
    import { arrayToCsv } from '../../../utils/common';
    import { saveAs } from 'file-saver';
    import dayjs from 'dayjs';

    export default {
        components: {
            Card,
            RegulationItemGrid
        },
        props: {
            type: String,
            content: Array,
            name: String,
        },
        computed: {
            isLightTheme() {
                return !document.body.classList.contains('theme-dark');
            }
        },
        methods: {
            close() {
                this.$emit("close");
            },
            downloadCsv() {
                let csv = arrayToCsv(getRegulationCsv(this.content));
                let blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
                saveAs(blob, `${this.name}_${this.type}_${dayjs(new Date()).format('YYYYMMDDHHmmss')}.csv`);
            }
        },
        data() {
            return {
                
            };
        },
    };
</script>

<template>
    <div class="modal-backdrop">
        <div class="modal">
            <Card
            :buttonAction="close"
            :buttonText="t('general.CLOSE')"
            :sticky="true"
            >
                <template v-slot:title>
                    <div class="d-flex justify-content-between w-100">
                        <h5
                        class="p-10 modal-title"
                        >
                            {{ type }}
                        </h5>
                        <button
                            class="btn btn-sm role-secondary px-2"
                            @click="downloadCsv()"
                            aria-label="Download CSV icon button "
                        >
                            <i class="icon icon-download"></i>
                        </button>
                    </div>
                </template>
                <template v-slot:body>
                    <RegulationItemGrid :regulationData="content"></RegulationItemGrid>
                </template>
            </Card>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    .modal-title { color: var(--body-text); }
</style>
