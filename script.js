// =========================================================
// 01. DOM REFERENCES
// =========================================================

const prologue = document.getElementById("prologue");
const prologueBeats = [
  ...document.querySelectorAll(".prologue-beat")
];
const prologueStart = document.getElementById("prologueStart");
const enterButton = document.getElementById("enterButton");

const game = document.getElementById("game");

const world = document.getElementById("world");
const worldTip = document.getElementById("worldTip");

const questTitle = document.getElementById("questTitle");
const questDots = [
  ...document.querySelectorAll("#questDots span")
];

const mainProgress = document.getElementById("mainProgress");
const mainTotal = document.getElementById("mainTotal");

const bonusHud = document.getElementById("bonusHud");
const bonusProgress = document.getElementById("bonusProgress");

const gachaObject = document.getElementById("gachaObject");

const mailboxObject = document.getElementById("mailboxObject");

const postGame = document.getElementById("postGame");
const counterSection = document.getElementById("counterSection");

const musicButton = document.getElementById("musicButton");
const backgroundMusic = document.getElementById("backgroundMusic");


// =========================================================
// 02. GAME CONFIG
// =========================================================

const REQUIRED_ITEMS = [
  "vino",
  "tumbler",
  "keychain",
  "gacoan",
  "snacks",
  "cat",
  "photobox",
  "window"
];

const TOTAL_REQUIRED = REQUIRED_ITEMS.length;

mainTotal.textContent = TOTAL_REQUIRED;


// =========================================================
// 03. GAME STATE
// =========================================================

const state = {
  enteredGame: false,

  found: new Set(),

  bonusUnlocked: false,
  bonusComplete: false,

  milestoneFourShown: false,

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
// 04. ITEM COPY
// =========================================================

const itemData = {

  vino: {
    image: "assets/objects/2.png",

    title: "si meru",

    subtitle:
      "alias merah rudet wkwk",

    first:
      "this thing is basically part of you at this point.",

    repeat: [
      "still here.",
      "yep. still meru.",
      "not going anywhere."
    ]
  },


  tumbler: {
    image: "assets/objects/3.png",

    title:
      "that tumbler.",

    subtitle:
      "",

    first:
      "yeah.\nthis is very you.",

    repeat: [
      "still very you.",
      "yeah, i'd still pick this for you.",
      "same answer."
    ]
  }

};


// =========================================================
// 05. UTILITIES
// =========================================================

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}


function getWorldObject(itemName) {
  return document.querySelector(
    `.world-object[data-item="${itemName}"]`
  );
}


function isFound(itemName) {
  return state.found.has(itemName);
}


function safeAnimate(element, frames, options) {
  if (!element) return;

  if (typeof element.animate !== "function") {
    return;
  }

  element.animate(frames, options);
}


// =========================================================
// 06. PROLOGUE
// =========================================================

function showPrologueBeat(index) {
  prologueBeats.forEach((beat, beatIndex) => {

    beat.classList.toggle(
      "is-active",
      beatIndex === index
    );

  });
}


function runPrologue() {

  showPrologueBeat(0);


  setTimeout(() => {

    showPrologueBeat(1);

  }, 2200);


  setTimeout(() => {

    showPrologueBeat(2);

  }, 4400);


  setTimeout(() => {

    prologueStart.classList.add("is-visible");

  }, 6500);

}


runPrologue();


// =========================================================
// 07. ENTER WORLD
// =========================================================

enterButton.addEventListener("click", async () => {

  if (state.enteredGame) return;

  state.enteredGame = true;


  prologue.classList.add("is-hidden");

  game.setAttribute(
    "aria-hidden",
    "false"
  );


  tryStartMusic();


  await delay(850);


  showToast(
    "MAIN MISSION",
    "find all the little things.",
    3600
  );


  await delay(1800);


  worldTip.classList.add("is-visible");


  await delay(4500);


  worldTip.classList.remove("is-visible");

});


// =========================================================
// 08. WORLD OBJECT ROUTER
// =========================================================

