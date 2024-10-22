<script>
    import debounce from 'lodash/debounce';

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
            filterByQuickFilter: debounce(function(e, filterText) {
                this.$emit('quickFilter', filterText);
            }, 500)
        }
    };
</script>

<template>
    <input id="quick-filter" type="text" placeholder="Filter" class="input-sm search-box" :value="filterText" @keyup="filterByQuickFilter($event, filterText)"/>
</template>