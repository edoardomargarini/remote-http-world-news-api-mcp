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

  if (jsonrpc !== "2.0") {
    return res.json({
      jsonrpc: "2.0",
      id,
      error: { code: -32600, message: "Invalid Request" },
    });
  }

  try {
    if (method === "tools/list") {
      // valida MCP request
      ListToolsRequestSchema.parse({ id, method, params });
      return res.json({ jsonrpc: "2.0", id, result: { tools } });
    }

    if (method === "tools/call") {
      CallToolRequestSchema.parse({ id, method, params });
      const { name, arguments: args } = params || {};

      if (!(name in toolHandlers)) {
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

    return res.json({
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: `Unknown method: ${method}` },
    });
  } catch (e: any) {
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
