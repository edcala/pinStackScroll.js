//pinStackScroll (ver. 1.0) - Author: Eddie Cala 30/10/2013
//Function: Have selected elements pinned at the top of the page when scrolled and these elements clip the top.
//Method: Create a clone div that is static, make original div invisible so that layout is not affected.
//Future plugin to do: 
//	- Have option to pin at any point on the viewport
//	- Have option for selected elements to be pinned at multiple points (eg, top and bottom).
/*notes:
	- There is an issue with having different elements placed before the intended
		selected 'card' elements... code gets broken (fixed! After understanding the limitations of 'nth-child')

		
Variables:
elemName: Class or ID of element(s) to be stacked.

overlapStack: (true||false)
	true - The static divs appear when the top of the original divs clips the top of the viewport.
	false - (defaults) The static divs appear when the top of the original divs clips the bottom of an existing static div.

remainOnTop: (true||false)
	true - Stacked elements remain on the viewport even when stacked elements have been scrolled to the top.
	false - (defaults) Stacked elements will scroll out of the screen once the last element to be stacked clips the top of the viewport.

triggerClass: (""||[css class name])
	A css class can be triggered once the selected elements hit the top of the viewport. This gives flexibility for CSS3 animated effects.
	The defaults class is "null" which tells the plugin not to load any class.
	
	Current premade classes:
		"_hide" : Makes selected elements invisible
*/
(function($){
	
	var _constants = {
		defaults: {
			overlapStack: false,
			remainOnTop: false,
			triggerClass: null
		},
		//defaults css class vars. Does not need to be changed unless element names conflict with existing uncompromisable elements.
		stackElemClass: "_stackedElem",	//css class for "minimised" stack element
		stackContainerClass: "_stackContainer",
		j_stackElemClass: null,
		j_stackContainerClass: null
	}
	//do not modify
	_constants.j_stackElemClass = '.'+_constants.stackElemClass;
	_constants.j_stackContainerClass = '.'+_constants.stackContainerClass;
	
	var _variables = {
		options: {},
		stackList: undefined,
		lastScrollY: 0,
		stackContainerID: null,
		j_stackContainerID: null
	}
	
	var _private = {
		init: function(elems, options){
			_variables.stackList = elems;
			_variables.options = $.extend({}, _constants.defaults, options);
			_variables.stackContainerID = elems.selector.substring(1, this.length) + _constants.stackContainerClass;
			_variables.j_stackContainerID = "#" + _variables.stackContainerID;
			$(window).scroll(_private.checkY);
			//$(this).data("_variables.options", _variables.options);
			return elems;
		},
		checkY: function(){
			var scrollY = $(this).scrollTop();
			//check scroll position of all stacking elements
			_variables.stackList.each(function(){
				var y = $(this).offset().top;
				if(_variables.options.overlapStack){
					if(scrollY >= y){
						_private.enableStackDiv($(this));
					}else{
						_private.disableStackDiv($(this));
					}
				}else{
					var stackContainerHeight = ($(_variables.j_stackContainerID).height());
					var stackDivHeight = ($(_constants.j_stackElemClass).height());
					//if scroll direction is down...
					if(scrollY > _variables.lastScrollY){
						if(scrollY >= y - stackContainerHeight){
							_private.enableStackDiv($(this));
						}
					}else{
						if(scrollY < y - stackContainerHeight + stackDivHeight){
							_private.disableStackDiv($(this));
						}
					}
				}
			});
			if(!_variables.options.remainOnTop){
				//check if all elements are stacked
				if($(_variables.j_stackContainerID).length > 0){
					//get lowest stack Y point (last stacking element scroll position) + (last element height) - (stack container height)
					var lowestStackYPoint = _variables.stackList.last().offset().top + _variables.stackList.last().height() - $(_variables.j_stackContainerID).height();
					if(scrollY > lowestStackYPoint)
						$(_variables.j_stackContainerID).offset({top : lowestStackYPoint});
					else
						$(_variables.j_stackContainerID).removeAttr("style");
				}
			}
			_variables.lastScrollY = scrollY;
		},
		enableStackDiv: function(obj){
			var objPosition=_variables.stackList.index(obj) + 1;
			if($(_constants.j_stackElemClass).length < objPosition){
				_private.createStackDiv(obj);
			}
			if(_variables.options.triggerClass) obj.addClass(_variables.options.triggerClass);
			$(document).find(_constants.j_stackElemClass+":nth-child("+objPosition+")").removeAttr("id").css("display", "block");
		},
		disableStackDiv: function(obj){
			var objPosition=_variables.stackList.index(obj) + 1;
			if(_variables.options.triggerClass) obj.removeClass(_variables.options.triggerClass);
			$(document).find(_constants.j_stackElemClass+":nth-child("+objPosition+")").css("display", "none");
		},
		createStackDiv: function(obj){
			if($(_variables.j_stackContainerID).length == 0){
				obj.parent().append('<div id="' + _variables.stackContainerID + '" class="'+_constants.stackContainerClass+'"></div>');
			}
			obj.clone().removeClass(obj.attr("class")).addClass(_constants.stackElemClass).appendTo($(_variables.j_stackContainerID)).width(obj.width());
		}
	}

	$.fn.pinStackScroll = function(options){
		return _private.init(this, options);
	};

}(jQuery));