(() => {
  "use strict";

  const root = document.documentElement;
  const chat = document.querySelector("[data-chat-root]");
  if (!chat) return;

  const config = window.PORTFOLIO_CHAT_CONFIG || {};
  const apiBaseUrl = String(config.apiBaseUrl || "").replace(/\/$/, "");
  const form = chat.querySelector("[data-chat-form]");
  const input = chat.querySelector("[data-chat-input]");
  const sendButton = chat.querySelector("[data-chat-send]");
  const log = chat.querySelector("[data-chat-log]");
  const status = chat.querySelector("[data-chat-status]");
  const launcher = document.querySelector("[data-chat-launcher]");
  const minimizeButton = chat.querySelector("[data-chat-minimize]");
  const history = [];
  let busy = false;

  const copy = {
    en: {
      you: "You",
      agent: "Jialiang's HomeAgent",
      thinking: "Thinking through the page context…",
      waiting: "Waiting for the agent…",
      notConfigured: "The live agent is not connected yet.",
      failed: "The live agent is temporarily unavailable. Please try again later."
    },
    zh: {
      you: "你",
      agent: "李嘉梁的 HomeAgent",
      thinking: "正在理解网页上下文…",
      waiting: "正在等待 Agent 回复…",
      notConfigured: "在线 Agent 尚未接入。",
      failed: "在线 Agent 暂时不可用，请稍后重试。"
    }
  };

  function language() {
    return root.dataset.language === "zh" ? "zh" : "en";
  }

  function strings() {
    return copy[language()];
  }

  function updateInterface() {
    input.removeAttribute("placeholder");
  }

  function setStatus(message) {
    status.textContent = message;
    status.hidden = !message;
  }

  function setBusy(nextBusy) {
    busy = nextBusy;
    sendButton.disabled = nextBusy;
    chat.setAttribute("aria-busy", String(nextBusy));
  }

  function addMessage(role, content, { animate = false, loading = false } = {}) {
    const message = document.createElement("article");
    const author = document.createElement("span");
    const body = document.createElement("p");

    message.className = `chat-message chat-message-${role}`;
    if (loading) message.classList.add("is-loading");
    author.className = "chat-author";
    author.textContent = role === "user" ? strings().you : strings().agent;
    body.textContent = content;
    message.append(author, body);
    log.appendChild(message);
    log.scrollTop = log.scrollHeight;

    if (animate && content) {
      window.PortfolioTextMotion?.typeText(body, content);
    }

    return { message, body };
  }

  function localizedValue(element) {
    if (!element) return "";
    return element.dataset[language()] || element.textContent.trim();
  }

  function sectionText(section) {
    const values = [...section.querySelectorAll("[data-en][data-zh]")]
      .map(localizedValue)
      .filter(Boolean);
    return [...new Set(values)].join(" · ").slice(0, 1800);
  }

  function pageContext() {
    const sectionNames = {
      intro: "Profile and Agent Engineering Roadmap",
      education: "Education",
      work: "Work experience",
      projects: "Projects",
      xiaomi: "Xiaomi post-training case study",
      lmpool: "LMPool inference system case study",
      skills: "Tech Stack",
      "use-cases": "Agent Business Map and use cases",
      contact: "Contact"
    };

    return [...document.querySelectorAll("main section")]
      .map((section) => {
        const name = sectionNames[section.id] || section.id || "Portfolio";
        return `## ${name}\n${sectionText(section)}`;
      })
      .join("\n\n")
      .slice(0, 16000);
  }

  async function requestAgentReply(question) {
    if (!apiBaseUrl) throw new Error("not-configured");

    const response = await fetch(`${apiBaseUrl}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: language(),
        context: pageContext(),
        messages: history.slice(-8)
      })
    });

    if (!response.ok) throw new Error(`Chat request failed: ${response.status}`);
    const data = await response.json();
    if (!data.reply) throw new Error("empty-response");
    return data.reply;
  }

  async function submitQuestion() {
    const question = input.value.trim();
    if (!question || busy) return;

    addMessage("user", question);
    history.push({ role: "user", content: question });
    input.value = "";

    setBusy(true);
    setStatus(strings().thinking);
    const pending = addMessage("agent", "", { loading: true });

    try {
      const reply = await requestAgentReply(question);
      pending.message.classList.remove("is-loading");
      pending.body.textContent = reply;
      history.push({ role: "assistant", content: reply });
      window.PortfolioTextMotion?.typeText(pending.body, reply);
      setStatus("");
    } catch {
      const reply = apiBaseUrl ? strings().failed : strings().notConfigured;
      pending.message.classList.remove("is-loading");
      pending.body.textContent = reply;
      history.push({ role: "assistant", content: reply });
      window.PortfolioTextMotion?.typeText(pending.body, reply);
      setStatus("");
    } finally {
      setBusy(false);
      log.scrollTop = log.scrollHeight;
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitQuestion();
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  function setCollapsed(collapsed) {
    chat.classList.toggle("is-collapsed", collapsed);
    launcher?.classList.toggle("is-visible", collapsed);
    launcher?.setAttribute("aria-expanded", String(!collapsed));
    minimizeButton?.setAttribute("aria-expanded", String(!collapsed));
    if (!collapsed) {
      requestAnimationFrame(() => input.focus());
    }
  }

  minimizeButton?.addEventListener("click", () => setCollapsed(true));
  launcher?.addEventListener("click", () => setCollapsed(false));

  window.addEventListener("portfolio:language-change", updateInterface);
  updateInterface();
  setCollapsed(true);
})();
