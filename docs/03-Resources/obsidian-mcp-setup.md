---
type: reference
area: [setup, mcp]
created: 2026-06-07
---

# Obsidian ↔ Claude Code (MCP) — Setup & Reconnect

## What's connected
- **Plugin:** `mcp-tools-istefox` (settings tab "MCP Server").
- **Endpoint:** `http://127.0.0.1:27200/mcp` (HTTP transport), auth via `Authorization: Bearer <token>`.
- **Token location:** `docs/.obsidian/plugins/mcp-tools-istefox/data.json` → `mcpTransport.bearerToken`.
- **Registered in Claude Code** at *local (project) scope* → stored in `~/.claude.json`, auto-loads every new session **in this repo**. You do NOT need to re-add it each session.

## The one runtime requirement
The MCP server runs *inside Obsidian*. It's only reachable when **the Obsidian desktop app is open** with the plugin enabled. If Obsidian is closed, `claude mcp list` shows it as failed — just open Obsidian. Nothing to re-configure.

## We do NOT use `/ide`
`/ide` (WebSocket auto-discovery) never listed Obsidian because GUI-launched Obsidian couldn't write a lock file to `~/.claude/ide/`. The HTTP route above replaces it entirely — ignore `/ide` for Obsidian.

## Reconnect (only if it ever stops connecting)
Happens only if the **port** or **token** changes (e.g. you regenerated the key in Access Control, or changed the Server port). Re-pair with one command:

```bash
TOKEN=$(python3 -c "import json;print(json.load(open('docs/.obsidian/plugins/mcp-tools-istefox/data.json'))['mcpTransport']['bearerToken'])")
claude mcp remove obsidian 2>/dev/null
claude mcp add --transport http obsidian "http://127.0.0.1:27200/mcp" --header "Authorization: Bearer $TOKEN"
claude mcp list | grep obsidian   # expect: ✓ Connected
```

(If you changed the port, replace `27200` above.)
