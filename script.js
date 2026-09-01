// =========================================================
// DOM REFERENCES
// =========================================================

const app = document.getElementById("app");

const prologue = document.getElementById("prologue");
const prologueBeats = [...document.querySelectorAll(".prologue-beat")];
const prologueStart = document.getElementById("prologueStart");
const enterButton = document.getElementById("enterButton");

const game = document.getElementById("game");
const world = document.getElementById("world");
const worldTip = document.getElementById("worldTip");

const questTitle = document.getElementById("questTitle");
const questDots = [...document.querySelectorAll("#questDots span")];
const mainProgress = document.getElementById("mainProgress");
const mainTotal = document.getElementById("mainTotal");
const hudMainProgress = document.getElementById("hudMainProgress");

const bonusHud = document.getElementById("bonusHud");
const bonusProgress = document.getElementById("bonusProgress");

const gachaObject = document.getElementById("gachaObject");
const photoboxSparkle = document.getElementById("photoboxSparkle");

const mailboxObject = document.getElementById("mailboxObject");
const mailboxLock = document.getElementById("mailboxLock");

const postGame = document.getElementById("postGame");
const counterSection = document.getElementById("counterSection");

const musicButton = document.getElementById("musicButton");
const backgroundMusic = document.getElementById("backgroundMusic");


// =========================================================
// GAME STATE
// =========================================================

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

const state = {
  found: new Set(),

  bonusUnlocked: false,
  bonusComplete: false,

  catTapCount: 0,
  catSecretUnlocked: false,

  snackPicked: null,

  photoboxIndex: 0,
  outdoorIndex: 0,

  gachaPulls: 0,

  mailboxUnlocked: false,
  missionCompleteShown: false,

  letterOpened: false,
  letterFinished: false,

  musicOn: false,

  revisitCount: {
    vino: 0,
    tumbler: 0,
    keychain: 0,
    gacoan: 0,
    snacks: 0,
    cat: 0,
    photobox: 0,
    window: 0
  }
};


// =========================================================
// ITEM DATA
// =========================================================

const itemData = {
  vino: {
    image: "assets/objects/2.png",
    title: "si meru",
    subtitle: "alias merah rudet wkwk",
    first:
      "this thing is basically part of you at this point.",
    repeat: [
      "still here.",
      "yeah, still very you.",
      "meru stays."
    ]
  },

  tumbler: {
    image: "assets/objects/3.png",
    title: "that tumbler.",
    subtitle: "",
    first:
      "yeah.\nthis is very you.",
    repeat: [
      "still looks like something you'd pick.",
      "yep. very you.",
      "not changing my mind."
    ]
  }
};


// =========================================================
// PROLOGUE PACING
// =========================================================

function showPrologueBeat(index) {
  prologueBeats.forEach((beat, i) => {
    beat.classList.toggle("is-active", i === index);
  });
}

function runPrologue() {
  showPrologueBeat(0);

  setTimeout(() => {
    showPrologueBeat(1);
  }, 2200);

  setTimeout(() => {
    showPrologueBeat(2);
  }, 4500);

  setTimeout(() => {
    prologueStart.classList.add("is-visible");
  }, 6800);
}

runPrologue();


// =========================================================
// ENTER GAME
// =========================================================

enterButton.addEventListener("click", async () => {
  prologue.classList.add("is-hidden");
  game.setAttribute("aria-hidden", "false");

  tryStartMusic();

  setTimeout(() => {
    showToast(
      "MAIN MISSION",
      "find all the little things.",
      3600
    );
  }, 1000);

  setTimeout(() => {
    worldTip.classList.add("is-visible");
  }, 2800);

  setTimeout(() => {
    worldTip.classList.remove("is-visible");
  }, 7600);
});


// =========================================================
// WORLD OBJECTS
// =========================================================

document.querySelectorAll(".world-object").forEach((object) => {
  object.addEventListener("click", () => {
    const item = object.dataset.item;
    if (!item) return;

    switch (item) {
      case "vino":
      case "tumbler":
        handleGenericItem(item, object);
        break;

      case "keychain":
        handleKeychain(object);
        break;

      case "gacoan":
        handleGacoan(object);
        break;

      case "snacks":
        handleSnacks(object);
        break;

      case "cat":
        handleCat(object);
        break;

      case "photobox":
        handlePhotobox(object);
        break;

      case "window":
        handleOutdoor(object);
        break;

      case "gacha":
        handleGacha();
        break;

      case "mailbox":
        handleMailbox();
        break;
    }
  });
});


