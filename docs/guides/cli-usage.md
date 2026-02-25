---
title: "CLI Usage & Getting Started"
description: "How to install and use the Skills CLI effectively in your pipelines."
date: "2026-02-25"
---

## Installation

You can easily install the CLI with a simple curl command on Mac or Linux.

```bash
curl -sL https://skills.sh | bash
```

Once installed, verify it's working:

```bash
skills --help
```

## Core Commands

### `skills install`
Installs a specific skill into your current repository. It will download the necessary handlers, configs, and dependencies automatically.

```bash
skills install authentication-module
```

### `skills list`
Displays all skills currently recognized or installed locally in your workspace. 

### `skills telemetry`
Enables or disables local telemetry reporting back to your central **Skills Insights** dashboard.

```bash
skills telemetry disable
```

## Managing Environments

You can switch between different insight hubs using the config command if you want to push data to a separate instance (like your staging server).

```bash
skills config set endpoint https://your-domain.com/api/telemetry
```
