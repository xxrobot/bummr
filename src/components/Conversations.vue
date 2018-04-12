<template>
    <div class="container">
        <div class="conversations">
            <div v-for="(conversation, key) in data.conversationPartners" class="message">
                <router-link :to="'/chat/'+key" tag="div" class="conversation">
                    <div class="thumbnail" :style="'background-image: url('+ conversation.imagePrimary +');'">
                    </div>
                    <div class="messagemeta">
                        <div class="displayName">{{conversation.displayName}}</div>
                        <div class="lastMessage">{{conversation.lastMessage}}</div>
                        <div class="unseencount" v-if="conversation.unseenCount > 0">{{conversation.unseenCount}}</div>
                    </div>
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
            data: {
                conversationPartners: {}
            }
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
            var vm = this;
            userRef.on('child_added', function(snapshot) {
                vm.$set(vm.data.conversationPartners, snapshot.key, snapshot.val());

                var profile = snapshot.key;
                var conversationid = snapshot.val().conversationid;
                var profileRef = firebase.database().ref('profiles/' + profile);

                profileRef.on('value', function(snapshot) {
                    var mergedProfileData = Object.assign({}, vm.data.conversationPartners[profile], snapshot.val())
                    vm.$set(vm.data.conversationPartners, profile, mergedProfileData);
                });

                //get last message from conversationid
                var convoRef = firebase.database().ref('conversations/' + conversationid);
                convoRef.on('value', function(snapshot) {
                    //merge this
                    var newMergedData = Object.assign({}, vm.data.conversationPartners[profile], snapshot.val())
                    vm.$set(vm.data.conversationPartners, profile, newMergedData);

                });



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

            for (var profile in this.data.conversationPartners) {
                console.log('looking up ', profile)
                var userRef = firebase.database().ref('profiles/' + profile + '/imagePrimary');
                var vm = this;
                userRef.on('value', function(snapshot) {
                    console.log('looking up ', profile)
                        // vm.conversations[profile].imageURL = snapshot.val();
                    vm.$set(vm.data, 'conversationPartners' + [profile], snapshot.val());

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
        this.$set(this.boop, 'derp2', 'derp');
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
    width: 5rem;
    height: 5rem;
    flex-shrink: 0;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center center;
    border-radius: .25rem;
}

.message {
    padding: .5rem;
    border-bottom: 1px solid #333;
}

.messagemeta {
    padding: 0 1rem;
    position: relative;
    flex-grow: 1;
    text-align: left;
}

.lastMessage {
    font-weight: bold;
}

.unseencount {
    background-color: #ffba3b;
    color: #000;
    font-size: .5rem;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: .5rem;
    right: 0.6rem;
    height: 1rem;
    width: 1rem;
    box-shadow: 1px 1px 5px #000;
    font-weight: bold;
}
</style>
