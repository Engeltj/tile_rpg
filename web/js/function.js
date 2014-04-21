function getCartesianFromIso(mapPos){
	var x = (mapPos.x - mapPos.y) / 2 * 64
    var y = (mapPos.y + mapPos.x) / 4 * 64
    return {x:x,y:y};
}

//uses ISO
function getIsoFromCartesian(mapPos){
	var x = Math.round((mapPos.x + 2*mapPos.y)/64);
    var y = Math.round((2*mapPos.y - mapPos.x)/64);
    return { x : x, y : y};
}

function getDirection(){
	var anim = player.currentAnimation;
	anim = anim.replace("wk","");
	anim = anim.replace("stop","");
	console.log(anim)
	if (anim == 'Up')
		return 0
	else if (anim == 'UpRight')
		return 1
	else if (anim == 'Right')
		return 2
	else if (anim == 'DownRight')
		return 3
	else if (anim == 'Down')
		return 4
	else if (anim == 'DownLeft')
		return 5
	else if (anim == 'Left')
		return 6
	else if (anim == 'UpLeft')
		return 7
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

function twoDigit(n){
    return n > 9 ? "" + n: "0" + n;
}