/**
 * Generates a beautiful avatar URL using DiceBear API
 * @param seed Unique seed for the avatar (e.g. email or name)
 * @returns Avatar URL string
 */
export const getAvatarUrl = (seed: string) => {
  if (!seed) seed = 'guest';
  // Using avataaars style which looks very premium
  // Format as PNG for React Native Image component compatibility
  return `https://api.dicebear.com/9.x/avataaars/png?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
};
