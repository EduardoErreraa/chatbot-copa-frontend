(() => {
  const form = document.getElementById("chat-form");
  const input = document.getElementById("message-input");
  const sendButton = document.getElementById("send-button");
  const messages = document.getElementById("chat-messages");
  const suggestions = document.querySelectorAll(".suggestion");
  const apiBase = (window.COPA_CONFIG?.API_BASE_URL || "http://127.0.0.1:5000").replace(/\/+$/, "");

  function addMessage(text, role) {
    const row = document.createElement("div");
    row.className = `message ${role === "user" ? "user-message" : "bot-message"}`;
    if (role !== "user") {
      const avatar = document.createElement("div");
      avatar.className = "avatar";
      avatar.setAttribute("aria-hidden", "true");
      avatar.textContent = "⚽";
      row.appendChild(avatar);
    }
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = text;
    row.appendChild(bubble);
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
    return row;
  }

  async function sendMessage(rawText) {
    const message = rawText.trim();
    if (!message || sendButton.disabled) return;
    addMessage(message, "user");
    input.value = "";
    input.style.height = "auto";
    sendButton.disabled = true;
    sendButton.querySelector("span").textContent = "Enviando";
    const waiting = addMessage("Pensando na resposta...", "bot");
    try {
      const response = await fetch(`${apiBase}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `Erro HTTP ${response.status}`);
      waiting.querySelector(".bubble").textContent = data.response || "Não recebi uma resposta. Tente novamente.";
    } catch (error) {
      waiting.querySelector(".bubble").textContent =
        `Não consegui conectar ao chatbot. ${error.message || "Verifique se o backend está funcionando."}`;
    } finally {
      sendButton.disabled = false;
      sendButton.querySelector("span").textContent = "Enviar";
      input.focus();
      messages.scrollTop = messages.scrollHeight;
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    sendMessage(input.value);
  });
  input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 130)}px`;
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
  suggestions.forEach((button) => button.addEventListener("click", () => sendMessage(button.textContent)));
})();
