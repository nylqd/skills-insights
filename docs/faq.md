---
title: "FAQ"
description: "Frequently Asked Questions about Skills Insights."
date: "2026-02-25"
---

# FAQ 

### What is Skills Insights?
Skills Insights is a telemetry dashboard and platform designed for monitoring your agentic workflows in real-time. It provides developers and product owners a bird's-eye view of how top skills and modules are being used across distributed agents.

### How do I integrate it?
You can easily integrate it by utilizing our SDKs to push your own telemetry events into the ClickHouse engine behind the dashboard. For a fast start, you can use the CLI tool to auto-provision integration files.

### Is the data real-time?
Yes! Our backend leverages highly optimized ClickHouse engines that compute dashboard analytics in real-time, refreshing frequently.

### Can I self-host this stack?
Yes, Skills Insights components (the frontend Next.js app, along with the standard ClickHouse backend) are designed for easy deployment. Just clone the repo and run `docker-compose up`.
