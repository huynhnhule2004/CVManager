<script setup>
import HelloWorld from './components/HelloWorld.vue'
import Sidebar from './layout/Sidebar.vue'
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.js";
import Header from './layout/Header.vue';
</script>

<template>
  <div class="wrapper">
    <Sidebar></Sidebar>
    <Header></Header>
  </div>

  <!-- <HelloWorld/> -->
</template>

<style scoped></style>
