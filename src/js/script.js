// Require dependencies for this module

var isCollection = function (el) {
	if (el === undefined) return false;

	var protoName = el.toString();

	return (
		protoName.indexOf("HTMLCollection") != -1 ||
		protoName.indexOf("NodeList") != -1 ||
		Array.isArray(el)
	);
},
callEach = function (el, callback) {
	if (isCollection(el)) {
		functions.forEach(el, callback);
	} else {
		callback(el);
	}
},
XHRPromise = function (url, requestMethod, data, contentType) {
	// Create new promise with the Promise() constructor;
	// This has as its argument a function
	// with two parameters, resolve and reject
	return new Promise(function (resolve, reject) {
		// Standard XHR to load a resource
		const request = new XMLHttpRequest();
		url = encodeURI(url);
		request.open(requestMethod, url);

		if (contentType !== undefined) {
			request.setRequestHeader("Content-Type", contentType);
		}

		const error = { isResponseData: false };

		// When the request loads, check whether it was successful
		request.onload = function () {
			var status = request.status;
			if (status === 200) {
				// If successful, resolve the promise by passing back the request response
				resolve(request.response);
			} else if (status === 500) {
				error.message = "There was an server error";
			} else {
				error.message = request.statusText;
				error.isResponseData = true;
			}
			reject(error);
		};
		request.onerror = function () {
			// Also deal with the case when the entire request fails to begin with
			// This is probably a network error, so reject the promise with an appropriate message

			error.message = "There was a network error.";

			reject(error);
		};

		if (data === undefined) {
			data = {};
		}

		// Send the request
		request.send(data);
	});
};

var functions = {
	
	addClass: function (el, classNames) {
			callEach(el, function (e) {
					functions.forEach(classNames.split(" "), function (className) {
							e.classList.add(className);
					});
			});
	},

	addEventListener: function (el, eventNames, callback, parent) {
		if (parent) {
			callEach(parent, function (e) {
				eventNames.split(" ").forEach(function (eventName) {
					e.addEventListener(eventName, callback);
				});
			});
		} else {
			callEach(el, function (e) {
				eventNames.split(" ").forEach(function (eventName) {
					e.addEventListener(eventName, callback);
				});
			});
		}
	},

	debounce: function (func, wait, immediate) {
		var timeout;
		return function (e) {
				var context = this,
						args = arguments;
	
				var later = function () {
						timeout = null;
						if (!immediate) func.apply(context, args);
				};
	
				var callNow = immediate && !timeout;
	
				clearTimeout(timeout);
	
				timeout = setTimeout(later, wait);
	
				if (callNow) {
						func.apply(context, args);
				}
		};
	},

	forEach: function (elements, callback) {
		Array.prototype.forEach.call(elements, callback);
	},

	hasClass: function (el, className) {
		if (isCollection(el)) {
			el = el[0];
		}

		return el.classList.contains(className);
	},

	removeClass: function (el, className) {
			callEach(el, function (e) {
					e.classList.remove(className);
			});
	},

	setStyle: function (el, property, styleValue) {
		callEach(el, function (e) {
			e.style[property] = styleValue;
		});
	},

	select: function (selector, parent) {
		if (isCollection(parent)) {
			parent = parent[0];
		}

		if (!parent) {
			parent = document;
		}

		if (selector.indexOf(" ") === -1 && selector.indexOf(":") === -1) {
			if (selector.lastIndexOf(".") === 0) {
				return parent.getElementsByClassName(selector.substring(1));
			}

			if (selector.lastIndexOf("#") === 0) {
				return parent.getElementById(selector.substring(1));
			}
		}

		return parent.querySelectorAll(selector);
	},

	toggleClass: function (el, className) {
		callEach(el, function (e) {
			e.classList.toggle(className);
		});
	}
}

// Short hand for functions
var f = functions;




var settings = {
	mobileThreshold: 1000
};
var coffee = {}; // State



// Get the data
var getRecipes = XHRPromise('./beverages.json', 'GET');
// TODO: Add flat white!

function deselectBeverages() {
	// Remove selected class from all beverages
	f.removeClass(f.select('.beverages__beverage'), 'selected');
}

function selectBeverage(beverage) {

	deselectBeverages();

	// Add selected class to selected beverage
	f.addClass(f.select('[data-beverage="' + beverage + '"]'), 'selected');
}

