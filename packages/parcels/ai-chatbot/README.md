# AI Chatbot Parcel

Interface de chat conversationnel avec LLM exécuté directement dans le navigateur.

## Technologies

- **WebLLM**: Exécution de modèles LLM avec WebGPU (prioritaire)
- **Transformers.js**: Fallback si WebGPU non disponible
- **React 19**: Interface utilisateur
- **i18next**: Internationalisation FR/EN

## Modèles supportés

- Phi-3 Mini (3.8B)
- TinyLlama (1.1B)
- Gemma 2B
- Llama 3 8B
- Mistral 7B

## Développement

```bash
# Install dependencies
pnpm install

# Dev server
pnpm dev

# Build
pnpm build

# Test
pnpm test

# Lint
pnpm lint
```

## Configuration requise

- **Navigateur**: Chrome/Edge 113+ ou Firefox avec WebGPU
- **Mémoire**: 4GB minimum, 8GB recommandé pour modèles moyens
- **WebGPU**: Recommandé pour meilleures performances
