var tileset = [];
var stage;
var mapData;

var key_left;
var key_right;
var key_up;
var key_down;
var update_anim;


// var keyDn=false;
// var keys = 0;
// var pressed=0;
var img_actor;
var player;
var tileproperties = {};
var mapLayers = {};
var mapContainer = {};
var map = {};
var mapLayers = {};

var speed_walk = 3;
var speed_drive = 6;


// Current attempted motion by the player
// var Motion = {
//     // PLACED: 'Placed',
//     STATIONERY: 'Stationery',
//     MOVING_UP: 'Moving up',
//     MOVING_UP_LEFT: 'Moving up and to the left',
//     MOVING_UP_RIGHT: 'Moving up and to the right',
//     MOVING_RIGHT: 'Moving right',
//     MOVING_DOWN: 'Moving down',
//     MOVING_DOWN_LEFT: 'Moving down to the left',
//     MOVING_DOWN_RIGHT: 'Moving down to the right',
//     MOVING_LEFT: 'Moving left',
// };

// // Stores current player position and status
// var PLAYER = {
//     sector: 0,
//     x: 5,
//     y: 5,
//     sprite: SPRITES['PlayerRight'],
//     status: Motion.STATIONERY,
//     $: null,
//     before: null,
//     after: null,
// };

window.onload = function()
{
	//canvas = document.getElementById("game");
	// json map data at the end of this file for ease of understanding (created on Tiled map editor)
	mapData = mapDataJson;

	// creating EaselJS stage
	stage = new createjs.Stage("game");
	stage.x = mapData.height/2 * -1 * 32 - 32*8;
	stage.y = mapData.width/2 * -1 * 16 - 16*8;

	// var test1 = {1:"hello"}
	// var test2 = {2:"world"}
	// var test3 = Object.extend(test1, test2); 
	// console.log(test3[2])

	var circle = new createjs.Shape();
    circle.graphics.beginFill("red").drawCircle(0, 0, 5);
    circle.x = stage.canvas.width/2 - stage.x;
    circle.y = stage.canvas.height/2 - stage.y;

    mapContainer = new createjs.Container();
    for (var i=0;i<3;i++){
    	map[i] = new createjs.Container();
    	mapLayers[i] = {};
    	for (var j=0;j<mapData.height*2;j++){
	    	mapLayers[i][j] = new createjs.Container();
	    	map[i].addChild(mapLayers[i][j]);
	    }
    }
	
	// create EaselJS image for tileset
	//tileset = new Image();
	// getting imagefile from first tileset
	//tileset.src = mapData.tilesets[0].image;
	// callback for loading layers after tileset is loaded
	//tileset.onLoad = initLayers();

	initLayers();
	document.onkeydown=handleKeyDown;
	document.onkeyup=handleKeyUp;

	img_actor = new Image();
	img_actor.src = "assets/actor_x156.png";
	//img_actor.filters = [ new createjs.ColorFilter(0,0,0,1, 0,0,255,0)]
	spriteSheet = new createjs.SpriteSheet({
		framerate: 1,
		images: [img_actor],
		frames: {width:39, height:64},
		animations: {
			wkDown:[0,3, "wkDown", 1/3], 
			wkLeft:[4,7, "wkLeft", 1/3], 
			wkRight:[8,11, "wkRight", 1/3], 
			wkUp:[12,15, "wkUp", 1/3], 
			wkDownLeft:[16,19, "wkDownLeft", 1/3], 
			wkDownRight:[20,23, "wkDownRight", 1/3], 
			wkUpLeft:[24,27, "wkUpLeft", 1/3], 
			wkUpRight:[28,31, "wkUpRight", 1/3]
		}
	});

	player = new createjs.Sprite(spriteSheet);
	player.regX = 39/2;
	player.regY = 64/4;
	player.gotoAndStop("wkDown");
	player.x = stage.canvas.width/2  - stage.x;
	player.y = stage.canvas.height/2 - 32  - stage.y;
	//console.log(stage.canvas.width/2)
	for (var key in map){
		mapContainer.addChild(map[key]);
	}
	stage.addChild(mapContainer);
	//stage.addChild(circle);
	map[2].addChild(player);

	setPlayerStart({x:2,y:2})
}

