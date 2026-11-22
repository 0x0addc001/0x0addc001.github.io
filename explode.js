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
      kicker: "BIG LOOP · RSIAgent",
      title: "RSIAgent",
      sub: "七个 stage agent 各跑一个小 loop；RSIAgent 只决定这一轮预算给谁、要不要接受新权重。性能只增来自晋升门，不来自自我判断。",
      slices: [
        {
          key: "INPUT",
          items: [
            ["Seven local results", "七个 stage 的本地指标与失败切片"],
            ["Global evaluation", "固定 eval set + 留出集，跨轮次可比"],
            ["Cost budget", "这一轮还剩多少预算"],
            ["Task memory", "上一轮为什么失败"]
          ]
        },
        {
          key: "COMPONENTS",
          items: [
            ["Attention allocation", "只看瓶颈，决定下一轮只做一件事"],
            ["Promotion gate", "过门才允许替换线上权重"],
            ["Rollback", "不过门就回到上一版 checkpoint"],
            ["Process retry", "失败改流程，不动权重"],
            ["Budget guard", "触顶即中止，不产出半成品"]
          ]
        },
        {
          key: "OUTPUT",
          items: [
            ["Promoted checkpoint", "过门后的新权重"],
            ["Rollback record", "失败轮次的完整记录"],
            ["Next-round task", "下一轮唯一的焦点"],
            ["Failure slices", "回流成新的评测用例"]
          ]
        },
        {
          key: "METRICS",
          items: [
            ["Gate pass rate", "多少候选能过门"],
            ["Regression count", "每次晋升带来的回归数"],
            ["Cost per round", "单轮算力与 token 成本"],
            ["Acceptance rate", "人工复核的接受率"]
          ]
        },
        {
          key: "TECH",
          items: [
            ["LangGraph", "大 loop 的状态机"],
            ["Eval harness", "固定评测集与回归"],
            ["Checkpoint registry", "版本与血缘"],
            ["CI gate", "晋升前的硬门禁"],
            ["Object storage", "权重与轨迹"]
          ]
        }
      ]
    },
    agi: {
      kicker: "BIG LOOP · AGIAgent",
      title: "AGIAgent",
      sub: "垂直 agent 在各自领域采样试错；AGIAgent 作为学生在自己的轨迹上被多教师蒸馏（MOPD），把专长收成一个通用学生。",
      slices: [
        {
          key: "INPUT",
          items: [
            ["Teacher trajectories", "各领域采样、失败与修复记录"],
            ["Student rollouts", "学生自己的在环轨迹"],
            ["Teacher weights", "按学生当期表现动态调整"],
            ["Held-out domains", "没有任何教师调过"]
          ]
        },
        {
          key: "COMPONENTS",
          items: [
            ["MOPD distillation", "多教师对学生的 token 做监督"],
            ["Shared backbone", "承载通用能力，避免多个模型各自维护"],
            ["Domain adapters", "保留专长，不复制整个模型"],
            ["Capability routing", "推理时把请求送到匹配的适配器"],
            ["Replay buffer", "防遗忘，守住旧领域"]
          ]
        },
        {
          key: "OUTPUT",
          items: [
            ["Student weights", "通用学生"],
            ["Adapter set", "按领域组织"],
            ["Routing table", "能力到适配器的映射"],
            ["Transfer report", "迁移与回归结果"]
          ]
        },
        {
          key: "METRICS",
          items: [
            ["Held-out score", "留出领域上的 zero/few-shot 表现"],
            ["Per-domain regression", "已知领域不允许下降"],
            ["Transfer rate", "跨域任务的成功率"],
            ["Cost per solved task", "token 与教师调用成本"]
          ]
        },
        {
          key: "TECH",
          items: [
            ["PyTorch", "训练与蒸馏"],
            ["verl", "RL / 蒸馏训练框架"],
            ["vLLM", "学生推理与采样"],
            ["PEFT adapters", "领域适配"],
            ["Eval harness", "留出领域与回归"]
          ]
        }
      ]
    }
  };

  const STAGE_ORDER = ["DATA", "MODEL", "TRAIN", "INFER", "HARNESS", "EVAL", "OPS"];

  let dialog = null;
  let activeIndex = 0;
  let current = null;
  let trigger = null;

  function normalizeStageName(text) {
    const value = String(text || "").trim().toUpperCase();
    return STAGE_ORDER.find((name) => value.includes(name)) || value;
  }

  function readStage(card) {
    const name = normalizeStageName(card.querySelector(".workflow-stage-head p")?.textContent);
    const question = card.querySelector(".workflow-mrq")?.textContent?.trim() || "";
    const groups = [...card.querySelectorAll(".workflow-anatomy > div")].map((group) => {
      const key = String(group.querySelector(".workflow-category-label")?.textContent || "").trim().toUpperCase();
      const items = [...group.querySelectorAll(".workflow-label-set span")].map((tag) => [
        tag.textContent.trim(),
        ""
      ]);
      return { key, items };
    });

    const byKey = new Map(groups.map((group) => [group.key, group]));
    const slices = ORDER.filter((key) => byKey.has(key)).map((key) => byKey.get(key));

    return {
      kicker: `STAGE · ${name}`,
      title: name,
      sub: question,
      slices
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
          <p class="explode-kicker" id="explode-kicker">—</p>
          <h2 id="explode-title">—</h2>
          <p class="explode-sub" id="explode-sub">—</p>
        </div>
        <button class="explode-close" type="button" aria-label="Close exploded view">✕</button>
      </div>
      <div class="explode-body">
        <div class="explode-scene">
          <div class="explode-stack" id="explode-stack" role="tablist" aria-label="Exploded layers"></div>
        </div>
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
      if (!current) return;
      if (event.key === "ArrowRight") {
        select((activeIndex + 1) % current.slices.length);
        event.preventDefault();
      }
      if (event.key === "ArrowLeft") {
        select((activeIndex - 1 + current.slices.length) % current.slices.length);
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
    const stack = dialog.querySelector("#explode-stack");
    [...stack.children].forEach((node, nodeIndex) => {
      node.setAttribute("aria-selected", String(nodeIndex === index));
      node.tabIndex = nodeIndex === index ? 0 : -1;
    });

    const slice = current.slices[index];
    const detail = dialog.querySelector("#explode-detail");
    detail.innerHTML = `
      <h3>${slice.key} <span>/ ${LABEL[slice.key] || ""}</span></h3>
      <p class="explode-question">${QUESTION[slice.key] || ""}</p>
      <ul class="explode-items">
        ${slice.items
          .map(
            ([name, note]) => `
          <li>
            <b>${name}</b>
            ${note ? `<span>${note}</span>` : ""}
          </li>`
          )
          .join("")}
      </ul>`;
    dialog.querySelector("#explode-count").textContent = `${slice.key} · ${slice.items.length} 项`;
  }

  function open(data, source) {
    ensureDialog();
    current = data;
    activeIndex = Math.min(1, data.slices.length - 1);
    trigger = source || document.activeElement;

    dialog.querySelector("#explode-kicker").textContent = data.kicker;
    dialog.querySelector("#explode-title").textContent = data.title;
    dialog.querySelector("#explode-sub").textContent = data.sub;

    const stack = dialog.querySelector("#explode-stack");
    stack.replaceChildren();
    data.slices.forEach((slice, index) => {
      const node = document.createElement("button");
      node.type = "button";
      node.className = "explode-slice";
      node.setAttribute("role", "tab");
      node.style.setProperty("--i", index);
      node.innerHTML = `<span class="no">0${index + 1}</span><span class="lb">${slice.key}</span><span class="ct">${slice.items.length}</span>`;
      node.addEventListener("click", () => select(index));
      stack.append(node);
    });

    dialog.showModal();
    select(activeIndex);
  }

  function wireStages() {
    document.querySelectorAll(".workflow-stage").forEach((card) => {
      const label = card.querySelector(".workflow-stage-head p");
      if (!label || label.dataset.expandable) return;
      label.dataset.expandable = "true";
      label.setAttribute("role", "button");
      label.setAttribute("tabindex", "0");
      label.setAttribute("aria-label", `Break down ${label.textContent.trim()}`);
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

  function wireSections() {
    const map = [
      { selector: "#roadmap", key: "rsi", label: "Break down RSIAgent" },
      { selector: "#use-cases", key: "agi", label: "Break down AGIAgent" }
    ];

    map.forEach(({ selector, key, label }) => {
      const section = document.querySelector(selector);
      const links = section?.querySelector(".section-links");
      if (!links || links.querySelector(".section-explode")) return;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "workflow-project-link section-explode";
      button.setAttribute("aria-label", label);
      button.innerHTML = `<span aria-hidden="true">⤢</span>`;
      button.addEventListener("click", () => open(META[key], button));
      links.prepend(button);
    });
  }

  function openFromHash() {
    const raw = decodeURIComponent(location.hash.replace("#explode=", "")).trim().toLowerCase();
    if (!raw) return;
    if (raw === "rsi" || raw === "rs") return open(META.rsi);
    if (raw === "agi") return open(META.agi);

    const card = [...document.querySelectorAll(".workflow-stage")].find(
      (node) => normalizeStageName(node.querySelector(".workflow-stage-head p")?.textContent).toLowerCase() === raw
    );
    if (card) open(readStage(card));
  }

  wireStages();
  wireSections();
  openFromHash();
  window.addEventListener("hashchange", openFromHash);
})();
