// === STATE MANAGEMENT ===
let state = {
  rotX: 0,
  rotY: 0,
  scale: 1.0,
  posX: 0,
  posZ: 0,
};

const sensitivityRotate = 0.5;
const stepPos = 0.2;
const stepZoom = 0.15;
const minScale = 0.1;
const maxScale = 5.0;

let markerFound = false;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

let modelContainer = null;
let model = null;

const propertyData = {
  livingroom: {
    title: "Ruang Tamu",
    desc: "Ruang tamu luas dengan pencahayaan alami—cocok untuk bersosialisasi dan menerima tamu. Finishing modern dan lantai keramik premium.",
  },
  kitchen: {
    title: "Dapur Terbuka",
    desc: "Dapur konsep terbuka, dilengkapi area kerja ergonomis dan koneksi ke ruang makan. Ideal untuk keluarga modern.",
  },
  exterior: {
    title: "Area Luar",
    desc: "Halaman depan dan belakang menyediakan ruang hijau dan potensi perluasan. Keamanan dan akses kendaraan mudah.",
  },
};

// === CORE FUNCTIONS ===
function startAR() {
  document.getElementById("dashboard").style.display = "none";
  // Menampilkan UI AR Layer
  document.querySelector(".ar-header").style.display = "flex";
  document.querySelector(".control-panel").style.display = "flex";

  // Menampilkan Loading
  document.getElementById("loading").style.display = "flex";

  setTimeout(() => {
    document.getElementById("loading").style.display = "none";
    modelContainer = document.querySelector("#model-container");
    model = document.querySelector("#house-model");
    initAR();
  }, 2000);
}

function initAR() {
  const marker = document.querySelector("#marker-hiro");
  const statusText = document.getElementById("status-text");

  marker.addEventListener("markerFound", () => {
    markerFound = true;
    statusText.textContent = "Marker Terdeteksi";
    statusText.style.color = "#27ae60"; // Hijau
    statusText.style.background = "rgba(255,255,255,0.9)";
  });

  marker.addEventListener("markerLost", () => {
    markerFound = false;
    statusText.textContent = "Cari Marker...";
    statusText.style.color = "#8a3324"; // Merah Bata
  });

  setupInteractions();
  setupButtons();
}

// === INTERACTION LOGIC ===
function setupInteractions() {
  const hotspots = document.querySelectorAll(".clickable");
  hotspots.forEach((spot) => {
    spot.addEventListener("click", (e) => {
      e.stopPropagation(); // Mencegah klik tembus ke scene
      const key = spot.getAttribute("data-part");
      const data = propertyData[key];
      if (data) showPopup(data);
    });
  });

  // Mouse Events untuk Rotasi
  window.addEventListener("mousedown", (e) => {
    if (
      e.target.closest(".control-panel") ||
      e.target.closest(".popup-content") ||
      e.target.closest(".btn-back")
    )
      return;
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  });

  window.addEventListener("mouseup", () => (isDragging = false));

  window.addEventListener("mousemove", (e) => {
    if (!isDragging || !markerFound) return;
    state.rotY += (e.clientX - lastMouseX) * sensitivityRotate;
    state.rotX += (e.clientY - lastMouseY) * sensitivityRotate;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    updateModel();
  });

  // Touch Events untuk Mobile
  window.addEventListener("touchstart", (e) => {
    if (
      e.target.closest(".control-panel") ||
      e.target.closest(".popup-content") ||
      e.target.closest(".btn-back")
    )
      return;
    if (e.touches.length === 1) {
      isDragging = true;
      lastMouseX = e.touches[0].clientX;
      lastMouseY = e.touches[0].clientY;
    }
  });

  window.addEventListener("touchmove", (e) => {
    if (!markerFound || !isDragging || e.touches.length !== 1) return;
    state.rotY += (e.touches[0].clientX - lastMouseX) * sensitivityRotate;
    state.rotX += (e.touches[0].clientY - lastMouseY) * sensitivityRotate;
    lastMouseX = e.touches[0].clientX;
    lastMouseY = e.touches[0].clientY;
    updateModel();
  });
}

function updateModel() {
  if (!modelContainer || !model) return;
  modelContainer.setAttribute("position", `${state.posX} 0 ${state.posZ}`);
  modelContainer.setAttribute(
    "rotation",
    `${-90 + state.rotX} ${state.rotY} 0`
  );
  model.setAttribute("scale", `${state.scale} ${state.scale} ${state.scale}`);

  // Refresh raycaster agar area klik tetap akurat
  const sceneEl = document.querySelector("a-scene");
  if (sceneEl && sceneEl.systems.raycaster) {
    sceneEl.systems.raycaster.refreshObjects();
  }
}

// === UI FUNCTIONS ===
function showPopup(data) {
  document.getElementById("popup-title").textContent = data.title;
  document.getElementById("popup-desc").textContent = data.desc;
  document.getElementById("info-popup").style.display = "flex";
  const contactBtn = document.getElementById("contact-btn");
  if (contactBtn) {
    contactBtn.onclick = () => {
      const subject = encodeURIComponent("Ketertarikan pada properti: " + data.title);
      window.location.href = `mailto:info@agenproperti.example?subject=${subject}`;
    };
  }
}

function closePopup() {
  document.getElementById("info-popup").style.display = "none";
}

function setupButtons() {
  document.getElementById("btn-up").onclick = () => {
    state.posZ -= stepPos;
    updateModel();
  };
  document.getElementById("btn-down").onclick = () => {
    state.posZ += stepPos;
    updateModel();
  };
  document.getElementById("btn-left").onclick = () => {
    state.posX -= stepPos;
    updateModel();
  };
  document.getElementById("btn-right").onclick = () => {
    state.posX += stepPos;
    updateModel();
  };

  document.getElementById("btn-zoom-in").onclick = () => {
    state.scale = Math.min(state.scale + stepZoom, maxScale);
    updateModel();
  };

  document.getElementById("btn-zoom-out").onclick = () => {
    state.scale = Math.max(state.scale - stepZoom, minScale);
    updateModel();
  };

  document.getElementById("btn-reset").onclick = () => {
    state = { rotX: 0, rotY: 0, scale: 1.0, posX: 0, posZ: 0 };
    updateModel();
  };
}

function backToDashboard() {
  location.reload();
}
