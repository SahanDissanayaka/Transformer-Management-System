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
   # Transformer Management System

   This repository is a full-stack application for managing transformers and their thermal inspections. It contains a React + TypeScript frontend and a Spring Boot backend that persists images, detection results and annotation/feedback logs.

   **Contents**
   - **Frontend:** `frontend/` — React, TypeScript, Vite
   - **Backend:** `backend/` — Spring Boot, JPA repository layer

   **Quick start**
   - Start backend first, then frontend (detailed steps below).

   **Important:** Use a Windows `cmd.exe` shell for the frontend dev commands on Windows to avoid PowerShell execution-policy issues when running `npm` (or run PowerShell as Administrator and change execution policy if needed).

   ---

   **Project Summary**
   - **Purpose:** Capture AI detections on thermal images, allow annotators to modify/add/delete anomalies, persist feedback, and export feedback logs for model improvement.
   - **Storage:** The backend persists images, detection JSON and `logs` (a JSON string) per image record.

   ---

   **Setup & Run**

   **Backend (recommended Java 17+, Maven)**
   - Install Java 17+ and Maven (or use included `mvnw`).
   - From repository root:
   ```cmd
   cd "c:\Users\Rebecca Fernando\Downloads\Transformer-Management-System-phase4_dev (2)\Transformer-Management-System-phase4_dev\backend"
   ./mvnw clean install
   ./mvnw spring-boot:run
   ```

  **Python helper for detection (required before running the backend)**

  The backend uses a small Python helper (under `backend/python/`) for running the AI detector. Prepare a Python 3.10 virtual environment, install the Python dependencies, then start the backend. Below are cross-platform steps and examples — pick the section that matches your OS.

  1) Create and activate a Python 3.10 virtual environment

  - Windows (cmd.exe):

  ```cmd
  cd backend\python
  # Use the 'py' launcher if you have multiple Python versions
  py -3.10 -m venv .venv
  .venv\Scripts\activate
  python -m pip install --upgrade pip
  ```

  - macOS / Linux (bash/zsh):

  ```bash
  cd backend/python
  python3.10 -m venv .venv
  source .venv/bin/activate
  python -m pip install --upgrade pip
  ```

  2) Install required Python packages

  If a `requirements.txt` exists in `backend/python/`, install it; otherwise install `utlist` directly:

  ```bash
  pip install -r requirements.txt    # preferred if available
  # or (minimal):
  pip install utlist
  ```

  3) Start the backend

  - On Windows you can use the provided wrapper script which may ensure the Python helper is used:

  ```cmd
  cd ../..\backend
  run_backend.cmd
  ```

  - On macOS/Linux (or if you prefer Maven directly), use the Maven wrapper from the `backend` folder:

  ```bash
  cd backend
  ./mvnw spring-boot:run
  ```

  Notes:
  - The examples assume `python3.10` or the `py -3.10` launcher is installed on your system. If you have a different Python installation, point the `venv` creation to the correct executable.
  - The backend exposes its API on the configured port (see `backend/src/main/resources/application.yml`).
  - If you run into permission or execution-policy issues on Windows PowerShell, use `cmd.exe` or adjust the policy appropriately.
   - The backend exposes API under the configured base URL (see `backend/src/main/resources/application.yml`).

   **Frontend (Node 18+, npm)**
   - From repository root, open `cmd.exe` and run:
   ```cmd
   cd "c:\Users\Rebecca Fernando\Downloads\Transformer-Management-System-phase4_dev (2)\Transformer-Management-System-phase4_dev\frontend"
   npm install
   npm run dev
   ```
   - Production build:
   ```cmd
   npm run build
   ```

   ---

   **Implemented Features**
   - **Image upload:** Upload thermal and baseline images to the backend.
   - **AI Detection:** Backend runs YOLO-based detection and stores `detectionJson` on the image record.
   - **Annotation UI:** View AI detections, edit bounding boxes, add manual anomalies and reject/delete detections.
   - **Feedback Logs:** Every user change (add/modify/delete) writes a `FeedbackLog` entry which is persisted in the image `logs` column.
   - **Export:** Frontend can export feedback as JSON and CSV for model training/analysis.
   - **Maintenance Form:** Fill and save inspector/maintenance form data tied to inspections.

---

## Implemented Features

   ---

---

## Known Limitations / Issues

   **Backend structure used to persist annotations**
   - `ImageDataEntity` (JPA entity) contains `detectionJson` and `logs` columns.
   - `CustomMapper.updateEntity(...)` copies incoming `ImageRequest.detectionJson` and `ImageRequest.logs` into the entity before saving.
   - Controller endpoint: `PUT /transformer-thermal-inspection/image-data/update` → `ImageDataService.updateImage(...)` → persist entity.
   - When the frontend requests `GET /transformer-thermal-inspection/image-data/view`, the backend returns the `ImageResponse` containing `responseData.logs` (string or JSON) and `anomaliesResponse` built from `detectionJson`.

---

## Additional Notes

- Frontend uses ESLint for code linting (`frontend/eslint.config.js`)
- Backend documentation available in `backend/HELP.md`
- Ensure backend API endpoints match frontend
