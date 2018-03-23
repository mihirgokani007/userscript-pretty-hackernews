// ==UserScript==
// @name       Hacker news Modifications
// @namespace  http://mihirgokani.in/
// @version    0.9
// @description Modify hackernews to hilight interesting links
// @match      https://news.ycombinator.com/*
// @copyright  2014+, Mihir Gokani
// @require    https://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js
// ==/UserScript==

var OVERRIDE_CLASS = 'override',
    DEFAULT = 'DEFAULT',
    INTERESTING = /(js|javascript|python|web|node|secur|hack|vulnerabl|ssl|pattern)/i,
    INTERESTING_CLASS = "interesting",
    POPULARITY_CLASS_MAPPING = {
        100: "not-popular",
        200: "popular",
        300: "very-popular",
        DEFAULT: "extremely-popular"
    };

// Override these styles with external or injected stylesheets e.g. using Stylus.
// Use override class to make rules more specific e.g. .override.interesting { font-color: red; }
var RULESETS = [
        {selector: '.interesting', rules: {'font-weight': 'bold'}},
        {selector: '.not-popular', rules: {background: 'rgba(0,0,0,0)'}},
        {selector: '.popular', rules: {background: 'rgba(150,250,150,0.5)'}},
        {selector: '.very-popular', rules: {background: 'rgba(150,200,250,0.8)'}},
        {selector: '.extremely-popular', rules: {background: 'rgba(250,150,150,0.8)'}},
    ];

function addStylesheet() {
	// Create the <style> tag
	var style = document.createElement("style");

	// Add a media (and/or media query) here if you'd like!
	style.setAttribute("media", "screen");

	// WebKit hack :(
	style.appendChild(document.createTextNode(""));

	// Add the <style> element to the page
	document.head.appendChild(style);

	return style.sheet;
}

function addStylesheetRulesets(rulesets, sheet) {
    if (!sheet) {
        sheet = addStylesheet();
    }
    rulesets.forEach(function(ruleset, i) {
        var block = Object.keys(ruleset.rules).map(function(k) {
            return k + ':' + ruleset.rules[k];
        }).join(';');
        sheet.insertRule(ruleset.selector + '{' + block + '}', i);
    });
    return sheet;
}

function getClass(mapping, value) {
    var minValue = DEFAULT;
    for (var v in mapping) {
        if (mapping.hasOwnProperty(v) && value < v) {
            minValue = minValue === DEFAULT ? v : Math.min(minValue, v);
        }
    }
    return mapping[minValue];
}

function isInteresting(text) {
    return !!INTERESTING.test(text);
}

function parsePopularity(text) {
    var part = text.split(" "), count = parseInt(part[0], 10);
    return part[1] == 'points' ? count : null;
}

function refreshStyling() {
    $('td.title').each(function() {
        var $title = $(this), $tr;
        if (isInteresting($title.text())) {
            $tr = $title.closest("tr");
            $tr.addClass(OVERRIDE_CLASS).addClass(INTERESTING_CLASS);
            $tr.next().addClass(OVERRIDE_CLASS).addClass(INTERESTING_CLASS);
        }
    });
    $('td.subtext').each(function() {
        var $info = $(this), $tr, cls;
        var popularity = parsePopularity($info.text().trim());
        if (popularity != null) {
            $tr = $info.closest("tr");
            cls = getClass(POPULARITY_CLASS_MAPPING, popularity);
            $tr.addClass(OVERRIDE_CLASS).addClass(cls);
            $tr.prev().addClass(OVERRIDE_CLASS).addClass(cls);
        }
    });
}

$(document).ready(function() {
    setTimeout(refreshStyling, 2000);
    addStylesheetRulesets(RULESETS);
});
