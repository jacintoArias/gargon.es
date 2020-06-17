// Application object available globally
global.app = {};
var app = global.app;

// Including npm modules

var $ = require('jquery');
global.jQuery = global.$ = $;
global.Popper = require('popper.js');
global.bootstrap = require('bootstrap');
// global.AOS = require('aos');

require('cookieconsent');

// AOS.init({
//   duration: 600,
//   disable: window.innerWidth < 800,
// });

$('.scroll').on('click',function(e) {
	e.preventDefault();
    var offset = $("nav").outerHeight();
    var target = $(this).attr('href');
	$('html,body').animate({
		'scrollTop': $(target).offset().top - offset
	}, 100, 'linear', function() {
		// window.location.hash = target;
	});
});