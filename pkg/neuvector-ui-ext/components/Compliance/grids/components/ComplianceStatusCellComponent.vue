<template>
  <span
    v-if="labelCode"
    class="h-75 border-0 badge d-inline-flex align-items-center justify-content-center"
    :class="'badge-' + labelCode">
    {{ statusText }}
  </span>
</template>

<script>
import { NV_MAP } from '../../../../types';

export default {
  data() {
    return  {
      labelCode: null,
      statusText: null
    }
  },
  beforeMount() {
    let status = this.params.data.level;
    this.labelCode = NV_MAP.colourMap[status];
    this.statusText = this.t(`enum.${status.toUpperCase()}`);
  },
  methods: {
    refresh(params) {
      this.params = params
    }
  }
};
</script>

<style lang="scss" scoped>
@import '../../../../styles/neuvector.scss';
.badge {
  border-radius: 4px;
}
</style>