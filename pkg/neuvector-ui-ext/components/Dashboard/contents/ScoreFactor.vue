<script>
export default {
  components: {

  },

  mixins: [],

  async fetch() {
    
  },

  props: {
    riskFactor: {
        title: String,
        factors: [
            {
                category: String,
                amount: Number,
                type: String,
                comment: String,
            }
        ],
        factorComment: [String],
        subScore: Number,
        isFactorError: Boolean
    }
  },

  computed: {
    
  },

  methods: {
  
  }
};
</script>

<template>
  <div class="padding-left-0 padding-right-0 risk-section">
  <div class="risk-section-titles">
    <div class="text-left title">
      {{riskFactor.title}}
    </div>
    <div class="subtitle">
    </div>
  </div>
  <div class="risk-section-details" v-if="!riskFactor.isFactorError">
    <div class="pull-left">
      <div class="secure-rank-wrap">
        <div class="secure-rank"></div>
        <div class="empty" :style="riskFactor.subScore"></div>
      </div>
    </div>
    <table class="margin-top-s pull-left">
      <tr v-for="factor in riskFactor.factors" :key="factor">
        <td>{{factor.category}}</td>
        <td style="text-align: left;">
          {{factor.amount}}
        </td>
        <td style="text-align: left;" v-if="factor.comment">
          (&nbsp;<i class="icon-anchor" ></i>{{factor.type}}:&nbsp;{{factor.comment}}&nbsp;)
        </td>
      </tr>
      <tr class="pl-sm" style="font-size: 10px;" v-if="riskFactor.factorComment">
        <strong class="text-muted">{{riskFactor.factorComment[0]}}</strong><br/>
        <strong class="text-muted">{{riskFactor.factorComment[1]}}</strong>
      </tr>
    </table>
  </div>
  <div v-else class="server-error-sm risk-section-details">
    <div>
      <em class="eos-icons text-danger">dangerous</em>
    </div>
    <div>
      <span class="text-label">
        {{riskFactor.factorErrorMessage}}
      </span>
    </div>
  </div>
</div>
</template>

<style lang="scss" scoped>

.risk-section-titles {
  .title {
    font-size: 13px;
    // color: #45505c;
    cursor: default;
    font-weight: bold;
    line-height: 1.11;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .subtitle {
    opacity: 0.8;
    font-size: 8px;
    line-height: 1.43;
    text-align: center;
    color: #45505c;
    height: 10px;
  }
}

.risk-section-details {
  padding-bottom: 10px;
  height: 120px;
  //@media only screen and (max-width: 500px) {
  //  height: calc(35px + 3vw);
  //}
  &.divider {
    border-right: #d6e1ea 1px solid;
  }
  &.instruction {
    padding: 10px 0;
    font-size: 12px;
    > div {
      height: 160px;
    }
    text-align: left;
    color: #45505c;

    // Move down the indicators
    .carousel-indicators {
      bottom: 0;
      margin-bottom: 5px;
    }

    .carousel-indicators li {
      width: 6px;
      height: 6px;
      border: 1px solid #7e8da2;
      border-radius: 6px;
      margin-left: 6px;
      margin-right: 6px;
      padding: 0;
    }

    .carousel-indicators .active {
      width: 8px;
      height: 8px;
      background-color: #7e8da2;
    }

    .instruction-content-wrap {
      display: table;
      width: 100%;
      height: 130px;
      padding-bottom: 15px;
    }

    .instruction-content {
      display: table-cell;
      vertical-align: middle;
      text-align: left !important;
      cursor: default;
      font-size: 12px;
      line-height: 14px;
    }

    .instruction-content-center {
      display: table-cell;
      vertical-align: middle;
      text-align: center;
      cursor: default;
      font-size: 12px;
      line-height: 14px;
    }
    .carousel-control {
      display: none;
    }
  }
  & > table {
    opacity: 0.8;
    font-size: 12px;
    line-height: 1.85;
    text-align: left;
    // color: #45505c;
    td,
    th {
      padding: 0px 4px !important;
    }
  }
  & > div {
    padding-right: 10px;
    opacity: 0.8;
    font-size: 12px;
    line-height: 1.85;
    text-align: left;
    // color: #45505c;
  }
  & > ul {
    list-style-type: none;
  }
  & > ul > li div {
    &:nth-child(0) {
      padding-right: 10px;
      opacity: 0.8;
      font-size: calc(4.5px + 0.5vw);
      line-height: 1.85;
      text-align: left;
    //   color: #45505c;
    }
    &:nth-child(1) {
      opacity: 0.8;
      font-size: calc(4.5px + 0.5vw);
      font-weight: bold;
      line-height: 1.85;
      text-align: right;
      color: #45505c;
    }
    &:nth-child(2) {
      opacity: 0.8;
      font-size: calc(4.5px + 0.5vw);
      font-weight: bold;
      line-height: 1.85;
      text-align: right;
    //   color: #45505c;
    }
  }
}

.secure-rank-wrap {
  height: 90px;
  width: 10px;
  border: #d6e1ea solid 1px;
  margin: 10px auto;
  position: relative;
  .secure-rank {
    height: 100%;
    width: 100%;
    background-image: linear-gradient(red 40%, orange, green);
  }
  .empty {
    &.mask {
      height: 0%;
    }
    &.mask1 {
      height: 20%;
    }
    &.mask2 {
      height: 70%;
    }
    width: 100%;
    position: absolute;
    top: 0;
    background-color: #e9eef2;
    z-index: 998;
  }
}

</style>
