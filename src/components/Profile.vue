<template ref="hello">
  <div class="hello">

    <div v-if="id" :style="'background-image: url('+ profile.imagePrimary +');'">
    {{ id }}'s profile
        <h5>Display Name: {{ profile.displayName }} <span>{{profile.age}}</span></h5>
        <p>Description: {{ profile.description }}</p>
        {{profile.imagePrimary}}
    </div>

    <div v-else>
      <!-- show My profile -->
        My Profile
        <h5>Display Name: {{ profile.displayName }} <span>{{age}}</span></h5>
        <p>Description: {{ description }}</p>
        <small>UID: {{currentUser.uid}}</small>

        <hr>
        Edit Profile
        <form>
        <div>
          <label>Display Name</label>
          <input type="text" v-model="displayName">
        </div>

        <div>
          <label>Age</label>
          <input type="number" v-model="age">
        </div>

        <div>
          <label>Display Name</label>
          <textarea v-model="description">{{ description }}</textarea>
        </div>
        

        <button @click="writeUserData">Save</button>
      </form>

        <form>
          <input type="file" @change="onFileChange">
          <button>Upload Image</button>
        </form>

    </div>
  </div>
</template>

<script>
export default {
  name: 'Profile',
  props: ['id'],
  data () {
    return {
      displayName: 'Disp',
      description: 'Hey 🌔',
      age: 0,
      imageUrl: '',
      profile: {},
      currentUser: firebase.auth().currentUser,
      imagePrimary: ''
    }
  },
  methods: {
      writeUserData: function () {
        firebase.database().ref('profiles/' + this.currentUser.uid).set({
          displayName: this.displayName,
          description: this.description,
          age: this.age,
          imagePrimary: this.imageUrl
        });
        console.log('Wrote user data', this.imageUrl);
      },
      getProfileInfo: function(profileToLookup){
        console.log('looking up profile: ', profileToLookup);
        var profilesRef = firebase.database().ref('profiles/' + profileToLookup + '');
        self = this;
        profilesRef.on('value', function(snapshot) {
          console.log('looking up profile: ', snapshot.val());
          self.profile = snapshot.val();
        });
      },
      getProfileImages: function(uid){
        debugger;
          var storageRef = firebase.storage().ref().child('profiles/' + uid + '/' +  file.name);

      },
      onFileChange(e) {
        var files = e.target.files || e.dataTransfer.files;
        if (!files.length)
          return;
        this.uploadImage(files[0]);
      },
      uploadImage: function(file){
        // File or Blob named mountains.jpg
          var file = file;
          var storageRef = firebase.storage().ref();
          self = this;

          // Create the file metadata
          var metadata = {
            contentType: 'image/jpeg'
          };

          // Upload file and metadata to the object 'images/mountains.jpg'
          var uploadTask = storageRef.child('profiles/' + this.currentUser.uid + '/' +  file.name).put(file, metadata);

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
            }, function(error) {

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
          }, function() {
            // Upload completed successfully, now we can get the download URL
            var downloadURL = uploadTask.snapshot.downloadURL;
            self.imageUrl = downloadURL;
            self.writeUserData();
          });
      }
  },
  mounted: function (){
    this.$nextTick(function () {
      // Code that will run only after the
      // entire view has been rendered
      if(this.id){
         this.getProfileInfo(this.id);
      }else{
        this.getProfileInfo(this.currentUser.uid);
      }
     
    })
  }
}
</script>

<style>
label{
  display: block;
}
</style>
