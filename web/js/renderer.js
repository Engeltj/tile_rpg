var tileset = [];
var stage;
var mapData;
var messaging;

var key_left;
var key_right;
var key_up;
var key_down;
var update_anim;
var token;

var img_actor;
var player;
var circle;
var opponents = {};
var tileproperties = {};

var cMap;
var cLayers;
var cTiles;

var tiles = {};
var offset = {};

var speed_walk = 3;
var speed_drive = 6;

var initialized = false;

window.onload = function()
{
	if (!sessionStorage.token || sessionStorage.token == null)
		window.location.href = "login.html";
	else
		token = sessionStorage.token;
	//init();
	socketListeners()
	socket.emit('setupToken', token)

}

function init(){
	// json map data at the end of this file for ease of understanding (created on Tiled map editor)
	mapData = mapDataJson;

	// creating EaselJS stage
	stage = new createjs.Stage("game");
	offset.x = stage.canvas.width/2
	offset.y = stage.canvas.height/2

	cMap = new createjs.Container();
	cLayers = []
	cTiles = []
 	for (var l=0;l<2;l++){
 		cLayers[l] = new createjs.Container();
 		cMap.addChild(cLayers[l])
 		cTiles[l] = []
	 	for (var a=0;a<(mapData.height+mapData.width);a++){
	 		cTiles[l][a] = new createjs.Container();
	 		cLayers[l].addChild(cTiles[l][a]);
	 	}
	}

    cMap.x += offset.x
    cMap.y += offset.y

	initLayers();
	document.onkeydown=handleKeyDown;
	document.onkeyup=handleKeyUp;

	img_actor = new Image();
	//img_actor.onload = 
	img_actor.src = "img/actor_x156.png";
	player = createPlayer({x:0,y:0});

	stage.addChild(cMap);

	createjs.Ticker.setFPS(30);
	createjs.Ticker.addEventListener("tick", tick);
	chatInit();
}



function socketListeners(){
	socket.on('tokenResponse', function (data){
		if ((data) && (!initialized)){
			init();
			if ((!data.position.x) && (!data.position.y))
				setPlayerStart({x:18,y:20})
			else
				setPlayerStart(getIsoFromCartesian(data.position))
			initialized = true;
		} else { 
			delete sessionStorage.token
			console.log("login: " + token);
			location.reload();
		}
	});

	socket.on('get_positions', function (data) {
		if (data.token && (data.token != token)){
			var xy = {x:data.x, y:data.y}
			if (opponents[data.token] == null){
				opponents[data.token] = createPlayer(xy);
			} else {
				opponents[data.token].x = xy.x 
				opponents[data.token].y = xy.y 
				if (opponents[data.token].currentAnimation != data.anim)
					opponents[data.token].gotoAndPlay(data.anim)
			}
			updatePlayerLayer(opponents[data.token]);
			//updatePlayerLayer(player,player);
		}
    });

    socket.on('disconnect', function (data) {
    	//map[2].removeChild(opponents[data]);
    	delete opponents[data];
    });


}

