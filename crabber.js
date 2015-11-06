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
 	if($==undefined || $ == null){
 		throw new Exception("jQuery required for Crabber");
 	}
 	/**
     * @param props Object Configuration Object
     * @param props.title String Title
     * @param props.description String Page Description
     * @param props.videoUrl String Url of Video
     * @param props.url String Link Url
     * @param props.videoType String ** Not Used
     * @param props.imageUrl String ** Not Used
 	 */
 	function ExternalContent(props){
        props = props || {};
        var _self = this;
        _self.title = props.title || "";
        _self.url = props.url || "";
        _self.description = props.description || "";
        _self.type = props.type || "";
        _self.imageUrl = props.imageUrl || "";
        
        /**
         * Display HTML 
         * @param options Object
         * @overide
         */
        _self.display=function(options){
            return '<div class=""></div>';
        }
 	}

 	/**
 	 * @param divNode HTMLInputElement
 	 * @param options Object
 	 * @param options.
 	 */
 	function Crabber(divNode, options){
        if(divNode == null || divNode == undefined)
        	return;

        options = options || {};
        var _self = this;
        
        _self._$tbox=$(divNode);
        _self._$viewNode = $(options.viewNode || (function($tbox){
            var uuid= "crab-view-"+Math.random()*50;
            $tbox.after('<div id="'+uuid+'" class="crab-view"></div>');
            return $('#'+uuid).get(0);
        })(_self._$tbox));
        _self.links = [];
        _self._display = options.display || null;
        _self._getLinksFromStr=function(str){
        	return (str || "").match(/(http:|https:)?\/\/\S+/ig) || [];
        };
        /**
         * @param links Array|string 
         * @param callback function(Array|ExternalContent) Callback function accepting array of ExternalContent
         */
        _self._getContentFromLinks=function(links,callback){
        	var contents = [];
        	
        	if(callback && typeof callback == 'function')
        		callback(contents);

        	return contents;
        };
        /**
         * Append contents to node 
         * @param contents Array|ExternalContent
         */
        _self._appendContentToNode=function(contents){
             (contents || []).map(function(cn){
                 _self._$viewNode.append(
                     cn.display()
                 );	
             });
        }

        /*Event Listeners*/
        /**
         * @param evt Event
         */
        _self._appendOutputOnTextChange=function(evt){
            var newLinks = _self._getLinksFromStr(_self._$tbox.html())
                                .filter(function(link){
                                            var isNew = _self.links.indexOf(link) > -1;
                                            if(isNew)
                                                _self.links.push(link);
                                            return isNew;
                                }) || [];
            _self._getContentFromLinks(newLinks,_self._appendContentToNode)
        };
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
