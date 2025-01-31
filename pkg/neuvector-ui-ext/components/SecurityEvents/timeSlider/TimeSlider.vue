<script>
    import MultiRangeSlider from 'multi-range-slider-vue';
    import dayjs from 'dayjs';
    import { debounced } from '../../../utils/common';
    import { filterSecEvents, secEventVar } from '../../../utils/security-events';

    export default {
        components: {
            MultiRangeSlider
        },
        props: {
            securityEventsList: Array
        },
        data () {
            //parameter "step" is set to 1 not 1000 * 3600 * 24,  as MultiRangeSlider does not initialize the array of labels as rounded number. 
            return {
                barMinValue: this.securityEventsList[this.securityEventsList.length - 1].reportedTimestamp * 1000,
                barMaxValue: new Date().getTime(),
                minValue: this.securityEventsList[this.securityEventsList.length - 1].reportedTimestamp * 1000,
                maxValue: new Date().getTime(),
                startValue: 0,
                endValue: 0,
            };
        },
        methods: {
            UpdateValues(e) {
                this.startValue = e.minValue;
                this.endValue = e.maxValue;
                const filterSecEventsByTime = () => {
                    secEventVar.securityEventsServiceData.value.filterItems.dateFrom = e.minValue;
                    secEventVar.securityEventsServiceData.value.filterItems.dateTo = e.maxValue;
                    filterSecEvents();
                };
                debounced(200, filterSecEventsByTime);
            },
        },
        computed: {
            dateMinCaption() {
                return Math.floor(this.startValue / 60000) === Math.floor(new Date().getTime() / 60000) ? this.t('general.NOW') : dayjs(this.startValue).format('MMM DD, YYYY');
            },
            dateMaxCaption() {
                return Math.floor(this.endValue / 60000) === Math.floor(new Date().getTime() / 60000) ? this.t('general.NOW') : dayjs(this.endValue).format('MMM DD, YYYY');
            },
            dateLabels() {
                // let labelSet = new Set();
                // this.securityEventsList.forEach((event, index) => {
                //     if (this.securityEventsList.length > index) {
                //         labelSet.add(dayjs(event.reportedTimestamp * 1000).format('MMM DD, YYYY'));
                //     } else {
                //         labelSet.add(this.t('general.NOW'));
                //     }
                // });
                // return Array.from(labelSet);
                return [
                    dayjs(this.securityEventsList[this.securityEventsList.length - 1].reportedTimestamp * 1000).format('MMM DD, YYYY'),
                    this.t('general.NOW')
                ];
            }
        }
    };
</script>

<template>
    <div>
        <MultiRangeSlider
            style="margin-left: 15px; margin-right: -10px;"
            :baseClassName="'multi-range-slider'"
            :min="minValue"
            :max="maxValue"
            :step="1"
            :ruler="false"
            :labels="dateLabels"
            :minValue="barMinValue"
            :maxValue="barMaxValue"
            :min-caption="dateMinCaption"
            :max-caption="dateMaxCaption"
            @input="UpdateValues"
        />
    </div>
</template>
<style lang="scss">
    .multi-range-slider {
        border: none;
        box-shadow: none;
    }
    .multi-range-slider .label {
        width: auto;
    }
    .multi-range-slider .bar-inner {
        background-color: rgb(61, 152, 211);
        color: rgb(61, 152, 211);
        border: none;
        box-shadow: none;
    }
    .multi-range-slider .thumb::before {
        box-shadow: none;
        border-color: rgb(61, 152, 211);
        background-color: rgb(61, 152, 211);
    }
</style>