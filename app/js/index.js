var body = $('body');
var fsm = new FSModel;
var fsl = new FSLoader;
var fsp = new FSPages;

_initializeApp = function() {
	$('#main').hide();
	fsm._initDatabase();
	fsl._initLoader();
	fsl.showLoader();
	_initLoginEvents(function(){
		_initPageEvents(function(){
			$('#main').fadeIn('fast',function(){
				fsl.hideLoader();
			});
		});
	});
};

_initLoginEvents = function(callback) {
	if(sessionStorage.getItem('empno') === null) {
		var loginbutton = $('#login #loginform button'),
			_evaluateLogin = function(result, success) {
				var errornotif = $('#login #loginform #loginnotif');
				switch(result) {
					case 0:
						fsl.showLoader();
						console.log(success);
						$('#main').fadeOut('fast', function(){
							sessionStorage.empno = success.rows[0]['empno'];
		 					sessionStorage.name = success.rows[0]['name'];
		 					sessionStorage.picture = success.rows[0]['picture'];
	 						_updateHomePage();
	 						$('#main').addClass('logged-in').fadeIn('fast', function(){
	 							fsl.hideLoader();
	 						});
						});
						break;
					case 1:
						errornotif.text("I'm sorry, but it seems that the account doesn't exist.");
						setTimeout(function(){
							errornotif.fadeOut(1000, function(){
		 						$(this).text("");
		 						$(this).css('display','block');
		 					});
						}, 3000);
	 					$('#login #loginform #uname')[0].value = "";
	 					$('#login #loginform #pword')[0].value = "";
						break;
					case 2:
						errornotif.text("Almost, but you entered a wrong password.");
	 					setTimeout(function(){
							errornotif.fadeOut(1000, function(){
		 						$(this).text("");
		 						$(this).css('display','block');
		 					});
						}, 3000);
	 					$('#login #loginform #pword')[0].value = "";
						break;
					case 3:
						errornotif.text("Wait, please fill them up first.");

	 					setTimeout(function(){
							errornotif.fadeOut(1000, function(){
		 						$(this).text("");
		 						$(this).css('display','block');
		 					});
						}, 3000);
						break;
				}
			}

 		loginbutton.on('click', function(e){
			var button = this;
			var name = $('#login #loginform #uname').val();
			var password = $('#login #loginform #pword').val();

			if(name && password) {
				fsm._authenticateLogin(name, password, _evaluateLogin);
			}
			else {
				_evaluateLogin(3, null);
			}
		});
	}
	else {
		_updateHomePage();
		$('#main').addClass("logged-in");
	}

	callback();
};

_initPageEvents = function(callback) {
	var userbutton = $('#userinfo #usermenu, #userinfo #userdrop');
	userbutton.on('mouseover', function(){
		$('#userinfo #userdrop').addClass('show');
	}).on('mouseleave', function(){
		$('#userinfo #userdrop').removeClass('show');
	});

	var logoutbutton = $("#logoutlink");
	logoutbutton.on('click', function() {
		fsl.showLoader();
		$('#main').fadeOut('fast', function(){
			sessionStorage.clear();
			$('#main').removeClass('logged-in');
			_initLoginEvents(function(){
				$('#main').fadeIn('fast',function(){
					fsl.hideLoader();
				});
			});
		});
	});

	var homeButtons = $('.navbutton');
	$.each(homeButtons, function(button){
		$(this).on('click', function(){
			var target = $(this).data('target');
			$('#pageoverlay').fadeIn(100);
			$('#'+target).addClass('open-page');
		}).on('mouseenter', function(){
			var color = $(this).css('background-color');
			var wrapper = $(this).parents('.navwrapper')[0];
			$(wrapper).css('border-bottom','5px solid '+color);
		}).on('mouseout', function(){
			var wrapper = $(this).parents('.navwrapper');
			$(wrapper).css('border-bottom','none');
		});
	});

	var pageCloseButtons = $('.page .displaypane .closebutton');
	$.each(pageCloseButtons, function(button){
		$(this).on('click', function(){
			var target = $(this).parents('.page');
			$('#pageoverlay').fadeOut(100);
			target.removeClass('open-page');
			_reset('regrecpage');
		});
	});

	var homemenu = $('#home #frontflap #homemenu');
	homemenu.on('click', function(){
		var flap = $('#home #frontflap');
		flap.toggleClass('open');
	});

	var scanButtons = $('.page .testscanner .scan');
	$.each(scanButtons, function(button){
		$(this).on('click', function(){
			var action = $(this).parents('.page').data('action');
			var code = $(this).siblings('.qrcode').val();

			_verifyQRCode(code, action);
		});
	});

	callback();
};

_updateHomePage = function() {
	var uname = sessionStorage.getItem('name');
	var empno = sessionStorage.getItem('empno');
	var pic = sessionStorage.getItem('picture');
	pic = (pic == "null" || pic == "")? "../img/defaultId.jpg" : pic;
	console.log("userpic "+pic);

	$('#userinfo .username').text(uname);
	$('#userinfo #userdrop #account .username').text(uname);
	$('#userinfo #userdrop #account .userempno').text(empno);
	$('#userinfo #userdrop #account #userpic img').attr('src',pic);
};

_verifyQRCode = function(code, action) {
	var _evaluateQRCode = function(code, action, result, success) {
		if(action == "register") {
			if(result == 0) {
				console.log('Register');
				console.log('Scan document successful');
				/*update values for displaypane2*/
				$('#regpage .scanfirst').fadeOut();
				console.log(success);
			}
			else if(result == 1) {
				$('#regpage .displaypane .scanfirst .text').text("It looks like your document is already registered. But if it's a mistake, please try again.");
				$('#regpage .testscanner .qrcode').val("");
				console.log(success);
			}
		}
		else if(action == "receive") {
			if(result == 0) {
				console.log('Receive');
				console.log('Scan document successful');
				/*update values for displaypane2*/
				$('#recpage .scanfirst').fadeOut();
				console.log(success);
			}
			else if(result == 1) {
				$('#recpage .displaypane .scanfirst .text').text("Oh. There seems to be a mistake. Your document is not yet registered. But if you think otherwise, let's try again.");
				$('#recpage .testscanner .qrcode').val("");
				console.log(success);
			}
		}
		fsl.hideLoader();
	};

	fsl.showLoader();
	fsm._verifyQRCode(code, action, _evaluateQRCode);
};

_reset = function(target) {
	switch(target) {
		case "loginpage":
			break;
		case "registerpage":
			$('#regpage .scanfirst .text').text("Hi there! Before we continue, please scan first the QR code of your document. Thank you!");
			$('#regpage .scanfirst').fadeIn();
			break;
		case "receivepage":
			break;
		case "regrecpage":
			$('.page .scanfirst .text').text("Hi there! Before we continue, please scan first the QR code of your document. Thank you!");
			$('.page .scanfirst').fadeIn();
			$('.page .scanfirst .testscanner .qrcode').val("");
			break;
	}
}

_initializeApp();