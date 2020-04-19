"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var pixi_js_1 = require("pixi.js");
var GameScreen = /** @class */ (function () {
    /**
     * @param app pixi application
     */
    function GameScreen(app) {
        var _this = this;
        this.app = app;
        this.nodes = [];
        this.nodeDistance = 20;
        this.isMouseDown = false;
        this.mousePos = new PIXI.Point(-1, -1);
        this.deleteRadius = 10;
        this.sponge = new PIXI.Sprite(pixi_js_1.Texture.from("sponge_brown"));
        this.sponge.width = app.screen.width;
        this.sponge.height = app.screen.height;
        this.sponge_mask = new PIXI.Graphics();
        this.sponge_mask.width = this.sponge.width;
        this.sponge_mask.height = this.sponge.height;
        this.sponge_mask.beginFill(0x000000);
        this.sponge_mask.drawRect(0, 0, this.sponge.width, this.sponge.height * .5);
        this.sponge_mask.endFill();
        this.sponge.mask = this.sponge_mask;
        app.stage.addChild(this.sponge);
        var nodeAmountX = this.app.screen.width / this.nodeDistance;
        var nodeAmountY = this.app.screen.height / this.nodeDistance;
        for (var nodeX = 0; nodeX < nodeAmountX; nodeX++) {
            this.nodes[nodeX] = [];
            for (var nodeY = 0; nodeY < nodeAmountY; nodeY++) {
                this.nodes[nodeX][nodeY] = { gridX: nodeX, gridY: nodeY, pos: new PIXI.Point(nodeX * this.nodeDistance, nodeY * this.nodeDistance), active: true };
            }
        }
        this.node_draw = new PIXI.Graphics();
        this.drawNodeVisual();
        app.stage.addChild(this.node_draw);
        app.stage.on("mousedown", this.onMouseDown.bind(this));
        app.stage.on("mouseup", this.onMouseUp.bind(this));
        app.stage.on("mousemove", this.onMouseMove.bind(this));
        app.stage.interactive = true;
        app.ticker.add(function (delta) { return _this.gameLoop(delta); });
        window.addEventListener('resize', this.resize.bind(this));
        this.resize();
    }
    /*const geometry = new PIXI.Geometry()
    .addAttribute('aVertexPosition', // the attribute name
        [-100, -100, // x, y
            100, -100, // x, y
            100, 100], // x, y
        2) // the size of the attribute

    .addAttribute('aUvs', // the attribute name
        [0, 0, // u, v
            1, 0, // u, v
            1, 1], // u, v
        2); // the size of the attribute

    const program = PIXI.Program.from(`
    
        precision mediump float;
    
        attribute vec2 aVertexPosition;
        attribute vec2 aUvs;
    
        uniform mat3 translationMatrix;
        uniform mat3 projectionMatrix;
    
        varying vec2 vUvs;
    
        void main() {
    
            vUvs = aUvs;
            gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    
        }`,
    
    `precision mediump float;
    
        varying vec2 vUvs;
    
        uniform sampler2D uSamplerTexture;
    
        void main() {
    
            gl_FragColor = texture2D(uSamplerTexture, vUvs);
        }
    
    `);
    
    const triangle = new PIXI.Mesh(geometry, new PIXI.Shader(program, {
        uSamplerTexture: PIXI.Texture.from('sponge_brown'),
    }));
    
    const triangle2 = new PIXI.Mesh(geometry, new PIXI.Shader(program, {
        uSamplerTexture: PIXI.Texture.from('sponge_brown'),
    }));
    
    const triangle3 = new PIXI.Mesh(geometry, new PIXI.Shader(program, {
        uSamplerTexture: PIXI.Texture.from('sponge_brown'),
    }));
    
    triangle.position.set(400, 300);
    //triangle.scale.set(2);
    
    triangle2.position.set(200, 100);
    
    triangle3.position.set(500, 400);
    //triangle3.scale.set(3);
    
    app.stage.addChild(triangle3, triangle2, triangle);
    
    //app.ticker.add((delta) => {
    //    triangle.rotation += 0.01;
    //    triangle2.rotation -= 0.01;
    //    triangle3.rotation -= 0.005;
    //});
}*/
    GameScreen.prototype.onMouseDown = function (ev) {
        this.mousePos.set(ev.data.global.x, ev.data.global.y);
        this.isMouseDown = true;
    };
    GameScreen.prototype.onMouseUp = function (ev) {
        this.isMouseDown = false;
    };
    GameScreen.prototype.onMouseMove = function (ev) {
        if (this.isMouseDown) {
            this.mousePos.set(ev.data.global.x, ev.data.global.y);
        }
    };
    GameScreen.prototype.gameLoop = function (delta) {
        if (this.isMouseDown) {
            var toplLeftNodeX = Math.floor((this.mousePos.x - this.deleteRadius) / this.nodeDistance);
            var toplLeftNodeY = Math.floor((this.mousePos.y - this.deleteRadius) / this.nodeDistance);
            var btmRightNodeX = Math.ceil((this.mousePos.x + this.deleteRadius) / this.nodeDistance);
            var btmRightNodeY = Math.ceil((this.mousePos.y + this.deleteRadius) / this.nodeDistance);
            var nodeChange = false;
            for (var nodeX = toplLeftNodeX; nodeX < btmRightNodeX; nodeX++) {
                for (var nodeY = toplLeftNodeY; nodeY < btmRightNodeY; nodeY++) {
                    var checkNode = this.nodes[nodeX][nodeY];
                    if (checkNode.active && this.getDistance(checkNode.pos, this.mousePos) < this.deleteRadius) {
                        checkNode.active = false;
                        nodeChange = true;
                    }
                }
            }
            if (nodeChange) {
                this.drawNodeVisual();
            }
        }
    };
    GameScreen.prototype.getDistance = function (pos1, pos2) {
        var distX = pos1.x - pos2.x;
        var distY = pos1.y - pos2.y;
        return Math.sqrt(distX * distX + distY * distY);
    };
    GameScreen.prototype.drawNodeVisual = function () {
        this.node_draw.clear();
        this.node_draw.beginFill(0x000000);
        for (var nodeX = 0; nodeX < this.nodes.length; nodeX++) {
            for (var nodeY = 0; nodeY < this.nodes[0].length; nodeY++) {
                if (this.nodes[nodeX][nodeY].active) {
                    this.node_draw.drawCircle(this.nodes[nodeX][nodeY].pos.x, this.nodes[nodeX][nodeY].pos.y, 2);
                }
            }
        }
        this.node_draw.endFill();
        this.node_draw.beginFill(0x00FF00);
        this.node_draw.drawCircle(this.mousePos.x, this.mousePos.y, this.deleteRadius);
        this.node_draw.endFill();
    };
    GameScreen.prototype.resize = function () {
        this.app.renderer.resize(window.innerWidth, window.innerHeight);
    };
    return GameScreen;
}());
exports.GameScreen = GameScreen;
