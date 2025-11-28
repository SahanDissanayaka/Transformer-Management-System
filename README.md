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

   **Detection Approach (Overview)**
   - The project uses a Python YOLO runner (bundled under `backend/model/` and `backend/python/`) invoked by the backend service to produce anomaly bounding boxes.
   - The backend saves the raw detection results in `detectionJson` (stored in the DB) and returns the list to the frontend for rendering.
   - When a user modifies or deletes an AI detection, the original detection is saved inside `logs` as `originalAIDetection` with a `userModification` entry to preserve provenance.

- Transformer data management (CRUD operations)
- Inspection data entry and display
- Image upload and preview
- YOLO-based anomaly detection
- Responsive frontend UI
- REST API integration between frontend and backend
- Database support (PostgreSQL)

   **Annotation System (how it works)**
   - **UI actions:** Annotators can approve, edit, add, or reject detections.
   - **Persistence path:** Frontend calls `detectionApi.updateAnomalies` which sends `detectionJson` (current anomaly list) and `logs` (a JSON entry or array) via `PUT /transformer-thermal-inspection/image-data/update`.
   - **Log shape:** A `FeedbackLog` entry is either a `userAddition` or an `originalAIDetection` + `userModification` object. These are appended to the persisted `logs` field for the image.
   - **Removed Anomalies:** Deleted/ rejected AI detections are stored as deletion logs; the frontend reconstructs the `Removed Anomalies` list from those persisted logs on every load.

   ---

- Basic error handling for API/network requests
- Database connection settings must be configured in `backend/src/main/resources/application.yaml`
- Image upload size limits not enforced
- UI styling and accessibility improvements needed
- No automated tests included yet

   ---

   **Form generation & saving mechanism (inspection form)**
   - The inspection/maintenance form is a React form in `InspectionDetailPage.tsx`.
   - When saved, the page calls `inspectionDataApi.updateInspection(...)` which sends form fields to the backend `InspectionDataController` to update the `InspectionDataEntity`.
   - The backend mapper formats date/time and updates only provided fields.

   ---

   **Database schema (record storage overview)**
   - `image_data` table (represented by `ImageDataEntity`):
     - `id` (PK)
     - `transformer_no` (string)
     - `inspection_no` (string)
     - `type` (Thermal/Baseline)
     - `image` (blob)
     - `detection_json` (text) — JSON array of anomalies
     - `logs` (text) — JSON string or array of `FeedbackLog` entries
     - `date_time` (timestamp)

   - `inspection_data` table (represented by `InspectionDataEntity`): fields for inspector name, status, voltages, maintenance details, etc. (see `backend/src/main/java/.../entity/InspectionDataEntity.java`).

   Note: exact column names and types are defined by JPA entities in `backend/src/main/java/.../entity`.

   ---

   **Dependencies**
   - Frontend: Node, npm, React, Vite, TypeScript, Axios.
   - Backend: Java 17+, Spring Boot, Spring Data JPA, Jackson.

   ---

   **Known Bugs & Limitations**
   - Frontend-only state (previously) allowed `Removed Anomalies` to disappear after navigation; recent changes now persist deletions to `logs` and reconstruct them on load. If you still see this, verify `responseData.logs` from the backend contains deletion entries.
   - PowerShell execution policy may block `npm` script execution on Windows; use `cmd.exe` or adjust policy.
   - No role-based auth is enforced — anyone who can reach the UI/API can modify annotations.
   - Some TypeScript `// @ts-nocheck` pragmas are present in a few files (temporary pragmatic fixes). Cleaning these is a follow-up task.
   - CSV export omits some nested provenance details by design; extend `exportFeedback.ts` if you need more columns.

   ---

   **How to verify persisted removed anomalies (debug steps)**
   1. Reject/delete an anomaly in the UI.
   2. Use the view API to inspect `logs`:
   ```cmd
   curl "http://localhost:8080/transformer-thermal-inspection/image-data/view?transformerNo=<NO>&inspectionNo=<ID>&type=Thermal"
   ```
   3. Confirm `responseData.logs` contains entries with `userModification.action == "deleted"`.

   ---

   If you'd like, I can:
   - Add CSV rows for `removedAnomalies` in `frontend/src/utils/exportFeedback.ts`.
   - Add temporary debug prints for the `update` call payload to help trace any missing saves.
   - Prepare a short developer checklist for deployment.

   Contact / Next steps
   - If you want the README trimmed or expanded with diagrams or a quick start script, tell me which format you prefer and I will add it.
