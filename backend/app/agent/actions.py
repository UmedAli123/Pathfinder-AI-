import asyncio
import logging
from app.agent.browser import BrowserManager

logger=logging.getLogger("agent.actions")

class ActionExecutor:
    def __init__(self, browser_mgr: BrowserManager):
        self.browser_mgr=browser_mgr

    async def check_and_handle_recaptcha(self, page):
        try:
            # 1. Check & Click 'I am not a robot' checkbox
            recaptcha_frame = page.frame_locator('iframe[title*="reCAPTCHA"], iframe[src*="recaptcha"]')
            checkbox = recaptcha_frame.locator('#recaptcha-anchor, .recaptcha-checkbox-border').first
            if await checkbox.count() > 0 and await checkbox.is_visible():
                box = await checkbox.bounding_box()
                if box:
                    x = box["x"] + box["width"] / 2
                    y = box["y"] + box["height"] / 2
                    await page.evaluate(f"window.moveAgentCursor && window.moveAgentCursor({x}, {y})")
                    await page.mouse.move(x, y)
                    await page.mouse.click(x, y)
                await checkbox.click(force=True, timeout=2000)
                logger.info("Playwright auto-clicked reCAPTCHA 'I'm not a robot' checkbox.")
            
            # 2. Check & Click 'SKIP' / 'VERIFY' button in challenge popup window
            challenge_frame = page.frame_locator('iframe[title*="recaptcha challenge"], iframe[src*="bframe"]')
            skip_btn = challenge_frame.locator('#recaptcha-verify-button, button.rc-button-default, #recaptcha-reload-button').first
            if await skip_btn.count() > 0 and await skip_btn.is_visible():
                box = await skip_btn.bounding_box()
                if box:
                    x = box["x"] + box["width"] / 2
                    y = box["y"] + box["height"] / 2
                    await page.evaluate(f"window.moveAgentCursor && window.moveAgentCursor({x}, {y})")
                    await page.mouse.move(x, y)
                    await page.mouse.click(x, y)
                await skip_btn.click(force=True, timeout=2000)
                logger.info("Playwright auto-clicked reCAPTCHA 'SKIP' / 'VERIFY' button.")
        except Exception:
            pass

    async def check_and_skip_ads(self, page):
        await self.check_and_handle_recaptcha(page)
        try:
            if "youtube.com" not in page.url:
                return

            skip_selectors = [
                "button.ytp-ad-skip-button-modern",
                ".ytp-ad-skip-button",
                ".ytp-skip-ad-button",
                "button.ytp-ad-skip-button-text",
                ".ytp-ad-skip-button-slot button",
                "[id^='skip-button'] button",
                "button[class*='skip']"
            ]

            for sel in skip_selectors:
                loc = page.locator(sel).first
                if await loc.count() > 0 and await loc.is_visible():
                    box = await loc.bounding_box()
                    if box:
                        x = box["x"] + box["width"] / 2
                        y = box["y"] + box["height"] / 2
                        # Move AI Cursor visually
                        await page.evaluate(f"window.moveAgentCursor && window.moveAgentCursor({x}, {y})")
                        await asyncio.sleep(0.15)
                        
                        # Playwright NATIVE physical OS-level mouse move & click
                        await page.mouse.move(x, y)
                        await page.mouse.click(x, y)
                        await loc.click(force=True, timeout=1000)
                        logger.info(f"Playwright native clicked YouTube Skip Ad button at ({x}, {y})")
                        break
        except Exception as e:
            pass

    async def execute(self, action: dict, dom_elements: list) -> str:
        page=self.browser_mgr.page
        await self.check_and_skip_ads(page)

        act_type=action.get("action", "").lower()
        element_id=action.get("element_id")
        text=action.get("text", "")
        url=action.get("url", "")
        direction=action.get("direction", "down")

        page=self.browser_mgr.page

        if act_type=="navigate":
            if not url:
                return "Error: No URL provided for navigate action."
            await self.browser_mgr.goto(url)
            return f"Navigated to {url}"

        elif act_type=="click":
            selector=None
            if element_id is not None:
                selector=f'[data-agent-id="{element_id}"]'
            elif action.get("selector"):
                selector=action.get("selector")
                
            if not selector:
                return f"Error: No element_id or selector provided for click action."
                
            try:
                # If clicking YouTube search result video
                if "youtube.com" in page.url and ("ytd-video-renderer" in selector or "thumbnail" in selector):
                    yt_video_selectors=[
                        "ytd-video-renderer a#video-title",
                        "ytd-video-renderer a#thumbnail",
                        "a.yt-simple-endpoint.ytd-video-renderer",
                        "ytd-search ytd-video-renderer a"
                    ]
                    clicked=False
                    for s in yt_video_selectors:
                        loc=page.locator(s).first
                        if await loc.count() > 0 and await loc.is_visible():
                            box=await loc.bounding_box()
                            if box:
                                x=box["x"]+box["width"]/2
                                y=box["y"]+box["height"]/2
                                await page.evaluate(f"window.moveAgentCursor && window.moveAgentCursor({x}, {y})")
                                await asyncio.sleep(0.3)
                            await loc.click(force=True)
                            clicked=True
                            break
                    if not clicked:
                        await page.evaluate("() => { const a = document.querySelector('ytd-video-renderer a#video-title, ytd-video-renderer a#thumbnail'); if(a) a.click(); }")
                else:
                    loc=page.locator(selector).first
                    if await loc.count() > 0:
                        box=await loc.bounding_box()
                        if box:
                            x=box["x"]+box["width"]/2
                            y=box["y"]+box["height"]/2
                            await page.evaluate(f"window.moveAgentCursor && window.moveAgentCursor({x}, {y})")
                            await asyncio.sleep(0.3)
                        await loc.click(force=True, timeout=6000)
                    else:
                        await page.click(selector, timeout=6000)

                await asyncio.sleep(2.0)
                return f"Clicked element [{element_id or 'YouTube Video'}]"
            except Exception as e:
                return f"Failed to click element [{element_id}]: {str(e)}"

        elif act_type=="type":
            selector=None
            if element_id is not None:
                selector=f'[data-agent-id="{element_id}"]'
            elif action.get("selector"):
                selector=action.get("selector")
                
            # YouTube & Google search bar fallback if element_id points to generic element
            if "youtube.com" in page.url:
                yt_input=page.locator('input#search, input[name="search_query"], ytd-searchbox input').first
                if await yt_input.count() > 0:
                    selector='input#search, input[name="search_query"], ytd-searchbox input'
            elif "google.com" in page.url:
                g_input=page.locator('textarea[name="q"], input[name="q"], textarea.gLFyf, input.gLFyf').first
                if await g_input.count() > 0:
                    selector='textarea[name="q"], input[name="q"], textarea.gLFyf, input.gLFyf'

            if not selector:
                return f"Error: No element_id provided for type action."

            try:
                loc=page.locator(selector).first
                if await loc.count() > 0:
                    box=await loc.bounding_box()
                    if box:
                        x=box["x"]+box["width"]/2
                        y=box["y"]+box["height"]/2
                        await page.evaluate(f"window.moveAgentCursor && window.moveAgentCursor({x}, {y})")
                        await asyncio.sleep(0.3)
                    await loc.click(force=True)
                    await loc.fill(text)
                    await loc.press("Enter")
                else:
                    await page.fill(selector, text, timeout=6000)

                await asyncio.sleep(0.5)
                await page.keyboard.press("Enter")
                await asyncio.sleep(2.0)
                return f"Typed '{text}' into search box and submitted search"
            except Exception as e:
                return f"Failed to type into element: {str(e)}"

        elif act_type=="scroll":
            delta=500 if direction=="down" else -500
            await page.mouse.wheel(0, delta)
            await asyncio.sleep(1.0)
            return f"Scrolled page {direction}"

        elif act_type=="hover":
            selector=None
            if element_id is not None:
                selector=f'[data-agent-id="{element_id}"]'
            elif action.get("selector"):
                selector=action.get("selector")

            if not selector:
                return "Error: No element_id or selector provided for hover action."
            try:
                loc=page.locator(selector).first
                if await loc.count() > 0:
                    box=await loc.bounding_box()
                    if box:
                        x=box["x"]+box["width"]/2
                        y=box["y"]+box["height"]/2
                        await page.evaluate(f"window.moveAgentCursor && window.moveAgentCursor({x}, {y})")
                        await asyncio.sleep(0.3)
                    await loc.hover(force=True)
                    await asyncio.sleep(1.0)
                    return f"Hovered over element [{element_id}]"
                return f"Element [{element_id}] not found for hover."
            except Exception as e:
                return f"Failed to hover over element: {str(e)}"

        elif act_type=="press_key":
            key_name=text or "Enter"
            try:
                await page.keyboard.press(key_name)
                await asyncio.sleep(1.0)
                return f"Pressed key '{key_name}'"
            except Exception as e:
                return f"Failed to press key '{key_name}': {str(e)}"

        elif act_type=="go_back":
            try:
                await page.go_back()
                await asyncio.sleep(1.5)
                return "Navigated back to previous page"
            except Exception as e:
                return f"Failed to navigate back: {str(e)}"

        elif act_type=="extract_text":
            selector=None
            if element_id is not None:
                selector=f'[data-agent-id="{element_id}"]'
            elif action.get("selector"):
                selector=action.get("selector")
            
            try:
                if selector:
                    txt=await page.locator(selector).first.text_content()
                else:
                    txt=await page.inner_text("body")
                txt_clean=(txt or "").strip()[:500]
                return f"Extracted text: {txt_clean}"
            except Exception as e:
                return f"Failed to extract text: {str(e)}"

        elif act_type=="wait":
            await asyncio.sleep(2.0)
            return "Waited for 2 seconds"

        elif act_type=="done":
            return action.get("result", "Goal achieved successfully.")

        else:
            return f"Unknown action type: {act_type}"
