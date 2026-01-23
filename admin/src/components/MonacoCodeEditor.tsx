import { useEffect, useRef, useState } from 'react';

interface MonacoCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  filename: string;
  height?: string;
}

export default function MonacoCodeEditor({ 
  value, 
  onChange, 
  language, 
  height = '100%' 
}: MonacoCodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initMonaco = async () => {
      if (editorRef.current && !monacoRef.current) {
        try {
          // Import Monaco editor with proper handling for Vite
          const monacoModule = await import('monaco-editor');
          const monaco = (monacoModule as any).default || monacoModule;
          
          // Configure Monaco Editor workers for Vite
          (self as any).MonacoEnvironment = {
            getWorker: function (_: any, label: string) {
              if (label === 'json') {
                return new Worker(new URL('monaco-editor/esm/vs/language/json/json.worker', import.meta.url), { type: 'module' });
              }
              if (label === 'css' || label === 'scss' || label === 'less') {
                return new Worker(new URL('monaco-editor/esm/vs/language/css/css.worker', import.meta.url), { type: 'module' });
              }
              if (label === 'html' || label === 'handlebars' || label === 'razor') {
                return new Worker(new URL('monaco-editor/esm/vs/language/html/html.worker', import.meta.url), { type: 'module' });
              }
              if (label === 'typescript' || label === 'javascript') {
                return new Worker(new URL('monaco-editor/esm/vs/language/typescript/ts.worker', import.meta.url), { type: 'module' });
              }
              return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker', import.meta.url), { type: 'module' });
            }
          };
          
          // Configure VS Code Dark+ theme with enhanced colors
          monaco.editor.defineTheme('vscode-dark-enhanced', {
            base: 'vs-dark',
            inherit: true,
            rules: [
              // Comments
              { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
              { token: 'comment.line', foreground: '6A9955', fontStyle: 'italic' },
              { token: 'comment.block', foreground: '6A9955', fontStyle: 'italic' },
              
              // Keywords
              { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
              { token: 'keyword.control', foreground: 'C586C0', fontStyle: 'bold' },
              { token: 'keyword.operator', foreground: '569CD6' },
              { token: 'keyword.other', foreground: '569CD6' },
              
              // Strings
              { token: 'string', foreground: 'CE9178' },
              { token: 'string.quoted', foreground: 'CE9178' },
              { token: 'string.template', foreground: 'CE9178' },
              
              // Numbers
              { token: 'number', foreground: 'B5CEA8' },
              { token: 'number.hex', foreground: 'B5CEA8' },
              { token: 'number.octal', foreground: 'B5CEA8' },
              { token: 'number.binary', foreground: 'B5CEA8' },
              { token: 'number.float', foreground: 'B5CEA8' },
              
              // Operators and punctuation
              { token: 'operator', foreground: 'D4D4D4' },
              { token: 'delimiter', foreground: 'D4D4D4' },
              { token: 'delimiter.bracket', foreground: 'FFD700' },
              { token: 'delimiter.parenthesis', foreground: 'DA70D6' },
              { token: 'delimiter.square', foreground: '87CEEB' },
              { token: 'delimiter.angle', foreground: '808080' },
              
              // Types and classes
              { token: 'type', foreground: '4EC9B0', fontStyle: 'bold' },
              { token: 'type.identifier', foreground: '4EC9B0' },
              { token: 'class', foreground: '4EC9B0', fontStyle: 'bold' },
              { token: 'class.identifier', foreground: '4EC9B0' },
              { token: 'interface', foreground: '4EC9B0', fontStyle: 'bold' },
              { token: 'struct', foreground: '4EC9B0', fontStyle: 'bold' },
              { token: 'namespace', foreground: '4EC9B0' },
              
              // Variables and identifiers
              { token: 'variable', foreground: '9CDCFE' },
              { token: 'variable.name', foreground: '9CDCFE' },
              { token: 'variable.other', foreground: '9CDCFE' },
              { token: 'parameter', foreground: '9CDCFE' },
              { token: 'property', foreground: '9CDCFE' },
              { token: 'property.name', foreground: '9CDCFE' },
              
              // Functions
              { token: 'function', foreground: 'DCDCAA', fontStyle: 'bold' },
              { token: 'function.name', foreground: 'DCDCAA' },
              { token: 'method', foreground: 'DCDCAA', fontStyle: 'bold' },
              { token: 'method.name', foreground: 'DCDCAA' },
              
              // Constants and enums
              { token: 'constant', foreground: '4FC1FF', fontStyle: 'bold' },
              { token: 'constant.numeric', foreground: 'B5CEA8' },
              { token: 'constant.language', foreground: '569CD6', fontStyle: 'bold' },
              { token: 'enumMember', foreground: '4FC1FF' },
              
              // HTML/XML
              { token: 'tag', foreground: '569CD6', fontStyle: 'bold' },
              { token: 'tag.name', foreground: '569CD6' },
              { token: 'attribute.name', foreground: '9CDCFE' },
              { token: 'attribute.value', foreground: 'CE9178' },
              
              // CSS
              { token: 'property.css', foreground: '9CDCFE' },
              { token: 'property.value.css', foreground: 'CE9178' },
              { token: 'selector.css', foreground: 'D7BA7D' },
              
              // JSON
              { token: 'key', foreground: '9CDCFE' },
              { token: 'key.json', foreground: '9CDCFE' },
              { token: 'value.json', foreground: 'CE9178' },
              
              // Markdown
              { token: 'emphasis', foreground: 'D4D4D4', fontStyle: 'italic' },
              { token: 'strong', foreground: 'D4D4D4', fontStyle: 'bold' },
              { token: 'header', foreground: '569CD6', fontStyle: 'bold' },
              
              // Python specific
              { token: 'decorator', foreground: 'DCDCAA' },
              { token: 'decorator.python', foreground: 'DCDCAA' },
              
              // JavaScript/TypeScript specific
              { token: 'regexp', foreground: 'D16969' },
              { token: 'regexp.js', foreground: 'D16969' },
              { token: 'template', foreground: 'CE9178' },
              { token: 'template.js', foreground: 'CE9178' },
            ],
            colors: {
              // Editor background and foreground
              'editor.background': '#1E1E1E',
              'editor.foreground': '#D4D4D4',
              
              // Line numbers
              'editorLineNumber.foreground': '#858585',
              'editorLineNumber.activeForeground': '#C6C6C6',
              
              // Selection and highlighting
              'editor.selectionBackground': '#264F78',
              'editor.inactiveSelectionBackground': '#3A3D41',
              'editor.lineHighlightBackground': '#2A2D2E',
              'editor.selectionHighlightBackground': '#ADD6FF26',
              'editor.wordHighlightBackground': '#575757B8',
              'editor.wordHighlightStrongBackground': '#004972B8',
              'editor.findMatchBackground': '#515C6A',
              'editor.findMatchHighlightBackground': '#EA5C0055',
              'editor.findRangeHighlightBackground': '#3A3D4166',
              
              // Cursor
              'editorCursor.foreground': '#AEAFAD',
              
              // Bracket matching
              'editorBracketMatch.background': '#0064001A',
              'editorBracketMatch.border': '#888888',
              'editorBracketHighlight.foreground1': '#FFD700',
              'editorBracketHighlight.foreground2': '#DA70D6',
              'editorBracketHighlight.foreground3': '#87CEEB',
              'editorBracketHighlight.foreground4': '#FFA500',
              'editorBracketHighlight.foreground5': '#98FB98',
              'editorBracketHighlight.foreground6': '#F0E68C',
              
              // Gutter
              'editorGutter.background': '#1E1E1E',
              'editorGutter.modifiedBackground': '#1B81A8',
              'editorGutter.addedBackground': '#487E02',
              'editorGutter.deletedBackground': '#F85149',
              'editorGutter.foldingControlForeground': '#C5C5C5',
              
              // Scrollbar
              'scrollbar.shadow': '#000000',
              'scrollbarSlider.background': '#79797966',
              'scrollbarSlider.hoverBackground': '#646464B3',
              'scrollbarSlider.activeBackground': '#BFBFBF66',
              
              // Overview ruler
              'editorOverviewRuler.border': '#010409',
              'editorOverviewRuler.findMatchForeground': '#D186167E',
              'editorOverviewRuler.rangeHighlightForeground': '#007ACC99',
              'editorOverviewRuler.selectionHighlightForeground': '#A0A0A0CC',
              'editorOverviewRuler.wordHighlightForeground': '#A0A0A0CC',
              'editorOverviewRuler.wordHighlightStrongForeground': '#C0A0C0CC',
              'editorOverviewRuler.modifiedForeground': '#1B81A8',
              'editorOverviewRuler.addedForeground': '#487E02',
              'editorOverviewRuler.deletedForeground': '#F85149',
              'editorOverviewRuler.errorForeground': '#F85149',
              'editorOverviewRuler.warningForeground': '#FFCC02',
              'editorOverviewRuler.infoForeground': '#75BEFF',
              
              // Indent guides
              'editorIndentGuide.background': '#404040',
              'editorIndentGuide.activeBackground': '#707070',
              
              // Rulers
              'editorRuler.foreground': '#5A5A5A',
              
              // Error, warning, info squiggles
              'editorError.foreground': '#F85149',
              'editorWarning.foreground': '#FFCC02',
              'editorInfo.foreground': '#75BEFF',
              'editorHint.foreground': '#EEEEEE',
              
              // Suggest widget
              'editorSuggestWidget.background': '#252526',
              'editorSuggestWidget.border': '#454545',
              'editorSuggestWidget.foreground': '#CCCCCC',
              'editorSuggestWidget.selectedBackground': '#094771',
              'editorSuggestWidget.highlightForeground': '#18A3FF',
              
              // Hover widget
              'editorHoverWidget.background': '#252526',
              'editorHoverWidget.border': '#454545',
              'editorHoverWidget.foreground': '#CCCCCC',
              
              // Parameter hints
              'editorParameterHint.background': '#252526',
              'editorParameterHint.border': '#454545',
              'editorParameterHint.foreground': '#CCCCCC',
              
              // Code lens
              'editorCodeLens.foreground': '#999999',
              
              // Lightbulb
              'editorLightBulb.foreground': '#FFCC02',
              'editorLightBulbAutoFix.foreground': '#75BEFF',
            }
          });

          // Create editor with comprehensive VS Code-like configuration
          monacoRef.current = monaco.editor.create(editorRef.current, {
            value: value,
            language: getMonacoLanguage(language),
            theme: 'vscode-dark-enhanced',
            
            // Font settings - larger and more readable
            fontSize: 20,
            fontFamily: '"Fira Code", "JetBrains Mono", "Cascadia Code", "SF Mono", Monaco, Menlo, "Ubuntu Mono", Consolas, monospace',
            fontLigatures: true,
            fontWeight: '500',
            lineHeight: 28,
            letterSpacing: 0.5,
            
            // Line numbers and gutter
            lineNumbers: 'on',
            lineNumbersMinChars: 6,
            glyphMargin: true,
            folding: true,
            foldingStrategy: 'indentation',
            showFoldingControls: 'always',
            unfoldOnClickAfterEndOfLine: true,
            foldingHighlight: true,
            foldingImportsByDefault: false,
            
            // Editor behavior
            links: true,
            colorDecorators: true,
            lightbulb: {
              enabled: true
            },
            formatOnSave: true,
            formatOnPaste: true,
            formatOnType: true,
            autoIndent: 'full',
            tabSize: 2,
            insertSpaces: true,
            detectIndentation: true,
            trimAutoWhitespace: true,
            
            // Rendering
            renderWhitespace: 'selection',
            renderControlCharacters: false,
            renderLineHighlight: 'line',
            renderLineHighlightOnlyWhenFocus: false,
            hideCursorInOverviewRuler: false,
            
            // Scrolling
            scrollBeyondLastLine: false,
            scrollBeyondLastColumn: 5,
            smoothScrolling: true,
            
            // Cursor
            cursorBlinking: 'blink',
            cursorStyle: 'line',
            cursorWidth: 2,
            cursorSmoothCaretAnimation: 'on',
            
            // Mouse and keyboard
            mouseWheelZoom: true,
            mouseWheelScrollSensitivity: 1,
            fastScrollSensitivity: 5,
            multiCursorModifier: 'alt',
            multiCursorMergeOverlapping: true,
            multiCursorPaste: 'spread',
            
            // Scrollbar
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
              arrowSize: 11,
              useShadows: true,
              verticalHasArrows: false,
              horizontalHasArrows: false,
              verticalScrollbarSize: 18,
              horizontalScrollbarSize: 16,
              verticalSliderSize: 18,
              horizontalSliderSize: 16
            },
            
            // Minimap
            minimap: {
              enabled: true,
              side: 'right',
              size: 'proportional',
              showSlider: 'mouseover',
              renderCharacters: true,
              maxColumn: 120,
              scale: 1
            },
            
            // Overview ruler
            overviewRulerBorder: false,
            overviewRulerLanes: 3,
            
            // Word wrapping
            wordWrap: 'on',
            wordWrapColumn: 120,
            wrappingIndent: 'indent',
            wrappingStrategy: 'advanced',
            
            // Layout
            automaticLayout: true,
            
            // Bracket pair colorization
            bracketPairColorization: {
              enabled: true,
              independentColorPoolPerBracketType: true
            },
            
            // Guides
            guides: {
              bracketPairs: true,
              bracketPairsHorizontal: true,
              highlightActiveBracketPair: true,
              indentation: true,
              highlightActiveIndentation: true
            },
            
            // IntelliSense and suggestions
            suggest: {
              enabled: true,
              showKeywords: true,
              showSnippets: true,
              showFunctions: true,
              showConstructors: true,
              showFields: true,
              showVariables: true,
              showClasses: true,
              showStructs: true,
              showInterfaces: true,
              showModules: true,
              showProperties: true,
              showEvents: true,
              showOperators: true,
              showUnits: true,
              showValues: true,
              showConstants: true,
              showEnums: true,
              showEnumMembers: true,
              showColors: true,
              showFiles: true,
              showReferences: true,
              showFolders: true,
              showTypeParameters: true,
              showIssues: true,
              showUsers: true,
              filterGraceful: true,
              snippetsPreventQuickSuggestions: false,
              localityBonus: true,
              shareSuggestSelections: true,
              showInlineDetails: true,
              showStatusBar: true,
              preview: true,
              previewMode: 'prefix',
              insertMode: 'insert'
            },
            
            // Quick suggestions
            quickSuggestions: {
              other: 'on',
              comments: 'on',
              strings: 'on'
            },
            quickSuggestionsDelay: 10,
            
            // Parameter hints
            parameterHints: {
              enabled: true,
              cycle: true
            },
            
            // Auto-closing
            autoClosingBrackets: 'always',
            autoClosingQuotes: 'always',
            autoClosingDelete: 'always',
            autoClosingOvertype: 'always',
            autoSurround: 'languageDefined',
            
            // Code lens and other features
            codeLens: true,
            contextmenu: true,
            copyWithSyntaxHighlighting: true,
            dragAndDrop: true,
            emptySelectionClipboard: true,
            
            // Find widget
            find: {
              cursorMoveOnType: true,
              seedSearchStringFromSelection: 'always',
              autoFindInSelection: 'never',
              addExtraSpaceOnTop: true,
              loop: true
            },
            
            // Hover
            hover: {
              enabled: true,
              delay: 300,
              sticky: true
            },
            
            // Matching
            matchBrackets: 'always',
            occurrencesHighlight: 'singleFile',
            
            // Selection
            selectOnLineNumbers: true,
            selectionHighlight: true,
            
            // Deprecated and unused code
            showDeprecated: true,
            showUnused: true,
            
            // Sticky scroll
            stickyScroll: {
              enabled: true,
              maxLineCount: 5,
              defaultModel: 'outlineModel'
            },
            
            // Tab completion
            tabCompletion: 'on',
            useTabStops: true,
            
            // Word-based suggestions
            wordBasedSuggestions: 'matchingDocuments',
            
            // Rulers for line length
            rulers: [80, 120],
            
            // Read-only
            readOnly: false
          });

          // Listen for content changes
          monacoRef.current.onDidChangeModelContent(() => {
            if (monacoRef.current) {
              onChange(monacoRef.current.getValue());
            }
          });

          // Add keyboard shortcuts
          monacoRef.current.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            // Save command will be handled by parent component
            console.log('Save shortcut pressed');
          });

          // Enhanced language-specific configurations
          await configureLanguageFeatures(monaco, language);
          
          setIsLoading(false);
        } catch (error) {
          console.error('Failed to initialize Monaco editor:', error);
          setError('Failed to load code editor. Please refresh the page.');
          setIsLoading(false);
        }
      }
    };

    initMonaco();

    return () => {
      if (monacoRef.current) {
        monacoRef.current.dispose();
        monacoRef.current = null;
      }
    };
  }, []);

  // Update editor value when prop changes
  useEffect(() => {
    if (monacoRef.current && monacoRef.current.getValue() !== value) {
      const position = monacoRef.current.getPosition();
      monacoRef.current.setValue(value);
      if (position) {
        monacoRef.current.setPosition(position);
      }
    }
  }, [value]);

  // Update language when it changes
  useEffect(() => {
    const updateLanguage = async () => {
      if (monacoRef.current) {
        try {
          const monacoModule = await import('monaco-editor');
          const monaco = (monacoModule as any).default || monacoModule;
          const model = monacoRef.current.getModel();
          if (model) {
            monaco.editor.setModelLanguage(model, getMonacoLanguage(language));
            await configureLanguageFeatures(monaco, language);
          }
        } catch (error) {
          console.error('Failed to update language:', error);
        }
      }
    };
    updateLanguage();
  }, [language]);

  const configureLanguageFeatures = async (monaco: any, language: string) => {
    try {
      // Enhanced TypeScript/JavaScript configuration
      if (language === 'typescript' || language === 'javascript') {
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
          target: monaco.languages.typescript.ScriptTarget.Latest,
          allowNonTsExtensions: true,
          moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
          module: monaco.languages.typescript.ModuleKind.CommonJS,
          noEmit: true,
          esModuleInterop: true,
          jsx: monaco.languages.typescript.JsxEmit.React,
          reactNamespace: 'React',
          allowJs: true,
          typeRoots: ['node_modules/@types'],
          strict: true,
          noImplicitAny: false,
          strictNullChecks: true,
          strictFunctionTypes: true,
          noImplicitReturns: true,
          noFallthroughCasesInSwitch: true,
          skipLibCheck: true
        });

        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: false,
          noSyntaxValidation: false,
          noSuggestionDiagnostics: false
        });

        // Add comprehensive type definitions
        monaco.languages.typescript.typescriptDefaults.addExtraLib(`
          declare var console: {
            log(message?: any, ...optionalParams: any[]): void;
            error(message?: any, ...optionalParams: any[]): void;
            warn(message?: any, ...optionalParams: any[]): void;
            info(message?: any, ...optionalParams: any[]): void;
            debug(message?: any, ...optionalParams: any[]): void;
            trace(message?: any, ...optionalParams: any[]): void;
          };
          
          declare var window: Window & typeof globalThis;
          declare var document: Document;
          declare var localStorage: Storage;
          declare var sessionStorage: Storage;
          
          interface Window {
            [key: string]: any;
          }
          
          interface Document {
            getElementById(elementId: string): HTMLElement | null;
            querySelector(selectors: string): Element | null;
            querySelectorAll(selectors: string): NodeListOf<Element>;
          }
          
          // Common utility types
          type Partial<T> = { [P in keyof T]?: T[P] };
          type Required<T> = { [P in keyof T]-?: T[P] };
          type Readonly<T> = { readonly [P in keyof T]: T[P] };
          type Record<K extends keyof any, T> = { [P in K]: T };
          type Pick<T, K extends keyof T> = { [P in K]: T[P] };
          type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
        `, 'ts:lib.enhanced.d.ts');
      }

      // Enhanced Python language support
      if (language === 'python') {
        monaco.languages.registerCompletionItemProvider('python', {
          provideCompletionItems: () => {
            const suggestions = [
              // Built-in functions
              {
                label: 'print',
                kind: monaco.languages.CompletionItemKind.Function,
                insertText: 'print(${1:})',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'Print objects to the text stream file'
              },
              {
                label: 'len',
                kind: monaco.languages.CompletionItemKind.Function,
                insertText: 'len(${1:})',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'Return the length of an object'
              },
              {
                label: 'range',
                kind: monaco.languages.CompletionItemKind.Function,
                insertText: 'range(${1:stop})',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'Create a sequence of numbers'
              },
              {
                label: 'input',
                kind: monaco.languages.CompletionItemKind.Function,
                insertText: 'input(${1:"Enter value: "})',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'Read a string from standard input'
              },
              
              // Control structures
              {
                label: 'def',
                kind: monaco.languages.CompletionItemKind.Keyword,
                insertText: 'def ${1:function_name}(${2:}):\n    ${3:pass}',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'Define a function'
              },
              {
                label: 'class',
                kind: monaco.languages.CompletionItemKind.Keyword,
                insertText: 'class ${1:ClassName}:\n    def __init__(self${2:}):\n        ${3:pass}',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'Define a class'
              },
              {
                label: 'if',
                kind: monaco.languages.CompletionItemKind.Keyword,
                insertText: 'if ${1:condition}:\n    ${2:pass}',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'If statement'
              },
              {
                label: 'elif',
                kind: monaco.languages.CompletionItemKind.Keyword,
                insertText: 'elif ${1:condition}:\n    ${2:pass}',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'Else if statement'
              },
              {
                label: 'else',
                kind: monaco.languages.CompletionItemKind.Keyword,
                insertText: 'else:\n    ${1:pass}',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'Else statement'
              },
              {
                label: 'for',
                kind: monaco.languages.CompletionItemKind.Keyword,
                insertText: 'for ${1:item} in ${2:iterable}:\n    ${3:pass}',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'For loop'
              },
              {
                label: 'while',
                kind: monaco.languages.CompletionItemKind.Keyword,
                insertText: 'while ${1:condition}:\n    ${2:pass}',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'While loop'
              },
              {
                label: 'try',
                kind: monaco.languages.CompletionItemKind.Keyword,
                insertText: 'try:\n    ${1:pass}\nexcept ${2:Exception} as ${3:e}:\n    ${4:pass}',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'Try-except block'
              },
              {
                label: 'with',
                kind: monaco.languages.CompletionItemKind.Keyword,
                insertText: 'with ${1:expression} as ${2:variable}:\n    ${3:pass}',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'With statement'
              },
              
              // Common imports
              {
                label: 'import os',
                kind: monaco.languages.CompletionItemKind.Module,
                insertText: 'import os',
                documentation: 'Import os module'
              },
              {
                label: 'import sys',
                kind: monaco.languages.CompletionItemKind.Module,
                insertText: 'import sys',
                documentation: 'Import sys module'
              },
              {
                label: 'import json',
                kind: monaco.languages.CompletionItemKind.Module,
                insertText: 'import json',
                documentation: 'Import json module'
              },
              {
                label: 'import datetime',
                kind: monaco.languages.CompletionItemKind.Module,
                insertText: 'import datetime',
                documentation: 'Import datetime module'
              }
            ];
            return { suggestions };
          }
        });
      }

      // Enhanced HTML language support
      if (language === 'html') {
        monaco.languages.registerCompletionItemProvider('html', {
          provideCompletionItems: () => {
            const suggestions = [
              {
                label: 'html5',
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>${1:Document}</title>\n</head>\n<body>\n    ${2:}\n</body>\n</html>',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'HTML5 boilerplate'
              }
            ];
            return { suggestions };
          }
        });
      }
    } catch (error) {
      console.error('Failed to configure language features:', error);
    }
  };

  const getMonacoLanguage = (lang: string): string => {
    const languageMap: { [key: string]: string } = {
      'javascript': 'javascript',
      'typescript': 'typescript',
      'python': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'csharp': 'csharp',
      'php': 'php',
      'ruby': 'ruby',
      'go': 'go',
      'rust': 'rust',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'json': 'json',
      'xml': 'xml',
      'markdown': 'markdown',
      'sql': 'sql',
      'bash': 'shell',
      'yaml': 'yaml',
      'plaintext': 'plaintext'
    };
    return languageMap[lang] || 'plaintext';
  };

  if (error) {
    return (
      <div className="w-full h-full bg-[#1E1E1E] rounded-lg overflow-hidden border border-red-500 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <p className="text-red-400 font-medium mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-full bg-[#1E1E1E] rounded-lg overflow-hidden border border-gray-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-3 border-[#007ACC] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-[#CCCCCC] font-medium">Loading VS Code Editor...</p>
          <p className="text-[#858585] text-sm mt-2">Initializing Monaco Editor with enhanced features</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#1E1E1E] rounded-lg overflow-hidden border border-[#3E3E42] shadow-2xl">
      <div 
        ref={editorRef} 
        style={{ height }} 
        className="w-full"
      />
    </div>
  );
}