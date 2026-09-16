import json
import logging
from groq import Groq
from app.config import settings

logger=logging.getLogger("agent.llm")

SYSTEM_PROMPT="""You are an autonomous AI browser agent. Your job is to achieve a user goal by interacting with web pages.
You observe simplified page elements and return ONLY a valid JSON object indicating your next action.

Available actions:
1. `{"action": "click", "element_id": <int>, "reasoning": "<why>"}` - Click interactive element with given ID
2. `{"action": "type", "element_id": <int>, "text": "<str>", "reasoning": "<why>"}` - Type text into input field
3. `{"action": "navigate", "url": "<url>", "reasoning": "<why>"}` - Navigate to a new URL
4. `{"action": "scroll", "direction": "down" | "up", "reasoning": "<why>"}` - Scroll up or down
5. `{"action": "hover", "element_id": <int>, "reasoning": "<why>"}` - Hover over element (tooltips, dropdowns)
6. `{"action": "press_key", "text": "Enter"|"Escape"|"Tab"|"PageDown", "reasoning": "<why>"}` - Press a keyboard key
7. `{"action": "go_back", "reasoning": "<why>"}` - Navigate back to previous page
8. `{"action": "extract_text", "element_id": <int>, "reasoning": "<why>"}` - Extract text content from element
9. `{"action": "wait", "reasoning": "<why>"}` - Wait for page load or dynamic content
10. `{"action": "done", "result": "<summary of findings or answer>", "reasoning": "<why>"}` - Goal completed successfully

Rules:
- Respond STRICTLY with JSON format. Do NOT wrap in markdown quotes if possible, or use standard json.
- Always use the `element_id` from the provided page elements list.
- If you have completed the user goal or obtained the required answer, output action `done` with detailed `result`.
- Never repeat failing actions endlessly.
"""

class LLMReasoning:
    def __init__(self, api_key: str=None, model_name: str="llama-3.3-70b-versatile"):
        self.api_key=api_key or settings.groq_api_key
        self.model_name=model_name
        self.client=Groq(api_key=self.api_key)

    def decide_next_action(self, goal: str, page_title: str, current_url: str, dom_summary: str, history: list) -> dict:
        history_str=json.dumps(history, indent=2) if history else "No previous actions taken."
        
        user_message=f"""
GOAL: {goal}
CURRENT PAGE TITLE: {page_title}
CURRENT URL: {current_url}

INTERACTIVE PAGE ELEMENTS:
{dom_summary if dom_summary else "No interactive elements found on page."}

ACTION HISTORY:
{history_str}

Decide the single next action to take to make progress towards the goal. Output strict JSON.
"""

        try:
            response=self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_message}
                ],
                response_format={"type": "json_object"},
                temperature=0.1
            )
            content=response.choices[0].message.content
            action_data=json.loads(content)
            return action_data
        except Exception as e:
            logger.error(f"Error calling Groq LLM: {e}")
            return {
                "action": "wait",
                "reasoning": f"Fallback due to LLM response parse issue: {str(e)}"
            }
