(function (angular) {
    'use strict';
    
    var filters = angular.module('xmas.filters', []);
    
    filters.filter('ordinal', function () {
        return function (number) {
            number = parseInt(number, 10) || 0;
            
            var suffix;
            switch (number % 100) {
                case 11:
                case 12:
                case 13:
                    suffix = 'th';
                    break;
                default:
                    switch (number % 10) {
                        case 1:
                            suffix = 'st';
                            break;
                        case 2:
                            suffix = 'nd';
                            break;
                        case 3:
                            suffix = 'rd';
                            break;
                        default:
                            suffix = 'th';
                    }
            }
            return number + suffix;
        };
    });
    
    filters.filter('join_properties', function () {
        return function (array, property_name) {
            var values = [];
            angular.forEach(array, function (item) {
                values.push(item[property_name]);
            });
            return values.join(', ');
        }
    });
    
})(window.angular);