document
  .querySelectorAll(".world-object")
  .forEach((object) => {

    object.addEventListener("click", () => {

      const item = object.dataset.item;

      if (!item) return;


      switch (item) {

        case "vino":

          openGenericItem(
            "vino",
            object
          );

          break;


        case "tumbler":

          openGenericItem(
            "tumbler",
            object
          );

          break;


        case "keychain":

          openKeychain(object);

          break;


        case "gacoan":

          openGacoan(object);

          break;


        case "snacks":

          openSnacks(object);

          break;


        case "cat":

          openCat(object);

          break;


        case "photobox":

          openPhotobox(object);

          break;


        case "window":

          openOutdoor(object);

          break;


        case "gacha":

          openGacha();

          break;


        case "mailbox":

          handleMailbox();

          break;

      }

    });

  });


// =========================================================
// 09. DISCOVER ITEM
// =========================================================

function discoverItem(itemName) {

  if (
    !REQUIRED_ITEMS.includes(itemName)
  ) {
    return false;
  }


  if (state.found.has(itemName)) {

    state.revisitCount[itemName]++;

    return false;
  }


  state.found.add(itemName);


  const object =
    getWorldObject(itemName);


  if (object) {

    object.classList.add("is-found");

  }


  updateQuest();


  showToast(
    "MEMORY FOUND",
    `${state.found.size} / ${TOTAL_REQUIRED}`,
    3000
  );


  return true;

}


// =========================================================
// 10. QUEST PROGRESSION
// =========================================================

function updateQuest() {

  const count = state.found.size;


  mainProgress.textContent = count;


  questDots.forEach((dot, index) => {

    dot.classList.toggle(
      "is-found",
      index < count
    );

  });


  // ---------------------------------------------
  // 2 / 8
  // ---------------------------------------------

  if (
    count >= 2 &&
    !state.bonusUnlocked
  ) {

    unlockGacha();

  }


  // ---------------------------------------------
  // 4 / 8
  // ---------------------------------------------

  if (count >= 4) {

    world.classList.add(
      "world-stage-two"
    );


    document
      .querySelector(".object-photobox")
      ?.classList.add("is-highlighted");


    if (!state.milestoneFourShown) {

      state.milestoneFourShown = true;


      setTimeout(() => {

        showToast(
          "MAIN MISSION",
          "halfway there.",
          3000
        );

      }, 1000);

    }

  }


  // ---------------------------------------------
  // 6 / 8
  // ---------------------------------------------

  if (
    count >= 6 &&
    count < TOTAL_REQUIRED
  ) {

    mailboxObject.classList.add(
      "is-reacting"
    );

  }


  // ---------------------------------------------
  // 7 / 8
  // ---------------------------------------------

  if (count === 7) {

    questTitle.textContent =
      "one more.";

  }


  // ---------------------------------------------
  // 8 / 8
  // ---------------------------------------------

  if (count === TOTAL_REQUIRED) {

    questTitle.textContent =
      "done.";


    if (!state.mailboxUnlocked) {

      unlockMailbox();

    }

  }

}


// =========================================================
// 11. GENERIC ITEM
//     VINO + TUMBLER
// =========================================================

const itemOverlay =
  document.getElementById("itemOverlay");

const itemBackdrop =
  document.getElementById("itemBackdrop");

const itemClose =
  document.getElementById("itemClose");

const itemStatus =
  document.getElementById("itemStatus");

const itemVisual =
  document.getElementById("itemVisual");

const itemTitle =
  document.getElementById("itemTitle");

const itemSubtitle =
  document.getElementById("itemSubtitle");

const itemText =
  document.getElementById("itemText");

const itemExtra =
  document.getElementById("itemExtra");

const itemConfirm =
  document.getElementById("itemConfirm");


let currentGenericItem = null;


