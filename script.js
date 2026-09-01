// ========================================
// BASIC DOM
// ========================================

const openingScreen = document.getElementById("openingScreen");
const enterButton = document.getElementById("enterButton");

const mainProgress = document.getElementById("mainProgress");
const mainTotal = document.getElementById("mainTotal");
const hudMainProgress = document.getElementById("hudMainProgress");
const bonusProgress = document.getElementById("bonusProgress");

const mailboxObject = document.getElementById("mailboxObject");
const mailboxLock = document.getElementById("mailboxLock");

const postGame = document.getElementById("postGame");

const gameToast = document.getElementById("gameToast");
const toastLabel = document.getElementById("toastLabel");
const toastText = document.getElementById("toastText");

const missionComplete = document.getElementById("missionComplete");
const missionCompleteButton = document.getElementById("missionCompleteButton");

const musicButton = document.getElementById("musicButton");
const backgroundMusic = document.getElementById("backgroundMusic");


// ========================================
// GAME CONFIG
// ========================================

const requiredItems = [
  "vino",
  "tumbler",
  "keychain",
  "gacoan",
  "snacks",
  "cat",
  "photobox",
  "window"
];

mainTotal.textContent = requiredItems.length;

let foundItems = new Set();
let bonusGachaComplete = false;
let missionCompleteShown = false;
let mailboxUnlocked = false;
let gameFinished = false;


// ========================================
// ITEM DATA
// ========================================

const itemData = {
  vino: {
    type: "ITEM FOUND",
    title: "si meru",
    text:
      "alias merah rudet wkwk\n\n" +
      "somehow bahkan motor ini jadi salah satu hal " +
      "yang langsung bikin aku keinget kamu.",
    image: "assets/objects/2.png"
  },

  tumbler: {
    type: "ITEM FOUND",
    title: "that tumbler.",
    text:
      "i don't know why,\n" +
      "but this color combination is so you.",
    image: "assets/objects/3.png"
  },

  keychain: {
    type: "ITEM FOUND",
    title: "the pair.",
    text:
      "you got the white one.\n" +
      "i got the brown one.\n\n" +
      "somehow it only makes sense together.",
    image: "assets/objects/4.png"
  },

  gacoan: {
    type: "ITEM FOUND",
    title: "of course this is here.",
    text:
      "mie gacoan.\n" +
      "no further explanation needed.",
    image: "assets/objects/5.png"
  },

  snacks: {
    type: "ITEM FOUND",
    title: "emergency supplies",
    text:
      "ciki, pilus, keripik, taro,\n" +
      "dan apapun yang keliatannya asin.",
    image: "assets/objects/10.png"
  },

  cat: {
    type: "ITEM FOUND",
    title: "cat.",
    text:
      "you would've stopped walking anyway.",
    image: "assets/objects/8.png"
  }
};


// ========================================
// OPENING
// ========================================

enterButton.addEventListener("click", () => {
  openingScreen.classList.add("is-hidden");

  showToast(
    "MISSION START",
    "find all the little things."
  );

  setTimeout(() => {
    showToast(
      "BONUS QUEST",
      "there's a gacha machine somewhere."
    );
  }, 1600);

  tryStartMusic();
});


// ========================================
// PROGRESS
// ========================================

function updateProgress() {
  const foundCount = foundItems.size;

  mainProgress.textContent = foundCount;
  hudMainProgress.textContent =
    `${foundCount} / ${requiredItems.length}`;

  bonusProgress.textContent =
    bonusGachaComplete ? "1 / 1" : "0 / 1";

  if (
    foundCount >= requiredItems.length &&
    !mailboxUnlocked
  ) {
    unlockMailbox();
  }
}


// ========================================
// WORLD OBJECTS
// ========================================

