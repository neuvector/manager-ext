<script>
import { arrayToCsv } from '../../../utils/common';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import { NV_CONST } from '../../../types/neuvector';
export default {
  components: {

  },

  props: {
    egress: Array,
    ingress: Array
  },

  methods: {
    buttonAction: function() {
        let ingressReport = this.getExposureReportData(this.ingress, NV_CONST.INGRESS);
        let egressReport = this.getExposureReportData(this.egress, NV_CONST.EGRESS);

        let exposureReport = ingressReport.concat(egressReport);

        let csv = arrayToCsv(exposureReport);
        let blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        let filename = `exposure_report_${dayjs().format('YYYYMMDDHHmmss')}.csv`;

        saveAs(blob, filename);
    },
    getExposureReportData: function(exposureList, direction) {
        let exposureReport = [];
        exposureList
        .forEach((exposure) => {
        exposure.entries?.forEach(entry => {
            exposureReport.push(
            {
                Direction: direction,
                Service: exposure.service,
                Pod: exposure.pod_name,
                'Critical Vuls': exposure.critical,
                'High Vuls': exposure.high,
                'Medium Vuls': exposure.medium,
                'Policy Mode': exposure.policy_mode,
                'External Location': entry.country_name !== '-' ? entry.country_name : '',
                'External IP': entry.ip,
                'External Host': entry.fqdn,
                Port: entry.port,
                Bytes: entry.bytes,
                Applications: entry.application,
                Sessions: entry.sessions,
                Action: entry.policy_action
            }
            );
        })
        });
        return exposureReport;
    }
  }
};
</script>

<template>
    <button
        class="btn role-primary sm-btn"
        @click="buttonAction"
    >
        <i class="icon-download"></i>
    </button>
</template>

<style>
    .sm-btn {
        min-height: 20px;
    }
</style>