<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>
🚀 Brainstorm to Mod: GTA V Scripting Tool
A high-performance web application designed to bridge the gap between plain English concepts and functional GTA V C# scripts. Powered by Google Gemini and Local LLMs (Ollama/LM Studio), this tool enforces strict SHVDN v3.6.0 standards to ensure generated mods are compatible, performant, and safe.
Key Features:
AI Script Generation: Convert natural language prompts into production-ready .NET 4.8 C# code.
SHVDN Auditor: Real-time analysis of scripts to detect API errors, logic flaws, and performance bottlenecks.
Multi-LLM Support: Seamlessly switch between cloud-based Gemini 3.1 Pro and local models for privacy and offline development.
Developer-First UI: Features a terminal-inspired interface, syntax highlighting, and one-click .cs file exports.
API Enforcement: Automatically utilizes GTA, GTA.Native, and GTA.Math namespaces for modern SHVDN compatibility.
# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/7867175c-5e43-4d0d-95c7-471b2fc8c92d

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