function openGenericItem(
  itemName,
  objectElement
) {

  const data = itemData[itemName];

  if (!data) return;


  currentGenericItem = {
    name: itemName,
    object: objectElement
  };


  const alreadyFound =
    isFound(itemName);


  itemStatus.textContent =
    alreadyFound
      ? "STILL HERE"
      : "ITEM FOUND";


  itemVisual.innerHTML = `
    <img
      src="${data.image}"
      alt=""
      draggable="false"
    >
  `;


  itemTitle.textContent =
    data.title;


  itemSubtitle.textContent =
    data.subtitle;


  if (!alreadyFound) {

    itemText.textContent =
      data.first;

  }

  else {

    const index =
      state.revisitCount[itemName] %
      data.repeat.length;


    itemText.textContent =
      data.repeat[index];


    state.revisitCount[itemName]++;

  }


  itemExtra.innerHTML = "";


  itemConfirm.textContent =
    alreadyFound
      ? "okay"
      : "keep";


  openOverlay(itemOverlay);

}


function finishGenericItem() {

  if (!currentGenericItem) {

    closeOverlay(itemOverlay);

    return;

  }


  if (
    !isFound(currentGenericItem.name)
  ) {

    discoverItem(
      currentGenericItem.name
    );

  }


  currentGenericItem = null;


  closeOverlay(itemOverlay);

}


function closeGenericWithoutSaving() {

  currentGenericItem = null;

  closeOverlay(itemOverlay);

}


itemConfirm.addEventListener(
  "click",
  finishGenericItem
);


itemClose.addEventListener(
  "click",
  closeGenericWithoutSaving
);


itemBackdrop.addEventListener(
  "click",
  closeGenericWithoutSaving
);


// =========================================================
// 12. KEYCHAIN
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


function openKeychain() {

  keychainCard.classList.remove(
    "is-paired"
  );


  openOverlay(keychainOverlay);


  setTimeout(() => {

    keychainCard.classList.add(
      "is-paired"
    );

  }, 450);

}


function finishKeychain() {

  if (!isFound("keychain")) {

    discoverItem("keychain");

  }

  else {

    state.revisitCount.keychain++;

  }


  closeOverlay(keychainOverlay);

}


keychainKeep.addEventListener(
  "click",
  finishKeychain
);


keychainClose.addEventListener(
  "click",
  () => closeOverlay(keychainOverlay)
);


keychainBackdrop.addEventListener(
  "click",
  () => closeOverlay(keychainOverlay)
);


// =========================================================
// 13. GACOAN
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


function openGacoan() {

  gacoanCard.classList.remove(
    "is-revealed"
  );


  openOverlay(gacoanOverlay);

}


gacoanWhy.addEventListener(
  "click",
  () => {

    gacoanCard.classList.add(
      "is-revealed"
    );

  }
);


gacoanDone.addEventListener(
  "click",
  () => {

    if (!isFound("gacoan")) {

      discoverItem("gacoan");

    }

    else {

      state.revisitCount.gacoan++;

    }


    closeOverlay(gacoanOverlay);

  }
);


gacoanBackdrop.addEventListener(
  "click",
  () => closeOverlay(gacoanOverlay)
);


// =========================================================
// 14. SNACK PICKER
// =========================================================

const snackOverlay =
  document.getElementById("snackOverlay");

const snackBackdrop =
  document.getElementById("snackBackdrop");

const snackClose =
  document.getElementById("snackClose");

const snackOptions = [
  ...document.querySelectorAll(
    ".snack-option"
  )
];

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
    name:
      "Chiki Balls",

    text:
      "yeah, this one makes sense."
  },


  jetz: {
    name:
      "JetZ",

    text:
      "solid choice."
  },


  taro: {
    name:
      "Taro",

    text:
      "of course."
  },


  momogi: {
    name:
      "Momogi",

    text:
      "yeah. this checks out."
  }

};


function resetSnackPicker() {

  state.snackPicked = null;


  snackOptions.forEach((option) => {

    option.classList.remove(
      "is-selected"
    );

  });


  snackResult.classList.remove(
    "is-visible"
  );

}


function openSnacks() {

  resetSnackPicker();

  openOverlay(snackOverlay);

}


snackOptions.forEach((option) => {

  option.addEventListener("click", () => {

    const snackName =
      option.dataset.snack;


    const reply =
      snackReplies[snackName];


    if (!reply) return;


    state.snackPicked =
      snackName;


    snackOptions.forEach((item) => {

      item.classList.remove(
        "is-selected"
      );

    });


    option.classList.add(
      "is-selected"
    );


    snackResultName.textContent =
      reply.name;


    snackResultText.textContent =
      reply.text;


    snackResult.classList.add(
      "is-visible"
    );

  });

});


