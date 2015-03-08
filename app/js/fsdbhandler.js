'use strict';

function FSDBHandler() {
	this.defines = {};
}

FSDBHandler.prototype = {
	openDatabase : function(dbname,dbversion,dbdesc,dbsize) {
		this.defines.dbname = dbname;
		this.defines.db = window.openDatabase(dbname,dbversion,dbdesc,dbsize);

		return this.defines.db;
	},
	_executeSql : function(transaction,query,values,callback,cbparams) {
		var ret = {};
		values = (typeof("values") !== undefined)? values : [];
		if(transaction === null) {
			try {
				this.defines.db.transaction(function(x){
					x.executeSql(query, values,
						function(x,succ){
							ret.rowsAffected = succ.rowsAffected;
							try{ ret.insertId = (succ.insertId !== undefined)? succ.insertId : undefined; }
							catch(e) {}
							ret.rows = [];
							var len = succ.rows.length;
							for(var i = 0; i < len; i++) {
								ret.rows.push(succ.rows.item(i));
							}
							if (typeof(callback) === "function") callback(ret, cbparams, x);
						},
						function(x,fail){
							console.log("Fail to execute SQL.");
							console.log("Error code: "+fail.code);
							console.log("Error message: "+fail.message);
							if (typeof(callback) === "function") callback(ret, cbparams, x);
						});
				});
			}
			catch(e) {
				console.log("Fail to execute SQL.");
				console.log("Error: "+e);
			}
		}
		else {
			try {
				console.log(transaction);
				console.log(query);
				console.log(values);
				transaction.executeSql(query, values,
					function(x, succ){
						ret.rowsAffected = succ.rowsAffected;
						ret.rows = [];
						var len = succ.rows.length;
						for (var i = 0; i < len; i++) {
							ret.rows.push(succ.rows.item(i));
						}
						if (typeof(callback) === "function") callback(ret, cbparams, x);
					},
					function(x, fail){
						console.log("Fail to execute SQL.");
						console.log("Error code: "+fail.code);
						console.log("Error message: "+fail.message);
						if (typeof(callback) === "function") callback(ret, cbparams, x);
					});
			}
			catch(e) {
				console.log("Fail to execute SQL.");
				console.log("Error: "+e);
			}
		}
	},
	prepAndExecSql : function(transaction,query,values,callback,cbparams) {
		var cb = function() {
				if(typeof(callback) === "function") { callback.apply(this, arguments); }
			};

		this._executeSql(transaction,query,values,cb,cbparams);
	}
};