// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import firebase from 'firebase'
require("firebase/messaging");

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


Vue.filter('nl2br', function(str, is_xhtml){
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
    str = str.replace(/</g,'&lt;');
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
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
  geofireDB: "geo"
};

firebase.initializeApp(config);

//Start Firebase Cloud Messaging (PUSH)
const messaging = firebase.messaging();
messaging.usePublicVapidKey("BJpS3NXt3uIJOiV-fIGoDdn0ctp-sZVK0iE7oCB1YMKSne3niuYMW_SdC7lmSq8yMmIybDOJMYp2l2B_fbyNHT0");
messaging.requestPermission().then(function() {
  console.log('Notification permission granted.');
  // TODO(developer): Retrieve an Instance ID token for use with FCM.
  // ...
}).catch(function(err) {
  console.log('Unable to get permission to notify.', err);
});

// Get Instance ID token. Initially this makes a network call, once retrieved
  // subsequent calls to getToken will return from cache.
messaging.getToken().then(function(currentToken) {
  if (currentToken) {
    sendTokenToServer(currentToken);
    updateUIForPushEnabled(currentToken);
  } else {
    // Show permission request.
    console.log('No Instance ID token available. Request permission to generate one.');
    // Show permission UI.
    updateUIForPushPermissionRequired();
    setTokenSentToServer(false);
  }
}).catch(function(err) {
  console.log('An error occurred while retrieving token. ', err);
  showToken('Error retrieving Instance ID token. ', err);
  setTokenSentToServer(false);
});

// Callback fired if Instance ID token is updated.
messaging.onTokenRefresh(function() {
  messaging.getToken().then(function(refreshedToken) {
    console.log('Token refreshed.');
    // Indicate that the new Instance ID token has not yet been sent to the
    // app server.
    setTokenSentToServer(false);
    // Send Instance ID token to app server.
    sendTokenToServer(refreshedToken);
    // ...
  }).catch(function(err) {
    console.log('Unable to retrieve refreshed token ', err);
    showToken('Unable to retrieve refreshed token ', err);
  });
});



//end PUSHq


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