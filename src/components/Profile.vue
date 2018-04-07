<template>
    <div class="container">
        <div v-if="mode=='view'" class="profile-large" :style="'background-image: url('+ profile.imagePrimary +');'">
            <h4>{{ profile.displayName }} <span class="age">{{profile.age}}</span></h4>
            <p class="description">{{ profile.description }}</p>
            <router-link :to="'../chat/'+id">Chat</router-link>

            
            <small>{{profile.imagePrimary}}</small>
            <button v-if="isMyProfile" @click="mode='edit'">Edit</button>
        </div>
        <div v-if="mode=='edit'">
            <!-- show My profile -->
            <!--             My Profile
            <h5>Display Name: {{ profile.displayName }} <span>{{profile.age}}</span></h5>
            <p>Description: {{ profile.description }}</p>
            <small>UID: {{currentUser.uid}}</small>
            <hr> Edit Profile -->
            <form v-if="mode=='edit'">
                <div>
                    <label>Display Name</label>
                    <input type="text" v-model="profile.displayName">
                </div>
                <div>
                    <label>Age</label>
                    <input type="number" v-model="profile.age">
                </div>
                <div>
                    <label>Description</label>
                    <textarea v-model="profile.description">{{ profile.description }}</textarea>
                </div>
                <button @click="writeUserData">Save</button>
            </form>
            <button v-if="isMyProfile" @click="mode='upload'">Upload Photo</button>
        </div>
        <form v-if="mode=='upload'">
            <input type="file" @change="onFileChange">
            <button>Upload Image</button>
        </form>
    </div>
</template>
<script>
export default {
    name: 'Profile',
    props: ['id'],
    data() {
        return {
            mode: 'view',
            displayName: '',
            description: '',
            age: '',
            imageUrl: '',
            profile: {
                displayName: '',
                description: '',
                age: '',
                imageUrl: '',
                imagePrimary: ''
            },
            imagePrimary: ''
        }
    },
    computed: {
        isMyProfile: function() {
            if (this.id == this.currentUser.uid || !this.id) {
                return true;
            } else {
                return false;
            }
        },
        currentUser: function() {
            return firebase.auth().currentUser
        },
        targetProfile: function(){
          return this.id;
        }
    },
    methods: {
        writeUserData: function() {
            firebase.database().ref('profiles/' + this.currentUser.uid).set({
                displayName: this.profile.displayName || '',
                description: this.profile.description || '',
                age: this.profile.age || '',
                imagePrimary: this.profile.imageUrl || this.profile.imagePrimary
            });
            console.log('Wrote user data for ', this.currentUser.uid);
            this.mode = 'view';
        },
        getProfileInfo: function(profileToLookup) {
            console.log('looking up profile: ', profileToLookup);
            var profilesRef = firebase.database().ref('profiles/' + profileToLookup + '');
            self = this;
            profilesRef.on('value', function(snapshot) {
                console.log('looking up profile: ', snapshot.val());
                self.profile = Object.assign(self.profile, snapshot.val());
            });
        },
        getProfileImages: function(uid) {
            debugger;
            var storageRef = firebase.storage().ref().child('profiles/' + uid + '/' + file.name);

        },
        onFileChange(e) {
            var files = e.target.files || e.dataTransfer.files;
            if (!files.length)
                return;
            this.uploadImage(files[0]);
        },
        uploadImage: function(file) {
            // File or Blob named mountains.jpg
            var file = file;
            var storageRef = firebase.storage().ref();
            self = this;

            // Create the file metadata
            var metadata = {
                contentType: 'image/jpeg'
            };

            // Upload file and metadata to the object 'images/mountains.jpg'
            var uploadTask = storageRef.child('profiles/' + this.currentUser.uid + '/' + file.name).put(file, metadata);

            // Listen for state changes, errors, and completion of the upload.
            uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
                function(snapshot) {
                    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload is ' + progress + '% done');
                    switch (snapshot.state) {
                        case firebase.storage.TaskState.PAUSED: // or 'paused'
                            console.log('Upload is paused');
                            break;
                        case firebase.storage.TaskState.RUNNING: // or 'running'
                            console.log('Upload is running');
                            break;
                    }
                },
                function(error) {

                    // A full list of error codes is available at
                    // https://firebase.google.com/docs/storage/web/handle-errors
                    switch (error.code) {
                        case 'storage/unauthorized':
                            // User doesn't have permission to access the object
                            break;

                        case 'storage/canceled':
                            // User canceled the upload
                            break;

                        case 'storage/unknown':
                            // Unknown error occurred, inspect error.serverResponse
                            break;
                    }
                },
                function() {
                    // Upload completed successfully, now we can get the download URL
                    var downloadURL = uploadTask.snapshot.downloadURL;
                    self.profile.imageUrl = downloadURL;
                    self.writeUserData();
                    this.mode = 'view';
                });
        }
    },
    mounted: function() {
        this.$nextTick(function() {
            // Code that will run only after the
            // entire view has been rendered
            if (this.id) {
                this.getProfileInfo(this.id);
            } else {
                this.getProfileInfo(this.currentUser.uid);
            }

        })
    },
    watch: {
        $route(to, from) {
            if (this.id) {
                this.getProfileInfo(this.id);
            } else {
                this.getProfileInfo(this.currentUser.uid);
            }
        }
    }
}
</script>
<style scoped>
label {
    display: block;
}

.profile-large {
    background-size: cover;
    background-position: center center;
    text-align: left;
}

.container,
.profile-large {
    height: 100%;
}

.profile-large {
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 1rem;
}

.age{font-weight: normal;}
.description{
  margin-top: 1rem;
}
</style>
