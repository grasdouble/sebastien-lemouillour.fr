---
'@grasdouble/slm_shared': major
---

feat: implement real WebLLM and Transformers.js providers.

Replaced placeholder provider implementations with real LLM integrations:

**Dependencies added:**
- `@mlc-ai/web-llm@^0.2.84` - WebLLM for WebGPU-accelerated inference
- `@xenova/transformers@^2.17.2` - Transformers.js for WebAssembly inference

**WebLLM Provider:**
- Real model loading with progress callbacks
- Uses `CreateMLCEngine` API for model initialization  
- Supports chat completions with temperature, top_p, max_tokens
- Streaming generation via async iterators
- Leverages WebGPU for hardware acceleration

**Transformers.js Provider:**
- Real model loading with progress callbacks via `AutoTokenizer` and `pipeline`
- Text generation with configurable parameters
- Token counting and performance metrics
- Simulated streaming (full text yield)
- WebAssembly-based inference

**Breaking changes:**
- Providers now require browser environment (WebGPU or WebAssembly)
- Model loading is asynchronous and may take several seconds/minutes
- Models are downloaded from CDN on first load (cached in IndexedDB)
- Both providers use dynamic imports to avoid bundling in parcels that don't need them

**Usage:**
The `loadModel()` function in parcels will now:
1. Download model files (progress tracked via `onProgress`)
2. Initialize the inference engine  
3. Return a ready-to-use provider

Users can now interact with real LLMs directly in the browser without any backend API calls.
