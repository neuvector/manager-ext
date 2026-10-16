<script>
    import { getEnforcer } from '../../../../plugins/security-events-class';
    import { nvVariables } from '../../../../types/neuvector';
    import { getSSOUrl } from '../../../../utils/common';
    export default {
        components: {
        },
        props: {
            secEvent: Object
        },
        methods: {
            goToNvGroups: (groupName) => {
                window.open(`${getSSOUrl('#/group')}?group=${groupName}`, '_blank');
            },
            showEnforcerDetails: async function(event, enforcerId, enforcerName) {
                try {
                    let enforcerRes = await getEnforcer(enforcerId);
                    console.log(enforcerRes)
                    nvVariables.enforcer.value = enforcerRes.data.enforcer;
                    nvVariables.showEnforcerInfoModal.value = true;
                } catch(error) {
                    console.error(error);
                }
            }
        },
    };
</script>

<template>
    <div>
        <div v-if="secEvent.details.message.content" style="border-bottom: #bbb 1px dashed;">
            <span>{{secEvent.details.message.content}}</span>
        </div>
        <div name="what" style="border-bottom: #bbb 1px dashed;">
            <span v-if="secEvent.details.message.procParentName">
                <span class="text-bold">{{ t('securityEvent.PROC_P_NAME') }}:</span>&nbsp;
                <span >
                {{secEvent.details.message.procParentName}}
                </span>&nbsp;&nbsp;
            </span>
            <span v-if="secEvent.details.message.procParentPath">
                <span class="text-bold">{{ t('securityEvent.PROC_P_PATH') }}:</span>&nbsp;
                <span >
                {{secEvent.details.message.procParentPath}}
                </span>&nbsp;&nbsp;
            </span>
            <span v-if="secEvent.details.message.procName">
                <span class="text-bold">{{ t('securityEvent.PROC_NAME') }}:</span>&nbsp;
                <span >
                {{secEvent.details.message.procName}}
                </span>&nbsp;&nbsp;
            </span>
            <span v-if="secEvent.details.message.procPath">
                <span class="text-bold">{{ t('securityEvent.PROC_PATH') }}:</span>&nbsp;
                <span >
                {{secEvent.details.message.procPath}}
                </span>&nbsp;&nbsp;
            </span>
            <span v-if="secEvent.details.message.procCmd">
                <span v-if="secEvent.name.toLowerCase().indexOf('process') >= 0 || secEvent.name.toLowerCase().indexOf('escalation') >= 0 || secEvent.name.toLowerCase().indexOf('detected') >= 0"
                class="text-bold">
                {{ t('securityEvent.PROC_CMD') }}:
                </span>&nbsp;
                <span v-if="secEvent.name.toLowerCase().indexOf('process') < 0 && secEvent.name.toLowerCase().indexOf('escalation') < 0 && secEvent.name.toLowerCase().indexOf('detected') < 0"
                class="text-bold">
                {{ t('securityEvent.CMD') }}:
                </span>&nbsp;
                <span >
                {{secEvent.details.message.procCmd}}
                </span>&nbsp;&nbsp;
            </span>
            <span v-if="secEvent.details.message.procEffectiveUid">
                <span class="text-bold">{{ t('securityEvent.PROC_EFF_UID') }}:</span>&nbsp;
                <span >
                {{secEvent.details.message.procEffectiveUid}}
                </span>&nbsp;&nbsp;
            </span>
            <span v-if="secEvent.details.message.procEffectiveUser">
                <span class="text-bold">{{ t('securityEvent.PROC_EFF_USER') }}:</span>&nbsp;
                <span >
                {{secEvent.details.message.procEffectiveUser}}
                </span>&nbsp;&nbsp;
            </span>
            <span v-if="secEvent.details.message.localIP">
                <span class="text-bold">{{ t('securityEvent.LOCAL_IP') }}:</span>&nbsp;
                <span >
                {{secEvent.details.message.localIP}}
                </span>&nbsp;&nbsp;
            </span>
            <span v-if="secEvent.details.message.remoteIP">
                <span class="text-bold">{{ t('securityEvent.REMOTE_IP') }}:</span>&nbsp;
                <span >
                {{secEvent.details.message.remoteIP}}
                </span>&nbsp;&nbsp;
            </span>
            <span v-if="secEvent.details.message.localPort">
                <span class="text-bold">{{ t('securityEvent.LOCAL_PORT') }}:</span>&nbsp;
                <span >
                {{secEvent.details.message.localPort}}
                </span>&nbsp;&nbsp;
            </span>
            <span v-if="secEvent.details.message.remotePort">
                <span class="text-bold">{{ t('securityEvent.REMOTE_PORT') }}:</span>&nbsp;
                <span >
                {{secEvent.details.message.remotePort}}
                </span>&nbsp;&nbsp;
            </span>
            <span v-if="secEvent.details.message.ipProto">
                <span class="text-bold">{{ t('securityEvent.IP_PROTO') }}:</span>&nbsp;
                <span >
                {{secEvent.details.message.ipProto}}
                </span>&nbsp;&nbsp;
            </span>
            <span v-if="secEvent.details.message.filePath">
                <span class="text-bold">{{ t('securityEvent.FILE_PATH') }}:</span>&nbsp;
                <span >
                {{secEvent.details.message.filePath}}
                </span>&nbsp;&nbsp;
            </span>
            <span v-if="secEvent.details.message.fileNames">
                <span class="text-bold">{{ t('securityEvent.FILE_NAME') }}:</span>&nbsp;
                <span  v-if="secEvent.details.message.fileNames.length > 100">
                {{secEvent.details.message.fileNames.substring(0, 101)}}...
                <span class="link" ng-click="showAllFiles(secEvent.details.message.fileNames, $event)">
                    ({{ t('general.VIEW_ALL') }})
                </span>
                </span>&nbsp;&nbsp;
                <span  v-if="secEvent.details.message.fileNames.length <= 100">
                {{secEvent.details.message.fileNames}}
                </span>&nbsp;&nbsp;
            </span>
            <span id="count" v-if="secEvent.details.message.count>1">
                <span class="text-bold">{{ t('securityEvent.COUNT') }}:</span>&nbsp;
                <span >
                {{secEvent.details.message.count}}
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
            <span v-if="secEvent.details.message.group">
                <span class="text-bold">{{ t('securityEvent.GROUP') }}:</span>&nbsp;

                <!-- <span class="text-muted link hand" ui-sref="app.group({groupName: secEvent.details.message.group, from: 'process'})">   -->
                <a data-role="button" class="text-muted link hand" target="_blank"  @click="goToNvGroups(secEvent.details.message.group)">
                {{secEvent.details.message.group}}
                </a>&nbsp;&nbsp;
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