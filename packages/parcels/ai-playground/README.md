# AI Playground Parcel

A technical playground for experimenting with browser-based LLMs. Features adjustable parameters, performance metrics, and streaming output.

## Features

- 🎛️ **Parameter Controls**: Adjust temperature, top_p, max_tokens, etc.
- 📊 **Performance Metrics**: Tokens/sec, latency, memory usage
- 🔄 **Streaming Output**: Real-time text generation with syntax highlighting
- 🤖 **Multi-Model Support**: Switch between Phi-3, TinyLlama, Gemma, Llama, Mistral
- 🌐 **Browser Capabilities**: WebGPU and Transformers.js with automatic fallback
- 🌍 **Bilingual**: Full FR/EN translation support

## Development

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

# Typecheck
pnpm typecheck
```

## Architecture

Built with React, TypeScript, and Vite. Uses shared LLM utilities from `@grasdouble/slm_shared` for model loading and inference.

## License

MIT
