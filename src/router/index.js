import Vue from 'vue'
import Router from 'vue-router'

import Hello from '@/components/Hello'
import Grid from '@/components/Grid'
import Login from '@/components/Login'
import SignUp from '@/components/SignUp'
import Profile from '@/components/Profile'
import Chat from '@/components/Chat'
import Conversations from '@/components/Conversations'
import Favorites from '@/components/favorites'
import firebase from 'firebase'

Vue.use(Router)

let router = new Router({
  routes: [
    {
      path: '*',
      redirect: '/login'
    },
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/sign-up',
      name: 'SignUp',
      component: SignUp
    },
    {
      path: '/hello',
      name: 'Hello',
      component: Grid,
      props: true,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/profile/',
      component: Profile,
      props: true,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/profile/:id',
      component: Profile,
      props: true,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/chat/:id',
      component: Chat,
      props: true,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/conversations',
      component: Conversations,
      props: true,
      meta: {
        requiresAuth: true
      }
    },
        {
      path: '/favorites',
      component: Favorites,
      props: true,
      meta: {
        requiresAuth: true
      }
    }
  ]
})

router.beforeEach((to, from, next) => {
  let currentUser = firebase.auth().currentUser;
  let requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !currentUser) next('login')
  else if (!requiresAuth && currentUser) next('hello')
  else next()
})

export default router
