var linkLibMenu = function() {
   libmenu.menu = document.querySelector('.lib-menu');
   if (!libmenu.menu) return;
   libmenu.items = libmenu.menu.querySelectorAll(".lib-menu-item");
   closeAllMenuItems();

   libmenu.items.forEach(function(el) {
      var toggler = el.querySelector('.lib-menu-item-head > .toggler');
      if (toggler) {
         toggler.addEventListener('click', function (e) {
            var p = findAncestor(e.target, 'lib-menu-item');
            if (p.classList.contains('close')) {
               p.classList.remove('close');
               p.classList.add('open');
            } else if (p.classList.contains('open')) {
               p.classList.remove('open');
               p.classList.add('close');
            }
         });
      }
   });

   libmenu.rolup = document.querySelector(".rolup");
   libmenu.rolup.addEventListener('click', closeAllMenuItems);
}

var closeAllMenuItems = function() {
    libmenu.items.forEach( function(el) {
       if (el.classList.contains('open')) {
          el.classList.remove('open');
          el.classList.add('close');
       }
    });
 }

var createLibMenu = function() {
    
}