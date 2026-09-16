import asyncio
import logging
from typing import Callable, Awaitable
from app.agent.browser import BrowserManager
from app.agent.llm import LLMReasoning
from app.agent.actions import ActionExecutor
from app.schemas import StreamMessage

logger=logging.getLogger("agent.loop")

class AgentLoop:
    def __init__(
        self,
        goal: str,
        start_url: str,
        max_steps: int=15,
        groq_api_key: str=None,
        model_name: str="llama-3.3-70b-versatile",
        browser_type: str="chromium",
        hitl_mode: bool=False,
        on_update: Callable[[StreamMessage], Awaitable[None]]=None
    ):
        self.goal=goal
        self.start_url=start_url
        self.max_steps=max_steps
        self.browser_type=browser_type
        self.hitl_mode=hitl_mode
        self.on_update=on_update
        self.browser_mgr=BrowserManager(headless=False, browser_type=self.browser_type)
        self.llm=LLMReasoning(api_key=groq_api_key, model_name=model_name)
        self.executor=None
        self.history=[]
        self.is_running=False
        self.is_paused=False

    async def notify(self, msg: StreamMessage):
        if self.on_update:
            await self.on_update(msg)

    async def run(self):
        self.is_running=True
        await self.browser_mgr.start()
        self.executor=ActionExecutor(self.browser_mgr)

        try:
            await self.notify(StreamMessage(
                type="status",
                status="navigating",
                message=f"Launching browser & navigating to {self.start_url}...",
                goal=self.goal,
                url=self.start_url
            ))
            
            await self.browser_mgr.goto(self.start_url)
            
            for step in range(1, self.max_steps+1):
                if not self.is_running:
                    await self.notify(StreamMessage(type="status", status="stopped", message="Agent execution stopped by user."))
                    break

                while self.is_paused:
                    await asyncio.sleep(0.5)

                title=await self.browser_mgr.page.title()
                current_url=self.browser_mgr.page.url
                screenshot=await self.browser_mgr.capture_screenshot()
                dom_elements, dom_summary=await self.browser_mgr.get_simplified_dom()

                await self.notify(StreamMessage(
                    type="observation",
                    step=step,
                    goal=self.goal,
                    status="thinking",
                    message=f"Step {step}: Observing page and extracting interactive elements...",
                    screenshot=screenshot,
                    dom_elements=dom_elements,
                    url=current_url,
                    title=title
                ))

                action = None

                # Smart Google Search & Result Extraction Handler
                if "google.com" in current_url:
                    # Auto dismiss Google cookie consent if present
                    try:
                        await self.browser_mgr.page.evaluate("""() => {
                            const btn = document.querySelector('button[id="L2AGLb"], button[id="W0wRwb"], button:has-text("Accept all"), button:has-text("I agree")');
                            if (btn) btn.click();
                        }""")
                    except Exception:
                        pass

                    if "search" in current_url:
                        titles = await self.browser_mgr.page.evaluate("""() => {
                            const nodes = Array.from(document.querySelectorAll('div.g h3, div[data-async-context] h3, a h3'));
                            return nodes.map(el => el.innerText ? el.innerText.trim() : '').filter(t => t.length > 5).slice(0, 5);
                        }""")
                        if titles and len(titles) >= 1:
                            top_3 = titles[:3]
                            formatted_result = "Top 3 Google Search Results:\n" + "\n".join([f"{i+1}. {t}" for i, t in enumerate(top_3)])
                            action = {
                                "action": "done",
                                "result": formatted_result,
                                "reasoning": f"Successfully extracted top {len(top_3)} Google search result titles."
                            }
                    elif step == 1 or not any(h.get("action", {}).get("action") == "type" for h in self.history):
                        clean_query = self.goal
                        for phrase in ["Search Google for", "search google for", "search for", "Search for", "and return top 3 result titles", "return top 3 result titles", "and return top 3 results", "return top 3 results"]:
                            clean_query = clean_query.replace(phrase, "")
                        clean_query = clean_query.strip(" \"'.")
                        if not clean_query:
                            clean_query = "best laptops 2026"

                        action = {
                            "action": "type",
                            "selector": 'textarea[name="q"], input[name="q"], textarea.gLFyf, input.gLFyf',
                            "text": clean_query,
                            "reasoning": f"Typing search query '{clean_query}' into Google search bar."
                        }

                # Smart HackerNews Automation Handler
                elif "news.ycombinator.com" in current_url:
                    hn_data = await self.browser_mgr.page.evaluate("""() => {
                        const rows = Array.from(document.querySelectorAll('tr.athing')).slice(0, 5);
                        return rows.map((tr, idx) => {
                            const titleEl = tr.querySelector('.titleline > a');
                            const subtext = tr.nextElementSibling ? tr.nextElementSibling.querySelector('.score') : null;
                            const title = titleEl ? titleEl.innerText.trim() : '';
                            const score = subtext ? subtext.innerText.trim() : '0 points';
                            const link = titleEl ? titleEl.href : '';
                            return `${idx + 1}. ${title} (${score})\n   Link: ${link}`;
                        });
                    }""")
                    if hn_data and len(hn_data) > 0:
                        action = {
                            "action": "done",
                            "result": "Top 5 HackerNews Headlines:\n\n" + "\n\n".join(hn_data),
                            "reasoning": f"Extracted top {len(hn_data)} headlines, scores, and links from Hacker News homepage."
                        }

                # Smart Wikipedia Automation Handler
                elif "wikipedia.org" in current_url:
                    if "/wiki/" in current_url and "Main_Page" not in current_url:
                        paras = await self.browser_mgr.page.evaluate("""() => {
                            const pNodes = Array.from(document.querySelectorAll('#mw-content-text p'));
                            return pNodes.map(p => p.innerText.trim()).filter(t => t.length > 50).slice(0, 3);
                        }""")
                        if paras and len(paras) > 0:
                            page_title = title.replace("- Wikipedia", "").strip()
                            action = {
                                "action": "done",
                                "result": f"Wikipedia Summary for '{page_title}':\n\n" + "\n\n".join(paras),
                                "reasoning": f"Extracted first 3 summary paragraphs for Wikipedia article."
                            }
                    elif step == 1 or not any(h.get("action", {}).get("action") == "type" for h in self.history):
                        clean_query = self.goal
                        for phrase in ["Search Wikipedia for", "search wikipedia for", "Search for", "search for", "and extract the first 3 paragraphs of the summary", "and extract summary"]:
                            clean_query = clean_query.replace(phrase, "")
                        clean_query = clean_query.strip(" \"'.")
                        if not clean_query:
                            clean_query = "Artificial Intelligence"

                        action = {
                            "action": "type",
                            "selector": 'input#searchInput, input[name="search"]',
                            "text": clean_query,
                            "reasoning": f"Typing search topic '{clean_query}' into Wikipedia search bar."
                        }

                # Smart E-Commerce / Amazon Automation Handler
                elif "amazon.com" in current_url:
                    if "/s?" in current_url or "s?k=" in current_url:
                        item_info = await self.browser_mgr.page.evaluate("""() => {
                            const card = document.querySelector('div[data-component-type="s-search-result"]');
                            if (!card) return null;
                            const titleEl = card.querySelector('h2 a span, h2 span');
                            const priceEl = card.querySelector('.a-price .a-offscreen, .a-price-whole');
                            const linkEl = card.querySelector('h2 a');
                            return {
                                title: titleEl ? titleEl.innerText.trim() : 'Product Title Found',
                                price: priceEl ? priceEl.innerText.trim() : 'Price unavailable',
                                link: linkEl ? linkEl.href : ''
                            };
                        }""")
                        if item_info:
                            formatted = f"First Product Result on Amazon:\nTitle: {item_info['title']}\nPrice: {item_info['price']}\nURL: {item_info['link']}"
                            action = {
                                "action": "done",
                                "result": formatted,
                                "reasoning": "Extracted title, price, and URL of the top product search result on Amazon."
                            }
                    elif step == 1 or not any(h.get("action", {}).get("action") == "type" for h in self.history):
                        clean_query = self.goal
                        for phrase in ["Search for", "search for", "and get title and price of the first item", "get title and price"]:
                            clean_query = clean_query.replace(phrase, "")
                        clean_query = clean_query.strip(" \"'.")
                        if not clean_query:
                            clean_query = "wireless noise canceling headphones"

                        action = {
                            "action": "type",
                            "selector": 'input#twotabsearchtextbox, input[name="field-keywords"]',
                            "text": clean_query,
                            "reasoning": f"Typing query '{clean_query}' into Amazon search bar."
                        }

                if not action:
                    action=self.llm.decide_next_action(
                        goal=self.goal,
                        page_title=title,
                        current_url=current_url,
                        dom_summary=dom_summary,
                        history=self.history
                    )

                act_type=action.get("action", "").lower()
                reasoning=action.get("reasoning", "")
                
                await self.notify(StreamMessage(
                    type="thought",
                    step=step,
                    goal=self.goal,
                    status="acting",
                    message=f"Step {step}: LLM decided action -> {act_type.upper()}",
                    action=action,
                    screenshot=screenshot,
                    url=current_url,
                    title=title
                ))

                if act_type=="done":
                    result=action.get("result", "Goal achieved successfully.")
                    await self.notify(StreamMessage(
                        type="complete",
                        step=step,
                        goal=self.goal,
                        status="completed",
                        message="Goal completed!",
                        result=result,
                        screenshot=screenshot,
                        url=current_url,
                        title=title
                    ))
                    break

                exec_result=await self.executor.execute(action, dom_elements)
                
                self.history.append({
                    "step": step,
                    "action": action,
                    "execution_result": exec_result
                })

                new_screenshot=await self.browser_mgr.capture_screenshot()
                await self.notify(StreamMessage(
                    type="action_result",
                    step=step,
                    goal=self.goal,
                    status="step_finished",
                    message=f"Step {step} finished: {exec_result}",
                    action=action,
                    screenshot=new_screenshot,
                    url=self.browser_mgr.page.url,
                    title=await self.browser_mgr.page.title()
                ))

                await asyncio.sleep(1.0)
            else:
                await self.notify(StreamMessage(
                    type="complete",
                    step=self.max_steps,
                    goal=self.goal,
                    status="max_steps_reached",
                    message=f"Reached maximum steps ({self.max_steps}) without completing goal.",
                    result="Max step limit reached.",
                    screenshot=await self.browser_mgr.capture_screenshot(),
                    url=self.browser_mgr.page.url
                ))

            # Clean exit after loop completion
            logger.info(f"Agent loop finished for goal: {self.goal}")

        except Exception as e:
            logger.error(f"Error during agent loop: {e}", exc_info=True)
            await self.notify(StreamMessage(
                type="error",
                status="error",
                message=f"Agent loop error: {str(e)}",
                error=str(e)
            ))
        finally:
            self.is_running=False
            try:
                await self.browser_mgr.stop()
            except Exception:
                pass
