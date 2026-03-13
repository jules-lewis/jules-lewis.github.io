// Sticky header position on page scrolling up
const header = document.querySelector('.js-header');
const stickyClass = 'sticky';
let lastScrollTop = 0;
let isWaiting = false;

window.addEventListener('scroll', () => {
    if (!isWaiting) {
        window.requestAnimationFrame(() => {
            let currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;

            if (currentScroll > lastScrollTop) {
                header.classList.remove(stickyClass);
            } else if (currentScroll < lastScrollTop && currentScroll > 0) {
                header.classList.add(stickyClass);
            } else if (currentScroll <= 0) {
                header.classList.remove(stickyClass);
            }

            lastScrollTop = currentScroll;
            isWaiting = false;
        });
        isWaiting = true;
    }
}, false);

// Dropdown menu
(function (menuConfig) {
	/**
	 * Merge default config with the theme overrided ones
	 */
	var defaultConfig = {
		 // behaviour
		 mobileMenuMode: 'overlay',
		 animationSpeed: 300,
		 submenuWidth: 300,
		 doubleClickTime: 500,
		 mobileMenuExpandableSubmenus: false,
		 isHoverMenu: true,
		 // selectors
		 wrapperSelector: '.navbar',
		 buttonSelector: '.navbar__toggle',
		 menuSelector: '.navbar__menu',
		 submenuSelector: '.navbar__submenu',
		 mobileMenuSidebarLogoSelector: null,
		 mobileMenuSidebarLogoUrl: null,
		 relatedContainerForOverlayMenuSelector: null,
		 // attributes 
		 ariaButtonAttribute: 'aria-haspopup',
		 // CSS classes
		 separatorItemClass: 'is-separator',
		 parentItemClass: 'has-submenu',
		 submenuLeftPositionClass: 'is-left-submenu',
		 submenuRightPositionClass: 'is-right-submenu',
		 mobileMenuOverlayClass: 'navbar_mobile_overlay',
		 mobileMenuSubmenuWrapperClass: 'navbar__submenu_wrapper',
		 mobileMenuSidebarClass: 'navbar_mobile_sidebar',
		 mobileMenuSidebarOverlayClass: 'navbar_mobile_sidebar__overlay',
		 hiddenElementClass: 'is-hidden',
		 openedMenuClass: 'is-active',
		 noScrollClass: 'no-scroll',
		 relatedContainerForOverlayMenuClass: 'is-visible'
	};

	var config = {};

	Object.keys(defaultConfig).forEach(function(key) {
		 config[key] = defaultConfig[key];
	});

	if (typeof menuConfig === 'object') {
		 Object.keys(menuConfig).forEach(function(key) {
			  config[key] = menuConfig[key];
		 });
	}

	/**
	 * Menu initializer
	 */
	function init () {
		 if (!document.querySelectorAll(config.wrapperSelector).length) {
			  return;
		 }

		 initSubmenuPositions();

		 if (config.mobileMenuMode === 'overlay') {
			  initMobileMenuOverlay();
		 } else if (config.mobileMenuMode === 'sidebar') {
			  initMobileMenuSidebar();
		 }

		 initClosingMenuOnClickLink();

		 if (!config.isHoverMenu) {
			  initAriaAttributes();
		 }
	};

	/**
	 * Function responsible for the submenu positions
	 */
function initSubmenuPositions () {
		 var submenuParents = document.querySelectorAll(config.wrapperSelector + ' .' + config.parentItemClass);

		 for (var i = 0; i < submenuParents.length; i++) {
			  var parentItem = submenuParents[i];
           // Find the trigger element (link or span) for this submenu
			  var trigger = parentItem.querySelector('a, .' + config.separatorItemClass);
			  var submenu = parentItem.querySelector(config.submenuSelector);
			  var eventTrigger = config.isHoverMenu ? 'mouseenter' : 'click';

			  if (!submenu || !trigger) continue;

          // Handle Hover / MouseEnter events
			  parentItem.addEventListener(eventTrigger, function () {
					var submenuInner = this.querySelector(config.submenuSelector);
					var itemPosition = this.getBoundingClientRect().left;
					var widthMultiplier = 2;

					if (this.parentNode === document.querySelector(config.menuSelector)) {
						 widthMultiplier = 1;
					}

					if (config.submenuWidth !== 'auto') {
						 var submenuPotentialPosition = itemPosition + (config.submenuWidth * widthMultiplier);

						 if (window.innerWidth < submenuPotentialPosition) {
							  submenuInner.classList.remove(config.submenuLeftPositionClass);
							  submenuInner.classList.add(config.submenuRightPositionClass);
						 } else {
							  submenuInner.classList.remove(config.submenuRightPositionClass);
							  submenuInner.classList.add(config.submenuLeftPositionClass);
						 }
					}

					submenuInner.setAttribute('aria-hidden', false);
					var currentTrigger = this.querySelector('a, .' + config.separatorItemClass);
					if (currentTrigger) currentTrigger.setAttribute('aria-expanded', true);
			  });

           // Handle MouseLeave events
			  if (config.isHoverMenu) {
					parentItem.addEventListener('mouseleave', function () {
						 var submenuInner = this.querySelector(config.submenuSelector);
						 submenuInner.removeAttribute('style');
						 submenuInner.setAttribute('aria-hidden', true);
						 var currentTrigger = this.querySelector('a, .' + config.separatorItemClass);
						 if (currentTrigger) currentTrigger.setAttribute('aria-expanded', false);
					});
			  }

			  // --- KEYBOARD ACCESSIBILITY (A11Y) ---

          // Open when focus enters the LI (via Tab)
			  parentItem.addEventListener('focusin', function () {
					var submenuInner = this.querySelector(config.submenuSelector);
					submenuInner.setAttribute('aria-hidden', false);
					var currentTrigger = this.querySelector('a, .' + config.separatorItemClass);
					if (currentTrigger) currentTrigger.setAttribute('aria-expanded', true);
			  });

			  // Close when focus moves outside the LI element
			  parentItem.addEventListener('focusout', function (e) {
					if (!this.contains(e.relatedTarget)) {
						 var submenuInner = this.querySelector(config.submenuSelector);
						 submenuInner.setAttribute('aria-hidden', true);
						 var currentTrigger = this.querySelector('a, .' + config.separatorItemClass);
						 if (currentTrigger) currentTrigger.setAttribute('aria-expanded', false);
					}
			  });

           // Enter and Space key support for separators (span role="button")
			  if (trigger.tagName === 'SPAN') {
					trigger.addEventListener('keydown', function (e) {
						 if (e.key === 'Enter' || e.key === ' ') {
							  e.preventDefault();
							  var submenuInner = this.parentNode.querySelector(config.submenuSelector);
							  var isExpanded = this.getAttribute('aria-expanded') === 'true';
							  
							  submenuInner.setAttribute('aria-hidden', isExpanded);
							  this.setAttribute('aria-expanded', !isExpanded);
						 }
					});
			  }
		 }
	}

	/**
	 * Function used to init mobile menu - overlay mode
	 */
	function initMobileMenuOverlay () {
		 var menuWrapper = document.createElement('div');
		 menuWrapper.classList.add(config.mobileMenuOverlayClass);
		 menuWrapper.classList.add(config.hiddenElementClass);
		 var menuContentHTML = document.querySelector(config.menuSelector).outerHTML;
		 menuWrapper.innerHTML = menuContentHTML;
		 document.body.appendChild(menuWrapper);

		 // Init toggle submenus
		 if (config.mobileMenuExpandableSubmenus) {
			  wrapSubmenusIntoContainer(menuWrapper);
			  initToggleSubmenu(menuWrapper);
		 } else {
			  setAriaForSubmenus(menuWrapper);
		 }

		 // Init button events
		 var button = document.querySelector(config.buttonSelector);

		 button.addEventListener('click', function () {
			  var relatedContainer = document.querySelector(config.relatedContainerForOverlayMenuSelector);
			  menuWrapper.classList.toggle(config.hiddenElementClass);
			  button.classList.toggle(config.openedMenuClass);
			  button.setAttribute(config.ariaButtonAttribute, button.classList.contains(config.openedMenuClass));

			  if (button.classList.contains(config.openedMenuClass)) {
					document.documentElement.classList.add(config.noScrollClass);

					if (relatedContainer) {
						 relatedContainer.classList.add(config.relatedContainerForOverlayMenuClass);
					}
			  } else {
					document.documentElement.classList.remove(config.noScrollClass);

					if (relatedContainer) {
						 relatedContainer.classList.remove(config.relatedContainerForOverlayMenuClass);
					}
			  }
		 });   
	}

	/**
	 * Function used to init mobile menu - sidebar mode
	 */
	function initMobileMenuSidebar () {
		 // Create menu structure
		 var menuWrapper = document.createElement('div');
		 menuWrapper.classList.add(config.mobileMenuSidebarClass);
		 menuWrapper.classList.add(config.hiddenElementClass);
		 var menuContentHTML = '';

		 if (config.mobileMenuSidebarLogoSelector !== null) {
			  menuContentHTML = document.querySelector(config.mobileMenuSidebarLogoSelector).outerHTML;
		 } else if (config.mobileMenuSidebarLogoUrl !== null) {
			  menuContentHTML = '<img src="' + config.mobileMenuSidebarLogoUrl + '" alt="" />';
		 }

		 menuContentHTML += document.querySelector(config.menuSelector).outerHTML;
		 menuWrapper.innerHTML = menuContentHTML;

		 var menuOverlay = document.createElement('div');
		 menuOverlay.classList.add(config.mobileMenuSidebarOverlayClass);
		 menuOverlay.classList.add(config.hiddenElementClass);

		 document.body.appendChild(menuOverlay);
		 document.body.appendChild(menuWrapper);

		 // Init toggle submenus
		 if (config.mobileMenuExpandableSubmenus) {
			  wrapSubmenusIntoContainer(menuWrapper);
			  initToggleSubmenu(menuWrapper);
		 } else {
			  setAriaForSubmenus(menuWrapper);
		 }

		 // Menu events
		 menuWrapper.addEventListener('click', function (e) {
			  e.stopPropagation();
		 });

		 menuOverlay.addEventListener('click', function () {
			  menuWrapper.classList.add(config.hiddenElementClass);
			  menuOverlay.classList.add(config.hiddenElementClass);
			  button.classList.remove(config.openedMenuClass);
			  button.setAttribute(config.ariaButtonAttribute, false);
			  document.documentElement.classList.remove(config.noScrollClass);
		 });

		 // Init button events
		 var button = document.querySelector(config.buttonSelector);

		 button.addEventListener('click', function () {
			  menuWrapper.classList.toggle(config.hiddenElementClass);
			  menuOverlay.classList.toggle(config.hiddenElementClass);
			  button.classList.toggle(config.openedMenuClass);
			  button.setAttribute(config.ariaButtonAttribute, button.classList.contains(config.openedMenuClass));
			  document.documentElement.classList.toggle(config.noScrollClass);
		 });
	}

	/**
	 * Set aria-hidden="false" for submenus
	 */
	function setAriaForSubmenus (menuWrapper) {
		 var submenus = menuWrapper.querySelectorAll(config.submenuSelector);

		 for (var i = 0; i < submenus.length; i++) {
			  submenus[i].setAttribute('aria-hidden', false);
             // Update trigger when submenus are shown by default
              var trigger = submenus[i].closest('.' + config.parentItemClass).firstElementChild;
              if (trigger) {
                  trigger.setAttribute('aria-expanded', true);
              }
		 }
	}

	/**
	 * Wrap all submenus into div wrappers
	 */
	function wrapSubmenusIntoContainer (menuWrapper) {
		 var submenus = menuWrapper.querySelectorAll(config.submenuSelector);

		 for (var i = 0; i < submenus.length; i++) {
			  var submenuWrapper = document.createElement('div');
			  submenuWrapper.classList.add(config.mobileMenuSubmenuWrapperClass);
			  submenus[i].parentNode.insertBefore(submenuWrapper, submenus[i]);
			  submenuWrapper.appendChild(submenus[i]);
		 }
	}

	/**
	 * Initialize submenu toggle events
	 */
function initToggleSubmenu (menuWrapper) {
		 var parents = menuWrapper.querySelectorAll('.' + config.parentItemClass);

		 for (var i = 0; i < parents.length; i++) {
			  parents[i].addEventListener('click', function (e) {
					e.stopPropagation();
					var submenu = this.querySelector('.' + config.mobileMenuSubmenuWrapperClass);
					var content = submenu.firstElementChild;
                    var trigger = this.firstElementChild; // LINK or SPAN

					if (submenu.classList.contains(config.openedMenuClass)) {
						 var height = content.clientHeight;   
						 submenu.style.height = height + 'px';
						 
						 setTimeout(function () {
							  submenu.style.height = '0px';
						 }, 0);

						 setTimeout(function () {
							  submenu.removeAttribute('style');
							  submenu.classList.remove(config.openedMenuClass);
						 }, config.animationSpeed);

						 content.setAttribute('aria-hidden', true);
                         if (trigger) {
                             trigger.setAttribute('aria-expanded', false);
                         }
					} else {
						 var height = content.clientHeight;   
						 submenu.classList.add(config.openedMenuClass);
						 submenu.style.height = '0px';
						 
						 setTimeout(function () {
							  submenu.style.height = height + 'px';
						 }, 0);

						 setTimeout(function () {
							  submenu.removeAttribute('style');
						 }, config.animationSpeed);

						 content.setAttribute('aria-hidden', false);
                         if (trigger) {
                             trigger.setAttribute('aria-expanded', true);
                         }
					}
			  });

			  // Block Links
			  var childNodes = parents[i].children;
			  for (var j = 0; j < childNodes.length; j++) {
					if (childNodes[j].tagName === 'A') {
						 childNodes[j].addEventListener('click', function (e) {
							  var lastClick = parseInt(this.getAttribute('data-last-click'), 10);
							  var currentTime = +new Date();
							  if (isNaN(lastClick)) {
									e.preventDefault();
									this.setAttribute('data-last-click', currentTime);
							  } else if (lastClick + config.doubleClickTime <= currentTime) {
									e.preventDefault();
									this.setAttribute('data-last-click', currentTime);
							  } else if (lastClick + config.doubleClickTime > currentTime) {
									e.stopPropagation();
									closeMenu(this, true);
							  }
						 });
					}
			  }
		 }
	}

	/**
	 * Set aria-* attributes according to the current activity state
	 */
	function initAriaAttributes () {
		 var allAriaElements = document.querySelectorAll(config.wrapperSelector + ' ' + '*[aria-hidden]');

		 for (var i = 0; i < allAriaElements.length; i++) {
			  var ariaElement = allAriaElements[i];

			  if (
					ariaElement.parentNode.classList.contains('active') ||
					ariaElement.parentNode.classList.contains('active-parent')
			  ) {
					ariaElement.setAttribute('aria-hidden', 'false');
					ariaElement.parentNode.firstElementChild.setAttribute('aria-expanded', true);
			  } else {
					ariaElement.setAttribute('aria-hidden', 'true');
					ariaElement.parentNode.firstElementChild.setAttribute('aria-expanded', false);
			  }
		 }
	}

	/**
	 * Close menu on click link
	 */
	function initClosingMenuOnClickLink () {
		 var links = document.querySelectorAll(config.menuSelector + ' a');

		 for (var i = 0; i < links.length; i++) {
			  if (links[i].parentNode.classList.contains(config.parentItemClass)) {
					continue;
			  }

			  links[i].addEventListener('click', function (e) {
					closeMenu(this, false);
			  });
		 }
	}

	/**
	 * Close menu
	 */
	function closeMenu (clickedLink, forceClose) {
		 if (forceClose === false) {
			  if (clickedLink.parentNode.classList.contains(config.parentItemClass)) {
					return;
			  }
		 }

		 var relatedContainer = document.querySelector(config.relatedContainerForOverlayMenuSelector);
		 var button = document.querySelector(config.buttonSelector);
		 var menuWrapper = document.querySelector('.' + config.mobileMenuOverlayClass);

		 if (!menuWrapper) {
			  menuWrapper = document.querySelector('.' + config.mobileMenuSidebarClass);
		 }

		 menuWrapper.classList.add(config.hiddenElementClass);
		 button.classList.remove(config.openedMenuClass);
		 button.setAttribute(config.ariaButtonAttribute, false);
		 document.documentElement.classList.remove(config.noScrollClass);

		 if (relatedContainer) {
			  relatedContainer.classList.remove(config.relatedContainerForOverlayMenuClass);
		 }

		 var menuOverlay = document.querySelector('.' + config.mobileMenuSidebarOverlayClass);

		 if (menuOverlay) {
			  menuOverlay.classList.add(config.hiddenElementClass);
		 }
	}

	/**
	 * Run menu scripts 
	 */
	init();
})(window.publiiThemeMenuConfig);

