# Transformer Management System

A full-stack application for managing transformer data and inspections.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
  - [Frontend](#frontend)
  - [Backend](#backend)
- [Implemented Features](#implemented-features)
- [Known Limitations / Issues](#known-limitations--issues)
- [Additional Notes](#additional-notes)

---

## Project Structure

```
Transformer-Management-System-Develop_2/
├── frontend/   # React + TypeScript + Vite
├── backend/    # Spring Boot
```

---

## Setup Instructions

### Frontend

1. Navigate to the `frontend` directory:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```
4. Build for production:
   ```sh
   npm run build
   ```

### Backend

1. Navigate to the `backend` directory:
   ```sh
   cd backend
   ```
2. Ensure Java 17+ and Maven are installed.
3. Build the project:
   ```sh
   ./mvnw clean install
   ```
4. Run the application:
   ```sh
   ./mvnw spring-boot:run
   ```
   Or use your IDE to run the main class.

---

## Implemented Features

- Transformer data management (CRUD operations)
- Inspection data entry and display
- Image upload and preview
- Responsive frontend UI
- REST API integration between frontend and backend
- Database support (MySQL/MongoDB)

---

## Known Limitations / Issues

- No authentication or authorization implemented
- Basic error handling for API/network requests
- Database connection settings must be configured in `backend/src/main/resources/application.properties`
- Image upload size limits not enforced
- UI styling and accessibility improvements needed
- No automated tests included yet

---

## Additional Notes

- Frontend uses ESLint for code linting (`frontend/eslint.config.js`)
- Backend documentation available in `backend/HELP.md`
- Ensure backend API endpoints match frontend
