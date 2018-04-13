<template>
    <div class="container" id="messages">
        <div style="font-size: 10px; color: #888; line-height: 1.25">cid: {{conversationid}}
        <br> Chat from: {{currentUser.uid}} to: {{id}}</div>
        <div class="messages" id="scrollingContent">
            <div v-for="message in messagesOrdered" class="message" :class="[message.sender == currentUser.uid ?  'me' : '']">
                <template v-if="message.text">{{message.text}}</template>
                <div :style="'background-image: url('+ message.image +');'" class="myGallery-image" v-if="message.image"></div>
                <template v-if="message.location">{{message.location}}</template>
            </div>
        </div>
        <div class="chat-bottom-drawer">
            <div>
                <form v-if="mode=='text'" @submit.prevent="sendMessage('text')" class="d-flex">
                    <input type="text" v-model="myMessage" class="text-input">
                    <button class="sendMessage">Send</button>
                </form>
                <div v-if="mode=='myGallery'" class="myGallery">
                    <form>
                        <label for="fileinput">
                            <div class="myGallery-image btn-add-photo">
                                <span v-if="!isUploading" class="fas fa-plus"></span>
                                <span v-if="isUploading" class="fas fa-circle-notch fa-spin"></span>
                            </div>
                        </label>
                        <input type="file" @change="onFileChange" id="fileinput" style="display: none;">
                        <!-- <button id="submitUploadImage">Upload Image</button> -->
                    </form>
                    <div v-for="image in data.gallery" :style="'background-image: url('+ image.downloadURL +');'" class="myGallery-image" @click="sendMessage('image',image.downloadURL)"></div>
                </div>
            </div>
            <div class="chat-bottom-drawer-nav">
                <a @click="mode='text'" :class="[mode == 'text' ?  'active' : '']"><span class="fas fa-keyboard"></span></a>
                <a @click="mode='myGallery'" :class="[mode == 'myGallery' ?  'active' : '']"><span class="fas fa-image"></span></a>
                <a @click="sendLocation();" :class="[mode == 'sendLocation' ?  'active' : '']"><span class="fas fa-map-marker"></span></a>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: 'Chat',
    props: ['id'],
    data() {
        return {
            mode: 'text',
            imagePrimary: '',
            myMessage: '',
            conversationid: '',
            messages: '',
            scrolled: false,
            isUploading: false,
            data: {
                gallery: {}
            }
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
        messagesOrdered: function() {
            return _.orderBy(this.messages, ['createdAt'])
        },
    },
    methods: {
        getConversationId: function() {
            var userRef = firebase.database().ref('users/conversations/' + this.currentUser.uid + '/' + this.id);
            var self = this;
            userRef.on('value', function(snapshot) {
                //If this returns null we need a new conversation
                if (snapshot.val() == null) {
                    self.newConversation();
                    return;
                }
                self.conversationid = snapshot.val().conversationid;

                self.getMessages();
            });

        },
        newConversation: function() {
            var self = this;
            firebase.database().ref('conversations').push({
                boop: ''
            }).then(
                (conversation) => {
                    self.conversationid = conversation.key;
                    var senderRef = 'users/conversations/' + self.currentUser.uid + '/' + self.id;
                    firebase.database().ref(senderRef).set({
                        conversationid: conversation.key,
                        unseenCount: 0
                    });

                    var recipRef = 'users/conversations/' + self.id + '/' + self.currentUser.uid;
                    firebase.database().ref(recipRef).set({
                        conversationid: conversation.key,
                        unseenCount: 0
                    });



                })
        },
        sendMessage: function(type,value) {
            console.log('sending a message', type, value)
            if (this.myMessage == '' && type == 'text') {
                return;
            }

            if (this.conversationid == '') {
                //ack we need a convo id
                this.newConversation();
                return;
            }



            var self = this;
            console.log(this.conversationid);

            if(type == 'image'){
                firebase.database().ref('conversations/' + this.conversationid).update({
                    members: [this.currentUser.uid, this.id],
                    lastMessageTime: Date.now(),
                    lastMessage: 'Sent an Image'
                });

                firebase.database().ref('conversations/' + this.conversationid + '/messages/').push({
                    image: value,
                    createdAt: Date.now(),
                    sender: this.currentUser.uid
                });
            }

            if(type == 'location'){
                firebase.database().ref('conversations/' + this.conversationid).update({
                    members: [this.currentUser.uid, this.id],
                    lastMessageTime: Date.now(),
                    lastMessage: 'Sent their location'
                });

                firebase.database().ref('conversations/' + this.conversationid + '/messages/').push({
                    location: value,
                    createdAt: Date.now(),
                    sender: this.currentUser.uid
                });
            }

            if(type == 'text'){
                firebase.database().ref('conversations/' + this.conversationid).update({
                    members: [this.currentUser.uid, this.id],
                    lastMessageTime: Date.now(),
                    lastMessage: self.myMessage
                });

                firebase.database().ref('conversations/' + this.conversationid + '/messages/').push({
                    text: self.myMessage,
                    createdAt: Date.now(),
                    sender: this.currentUser.uid
                });
            }


            //update recipient unread count on other user (users/conversation/otherguy/me)
            var databaseRef = firebase.database().ref('users/conversations/' + this.id + '/' + this.currentUser.uid).child('unseenCount');
            databaseRef.transaction(function(unseenCount) {
                if (unseenCount) {
                    unseenCount = unseenCount + 1;
                }
                return (unseenCount || 1);
            });

            self.myMessage = '';
            self.updateScroll();

        },
        getMessages: function() {
            var profilesRef = firebase.database().ref('conversations/' + this.conversationid + '/messages');
            var vm = this;
            profilesRef.on('value', function(snapshot) {
                console.log('Getting messages ', snapshot.val());

                vm.messages = snapshot.val();
                vm.updateScroll();

                //Clear unseen count
                var unreadRef = 'users/conversations/' + vm.currentUser.uid + '/' + vm.id;
                firebase.database().ref(unreadRef).update({
                    unseenCount: 0
                });

            });
        },
        updateScroll: function() {
            //maybe change the listner to on child_entered
            if (!this.scrolled) {
                var element = document.querySelectorAll('#scrollingContent')[0];
                element.scrollTop = element.scrollHeight;

            }
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
            var self = this;

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
                            self.isUploading = true;
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
                    // self.profile.imageUrl = downloadURL;
                    self.addImageToGallery(downloadURL);
                    self.isUploading = false;
                });
        },
        addImageToGallery: function(downloadURL) {
            firebase.database().ref('profiles/' + this.currentUser.uid + '/gallery').push({
                downloadURL
            });
            console.log('added gallery image for ', this.currentUser.uid);
        },
        onFileChange(e) {
            var files = e.target.files || e.dataTransfer.files;
            if (!files.length)
                return;
            this.uploadImage(files[0]);
        },
        sendLocation: function(){
            if(!store.location){
                alert("couldn't find location");
                return;
            }

            this.sendMessage('location',store.location);
        },
        watchGallery: function() {
            console.log('getting gallery');
            var firebaseRef = firebase.database().ref('profiles/' + this.currentUser.uid + '/gallery');
            var vm = this;
            firebaseRef.on('child_added', function(snapshot) {
                vm.$set(vm.data.gallery, snapshot.key, snapshot.val());
            });

            firebaseRef.on('child_removed', function(snapshot) {
                // vm.$set(vm.data.favorites, snapshot.key, false);
                vm.$delete(vm.data.gallery, snapshot.key);
            });
        },
    },
    mounted: function() {
        this.$nextTick(function() {
            this.getConversationId();
            this.watchGallery()
            document.addEventListener('scroll', function() {
                this.scrolled = true;
            });

        })
    },
    watch: {
        $route(to, from) {
            this.getConversationId();
        }
    }
}
</script>
<style scoped>
.container {
    display: flex;
    flex-direction: column;
    padding-bottom: 3.5rem;
    flex-grow: 1;
}

