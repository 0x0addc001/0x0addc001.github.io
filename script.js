(() => {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const languageButton = document.querySelector(".language-switch");
  const themeButton = document.querySelector(".theme-toggle");
  const languageOptions = document.querySelectorAll("[data-language-option]");
  const translatableElements = document.querySelectorAll("[data-en][data-zh]");
  const header = document.querySelector("[data-header]");
  const menuButton = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");
  const lightbox = document.querySelector(".lightbox");
  const lightboxImage = lightbox?.querySelector("img");
  const lightboxClose = lightbox?.querySelector(".lightbox-close");
  const modelButtons = document.querySelectorAll("[data-model]");
  const roadmap = document.querySelector(".system-card");
  const heroTechStack = document.querySelector("[data-tech-stack-output]");
  const luckyNumbers = document.querySelectorAll("[data-lucky-target]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeLightboxTrigger = null;
  let luckyDrawStarted = false;
  let currentLanguage = root.dataset.language === "zh" ? "zh" : "en";
  let currentTheme = root.dataset.theme === "dark" ? "dark" : "light";

  const results = {
    small: {
      throughput: {
        change: "+11.8%",
        baseline: 43.6,
        proposal: 48.8
      },
      ttft: {
        change: "−18.6%",
        baseline: 536,
        proposal: 436
      }
    },
    large: {
      throughput: {
        change: "+21.3%",
        baseline: 38.2,
        proposal: 46.4
      },
      ttft: {
        change: "−25.2%",
        baseline: 691,
        proposal: 517
      }
    }
  };

  const pageMeta = {
    en: {
      title: "Jialiang Li",
      description: "Jialiang Li — Machine Learning Engineer building reliable post-training, inference, and agent harness systems."
    },
    zh: {
      title: "李嘉梁",
      description: "李嘉梁 — 算法工程师，专注可信的后训练、推理与 Agent 执行系统。"
    }
  };

  function renderHeroTechStack() {
    if (!heroTechStack) return;

    const labels = [...document.querySelectorAll(".workflow-tech-tag")]
      .map((tag) => tag.textContent.trim())
      .filter(Boolean);
    const uniqueLabels = [...new Set(labels)];
    const fragment = document.createDocumentFragment();

    uniqueLabels.forEach((label) => {
      const tag = document.createElement("span");
      tag.textContent = label;
      fragment.appendChild(tag);
    });

    heroTechStack.replaceChildren(fragment);
    heroTechStack.setAttribute(
      "aria-label",
      currentLanguage === "zh" ? "技术栈" : "Technology stack"
    );
  }

  function applyLanguage(language, persist = true) {
    currentLanguage = language === "zh" ? "zh" : "en";
    root.lang = currentLanguage;
    root.dataset.language = currentLanguage;

    translatableElements.forEach((element) => {
      const content = element.dataset[currentLanguage];
      if (content) {
        element.textContent = content;
      }
    });
    renderHeroTechStack();

    languageOptions.forEach((option) => {
      option.classList.toggle("is-current", option.dataset.languageOption === currentLanguage);
    });

    if (languageButton) {
      const targetLanguage = currentLanguage === "en" ? "Chinese" : "English";
      languageButton.setAttribute("aria-label", `Switch language to ${targetLanguage}`);
      languageButton.setAttribute("aria-pressed", String(currentLanguage === "zh"));
    }

    updateThemeLabel();
    updateEntryToggleLabels();
    document.title = pageMeta[currentLanguage].title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", pageMeta[currentLanguage].description);

    if (persist) {
      try {
        localStorage.setItem("portfolio-language", currentLanguage);
      } catch (error) {
        // Language still works when storage is unavailable.
      }
    }
  }

  function toggleLanguage() {
    applyLanguage(currentLanguage === "en" ? "zh" : "en");
  }

  languageButton?.addEventListener("click", toggleLanguage);

  const entryToggles = document.querySelectorAll(".entry-toggle");

  function updateEntryToggleLabels() {
    entryToggles.forEach((button) => {
      const label = button.querySelector("span");
      const isOpen = button.getAttribute("aria-expanded") === "true";
      if (!label) return;
      label.textContent = currentLanguage === "zh"
        ? (isOpen ? "收起详情" : "展开详情")
        : (isOpen ? "Hide details" : "Show details");
    });
  }

  entryToggles.forEach((button) => {
    const details = button.closest(".resume-entry-main")?.querySelector(".resume-detail-grid");
    if (!details) return;

    button.addEventListener("click", () => {
      const willOpen = button.getAttribute("aria-expanded") !== "true";
      button.setAttribute("aria-expanded", String(willOpen));
      updateEntryToggleLabels();

      if (willOpen) {
        details.hidden = false;
        if (!reduceMotion.matches) {
          details.animate(
            [
              { opacity: 0, transform: "translateY(-8px)" },
              { opacity: 1, transform: "translateY(0)" }
            ],
            { duration: 260, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
          );
        }
      } else {
        details.hidden = true;
      }
    });
  });

  function updateThemeLabel() {
    if (!themeButton) return;
    const nextTheme = currentTheme === "light" ? "dark" : "light";
    const label = currentLanguage === "zh"
      ? `切换至${nextTheme === "dark" ? "深色" : "浅色"}模式`
      : `Switch to ${nextTheme} mode`;
    themeButton.setAttribute("aria-label", label);
    themeButton.setAttribute("aria-pressed", String(currentTheme === "dark"));
  }

  function applyTheme(theme, persist = true) {
    currentTheme = theme === "dark" ? "dark" : "light";
    root.dataset.theme = currentTheme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      "content",
      currentTheme === "dark" ? "#07111f" : "#f3f1ea"
    );
    updateThemeLabel();

    if (persist) {
      try {
        localStorage.setItem("portfolio-theme", currentTheme);
      } catch (error) {
        // Theme still works when storage is unavailable.
      }
    }
  }

  themeButton?.addEventListener("click", () => {
    applyTheme(currentTheme === "light" ? "dark" : "light");
  });

  if (roadmap && !reduceMotion.matches) {
    roadmap.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch") return;
      const bounds = roadmap.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      roadmap.style.setProperty("--roadmap-tilt-x", `${(-y * 1.4).toFixed(3)}deg`);
      roadmap.style.setProperty("--roadmap-tilt-y", `${(x * 1.8).toFixed(3)}deg`);
    });

    roadmap.addEventListener("pointerleave", () => {
      roadmap.style.setProperty("--roadmap-tilt-x", "0deg");
      roadmap.style.setProperty("--roadmap-tilt-y", "0deg");
    });
  }

  function updateHeaderState() {
    header?.classList.toggle("is-scrolled", window.scrollY > 24);
  }

  updateHeaderState();
  window.addEventListener("scroll", updateHeaderState, { passive: true });

  function closeMenu() {
    menuButton?.setAttribute("aria-expanded", "false");
    mobileNav?.classList.remove("is-open");
    body.classList.remove("menu-open");
  }

  function toggleMenu() {
    const willOpen = menuButton?.getAttribute("aria-expanded") !== "true";
    menuButton?.setAttribute("aria-expanded", String(willOpen));
    mobileNav?.classList.toggle("is-open", willOpen);
    body.classList.toggle("menu-open", willOpen);
  }

  menuButton?.addEventListener("click", toggleMenu);
  mobileNav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

  function formatLuckyNumber(value) {
    return String(value);
  }

  function startLuckyDraw() {
    if (luckyDrawStarted || !luckyNumbers.length) return;
    luckyDrawStarted = true;

    const timers = [];

    luckyNumbers.forEach((number, index) => {
      const target = formatLuckyNumber(Number(number.dataset.luckyTarget || number.textContent));

      if (reduceMotion.matches) {
        number.textContent = target;
        return;
      }

      number.classList.add("is-rolling");
      number.textContent = formatLuckyNumber(Math.floor(10 + Math.random() * 90));
      timers.push(setTimeout(function tick() {
        number.textContent = formatLuckyNumber(Math.floor(10 + Math.random() * 90));
        timers.push(setTimeout(tick, 48 + index * 7));
      }, 42 + index * 8));
    });

    setTimeout(() => {
      timers.forEach((timer) => clearTimeout(timer));
      luckyNumbers.forEach((number) => {
        number.textContent = formatLuckyNumber(Number(number.dataset.luckyTarget || number.textContent));
        number.classList.remove("is-rolling");
      });
    }, 3200);
  }

  const revealElements = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
          if (entry.target.classList.contains("results-visual")) {
            animateResultBars();
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
    requestAnimationFrame(animateResultBars);
  }

  const heroProof = document.querySelector(".hero-proof");
  if ("IntersectionObserver" in window && !reduceMotion.matches && heroProof) {
    const proofObserver = new IntersectionObserver(
      (entries, observer) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        startLuckyDraw();
        observer.disconnect();
      },
      { threshold: 0.7, rootMargin: "0px 0px -12% 0px" }
    );
    proofObserver.observe(heroProof);
  } else {
    startLuckyDraw();
  }

  const navLinks = document.querySelectorAll(".primary-nav a");
  const observedSections = [...document.querySelectorAll("[data-nav-target]")];

  if ("IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visibleEntry) return;
        navLinks.forEach((link) => {
          const navTarget = visibleEntry.target.dataset.navTarget || `#${visibleEntry.target.id}`;
          link.classList.toggle("is-active", link.getAttribute("href") === navTarget);
        });
      },
      { rootMargin: "-24% 0px -64% 0px", threshold: [0, 0.1, 0.4] }
    );
    observedSections.forEach((section) => navObserver.observe(section));
  }

  function formatValue(value) {
    return Number.isInteger(value) ? value.toString() : value.toFixed(1);
  }

  function setBarWidth(element, percentage) {
    if (element) {
      element.style.width = `${Math.max(0, Math.min(100, percentage))}%`;
    }
  }

  function renderResults(model) {
    const data = results[model];
    if (!data) return;

    const throughputMax = Math.max(data.throughput.baseline, data.throughput.proposal);
    const ttftMax = Math.max(data.ttft.baseline, data.ttft.proposal);

    document.querySelector("[data-result-throughput]").textContent = data.throughput.change;
    document.querySelector("[data-result-ttft]").textContent = data.ttft.change;
    document.querySelector("[data-result-throughput-value]").textContent = formatValue(data.throughput.baseline);
    document.querySelector("[data-result-throughput-lmpool-value]").textContent = formatValue(data.throughput.proposal);
    document.querySelector("[data-result-ttft-value]").textContent = formatValue(data.ttft.baseline);
    document.querySelector("[data-result-ttft-lmpool-value]").textContent = formatValue(data.ttft.proposal);

    requestAnimationFrame(() => {
      setBarWidth(
        document.querySelector("[data-result-throughput-base]"),
        (data.throughput.baseline / throughputMax) * 100
      );
      setBarWidth(
        document.querySelector("[data-result-throughput-lmpool]"),
        (data.throughput.proposal / throughputMax) * 100
      );
      setBarWidth(
        document.querySelector("[data-result-ttft-base]"),
        (data.ttft.baseline / ttftMax) * 100
      );
      setBarWidth(
        document.querySelector("[data-result-ttft-lmpool]"),
        (data.ttft.proposal / ttftMax) * 100
      );
    });
  }

  function animateResultBars() {
    const selected = document.querySelector('[data-model][aria-pressed="true"]');
    renderResults(selected?.dataset.model || "large");
  }

  modelButtons.forEach((button) => {
    button.addEventListener("click", () => {
      modelButtons.forEach((candidate) => {
        candidate.setAttribute("aria-pressed", String(candidate === button));
      });
      renderResults(button.dataset.model);
    });
  });

  function openLightbox(trigger) {
    if (!lightbox || !lightboxImage) return;
    activeLightboxTrigger = trigger;
    lightboxImage.src = trigger.dataset.lightboxSrc || trigger.getAttribute("href");
    lightboxImage.alt = trigger.dataset.lightboxAlt || "";
    lightbox.hidden = false;
    body.classList.add("lightbox-open");
    lightboxClose?.focus();
  }

  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    lightboxImage?.removeAttribute("src");
    body.classList.remove("lightbox-open");
    activeLightboxTrigger?.focus();
    activeLightboxTrigger = null;
  }

  document.querySelectorAll(".lightbox-trigger").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      openLightbox(trigger);
    });
  });

  lightboxClose?.addEventListener("click", closeLightbox);
  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Tab" && lightbox && !lightbox.hidden) {
      event.preventDefault();
      lightboxClose?.focus();
      return;
    }

    if (event.key === "Escape") {
      closeLightbox();
      closeMenu();
    }
  });

  document.addEventListener("click", (event) => {
    if (menuButton?.getAttribute("aria-expanded") !== "true") return;
    if (menuButton.contains(event.target) || mobileNav?.contains(event.target)) return;
    closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeMenu();
  });

  applyLanguage(currentLanguage, false);
  applyTheme(currentTheme, false);
  requestAnimationFrame(animateResultBars);
})();
