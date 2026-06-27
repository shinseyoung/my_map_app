export const isWithin24Hours = (timestamp) => {
  if (!timestamp) return false;

  const postTime = new Date(timestamp).getTime();
  const currentTime = new Date().getTime();
  
  const diffInMilliseconds = currentTime - postTime;
  const hours24InMilliseconds = 24 * 60 * 60 * 1000;
  
  return diffInMilliseconds < hours24InMilliseconds && diffInMilliseconds >= 0;
};