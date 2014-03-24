var tileset = [];
var stage;
var mapData;

var key_left;
var key_right;
var key_up;
var key_down;
var keyDn=false;
var pressed=0;
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

	// var test1 = {1:"hello"}
	// var test2 = {2:"world"}
	// var test3 = Object.extend(test1, test2); 
	// console.log(test3[2])

	// var circle = new createjs.Shape();
 //    circle.graphics.beginFill("red").drawCircle(0, 0, 5);
 //    circle.x = stage.canvas.width/2;
 //    circle.y = stage.canvas.height/2;

    mapContainer = new createjs.Container();
    for (var i=0;i<3;i++){
    	map[i] = new createjs.Container();
    	mapLayers[i] = {};
    	for (var j=0;j<mapData.height+5;j++){
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
		animations: {wkDown:[0,3], wkLeft:[4,7], wkRight:[8,11], wkUp:[12,15], wkDownLeft:[16,19], wkDownRight:[20,23], wkUpLeft:[24,27], wkUpRight:[28,31]}
	});

	player = new createjs.Sprite(spriteSheet);
	player.regX = 39/2;
	player.regY = 64/4;
	player.gotoAndStop("wkDown");
	player.x = stage.canvas.width/2;
	player.y = stage.canvas.height/2 - 32 - 7;
	//console.log(stage.canvas.width/2)
	for (var key in map){
		mapContainer.addChild(map[key]);
	}
	stage.addChild(mapContainer);
	map[2].addChild(player);
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
	for (var idx = 0; idx < mapData.layers.length; idx++) {
		var layerData = mapData.layers[idx];
		if (layerData.type == 'tilelayer')
			initLayer(layerData, tilesetSheet, mapData.tilewidth, mapData.tileheight, tileproperties);
	}
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
			
			var variableLayer = getIsoXYFromPosition({x:cellBitmap.x, y:cellBitmap.y}).y-2//Math.round(cellBitmap.y/tileheight)-9;//getIsoXYFromPosition({x:cellBitmap.x, y:cellBitmap.y}).x-16;
			console.log(variableLayer);
			var distanceFromBase = 0;
			if (tileproperties[tileId.toString()] != null)
				distanceFromBase = parseInt(tileproperties[tileId.toString()].base) + 1 || 1;
			variableLayer+=distanceFromBase;

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


function test(){
	var i = 0;
	if (key_up) i++;
	if (key_right) i++;
	if (key_left) i++;
	if (key_down) i++;
	if (i == 2)
		keyDn=false;
	return i;
}


function handleKeyDown(e){
	if (!e){var e = window.event;}
	if (test() > pressed){
		pressed = test();
		//keyDn=false;
	}

	switch(e.keyCode){
		case 37: key_right=false;key_left=true; test(); break; //left
		case 38: key_up=true;key_down=false; test(); break; //up
		case 39: key_right=true;key_left=false;test(); break; //right
		case 40: key_up=false;key_down=true; test();break; //down
	}
}

function handleKeyUp(e){
	if (!e){var e = window.event;}
	switch(e.keyCode){
		case 37: player.gotoAndStop("wkLeft");keyDn=false;key_left=false; break; //left
		case 38: player.gotoAndStop("wkUp");keyDn=false;key_up=false; break; //up
		case 39: player.gotoAndStop("wkRight");keyDn=false;key_right=false; break; //right
		case 40: player.gotoAndStop("wkDown");keyDn=false;key_down=false; break; //down
	}
}


function getXY(){
	var x = mapContainer.x*-1;
	var y = mapContainer.y*-1;
	return {x:x,y:y};
}

// function getIsoXY() {
// 	var xy = getXY();
//     return getIsoXYFromPosition(xy);
// }

function getIsoXYFromPosition(mapPos){
	var x = Math.round((mapPos.x + 2*mapPos.y)/64);
    var y = Math.round((2*mapPos.y - mapPos.x)/64);
    return { x : x, y : y};
}

// function testIsoXY(mapPos) {
// 	var xy = mapPos;
//     var x2 = Math.round((xy.x + 2*xy.y)/64);
//     var y2 = Math.round((2*xy.y - xy.x)/64);
//     return { x : x2, y : y2};
// }

function lookAheadPosition(){
	var mapPos = getXY();
	if (key_left)
		mapPos.x -= speed_walk;
	if (key_right)
		mapPos.x += speed_walk;
	if (key_up)
		mapPos.y -= speed_walk/2;
	if (key_down)
		mapPos.y += speed_walk/2;
	return getIsoXYFromPosition(mapPos);
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

function check_collide(tileId){
	if (tileproperties[tileId] != null){
		var walkable = tileproperties[tileId].walkable;
		if (walkable != null && walkable == "0")
			return true;
	}
	return false;
}

function tick(event){
	var collide = false;
	lap = lookAheadPosition();
	//console.log(lap);
	var tileIds = getTileIdsFromPosition(lap)
	for (var i in tileIds){
		if (hasProperties(tileIds[i])){
			if(check_collide(tileIds[i]))
				collide = true;
		}
	}
	//console.log(event.delta);
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


		if (key_up && key_right){
			if (keyDn == false){
				player.gotoAndPlay("wkUpRight");
				keyDn=true;
			}
		} else if (key_up && key_left){
			if (keyDn == false){
				player.gotoAndPlay("wkUpLeft");
				keyDn=true;
			}
		} else if (key_down && key_right){
			if (keyDn == false){
				player.gotoAndPlay("wkDownRight");
				keyDn=true;
			}
		} else if (key_down && key_left){
			if (keyDn == false){
				player.gotoAndPlay("wkDownLeft");
				keyDn=true;
			}
		} else if (key_up){
			if (keyDn == false){
				player.gotoAndPlay("wkUp");
				keyDn=true;
			}
		} else if (key_right){
			if (keyDn == false){
				player.gotoAndPlay("wkRight");
				keyDn=true;
			}
		} else if (key_down){
			if (keyDn == false){
				player.gotoAndPlay("wkDown");
				keyDn=true;
			}
		} else if (key_left){
			if (keyDn == false){
				player.gotoAndPlay("wkLeft");
				keyDn=true;
			}
		}
		var xy = getXY();
		var index = getIsoXYFromPosition(xy).y+1;
		var index2 = xy.y/32+1;
		if (index2 > index)
			index = index2;
		console.log(index2);
		map[2].setChildIndex(player, index)
		//console.log(getXY().y/32)
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
var mapDataJson = httpGetData('untitled.json');