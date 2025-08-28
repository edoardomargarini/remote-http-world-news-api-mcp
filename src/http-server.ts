#!/usr/bin/env node
import express, { Request, Response } from "express";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { tools, toolHandlers } from "./index.js";

const app = express();
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", message: "✅ MCP HTTP server running" });
});

app.post("/mcp", async (req: Request, res: Response) => {
  const { id, jsonrpc, method, params = {} } = req.body || {};

  console.log("📩 Incoming MCP request:", JSON.stringify(req.body, null, 2));

  if (jsonrpc !== "2.0") {
    return res.json({
      jsonrpc: "2.0",
      id,
      error: { code: -32600, message: "Invalid Request" },
    });
  }

  try {
    if (method === "tools/list") {
      console.log("🔧 tools/list requested");
      ListToolsRequestSchema.parse({ id, method, params });
      return res.json({ jsonrpc: "2.0", id, result: { tools } });
    }

    if (method === "tools/call") {
      CallToolRequestSchema.parse({ id, method, params });
      const { name, arguments: args } = params || {};

      console.log(`🚀 tools/call requested for tool: ${name}`);
      console.log("   with arguments:", JSON.stringify(args, null, 2));

      if (!(name in toolHandlers)) {
        console.warn(`⚠️ Tool not found: ${name}`);
        return res.json({
          jsonrpc: "2.0",
          id,
          error: { code: -32601, message: `Tool not found: ${name}` },
        });
      }

      const result = await toolHandlers[name as keyof typeof toolHandlers](args);

      return res.json({
        jsonrpc: "2.0",
        id,
        result: {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        },
      });
    }

    console.warn(`⚠️ Unknown method: ${method}`);
    return res.json({
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: `Unknown method: ${method}` },
    });
  } catch (e: any) {
    console.error("💥 Error handling MCP request:", e);
    return res.json({
      jsonrpc: "2.0",
      id,
      error: { code: -32603, message: e?.message || String(e) },
    });
  }
});

const PORT = Number(process.env.PORT ?? 8080);
app.listen(PORT, () => {
  console.log(`✅ MCP HTTP server listening on :${PORT}`);
});