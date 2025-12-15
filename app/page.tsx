"use client"

import { useState, useEffect } from "react"
import { LoadingScreen } from "@/components/loading-screen"
import { WelcomeView } from "@/components/welcome-view"
import { GenerationView } from "@/components/generation-view"
import { ThinkingIndicator } from "@/components/thinking-indicator"
import { toast, Toaster } from "sonner"

import { useCodeGeneration } from "@/hooks/use-code-generation"

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [showGenerationView, setShowGenerationView] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [selectedProvider, setSelectedProvider] = useState("")
  const [selectedModel, setSelectedModel] = useState("")
  const [selectedSystemPrompt, setSelectedSystemPrompt] = useState("default")
  const [customSystemPrompt, setCustomSystemPrompt] = useState("")
  const [maxTokens, setMaxTokens] = useState<number | undefined>(undefined)

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1250)

    return () => clearTimeout(timer)
  }, [])

  const {
    generatedCode,
    isGenerating,
    generationComplete,
    thinkingOutput,
    isThinking,
    generateCode,
    setGeneratedCode
  } = useCodeGeneration()

  const handleGenerate = async () => {
    setShowGenerationView(true)
    await generateCode({
      prompt,
      model: selectedModel,
      provider: selectedProvider,
      maxTokens,
      systemPromptType: selectedSystemPrompt,
      customSystemPrompt
    })
  }

  // New function for regenerating with a new prompt
  const handleRegenerateWithNewPrompt = async (newPrompt: string) => {
    // Update the prompt state
    setPrompt(newPrompt)

    await generateCode({
      prompt: newPrompt,
      model: selectedModel,
      provider: selectedProvider,
      maxTokens,
      systemPromptType: selectedSystemPrompt,
      customSystemPrompt
    })
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  if (showGenerationView) {
    return (
      <>
        <Toaster position="top-right" />

        <GenerationView
          prompt={prompt}
          setPrompt={setPrompt}
          model={selectedModel}
          provider={selectedProvider}
          generatedCode={generatedCode}
          isGenerating={isGenerating}
          generationComplete={generationComplete}
          onRegenerateWithNewPrompt={handleRegenerateWithNewPrompt}
          thinkingOutput={thinkingOutput}
          isThinking={isThinking}
        />
      </>
    )
  }

  return (
    <>
      <Toaster position="top-right" />
      <WelcomeView
        prompt={prompt}
        setPrompt={setPrompt}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        selectedProvider={selectedProvider}
        setSelectedProvider={setSelectedProvider}
        selectedSystemPrompt={selectedSystemPrompt}
        setSelectedSystemPrompt={setSelectedSystemPrompt}
        customSystemPrompt={customSystemPrompt}
        setCustomSystemPrompt={setCustomSystemPrompt}
        maxTokens={maxTokens}
        setMaxTokens={setMaxTokens}
        onGenerate={handleGenerate}
      />
    </>
  )
}
