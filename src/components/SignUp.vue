<template>
    <form class="sign-up" v-on:submit="signUp">
        <p>Let's create a new account !</p>
        <input type="text" v-model="displayName" autocomplete="given-name" placeholder="Display Name">
        <br>
        <input type="text" v-model="email" placeholder="Email" required>
        <br>
        <input type="password" v-model="password" placeholder="Password" required>
        <br>
        <button>Sign Up</button>
        <span>or go back to <router-link to="/login">login</router-link>.</span>
    </form>
</template>
<script>
import firebase from 'firebase'

export default {
    name: 'signUp',
    data: function() {
        return {
            email: '',
            password: '',
            displayName: ''
        }
    },
    methods: {
        signUp: function() {
            firebase.auth().createUserWithEmailAndPassword(this.email, this.password).then(
                (user) => {
                    this.writeUserData(user.uid);
                    this.$router.replace('hello')
                },
                (err) => {
                    alert('Oops. ' + err.message)
                }
            );
        },
        writeUserData: function(uid) {
            firebase.database().ref('profiles/' + uid).set({
                displayName: this.displayName,
                description: '',
                age: '',
                imagePrimary: ''
            });
            console.log('Wrote user data for ', uid);
        }
    }
}
</script>
<style scoped>
.signUp {
    padding-top: 40px;
}

input {
    margin: 10px 0;
    width: 80%;
    padding: 15px;
    max-width: 18rem;
}

button {
    margin-top: 20px;
    width: 80%;
    cursor: pointer;
    max-width: 18rem;
}

span {
    display: block;
    margin-top: 20px;
    font-size: 11px;
}
</style>
