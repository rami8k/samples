<template>
  <div class="admin-container">
    <router-link :to="{ name: 'companies'}" class="action-button">Companies</router-link>
    <router-link :to="{ name: 'sections'}" class="action-button">Sections</router-link>
    <router-link :to="{ name: 'areas'}" class="action-button">Areas</router-link>
    <router-link :to="{ name: 'regulations'}" class="action-button">Regulations</router-link>
    <router-link :to="{ name: 'controlinplace'}" class="action-button">Control In Place</router-link>
    <router-link :to="{ name: 'controlstatus'}" class="action-button">Conrol Status</router-link>
    <router-link :to="{ name: 'risks'}" class="action-button">Risks</router-link>
  </div>
</template>

<script>
export default {
}
</script>

<style>

.admin-container {
  min-height: 600px;
  text-align: left;
}

.admin-container .action-button{
  margin: 10px;
  display: block;
  width: 200px;
}

</style>