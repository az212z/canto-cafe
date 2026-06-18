/* ===========================================================
   CANTO — main.js (vanilla, no dependencies)
   =========================================================== */
(function () {
  "use strict";

  /* ---------- Preloader: always hide (load + hard fallback) ---------- */
  var preloader = document.getElementById("preloader");
  function hidePreloader() {
    if (!preloader) return;
    preloader.classList.add("hidden");
    setTimeout(function () {
      if (preloader) preloader.style.display = "none";
    }, 650);
  }
  window.addEventListener("load", hidePreloader);
  // hard fallback even if 'load' never fires
  setTimeout(hidePreloader, 1200);

  /* ---------- Sticky header shrink ---------- */
  var header = document.getElementById("header");
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 30) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var burger = document.getElementById("burger");
  var mobileMenu = document.getElementById("mobileMenu");
  function closeMenu() {
    if (burger) { burger.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }
    if (mobileMenu) mobileMenu.classList.remove("open");
    document.body.style.overflow = "";
  }
  if (burger && mobileMenu) {
    burger.addEventListener("click", function () {
      var open = mobileMenu.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    mobileMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
  }

  /* ---------- Scroll reveal (IntersectionObserver + fallback) ---------- */
  var reveals = document.querySelectorAll(".reveal");
  function revealAll() {
    reveals.forEach(function (el) { el.classList.add("visible"); });
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
    // safety: if anything is still hidden after 2.2s, reveal it
    setTimeout(revealAll, 2200);
  } else {
    revealAll();
  }

  /* ---------- Lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbClose = document.getElementById("lbClose");
  function openLightbox(src, alt) {
    if (!lightbox || !lbImg) return;
    lbImg.src = src; lbImg.alt = alt || "";
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
  }
  document.querySelectorAll(".g-item img").forEach(function (img) {
    img.parentElement.addEventListener("click", function () {
      openLightbox(img.src, img.alt);
    });
  });
  if (lbClose) lbClose.addEventListener("click", closeLightbox);
  if (lightbox) lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeLightbox(); closeMenu(); }
  });

  /* ---------- Toast ---------- */
  var toast = document.getElementById("toast");
  var toastMsg = document.getElementById("toastMsg");
  var toastTimer;
  function showToast(msg) {
    if (!toast) return;
    if (toastMsg && msg) toastMsg.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 4000);
  }

  /* ---------- Order form: save to localStorage + toast ---------- */
  /* NOTE: 920001555 is a unified 920 line with NO WhatsApp.
     The form intentionally does NOT build a wa.me link.
     It stores the order locally (demo) and prompts the user to call. */
  var form = document.getElementById("orderForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = (document.getElementById("name") || {}).value || "";
      var phone = (document.getElementById("phone") || {}).value || "";
      var drink = (document.getElementById("drink") || {}).value || "";
      var notes = (document.getElementById("notes") || {}).value || "";

      if (!name.trim() || !phone.trim() || !drink) {
        showToast("الرجاء تعبئة الاسم والجوال واختيار الطلب");
        return;
      }

      var order = {
        name: name.trim(),
        phone: phone.trim(),
        drink: drink,
        notes: notes.trim(),
        at: new Date().toISOString()
      };
      try {
        var list = JSON.parse(localStorage.getItem("canto_orders") || "[]");
        list.push(order);
        localStorage.setItem("canto_orders", JSON.stringify(list));
      } catch (err) { /* storage may be blocked; fail silently */ }

      form.reset();
      showToast("تم حفظ طلبك ✓ اتصل بنا على 920001555 لتأكيده");
    });
  }
})();
