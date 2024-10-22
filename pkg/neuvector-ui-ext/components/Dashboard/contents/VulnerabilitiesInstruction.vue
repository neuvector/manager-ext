<template>
  <div v-if="autoScan">
    {{ t('dashboard.heading.guideline.VUL_EXPLOIT') }}
  </div>
  <div v-else>
    {{ t('dashboard.heading.guideline.AUTO_SCAN_OFF') }}
    <div class="toggle-switch mt-10">
      <ToggleSwitch @update:value="toggleAutoScan" :value="autoScan" :offLabel="'Auto Scan'" />
    </div>
  </div>
</template>
<script>
import { ToggleSwitch } from '@components/Form/ToggleSwitch';
import { updateAutoScan } from '../../../plugins/dashboard-class';

export default {
  fetch() {

  },
  props: {
    autoScan: Boolean,
    token: String,
    ns: String,
    currentClusterId: String
  },
  components: {
    ToggleSwitch,
  },
  computed: {
  },
  methods: {
    async toggleAutoScan(autoScan) {
      try {
        let autoScanRes = await updateAutoScan(autoScan);
        this.autoScan = autoScan;
      } catch(error) {
        console.error(error);
      }
    }
  }
}
 </script>
 
 <style lang="scss">
 .toggle-switch {
  justify-content: center;
  display: grid;
  text-align: center;
 }
 </style>../../../plugins/dashboard-class