<template>
    <div id="grid">
        <router-link :to="'/profile/'+profile.key" v-for="profile in orderBy(profiles, 'distance')" class="profile" :style="'background-image: url('+ profile.imagePrimary +');'">
            {{profile.displayName}} {{profile.key}} | {{profile.distance}} km
        </router-link>
    </div>
</template>
<script>
function log(val) {
    console.log(val);
}
//import firebase from 'firebase'


export default {
    name: 'Grid',
    data: function() {
        return {
            profiles: [],
            latlon: ''
        }
    },
    methods: {

        getLocation: function() {
            if (typeof navigator !== "undefined" && typeof navigator.geolocation !== "undefined") {
                log("Asking user to get their location");
                navigator.geolocation.getCurrentPosition(position => {
                        this.geolocationCallback(position)
                    },
                    error => {
                        this.errorHandler(error)
                    });
            } else {
                log("Your browser does not support the HTML5 Geolocation API, so this demo will not work.")
            }
        },
        geolocationCallback: function(location) {
            var latitude = location.coords.latitude;
            var longitude = location.coords.longitude;
            log("Retrieved user's location: [" + latitude + ", " + longitude + "]");
            this.updateCenter([latitude, longitude]);

            // var username = "wesley";
            var username = firebase.auth().currentUser.uid;

            geoFire.set(username, [latitude, longitude]).then(function() {
                log("Current user " + username + "'s location has been added to GeoFire");
                // When the user disconnects from Firebase (e.g. closes the app, exits the browser),
                // remove their GeoFire entry
                // firebaseRef.child(username).onDisconnect().remove();

                log("Added handler to remove user " + username + " from GeoFire when you leave this page.");
            }).catch(function(error) {
                log("Error adding user " + username + "'s location to GeoFire");
                //sometimes this error when it's removing at setting at the same time
            });
        },
        updateCenter: function(centerLatLon, radius) {
            log('updating center to: ', centerLatLon);
            var vm = this;

            //centerLatLon is an array [10.38, 3.41]
            // radius is in km
            var geoQuery = geoFire.query({
                center: centerLatLon,
                radius: 100.5
            });

            function addProfile(profile) {
                //profiles.push(profile);
                debugger;
            }

            //These fire for every guy in the radius
            var self = this;
            var hello = geoQuery.on("key_entered", (key, location, distance, vm) => {
                console.log("Bicycle shop " + key + " found at " + location + " (" + distance + " km away)");
                self.profiles.push({
                    key: key,
                    distance: distance
                });
                var profileToLookup = key;
                self.getProfileInfo(profileToLookup);
            });

            geoQuery.on("key_exited", function(key, location, distance) {
                console.log(key + " exited query to " + location + " (" + distance + " km from center)");
            });

        },
        errorHandler: function(error) {
            if (error.code == 1) {
                log("Error: PERMISSION_DENIED: User denied access to their location");
            } else if (error.code === 2) {
                log("Error: POSITION_UNAVAILABLE: Network is down or positioning satellites cannot be reached");
            } else if (error.code === 3) {
                log("Error: TIMEOUT: Calculating the user's location too took long");
            } else {
                log("Unexpected error code")
            }
        },
        getProfileInfo: function(profileToLookup) {
            console.log('looking up profile: ', profileToLookup);
            var profilesRef = firebase.database().ref('profiles/' + profileToLookup + '');
            self = this;
            profilesRef.on('value', function(snapshot) {
                // Find where in array the key is
                var index = self.profiles.map(function(e) { return e.key; }).indexOf(profileToLookup);
                self.profiles[index] = {...snapshot.val()};
            });
        }
    },
    mounted: function() {
        this.$nextTick(function() {
            // Code that will run only after the
            // entire view has been rendered
            this.getLocation();
        })
    }
}
</script>
<style scoped>
.profile {
    display: inline-block;
    height: 100px;
    width: 100px;
    overflow: hidden;
    background-color: #111;
    background-size: cover;
    background-repeat: no-repeat;
    border-radius: 2px;
    color: #fff;
    text-shadow: 1px solid #000;
}
</style>
