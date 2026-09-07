import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

const sanitize = (data) => JSON.parse(JSON.stringify(data || {}));

/**
 * Saves or updates an entity document inside its specific collection.
 */
export const saveEntityDoc = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, sanitize(data), { merge: true });
    return true;
  } catch (error) {
    console.error(`Error saving to ${collectionName}/${docId}:`, error);
    return false;
  }
};

/**
 * Removes an entity document from its collection.
 */
export const removeEntityDoc = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error(`Error deleting ${collectionName}/${docId}:`, error);
    return false;
  }
};

/**
 * Subscribes to an entire collection in real time.
 */
export const subscribeToCollection = (collectionName, onUpdate, onError) => {
  const colRef = collection(db, collectionName);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items = [];
      snapshot.forEach((d) => items.push({ ...d.data(), id: d.id }));
      onUpdate(items);
    },
    (error) => {
      console.error(`Firestore error in ${collectionName}:`, error);
      if (onError) onError(error);
    }
  );
};

/**
 * Subscribes to the attendance collection and maps it back to { [dateKey]: records }.
 */
export const subscribeToAttendance = (onUpdate, onError) => {
  const colRef = collection(db, 'attendance');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const attendanceMap = {};
      snapshot.forEach((d) => {
        const data = d.data();
        attendanceMap[d.id] = data?.records !== undefined ? data.records : data;
      });
      onUpdate(attendanceMap);
    },
    (error) => {
      console.error('Firestore attendance error:', error);
      if (onError) onError(error);
    }
  );
};

/**
 * Saves a day's attendance records.
 */
export const saveAttendanceDayToFirestore = async (dateKey, records) => {
  try {
    const docRef = doc(db, 'attendance', dateKey);
    await setDoc(docRef, sanitize({ date: dateKey, records }), { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving attendance day:', error);
    return false;
  }
};

/**
 * Subscribes to general settings document.
 */
export const subscribeToSettings = (onUpdate, onError) => {
  const docRef = doc(db, 'settings', 'general');
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data());
      }
    },
    (error) => {
      console.error('Firestore settings error:', error);
      if (onError) onError(error);
    }
  );
};

/**
 * Saves system settings (PIN, theme, employeeOfMonth, etc.).
 */
export const saveSettingsToFirestore = async (data) => {
  try {
    const docRef = doc(db, 'settings', 'general');
    await setDoc(docRef, sanitize(data), { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};
