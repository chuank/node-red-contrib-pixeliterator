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
		node.format = n.format;
		node.outputsize = n.outputsize;
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
				if(Number(node.outputsize)!==0) {
					image.resize(Number(node.outputsize), Number(node.outputsize), Jimp.RESIZE_BEZIER);
				}

				node.pixelArray = { raw: [],
									hsv: [],
									hsva: []
								  };
				for(var y=0;y<node.outputsize;y++) {
					for(var x=0;x<node.outputsize;x++) {
						let pixCol = image.getPixelColor(x, y);		// returns RGBA unsigned int (i.e. 0xFFFFFFFF)
						node.pixelArray.raw.push(pixCol);

						// convert to HSV?
						if(node.format==="hsv" || node.format==="hsva") {
							// these are correct
							let r = pixCol >>> 24;
							let g = (pixCol >>> 16) & 0xff;
							let b = (pixCol >>> 8) & 0xff;
							let a = pixCol & 0xff;

							let hsvConv = rgbToHsv(r,g,b);
							let hsvCol = (hsvConv[0] << 16) + (hsvConv[1] << 8) + hsvConv[2];

							let hsvaCol = (hsvCol << 8) + a;
							node.pixelArray.hsv.push(hsvaCol);
							
							// node.pixelArray.hsva.push(hsvaCol);
							// if(node.format==="hsva") hsvCol = 
						}

						// if(node.format==="rgb" || node.format==="hsv") pixCol = (pixCol >>> 8);

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

	function rgbToHsv(r, g, b) {
		r /= 255; g /= 255; b /= 255;
		let max = Math.max(r, g, b);
		let min = Math.min(r, g, b);
		let d = max - min;
		let h;
		if (d === 0) h = 0;
		else if (max === r) h = (g - b) / d % 6;
		else if (max === g) h = (b - r) / d + 2;
		else if (max === b) h = (r - g) / d + 4;
		h *= 60;
		let l = (min + max) / 2;
		let s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));

		// h is expressed in 0-360°; convert to 0-255
		// s & l are normalised; convert back to 0-255
		h = Math.round((h/360) * 255);
		s = Math.round(s * 255);
		l = Math.round(l * 255);
		return [h, s, l];
	}

	RED.nodes.registerType("pixeliterator", PixelIteratorNode);
};
