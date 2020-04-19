import { Application, Container, Texture, Sprite, Point, Rectangle } from 'pixi.js'

export interface Node{
	gridX:number;
    gridY:number;
	pos:PIXI.Point;
    active:boolean;
    drawn:boolean;
    debug:boolean;
} 

export interface Square{
    binary:number;
    rectangle:Rectangle;
} 

export class GameScreen {

    private sponge:PIXI.Sprite;
    private sponge_mask:PIXI.Graphics;

    private mask_draw:PIXI.Graphics;
    
    private node_draw:PIXI.Graphics;
    private node_outline:PIXI.Graphics;

    private nodes:Node[][] = [];
    private nodeDistance:number = 20;

    private squares:Square[] = [];

    private isMouseDown:boolean = false;
    private mousePos:PIXI.Point = new PIXI.Point(-1,-1);

    private deleteRadius:number = 20;

    /**
     * @param app pixi application
     */
    constructor( private app:Application ){
        this.sponge = new PIXI.Sprite(Texture.from("sponge_brown"));
        this.sponge.width = app.screen.width;
        this.sponge.height = app.screen.height;

        this.sponge_mask = new PIXI.Graphics();
        this.sponge_mask.width = this.sponge.width;
        this.sponge_mask.height = this.sponge.height;

        this.sponge_mask.beginFill(0x000000);
        this.sponge_mask.drawRect(0, 0, this.sponge.width, this.sponge.height*.5);
        //this.sponge_mask.beginFill(0xFFFFFF);
        //this.sponge_mask.beginHole();
        //this.sponge_mask.drawRect(0, 0, this.sponge.width*.5, this.sponge.height*.5);
        //this.sponge_mask.endHole();
        this.sponge_mask.endFill();

        this.sponge.mask = this.sponge_mask;

        app.stage.addChild(this.sponge);
        //app.stage.addChild(this.sponge_mask);

        let nodeAmountX:number = Math.floor( this.app.screen.width / this.nodeDistance );
        let nodeAmountY:number = Math.floor( this.app.screen.height / this.nodeDistance );
        for(let nodeX:number = 0; nodeX < nodeAmountX; nodeX++ ){
            this.nodes[nodeX] = [];
            for(let nodeY:number = 0; nodeY < nodeAmountY; nodeY++ ){
                this.nodes[nodeX][nodeY] = { gridX:nodeX, gridY:nodeY, pos:new PIXI.Point(nodeX*this.nodeDistance, nodeY*this.nodeDistance), active:false, drawn:false , debug:false };
                
                let squareCount:number = nodeX * nodeAmountY + nodeY;
                this.squares[squareCount] = { binary:0b0000, rectangle:new PIXI.Rectangle(nodeX*this.nodeDistance, nodeY*this.nodeDistance, this.nodeDistance, this.nodeDistance ) };
            }
        }

        this.node_draw = new PIXI.Graphics();
        this.drawNodeVisual();
        app.stage.addChild(this.node_draw);

        this.mask_draw = new PIXI.Graphics();
        app.stage.addChild(this.mask_draw);

        app.stage.on( "mousedown", this.onMouseDown.bind(this) );
        app.stage.on( "mouseup", this.onMouseUp.bind(this) );
        app.stage.on( "mousemove", this.onMouseMove.bind(this) );

        app.stage.interactive = true;

        app.ticker.add(delta => this.gameLoop(delta));

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
    

    private onMouseDown(ev){
        this.mousePos.set( ev.data.global.x, ev.data.global.y );
        this.isMouseDown = true;
    }

    private onMouseUp(ev){
        this.isMouseDown = false;
    }

    private onMouseMove(ev){
        if(this.isMouseDown){
            this.mousePos.set( ev.data.global.x, ev.data.global.y );
        }
    }

    private gameLoop(delta:number){
        if(this.isMouseDown){
            
            let toplLeftNodeX:number = Math.floor( (this.mousePos.x - this.deleteRadius) / this.nodeDistance );
            let toplLeftNodeY:number = Math.floor( (this.mousePos.y - this.deleteRadius) / this.nodeDistance );

            let btmRightNodeX:number = Math.ceil( (this.mousePos.x + this.deleteRadius) / this.nodeDistance );
            let btmRightNodeY:number = Math.ceil( (this.mousePos.y + this.deleteRadius) / this.nodeDistance ); 

            let nodeChange:boolean = false;

            if(toplLeftNodeX < 0) toplLeftNodeX = 0;
            if(toplLeftNodeY < 0) toplLeftNodeY = 0;
            if(btmRightNodeX > this.nodes.length-1) btmRightNodeX = this.nodes.length-1;
            if(btmRightNodeY > this.nodes[0].length-1) btmRightNodeY = this.nodes[0].length-1;

            for(let nodeX:number = toplLeftNodeX; nodeX < btmRightNodeX; nodeX++ ){
                for(let nodeY:number = toplLeftNodeY; nodeY < btmRightNodeY; nodeY++ ){
                    let checkNode:Node = this.nodes[nodeX][nodeY];
                    if( checkNode && checkNode.active == false && this.getDistance(checkNode.pos.clone(), this.mousePos) < this.deleteRadius ){
                        checkNode.active = true;
                        nodeChange = true;
                    }
                }
            }

            if(nodeChange){
                this.drawNodeVisual();
                this.drawMask();
            }
        }
    }


    private getDistance( pos1:PIXI.Point, pos2:PIXI.Point) {
        let distX:number = pos1.x - pos2.x;
        let distY:number = pos1.y - pos2.y;
        
        return Math.sqrt( distX*distX + distY*distY );
    }


    private drawNodeVisual(){
        //this.node_draw.clear();
        this.node_draw.beginFill(0x000000);

        for(let nodeX:number = 0; nodeX < this.nodes.length; nodeX++ ){
            for(let nodeY:number = 0; nodeY < this.nodes[0].length; nodeY++ ){
                if( this.nodes[nodeX][nodeY].active && !this.nodes[nodeX][nodeY].debug ){
                    this.node_draw.drawCircle(this.nodes[nodeX][nodeY].pos.x, this.nodes[nodeX][nodeY].pos.y, 2);
                    this.nodes[nodeX][nodeY].debug = true;
                }
            }
        }

        this.node_draw.endFill();

        //this.node_draw.beginFill(0x00FF00);
        //this.node_draw.drawCircle(this.mousePos.x, this.mousePos.y, this.deleteRadius);
        //this.node_draw.endFill();
    }


    private drawMask(){
        this.node_draw.beginFill(0x000000);

        for(let nodeX:number = 0; nodeX < this.nodes.length-1; nodeX++ ){
            for(let nodeY:number = 0; nodeY < this.nodes[0].length-1; nodeY++ ){
                let squareBinary:number = 0b0000;

                if( this.nodes[nodeX][nodeY].active ){ squareBinary += 0b1000 } //top left node
                if( this.nodes[nodeX+1][nodeY].active ){ squareBinary += 0b0100 } //top right node
                if( this.nodes[nodeX][nodeY+1].active ){ squareBinary += 0b0010 } //bottom left node
                if( this.nodes[nodeX+1][nodeY+1].active ){ squareBinary += 0b0001 } //bottom right node

                let squareCount:number = nodeX * this.nodes[0].length + nodeY;
                if(squareBinary != this.squares[squareCount].binary ){
                    this.squares[squareCount].binary = squareBinary;

                    let squareRect:PIXI.Rectangle = this.squares[squareCount].rectangle;
                    let polygonPath:PIXI.Point[] = [];

                    switch(squareBinary){
                        case 0b0000: //all off
                        break;
                        case 0b0001: //only bottom right
                            polygonPath.push( new PIXI.Point( squareRect.x+squareRect.width, squareRect.y+squareRect.height*.5 ) );
                            polygonPath.push( new PIXI.Point( squareRect.x+squareRect.width, squareRect.y+squareRect.height ) );
                            polygonPath.push( new PIXI.Point( squareRect.x+squareRect.width*.5, squareRect.y+squareRect.height ) );
                        break;
                        case 0b0010: // only bottom left
                            polygonPath.push( new PIXI.Point( squareRect.x, squareRect.y+squareRect.height*.5 ) );
                            polygonPath.push( new PIXI.Point( squareRect.x+squareRect.width*.5, squareRect.y+squareRect.height ) );
                            polygonPath.push( new PIXI.Point( squareRect.x, squareRect.y+squareRect.height ) );
                        break;
                        case 0b0011: //both bottom
                            polygonPath.push( new PIXI.Point( squareRect.x, squareRect.y+squareRect.height*.5 ) );
                            polygonPath.push( new PIXI.Point( squareRect.x+squareRect.width, squareRect.y+squareRect.height*.5 ) );
                            polygonPath.push( new PIXI.Point( squareRect.x+squareRect.width, squareRect.y+squareRect.height ) );
                            polygonPath.push( new PIXI.Point( squareRect.x, squareRect.y+squareRect.height ) );
                        break;
                        case 0b0100: //only top right
                            polygonPath.push( new PIXI.Point( squareRect.x+squareRect.width*.5, squareRect.y) );
                            polygonPath.push( new PIXI.Point( squareRect.x+squareRect.width, squareRect.y ) );
                            polygonPath.push( new PIXI.Point( squareRect.x+squareRect.width, squareRect.y+squareRect.height*.5 ) );
                        break;
                        case 0b0101: //both right     
                            polygonPath.push( new PIXI.Point( squareRect.x+squareRect.width*.5, squareRect.y ) );
                            polygonPath.push( new PIXI.Point( squareRect.x+squareRect.width, squareRect.y ) );
                            polygonPath.push( new PIXI.Point( squareRect.x+squareRect.width, squareRect.y+squareRect.height ) );
                            polygonPath.push( new PIXI.Point( squareRect.x+squareRect.width*.5, squareRect.y+squareRect.height ) );
                        break;
                        case 0b0110:
                        break;
                        case 0b0111: // missing top left
                            polygonPath.push( new PIXI.Point( squareRect.x+squareRect.width*.5, squareRect.y) );
                            polygonPath.push( new PIXI.Point( squareRect.x+squareRect.width, squareRect.y ) );
                            polygonPath.push( new PIXI.Point( squareRect.x+squareRect.width, squareRect.y+squareRect.height ) );
                            polygonPath.push( new PIXI.Point( squareRect.x, squareRect.y+squareRect.height ) );
                            polygonPath.push( new PIXI.Point( squareRect.x, squareRect.y+squareRect.height*.5 ) );
                        break;
                        case 0b1000: // only top left
                            polygonPath.push( new PIXI.Point( squareRect.x, squareRect.y) );
                            polygonPath.push( new PIXI.Point( squareRect.x+squareRect.width*.5, squareRect.y ) );
                            polygonPath.push( new PIXI.Point( squareRect.x, squareRect.y+squareRect.height*.5 ) );
                        break;
                        case 0b1001:
                        break;
                        case 0b1010: //both left
                            polygonPath.push( new PIXI.Point( squareRect.x, squareRect.y ) );
                            polygonPath.push( new PIXI.Point( squareRect.x+(squareRect.width*.5), squareRect.y ) );
                            polygonPath.push( new PIXI.Point( squareRect.x+squareRect.width*.5, squareRect.y+squareRect.height ) );
                            polygonPath.push( new PIXI.Point( squareRect.x, squareRect.y+squareRect.height ) );
                        break;
                        case 0b1011: // missing top right
                            polygonPath.push( new PIXI.Point( squareRect.x, squareRect.y) );
                            polygonPath.push( new PIXI.Point( squareRect.x+squareRect.width*.5, squareRect.y ) );
                            polygonPath.push( new PIXI.Point( squareRect.x+squareRect.width, squareRect.y+squareRect.height*.5 ) );
                            polygonPath.push( new PIXI.Point( squareRect.x+squareRect.width, squareRect.y+squareRect.height ) );
                            polygonPath.push( new PIXI.Point( squareRect.x, squareRect.y+squareRect.height ) );
                        break;
                        case 0b1100: // both top
                            polygonPath.push( new PIXI.Point( squareRect.x, squareRect.y ) );
                            polygonPath.push( new PIXI.Point( squareRect.x+(squareRect.width), squareRect.y ) );
                            polygonPath.push( new PIXI.Point( squareRect.x+squareRect.width, squareRect.y+squareRect.height*.5 ) );
                            polygonPath.push( new PIXI.Point( squareRect.x, squareRect.y+squareRect.height*.5 ) );
                        break;
                        case 0b1101: // missing bottom left
                            polygonPath.push( new PIXI.Point( squareRect.x, squareRect.y) );
                            polygonPath.push( new PIXI.Point( squareRect.x+squareRect.width, squareRect.y ) );
                            polygonPath.push( new PIXI.Point( squareRect.x+squareRect.width, squareRect.y+squareRect.height ) );
                            polygonPath.push( new PIXI.Point( squareRect.x+squareRect.width*.5, squareRect.y+squareRect.height ) );
                            polygonPath.push( new PIXI.Point( squareRect.x, squareRect.y+squareRect.height*.5 ) );
                        break;
                        case 0b1110: // missing bottom right
                            polygonPath.push( new PIXI.Point( squareRect.x, squareRect.y) );
                            polygonPath.push( new PIXI.Point( squareRect.x+squareRect.width, squareRect.y ) );
                            polygonPath.push( new PIXI.Point( squareRect.x+squareRect.width, squareRect.y+squareRect.height*.5 ) );
                            polygonPath.push( new PIXI.Point( squareRect.x+squareRect.width*.5, squareRect.y+squareRect.height ) );
                            polygonPath.push( new PIXI.Point( squareRect.x, squareRect.y+squareRect.height ) );
                        break;
                        case 0b1111: // full
                            polygonPath.push( new PIXI.Point( squareRect.x, squareRect.y ) );
                            polygonPath.push( new PIXI.Point( squareRect.x+squareRect.width, squareRect.y ) );
                            polygonPath.push( new PIXI.Point( squareRect.x+squareRect.width, squareRect.y+squareRect.height ) );
                            polygonPath.push( new PIXI.Point( squareRect.x, squareRect.y+squareRect.height ) );
                        break;
                    }

                    this.node_draw.drawPolygon( polygonPath );
                }
                /*let tl:boolean = this.nodes[nodeX][nodeY].active; //top left node
                let tr:boolean = this.nodes[nodeX+1][nodeY].active; //top right node
                let bl:boolean = this.nodes[nodeX][nodeY+1].active; //bottom left node
                let br:boolean = this.nodes[nodeX+1][nodeY+1].active; //bottom right node

                /let squareBinary:number = ParseInt("0b"+tl+tr+bl+br);

                let nodeArray:boolean[] = [tl, tr, bl, br];
                for( let i:number = 0; i < 4; i++ ){
                    for( let k:number = 0; k < 4; k++ ){
                        if( nodeArray[i] && nodeArray[k]){

                        }
                    }
                }

                if(!tl && !tr && !bl && !br){

                }*/

                /*if( this.nodes[nodeX][nodeY].active ){
                    this.node_draw.drawCircle(this.nodes[nodeX][nodeY].pos.x, this.nodes[nodeX][nodeY].pos.y, 2);
                }*/
            }
        }

        this.node_draw.endFill();

        /*this.node_draw.beginFill(0x00FF00);
        this.node_draw.drawCircle(this.mousePos.x, this.mousePos.y, this.deleteRadius);
        this.node_draw.endFill();*/
    }


    private resize() {
        this.app.renderer.resize(window.innerWidth, window.innerHeight);
    }
}