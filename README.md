# Resume Analyser

An AI-powered resume analyser built with **FastAPI** and **Google Gemini**. Upload a resume in **PDF, DOCX, or TXT** format and optionally provide a job description to receive detailed resume analysis and job-matching insights.

## Features

- **Overall Resume Score** and **ATS-Friendliness Score** (0–100)
- Candidate details extracted from the resume:
  - Name
  - Professional title
  - Contact information
  - Experience
- AI-generated resume summary
- Identification of **strengths and weaknesses**
- Section-wise scoring and feedback
- **Improvement suggestions** prioritized by importance
- Detection of **technical and soft skills**
- **Job Match Score** based on the provided job description
- Matched and missing skills identification
- **Eligible / Not a Good Match** shortlisting verdict
- Supports **PDF, DOCX, and TXT** resumes
- Modern frontend with **light and dark mode**

## Project Structure

```text
ResumeAnalyser/
├── main.py                 # FastAPI backend: file parsing + Gemini API call
├── frontend/
│   ├── index.html          # User interface
│   ├── style.css           # Styling with light and dark mode
│   └── app.js              # Upload, API calls, and result rendering
├── .env                    # Gemini API key and settings (never commit this)
├── .env.example            # Environment variable template
├── requirements.txt        # Python dependencies
└── README.md               # Project documentation
```

## Setup

### 1. Install Python

Install **Python 3.10 or higher**.

Then install the required dependencies:

```bash
pip install -r requirements.txt
```

### 2. Get a Gemini API Key

Get your Gemini API key from Google AI Studio.

Copy `.env.example` to `.env` and add your API key:

```env
GEMINI_API_KEY=your-real-key
```

**Never upload your `.env` file or expose your API key publicly.**

### 3. Run the Application

Start the FastAPI server:

```bash
python main.py
```

The application will normally run at:

```text
http://127.0.0.1:8000
```

Open that address in your browser.

## Configuration

The application can be configured using the `.env` file.

| Variable | Default | Description |
|---|---|---|
| `GEMINI_API_KEY` | Required | Google Gemini API key |
| `GEMINI_MODEL` | `gemini-3.8-flash` | Gemini model used for analysis |
| `GEMINI_FALLBACK_MODELS` | `gemini-3.7-flash,gemini-3.5-flash` | Fallback models used when the main model is unavailable |
| `SHORTLIST_THRESHOLD` | `70` | Job-match score required for shortlisting |
| `MAX_FILE_MB` | `10` | Maximum resume file size |
| `PORT` | `8000` | Port used by the FastAPI server |

## API

| Method | Path | Description |
|---|---|---|
| GET | `/` | Opens the web interface |
| GET | `/api/health` | Shows model information and API-key status |
| POST | `/api/analyze` | Analyzes an uploaded resume and optional job description |

### Example API Request

```bash
curl -F "resume=@my_resume.pdf" -F "job_description=Senior Python Developer..." http://127.0.0.1:8000/api/analyze
```

Interactive API documentation is available at:

```text
http://127.0.0.1:8000/docs
```

## How It Works

### Resume Processing

- **PDF files** are sent directly to Gemini for analysis, allowing the model to process document layouts and tables.
- **DOCX files** are converted to text using `python-docx`.
- **TXT files** are read directly as text.

### AI Analysis

Google Gemini analyzes the resume and produces structured results including:

- Resume score
- ATS score
- Candidate information
- Summary
- Strengths
- Weaknesses
- Section-wise feedback
- Technical skills
- Soft skills
- Improvement recommendations

### Job Description Matching

When a job description is provided, the system additionally calculates a **job match score** and identifies:

- Skills that match the job description
- Missing skills
- Relevant experience
- Areas that need improvement
- Shortlisting eligibility

The shortlisting decision is based on the configured threshold in `SHORTLIST_THRESHOLD`.

### Structured AI Output

Gemini's structured output using `response_json_schema` ensures that the response follows a predefined JSON structure, allowing the frontend to reliably display the results.

### Date-Aware Analysis

The current date is sent with each request so that information such as employment status and years of experience can be interpreted correctly.

### Fallback Models

If the primary Gemini model is unavailable because of quota limits or temporary server overload, the application can automatically attempt the configured fallback models.

### Missing Information

Placeholder values such as `"Not Provided"` and `"N/A"` are filtered so that missing information is not displayed as actual candidate data.

## Troubleshooting

### `GEMINI_API_KEY is not set`

Make sure your `.env` file exists and contains:

```env
GEMINI_API_KEY=your-real-key
```

Restart the server after modifying the `.env` file.

### `Invalid GEMINI_API_KEY`

Check that you copied the complete API key correctly and that there are no unnecessary spaces or quotation marks.

### Quota Exceeded / `429`

If the selected Gemini model reaches its quota, the application can attempt the configured fallback models. If all available models are exhausted, wait for the quota to reset or use an API key with appropriate billing/quota.

### Gemini Servers Are Busy

If Gemini returns a temporary server error, wait briefly and try the request again.

### Scanned PDFs

Image-only or scanned PDFs can still be analyzed when Gemini is able to process the document images. However, DOCX files containing only images may not provide extractable text.

## Security

**Do not commit your `.env` file.**

Your `.gitignore` should contain:

```text
.env
```

Never upload your Gemini API key, passwords, tokens, or other private credentials to GitHub.

## Future Improvements

Potential future enhancements include:

- Support for additional resume formats
- More detailed job-role recommendations
- Resume rewriting and optimization
- Industry-specific ATS analysis
- Skill-gap learning recommendations
- Resume comparison against multiple job descriptions
- Downloadable analysis reports

## License

This project is intended for educational and project-development purposes.