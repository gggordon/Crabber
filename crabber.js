/**
 * @author gggordon <https://github.com/gggordon>
 * @overview Crabber
 * @description Grabs Content of External Links Posted
 * @license MIT
 * @created 2.11.2015
 * @dependencies
 *     - jquery 2.1.*
 */

 (function($,w){
 	function Crabber(divNode, options){
        if(divNode == null || divNode == undefined)
        	return;
        options = options || {};
        var _self = this;
        _self._$tbox=$(divNode);
 	}

    if(w instanceof Object){
        w.Crabber = Crabber;
    }
    $.fn.crabber = function(opts){
        return this.each(function(i,el){
        	new Crabber(el,opts);
        });
    };
 	
 })(jQuery,window);
