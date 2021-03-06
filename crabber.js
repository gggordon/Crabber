/**
 * @author gggordon <https://github.com/gggordon>
 * @overview Crabber
 * @description Grabs Content of External Links Posted
 * @license MIT
 * @created 2.11.2015
 * @dependencies
 *     - jquery >1.11.*
 */

 (function($,w){
 	if($==undefined || $ == null){
 		throw new Error("jQuery required for Crabber");
 	}
    /**
     * @method getWebsiteUrl
     * @description Gets Website URL from Link String
     * @param url String Url to parse
     * @param [fullPath] Boolean Get Full Path if true and get's only Base URI if false/undefined
     */
    function getWebsiteUrl(url,fullPath) {
        var    a      = document.createElement('a');
               a.href = url;
        return a.protocol+"//"+a.hostname+(a.port ? ":"+a.port: "" )+(fullPath ? a.pathname : "");
    }

    /**
     * @method firstNWords
     * @description Gets first N words of a string
     * @param str String String to extract words from
     * @param [wordCount] Integer Number of words to get. Default: 20
     */
    function firstNWords(str,wordCount){
        wordCount = wordCount || 20;
        return typeof str == 'string' ? str.split(' ').slice(0,wordCount).join(' ') : "";
    }

 	/**
 	 * @class ExternalContent
     * @param props Object Configuration Object
     * @param props.title String Title
     * @param props.description String Page Description
     * @param props.videoUrl String Url of Video
     * @param props.url String Link Url
     * @param props.descWordCount String Number of words to get from description
     * @param props.videoType String ** Not Used
     * @param props.imageUrl String ** Not Used
 	 */
 	function ExternalContent(props){
        props = props || {};
        var _self = this;
        _self.title = props.title || "";
        _self.url = props.url || "";
        _self.description = firstNWords(props.description,props.descWordCount) || "";
        _self.type = props.type || "website";
        _self.imageUrl = props.imageUrl || "";
        _self.websiteUrl = props.websiteUrl || "";
        
        /**
         * Display HTML 
         * @param options Object
         * @overide
         */
        _self.display=function(options){
            return '<div class="crabber-view">\
                        <a target="_blank" href="'+_self.url+'">\
                            <div class="cv-left">\
                                <img src="'+_self.imageUrl+'" alt="'+_self.title+'" onerror="Crabber.remove_image(this)" />\
                            </div>\
                            <div class="cv-right">\
                                <h4>'+_self.title+'</h4>\
                                <p>'+_self.description+'</p>\
                                <p><i>from '+_self.websiteUrl+'</i></p>\
                            </div>\
                        </a>\
                    </div>';
        }
 	}

 	/**
 	 * @class Crabber
 	 * @param divNode HTMLInputElement textbox that should be monitored for new links
 	 * @param options Object configuration settings
     * @param [options.descWordCount] String Number of words to get from description. Default: 20
     * @param [options.appendContent] Boolean Whether crabber should append/prepend content. Default: true
 	 */
 	function Crabber(divNode, options){
        if(divNode == null || divNode == undefined)
        	return;

        options = options || {};
        var _self = this;
        _self.descWordCount = options.descWordCount || 20;
        _self.appendContent = options.appendContent==false?false : true;
        _self._$tbox=$(divNode);
        _self._$viewNode = $(options.viewNode || (function($tbox){
            var uuid= "crab-view-"+parseInt(Math.random()*50000);
            $tbox.after('<div id="'+uuid+'" class="crab-view"></div>').promise().then(function(){
                _self._$viewNode = $('#'+uuid);
            });
            return $('#'+uuid).get(0);
        })(_self._$tbox));
        _self.links = [];
        _self._display = options.display || null;
        _self._getLinksFromStr=function(str){
        	return (str || "").match(/(http:|https:)?\/\/\S+/ig) || [];
        };
        /**
         * @method _getContentFromLinks
         * @private
         * @param links Array|string 
         * @param callback function(Array|ExternalContent) Callback function accepting array of ExternalContent
         */
        _self._getContentFromLinks=function(links,callback){
        	for(var i=0;i<links.length;i++){
                _self.__getContentUsingYQL(links[i],callback);
        	}
        };

        /**
         * @method __getContentUsingYQL
         * @private
         * @param link String 
         * @param callback function(Array|ExternalContent) Callback function accepting array of ExternalContent
         */
        _self.__getContentUsingYQL=function(link,callback){
        	var yqlQuery = "select * from html where url=\""+link+"\" and xpath='/html'";
        	//https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Figonics.com%22%20and%20xpath%3D'%2Fhtml'&diagnostics=true
        	var yqlUrl = "https://query.yahooapis.com/v1/public/yql?q="+encodeURIComponent(yqlQuery)+"&diagnostics=true";
        	$.ajax({
                 url:yqlUrl,
                 success:function(data){
                 	var $doc = $(data);
                    var title    = $doc.find('title').html(),
                        desc     = $doc.find('meta[name="description"]').attr("content") || "No description",
                        firstImg = (function(imgUrl){
                                      var img_url= imgUrl.match(/^(?:[a-z]+:)?\/\//i) != null ?
                                              imgUrl : 
                                              getWebsiteUrl(link)+"/"+imgUrl;
                                      return img_url.indexOf('http') > -1 ? img_url : "http:"+img_url;
                                   })($doc.find('img[src]').attr('src') || ""); 
                        if(callback && typeof callback == 'function')
                            callback([new ExternalContent({
                                title:title,
                                description:desc,
                                url:link,
                                imageUrl:firstImg,
                                websiteUrl:getWebsiteUrl(link),
                                descWordCount:_self.descWordCount
                            })]);
                    console.log('Successfully requested content from : '+link);
                 },
                 error:function(err){
                 	console.log('Error requesting content from : '+link);
                    console.log(err);
                 }
             });
        };

        /**
         * Append contents to node 
         * @param contents Array|ExternalContent
         */
        _self._appendContentToNode=function(contents){
             (contents || []).map(function(cn){
                 var $newCrabNode = $(cn.display());
                 $newCrabNode.crabber = function(){
                    console.log('I was called with arguments : ');
                    console.log(arguments);
                 }
                 _self._$viewNode[_self.appendContent ? "append" : "prepend"](
                     $newCrabNode
                 );	
             });
        }

        /*Event Listeners*/
        /**
         * @param evt Event
         */
        _self._appendOutputOnTextChange=function(evt){
            var newLinks = _self._getLinksFromStr(_self._$tbox.val())
                                .filter(function(link){
                                            var isNew = _self.links.indexOf(link) == -1;
                                            if(isNew)
                                                _self.links.push(link);
                                            return isNew;
                                }) || [];
            _self._getContentFromLinks(newLinks,_self._appendContentToNode)
        };
        _self._$tbox.change(_self._appendOutputOnTextChange);
 	}

    /**
     * Fallback for images that do not load
     */
    Crabber.remove_image = function(node){
        console.log('remove_image called');
        console.log('Removed '+$(node).attr('src'));
        $(node).remove();
    }

    if(w instanceof Object){
        w.Crabber = Crabber;
    }
    $.fn.crabber = function(opts){
        return this.each(function(i,el){
        	$(el).data('crab',new Crabber(el,opts));
        });
    };
 	
 })(jQuery,window);
