import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Laptop, Smartphone, Tablet, Copy, RefreshCw, Loader2, Save, ArrowRight } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { CodeEditor } from "@/components/code-editor"
import { WorkSteps } from "@/components/work-steps"

// -----------------------------------------------------------------------------
// Type Definitions
// -----------------------------------------------------------------------------

interface CodePanelProps {
    isGenerating: boolean
    generationComplete: boolean
    isEditable: boolean
    setIsEditable: (value: boolean) => void
    hasChanges: boolean
    saveChanges: () => void
    copyToClipboard: () => void
    copySuccess: boolean
    generatedCode: string
    editedCode: string
    originalCode: string
    setEditedCode: (value: string) => void
    previousPrompt: string
    newPrompt: string
    setNewPrompt: (value: string) => void
    handleSendNewPrompt: () => void
    setShowSaveDialog: (value: boolean) => void
}

interface PreviewPanelProps {
    generationComplete: boolean
    refreshPreview: () => void
    viewportSize: "desktop" | "tablet" | "mobile"
    setViewportSize: (size: "desktop" | "tablet" | "mobile") => void
    originalCode: string
    editedCode: string
    isGenerating: boolean
    previewKey: number
    previewContent: string
}

// -----------------------------------------------------------------------------
// Code Panel Component
// -----------------------------------------------------------------------------