document
  .querySelectorAll(".world-object")
  .forEach((object) => {
    object.addEventListener("click", () => {
      const item = object.dataset.item;

      if (!item) return;

      if (item === "gacha") {
        openGacha();
        return;
      }

      if (item === "photobox") {
        discoverItem("photobox", object);
        openPhotobox();
        return;
      }

      if (item === "window") {
        discoverItem("window", object);
        openOutdoor();
        return;
      }

      if (item === "mailbox") {
        handleMailboxClick();
        return;
      }

      discoverItem(item, object);
      openItemDialog(item);
    });
  });


// ========================================
// DISCOVER ITEM
// ========================================

function discoverItem(item, objectElement) {
  if (!requiredItems.includes(item)) return;

  const isNew = !foundItems.has(item);

  if (isNew) {
    foundItems.add(item);

    if (objectElement) {
      objectElement.classList.add("is-found");
    }

    updateProgress();

    showToast(
      "MEMORY FOUND",
      `${foundItems.size} / ${requiredItems.length}`
    );
  }
}


// ========================================
// GENERIC ITEM DIALOG
// ========================================

const gameDialog = document.getElementById("gameDialog");
const dialogBackdrop = document.getElementById("dialogBackdrop");
const dialogClose = document.getElementById("dialogClose");
const dialogOkay = document.getElementById("dialogOkay");

const dialogType = document.getElementById("dialogType");
const dialogTitle = document.getElementById("dialogTitle");
const dialogMedia = document.getElementById("dialogMedia");
const dialogText = document.getElementById("dialogText");


function openItemDialog(item) {
  const data = itemData[item];

  if (!data) return;

  dialogType.textContent = data.type;
  dialogTitle.textContent = data.title;

  dialogMedia.innerHTML = `
    <img
      src="${data.image}"
      alt=""
      draggable="false"
    >
  `;

  dialogText.textContent = data.text;

  openOverlay(gameDialog);

  if (item === "cat") {
    enableCatInteraction();
  }
}


function closeItemDialog() {
  closeOverlay(gameDialog);
}


dialogClose.addEventListener("click", closeItemDialog);
dialogOkay.addEventListener("click", closeItemDialog);
dialogBackdrop.addEventListener("click", closeItemDialog);


// ========================================
// CAT INTERACTION
// ========================================

function enableCatInteraction() {
  const catLines = [
    "you would've stopped walking anyway.",
    "pspspspsps.",
    "okay dia udah liat kamu.",
    "dia mulai curiga.",
    "stop bothering the cat.",
    "serius masih dipencet?",
    "yaudah sekarang dia punya kamu."
  ];

  let clickCount = 0;

  dialogMedia.style.cursor = "pointer";

  const catImage = dialogMedia.querySelector("img");

  if (!catImage) return;

  catImage.addEventListener("click", () => {
    clickCount++;

    const lineIndex = Math.min(
      clickCount,
      catLines.length - 1
    );

    dialogText.textContent = catLines[lineIndex];

    catImage.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(.9) rotate(-3deg)" },
        { transform: "scale(1.05) rotate(2deg)" },
        { transform: "scale(1)" }
      ],
      {
        duration: 260,
        easing: "ease-out"
      }
    );
  });
}


// ========================================
// GACHA
// ========================================

const gachaScreen = document.getElementById("gachaScreen");
const gachaBackdrop = document.getElementById("gachaBackdrop");
const gachaClose = document.getElementById("gachaClose");

const gachaMachineImage = document.getElementById("gachaMachineImage");
const gachaStatus = document.getElementById("gachaStatus");
const gachaPullButton = document.getElementById("gachaPullButton");

const gachaResult = document.getElementById("gachaResult");
const gachaRarity = document.getElementById("gachaRarity");
const gachaResultMedia = document.getElementById("gachaResultMedia");
const gachaResultCaption = document.getElementById("gachaResultCaption");
const gachaPullAgain = document.getElementById("gachaPullAgain");
const gachaDone = document.getElementById("gachaDone");


