function FSPages() {
	this.defines = {};
};

FSPages.prototype = {
	register : function(trackingno, offices) {
		var office = "";
		$.each(offices, function(i, o){
			office += "<option value='"+o+"'>"+o+"</option>";
		});
		var ret = "<div class='title'>Register New Document</div><div class='content'><div class='trackingno'>Tracking No. <span id='input'>"+trackingno+"</span></div><form action='' method='POST'><label for='subject'>Subject</label><input type='text' name='subject' id='subject' required/><label for='desc'>Description</label><textarea rows='3' cols='50' name='desc' id='desc'></textarea><label for='type'>Type</label><select name='type' id='type' required><option value='letter'>Letter</option><option value='report'>Report</option><option value='proposal'>Proposal</option><option value='form'>Form</option></select><label for='office'>Office</label><select name='office' id='office' required>"+office+"</select></form><button class='submit-button'>All set...Register!</button></div>";
		return ret;
	},

	receive : function() {

	},

	confirm : function() {

	},

	listresult : function() {

	},

	timeline : function() {
		
	}
};