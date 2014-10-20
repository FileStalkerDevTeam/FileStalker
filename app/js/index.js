var body = $('body');
var fsm = new FSModel;
var fsl = new FSLoader;
var fsp = new FSPages;

_initializeApp = function() {
	$('#main').hide();
	fsl._initLoader();
	fsl._showLoader();
	fsm._initDatabase();
	_initLoginEvents(function(){
		_initPageEvents(function(){
			$('#main').fadeIn('fast',function(){
				fsl._hideLoader();
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
						fsl._showLoader();
						console.log(success);
						$('#main').fadeOut('fast', function(){
							sessionStorage.empno = success.rows[0]['empno'];
		 					sessionStorage.name = success.rows[0]['name'];
		 					sessionStorage.picture = success.rows[0]['picture'];
	 						_updateHomePage();
	 						$('#main').addClass('logged-in').fadeIn('fast', function(){
	 							fsl._hideLoader();
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
	var self = this;

	var userbutton = $('#userinfo #usermenu, #userinfo #userdrop');
	userbutton.on('mouseover', function(){
		$('#userinfo #userdrop').addClass('show');
	}).on('mouseleave', function(){
		$('#userinfo #userdrop').removeClass('show');
	});

	var logoutbutton = $("#logoutlink");
	logoutbutton.on('click', function() {
		fsl._showLoader();
		$('#main').fadeOut('fast', function(){
			_reset('loginpage');
			sessionStorage.clear();
			$('#main').removeClass('logged-in');
			_initLoginEvents(function(){
				$('#main').fadeIn('fast',function(){
					fsl._hideLoader();
				});
			});
		});
	});

	var homeButtons = $('.navbutton');
	$.each(homeButtons, function(button){
		$(this).on('click', function(){
			var target = $(this).data('target');
			if(target == "search") {
				$('#pageoverlay').fadeIn(300);
				$('#'+target+"page").show(10, function(){
					$(this).addClass('open');
				});
			}
			else {
				$('#pageoverlay').fadeIn(300);
				self._showMessage("Hi there! Before we continue, please scan first the QR code of your document. Thank you!", target);
			}
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
			var target = $(this).parents('.page'),
				action = target.data('action');
			$('#pageoverlay').fadeOut(300);
			target.removeClass('open');
			_reset(action+"page");
		});
	});

	var homemenu = $('#home #frontflap #homemenu');
	homemenu.on('click', function(){
		var flap = $('#home #frontflap');
		flap.toggleClass('open');
	});

	var messageclose = $('#message .icon');
	messageclose.on('click', function(){
		self._hideMessage();
		$('#pageoverlay').fadeOut(300);
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

_showMessage = function(message, action, autohide){
	var self = this;

	$('#message .text').text(message)

	if(action == 'register') {
		$('#message').css('border-bottom','5px solid rgb(17,211,17)');
		$('#message').data('action', action);

		var tester = "<div class='testscanner'><input type='text' id='regqrcode' class='qrcode' /><button class='scan'>Scan</button></div>";
		$('#message').append(tester);
		$('#message .testscanner .scan').on('click', function(){
			var code = $(this).siblings('.qrcode').val();
			_verifyQRCode(code, action);
		});
	}
	else if(action == 'receive') {
		$('#message').css('border-bottom','5px solid rgb(255,42,42)');
		$('#message').data('action', action);

		var tester = "<div class='testscanner'><input type='text' id='recqrcode' class='qrcode' /><button class='scan'>Scan</button></div>";
		$('#message').append(tester);
		$('#message .testscanner .scan').on('click', function(){
			var code = $(this).siblings('.qrcode').val();
			_verifyQRCode(code, action);
		});
	}

	if(autohide) setTimeout(function(){ self._hideMessage(); }, 4000);

	$('#message').addClass('show');
};

_changeMessage = function(message, callback){
	// $('#message .text').text(message).on('change', fsl._hideLoader());
	$('#message .text').text(message);
};

_hideMessage = function(){
	$('#message').removeClass('show').one('webkitTransitionEnd', function(){
		$('#message .text').text('');
		$('#message').css('border-bottom','none');
		if ($('#message').data('action')) {
			$('#message').removeData('action');
			$('#message').find('.testscanner').remove();
		}
	});
};

_verifyQRCode = function(code, action) {
	var self = this,
		_evaluateQRCode = function(code, action, result, success) {
		if(action == "register") {
			if(result == 0) {
				console.log('Register');
				console.log('Scan document successful');
				self._showRegister(code);
				console.log(success);
			}
			else if(result == 1) {
				$('#message .testscanner .qrcode').val("");
				self._changeMessage("It looks like your document is already registered. But if it's a mistake, please try again.");
				// console.log(success);
			}
		}
		else if(action == "receive") {
			if(result == 0) {
				console.log('Receive');
				console.log('Scan document successful');
				self._showReceive(success.rows[0]);
				console.log(success);
			}
			else if(result == 1) {
				$('#message .testscanner .qrcode').val("");
				self._changeMessage("Oh. There seems to be a mistake. Your document is not yet registered. But if you think otherwise, let's try again.");
				// console.log(success);
			}
		}
	};

	// fsl._showLoader();
	fsm._verifyQRCode(code, action, _evaluateQRCode);
};

_showRegister = function(code) {
	var self = this,
		_updateRegisterPage = function(offices, params) {
			var code = params.code,
				afterscan = $('#registerpage .displaypane .displaypane2 .input'),
				page = fsp.register(code, offices);
			
			afterscan.html(page);

			var button = $('#registerpage .input .submit-button');
			button.on('click', function(){
				var trackingno = $('#registerpage .input .trackingno #input').text();
				var subject = $('#registerpage .input #subject').val();
				var desc = $('#registerpage .input #desc').val();
				var type = $('#registerpage .input #type').val();
				var office = $('#registerpage .input #office').val();

				if(trackingno && subject && type && office) {
					fsm._insertToDatabase('register',{trackingno : trackingno, subject : subject, desc : desc, type : type, office : office}, 
						function(trackingNo){
							$('#registerpage').removeClass('open').one('webkitTransitionEnd', function(){
								$('#pageoverlay').fadeOut(300);
								self._showMessage("Your document with tracking no. "+trackingNo+" is now being stalked!", null, true);
							});
						});
				}
				else {
					self._showMessage("Please fill-up the required fields. Thanks!", null, true);
				}
			});

			// fsl._hideLoader();
			self._hideMessage();
			$('#registerpage').addClass('open');
		}

	var params = {
		code : code
	};
	fsm._getUserOffices(sessionStorage.getItem('empno'), _updateRegisterPage, params);
};

_showReceive = function(doc) {
	var self = this,
		_updateReceivePage = function(offices, params) {
			var trackingno = params.trackingNo;
			var subject = params.subject;
			var desc = params.description;
			var type = params.type;
			var afterscan = $('#receivepage .displaypane .displaypane2 .input');
			var page = fsp.receive(trackingno, subject, desc, type, offices);
			
			afterscan.html(page);

			var button = $('#receivepage .input .submit-button');
			button.on('click', function(){
				var trackingno = $('#receivepage .input .trackingno #input').text();
				var subject = $('#receivepage .input .subjectinput').text();
				var desc = $('#receivepage .input .descinput').text();
				var type = $('#receivepage .input .typeinput').text();
				var office = $('#receivepage .input #office').val();

				if(trackingno && subject && type && office) {
					fsm._insertToDatabase('receive',{trackingno : trackingno, subject : subject, desc : desc, type : type, office : office},
						function(trackingNo){
							$('#receivepage').removeClass('open').one('webkitTransitionEnd', function(){
								$('#pageoverlay').fadeOut(300);
								self._showMessage("You have successfully received the document with tracking no. "+trackingNo+"!", null, true);
							});
						});
				}
				else {
					self._showMessage("Please fill-up the required fields. Thanks!", null, true);
				}
			});

			// fsl._hideLoader();
			self._hideMessage();
			$('#receivepage').addClass('open');
		};

	fsm._getUserOffices(sessionStorage.getItem('empno'), _updateReceivePage, doc);
};

_reset = function(target) {
	switch(target) {
		case "loginpage":
			$('#login #loginform #uname').val("");
			$('#login #loginform #pword').val("");
			break;
		case "registerpage":
			$('#registerpage .displaypane .displaypane2 .scanfirst .text').text("Hi there! Before we continue, please scan first the QR code of your document. Thank you!");
			$('#registerpage .displaypane .displaypane2 .scanfirst .testscanner .qrcode').val("");
			$('#registerpage .displaypane .displaypane2 .scanfirst').fadeIn();
			$('#registerpage .displaypane .displaypane2 .input').html("");
			break;
		case "receivepage":
			$('#receivepage .displaypane .displaypane2 .scanfirst .text').text("Hi there! Before we continue, please scan first the QR code of your document. Thank you!");
			$('#receivepage .displaypane .displaypane2 .scanfirst .testscanner .qrcode').val("");
			$('#receivepage .displaypane .displaypane2 .scanfirst').fadeIn();
			$('#receivepage .displaypane .displaypane2 .input').html("");
			break;
	}
};

_initializeApp();