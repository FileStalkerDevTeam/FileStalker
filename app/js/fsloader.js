function FSLoader() {
	this.defines = {
		gridWidth : 3,
		cellWidth : 35,
		hidden : 1,
		animationAction : "random"
	};
};

FSLoader.prototype = {
	_initLoader : function(){
		var width = this.defines.gridWidth,
			cellWidth = this.defines.cellWidth,
			gWidth = cellWidth * width,
			gTop = (window.innerHeight/2)-gWidth,
			gLeft = (window.innerWidth-gWidth)/2;

		$("#loadingpane").append("<div id='grid'></div>");
		$("#grid").css({
			width : gWidth+"px",
			height : gWidth+"px",
			top : gTop+"px",
			left : gLeft+"px"
		});
		
		$(window).resize(function(){
			gTop = (window.innerHeight/2)-gWidth,
			gLeft = (window.innerWidth-gWidth)/2;

			$("#grid").css({
				top : gTop+"px",
				left : gLeft+"px"
			});
		});

		for(var i=0; i<width; i++) {
			for(var j=0; j<width; j++) {
				var cell = document.createElement("div");
				cell.id = "cell"+i+j;
				$(cell).data('i', i).data('j', j).addClass("gridcell").css({
					width : cellWidth+"px",
					height : cellWidth+"px",
					top : (i*cellWidth)+"px",
					left : (j*cellWidth)+"px"
				});
				$("#grid").append(cell);
			}
		}

		this.defines.datagrid = new Array;
		var datagrid = this.defines.datagrid;
		for(var i=0; i<width; i++) {
			datagrid[i] = new Array;
		}

		this._initGrid();
	},
	_random : function(x){
		return Math.round(Math.random()*x);
	},
	_initGrid : function(){
		var datagrid = this.defines.datagrid,
			width = this.defines.gridWidth;

		for(var i=0; i<width; i++) {
			for(var j=0; j<width; j++) {
				datagrid[i][j] = {
					display : this._random(1),
					action : 0
				};
				if(!datagrid[i][j].display) {
					var cellId = "#loadingpane #cell"+i+j;
					$(cellId).addClass("hidden");
				}
			}
		}
	},
	_startLoader : function(){
		var self = this,
			datagrid = this.defines.datagrid,
			width = this.defines.gridWidth,
			animationAction = this.defines.animationAction,
			getActionClass = function(display, action) {
				if(action == 1) { if(display) return "zoom-in-out"; else return "zoom-out-in"; }
				if(action == 2) { if(display) return "zoom-out-out"; else return "zoom-in-in"; }
			};

		this._loadingInterval = setInterval(function(){
			if(!self.defines.hidden) {
				for(var i=0; i<width; i++) {
					for(var j=0; j<width; j++) {
						var cellId = "#cell"+i+j;
						var display = datagrid[i][j].display;
					
						if(datagrid[i][j].action) continue;

						var action = self._random(2);

						if(action == 0) continue;

						datagrid[i][j].action = action;

						var actionClass = getActionClass(display, action);
						
						$(cellId).addClass(actionClass).css('-webkit-animation-duration', (self._random(self._random(1)+2)+1)+"s");

						$(cellId).off("webkitAnimationEnd").on("webkitAnimationEnd", function(e){
							var row = $(this).data('i'),
								col = $(this).data('j'),
								d = datagrid[row][col].display,
								a = datagrid[row][col].action;

							$(this).removeClass(getActionClass(d, a));
							if(d) $(this).addClass("hidden");
							else $(this).removeClass("hidden");

							datagrid[row][col].action = 0;
							datagrid[row][col].display = 1 - d;
						});
					}
				}
			}
		}, 100);
	},
	_showLoader : function(){
		this.defines.hidden = 0;
		this._startLoader();
		$('#loadingpane').fadeIn(400);
	},
	_hideLoader : function(){
		$('#loadingpane').fadeOut(400);
		this.defines.hidden = 1;
		clearInterval(this.defines._loadingInterval);
	}
};