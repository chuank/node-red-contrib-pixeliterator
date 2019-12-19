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
		node.pixelArray = [];

		node.on("input", function(msg, send, done) {
			// process incoming data; allows either string url, or Buffer containing raw image data (KIV)
			// v0.1.0: doing just string URL for now

			readImage(node, msg.payload);

			if(done) {
				done();
			}
		});

		node.on("close", function() {		// tidy up!
			// clearInterval(node.refreshTokenIntervalID);
			// delete node.refreshTokenIntervalID;
		});
	}

	function readImage(node, url) {
		node.debug("jimp image:", url);

		Jimp.read(url)
			.then(function(image) {
				image.resize(18,18,Jimp.RESIZE_BEZIER);

				node.pixelArray = [];
				for(var y=0;y<18;y++) {
					for(var x=0;x<18;x++) {
						node.pixelArray.push(image.getPixelColor(x, y));
					}
				}

				node.msg = {};
				node.msg.payload = node.pixelArray;
				node.send(node.msg);
			})
			.catch(function(err) {
				node.error(err);
			});
	}
	RED.nodes.registerType("pixeliterator", PixelIteratorNode);
};
