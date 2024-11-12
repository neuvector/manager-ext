<script>
    import { getHostVulnerabilities } from '../../../plugins/nodes-class';
    import { cacheNodesInfo } from '../../../utils/nodes';
    import { Banner } from '@components/Banner';
    import VulnerabilitiesGrid from '../../common/grids/VulnerabilitiesGrid';

    export default {
        components: {
            Banner,
            VulnerabilitiesGrid,
        },
        props: {
            host: Object,
            isLightTheme: Boolean,
        },
        async fetch(){
            try {
                console.log('Get host vulnerabilities...', this.host)
                let hostId = '';
                if (this.host) {
                    hostId = this.host.nvId
                    this.rancherHostName = this.host.id;
                } else {
                    let nvHosts = this.$store.getters['neuvector/hosts'];
                    if (!nvHosts || nvHosts.length === 0) {
                        await cacheNodesInfo(this.$store);
                        nvHosts = this.$store.getters['neuvector/hosts'];
                    }
                    let pathSections = location.pathname.split('/');
                    let rancherHostName = pathSections[pathSections.length - 1];
                    if (nvHosts.has(rancherHostName)) {
                        hostId = nvHosts.get(rancherHostName).id;
                    }
                    this.rancherHostName = rancherHostName
                }
                const scannedNodeMap = this.$store.getters['neuvector/scannedNodeMap'];
                if (scannedNodeMap.has(hostId)) {
                    this.vulnerabilities = scannedNodeMap.get(hostId);
                } else {
                    let vulRes = await getHostVulnerabilities(hostId);
                    this.vulnerabilities = vulRes.data.report.vulnerabilities;
                    this.$store.dispatch('neuvector/updateScannedNodeMap', { nodeID: hostId, scannedResult: this.vulnerabilities });
                }
            } catch (error) {
                console.error(error);
            }
        },
        data() {
          return {
            vulnerabilities: null,
            rancherHostName: '',
          };
        },
    };
</script>

<template>
    <div>
        <VulnerabilitiesGrid v-if="vulnerabilities && vulnerabilities.length > 0" :vulnerabilities="vulnerabilities" :csvFileName="rancherHostName"></VulnerabilitiesGrid>
        <div v-else>
          <Banner
            class="type-banner mb-20 mt-0"
            color="warning"
            :label="t('general.NO_ROWS')"
          />
        </div>
    </div> 
</template>