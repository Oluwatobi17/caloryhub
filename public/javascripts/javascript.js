var getter = 'a';
function slide(){
	var image = document.getElementById('rider');
	if(getter=='b'){
		image.src = '../images/caloryShoes.jpg';
		getter = 'c';
	}else if(getter=='c'){
		image.src = '../images/imager5.jpg';
		getter = 'a';
	}else{
		image.src = '../images/imager.jpg';
		getter = 'b';
	}
}
setInterval(slide, 7000);
 