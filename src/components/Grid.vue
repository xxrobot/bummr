<template>
    <div class="grid">
        <div v-for="profile in profilesOrdered" :key="profile.key" class="profile" :class="[profile.uid == currentUser.uid ?  'me' : '']" :style="'background-image: url('+ profile.imagePrimary +');'">
            <router-link :to="'/profile/'+profile.uid">
                {{profile.distance | kmToFeet}}
                <div class="displayname">{{profile.displayName}}</div>
            </router-link>
        </div>
    </div>
</template>
<script>
function log(val) {
    console.log(val);
}

var geoQueryGuyWatcher;

export default {
    name: 'Grid',
    data: function() {
        return {
            profiles: {},
            latlon: '',
            store: store,
        }
    },
    computed: {
        profilesOrdered: function() {
            return _.orderBy(this.profiles, ['distance'])
        },
        currentUser: function() {
            return firebase.auth().currentUser
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

            store.location = [latitude, longitude];
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
        updateCenter: function(center, radius) {
            if (!center) {
                debugger;
            }
            console.log('updating center to: ', center);
            geoQuery.updateCriteria({
                center: center,
                radius: 100
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
                if (!snapshot.val()) {
                    console.log('null data for ', self.profiles[snapshot.ref.key]);
                    return;
                }
                console.log('data', snapshot.val());
                // self.profiles[snapshot.ref.key] = Object.assign({}, self.profiles[snapshot.ref.key], snapshot.val())
                var mergedData = Object.assign({}, self.profiles[snapshot.ref.key], snapshot.val());
                //debugger;
                Vue.set(self.profiles, snapshot.ref.key, mergedData)
            });
        },
        init: function() {
            var center = store.location || [0, 0];
            var self = this;

            geoQuery = geoFire.query({
                center: center,
                radius: 100.5
            });


            geoQueryGuyWatcher = geoQuery.on("key_entered", (key, location, distance) => {
                console.log("Bicycle shop " + key + " found at " + location + " (" + distance + " km away)");
                Vue.set(self.profiles, key, {
                    distance: distance,
                    uid: key
                });
                self.getProfileInfo(key);
            });
            console.log('set a watcher');


            geoQuery.on("key_exited", function(key, location, distance) {
                console.log(key + " exited query to " + location + " (" + distance + " km from center)");
                Vue.delete(self.profiles, key);
            });



        }
    },
    created: function() {
        console.log('mounted');

        this.init();
        this.getLocation();


    },
    destroyed: function() {
        // geoQueryGuyWatcher.cancel();
        // debugger;
        console.log('destorying', geoQueryGuyWatcher);
        geoQueryGuyWatcher.cancel();

    },
    filters: {
        kmToFeet: function(km) {
            if (!km) return '0 ft';
            return Math.round(km * 3280.8) + 'ft';
        }
    }
}
</script>
<style>
.grid {
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
}

.profile {
    display: block;
    height: calc(33.33332vw - 0.25rem);
    width: calc(33.33332vw - 0.25rem);
    overflow: hidden;
    background-color: #111;
    background-size: cover;
    background-repeat: no-repeat;
    border-radius: .25rem;
    padding: .25rem .5rem ;
    margin: .125rem;
    box-sizing: border-box;
}

.me {
    border: 2px solid yellow;
    order: -1;
}

.profile a {
    display: block;
    color: #fff;
    text-decoration: none;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.displayname {
    text-shadow: 1px solid #000;
    text-decoration: none;
    font-weight: bold;
    font-size: .75rem;
    align-self: flex-start;
}
</style>
