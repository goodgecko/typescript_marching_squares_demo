"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var PIXI = __importStar(require("pixi.js"));
var LoadingScreen_1 = require("./LoadingScreen");
var GameScreen_1 = require("./GameScreen");
var GameBoot = /** @class */ (function () {
    /**
     * entrance point into the game code
     * creates the pixi instance, starts the loading screen, on complete start the game screen
     */
    function GameBoot() {
        this.app = new PIXI.Application({ width: window.innerWidth, height: window.innerHeight });
        document.body.appendChild(this.app.view);
        this.startLoadingScreen();
    }
    GameBoot.prototype.startLoadingScreen = function () {
        new LoadingScreen_1.LoadingScreen(this.app, this.startGameScreen.bind(this));
    };
    GameBoot.prototype.startGameScreen = function () {
        new GameScreen_1.GameScreen(this.app);
    };
    return GameBoot;
}());
exports.GameBoot = GameBoot;
window.onload = function () {
    new GameBoot();
};
window.PIXI = PIXI;
