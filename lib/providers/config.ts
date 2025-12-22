// Defines the available LLM providers
export enum LLMProvider {
  DEEPSEEK = 'deepseek',
  OPENROUTER = 'openrouter',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
  MISTRAL = 'mistral',
  CEREBRAS = 'cerebras',
  OPENAI_COMPATIBLE = 'openai_compatible',
  OLLAMA = 'ollama',
  LM_STUDIO = 'lm_studio',
}

// Provider configuration interface
export interface ProviderConfig {
  id: LLMProvider;
  name: string;
  description: string;
  baseUrlEnvVar: string;
  apiKeyEnvVar: string | null; // Null if no API key is required
  defaultBaseUrl: string;
  logoUrl?: string;
  isLocal: boolean;
  examples?: string[]; // Examples of compatible services
}

// Configurations for supported providers
export const PROVIDER_CONFIGS: Record<LLMProvider, ProviderConfig> = {
  [LLMProvider.DEEPSEEK]: {
    id: LLMProvider.DEEPSEEK,
    name: 'DeepSeek',
    description: 'AI models from DeepSeek',
    baseUrlEnvVar: 'DEEPSEEK_API_BASE',
    apiKeyEnvVar: 'DEEPSEEK_API_KEY',
    defaultBaseUrl: 'https://api.deepseek.com/v1',
    isLocal: false,
  },
  [LLMProvider.OPENROUTER]: {
    id: LLMProvider.OPENROUTER,
    name: 'OpenRouter',
    description: 'Access 400+ AI models via OpenRouter',
    baseUrlEnvVar: 'OPENROUTER_API_BASE',
    apiKeyEnvVar: 'OPENROUTER_API_KEY',
    defaultBaseUrl: 'https://openrouter.ai/api/v1',
    isLocal: false,
  },
  [LLMProvider.ANTHROPIC]: {
    id: LLMProvider.ANTHROPIC,
    name: 'Anthropic',
    description: 'Claude models from Anthropic',
    baseUrlEnvVar: 'ANTHROPIC_API_BASE',
    apiKeyEnvVar: 'ANTHROPIC_API_KEY',
    defaultBaseUrl: 'https://api.anthropic.com/v1',
    isLocal: false,
  },
  [LLMProvider.GOOGLE]: {
    id: LLMProvider.GOOGLE,
    name: 'Google AI',
    description: 'Gemini models from Google',
    baseUrlEnvVar: 'GOOGLE_API_BASE',
    apiKeyEnvVar: 'GOOGLE_GENERATIVE_AI_API_KEY',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    isLocal: false,
  },
  [LLMProvider.MISTRAL]: {
    id: LLMProvider.MISTRAL,
    name: 'Mistral',
    description: 'AI models from Mistral AI',
    baseUrlEnvVar: 'MISTRAL_API_BASE',
    apiKeyEnvVar: 'MISTRAL_API_KEY',
    defaultBaseUrl: 'https://api.mistral.ai/v1',
    isLocal: false,
  },
  [LLMProvider.CEREBRAS]: {
    id: LLMProvider.CEREBRAS,
    name: 'Cerebras',
    description: 'Fast inference with Cerebras',
    baseUrlEnvVar: 'CEREBRAS_API_BASE',
    apiKeyEnvVar: 'CEREBRAS_API_KEY',
    defaultBaseUrl: 'https://api.cerebras.ai/v1',
    isLocal: false,
  },
  [LLMProvider.OPENAI_COMPATIBLE]: {
    id: LLMProvider.OPENAI_COMPATIBLE,
    name: 'Custom API',
    description: 'Configure your own OpenAI-compatible API',
    baseUrlEnvVar: 'OPENAI_COMPATIBLE_API_BASE',
    apiKeyEnvVar: 'OPENAI_COMPATIBLE_API_KEY',
    defaultBaseUrl: '',
    isLocal: false,
    examples: ['OpenAI', 'Together AI', 'Anyscale', 'Groq'],
  },
  [LLMProvider.OLLAMA]: {
    id: LLMProvider.OLLAMA,
    name: 'Ollama',
    description: 'Local AI models with Ollama',
    baseUrlEnvVar: 'OLLAMA_API_BASE',
    apiKeyEnvVar: null, // Ollama doesn't require an API key
    defaultBaseUrl: 'http://localhost:11434',
    isLocal: true,
  },
  [LLMProvider.LM_STUDIO]: {
    id: LLMProvider.LM_STUDIO,
    name: 'LM Studio',
    description: 'Local AI models with LM Studio',
    baseUrlEnvVar: 'LM_STUDIO_API_BASE',
    apiKeyEnvVar: null, // LM Studio doesn't require an API key
    defaultBaseUrl: 'http://localhost:1234/v1',
    isLocal: true,
  },
};

// Helper function to get a provider's configuration
export function getProviderConfig(provider: LLMProvider): ProviderConfig {
  return PROVIDER_CONFIGS[provider];
}

// Helper function to get a provider's base URL
export function getProviderBaseUrl(provider: LLMProvider): string {
  const config = getProviderConfig(provider);
  return process.env[config.baseUrlEnvVar] || config.defaultBaseUrl;
}

// Helper function to get a provider's API key
export function getProviderApiKey(provider: LLMProvider): string | null {
  const config = getProviderConfig(provider);
  if (!config.apiKeyEnvVar) return null;
  return process.env[config.apiKeyEnvVar] || null;
}

// Get list of explicitly disabled providers from ENV
function getDisabledProviders(): LLMProvider[] {
  const disabled = process.env.DISABLED_PROVIDERS?.trim();
  if (!disabled) return [];
  return disabled.split(',').map(p => p.trim()) as LLMProvider[];
}

// Check if a provider is configured and available
export function isProviderConfigured(provider: LLMProvider): boolean {
  const config = getProviderConfig(provider);

  // Check if explicitly disabled
  if (getDisabledProviders().includes(provider)) {
    return false;
  }

  if (config.isLocal) {
    // Local providers (Ollama, LM Studio): always available (use default URL)
    return true;
  } else if (provider === LLMProvider.OPENAI_COMPATIBLE) {
    // Custom API: requires BOTH base URL and API key (no defaults)
    const hasBaseUrl = !!process.env[config.baseUrlEnvVar]?.trim();
    const hasApiKey = !!process.env[config.apiKeyEnvVar!]?.trim();
    return hasBaseUrl && hasApiKey;
  } else {
    // Cloud providers with defaults (DeepSeek, OpenRouter): require API key only
    if (!config.apiKeyEnvVar) return false;
    return !!process.env[config.apiKeyEnvVar]?.trim();
  }
}

// List of all available providers (only those that are configured)
export function getAvailableProviders(): ProviderConfig[] {
  return Object.values(PROVIDER_CONFIGS).filter(config =>
    isProviderConfigured(config.id)
  );
}