// loading layers
function initLayers() {
	for (var i=0; i < mapData.tilesets.length; i++){
    	tileset.push(new Image());
    	tileset[i].src = mapData.tilesets[i].image;
    }
	// compose EaselJS tileset from image (fixed 64x64 now, but can be parametized)
	var w = mapData.tilesets[0].tilewidth;
	var h = mapData.tilesets[0].tileheight;
	var imageData = {
		images : tileset,
		frames : {
			width : w,
			height : h
		}
	};

	// create spritesheet
	var tilesetSheet = new createjs.SpriteSheet(imageData);
	tileproperties = getTileProperties(mapData.tilesets);
	//console.log(tileproperties)
	// loading each layer at a time
	//for (var idx = 0; idx < mapData.layers.length; idx++) {
		//var layerData = mapData.layers[idx];
	var layerBackground = mapData.layers[0];
	var layerGround = mapData.layers[1];
	initLayer(layerBackground, tilesetSheet, mapData.tilewidth, mapData.tileheight, tileproperties);
	initLayer(layerGround, tilesetSheet, mapData.tilewidth, mapData.tileheight, tileproperties);
		//if (layerData.type == 'tilelayer')
			
	//}
	// stage updates (not really used here)
	createjs.Ticker.setFPS(30);
	createjs.Ticker.addEventListener("tick", tick);

	//setInterval(function(){animPlayer()}, 500); 
}

// layer initialization
function initLayer(layerData, tilesetSheet, tilewidth, tileheight, tileproperties) {
	var layer = 2;
	if (layerData.properties != null)
		layer = layerData.properties.layer || 2;

	for ( var y = 0; y < layerData.height; y++) {
		for ( var x = 0; x < layerData.width; x++) {
			// create a new Bitmap for each cell
			var cellBitmap = new createjs.Sprite(tilesetSheet);
			// layer data has single dimension array
			var idx = x + y * layerData.width;
			var tileId = layerData.data[idx] - 1;
			// tilemap data uses 1 as first value, EaselJS uses 0 (sub 1 to load correct tile)
			cellBitmap.gotoAndStop(tileId);
			// isometrix tile positioning based on X Y order from Tiled
			cellBitmap.x = x * tilewidth/2 - y * tilewidth/2 + layerData.height*tilewidth/2 - tileheight - 64;
			cellBitmap.y = y * tileheight/2 + x * tileheight/2 + layerData.height*tileheight/2 + tileheight - 32;
			
			var variableLayer = getIsoFromCartesian({x:cellBitmap.x, y:cellBitmap.y}).y-2//Math.round(cellBitmap.y/tileheight)-9;//getIsoXYFromPosition({x:cellBitmap.x, y:cellBitmap.y}).x-16;
			variableLayer*=2
			var distanceFromBase = 0;
			if (tileproperties[tileId.toString()] != null)
				distanceFromBase = parseInt(tileproperties[tileId.toString()].base) + 1 || 1;
			variableLayer+=(distanceFromBase*2);

			mapLayers[layer][variableLayer].addChild(cellBitmap);
			
		}
	}
}

function getTileProperties(tilesets){
	var tileproperties = {}
	for (var i=0; i<tilesets.length;i++){
		var firstgid = tilesets[i].firstgid - 1;
		if (tilesets[i].tileproperties != null){
			for (var key in tilesets[i].tileproperties){
				var tempKey = (parseInt(key) + firstgid).toString();
				tileproperties[tempKey] = tilesets[i].tileproperties[key];
			}
		}
	}
	return tileproperties;
}


// function test(){
// 	var i = 0;
// 	if (key_up) i++;
// 	if (key_right) i++;
// 	if (key_left) i++;
// 	if (key_down) i++;
// 	if (i == 2)
// 		keyDn=false;
// 	return i;
// }

function test2(){

}

function handleKeyDown(e){
	if (!e){var e = window.event;}
	// if (test() > pressed){
	// 	pressed = test();
	// 	//keyDn=false;
	// }

	switch(e.keyCode){
		case 37: if(!key_left){key_right=false;key_left=true; update_anim=true;} break; //left
		case 38: if(!key_up){key_up=true;key_down=false; update_anim=true;} break; //up
		case 39: if(!key_right){key_right=true;key_left=false; update_anim=true;} break; //right
		case 40: if(!key_down){key_up=false;key_down=true; update_anim=true;} break; //down
	}
}

function handleKeyUp(e){
	if (!e){var e = window.event;}
	switch(e.keyCode){
		case 37: if(!(key_up || key_down))player.gotoAndStop("wkLeft");key_left=false;update_anim=true; break; //left
		case 38: if(!(key_left || key_right))player.gotoAndStop("wkUp");key_up=false;update_anim=true; break; //up
		case 39: if(!(key_up || key_down))player.gotoAndStop("wkRight");key_right=false;update_anim=true; break; //right
		case 40: if(!(key_left || key_right))player.gotoAndStop("wkDown");key_down=false;update_anim=true; break; //down
	}
}

