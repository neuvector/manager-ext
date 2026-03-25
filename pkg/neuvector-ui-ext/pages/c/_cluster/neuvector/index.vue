<script>
import DashboardView from '../../../../components/Dashboard/DashboardView';
import InstallView from '../../../../components/Dashboard/InstallView';
import { SERVICE, SCHEMA } from '@shell/config/types';
import { NV_CONST } from '../../../../types/neuvector';

export default {
  name: 'Dashboard',

  components: { DashboardView, InstallView },

  async fetch() {
    if ( this.$store.getters['cluster/canList'](SERVICE) ) {
      this.allServices = await this.$store.dispatch('cluster/findAll', { type: SERVICE }, { root: true });
    }
  },

  data() {
    return {
      allServices: null,
      NV_CONST: NV_CONST,
    }
  },

  computed: {
    uiService() {
      if ( Array.isArray(this.allServices) && this.allServices.length ) {
        return this.allServices.find(svc => svc?.id?.includes(NV_CONST.NV_SERVICE));
      }

      return null;
    },
    hasSchema() {
      return this.$store.getters['cluster/schemaFor'](NV_CONST.NV_SCHEMA);
    },
  }
};
</script>

<template>
  <div>
    <InstallView v-if="!hasSchema" :ui-service="uiService" />
    <DashboardView v-else :ns="NV_CONST.NV_POD_NAMESPACE" />
  </div>
</template>
