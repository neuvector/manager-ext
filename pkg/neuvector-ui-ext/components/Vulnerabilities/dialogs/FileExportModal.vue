<script>
import { getVulnerabilitiesQuery, patchAssetsViewData } from '../../../plugins/vulnerabilities-class';
import { downloadAssetsViewCsv, downloadCsv } from '../../../plugins/vulnerabilities-csv-class';
import { extractPodImage } from '../../../utils/vulnerabilities';
import { Card } from "@components/Card";
import Checkbox from "@components/Form/Checkbox/Checkbox";
import AsyncButton from '@shell/components/AsyncButton';
import Select from '@shell/components/form/Select';
import DatePicker from 'vue2-datepicker';


const SCOPE_OPTION = {
    ASSET: 'Asset',
    VULNERABILITY: 'Vulnerability'
}
const LAST_MODIFIED_PERIOD_OPTION = {
    ALL: 'All',
    TWO_WEEKS: '2 weeks ago',
    ONE_MONTH: '1 month ago',
    THREE_MONTHS: '3 months ago',
    CUSTOM: 'Custom'
}

export default {
    components: {
        Card,
        Checkbox,
        AsyncButton,
        Select,
        DatePicker,
    },
    props: {
        isLightTheme: Boolean,
        title: String,
        queryToken: String
    },
    methods: {
        show() {
            this.isDisplay = true;
        },
        close() {
            this.isDisplay = false;
            this.exportReportCriteria = {
                selectedScope: this.scopeOptions[0],
                selectedLastModifyPeriod: this.lastModifiedPeriodOptions[0],
                selectedLastModifyDate: null,
            }
        },
        async exportFile(buttonCb) {
            switch (this.exportReportCriteria.selectedScope) {
                case SCOPE_OPTION.ASSET:
                    this.exportAssetsFile();
                    break;
                case SCOPE_OPTION.VULNERABILITY:
                    this.exportVulnerabilitiesFile();
                    break;
                default:
                    break;
            }

            buttonCb(true)
        },
        async exportAssetsFile() {
            try {
                const data = (await patchAssetsViewData(this.queryToken, this.getLastModifiedDate())).data
                downloadAssetsViewCsv(data);
            } catch (e) {
                console.error(e);
            }
        },
        async exportVulnerabilitiesFile() {
            try {
                let params = {
                    token: this.queryToken,
                    start: 0,
                    row: -1,
                    lastmtime: this.getLastModifiedDate(),
                };

                const data = (await getVulnerabilitiesQuery(params)).data;
                downloadCsv(extractPodImage(data.vulnerabilities));
            } catch (e) {
                console.error(e);
            }
        },
        getLastModifiedDate() {
            const today = new Date();

            switch (this.exportReportCriteria.selectedLastModifyPeriod) {
                case LAST_MODIFIED_PERIOD_OPTION.TWO_WEEKS:
                    return new Date(
                        today.getFullYear(),
                        today.getMonth(),
                        today.getDate() - 14
                    ).getTime() / 1000;
                case LAST_MODIFIED_PERIOD_OPTION.ONE_MONTH:
                    return new Date(
                        today.getFullYear(),
                        today.getMonth() - 1,
                        today.getDate()
                    ).getTime() / 1000;
                case LAST_MODIFIED_PERIOD_OPTION.THREE_MONTHS:
                    return new Date(
                        today.getFullYear(),
                        today.getMonth() - 3,
                        today.getDate()
                    ).getTime() / 1000;
                case LAST_MODIFIED_PERIOD_OPTION.CUSTOM:
                    return new Date(this.exportReportCriteria.selectedLastModifyDate).getTime() / 1000;
                default:
                    return 0;
            }
        }
    },
    computed: {
        isCustomDatePickerDisplay() {
            return this.exportReportCriteria.selectedLastModifyPeriod === LAST_MODIFIED_PERIOD_OPTION.CUSTOM
        },
        isPdfExtensionSelected() {
            return this.exportReportCriteria.selectedExtension === EXTENSION_OPTION.PDF
        }
    },
    data() {
        return {
            isDisplay: false,
            isPrinting: false,
            exportReportCriteria: {
                selectedScope: null,
                selectedLastModifyPeriod: null,
                selectedLastModifyDate: null,
            },
            scopeOptions: [
                SCOPE_OPTION.ASSET,
                SCOPE_OPTION.VULNERABILITY
            ],
            lastModifiedPeriodOptions: [
                LAST_MODIFIED_PERIOD_OPTION.ALL,
                LAST_MODIFIED_PERIOD_OPTION.TWO_WEEKS,
                LAST_MODIFIED_PERIOD_OPTION.ONE_MONTH,
                LAST_MODIFIED_PERIOD_OPTION.THREE_MONTHS,
                LAST_MODIFIED_PERIOD_OPTION.CUSTOM
            ],
            statisticCharts: {
                nodes: null,
                image: null
            }
        };
    },
    created() {
        this.exportReportCriteria.selectedScope = this.scopeOptions[0];
        this.exportReportCriteria.selectedLastModifyPeriod = this.lastModifiedPeriodOptions[0];
    }

};
</script>

<template>
    <div v-if="isDisplay" class="modal-backdrop">
        <div class="modal" :class="isLightTheme ? 'light' : 'dark'">
            <Card :sticky="true">
                <template v-slot:title>
                    <h2 class="p-10" :style="isLightTheme ? 'color: #888' : 'color: #fff'">
                        {{ title }}
                    </h2>
                </template>
                <template v-slot:body>
                    <div class="row align-items-center mt-4">
                        <div class="col-3">
                            <div class="text-bold ml-10">{{ t('scan.SCOPE') }}</div>
                        </div>
                        <div class="col-9">
                            <div class="row align-items-center">
                                <div class="col-4">
                                    <Select v-model="exportReportCriteria.selectedScope" :options='scopeOptions' />
                                </div>
                                <div class="col-8"></div>
                            </div>
                        </div>
                    </div>
                    <div class="row align-items-center mt-4 mb-3">
                        <div class="col-3">
                            <div class="text-bold ml-10">{{ t('scan.LAST_MODIFIED') }}</div>
                        </div>
                        <div class="col-9">
                            <div class="row align-items-center">
                                <div class="col-4">
                                    <Select 
                                        v-model="exportReportCriteria.selectedLastModifyPeriod"
                                        :options='lastModifiedPeriodOptions' 
                                    />
                                </div>
                                <div class="col-3">
                                    <date-picker 
                                        v-if="isCustomDatePickerDisplay"
                                        v-model="exportReportCriteria.selectedLastModifyDate"
                                        valueType="timestamp"
                                    ></date-picker>
                                </div>
                                <div class="col-5"></div>
                            </div>
                        </div>
                    </div>
                </template>
                <template v-slot:actions>
                    <AsyncButton class="mr-10" :actionLabel="'Close'" @click="close"></AsyncButton>
                    <AsyncButton :actionLabel="'Submit'" @click="exportFile"></AsyncButton>
                </template>
            </Card>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import '../../../styles/neuvector.scss';
</style>
<style lang="scss">
    .vs__dropdown-menu {
        z-index: 1000 !important;
    }
</style>