//uses ISO
function setPlayerStart(mapPos){

	offset = getCartesianFromIso(mapPos);
	console.log(offset);
	mapContainer.x += offset.x*-1
	mapContainer.y += offset.y*-1
	player.x += offset.x;
	player.y += offset.y;
}

//returns cartesian
function getXY(){
	var x = mapContainer.x*-1;
	var y = mapContainer.y*-1;
	return {x:x,y:y};
}

function getCartesianFromIso(mapPos){
	mapPos.x = mapPos.x*64
    mapPos.y = mapPos.y*64
    mapPos.x = mapPos.x - mapPos.y/2;
    mapPos.y = mapPos.x + mapPos.y/2;
    return mapPos;
}
//uses ISO
function getIsoFromCartesian(mapPos){
	var x = Math.round((mapPos.x + 2*mapPos.y)/64);
    var y = Math.round((2*mapPos.y - mapPos.x)/64);
    return { x : x, y : y};
}

//returns ISO
function getFuturePosition(){
	var mapPos = getXY();
	if (key_left)
		mapPos.x -= speed_walk;
	if (key_right)
		mapPos.x += speed_walk;
	if (key_up)
		mapPos.y -= speed_walk/2;
	if (key_down)
		mapPos.y += speed_walk/2;
	return getIsoFromCartesian(mapPos);
}

function getTileIdsFromPosition(mapPos){
	var tileIds = [];
	for (var i=0;i<mapData.layers.length;i++){
		tileIds.push(mapData.layers[i].data[mapPos.x+mapPos.y*mapData.height] - 1)
	}
	
	return tileIds;
}

function hasProperties(tileId){
	return (tileproperties[tileId] != null)
}

function isWalkable(tileId){
	if (tileId == 0 || tileId == NaN)
		return false;
	return true
}

function updateAnim(){
	if (key_up && key_right){
		//if (keyDn == false){
			player.gotoAndPlay("wkUpRight");
			//keyDn=true;
		//}
	} else if (key_up && key_left){
		//if (keyDn == false){
			player.gotoAndPlay("wkUpLeft");
			//keyDn=true;
		//}
	} else if (key_down && key_right){
		//if (keyDn == false){
			player.gotoAndPlay("wkDownRight");
			//keyDn=true;
		//}
	} else if (key_down && key_left){
		//if (keyDn == false){
			player.gotoAndPlay("wkDownLeft");
			//keyDn=true;
		//}
	} else if (key_up){
		//if (keyDn == false){
			player.gotoAndPlay("wkUp");
			//keyDn=true;
		//}
	} else if (key_right){
		//if (keyDn == false){
			player.gotoAndPlay("wkRight");
			//keyDn=true;
		//}
	} else if (key_down){
		//if (keyDn == false){
			player.gotoAndPlay("wkDown");
			//keyDn=true;
		//}
	} else if (key_left){
		//if (keyDn == false){
			player.gotoAndPlay("wkLeft");
			//keyDn=true;
		//}
	}
	update_anim = false;
}

function tick(event){
	var collide = false;
	var lap = getFuturePosition();
	var tileIds = getTileIdsFromPosition(lap)
	for (var i in tileIds){
		if (!isWalkable(tileIds[i])){
			collide = true;
			break
		}
	}
	if (!collide){

		if (key_left){
			mapContainer.x += speed_walk;
			player.x -= speed_walk;
		}
		if (key_right){
			mapContainer.x -= speed_walk;
			player.x += speed_walk;
		}
		if (key_up){
			mapContainer.y += speed_walk/2;
			player.y -= speed_walk/2;
		}
		if (key_down){
			mapContainer.y -= speed_walk/2;
			player.y += speed_walk/2;
		}

		if (update_anim)
			updateAnim();		
		var xy = getXY();
		var xy_iso = getIsoFromCartesian(xy);
		var index = xy_iso.y+2;
		map[2].setChildIndex(player, index*2)
	}
	
	stage.update();
}



// utility function for loading assets from server
function httpGet(theUrl) {
	var xmlHttp = null;
	xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", theUrl, false);
	xmlHttp.send(null);
	return xmlHttp.responseText;
}

// utility function for loading json data from server
function httpGetData(theUrl) {
	var responseText = httpGet(theUrl);
	return JSON.parse(responseText);
}


//for merging assosiative arrays
Object.extend = function(destination, source) {
    for (var property in source) {
        if (source.hasOwnProperty(property)) {
            destination[property] = source[property];
        }
    }
    return destination;
};


// Map data created on Tiled map editor (mapeditor.org). Use export for JSON format
var mapDataJson = httpGetData('map.json');