/**
 * @description : Carrossel
 * @author pbasto
 * @link www.arakno.net
 * @version 1.0
 */



document.addEventListener('DOMContentLoaded', function() {


	//HELPER FUNCTIONS FOR EASY DOM MANIPULATION
	/** @{function} - helper global $elector alias */
	window.$ = function(selector) {
		var selectorType = 'querySelectorAll';

		if (selector.indexOf('#') === 0) {
			selectorType = 'getElementById';
			selector = selector.substr(1, selector.length);
		}

		return document[selectorType](selector);
	};

	/** @{function} - helper method to iterate over nodeLists or array/objects */
	$.each = function(e, callback) {
		Array.prototype.forEach.call(e, callback);
	}

	/** @{function} - hleper method to attach events */
	Node.prototype.on = window.on = Node.prototype.addEventListener;
	NodeList.prototype.on = NodeList.prototype.addEventListener = function(name, fn) {
		Array.prototype.slice.call(this).forEach(function(elem) {
			elem.addEventListener(name, fn, false);
		});
	}

	/** @{function} - Convenience function for parent to match pattern for next() & previous() functions */
	Node.prototype.parent = function() {
		return this.parentNode;
	}

	/** @{function} - Add next() prototype to get next node, not whitespace */
	Node.prototype.next = function() {
		var next = this.nextSibling;
		while (next && next.nodeType != 1) {
			next = next.nextSibling;
		}
		return next;
	}

	/** @{function} - Add previous() prototype to get previous node, not whitespace */
	Node.prototype.previous = function() {
		var previous = this.previousSibling;
		while (previous && previous.nodeType != 1) {
			previous = previous.previousSibling;
		}
		return previous;
	}

	Node.prototype.insertAfter = function(el, target) {
		var parent = this.parentNode;
		if (parent.lastChild == this) {
			parent.appendChild(el);
		} else {
			parent.insertBefore(el, this.nextSibling);
		}
	}


	var app = {};

	/** @{object} XHR */
	var url = "http://lg-devtest.herokuapp.com/data.json";
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.setRequestHeader("Authorization", "Bearer u12A8f3Zg");
	xhr.onload = function() {
		console.log("OnReadystatechange + " + xhr.readyState + " " + xhr.status);

		if (xhr.status >= 200 && xhr.status < 400) {
			var data = JSON.parse(xhr.responseText);
			console.log(data);

			app.init(data);

		} else {
			console.log("returned an error:" + xhr.responseText);
		}
	};

	xhr.onerror = function(err) {
		alert("There was a connection error:" + err);
	};

	xhr.send();

	var isTweening = false;

	var intervalo = 120;
	var numItems;
	var centroX = document.body.clientWidth / 2;
	var centroY = document.body.clientHeight / 2;
	var objindex;
	var objData = {};
	var objPos = [];
	var objName = [];
	var objOrder = [];

	var centroH;
	/** @description - main container */
	var home = document.createElement("ul");
	home.id = "Carroussel";
	$("#Movies").insertBefore(home, parent.firstChild);


	app.init = function(resp) {

		var recommended = resp.data[0].assets;
		var promoted = resp.data[1].assets;

		var movies = recommended.concat(promoted);
		/** Filter only movies of type "Action" */
		movies = movies.filter(function(item) {
			if (item.genre == 'Action') return true;
		});
		/** sort the results by IMDB rating (descending). */
		movies.sort(function(a, b) {
			return Math.ceil(a.imdb) - Math.ceil(b.imdb);
		});

		numItems = movies.length;

		objindex = Math.floor(numItems / 2);

		/** @{constructor}  - Display the results in a horizontal "carousel", showing the box art image, the title, and the IMDB rating for each item */
		$.each(movies, function(l, i) {
			var movie = document.createElement("li"),
				p = document.createElement("p"),
				img = document.createElement("img");

			movie.id = "item" + i;
			movie.classList.add("movie", "animated", "fadeIn");

			/* initially hide first and last, CSS handles the rest */
			if (i == 0 || i == 4) movie.style.visibility = "hidden";

			p.innerHTML = movies[i].title;

			img.src = movies[i].img;
			img.setAttribute("alt", movies[i].title);
			movie.appendChild(img);
			movie.appendChild(p);
			$("#" + home.id).appendChild(movie);

			var tw = movie.clientWidth;
			var tpos = movie.offsetLeft;

			objData[movie.id] = tpos;
			objPos[i] = tpos;
			objOrder[i] = tpos;

			movie.on("click", function() {
				app.move(movie);
			});

		});

		app.events();

	};



	app.queueRight = function() {
		isTweening = true;
		for (mc in objData) {
			$("#" + mc).style.visibility = "visible";
			$("#" + mc).classList.remove("moveL");
			$("#" + mc).classList.remove("moveR");
			$("#" + mc).classList.add("moveR");
		};

		var first = $("#" + home.id).querySelector("li:first-child");
		var last = $("#" + home.id).querySelector("li:last-child");
		var clone = last.cloneNode(true);
		last.parentNode.removeChild(last);
		$("#" + home.id).insertBefore(clone, first);

		isTweening = false;

	}

	app.queueLeft = function() {
		isTweening = true;
		for (mc in objData) {
			$("#" + mc).style.visibility = "visible";
			$("#" + mc).classList.remove("moveL");
			$("#" + mc).classList.remove("moveR");
			$("#" + mc).classList.add("moveL");
		};

		var first = $("#" + home.id).querySelector("li:first-child");
		var last = $("#" + home.id).querySelector("li:last-child");
		var clone = first.cloneNode(true);
		first.parentNode.removeChild(first);
		last.insertAfter(clone, last);

		isTweening = false;

	}

	app.move = function(obj) {
		if (obj.offsetLeft > centroH - intervalo) {
			app.queueLeft(obj);
		} else {
			app.queueRight(obj);
		}
	}


	/** @Events */
	app.events = function() {

		$("#Left").on("click", function() {
			//console.log("objDATA: " + objData[item2]);
			if (!isTweening) {
				app.queueLeft();
			}

		});


		$("#Right").on("click", function() {
			if (!isTweening) {
				app.queueRight();
			}
		});

		$("#wrapper").on("keydown", function(e) {
			if (e.keyCode == 39) {
				app.queueRight();
			}
			if (e.keyCode == 37) {
				app.queueLeft();
			}
			e.preventDefault;
		});

		var wheelEvt = "onwheel" in document.createElement("div") ? "wheel" : // Modern browsers
			(document.onmousewheel !== undefined) ? "mousewheel" : // Webkit and IE
			"DOMMouseScroll"; // remaining browsers

		$("#wrapper").on(wheelEvt, function(e) {
			if (!isTweening) {
				if (e.deltaY > 0) {
					app.queueLeft();
				} else if (e.deltaY <= 0) {
					app.queueRight();
				}
			}
		});


	};



}, false);