const gachaPool = [
  {
    type: "photo",
    src: "assets/photos/us/us-heart-filter-01.webp",
    rarity: "COMMON MEMORY",
    caption: "this one survived somehow."
  },

  {
    type: "photo",
    src: "assets/photos/us/us-jeep-trip-01.webp",
    rarity: "★ RARE MEMORY ★",
    caption: "okay this one is actually cute."
  },

  {
    type: "photo",
    src: "assets/photos/us/us-outdoor-selfie-01.webp",
    rarity: "COMMON MEMORY",
    caption: "random, but kept."
  },

  {
    type: "photo",
    src: "assets/photos/random/us-closeup-random-01.webp",
    rarity: "QUESTIONABLE PULL",
    caption: "unfortunately, this one survived."
  },

  {
    type: "photo",
    src: "assets/photos/random/her-random-closeup-01.webp",
    rarity: "★ CHAOTIC RARE ★",
    caption: "i'm keeping this here."
  },

  {
    type: "photo",
    src: "assets/photos/memories/us-printed-photobox-01.webp",
    rarity: "ARCHIVE MEMORY",
    caption: "some things deserve to stay."
  },

  {
    type: "photo",
    src: "assets/photos/photobox/us-photobooth-grid-01.webp",
    rarity: "★ PHOTOBOX PULL ★",
    caption: "we really paid money to look like this."
  },

  {
    type: "photo",
    src: "assets/photos/photobox/us-photobox-bw-01.webp",
    rarity: "★ RARE PHOTOBOX ★",
    caption: "keeping this one."
  },

  {
    type: "video",
    src: "assets/videos/us/us-video-01.mp4",
    rarity: "MOTION MEMORY",
    caption: "this happened btw."
  },

  {
    type: "video",
    src: "assets/videos/us/us-video-02.mp4",
    rarity: "★ RARE VIDEO ★",
    caption: "found this in the archive."
  },

  {
    type: "video",
    src: "assets/videos/us/us-video-03.mp4",
    rarity: "MOTION MEMORY",
    caption: "don't ask why i kept this."
  }
];


let gachaBusy = false;


function openGacha() {
  gachaResult.classList.remove("is-visible");

  gachaStatus.textContent =
    bonusGachaComplete
      ? "pull another?"
      : "pull one.";

  gachaPullButton.style.display = "inline-block";

  openOverlay(gachaScreen);
}


function closeGacha() {
  stopVideosInside(gachaScreen);
  closeOverlay(gachaScreen);
}


function pullGacha() {
  if (gachaBusy) return;

  gachaBusy = true;

  gachaPullButton.disabled = true;
  gachaPullAgain.disabled = true;

  gachaStatus.textContent = "pulling...";

  gachaResult.classList.remove("is-visible");

  gachaMachineImage.animate(
    [
      { transform: "translateX(0) rotate(0)" },
      { transform: "translateX(-7px) rotate(-3deg)" },
      { transform: "translateX(7px) rotate(3deg)" },
      { transform: "translateX(-5px) rotate(-2deg)" },
      { transform: "translateX(5px) rotate(2deg)" },
      { transform: "translateX(0) rotate(0)" }
    ],
    {
      duration: 700,
      easing: "ease-in-out"
    }
  );

  setTimeout(() => {
    const result =
      gachaPool[
        Math.floor(Math.random() * gachaPool.length)
      ];

    renderGachaResult(result);

    if (!bonusGachaComplete) {
      bonusGachaComplete = true;

      bonusProgress.textContent = "1 / 1";

      showToast(
        "BONUS COMPLETE",
        "memory gacha discovered."
      );
    }

    gachaBusy = false;

    gachaPullButton.disabled = false;
    gachaPullAgain.disabled = false;

    gachaStatus.textContent = "you got something.";
  }, 850);
}


