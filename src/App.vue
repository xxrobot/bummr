<template>
    <div id="app">
        <transition name="fade">
            <router-view :data="data.data"></router-view>
        </transition>
        <nav>
            <router-link to="/Hello"><span class="fas fa-th" alt="Grid"></span></router-link>
            <router-link to="/profile"><span class="fas fa-address-book"></span></router-link>
            <router-link to="/conversations">
                <span class="fas fa-comment-alt" alt="Messages"></span>
                <div class="hasUnread" v-if="unread"></div>
            </router-link>
            <router-link to="/favorites"><span class="fas fa-star" alt="favorites"></span></router-link>
        </nav>
    </div>
</template>
<script>
export default {
    name: 'app',
    data() {
        return {
            unread: 0,
            data: {
                data: {
                    favorites: {},
                    grid: {}
                }
            },
            favoritesLoaded: false,
            message: 'parent mesage'
        }
    },
    computed: {
        currentUser: function() {
            return firebase.auth().currentUser
        }
    },
    methods: {
        getUnread: function() {
            var databaseRef = firebase.database().ref('users/conversations/' + this.currentUser.uid);
            var self = this;
            databaseRef.on('value', function(snapshot) {
                console.log('messages changed ', snapshot.val());
                store.conversations = snapshot.val();

                var unreads = _.map(store.conversations, function(convo) {
                    return convo.unseenCount;
                });
                unreads = _.max(unreads);
                self.updateUnread(unreads);
            });
        },
        // watchFavorites: function() {
        //     console.log('getting favorites');
        //     var favRef = firebase.database().ref('users/' + this.currentUser.uid + '/favorites');
        //     var vm = this;
        //     favRef.on('child_added', function(snapshot) {
        //         vm.$set(vm.data.favorites, snapshot.key, snapshot.val());
        //         vm.favoritesLoaded = true;
        //     });

        //     favRef.on('child_removed', function(snapshot) {
        //         // vm.$set(vm.data.favorites, snapshot.key, false);
        //         vm.$delete(vm.data.favorites, snapshot.key);
        //     });
        // },
        watchUserData: function() {
            console.log('getting user data');
            var favRef = firebase.database().ref('users/' + this.currentUser.uid);
            var vm = this;
            favRef.on('value', function(snapshot) {
                vm.$set(vm.data, 'data', snapshot.val());
                // vm.favoritesLoaded = true;
            });

            // favRef.on('child_removed', function(snapshot) {
            //     // vm.$set(vm.data.favorites, snapshot.key, false);
            //     vm.$delete(vm.data.data, snapshot.key);
            // });
        },
        updateUnread: function(number) {
            this.unread = number;
        }
    },
    mounted: function() {
        this.getUnread();
        // this.watchFavorites();
        this.watchUserData();
    }
}

window.store = {};
</script>
<style>
/*reset*/

html,
body,
div,
span,
object,
iframe,
h1,
h2,
h3,
h4,
h5,
h6,
p,
blockquote,
pre,
abbr,
address,
cite,
code,
del,
dfn,
em,
img,
ins,
kbd,
q,
samp,
small,
strong,
sub,
sup,
var,
b,
i,
dl,
dt,
dd,
ol,
ul,
li,
fieldset,
form,
label,
legend,
table,
caption,
tbody,
tfoot,
thead,
tr,
th,
td,
article,
aside,
canvas,
details,
figcaption,
figure,
footer,
header,
hgroup,
menu,
nav,
section,
summary,
time,
mark,
audio,
video {
    margin: 0;
    padding: 0;
    border: 0;
    outline: 0;
    font-size: 100%;
    vertical-align: baseline;
    background: transparent;
}

body {
    line-height: 1.55rem;
}

article,
aside,
details,
figcaption,
figure,
footer,
header,
hgroup,
menu,
nav,
section {
    display: block;
}

nav ul {
    list-style: none;
}

blockquote,
q {
    quotes: none;
}

blockquote:before,
blockquote:after,
q:before,
q:after {
    content: '';
    content: none;
}

a {
    margin: 0;
    padding: 0;
    font-size: 100%;
    vertical-align: baseline;
    background: transparent;
}


/* change colours to suit your needs */

ins {
    background-color: #ff9;
    color: #000;
    text-decoration: none;
}


/* change colours to suit your needs */

mark {
    background-color: #ff9;
    color: #000;
    font-style: italic;
    font-weight: bold;
}

del {
    text-decoration: line-through;
}

abbr[title],
dfn[title] {
    border-bottom: 1px dotted;
    cursor: help;
}

table {
    border-collapse: collapse;
    border-spacing: 0;
}


/* change border colour to suit your needs */

hr {
    display: block;
    height: 1px;
    border: 0;
    border-top: 1px solid #cccccc;
    margin: 1em 0;
    padding: 0;
}

input,
select {
    vertical-align: middle;
}


/*end reset*/

* {
    box-sizing: border-box;
}

body {
    background-color: #151515;
    color: #fff;
}

a,
a:visited {
    color: #efefef;
}

#app {
    font-family: sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    height: 100vh;
    display: flex;
    flex-direction: column;
}

.container {
    padding-bottom: 4rem;
}


/*Transitions*/

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s ease-out;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}

::-webkit-scrollbar {
    display: none;
}

nav {
    background: #000;
    position: fixed;
    bottom: 0;
    width: 100%;
    display: flex;
    justify-content: space-around;
    z-index: 900;
}

nav a,
nav a:visited {
    text-decoration: none;
    color: #999;
    padding: 1rem;
    position: relative;
}

nav a.router-link-active,
.active {
    color: #ffba3b;
}

button {
    padding: 1rem;
    background-color: #ffba3b;
    border: 1px solid #000;
}

input[type="text"],
input[type="number"],
input[type="tel"],
input[type="file"],
input[type="password"],
textarea {
    height: 3rem;
    min-width: 320px;
    border: 0;
    background-color: #111;
    color: #fff;
    padding: .5rem;
    font-size: 1rem;
}

.fab-container {
    position: absolute;
    right: 1rem;
    bottom: 4.5rem;
    display: flex;
    flex-direction: column;
    margin: 0 -.25rem;
}

.fab {
    border-radius: 50%;
    width: 3rem;
    height: 3rem;
    line-height: 0;
    padding: 0;
    font-size: 1rem;
    margin: .25rem;
}

.hasUnread {
    background-color: red;
    border-radius: 50%;
    content: '';
    position: absolute;
    top: 0.8rem;
    right: 0.6rem;
    height: .5rem;
    width: .5rem;
    border: 2px solid black;
    box-sizing: content-box;
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
