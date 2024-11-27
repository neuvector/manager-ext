<script>
    import Tab from '@shell/components/Tabbed/Tab';
    import Tabbed from '@shell/components/Tabbed';
    import ImpactTemplateButton from '../../common/buttons/ImpactTemplateButton.vue';
    import ImpactModal from '../../common/dialogs/ImpactModal.vue';
    import RegulationItem from '../buttons/RegulationItem.vue';
    import RegulationModal from '../dialogs/RegulationModal.vue';
    import { getNodeBriefById, getContainerBriefById } from '../../../plugins/vulnerabilities-class';
    
    export default {
        props: {
            selectedCompliance: Object,
            isLightTheme: Boolean
        },
        data() {
            return {
                showImpactModal: false,
                showRegulationModal: false,
                brief: {
                    type: null,
                    content: null
                },
                regulationBrief: {
                    type: null,
                    content: null,
                    name: null
                },
            }
        },
        components: {
            Tab,
            Tabbed,
            ImpactTemplateButton,
            ImpactModal,
            RegulationItem,
            RegulationModal
        },
        methods: {
            openBrief({ type, id }) {
                if (type === 'node') {
                    getNodeBriefById(id).then(res => {
                        this.brief = {
                            type: 'node',
                            content: res.data.host
                        };
                        this.showImpactModal = true;
                    }).catch(err => {

                    });
                } else {
                    getContainerBriefById(id).then(res => {
                        let container = res.data.workload;
                        if (
                            container.labels &&
                            container.labels['io.kubernetes.container.name'] === 'POD'
                        ) {
                            container.images = [];
                        } else {
                            container.images = [container.image];
                        }
                        if (container.children && container.children.length > 0) {
                            container.children.forEach(child => {
                                container.images.push(child.image);
                            });
                        }
                        this.brief = {
                            type: 'workload',
                            content: container
                        };
                        this.showImpactModal = true;
                    }).catch(err => {

                    });
                }
            },
            openRegulation({ type, content, name }) {
                console.log('open reg')
                this.regulationBrief = {
                    type: type,
                    content: content,
                    name: name
                };
                this.showRegulationModal = true;
            },
            closeImpact() {
                this.showImpactModal = false;
            },
            closeRegulation() {
                this.showRegulationModal = false;
            }
        }
    }
</script>

<template>
    <Tabbed>
        <Tab name="remediation" :label="t('cis.REMEDIATION')" :weight="97">
            <div style="max-height: 215px; overflow: auto;">
                <div class="text-dark">{{ selectedCompliance.description }}</div>
                <br />
                <span class="text-muted">{{ selectedCompliance.remediation }}</span>
            </div>
        </Tab>
        <Tab name="impact" :label="t('cis.report.gridHeader.IMPACT')" :weight="96">
            <div style="max-height: 215px; overflow: auto;">
                <template v-if="selectedCompliance.nodes?.length > 0">
                    <label class="d-block pb-1">{{ t('cis.report.data.NODES') }}</label>
                    <div class="pl-5">
                        <ImpactTemplateButton v-for="node in selectedCompliance.nodes" :key="node.id" :content="node" type="node" @openBrief="openBrief"></ImpactTemplateButton>
                    </div>
                </template>
                <template v-if="selectedCompliance.filteredImages?.length > 0">
                    <label class="d-block pb-1">{{ t('cis.report.data.IMAGES') }}</label>
                    <div class="pl-5">
                        <ImpactTemplateButton v-for="image in selectedCompliance.filteredImages" :key="image.id" :content="image" type="image"></ImpactTemplateButton>
                    </div>
                </template>
                <template v-if="selectedCompliance.filteredWorkloads?.length > 0">
                    <label class="d-block pb-1">{{ t('cis.report.data.CONTAINERS') }}</label>
                    <div class="pl-5">
                        <ImpactTemplateButton v-for="workload in selectedCompliance.filteredWorkloads" :key="workload.id" :content="workload" type="workload" @openBrief="openBrief"></ImpactTemplateButton>
                    </div>
                </template>
                <template v-if="selectedCompliance.platforms?.length > 0">
                    <label class="d-block pb-1">{{ t('cis.report.data.PLATFORMS') }}</label>
                    <div class="pl-5">
                        <ImpactTemplateButton v-for="platform in selectedCompliance.platforms" :key="platform.id" :content="platform" type="platform"></ImpactTemplateButton>
                    </div>
                </template>
            </div>
            <ImpactModal v-if="showImpactModal" :type="brief.type" :content="brief.content" :isLightTheme="isLightTheme" @close="closeImpact"></ImpactModal>
        </Tab>
        <Tab name="regulations" :label="t('cis.profile.REGULATIONS')" :weight="95">
            <div style="max-height: 215px; overflow: auto;" v-if="selectedCompliance.tags">
                <RegulationItem 
                    v-for="(value, key) in selectedCompliance.tags" 
                    :type="key" :content="value" 
                    :name="selectedCompliance.name"
                    @openRegulation="openRegulation"    
                :key="key"></RegulationItem>
            </div>
            <RegulationModal 
                v-if="showRegulationModal"
                :type="regulationBrief.type" 
                :content="regulationBrief.content" 
                :name="regulationBrief.name" 
                :isLightTheme="isLightTheme"
                @close="closeRegulation"
            ></RegulationModal>
        </Tab>
    </Tabbed>
</template>

<style lang="scss" scoped>
@import '../../../styles/neuvector.scss';
.badge {
    border-radius: 4px;
}
</style>