function renderGachaResult(result) {
  gachaRarity.textContent = result.rarity;
  gachaResultCaption.textContent = result.caption;

  if (result.type === "photo") {
    gachaResultMedia.innerHTML = `
      <img
        src="${result.src}"
        alt=""
      >
    `;
  }

  if (result.type === "video") {
    gachaResultMedia.innerHTML = `
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

  gachaResult.classList.add("is-visible");
}


gachaPullButton.addEventListener("click", pullGacha);
gachaPullAgain.addEventListener("click", pullGacha);

gachaDone.addEventListener("click", closeGacha);
gachaClose.addEventListener("click", closeGacha);
gachaBackdrop.addEventListener("click", closeGacha);


// ========================================
// PHOTOBOX
// ========================================

const photoboxScreen = document.getElementById("photoboxScreen");
const photoboxBackdrop = document.getElementById("photoboxBackdrop");
const photoboxClose = document.getElementById("photoboxClose");
const photoboxDone = document.getElementById("photoboxDone");
const photoboxVideo = document.getElementById("photoboxVideo");


function openPhotobox() {
  openOverlay(photoboxScreen);

  photoboxVideo
    ?.play()
    .catch(() => {});
}


function closePhotobox() {
  photoboxVideo?.pause();
  closeOverlay(photoboxScreen);
}


photoboxClose.addEventListener("click", closePhotobox);
photoboxDone.addEventListener("click", closePhotobox);
photoboxBackdrop.addEventListener("click", closePhotobox);


// ========================================
// OUTDOOR
// ========================================

const outdoorScreen = document.getElementById("outdoorScreen");
const outdoorBackdrop = document.getElementById("outdoorBackdrop");
const outdoorClose = document.getElementById("outdoorClose");
const outdoorDone = document.getElementById("outdoorDone");


function openOutdoor() {
  openOverlay(outdoorScreen);
}


function closeOutdoor() {
  closeOverlay(outdoorScreen);
}


outdoorClose.addEventListener("click", closeOutdoor);
outdoorDone.addEventListener("click", closeOutdoor);
outdoorBackdrop.addEventListener("click", closeOutdoor);


// ========================================
// MAILBOX
// ========================================

const mailboxScreen = document.getElementById("mailboxScreen");
const mailboxBackdrop = document.getElementById("mailboxBackdrop");
const openLetterButton = document.getElementById("openLetterButton");
const letterPanel = document.getElementById("letterPanel");
const finishGameButton = document.getElementById("finishGameButton");


function handleMailboxClick() {
  if (!mailboxUnlocked) {
    showToast(
      "LOCKED",
      "masih ada yang belum kamu temuin."
    );

    mailboxObject.animate(
      [
        { transform: "translateX(0)" },
        { transform: "translateX(-4px)" },
        { transform: "translateX(4px)" },
        { transform: "translateX(0)" }
      ],
      {
        duration: 280
      }
    );

    return;
  }

  openMailbox();
}


function openMailbox() {
  letterPanel.classList.remove("is-visible");
  openLetterButton.style.display = "inline-block";

  openOverlay(mailboxScreen);
}


openLetterButton.addEventListener("click", () => {
  openLetterButton.style.display = "none";
  letterPanel.classList.add("is-visible");
});


finishGameButton.addEventListener("click", () => {
  gameFinished = true;

  closeOverlay(mailboxScreen);

  postGame.classList.add("is-unlocked");
  postGame.setAttribute("aria-hidden", "false");

  showToast(
    "CHAPTER UNLOCKED",
    "still counting."
  );

  setTimeout(() => {
    postGame.scrollIntoView({
      behavior: "smooth"
    });
  }, 500);
});


mailboxBackdrop.addEventListener("click", () => {
  closeOverlay(mailboxScreen);
});


// ========================================
// UNLOCK MAILBOX
// ========================================

function unlockMailbox() {
  mailboxUnlocked = true;

  mailboxObject.classList.remove("is-locked");
  mailboxObject.classList.add("is-unlocked");

  mailboxLock.textContent = "";

  showMissionComplete();
}


// ========================================
// MISSION COMPLETE
// ========================================

function showMissionComplete() {
  if (missionCompleteShown) return;

  missionCompleteShown = true;

  setTimeout(() => {
    openOverlay(missionComplete);
  }, 500);
}


missionCompleteButton.addEventListener("click", () => {
  closeOverlay(missionComplete);

  showToast(
    "NEW OBJECTIVE",
    "one last thing."
  );

  setTimeout(() => {
    showToast(
      "MAILBOX UNLOCKED",
      "something just unlocked."
    );
  }, 1100);
});


// ========================================
// TOAST
// ========================================

let toastTimeout;


function showToast(label, text) {
  clearTimeout(toastTimeout);

  toastLabel.textContent = label;
  toastText.textContent = text;

  gameToast.classList.add("is-visible");

  toastTimeout = setTimeout(() => {
    gameToast.classList.remove("is-visible");
  }, 1400);
}


// ========================================
// OVERLAY HELPERS
// ========================================

function openOverlay(element) {
  element.classList.add("is-open");
  element.setAttribute("aria-hidden", "false");

  document.body.classList.add("overlay-open");
}


function closeOverlay(element) {
  element.classList.remove("is-open");
  element.setAttribute("aria-hidden", "true");

  const anyOpen = document.querySelector(
    ".game-dialog.is-open, " +
    ".gacha-screen.is-open, " +
    ".photobox-screen.is-open, " +
    ".outdoor-screen.is-open, " +
    ".mailbox-screen.is-open, " +
    ".mission-complete.is-open"
  );

  if (!anyOpen) {
    document.body.classList.remove("overlay-open");
  }
}


function stopVideosInside(element) {
  element
    .querySelectorAll("video")
    .forEach((video) => {
      video.pause();
    });
}


// ========================================
// ESCAPE KEY
// ========================================

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  [
    gameDialog,
    gachaScreen,
    photoboxScreen,
    outdoorScreen,
    mailboxScreen
  ].forEach((overlay) => {
    if (overlay.classList.contains("is-open")) {
      stopVideosInside(overlay);
      closeOverlay(overlay);
    }
  });
});


// ========================================
// RELATIONSHIP LIVE TIMER
// ========================================

const relationshipStart =
  new Date("2025-06-08T00:00:00+07:00");


function updateRelationshipTimer() {
  const now = new Date();

  const difference =
    now.getTime() -
    relationshipStart.getTime();

  if (difference < 0) return;

  const totalSeconds =
    Math.floor(difference / 1000);

  const days =
    Math.floor(totalSeconds / 86400);

  const hours =
    Math.floor(
      (totalSeconds % 86400) / 3600
    );

  const minutes =
    Math.floor(
      (totalSeconds % 3600) / 60
    );

  const seconds =
    totalSeconds % 60;

  document.getElementById("days").textContent =
    days;

  document.getElementById("hours").textContent =
    String(hours).padStart(2, "0");

  document.getElementById("minutes").textContent =
    String(minutes).padStart(2, "0");

  document.getElementById("seconds").textContent =
    String(seconds).padStart(2, "0");
}


updateRelationshipTimer();

setInterval(
  updateRelationshipTimer,
  1000
);


// ========================================
// MUSIC
// ========================================

async function tryStartMusic() {
  const source =
    backgroundMusic?.querySelector("source");

  if (!source) return;

  try {
    await backgroundMusic.play();
    musicButton.textContent = "♫";
    musicButton.classList.add("is-playing");
  } catch {
    musicButton.textContent = "♪";
  }
}


musicButton.addEventListener("click", async () => {
  const source =
    backgroundMusic?.querySelector("source");

  if (!source) {
    showToast(
      "AUDIO",
      "belum ada lagunya."
    );

    return;
  }

  if (backgroundMusic.paused) {
    try {
      await backgroundMusic.play();

      musicButton.textContent = "♫";
      musicButton.classList.add("is-playing");
    } catch {
      showToast(
        "AUDIO",
        "tap sekali lagi."
      );
    }
  } else {
    backgroundMusic.pause();

    musicButton.textContent = "♪";
    musicButton.classList.remove("is-playing");
  }
});


// ========================================
// INITIAL
// ========================================

updateProgress();
