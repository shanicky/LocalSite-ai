import { useState } from "react"
import { toast } from "sonner"

interface GenerateCodeParams {
    prompt: string
    model: string
    provider: string
    maxTokens?: number
    systemPromptType: string // 'default', 'thinking', 'custom'
    customSystemPrompt?: string
}

export function useCodeGeneration() {
    const [generatedCode, setGeneratedCode] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)
    const [generationComplete, setGenerationComplete] = useState(false)
    const [thinkingOutput, setThinkingOutput] = useState("")
    const [isThinking, setIsThinking] = useState(false)

    const generateCode = async ({
        prompt,
        model,
        provider,
        maxTokens,
        systemPromptType,
        customSystemPrompt
    }: GenerateCodeParams) => {
        if (!prompt.trim() || !model || !provider) {
            toast.error("Please enter a prompt and select a provider and model.")
            return
        }

        setIsGenerating(true)
        setGeneratedCode("")
        setThinkingOutput("")
        setIsThinking(false)
        setGenerationComplete(false)

        try {
            // Construct the system prompt logic here or in the API route.
            let finalCustomSystemPrompt = null;

            if (systemPromptType === 'custom') {
                finalCustomSystemPrompt = customSystemPrompt;
            }

            const response = await fetch('/api/generate-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt,
                    model,
                    provider,
                    maxTokens,
                    systemPromptType,
                    customSystemPrompt: finalCustomSystemPrompt,
                }),
            })

            if (!response.ok) {
                try {
                    const errorData = await response.json()
                    if (errorData && errorData.error) {
                        throw new Error(errorData.error)
                    }
                } catch (jsonError) {
                    // Ignore json parse error
                }
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const reader = response.body?.getReader()
            if (!reader) {
                throw new Error('Stream could not be read')
            }

            let receivedText = ""
            let thinkingText = ""
            let isInThinkingBlock = false

            while (true) {
                const { done, value } = await reader.read()

                if (done) {
                    break
                }

                const chunk = new TextDecoder().decode(value)
                receivedText += chunk

                let cleanedCode = receivedText

                const thinkingStartIndex = cleanedCode.indexOf("<think>")
                const thinkingEndIndex = cleanedCode.indexOf("</think>")

                if (thinkingStartIndex !== -1) {
                    if (!isInThinkingBlock) {
                        setIsThinking(true)
                    }
                    isInThinkingBlock = true

                    if (thinkingEndIndex !== -1) {
                        thinkingText = cleanedCode.substring(thinkingStartIndex + 7, thinkingEndIndex)
                        cleanedCode = cleanedCode.substring(0, thinkingStartIndex) +
                            cleanedCode.substring(thinkingEndIndex + 8)
                        isInThinkingBlock = false
                        setIsThinking(false)
                    } else {
                        thinkingText = cleanedCode.substring(thinkingStartIndex + 7)
                        cleanedCode = cleanedCode.substring(0, thinkingStartIndex)
                    }
                    setThinkingOutput(thinkingText)
                } else if (isInThinkingBlock && thinkingEndIndex !== -1) {
                    thinkingText = cleanedCode.substring(0, thinkingEndIndex)
                    cleanedCode = cleanedCode.substring(thinkingEndIndex + 8)
                    isInThinkingBlock = false
                    setIsThinking(false)
                    setThinkingOutput(thinkingText)
                }

                cleanedCode = cleanedCode.replace(/^```html\n/, '')
                cleanedCode = cleanedCode.replace(/```$/, '')

                setGeneratedCode(cleanedCode)
            }

            setGenerationComplete(true)
        } catch (error) {
            console.error('Error generating code:', error)
            if (error instanceof Error) {
                const errorMessage = error.message
                if (errorMessage.includes('Ollama')) {
                    toast.error('Cannot connect to Ollama. Is the server running?')
                } else if (errorMessage.includes('LM Studio')) {
                    toast.error('Cannot connect to LM Studio. Is the server running?')
                } else if (provider === 'deepseek' || provider === 'openai_compatible') {
                    toast.error('Make sure the Base URL and API Keys are correct in your .env.local file.')
                } else {
                    toast.error(errorMessage || 'Error generating code. Please try again later.')
                }
            } else {
                toast.error('Error generating code. Please try again later.')
            }
        } finally {
            setIsGenerating(false)
        }
    }

    return {
        generatedCode,
        isGenerating,
        generationComplete,
        thinkingOutput,
        isThinking,
        generateCode,
        setGeneratedCode
    }
}
