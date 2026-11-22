(() => {
  "use strict";

  const STAGE_ORDER = ["DATA", "MODEL", "TRAIN", "INFER", "HARNESS", "EVAL", "OPS"];

  const AREA_NOTE = {
    INPUT: "进入这一层的约束与预算：能花多少、必须满足什么。",
    COMPONENTS: "这一层的机制清单；每一项都有代价，选型就是选代价。",
    OUTPUT: "交给下一层的产物，也是这一层的验收物。",
    METRICS: "这一层怎么算好：看哪个数字，不看哪个数字。",
    TECH: "对应的开源实现与生态位置。"
  };

  const ROW_NOTE = {
    DATA: "这个 agent 的数据从哪里来、怎么治理。",
    MODEL: "用什么样的模型与检索/排序结构。",
    TRAIN: "需要什么样的训练信号与优化方式。",
    INFER: "线上怎么服务：延迟、批处理、采样策略。",
    HARNESS: "它能调用哪些工具、动作边界在哪里。",
    EVAL: "这一层用什么指标判断做得好不好。",
    OPS: "上线后怎么保稳定、控成本、做兜底。"
  };

  const STAGE_LOOP = {
    DATA: "把原始语料变成可复现、无泄漏的训练集；只动清洗规则、去重阈值与配比。",
    MODEL: "在质量、显存、延迟约束下选出结构；只跑小规模消融与缩放实验。",
    TRAIN: "把数据变成可控行为；只调数据混合、奖励与并行配置。",
    INFER: "把权重变成稳定、可负担的服务；只动路由、批处理、量化与调度。",
    HARNESS: "把模型输出变成可靠的任务完成；只改工具路由、上下文压缩与恢复策略。",
    EVAL: "决定我们凭什么相信它变好了；只补失败切片、对抗集与评分口径。",
    OPS: "决定上线之后它还活着、且花得起；只改告警阈值、灰度与回滚策略。"
  };

  let dialog = null;
  let chips = [];
  let activeIndex = 0;
  let stack = [];
  let currentNode = null;
  let trigger = null;

  function normalizeStageName(text) {
    const value = String(text || "").trim().toUpperCase();
    return STAGE_ORDER.find((name) => value.includes(name)) || value;
  }

  function termNote(name) {
    const entry = window.PORTFOLIO_TERMS?.get(name);
    if (!entry) return "";
    const language = document.documentElement.dataset.language === "zh" ? "zh" : "en";
    const text = entry[language] || entry.en || "";
    return text.length > 130 ? `${text.slice(0, 128)}…` : text;
  }

  const stageCards = () => [...document.querySelectorAll(".workflow-stage")];
  const usecaseCards = () => [...document.querySelectorAll(".usecase-card")];

  function stageNode(card) {
    const name = normalizeStageName(card.querySelector(".workflow-stage-head p")?.textContent);
    const groups = [...card.querySelectorAll(".workflow-anatomy > div")].map((group) => {
      const key = String(group.querySelector(".workflow-category-label")?.textContent || "").trim().toUpperCase();
      const items = [...group.querySelectorAll(".workflow-label-set span")].map((tag) => [
        tag.textContent.trim(),
        termNote(tag.textContent.trim())
      ]);
      return { key, items };
    });
    const byKey = new Map(groups.map((group) => [group.key, group]));
    return {
      key: name,
      name,
      note: STAGE_LOOP[name] || "",
      children: ["INPUT", "COMPONENTS", "OUTPUT", "METRICS", "TECH"]
        .filter((key) => byKey.has(key))
        .map((key) => ({ key, name: key, note: AREA_NOTE[key], items: byKey.get(key).items }))
    };
  }

  function stageAreas(key) {
    const card = stageCards().find(
      (node) => normalizeStageName(node.querySelector(".workflow-stage-head p")?.textContent) === key
    );
    return card ? stageNode(card).children : null;
  }

  function agentNode(card) {
    const title = card.querySelector("h3")?.textContent?.trim() || "Agent";
    const oneLine = card.querySelector("p")?.textContent?.trim() || "";
    const tags = [...card.querySelectorAll(".usecase-meta span")].map((tag) => tag.textContent.trim());
    const rows = [...card.querySelectorAll(".usecase-flow li")].map((row) => {
      const key = String(row.querySelector(".usecase-stage")?.textContent || "").trim().toUpperCase();
      const text = row.querySelector("p")?.textContent?.trim() || "";
      const areas = stageAreas(key);
      if (areas) {
        return {
          key,
          name: key,
          note: `${ROW_NOTE[key] || ""}　这个 agent 在这一层的做法：${text}`,
          children: areas
        };
      }
      return { key, name: key, note: ROW_NOTE[key] || "", items: [[text, ""]] };
    });
    return {
      key: title.replace(/\s*Agent$/, ""),
      name: title,
      note: [oneLine, tags.length ? `适用场景：${tags.join(" · ")}` : ""].filter(Boolean).join("　"),
      children: rows.filter((row) => row.key)
    };
  }

  function rsiNode() {
    return {
      key: "RSIAgent",
      name: "RSIAgent",
      note: "七个 stage 各跑一个小 loop；RSIAgent 只决定预算给谁、要不要接受新权重。性能只增来自晋升门。",
      children: stageCards().map(stageNode)
    };
  }

  function agiNode() {
    return {
      key: "AGIAgent",
      name: "AGIAgent",
      note: "垂直 agent 在各自领域采样试错；AGIAgent 在自己的轨迹上被多教师蒸馏（MOPD），把专长收成一个通用学生。",
      children: usecaseCards().map(agentNode)
    };
  }

  function ensureDialog() {
    if (dialog) return dialog;

    dialog = document.createElement("dialog");
    dialog.className = "explode";
    dialog.setAttribute("aria-labelledby", "explode-title");
    dialog.innerHTML = `
      <div class="explode-head">
        <div class="explode-heading">
          <div class="explode-crumb" id="explode-crumb"></div>
          <h2 id="explode-title">—</h2>
          <p class="explode-sub" id="explode-sub">—</p>
        </div>
        <div class="explode-head-actions">
          <button class="explode-back" id="explode-back" type="button" hidden>← Back</button>
          <button class="explode-close" type="button" aria-label="Close">✕</button>
        </div>
      </div>
      <div class="explode-body">
        <div class="explode-canvas" id="explode-canvas"></div>
        <aside class="explode-detail" id="explode-detail" aria-live="polite"></aside>
      </div>
      <div class="explode-foot">
        <span><kbd>←</kbd> <kbd>→</kbd> switch · <kbd>Enter</kbd> open · <kbd>Esc</kbd> close</span>
        <span id="explode-count">—</span>
      </div>`;

    document.body.append(dialog);

    dialog.querySelector(".explode-close").addEventListener("click", () => dialog.close());
    dialog.querySelector("#explode-back").addEventListener("click", () => goBack());
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("keydown", (event) => {
      if (!chips.length) return;
      if (event.key === "ArrowRight") {
        setActive((activeIndex + 1) % chips.length);
        event.preventDefault();
      }
      if (event.key === "ArrowLeft") {
        setActive((activeIndex - 1 + chips.length) % chips.length);
        event.preventDefault();
      }
      if (event.key === "Enter" || event.key === " ") {
        activate(activeIndex);
        event.preventDefault();
      }
    });
    dialog.addEventListener("close", () => {
      if (trigger && typeof trigger.focus === "function") trigger.focus();
      trigger = null;
      if (location.hash.startsWith("#explode=")) {
        history.replaceState(null, "", location.pathname + location.search);
      }
    });

    return dialog;
  }

  function setActive(index) {
    activeIndex = index;
    chips.forEach((chip, chipIndex) => {
      chip.setAttribute("aria-selected", String(chipIndex === index));
      chip.tabIndex = chipIndex === index ? 0 : -1;
    });
    showDetail(index);
  }

  function showDetail(index) {
    const node = currentNode.children[index];
    const detail = dialog.querySelector("#explode-detail");
    const hasChildren = Array.isArray(node.children) && node.children.length > 0;

    detail.innerHTML = `
      <h3>${node.name}</h3>
      ${node.note ? `<p class="explode-question">${node.note}</p>` : ""}
      ${
        hasChildren
          ? `<p class="explode-hint">包含 ${node.children.length} 个子模块 · 按 Enter 或点击展开</p>`
          : `<ul class="explode-items">
               ${(node.items || []).map(([name, note]) => `<li><b>${name}</b>${note ? `<span>${note}</span>` : ""}</li>`).join("")}
             </ul>`
      }`;
    dialog.querySelector("#explode-count").textContent = hasChildren
      ? `${node.name} · ${node.children.length} 个子模块`
      : `${node.name} · ${(node.items || []).length} 项`;
  }

  function activate(index) {
    const node = currentNode.children[index];
    if (node.children && node.children.length) {
      stack.push(currentNode);
      render(node);
    } else {
      setActive(index);
    }
  }

  function goBack() {
    if (!stack.length) return;
    render(stack.pop());
  }

  function render(node, focusIndex = 0) {
    ensureDialog();
    currentNode = node;
    activeIndex = focusIndex;

    const crumb = dialog.querySelector("#explode-crumb");
    crumb.textContent = stack.map((node) => node.name).join(" / ");
    dialog.querySelector("#explode-back").hidden = stack.length === 0;

    dialog.querySelector("#explode-title").textContent = node.name;
    dialog.querySelector("#explode-sub").textContent = node.note || "";

    const canvas = dialog.querySelector("#explode-canvas");
    canvas.replaceChildren();
    chips = [];

    const ring = document.createElement("div");
    ring.className = "explode-ring";
    ring.dataset.count = String(node.children.length);

    const center = document.createElement("div");
    center.className = "explode-center";
    center.innerHTML = `<b>${node.name}</b>`;
    ring.append(center);

    const total = node.children.length;
    node.children.forEach((child, index) => {
      const angle = (360 / total) * index - 90;
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "explode-chip";
      if (child.children && child.children.length) chip.classList.add("has-children");
      chip.style.setProperty("--a", `${angle}deg`);
      chip.innerHTML = `<b>${child.name}</b>`;
      chip.addEventListener("click", () => activate(index));
      ring.append(chip);
      chips.push(chip);
    });

    canvas.append(ring);

    if (!dialog.open) dialog.showModal();

    // 环的实际尺寸按画布算：半径、格子宽度、中心块一起收缩，
    // 既不会压到中心，也不会超出弹窗被裁掉。
    const fit = () => {
      const box = canvas.getBoundingClientRect();
      const side = Math.max(240, Math.min(box.width, box.height) - 20);
      const chipW = Math.round(Math.min(total >= 9 ? 92 : 118, Math.max(70, side * 0.22)));
      const radius = Math.max(88, Math.round(side / 2 - chipW / 2 - 10));
      const centerSize = Math.round(Math.min(124, Math.max(86, side * 0.24)));
      ring.style.setProperty("--ring-side", `${side}px`);
      ring.style.setProperty("--chip-w", `${chipW}px`);
      ring.style.setProperty("--ring-radius", `${radius}px`);
      ring.style.setProperty("--center-size", `${centerSize}px`);
    };
    fit();
    requestAnimationFrame(fit);

    setActive(Math.min(focusIndex, total - 1));
  }

  function open(node, source) {
    ensureDialog();
    stack = [];
    trigger = source || document.activeElement;
    render(node);
  }

  function wireTitleTrigger(title, getNode) {
    if (!title || title.dataset.explodeTrigger) return;
    title.dataset.explodeTrigger = "true";

    const row = document.createElement("div");
    row.className = "title-row";
    title.before(row);
    row.append(title);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "title-explode";
    button.textContent = "💥";
    button.setAttribute("aria-label", `Explode ${title.textContent.trim()}`);
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      open(getNode(), button);
    });
    row.append(button);
  }

  function wireStages() {
    stageCards().forEach((card) => {
      const label = card.querySelector(".workflow-stage-head p");
      if (!label || label.dataset.expandable) return;
      label.dataset.expandable = "true";
      label.setAttribute("role", "button");
      label.setAttribute("tabindex", "0");
      label.classList.add("is-expandable");
      const activateNode = () => open(stageNode(card), label);
      label.addEventListener("click", activateNode);
      label.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activateNode();
        }
      });
    });
  }

  function wireUsecases() {
    usecaseCards().forEach((card) => {
      const title = card.querySelector("h3");
      if (!title || title.dataset.expandable) return;
      title.dataset.expandable = "true";
      title.setAttribute("role", "button");
      title.setAttribute("tabindex", "0");
      title.classList.add("is-expandable");
      const activateNode = () => open(agentNode(card), title);
      title.addEventListener("click", activateNode);
      title.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activateNode();
        }
      });
    });
  }

  function wireSections() {
    const maps = [
      { selector: "#roadmap", node: rsiNode },
      { selector: "#use-cases", node: agiNode }
    ];
    maps.forEach(({ selector, node }) => {
      const section = document.querySelector(selector);
      const title = section?.querySelector(".system-card-head h2");
      if (title) wireTitleTrigger(title, node);
    });
  }

  function openFromHash() {
    const raw = decodeURIComponent(location.hash.replace("#explode=", "")).trim().toLowerCase();
    if (!raw) return;
    if (raw === "rsi" || raw === "rs") return open(rsiNode());
    if (raw === "agi") return open(agiNode());

    const stage = stageCards().find(
      (node) => normalizeStageName(node.querySelector(".workflow-stage-head p")?.textContent).toLowerCase() === raw
    );
    if (stage) return open(stageNode(stage));

    const usecase = usecaseCards().find((node) => {
      const title = node.querySelector("h3")?.textContent?.trim().toLowerCase() || "";
      return title.replace(/[^a-z]/g, "").includes(raw.replace(/[^a-z]/g, ""));
    });
    if (usecase) open(agentNode(usecase));
  }

  wireStages();
  wireUsecases();
  wireSections();
  openFromHash();
  window.addEventListener("hashchange", openFromHash);
})();
