const Board = [800, 500];
const Sprites = {
    cards: [[], [], [], []],
};
const GameProperties = {};
const GameObjects = [];
function renderGameObject(zIndex = true) {
    let neeGameObjects = zIndex ? _.sortBy(GameObjects, ["zIndex"]) : GameObjects;
    neeGameObjects.forEach((e) => {
        e?.render?.();
    });
}
function renderGameInfo() {
    if (frameCount && frameCount % 10 == 0) {
        document.querySelector(".frame").textContent = `FPS : ${round(frameRate())}`;
    }
}
function preload() {
    GameProperties.cardsPile = new CardsPile();
    GameProperties.cardsPile.newPile();
    for (let i = 0; i < 4; i++) {
        for (let x = 2; x <= 14; x++) {
            Sprites["cards"][i].push(loadImage(`/assets/${x}.${i + 1}.png`, undefined, () => alert("error")));
        }
    }
}

function setup() {
    frameRate(60);
    createCanvas(...Board);
    GameObjects.push(new Cards(2, 0, 0, 0, 10));
    GameObjects.push(new Cards(14, 2, 50, 0, 100));
}

function draw() {
    background(225);
    renderGameObject();
    renderGameInfo();
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
}
class Cards extends GameObject {
    constructor(cardNumber = 2, cardType = 0, x = 0, y = 0, zIndex = 1) {
        if (cardNumber > 14 || cardNumber < 2) cardNumber = 2;
        if (cardType > 4 || cardType < 1) cardType = 1;
        super();
        this.ace = cardNumber == 14;
        this.value = this.ace ? [1, 11] : cardNumber < 10 ? cardNumber : 10;
        this.width = 68;
        this.height = 100;
        this.x = x;
        this.y = y;
        this.zIndex = zIndex;
        this.image = Sprites["cards"][cardType][cardNumber - 2];
    }
    render() {
        image(this.image, this.x, this.y, this.width, this.height);
    }
}