snackTake.addEventListener(
  "click",
  () => {

    if (!state.snackPicked) {

      return;

    }


    if (!isFound("snacks")) {

      discoverItem("snacks");

    }

    else {

      state.revisitCount.snacks++;

    }


    closeOverlay(snackOverlay);

  }
);


snackClose.addEventListener(
  "click",
  () => closeOverlay(snackOverlay)
);


snackBackdrop.addEventListener(
  "click",
  () => closeOverlay(snackOverlay)
);


// =========================================================
// 15. CAT
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


function openCat() {

  state.catTapCount = 0;


  catDialogue.textContent =
    catLines[0];


  catDialogue.style.opacity =
    "1";


  openOverlay(catOverlay);

}


catTap.addEventListener(
  "click",
  () => {

    state.catTapCount++;


    const lineIndex =
      Math.min(
        state.catTapCount,
        catLines.length - 1
      );


    catDialogue.style.opacity =
      "0";


    setTimeout(() => {

      catDialogue.textContent =
        catLines[lineIndex];


      catDialogue.style.opacity =
        "1";

    }, 220);


    const catImage =
      catTap.querySelector("img");


    safeAnimate(
      catImage,

      [
        {
          transform:
            "scale(1) rotate(0deg)"
        },

        {
          transform:
            "scale(.93) rotate(-2deg)"
        },

        {
          transform:
            "scale(1.03) rotate(2deg)"
        },

        {
          transform:
            "scale(1) rotate(0deg)"
        }
      ],

      {
        duration: 360,
        easing: "ease-out"
      }
    );


    if (
      state.catTapCount >= 5 &&
      !state.catSecretUnlocked
    ) {

      state.catSecretUnlocked =
        true;


      showAchievement(
        "you kept tapping the cat."
      );

    }

  }
);


catDone.addEventListener(
  "click",
  () => {

    if (!isFound("cat")) {

      discoverItem("cat");

    }

    else {

      state.revisitCount.cat++;

    }


    closeOverlay(catOverlay);

  }
);


catBackdrop.addEventListener(
  "click",
  () => closeOverlay(catOverlay)
);


// =========================================================
// 16. PHOTOBOX
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

const photoboxSlides = [
  ...document.querySelectorAll(
    ".photobox-slide"
  )
];


function openPhotobox() {

  state.photoboxIndex = 0;


  renderPhotoboxSlide();


  openOverlay(photoboxOverlay);

}


function renderPhotoboxSlide() {

  photoboxSlides.forEach(
    (slide, index) => {

      slide.classList.toggle(
        "is-active",
        index === state.photoboxIndex
      );

    }
  );


  photoboxPagination.textContent =
    `${state.photoboxIndex + 1} / ${photoboxSlides.length}`;

}


photoboxPrev.addEventListener(
  "click",
  () => {

    state.photoboxIndex =
      (
        state.photoboxIndex -
        1 +
        photoboxSlides.length
      ) %
      photoboxSlides.length;


    renderPhotoboxSlide();

  }
);


photoboxNext.addEventListener(
  "click",
  () => {

    state.photoboxIndex =
      (
        state.photoboxIndex +
        1
      ) %
      photoboxSlides.length;


    renderPhotoboxSlide();

  }
);


photoboxKeep.addEventListener(
  "click",
  () => {

    if (!isFound("photobox")) {

      discoverItem("photobox");

    }

    else {

      state.revisitCount.photobox++;

    }


    closeOverlay(photoboxOverlay);

  }
);


photoboxClose.addEventListener(
  "click",
  () => closeOverlay(photoboxOverlay)
);


photoboxBackdrop.addEventListener(
  "click",
  () => closeOverlay(photoboxOverlay)
);


// =========================================================
// 17. OUTDOOR / WINDOW
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

const outdoorSlides = [
  ...document.querySelectorAll(
    ".outdoor-slide"
  )
];


