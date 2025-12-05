# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Token Efficiency Rule

**CRITICAL**: Minimize token usage. Execute tasks directly without explanatory text. Only provide brief confirmations (✅) or essential error details. Do not describe what you're doing, what you did, or summarize actions unless explicitly requested.

## Project Overview

FORFIRE PDF Generator is a Node.js web application for creating professional fire safety service proposals. The system generates PDF documents from HTML templates using Puppeteer and manages proposal/client data with SQLite.

## Development Commands

```bash
# Install dependencies
npm install

# Development mode (auto-restart with nodemon)
npm run dev

# Production mode
npm start

# Import client data from Excel
npm run import-clients

# Production deployment with PM2
pm2 start ecosystem.config.js
pm2 logs forfire-pdf-generator
```

## Architecture Overview

### Core Components

**Server Architecture (server.js)**
- Express.js web server on port 3001
- SQLite database with two tables: `proposals` and `clients`
- Puppeteer PDF generation with custom styling and watermarks
- RESTful API for CRUD operations
- Static file serving from `/public`

**Frontend Architecture (public/)**
- Single-page application with Bootstrap 5 UI
- QuillJS rich text editors for proposal sections
- Real-time PDF preview with live HTML rendering
- Modal-based client management system
- Manual save system (proposals save only when user clicks "Salvar Proposta")

**Database Schema**
```sql
-- Proposals table
CREATE TABLE proposals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero TEXT UNIQUE,        -- Format: FFS-01-2025 or FFP-01-2025
  payload TEXT,              -- JSON serialized proposal data
  created TEXT
);

-- Clients table  
CREATE TABLE clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT UNIQUE,
  endereco TEXT,
  cnpj TEXT
);
```

### Key Features

**Proposal Management**
- Two company types: FORFIRE Serviços (FFS prefix) and FORFIRE Prevenção (FFP prefix)
- Auto-generated sequential proposal numbers per company/year
- Multi-section proposals: presentation, object, services, budget, observations, clarifications
- Service selection from predefined 23 fire safety services
- Client data integration with contact information

**PDF Generation Pipeline**
1. HTML template assembly from form data
2. Image conversion to base64 (logo, signature, watermark)
3. Puppeteer rendering with custom CSS for print layout
4. A4 format with margins, watermark, and professional styling
5. Binary PDF download with proper headers

**Client Management**
- Complete CRUD interface via modal dialogs
- SQLite storage with data validation
- Search/filter functionality
- Excel import capability for existing client lists
- Real-time dropdown updates

### Important Implementation Details

**Save Behavior**: Proposals are saved ONLY when user explicitly clicks "Salvar Proposta" button - no auto-save functionality.

**Client Workflow**: 
1. User selects client from dropdown (populates hidden fields)
2. User fills contact information
3. User clicks "OK" button to update proposal preview
4. Client info appears in format: "À [CLIENT_NAME] A/C [CONTACT_NAME]"

**PDF Styling**: Custom CSS handles print layout, page breaks, typography (Calibri font), and watermark positioning. All images converted to base64 for self-contained PDFs.

**Company Switching**: Changing company automatically updates proposal number prefix and regenerates sequential number for new company context.

## File Structure Importance

- `server.js` - Single file containing all backend logic (API routes, database, PDF generation)
- `public/main.js` - Frontend application logic (40K+ lines, handles all UI interactions)
- `public/index.html` - Complete UI structure with Bootstrap modals
- `public/style.css` - Custom styles including PDF-specific print media queries
- `ecosystem.config.js` - PM2 production configuration
- Database files stored in `C:/Forfire_Dados/` directory (Windows-specific path)

## Development Notes

The application uses a monolithic architecture with extensive client-side JavaScript for UI management. The save system is intentionally manual to give users control over when data persists. PDF generation includes sophisticated styling to match professional proposal formatting requirements.