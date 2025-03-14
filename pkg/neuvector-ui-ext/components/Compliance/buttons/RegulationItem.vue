<script>
    export default {
        props: {
            type: String,
            content: Array,
            name: String,
        },
        components: {
        },
        methods: {
            openRegulation(type, content, name) {
                this.$emit('openRegulation', {
                    type: type, 
                    content: content,
                    name: name
                });
            },
            getComplianceTagClass(type) {
                switch (type) {
                    case 'DISA':
                        return 'badge-dark';
                    case 'GDPR':
                        return '';
                    case 'HIPAA':
                        return '';
                    case 'NIST':
                        return 'badge-dark';
                    case 'PCI':
                        return '';
                    case 'PCIv4':
                        return '';
                    default:
                        return '';
                }
            },
            getComplianceTagStyle(type) {
                switch (type) {
                    case 'DISA':
                        return '';
                    case 'GDPR':
                        return 'background-color: #ff9800; color: white';
                    case 'HIPAA':
                        return 'background-color: #4e39c1; color: white';
                    case 'NIST':
                        return '';
                    case 'PCI':
                        return 'background-color: #009688; color: white';
                    case 'PCIv4':
                        return 'background-color: #009688; color: white';
                    default:
                        return '';
                }
            }
        }
    }
</script>

<template>
    <button
        v-if="content.length > 0"
        @click="openRegulation(type, content, name)"
        :class="getComplianceTagClass(type)"
        :style="'min-height: auto; ' + getComplianceTagStyle(type)"
        class="border-0 badge ml-0 mr-5 mb-2 d-inline-flex justify-content-center align-items-center">
        ⋮⋮&nbsp;&nbsp;{{ type }}
    </button>
    <span 
        v-else 
        :class="getComplianceTagClass(type)"
        :style="getComplianceTagStyle(type)"
        class="border-0 badge ml-0 mr-5 mb-2 d-inline-flex justify-content-center align-items-center">
        ⋮⋮&nbsp;&nbsp;{{ type }}
    </span>
</template>

<style lang="scss" scoped>
.badge {
    border-radius: 4px;
}
</style>