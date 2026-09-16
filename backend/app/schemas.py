from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Union

class AgentStartRequest(BaseModel):
    goal: str
    start_url: str="https://www.google.com"
    max_steps: int=15
    groq_api_key: Optional[str]=None
    model_name: str="llama-3.3-70b-versatile"
    browser_type: str="chromium" # chromium, firefox, webkit
    hitl_mode: bool=False

class AgentAction(BaseModel):
    action: str=Field(..., description="Action type: click, type, scroll, navigate, wait, done")
    element_id: Optional[int]=Field(None, description="Interactive element ID")
    selector: Optional[str]=Field(None, description="CSS selector or fallback description")
    text: Optional[str]=Field(None, description="Text to type into input field")
    url: Optional[str]=Field(None, description="Target URL for navigate action")
    direction: Optional[str]=Field("down", description="Scroll direction: up or down")
    reasoning: Optional[str]=Field(None, description="LLM thought process behind action")
    result: Optional[str]=Field(None, description="Final answer or output when action is done")

class InteractiveElement(BaseModel):
    id: int
    tag: str
    text: str
    type: Optional[str]=None
    placeholder: Optional[str]=None
    href: Optional[str]=None
    selector: str

class StreamMessage(BaseModel):
    type: str
    step: int=0
    goal: str=""
    status: str="running"
    message: str=""
    action: Optional[Dict[str, Any]]=None
    screenshot: Optional[str]=None
    dom_elements: Optional[List[Dict[str, Any]]]=None
    url: str=""
    title: str=""
    result: Optional[str]=None
    error: Optional[str]=None
