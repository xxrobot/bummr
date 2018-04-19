// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

const GeoFire = require('geofire');


//stole
const map = require('lodash').map;
const filter = require('lodash').filter;
const sortBy = require('lodash').sortBy;
const last = require('lodash').last;

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

// Tutorial
// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
exports.addMessage = functions.https.onRequest((req, res) => {
  // Grab the text parameter.
  const original = req.query.text;
  // Push the new message into the Realtime Database using the Firebase Admin SDK.
  return admin.database().ref('/messages').push({original: original}).then((snapshot) => {
    // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
    return res.redirect(303, snapshot.ref.toString());
  });
});


//Trigger approach (no extra work on Android)
exports.saveUser = functions.database.ref('/geo/{pushId}')
  .onWrite((snapshot, context) => {
    // const user = event.data.val();
    // var latitude = event.data.child('l/0');
    // var longitude = event.data.child('l/1');
    console.log('pushid', context.params.pushId);
    console.log("snapshot", snapshot);
  
  			var profilesRef = admin.database().ref('/geo/' + context.params.pushId);
            profilesRef.on('value', function(snapshot) {
                console.log('data', snapshot.val());



// var latitude = 36.1000213;
// var longitude = -115.2065723;
var distance = 100;


                const geofireRef = admin.database().ref('geo');
				geoFire = new GeoFire(geofireRef);
				const geoQuery = geoFire.query({
                // center: [Number(latitude), Number(longitude)],
                center: snapshot.val().l,
                radius: Number(distance)
                });

                const usersIDs = {};

                const keyListener = geoQuery.on('key_entered', (key, location, distance) => {
                    usersIDs[key] = {distance: distance,
                                        uid: key};
                                        console.log('lookup profile', key);

                });
                geoQuery.on('ready', () => {
                keyListener.cancel();
                geoQuery.cancel();
                // timers.gotIdsFromGeofire = moment() - startTime;
                // resolve(usersIDs)
                // console.log(usersIDs);
                  return admin.database().ref('/users/' + context.params.pushId + '/grid').set(usersIDs).then((snapshot) => {
				  	//pushes profiles that match into the users grid
				  });
                });

            });



				
  });