export function CodePanel({
    isGenerating,
    generationComplete,
    isEditable,
    setIsEditable,
    hasChanges,
    saveChanges,
    copyToClipboard,
    copySuccess,
    generatedCode,
    editedCode,
    originalCode,
    setEditedCode,
    previousPrompt,
    newPrompt,
    setNewPrompt,
    handleSendNewPrompt,
    setShowSaveDialog
}: CodePanelProps) {

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendNewPrompt()
        }
    }

    return (
        <div className="h-full flex flex-col">
            {/* 
        CODE EDITOR SECTION 
        Takes up 65% of the vertical space
      */}
            <div className="h-[65%] border-b border-gray-800 flex flex-col">
                {/* Editor Toolbar */}
                <div className="flex items-center justify-between p-2 border-b border-gray-800 bg-gray-900/50">
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm font-medium">GENERATED HTML</h2>
                        {generationComplete && (
                            <div className="ml-3 flex items-center space-x-2">
                                <span className="text-xs text-gray-400">
                                    {isEditable ? 'Edit' : 'Read Only'}
                                </span>
                                <Switch
                                    checked={isEditable}
                                    onCheckedChange={(checked) => {
                                        if (!checked && hasChanges) {
                                            setShowSaveDialog(true);
                                        } else {
                                            setIsEditable(checked);
                                        }
                                    }}
                                    disabled={isGenerating}
                                    className="data-[state=checked]:bg-blue-600"
                                />
                            </div>
                        )}
                    </div>

                    {/* Action Buttons (Save, Copy) */}
                    <div className="flex items-center gap-2">
                        {isEditable && hasChanges && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-green-500 hover:text-green-400 hover:bg-green-900/20"
                                onClick={saveChanges}
                            >
                                <Save className="w-4 h-4 mr-1" />
                                Save
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-gray-400 hover:text-white"
                            onClick={copyToClipboard}
                            disabled={!generatedCode || isGenerating}
                        >
                            <Copy className="w-4 h-4 mr-1" />
                            {copySuccess ? "Copied!" : "Copy"}
                        </Button>
                    </div>
                </div>

                {/* Editor Content Area */}
                <div className="flex-1 overflow-hidden">
                    {isGenerating && !generatedCode ? (
                        <div className="h-full w-full flex items-center justify-center bg-gray-950">
                            <div className="text-center">
                                <Loader2 className="w-8 h-8 mb-4 mx-auto animate-spin text-white" />
                                <p className="text-gray-400">Generating code...</p>
                            </div>
                        </div>
                    ) : (
                        <CodeEditor
                            code={isEditable ? editedCode : originalCode}
                            isEditable={isEditable && generationComplete}
                            onChange={(newCode) => setEditedCode(newCode)}
                        />
                    )}
                </div>
            </div>

            {/* 
        BOTTOM SECTION 
        Takes up 35% of the vertical space. Contains Prompt Input & Work Steps.
      */}
            <div className="h-[35%] p-3 flex flex-col overflow-hidden">
                {/* New Prompt Input */}
                <div className="mb-2 flex-shrink-0">
                    <h3 className="text-xs font-medium text-gray-400 mb-1">NEW PROMPT</h3>
                    <div className="relative">
                        <Textarea
                            value={newPrompt}
                            onChange={(e) => setNewPrompt(e.target.value)}
                            placeholder="Enter a new prompt..."
                            className="min-h-[60px] w-full rounded-md border border-gray-800 bg-gray-900/50 p-2 pr-10 text-sm text-gray-300 focus:border-white focus:ring-white"
                            onKeyDown={handleKeyDown}
                            disabled={isGenerating}
                        />
                        <Button
                            size="sm"
                            className={`absolute bottom-2 right-2 h-6 w-6 p-0 ${newPrompt.trim() ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-800 hover:bg-gray-700'}`}
                            onClick={handleSendNewPrompt}
                            disabled={!newPrompt.trim() || isGenerating}
                        >
                            <ArrowRight className={`h-3 w-3 ${newPrompt.trim() ? 'text-white' : 'text-gray-400'}`} />
                            <span className="sr-only">Send</span>
                        </Button>
                    </div>

                    {/* Previous Prompt History */}
                    {previousPrompt && (
                        <div className="mt-2">
                            <h4 className="text-xs font-medium text-gray-400">PREVIOUS PROMPT:</h4>
                            <ScrollArea className="h-12 w-full rounded-md border border-gray-800 bg-gray-900/30 p-2 mt-1">
                                <p className="text-xs text-gray-400">{previousPrompt}</p>
                            </ScrollArea>
                        </div>
                    )}
                </div>

                {/* Work Steps Visualization */}
                <div className="flex-1 overflow-hidden">
                    <h3 className="text-xs font-medium text-gray-400 mb-1">AI WORK STEPS</h3>
                    <div className="h-[calc(100%-20px)] overflow-hidden">
                        <WorkSteps
                            isGenerating={isGenerating}
                            generationComplete={generationComplete}
                            generatedCode={isEditable ? editedCode : generatedCode}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

// -----------------------------------------------------------------------------
// Preview Panel Component
// -----------------------------------------------------------------------------

export function PreviewPanel({
    generationComplete,
    refreshPreview,
    viewportSize,
    setViewportSize,
    originalCode,
    editedCode,
    isGenerating,
    previewKey,
    previewContent
}: PreviewPanelProps) {

    // Calculate responsive width for the iframe container
    const iframeWidthClass =
        viewportSize === "desktop" ? "w-full h-full" :
            viewportSize === "tablet" ? "w-[768px] max-h-full" :
                "w-[375px] max-h-full";

    return (
        <div className="h-full flex flex-col">
            {/* Preview Toolbar */}
            <div className="p-2 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between">
                <h2 className="text-sm font-medium">LIVE PREVIEW</h2>
                <div className="flex items-center gap-1">
                    {generationComplete && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 mr-2 text-gray-400 hover:text-white"
                            onClick={refreshPreview}
                            title="Refresh preview"
                        >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            <span className="text-xs hidden sm:inline">Refresh</span>
                        </Button>
                    )}
                    {/* Viewport Toggles */}
                    <Button
                        variant={viewportSize === "desktop" ? "secondary" : "ghost"}
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => setViewportSize("desktop")}
                    >
                        <Laptop className="w-4 h-4" />
                    </Button>
                    <Button
                        variant={viewportSize === "tablet" ? "secondary" : "ghost"}
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => setViewportSize("tablet")}
                    >
                        <Tablet className="w-4 h-4" />
                    </Button>
                    <Button
                        variant={viewportSize === "mobile" ? "secondary" : "ghost"}
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => setViewportSize("mobile")}
                    >
                        <Smartphone className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Iframe Viewport Area */}
            <div className="flex-1 p-3 flex items-center justify-center overflow-hidden">
                <div className={`bg-gray-900 rounded-md border border-gray-800 overflow-hidden transition-all duration-300 ${iframeWidthClass}`}>
                    {!originalCode && !editedCode ? (
                        // Empty State
                        <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-400">
                            {isGenerating ? (
                                <div className="text-center">
                                    <Loader2 className="w-8 h-8 mb-2 mx-auto animate-spin" />
                                    <p>Generating preview...</p>
                                </div>
                            ) : (
                                <p>No preview available yet</p>
                            )}
                        </div>
                    ) : (
                        // Active Preview State
                        <div className="w-full h-full relative">
                            <iframe
                                key={previewKey}
                                srcDoc={previewContent}
                                className="w-full h-full absolute inset-0 z-10"
                                title="Preview"
                                sandbox="allow-scripts"
                                style={{
                                    backgroundColor: '#121212',
                                    opacity: 1,
                                    transition: 'opacity 0.15s ease-in-out'
                                }}
                            />

                            {/* Updating Indicator Overlay */}
                            {isGenerating && (
                                <div className="absolute bottom-4 right-4 z-20 bg-gray-800/80 text-white px-3 py-1 rounded-full text-xs flex items-center">
                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                    Updating preview...
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
