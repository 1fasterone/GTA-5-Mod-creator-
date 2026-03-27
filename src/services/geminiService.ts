import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export type ProviderType = 'gemini' | 'local';

export interface ProviderConfig {
  type: ProviderType;
  apiKey?: string;
  baseUrl?: string;
  model: string;
  systemPrompt: string;
}

export const DEFAULT_SHVDN_SYSTEM_INSTRUCTION = `
You are an expert GTA V Mod Developer specializing in ScriptHookVDotNet (SHVDN) v3.6.0.
Your task is to generate high-quality, functional, and safe C# scripts for GTA V based on plain English prompts.

API SPECIFICS (SHVDN v3.6.0):
- Target Framework: .NET Framework 4.8
- Primary Namespace: GTA
- Main Class: Must inherit from 'Script'
- Key Classes: Ped, Vehicle, Prop, World, Game, Player, Entity, Vector3, UI, Screen, Notification
- Event Handlers: Use the constructor to subscribe to events like 'Tick', 'KeyDown', 'KeyUp'.
- Script Structure:
  using System;
  using System.Windows.Forms;
  using GTA;
  using GTA.Native;
  using GTA.Math;

  public class MyScript : Script
  {
      public MyScript()
      {
          Tick += OnTick;
          KeyDown += OnKeyDown;
      }

      private void OnTick(object sender, EventArgs e)
      {
          // Logic here
      }

      private void OnKeyDown(object sender, KeyEventArgs e)
      {
          if (e.KeyCode == Keys.F10)
          {
              // Action here
          }
      }
  }

AUDIT MODE:
When in audit mode, analyze the provided code for:
1. Syntax errors or outdated API usage (e.g., using v2 methods in v3).
2. Performance bottlenecks (e.g., heavy logic in Tick without intervals).
3. Common pitfalls (e.g., not checking if an entity exists before using it).
4. Logic errors based on the user's intent.

Always provide the full corrected script if requested or if significant changes are needed.
`;

async function callLocalLLM(config: ProviderConfig, prompt: string): Promise<string> {
  const url = `${config.baseUrl || 'http://localhost:1234/v1'}/chat/completions`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey || 'not-needed'}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: config.systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Local LLM Error: ${response.status} ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callGemini(config: ProviderConfig, prompt: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: config.model || "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      systemInstruction: config.systemPrompt,
    },
  });
  return response.text || "Failed to generate script.";
}

export async function processRequest(config: ProviderConfig, prompt: string): Promise<string> {
  if (config.type === 'gemini') {
    return callGemini(config, prompt);
  } else {
    return callLocalLLM(config, prompt);
  }
}
