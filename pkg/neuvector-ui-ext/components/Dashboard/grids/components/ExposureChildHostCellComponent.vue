<!-- CustomCell.vue -->
<template>
  <div>
    <FlagIpFqdn
      :ip="params.data.ip"
      :countryCode="params.data.country_code"
      :countryName="params.data.country_name"
      :fqdn="params.data.fqdn || ''"
      :isTooltipVisible="false"
    >
    </FlagIpFqdn>
  </div>
</template>

<script>


import FlagIpFqdn from '../../../common/contents/FlagIpFqdn';
export default {
  components: {
    FlagIpFqdn,
  },
  methods: {
    refresh(params) {
      this.params = params
    }
  }
};
</script>

<style scoped>
/* Add your custom styles if needed */
</style>