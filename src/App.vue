<template>
    <div id="app">
        <router-view></router-view>
        <nav>
        <router-link to="/Hello">Home</router-link>
        <router-link to="/profile">My Profile</router-link>
      </nav>
    </div>
</template>
<script>
export default {
    name: 'app'
}

window.store = {};
</script>
<style>
html {
    font-size: 16px;
}

body {
    margin: 0;
    padding: 0;
}

#app {
    font-family: sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
}

nav {
    background: #ccc;
    padding: 1rem;
}


nav a, nav a:visited{
  text-decoration: none;
  color: #000;
}
</style>
