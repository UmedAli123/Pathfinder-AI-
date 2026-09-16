import asyncio
import json
import logging
from typing import Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.schemas import AgentStartRequest, StreamMessage
from app.agent.loop import AgentLoop

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("main")

app = FastAPI(
    title="Pathfinder AI - Autonomous Browser Agent API",
    description="Backend API powered by LLM and Playwright Browser Automation",
    version="1.0.0"
)

# Standard CORS configuration without wildcard + credentials conflict
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "groq_configured": bool(settings.groq_api_key),
        "default_model": settings.default_model
    }

@app.websocket("/ws/agent")
async def websocket_agent_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("WebSocket client connected.")

    # Connection-scoped instance variables to prevent global state leaks
    current_agent_loop: Optional[AgentLoop] = None
    active_agent_task: Optional[asyncio.Task] = None

    async def send_update(msg: StreamMessage):
        try:
            await websocket.send_text(msg.model_dump_json())
        except Exception as e:
            logger.error(f"Error sending WS message: {e}")

    async def stop_current_agent():
        nonlocal current_agent_loop, active_agent_task
        if current_agent_loop:
            current_agent_loop.is_running = False
        if active_agent_task and not active_agent_task.done():
            active_agent_task.cancel()
            try:
                await active_agent_task
            except asyncio.CancelledError:
                pass
        active_agent_task = None
        current_agent_loop = None

    try:
        while True:
            raw_data = await websocket.receive_text()
            data = json.loads(raw_data)
            action_type = data.get("type")

            if action_type == "start":
                req = AgentStartRequest(**data.get("payload", {}))
                
                await stop_current_agent()

                api_key = req.groq_api_key or settings.groq_api_key
                if not api_key:
                    await send_update(StreamMessage(
                        type="error",
                        status="error",
                        message="Missing API Key. Please configure an API key in settings or environment."
                    ))
                    continue

                current_agent_loop = AgentLoop(
                    goal=req.goal,
                    start_url=req.start_url,
                    max_steps=req.max_steps,
                    groq_api_key=api_key,
                    model_name=req.model_name,
                    browser_type=req.browser_type,
                    hitl_mode=req.hitl_mode,
                    on_update=send_update
                )

                active_agent_task = asyncio.create_task(current_agent_loop.run())

            elif action_type == "stop":
                await stop_current_agent()
                await send_update(StreamMessage(type="status", status="stopped", message="Agent stopped by user request."))

            elif action_type == "pause":
                if current_agent_loop:
                    current_agent_loop.is_paused = True
                    await send_update(StreamMessage(type="status", status="paused", message="Agent paused."))

            elif action_type == "resume":
                if current_agent_loop:
                    current_agent_loop.is_paused = False
                    await send_update(StreamMessage(type="status", status="running", message="Agent resumed."))

    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected.")
    except Exception as e:
        logger.error(f"WebSocket session error: {e}", exc_info=True)
    finally:
        await stop_current_agent()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.host, port=settings.port, reload=True)

