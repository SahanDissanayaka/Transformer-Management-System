# Form Generation & Saving Mechanism

---

## Description of How the Form Generation and Saving Mechanism Works

### Overview

The Transformer Management System provides a dynamic form for entering inspection and maintenance records for transformers. The form is generated based on transformer and inspection data, and supports both system-generated and engineer-editable fields.

### Form Generation

- When a user selects a transformer and inspection, the frontend fetches all relevant data from the backend (transformer metadata, inspection details, maintenance records, images, anomalies).
- The form displays:
  - Read-only system fields (transformer number, pole number, branch, date, time, location, type)
  - Editable engineer fields (inspector name, status, voltage, current, recommended action, remarks, etc.)
  - IR readings, power readings, equipment details, personnel, sign-offs
  - Thermal image and detected anomalies (YOLO model)
- The form layout is responsive and supports scrolling, with action buttons (Save, Generate PDF, Cancel) always visible.

### Saving Mechanism

- When the user clicks **Save Changes**, the frontend collects all editable fields and sends them to the backend via REST API.
- The backend validates and stores the record in the database, associating it with the correct transformer and inspection.
- Maintenance records are updated or created as needed, and linked to the inspection.
- The system supports viewing, editing, and retrieving historical records for each transformer.

---

## Database Schema for Record Storage

### PostgreSQL Tables

#### `transformer`

- `id` (PK)
- `transformer_no` (unique)
- `location_details`
- `type`
- `capacity`
- ...other metadata fields

#### `inspection`

- `id` (PK)
- `transformer_id` (FK)
- `inspection_date`
- `inspected_date`
- `branch`
- `pole_no`
- ...other inspection fields

#### `maintenance_record`

- `id` (PK)
- `inspection_id` (FK)
- `transformer_no`
- `branch`
- `pole_no`
- `location_details`
- `type`
- `inspector_name`
- `engineer_status`
- `voltage`
- `current`
- `recommended_action`
- `additional_remarks`
- `ir_left`, `ir_right`, `ir_front`
- `last_month_kva`, `last_month_date`, `last_month_time`
- `current_month_kva`
- `serial`, `meter_ct_ratio`, `make`
- `start_time`, `completion_time`, `supervised_by`, `tech_i`, `tech_ii`, `tech_iii`, `helpers`
- `inspected_by`, `inspected_by_date`, `reflected_by`, `reflected_by_date`, `re_inspected_by`, `re_inspected_by_date`, `css`, `css_date`
- ...other fields as needed

#### `anomaly`

- `id` (PK)
- `inspection_id` (FK)
- `image_path`
- `box_coordinates`
- `class_name`
- `confidence_score`
- ...other anomaly metadata

---

## Setup and Usage Instructions

### 1. Prerequisites

- Node.js v18+
- Java 17+
- Maven 3.9.11+
- Python 3.10 (for YOLO model)
- PostgreSQL (username: postgres, password: 1234, port: 5432)

### 2. Database Setup

- Configure your database in `backend/src/main/resources/application.yaml`:
  ```yaml
  spring:
    datasource:
      url: jdbc:postgresql://localhost:5432/<your_database_name>
      username: postgres
      password: 1234
  ```
- Create the required tables (see schema above).

### 3. YOLO Model Environment

- In the `backend` directory:
  ```sh
  python3.10 -m venv python/.venv
  python/.venv/Scripts/activate  # Windows
  source python/.venv/bin/activate  # Linux/Mac
  pip install -r python/requirements.txt
  ```
- Always activate the Python virtual environment before running the backend.

### 4. Backend Setup

- In the `backend` directory:
  ```sh
  mvn clean install
  mvn spring-boot:run
  ```

### 5. Frontend Setup

- In the `frontend` directory:
  ```sh
  npm install
  npm run dev
  ```

### 6. Usage

- Access the frontend in your browser (default: http://localhost:5173)
- Log in as engineer or viewer
- Select a transformer and inspection to view or edit records
- Fill out the form and click **Save Changes** to store the record
- Use **Generate PDF** to export the record
- Maintenance history is available for each transformer

---
