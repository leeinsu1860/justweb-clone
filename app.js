const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) =>
  Array.from(scope.querySelectorAll(selector));

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

init();

function init() {
  if (location.hash) {
    history.replaceState(null, "", location.pathname + location.search);
  }
  window.scrollTo(0, 0);
  document.documentElement.scrollLeft = 0;
  document.body.scrollLeft = 0;
  initWelcomeLoader();
  initJustCursorPortal();
  initHomeNavSpy();
  initLogoAssembly();
  initReveals();
  initMemberNicknames();
  initAwardsPage();
}

function initHomeNavSpy() {
  const navLinks = $$(".home-nav a[href^='#']");
  if (!navLinks.length) return;

  const sections = navLinks
    .map((link) => ({
      link,
      section: $(link.getAttribute("href")),
    }))
    .filter((item) => item.section);

  if (!sections.length) return;

  const setActive = (activeLink) => {
    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link === activeLink);
    });
  };

  const updateActiveSection = () => {
    const scrollY = window.scrollY;
    const triggerPoint = window.innerHeight * 0.2;

    let current = sections[0];

    sections.forEach((item) => {
      const top = item.section.offsetTop;

      if (scrollY + triggerPoint >= top) {
        current = item;
      }
    });

    setActive(current.link);
  };

  updateActiveSection();

  window.addEventListener("scroll", updateActiveSection, {
    passive: true,
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setActive(link);
    });
  });
}

function initMemberNicknames() {
  const members = $$(".member-list article");
  if (!members.length) return;

  members.forEach((member) => {
    const nameElement = $("strong", member);
    const name = nameElement?.textContent.trim() || "";
    const nickname = member.dataset.nickname?.trim() || "";
    const role = member.dataset.role?.trim() || "";

    if (role) {
      const roleSticker = document.createElement("em");
      roleSticker.className = "member-role";
      roleSticker.textContent = role;
      member.prepend(roleSticker);
      member.classList.add("has-role");
    }

    if (!nickname) return;

    member.classList.add("has-nickname");
    member.tabIndex = 0;
    member.setAttribute("aria-label", `${name} 별명 보기`);

    const toggleNickname = () => {
      const isOpen = member.classList.toggle("nickname-open");
      if (nameElement) nameElement.textContent = isOpen ? nickname : name;
      if (name === "김도연") triggerDoyeonSpiderDrop(member);
      if (name === "이채호") triggerChaeflare(member);
    };

    member.addEventListener("dblclick", toggleNickname);
    member.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      toggleNickname();
    });
  });
}

function triggerDoyeonSpiderDrop(member) {
  const rect = member.getBoundingClientRect();
  const w = window.innerWidth;
  const h = window.innerHeight;
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const imageUrl = "./assets/doyeon-spider-drop.png";
  const anchorX = clamp(rect.left + rect.width / 2, 120, w - 120);
  const anchorY = -8;
  const imageWidth = clamp(w * 0.28, 220, 330);
  const imageHeight = imageWidth;
  const endY = Math.min(h * 0.68, rect.top + 240) - imageHeight * 0.12;

  $(".doyeon-spider-effect")?.remove();

  const effect = document.createElement("div");
  effect.className = "doyeon-spider-effect doyeon-drop";
  effect.style.setProperty("--doyeon-anchor-x", `${anchorX}px`);
  effect.style.setProperty("--doyeon-anchor-y", `${anchorY}px`);
  effect.style.setProperty("--doyeon-image-width", `${imageWidth}px`);
  effect.style.setProperty(
    "--doyeon-start-y",
    `${anchorY - imageHeight * 0.2}px`,
  );
  effect.style.setProperty("--doyeon-end-y", `${endY}px`);
  effect.innerHTML = `
    <img class="doyeon-drop-image" src="${imageUrl}" alt="" aria-hidden="true" draggable="false" />
  `;
  document.body.append(effect);

  if (reducedMotion) effect.classList.add("is-reduced-motion");
  window.setTimeout(
    () => {
      effect.remove();
    },
    reducedMotion ? 900 : 4200,
  );
}

