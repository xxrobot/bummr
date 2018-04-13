// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import firebase from 'firebase'
import Vue2Filters from 'vue2-filters'
import lodash from 'lodash'

window.Vue = Vue;

Vue.use(Vue2Filters);
Vue.prototype.$_ = lodash;

Vue.filter('kmToDistance', function(km) {
      if (!km) return '0 ft';

      if (km <= 1.60934) {
          return Math.round(km * 3280.8) + 'ft';
      } else {
          return Math.round(km * 0.621371) + 'mi';
      }

  });

Vue.config.productionTip = false

let app;
let config = {
  apiKey: "AIzaSyCQ-SqiNye672aEYHuVZSMp_mm1dwuvjks",
  authDomain: "boner-69.firebaseapp.com",
  databaseURL: "https://boner-69.firebaseio.com",
  projectId: "boner-69",
  storageBucket: "boner-69.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SEND_ID",
  geofireDB: "geo",
  profileDB: "geo",
};

firebase.initializeApp(config);

// Create a Firebase reference where GeoFire will store its information
window.geofireRef = firebase.database().ref(config.geofireDB);

// Create a GeoFire index
// TODO: remove from window in prod
window.geoFire = new GeoFire(geofireRef);
window.firebase = firebase;
window.geoQuery ='';

firebase.auth().onAuthStateChanged(function(user) {
 // debugger;
  if (!app) {
    /* eslint-disable no-new */
    app = new Vue({
      el: '#app',
      template: '<App/>',
      components: { App },
      router
    })
  }
});


//Event Bus
export const EventBus = new Vue();