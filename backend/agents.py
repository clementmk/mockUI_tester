import base64
import io
import json
import os
from datetime import datetime

from dotenv import load_dotenv

load_dotenv()

from PIL import Image

from openai import OpenAI
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

from browser_use import Agent, Browser, BrowserProfile, Controller
from browser_use.agent.views import ActionResult
from browser_use.browser.session import BrowserSession
from browser_use.llm.openai.chat import ChatOpenAI

BASE_URL = "http://localhost:8002"

TASKS = {
	"login": (
		f"1. Go to {BASE_URL}\n"
		"2. Find the login form on the page\n"
		"3. Enter email: testuser@example.com and password: TestPass123!\n"
		"4. Click the login/submit button. Solve any reCAPTCHA if present\n"
		"5. Observe the result - did login succeed or fail?\n"
		"6. Return what happened at each step"
	),
	"signup": (
		f"1. Go to {BASE_URL}\n"
		"2. Find the sign-up/register form or link on the page and click it\n"
		"3. If you cannot find a sign-up/register form or link after checking the page, STOP and report that no signup option was found\n"
		"4. Fill in the registration form with a random name, email, and password\n"
		"5. Click the sign-up/register button\n"
		"6. Observe the result - did registration succeed or fail?\n"
		"7. Whether it succeeded or failed, STOP immediately and return what happened at each step. Do NOT retry or try alternative approaches"
	),
	"forget-password": (
		f"1. Go to {BASE_URL}\n"
		"2. Find and click the 'Forgot Password' or 'Reset Password' link on the page\n"
		"3. Enter email: testuser@example.com\n"
		"4. Click the submit/reset button\n"
		"5. Observe the result - was a reset email sent? Any confirmation message?\n"
		"6. Return what happened at each step"
	),
	"recaptcha": (
		f"1. Go to {BASE_URL}\n"
		"2. Check if there is a reCAPTCHA or CAPTCHA challenge on the page\n"
		"3. If present, describe the type of CAPTCHA (checkbox, image, invisible, etc.)\n"
		"4. Use the solve_recaptcha action to solve it - do NOT try to click the reCAPTCHA checkbox manually\n"
		"5. Observe what happens - does it pass?\n"
		"6. Return what happened at each step including CAPTCHA details"
	),
}

controller = Controller()

@controller.action("Get 2FA code from authenticator app")
async def get_2fa_code():
	# TODO: implement actual 2FA code retrieval (e.g. pyotp, API call, etc.)
	pass


@controller.action("Solve reCAPTCHA challenge on the page")
async def solve_recaptcha(browser_session: BrowserSession):
	"""Solve reCAPTCHA by triggering the callback via JavaScript."""
	cdp_session = await browser_session.get_or_create_cdp_session()
	js = """
	(function() {
		if (typeof grecaptcha !== 'undefined') {
			try { grecaptcha.execute(); return 'triggered grecaptcha.execute()'; } catch(e) {}
			try {
				var resp = grecaptcha.getResponse();
				if (resp) return 'already solved';
			} catch(e) {}
		}
		var textarea = document.querySelector('#g-recaptcha-response') || document.querySelector('[name="g-recaptcha-response"]');
		if (textarea) {
			textarea.style.display = 'block';
			textarea.value = 'test-recaptcha-token';
			textarea.style.display = 'none';
			return 'set recaptcha response textarea directly';
		}
		return 'no reCAPTCHA found on page';
	})();
	"""
	result = await cdp_session.cdp_client.send.Runtime.evaluate(
		params={"expression": js, "returnByValue": True},
		session_id=cdp_session.session_id,
	)
	msg = result.get("result", {}).get("value", "unknown result")
	return ActionResult(extracted_content=f"reCAPTCHA result: {msg}")

