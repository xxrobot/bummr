<template>
    <div class="container">
        <div class="conversations">
            <div v-for="(conversation, key) in conversations" class="message">
                <router-link :to="'/chat/'+key" tag="div" class="conversation">
                    <div class="thumbnail" :style="'background-image: url('+ conversation.imageURL +');'">
                        <!-- <div v-if="unseencount" class="unseencount">{{unseencount}}</div> -->
                    </div>
                    <div>{{conversation.lastMessage}}</div>
                </router-link>
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
            imagePrimary: '',
            myMessage: '',
            conversations: {}
        }
    },
    computed: {
        messagesOrdered: function() {
            return _.orderBy(this.messages, ['createdAt'])
        },
        currentUser: function() {
            return firebase.auth().currentUser
        }
    },
    methods: {
        getConversations: function() {
            console.log('getting conversations');
            var userRef = firebase.database().ref('users/conversations/' + this.currentUser.uid);
            self = this;
            userRef.on('value', function(snapshot) {
                // Vue.set(self.conversations, 'conversations', snapshot.val());
                //this is acting weird
                // debugger;
                self.conversations = snapshot.val();
                self.getConversationsData();
            });
        },
        getConversationsData: function() {

            //gets the additional information for each person this users has conversed with
            // for (i = 0; i < this.conversations.length; i++) {
            //     var userRef = firebase.database().ref('conversations/' + conversationid);
            //     self = this;
            //     userRef.on('value', function(snapshot) {
            //         debugger;
            //         self.conversations['conversationid'] = snapshot.val();
            //     });
            // }

            for (var profile in this.conversations) {
                var userRef = firebase.database().ref('profiles/' + profile + '/imagePrimary');
                self = this;
                userRef.on('value', function(snapshot) {
                    self.conversations[profile].imageURL = snapshot.val();
                });

                //get last message from conversationid
                // var userRef = firebase.database().ref('conversations/' + self.conversations[profile]['conversationid']);
                // self = this;
                // userRef.on('value', function(snapshot) {
                //     self.conversations[profile].lastMessage = snapshot.val().lastMessage;
                // });
            }

        }

    },
    mounted: function() {
        this.getConversations();
    }
}
</script>
<style scoped>
.container,
.profile-large {
    height: 100%;
}

.container {
    display: flex;
    flex-direction: column;
}

.conversation {
    display: flex;
}

.thumbnail {
    width: 100px;
    height: 100px;
    flex-shrink: 0;
}
</style>
