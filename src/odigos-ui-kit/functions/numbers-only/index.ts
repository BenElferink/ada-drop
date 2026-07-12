export const numbersOnly = (value: string): string => {
  // Use a regular expression to replace all non-digit characters with an empty string
  const cleaned = value.replace(/[^\d]/g, '');

  return cleaned;
};