function openOutdoor() {

  state.outdoorIndex = 0;


  renderOutdoorSlide();


  openOverlay(outdoorOverlay);

}


function renderOutdoorSlide() {

  outdoorSlides.forEach(
    (slide, index) => {

      slide.classList.toggle(
        "is-active",
        index === state.outdoorIndex
      );

    }
  );


  outdoorPagination.textContent =
    `${state.outdoorIndex + 1} / ${outdoorSlides.length}`;

}


outdoorPrev.addEventListener(
  "click",
  () => {

    state.outdoorIndex =
      (
        state.outdoorIndex -
        1 +
        outdoorSlides.length
      ) %
      outdoorSlides.length;


    renderOutdoorSlide();

  }
);


outdoorNext.addEventListener(
  "click",
  () => {

    state.outdoorIndex =
      (
        state.outdoorIndex +
        1
      ) %
      outdoorSlides.length;


    renderOutdoorSlide();

  }
);


outdoorDone.addEventListener(
  "click",
  () => {

    if (!isFound("window")) {

      discoverItem("window");

    }

    else {

      state.revisitCount.window++;

    }


    closeOverlay(outdoorOverlay);

  }
);


outdoorClose.addEventListener(
  "click",
  () => closeOverlay(outdoorOverlay)
);


outdoorBackdrop.addEventListener(
  "click",
  () => closeOverlay(outdoorOverlay)
);


// =========================================================
// 18. GACHA UNLOCK
// =========================================================

function unlockGacha() {

  state.bonusUnlocked = true;


  gachaObject.classList.remove(
    "is-dormant"
  );


  gachaObject.classList.add(
    "is-unlocked"
  );


  bonusHud.classList.add(
    "is-active"
  );


  setTimeout(() => {

    showToast(
      "SIDE QUEST UNLOCKED",
      "memory gacha available.",
      4200
    );

  }, 900);

}


// =========================================================
// 19. GACHA DATA
// =========================================================

const randomGachaPool = [

  {
    type: "photo",

    src:
      "assets/photos/us/us-heart-filter-01.webp",

    rarity:
      "COMMON MEMORY",

    caption:
      "random, but kept."
  },


  {
    type: "photo",

    src:
      "assets/photos/us/us-jeep-trip-01.webp",

    rarity:
      "★ RARE MEMORY ★",

    caption:
      "okay, this one's good."
  },


  {
    type: "photo",

    src:
      "assets/photos/us/us-outdoor-selfie-01.webp",

    rarity:
      "COMMON MEMORY",

    caption:
      "this one stayed."
  },


  {
    type: "photo",

    src:
      "assets/photos/random/us-closeup-random-01.webp",

    rarity:
      "CHAOTIC PULL",

    caption:
      "unfortunately, this survived."
  },


  {
    type: "photo",

    src:
      "assets/photos/random/her-random-closeup-01.webp",

    rarity:
      "CHAOTIC PULL",

    caption:
      "keeping this here."
  },


  {
    type: "photo",

    src:
      "assets/photos/photobox/us-photobox-bw-01.webp",

    rarity:
      "PHOTOBOX MEMORY",

    caption:
      "this one's staying."
  },


  {
    type: "photo",

    src:
      "assets/photos/photobox/us-photobooth-grid-01.webp",

    rarity:
      "PHOTOBOX MEMORY",

    caption:
      "yeah, we do this a lot."
  },


  {
    type: "video",

    src:
      "assets/videos/us/us-video-01.mp4",

    rarity:
      "MOTION MEMORY",

    caption:
      "this happened."
  },


  {
    type: "video",

    src:
      "assets/videos/us/us-video-02.mp4",

    rarity:
      "RARE VIDEO",

    caption:
      "found this one."
  }

];


const guaranteedFourthPull = {

  type: "video",

  src:
    "assets/videos/us/us-video-03.mp4",

  rarity:
    "SPECIAL MEMORY",

  caption:
    "okay. this one's special."

};


// =========================================================
// 20. GACHA DOM
// =========================================================

const gachaOverlay =
  document.getElementById("gachaOverlay");

