# Transformer Management System — Developer Guide

This document summarizes the project's capabilities, development and run instructions, debugging tips, common issues and recommended practices. It's written to help developers get the backend and frontend running, understand key integration points, and make safe changes.

---

## Quick overview / capabilities

- Web UI (frontend, Vite + React + TypeScript)
  - Upload baseline and thermal images
  - Display thermal image annotations and AI-detected bounding boxes
  - Draw, edit, accept/reject, and delete annotations (polygon and bbox support)
  - Inline annotation toolbar, annotation canvas, annotation lists (Error Cards)
  - Rules modal and simple image transforms (zoom/rotate/pan)

- Backend (Spring Boot, Java)
  - REST API for transformers, inspections, images, and annotations
  - Integrates with a Python-based anomaly detection model (YOLOv8-style model under `backend/model/python`)
  - Passes Python executable via JVM system property `-Dpython.exec` (see `run_backend.cmd`)
  - Example endpoints include image upload/view, annotations CRUD, detection triggers

- Model / AI
  - Model artifacts in `backend/model/model/best.pt` and detection utilities in `backend/model/python`
  - Python helper scripts and requirement files provided; integration executed from Java through a configurable python path

- Tests and utilities
  - Backend: Maven-based project with `mvnw` wrapper for consistent builds
  - Frontend: Vite dev/build; `npm run dev`, `npm run build`

---

## How to run (Windows / CMD)

Prerequisites:
- Java 17+
- Node.js 18+ (or project-supported version)
- npm (comes with Node) or pnpm if preferred
- Conda/Miniconda (for Python model environment) if you plan to run model code locally

1) Backend — run (development)

Open cmd, then:

```cmd
cd /d "d:\UOM\Semester 07\SOFTWARE DESIGN COMPETITION\phase 3\Transformer-Management-System-main\Transformer-Management-System-main\backend"
run_backend.cmd
```

What the script does:
- `run_backend.cmd` sets `PYTHON_EXEC` to a configured conda env (example: `C:\Users\Rebecca Fernando\miniconda3\envs\softwareProject\python.exe`) and passes it to Maven as the JVM property `-Dpython.exec="<path>"` so the Java code can invoke Python consistently.
- It runs `mvn -DskipTests -Dpython.exec="..." spring-boot:run` by default.

Alternative (package):
```cmd
cd /d "...\backend"
mvnw.cmd -DskipTests package
java -Dpython.exec="C:\path\to\python.exe" -jar target\TransformerUI-0.0.1-SNAPSHOT.jar
```

2) Frontend — run (development)

Open another terminal and run:

```cmd
cd /d "...\frontend"
npm install   # only once
npm run dev
```

- Vite runs normally on port 5173 during dev (you may see another port if occupied).
- Production bundle: `npm run build` creates `dist/`.

3) Health / quick checks
- Backend default: http://localhost:8080/ (or configured server.port)
- Frontend dev (Vite): http://localhost:5173/
- If Spring Actuator is enabled, check `/actuator/health`.

---

## Configuration pointers

- Python executable for model inference is passed via JVM system property `python.exec`. The run script sets `PYTHON_EXEC` environment variable and passes it to Maven. Java code should read `System.getProperty("python.exec")`.
- Backend properties are in `src/main/resources/application.yml` and `application.properties`.

---

## Notable recent fixes & gotchas (developer notes)

- Logging constants: some controllers referenced `REQUEST_INITIATED_LOG` and `REQUEST_TERMINATED_LOG` while a constants class defined `REQUEST_INITIATED` and `REQUEST_TERMINATED`. Backwards-compatible alias constants were added to `backend/src/main/java/com/TransformerUI/TransformerUI/constant/LoggingAdviceConstants.java` to avoid compilation errors.

