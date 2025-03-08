import 'firebase/compat/firestore'
import firebase from 'firebase/compat/app'
import { API_KEYS } from '../constants'

if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: API_KEYS['FIREBASE_API_KEY'],
    appId: API_KEYS['FIREBASE_APP_ID'],
    authDomain: API_KEYS['FIREBASE_AUTH_DOMAIN'],
    messagingSenderId: API_KEYS['FIREBASE_MESSAGING_SENDER_ID'],
    projectId: API_KEYS['FIREBASE_PROJECT_ID'],
    storageBucket: API_KEYS['FIREBASE_STORAGE_BUCKET'],
  })
}

const firestore = firebase.firestore()

export { firestore }