// =========================================================
// DISCOVERY / QUEST
// =========================================================

function discoverItem(item, objectElement) {
  const isNew = !state.found.has(item);

  if (!isNew) {
    state.revisitCount[item]++;
    return false;
  }

  state.found.add(item);

  if (objectElement) {
    objectElement.classList.add("is-found");
  }

  updateQuest();

  showToast(
    "MEMORY FOUND",
    `${state.found.size} / ${requiredItems.length}`,
    3000
  );

  return true;
}

function updateQuest() {
  const count = state.found.size;

  mainProgress.textContent = count;
  hudMainProgress.textContent =
    `${count} / ${requiredItems.length}`;

  questDots.forEach((dot, index) => {
    dot.classList.toggle("is-found", index < count);
  });

  // 2 / 8
  if (count >= 2 && !state.bonusUnlocked) {
    unlockGacha();
  }

  // 4 / 8
  if (count >= 4) {
    world.classList.add("world-stage-two");

    document
      .querySelector(".object-photobox")
      ?.classList.add("is-highlighted");
  }

  // 6 / 8
  if (count >= 6 && count < 8) {
    mailboxObject.classList.add("is-reacting");
  }

  // 7 / 8
  if (count === 7) {
    questTitle.textContent = "one more.";
  }

  // 8 / 8
  if (
    count === requiredItems.length &&
    !state.mailboxUnlocked
  ) {
    unlockMailbox();
  }
}


// =========================================================
// GENERIC ITEM OVERLAY
// =========================================================

const itemOverlay = document.getElementById("itemOverlay");
const itemBackdrop = document.getElementById("itemBackdrop");
const itemClose = document.getElementById("itemClose");

const itemStatus = document.getElementById("itemStatus");
const itemVisual = document.getElementById("itemVisual");
const itemTitle = document.getElementById("itemTitle");
const itemSubtitle = document.getElementById("itemSubtitle");
const itemText = document.getElementById("itemText");
const itemExtra = document.getElementById("itemExtra");
const itemConfirm = document.getElementById("itemConfirm");

let currentGenericItem = null;

function handleGenericItem(item, objectElement) {
  const data = itemData[item];
  if (!data) return;

  const isNew = discoverItem(item, objectElement);

  currentGenericItem = item;

  itemStatus.textContent =
    isNew ? "ITEM FOUND" : "STILL HERE";

  itemVisual.innerHTML = `
    <img
      src="${data.image}"
      alt=""
      draggable="false"
    >
  `;

  itemTitle.textContent = data.title;
  itemSubtitle.textContent = data.subtitle || "";

  if (isNew) {
    itemText.textContent = data.first;
  } else {
    const revisit =
      Math.max(0, state.revisitCount[item] - 1);

    const repeat =
      data.repeat[
        revisit % data.repeat.length
      ];

    itemText.textContent = repeat;
  }

  itemExtra.innerHTML = "";

  openOverlay(itemOverlay);
}

function closeGenericItem() {
  closeOverlay(itemOverlay);
  currentGenericItem = null;
}

itemConfirm.addEventListener("click", closeGenericItem);
itemClose.addEventListener("click", closeGenericItem);
itemBackdrop.addEventListener("click", closeGenericItem);


// =========================================================
// KEYCHAIN
// =========================================================

const keychainOverlay =
  document.getElementById("keychainOverlay");

const keychainBackdrop =
  document.getElementById("keychainBackdrop");

const keychainClose =
  document.getElementById("keychainClose");

const keychainKeep =
  document.getElementById("keychainKeep");

const keychainCard =
  document.querySelector(".keychain-card");

function handleKeychain(objectElement) {
  const isNew =
    discoverItem("keychain", objectElement);

  openOverlay(keychainOverlay);

  keychainCard.classList.remove("is-paired");

  setTimeout(() => {
    keychainCard.classList.add("is-paired");
  }, isNew ? 900 : 250);
}

function closeKeychain() {
  closeOverlay(keychainOverlay);
}

keychainKeep.addEventListener("click", closeKeychain);
keychainClose.addEventListener("click", closeKeychain);
keychainBackdrop.addEventListener("click", closeKeychain);


