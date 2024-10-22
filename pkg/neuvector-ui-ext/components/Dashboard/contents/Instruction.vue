<script>
export default {
  components: {

  },

  props: {
    instructionId: String,
    instructions: {
        textLines: [String]
    }
  },

  methods: {
    showInstruction: function(event) {
      const elDropDown = document.getElementById(this.instructionId);
      const elInstructionText = document.getElementById('wrap-' + this.instructionId).previousElementSibling;
      if (elInstructionText)
        elDropDown.style.left = (0 - elInstructionText.offsetWidth) + 'px';
    }
  }
};
</script>

<template>
  <div :id="'wrap-' + instructionId" class="dropdown">
    <span class="icon"><i class="icon-info" style="font-size: 15px;" @mouseover="showInstruction($event)"></i></span>
    
    <div :id="instructionId" class="dropdown-content">
      <div v-for="instruction in instructions.textLines" :key="instruction">{{ instruction }}</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
 /* Style the container */
 .dropdown {
    position: relative;
    display: inline-block;
}

/* Style the icon (change as needed) */
.icon {
    font-size: 24px;
    cursor: pointer;
    float: right;
}

/* Style the dropdown content */
.dropdown-content {
    display: none;
    position: absolute;
    bottom: 20px;
    background-color: #CFD8DC;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    z-index: 100;
    padding: 12px 16px;
    width: calc(50vw - 180px);
}

/* Show the dropdown content on hover */
.icon:hover ~.dropdown-content {
    display: block;
}

/* Style the dropdown links (change as needed) */
.dropdown-content a {
    color: black;
    padding: 12px 16px;
    text-decoration: none;
    display: block;
}

/* Add a background color to the dropdown links on hover */
.dropdown-content a:hover {
    background-color: #CFD8DC;
}
</style>