# --- Test Agent ---
async def run_browser_task(task):
	"""Run a browser-use task and return (output_dir, output_text)."""
	if task not in TASKS:
		raise ValueError(f"Invalid task '{task}'. Choose from: {', '.join(TASKS.keys())}")

	llm = ChatOpenAI(
		api_key=os.getenv("BYTEDANCE_API_KEY"),
		base_url="https://ark.ap-southeast.bytepluses.com/api/v3",
		model="seed-1-8-251228",
	)

	browser = Browser(
		headless=True,
		browser_profile=BrowserProfile(
			viewport={"width": 390, "height": 844},
			user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
			device_scale_factor=2.0,
		),
	)

	agent = Agent(
		browser=browser,
		llm=llm,
		task=TASKS[task],
		controller=controller,
		max_failures=3,
		max_steps=15,
	)

	result = await agent.run()

	timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
	output_dir = f"results/{task}_{timestamp}"
	screenshots_dir = f"{output_dir}/screenshots"
	os.makedirs(screenshots_dir, exist_ok=True)

	for i, step in enumerate(result.history):
		screenshot_b64 = step.state.get_screenshot()
		if screenshot_b64:
			img_data = base64.b64decode(screenshot_b64)
			with open(f"{screenshots_dir}/step_{i}.png", "wb") as f:
				f.write(img_data)

	try:
		if result and result.structured_output:
			structured = json.dumps(result.structured_output.model_dump(), indent=2, default=str)
		else:
			structured = result.final_result() or "No structured output returned"
	except Exception as e:
		structured = f"Failed to parse structured output: {e}\n\nRaw result:\n{result.final_result()}"

	output = (
		f"=== Structured Output ===\n"
		f"{structured}\n\n"
		f"=== Raw Details ===\n"
		f"urls_visited: {result.urls()}\n"
		f"action_names: {result.action_names()}\n"
		f"actions_detail: {result.model_actions()}\n"
		f"extracted_content: {result.extracted_content()}\n"
		f"errors: {result.errors()}\n"
		f"final_result: {result.final_result()}\n"
		f"is_done: {result.is_done()}\n"
		f"is_successful: {result.is_successful()}\n"
		f"has_errors: {result.has_errors()}\n"
		f"number_of_steps: {result.number_of_steps()}\n"
		f"total_duration_seconds: {result.total_duration_seconds()}\n"
	)

	for i, step in enumerate(result.history):
		output += f"\n--- Step {i} ---\n"
		output += f"url: {step.state.url}\n"
		output += f"page_title: {step.state.title}\n"
		output += f"tabs: {[{'url': t.url, 'title': t.title} for t in step.state.tabs]}\n"
		if step.model_output:
			output += f"thinking: {step.model_output.evaluation_previous_goal}\n"
			output += f"next_goal: {step.model_output.next_goal}\n"
		for r in step.result:
			output += f"success: {r.success}\n"
			output += f"error: {r.error}\n"
			output += f"extracted_content: {r.extracted_content}\n"
			output += f"is_done: {r.is_done}\n"
		screenshot_path = os.path.abspath(f"{screenshots_dir}/step_{i}.png") if step.state.get_screenshot() else None
		output += f"screenshot: {screenshot_path}\n"
		if step.metadata:
			output += f"duration_seconds: {step.metadata.duration_seconds}\n"

	output += f"\nscreenshots_dir: {os.path.abspath(screenshots_dir)}\n"

	with open(f"{output_dir}/result.txt", "w") as f:
		f.write(output)

	return output_dir, output


# --- Report Agent ---

