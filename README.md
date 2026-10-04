# Resume Analyser

An AI resume analyser built with **FastAPI** and **Google Gemini**. Upload a resume (PDF, DOCX or TXT) and,
optionally, paste a job description. You get back:

- **Overall score** and **ATS-friendliness score** (0–100)
- Candidate details pulled from the resume (name, title, contact info, experience)
- A short summary, plus strengths and weaknesses
- A score and feedback for each resume section
- Improvement suggestions sorted by priority
- Technical and soft skills found
- **Job match score** with matched and missing skills, plus an **eligible / not a good match** shortlisting verdict (only when you paste a job description)

## Project structure

```
ResumeAnalyser/
├── main.py            # FastAPI backend: file parsing + Gemini call
├── frontend/
│   ├── index.html     # UI
│   ├── style.css      # Styles (light and dark mode)
│   └── app.js         # Upload, API call, result rendering
├── .env               # Your Gemini API key and settings (never commit this)
├── .env.example       # Template for .env (safe to share)
├── requirements.txt
└── README.md
```

## Setup

1. **Install Python 3.10+**, then install the dependencies:

   ```bash
   pip install -r requirements.txt
   ```

2. **Get a Gemini API key** from <https://aistudio.google.com/apikey>. Copy `.env.example` to `.env`
   (`.env` is not in git because it holds your key) and put the key in it:

   ```env
   GEMINI_API_KEY=your-real-key
   ```

3. **Run the app:**

   ```bash
   python main.py
   ```

4. Open **<http://127.0.0.1:8000>** in your browser.

## Configuration (`.env`)

| Variable         | Default            | Description                                   |
|------------------|--------------------|-----------------------------------------------|
| `GEMINI_API_KEY` | *(required)*       | Your Google Gemini API key                    |
| `GEMINI_MODEL`   | `gemini-3.8-flash` | Gemini model to use (e.g. a Pro model)   |
| `GEMINI_FALLBACK_MODELS` | `gemini-3.7-flash,gemini-3.5-flash` | Tried in order when the main model is out of quota or overloaded |
| `SHORTLIST_THRESHOLD` | `70` | Job-match % at or above which a candidate is shown as eligible for shortlisting |
| `MAX_FILE_MB`    | `10`               | Largest resume file you can upload            |
| `PORT`           | `8000`             | Port the server listens on                    |

## API

| Method | Path           | Description                                                     |
|--------|----------------|-----------------------------------------------------------------|
| GET    | `/`            | The web UI                                                      |
| GET    | `/api/health`  | Shows the model in use and whether an API key is set            |
| POST   | `/api/analyze` | Form fields: `resume` (file), `job_description` (text, optional) |

Example with curl:

```bash
curl -F "resume=@my_resume.pdf" -F "job_description=Senior Python developer..." http://127.0.0.1:8000/api/analyze
```

Interactive API docs are at <http://127.0.0.1:8000/docs>.

## How it works

- **PDFs** go straight to Gemini, which reads them natively, including layout and tables.
- **DOCX** files are converted to text with `python-docx`. **TXT** files are read as they are.
- Gemini's **structured output** (`response_json_schema`) means the response always matches a fixed JSON
  schema, so the frontend can render it reliably.
- Today's date is sent with every request, so "Present" and years of experience are calculated correctly.
- If the main model is out of quota (429) or still overloaded after 4 retries (5xx), the app moves on to the
  next model in `GEMINI_FALLBACK_MODELS`.
- Placeholder values such as "Not Provided" or "N/A" are blanked, so missing details never show as real data.
- The shortlisting verdict is a fixed rule in `main.py` (`match_score >= SHORTLIST_THRESHOLD`), not decided by
  the model.

## Troubleshooting

- **"GEMINI_API_KEY is not set"**: add your key to `.env` and restart the server.
- **"Invalid GEMINI_API_KEY"**: check that you copied the whole key, with no quotes or spaces.
- **Quota used up (429)**: the free tier allows about 20 requests per model per day. The app automatically switches to the fallback models; when they are all used up, wait for the daily reset or enable billing on your key.
- **"Gemini servers are busy" (502)**: every model was overloaded at once. Wait a minute and try again.
- **Scanned (image-only) PDFs** work, because Gemini reads the page images. A DOCX made of images will have no text to analyse.
