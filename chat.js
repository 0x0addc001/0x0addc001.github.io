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

  function appendInlineMarkdown(parent, text) {
    const pattern = /(`[^`\n]+`|\*\*[^*\n]+\*\*|__[^_\n]+__|\[[^\]\n]+\]\((?:https?:\/\/|mailto:)[^)\s]+\)|\*[^*\n]+\*|_[^_\n]+_)/g;
    let cursor = 0;

    for (const match of text.matchAll(pattern)) {
      if (match.index > cursor) {
        parent.append(document.createTextNode(text.slice(cursor, match.index)));
      }

      const token = match[0];
      let element;
      if (token.startsWith("`")) {
        element = document.createElement("code");
        element.textContent = token.slice(1, -1);
      } else {
        const link = token.match(/^\[([^\]]+)\]\(((?:https?:\/\/|mailto:)[^)]+)\)$/);
        if (link) {
          element = document.createElement("a");
          element.href = link[2];
          element.target = "_blank";
          element.rel = "noreferrer noopener";
          appendInlineMarkdown(element, link[1]);
        } else if (token.startsWith("**") || token.startsWith("__")) {
          element = document.createElement("strong");
          appendInlineMarkdown(element, token.slice(2, -2));
        } else {
          element = document.createElement("em");
          appendInlineMarkdown(element, token.slice(1, -1));
        }
      }
      parent.append(element);
      cursor = match.index + token.length;
    }

    if (cursor < text.length) {
      parent.append(document.createTextNode(text.slice(cursor)));
    }
  }

  function splitTableRow(line) {
    return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
  }

  function renderMarkdown(element, markdown) {
    const lines = String(markdown || "").replace(/\r\n?/g, "\n").split("\n");
    const fragment = document.createDocumentFragment();
    let index = 0;

    function appendParagraph(paragraphLines) {
      const paragraph = document.createElement("p");
      paragraphLines.forEach((line, lineIndex) => {
        if (lineIndex) paragraph.append(document.createElement("br"));
        appendInlineMarkdown(paragraph, line);
      });
      fragment.append(paragraph);
    }

    while (index < lines.length) {
      const line = lines[index];
      if (!line.trim()) {
        index += 1;
        continue;
      }

      const fence = line.match(/^```([\w.+-]*)\s*$/);
      if (fence) {
        const codeLines = [];
        index += 1;
        while (index < lines.length && !/^```\s*$/.test(lines[index])) {
          codeLines.push(lines[index]);
          index += 1;
        }
        if (index < lines.length) index += 1;
        const pre = document.createElement("pre");
        const code = document.createElement("code");
        if (fence[1]) code.dataset.language = fence[1];
        code.textContent = codeLines.join("\n");
        pre.append(code);
        fragment.append(pre);
        continue;
      }

      const heading = line.match(/^(#{1,4})\s+(.+)$/);
      if (heading) {
        const title = document.createElement(`h${heading[1].length + 2}`);
        appendInlineMarkdown(title, heading[2]);
        fragment.append(title);
        index += 1;
        continue;
      }

      if (/^\s*([-*_])(?:\s*\1){2,}\s*$/.test(line)) {
        fragment.append(document.createElement("hr"));
        index += 1;
        continue;
      }

      if (
        line.includes("|") &&
        index + 1 < lines.length &&
        /^\s*\|?[\s:|-]+\|[\s:|-]*\s*$/.test(lines[index + 1])
      ) {
        const tableWrap = document.createElement("div");
        const table = document.createElement("table");
        const thead = document.createElement("thead");
        const headRow = document.createElement("tr");
        splitTableRow(line).forEach((cell) => {
          const th = document.createElement("th");
          appendInlineMarkdown(th, cell);
          headRow.append(th);
        });
        thead.append(headRow);
        table.append(thead);
        index += 2;

        const tbody = document.createElement("tbody");
        while (index < lines.length && lines[index].includes("|") && lines[index].trim()) {
          const row = document.createElement("tr");
          splitTableRow(lines[index]).forEach((cell) => {
            const td = document.createElement("td");
            appendInlineMarkdown(td, cell);
            row.append(td);
          });
          tbody.append(row);
          index += 1;
        }
        table.append(tbody);
        tableWrap.className = "chat-table-wrap";
        tableWrap.append(table);
        fragment.append(tableWrap);
        continue;
      }

      const unordered = line.match(/^\s*[-*+]\s+(.+)$/);
      const ordered = line.match(/^\s*\d+\.\s+(.+)$/);
      if (unordered || ordered) {
        const list = document.createElement(unordered ? "ul" : "ol");
        const itemPattern = unordered ? /^\s*[-*+]\s+(.+)$/ : /^\s*\d+\.\s+(.+)$/;
        while (index < lines.length) {
          const item = lines[index].match(itemPattern);
          if (!item) break;
          const li = document.createElement("li");
          appendInlineMarkdown(li, item[1]);
          list.append(li);
          index += 1;
        }
        fragment.append(list);
        continue;
      }

      if (/^\s*>\s?/.test(line)) {
        const quote = document.createElement("blockquote");
        while (index < lines.length && /^\s*>\s?/.test(lines[index])) {
          if (index && quote.childNodes.length) quote.append(document.createElement("br"));
          appendInlineMarkdown(quote, lines[index].replace(/^\s*>\s?/, ""));
          index += 1;
        }
        fragment.append(quote);
        continue;
      }

      const paragraphLines = [line];
      index += 1;
      while (index < lines.length && lines[index].trim()) {
        const nextLine = lines[index];
        if (
          /^```/.test(nextLine) ||
          /^#{1,4}\s+/.test(nextLine) ||
          /^\s*[-*+]\s+/.test(nextLine) ||
          /^\s*\d+\.\s+/.test(nextLine) ||
          /^\s*>\s?/.test(nextLine) ||
          /^\s*([-*_])(?:\s*\1){2,}\s*$/.test(nextLine)
        ) {
          break;
        }
        paragraphLines.push(nextLine);
        index += 1;
      }
      appendParagraph(paragraphLines);
    }

    element.replaceChildren(fragment);
  }

  function addMessage(role, content, { animate = false, loading = false } = {}) {
    const message = document.createElement("article");
    const author = document.createElement("span");
    const body = document.createElement("div");

    message.className = `chat-message chat-message-${role}`;
    if (loading) message.classList.add("is-loading");
    author.className = "chat-author";
    author.textContent = role === "user" ? strings().you : strings().agent;
    body.className = "chat-message-body chat-markdown";
    if (content) {
      if (role === "agent") renderMarkdown(body, content);
      else body.textContent = content;
    }
    message.append(author, body);
    log.appendChild(message);
    log.scrollTop = log.scrollHeight;

    if (animate && content) {
      window.PortfolioTextMotion?.typeText(body, content, {
        onDone: () => renderMarkdown(body, content)
      });
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
      history.push({ role: "assistant", content: reply });
      if (window.PortfolioTextMotion?.typeText) {
        window.PortfolioTextMotion.typeText(pending.body, reply, {
          onDone: () => renderMarkdown(pending.body, reply)
        });
      } else {
        renderMarkdown(pending.body, reply);
      }
      setStatus("");
    } catch {
      const reply = apiBaseUrl ? strings().failed : strings().notConfigured;
      pending.message.classList.remove("is-loading");
      history.push({ role: "assistant", content: reply });
      if (window.PortfolioTextMotion?.typeText) {
        window.PortfolioTextMotion.typeText(pending.body, reply, {
          onDone: () => renderMarkdown(pending.body, reply)
        });
      } else {
        renderMarkdown(pending.body, reply);
      }
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