// =========================================================
// GACOAN
// =========================================================

const gacoanOverlay =
  document.getElementById("gacoanOverlay");

const gacoanBackdrop =
  document.getElementById("gacoanBackdrop");

const gacoanWhy =
  document.getElementById("gacoanWhy");

const gacoanDone =
  document.getElementById("gacoanDone");

const gacoanCard =
  document.querySelector(".gacoan-card");

function handleGacoan(objectElement) {
  discoverItem("gacoan", objectElement);

  gacoanCard.classList.remove("is-revealed");

  openOverlay(gacoanOverlay);
}

gacoanWhy.addEventListener("click", () => {
  gacoanCard.classList.add("is-revealed");
});

function closeGacoan() {
  closeOverlay(gacoanOverlay);
}

gacoanDone.addEventListener("click", closeGacoan);
gacoanBackdrop.addEventListener("click", closeGacoan);


// =========================================================
// SNACK PICKER
// =========================================================

const snackOverlay =
  document.getElementById("snackOverlay");

const snackBackdrop =
  document.getElementById("snackBackdrop");

const snackClose =
  document.getElementById("snackClose");

const snackOptions =
  [...document.querySelectorAll(".snack-option")];

const snackResult =
  document.getElementById("snackResult");

const snackResultName =
  document.getElementById("snackResultName");

const snackResultText =
  document.getElementById("snackResultText");

const snackTake =
  document.getElementById("snackTake");

const snackReplies = {
  chiki: {
    name: "Chiki Balls",
    text: "yeah, this one makes sense."
  },

  jetz: {
    name: "JetZ",
    text: "solid choice."
  },

  taro: {
    name: "Taro",
    text: "of course."
  },

  momogi: {
    name: "Momogi",
    text: "yeah. this checks out."
  }
};

let currentSnackObject = null;

function handleSnacks(objectElement) {
  currentSnackObject = objectElement;

  snackOptions.forEach((option) => {
    option.classList.remove("is-selected");
  });

  snackResult.classList.remove("is-visible");

  openOverlay(snackOverlay);
}

snackOptions.forEach((option) => {
  option.addEventListener("click", () => {
    const snack = option.dataset.snack;
    const data = snackReplies[snack];

    if (!data) return;

    snackOptions.forEach((item) => {
      item.classList.remove("is-selected");
    });

    option.classList.add("is-selected");

    state.snackPicked = snack;

    snackResultName.textContent = data.name;
    snackResultText.textContent = data.text;

    snackResult.classList.add("is-visible");
  });
});

snackTake.addEventListener("click", () => {
  if (!state.snackPicked) return;

  discoverItem("snacks", currentSnackObject);

  closeOverlay(snackOverlay);
});

snackClose.addEventListener("click", () => {
  closeOverlay(snackOverlay);
});

snackBackdrop.addEventListener("click", () => {
  closeOverlay(snackOverlay);
});


// =========================================================
// CAT
// =========================================================

const catOverlay =
  document.getElementById("catOverlay");

const catBackdrop =
  document.getElementById("catBackdrop");

const catTap =
  document.getElementById("catTap");

const catDialogue =
  document.getElementById("catDialogue");

const catDone =
  document.getElementById("catDone");

const catLines = [
  "you would've stopped anyway.",
  "pspspspsps.",
  "okay, it saw you.",
  "you're still doing this?",
  "fine.",
  "keep the cat."
];

let currentCatObject = null;

function handleCat(objectElement) {
  currentCatObject = objectElement;

  discoverItem("cat", objectElement);

  state.catTapCount = 0;

  catDialogue.textContent = catLines[0];

  openOverlay(catOverlay);
}

catTap.addEventListener("click", () => {
  state.catTapCount++;

  const index = Math.min(
    state.catTapCount,
    catLines.length - 1
  );

  catDialogue.style.opacity = "0";

  setTimeout(() => {
    catDialogue.textContent = catLines[index];
    catDialogue.style.opacity = "1";
  }, 240);

  const catImg = catTap.querySelector("img");

  catImg?.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(.92) rotate(-2deg)" },
      { transform: "scale(1.04) rotate(2deg)" },
      { transform: "scale(1)" }
    ],
    {
      duration: 380,
      easing: "ease-out"
    }
  );

  if (
    state.catTapCount >= 5 &&
    !state.catSecretUnlocked
  ) {
    state.catSecretUnlocked = true;

    showAchievement(
      "you kept tapping the cat."
    );
  }
});

