import asyncio

from backend.agents import TASKS, run_browser_task, generate_report, send_to_slack


async def main(task):
	# 1. Run browser task
	print(f"Running task: {task}")
	output_dir, output = await run_browser_task(task)
	print(output)
	print(f"\nSaved to {output_dir}/result.txt")

	# 2. Generate report
	print("\nGenerating QA report...")
	state, html_output = await generate_report(task, output, output_dir)
	print(f"Report state: {state}")
	print(f"Saved report to {output_dir}/report.html")

	# 3. Send to Slack
	print("\nSending to Slack...")
	send_to_slack(task, state, f"{output_dir}/report.html")

	return {"task": task, "state": state, "report_dir": output_dir}


if __name__ == "__main__":
	task = input(f"Choose task ({', '.join(TASKS.keys())}): ").strip()
	if task not in TASKS:
		print(f"Invalid task. Choose from: {', '.join(TASKS.keys())}")
	else:
		asyncio.run(main(task))
