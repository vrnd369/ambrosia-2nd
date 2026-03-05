/**
 * Debounce repeated client requests (search, filters, CMS actions).
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in ms
 * @returns Debounced function
 */
export function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}
