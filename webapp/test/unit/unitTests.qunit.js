/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"syncea/qr_batch/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