.d-flex {
    display: flex;
}

.chat-bottom-drawer {
    bottom: 3.5rem;
    width: 100%;
    background: #333;
}

.chat-bottom-drawer-nav {
    display: flex;
    justify-content: space-around;
    background-color: rgba(0, 0, 0, .1);
}

.chat-bottom-drawer-nav a {
    text-decoration: none;
    color: #999;
    padding: 1rem;
    position: relative;
    display: block;
}

.chat-bottom-drawer-nav a.active {
    color: #ffba3b;
}

.text-input {
    flex-grow: 1;
    background: transparent;
    border: 0;
}

.myGallery {
    display: flex;
    padding: .25rem;
    overflow-x: scroll;
}

.myGallery-image {
    display: block;
    height: calc(25vw - 0.25rem);
    width: calc(25vw - 0.25rem);
    border: 1px solid rgba(255, 255, 255, .1);
    background-size: cover;
    background-repeat: no-repeat;
    border-radius: .25rem;
    padding: .25rem .5rem;
    margin: .25rem;
    box-sizing: border-box;
    animation: fadein 2s;
    flex-shrink: 0;
}

.btn-add-photo {
    font-size: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.messages {
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    overflow-x: auto;
    padding-bottom: 4rem;
}

#scrollingContent {
    display: flex;
    flex-grow: 1;
}

.message {
    border-radius: .5rem;
    background-color: #9cd3fb;
    color: black;
    margin: .25rem 1rem;
    max-width: 80vw;
    align-self: flex-start;
    padding: .5rem 1rem;
    position: relative;
    border-bottom-left-radius: 0;
}

.message.me {
    background-color: #ffba3b;
    align-self: flex-end;
    border-bottom-left-radius: .5rem;
    border-bottom-right-radius: 0;
}

.message:after {
    content: '';
    position: absolute;
    bottom: 10px;
    left: 0;
    width: 0;
    height: 0;
    border: 1rem solid transparent;
    border-top-color: #9cd3fb;
    border-bottom: 0;
    border-left: 0;
    margin-right: -10px;
    margin-bottom: -1rem;
}

.message.me:after {
    content: '';
    position: absolute;
    bottom: 10px;
    left: unset;
    right: 0;
    width: 0;
    height: 0;
    border: 1rem solid transparent;
    border-top-color: #ffba3b;
    border-bottom: 0;
    border-right: 0;
    margin-right: 0;
    margin-bottom: -1rem;
}

.sendMessage {
    border: 0;
}
</style>
