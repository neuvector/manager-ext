<script>
import DashboardView from '../../../../components/Dashboard/DashboardView';
import InstallView from '../../../../components/Dashboard/InstallView';
import { SERVICE, SCHEMA } from '@shell/config/types';
import { RANCHER_CONST, NV_CONST } from '../../../../types/neuvector';

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
    rancherTheme: function() {
      const decodedCookie = decodeURIComponent(document.cookie);
      const cookieArray = decodedCookie.split(';');
      let rTheme = cookieArray.find(item => item.includes('R_THEME'));
      let rPcs = cookieArray.find(item => item.includes('R_PCS'));
      let res = rTheme && rTheme.split('=')[1] !== RANCHER_CONST.THEME.AUTO ?
        rTheme.split('=')[1] : 
        (rPcs ? rPcs.split('=')[1] : RANCHER_CONST.THEME.LIGHT);
      sessionStorage.setItem(RANCHER_CONST.R_THEME, res);
      console.log(
        'Rancher theme',
        res
      );
      return res;
    },
  }
};
</script>

<template>
  <div>
    <InstallView v-if="!hasSchema" :ui-service="uiService" />
    <DashboardView v-else :ns="NV_CONST.NV_POD_NAMESPACE" :rancherTheme="rancherTheme"/>
  </div>
</template>
