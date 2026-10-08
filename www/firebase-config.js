// Reemplaza estos valores con los de tu propio proyecto de Firebase
// (Firebase console -> Configuracion del proyecto -> tus apps -> SDK config).
// Puedes usar el MISMO proyecto de Firebase de DogMy o uno nuevo; se
// recomienda uno nuevo para no mezclar datos de ambas apps.

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAKtDE50qmN9ULGf3wylD64sMyzutpJLxs",
  authDomain: "duelo-fm.firebaseapp.com",
  // IMPORTANTE: todavia falta esta linea. Hay que activar "Realtime Database"
  // en la consola de Firebase (no Firestore) y pegar aqui la URL que te de,
  // algo como "https://duelo-fm-default-rtdb.firebaseio.com"
  databaseURL: "https://duelo-fm-default-rtdb.firebaseio.com",
  projectId: "duelo-fm",
  storageBucket: "duelo-fm.firebasestorage.app",
  messagingSenderId: "7981774387",
  appId: "1:7981774387:web:e1f42e187e7661fd185546",
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
