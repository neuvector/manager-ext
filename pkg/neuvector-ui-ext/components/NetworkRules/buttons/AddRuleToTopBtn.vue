<script>
    import AddEditRuleModal from '../dialogs/AddEditRuleModal';
    import { UpdateType } from '../../../types/network-rules';
    export default {
        components: {
            AddEditRuleModal,
        },
        props: {
            autoCompleteData: Object,
            isLightTheme: Boolean,
            disabled: Boolean,
        },
        data() {
            return {
                UpdateType: UpdateType
            }
        },
        methods: {
            openAddEditRuleModal: function() {
                this.$refs.addEditRule.show();
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
            mat-button
            class="btn role-secondary"
            aria-label="Open add rule modal"
            type="button"
            :disabled="disabled"
            @click="openAddEditRuleModal()">
            {{ t('policy.toolBar.INSERT_TO_TOP') }}
        </button>
        <AddEditRuleModal 
            ref="addEditRule"
            :isLightTheme="isLightTheme"
            :autoCompleteData="autoCompleteData"
            :opType="UpdateType.AddToTop"
            @close="closeModal">
        </AddEditRuleModal>
    </div>
</template>