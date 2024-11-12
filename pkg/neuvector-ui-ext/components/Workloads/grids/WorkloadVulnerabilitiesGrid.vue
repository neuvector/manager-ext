<script>
    import { cacheRancherWorkloadMap } from '../../../utils/workloads';
    import { Banner } from '@components/Banner';
    import VulnerabilitiesGrid from '../../common/grids/VulnerabilitiesGrid';
    import { getWorkloadVulnerabilities } from '../../../plugins/workloads-class';

    export default {
        components: {
            Banner,
            VulnerabilitiesGrid,
        },
        props: {
            workload: Object,
            isLightTheme: Boolean,
        },
        async fetch(){
            try {
                console.log('Get workload vulnerabilities...')
                let nvContainerId = '';
                if (this.workload) {
                    //Workload info from props
                } else {
                    //Workload info from URL
                    let rancherWorkloadMap = this.$store.getters['neuvector/rancherWorkloadMap'];
                    let pathSections = location.pathname.split('/');
                    if (!rancherWorkloadMap || rancherWorkloadMap.size === 0) {
                        let rancherClassifiedworkloads = this.$store.getters['cluster/all'](pathSections[pathSections.length - 3]);
                        await cacheRancherWorkloadMap(rancherClassifiedworkloads, this.$store);
                        rancherWorkloadMap = this.$store.getters['neuvector/rancherWorkloadMap'];
                    }
                    let rancherWorkloadName = `${pathSections[pathSections.length - 2]}/${pathSections[pathSections.length - 1]}`;
                    console.log(rancherWorkloadMap, rancherWorkloadName);
                    if (rancherWorkloadMap.has(rancherWorkloadName)) {
                        console.log(rancherWorkloadName);
                        nvContainerId = rancherWorkloadMap.get(rancherWorkloadName);
                    }
                    this.rancherWorkloadName = rancherWorkloadName
                }
                const scannedWorkloadMap = this.$store.getters['neuvector/scannedWorkloadMap'];
                if (scannedWorkloadMap.has(nvContainerId)) {
                    this.vulnerabilities = scannedWorkloadMap.get(nvContainerId);
                } else {
                    let scannedWorkloadsRes = await getWorkloadVulnerabilities(nvContainerId);
                    this.vulnerabilities = scannedWorkloadsRes.data.report.vulnerabilities;
                    this.$store.dispatch('neuvector/updateScannedWorkloadMap', {workloadID: nvContainerId, scannedResult: this.vulnerabilities});
                }
            } catch (error) {
                console.error(error);
            }
        },
        data() {
          return {
            vulnerabilities: null,
            rancherWorkloadName: '',
          };
        },
    };
</script>

<template>
    <div>
        <VulnerabilitiesGrid v-if="vulnerabilities && vulnerabilities.length > 0" :vulnerabilities="vulnerabilities" :csvFileName="rancherWorkloadName"></VulnerabilitiesGrid>
        <div v-else>
          <Banner
            class="type-banner mb-20 mt-0"
            color="warning"
            :label="t('general.NO_ROWS')"
          />
        </div>
    </div> 
</template>