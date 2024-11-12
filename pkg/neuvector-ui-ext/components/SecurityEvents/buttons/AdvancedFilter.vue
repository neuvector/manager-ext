<script>
    import AdvancedFilterModal from '../dialogs/AdvancedFilterModal';
    import { nvVariables } from '../../../types/neuvector';
    export default {
        components: {
            AdvancedFilterModal
        },
        props: {
            isLightTheme: Boolean,
            autoCompleteData: Object,
        },
        data() {
            return {
                showModal: false
            };
        },
        methods: {
            openAdvancedFilterDialog: function() {
                this.$refs.advFilter.show();
            },
            closeModal: function() {
                this.showModal = false;
            }
        }
    };
</script>

<template>
    <div>
        <button
            @click="openAdvancedFilterDialog()"
            class="btn role-secondary"
        >
            {{ t('general.ADV_FILTER') }}
        </button>
        <AdvancedFilterModal ref="advFilter" :isLightTheme="isLightTheme" :autoCompleteData="autoCompleteData" @close="closeModal"></AdvancedFilterModal>
    </div>
</template>