function fillCup(recipe) {
	
	callEach(f.select('.recipes'), function (e) {
		var beverage = '';

		for (var key in recipe) {
			const ingredient = recipe[key];
			
			beverage = '<div class="recipe__ingredient recipe__ingredient--' + ingredient.name + '" style="height: ' + ingredient.percentage + '%"><div class="recipe__ingredient-text"><span class="recipe__amount">' + ingredient.parts + '</span> ' + ingredient.title + '</div></div>' + beverage;
		}

		e.innerHTML = '<div class="recipe animate-in">' + beverage + '</div>' + e.innerHTML;
		
		activateBeverage();
	});
}

function activateBeverage() {
	const recipes = f.select('.recipes .recipe');

	// Enable animation
	setTimeout(function() {

		// Start animation
		f.removeClass(recipes[0], 'animate-in');

		// Wait for animation
		setTimeout(function() {
			for (var key in recipes) {

				// Remove all other recipes than [0]
				if (key > 0 ) {
					recipes[key].remove();
				}
			}
		}, 300);
	}, 50);
}

function updateBeverageList(e) {
	const beverages = coffee.recipes.beverages;
	var listOfBeverages = '';
	
	for (var key in beverages) {
		const beverage = beverages[key];
		listOfBeverages += '<li class="beverages__beverage animate-in" data-beverage="' + beverage.name + '">' + beverage.title + '</li>';
	}

	e.innerHTML = listOfBeverages;

	showBeverages();
}

function showBeverages() {
	const beverages = f.select('.beverages__beverage');

	var i = 1;
	// Show one item at a time
	(function myLoop (i) {          
		setTimeout(function () {
			const beverage = beverages[i-1];
			f.removeClass(beverage, 'animate-in');
			if (--i) myLoop(i); //  decrement i and call myLoop again if i > 0
		}, 25)
	})(beverages.length);
}

function isMobile() {
	var isMobile = window.innerWidth < settings.mobileThreshold;
	
	// Update state
	coffee.isMobile = isMobile;
	
	// Update DOM so that styling can change as well
	if (isMobile) {
		f.removeClass(f.select('body'), 'is-desktop');
		f.addClass(f.select('body'), 'is-mobile');
	} else {
		f.removeClass(f.select('body'), 'is-mobile');
		f.addClass(f.select('body'), 'is-desktop');
	}
}
// alert(window.innerWidth);
// alert(window.innerHeight);

// Navigating between pages

function goToRecipe(beverage) {
	f.addClass(f.select('body'), 'is-showing-recipe'); // TODO: Should this be changed?
	selectBeverage(beverage);
	fillCup(coffee.recipes.beverages[beverage].recipe);
}

function goToBeverages() {
	f.removeClass(f.select('body'), 'is-showing-recipe'); // TODO: Should this be changed?
}


function updateHistory (beverage) {
	if (beverage) {
		var stateObj = { beverage: beverage };
		history.pushState(stateObj, beverage, '#' + beverage);
	} else {
		var stateObj = null;
		history.pushState(stateObj, null, '/');
	}
}

window.onpopstate = function(event) {
	if (event.state) {
		const beverage = event.state.beverage;
		goToRecipe(beverage);
	} else {
		deselectBeverages();
		goToBeverages();
	}
};

// window.onload = function () {
f.addEventListener(window, 'load', function () {

	getRecipes.then(function (recipes) {
		recipes = JSON.parse(recipes);

		// Save recipes to global object
		coffee.recipes = recipes;

		// Populate menu
		callEach(f.select('.beverages'), function (e) {
			updateBeverageList(e);
		});

		// Beverage is chosen from the menu
		f.addEventListener(f.select('.beverages__beverage'), 'click', function (e) {
			
			if (!f.hasClass(e.target, 'beverages__beverage')) {
				// Avoid running if container element ('.beverages') is clicked directly (not clicking on '.beverages__beverage')
				return;
			}
			
			const beverage = e.target.dataset.beverage;
			goToRecipe(beverage);
			updateHistory(beverage);

		}, f.select('.beverages'));

		// Menu button is clicked
		f.addEventListener(f.select('.menu-icon'), 'click', function (e) {
			deselectBeverages();
			updateHistory(null);
			goToBeverages();
		});

		// Check for # in url
		const url = window.location.href;
		const beverage = url.split('#')[1];
		if (beverage) {
			goToRecipe(beverage);
		} else {
			deselectBeverages();
			goToBeverages();
		}
	});

	// Check if mobile
	f.addEventListener(window, 'resize', f.debounce(function() {
		isMobile();
	}, 100));

	isMobile();
});
