// Configuracion de Firebase - mismo patron que DogMy.
// Reemplaza estos valores con los de tu propio proyecto de Firebase
// (Firebase console -> Configuracion del proyecto -> tus apps -> SDK config).
// Puedes usar el MISMO proyecto de Firebase de DogMy o uno nuevo; se
// recomienda uno nuevo para no mezclar datos de ambas apps.

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  databaseURL: "https://TU_PROYECTO-default-rtdb.firebaseio.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID",
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
