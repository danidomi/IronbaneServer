/*
    This file is part of Ironbane MMO.

    Ironbane MMO is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Ironbane MMO is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Ironbane MMO.  If not, see <http://www.gnu.org/licenses/>.
*/

// Window size
var frameWidth = 800;
var frameHeight = 600;
var launched = false;

// Mouse
var mouseX = 0;
var mouseY = 0;
var startOffsetX = -40;
var startOffsetY = -100;
var offsetX = startOffsetX;
var offsetY = startOffsetY;
var mouseDownLeft = false;
var mouseDownRight = false;

var tooltipWidth = 0;
var tooltipHeight = 0;

// Colors
var brown1 = "#33ff99";
var brown2 = "#339966";
var brown3 = "#0e7051"

var refreshActionBarOnPopClose = false;
var barFillMinData = new Array();
var barFillMaxData = new Array();;

var currentHoverDiv = "";
function MakeHoverBox(div,text) {

    (function(div){
    $("#"+div).mouseenter(function(e){

        currentHoverDiv = div;

        var t = $("#tooltip").html();
        $("#tooltip").show();
        $("#tooltip").html(text);
        tooltipWidth = parseInt($("#tooltip").width());
        tooltipHeight = parseInt($("#tooltip").height());
        offsetY = - tooltipHeight - 50;
        offsetX = - tooltipWidth /2;
    });
    $("#"+div).mouseleave(function(e){
        $("#tooltip").hide();
    });
    })(div);
}

$(document).ready(function(){
    frameWidth = $(window).width();
    frameHeight = $(window).height();
});

$(document).mousemove(function(e){

    mouseX = e.pageX;
    mouseY = e.pageY;


    var tposx = mouseX + offsetX;
    var tposy = mouseY + offsetY;
   if ( tposx+tooltipWidth+10 > frameWidth ) tposx -= (tooltipWidth+10+(1*offsetX));
//    if ( tposy+tooltipHeight-40 > frameHeight ) tposy -= (tooltipHeight+(1*offsetY));
    while (tposy+tooltipHeight-20 > frameHeight ) tposy -= 1;
    //while (tposx+tooltipWidth+10 > frameWidth ) tposx -= 1;

    $("#tooltip").css("left", (tposx)+"px");
    $("#tooltip").css("top", (tposy)+"px");

});

function preload(arrayOfImages) {
    $(arrayOfImages).each(function(){
        $('<img/>')[0].src = this;
        // Alternatively you could use:
        // (new Image()).src = this;
    });
}

function AorAn(thing) {
    var l = thing.toLowerCase().substr(0,1);
    return (l == "a" || l == "e" || l == "i" || l == "u" || l == "o") ? "an "+thing : "a "+thing;
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function getRandom(min, max) {
    var randomNum = Math.random() * (max-min);
    return(Math.round(randomNum) + min);
}

function roundNumber(num, dec) {
    var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
    return result;
}

var delimiter_a = "|";
var delimiter_b = "~";
var delimiter_c = "`";