function createPlayer(position){
	var width = 39;
	var height = 64;

	var spriteSheet = new createjs.SpriteSheet({
		images: [img_actor],
		frames: {width:width, height:height},
		animations: {
			wkDown:[0,3, "wkDown", 1/3], 
			wkLeft:[4,7, "wkLeft", 1/3], 
			wkRight:[8,11, "wkRight", 1/3], 
			wkUp:[12,15, "wkUp", 1/3], 
			wkDownLeft:[16,19, "wkDownLeft", 1/3], 
			wkDownRight:[20,23, "wkDownRight", 1/3], 
			wkUpLeft:[24,27, "wkUpLeft", 1/3], 
			wkUpRight:[28,31, "wkUpRight", 1/3],

			stopDown:{frames: [0]},
			stopLeft:{frames: [4]},
			stopRight:{frames: [8]},
			stopUp:{frames: [12]},
			stopDownLeft:{frames: [16]},
			stopDownRight:{frames: [20]},
			stopUpLeft:{frames: [24]},
			stopUpRight:{frames: [28]},
		}
	});

	var newplayer = new createjs.Sprite(spriteSheet);
	newplayer.regX = width/2;
	newplayer.regY = height - mapData.tileheight/2;
	newplayer.x = position.x;
	newplayer.y = position.y;
	newplayer.gotoAndStop("wkDown");
	newplayer.on("click", playerClicked);
	return newplayer;
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

	var layerBackground = mapData.layers[0];
	var layerGround = mapData.layers[1];
	initLayer(layerBackground, tilesetSheet, mapData.tilewidth, mapData.tileheight, tileproperties);
	initLayer(layerGround, tilesetSheet, mapData.tilewidth, mapData.tileheight, tileproperties);
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
			cellBitmap.x = x * tilewidth/2 - y * tilewidth/2 - tilewidth/2// + layerData.height*tilewidth/2 - tilewidth;
			cellBitmap.y = y * tileheight/2 + x * tileheight/2 - tileheight/2// + layerData.height*tileheight/2 - tileheight;

			var variableLayer = getIsoFromCartesian({x:cellBitmap.x, y:cellBitmap.y}).y
			//console.log(variableLayer)
			//variableLayer*=2
			var distanceFromBase = 0;
			if (tileproperties[tileId.toString()] != null)
				distanceFromBase = parseInt(tileproperties[tileId.toString()].base) + 1 || 1;
			variableLayer+=(distanceFromBase);

			cTiles[layer][variableLayer].addChild(cellBitmap);
			
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

function handleKeyDown(e){
	if (!e){var e = window.event;}
	console.log(e.keyCode);
	switch(e.keyCode){
		case 65: if(!key_left){key_right=false;key_left=true; update_anim=true;} break; //left
		case 87: if(!key_up){key_up=true;key_down=false; update_anim=true;} break; //up
		case 68: if(!key_right){key_right=true;key_left=false; update_anim=true;} break; //right
		case 83: if(!key_down){key_up=false;key_down=true; update_anim=true;} break; //down
		case 84: if (!messaging){console.log('hi');e.preventDefault();e.stopPropagation();}chat_newMsg();break; //letter t
		case 13: chat_sendMsg();break; //enter
		case 32: createBullet({x:player.x,y:player.y-28}, getDirection()); break;
		default: console.log(e.keyCode)
	}
	// if (e.keyCode != '32'){
	// 	var e = jQuery.Event( 'keydown', { keyCode: '32'} );
	// 	$(document).trigger(e);
	// }
}

function handleKeyUp(e){
	if (!e){var e = window.event;}
	var anim = player.currentAnimation.substring(2);
	switch(e.keyCode){
		case 65: key_left=false;update_anim=true; break; //left
		case 87: key_up=false;update_anim=true; break; //up
		case 68: key_right=false;update_anim=true; break; //right
		case 83: key_down=false;update_anim=true; break; //down
	}
	if (update_anim){
		playerDirection = getDirection()
		player.gotoAndStop("stop"+anim);
	}
}

//uses ISO
function setPlayerStart(mapPos){
	offset = getCartesianFromIso(mapPos);
	cMap.x += offset.x*-1
	cMap.y += offset.y*-1
	player.x += offset.x;
	player.y += offset.y;
}

//returns cartesian
function getXY(){
	var x = player.x//*-1;
	var y = player.y//*-1;
	return {x:x,y:y};
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
	for (var i=0;i<mapData.layers.length;i++)
		tileIds.push(mapData.layers[i].data[mapPos.x+mapPos.y*mapData.height] - 1)
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
	if (key_up && key_right)
			player.gotoAndPlay("wkUpRight");
	else if (key_up && key_left)
			player.gotoAndPlay("wkUpLeft");
	else if (key_down && key_right)
			player.gotoAndPlay("wkDownRight");
	else if (key_down && key_left)
			player.gotoAndPlay("wkDownLeft");
	else if (key_up)
			player.gotoAndPlay("wkUp");
	else if (key_right)
			player.gotoAndPlay("wkRight");
	else if (key_down)
			player.gotoAndPlay("wkDown");
	else if (key_left)
			player.gotoAndPlay("wkLeft");
	update_anim = false;
}

function updatePlayerLayer(player){
	var xy = getIsoFromCartesian({x:player.x,y:player.y});
	updatePlayerLayerIso(player, xy);
}

function updatePlayerLayerIso(player, xy){
	//console.log(xy)
	var index = xy.y+3;
	cTiles[1][index].addChild(player);
}

var old_movements = {x:-1,y:-1,anim:""}

function tick(event){
	var collide = false;
	var lap = getFuturePosition();
	var tileIds = getTileIdsFromPosition(lap)
	updateBullets()
	for (var i in tileIds){
		if (!isWalkable(tileIds[i])){
			collide = true;
			break
		}
	}
	if (!collide){
		if (key_left){
			cMap.x += speed_walk;
			player.x -= speed_walk;
		}
		if (key_right){
			cMap.x -= speed_walk;
			player.x += speed_walk;
		}
		if (key_up){
			cMap.y += speed_walk/2;
			player.y -= speed_walk/2;
		}
		if (key_down){
			cMap.y -= speed_walk/2;
			player.y += speed_walk/2;
		}

		if (update_anim)
			updateAnim();
		if (token){
			if ((old_movements.x != player.x) || (old_movements.y != player.y) || (old_movements.anim != player.currentAnimation)){
				socket.emit('position', {token: token, x: player.x, y: player.y, anim: player.currentAnimation});
				old_movements = {x:player.x, y:player.y, anim: player.currentAnimation}
				updatePlayerLayer(player);
			}
		}
	}
	stage.update();
}


//for merging assosiative arrays
// Object.extend = function(destination, source) {
//     for (var property in source) {
//         if (source.hasOwnProperty(property)) {
//             destination[property] = source[property];
//         }
//     }
//     return destination;
// };


// Map data created on Tiled map editor (mapeditor.org). Use export for JSON format
var mapDataJson = httpGetData('map.json');