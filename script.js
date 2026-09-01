// =========================
// DOM
// =========================

const openingScreen = document.getElementById("openingScreen");
const enterButton = document.getElementById("enterButton");

const memoryModal = document.getElementById("memoryModal");
const memoryBackdrop = document.getElementById("memoryBackdrop");
const memoryClose = document.getElementById("memoryClose");
const memoryContent = document.getElementById("memoryContent");

const memoryCount = document.getElementById("memoryCount");
const memoryTotal = document.getElementById("memoryTotal");

const musicButton = document.getElementById("musicButton");
const backgroundMusic = document.getElementById("backgroundMusic");


// =========================
// BASIC CONFIG
// =========================

const relationshipStart = new Date("2025-06-08T00:00:00+07:00");

// gacha tidak dihitung sebagai collectible utama
const collectibleMemories = [
  "vino",
  "tumbler",
  "keychain",
  "gacoan",
  "snacks",
  "cat",
  "photobox",
  "window",
  "mailbox"
];

memoryTotal.textContent = collectibleMemories.length;


// =========================
// SESSION PROGRESS
// =========================

let foundMemories = new Set(
  JSON.parse(sessionStorage.getItem("foundMemories") || "[]")
);

function saveProgress() {
  sessionStorage.setItem(
    "foundMemories",
    JSON.stringify([...foundMemories])
  );
}

function updateProgress() {
  memoryCount.textContent = foundMemories.size;

  if (foundMemories.size >= collectibleMemories.length) {
    document.body.classList.add("all-found");
  }
}


// =========================
// OPENING
// =========================

enterButton.addEventListener("click", () => {
  openingScreen.classList.add("is-hidden");

  // browser biasanya butuh user interaction
  // sebelum audio boleh dimainkan
  if (
    backgroundMusic &&
    backgroundMusic.querySelector("source")
  ) {
    backgroundMusic
      .play()
      .then(() => {
        musicButton.classList.add("is-playing");
        musicButton.textContent = "♫";
      })
      .catch(() => {
        // audio belum diisi atau browser masih block
      });
  }
});


// =========================
// MEMORY MODAL
// =========================

function openMemory(memoryName) {
  const template = document.getElementById(
    `memory-${memoryName}`
  );

  if (!template) {
    console.warn(
      `Template memory "${memoryName}" tidak ditemukan`
    );

    return;
  }

  memoryContent.innerHTML = "";
  memoryContent.appendChild(
    template.content.cloneNode(true)
  );

  memoryModal.classList.add("is-open");
  memoryModal.setAttribute("aria-hidden", "false");

  document.body.classList.add("modal-open");

  if (collectibleMemories.includes(memoryName)) {
    foundMemories.add(memoryName);

    saveProgress();
    updateProgress();
  }

  initDynamicMemory(memoryName);
}

function closeMemory() {
  memoryModal.classList.remove("is-open");
  memoryModal.setAttribute("aria-hidden", "true");

  document.body.classList.remove("modal-open");

  stopModalMedia();
}

function stopModalMedia() {
  const videos = memoryContent.querySelectorAll("video");

  videos.forEach((video) => {
    video.pause();
  });
}


// =========================
// WORLD OBJECT EVENTS
// =========================

document
  .querySelectorAll(".world-object")
  .forEach((object) => {
    object.addEventListener("click", () => {
      const memoryName =
        object.dataset.memory;

      if (!memoryName) return;

      openMemory(memoryName);
    });
  });


// =========================
// CLOSE MODAL
// =========================

memoryClose.addEventListener(
  "click",
  closeMemory
);

memoryBackdrop.addEventListener(
  "click",
  closeMemory
);

document.addEventListener(
  "keydown",
  (event) => {
    if (
      event.key === "Escape" &&
      memoryModal.classList.contains("is-open")
    ) {
      closeMemory();
    }
  }
);


// =========================
// DYNAMIC MEMORY CONTENT
// =========================

function initDynamicMemory(memoryName) {
  if (memoryName === "cat") {
    initCatMemory();
  }

  if (memoryName === "gacha") {
    initGacha();
  }

  if (memoryName === "photobox") {
    const video =
      memoryContent.querySelector("video");

    if (video) {
      video.play().catch(() => {});
    }
  }
}


// =========================
// CAT
// =========================

function initCatMemory() {
  const petCatButton =
    document.getElementById("petCatButton");

  const catText =
    document.getElementById("catText");

  if (!petCatButton || !catText) return;

  const catLines = [
    "you would've stopped walking anyway.",
    "pspspspsps.",
    "okay dia udah liat kamu.",
    "dia kayaknya mulai curiga.",
    "stop bothering the cat.",
    "serius masih dipencet?",
    "yaudah dia punya kamu sekarang."
  ];

  let catClickCount = 0;

  petCatButton.addEventListener(
    "click",
    () => {
      catClickCount++;

      const index = Math.min(
        catClickCount,
        catLines.length - 1
      );

      catText.textContent =
        catLines[index];

      petCatButton.animate(
        [
          { transform: "scale(1)" },
          { transform: "scale(0.92)" },
          { transform: "scale(1)" }
        ],
        {
          duration: 220,
          easing: "ease-out"
        }
      );
    }
  );
}


// =========================
// GACHA
// =========================

