/* =========================================================
   KALKRITI INTERIORS - COMPLETE MAIN JS (FIXED)
========================================================= */

console.log("SCRIPT LOADED");

document.addEventListener("DOMContentLoaded", function () {

  /* =========================================================
     HERO SLIDER
  ========================================================= */

  const heroSlides = document.querySelectorAll(".slide");
  let heroIndex = 0;

  if (heroSlides.length > 0) {
    setInterval(() => {
      heroSlides[heroIndex].classList.remove("active");
      heroIndex = (heroIndex + 1) % heroSlides.length;
      heroSlides[heroIndex].classList.add("active");
    }, 4000);
  }


  /* =========================================================
     CUSTOMIZER IMAGE SLIDER
  ========================================================= */

  const preview = document.getElementById("preview");
  const selectedCircle = document.getElementById("selectedColor");

  const slides = [
    "/static/assets/images/white.avif",
    "/static/assets/images/img1.jpeg",
    "/static/assets/images/m1.jpg",
    "/static/assets/images/img7.jpg"
  ];

  let currentSlide = 0;
  let sliderInterval;
  let userInteracted = false;
  let resumeTimeout;

  function changeImage(src) {
    if (!preview) return;

    preview.style.opacity = "0.5";
    preview.style.transform = "scale(1.05)";

    setTimeout(() => {
      preview.src = src;
      preview.style.opacity = "1";
      preview.style.transform = "scale(1)";
    }, 250);
  }

  function startSlider() {
    sliderInterval = setInterval(() => {
      if (!userInteracted && preview) {
        currentSlide = (currentSlide + 1) % slides.length;
        changeImage(slides[currentSlide]);
      }
    }, 3000);
  }

  function stopSlider() {
    clearInterval(sliderInterval);
  }

  function resetAutoPlay() {
    userInteracted = true;
    stopSlider();
    clearTimeout(resumeTimeout);

    resumeTimeout = setTimeout(() => {
      userInteracted = false;
      startSlider();
    }, 4000);
  }

  if (preview) {
    startSlider();

    preview.onerror = function () {
      preview.src = "/static/assets/images/modernimg.jpg";
    };
  }


  /* =========================================================
     OPTION BUTTONS
  ========================================================= */

  document.querySelectorAll(".opt").forEach(btn => {
    btn.addEventListener("click", function () {
      const group = this.parentElement;

      group.querySelectorAll(".opt").forEach(b =>
        b.classList.remove("active")
      );

      this.classList.add("active");

      const newImg = this.getAttribute("data-img");
      if (newImg) {
        changeImage(newImg);
        resetAutoPlay();
      }
    });
  });


  /* =========================================================
     COLOR BUTTONS
  ========================================================= */

  document.querySelectorAll(".color").forEach(c => {
    c.addEventListener("click", function () {

      document.querySelectorAll(".color").forEach(x =>
        x.classList.remove("active")
      );

      this.classList.add("active");

      const color = this.getAttribute("data-color");

      if (selectedCircle) {
        selectedCircle.style.background = color;
      }

      if (preview) {
        preview.style.border = `4px solid ${color}`;
      }

      resetAutoPlay();
    });
  });


  /* =========================================================
     BEFORE AFTER SLIDER
  ========================================================= */

  const slider = document.querySelector(".slider");
  const beforeWrapper = document.querySelector(".img-before-wrapper");
  const container = document.querySelector(".ba-wrapper");

  if (slider && beforeWrapper && container) {

    let isDragging = false;

    slider.addEventListener("mousedown", () => isDragging = true);
    window.addEventListener("mouseup", () => isDragging = false);

    window.addEventListener("mousemove", (e) => {
      if (!isDragging) return;

      let rect = container.getBoundingClientRect();
      let x = e.clientX - rect.left;

      x = Math.max(0, Math.min(x, rect.width));

      beforeWrapper.style.width = x + "px";
      slider.style.left = x + "px";
    });
  }


  /* =========================================================
     NAVBAR MOBILE TOGGLE
  ========================================================= */

  const menuToggle = document.getElementById("menuToggle");
  const navWrapper = document.getElementById("navWrapper");

  if (menuToggle && navWrapper) {
    menuToggle.addEventListener("click", () => {
      navWrapper.classList.toggle("active");
    });
  }


  /* =========================================================
     WHATSAPP BUTTON
  ========================================================= */

  window.openWhatsApp = function () {
    const phone = "917888283629";
    const msg = "Hi, I want to design my kitchen. Please assist me.";

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };


  /* =========================================================
     POPUP FORM SYSTEM
========================================================= */

  const popupOverlay = document.getElementById("popupOverlay");
  const popupClose = document.getElementById("popupClose");
  const popupForm = document.getElementById("popupForm");
  const openBtns = document.querySelectorAll(".open-popup");

  let popupShown = false;

  function openPopup() {
    if (!popupOverlay) return;
    popupOverlay.style.display = "flex";
    popupOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closePopup() {
    if (!popupOverlay) return;
    popupOverlay.classList.remove("active");
    popupOverlay.style.display = "none";
    document.body.style.overflow = "auto";
  }

  openBtns.forEach(btn => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      openPopup();
    });
  });

  if (popupClose) {
    popupClose.addEventListener("click", closePopup);
  }

  if (popupOverlay) {
    popupOverlay.addEventListener("click", function (e) {
      if (e.target === popupOverlay) closePopup();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closePopup();
  });

  window.addEventListener("scroll", function () {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (window.scrollY / scrollHeight) * 100;

    if (scrollPercent > 20 && !popupShown) {
      popupShown = true;
      setTimeout(openPopup, 500);
    }
  });


  /* =========================================================
     FORM SUBMIT (FIXED + CUSTOM ALERT)
========================================================= */

  if (popupForm) {
    popupForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const submitBtn = popupForm.querySelector("button");
      const originalText = submitBtn.innerHTML;

      submitBtn.innerHTML = "Processing...";
      submitBtn.disabled = true;

      const payload = {
        name: document.getElementById("popupName")?.value || "",
        email: document.getElementById("popupEmail")?.value || "",
        phone: document.getElementById("popupPhone")?.value || "",
        city: document.getElementById("popupCity")?.value || "",
        kitchenType: document.getElementById("kitchenType")?.value || "",
        budget: document.getElementById("budget")?.value || "",
        duration: document.getElementById("duration")?.value || ""
      };

      fetch("/submit-popup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })
        .then(res => res.json())
        .then(() => {

          popupForm.reset();
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;

          closePopup();

          showSuccessAlert(
            "Thank you for your enquiry. Our team will contact you soon."
          );
        })
        .catch(() => {

          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;

          showSuccessAlert("Something went wrong. Please try again.");
        });
    });
  }


  /* =========================================================
     CUSTOM SUCCESS ALERT (FIXED)
========================================================= */

  function showSuccessAlert(message) {

    const old = document.querySelector(".custom-success-alert");
    if (old) old.remove();

    const alertBox = document.createElement("div");
    alertBox.className = "custom-success-alert";

    alertBox.innerHTML = `
      <div class="success-alert-box">
        <div class="success-icon">✔</div>
        <h3>Enquiry Submitted</h3>
        <p>${message}</p>
        <button class="success-alert-btn">Okay</button>
      </div>
    `;

    document.body.appendChild(alertBox);

    setTimeout(() => alertBox.classList.add("active"), 50);

    alertBox.querySelector(".success-alert-btn")
      .addEventListener("click", () => {
        alertBox.classList.remove("active");
        setTimeout(() => alertBox.remove(), 300);
      });
  }

});
/* =========================================================
   CONTACT FORM BACKEND SUBMIT
========================================================= */

