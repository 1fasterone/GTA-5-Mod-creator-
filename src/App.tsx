import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  Cpu, 
  Zap, 
  Search, 
  Code2, 
  Bug, 
  Sparkles, 
  Copy, 
  Check,
  ChevronRight,
  AlertCircle,
  Download,
  Settings,
  X,
  Globe,
  HardDrive
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-csharp';
import { processRequest, DEFAULT_SHVDN_SYSTEM_INSTRUCTION, ProviderConfig, ProviderType } from './services/geminiService';
import { cn } from './lib/utils';

type Mode = 'brainstorm' | 'audit';

export default function App() {
  const [mode, setMode] = useState<Mode>('brainstorm');
  const [prompt, setPrompt] = useState('');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Provider Settings
  const [providerType, setProviderType] = useState<ProviderType>('gemini');
  const [baseUrl, setBaseUrl] = useState('http://localhost:1234/v1');
  const [modelName, setModelName] = useState('gemini-3.1-pro-preview');
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SHVDN_SYSTEM_INSTRUCTION);

  useEffect(() => {
    if (output || code) {
      Prism.highlightAll();
    }
  }, [output, code]);

  const handleAction = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    const config: ProviderConfig = {
      type: providerType,
      baseUrl: baseUrl,
      model: modelName,
      systemPrompt: systemPrompt
    };

    const finalPrompt = mode === 'brainstorm' 
      ? `Generate a GTA V C# script for SHVDN v3.6.0 based on this prompt: ${prompt}`
      : `Audit this GTA V SHVDN v3.6.0 C# script. ${prompt ? `Context: ${prompt}` : ""} \n\nCode:\n${code}`;

    try {
      const result = await processRequest(config, finalPrompt);
      setOutput(result);
    } catch (error) {
      console.error(error);
      let errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage === 'Failed to fetch' && providerType === 'local') {
        errorMessage = "Connection Failed: Could not reach your local LLM server. \n\n" +
          "Possible reasons:\n" +
          "1. Your local server (LM Studio/Ollama) is not running.\n" +
          "2. **Mixed Content Block**: This app is on HTTPS, and browsers block requests to HTTP local servers. Try using a proxy or enabling 'Insecure content' for this site in your browser settings.\n" +
          "3. **CORS**: Ensure your local server allows requests from this origin.";
      }
      
      setOutput(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadScript = () => {
    const blob = new Blob([code || output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'GTAV_Script.cs';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#E4E3E0] font-sans selection:bg-[#F27D26] selection:text-white">
      {/* Grid Background Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#E4E3E0 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      {/* Header */}
      <header className="relative border-b border-[#1A1A1C] bg-[#0A0A0B]/80 backdrop-blur-md z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#F27D26] rounded flex items-center justify-center">
              <Terminal className="w-5 h-5 text-black" />
            </div>
            <h1 className="font-mono text-sm font-bold tracking-widest uppercase">
              Brainstorm <span className="text-[#F27D26]">to</span> Mod
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-[#151619] p-1 rounded-lg border border-[#2A2A2C]">
              <button 
                onClick={() => setMode('brainstorm')}
                className={cn(
                  "px-4 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2",
                  mode === 'brainstorm' ? "bg-[#F27D26] text-black" : "text-[#8E9299] hover:text-white"
                )}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Brainstorm
              </button>
              <button 
                onClick={() => setMode('audit')}
                className={cn(
                  "px-4 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2",
                  mode === 'audit' ? "bg-[#F27D26] text-black" : "text-[#8E9299] hover:text-white"
                )}
              >
                <Bug className="w-3.5 h-3.5" />
                Audit
              </button>
            </div>
            
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-[#1A1A1C] rounded-lg transition-colors text-[#8E9299] hover:text-white border border-[#2A2A2C]"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input */}
        <div className="lg:col-span-5 space-y-6">
          <section className="bg-[#151619] border border-[#2A2A2C] rounded-xl overflow-hidden shadow-2xl">
            <div className="px-4 py-3 border-b border-[#2A2A2C] bg-[#1A1B1E] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#F27D26]" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E9299]">
                  {mode === 'brainstorm' ? 'Prompt Engine' : 'Code Auditor'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-[#F27D26] opacity-60">
                {providerType === 'gemini' ? <Globe className="w-3 h-3" /> : <HardDrive className="w-3 h-3" />}
                {modelName}
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {mode === 'audit' && (
                <div className="space-y-2">
                  <label className="text-[11px] font-mono uppercase text-[#8E9299] flex items-center gap-2">
                    <Code2 className="w-3 h-3" /> Source Code
                  </label>
                  <textarea 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Paste your SHVDN C# script here..."
                    className="w-full h-64 bg-[#0A0A0B] border border-[#2A2A2C] rounded-lg p-4 font-mono text-sm focus:outline-none focus:border-[#F27D26] transition-colors resize-none"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[11px] font-mono uppercase text-[#8E9299] flex items-center gap-2">
                  <Zap className="w-3 h-3" /> {mode === 'brainstorm' ? 'Mod Concept' : 'Audit Context (Optional)'}
                </label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={mode === 'brainstorm' ? "e.g., Create a script where the player can teleport to the nearest waypoint and spawn a customized Zentorno..." : "e.g., Check why the Ped isn't spawning correctly in this script..."}
                  className="w-full h-32 bg-[#0A0A0B] border border-[#2A2A2C] rounded-lg p-4 font-mono text-sm focus:outline-none focus:border-[#F27D26] transition-colors resize-none"
                />
              </div>

              <button 
                onClick={handleAction}
                disabled={isLoading || (mode === 'brainstorm' ? !prompt : !code)}
                className={cn(
                  "w-full py-4 rounded-lg font-mono text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all",
                  isLoading 
                    ? "bg-[#1A1B1E] text-[#4A4A4C] cursor-not-allowed" 
                    : "bg-[#F27D26] text-black hover:bg-[#FF8C36] active:scale-[0.98]"
                )}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {mode === 'brainstorm' ? 'Generate Script' : 'Analyze Code'}
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </section>

          <section className="bg-[#151619]/50 border border-[#2A2A2C] rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#F27D26] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider">SHVDN v3.6.0 API</h4>
                <p className="text-[11px] text-[#8E9299] leading-relaxed">
                  Scripts are generated for .NET Framework 4.8. Ensure you have ScriptHookVDotNet installed in your GTA V directory.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Output */}
        <div className="lg:col-span-7">
          <div className="bg-[#151619] border border-[#2A2A2C] rounded-xl h-full flex flex-col shadow-2xl min-h-[600px]">
            <div className="px-4 py-3 border-b border-[#2A2A2C] bg-[#1A1B1E] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00FF00] animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E9299]">
                  Terminal Output
                </span>
              </div>
              <div className="flex items-center gap-2">
                {output && (
                  <>
                    <button 
                      onClick={() => copyToClipboard(output)}
                      className="p-1.5 hover:bg-[#2A2A2C] rounded transition-colors text-[#8E9299] hover:text-white"
                      title="Copy Output"
                    >
                      {copied ? <Check className="w-4 h-4 text-[#00FF00]" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={downloadScript}
                      className="p-1.5 hover:bg-[#2A2A2C] rounded transition-colors text-[#8E9299] hover:text-white"
                      title="Download .cs File"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="flex-1 p-6 overflow-auto custom-scrollbar">
              <AnimatePresence mode="wait">
                {output ? (
                  <motion.div 
                    key="output"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="prose prose-invert max-w-none"
                  >
                    <div className="markdown-body">
                      <ReactMarkdown
                        components={{
                          code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <div className="relative group">
                                <pre className={cn("!bg-[#0A0A0B] !p-4 !rounded-lg !border !border-[#2A2A2C] !my-4 overflow-x-auto", className)} {...props}>
                                  <code className={className}>{children}</code>
                                </pre>
                              </div>
                            ) : (
                              <code className="bg-[#2A2A2C] px-1.5 py-0.5 rounded text-[#F27D26] font-mono text-xs" {...props}>
                                {children}
                              </code>
                            );
                          }
                        }}
                      >
                        {output}
                      </ReactMarkdown>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-[#4A4A4C] space-y-4">
                    <div className="w-16 h-16 border border-dashed border-[#2A2A2C] rounded-full flex items-center justify-center">
                      <Search className="w-6 h-6" />
                    </div>
                    <p className="font-mono text-xs uppercase tracking-[0.2em]">Awaiting Input Sequence...</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#151619] border border-[#2A2A2C] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="px-6 py-4 border-b border-[#2A2A2C] flex items-center justify-between bg-[#1A1B1E]">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-[#F27D26]" />
                  <h2 className="font-mono text-sm font-bold uppercase tracking-widest">Engine Configuration</h2>
                </div>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="p-1 hover:bg-[#2A2A2C] rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-8 space-y-8 custom-scrollbar">
                {/* Provider Type */}
                <div className="space-y-4">
                  <label className="text-[11px] font-mono uppercase text-[#8E9299] tracking-widest">LLM Provider</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => {
                        setProviderType('gemini');
                        setModelName('gemini-3.1-pro-preview');
                      }}
                      className={cn(
                        "p-4 rounded-xl border transition-all flex flex-col items-center gap-3",
                        providerType === 'gemini' 
                          ? "bg-[#F27D26]/10 border-[#F27D26] text-[#F27D26]" 
                          : "bg-[#0A0A0B] border-[#2A2A2C] text-[#8E9299] hover:border-[#4A4A4C]"
                      )}
                    >
                      <Globe className="w-6 h-6" />
                      <span className="text-xs font-bold uppercase tracking-wider">Google Gemini</span>
                    </button>
                    <button 
                      onClick={() => {
                        setProviderType('local');
                        setModelName('local-model');
                      }}
                      className={cn(
                        "p-4 rounded-xl border transition-all flex flex-col items-center gap-3",
                        providerType === 'local' 
                          ? "bg-[#F27D26]/10 border-[#F27D26] text-[#F27D26]" 
                          : "bg-[#0A0A0B] border-[#2A2A2C] text-[#8E9299] hover:border-[#4A4A4C]"
                      )}
                    >
                      <HardDrive className="w-6 h-6" />
                      <span className="text-xs font-bold uppercase tracking-wider">Local LLM (Ollama/LM Studio)</span>
                    </button>
                  </div>
                </div>

                {/* Local Settings */}
                {providerType === 'local' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="space-y-2">
                      <label className="text-[11px] font-mono uppercase text-[#8E9299]">API Base URL</label>
                      <input 
                        type="text" 
                        value={baseUrl}
                        onChange={(e) => setBaseUrl(e.target.value)}
                        className="w-full bg-[#0A0A0B] border border-[#2A2A2C] rounded-lg p-3 font-mono text-sm focus:outline-none focus:border-[#F27D26]"
                        placeholder="http://localhost:1234/v1"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Model Name */}
                <div className="space-y-2">
                  <label className="text-[11px] font-mono uppercase text-[#8E9299]">Model Identifier</label>
                  <input 
                    type="text" 
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    className="w-full bg-[#0A0A0B] border border-[#2A2A2C] rounded-lg p-3 font-mono text-sm focus:outline-none focus:border-[#F27D26]"
                    placeholder={providerType === 'gemini' ? "gemini-3.1-pro-preview" : "llama3"}
                  />
                </div>

                {/* System Prompt */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-mono uppercase text-[#8E9299]">System Instruction</label>
                    <button 
                      onClick={() => setSystemPrompt(DEFAULT_SHVDN_SYSTEM_INSTRUCTION)}
                      className="text-[10px] uppercase text-[#F27D26] hover:underline"
                    >
                      Reset to Default
                    </button>
                  </div>
                  <textarea 
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    className="w-full h-64 bg-[#0A0A0B] border border-[#2A2A2C] rounded-lg p-4 font-mono text-xs leading-relaxed focus:outline-none focus:border-[#F27D26] resize-none"
                  />
                </div>

                {/* Troubleshooting */}
                {providerType === 'local' && (
                  <div className="p-4 bg-[#F27D26]/5 border border-[#F27D26]/20 rounded-xl space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#F27D26] flex items-center gap-2">
                      <AlertCircle className="w-3 h-3" /> Local LLM Troubleshooting
                    </h4>
                    <ul className="text-[10px] text-[#8E9299] space-y-2 list-disc pl-4 leading-relaxed">
                      <li><strong>Mixed Content:</strong> Since this app uses HTTPS, browsers block <code>http://localhost</code>. You may need to enable "Insecure Content" for this site in browser site settings.</li>
                      <li><strong>CORS:</strong> Ensure your server (LM Studio/Ollama) has CORS enabled for all origins (<code>*</code>).</li>
                      <li><strong>Ollama:</strong> Set environment variable <code>OLLAMA_ORIGINS="*"</code> before starting.</li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-[#2A2A2C] bg-[#1A1B1E]">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="w-full py-3 bg-[#F27D26] text-black rounded-lg font-mono text-xs font-bold uppercase tracking-widest hover:bg-[#FF8C36] transition-colors"
                >
                  Save Configuration
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0A0A0B;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2A2A2C;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3A3A3C;
        }
        .markdown-body h1, .markdown-body h2, .markdown-body h3 {
          font-family: 'Courier New', Courier, monospace;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #F27D26;
          border-bottom: 1px solid #2A2A2C;
          padding-bottom: 0.5rem;
          margin-top: 2rem;
        }
        .markdown-body p {
          font-size: 0.9rem;
          line-height: 1.6;
          color: #8E9299;
        }
        .markdown-body ul {
          list-style-type: square;
          color: #8E9299;
          font-size: 0.9rem;
        }
        .markdown-body strong {
          color: #E4E3E0;
        }
      `}</style>
    </div>
  );
}
