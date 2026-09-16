import base64
import asyncio
from typing import Dict, List, Any, Tuple
from playwright.async_api import async_playwright, Browser, Page, Playwright

class BrowserManager:
    def __init__(self, headless: bool=True, browser_type: str="chromium"):
        self.headless=headless
        self.browser_type=browser_type.lower()
        self.playwright: Playwright=None
        self.browser: Browser=None
        self.page: Page=None

    async def start(self):
        self.playwright=await async_playwright().start()
        
        # Select target Playwright browser engine
        if self.browser_type == "firefox":
            engine = self.playwright.firefox
        elif self.browser_type in ["webkit", "safari"]:
            engine = self.playwright.webkit
        else:
            engine = self.playwright.chromium

        self.browser=await engine.launch(
            headless=False,
            args=[
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-blink-features=AutomationControlled",
                "--disable-infobars",
                "--ignore-certificate-errors",
                "--autoplay-policy=no-user-gesture-required"
            ] if self.browser_type == "chromium" else []
        )
        context=await self.browser.new_context(
            viewport={"width": 1280, "height": 720},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        )
        self.page=await context.new_page()
        
        # Inject stealth overrides, glowing AI cursor & reCAPTCHA / YouTube ad-skippers
        await context.add_init_script("""
        (() => {
            // Mask navigator.webdriver for Anti-Bot evasion
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
            Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });

            // 1. Create Glowing Red/Indigo AI Cursor Overlay
            window.addEventListener('DOMContentLoaded', () => {
                if (document.getElementById('ai-agent-cursor')) return;
                const cursor = document.createElement('div');
                cursor.id = 'ai-agent-cursor';
                cursor.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 20px;
                    height: 20px;
                    background: rgba(239, 68, 68, 0.85);
                    border: 2px solid #ffffff;
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 9999999;
                    transition: transform 0.15s ease-out, top 0.25s ease, left 0.25s ease;
                    box-shadow: 0 0 15px rgba(239, 68, 68, 0.9), 0 0 30px rgba(99, 102, 241, 0.6);
                    transform: translate(-50%, -50%);
                `;
                document.body.appendChild(cursor);

                window.moveAgentCursor = (x, y) => {
                    cursor.style.left = x + 'px';
                    cursor.style.top = y + 'px';
                    cursor.style.transform = 'translate(-50%, -50%) scale(1.3)';
                    setTimeout(() => {
                        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
                    }, 200);
                };
            });

            // 2. Automatic reCAPTCHA Checkbox & Skip Button Auto-Clicker
            const autoClickRecaptcha = () => {
                const iframes = document.querySelectorAll('iframe[src*="recaptcha"], iframe[title*="reCAPTCHA"], iframe[src*="bframe"], iframe[src*="turnstile"], iframe[title*="challenge"]');
                iframes.forEach(iframe => {
                    try {
                        const frameDoc = iframe.contentDocument || iframe.contentWindow.document;
                        if (frameDoc) {
                            // Click 'I am not a robot' checkbox if not checked
                            const checkbox = frameDoc.querySelector('#recaptcha-anchor, .recaptcha-checkbox-border, .mark, input[type="checkbox"], #challenge-stage input');
                            if (checkbox && checkbox.getAttribute('aria-checked') !== 'true') {
                                checkbox.click();
                            }
                            
                            // Click 'SKIP' / 'VERIFY' button in challenge popup window
                            const skipBtn = frameDoc.querySelector('#recaptcha-verify-button, button.rc-button-default, #recaptcha-reload-button');
                            if (skipBtn && (skipBtn.offsetWidth > 0 || skipBtn.offsetHeight > 0)) {
                                const rect = skipBtn.getBoundingClientRect();
                                if (window.moveAgentCursor && rect.width > 0) {
                                    window.moveAgentCursor(rect.left + rect.width / 2, rect.top + rect.height / 2);
                                }
                                skipBtn.click();
                            }
                        }
                    } catch (e) {}
                });
            };
            setInterval(autoClickRecaptcha, 400);

            // 2. Multi-Event YouTube Skip Ad Trigger (Native click + MouseEvent dispatch)
            const skipYouTubeAds = () => {
                const skipSelectors = [
                    '.ytp-ad-skip-button',
                    '.ytp-skip-ad-button',
                    '.ytp-ad-skip-button-modern',
                    'button.ytp-ad-skip-button-text',
                    '.ytp-ad-skip-button-slot',
                    '.ytp-ad-overlay-close-button',
                    '[id^="skip-button"] button',
                    'button[class*="skip"]',
                    '.ytp-ad-skip-button-container button',
                    '.ytp-ad-text.ytp-ad-skip-button-text',
                    'div.ytp-ad-skip-button-slot button'
                ];
                for (let sel of skipSelectors) {
                    const btns = document.querySelectorAll(sel);
                    btns.forEach(btn => {
                        if (btn && (btn.offsetWidth > 0 || btn.offsetHeight > 0)) {
                            const rect = btn.getBoundingClientRect();
                            if (rect.width > 0 && rect.height > 0) {
                                // Move glowing red AI cursor to Skip Ad button location
                                if (window.moveAgentCursor) {
                                    window.moveAgentCursor(rect.left + rect.width / 2, rect.top + rect.height / 2);
                                }
                                
                                // Dispatch full synthetic MouseEvent chain for YouTube custom elements
                                try {
                                    const opts = { bubbles: true, cancelable: true, view: window, clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 };
                                    btn.dispatchEvent(new PointerEvent('pointerdown', opts));
                                    btn.dispatchEvent(new MouseEvent('mousedown', opts));
                                    btn.dispatchEvent(new PointerEvent('pointerup', opts));
                                    btn.dispatchEvent(new MouseEvent('mouseup', opts));
                                    btn.dispatchEvent(new MouseEvent('click', opts));
                                } catch (e) {}

                                // Direct native click fallback
                                if (typeof btn.click === 'function') {
                                    btn.click();
                                }
                            }
                        }
                    });
                }
            };

            setInterval(skipYouTubeAds, 300);
        })();
        """)

    async def stop(self):
        if self.page:
            await self.page.close()
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()

    async def goto(self, url: str):
        if not url.startswith("http://") and not url.startswith("https://"):
            url="https://"+url
        await self.page.goto(url, timeout=30000, wait_until="domcontentloaded")
        await asyncio.sleep(1.5)

    async def take_screenshot_b64() -> str:
        pass

    async def capture_screenshot(self) -> str:
        try:
            if not self.page or self.page.is_closed():
                return ""
            screenshot_bytes=await self.page.screenshot(type="jpeg", quality=65)
            return base64.b64encode(screenshot_bytes).decode("utf-8")
        except Exception:
            return ""

    async def get_simplified_dom(self) -> Tuple[List[Dict[str, Any]], str]:
        js_script="""
        () => {
            let elements = [];
            let count = 0;
            const selectors = 'a, button, input, select, textarea, [role="button"], [role="link"], [contenteditable="true"]';
            const nodes = Array.from(document.querySelectorAll(selectors));
            
            for (let el of nodes) {
                const rect = el.getBoundingClientRect();
                const style = window.getComputedStyle(el);
                if (rect.width === 0 || rect.height === 0 || style.visibility === 'hidden' || style.display === 'none') {
                    continue;
                }
                
                count++;
                let text = (el.innerText || el.value || el.placeholder || el.getAttribute('aria-label') || el.getAttribute('title') || '').trim();
                text = text.replace(/\\s+/g, ' ').substring(0, 100);
                
                let uniqueSelector = '';
                if (el.id) {
                    uniqueSelector = '#' + el.id;
                } else {
                    let path = [];
                    let curr = el;
                    while (curr && curr.nodeType === Node.ELEMENT_NODE && curr !== document.body) {
                        let name = curr.localName;
                        let parent = curr.parentNode;
                        if (parent) {
                            let siblings = Array.from(parent.children).filter(c => c.localName === name);
                            if (siblings.length > 1) {
                                name += `:nth-of-type(${siblings.indexOf(curr) + 1})`;
                            }
                        }
                        path.unshift(name);
                        curr = parent;
                    }
                    uniqueSelector = 'body > ' + path.join(' > ');
                }
                
                el.setAttribute('data-agent-id', count);
                elements.push({
                    id: count,
                    tag: el.tagName.toLowerCase(),
                    text: text,
                    type: el.type || '',
                    placeholder: el.placeholder || '',
                    href: el.href || '',
                    selector: uniqueSelector
                });
            }
            return elements;
        }
        """
        dom_elements=await self.page.evaluate(js_script)
        
        formatted_dom=[]
        for item in dom_elements:
            desc=f"[{item['id']}] {item['tag'].upper()}"
            if item.get("type"):
                desc+=f" (type={item['type']})"
            if item.get("placeholder"):
                desc+=f" placeholder='{item['placeholder']}'"
            if item.get("text"):
                desc+=f" label='{item['text']}'"
            formatted_dom.append(desc)
            
        return dom_elements, "\n".join(formatted_dom)