function triggerChaeflare(member) {
  const rect = member.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const startY = rect.top + rect.height / 2;

  const effect = document.createElement("div");
  effect.className = "chaeflare-effect";
  effect.style.setProperty("--flare-x", `${x}px`);
  effect.style.setProperty("--flare-start-y", `${startY}px`);
  effect.innerHTML = `
    <i class="chaeflare-shell" aria-hidden="true">
      <span class="chaeflare-body">
        <span class="chaeflare-band"></span>
        <span class="chaeflare-hole hole-a"></span>
        <span class="chaeflare-hole hole-b"></span>
        <span class="chaeflare-hole hole-c"></span>
        <span class="chaeflare-hole hole-d"></span>
        <span class="chaeflare-label">FLASH</span>
      </span>
      <span class="chaeflare-pin"></span>
      <span class="chaeflare-ring"></span>
    </i>
    <i class="chaeflare-burst" aria-hidden="true"></i>
    <i class="chaeflare-whiteout" aria-hidden="true"></i>
  `;

  document.body.append(effect);

  const shell = $(".chaeflare-shell", effect);
  const burst = $(".chaeflare-burst", effect);
  const direction = x > window.innerWidth / 2 ? -1 : 1;
  const gravity = 1320;
  const membersTitle = $("#membersTitle");
  const titleRect = membersTitle?.getBoundingClientRect();
  const targetY = titleRect
    ? titleRect.top + titleRect.height / 2
    : window.innerHeight * 0.36;
  const desiredRise = Math.max(180, startY - targetY);
  let px = x;
  let py = startY;
  let vx = direction * (34 + Math.random() * 16);
  let vy = -Math.sqrt(2 * gravity * desiredRise);
  const drag = 0.992;
  let angle = -28;
  let spin = direction * (560 + Math.random() * 90);
  let last = performance.now();
  let apexY = startY;
  let lastSmoke = 0;

  const puffSmoke = () => {
    const smoke = document.createElement("i");
    smoke.className = "chaeflare-smoke";
    smoke.style.left = `${px + (Math.random() - 0.5) * 8}px`;
    smoke.style.top = `${py + (Math.random() - 0.5) * 8}px`;
    smoke.style.setProperty(
      "--smoke-drift-x",
      `${(Math.random() - 0.5) * 18}px`,
    );
    smoke.style.setProperty("--smoke-drift-y", `${8 + Math.random() * 14}px`);
    smoke.style.setProperty("--smoke-scale", `${0.75 + Math.random() * 0.45}`);
    effect.append(smoke);
    window.setTimeout(() => smoke.remove(), 1450);
  };

  const animate = (now) => {
    const dt = Math.min((now - last) / 1000, 0.028);
    last = now;

    vx *= drag;
    vy += gravity * dt;
    px += vx * dt;
    py += vy * dt;
    angle += spin * dt;
    spin *= 0.986;
    apexY = Math.min(apexY, py);

    shell.style.left = `${px}px`;
    shell.style.top = `${py}px`;
    shell.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
    shell.style.opacity = "1";

    if (now - lastSmoke > 42) {
      puffSmoke();
      lastSmoke = now;
    }

    if (vy > 170 && py > apexY + 24) {
      effect.classList.add("is-burst");
      shell.style.opacity = "0";
      burst.style.left = `${px}px`;
      burst.style.top = `${py}px`;
      return;
    }

    requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
  window.setTimeout(() => effect.remove(), 4600);
}

function initWelcomeLoader() {
  if (!document.body.classList.contains("is-loading")) return;

  const close = () => document.body.classList.remove("is-loading");
  window.setTimeout(close, 1350);
  window.addEventListener("pageshow", close, { once: true });
}

function initJustCursorPortal() {
  const cursor = $(".just-cursor");
  if (!cursor || !window.matchMedia("(pointer: fine)").matches) return;

  const setCursor = (event) => {
    document.body.classList.add("cursor-active");
    cursor.style.transform = `translate3d(${event.clientX - 6}px, ${event.clientY - 4}px, 0)`;
    document.body.classList.toggle(
      "cursor-link",
      Boolean(event.target.closest("a, button")),
    );
  };

  window.addEventListener(
    "pointermove",
    (event) => {
      setCursor(event);
    },
    { passive: true },
  );

  window.addEventListener("pointerleave", () => {
    document.body.classList.remove("cursor-active", "cursor-link");
  });
}

function initLogoAssembly() {
  const page = $(".logo-assemble-page");
  const section = $(".logo-assemble");
  const stage = $("[data-logo-stage]");
  const pieces = $$(".logo-piece", stage || document);
  const finalLogo = $(".logo-final", stage || document);
  const glow = $(".logo-glow", stage || document);
  const noise = $(".logo-noise", stage || document);

  if (!section || !stage || !pieces.length) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (prefersReducedMotion) {
    pieces.forEach((piece) => {
      piece.style.opacity = "0";
      piece.style.transform = "none";
    });
    if (finalLogo) finalLogo.style.opacity = "1";
    section.classList.add("is-complete");
    return;
  }

  if (!window.gsap || !window.ScrollTrigger) {
    initNativeLogoAssembly({ page, section, stage, pieces, glow, noise });
    return;
  }

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ limitCallbacks: true, ignoreMobileResize: true });

  pieces.forEach((piece) => {
    const style = getComputedStyle(piece);
    gsap.set(piece, {
      x: style.getPropertyValue("--sx").trim(),
      y: style.getPropertyValue("--sy").trim(),
      rotation: style.getPropertyValue("--sr").trim(),
      scale: Number(style.getPropertyValue("--ss")) || 1,
      opacity: 0.82,
      force3D: true,
    });
  });

  const timeline = gsap.timeline({
    defaults: { ease: "power3.out" },
    scrollTrigger: {
      trigger: section,
      pin: true,
      scrub: 0.45,
      start: "top top",
      end: "+=310%",
      anticipatePin: 1,
      onUpdate: (self) => {
        const complete = self.progress > 0.64;
        section.classList.toggle("is-complete", complete);
      },
    },
  });

  timeline
    .to(
      pieces,
      {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        opacity: 1,
        duration: 1.05,
        stagger: {
          each: 0.018,
          from: "center",
        },
      },
      0,
    )
    .to(
      glow,
      {
        opacity: 1,
        scale: 1.08,
        duration: 0.08,
        ease: "power1.out",
      },
      1.2,
    )
    .to(
      finalLogo,
      {
        opacity: 1,
        duration: 0.06,
        ease: "power1.out",
      },
      1.22,
    )
    .to(
      noise,
      {
        opacity: 0.22,
        duration: 0.035,
        ease: "none",
      },
      1.24,
    )
    .to(
      pieces,
      {
        opacity: 0,
        duration: 0.12,
        ease: "power2.out",
      },
      1.26,
    )
    .to(
      stage,
      {
        scale: 1.035,
        duration: 0.055,
        ease: "power2.out",
      },
      1.25,
    )
    .to(stage, { x: -6, y: 4, duration: 0.025, ease: "none" }, 1.29)
    .to(stage, { x: 5, y: -3, duration: 0.025, ease: "none" }, 1.315)
    .to(stage, { x: -3, y: 2, duration: 0.025, ease: "none" }, 1.34)
    .to(
      stage,
      {
        x: 0,
        y: 0,
        scale: 1,
        duration: 0.08,
        ease: "power2.out",
      },
      1.38,
    )
    .to(
      noise,
      {
        opacity: 0,
        duration: 0.08,
        ease: "power1.out",
      },
      1.38,
    )
    .to(
      glow,
      {
        opacity: 0.42,
        scale: 1,
        duration: 0.12,
        ease: "power2.out",
      },
      1.4,
    )
    .to(
      stage,
      {
        y: "-8vh",
        scale: 0.96,
        opacity: 0,
        duration: 0.32,
        ease: "power2.inOut",
      },
      1.68,
    )
    .to({}, { duration: 0.28 });
}

