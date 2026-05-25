"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Editor, { OnMount, BeforeMount } from "@monaco-editor/react";
import type { Vulnerability } from "@/types/vulnerability";

interface SolidityEditorProps {
  sourceCode: string;
  onChange?: (value: string) => void;
  vulnerabilities?: Vulnerability[];
  readOnly?: boolean;
  height?: string;
}

// Loading skeleton with cinematic shimmer
function EditorSkeleton() {
  const lines = Array.from({ length: 30 }, (_, i) => i);
  return (
    <div className="h-full bg-[#0d1117] p-4 overflow-hidden">
      {/* Line number gutter shimmer */}
      <div className="flex gap-4">
        <div className="flex flex-col gap-[7px] w-8 shrink-0">
          {lines.map((i) => (
            <div
              key={i}
              className="h-[13px] rounded-sm bg-white/[0.03]"
              style={{ opacity: Math.max(0.3, 1 - i * 0.02) }}
            />
          ))}
        </div>
        {/* Code lines shimmer */}
        <div className="flex-1 flex flex-col gap-[7px]">
          {lines.map((i) => {
            const width = `${30 + Math.random() * 60}%`;
            return (
              <div key={i} className="relative h-[13px] overflow-hidden rounded-sm">
                <div
                  className="h-full bg-white/[0.04]"
                  style={{ width, opacity: Math.max(0.3, 1 - i * 0.02) }}
                />
                {/* Shimmer sweep */}
                <div
                  className="absolute inset-0 -translate-x-full animate-shimmer"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(0,255,136,0.03), transparent)",
                    animationDelay: `${i * 0.05}s`,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
      {/* Pulsing status indicator */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-vulnforge-accent/40 animate-pulse" />
        <span className="text-[10px] text-slate-600 font-mono">Loading Solidity compiler...</span>
      </div>
    </div>
  );
}

export default function SolidityEditor({
  sourceCode,
  onChange,
  vulnerabilities = [],
  readOnly = false,
  height = "100%",
}: SolidityEditorProps) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const monacoRef = useRef<Parameters<BeforeMount>[0] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleBeforeMount: BeforeMount = useCallback((monaco) => {
    monacoRef.current = monaco;

    // Custom VulnForge dark theme
    monaco.editor.defineTheme("vulnforge-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "4a5568", fontStyle: "italic" },
        { token: "comment.block", foreground: "4a5568", fontStyle: "italic" },
        { token: "keyword", foreground: "c084fc" },
        { token: "keyword.control", foreground: "c084fc" },
        { token: "string", foreground: "fbbf24" },
        { token: "string.escape", foreground: "f59e0b" },
        { token: "number", foreground: "34d399" },
        { token: "number.hex", foreground: "34d399" },
        { token: "type", foreground: "06b6d4" },
        { token: "type.identifier", foreground: "06b6d4" },
        { token: "function", foreground: "60a5fa" },
        { token: "function.declaration", foreground: "60a5fa" },
        { token: "variable", foreground: "e2e8f0" },
        { token: "variable.predefined", foreground: "f87171" },
        { token: "identifier", foreground: "e2e8f0" },
        { token: "operator", foreground: "94a3b8" },
        { token: "delimiter", foreground: "64748b" },
        { token: "delimiter.bracket", foreground: "94a3b8" },
        { token: "annotation", foreground: "#00ff88" },
        { token: "tag", foreground: "#00ff88" },
      ],
      colors: {
        "editor.background": "#050810",
        "editor.foreground": "#e2e8f0",
        "editor.lineHighlightBackground": "#0a0f1a80",
        "editor.lineHighlightBorder": "#0a0f1a00",
        "editor.selectionBackground": "#00ff8818",
        "editor.inactiveSelectionBackground": "#00ff880c",
        "editorLineNumber.foreground": "#1e293b",
        "editorLineNumber.activeForeground": "#00ff88",
        "editorLineNumber.dimmedForeground": "#1e293b",
        "editorCursor.foreground": "#00ff88",
        "editorCursor.background": "#050810",
        "editorGutter.background": "#050810",
        "editorGutter.modifiedBackground": "#3b82f680",
        "editorGutter.addedBackground": "#00ff8880",
        "editorGutter.deletedBackground": "#ff386080",
        "editorIndentGuide.background": "#ffffff06",
        "editorIndentGuide.activeBackground": "#ffffff10",
        "editorWidget.background": "#0a0f1a",
        "editorWidget.border": "#1e293b",
        "editorWidget.foreground": "#e2e8f0",
        "editorSuggestWidget.background": "#0a0f1a",
        "editorSuggestWidget.border": "#1e293b",
        "editorSuggestWidget.selectedBackground": "#00ff8815",
        "editorHoverWidget.background": "#0a0f1a",
        "editorHoverWidget.border": "#1e293b",
        "minimap.background": "#050810",
        "minimap.selectionHighlight": "#00ff8830",
        "scrollbar.shadow": "#00000040",
        "scrollbarSlider.background": "#00ff8812",
        "scrollbarSlider.hoverBackground": "#00ff8820",
        "scrollbarSlider.activeBackground": "#00ff8830",
        "editorBracketMatch.background": "#00ff8815",
        "editorBracketMatch.border": "#00ff8840",
        "editorOverviewRuler.border": "#0a0f1a",
        "editor.findMatchBackground": "#fbbf2420",
        "editor.findMatchHighlightBackground": "#fbbf2410",
      },
    });
  }, []);

  const handleMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    setIsLoading(false);

    // Register Solidity language with full Monarch tokenizer
    const languages = monaco.languages.getLanguages();
    if (!languages.some((l) => l.id === "solidity")) {
      monaco.languages.register({ id: "solidity" });
      monaco.languages.setMonarchTokensProvider("solidity", {
        keywords: [
          "pragma", "solidity", "contract", "library", "interface", "function",
          "modifier", "event", "struct", "enum", "mapping", "address", "bool",
          "string", "uint", "int", "uint256", "int256", "uint128", "uint64",
          "uint8", "uint16", "uint32", "uint40", "uint48", "uint56", "uint72",
          "uint80", "uint96", "uint104", "uint112", "uint120", "uint144",
          "uint160", "uint192", "uint200", "uint216", "uint224", "uint232",
          "uint240", "uint248", "int8", "int16", "int32", "int64", "int128",
          "bytes1", "bytes2", "bytes3", "bytes4", "bytes5", "bytes6", "bytes7",
          "bytes8", "bytes9", "bytes10", "bytes11", "bytes12", "bytes13",
          "bytes14", "bytes15", "bytes16", "bytes17", "bytes18", "bytes19",
          "bytes20", "bytes21", "bytes22", "bytes23", "bytes24", "bytes25",
          "bytes26", "bytes27", "bytes28", "bytes29", "bytes30", "bytes31",
          "bytes32", "bytes", "public", "private", "internal", "external",
          "pure", "view", "payable", "nonpayable", "returns", "if", "else",
          "for", "while", "do", "break", "continue", "return", "revert",
          "require", "assert", "emit", "new", "delete", "try", "catch",
          "assembly", "let", "switch", "case", "default", "import", "from",
          "is", "abstract", "override", "virtual", "immutable", "constant",
          "indexed", "anonymous", "storage", "memory", "calldata", "constructor",
          "fallback", "receive", "selfdestruct", "delegatecall", "staticcall",
          "call", "transfer", "send", "gas", "value", "wei", "gwei", "ether",
          "true", "false", "this", "super", "block", "msg", "tx", "now",
          "type", "interface", "unchecked", "error", "using", "for",
        ],
        typeKeywords: [
          "address", "bool", "string", "bytes", "uint", "int",
          "mapping", "address payable",
        ],
        operators: [
          "=", ">", "<", "!", "~", "?", ":", "==", "<=", ">=", "!=",
          "&&", "||", "++", "--", "+", "-", "*", "/", "&", "|", "^", "%",
          "<<", ">>", ">>>", "+=", "-=", "*=", "/=", "&=", "|=", "^=",
          "<<=", ">>=", "=>",
        ],
        symbols: /[=><!~?:&|+\-*\/\^%]+/,
        tokenizer: {
          root: [
            [/\/\/.*$/, "comment"],
            [/\/\*/, "comment", "@comment"],
            [/\d+(\.\d+)?(e[+-]?\d+)?/, "number"],
            [/0x[0-9a-fA-F]+/, "number.hex"],
            [/"[^"]*"/, "string"],
            [/'[^']*'/, "string"],
            [/`[^`]*`/, "string"],
            [/[a-zA-Z_$][\w$]*/, {
              cases: {
                "@keywords": "keyword",
                "@typeKeywords": "type",
                "@default": "identifier",
              },
            }],
            [/[{}()\[\]]/, "delimiter.bracket"],
            [/[;,.]/, "delimiter"],
          ],
          comment: [
            [/[^/*]+/, "comment"],
            [/\*\//, "comment", "@pop"],
            [/[/*]/, "comment"],
          ],
        },
      });
    }

    // Focus editor
    editor.focus();
  }, []);

  // Apply vulnerability decorations with animated reveal
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current || vulnerabilities.length === 0) return;
    const editor = editorRef.current;
    const monaco = monacoRef.current;

    const decorations = vulnerabilities.map((vuln) => {
      const severityColor =
        vuln.severity === "CRITICAL" ? "#ff3860" :
        vuln.severity === "HIGH" ? "#ff6b35" :
        vuln.severity === "MEDIUM" ? "#fbbf24" :
        vuln.severity === "LOW" ? "#3b82f6" : "#a855f7";

      return {
        range: new monaco.Range(vuln.line_start, 1, vuln.line_end, 1),
        options: {
          isWholeLine: true,
          className: `vuln-line-${vuln.severity.toLowerCase()}`,
          glyphMarginClassName: "vuln-glyph",
          glyphMarginHoverMessage: { value: `**${vuln.severity}**: ${vuln.title}` },
          hoverMessage: {
            value: [
              `### ${vuln.severity} — ${vuln.title}`,
              "",
              vuln.description,
              "",
              `**Function:** \`${vuln.affected_function}\``,
              `**Lines:** ${vuln.line_start}–${vuln.line_end}`,
            ].join("\n"),
          },
          minimap: { color: severityColor, position: 1 },
          overviewRuler: { color: severityColor, position: 4 },
          beforeContentClassName: `vuln-decoration-before`,
        },
      };
    });

    editor.deltaDecorations([], decorations);
  }, [vulnerabilities, sourceCode]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-vulnforge-border/60 group">
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-vulnforge-accent/30 to-transparent z-10" />

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050810] to-[#0a0f1a] pointer-events-none" />

      <Editor
        height={height}
        defaultLanguage="solidity"
        theme="vulnforge-dark"
        value={sourceCode}
        onChange={(value) => onChange?.(value || "")}
        beforeMount={handleBeforeMount}
        onMount={handleMount}
        options={{
          readOnly,
          fontSize: 13.5,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          fontLigatures: true,
          letterSpacing: 0.3,
          lineHeight: 22,
          lineNumbers: "on",
          glyphMargin: true,
          folding: true,
          minimap: { enabled: true, maxColumn: 80, renderCharacters: false },
          scrollBeyondLastLine: false,
          wordWrap: "on",
          padding: { top: 20, bottom: 20 },
          renderLineHighlight: "all",
          renderLineHighlightOnlyWhenFocus: false,
          bracketPairColorization: { enabled: true },
          guides: { bracketPairs: true, indentation: true },
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          cursorWidth: 2,
          suggest: { showWords: false },
          quickSuggestions: false,
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true,
          scrollbar: {
            verticalScrollbarSize: 6,
            horizontalScrollbarSize: 6,
            verticalSliderSize: 6,
            useShadows: false,
          },
          automaticLayout: true,
          tabSize: 4,
        }}
        loading={<EditorSkeleton />}
      />

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#050810] to-transparent pointer-events-none z-10" />
    </div>
  );
}
