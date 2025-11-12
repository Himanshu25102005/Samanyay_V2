/**
 * Utility functions for handling user information in API requests
 */

/**
 * Extracts user ID from request headers or cookies
 * @param {Request} request - The incoming request
 * @returns {string} - User ID or default user ID
 */
export function extractUserId(request) {
  try {
    // Try to get user ID from headers first
    const userIdHeader = request.headers.get('x-user-id');
    if (userIdHeader) {
      return userIdHeader;
    }

    // Try to get user ID from cookies
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {});
      
      if (cookies.userId) {
        return cookies.userId;
      }
      if (cookies.user_id) {
        return cookies.user_id;
      }
    }

    // Try to get user ID from authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        // In a real implementation, you would decode the JWT token here
        // For now, we'll use a simple approach
        return 'authenticated_user';
      } catch (error) {
        // Error parsing auth token - use fallback
      }
    }

    // Default fallback
    return 'default_user';
  } catch (error) {
    // Error extracting user ID - use fallback
    return 'default_user';
  }
}

/**
 * Adds user ID to request headers
 * @param {Headers} headers - The headers object to modify
 * @param {string} userId - The user ID to add
 */
export function addUserIdToHeaders(headers, userId) {
  headers.set('x-user-id', userId);
  headers.set('x-user-identifier', userId);
}

/**
 * Adds user ID to query parameters
 * @param {URLSearchParams} searchParams - The search params object
 * @param {string} userId - The user ID to add
 */
export function addUserIdToQuery(searchParams, userId) {
  searchParams.set('user_id', userId);
  searchParams.set('userId', userId);
}

/**
 * Adds user ID to request body (for JSON requests)
 * @param {Object} body - The request body object
 * @param {string} userId - The user ID to add
 * @returns {Object} - Modified body with user ID
 */
export function addUserIdToBody(body, userId) {
  if (typeof body === 'object' && body !== null) {
    return {
      ...body,
      userId: userId,
      user_id: userId
    };
  }
  return body;
}
