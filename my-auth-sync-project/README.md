# My Auth Sync Project

This project implements an authentication system using JWT and integrates with Google API, including CRUD operations and synchronization with CalDAV.

## Features

- User authentication with JWT
- Google API integration for data management
- CRUD operations for user and data entities
- Synchronization with CalDAV for calendar events
- Token management and refresh logic

## Technologies Used

- TypeScript
- Node.js
- Express
- JWT for authentication
- Google APIs
- CalDAV

## Project Structure

```
my-auth-sync-project
├── src
│   ├── controllers          # Contains controllers for handling requests
│   ├── services             # Contains services for business logic
│   ├── models               # Contains data models
│   ├── config               # Configuration settings
│   ├── utils                # Utility functions
│   └── app.ts               # Entry point of the application
├── package.json             # NPM configuration file
├── tsconfig.json            # TypeScript configuration file
├── .env                     # Environment variables
└── README.md                # Project documentation
```

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd my-auth-sync-project
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Create a `.env` file in the root directory and add your environment variables:
   ```
   PORT=3000
   JWT_SECRET=your_jwt_secret
   GOOGLE_API_KEY=your_google_api_key
   CALDAV_URL=your_caldav_url
   ```

5. Start the application:
   ```
   npm start
   ```

## Usage

- **Authentication**: Use the `/auth` endpoints for user registration, login, and token refresh.
- **Data Management**: Use the `/data` endpoints for creating, updating, and deleting data.
- **Google API**: Interact with Google APIs through the integrated services.
- **CalDAV Synchronization**: Scheduled pulls for calendar events can be managed through the CalDAV service.

## Development Guidelines

- Follow the coding standards and best practices for TypeScript and Node.js.
- Write unit tests for all services and controllers.
- Document any new features or changes in the README.

## License

This project is licensed under the MIT License.