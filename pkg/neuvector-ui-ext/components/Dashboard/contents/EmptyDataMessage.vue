<script>
export default {
  components: {

  },
  props: {
    icon: String,
    color: String,
    message: String
  }
};
</script>

<template>
    <div style="height: 200px; display: table; margin-bottom: 20px;">
      <div style="display: table-cell; vertical-align: middle; text-align: center;">
        <i :class="icon" :style="'font-size: 40px;' + 'color:' + color"></i>
        <div :style="{'color': color}">{{ message }}</div>
      </div>
    </div>
</template>