const gachaBackdrop =
  document.getElementById("gachaBackdrop");

const gachaClose =
  document.getElementById("gachaClose");

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


let gachaBusy = false;


// =========================================================
// 21. OPEN GACHA
// =========================================================

function openGacha() {

  if (!state.bonusUnlocked) {

    showToast(
      "NOT YET",
      "keep looking around first.",
      3200
    );

    return;

  }


  stopVideosInside(gachaOverlay);


  gachaResultState.classList.remove(
    "is-visible"
  );


  gachaStatus.textContent =
    state.gachaPulls === 0
      ? "pull one."
      : "another one?";


  gachaPullCount.textContent =
    state.gachaPulls;


  openOverlay(gachaOverlay);

}


// =========================================================
// 22. GACHA PULL
// =========================================================

async function performGachaPull() {

  if (gachaBusy) return;


  gachaBusy = true;


  gachaPull.disabled = true;
  gachaAgain.disabled = true;


  stopVideosInside(gachaOverlay);


  gachaResultState.classList.remove(
    "is-visible"
  );


  gachaStatus.textContent =
    "pulling...";


  gachaMachine.classList.remove(
    "is-pulling"
  );


  void gachaMachine.offsetWidth;


  gachaMachine.classList.add(
    "is-pulling"
  );


  // machine shake
  await delay(720);


  // short suspense
  await delay(350);


  state.gachaPulls++;


  gachaPullCount.textContent =
    state.gachaPulls;


  let result;


  if (state.gachaPulls === 4) {

    result =
      guaranteedFourthPull;

  }

  else {

    result =
      randomGachaPool[
        Math.floor(
          Math.random() *
          randomGachaPool.length
        )
      ];

  }


  renderGachaResult(result);


  if (!state.bonusComplete) {

    state.bonusComplete = true;


    bonusProgress.textContent =
      "1 / 1";


    showToast(
      "BONUS COMPLETE",
      "memory gacha found.",
      3200
    );

  }


  gachaStatus.textContent =
    "you got something.";


  gachaBusy = false;


  gachaPull.disabled = false;
  gachaAgain.disabled = false;

}


// =========================================================
// 23. GACHA RESULT
// =========================================================

function renderGachaResult(result) {

  gachaRarity.textContent =
    result.rarity;


  gachaCaption.textContent =
    result.caption;


  if (result.type === "photo") {

    gachaMemory.innerHTML = `
      <img
        src="${result.src}"
        alt="Memory"
        draggable="false"
      >
    `;

  }


  else if (result.type === "video") {

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


  gachaResultState.classList.add(
    "is-visible"
  );

}


gachaPull.addEventListener(
  "click",
  performGachaPull
);


gachaAgain.addEventListener(
  "click",
  performGachaPull
);


gachaKeep.addEventListener(
  "click",
  () => {

    stopVideosInside(gachaOverlay);

    closeOverlay(gachaOverlay);

  }
);


gachaClose.addEventListener(
  "click",
  () => {

    stopVideosInside(gachaOverlay);

    closeOverlay(gachaOverlay);

  }
);


gachaBackdrop.addEventListener(
  "click",
  () => {

    stopVideosInside(gachaOverlay);

    closeOverlay(gachaOverlay);

  }
);


// =========================================================
// 24. MAILBOX LOCKED
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


  const count =
    state.found.size;


  let text =
    "not yet.";


  if (
    count >= 4 &&
    count <= 5
  ) {

    text =
      "still locked.";

  }


  if (count === 6) {

    text =
      "almost.";

  }


  if (count === 7) {

    text =
      "one more.";

  }


  mailboxLockedText.textContent =
    text;


  openOverlay(
    mailboxLockOverlay
  );

}


mailboxLockOkay.addEventListener(
  "click",
  () => closeOverlay(mailboxLockOverlay)
);


mailboxLockBackdrop.addEventListener(
  "click",
  () => closeOverlay(mailboxLockOverlay)
);


// =========================================================
// 25. MAILBOX UNLOCK
// =========================================================

const missionCompleteOverlay =
  document.getElementById(
    "missionCompleteOverlay"
  );

