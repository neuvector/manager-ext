<script>
    import { getEnforcer } from '../../../../plugins/security-events-class';
    import { nvVariables } from '../../../../types/neuvector';
    export default {
        components: {
        },
        props: {
            secEvent: Object
        },
        methods: {
          showEnforcerDetails: async function(event, enforcerId, enforcerName) {
            try {
                let enforcerRes = await getEnforcer(enforcerId);
                nvVariables.enforcer.value = enforcerRes.data.enforcer;
                nvVariables.showEnforcerInfoModal.value = true;
            } catch(error) {
                console.error(error);
            }
          }
        }
    };
</script>

<template>
    <div>
      <div name="what" style="border-bottom: #bbb 1px dashed;">
        <span v-if="secEvent.applications">
          <span class="text-bold">{{ t('threat.gridHeader.APPLICATION') }}:</span>&nbsp;
          <span >
            {{secEvent.applications}}
          </span>&nbsp;&nbsp;
        </span>
        <span v-if="secEvent.details.message.content">
          <span class="text-bold">{{ t('securityEvent.DESC') }}:</span>&nbsp;
          <span >
            {{secEvent.details.message.content}}
          </span>&nbsp;&nbsp;
        </span>
        <span v-if="secEvent.details.count">
          <span class="text-bold">{{ t('threat.gridHeader.COUNT') }}:</span>&nbsp;
          <span >
            {{secEvent.details.count}}
          </span>&nbsp;&nbsp;
        </span>
      </div>
      <div name="where">
        <span v-if="secEvent.details.clusterName">
          <span class="text-bold">{{ t('violation.gridHeader.CLUSTER_NAME') }}:</span>&nbsp;
          <span >
            {{secEvent.details.clusterName}}
          </span>&nbsp;&nbsp;
        </span>
        <div v-if="secEvent.enforcerName && secEvent.hostName">
          <span class="text-bold">{{ t('securityEvent.REPORTED_BY') }}:</span>&nbsp;
          <span >
          <span class="link" @click="showEnforcerDetails($event, secEvent.enforcerId, secEvent.enforcerName)">{{secEvent.enforcerName}}</span> on <span class="link" ng-click="showHostDetails($event, secEvent.hostId, secEvent.host_name)">{{secEvent.hostName}}</span>
          </span>&nbsp;&nbsp;
        </div>
      </div>
    </div>
</template>