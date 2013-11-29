(function (angular) {
    'use strict';
    
    var services = angular.module('xmas.services', []);
    
    services.service('localstorage', function ($log, $cookieStore) {
        var is_local_storage_available;
        
        var test_variable = 'test';
        try {
            localStorage.setItem(test_variable, test_variable);
            localStorage.removeItem(test_variable);
            is_local_storage_available = true;
            $log.info('localstorage is availabile');
        } catch (e) {
            is_local_storage_available = false;
            $log.info('localstorage is unavailabile, falling back to using cookies');
        }
        
        var service = {
            get: function (key) {
                var encoded_value = localStorage.getItem(key);
                try {
                    return angular.fromJson(encoded_value);
                } catch (e) {
                    $log.warn(
                        'Got error decoding value for "' +
                        key + '" from localstorage. Error was: ' + e.toString()
                    );
                    return null;
                }
            },
            put: function (key, value) {
                var encoded_value = angular.toJson(value);
                localStorage.setItem(key, encoded_value);
            },
            remove: function (key) {
                localStorage.removeItem(key);
            },
            clear: function () {
                localStorage.clear();
            }
        };
        
        if (!is_local_storage_available) {
            // Browser doesn't support localstorage, so use cookies instead :(
            service = $cookieStore;
        }
        
        return service;
    });
    
    services.provider('nsls', function () {
        var namespace = 'app';
        
        this.set_namespace = function (new_namespace) {
            namespace = new_namespace;
        };
        
        this.$get = function (localstorage) {
            return {
                get: function (key) {
                    var namespaced_key = make_namespace_key(key);
                    return localstorage.get(namespaced_key);
                },
                put: function (key, value) {
                    var namespaced_key = make_namespace_key(key);
                    return localstorage.put(namespaced_key, value);
                },
                remove: function (key) {
                    var namespaced_key = make_namespace_key(key);
                    return localstorage.remove(namespaced_key);
                }
            }
        };
        
        var make_namespace_key = function (key) {
            return namespace + '.' + key;
        };
    });
    
    services.service('ScoreKeeper', function ($rootScope, nsls) {
        
        var score = nsls.get('score') || 0;

        var broadcast_score_update = function () {
            $rootScope.$broadcast('score:updated', score);
        };
        
        broadcast_score_update();
        
        return {
            increment_score: function (score_increment) {
                score += score_increment;
                nsls.put('score', score);
                broadcast_score_update();
            },
            get_score: function () {
                return score;
            },
            reset_score: function () {
                score = 0;
                nsls.put('score', score);
                broadcast_score_update();
            }
        }
    });
    
})(window.angular);
