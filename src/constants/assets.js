import { COTUFAS_LOGO_DATA_URL } from './logoDataUri';

export const COTUFAS_LOGO = require('../../assets/logo.png');
export { COTUFAS_LOGO_DATA_URL };

export const getEffectiveLogoUri = (profileImage) => {
  return profileImage || COTUFAS_LOGO_DATA_URL;
};

export const getEffectiveLogoSource = (profileImage) => {
  if (profileImage) {
    return { uri: profileImage };
  }
  return COTUFAS_LOGO;
};
