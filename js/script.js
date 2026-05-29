(function() {
    'use strict';
    
    angular.module('RestaurantApp', [])
        .controller('RestaurantController', RestaurantController)
        .service('RestaurantService', RestaurantService)
        .constant('ApiBasePath', 'https://coursera-jhu-default-rtdb.firebaseio.com');
    
    RestaurantController.$inject = ['RestaurantService', '$rootScope', '$http', '$scope'];
    function RestaurantController(RestaurantService, $rootScope, $http, $scope) {
        var $ctrl = this;
        
        $rootScope.baseUrl = 'https://davids-restaurant.herokuapp.com';
        
        $ctrl.currentView = 'home';
        
        $ctrl.loadMenuItems = function(categoryShortName) {
            $ctrl.currentView = 'menu';
            
            $http.get($rootScope.baseUrl + '/menu_items.json?category=' + categoryShortName)
                .then(function(response) {
                    var menuItems = response.data.menu_items;
                    var category = response.data.category;
                    
                    var html = '<div class="row">';
                    html += '<div class="col-xs-12">';
                    html += '<h2>' + category.name + ' Menu Items</h2>';
                    html += '<p class="lead">' + (category.special_instructions || '') + '</p>';
                    html += '</div>';
                    html += '</div>';
                    
                    html += '<div class="row">';
                    for (var i = 0; i < menuItems.length; i++) {
                        var item = menuItems[i];
                        html += '<div class="col-md-6 col-sm-12">';
                        html += '<div class="menu-item-tile">';
                        html += '<div class="row">';
                        html += '<div class="col-xs-5">';
                        html += '<div class="menu-item-photo">';
                        html += '<div>' + item.id + '</div>';
                        html += '<img class="img-responsive" width="250" height="150" src="' + $rootScope.baseUrl + '/images/' + categoryShortName + '/' + item.short_name + '.jpg" alt="Item">';
                        html += '</div>';
                        html += '<div class="menu-item-price">' + (item.price_small || '') + '<span> ' + (item.small_portion_name || '') + '</span> ' + (item.price_large || '') + '<span> ' + (item.large_portion_name || '') + '</span></div>';
                        html += '</div>';
                        html += '<div class="col-xs-7">';
                        html += '<div class="menu-item-description">';
                        html += '<h3 class="menu-item-title">' + item.name + '</h3>';
                        html += '<p class="menu-item-details">' + (item.description || '') + '</p>';
                        html += '</div>';
                        html += '</div>';
                        html += '</div>';
                        html += '<hr class="visible-xs">';
                        html += '</div>';
                        html += '</div>';
                    }
                    html += '</div>';
                    
                    document.getElementById('main-content').innerHTML = html;
                })
                .catch(function(error) {
                    console.error('Error:', error);
                    document.getElementById('main-content').innerHTML = '<div class="alert alert-danger">Error loading menu items. Please try again later.</div>';
                });
        };
        
        $ctrl.loadHome = function() {
            $ctrl.currentView = 'home';
            
            $http.get($rootScope.baseUrl + '/categories.json')
                .then(function(categoryResponse) {
                    var allCategories = categoryResponse.data;
                    if (!allCategories || allCategories.length === 0) {
                        throw new Error('No categories found');
                    }
                    var randomIndex = Math.floor(Math.random() * allCategories.length);
                    var randomCategory = allCategories[randomIndex];
                    var randomCategoryShortName = randomCategory.short_name;
                    
                    $http.get('home-snippet.html')
                        .then(function(homeResponse) {
                            var homeHtml = homeResponse.data;
                            homeHtml = homeHtml.replace('{{randomCategoryShortName}}', randomCategoryShortName);
                            
                            var homeElement = document.getElementById("home-snippet");
                            homeElement.innerHTML = homeHtml;
                            
                            document.getElementById("main-content").innerHTML = '';
                            
                            $scope.$applyAsync();
                        })
                        .catch(function(error) {
                            console.error('Error loading home-snippet:', error);
                            document.getElementById("home-snippet").innerHTML = '<div class="alert alert-danger">Error loading home page content. Please ensure you are running this from a web server.</div>';
                        });
                })
                .catch(function(error) {
                    console.error('Error loading categories:', error);
                    var errorMsg = '<div class="alert alert-danger">';
                    errorMsg += '<strong>Error loading categories!</strong><br>';
                    errorMsg += 'Please make sure you are:<br>';
                    errorMsg += '1. Running this from a web server (not file:// protocol)<br>';
                    errorMsg += '2. Using a local server like "python -m http.server" or "http-server"<br>';
                    errorMsg += '3. Or deployed to GitHub Pages<br>';
                    errorMsg += '<hr>Technical details: ' + (error.statusText || error.message) + '</div>';
                    document.getElementById("home-snippet").innerHTML = errorMsg;
                });
        };
        
        $ctrl.loadHome();
    }
    
    RestaurantService.$inject = ['$http', 'ApiBasePath'];
    function RestaurantService($http, ApiBasePath) {
        var service = this;
        
        service.getCategories = function() {
            return $http.get('https://davids-restaurant.herokuapp.com/categories.json').then(function(response) {
                return response.data;
            });
        };
        
        service.getMenuItemsForCategory = function(categoryShortName) {
            return $http.get('https://davids-restaurant.herokuapp.com/menu_items.json?category=' + categoryShortName).then(function(response) {
                return response.data;
            });
        };
    }
    
})();