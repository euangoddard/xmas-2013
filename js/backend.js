(function (angular) {
    'use strict';

    var MONGOLAB_API_URL = 'https://api.mongolab.com/api/1/databases/xmas2013/';
    
    var MONGOLAB_API_KEY = '50c48d11e4b012b961327393';
    
    var backend = angular.module('xmas.backend', ['ngResource']);
    backend.factory('Score', function ($resource) {
        var Score = $resource(
            MONGOLAB_API_URL + 'collections/scores/:id',
            {apiKey: MONGOLAB_API_KEY},
            {update: { method: 'PUT'}}
        );
        
        Score.prototype.update = function (callback) {
            return Score.update(
                {id: this._id.$oid},
                angular.extend({}, this, {_id: undefined}),
                callback
            );
        };
        
        Score.prototype.destroy = function (callback) {
            return Score.remove({id: this._id.$oid}, callback);
        };
        
        return Score;
    });
    
})(window.angular);
