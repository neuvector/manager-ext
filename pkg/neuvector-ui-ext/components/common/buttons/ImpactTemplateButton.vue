<script>
    import ImpactIconTemplate from './components/ImpactIconTemplate.vue';

    export default {
        props: {
            content: Object,
            type: String
        },
        components: {
            ImpactIconTemplate,
        },
        methods: {
            openBrief(type, content) {
                this.$emit('openBrief', {
                    type: type, 
                    id: content.id 
                });
            },
            getClass(content) {
                if (!content.policy_mode) {
                    return 'badge-black';
                } else if (content.policy_mode.toLowerCase() === 'discover') {
                    return 'badge-danger';
                } else {
                    return 'badge-success';
                }
            }
        }
    }
</script>

<template>
    <button 
        v-if="['node', 'workload'].includes(type)"
        @click="openBrief(type, content)"
        class="border-0 badge ml-0 mr-5 mb-2 d-inline-flex justify-content-center align-items-center"
        :class="getClass(content)">
        <ImpactIconTemplate :type="type"></ImpactIconTemplate>
        {{ content.display_name }}
    </button>
    <span v-else
        class="border-0 badge ml-0 mr-5 mb-2 d-inline-flex justify-content-center align-items-center"
        :class="getClass(content)">
        <ImpactIconTemplate :type="type"></ImpactIconTemplate>
        {{ content.display_name }}
    </span>
</template>

<style lang="scss" scoped>
.badge {
    border-radius: 4px;
    color: white;
    min-height: initial;
}

.badge-black {
    background-color: black;
}
</style>