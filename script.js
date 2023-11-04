//* variables
const Board = [800, 500];
const Sprites = {
    cards: [[], [], [], []],
};
const CARD_WIDTH = 68;
const CARD_HEIGHT = 100;
const FRAME_RATE = 60;
const AnimationTiming = {
    tableCards: {
        //* timing cards squares animation
        frame: 0,
        increment: _.round(FRAME_RATE / 12),
    },
    tableInfo: {
        //* timing middle squares animation
        frame: _.round(FRAME_RATE * 0.5),
        increment: _.round(FRAME_RATE / 6),
    },
};
const GameAnimation = {};
const GameProperties = {};
const GameObjects = [];
//* utility
function searchObject(classname = "") {
    return _.filter(GameObjects, (e) => e.constructor.name == classname);
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
//* core function
function preload() {
    GameProperties.GUI = {
        cardPos: [], //* 10 squares for players cards [x,y]
        infoPos: [], //* middle square position [x,y]
        pilePos: [],
        background: [255, 225], //* background animation [from,to]
    };
    GameAnimation.pile = { x: 0, y: -200 };
    GameAnimation.bet = [
        { x: 400, y: 200 },
        { x: 400, y: 200 },
        { x: 400, y: 200 },
        { x: 400, y: 200 },
        { x: 400, y: 200 },
        { x: 400, y: 200 },
    ];
    GameAnimation.cards = [];
    let margin = CARD_WIDTH * 0.5; //* player cards margin (right margin)
    let midWidth = CARD_WIDTH * 2.75 + margin; //* middle squares width
    for (let i = 0; i < 10; i++) {
        if (i < 5) {
            GameProperties.GUI.cardPos.push([50 + (CARD_WIDTH + margin) * i, 50]);
        } else {
            if (i == 5) GameProperties.GUI.pilePos = [55 + (CARD_WIDTH + margin) * i, 50];
            GameProperties.GUI.cardPos.push([50 + (CARD_WIDTH + margin) * (i - 5), Board[1] - 50 - CARD_HEIGHT]);
        }
    }
    for (let i = 0; i < 2; i++) {
        GameProperties.GUI.infoPos.push([50 + (midWidth + margin) * i, 50 + CARD_HEIGHT + 50]);
    }
    for (let i = 0; i < 4; i++) {
        for (let x = 2; x <= 14; x++) {
            Sprites["cards"][i].push(loadImage(`/assets/${x}.${i + 1}.png`, undefined, () => alert("error loading content! please reload or report it to the dev!")));
        }
    }
    let backSideSkin = _.random(1, 8, false);
    Sprites["backside"] = loadImage(`/assets/backside/Back${backSideSkin}.png`, undefined, () => alert("error loading content! please reload or report it to the dev!"));
}

function setup() {
    frameRate(FRAME_RATE);
    createCanvas(...Board);
    GameObjects.push(new Game());
    GameObjects.push(new Bet());
    let bet = searchObject("Bet")?.[0];
    if (bet) {
        for (let i = 0; i < bet.buttons.length; i++) {
            gsap.to(GameAnimation.bet[i], { x: 0, y: 0, delay: 2 + i * 0.1 });
        }
    }
    gsap.to(GameAnimation.pile, { y: 0, delay: 2 });
}

function draw() {
    background(GameProperties.GUI.background);
    renderTable();
    renderGameObject();
    renderGameProperties();
    renderGameInfo();
}
//* rendering function
function renderGameObject(zIndex = true) {
    let newGameObjects = zIndex ? _.sortBy(GameObjects, ["zIndex"]) : GameObjects;
    newGameObjects.forEach((e) => {
        e?.render?.();
        e?.draw?.();
    });
}
function renderGameProperties(zIndex = false) {
    let newGameProperties = zIndex ? _.sortBy(GameProperties, ["zIndex"]) : GameProperties;
    _.forEach(newGameProperties, (e) => {
        e?.render?.();
    });
}
function renderGameInfo() {
    if (frameCount && !(frameCount % 20)) {
        document.querySelector(".frame").textContent = `FPS : ${round(frameRate())}`;
    }
}
function renderTable() {
    let tableCards = AnimationTiming.tableCards;
    let tableInfo = AnimationTiming.tableInfo;
    let margin = CARD_WIDTH * 0.5;
    let midWidth = CARD_WIDTH * 2.75 + margin;
    let padding = 3;
    push();
    strokeWeight(2);
    stroke(180);
    noFill();
    for (let i = 0; i < 10; i++) {
        if (i < 5 && frameCount >= tableCards.frame + tableCards.increment * i) {
            animS.rect(`r${i + 1}`, FRAME_RATE * 0.3, GameProperties.GUI.cardPos[i][0] + padding, GameProperties.GUI.cardPos[i][1] + padding, CARD_WIDTH - padding * 2, CARD_HEIGHT - padding * 2);
        } else if (i >= 5 && frameCount >= tableCards.frame + tableCards.increment * i) {
            animS.rect(`r${i + 1}`, FRAME_RATE * 0.3, GameProperties.GUI.cardPos[i][0] + padding, GameProperties.GUI.cardPos[i][1] + padding, CARD_WIDTH - padding * 2, CARD_HEIGHT - padding * 2);
        }
    }
    for (let i = 0; i < 2; i++) {
        if (frameCount >= tableInfo.frame + tableInfo.increment * i) {
            animS.rect(`r${i + 11}`, FRAME_RATE * 0.6, GameProperties.GUI.infoPos[i][0], GameProperties.GUI.infoPos[i][1], midWidth, CARD_HEIGHT);
        }
    }
    if (!(frameCount % 3) && GameProperties.GUI.background[0] != GameProperties.GUI.background[1]) {
        if (GameProperties.GUI.background[0] - GameProperties.GUI.background[1] > 0) {
            GameProperties.GUI.background[0] -= 1;
        } else {
            GameProperties.GUI.background[0] += 1;
        }
    }
    pop();
}
//* classes
class Game {
    constructor() {
        this.started = false;
        this.player = new Player();
        this.bot = new Player();
        this.cards = new CardsPile();
    }
    render() {
        this.player.render();
        this.bot.render(true);
        this.cards.render();
    }
}
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
class Bet {
    constructor() {
        this.value = [1, 2, 5, 10, 100, 500];
        this.pos = [];
        for (let i = 0; i < 6; i++) {
            this.pos.push([Board[0] - (50 - (i % 3) * 60) - CARD_WIDTH * 2.575, 50 * 2 + CARD_HEIGHT - 5 + _.floor(i / 3) * 60]);
        }
        this.buttons = [];
        for (let i = 0; i < 6; i++) {
            this.buttons.push(
                new Button({
                    basex: this.pos[i][0],
                    basey: this.pos[i][1],
                    x: this.pos[i][0],
                    y: this.pos[i][0],
                    cornerRadius: 999,
                    color: "#ffffff00",
                    width: 50,
                    height: 50,
                    text: `$${this.value[i]}`,
                    stroke: "#B4B4B4",
                    id: `bet-${this.value[i]}`,
                })
            );
        }
    }
    render() {
        this.buttons.forEach((e, i) => {
            e.x = e.basex + GameAnimation.bet[i].x;
            e.y = e.basey + GameAnimation.bet[i].y;
            e.draw();
        });
    }
}
class Player {
    constructor() {
        this.hand = [];
        this.value = 0;
        this.turn = false;
    }
    evalHand() {
        let result = [0, 0];
        this.hand.forEach((e) => {
            result[0] += e.ace ? 1 : e.value;
            result[1] += e.ace ? 11 : e.value;
        });
        this.value = sort(_.filter(result, (e) => e <= 21));
    }
    render(up = false) {
        this.hand.forEach((e, x) => {
            let pos = GameProperties.GUI.cardPos[(up ? 0 : 5) + x];
            e.render(...pos);
        });
    }
}
class CardsPile {
    constructor() {
        this.cards = [];
        this.picked = [];
        this.x = GameProperties?.GUI?.pilePos?.[0] || 0;
        this.y = GameProperties?.GUI?.pilePos?.[1] || 0;
        this.maxX = Board[0] - 50 - CARD_WIDTH;
        this.width = CARD_WIDTH;
        this.height = CARD_HEIGHT;
        this.margin = 8;
        this.piledCards = ceil((this.maxX - this.x) / this.margin);
        for (let i = 1; i <= 4; i++) {
            for (let x = 2; x <= 14; x++) {
                this.cards.push([x, i]);
            }
        }
        this.cards = shuffle(_.shuffle(this.cards));
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
            image(Sprites["backside"], this.maxX - i * this.margin + (GameAnimation.pile.x ?? 0), this.y + (GameAnimation.pile.y ?? 0), this.width, this.height);
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
    render(x, y) {
        image(this.image, x ?? this.x, y ?? this.y, this.width, this.height);
    }
}

class Button extends Clickable {
    constructor(
        options = {
            x: 100,
            y: 100,
            width: 60,
            height: 30,
            color: "#FFFFFF00",
            cornerRadius: 0,
            strokeWeight: 2,
            stroke: "#000000",
            text: "Press Me",
            textColor: "#000000",
            textSize: 12,
            textFont: "sans-serif",
            textScaled: false,
            image: null,
            fitImage: false,
            imageScale: 1,
            tint: null,
            noTint: true,
            filter: null,
        }
    ) {
        super();
        if (typeof options == "object") {
            _.forEach(options, (e, x) => {
                this[x] = options[x];
            });
        }
        if (GameObjects && !this.id) {
            this.id = `button-${_.filter(GameObjects, (e) => e.constructor.name == "Button").length + 1}`;
        }
    }
}

// tv