function initNativeLogoAssembly({ page, section, stage, pieces, glow, noise }) {
  document.body.classList.add("native-scroll");

  const starts = pieces.map((piece) => {
    const style = getComputedStyle(piece);
    return {
      node: piece,
      x: parseLength(
        style.getPropertyValue("--sx").trim(),
        window.innerWidth,
        window.innerHeight,
      ),
      y: parseLength(
        style.getPropertyValue("--sy").trim(),
        window.innerWidth,
        window.innerHeight,
      ),
      rotation: parseFloat(style.getPropertyValue("--sr")) || 0,
      scale: Number(style.getPropertyValue("--ss")) || 1,
    };
  });

  let ticking = false;

  const render = () => {
    ticking = false;
    const pageTop = page.offsetTop;
    const distance = Math.max(page.offsetHeight - window.innerHeight, 1);
    const raw = (window.scrollY - pageTop) / distance;
    const progress = clamp(raw, 0, 1);
    const assembled = easeOutCubic(clamp(progress / 0.6, 0, 1));
    const impact = clamp((progress - 0.61) / 0.09, 0, 1);
    const cleanBlend = easeOutCubic(clamp((progress - 0.58) / 0.08, 0, 1));
    const exitBlend = easeOutCubic(clamp((progress - 0.82) / 0.16, 0, 1));
    const hit = Math.sin(impact * Math.PI);

    starts.forEach((start) => {
      const x = start.x * (1 - assembled);
      const y = start.y * (1 - assembled);
      const rotation = start.rotation * (1 - assembled);
      const scale = 1 + (start.scale - 1) * (1 - assembled);
      start.node.style.opacity = String(
        (0.82 + assembled * 0.18) * (1 - cleanBlend),
      );
      start.node.style.transform = `translate3d(${x}px, ${y}px, 0) rotateZ(${rotation}deg) scale(${scale})`;
    });

    const shakeX = hit ? Math.sin(impact * Math.PI * 8) * 6 * hit : 0;
    const shakeY = hit ? Math.cos(impact * Math.PI * 9) * 4 * hit : 0;
    const zoom = 1 + 0.035 * hit;
    stage.style.opacity = String(1 - exitBlend);
    stage.style.transform = `translate3d(${shakeX}px, ${shakeY - window.innerHeight * 0.08 * exitBlend}px, 0) scale(${zoom - 0.04 * exitBlend})`;

    if (glow) {
      glow.style.opacity = String(impact > 0 ? 0.42 + 0.58 * hit : 0);
      glow.style.transform = `scale(${0.8 + 0.28 * hit})`;
    }

    if (noise) {
      noise.style.opacity = String(0.22 * hit);
    }

    const finalLogo = $(".logo-final", stage);
    if (finalLogo) {
      finalLogo.style.opacity = String(cleanBlend);
    }

    const complete = progress > 0.64;
    section.classList.toggle("is-complete", complete);
  };

  const requestRender = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(render);
  };

  render();
  window.addEventListener("scroll", requestRender, { passive: true });
  window.addEventListener("resize", requestRender);
}

