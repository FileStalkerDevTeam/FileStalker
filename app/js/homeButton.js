// temporary

(function appInit(){
	var homeButtons = $('.navbutton');
	$.each(homeButtons, function(button){
		$(this).on('click', function(){
			var target = $(this).data('target');
			$('#'+target).addClass('open-page');
		});
	});

	var pageCloseButtons = $('.page .displaypane .closebutton');
	$.each(pageCloseButtons, function(button){
		$(this).on('click', function(){
			var target = $(this).parents('.page');
			target.removeClass('open-page');
		});
	});
})();