from openai import OpenAI
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

async def report(topic, task_result):
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key="the_key",
    )

    task = """
You are a Senior QA Engineer writing a test report for your team after running automated UI tests.
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
   - List fixes or improvements in order of priority
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
- **Embed any screenshots** from the test data using <img> tags
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
- **Include every screenshot** - they're your visual proof
- Don't make stuff up - only report what the data actually shows
- If there are screenshot paths or image data, embed them in the HTML report

Return the result in ["fail" or "pass" state, html output]
"""
    # deepseek/deepseek-v3.2 or google/gemini-3-flash-preview
    response = client.chat.completions.create(
        model="google/gemini-3-flash-preview",
        messages=[
            {"role": "system", "content": task},
            {"role": "user", "content": f"Generate a professional report on: {topic}\n\nData:\n{task_result}"}
        ],
        max_tokens=4000,
        temperature=0.3,
    )

    content = response.choices[0].message.content

    try:
        result = json.loads(content)
        if isinstance(result, list) and len(result) == 2:
            state = result[0]
            html_output = result[1]
            return [state, html_output]
        else:
            return ["unknown", content]
    except json.JSONDecodeError:
        return ["unknown", content]

def send_message_to_slack(state, file_path):
    client = WebClient("the_token")
    channel_id = "C0ADRJFT6A0"

    if state == "pass":
        message_title = "🎉 Test passed! 🎉"
    elif state == "fail":
        message_title = "🚨 Test failed! 🚨"
    else:
        message_title = "🤷‍♀️ Test unknown! 🤷‍♀️"

    try:
        response = client.files_upload_v2(
            file=file_path,
            title="Report",
            channel=channel_id,
            initial_comment=f"{message_title} \n\nView report here",
        )
        print(f"Message sent")
    except SlackApiError as e:
        print(f"Error sending message: {e}")


async def main():
    login_result = "results from test: pass" # result from browser-use
    report_topic = "Test Topic" # testing goal / topic

    state, html_output = await report(report_topic, login_result)
    filename = "login_test_report.html" # perhaps set uuid for each run, and use it as filename
    logging.info(f"Test state: {state}")
    with open(filename, "w", encoding="utf-8") as f:
        f.write(html_output)
    f.close()

    send_message_to_slack(state, filename)


if __name__ == '__main__':
    asyncio.run(main())