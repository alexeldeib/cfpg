export const rpName = 'remixy';
export const rpID = 'localhost';
const expectedScheme = process.env.NODE_ENV === 'production' ? 'https' : 'http';
export const expectedOrigin =  `${expectedScheme}://${rpID}:3000`;
