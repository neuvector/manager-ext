<script>
    import { filterSecEvents, secEventVar } from '../../../utils/security-events';
    export default {
        components: {
        },
        props: {
        },
        data() {
            return {
                filterText: ''
            }
        },
        methods: {
            filterByQuickFilter: function(e, filterText) {
                secEventVar.securityEventsServiceData.value.filterItems.includedKeyword = filterText;
                filterSecEvents();
            }
        }
    };
</script>

<template>
    <div class="search row">
        <input id="quick-filter" type="text" placeholder="Filter" class="input-sm search-box" :value="filterText" @keyup="filterByQuickFilter($event, filterText)"/>
    </div>
</template>