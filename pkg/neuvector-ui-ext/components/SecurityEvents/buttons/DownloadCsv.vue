<script>
    import { nvVariables } from '../../../types/neuvector';
    import { arrayToCsv } from '../../../utils/common';
    import { getCsvData } from '../../../utils/security-events';
    import { saveAs } from 'file-saver';
    import dayjs from 'dayjs';
    export default {
        components: {
        },
        props: {
        },
        data() {
            return {
                metadata: {
                    title: this.t('securityEvent.pdf.REPORT_TITLE'),
                    header: {
                        id: this.t('securityEvent.pdf.ID'),
                        title: this.t('securityEvent.pdf.TITLE'),
                        severity: this.t('securityEvent.pdf.SEVERITY'),
                        location: this.t('securityEvent.pdf.LOCATION'),
                        details: this.t('securityEvent.pdf.DETAILS'),
                        action: this.t('securityEvent.pdf.ACTION'),
                        datetime: this.t('securityEvent.pdf.DATETIME'),
                    },
                    items: {
                        source: this.t('securityEvent.SOURCE'),
                        destination: this.t('securityEvent.DESTINATION'),
                        host: this.t('securityEvent.HOST'),
                        container: this.t('securityEvent.CONTAINER'),
                        applications: this.t('securityEvent.APPLICATIONS'),
                        count: this.t('threat.gridHeader.COUNT'),
                        description: this.t('securityEvent.DESCRIPTION'),
                        serverPort: this.t('violation.gridHeader.SERVER_PORT'),
                        protocol: this.t('violation.gridHeader.PROTOCOL'),
                        serverImage: this.t(
                        'violation.gridHeader.SERVER_IMAGE'
                        ),
                        clusterName: this.t(
                        'violation.gridHeader.CLUSTER_NAME'
                        ),
                        group: this.t('securityEvent.GROUP'),
                        procName: this.t('securityEvent.PROC_NAME'),
                        procPath: this.t('securityEvent.PROC_PATH'),
                        procCmd: this.t('securityEvent.PROC_CMD'),
                        cmd: this.t('securityEvent.CMD'),
                        procEffectedUid: this.t('securityEvent.PROC_EFF_UID'),
                        procEffectedUser: this.t('securityEvent.PROC_EFF_USER'),
                        localIp: this.t('securityEvent.LOCAL_IP'),
                        remoteIp: this.t('securityEvent.REMOTE_IP'),
                        localPort: this.t('securityEvent.LOCAL_PORT'),
                        remotePort: this.t('securityEvent.REMOTE_PORT'),
                        ipProto: this.t('securityEvent.IP_PROTO'),
                        fileNames: this.t('securityEvent.FILE_NAME'),
                        filePath: this.t('securityEvent.FILE_PATH'),
                    },
                    others: {
                        tocText: this.t('general.REPORT_TOC'),
                        headerText: this.t('partner.securityEvent.pdf.header'),
                        footerText: this.t('securityEvent.pdf.FOOTER'),
                        subTitleDetails: this.t('securityEvent.pdf.DETAILS'),
                        reportSummary: this.t('enum.SUMMARY'),
                        logoName: this.t('partner.general.LOGO_NAME'),
                        byEventType: this.t('securityEvent.pdf.TYPEDIST')
                    },
                }
            };
        },
        methods: {
            exportCSV: function() {
                console.log("raw data:", nvVariables.securityEventsServiceData.displayedSecurityEvents);
                let csvData = getCsvData(
                    nvVariables.securityEventsServiceData.displayedSecurityEvents,
                    this.metadata
                );
                let csv = arrayToCsv(JSON.parse(JSON.stringify(csvData)));
                let blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
                saveAs(blob, `Security_events_${dayjs(new Date()).format('YYYYMMDDHHmmss')}.csv`);
            }
        }
    };
</script>

<template>
    <div>
        <button
            mat-button
            class="btn role-secondary"
            aria-label="Export secutiry events reports CSV"
            type="button"
            @click="exportCSV()">
            CSV
        </button>
    </div>
</template>