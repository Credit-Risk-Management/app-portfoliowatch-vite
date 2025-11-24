/**
 * Creates a debounced version of an API function
 * Useful for search/filter operations where multiple rapid calls should be consolidated
 *
 * @param {Function} apiFunction - The API function to debounce
 * @param {number} delay - Debounce delay in milliseconds (default: 350ms)
 * @param {string} key - Optional key to track different debounced calls separately
 * @returns {Function} Debounced API function
 */
const debouncedApiCache = new Map();

export const createDebouncedApi = (apiFunction, delay = 350, key = 'default') => {
  const cacheKey = `${apiFunction.name || 'anonymous'}_${key}`;

  return (...args) => {
    // Get or create the debounce state for this specific API function
    if (!debouncedApiCache.has(cacheKey)) {
      debouncedApiCache.set(cacheKey, {
        timeoutId: null,
        lastPromise: null,
        resolvers: [],
      });
    }

    const state = debouncedApiCache.get(cacheKey);

    // Clear existing timeout
    if (state.timeoutId) {
      clearTimeout(state.timeoutId);
    }

    // Return a promise that will resolve when the debounced call completes
    return new Promise((resolve, reject) => {
      // Store this promise's resolvers
      state.resolvers.push({ resolve, reject });

      // Set new timeout
      state.timeoutId = setTimeout(async () => {
        const currentResolvers = [...state.resolvers];
        state.resolvers = [];

        try {
          const result = await apiFunction(...args);

          // Resolve all pending promises with the same result
          currentResolvers.forEach(({ resolve: res }) => res(result));
        } catch (error) {
          // Reject all pending promises with the same error
          currentResolvers.forEach(({ reject: rej }) => rej(error));
        }
      }, delay);
    });
  };
};

/**
 * Decorator to wrap API object methods with debouncing
 * @param {Object} apiObject - Object containing API methods
 * @param {Object} config - Configuration for which methods to debounce and their delays
 * @returns {Object} New API object with debounced methods
 *
 * @example
 * const debouncedBorrowersApi = wrapApiWithDebounce(borrowersApi, {
 *   getAll: 350,  // debounce getAll with 350ms delay
 *   getById: 200, // debounce getById with 200ms delay
 * });
 */
export const wrapApiWithDebounce = (apiObject, config = {}) => {
  const wrappedApi = {};

  Object.keys(apiObject).forEach((methodName) => {
    const originalMethod = apiObject[methodName];

    if (config[methodName] !== undefined) {
      // This method should be debounced
      const delay = typeof config[methodName] === 'number' ? config[methodName] : 350;
      wrappedApi[methodName] = createDebouncedApi(originalMethod, delay, methodName);
    } else {
      // Keep original method
      wrappedApi[methodName] = originalMethod;
    }
  });

  return wrappedApi;
};

export default createDebouncedApi;
