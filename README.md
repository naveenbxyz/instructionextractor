# SSI Extractor

A full-stack application for extracting structured data from Standard Settlement Instruction (SSI) PDF documents using LLM intelligence. Supports both machine-readable and scanned (image-based) PDFs, with an interactive UI for viewing extraction results and asking follow-up questions via chat.

## Architecture

```
instructionextractor/
├── backend/          # Python FastAPI server
│   ├── client_configs/   # Client-specific extraction schemas (JSON)
│   ├── models/           # Pydantic data models
│   ├── routers/          # API route handlers
│   ├── services/         # Business logic (LLM client, PDF processing, extraction, chat)
│   ├── uploads/          # Uploaded PDF storage
│   ├── main.py           # FastAPI application entry point
│   ├── config.py         # Path configuration
│   └── llm_config.json   # LLM endpoint configuration
└── frontend/         # React + TypeScript + Vite
    └── src/
        ├── api/          # API client functions
        ├── components/   # React components + shadcn/ui
        ├── hooks/        # Custom React hooks
        └── types/        # TypeScript interfaces
```

## Prerequisites

- **Python 3.10+**
- **Node.js 18+** and npm
- An **OpenAI-compatible LLM API** endpoint (OpenAI, Azure OpenAI, or compatible)

## Setup

### 1. Backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure LLM

Edit `backend/llm_config.json` with your LLM provider credentials:

**OpenAI API key:**
```json
{
  "auth_type": "api_key",
  "base_url": "https://api.openai.com/v1",
  "api_key": "sk-your-actual-api-key",
  "model": "gpt-4o",
  "stream": true,
  "verify_ssl": true
}
```

**Azure OpenAI (Azure AD auth):**
```json
{
  "auth_type": "azure_ad",
  "base_url": "https://your-resource.openai.azure.com/openai/deployments/your-deployment",
  "model": "gpt-4o",
  "azure_model": "gpt-4o",
  "stream": true,
  "verify_ssl": true
}
```

Azure AD auth uses the `az` CLI to obtain tokens automatically. Ensure you are logged in via `az login` before starting the server.

| Field | Description |
|-------|-------------|
| `auth_type` | `"api_key"` or `"azure_ad"` |
| `base_url` | LLM API base URL |
| `api_key` | API key (required for `api_key` auth type) |
| `model` | Model name to use |
| `stream` | Enable streaming responses |
| `verify_ssl` | SSL certificate verification |
| `azure_model` | Azure deployment model name (Azure AD only) |
| `ca_bundle` | Path to custom CA bundle (optional) |
| `https_proxy` | HTTPS proxy URL (optional) |

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install
```

## Running the Application

Start both the backend and frontend in separate terminals:

**Terminal 1 - Backend** (runs on port 8000):
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

**Terminal 2 - Frontend** (runs on port 5173):
```bash
cd frontend
npm run dev
```

Open http://localhost:5173 in your browser. The frontend proxies API requests to the backend automatically.

## Usage

1. **Select a client configuration** from the dropdown — this defines which fields to extract from the PDF
2. **Upload a PDF** by dragging and dropping or clicking to browse
3. **View extraction results** — page-by-page with accuracy scores (color-coded: green >= 90%, yellow >= 70%, red < 70%)
4. **Ask follow-up questions** using the chat panel to query the extracted data or document content

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/clients` | List available client configurations |
| `GET` | `/api/clients/{client_id}` | Get a specific client configuration |
| `POST` | `/api/upload` | Upload PDF and extract SSI data (multipart form: `file` + `client_id`) |
| `POST` | `/api/chat` | Chat about extracted document (SSE streaming: `session_id` + `message`) |

API docs are available at http://localhost:8000/docs (Swagger UI) when the backend is running.

## Client Configurations

Client configs define the extraction schema for different document types. They are stored as JSON files in `backend/client_configs/`:

- `xx_fx_settlements.json` — FX settlement instructions
- `yy_custody.json` — Custody and cash account details
- `scanned_iso_bank.json` — Scanned ISO bank format
- `scanned_entity_payments.json` — Scanned entity payment formats

To add a new configuration, create a JSON file in `backend/client_configs/` with this structure:

```json
{
  "id": "my_config",
  "name": "My Config Display Name",
  "prompt": "Additional context for the LLM about this document type",
  "sections": [
    {
      "name": "section_name",
      "description": "What this section contains",
      "fields": ["field_1", "field_2", "field_3"]
    }
  ]
}
```

## Building for Production

```bash
cd frontend
npm run build
```

The built static files will be in `frontend/dist/`. Serve them with any static file server and point API calls to the backend.
