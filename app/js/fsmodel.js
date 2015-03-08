// Object

// will handle all database related transactions
//  1. creation of database if not available
//  2. retrieve updated database, then load in local system
//  3. add row(s) to local database
//  4. retrieve or update row(s) from local database
//  5. send updates to the remote database if possible (20 queries/5 mins)

'use strict';
/* global FSDBHandler */

function FSModel() {
	this.defines = {
		url : "http://localhost/fs/index.php",
		updateLog : {}
	};
}

FSModel.prototype = {
	_initDatabase : function(){
		var dbh = new FSDBHandler();
		var self = this;
		this.defines.dbh = dbh;

		var updateLog = this.defines.updateLog;

		dbh.openDatabase('fsdb_test','1.0','Local database for FileStalker',5*1024*1024);
 		dbh.defines.db.transaction(function(x){
 			var tables = {
 				'staff' : 'CREATE TABLE staff (empno TEXT NOT NULL PRIMARY KEY, name TEXT UNIQUE NOT NULL, password TEXT NOT NULL, picture TEXT, lastUpdated DATETIME)',
 				'staff_offices' : 'CREATE TABLE staff_offices (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, empno TEXT NOT NULL, office TEXT NOT NULL, lastUpdated DATETIME)',
 				'documents' : 'CREATE TABLE documents (trackingNo TEXT NOT NULL PRIMARY KEY, subject TEXT NOT NULL, description TEXT, type TEXT, status INTEGER, lastUpdated DATETIME)',
 				'locations_log' : 'CREATE TABLE locations_log (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, empno TEXT NOT NULL, trackingno TEXT NOT NULL, logDate DATETIME NOT NULL, office TEXT NOT NULL, sender INTEGER NOT NULL, lastUpdated DATETIME)',
 				'queue' : 'CREATE TABLE queue (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, request TEXT NOT NULL, data TEXT NOT NULL, enqueueDate DATETIME NOT NULL)'
 			};

 			$.each(tables, function(name, value){
 				// console.log("creating table "+name);
 				dbh.prepAndExecSql(x, value, [],
 					function(success, params, x){
 						if(self._updateLogs(name, x)){ self._updateTable(name, updateLog[name], x); }
 					}, null);
 			});
 		});
	},
	_updateLogs : function(name, x) {
		var dbh = this.defines.dbh;
		var updateLog = this.defines.updateLog;

 		if(name !== 'queue') {
			dbh.prepAndExecSql(x, "SELECT lastUpdated FROM "+name+" ORDER BY lastUpdated DESC LIMIT 1", [],
				function(success, params, x){
					// console.log(name);
					// console.log(success);
					if(success.rows.length !== 0) {
						// console.log("select success");
						updateLog[name] = success.rows[0].lastUpdated;
						// console.log(updateLog[name]);
					}
					else {
						// console.log("select failed");
						updateLog[name] = '0000-00-00 00:00:00';
						// console.log(updateLog[name]);
					}	 							
				}, null);
			return 1;
		}
 	},
 	_updateTable : function(tableName, lastUpdated, x) {
 		var dbh = this.defines.dbh;
 		var self = this;

	 	lastUpdated = (lastUpdated === undefined)? '0000-00-00 00:00:00' : lastUpdated;
	 	var inserts = [];
	 	var _insertInto = function(inserts, sql){
	 		// console.log(inserts);
	 		// console.log(sql);

 			var insertIds = [];
			// console.log("insert to: "+tableName);
			// console.log("values: ");
			// console.log(inserts);
			// console.log("sql: ");
			// console.log(sql);

			$.each(inserts, function(i, insert){
				dbh.prepAndExecSql(null, sql, insert,
					function(succ, params, x){
						// console.log("insert: ");
						// console.log(insert);
						// console.log(typeof inserts);
						insertIds.push(succ.insertId);
						self._updateLogs(tableName, x);
					}, null);
			});
		};

		if(tableName !== 'queue') {
	 		$.ajax({
	 			url : self.defines.url + '?func=update',
	 			data : { tableName : tableName, lastUpdated : lastUpdated },
	 			type: 'POST',
	 			success : function(results) {
	 				var sql;
	 				var inserts = [];

	 				switch(tableName) {
	 					case 'staff':
			 				sql = "INSERT INTO staff VALUES (?, ?, ?, ?, ?)";
							break;
						case 'staff_offices':	
							sql = "INSERT INTO staff_offices VALUES (?, ?, ?, ?)";
							break;
						case 'documents':
							sql = "INSERT INTO documents VALUES (?, ?, ?, ?, ?, ?)";
							break;
						case 'locations_log':
							sql = "INSERT INTO locations_log VALUES (?, ?, ?, ?, ?, ?, ?)";
							break;
	 				}

	 				inserts = $.makeArray(results.split(";"));
	 				_insertInto(inserts, sql);
	 			}
	 		});
		}
	},
	_authenticateLogin : function(name, password, callback) {
		var dbh = this.defines.dbh;
		var ret = {};

		console.log("authenticating");

		dbh.prepAndExecSql(null, "SELECT * FROM staff WHERE name='"+name+"' LIMIT 1",[],
 			function(success,params,x){
 				if(success.rows.length === 1) {
 					if(password === success.rows[0].password) {
 						callback(0, success);
 					}
 					else{
 						callback(2, null);
 					}
 				}
 				else if(success.rows.length === 0) {
 					callback(1, null);
 				}
 				else console.log("Database error");
 			}, null);
	},
	_verifyQRCode : function(code, action, callback) {
		var dbh = this.defines.dbh;

		dbh.prepAndExecSql(null, "SELECT * FROM documents WHERE trackingNo='"+code+"'", [],
			function(success,params,x){
				if(success.rows.length === 1) {
					if(action === "register") {
						callback(code, action, 1, success);
					}
					else if(action === "receive") {
						callback(code, action, 0, success);
					}
				}
				else {
					if(action === "register") {
						callback(code, action, 0, success);
					}
					else if(action === "receive") {
						callback(code, action, 1, success);
					}
				}
			}, null);
	},
	_getUserOffices : function(empno, callback, parameters) {
		var dbh = this.defines.dbh;

		dbh.prepAndExecSql(null, "SELECT office FROM staff_offices WHERE empno='"+empno+"'", [],
			function(success,params,x){
				var offices = [];
				$.each(success.rows, function(i, o){
					offices.push(o.office);
				});
				callback(offices, parameters);
			}, null);
	},
	_insertToDatabase : function(action, data, callback) {
		var dbh = this.defines.dbh;

		var empno = sessionStorage.getItem('empno'),
			d = new Date(),
			year = d.getFullYear(),
			month = ((d.getMonth()+1).toString().length === 1)? "0"+(d.getMonth()+1) : (d.getMonth()+1),
			date = (d.getDate().toString().length === 1)? "0"+d.getDate() : d.getDate(),
			hour = (d.getHours().toString().length === 1)? "0"+d.getHours() : d.getHours(),
			minute = (d.getMinutes().toString().length === 1)? "0"+d.getMinutes() : d.getMinutes(),
			second = (d.getSeconds().toString().length === 1)? "0"+d.getSeconds() : d.getSeconds(),
			datetime = year+"-"+month+"-"+date+" "+hour+":"+minute+":"+second,
			trackingNo = data.trackingno,
			subject = data.subject,
			description = data.desc,
			type = data.type,
			office = data.office;

		console.log(action);
		if(action === "register") {				
			var insert = ['REGDOC',"{'trackingno':'"+trackingNo+"', 'subject':'"+subject+"', 'description':'"+description+"', 'subject':'"+subject+"', 'type':'"+type+"', 'status':'0', 'lastUpdated':'"+datetime+"', 'empno':'"+empno+"', 'office':'"+office+"', 'logDate':'"+datetime+"'}",datetime];
			dbh.prepAndExecSql(null, "INSERT INTO queue(request, data, enqueueDate) VALUES (?, ?, ?)", insert,
				function (succ,params, x){
					console.log('Insert to queue success!');
				}, null);

			var insert2 = [trackingNo, subject, description, type, 0, datetime];
			dbh.prepAndExecSql(null, "INSERT INTO documents(trackingno, subject, description, type, status, lastUpdated) VALUES (?, ?, ?, ?, ?, ?)", insert2,
				function (succ,params, x){
					console.log('Insert to documents success!');
				}, null);

			var insert3 = [empno, trackingNo, datetime, office, 1, datetime];
			dbh.prepAndExecSql(null, "INSERT INTO locations_log(empno, trackingno, logDate, office, sender, lastUpdated) VALUES (?, ?, ?, ?, ?, ?)", insert3,
				function (succ,params, x){
					console.log('Insert to locations_log success!');
				}, null);

			if (typeof(callback) === "function") callback(trackingNo);
		}
		else if(action === "receive") {
			var insert = ['RECDOC',"{'trackingno':'"+trackingNo+"', 'status':'1', 'lastUpdated':'"+datetime+"', 'empno':'"+empno+"', 'office':'"+office+"', 'logDate':'"+datetime+"', 'sender': '0'}",datetime];
			dbh.prepAndExecSql(null, "INSERT INTO queue(request, data, enqueueDate) VALUES (?, ?, ?)", insert,
				function (succ,params, x){
					console.log('Insert to queue success!');
				}, null);

			var insert2 = [empno, trackingNo, datetime, office, 0, datetime];
			dbh.prepAndExecSql(null, "INSERT INTO locations_log(empno, trackingno, logDate, office, sender, lastUpdated) VALUES (?, ?, ?, ?, ?, ?)", insert2,
				function (succ,params, x){
					console.log('Insert to locations_log success!');
				}, null);

			dbh.prepAndExecSql(null, "UPDATE documents SET status = 1, lastUpdated = '"+datetime+"' WHERE trackingno = '"+trackingNo+"'", [],
				function (succ,params, x){
					console.log('Update status success!');
				}, null);

			if (typeof(callback) === "function") callback(trackingNo);
		}
	}
};