- Frontend runtime crash: "Cannot read properties of undefined (reading 'filter')"
  - Cause: `annotations` array state was occasionally set to `undefined` when `response.responseData.annotations` was missing from the backend response or when optimistic updates assumed a defined `prev` value.
  - Fixes implemented in `frontend/src/pages/InspectionDetailPage.tsx` and `frontend/src/components/AnnotationCanvas.tsx`:
    - Use `response.responseData.annotations ?? []` when setting state from API responses.
    - Use `(prev || [])` in functional updates (e.g., `setAnnotations(prev => (prev || []).map(...))`).
    - Defensive checks in components (e.g., `(annotations || []).filter(...)`).
  - Recommended long-term fix: ensure backend always returns `annotations: []` when no annotations exist.

- Vite/TypeScript syntax errors: If you see `[plugin:vite:react-babel] ... 'return' outside of function` it usually indicates a malformed JSX/TSX block or an accidental extra brace; check the recently edited functions (e.g., `handleMouseDown`) for correct braces.

---

## Debugging tips

- Backend compile errors
  - Re-run Maven with `-e` or `-X` for full stack traces.
  - Typical fixes: missing imports, wrong constant names, or Java 17+ language level mismatches.

- Frontend runtime errors (React)
  - Use browser devtools console to see stack traces (Vite overlay shows helpful locations).
  - If a component tries to call `.filter` on a prop/state, add defensive checks or correct the data flow.

- Confirm Python path used by backend
  - The `run_backend.cmd` echoes `Using PYTHON_EXEC=...` on startup.
  - Inspect the running Java process command line in Windows to find `-Dpython.exec="..."`.

- Logs
  - Backend: console logs (Spring Boot) and any configured log files. Use log statements to print `python.exec` or other properties at startup.
  - Frontend: browser console and Vite terminal output.

---

## Recommended changes & best practices

- Backend should always return consistent API shapes (e.g., arrays rather than `null`/`undefined`) — this simplifies frontend code and avoids defensive duplication.
- Keep API response validators (or TypeScript runtime checks) to surface schema changes early.
- Add unit/integration tests around annotation loading and AI detection endpoints to avoid regressions.
- When editing shared constants (like logging templates), prefer adding aliases or updating all callers in one change and run a full build to catch naming mismatches.

---

## Contributing

- Create a branch per change. Run backend and frontend locally to validate the UI and API interactions.
- Run `mvnw.cmd -DskipTests package` to verify backend compiles, and `npm run build` for the frontend production bundle.
- For CI, ensure Python model environment is available or stubbed (for tests that exercise model code).

---

## Useful file locations

- Backend root: `backend/`
  - Main Java code: `backend/src/main/java/com/TransformerUI/TransformerUI/`
  - Logging constants: `.../constant/LoggingAdviceConstants.java`
  - Run script: `backend/run_backend.cmd` (Windows) — sets `PYTHON_EXEC`.
  - Model: `backend/model/` (includes `python/` helper scripts and `model/best.pt`)

- Frontend root: `frontend/`
  - Pages: `frontend/src/pages/`
  - Components: `frontend/src/components/` (e.g. `AnnotationCanvas.tsx`, `AnnotationToolbar.tsx`)
  - API clients: `frontend/src/api/` (annotationApi, imageApi, etc.)

---

## Quick checklist for "it broke" scenarios

- Backend compilation errors mentioning missing symbols:
  - Check for mismatched constant names in `LoggingAdviceConstants` or other constant classes.
  - Run `mvnw.cmd -DskipTests package` locally and fix compile errors.

- Frontend runtime crash "Cannot read properties of undefined (reading 'filter')":
  - Confirm `getAnnotations` backend response includes `responseData.annotations` as an array.
  - Look for `setAnnotations(response.responseData.annotations)` and change to `?? []` if needed.

- Vite parser errors about 'return' outside of function or unexpected token:
  - Check recently modified TSX files for misplaced braces or incomplete JSX.

---

If you want, I can:
- Start the frontend dev server now and show the inspection page so you can confirm the fix.
- Add a short backend API contract (example response shapes) to reduce future schema mismatches.
- Add small smoke tests for the annotation-loading path.

If you'd like the README in a different filename (e.g., `README.md` overwrite) or different format, tell me where to place it and I will update it.

---

Last updated: November 24, 2025