catDone.addEventListener("click", () => {
  closeOverlay(catOverlay);
});

catBackdrop.addEventListener("click", () => {
  closeOverlay(catOverlay);
});


// =========================================================
// PHOTOBOX ARCHIVE
// =========================================================

const photoboxOverlay =
  document.getElementById("photoboxOverlay");

const photoboxBackdrop =
  document.getElementById("photoboxBackdrop");

const photoboxClose =
  document.getElementById("photoboxClose");

const photoboxPrev =
  document.getElementById("photoboxPrev");

const photoboxNext =
  document.getElementById("photoboxNext");

const photoboxPagination =
  document.getElementById("photoboxPagination");

const photoboxKeep =
  document.getElementById("photoboxKeep");

const photoboxSlides =
  [...document.querySelectorAll(".photobox-slide")];

let currentPhotoboxObject = null;

function handlePhotobox(objectElement) {
  currentPhotoboxObject = objectElement;

  state.photoboxIndex = 0;

  renderPhotoboxSlide();

  openOverlay(photoboxOverlay);
}

function renderPhotoboxSlide() {
  photoboxSlides.forEach((slide, index) => {
    slide.classList.toggle(
      "is-active",
      index === state.photoboxIndex
    );
  });

  photoboxPagination.textContent =
    `${state.photoboxIndex + 1} / ${photoboxSlides.length}`;
}

photoboxPrev.addEventListener("click", () => {
  state.photoboxIndex =
    (
      state.photoboxIndex -
      1 +
      photoboxSlides.length
    ) % photoboxSlides.length;

  renderPhotoboxSlide();
});

photoboxNext.addEventListener("click", () => {
  state.photoboxIndex =
    (state.photoboxIndex + 1) %
    photoboxSlides.length;

  renderPhotoboxSlide();
});

photoboxKeep.addEventListener("click", () => {
  discoverItem(
    "photobox",
    currentPhotoboxObject
  );

  closeOverlay(photoboxOverlay);
});

photoboxClose.addEventListener("click", () => {
  closeOverlay(photoboxOverlay);
});

photoboxBackdrop.addEventListener("click", () => {
  closeOverlay(photoboxOverlay);
});


// =========================================================
// OUTDOOR ARCHIVE
// =========================================================

const outdoorOverlay =
  document.getElementById("outdoorOverlay");

const outdoorBackdrop =
  document.getElementById("outdoorBackdrop");

const outdoorClose =
  document.getElementById("outdoorClose");

const outdoorPrev =
  document.getElementById("outdoorPrev");

const outdoorNext =
  document.getElementById("outdoorNext");

const outdoorPagination =
  document.getElementById("outdoorPagination");

const outdoorDone =
  document.getElementById("outdoorDone");

const outdoorSlides =
  [...document.querySelectorAll(".outdoor-slide")];

let currentOutdoorObject = null;

function handleOutdoor(objectElement) {
  currentOutdoorObject = objectElement;

  state.outdoorIndex = 0;

  renderOutdoorSlide();

  openOverlay(outdoorOverlay);
}

function renderOutdoorSlide() {
  outdoorSlides.forEach((slide, index) => {
    slide.classList.toggle(
      "is-active",
      index === state.outdoorIndex
    );
  });

  outdoorPagination.textContent =
    `${state.outdoorIndex + 1} / ${outdoorSlides.length}`;
}

outdoorPrev.addEventListener("click", () => {
  state.outdoorIndex =
    (
      state.outdoorIndex -
      1 +
      outdoorSlides.length
    ) % outdoorSlides.length;

  renderOutdoorSlide();
});

outdoorNext.addEventListener("click", () => {
  state.outdoorIndex =
    (state.outdoorIndex + 1) %
    outdoorSlides.length;

  renderOutdoorSlide();
});

outdoorDone.addEventListener("click", () => {
  discoverItem(
    "window",
    currentOutdoorObject
  );

  closeOverlay(outdoorOverlay);
});

outdoorClose.addEventListener("click", () => {
  closeOverlay(outdoorOverlay);
});

outdoorBackdrop.addEventListener("click", () => {
  closeOverlay(outdoorOverlay);
});


// =========================================================
// GACHA UNLOCK
// =========================================================