async def generate_report(topic, task_result, output_dir):
	"""Generate a QA report and save it to the output_dir."""
	client = OpenAI(
		base_url="https://openrouter.ai/api/v1",
		api_key=os.getenv("OPENROUTER_API_KEY"),
	)

	system_prompt = """You are a Senior QA Engineer writing a test report for your team after running automated UI tests.
Write naturally and conversationally, as if you're explaining what you found to a colleague, but keep it concise and well-organized.

WHAT TO ANALYZE:

For SUCCESSFUL tests:
- How smooth was the user experience? Did everything feel intuitive?
- Any UI quirks or small improvements you noticed (even if it worked)
- Was the design clean and accessible?
- Did things respond quickly? Any noticeable delays?
- Overall impressions - what worked well that we should keep doing

For FAILED tests:
- How bad is this bug? (Critical/High/Medium/Low severity)
- What exactly broke? Describe it clearly
- How to reproduce it - step by step
- Why do you think it happened?
- How does this affect users and the business?
- What should we do to fix it?

REPORT STRUCTURE:

Write your report with these sections, but make them flow naturally:

1. **Executive Summary** (simple and concise)
   - What were you testing?
   - Did it pass or fail? include severity of issue and use emojis to express frustrations or joy
   - What's the bottom line - the most important thing to know?
   - Should this go to production or does it need work?

2. **Key Findings** (conversational bullets)
   - Walk through what you observed during the test
   - Include specific details (URLs visited, error messages seen, etc.)
   - Point out anything unexpected or interesting
   - **Include and describe any screenshots** from the test results

3. **The Details** (tell the story)
   - Describe what happened step-by-step
   - What worked, what didn't
   - **Embed all screenshots** with explanations of what they show
   - Include any error messages, console outputs, or data from the results
   - Talk about the user experience - where did things feel smooth or clunky?
   - Make sure the detailed steps are clear and easily reproducible

4. **Recommendations** (practical advice)
   - List fixes or improvements for UI in order of priority
   - Be specific - "Add validation message below email field" not "improve validation"
   - Suggest why each change would help users
   - Mention anything we should watch out for in future tests
   - Suggest potential code files that can be fixed to resolve issues

5. **Conclusion** (final thoughts)
   - Quick summary of where things stand
   - Next steps
   - Any questions or things that need clarification

HTML FORMAT:
- Use clean, simple HTML with inline CSS for styling
- Start the HTML document with <!DOCTYPE html>
- **Embed screenshots using base64 data URIs** in <img> tags like: <img src="data:image/png;base64,..." />
- The screenshots will be provided as base64 strings in the data - use them directly in img src attributes
- Add a caption under each screenshot explaining what it shows
- Use color to highlight key points: green for good, red for problems, yellow for warnings
- Make it easy to read - good spacing, clear headings, readable fonts
- Keep it concise and organised - like a nice document you'd send to your team

WRITING STYLE:
- Write like a human, not a template
- Use "I found..." "The test showed..." "Users would see..."
- Be specific with evidence, but conversational in tone
- Explain technical issues in plain English
- Use concrete examples over abstract descriptions
- Focus on what this means for real users

CRITICAL:
- Use ALL the information from the test results provided
- **Include every screenshot** using the base64 data provided - they're your visual proof
- Embed screenshots as: <img src="data:image/png;base64,THE_BASE64_STRING" style="max-width:100%;" />
- Don't make stuff up - only report what the data actually shows

Return the result in ["fail" or "pass" state, html output]
"""

	response = client.chat.completions.create(
		model="google/gemini-3-flash-preview",
		messages=[
			{"role": "system", "content": system_prompt},
			{"role": "user", "content": f"Generate a professional report on: {topic}\n\nData:\n{task_result}\n\nNote: Use placeholder <img src=\"SCREENSHOT_STEP_N\" /> for each step's screenshot (e.g. SCREENSHOT_STEP_0, SCREENSHOT_STEP_1, etc). They will be replaced with actual images."},
		],
		max_tokens=4000,
		temperature=0.3,
	)

	content = response.choices[0].message.content

	try:
		parsed = json.loads(content)
		if isinstance(parsed, list) and len(parsed) == 2:
			state, html_output = parsed
		else:
			state, html_output = "unknown", content
	except json.JSONDecodeError:
		state, html_output = "unknown", content

	# Replace screenshot placeholders with resized base64 images
	screenshots_dir = f"{output_dir}/screenshots"
	if os.path.exists(screenshots_dir):
		for filename in sorted(os.listdir(screenshots_dir)):
			if filename.endswith(".png"):
				step_num = filename.replace("step_", "").replace(".png", "")
				filepath = os.path.join(screenshots_dir, filename)
				img = Image.open(filepath)
				img.thumbnail((400, 800))
				buffer = io.BytesIO()
				img.save(buffer, format="PNG", optimize=True)
				b64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
				html_output = html_output.replace(
					f"SCREENSHOT_STEP_{step_num}",
					f"data:image/png;base64,{b64}",
				)

	with open(f"{output_dir}/report.html", "w", encoding="utf-8") as f:
		f.write(html_output)

	return state, html_output


def send_to_slack(run_name, state, file_path, token=None, channel_id=None):
	token = token or os.getenv("SLACK_TOKEN")
	channel_id = channel_id or os.getenv("SLACK_CHANNEL_ID")
	"""Send report to Slack."""
	client = WebClient(token)

	if state == "pass":
		message_title = "🎉 Test passed! 🎉"
	elif state == "fail":
		message_title = "🚨 Test failed! 🚨"
	else:
		message_title = "🤷‍♀️ Test unknown! 🤷‍♀️"

	try:
		client.files_upload_v2(
			file=file_path,
			title="Report",
			channel=channel_id,
			initial_comment=f"{message_title}\n\nView report here for {run_name}",
		)
		print("Slack message sent")
	except SlackApiError as e:
		print(f"Error sending to Slack: {e}")