const missionCompleteContinue =
  document.getElementById(
    "missionCompleteContinue"
  );


function unlockMailbox() {

  state.mailboxUnlocked =
    true;


  mailboxObject.classList.remove(
    "is-locked",
    "is-reacting"
  );


  mailboxObject.classList.add(
    "is-unlocked"
  );


  setTimeout(() => {

    if (
      !state.missionCompleteShown
    ) {

      state.missionCompleteShown =
        true;


      openOverlay(
        missionCompleteOverlay
      );

    }

  }, 850);

}


missionCompleteContinue.addEventListener(
  "click",
  async () => {

    closeOverlay(
      missionCompleteOverlay
    );


    await delay(650);


    showToast(
      "ONE LAST THING",
      "check the mailbox.",
      4200
    );

  }
);


// =========================================================
// 26. LETTER
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

const letterParagraphs = [
  ...document.querySelectorAll(
    ".letter-paragraph"
  )
];


function openLetterScene() {

  letterClosed.classList.remove(
    "is-hidden"
  );


  letterPaper.classList.remove(
    "is-visible"
  );


  letterParagraphs.forEach((paragraph) => {

    paragraph.classList.remove(
      "is-visible"
    );

  });


  state.letterOpened =
    false;


  openOverlay(letterOverlay);

}


// =========================================================
// 27. OPEN LETTER
// =========================================================

openLetter.addEventListener(
  "click",
  async () => {

    if (state.letterOpened) {

      return;

    }


    state.letterOpened =
      true;


    letterClosed.classList.add(
      "is-hidden"
    );


    await delay(700);


    letterPaper.classList.add(
      "is-visible"
    );


    // Readable stagger.
    // No paragraph disappears afterward.

    for (
      let i = 0;
      i < letterParagraphs.length;
      i++
    ) {

      await delay(
        i === 0
          ? 750
          : 950
      );


      letterParagraphs[
        i
      ].classList.add(
        "is-visible"
      );

    }

  }
);


// =========================================================
// 28. FINISH LETTER
// =========================================================

finishLetter.addEventListener(
  "click",
  async () => {

    if (state.letterFinished) {

      return;

    }


    state.letterFinished =
      true;


    closeOverlay(letterOverlay);


    await delay(700);


    postGame.classList.add(
      "is-visible"
    );


    postGame.setAttribute(
      "aria-hidden",
      "false"
    );


    showToast(
      "STILL COUNTING",
      "08.06.2025 — now",
      3800
    );


    await delay(1100);


    counterSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  }
);


// =========================================================
// 29. TOAST
// =========================================================

const toast =
  document.getElementById("toast");

const toastLabel =
  document.getElementById("toastLabel");

const toastText =
  document.getElementById("toastText");


let toastTimer = null;


function showToast(
  label,
  text,
  duration = 3400
) {

  clearTimeout(toastTimer);


  toast.classList.remove(
    "is-visible"
  );


  setTimeout(() => {

    toastLabel.textContent =
      label;


    toastText.textContent =
      text;


    toast.classList.add(
      "is-visible"
    );

  }, 100);


  toastTimer =
    setTimeout(() => {

      toast.classList.remove(
        "is-visible"
      );

    }, duration);

}


// =========================================================
// 30. SECRET ACHIEVEMENT
// =========================================================

const achievement =
  document.getElementById("achievement");

const achievementText =
  document.getElementById(
    "achievementText"
  );


let achievementTimer = null;


function showAchievement(text) {

  clearTimeout(
    achievementTimer
  );


  achievementText.textContent =
    text;


  achievement.classList.add(
    "is-visible"
  );


  achievementTimer =
    setTimeout(() => {

      achievement.classList.remove(
        "is-visible"
      );

    }, 4300);

}


// =========================================================
// 31. OVERLAY HELPERS
// =========================================================

function openOverlay(element) {

  if (!element) return;


  element.classList.add(
    "is-open"
  );


  element.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.classList.add(
    "overlay-open"
  );

}


