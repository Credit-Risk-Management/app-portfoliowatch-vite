# API Layer - Debouncing Pattern

## Overview

This API layer implements automatic debouncing for read operations that might be called repeatedly (like search, filters, and detail views). This ensures a responsive UI while preventing excessive API calls.

## Architecture Benefits

✅ **UI Responsiveness** - State updates happen immediately, only API calls are debounced  
✅ **Centralized Logic** - Debouncing is handled at the API layer, not in components  
✅ **Consistent Behavior** - All search/filter operations behave the same way  
✅ **Easy Configuration** - Different endpoints can have different delays  
✅ **Write Operations Protected** - Create, update, delete operations are NEVER debounced  

## Usage Pattern

### 1. Basic API Setup

```javascript
import { wrapApiWithDebounce } from '@src/utils/debouncedApi';
import apiClient from './client';

// Define your base API object
const myApiBase = {
  getAll: async (filters = {}) => {
    // Your implementation
    return apiClient.get('/endpoint', { params: filters });
  },
  
  getById: async (id) => apiClient.get(`/endpoint/${id}`),
  
  create: async (data) => apiClient.post('/endpoint', data),
};

// Wrap with debouncing
export const myApi = wrapApiWithDebounce(myApiBase, {
  getAll: 350,  // Debounce search/filter with 350ms delay
  getById: 300, // Debounce detail views with 300ms delay
  // Note: 'create' is NOT in config, so it executes immediately
});

export default myApi;
```

### 2. Component Usage

Components can call the API directly without worrying about debouncing:

```javascript
// Event handler - no debouncing needed here!
export const handleFilterChange = async (e) => {
  const { value } = e.target;
  
  // Update state immediately (UI is responsive)
  $filter.update({ searchTerm: value });
  
  // API call is automatically debounced
  const results = await myApi.getAll({ searchTerm: value });
  setResults(results);
};
```

### 3. What Gets Debounced?

**✅ Debounce These (Read Operations):**
- `getAll` with filters/search
- `getById` for detail views
- `getByX` for any filter operations
- Any GET request that might be called rapidly

**❌ Never Debounce These (Write Operations):**
- `create` - Creates must execute immediately
- `update` - Updates must execute immediately
- `delete` - Deletes must execute immediately
- Any POST/PUT/DELETE that changes data

## Configuration Options

### Custom Delays

```javascript
export const myApi = wrapApiWithDebounce(myApiBase, {
  getAll: 500,     // Longer delay for expensive searches
  getById: 200,    // Shorter delay for quick lookups
  getByFilter: 350, // Medium delay for filters
});
```

### No Debouncing

If you don't want debouncing on an endpoint, simply don't include it in the config:

```javascript
export const myApi = wrapApiWithDebounce(myApiBase, {
  getAll: 350, // Only this method is debounced
  // getById is NOT debounced
});
```

## How It Works

1. **User types in search field** → State updates immediately (UI shows input)
2. **API call is queued** → Debounce timer starts
3. **User keeps typing** → Previous timer is cancelled, new one starts
4. **User stops typing** → After delay (e.g., 350ms), API call executes
5. **All pending promises resolve** → UI updates with results

### Multiple Rapid Calls

If multiple calls are made before the debounce delay expires, they all resolve with the result of the final API call. This means:

- Only 1 actual HTTP request is made
- All callers get the same result
- No race conditions

## Examples from Codebase

### Borrowers API

```javascript
// Only read operations are debounced
export const borrowersApi = wrapApiWithDebounce(borrowersApiBase, {
  getAll: 350,        // Search/filter
  getById: 300,       // Detail view
  getByManager: 350,  // Manager filter
  // create, update, delete execute immediately
});
```

### Loans API

```javascript
// Read operations debounced, write operations immediate
export const loansApi = wrapApiWithDebounce(loansApiBase, {
  getAll: 350,
  getById: 300,
  getByBorrower: 350,
  getByOfficer: 350,
  // create, update, delete, computeWatchScore execute immediately
});
```

## Migration Guide

### Before (Component-Level Debouncing)

```javascript
// ❌ Old way - debouncing in component
let timeout;
const handleSearch = (e) => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    api.getAll({ searchTerm: e.target.value });
  }, 350);
};
```

### After (API-Level Debouncing)

```javascript
// ✅ New way - debouncing in API layer
const handleSearch = async (e) => {
  $filter.update({ searchTerm: e.target.value });
  await api.getAll({ searchTerm: e.target.value });
};
```

## Testing

When testing components that use debounced APIs, you may want to:

1. **Mock the API** - Mock the debounced API functions as normal
2. **Use fake timers** - If testing debounce behavior specifically
3. **Test immediate state updates** - Verify UI responds before API completes

```javascript
jest.mock('@src/api/borrowers.api');

test('search updates state immediately', async () => {
  const { getByPlaceholderText } = render(<BorrowersView />);
  const input = getByPlaceholderText('Search');
  
  fireEvent.change(input, { target: { value: 'test' } });
  
  // State should update immediately
  expect($borrowersFilter.value.searchTerm).toBe('test');
  
  // API call happens after debounce
  await waitFor(() => {
    expect(borrowersApi.getAll).toHaveBeenCalledWith({ searchTerm: 'test' });
  });
});
```

## Best Practices

1. ✅ **Always debounce read operations** that might be called repeatedly
2. ✅ **Never debounce write operations** (create, update, delete)
3. ✅ **Use consistent delays** across similar operations (350ms is a good default)
4. ✅ **Update UI state immediately** before calling debounced API
5. ✅ **Handle loading states** appropriately in components
6. ❌ **Don't add component-level debouncing** when API debouncing exists

## Questions?

This pattern is designed to be the default for all API modules. If you're adding a new API file, follow the existing patterns in `borrowers.api.js`, `loans.api.js`, or `relationshipManagers.api.js`.

