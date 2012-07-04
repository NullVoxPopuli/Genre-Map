// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
// WARNING: THE FIRST BLANK LINE MARKS THE END OF WHAT'S TO BE PROCESSED, ANY BLANK LINE SHOULD
// GO AFTER THE REQUIRES BELOW.
//
//= require jquery
//= require jquery_ujs
//= require_tree .
$(function(){
	$(".genre > .attribute[data-attr='name']").click(function(){
		var parent = $(this).parent();
		if (parent.hasClass("active")){
			parent.find(".details").hide();
			parent.removeClass("active");
			// remove the theater iframe we don't use a ton of ram
			$(".theater").html("");
		} else {
			$(this).parent().find(".details").show();
			$(".genre").removeClass("active");
			$(this).parent().addClass("active");
		}
	});
	$(".track").click(function(){
		var theater = $(this).closest(".genre").find(".theater");
		var theaterFrame = document.createElement("iframe");

		var tF = $(theaterFrame);
		tF.attr({
			"width": 853,
			"height": 480,
			"frameborder": 0,
			"allowfullscreen":"",
			"src": $(this).attr("data-embed-url") + "?autoplay=1"
		});

		theater.html(tF);
		theater.show();


	});
});