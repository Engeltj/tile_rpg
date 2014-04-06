var bullets = []

var img_bullet = new Image()
img_bullet.src = 'img/bullet.png';

socket.on('shot', function (data){
	createBullet(data.position, data.direction)
});

function createBullet(start, direction){
	console.log(direction)
	var bullet = new createjs.Bitmap(img_bullet);
	bullet.regX = 6;
	bullet.regY = 6;
	bullet.x = start.x ;
	bullet.y = start.y;
	bullet.rotation = direction*45
	if (bullet.rotation % 90 == 45)
		if (direction == 3 || direction == 7)
			bullet.rotation -= 10
		else
			bullet.rotation += 10
	cMap.addChild(bullet)
	bullets.push(bullet)
}

function updateBullets(){
	var bullet_speed = 30
	var x,y
	for (key in bullets){
		switch(bullets[key].rotation){
			case 55:
				x = 1/2
				y = -1/2
				break
			case 90:
				x = 1;
				y = 0;
				break
			case 125:
				x = 1/2;
				y = 1/2;
				break
			case 180:
				x = 0
				y = 1
				break
			case 235:
				x = -1/2
				y = 1/2
				break
			case 270:
				x = -1
				y = 0
				break
			case 305:
				x = -1/2
				y = -1/2
				break
			default:
				x = 0
				y = -1
		}
		bullets[key].x += bullet_speed*x
		bullets[key].y += bullet_speed*y/2
	}

}