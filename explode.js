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
    DATA: {
      goal: "把原始语料变成可复现、无泄漏的训练集。",
      change: "只动清洗规则、去重阈值与数据配比，不碰模型。",
      metric: "覆盖率、泄漏率、去重率、标注一致性。"
    },
    MODEL: {
      goal: "在质量、显存、延迟约束下选出结构。",
      change: "只跑小规模消融与缩放实验，不改训练配方。",
      metric: "缩放斜率、显存占用、每 token 成本。"
    },
    TRAIN: {
      goal: "把数据变成可控行为，并让集群不空转。",
      change: "只调数据混合、奖励与并行配置。",
      metric: "业务集与 OOD 表现、吞吐、恢复时间。"
    },
    INFER: {
      goal: "把权重变成稳定、可负担的服务。",
      change: "只动路由、批处理、量化与调度。",
      metric: "TTFT、TPOT、吞吐、KV 命中率。"
    },
    HARNESS: {
      goal: "把模型输出变成可靠的任务完成。",
      change: "只改工具路由、上下文压缩与恢复策略。",
      metric: "任务成功率、工具准确率、单任务成本。"
    },
    EVAL: {
      goal: "决定我们凭什么相信它变好了。",
      change: "只补失败切片、对抗集与评分口径。",
      metric: "通过率、回归检出率、与人工判断的一致性。"
    },
    OPS: {
      goal: "决定上线之后它还活着、且花得起。",
      change: "只改告警阈值、灰度与回滚策略。",
      metric: "可用性、P95 延迟、MTTR、单任务成本。"
    }
  };

  const META = {
    rsi: { title: "RSIAgent", center: "RSIAgent", centerNote: "big loop" },
    agi: { title: "AGIAgent", center: "AGIAgent", centerNote: "shared student" }
  };

  let dialog = null;
  let activeIndex = 0;
  let chips = [];
  let trigger = null;

  function normalizeStageName(text) {
    const value = String(text || "").trim().toUpperCase();
    return STAGE_ORDER.find((name) => value.includes(name)) || value;
  }

  const stageCards = () => [...document.querySelectorAll(".workflow-stage")];
  const usecaseCards = () => [...document.querySelectorAll(".usecase-card")];

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
      title: name,
      center: name,
      centerNote: "local loop",
      sub: question,
      slices: ["INPUT", "COMPONENTS", "OUTPUT", "METRICS", "TECH"]
        .filter((key) => byKey.has(key))
        .map((key) => ({ key, name: byKey.get(key).key, note: AREA_NOTE[key], items: byKey.get(key).items }))
    };
  }

  function readUsecase(card) {
    const title = card.querySelector("h3")?.textContent?.trim() || "Agent";
    const sub = card.querySelector("p")?.textContent?.trim() || "";
    const rows = [...card.querySelectorAll(".usecase-flow li")].map((row) => {
      const key = String(row.querySelector(".usecase-stage")?.textContent || "").trim().toUpperCase();
      const text = row.querySelector("p")?.textContent?.trim() || "";
      return { key, text };
    });
    return {
      title,
      center: title.replace(/\s*Agent$/, ""),
      centerNote: "agent loop",
      sub,
      slices: rows
        .filter((row) => row.key)
        .map((row) => ({ key: row.key, note: ROW_NOTE[row.key] || "", items: [[row.text, ""]] }))
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

    const slice = dialog.__data.slices[index];
    const detail = dialog.querySelector("#explode-detail");
    detail.innerHTML = `
      <h3>${slice.key}</h3>
      ${slice.note ? `<p class="explode-question">${slice.note}</p>` : ""}
      <ul class="explode-items">
        ${slice.items.map(([name, note]) => `<li><b>${name}</b>${note ? `<span>${note}</span>` : ""}</li>`).join("")}
      </ul>`;
    dialog.querySelector("#explode-count").textContent = `${slice.key} · ${slice.items.length} 项`;
  }

  function open(data, source) {
    ensureDialog();
    dialog.__data = data;
    trigger = source || document.activeElement;

    dialog.querySelector("#explode-title").textContent = data.title;
    dialog.querySelector("#explode-sub").textContent = data.sub || "";

    const canvas = dialog.querySelector("#explode-canvas");
    canvas.replaceChildren();
    chips = [];

    const ring = document.createElement("div");
    ring.className = "explode-ring";
    ring.dataset.count = String(data.slices.length);

    const center = document.createElement("div");
    center.className = "explode-center";
    center.innerHTML = `<b>${data.center}</b><span>${data.centerNote}</span>`;
    ring.append(center);

    const total = data.slices.length;
    data.slices.forEach((slice, index) => {
      const angle = (360 / total) * index - 90;
      const node = document.createElement("button");
      node.type = "button";
      node.className = "explode-chip";
      node.style.setProperty("--a", `${angle}deg`);
      node.innerHTML = `<b>${slice.name || slice.key}</b>`;
      node.addEventListener("click", () => select(index));
      ring.append(node);
      chips.push(node);
    });

    canvas.append(ring);
    dialog.showModal();
    select(0);
  }

  function rsiData() {
    const slices = stageCards().map((card) => {
      const name = normalizeStageName(card.querySelector(".workflow-stage-head p")?.textContent);
      const loop = STAGE_LOOP[name] || { goal: "", change: "", metric: "" };
      return {
        key: name,
        name,
        note: loop.goal,
        items: [
          ["这一轮允许改什么", loop.change],
          ["本地判据", loop.metric]
        ]
      };
    });
    return { ...META.rsi, sub: "七个 stage agent 各跑一个小 loop；RSIAgent 只决定预算给谁、要不要接受新权重。性能只增来自晋升门。", slices };
  }

  function agiData() {
    const slices = usecaseCards().map((card) => {
      const title = card.querySelector("h3")?.textContent?.trim() || "Agent";
      const oneLine = card.querySelector("p")?.textContent?.trim() || "";
      const tags = [...card.querySelectorAll(".usecase-meta span")].map((tag) => tag.textContent.trim());
      return {
        key: title.replace(/\s*Agent$/, ""),
        name: title.replace(/\s*Agent$/, ""),
        note: oneLine,
        items: [["适用场景", tags.join(" · ")]]
      };
    });
    return { ...META.agi, sub: "垂直 agent 在各自领域采样试错；AGIAgent 在自己的轨迹上被多教师蒸馏（MOPD），把专长收成一个通用学生。", slices };
  }

  function wireTitleTrigger(title, getData) {
    if (!title || title.dataset.explodeTrigger) return;
    title.dataset.explodeTrigger = "true";

    // 把标题包一层，💥 放在标题后面（标题本身有 data-en/zh，切语言会被整体替换）
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
      open(getData(), button);
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
    const maps = [
      { selector: "#roadmap", data: rsiData },
      { selector: "#use-cases", data: agiData }
    ];
    maps.forEach(({ selector, data }) => {
      const section = document.querySelector(selector);
      const title = section?.querySelector(".system-card-head h2");
      if (title) wireTitleTrigger(title, data);
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
