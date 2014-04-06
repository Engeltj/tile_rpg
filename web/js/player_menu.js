function getPlayerToken(player){
	for (key in opponents){
		if (player == opponents[key])
			return key;
	}
	return token;
}

var playerClicked =  function(evt){
	createMenu(getPlayerToken(evt.target))
}

function createMenu(token){
	 var rect = new createjs.Rectangle(0, 0, 100, 100);
	 cMap.addChild(rect)
}