function initReveals() {
  const targets = $$(".reveal");
  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -12% 0px" },
  );

  targets.forEach((target) => observer.observe(target));
}

function parseLength(value, viewportWidth, viewportHeight) {
  const number = parseFloat(value) || 0;
  if (value.endsWith("vw")) return (number / 100) * viewportWidth;
  if (value.endsWith("vh")) return (number / 100) * viewportHeight;
  return number;
}

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}

function easeInOutCubic(value) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

async function initAwardsPage() {
  const grid = $("#certificateGrid");
  const tableBody = $("#awardTableBody");
  const filters = $("#awardFilters");
  if (!grid || !tableBody || !filters) return;

  const awards = await loadJson("./data/awards.json", []);
  const ranks = ["전체", ...new Set(awards.map((award) => award.awardName))];

  filters.innerHTML = ranks
    .map(
      (rank, index) =>
        `<button class="filter-button ${index === 0 ? "is-active" : ""}" type="button" data-rank="${escapeAttribute(rank)}">${escapeHtml(rank)}</button>`,
    )
    .join("");

  const paint = (rank = "전체") => {
    const visibleAwards =
      rank === "전체"
        ? awards
        : awards.filter((award) => award.awardName === rank);
    grid.innerHTML = visibleAwards.map(renderCertificateCard).join("");
    tableBody.innerHTML = visibleAwards.map(renderAwardRow).join("");
  };

  filters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-rank]");
    if (!button) return;
    $$(".filter-button", filters).forEach((filter) => {
      filter.classList.toggle("is-active", filter === button);
    });
    paint(button.dataset.rank);
  });

  paint();
}

async function loadJson(url, fallback) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${url} ${response.status}`);
    return response.json();
  } catch (error) {
    console.warn(error);
    return fallback;
  }
}

function renderCertificateCard(award) {
  const members = Array.isArray(award.members)
    ? award.members.join(", ")
    : award.members;
  return `
    <article class="certificate-card">
      <span class="award-rank">${escapeHtml(award.awardName)}</span>
      <h3>${escapeHtml(award.eventName)}</h3>
      <dl>
        <div>
          <dt>기관</dt>
          <dd>${escapeHtml(award.institution)}</dd>
        </div>
        <div>
          <dt>기수</dt>
          <dd>${escapeHtml(award.generation)}</dd>
        </div>
        <div>
          <dt>참여자</dt>
          <dd>${escapeHtml(members)}</dd>
        </div>
      </dl>
    </article>
  `;
}

function renderAwardRow(award) {
  const members = Array.isArray(award.members)
    ? award.members.join(", ")
    : award.members;
  return `
    <tr>
      <td>${escapeHtml(award.year)}</td>
      <td>${escapeHtml(award.eventName)}</td>
      <td>${escapeHtml(award.awardName)}</td>
      <td>${escapeHtml(award.institution)}</td>
      <td>${escapeHtml(award.generation)}</td>
      <td>${escapeHtml(members)}</td>
    </tr>
  `;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value = "") {
  return escapeHtml(value);
}
