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
var mapLayers = {};
var mapContainer;

var speed_walk = 3;
var speed_drive = 6;

window.onload = function()
{
	//canvas = document.getElementById("game");
	// json map data at the end of this file for ease of understanding (created on Tiled map editor)
	mapData = mapDataJson;

	// creating EaselJS stage
	stage = new createjs.Stage("game");

	var test1 = {1:"hello"}
	var test2 = {2:"world"}
	var test3 = Object.extend(test1, test2); 
	console.log(test3[2])

	var circle = new createjs.Shape();
    circle.graphics.beginFill("red").drawCircle(0, 0, 5);
    circle.x = stage.canvas.width/2;
    circle.y = stage.canvas.height/2;
    
    


    mapContainer = new createjs.Container();
	mapContainer.x = 0;
    mapContainer.y = 0;

    for (var i=0;i<mapData.height;i++){
    	mapLayers[i] = new createjs.Container();
    	mapLayers[i].x = 0;
    	mapLayers[i].y = 0;
    	mapContainer.addChild(mapLayers[i]);
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
	img_actor.src = "assets/actor.png";
	//img_actor.filters = [ new createjs.ColorFilter(0,0,0,1, 0,0,255,0)]
	spriteSheet = new createjs.SpriteSheet({
		images: [img_actor],
		frames: {width:78, height:128},
		animations: {wkDown:[0,3], wkLeft:[4,7], wkRight:[8,11], wkUp:[12,15], wkDownLeft:[16,19], wkDownRight:[20,23], wkUpLeft:[24,27], wkUpRight:[28,31]}
	});

	player = new createjs.Sprite(spriteSheet);
	player.regX = 78/2;
	player.regY = 64;
	player.gotoAndStop("wkDown");
	player.x = stage.canvas.width/2;
	player.y = stage.canvas.height/2 - 32-7;
	//console.log(stage.canvas.width/2)
	
	stage.addChild(mapContainer)
	mapContainer.addChild(player);
	stage.addChild(circle);
}

// loading layers
function initLayers() {
	console.log(mapData)
	console.log(mapData.tilesets)
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
	//imageData.images.push()
	// create spritesheet
	var tilesetSheet = new createjs.SpriteSheet(imageData);
	var tileproperties = getTileProperties(mapData.tilesets);
	console.log(tileproperties)
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
			cellBitmap.x = x * tilewidth/2 - y * tilewidth/2 + layerData.height*tilewidth/2 - tileheight;
			cellBitmap.y = y * tileheight/2 + x * tileheight/2 + layerData.height*tileheight/2 + tileheight;
			
			var layer = Math.round(cellBitmap.y/tileheight)-9;
			//console.log(layer)
			var distanceFromBase = 0;
			if (tileproperties[tileId.toString()] != null)
				distanceFromBase = parseInt(tileproperties[tileId.toString()].base) + 1 || 1;
			layer+=distanceFromBase;
			//console.log('layer: ' + layer + ", disFromBase: " + distanceFromBase)
			mapLayers[layer].addChild(cellBitmap);

			//mapContainer.addChild(cellBitmap);
			//stage.addChild(cellBitmap);
			//mapContainer.addChild(text);
			//mapContainer.setChildIndex(cellBitmap, Math.round(cellBitmap.y/32)-9);
			var text = new createjs.Text(mapContainer.getChildIndex(cellBitmap), "15px Arial", "#ff7700");
			text.x = cellBitmap.x+32
			text.y = cellBitmap.y+7
			
		}
	}
}