const kalkritForm =
document.getElementById("kalkritForm");

if (kalkritForm) {

  kalkritForm.addEventListener("submit", function (e) {

    e.preventDefault();

    const submitBtn =
    kalkritForm.querySelector(".submit-btn");

    const originalText =
    submitBtn.innerHTML;

    submitBtn.innerHTML = "Sending...";
    submitBtn.disabled = true;

    const payload = {

      name:
      document.getElementById("name")?.value || "",

      phone:
      document.getElementById("phone")?.value || "",

      email:
      document.getElementById("email")?.value || "",

      city:
      document.getElementById("city")?.value || "",

      budget:
      document.getElementById("budget")?.value || "",

      type:
      document.getElementById("type")?.value || "",

      message:
      document.getElementById("message")?.value || ""

    };

    fetch("/submit-contact", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify(payload)

    })

    .then(res => res.json())

    .then(data => {

      kalkritForm.reset();

      submitBtn.innerHTML =
      originalText;

      submitBtn.disabled = false;

      showSuccessAlert(
        "Thank you for contacting Kalkriti Interiors. Our team will contact you soon."
      );

    })

    .catch(error => {

      console.log(error);

      submitBtn.innerHTML =
      originalText;

      submitBtn.disabled = false;

      showSuccessAlert(
        "Something went wrong. Please try again."
      );

    });

  });

}