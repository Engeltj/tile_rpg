var test = function(){

  // var stage = document.getElementById("game");
  // var ctx = stage.getContext("2d")
  // ctx.font="20px Georgia";
  // ctx.fillStyle = 'blue';
  // var msg = document.getElementById("msg");
  // msg.value = "web loaded"
  // console.log(msg.value)
  // ctx.fillText("Hello World!",10,50);
  // document.getElementById("game").style.zIndex="1";
  //var chatArea = document.getElementById("chatArea").style.zIndex="100";

  //alert($('#chatArea'))
    $('#chatArea').mCustomScrollbar({
      set_width: 400,
      set_height: 50,
      scrollButtons:{
        enable: false
      },
      contentTouchScroll: true
    });
   document.getElementById('chatArea').style['display'] = 'block';
    // $('#chatArea').mCustomScrollbar("scrollTo","bottom");
}

var chat_newMsg = function(){
  var msgBox = document.getElementById('msg')
  msgBox.style['display'] = 'block'
  msgBox.focus()
  messaging = true;
}

var chat_sendMsg = function(){
  var msgBox = document.getElementById('msg')
  var msg = msgBox.value
  if (msg.length > 0)
    chat_addMsg("User", msg)
  msgBox.value = '';
  msgBox.style['display'] = 'none'
  messaging = false;
}

var chat_addMsg = function(username, message){
  $('.mCSB_container').append( "<div><b>" + username + ": </b>"+message+"</div>" );
  $('#chatArea').mCustomScrollbar("update");
  $('#chatArea').mCustomScrollbar("scrollTo", "bottom");
  
}