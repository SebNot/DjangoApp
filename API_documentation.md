# My Django API Documentation

## Introduction

This documentation outlines the structure and functionality of the Django API for user management and profile handling, including user registration, authentication, profile management, and account deletion.

## Components of the API

The API is composed of several key components that work together to provide robust and scalable endpoints:

### Models
- Define the structure of the database tables.
- `User`: Django's built-in user model.
- `UserProfile`: Represents a user's profile with fields like alias, avatar, wins, and losses.

### Serializers
- Handle data conversion between model instances and JSON.
- `UserSerializer`: Manages serialization for user creation.
- `UserProfileSerializer`: Handles serialization for user profile data.

### Views
- Contain the logic for processing API requests and returning responses.
- `UserCreate`: Manages user registration.
- `LoginView`: Handles user authentication and token generation.
- `UserProfileDetail`: Handles retrieval and update of user profiles.
- `UserDelete`: Manages deletion of user accounts and associated profiles.

### URL Routing
- Maps URLs to views.
- Connects `/register/` to `UserCreate` for user registration.
- Links `/login/` to `LoginView` for user authentication.
- Links `/profile/` to `UserProfileDetail` for user profile management.
- Links `/delete_user/` to `UserDelete` for user account deletion.

## API Endpoints

### User Registration

#### Register a New User

- **Endpoint:** `/register/`
- **HTTP Method:** POST
- **Description:** Registers a new user and creates an associated user profile.
  
##### Request

- **Headers:** 
  - `Content-Type: application/json`

- **Request Body:** 
  - `username` (string): Desired username.
  - `password` (string): Password for the account.

##### Response

- **Status Code:** 201 Created (on success)
- **Response Body:** JSON object containing the username.

#### Log In a User

- **Endpoint:** `/login/`
- **HTTP Method:** POST
- **Description:** Authenticates a user and returns a token for authorized access.

##### Request

- **Headers:** 
  - `Content-Type: application/json`

- **Request Body:** 
  - `username` (string): User's username.
  - `password` (string): User's password.

##### Response

- **Status Code:** 200 OK (on success)
- **Response Body:** JSON object containing the authentication token.

### User Profile Management

#### Retrieve, Update, or Partially Update User Profile

- **Endpoint:** `/profile/`
- **HTTP Method:** 
  - GET (retrieve)
  - PUT (full update)
  - PATCH (partial update)
- **Description:** Retrieves, updates, or partially updates the authenticated user's profile.

##### Request for Retrieval

- **Headers:** 
  - `Authorization: Token <user_token>`

##### Response for Retrieval

- **Status Code:** 200 OK
- **Response Body:** JSON object containing user profile details such as alias, avatar, wins, and losses.

##### Request for Full Update (PUT)

- **Headers:** 
  - `Content-Type: application/json`
  - `Authorization: Token <user_token>`

- **Request Body:** 
  - `alias` (string, optional): New alias for the user.
  - `avatar` (file, optional): New avatar image for the user.
  - `wins` (integer, optional): Updated number of wins.
  - `losses` (integer, optional): Updated number of losses.

##### Request for Partial Update (PATCH)

- **Headers:** 
  - `Content-Type: application/json`
  - `Authorization: Token <user_token>`

- **Request Body:** 
  - Any combination of the following fields:
    - `alias` (string, optional): New alias for the user.
    - `avatar` (file, optional): New avatar image for the user.
    - `wins` (integer, optional): Updated number of wins.
    - `losses` (integer, optional): Updated number of losses.

##### Response for Update (PUT/PATCH)

- **Status Code:** 200 OK (on successful update)
- **Response Body:** JSON object with the updated user profile data.

## Notes

- All endpoints require authentication, except for the user registration and login endpoints.
- User profile updates and account deletion are only allowed for the authenticated user's own profile/account.

## Error Handling

- **400 Bad Request:** Returned if the request body or query parameters are invalid.
- **401 Unauthorized:** Returned if the user is not authenticated or the token is invalid.
- **403 Forbidden:** Returned if the user is authenticated but not authorized to access the requested resource.
- **404 Not Found:** Returned if the requested resource does not exist.
- **500 Internal Server Error:** Returned if an unexpected error occurs on the server.

## Conclusion

This API documentation covers user registration, authentication, profile management, and account deletion in the Django application. It is designed to be clear and comprehensive for effective integration with front-end applications or other services.