# Backend Setup and Run Guide

## ✅ Fixed Issues

1. **Empty annotation files** - All annotation-related Java files have been implemented
2. **Python path configuration** - Scripts now properly use your Conda environment
3. **Database schema** - Annotations table creation script provided

## 🚀 Quick Start

### Option 1: Using start_backend.cmd (Recommended)

```cmd
cd "d:\UOM\Semester 07\SOFTWARE DESIGN COMPETITION\phase 3\Transformer-Management-System-main\Transformer-Management-System-main\backend"
start_backend.cmd
```

This script will:
- ✅ Verify Python and packages
- ✅ Check YOLO model file
- ✅ Compile the backend
- ✅ Start the server with correct Python path

### Option 2: Using run_backend.cmd

```cmd
cd "d:\UOM\Semester 07\SOFTWARE DESIGN COMPETITION\phase 3\Transformer-Management-System-main\Transformer-Management-System-main\backend"
run_backend.cmd
```

## 📋 Prerequisites

### 1. Database Setup

Run this SQL script in your PostgreSQL database:

```cmd
psql -U your_username -d your_database -f create_annotations_table.sql
```

Or manually execute the SQL from `create_annotations_table.sql`

### 2. Python Environment

Your Conda environment `softwareProject` should have:
- ✅ Python 3.10+
- ✅ ultralytics
- ✅ opencv-python
- ✅ numpy
- ✅ pillow

To install missing packages:

```cmd
call "C:\Users\Rebecca Fernando\miniconda3\Scripts\activate" softwareProject
pip install ultralytics opencv-python numpy pillow
```

### 3. YOLO Model

Ensure `backend/python/model/best.pt` exists (YOLO model file)

## 🔧 Diagnostics

If backend won't start, run diagnostics:

```cmd
cd "d:\UOM\Semester 07\SOFTWARE DESIGN COMPETITION\phase 3\Transformer-Management-System-main\Transformer-Management-System-main\backend"
diagnose_backend.cmd
```

This will check:
- ✅ Python path and version
- ✅ Required packages
- ✅ YOLO model file
- ✅ Maven and Java
- ✅ Project structure

## 📝 What Was Fixed

### 1. Annotation System Implementation

Created complete annotation system with:

**AnnotationEntity.java** - Database entity with fields:
- bbox, polygon, shape (for both box and polygon annotations)
- className, confidence, annotationType
- status (pending/accepted/rejected)
- comment, userId, timestamps

**AnnotationRepository.java** - JPA repository for database operations

**AnnotationService.java** - Service interface

**AnnotationServiceImpl.java** - Service implementation with:
- saveAnnotation
- getAnnotations
- updateAnnotation
- deleteAnnotation

**AnnotationController.java** - REST API endpoints:
- POST   `/transformers/{id}/inspections/{id}/annotations` - Create
- GET    `/transformers/{id}/inspections/{id}/annotations` - List all
- PUT    `/transformers/{id}/inspections/{id}/annotations/{id}` - Update
- DELETE `/transformers/{id}/inspections/{id}/annotations/{id}` - Delete

### 2. Python Configuration

Updated scripts to use your Conda environment:
- `run_backend.cmd` - Now passes `-Dpython.exec` to Maven
- `run_backend.ps1` - PowerShell version
- `start_backend.cmd` - New comprehensive startup script

### 3. Database Schema

Created `create_annotations_table.sql` with:
- Annotations table structure
- Sequences and indexes
- All required columns for polygon support

## 🎯 Expected Behavior

When backend starts successfully, you should see:

```
Using PYTHON_EXEC=C:\Users\Rebecca Fernando\miniconda3\envs\softwareProject\python.exe
[INFO] Building TransformerUI 0.0.1-SNAPSHOT
...
Started TransformerUiApplication in X.XXX seconds
```

## 🐛 Troubleshooting

### Issue: "Python not found"
**Solution:** Check Conda environment name matches "softwareProject"

### Issue: "Package not found" errors
**Solution:** Install packages:
```cmd
conda activate softwareProject
pip install ultralytics opencv-python numpy pillow
```

### Issue: "Model not found"
**Solution:** Ensure `backend/python/model/best.pt` exists

### Issue: "Table annotations does not exist"
**Solution:** Run `create_annotations_table.sql` in your database

### Issue: Compilation errors
**Solution:** All Java files are now complete. Run:
```cmd
mvn clean compile
```

## 📂 File Structure

```
backend/
├── start_backend.cmd          ← NEW: Best way to start
├── run_backend.cmd            ← Updated with -Dpython.exec
├── diagnose_backend.cmd       ← NEW: Run diagnostics
├── verify_conda_env.cmd       ← NEW: Check Python env
├── create_annotations_table.sql ← NEW: Database setup
├── python/
│   ├── model/best.pt          ← Ensure this exists
│   └── anomaly_detection.py
└── src/main/java/.../
    ├── controller/
    │   └── AnnotationController.java ← FIXED: Now complete
    ├── entity/
    │   └── AnnotationEntity.java     ← FIXED: Now complete
    ├── repository/
    │   └── AnnotationRepository.java ← FIXED: Now complete
    └── service/
        ├── AnnotationService.java         ← FIXED: Now complete
        └── impl/
            └── AnnotationServiceImpl.java ← FIXED: Now complete
```

## ✨ Next Steps

1. **Start backend:** Run `start_backend.cmd`
2. **Upload thermal image:** Should now detect anomalies using Conda Python
3. **Test annotations:** Frontend can now save/edit polygon annotations

## 📞 Support

If issues persist after following this guide:
1. Run `diagnose_backend.cmd` and check output
2. Check backend logs for specific errors
3. Ensure database is running and accessible
4. Verify Conda environment is activated
