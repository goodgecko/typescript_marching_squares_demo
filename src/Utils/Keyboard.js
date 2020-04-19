"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Key = /** @class */ (function () {
    function Key() {
    }
    return Key;
}());
exports.Key = Key;
var Keyboard = /** @class */ (function () {
    /**
     * small class to abstract the use of keyboard inputs
     */
    function Keyboard() {
        this.keyList = [];
        this.addEventListeners();
    }
    /**
     * creates listeners for when keyboard keys are pressed and released
     */
    Keyboard.prototype.addEventListeners = function () {
        this.downHandler = this.downHandler.bind(this);
        this.upHandler = this.upHandler.bind(this);
        window.addEventListener("keydown", this.downHandler, false);
        window.addEventListener("keyup", this.upHandler, false);
    };
    /**
     * removes event listeners
     */
    Keyboard.prototype.removeEventListeners = function () {
        window.removeEventListener("keydown", this.downHandler);
        window.removeEventListener("keyup", this.upHandler);
    };
    /**
     * add a keyboard button to listen out for, e.g "W" or "ArrowRight"
     * @param value key value
     */
    Keyboard.prototype.addKey = function (value) {
        var key = new Key();
        key.value = value;
        key.isDown = false;
        key.isUp = true;
        key.press = undefined;
        key.release = undefined;
        this.keyList.push(key);
        return key;
    };
    /**
     * removes a key from the listeners
     * @param value the key to remove
     */
    Keyboard.prototype.removeKey = function (value) {
        var index = this.keyList.indexOf(value);
        if (index !== -1) {
            this.keyList.splice(index, 1);
        }
    };
    /**
     * fires when any keyboard key is pressed, it checks if the key pressed is in the list and sets the appropriate flags
     * @param event default pixi keyboard event
     */
    Keyboard.prototype.downHandler = function (event) {
        for (var i = 0; i < this.keyList.length; i++) {
            var key = this.keyList[i];
            if (event.key === key.value) {
                if (key.isUp && key.press)
                    key.press();
                key.isDown = true;
                key.isUp = false;
                event.preventDefault();
                break;
            }
        }
    };
    ;
    /**
     * fires when any keyboard key is released, it checks if the key pressed is in the list and sets the appropriate flags
     * @param event default pixi keyboard event
     */
    Keyboard.prototype.upHandler = function (event) {
        for (var i = 0; i < this.keyList.length; i++) {
            var key = this.keyList[i];
            if (event.key === key.value) {
                if (key.isDown && key.release)
                    key.release();
                key.isDown = false;
                key.isUp = true;
                event.preventDefault();
                break;
            }
        }
    };
    ;
    return Keyboard;
}());
exports.Keyboard = Keyboard;
