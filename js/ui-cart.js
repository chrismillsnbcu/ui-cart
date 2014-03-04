/* UI Cart */
$(function ($) {

    var user = "guest";

    // Updates to cart local storage
    var cartObj = {
        getCart: function() {
          var cart = sessionStorage.getItem("cart");
          if(cart) {
            return $.parseJSON(cart);
          } else {
            return null;
          }
        },
        setCart: function(cart) {
            sessionStorage.setItem("cart", JSON.stringify(cart));
        },
        buildCartTables: function() {
            var cart = this.getCart();
            $('.cart-items-list').html('');
            console.log(cart);
            if(cart && cart.items.length > 0) {
                // sync html with cart obj
                for(var i=0; i<cart.items.length; i++) {
                    $('.cart-items-list').append('<tr>');
                    var cartHTML = '';
                    cartHTML += '<tr>';
                    cartHTML += '<td class="cart-item">';
                    cartHTML += cart.items[i].name;
                    cartHTML += '</td>';
                    cartHTML += '<td><span class="cart-qty right">Qty: ' + cart.items[i].qty + '</span></td>';
                    cartHTML += '<td><span class="cart-item-remove right" data-number="' + cart.items[i].number + '">&nbsp; <sup>&times;</sup></span></td>';
                    cartHTML += '</tr>';
                    $('.cart-items-list').append(cartHTML);
                }
                rebindCartRemove(); // temp hack
            } else {
                // display cart empty messages
                $('.cart-items-list').html('<p>Cart is empty.</p>');
            }
        },
        syncCart: function(cartItems) { // sync's local storage and page with current cart obj
            var cart = {
                user: user,
                items: cartItems
            }
            // update local storage
            this.setCart(cart);
            // update html
            this.buildCartTables();
        },
        addCart: function(cartItems) {
            var getCart = this.getCart();
            var newItem = cartItems;
            var updatedCartItems = new Array();
            if(getCart && getCart.items != null) { // cart exists with items, append item
                var notInCart = true;
                updatedCartItems = getCart.items;
                for(var i=0; i<updatedCartItems.length; i++) {
                    if(updatedCartItems[i].number === newItem.number) { // item exists, update quantity
                        updatedCartItems[i].qty += newItem.qty;
                        notInCart = false;
                    }
                }
                if(notInCart) { // item doesn't exist, add it to the cart obj
                    updatedCartItems.push(newItem);
                }
            } else { // new cart obj
                updatedCartItems.push(newItem);
            }
            // ajax call to sync db
            // success
            this.syncCart(updatedCartItems);
        },
        removeCart: function(cartItemNumber) {
            var getCart = this.getCart();
            var updatedCartItems = new Array();
            for(var i=0; i<getCart.items.length; i++) {
                if(getCart.items[i].number !== cartItemNumber) {
                    updatedCartItems.push(getCart.items[i]);
                }
            }
            // ajax call to sync database
            // success
            this.syncCart(updatedCartItems);
        },
        updateCartUser: function(d) { // add/remove user id after login/logout
            if(loggedIn) {
            } else {
            }
        },
        submit: function() { // clear cart on submit
            // ajax call to submit cart
            this.syncCart(null);
        }
    };

    /* Cart Actions */
    // Add to cart
    $('.add').on('click', function() {
        var cartItem = {
            name: $(this).data('name'),
            number: $(this).data('number'),
            qty: parseInt($(this).parent().find('select').val())
        }
        cartObj.addCart(cartItem);
    });

    // Remove from cart
    function rebindCartRemove() {
        $('.cart-item-remove').on('click', function(e) {
            e.preventDefault();
            var cartItemNumber = $(this).data('number');
            cartObj.removeCart(cartItemNumber);
        });
    }

    // Submit cart
    $('.submitCart').on('click', function() {
        console.log('submit cart called');
        cartObj.submitCart();
    });
    /* */

    /* Login */

    // Clientside login
    var login = {
        toggleLogin: function(loggedIn, user) {
          if(loggedIn) {
            $('#login').hide();
            $('#loginUser').show();
            $('#loginUser span').html(user);
          } else {
            $('#loginUser').hide();
            $('#login').show();
            $('#loginUser span').html('');
          }
          this.syncCart(user);
        },
        syncCart: function(user) { // add cart to user
            var updatedUser = user;
            var cart = cartObj.getCart();
            console.log(cart);
            if(cart) {
                // ajax call to add cart to user
                if(user) {
                    cart.user = updatedUser;
                } else {
                    cart.user = "guest";
                }
            }
            console.log('test cart');
            console.log(cartObj.getCart());
            console.log('/test cart');
            cartObj.setCart(cart);
        },
        getUser: function() {
            var user = sessionStorage.getItem("user");
            if(user) {
                return $.parseJSON(user);
            } else {
                return null;
            }

        },
        setUser: function(name) {
            sessionStorage.setItem("user", JSON.stringify(name));
        },
        submitLogin: function() { // login
            console.log($('#username').val());
            console.log($('#password').val());
            var userName = $('#username').val();
            // ajax call to login
            // success, store user name/token/etc in localstorage session
            this.setUser(userName);
            this.toggleLogin(true, userName);
        },
        submitLogout: function() { // logout
            sessionStorage.removeItem("user");
            this.toggleLogin(false);
        },
        checkLogin: function() { // page load, check if user logged in
            var user = this.getUser();
            if(user) { // logged in
                console.log('user logged in');
                this.toggleLogin(true, user);
            } else { // guest
                console.log('user not logged in');
                this.toggleLogin(false);
            }
            cartObj.buildCartTables();  // change to check login once that is integrated
        }
    }

    // Submit login
    $('#submitLogin').on('click', function() {
        console.log('login called');
        login.submitLogin();
    });

    // Submit logout
    $('#userLogout').on('click', function() {
        console.log('logout called');
        login.submitLogout();
    });

    login.checkLogin();

    $('#test').on('click', function() {
       console.log(cartObj.getCart());
       console.log(login.getUser());
    });

});