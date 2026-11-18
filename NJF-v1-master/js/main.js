const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");

if (menuButton && navigation) {
  const closeMenu = () => {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation menu");
    navigation.classList.remove("is-open");
  };

  menuButton.addEventListener("click", () => {
    const isExpanded = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isExpanded));
    menuButton.setAttribute("aria-label", isExpanded ? "Open navigation menu" : "Close navigation menu");
    navigation.classList.toggle("is-open", !isExpanded);
  });

  navigation.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) {
      window.setTimeout(closeMenu, 0);
    }
  });

  document.addEventListener("click", (event) => {
    if (
      menuButton.getAttribute("aria-expanded") === "true" &&
      event.target instanceof Node &&
      !navigation.contains(event.target) &&
      !menuButton.contains(event.target)
    ) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
      closeMenu();
      menuButton.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1020) {
      closeMenu();
    }
  });
}

const yearElement = document.querySelector("#current-year");
if (yearElement) {
  yearElement.textContent = String(new Date().getFullYear());
}

// Photo + video frame slideshow
// Images stay for data-interval ms. Videos play once and the slideshow advances when they end.
// Playback pauses on hover and while the frame is off-screen.
const slideshows = document.querySelectorAll("[data-slideshow]");

slideshows.forEach((slideshow) => {
  const slides = Array.from(slideshow.querySelectorAll(".frame-slide"));
  if (slides.length <= 1) return;

  const imageDelay = Number(slideshow.dataset.interval) || 3000;
  const videoFallback = 20000; // safety net if a video never fires "ended"

  let index = 0;
  let timer = null;
  let hovered = false;
  let inView = !("IntersectionObserver" in window);

  const isVideo = (slide) => slide.tagName === "VIDEO";

  const schedule = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(next, isVideo(slides[index]) ? videoFallback : imageDelay);
  };

  const sync = () => {
    const current = slides[index];
    window.clearTimeout(timer);
    if (hovered || !inView) {
      if (isVideo(current)) current.pause();
      return;
    }
    if (isVideo(current)) current.play().catch(() => {});
    schedule();
  };

  const show = (nextIndex) => {
    index = nextIndex;
    slides.forEach((slide, i) => {
      const active = i === index;
      slide.classList.toggle("is-active", active);
      if (isVideo(slide) && !active) {
        slide.pause();
      } else if (isVideo(slide) && active) {
        slide.currentTime = 0;
      }
    });
    sync();
  };

  function next() {
    show((index + 1) % slides.length);
  }

  slides.filter(isVideo).forEach((video) => {
    video.addEventListener("ended", () => {
      if (slides[index] === video && !hovered && inView) next();
    });
  });

  slideshow.addEventListener("mouseenter", () => { hovered = true; sync(); });
  slideshow.addEventListener("mouseleave", () => { hovered = false; sync(); });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      inView = entries[0].isIntersecting;
      sync();
    }, { threshold: 0.35 }).observe(slideshow);
  }

  show(0);
});
