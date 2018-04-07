<template>
    <div class="container">
        cid: {{conversationid}}
        <br> Chat from: {{currentUser.uid}} to: {{id}}
        <div class="messages">
            <div v-for="message in messagesOrdered" class="message" :class="[message.sender == currentUser.uid ?  'me' : '']">
                {{message.text}}
            </div>
        </div>
        <form @submit.prevent="sendMessage" class="text-container">
            <input type="text" v-model="myMessage" class="text-input">
            <button>Send</button>
        </form>
    </div>
</template>
<script>
export default {
    name: 'Chat',
    props: ['id'],
    data() {
        return {
            imagePrimary: '',
            myMessage: '',
            conversationid: '',
            messages: ''
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
            self = this;
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
            self = this;
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
        sendMessage: function() {
            if (this.myMessage == '') {
                return;
            }

            if (this.conversationid == '') {
                //ack we need a convo id
                this.newConversation();
                return;
            }


            self = this;
            console.log(this.conversationid);
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

            self.myMessage = '';

        },
        getMessages: function() {
            var profilesRef = firebase.database().ref('conversations/' + this.conversationid + '/messages');
            self = this;
            profilesRef.on('value', function(snapshot) {
                console.log('Getting messages ', snapshot.val());

                self.messages = snapshot.val();
            });
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
            this.getConversationId();
            // Code that will run only after the
            // entire view has been rendered
            // if (this.id) {
            //     this.getProfileInfo(this.id);
            // } else {
            //     this.getProfileInfo(this.currentUser.uid);
            // }

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
.text-container {
    display: flex;
    position: fixed;
    bottom: 3.5rem;
    width: 100%;
}

.text-input {
    flex-grow: 1;
}

.messages {
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    overflow-x: auto;
    padding-bottom: 4rem;
}

.message {
    border-radius: .5rem;
    background-color: #9cd3fb;
    color: black;
    margin: .25rem;
    max-width: 80vw;
    align-self: flex-start;
    padding: .5rem 1rem;
}

.message.me {
    background-color: orangered;
    align-self: flex-end;
}
</style>