function getTileProperties(tilesets){
	var tileproperties = {}
	for (var i=0; i<tilesets.length;i++){
		var firstgid = tilesets[i].firstgid - 1;
		//console.log(firstgid)
		if (tilesets[i].tileproperties != null){
			for (var key in tilesets[i].tileproperties){
				var tempKey = (parseInt(key) + firstgid).toString();
				tileproperties[tempKey] = tilesets[i].tileproperties[key];
				//console.log('Key: ' + key + ', Hello: ' + tilesets[i].tileproperties[key])
			}
		}
		//tileproperties = Object.extend(tilesets[i].tileproperties, tileproperties);
		//console.log(tileproperties)
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
	//console.log('up ->' + e.keyCode)
	switch(e.keyCode){
		case 37: player.gotoAndStop("wkLeft");keyDn=false;key_left=false; break; //left
		case 38: player.gotoAndStop("wkUp");keyDn=false;key_up=false; break; //up
		case 39: player.gotoAndStop("wkRight");keyDn=false;key_right=false; break; //right
		case 40: player.gotoAndStop("wkDown");keyDn=false;key_down=false; break; //down
	}
}



function getPosition(){
	var posx = 0
	var posy = 0

	sin45 = Math.sin(45*Math.PI/180)
	x = mapContainer.x*-1
	y = mapContainer.y*-1

	posx = sin45/(1/x) + sin45/(1/y);
	
	console.log('x: ' + x + ", y: " + y)
}



function tick(event){
	getPosition();
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
	mapContainer.setChildIndex(player, Math.round(mapContainer.y/32)*-1+1)
	//console.log(mapContainer.getChildIndex(player))
	
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
var mapDataJson = { "height":15,
 "layers":[
        {
         "data":[11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11],
         "height":15,
         "name":"0_Tile Layer 1",
         "opacity":1,
         "type":"tilelayer",
         "visible":true,
         "width":15,
         "x":0,
         "y":0
        }, 
        {
         "data":[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 271, 0, 0, 0, 271, 0, 0, 0, 386, 0, 0, 0, 0, 0, 0, 0, 281, 0, 0, 0, 281, 0, 0, 0, 394, 0, 0, 0, 0, 0, 0, 0, 291, 0, 0, 0, 291, 0, 0, 0, 402, 0, 0, 0, 0, 0, 0, 0, 301, 0, 0, 0, 301, 0, 0, 0, 410, 0, 0, 0, 0, 0, 0, 0, 311, 0, 287, 0, 311, 0, 0, 0, 0, 0, 0, 175, 0, 0, 0, 0, 286, 0, 297, 0, 0, 0, 0, 0, 0, 0, 0, 175, 0, 0, 285, 0, 296, 0, 307, 0, 0, 0, 0, 0, 0, 0, 0, 175, 0, 0, 295, 0, 306, 0, 271, 0, 0, 0, 0, 0, 0, 0, 0, 175, 0, 0, 305, 0, 316, 0, 281, 0, 0, 0, 0, 0, 0, 0, 0, 175, 0, 0, 0, 0, 0, 0, 291, 0, 0, 0, 0, 0, 0, 243, 0, 175, 0, 0, 0, 0, 0, 0, 301, 0, 0, 0, 0, 0, 0, 253, 0, 175, 0, 0, 0, 0, 0, 0, 311, 0, 0, 0, 0, 0, 0, 263, 0, 175, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 273, 0, 175, 0, 0, 0, 0, 0, 0],
         "height":15,
         "name":"0_Tile Layer 2",
         "opacity":1,
         "type":"tilelayer",
         "visible":true,
         "width":15,
         "x":0,
         "y":0
        }, 
        {
         "data":[175, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 175, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 175, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 175, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 175, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 175, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
         "height":15,
         "name":"Tile Layer 3",
         "opacity":1,
         "type":"tilelayer",
         "visible":true,
         "width":15,
         "x":0,
         "y":0
        }],
 "orientation":"isometric",
 "properties":
    {

    },
 "tileheight":32,
 "tilesets":[
        {
         "firstgid":1,
         "image":"iso-64x64-outside.png",
         "imageheight":1024,
         "imagewidth":640,
         "margin":0,
         "name":"iso-64x64-outside",
         "properties":
            {

            },
         "spacing":0,
         "tileheight":32,
         "tileproperties":
            {
             "242":
                {
                 "base":"3"
                },
             "252":
                {
                 "base":"2"
                },
             "254":
                {
                 "walkable":"0"
                },
             "262":
                {
                 "base":"1"
                },
             "270":
                {
                 "base":"4"
                },
             "272":
                {
                 "walkable":"0"
                },
             "280":
                {
                 "base":"3"
                },
             "284":
                {
                 "base":"3"
                },
             "285":
                {
                 "base":"3"
                },
             "286":
                {
                 "base":"3"
                },
             "290":
                {
                 "base":"2"
                },
             "294":
                {
                 "base":"2"
                },
             "295":
                {
                 "base":"2"
                },
             "296":
                {
                 "base":"2"
                },
             "300":
                {
                 "base":"1"
                },
             "304":
                {
                 "base":"1"
                },
             "305":
                {
                 "base":"1"
                },
             "306":
                {
                 "base":"1"
                },
             "310":
                {
                 "walkable":"0"
                },
             "315":
                {
                 "walkable":"0"
                }
            },
         "tilewidth":64
        }, 
        {
         "firstgid":321,
         "image":"tools\/Tiles\/fixtures_doors_01.png",
         "imageheight":1024,
         "imagewidth":512,
         "margin":0,
         "name":"fixtures_doors_01",
         "properties":
            {

            },
         "spacing":0,
         "tileheight":32,
         "tileproperties":
            {
             "65":
                {
                 "base":"3"
                },
             "73":
                {
                 "base":"2"
                },
             "81":
                {
                 "base":"1"
                }
            },
         "tilewidth":64
        }, 
        {
         "firstgid":577,
         "image":"tools\/Tiles\/location_restaurant_seahorse_01.png",
         "imageheight":1024,
         "imagewidth":512,
         "margin":0,
         "name":"location_restaurant_seahorse_01",
         "properties":
            {

            },
         "spacing":0,
         "tileheight":32,
         "tilewidth":64
        }],
 "tilewidth":64,
 "version":1,
 "width":15
}