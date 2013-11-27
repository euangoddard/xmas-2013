(function (angular) {
    'use strict';
    
    var xmas = angular.module(
        'xmas',
        [
            'xmas.directives',
            'xmas.controllers',
            'xmas.filters',
            'xmas.services',
            'xmas.backend',
            'ngRoute',
            'ngCookies'
        ]
    );
    xmas.config(function ($routeProvider, nslsProvider) {
        nslsProvider.set_namespace('xmas-2013');
        
        $routeProvider.when(
            '/',
            {
                templateUrl: 'partials/welcome.html',
                controller: 'WelcomeController',
                label: 'Welcome'
            }
        );
        $routeProvider.when(
            '/quiz',
            {
                templateUrl: 'partials/quiz.html',
                controller: 'QuizController',
                label: 'Quiz'
            }
        );
        $routeProvider.when(
            '/about',
            {
                templateUrl: 'partials/about.html',
                controller: 'AboutController',
                label: 'About'
            }
        );
        $routeProvider.when(
            '/quiz/:id',
            {
                templateUrl: 'partials/question.html',
                controller: 'QuestionController'
            }
        );
        $routeProvider.when(
            '/add-score',
            {
                templateUrl: 'partials/add_score.html',
                controller: 'AddScoreController'
            }
        );
        $routeProvider.when(
            '/score-board',
            {
                templateUrl: 'partials/score_board.html',
                controller: 'ScoreBoardController'
            }
        );
        
        $routeProvider.otherwise({redirectTo: '/'});
    });
    
})(window.angular);