function unlockGacha() {
  state.bonusUnlocked = true;

  gachaObject.classList.remove("is-dormant");
  gachaObject.classList.add("is-unlocked");

  bonusHud.classList.add("is-active");

  showToast(
    "SIDE QUEST UNLOCKED",
    "memory gacha available.",
    4200
  );
}


// =========================================================
// GACHA
// =========================================================

const gachaOverlay =
  document.getElementById("gachaOverlay");

const gachaBackdrop =
  document.getElementById("gachaBackdrop");

const gachaClose =
  document.getElementById("gachaClose");

const gachaMachineState =
  document.getElementById("gachaMachineState");

const gachaResultState =
  document.getElementById("gachaResultState");

const gachaMachine =
  document.getElementById("gachaMachine");

const gachaStatus =
  document.getElementById("gachaStatus");

const gachaPull =
  document.getElementById("gachaPull");

const gachaPullCount =
  document.getElementById("gachaPullCount");

const gachaRarity =
  document.getElementById("gachaRarity");

const gachaMemory =
  document.getElementById("gachaMemory");

const gachaCaption =
  document.getElementById("gachaCaption");

const gachaAgain =
  document.getElementById("gachaAgain");

const gachaKeep =
  document.getElementById("gachaKeep");


const randomGachaPool = [
  {
    type: "photo",
    src: "assets/photos/us/us-heart-filter-01.webp",
    rarity: "COMMON MEMORY",
    caption: "random, but kept."
  },

  {
    type: "photo",
    src: "assets/photos/us/us-jeep-trip-01.webp",
    rarity: "★ RARE MEMORY ★",
    caption: "okay, this one's good."
  },

  {
    type: "photo",
    src: "assets/photos/us/us-outdoor-selfie-01.webp",
    rarity: "COMMON MEMORY",
    caption: "this one stayed."
  },

  {
    type: "photo",
    src: "assets/photos/random/us-closeup-random-01.webp",
    rarity: "CHAOTIC PULL",
    caption: "unfortunately, this survived."
  },

  {
    type: "photo",
    src: "assets/photos/random/her-random-closeup-01.webp",
    rarity: "CHAOTIC PULL",
    caption: "keeping this here."
  },

  {
    type: "photo",
    src: "assets/photos/photobox/us-photobox-bw-01.webp",
    rarity: "★ PHOTOBOX MEMORY ★",
    caption: "this one's staying."
  },

  {
    type: "photo",
    src: "assets/photos/photobox/us-photobooth-grid-01.webp",
    rarity: "PHOTOBOX MEMORY",
    caption: "yeah, we do this a lot."
  },

  {
    type: "video",
    src: "assets/videos/us/us-video-01.mp4",
    rarity: "MOTION MEMORY",
    caption: "this happened."
  },

  {
    type: "video",
    src: "assets/videos/us/us-video-02.mp4",
    rarity: "★ RARE VIDEO ★",
    caption: "found this one."
  }
];

const guaranteedFourthPull = {
  type: "video",
  src: "assets/videos/us/us-video-03.mp4",
  rarity: "???",
  caption: "okay. this one's special."
};

let gachaBusy = false;

function handleGacha() {
  if (!state.bonusUnlocked) {
    showToast(
      "NOT YET",
      "keep looking around first.",
      3400
    );

    return;
  }

  gachaResultState.classList.remove("is-visible");

  gachaStatus.textContent =
    state.gachaPulls === 0
      ? "pull one."
      : "another one?";

  gachaPullCount.textContent =
    state.gachaPulls;

  openOverlay(gachaOverlay);
}

function performGachaPull() {
  if (gachaBusy) return;

  gachaBusy = true;

  gachaPull.disabled = true;
  gachaAgain.disabled = true;

  stopVideosInside(gachaOverlay);

  gachaResultState.classList.remove("is-visible");

  gachaStatus.textContent = "pulling...";

  gachaMachine.classList.remove("is-pulling");

  void gachaMachine.offsetWidth;

  gachaMachine.classList.add("is-pulling");

  setTimeout(() => {
    state.gachaPulls++;

    gachaPullCount.textContent =
      state.gachaPulls;

    const result =
      state.gachaPulls === 4
        ? guaranteedFourthPull
        : randomGachaPool[
            Math.floor(
              Math.random() *
              randomGachaPool.length
            )
          ];

    renderGachaResult(result);

    if (!state.bonusComplete) {
      state.bonusComplete = true;

      bonusProgress.textContent = "1 / 1";

      showToast(
        "BONUS COMPLETE",
        "memory gacha found.",
        3400
      );
    }

    gachaStatus.textContent =
      "you got something.";

    gachaBusy = false;

    gachaPull.disabled = false;
    gachaAgain.disabled = false;
  }, 1500);
}

