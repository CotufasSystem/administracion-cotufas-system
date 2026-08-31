import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEY = '@cotufas_system_db_v1';
export const PIN_KEY = '@cotufas_system_pin';

export const loadStoredData = async () => {
  try {
    const pin = await AsyncStorage.getItem(PIN_KEY);
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return {
      pin,
      data: json ? JSON.parse(json) : null
    };
  } catch (err) {
    console.error('Error loading storage:', err);
    return { pin: null, data: null };
  }
};

export const persistAppData = async (payload) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error('Error saving storage:', err);
  }
};

export const persistMasterPin = async (newPin) => {
  try {
    await AsyncStorage.setItem(PIN_KEY, newPin);
  } catch (err) {
    console.error('Error saving PIN:', err);
  }
};

export const storage = {
  getDatabase: async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      return json ? JSON.parse(json) : null;
    } catch (e) {
      console.error('Error in getDatabase', e);
      return null;
    }
  },
  saveDatabase: async (data) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error in saveDatabase', e);
    }
  },
  getMasterPin: async () => {
    try {
      return await AsyncStorage.getItem(PIN_KEY);
    } catch (e) {
      return null;
    }
  },
  saveMasterPin: async (pin) => {
    try {
      await AsyncStorage.setItem(PIN_KEY, pin);
    } catch (e) {
      console.error('Error in saveMasterPin', e);
    }
  },
};

export default storage;
