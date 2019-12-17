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
		node.url = n.url;

		node.on("input", function(msg, send, done) {
			// process incoming data; allows either string url, or Buffer containing raw image data (KIV)
			// v0.1.0: doing just string URL for now

			node.debug("readImage:");
			node.debug(msg.payload);
			readImage(node, msg.payload);

			if(done) {
				done();
			}
		});

		node.on("close", function() {		// tidy up!
			// clearInterval(node.refreshTokenIntervalID);			//long-lived token refresh (15min)
			// delete node.refreshTokenIntervalID;
		});
	}

	function readImage(node, url) {
		Jimp.read(url)
			.then(function(image) {
				// Do stuff with the image.
				node.debug("jimp image:");
				node.debug(image.width, ",", image.height);
			})
			.catch(function(err) {
				node.error(err);
			});
	}

	RED.nodes.registerType("pixeliterator", PixelIteratorNode);
};
