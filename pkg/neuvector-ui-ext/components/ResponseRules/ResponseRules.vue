<script>
  import Loading from '@shell/components/Loading';
  import { SERVICE } from '@shell/config/types';
  import { nvVariables, NV_CONST } from '../../types/neuvector';
  import { refreshAuth } from '../../plugins/neuvector-class';
  import { destructConditions } from '../../utils/response-rules';
  import _axios from 'axios';
  import Refresh from '../common/buttons/Refresh';
  import { getResponseRulesData, getAutoCompleteData } from '../../plugins/response-rules-class';
  import ResponseRulesAgGrid from './grids/ResponseRulesAgGrid';
  import AddRuleToTopBtn from './buttons/AddRuleToTopBtn';
  import { mapGetters } from 'vuex';
  import QuickFilter from '../../components/common/inputs/QuickFilter';
  import Error from '../common/error/Error';

  export default {
    name: "ResponseRules",
    components: {
      Loading,
      Refresh,
      ResponseRulesAgGrid,
      AddRuleToTopBtn,
      QuickFilter,
      Error,
    },
    data() {
      return {
        errorRes: null,
        autoCompleteData: {
          groups: [],
          conditionOptions: [],
        },
        webhooks: [],
        NV_CONST: NV_CONST,
        filterText: '',
      };
    },
    created() {
      this.$store.dispatch('neuvector/cacheResponseRules', null);
    },
    async fetch() {
      if ( this.$store.getters['cluster/canList'](SERVICE) ) {
          this.allServices = await this.$store.dispatch('cluster/findAll', { type: SERVICE }, { root: true });
          if ( Array.isArray(this.allServices) && this.allServices.length ) {
              nvVariables.ns = this.allServices.find(svc => svc?.id?.includes(NV_CONST.NV_SERVICE)).metadata.namespace
          }
      }
      this.currentCluster = this.$store.getters['currentCluster'];
      nvVariables.currentCluster = this.currentCluster.id;
      await this.loadData();
    },
    computed: {
      ...mapGetters({
        responseRules: 'neuvector/responseRules',
      }),
    },
    methods: {
      loadData: async function() {
        try {
          this.$store.dispatch('neuvector/cacheResponseRules', null);
          let authRes = await refreshAuth();
          nvVariables.user = authRes.data.token;
          let responseRulesRes = await getResponseRulesData();
          this.$store.dispatch('neuvector/cacheResponseRules', destructConditions(responseRulesRes.data.rules));
          await getAutoCompleteData().then(_axios.spread((groupsRes, optionsRes) => {
            this.autoCompleteData.groups = groupsRes.data.map(group => {
              return group.name;
            })
            .filter(
              groupName => groupName.toLowerCase() !== NV_CONST.EXTERNAL
            )
            this.autoCompleteData.conditionOptions = optionsRes.data.response_rule_options;
            this.webhooks = optionsRes.data.webhooks;
          }));
          this.responseRuleErr = false;
        } catch(error) {
          console.error(error);
          this.errorRes = error;
        }
      },
      setQuickFilter(filterText) {
        this.filterText = filterText;
      },
    },
  }
</script>

<template>
  <Loading v-if="$fetchState.pending" />
  <div v-else-if="errorRes" class="container">
    <Error :error="errorRes"></Error>
  </div>
  <div v-else>
    <div id="response-rules" class="padding-top-0">
      <header style="margin-bottom: 10px;" id="response-rules-title">
          <div class="title">
              <h1 class="m-0">{{ t('sidebar.nav.RESPONSE_POLICY') }}</h1>
          </div>
      </header>
    </div>
    <div>
      <AddRuleToTopBtn
        v-if="autoCompleteData.conditionOptions"
        :autoCompleteData="autoCompleteData"
        :webhooks="webhooks"
        :source="NV_CONST.NAV_SOURCE.SELF"
        :refreshFn="loadData"
        class="pull-left mx-2">
      </AddRuleToTopBtn>
      <Refresh class="pull-right" :reloadData="loadData"></Refresh>
      <QuickFilter class="pull-right w-auto mr-10"  @quickFilter="setQuickFilter"></QuickFilter>
    </div>
    <ResponseRulesAgGrid
      v-if="autoCompleteData.conditionOptions && responseRules?.length > 0"
      :responseRules="responseRules"
      :autoCompleteData="autoCompleteData"
      :webhooks="webhooks"
      :filterText="filterText"
      :source="NV_CONST.NAV_SOURCE.SELF"
      :refreshFn="loadData"
      class="mt-2" >
    </ResponseRulesAgGrid>
    <div v-else-if="responseRules?.length === 0" class="text-center mt-5">
      {{ t('general.NO_ROWS') }}
    </div>
  </div>
</template>

<style scoped>

</style>