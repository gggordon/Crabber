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
        _self.type = props.type || "website";
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
        	for(var i=0;i<links.length;i++){

        	}
        	if(callback && typeof callback == 'function')
        		callback(contents);

        	return contents;
        };
        _self.__getContentUsingYQL=function(link,callback){
        	var yqlQuery = "select * from html where url=\""+link+"\" and xpath='/html'";
        	//https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Figonics.com%22%20and%20xpath%3D'%2Fhtml'&diagnostics=true
        	var yqlUrl = "https://query.yahooapis.com/v1/public/yql?q="+encodeURIComponent(yqlQuery)+"&diagnostics=true";
        	$.ajax({
                 url:yqlUrl,
                 success:function(data){
                 	console.log('success');
                    console.log(data);
                    var head = data.query.results.html.head;
                    var title = head.title;
                    var desc = (function(meta){
                         for(var i=0;i< meta.length;i++){
                           if(meta[i].name=="description")
                             return meta[i].content;
                         }
                         return '';
                     })(head.meta);
                 },
                 error:function(err){
                 	console.log('error');
                    console.log(err);
                 }
             });
        }
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
