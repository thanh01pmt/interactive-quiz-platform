
// Generates a somewhat unique ID. For client-side temporary use.
// For true global uniqueness, a UUID library or server-side generation is better.
export const generateUniqueId = (prefix: string = 'id_') => `${prefix}${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
