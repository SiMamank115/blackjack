const Board = [800, 500];
const Sprites = {
    cards: [[], [], [], []],
};
const CARD_WIDTH = 68;
const CARD_HEIGHT = 100;
const FRAME_RATE = 60;
const AnimationTiming = {
    tableCards: {
        frame: 0,
        increment: 5,
    },
};
const GameProperties = {};
const GameObjects = [];
const tableAnimation = animS.newAnimS(p5);
//* utility
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
//* core function
function preload() {
    GameProperties.cardsPile = new CardsPile();
    GameProperties.cardsPile.newPile();
    for (let i = 0; i < 4; i++) {
        for (let x = 2; x <= 14; x++) {
            Sprites["cards"][i].push(loadImage(`/assets/${x}.${i + 1}.png`, undefined, () => alert("error")));
        }
    }
    let backSideSkin = _.random(1, 8, false);
    Sprites["backside"] = loadImage(`/assets/backside/Back${backSideSkin}.png`, undefined, () => alert("error"));
}

function setup() {
    frameRate(FRAME_RATE);
    createCanvas(...Board);
    GameObjects.push(new Cards(2, 0, 0, 0, 10));
    GameObjects.push(new Cards(14, 2, 50, 0, 100));
}

function draw() {
    background(225);
    // renderGameObject();
    // renderGameProperties();
    renderTable();
    renderGameInfo();
}
//* rendering function
function renderGameObject(zIndex = true) {
    let newGameObjects = zIndex ? _.sortBy(GameObjects, ["zIndex"]) : GameObjects;
    newGameObjects.forEach((e) => {
        e?.render?.();
    });
}
function renderGameProperties(zIndex = false) {
    let newGameProperties = zIndex ? _.sortBy(GameProperties, ["zIndex"]) : GameProperties;
    _.forEach(newGameProperties, (e) => {
        e?.render?.();
    });
}
function renderGameInfo() {
    if (frameCount && frameCount % 10 == 0) {
        document.querySelector(".frame").textContent = `FPS : ${round(frameRate())}`;
    }
}
function renderTable() {
    let tableCards = AnimationTiming.tableCards;
    push();
    strokeWeight(2);
    stroke(150);
    noFill();
    for (let i = 0; i < 10; i++) {
        if (i < 5 && frameCount >= tableCards.frame + tableCards.increment * i) {
            animS.rect(`r${i + 1}`, FRAME_RATE * 0.3, 50 + CARD_WIDTH * 1.5 * i, 50, CARD_WIDTH, CARD_HEIGHT);
        } else if (i >= 5 && frameCount >= tableCards.frame + tableCards.increment * i) {
            animS.rect(`r${i + 1}`, FRAME_RATE * 0.3, 50 + CARD_WIDTH * 1.5 * (i - 5), Board[1] - 50 - CARD_HEIGHT, CARD_WIDTH, CARD_HEIGHT);
        }
    }
    pop();
}
//* classes
class GameObject {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.width = undefined;
        this.height = undefined;
        this.zIndex = 1;
        this.display = true;
    }
    render() {}
}
class Player {
    constructor() {
        this.hand = [new Cards()];
        this.value = 0;
        this.turn = false;
    }
    evalHand() {
        let result = [0, 0];
        this.hand.forEach((e) => {
            result[0] += e.ace ? 1 : e.value;
            result[1] += e.ace ? 11 : e.value;
        });
        return result;
    }
}
class CardsPile {
    constructor() {
        this.cards = [];
        this.picked = [];
        this.x = 0;
        this.y = 0;
        this.width = CARD_WIDTH;
        this.height = CARD_HEIGHT;
        this.piledCards = 6;
    }
    newPile() {
        this.cards = [];
        for (let i = 1; i <= 4; i++) {
            for (let x = 2; x <= 14; x++) {
                this.cards.push([x, i]);
            }
        }
        this.cards = shuffle(_.shuffle(this.cards));
    }
    render() {
        for (let i = 0; i < (this.cards.length > this.piledCards ? this.piledCards : this.cards.length); i++) {
            image(Sprites["backside"], this.x + i * 10, this.y, this.width, this.height);
        }
    }
}
class Cards extends GameObject {
    constructor(cardNumber = 2, cardType = 0, x = 0, y = 0, zIndex = 1) {
        if (cardNumber > 14 || cardNumber < 2) cardNumber = 2;
        if (cardType > 4 || cardType < 1) cardType = 1;
        super();
        this.ace = cardNumber == 14;
        this.value = this.ace ? [1, 11] : cardNumber < 10 ? cardNumber : 10;
        this.width = CARD_WIDTH;
        this.height = CARD_HEIGHT;
        this.x = x;
        this.y = y;
        this.zIndex = zIndex;
        this.image = Sprites["cards"][cardType][cardNumber - 2];
    }
    render() {
        image(this.image, this.x, this.y, this.width, this.height);
    }
}
