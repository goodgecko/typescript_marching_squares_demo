"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LoadingScreen = /** @class */ (function () {
    /**
     * yep, you guessed it, loads in all the assets
     * @param app pixi application - incase you want to add actual loading elements to the stage
     * @param callback the function to call when the loading is complete
     */
    function LoadingScreen(app, callback) {
        this.app = app;
        this.callback = callback;
        PIXI.Loader.shared
            .add("sponge_brown", "assets/sponge_brown.png")
            .add("sponge_purple", "assets/sponge_purple.png")
            .on("progress", this.handleLoadProgress.bind(this))
            .once("load", this.handleLoadComplete.bind(this))
            .once("error", this.handleLoadError.bind(this));
        PIXI.Loader.shared.load();
    }
    LoadingScreen.prototype.handleLoadProgress = function () {
        console.log(PIXI.Loader.shared.progress + "% loaded");
    };
    LoadingScreen.prototype.handleLoadError = function () {
        console.error("load error");
    };
    LoadingScreen.prototype.handleLoadComplete = function () {
        var _this = this;
        PIXI.Loader.shared.removeAllListeners();
        setTimeout(function () {
            _this.callback();
        }, 1000);
    };
    return LoadingScreen;
}());
exports.LoadingScreen = LoadingScreen;
