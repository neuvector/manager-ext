<template>
  <carousel :items-to-show="1">
    <slide style="display: block;">
      <h5><strong>{{ instructionList[0].title }}</strong></h5>
      <p :style="rancherTheme === 'light' ? 'color: #888' : 'color: #fff' + ' text-align: left;'">
        <ScoreInstruction :score="score" />
      </p>
    </slide>


    <slide style="display: block">
      <h5><strong>{{ instructionList[1].title }}</strong></h5>
      <p :style="rancherTheme === 'light' ? 'color: #888' : 'color: #fff' + ' text-align: left;'">{{ instructionList[1].content }}</p>
    </slide>

    <slide style="display: block">
      <h5><strong>{{ instructionList[2].title }}</strong></h5>
      <p :style="rancherTheme === 'light' ? 'color: #888' : 'color: #fff' + ' text-align: left;'">{{ instructionList[2].content }}</p>
    </slide>


    <slide style="display: block">
      <h5><strong>{{ instructionList[3].title }}</strong></h5>
      <p :style="rancherTheme === 'light' ? 'color: #888' : 'color: #fff' + ' text-align: left;'">
        <VulnerabilitiesInstruction :token="token" :ns="ns" :autoScan="autoScan" :currentClusterId="currentClusterId"/>
      </p>
    </slide>

    <template #addons>
      <pagination />
    </template>
  </carousel>
</template>

<script>
import ScoreInstruction from './ScoreInstruction';
import VulnerabilitiesInstruction from './VulnerabilitiesInstruction';
import 'vue3-carousel/dist/carousel.css'
import { Carousel, Slide, Pagination } from 'vue3-carousel'

export default {
  name: 'App',
  components: {
    Carousel,
    Slide,
    Pagination,
    ScoreInstruction,
    VulnerabilitiesInstruction,
  },
  data () {
    return {
      options: {
        currentPage: 0,
        loop: true
      },
    }
  },
  computed: {
    instructionList: function() {
      return [
        {
          type: 'score',
          title: this.t('dashboard.heading.guideline.titles.MAIN_SCORE_NOT_GOOD'),
        },
        {
          type: 'services',
          title: this.t('dashboard.heading.guideline.titles.SERVICE_EXPOSURE'),
          content: this.t('dashboard.heading.guideline.SERVICE_EXPOSURE')
        },
        {
          type: 'exposures',
          title: this.t('dashboard.heading.guideline.titles.INGRESS_EGRESS'),
          content: this.t('dashboard.heading.guideline.INGRESS_EGRESS')
        },
        {
          type: 'vulnerabilities',
          title: this.t('dashboard.heading.guideline.titles.AUTO_SCAN_OFF')
        }
      ];
    }
  },
  props: {
    rancherTheme: String,
    ns: String,
    token: String,
    score: Number,
    autoScan: Boolean,
    currentClusterId: String
  },
}
</script>