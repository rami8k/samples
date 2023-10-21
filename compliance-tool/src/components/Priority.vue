<template>
  <span class="circle" :style="{ 'background-color' : color }" />
</template>

<script>
  export default {
    props: {
      color: {type: String, required: false, default: ''}
    },
  }
</script>

<style>
.circle {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  display: inline-block;
  vertical-align: text-bottom;
  margin-right: 5px;
}
</style>