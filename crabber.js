/*\
|*|
|*|    JXON framework - Copyleft 2011 by Mozilla Developer Network
|*|
|*|    Revision #2 - August 27th, 2015
|*|
|*|    https://developer.mozilla.org/en-US/docs/JXON
|*|    https://developer.mozilla.org/User:fusionchess
|*|
|*|    This framework is released under the GNU Public License, version 3 or later.
|*|    http://www.gnu.org/licenses/gpl-3.0-standalone.html
|*|
\*/

const JXON = new (function () {

  const
    sValProp = "keyValue", sAttrProp = "keyAttributes", sAttrsPref = "@", /* you can customize these values */
    aCache = [], rIsNull = /^\s*$/, rIsBool = /^(?:true|false)$/i;

  function parseText (sValue) {
    if (rIsNull.test(sValue)) { return null; }
    if (rIsBool.test(sValue)) { return sValue.toLowerCase() === "true"; }
    if (isFinite(sValue)) { return parseFloat(sValue); }
    if (isFinite(Date.parse(sValue))) { return new Date(sValue); }
    return sValue;
  }

  function EmptyTree () {}

  EmptyTree.prototype.toString = function () { return "null"; };

  EmptyTree.prototype.valueOf = function () { return null; };

  function objectify (vVal) {
    return vVal === null ? new EmptyTree() : vVal instanceof Object ? vVal : new vVal.constructor(vVal);
  }

  function createObjTree (oParentNode, nVerb, bFreeze, bNesteAttr) {

    const
      nLevelStart = aCache.length, bChildren = oParentNode.hasChildNodes(),
      bAttributes = oParentNode.hasAttributes && oParentNode.hasAttributes(), bHighVerb = Boolean(nVerb & 2);

    var
      sProp, vContent, nLength = 0, sCollectedTxt = "",
      vResult = bHighVerb ? {} : /* put here the default value for empty nodes: */ true;

    if (bChildren) {
      for (var oNode, nItem = 0; nItem < oParentNode.childNodes.length; nItem++) {
        oNode = oParentNode.childNodes.item(nItem);
        if (oNode.nodeType === 4) { sCollectedTxt += oNode.nodeValue; } /* nodeType is "CDATASection" (4) */
        else if (oNode.nodeType === 3) { sCollectedTxt += oNode.nodeValue.trim(); } /* nodeType is "Text" (3) */
        else if (oNode.nodeType === 1 && !oNode.prefix) { aCache.push(oNode); } /* nodeType is "Element" (1) */
      }
    }

    const nLevelEnd = aCache.length, vBuiltVal = parseText(sCollectedTxt);

    if (!bHighVerb && (bChildren || bAttributes)) { vResult = nVerb === 0 ? objectify(vBuiltVal) : {}; }

    for (var nElId = nLevelStart; nElId < nLevelEnd; nElId++) {
      sProp = aCache[nElId].nodeName.toLowerCase();
      vContent = createObjTree(aCache[nElId], nVerb, bFreeze, bNesteAttr);
      if (vResult.hasOwnProperty(sProp)) {
        if (vResult[sProp].constructor !== Array) { vResult[sProp] = [vResult[sProp]]; }
        vResult[sProp].push(vContent);
      } else {
        vResult[sProp] = vContent;
        nLength++;
      }
    }

    if (bAttributes) {

      const
        nAttrLen = oParentNode.attributes.length,
        sAPrefix = bNesteAttr ? "" : sAttrsPref, oAttrParent = bNesteAttr ? {} : vResult;

      for (var oAttrib, nAttrib = 0; nAttrib < nAttrLen; nLength++, nAttrib++) {
        oAttrib = oParentNode.attributes.item(nAttrib);
        oAttrParent[sAPrefix + oAttrib.name.toLowerCase()] = parseText(oAttrib.value.trim());
      }

      if (bNesteAttr) {
        if (bFreeze) { Object.freeze(oAttrParent); }
        vResult[sAttrProp] = oAttrParent;
        nLength -= nAttrLen - 1;
      }

    }

    if (nVerb === 3 || (nVerb === 2 || nVerb === 1 && nLength > 0) && sCollectedTxt) {
      vResult[sValProp] = vBuiltVal;
    } else if (!bHighVerb && nLength === 0 && sCollectedTxt) {
      vResult = vBuiltVal;
    }

    if (bFreeze && (bHighVerb || nLength > 0)) { Object.freeze(vResult); }

    aCache.length = nLevelStart;

    return vResult;

  }

  function loadObjTree (oXMLDoc, oParentEl, oParentObj) {

    var vValue, oChild;

    if (oParentObj.constructor === String || oParentObj.constructor === Number || oParentObj.constructor === Boolean) {
      oParentEl.appendChild(oXMLDoc.createTextNode(oParentObj.toString())); /* verbosity level is 0 or 1 */
      if (oParentObj === oParentObj.valueOf()) { return; }
    } else if (oParentObj.constructor === Date) {
      oParentEl.appendChild(oXMLDoc.createTextNode(oParentObj.toGMTString()));
    }

    for (var sName in oParentObj) {
      vValue = oParentObj[sName];
      if (isFinite(sName) || vValue instanceof Function) { continue; } /* verbosity level is 0 */
      if (sName === sValProp) {
        if (vValue !== null && vValue !== true) { oParentEl.appendChild(oXMLDoc.createTextNode(vValue.constructor === Date ? vValue.toGMTString() : String(vValue))); }
      } else if (sName === sAttrProp) { /* verbosity level is 3 */
        for (var sAttrib in vValue) { oParentEl.setAttribute(sAttrib, vValue[sAttrib]); }
      } else if (sName.charAt(0) === sAttrsPref) {
        oParentEl.setAttribute(sName.slice(1), vValue);
      } else if (vValue.constructor === Array) {
        for (var nItem = 0; nItem < vValue.length; nItem++) {
          oChild = oXMLDoc.createElement(sName);
          loadObjTree(oXMLDoc, oChild, vValue[nItem]);
          oParentEl.appendChild(oChild);
        }
      } else {
        oChild = oXMLDoc.createElement(sName);
        if (vValue instanceof Object) {
          loadObjTree(oXMLDoc, oChild, vValue);
        } else if (vValue !== null && vValue !== true) {
          oChild.appendChild(oXMLDoc.createTextNode(vValue.toString()));
        }
        oParentEl.appendChild(oChild);
      }
    }

  }

  /* Uncomment the following code if you want to enable the .appendJXON() method for *all* the "element" objects! */

  /*

  Element.prototype.appendJXON = function (oObjTree) {
    loadObjTree(document, this, oObjTree);
    return this;
  };

  */

  this.build = function (oXMLParent, nVerbosity /* optional */, bFreeze /* optional */, bNesteAttributes /* optional */) {
    const nVerbMask = arguments.length > 1 && typeof nVerbosity === "number" ? nVerbosity & 3 : /* put here the default verbosity level: */ 1;
    return createObjTree(oXMLParent, nVerbMask, bFreeze || false, arguments.length > 3 ? bNesteAttributes : nVerbMask === 3);
  };

  this.unbuild = function (oObjTree, sNamespaceURI /* optional */, sQualifiedName /* optional */, oDocumentType /* optional */) {
    const oNewDoc = document.implementation.createDocument(sNamespaceURI || null, sQualifiedName || "", oDocumentType || null);
    loadObjTree(oNewDoc, oNewDoc, oObjTree);
    return oNewDoc;
  };

})();
/**
 * @author gggordon <https://github.com/gggordon>
 * @overview Crabber
 * @description Grabs Content of External Links Posted
 * @license MIT
 * @created 2.11.2015
 * @dependencies
 *     - jquery 2.1.*
 *     - JXON
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
        	var yqlUrl = "https://query.yahooapis.com/v1/public/yql?q="+encodeURIComponent(yqlQuery)+"&format=json&diagnostics=true&callback=";
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
