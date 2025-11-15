package main

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
	"net/http"
)

const (
	ollamaURL = "http://localhost:11434/api/chat" // Ollama must be running
	defaultModel = "qwen2.5-coder"                       // change to whatever model you use
)

type UIChatRequest struct {
	Prompt string `json:"prompt"`
	Model  string `json:"model"`
}

type OllamaMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type OllamaChatRequest struct {
	Model    string          `json:"model"`
	Messages []OllamaMessage `json:"messages"`
	Stream   bool            `json:"stream"`
}

type OllamaChatResponse struct {
	Message OllamaMessage `json:"message"`
	// there are more fields but we don't need them now
}

type UIChatResponse struct {
	Reply string `json:"reply"`
}

func main() {
	// Serve the static files (HTML, CSS, JS)
	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/", fs)

	// Chat API
	http.HandleFunc("/api/chat", chatHandler)

	log.Println("Server listening on http://localhost:8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}

func chatHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var uiReq UIChatRequest
	if err := json.NewDecoder(r.Body).Decode(&uiReq); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}

	model := uiReq.Model
	if model == "" {
		model = defaultModel
	}

	ollamaReq := OllamaChatRequest{
		Model: model,
		Messages: []OllamaMessage{
			{Role: "user", Content: uiReq.Prompt},
		},
		Stream: false,
	}

	bodyBytes, err := json.Marshal(ollamaReq)
	if err != nil {
		http.Error(w, "failed to encode request", http.StatusInternalServerError)
		return
	}

	resp, err := http.Post(ollamaURL, "application/json", bytes.NewReader(bodyBytes))
	if err != nil {
		log.Println("error talking to ollama:", err)
		http.Error(w, "failed to contact ollama", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Println("ollama status:", resp.Status)
		data, _ := io.ReadAll(resp.Body)
		log.Println("ollama response:", string(data))
		http.Error(w, "ollama error", http.StatusBadGateway)
		return
	}

	var ollamaResp OllamaChatResponse
	if err := json.NewDecoder(resp.Body).Decode(&ollamaResp); err != nil {
		http.Error(w, "failed to parse ollama response", http.StatusInternalServerError)
		return
	}

	uiResp := UIChatResponse{
		Reply: ollamaResp.Message.Content,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(uiResp); err != nil {
		log.Println("failed to write response:", err)
	}
}

