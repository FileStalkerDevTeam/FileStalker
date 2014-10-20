function FSPages() {
	this.defines = {};
};

FSPages.prototype = {
	register : function(trackingno, offices) {
		var office = "";
		$.each(offices, function(i, o){
			office += "<option value='"+o+"'>"+o+"</option>";
		});
		var ret = "<div class='title'>Register New Document</div><div class='content'><form action='' method='POST'><div class='trackingno'>Tracking No. <span id='input'>"+trackingno+"</span></div><div class='subjectwrapper'><label for='subject'>Subject <span class='required'>(Required field)</span></label><br/><input type='text' name='subject' id='subject' required/></div><div class='descwrapper'><label for='desc'>Description</label><br/><textarea rows='3' name='desc' id='desc'></textarea></div><div class='typewrapper'><label for='type'>Type <span class='required'>(Required field)</span></label><br/><select name='type' id='type' required><option value='letter'>Letter</option><option value='report'>Report</option><option value='proposal'>Proposal</option><option value='form'>Form</option></select></div><div class='officewrapper'><label for='office'>Office <span class='required'>(Required field)</span></label><br/><select name='office' id='office' required>"+office+"</select></div></form><div class='buttonwrapper'><button class='submit-button'>All set...</button></div></div>"
		return ret;
	},

	receive : function(trackingno,subject,desc,type,offices) {
		var office = "";
		$.each(offices, function(i, o){
			office += "<option value='"+o+"'>"+o+"</option>";
		});
		var ret = "<div class='title'>Receive Document</div><div class='content'><form action='' method='POST'><div class='infowrapper'><div class='trackingno'>Tracking No. <span id='input'>"+trackingno+"</span></div><div class='subjectwrapper'><div class='subject'>Subject</div><div class='subjectinput'>"+subject+"</div></div><div class='descwrapper'><div class='desc'>Description</div><div class='descinput'>"+desc+"</div></div><div class='typewrapper'><div class='type'>Type</div><div class='typeinput'>"+type+"</div></div></div><div class='inputwrapper'><div class='officewrapper'><label for='office'>Receiving Office <span class='required'>(Required field)</span></label><br/><select name='office' id='office' required>"+office+"</select></div><div class='remarkswrapper'><label for='remarks'>Remarks</label><br/><textarea rows='3' name='remarks' id='remarks'></textarea></div></div></form><div class='buttonwrapper'><button class='submit-button'>Confirm...</button></div></div>";
		return ret;
	},

	confirm : function() {

	},

	listresult : function() {

	},

	timeline : function() {
		
	}
};