// Load search input area
const searchButton = document.querySelector('.js-search-btn');
const searchOverlay = document.querySelector('.js-search-overlay');

if (searchButton && searchOverlay) {
    searchButton.addEventListener('click', (event) => {
        event.stopPropagation();
        searchOverlay.classList.toggle('expanded');

        if (searchOverlay.classList.contains('expanded')) {
            setTimeout(() => {
                const element = searchOverlay.querySelector('input, button');
                if (element) {
                    element.focus();
                }
            }, 60);
        }
    });

    searchOverlay.addEventListener('click', (event) => {
        event.stopPropagation();
    });

    document.body.addEventListener('click', () => {
        searchOverlay.classList.remove('expanded');
    });
}


// Share buttons pop-up
(function () {
    // share popup
    const shareButton = document.querySelector('.js-content__share-button');
    const sharePopup = document.querySelector('.js-content__share-popup');

    if (shareButton && sharePopup) {
        sharePopup.addEventListener('click', function (e) {
            e.stopPropagation();
        });

        shareButton.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            sharePopup.classList.toggle('is-visible');
        });

        document.body.addEventListener('click', function () {
            sharePopup.classList.remove('is-visible');
        });
    }

    // link selector and pop-up window size
    const Config = {
        Link: ".js-share",
        Width: 500,
        Height: 500
    };

    // add handler to links
    const shareLinks = document.querySelectorAll(Config.Link);
    shareLinks.forEach(link => {
        link.addEventListener('click', PopupHandler);
    });

    // create popup
    function PopupHandler(e) {
        e.preventDefault();

        const target = e.target.closest(Config.Link);
        if (!target) return;

        // hide share popup
        if (sharePopup) {
            sharePopup.classList.remove('is-visible');
        }

        // popup position
        const px = Math.floor((window.innerWidth - Config.Width) / 2);
        const py = Math.floor((window.innerHeight - Config.Height) / 2);

        // open popup
        const linkHref = target.href;
        const popup = window.open(linkHref, "social", `
            width=${Config.Width},
            height=${Config.Height},
            left=${px},
            top=${py},
            location=0,
            menubar=0,
            toolbar=0,
            status=0,
            scrollbars=1,
            resizable=1
        `);

        if (popup) {
            popup.focus();
        }
    }
})();

