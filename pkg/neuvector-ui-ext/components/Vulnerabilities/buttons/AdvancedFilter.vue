<script>
    export default {
        methods: {
            openAdvancedFilterDialog() {
                this.$emit('openAdvFilter');
            }
        }
    };
</script>

<template>
    <div>
        <a
            @click="openAdvancedFilterDialog()"
            class="btn role-secondary"
        >
            {{ t('general.ADV_FILTER') }}
        </a>
    </div>
</template>