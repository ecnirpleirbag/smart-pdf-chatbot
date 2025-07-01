import requests
from typing import Optional

class OllamaHandler:
    def __init__(self, model_name: str = "phi3", base_url: str = "http://localhost:11434"):
        self.model_name = model_name
        self.base_url = base_url
        self.api_endpoint = f"{base_url}/api/generate"
        self.timeout = 300  # 300 seconds timeout

    def generate_response(self, query: str, context: str) -> str:
        """Generate a response using Ollama based on the query and context."""
        prompt = f"""Based on the following context from a PDF document, please answer the question. 
        Be concise, clear, and only use information from the provided context.

        Context:
        {context}

        Question: {query}

        Answer:"""

        try:
            # Check if Ollama is available first
            health_check, error_msg = self.check_health()
            if not health_check:
                return f"Ollama service error: {error_msg}"

            response = requests.post(
                self.api_endpoint,
                json={
                    "model": self.model_name,
                    "prompt": prompt,
                    "stream": False
                },
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()["response"].strip()
        except requests.Timeout:
            return "Error: Request to Ollama timed out. Please try again."
        except requests.ConnectionError:
            return "Error: Could not connect to Ollama. Please ensure the service is running."
        except Exception as e:
            return f"Error generating response: {str(e)}"

    def check_health(self) -> tuple[bool, Optional[str]]:
        """Check if Ollama is running and the model is available."""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            if response.status_code == 200:
                models = [model["name"] for model in response.json()["models"]]
                if self.model_name in models:
                    return True, None
                return False, f"Model {self.model_name} not found. Available models: {', '.join(models)}"
            return False, f"Ollama returned status code {response.status_code}"
        except requests.Timeout:
            return False, "Ollama health check timed out"
        except requests.ConnectionError:
            return False, "Could not connect to Ollama. Is it running?"
        except Exception as e:
            return False, f"Error checking Ollama health: {str(e)}" 