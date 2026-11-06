(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const textSelector = [
    ".hero-title > span",
    ".section-heading h2",
    ".section-heading > p",
    ".resume-heading-copy h2",
    ".resume-heading-copy > p",
    ".resume-entry-main > h3",
    ".work-card h3",
    ".work-card-body > p:not(.small-label)",
    ".xiaomi-title h2",
    ".xiaomi-lede",
    ".confidential-note p",
    ".loop-title h3",
    ".xiaomi-work h3",
    ".xiaomi-work p",
    ".xiaomi-evidence-heading h3",
    ".xiaomi-evidence-heading > p",
    ".redrawn-figure h4",
    ".architecture-note p",
    ".engineering-card h3",
    ".engineering-card > p:not(.small-label)",
    ".project-title-wrap h2",
    ".project-title-wrap > p",
    ".project-thesis h3",
    ".thesis-grid h3",
    ".thesis-grid p",
    ".results-copy h3",
    ".results-copy > p",
    ".mechanism-strip strong",
    ".mechanism-strip p",
    ".learning-copy blockquote",
    ".usecase-card h3",
    ".usecase-card > p",
    ".contact-main h2",
    ".email-direct"
  ].join(",");

  const timers = new WeakMap();
  const heroHoldMs = 4200;
  const heroRestartGapMs = 260;
  const tagGroupSelector = [
    ".workflow-label-set",
    ".project-tags",
    ".course-tags",
    ".evaluation-tags",
    ".resume-meta-tags",
    ".project-role-tags",
    ".resume-entry-org",
    ".work-kicker",
    ".usecase-meta"
  ].join(",");
  let observer = null;
  let tagObserver = null;
  let heroSequenceTimer = null;
  let heroSequenceToken = 0;

  function cancel(element) {
    const timer = timers.get(element);
    if (timer) clearTimeout(timer);
    timers.delete(element);
  }

  function typeText(element, text, options = {}) {
    if (!element) return;
    cancel(element);

    const characters = Array.from(String(text));
    const fullText = String(text).trim();
    const startDelay = options.delay || 0;
    const baseDelay = Math.max(8, Math.min(26, 2300 / Math.max(fullText.length, 1)));

    element.setAttribute("aria-label", fullText);
    element.classList.remove("is-typed");
    element.classList.add("is-typing");
    element.textContent = "";

    let index = 0;

    function writeNextCharacter() {
      if (index >= characters.length) {
        element.textContent = fullText;
        element.classList.remove("is-typing");
        element.classList.add("is-typed");
        timers.delete(element);
        options.onDone?.();
        return;
      }

      const character = characters[index];
      element.textContent += character;
      index += 1;
      options.onProgress?.();

      const punctuationPause = /[，。！？；：,.!?;:]/.test(character) ? 4 : 1;
      timers.set(element, setTimeout(writeNextCharacter, baseDelay * punctuationPause));
    }

    timers.set(element, setTimeout(writeNextCharacter, startDelay));
  }

  function eligible(element) {
    if (!element.textContent.trim()) return false;
    if (element.closest(".term-modal, .lightbox, .site-header, .mobile-nav")) return false;
    if (element.querySelector(".term-tag, .small-label, .mono-label")) return false;
    return true;
  }

  function resetText(element) {
    cancel(element);
    element.classList.remove("is-typing", "is-typed", "will-type");
    element.removeAttribute("aria-label");
    element.style.removeProperty("min-height");
  }

  function prepareText(element) {
    resetText(element);
    element.classList.add("will-type");
  }

  function revealText(element, index, onDone, textOverride, heightOverride) {
    const text = textOverride ?? element.textContent.trim();
    if (!text) return;

    const height = heightOverride || element.getBoundingClientRect().height;
    element.style.minHeight = `${height}px`;
    element.classList.remove("will-type");
    typeText(element, text, {
      delay: 90 + Math.min(index, 5) * 80,
      onDone: () => {
        element.style.removeProperty("min-height");
        onDone?.();
      }
    });
  }

  function heroIsVisible(title) {
    if (document.hidden) return false;
    const bounds = title.getBoundingClientRect();
    return bounds.bottom > 0 && bounds.top < window.innerHeight;
  }

  function setHeroTypingState(title, active) {
    title?.closest(".hero")?.classList.toggle("is-hero-typing", active);
  }

  function scheduleHeroReplay(title, lines, texts, token) {
    if (token !== heroSequenceToken) return;
    clearTimeout(heroSequenceTimer);
    heroSequenceTimer = setTimeout(() => {
      if (token !== heroSequenceToken) return;
      if (!heroIsVisible(title)) {
        scheduleHeroReplay(title, lines, texts, token);
        return;
      }

      const heights = lines.map((line) => line.getBoundingClientRect().height);
      lines.forEach((line) => {
        resetText(line);
        line.textContent = "";
      });
      setHeroTypingState(title, true);

      heroSequenceTimer = setTimeout(() => {
        if (token !== heroSequenceToken) return;
        revealHeroTitle(lines, texts, heights, token);
      }, heroRestartGapMs);
    }, heroHoldMs);
  }

  function revealHeroTitle(lines, texts, heights, token, index = 0) {
    if (token !== heroSequenceToken || index >= lines.length) return;

    revealText(lines[index], 0, () => {
      if (token !== heroSequenceToken) return;
      if (index + 1 >= lines.length) {
        setHeroTypingState(lines[0]?.closest(".hero-title"), false);
        scheduleHeroReplay(lines[0]?.closest(".hero-title"), lines, texts, token);
        return;
      }
      heroSequenceTimer = setTimeout(
        () => revealHeroTitle(lines, texts, heights, token, index + 1),
        150
      );
    }, texts[index], heights[index]);
  }

  function initTextMotion() {
    observer?.disconnect();
    clearTimeout(heroSequenceTimer);
    heroSequenceTimer = null;
    heroSequenceToken += 1;
    document.querySelectorAll("[data-typewriter-ready]").forEach(resetText);

    const token = heroSequenceToken;
    const heroTitle = document.querySelector(".hero-title");
    const heroLines = heroTitle ? [...heroTitle.querySelectorAll(":scope > span")] : [];
    const heroTexts = heroLines.map((element) => element.textContent.trim());
    const heroHeights = heroLines.map((element) => element.getBoundingClientRect().height);
    const elements = [...document.querySelectorAll(textSelector)]
      .filter((element) => !element.closest(".hero-title"))
      .filter(eligible);
    heroLines.forEach((element) => {
      element.dataset.typewriterReady = "true";
      prepareText(element);
    });
    elements.forEach((element) => {
      element.dataset.typewriterReady = "true";
      prepareText(element);
    });

    if (reduceMotion.matches) {
      setHeroTypingState(heroTitle, false);
      heroLines.forEach(resetText);
      elements.forEach(resetText);
      return;
    }

    if (heroTitle && heroLines.length) {
      setHeroTypingState(heroTitle, true);
      const heroTitleObserver = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          heroTitleObserver.disconnect();
          revealHeroTitle(heroLines, heroTexts, heroHeights, token);
        },
        { threshold: 0.14, rootMargin: "0px 0px -4% 0px" }
      );
      heroTitleObserver.observe(heroTitle);
    } else {
      setHeroTypingState(heroTitle, false);
    }

    observer = new IntersectionObserver(
      (entries) => {
        let visibleIndex = 0;
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          revealText(entry.target, visibleIndex);
          visibleIndex += 1;
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -7% 0px" }
    );

    elements.forEach((element) => observer.observe(element));
  }

  function resetTagMotion() {
    tagObserver?.disconnect();
    document.querySelectorAll(".tag-pop-ready, .is-tag-visible").forEach((tag) => {
      tag.classList.remove("tag-pop-ready", "is-tag-visible");
      tag.style.removeProperty("--tag-order");
    });
  }

  function tagsInGroup(group) {
    return [...group.querySelectorAll(".term-tag")];
  }

  function initTagMotion() {
    resetTagMotion();

    if (reduceMotion.matches) return;

    tagObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          tagObserver.unobserve(entry.target);
          const tags = tagsInGroup(entry.target);
          tags.forEach((tag, index) => {
            tag.style.setProperty("--tag-order", index);
            tag.classList.add("is-tag-visible");
          });
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -5% 0px" }
    );

    document.querySelectorAll(tagGroupSelector).forEach((group) => {
      const tags = tagsInGroup(group);
      if (!tags.length) return;
      tags.forEach((tag) => tag.classList.add("tag-pop-ready"));
      tagObserver.observe(group);
    });
  }

  window.PortfolioTextMotion = {
    typeText,
    cancel
  };

  window.addEventListener("portfolio:language-change", () => {
    requestAnimationFrame(() => {
      initTextMotion();
      initTagMotion();
    });
  });

  window.addEventListener("portfolio:terms-updated", () => {
    requestAnimationFrame(initTagMotion);
  });

  initTextMotion();
  initTagMotion();
})();
