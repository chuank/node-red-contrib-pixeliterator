/**
 *
 *  node-red-contrib-pixeliterator
 *  Copyright 2019 Chuan Khoo.
 *  www.chuank.com
 *
 **/
module.exports = function(RED) {
	"use strict";
	var Jimp = require("jimp");

	function PixelIteratorNode(n) {
		RED.nodes.createNode(this,n);

		var node = this;
		node.pollInterval = n.pollinterval;

		node.on("input", function(msg) {
			// process incoming data; allows either string url, or Buffer containing raw image data (KIV)

			// v0.1.0: doing just string URL for now
			readImage(node, msg.payload);
		});

		node.on("close", function() {		// tidy up!
			// clearInterval(node.refreshTokenIntervalID);			//long-lived token refresh (15min)
			// delete node.refreshTokenIntervalID;
		});
	}

	function readImage(node, url) {
		node.trace("readImage:", url);
		Jimp.read(url)
			.then(function(image) {
				// Do stuff with the image.
				node.trace("jimp image:");
				node.trace(image.width, ",", image.height);
			})
			.catch(function(err) {
				node.error(err);
			});
	}

	RED.nodes.registerType("pixeliterator", PixelIteratorNode);
};
