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