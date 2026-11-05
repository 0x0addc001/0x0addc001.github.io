(() => {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const languageButton = document.querySelector(".language-switch");
  const themeButton = document.querySelector(".theme-toggle");
  const languageOptions = document.querySelectorAll("[data-language-option]");
  const translatableElements = () => document.querySelectorAll("[data-en][data-zh]");
  const header = document.querySelector("[data-header]");
  const menuButton = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");
  const lightbox = document.querySelector(".lightbox");
  const lightboxImage = lightbox?.querySelector("img");
  const lightboxClose = lightbox?.querySelector(".lightbox-close");
  const modelButtons = document.querySelectorAll("[data-model]");
  const roadmap = document.querySelector(".system-card");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeLightboxTrigger = null;
  let currentLanguage = root.dataset.language === "zh" ? "zh" : "en";
  let currentTheme = root.dataset.theme === "dark" ? "dark" : "light";

  function setupHeroTagMarquee() {
    const container = document.querySelector(".hero-tags");
    if (!container || reduceMotion.matches || container.dataset.marqueeReady) return;

    const hero = container.closest(".hero");
    const tags = [...container.querySelectorAll(":scope > span")];
    if (!tags.length) return;

    hero?.classList.add("has-marquee-tags");
    const laneCount = 4;
    const tagsPerLane = Math.ceil(tags.length / laneCount);
    const durations = ["72s", "86s", "78s", "94s"];
    const delays = ["0s", "-18s", "-36s", "-10s"];
    const fragment = document.createDocumentFragment();

    for (let laneIndex = 0; laneIndex < laneCount; laneIndex += 1) {
      const lane = document.createElement("div");
      lane.className = "hero-tag-lane";

      const track = document.createElement("div");
      track.className = "hero-tag-track";
      track.style.setProperty("--marquee-duration", durations[laneIndex]);
      track.style.setProperty("--marquee-delay", delays[laneIndex]);

      const group = document.createElement("div");
      group.className = "hero-tag-group";
      tags
        .slice(laneIndex * tagsPerLane, (laneIndex + 1) * tagsPerLane)
        .forEach((tag) => group.append(tag));

      if (!group.childElementCount) continue;

      const clone = group.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      track.append(group, clone);
      lane.append(track);
      fragment.append(lane);
    }

    container.replaceChildren(fragment);
    container.dataset.marqueeReady = "true";

    const intro = hero?.querySelector(".hero-intro");
    const portrait = hero?.querySelector(".hero-portrait");
    const syncBandHeight = () => {
      if (!hero || !intro || !portrait || window.innerWidth <= 1180) {
        hero?.style.removeProperty("--hero-tag-band-height");
        return;
      }

      const introBottom = intro.getBoundingClientRect().bottom;
      const portraitBottom = portrait.getBoundingClientRect().bottom;
      hero.style.setProperty(
        "--hero-tag-band-height",
        `${Math.max(182, Math.round(portraitBottom - introBottom - 32))}px`
      );
    };

    requestAnimationFrame(syncBandHeight);
    const bandObserver = new ResizeObserver(syncBandHeight);
    if (intro) bandObserver.observe(intro);
    if (portrait) bandObserver.observe(portrait);
    document.fonts?.ready.then(syncBandHeight);
    window.addEventListener("resize", syncBandHeight);
  }

  function setupUsecaseProjectLinks() {
    document.querySelectorAll(".usecase-card h3[data-project-url]").forEach((title) => {
      const card = title.closest(".usecase-card");
      if (!card || card.querySelector(".usecase-project-link")) return;

      const action = document.createElement("a");
      const label = document.createElement("span");
      const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      const iconPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const titleRow = document.createElement("div");
      const projectUrl = new URL(title.dataset.projectUrl);
      const repositoryName = projectUrl.pathname.replace(/\/+$/, "").split("/").pop();

      action.className = "usecase-project-link";
      action.href = title.dataset.projectUrl;
      action.target = "_blank";
      action.rel = "noreferrer";
      action.setAttribute("aria-label", `Open ${repositoryName} project page`);
      label.textContent = repositoryName;
      icon.classList.add("github-icon");
      icon.setAttribute("viewBox", "0 0 24 24");
      icon.setAttribute("aria-hidden", "true");
      iconPath.setAttribute(
        "d",
        "M12 .7C5.7.7.7 5.7.7 12c0 5 3.3 9.2 7.8 10.7.6.1.8-.3.8-.6v-2.2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.6-1.3-1.6-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11 11 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.9 1.2 1.9 1.2 3.2 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.5-1.5 7.8-5.7 7.8-10.7C23.3 5.7 18.3.7 12 .7z"
      );
      icon.append(iconPath);
      action.append(icon, label);
      titleRow.className = "usecase-title-row";
      title.before(titleRow);
      titleRow.append(title, action);
    });
  }

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

  function applyLanguage(language, persist = true) {
    currentLanguage = language === "zh" ? "zh" : "en";
    root.lang = currentLanguage;
    root.dataset.language = currentLanguage;

    translatableElements().forEach((element) => {
      const content = element.dataset[currentLanguage];
      if (content) {
        element.textContent = content;
      }
    });
    languageOptions.forEach((option) => {
      option.classList.toggle("is-current", option.dataset.languageOption === currentLanguage);
    });

    if (languageButton) {
      const targetLanguage = currentLanguage === "en" ? "Chinese" : "English";
      languageButton.setAttribute("aria-label", `Switch language to ${targetLanguage}`);
      languageButton.setAttribute("aria-pressed", String(currentLanguage === "zh"));
    }

    updateThemeLabel();
    document.title = pageMeta[currentLanguage].title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", pageMeta[currentLanguage].description);

    if (persist) {
      try {
        localStorage.setItem("portfolio-language", currentLanguage);
      } catch (error) {
        // Language still works when storage is unavailable.
      }
    }

    window.dispatchEvent(new CustomEvent("portfolio:language-change", {
      detail: { language: currentLanguage }
    }));
  }

  function toggleLanguage() {
    applyLanguage(currentLanguage === "en" ? "zh" : "en");
  }

  languageButton?.addEventListener("click", toggleLanguage);

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

    const throughputResult = document.querySelector("[data-result-throughput]");
    const ttftResult = document.querySelector("[data-result-ttft]");
    if (!throughputResult || !ttftResult) return;

    const throughputMax = Math.max(data.throughput.baseline, data.throughput.proposal);
    const ttftMax = Math.max(data.ttft.baseline, data.ttft.proposal);

    throughputResult.textContent = data.throughput.change;
    ttftResult.textContent = data.ttft.change;
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

  setupHeroTagMarquee();
  setupUsecaseProjectLinks();
  applyLanguage(currentLanguage, false);
  applyTheme(currentTheme, false);
  requestAnimationFrame(animateResultBars);
})();
