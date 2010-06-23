/*!
 * Galleria SmugMug Plugin v 1.0
 * http://galleria.aino.se
 *
 * Copyright 2010, AndrewShilliday
 * Licensed under the MIT license.
 */

(function() {
    
    var G = window.Galleria; 
    if (typeof G == 'undefined') {
	return;
    }

    var S = G.SmugMug = function(APIKey) {
	if (!APIKey) {
            G.raise('No API key found');
	}
	this.callback = function(){};
	this.APIKey = APIKey;
	this.options = {
	    max: 40,
	    size: 'big',
	};
	this._call({
	    method: 'smugmug.login.anonymously',
	    APIKey: APIKey
	}, function (data) {
	    this.SessionID = data.Login.Session.id;
	})
    }
    
    S.prototype = {
	getAlbum: function(AlbumID, AlbumKey) {
	    this._set(arguments);
	    this._find({
		method: 'smugmug.images.get',
		AlbumID: AlbumID,
		AlbumKey: AlbumKey,
		Heavy: 'TRUE'
	    });
	},
	
	_set: function(args) {
	    args = Array.prototype.slice.call(args);
	    this.callback = args[3] || args[2] || args[1];
	    if (typeof args[1] == 'object') {
		this.setOptions(args[1]);
	    }
	    return this;
	},
	
	_call: function(params, callback) {
	    var url = 'http://api.smugmug.com/hack/json/1.2.0/?';
	    var scope = this;
	    if (this.SessionID) {
		params = jQuery.extend({SessionID: this.SessionID}, params);
	    } 
	    params=jQuery.extend({JSONCallback: '?'}, params);
	    
	    jQuery.each(params, function(key, value) {
		url += '&'+ key + '=' +value;
	    });
	    jQuery.getJSON(url, function(data) {
		if (data.stat == 'ok') {
		    callback.call(scope, data);
		} else {
		    G.raise(data.code.toString() + ' ' + data.stat + ': ' + data.message);
		}
	    });
	    return scope;
	},
	
	_find: function(params) {
	    params = jQuery.extend({
		method: 'smugmug.images.get',
	    }, params);
	    
	    return this._call(params, function(data) {
		var obj = { length: 0 };
		var photos = data.Images;
		var len = Math.min(this.options.max, photos.length);
		
		for (var i=0; i<len; i++) {
    		    var photo = photos[i],
    			img = photo.MediumURL;
    		    switch(this.options.size) {
    		    case 'small':
    			img = photo.SmallURL;
    			break;
    		    case 'big':
    			if (photo.LargeURL) {
    		            img = photo.LargeURL;
    			} else if(photo.OriginalURL) {
    		            img = photo.OriginalURL;
    			}
    			break;
    		    case 'original':
    			if(photo.OriginalURL) {
    		            img = photo.OriginalURL;
    			}
    			break;    
    		    }
		    var item = {
			thumb: photos[i].ThumbURL,
			image: img,
			title: photos[i].Caption
		    };
		    Array.prototype.push.call(obj, item);
		}
		this.callback.call(this, obj);
	    });
	}
    }

    // Static
    S.getFeed = function(type, params) {
	
    }

})();