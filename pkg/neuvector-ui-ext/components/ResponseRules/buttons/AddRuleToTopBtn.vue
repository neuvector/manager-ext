<script>
    import AddEditRuleModal from '../dialogs/AddEditRuleModal';
    import { UpdateType } from '../../../types/network-rules';
    export default {
        components: {
            AddEditRuleModal,
        },
        props: {
            autoCompleteData: Object,
            webhooks: Array,
            source: String,
            refreshFn: Function,
        },
        computed: {
            isLightTheme() { return !document.body.classList.contains('theme-dark'); }
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
        <a
            mat-button
            class="btn role-secondary"
            aria-label="Open add rule modal"
            type="button"
            @click="openAddEditRuleModal()">
            {{ t('policy.toolBar.INSERT_TO_TOP') }}
        </a>
        <AddEditRuleModal 
            ref="addEditRule"
            :autoCompleteData="autoCompleteData"
            :webhooks="webhooks"
            :source="source"
            :opType="UpdateType.AddToTop"
            :refreshFn="refreshFn"
            @close="closeModal">
        </AddEditRuleModal>
    </div>
</template>