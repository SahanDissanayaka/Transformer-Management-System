# Transformer Management System

A full-stack application for managing transformer data, inspections, and anomaly detection using YOLO.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Frontend Setup](#frontend-setup)
- [Backend Setup](#backend-setup)
- [YOLO Model Setup](#yolo-model-setup)
- [Database Configuration](#database-configuration)
- [Implemented Features](#implemented-features)
- [Known Limitations / Issues](#known-limitations--issues)
- [Additional Notes](#additional-notes)

---

## Prerequisites

Before running the project, make sure you have the following installed:

### Frontend

- **Node.js** (v22.18 recommended)
- **npm** (comes with Node.js)
- **React** (installed via npm)

### Backend

- **Java 17**
- **Spring Boot** (included via Maven)
- **Maven** (v3.9.11 recommended)
- **Python 3.10** (required for YOLO model)

### Database

- **PostgreSQL**
  - Username: `postgres`
  - Password: `1234`
  - Port: `5432`

---

## Environment Setup

### YOLO Model Environment

To run the YOLO model for anomaly detection:

1. **Open a terminal and navigate to the backend directory:**
   ```sh
   cd backend
   ```
2. **Create a Python virtual environment (using Python 3.10):**
   ```sh
   python3.10 -m venv python/.venv
   ```
3. **Install required Python packages:**
   ```sh
   python/.venv/Scripts/activate  # On Windows
   source python/.venv/bin/activate  # On Linux/Mac
   pip install -r python/requirements.txt
   ```
4. **Activate the environment:**
   - Windows: `python/.venv/Scripts/activate`
   - Linux/Mac: `source python/.venv/bin/activate`

**Important:**

> After the first time you install dependencies, you must always activate the Python virtual environment before running the backend. This ensures the YOLO model is available and working.

---

## Backend Setup

1. **Navigate to the backend directory:**
   ```sh
   cd backend
   ```
2. **Build and run the backend:**
   ```sh
   mvn clean install
   mvn spring-boot:run
   ```
   Or use your IDE to run the main class.

**Note:**

> Always activate the Python virtual environment before running the backend server.

---

## Frontend Setup

1. **Navigate to the frontend directory:**
   ```sh
   cd frontend
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Start the development server:**
   ```sh
   npm run dev
   ```
4. **Build for production:**
   ```sh
   npm run build
   ```

---

## Database Configuration

- Ensure PostgreSQL is running and accessible.
- Create a database for the project (if not already created).
- Update your database settings in `backend/src/main/resources/application.yaml`:
  ```yaml
  spring:
    datasource:
      url: jdbc:postgresql://localhost:5432/<your_database_name>
      username: postgres
      password: 1234
  ```
- Default port is `5432`.

---

## Implemented Features

- Transformer data management (CRUD operations)
- Inspection data entry and display
- Image upload and preview
- YOLO-based anomaly detection
- Responsive frontend UI
- REST API integration between frontend and backend
- Database support (PostgreSQL)

---

## Known Limitations / Issues

- Basic error handling for API/network requests
- Database connection settings must be configured in `backend/src/main/resources/application.yaml`
- Image upload size limits not enforced
- UI styling and accessibility improvements needed
- No automated tests included yet

---

## Additional Notes

- Frontend uses ESLint for code linting (`frontend/eslint.config.js`)
- Backend documentation available in `backend/HELP.md`
- Ensure backend API endpoints match frontend
