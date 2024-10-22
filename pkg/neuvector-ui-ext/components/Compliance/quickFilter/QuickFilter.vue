<script>
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
                this.$emit('quickFilter', filterText);
            }
        }
    };
</script>

<template>
    <input id="quick-filter" type="text" placeholder="Filter" class="input-sm search-box" :value="filterText" @keyup="filterByQuickFilter($event, filterText)"/>
</template>