import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: 'administracion-cotufas-system',
  appId: '1:59765288647:web:6346e527e1721be4b758e2',
  storageBucket: 'administracion-cotufas-system.firebasestorage.app',
  apiKey: 'AIzaSyDPv0Hy9fEETejDr1csm1W7piJsAxrVMpI',
  authDomain: 'administracion-cotufas-system.firebaseapp.com',
  messagingSenderId: '59765288647',
  measurementId: 'G-D1KQSQLDC5',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

export default app;
