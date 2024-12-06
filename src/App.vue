<script setup>
import { ref, onMounted } from 'vue';
import { database } from './firebase'; // Firebase config file
import { ref as dbRef, set, onValue } from 'firebase/database';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import CV1 from './components/pages/CV1.vue';
import Index from './layout/Index.vue';
import Test from './components/pages/Test.vue';


</script>

<template>
  <CV1></CV1>
   <!-- <Index></Index> -->
    <!-- <Test></Test> -->
</template>