const gachaPool = [
  {
    type: "photo",
    src: "assets/photos/us/us-heart-filter-01.webp",
    title: "you got a memory.",
    caption: "this one survived somehow."
  },

  {
    type: "photo",
    src: "assets/photos/us/us-jeep-trip-01.webp",
    title: "★ rare memory",
    caption: "okay this one is actually cute."
  },

  {
    type: "photo",
    src: "assets/photos/us/us-outdoor-selfie-01.webp",
    title: "you got a memory.",
    caption: "random, but kept."
  },

  {
    type: "photo",
    src: "assets/photos/random/us-closeup-random-01.webp",
    title: "unfortunately...",
    caption: "this one survived."
  },

  {
    type: "photo",
    src: "assets/photos/random/her-random-closeup-01.webp",
    title: "★ questionable pull",
    caption: "i'm keeping this here."
  },

  {
    type: "video",
    src: "assets/videos/us/us-video-01.mp4",
    title: "motion picture evidence",
    caption: "this happened btw."
  },

  {
    type: "video",
    src: "assets/videos/us/us-video-02.mp4",
    title: "★ rare video",
    caption: "found this in the archive."
  },

  {
    type: "video",
    src: "assets/videos/us/us-video-03.mp4",
    title: "you got a video.",
    caption: "don't ask why i kept this."
  }
];

function initGacha() {
  const gachaPullButton =
    document.getElementById("gachaPullButton");

  const gachaResult =
    document.getElementById("gachaResult");

  if (!gachaPullButton || !gachaResult) {
    return;
  }

  let pulling = false;

  gachaPullButton.addEventListener(
    "click",
    () => {
      if (pulling) return;

      pulling = true;

      gachaPullButton.disabled = true;
      gachaPullButton.textContent =
        "pulling...";

      gachaResult.innerHTML = `
        <p class="gacha-loading">
          ...
        </p>
      `;

      const machine =
        memoryContent.querySelector(
          ".memory-object-image"
        );

      if (machine) {
        machine.animate(
          [
            {
              transform:
                "translateX(0) rotate(0)"
            },
            {
              transform:
                "translateX(-5px) rotate(-2deg)"
            },
            {
              transform:
                "translateX(5px) rotate(2deg)"
            },
            {
              transform:
                "translateX(-4px) rotate(-1deg)"
            },
            {
              transform:
                "translateX(0) rotate(0)"
            }
          ],
          {
            duration: 550,
            easing: "ease-in-out"
          }
        );
      }

      setTimeout(() => {
        const result =
          gachaPool[
            Math.floor(
              Math.random() *
                gachaPool.length
            )
          ];

        renderGachaResult(result);

        gachaPullButton.disabled = false;
        gachaPullButton.textContent =
          "pull again";

        pulling = false;
      }, 700);
    }
  );
}

function renderGachaResult(result) {
  const gachaResult =
    document.getElementById("gachaResult");

  if (!gachaResult) return;

  let media = "";

  if (result.type === "photo") {
    media = `
      <img
        src="${result.src}"
        alt=""
        loading="lazy"
      >
    `;
  }

  if (result.type === "video") {
    media = `
      <video
        src="${result.src}"
        autoplay
        muted
        loop
        playsinline
        controls
      ></video>
    `;
  }

  gachaResult.innerHTML = `
    <div class="gacha-card">
      <p class="memory-label">
        ${result.title}
      </p>

      ${media}

      <p>
        ${result.caption}
      </p>
    </div>
  `;
}


// =========================
// RELATIONSHIP LIVE TIMER
// =========================

function updateRelationshipTimer() {
  const now = new Date();

  const difference =
    now.getTime() -
    relationshipStart.getTime();

  if (difference < 0) return;

  const totalSeconds =
    Math.floor(difference / 1000);

  const days = Math.floor(
    totalSeconds / 86400
  );

  const hours = Math.floor(
    (totalSeconds % 86400) / 3600
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );

  const seconds =
    totalSeconds % 60;

  document.getElementById(
    "days"
  ).textContent = days;

  document.getElementById(
    "hours"
  ).textContent = String(
    hours
  ).padStart(2, "0");

  document.getElementById(
    "minutes"
  ).textContent = String(
    minutes
  ).padStart(2, "0");

  document.getElementById(
    "seconds"
  ).textContent = String(
    seconds
  ).padStart(2, "0");
}

updateRelationshipTimer();

setInterval(
  updateRelationshipTimer,
  1000
);


// =========================
// MUSIC
// =========================

let musicEnabled = false;

musicButton.addEventListener(
  "click",
  async () => {
    if (
      !backgroundMusic ||
      !backgroundMusic.querySelector("source")
    ) {
      console.log(
        "Background music belum diisi."
      );

      return;
    }

    if (backgroundMusic.paused) {
      try {
        await backgroundMusic.play();

        musicEnabled = true;

        musicButton.classList.add(
          "is-playing"
        );

        musicButton.textContent = "♫";
      } catch (error) {
        console.warn(
          "Audio gagal dimainkan:",
          error
        );
      }
    } else {
      backgroundMusic.pause();

      musicEnabled = false;

      musicButton.classList.remove(
        "is-playing"
      );

      musicButton.textContent = "♪";
    }
  }
);


// =========================
// INITIAL STATE
// =========================

updateProgress();
