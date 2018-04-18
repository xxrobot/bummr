<template>
    <div class="grid">
        <div v-for="profile in profilesOrdered" :key="profile.key" class="profile" :class="[profile.uid == currentUser.uid ?  'me' : '']" :style="'background-image: url('+ profile.imagePrimary +');'">
            <router-link :to="'/profile/'+profile.uid">
                {{profile.distance | kmToDistance}}
                <div class="displayname">
                    <span v-if="isaFavorite(profile.uid)" class="fas fa-star active"></span> {{profile.displayName}}
                </div>
            </router-link>
        </div>
    </div>
</template>
<script>
export default {
    name: 'Grid',
    props: ['data'],
    data: function() {
        return {
            profiles: {},
            latlon: '',
            store: store,
            dudes: {}
        }
    },
    computed: {
        profilesOrdered: function() {
            if (this.$parent.data) {
                return _.orderBy(this.dudesInfo, ['distance'])
            }
        },
        currentUser: function() {
            return firebase.auth().currentUser
        },
        dudesInfo: function() {
            var vm = this;
            var keys = Object.keys(this.data.grid);
            var promises = keys.map(function(key) {
                return firebase.database().ref("/profiles/").child(key).once("value");
            });
            Promise.all(promises).then(function(snapshots) {
                snapshots.forEach(function(snapshot) {
                    var mergedData = Object.assign({}, vm.data.grid[snapshot.key], snapshot.val());
                    Vue.set(vm.dudes, snapshot.key, mergedData);
                    // debugger;
                    console.log('got data for', snapshot.key + ": ", snapshot.val());
                });
            });

            return this.dudes;
        },
    },
    methods: {
        isaFavorite: function(id) {
            return this.data.favorites.hasOwnProperty(id);
        },
        getLocation: function() {
            if (typeof navigator !== "undefined" && typeof navigator.geolocation !== "undefined") {
                console.log("Asking user to get their location");
                navigator.geolocation.getCurrentPosition(position => {
                        this.geolocationCallback(position)
                    },
                    error => {
                        this.errorHandler(error)
                    });
            } else {
                console.log("Your browser does not support the HTML5 Geolocation API, so this demo will not work.")
            }
        },
        geolocationCallback: function(location) {
            var latitude = location.coords.latitude;
            var longitude = location.coords.longitude;
            console.log("Retrieved user's location: [" + latitude + ", " + longitude + "]");

            store.location = [latitude, longitude];

            // var username = "wesley";
            var username = firebase.auth().currentUser.uid;

            geoFire.set(username, [latitude, longitude]).then(function() {
                console.log("Current user " + username + "'s location has been added to GeoFire");
                // When the user disconnects from Firebase (e.g. closes the app, exits the browser),
                // remove their GeoFire entry
                // firebaseRef.child(username).onDisconnect().remove();

                console.log("Added handler to remove user " + username + " from GeoFire when you leave this page.");
            }).catch(function(error) {
                console.log("Error adding user " + username + "'s location to GeoFire");
                //sometimes this error when it's removing at setting at the same time
            });
        },
        errorHandler: function(error) {
            if (error.code == 1) {
                console.log("Error: PERMISSION_DENIED: User denied access to their location");
            } else if (error.code === 2) {
                console.log("Error: POSITION_UNAVAILABLE: Network is down or positioning satellites cannot be reached");
            } else if (error.code === 3) {
                console.log("Error: TIMEOUT: Calculating the user's location too took long");
            } else {
                console.log("Unexpected error code")
            }
        },
        getProfileInfo: function(profileToLookup) {
            // console.log('looking up profile: ', profileToLookup);
            // var profilesRef = firebase.database().ref('profiles/' + profileToLookup + '');
            // self = this;
            // profilesRef.on('value', function(snapshot) {
            //     if (!snapshot.val()) {
            //         console.log('null data for ', self.profiles[snapshot.ref.key]);
            //         return;
            //     }
            //     console.log('data', snapshot.val());
            //     // self.profiles[snapshot.ref.key] = Object.assign({}, self.profiles[snapshot.ref.key], snapshot.val())
            //     var mergedData = Object.assign({}, self.profiles[snapshot.ref.key], snapshot.val());
            //     //debugger;
            //     Vue.set(self.profiles, snapshot.ref.key, mergedData)
            // });
            var vm = this;
            var keys = Object.keys(this.data.grid);
            var promises = keys.map(function(key) {
                return firebase.database().ref("/profiles/").child(key).once("value");
            });
            Promise.all(promises).then(function(snapshots) {
                snapshots.forEach(function(snapshot) {
                    var mergedData = Object.assign({}, vm.data.grid[snapshot.key], snapshot.val());
                    Vue.set(vm.dudes, snapshot.key, {
                        yup: 'asdf'
                    });
                    console.log('got data for', snapshot.key + ": ", snapshot.val());
                });
            });

        },
    },
    created: function() {
        console.log('mounted');
        this.getLocation();
    }
}
</script>
<style>
.grid {
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
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
    padding: .25rem .5rem;
    margin: .025rem;
    box-sizing: border-box;
    animation: fadein 2s;
}

.profile.me {
    border: 2px solid #ffba3b;
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
    text-shadow: 0px 1px 1px rgba(0, 0, 0, 0.75);
    text-decoration: none;
    font-weight: bold;
    font-size: .75rem;
    align-self: flex-start;
}

@keyframes fadein {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}
</style>
