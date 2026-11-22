(() => {
  "use strict";

  const ORDER = ["INPUT", "COMPONENTS", "OUTPUT", "METRICS", "TECH"];
  const LABEL = { INPUT: "输入", COMPONENTS: "组件", OUTPUT: "输出", METRICS: "指标", TECH: "技术栈" };
  const QUESTION = {
    INPUT: "进来什么？约束与预算是什么？",
    COMPONENTS: "靠什么机制实现？代价是什么？",
    OUTPUT: "留下什么可复用产物？下一层拿它做什么？",
    METRICS: "怎么算好？看哪个数字？",
    TECH: "用什么工具？为什么不用别的？"
  };

  const META = {
    rsi: {
      title: "RSIAgent",
      sub: "七个 stage agent 各跑一个小 loop；RSIAgent 只决定这一轮预算给谁、要不要接受新权重。性能只增来自晋升门。",
      center: "RSIAgent",
      centerNote: "big loop",
      mode: "ring"
    },
    agi: {
      title: "AGIAgent",
      sub: "垂直 agent 在各自领域采样试错；AGIAgent 在自己的轨迹上被多教师蒸馏（MOPD），把专长收成一个通用学生。",
      center: "AGIAgent",
      centerNote: "shared student",
      mode: "ring"
    }
  };

  const STAGE_ORDER = ["DATA", "MODEL", "TRAIN", "INFER", "HARNESS", "EVAL", "OPS"];

  let dialog = null;
  let activeIndex = 0;
  let chips = [];
  let trigger = null;

  function normalizeStageName(text) {
    const value = String(text || "").trim().toUpperCase();
    return STAGE_ORDER.find((name) => value.includes(name)) || value;
  }

  function stageCards() {
    return [...document.querySelectorAll(".workflow-stage")];
  }

  function usecaseCards() {
    return [...document.querySelectorAll(".usecase-card")];
  }

  function readStage(card) {
    const name = normalizeStageName(card.querySelector(".workflow-stage-head p")?.textContent);
    const question = card.querySelector(".workflow-mrq")?.textContent?.trim() || "";
    const groups = [...card.querySelectorAll(".workflow-anatomy > div")].map((group) => {
      const key = String(group.querySelector(".workflow-category-label")?.textContent || "").trim().toUpperCase();
      const items = [...group.querySelectorAll(".workflow-label-set span")].map((tag) => [tag.textContent.trim(), ""]);
      return { key, items };
    });
    const byKey = new Map(groups.map((group) => [group.key, group]));
    return {
      kicker: "",
      title: name,
      sub: question,
      mode: "flow",
      slices: ORDER.filter((key) => byKey.has(key)).map((key) => byKey.get(key))
    };
  }

  function readUsecase(card) {
    const title = card.querySelector("h3")?.textContent?.trim() || "Agent";
    const sub = card.querySelector("p")?.textContent?.trim() || "";
    const rows = [...card.querySelectorAll(".usecase-flow li")].map((row) => {
      const key = String(row.querySelector(".usecase-stage")?.textContent || "").trim().toUpperCase();
      const text = row.querySelector("p")?.textContent?.trim() || "";
      return { key, items: [[text, ""]] };
    });
    return {
      kicker: "",
      title,
      sub,
      mode: "flow",
      slices: rows.filter((row) => row.key)
    };
  }

  function ensureDialog() {
    if (dialog) return dialog;

    dialog = document.createElement("dialog");
    dialog.className = "explode";
    dialog.setAttribute("aria-labelledby", "explode-title");
    dialog.innerHTML = `
      <div class="explode-head">
        <div>
          <p class="explode-kicker" id="explode-kicker"></p>
          <h2 id="explode-title">—</h2>
          <p class="explode-sub" id="explode-sub">—</p>
        </div>
        <button class="explode-close" type="button" aria-label="Close">✕</button>
      </div>
      <div class="explode-body">
        <div class="explode-canvas" id="explode-canvas"></div>
        <aside class="explode-detail" id="explode-detail" aria-live="polite"></aside>
      </div>
      <div class="explode-foot">
        <span><kbd>←</kbd> <kbd>→</kbd> switch · <kbd>Esc</kbd> close</span>
        <span id="explode-count">—</span>
      </div>`;

    document.body.append(dialog);

    dialog.querySelector(".explode-close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("keydown", (event) => {
      if (!chips.length) return;
      if (event.key === "ArrowRight") {
        select((activeIndex + 1) % chips.length);
        event.preventDefault();
      }
      if (event.key === "ArrowLeft") {
        select((activeIndex - 1 + chips.length) % chips.length);
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

  function select(index) {
    activeIndex = index;
    chips.forEach((chip, chipIndex) => {
      chip.setAttribute("aria-selected", String(chipIndex === index));
      chip.tabIndex = chipIndex === index ? 0 : -1;
    });

    const slice = chips[index]?.dataset.slice ? null : null;
    const data = dialog.__data;
    const item = data.slices[index];
    const detail = dialog.querySelector("#explode-detail");
    const isFlow = data.mode === "flow";

    detail.innerHTML = `
      <h3>${item.key} ${isFlow && LABEL[item.key] ? `<span>/ ${LABEL[item.key]}</span>` : ""}</h3>
      ${isFlow && QUESTION[item.key] ? `<p class="explode-question">${QUESTION[item.key]}</p>` : ""}
      <ul class="explode-items">
        ${item.items
          .map(
            ([name, note]) => `<li><b>${name}</b>${note ? `<span>${note}</span>` : ""}</li>`
          )
          .join("")}
      </ul>`;

    dialog.querySelector("#explode-count").textContent = `${item.key} · ${item.items.length} 项`;
  }

  function chipNode(index, label, sub, angle) {
    const node = document.createElement("button");
    node.type = "button";
    node.className = "explode-chip";
    node.style.setProperty("--a", `${angle}deg`);
    if (angle !== undefined) node.style.setProperty("--r", "var(--ring-radius)");
    node.innerHTML = `<b>${label}</b>${sub ? `<span>${sub}</span>` : ""}`;
    node.addEventListener("click", () => select(index));
    return node;
  }

  function open(data, source) {
    ensureDialog();
    dialog.__data = data;
    trigger = source || document.activeElement;

    const kicker = dialog.querySelector("#explode-kicker");
    kicker.textContent = data.kicker || "";
    kicker.hidden = !data.kicker;
    dialog.querySelector("#explode-title").textContent = data.title;
    dialog.querySelector("#explode-sub").textContent = data.sub;

    const canvas = dialog.querySelector("#explode-canvas");
    canvas.replaceChildren();
    canvas.className = `explode-canvas is-${data.mode}`;
    chips = [];

    if (data.mode === "ring") {
      const ring = document.createElement("div");
      ring.className = "explode-ring";
      const center = document.createElement("div");
      center.className = "explode-center";
      center.innerHTML = `<b>${data.center}</b><span>${data.centerNote}</span>`;
      ring.append(center);

      const total = data.slices.length;
      data.slices.forEach((slice, index) => {
        const angle = (360 / total) * index - 90;
        const node = chipNode(index, slice.key, slice.meta || "", angle);
        ring.append(node);
        chips.push(node);
      });
      canvas.append(ring);
    } else {
      const flow = document.createElement("div");
      flow.className = "explode-flow";
      data.slices.forEach((slice, index) => {
        const node = chipNode(index, slice.key, slice.hint ?? String(slice.items.length));
        flow.append(node);
        chips.push(node);
        if (index < data.slices.length - 1) {
          const arrow = document.createElement("span");
          arrow.className = "explode-arrow";
          arrow.setAttribute("aria-hidden", "true");
          arrow.textContent = "→";
          flow.append(arrow);
        }
      });
      canvas.append(flow);
    }

    dialog.showModal();
    select(Math.min(0, data.slices.length - 1));
  }

  const SUMMARIES = {
    DATA: "数据修复：配比、清洗、去重",
    MODEL: "结构实验：消融与缩放",
    TRAIN: "后训练：SFT / RLVR / DAPO",
    INFER: "推理：路由、批处理、量化",
    HARNESS: "执行：工具、沙箱、恢复",
    EVAL: "评测：失败切片、对抗集",
    OPS: "运维：告警、回滚、成本"
  };

  function rsiData() {
    const slices = stageCards().map((card) => {
      const name = normalizeStageName(card.querySelector(".workflow-stage-head p")?.textContent);
      const question = card.querySelector(".workflow-mrq")?.textContent?.trim() || "";
      const groups = [...card.querySelectorAll(".workflow-anatomy > div")];
      const componentsGroup = groups.find(
        (group) => String(group.querySelector(".workflow-category-label")?.textContent || "").trim().toUpperCase() === "COMPONENTS"
      );
      const components = [...(componentsGroup?.querySelectorAll(".workflow-label-set span") || [])]
        .map((tag) => tag.textContent.trim())
        .join(" · ");
      return {
        key: name,
        meta: SUMMARIES[name] || "",
        items: [[question || SUMMARIES[name] || name, ""], [components, "局部循环的组件"]]
      };
    });
    return { ...META.rsi, slices };
  }

  function agiData() {
    const slices = usecaseCards().map((card) => {
      const title = card.querySelector("h3")?.textContent?.trim() || "Agent";
      const oneLine = card.querySelector("p")?.textContent?.trim() || "";
      const tags = [...card.querySelectorAll(".usecase-meta span")]
        .map((tag) => tag.textContent.trim())
        .join(" · ");
      return { key: title, meta: "", items: [[oneLine, ""], [tags, "适用场景"]] };
    });
    return { ...META.agi, slices };
  }

  function wireStages() {
    stageCards().forEach((card) => {
      const label = card.querySelector(".workflow-stage-head p");
      if (!label || label.dataset.expandable) return;
      label.dataset.expandable = "true";
      label.setAttribute("role", "button");
      label.setAttribute("tabindex", "0");
      label.setAttribute("aria-label", `Explode ${label.textContent.trim()}`);
      label.classList.add("is-expandable");

      const activate = () => open(readStage(card), label);
      label.addEventListener("click", activate);
      label.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activate();
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
      title.setAttribute("aria-label", `Explode ${title.textContent.trim()}`);
      title.classList.add("is-expandable");

      const activate = () => open(readUsecase(card), title);
      title.addEventListener("click", activate);
      title.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activate();
        }
      });
    });
  }

  function wireSections() {
    const map = [
      { selector: "#roadmap", key: "rsi", label: "Explode RSIAgent", data: rsiData },
      { selector: "#use-cases", key: "agi", label: "Explode AGIAgent", data: agiData }
    ];

    map.forEach(({ selector, label, data }) => {
      const section = document.querySelector(selector);
      const links = section?.querySelector(".section-links");
      if (!links || links.querySelector(".section-explode")) return;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "workflow-project-link section-explode";
      button.setAttribute("aria-label", label);
      button.textContent = "💥";
      button.addEventListener("click", () => open(data(), button));
      links.prepend(button);
    });
  }

  function openFromHash() {
    const raw = decodeURIComponent(location.hash.replace("#explode=", "")).trim().toLowerCase();
    if (!raw) return;
    if (raw === "rsi" || raw === "rs") return open(rsiData());
    if (raw === "agi") return open(agiData());

    const stage = stageCards().find(
      (node) => normalizeStageName(node.querySelector(".workflow-stage-head p")?.textContent).toLowerCase() === raw
    );
    if (stage) return open(readStage(stage));

    const usecase = usecaseCards().find((node) => {
      const title = node.querySelector("h3")?.textContent?.trim().toLowerCase() || "";
      return title.replace(/[^a-z]/g, "").includes(raw.replace(/[^a-z]/g, ""));
    });
    if (usecase) open(readUsecase(usecase));
  }

  wireStages();
  wireUsecases();
  wireSections();
  openFromHash();
  window.addEventListener("hashchange", openFromHash);
})();
