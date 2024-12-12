<script setup >
import Footer from './Footer.vue';
import Header from './Header.vue';
</script>

<template>
    <Header></Header>
    <router-view></router-view>
    <Footer></Footer>
</template>

<style scoped>
/* General Styles */
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f9f9f9;
}

a {
  text-decoration: none;
  color: inherit;
}

h1, h2, h3 {
  margin: 0;
  padding: 0;
}



/* Hero Section */
.hero {
  background-image: url("hero-bg.jpg");
  background-size: cover;
  text-align: center;
  padding: 100px 20px;
}

.hero h1 {
  font-size: 3em;
  margin-bottom: 20px;
}

.hero p {
  font-size: 1.2em;
  margin-bottom: 20px;
}

/* Features Section */
.features {
  padding: 50px 20px;
  text-align: center;
}

.feature-cards {
  display: flex;
  gap: 30px;
  justify-content: center;
}

.feature-card {
  background-color: #fff;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 30%;
}

.feature-card h3 {
  margin-bottom: 10px;
}

/* Pricing Section */
.pricing {
  background-color: #f1f1f1;
  padding: 50px 20px;
  text-align: center;
}

.pricing-plans {
  display: flex;
  gap: 30px;
  justify-content: center;
}

.pricing-plan {
  background-color: #fff;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 30%;
}


</style>