function closeOverlay(element) {

  if (!element) return;


  element.classList.remove(
    "is-open"
  );


  element.setAttribute(
    "aria-hidden",
    "true"
  );


  requestAnimationFrame(() => {

    const anyOverlayOpen =
      document.querySelector(
        ".overlay.is-open"
      );


    if (!anyOverlayOpen) {

      document.body.classList.remove(
        "overlay-open"
      );

    }

  });

}


// =========================================================
// 32. VIDEO HELPERS
// =========================================================

function stopVideosInside(element) {

  if (!element) return;


  element
    .querySelectorAll("video")
    .forEach((video) => {

      video.pause();

    });

}


// =========================================================
// 33. RELATIONSHIP COUNTER
// =========================================================

const relationshipStart =
  new Date(
    "2025-06-08T00:00:00+07:00"
  );


const daysElement =
  document.getElementById("days");

const hoursElement =
  document.getElementById("hours");

const minutesElement =
  document.getElementById("minutes");

const secondsElement =
  document.getElementById("seconds");


function updateRelationshipTimer() {

  const now =
    new Date();


  const difference =
    now.getTime() -
    relationshipStart.getTime();


  if (difference < 0) {

    daysElement.textContent =
      "0";

    hoursElement.textContent =
      "00";

    minutesElement.textContent =
      "00";

    secondsElement.textContent =
      "00";

    return;

  }


  const totalSeconds =
    Math.floor(
      difference / 1000
    );


  const days =
    Math.floor(
      totalSeconds / 86400
    );


  const hours =
    Math.floor(
      (
        totalSeconds %
        86400
      ) / 3600
    );


  const minutes =
    Math.floor(
      (
        totalSeconds %
        3600
      ) / 60
    );


  const seconds =
    totalSeconds % 60;


  daysElement.textContent =
    days;


  hoursElement.textContent =
    String(hours).padStart(
      2,
      "0"
    );


  minutesElement.textContent =
    String(minutes).padStart(
      2,
      "0"
    );


  secondsElement.textContent =
    String(seconds).padStart(
      2,
      "0"
    );

}


updateRelationshipTimer();


setInterval(
  updateRelationshipTimer,
  1000
);


// =========================================================
// 34. MUSIC
// =========================================================

async function tryStartMusic() {

  const source =
    backgroundMusic?.querySelector(
      "source"
    );


  if (!source) {

    return;

  }


  backgroundMusic.volume =
    0.28;


  try {

    await backgroundMusic.play();


    state.musicOn =
      true;


    musicButton.textContent =
      "♫";

  }

  catch {

    state.musicOn =
      false;


    musicButton.textContent =
      "♪";

  }

}


musicButton.addEventListener(
  "click",
  async () => {

    const source =
      backgroundMusic?.querySelector(
        "source"
      );


    if (!source) {

      showToast(
        "AUDIO",
        "no song yet.",
        2600
      );

      return;

    }


    if (backgroundMusic.paused) {

      try {

        backgroundMusic.volume =
          0.28;


        await backgroundMusic.play();


        state.musicOn =
          true;


        musicButton.textContent =
          "♫";

      }

      catch {

        showToast(
          "AUDIO",
          "try again.",
          2500
        );

      }

    }

    else {

      backgroundMusic.pause();


      state.musicOn =
        false;


      musicButton.textContent =
        "♪";

    }

  }
);


// =========================================================
// 35. ESCAPE KEY
// =========================================================

document.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key !== "Escape"
    ) {
      return;
    }


    const closableOverlays = [

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


    closableOverlays.forEach(
      (overlay) => {

        if (
          overlay &&
          overlay.classList.contains(
            "is-open"
          )
        ) {

          stopVideosInside(
            overlay
          );


          closeOverlay(
            overlay
          );

        }

      }
    );

  }
);


// =========================================================
// 36. INITIALIZE
// =========================================================

function initializeGame() {

  // Reset visual quest state.

  REQUIRED_ITEMS.forEach(
    (itemName) => {

      const object =
        getWorldObject(itemName);


      object?.classList.remove(
        "is-found"
      );

    }
  );


  bonusProgress.textContent =
    "0 / 1";


  questTitle.textContent =
    "find all the little things.";


  updateQuest();

}


initializeGame();
