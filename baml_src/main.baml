// BAML Configuration for local LLM integration via Ollama

generator ts_client {
  output_type "typescript"
  output_dir "../baml_client"
  version "0.217.0"
}

client<llm> Ollama {
  provider "openai-generic"
  options {
    base_url env.LLM_ENDPOINT
    model env.LLM_MODEL
    max_tokens 4096
  }
}
