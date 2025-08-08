# Manga Creator Backend Contracts

## API Endpoints Specification

### 1. Script Management
```
POST /api/scripts/parse
Input: { title: string, content: string, style: string }
Output: { id: string, parsed_scenes: Scene[], character_list: Character[] }
```

```
GET /api/scripts/{script_id}
Output: { id, title, content, style, parsed_scenes, created_at }
```

```
GET /api/scripts
Output: { scripts: Script[] }
```

### 2. Character Management  
```
POST /api/characters
Input: { name: string, description: string, tags: string[], imageRef?: string }
Output: { id: string, ...character_data }
```

```
GET /api/characters
Output: { characters: Character[] }
```

```
DELETE /api/characters/{character_id}
Output: { success: boolean }
```

### 3. Manga Generation
```
POST /api/generate/panel
Input: { scene_data: object, style: string, character_refs: object[] }
Output: { panel_id: string, image_url: string, prompt_used: string }
```

```
POST /api/generate/manga
Input: { script_id: string, style: string, options: object }
Output: { job_id: string, status: "started" }
```

```
GET /api/generate/status/{job_id}
Output: { status: "processing"|"completed"|"failed", progress: number, panels: Panel[] }
```

### 4. Export & Download
```
GET /api/export/manga/{script_id}
Output: PDF file or ZIP of images
```

## Database Models

### Script Model
- id: Primary Key
- title: String
- content: Text (raw script)
- style: String (shounen, shoujo, etc)
- parsed_data: JSON
- created_at: DateTime
- updated_at: DateTime

### Character Model  
- id: Primary Key
- name: String
- description: Text
- tags: JSON Array
- image_ref: String (URL)
- created_at: DateTime

### Scene Model
- id: Primary Key  
- script_id: Foreign Key
- order: Integer
- scene_type: String
- characters: JSON
- dialogue: JSON Array
- action: Text
- location: String
- mood: String

### Panel Model
- id: Primary Key
- scene_id: Foreign Key
- image_url: String  
- prompt_used: Text
- generation_metadata: JSON
- created_at: DateTime

### Generation Job Model
- id: Primary Key
- script_id: Foreign Key
- status: String
- progress: Float
- result_data: JSON
- created_at: DateTime

## Mock Data Replacement Plan

### Frontend Changes Required:
1. Replace `mockScripts` with API calls to `/api/scripts`
2. Replace `mockCharacters` with API calls to `/api/characters` 
3. Replace `mockGenerationProgress` with real-time polling of `/api/generate/status/{job_id}`
4. Replace static panel images with actual generated panel URLs
5. Add error handling and loading states for all API calls

### Backend Integration Points:
1. **Script Editor**: Save/load scripts to database, parse script structure
2. **Style Selector**: Pass style preferences to generation pipeline
3. **Character Manager**: CRUD operations with database persistence
4. **Manga Preview**: Real-time generation progress, actual panel display

## Stable Diffusion Integration Strategy

### Model Selection Logic:
```python
def get_model_for_style(style: str) -> str:
    models = {
        "shounen": "anything-v5-PrtRE",
        "shoujo": "meinamix_meina-v11", 
        "seinen": "realisticVision-v60b1",
        "comedy": "toonyou_beta-6",
        "horror": "deliberate_v2"
    }
    return models.get(style, "anything-v5-PrtRE")
```

### Prompt Template System:
```python
def build_prompt(scene_data: dict, style: str) -> str:
    base_prompt = f"manga panel, {style} style, "
    if scene_data.get('characters'):
        base_prompt += f"character: {scene_data['characters']}, "
    if scene_data.get('action'):  
        base_prompt += f"action: {scene_data['action']}, "
    if scene_data.get('mood'):
        base_prompt += f"mood: {scene_data['mood']}, "
    
    base_prompt += "high quality, detailed, black and white manga art"
    return base_prompt
```

### Generation Pipeline:
1. Parse script → Extract scenes
2. For each scene → Build prompt → Generate image 
3. Process image → Add dialogue bubbles (optional)
4. Store in database → Return URLs to frontend

## Frontend-Backend Integration Flow

### Script Workflow:
1. User inputs script → Frontend calls `/api/scripts/parse`
2. Backend parses structure → Returns scene breakdown
3. Frontend updates UI with parsed data
4. User clicks "Generate" → Frontend calls `/api/generate/manga`
5. Frontend polls `/api/generate/status` for updates
6. Display generated panels as they complete

### Character Workflow:
1. User adds character → Frontend calls `POST /api/characters`
2. Character saved to database → Returns character object
3. Frontend updates character list
4. Character references used in manga generation

### Generation Workflow:  
1. Start generation job → Return job_id
2. Background worker processes each panel
3. Frontend polls for progress updates
4. Display panels as they're generated
5. Final PDF export available once complete

## Error Handling Strategy

### API Error Responses:
```json
{
  "error": "script_parsing_failed", 
  "message": "Unable to parse script structure",
  "details": {...}
}
```

### Frontend Error States:
- Script parsing errors → Show validation messages
- Generation failures → Retry options  
- Network errors → Offline mode indicators
- Rate limiting → Queue position display

## Testing Strategy

### Backend Tests:
- Script parsing accuracy
- Database operations
- Image generation pipeline
- API endpoint responses

### Integration Tests:
- Frontend ↔ Backend communication
- Generation job lifecycle
- File upload/download flows
- Error handling scenarios