function renderGachaResult(result) {
  gachaRarity.textContent = result.rarity;
  gachaCaption.textContent = result.caption;

  if (result.type === "photo") {
    gachaMemory.innerHTML = `
      <img
        src="${result.src}"
        alt=""
      >
    `;
  }

  if (result.type === "video") {
    gachaMemory.innerHTML = `
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

  gachaResultState.classList.add("is-visible");
}

gachaPull.addEventListener("click", performGachaPull);
gachaAgain.addEventListener("click", performGachaPull);

gachaKeep.addEventListener("click", () => {
  stopVideosInside(gachaOverlay);
  closeOverlay(gachaOverlay);
});

gachaClose.addEventListener("click", () => {
  stopVideosInside(gachaOverlay);
  closeOverlay(gachaOverlay);
});

gachaBackdrop.addEventListener("click", () => {
  stopVideosInside(gachaOverlay);
  closeOverlay(gachaOverlay);
});


// =========================================================
// MAILBOX LOCK
// =========================================================

const mailboxLockOverlay =
  document.getElementById("mailboxLockOverlay");

const mailboxLockBackdrop =
  document.getElementById("mailboxLockBackdrop");

const mailboxLockedText =
  document.getElementById("mailboxLockedText");

const mailboxLockOkay =
  document.getElementById("mailboxLockOkay");

function handleMailbox() {
  if (state.mailboxUnlocked) {
    openLetterScene();
    return;
  }

  const count = state.found.size;

  let text = "not yet.";

  if (count >= 4 && count <= 5) {
    text = "still locked.";
  }

  if (count === 6) {
    text = "almost.";
  }

  if (count === 7) {
    text = "one more.";
  }

  mailboxLockedText.textContent = text;

  openOverlay(mailboxLockOverlay);
}

mailboxLockOkay.addEventListener("click", () => {
  closeOverlay(mailboxLockOverlay);
});

mailboxLockBackdrop.addEventListener("click", () => {
  closeOverlay(mailboxLockOverlay);
});


// =========================================================
// MAILBOX UNLOCK / MISSION COMPLETE
// =========================================================

const missionCompleteOverlay =
  document.getElementById("missionCompleteOverlay");

const missionCompleteContinue =
  document.getElementById("missionCompleteContinue");

function unlockMailbox() {
  state.mailboxUnlocked = true;

  questTitle.textContent = "done.";

  mailboxObject.classList.remove(
    "is-locked",
    "is-reacting"
  );

  mailboxObject.classList.add("is-unlocked");

  setTimeout(() => {
    if (!state.missionCompleteShown) {
      state.missionCompleteShown = true;

      openOverlay(missionCompleteOverlay);
    }
  }, 900);
}

missionCompleteContinue.addEventListener("click", () => {
  closeOverlay(missionCompleteOverlay);

  showToast(
    "ONE LAST THING",
    "check the mailbox.",
    4300
  );
});


// =========================================================
// LETTER
// =========================================================

const letterOverlay =
  document.getElementById("letterOverlay");

const letterClosed =
  document.getElementById("letterClosed");

const letterPaper =
  document.getElementById("letterPaper");

const openLetter =
  document.getElementById("openLetter");

const finishLetter =
  document.getElementById("finishLetter");

const letterParagraphs =
  [...document.querySelectorAll(".letter-paragraph")];

function openLetterScene() {
  letterClosed.classList.remove("is-hidden");
  letterPaper.classList.remove("is-visible");

  letterParagraphs.forEach((p) => {
    p.classList.remove("is-visible");
  });

  openOverlay(letterOverlay);
}

openLetter.addEventListener("click", () => {
  if (state.letterOpened) return;

  state.letterOpened = true;

  letterClosed.classList.add("is-hidden");

  setTimeout(() => {
    letterPaper.classList.add("is-visible");
  }, 700);

  // slow stagger: readable, not rushed
  letterParagraphs.forEach((paragraph, index) => {
    setTimeout(() => {
      paragraph.classList.add("is-visible");
    }, 1500 + index * 1200);
  });
});

finishLetter.addEventListener("click", () => {
  state.letterFinished = true;

  closeOverlay(letterOverlay);

  postGame.classList.add("is-visible");
  postGame.setAttribute("aria-hidden", "false");

  showToast(
    "STILL COUNTING",
    "08.06.2025 — now",
    4200
  );

  setTimeout(() => {
    counterSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }, 1300);
});


// =========================================================
// ACHIEVEMENT
// =========================================================

const achievement =
  document.getElementById("achievement");

const achievementText =
  document.getElementById("achievementText");

let achievementTimer;

function showAchievement(text) {
  clearTimeout(achievementTimer);

  achievementText.textContent = text;

  achievement.classList.add("is-visible");

  achievementTimer = setTimeout(() => {
    achievement.classList.remove("is-visible");
  }, 4400);
}


// =========================================================
// TOAST
// =========================================================

const toast =
  document.getElementById("toast");

const toastLabel =
  document.getElementById("toastLabel");

const toastText =
  document.getElementById("toastText");

let toastTimer;

function showToast(
  label,
  text,
  duration = 3400
) {
  clearTimeout(toastTimer);

  toast.classList.remove("is-visible");

  setTimeout(() => {
    toastLabel.textContent = label;
    toastText.textContent = text;

    toast.classList.add("is-visible");
  }, 120);

  toastTimer = setTimeout(() => {
    toast.classList.remove("is-visible");
  }, duration);
}


// =========================================================
// OVERLAY HELPERS
// =========================================================

function openOverlay(element) {
  element.classList.add("is-open");
  element.setAttribute("aria-hidden", "false");

  document.body.classList.add("overlay-open");
}

function closeOverlay(element) {
  element.classList.remove("is-open");
  element.setAttribute("aria-hidden", "true");

  requestAnimationFrame(() => {
    const anyOpen = document.querySelector(
      ".overlay.is-open"
    );

    if (!anyOpen) {
      document.body.classList.remove("overlay-open");
    }
  });
}

function stopVideosInside(element) {
  element
    .querySelectorAll("video")
    .forEach((video) => {
      video.pause();
    });
}


// =========================================================
// LIVE RELATIONSHIP TIMER
// =========================================================

const relationshipStart =
  new Date("2025-06-08T00:00:00+07:00");

function updateRelationshipTimer() {
  const now = new Date();

  const diff =
    now.getTime() -
    relationshipStart.getTime();

  if (diff < 0) return;

  const totalSeconds =
    Math.floor(diff / 1000);

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

setInterval(updateRelationshipTimer, 1000);


// =========================================================
// MUSIC
// =========================================================

async function tryStartMusic() {
  const source =
    backgroundMusic?.querySelector("source");

  if (!source) return;

  backgroundMusic.volume = 0.3;

  try {
    await backgroundMusic.play();

    state.musicOn = true;
    musicButton.textContent = "♫";
  } catch {
    state.musicOn = false;
    musicButton.textContent = "♪";
  }
}

musicButton.addEventListener("click", async () => {
  const source =
    backgroundMusic?.querySelector("source");

  if (!source) {
    showToast(
      "AUDIO",
      "no song yet.",
      2800
    );

    return;
  }

  if (backgroundMusic.paused) {
    try {
      backgroundMusic.volume = 0.3;

      await backgroundMusic.play();

      state.musicOn = true;
      musicButton.textContent = "♫";
    } catch {
      showToast(
        "AUDIO",
        "try again.",
        2600
      );
    }
  } else {
    backgroundMusic.pause();

    state.musicOn = false;
    musicButton.textContent = "♪";
  }
});


// =========================================================
// ESCAPE KEY
// =========================================================

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  const openOverlays = [
    itemOverlay,
    keychainOverlay,
    gacoanOverlay,
    snackOverlay,
    catOverlay,
    photoboxOverlay,
    outdoorOverlay,
    gachaOverlay,
    mailboxLockOverlay
  ];

  openOverlays.forEach((overlay) => {
    if (overlay?.classList.contains("is-open")) {
      stopVideosInside(overlay);
      closeOverlay(overlay);
    }
  });
});


// =========================================================
// INITIAL STATE
// =========================================================

updateQuest();
