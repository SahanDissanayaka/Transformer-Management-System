# Transformer Management System

## Overview

The Transformer Management System is a full-stack application designed to manage transformer data, inspections, and thermal image anomaly detection. The system consists of a **React + TypeScript** frontend and a **Spring Boot** backend.

### Anomaly Detection Approach

For anomaly detection, we trained a **YOLOv8** model using a custom annotated dataset. The model is used to detect anomalies in thermal images uploaded during inspections. The detection process involves the following steps:

1. **Image Upload**: Users upload thermal images through the frontend.
2. **Backend Processing**: The backend invokes a Python script (`anomaly_detection.py`) that uses the YOLOv8 model to analyze the image.
3. **Anomaly Detection**: The model identifies anomalies, such as hotspots, and returns structured data (bounding boxes, confidence scores, and anomaly types).
4. **Visualization**: The frontend displays the detected anomalies on the uploaded image for user review.

---

## Setup and Run Instructions

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
2. Ensure **Java 17+** and **Maven** are installed.
3. Build the project:
   ```sh
   ./mvnw clean install
   ```
4. Run the application:
   ```sh
   ./mvnw spring-boot:run
   ```
   Alternatively, use your IDE to run the `TransformerUiApplication` class.

### Anomaly Detection Model

1. Ensure Python 3.10 is installed.
2. Install the required Python dependencies:
   ```sh
   pip install -r backend/python/requirements.txt
   ```
3. The YOLOv8 model (`best.pt`) is pre-trained and located in `backend/python/model/`. Ensure this file is present.

---

## Dependencies

### Frontend

- **React**: UI framework
- **Vite**: Build tool
- **TypeScript**: Type safety
- **React Query**: Data fetching and caching
- **Zod**: Schema validation

### Backend

- **Spring Boot**: Backend framework
- **Hibernate/JPA**: ORM for database interaction
- **MySQL/MongoDB**: Database support
- **Python**: For anomaly detection
- **YOLOv8**: Pre-trained model for image analysis

---

## Known Limitations

1. **No Authentication**: The system lacks user authentication and authorization.
2. **Error Handling**: Basic error handling for API and network requests.
3. **Image Upload Size**: No enforced limits on image upload size.
4. **Styling**: UI styling and accessibility improvements are needed.
5. **Testing**: No automated tests are included.
6. **Database Configuration**: Database connection settings must be manually configured in `backend/src/main/resources/application.properties`.

---

## Additional Notes

- The backend documentation is available in `backend/HELP.md`.
- Ensure the backend API endpoints match the frontend requests.
- The anomaly detection model (`best.pt`) is pre-trained and should not be modified unless retraining is required.
