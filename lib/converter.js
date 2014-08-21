/*global webpage*/
'use strict';

module.exports = function rasterize(phantomProcess, svgContent, format, scale, cb) {
    phantomProcess
           .then(function (phantom) {
                return phantom.run(svgContent, format, scale,
                    function (svg, format, scale, resolve) {
                        var box,
                            page = webpage.create();

                        page.content = svg;
                        box = page.evaluate(function () {
                            var svg = document.querySelector('svg'),
                                viewBox = (svg.viewBox && svg.viewBox.animVal);

                            if (viewBox && (viewBox.width > 0 || viewBox.height > 0)) {
                                box = {
                                    left: viewBox.x,
                                    top: viewBox.y,
                                    width: viewBox.width,
                                    height: viewBox.height
                                };
                            }
                            else {
                                box = svg.getBoundingClientRect();
                            }

                            return box;
                        });

                        Object.keys(box).forEach(function (key) {
                            box[key] *= scale;
                        });

                        page.clipRect = box;
                        page.zoomFactor = scale;

                        resolve(page.renderBase64(format));
                    });
            })
            .done(function (img) {
                return cb(null, new Buffer(img.toString(), 'base64'));
            }, function (err) {
                return cb(err);
            });
};