// Back to top
document.addEventListener('DOMContentLoaded', () => {
    const backToTopButton = document.getElementById('backToTop');

    if (backToTopButton) {
        const backToTopScrollFunction = () => {
            if (document.body.scrollTop > 400 || document.documentElement.scrollTop > 400) {
                backToTopButton.classList.add('is-visible');
            } else {
                backToTopButton.classList.remove('is-visible');
            }
        };

        const backToTopFunction = () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        };

        window.addEventListener('scroll', backToTopScrollFunction);
        backToTopButton.addEventListener('click', backToTopFunction);
    }
});


// Responsive embeds script
(function () {
    let wrappers = document.querySelectorAll('.post__video, .post__iframe');

    for (let i = 0; i < wrappers.length; i++) {
        let embed = wrappers[i].querySelector('iframe, embed, video, object');

        if (!embed) {
            continue;
        }

        if (embed.getAttribute('data-responsive') === 'false') {
            continue;
        }

        let w = embed.getAttribute('width');
        let h = embed.getAttribute('height');
        let ratio = false;

        if (!w || !h) {
            continue;
        }

        if (w.indexOf('%') > -1 && h.indexOf('%') > -1) { // percentage mode
            w = parseFloat(w.replace('%', ''));
            h = parseFloat(h.replace('%', ''));
            ratio = h / w;
        } else if (w.indexOf('%') === -1 && h.indexOf('%') === -1) { // pixels mode
            w = parseInt(w, 10);
            h = parseInt(h, 10);
            ratio = h / w;
        }

        if (ratio !== false) {
            let ratioValue = (ratio * 100) + '%';
            wrappers[i].setAttribute('style', '--embed-aspect-ratio:' + ratioValue);
        }
    }
})();