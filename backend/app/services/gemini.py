import json
import re
import google.generativeai as genai
from app.config import get_settings

settings = get_settings()
genai.configure(api_key=settings.GEMINI_API_KEY)

_model = genai.GenerativeModel("gemini-1.5-flash")


def _extract_json(text: str) -> dict | list:
    """Strip markdown fences and parse JSON."""
    cleaned = re.sub(r"```(?:json)?", "", text).replace("```", "").strip()
    return json.loads(cleaned)


async def generate_opening_question(
    job_role: str,
    difficulty: str,
    resume_text: str | None = None,
) -> str:
    resume_context = f"\n\nCandidate resume summary:\n{resume_text[:2000]}" if resume_text else ""

    prompt = f"""You are a senior interviewer conducting a {difficulty}-level interview for a {job_role} position.{resume_context}

Generate ONE opening interview question. Make it:
- Appropriate for {difficulty} level
- Relevant to {job_role}
- Open-ended to allow a detailed answer
- Professional and clear

If you have resume context, make it slightly personalized.

Respond with ONLY the question text. No preamble, no numbering."""

    response = await _model.generate_content_async(prompt)
    return response.text.strip()


async def generate_followup_question(
    job_role: str,
    difficulty: str,
    conversation_history: list[dict],
    question_index: int,
    total_questions: int,
) -> str:
    history_text = "\n".join(
        [f"{'Interviewer' if m['role'] == 'assistant' else 'Candidate'}: {m['content']}"
         for m in conversation_history[-6:]]
    )

    prompt = f"""You are a senior interviewer conducting a {difficulty}-level interview for a {job_role} position.

Conversation so far:
{history_text}

This is question {question_index + 1} of {total_questions}.

Generate ONE follow-up interview question that:
- Builds naturally on the conversation
- Explores a different competency or skill area than previous questions
- Is appropriate for {difficulty} level
- Covers areas like: technical skills, problem-solving, teamwork, leadership, communication, or past experience

Respond with ONLY the question text. No preamble, no numbering."""

    response = await _model.generate_content_async(prompt)
    return response.text.strip()


async def evaluate_answer(
    job_role: str,
    difficulty: str,
    question: str,
    answer: str,
) -> dict:
    prompt = f"""You are evaluating an interview answer for a {difficulty}-level {job_role} position.

Question: {question}
Candidate's Answer: {answer}

Evaluate the answer on three dimensions (score each 0-10):
1. clarity - How clear and structured is the communication?
2. relevance - How well does the answer address the question?
3. depth - How deep and insightful is the technical/professional knowledge shown?

Also compute an overall score (0-10) as a weighted average.

Return ONLY valid JSON (no markdown fences):
{{
  "score": <0-10 float>,
  "clarity_score": <0-10 float>,
  "relevance_score": <0-10 float>,
  "depth_score": <0-10 float>,
  "feedback": "<2-3 sentence constructive paragraph>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"]
}}"""

    response = await _model.generate_content_async(prompt)
    try:
        data = _extract_json(response.text)
        return {
            "score": float(data.get("score", 5)),
            "clarity_score": float(data.get("clarity_score", 5)),
            "relevance_score": float(data.get("relevance_score", 5)),
            "depth_score": float(data.get("depth_score", 5)),
            "feedback": str(data.get("feedback", "")),
            "strengths": list(data.get("strengths", [])),
            "improvements": list(data.get("improvements", [])),
        }
    except Exception:
        return {
            "score": 5.0, "clarity_score": 5.0,
            "relevance_score": 5.0, "depth_score": 5.0,
            "feedback": "Evaluation could not be parsed. Please review manually.",
            "strengths": [], "improvements": [],
        }


async def extract_resume_info(text: str) -> dict:
    prompt = f"""Extract structured information from this resume text.

Resume:
{text[:3000]}

Return ONLY valid JSON (no markdown fences):
{{
  "skills": ["skill1", "skill2", ...],
  "experience": "<2-3 sentence summary of work experience>"
}}"""

    response = await _model.generate_content_async(prompt)
    try:
        data = _extract_json(response.text)
        return {
            "skills": list(data.get("skills", [])),
            "experience": str(data.get("experience", "")),
        }
    except Exception:
        return {"skills": [], "experience": ""}
