import { NextRequest } from 'next/server';
import { LLMProvider } from '@/lib/providers/config';
import { generateCodeStream } from '@/lib/providers/provider';
import { DEFAULT_SYSTEM_PROMPT, THINKING_SYSTEM_PROMPT } from '@/lib/providers/prompts';

export async function POST(request: NextRequest) {
  try {
    // Parse the JSON body
    const { prompt, model, provider: providerParam, customSystemPrompt, maxTokens, systemPromptType } = await request.json();

    // Check if prompt and model are provided
    if (!prompt || !model) {
      return new Response(
        JSON.stringify({ error: 'Prompt and model are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse maxTokens as a number if it's provided
    const parsedMaxTokens = maxTokens ? parseInt(maxTokens.toString(), 10) : undefined;

    // Determine the provider to use
    let provider: LLMProvider;

    if (providerParam && Object.values(LLMProvider).includes(providerParam as LLMProvider)) {
      provider = providerParam as LLMProvider;
    } else {
      // Use the default provider from environment variables or DeepSeek as fallback
      provider = (process.env.DEFAULT_PROVIDER as LLMProvider) || LLMProvider.DEEPSEEK;
    }

    // Determine the final system prompt based on type or custom input
    let finalSystemPrompt = customSystemPrompt;

    if (!finalSystemPrompt) {
      if (systemPromptType === 'thinking') {
        finalSystemPrompt = THINKING_SYSTEM_PROMPT;
      } else {
        // Fallback to default
        finalSystemPrompt = DEFAULT_SYSTEM_PROMPT;
      }
    }

    // Generate code using Vercel AI SDK streamText
    const result = await generateCodeStream(
      provider,
      model,
      prompt,
      finalSystemPrompt,
      parsedMaxTokens
    );

    // Create a custom stream that sends text and reasoning as separate JSON lines
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const part of result.fullStream) {
            if (part.type === 'text-delta') {
              // Send text content - in AI SDK v5, the property is 'text' not 'textDelta'
              controller.enqueue(
                encoder.encode(JSON.stringify({ type: 'text', content: part.text }) + '\n')
              );
            } else if (part.type === 'reasoning-delta') {
              // Send reasoning content (native reasoning models like deepseek-reasoner)
              // In AI SDK v5, reasoning-delta uses 'text' property
              controller.enqueue(
                encoder.encode(JSON.stringify({ type: 'reasoning', content: part.text }) + '\n')
              );
            }
          }
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-cache',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Error generating code:', error);

    // Return a more specific error message if available
    const errorMessage = error instanceof Error ? error.message : 'Error generating code';

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
