/**
 * API Client Usage Examples
 * Phase 101: Axios setup and configuration
 */

import {apiClient, ApiClient} from '../client';
import {ApiResponse} from '../types';

/**
 * Example 1: Basic GET request
 */
export async function example_BasicGetRequest() {
  try {
    // GET request to /users
    const users = await apiClient.get('/users');
    console.log('Users:', users);

    // GET request with query parameters
    const user = await apiClient.get('/users/123');
    console.log('User:', user);
  } catch (error) {
    console.error('GET request error:', error);
  }
}

/**
 * Example 2: POST request
 */
export async function example_PostRequest() {
  try {
    // Create new user
    const newUser = await apiClient.post('/users', {
      name: 'John Doe',
      email: 'john@example.com',
    });
    console.log('Created user:', newUser);

    // POST with custom headers
    const result = await apiClient.post(
      '/users',
      {name: 'Jane Doe'},
      {
        headers: {
          'X-Custom-Header': 'custom-value',
        },
      },
    );
    console.log('Result:', result);
  } catch (error) {
    console.error('POST request error:', error);
  }
}

/**
 * Example 3: PUT and PATCH requests
 */
export async function example_UpdateRequests() {
  try {
    // PUT request (full update)
    const updatedUser = await apiClient.put('/users/123', {
      name: 'John Updated',
      email: 'john.updated@example.com',
    });
    console.log('Updated user (PUT):', updatedUser);

    // PATCH request (partial update)
    const patchedUser = await apiClient.patch('/users/123', {
      name: 'John Patched',
    });
    console.log('Updated user (PATCH):', patchedUser);
  } catch (error) {
    console.error('Update request error:', error);
  }
}

/**
 * Example 4: DELETE request
 */
export async function example_DeleteRequest() {
  try {
    // Delete user
    const result = await apiClient.delete('/users/123');
    console.log('Delete result:', result);
  } catch (error) {
    console.error('DELETE request error:', error);
  }
}

/**
 * Example 5: Custom API client instance
 */
export async function example_CustomApiClient() {
  // Create custom API client with different config
  const customClient = new ApiClient({
    baseURL: 'https://api.custom.com',
    timeout: 60000, // 60 seconds
    headers: {
      'X-API-Key': 'my-api-key',
      'X-Custom-Header': 'value',
    },
  });

  try {
    const data = await customClient.get('/data');
    console.log('Custom client data:', data);
  } catch (error) {
    console.error('Custom client error:', error);
  }
}

/**
 * Example 6: Dynamic base URL
 */
export async function example_DynamicBaseURL() {
  // Get current config
  const config = apiClient.getConfig();
  console.log('Current base URL:', config.baseURL);

  // Update base URL
  apiClient.setBaseURL('https://api.production.com');

  try {
    const data = await apiClient.get('/data');
    console.log('Data from new URL:', data);
  } catch (error) {
    console.error('Error:', error);
  }

  // Restore original URL
  apiClient.setBaseURL('http://localhost:3000/api');
}

/**
 * Example 7: Dynamic headers
 */
export async function example_DynamicHeaders() {
  // Set custom headers
  apiClient.setHeaders({
    'X-User-Agent': 'KooDTX-Mobile-App/1.0',
    'X-Device-ID': 'device-123',
  });

  try {
    const data = await apiClient.get('/data');
    console.log('Data with custom headers:', data);
  } catch (error) {
    console.error('Error:', error);
  }

  // Remove specific header
  apiClient.removeHeader('X-Device-ID');
}

/**
 * Example 8: Typed responses
 */
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export async function example_TypedResponses() {
  try {
    // Type-safe GET request
    const user = await apiClient.get<User>('/users/123');
    console.log('User name:', user.name);
    console.log('User email:', user.email);

    // Type-safe POST request
    const newUser = await apiClient.post<User>('/users', {
      name: 'New User',
      email: 'new@example.com',
    });
    console.log('Created user ID:', newUser.id);

    // With API response wrapper
    const response = await apiClient.get<ApiResponse<User>>('/users/123');
    if (response.success && response.data) {
      console.log('User from response:', response.data.name);
    }
  } catch (error) {
    console.error('Typed request error:', error);
  }
}

/**
 * Example 9: Error handling
 */
export async function example_ErrorHandling() {
  try {
    // This will fail with 404
    await apiClient.get('/non-existent-endpoint');
  } catch (error: any) {
    console.error('Error occurred:');
    console.error('- Message:', error.message);
    console.error('- Code:', error.code);
    console.error('- Status:', error.status);
    console.error('- Details:', error.details);
  }

  try {
    // Network error (invalid URL)
    const badClient = new ApiClient({baseURL: 'http://invalid-url'});
    await badClient.get('/data');
  } catch (error: any) {
    console.error('Network error:');
    console.error('- Message:', error.message);
    console.error('- Code:', error.code);
  }
}

/**
 * Example 10: Direct Axios instance access
 */
export async function example_DirectAxiosAccess() {
  // Get Axios instance for advanced usage
  const axiosInstance = apiClient.getAxiosInstance();

  // Use Axios directly
  try {
    const response = await axiosInstance.request({
      method: 'GET',
      url: '/users',
      params: {
        page: 1,
        limit: 10,
      },
    });
    console.log('Response data:', response.data);
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
  } catch (error) {
    console.error('Direct Axios error:', error);
  }
}
