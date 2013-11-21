(function () {
    'use strict';
    
    var directives = angular.module('xmas.directives', []);

    directives.directive('navbar', function ($route, $location) {
        var update_scope = function (scope) {
            var current_location = $location.path();
            var active_route_label;
            
            var navigation_routes = [];
            angular.forEach($route.routes, function (route, url) {
                if (route.label) {
                    var is_active = (current_location === url);
                    
                    var navigation_route = {
                        url: url,
                        label: route.label,
                        active: is_active
                    }
                    navigation_routes.push(navigation_route);
                    
                    if (is_active) {
                        active_route_label = route.label;
                    }
                }
            });
            scope.navigation_routes = navigation_routes;
            scope.active_route_label = active_route_label;
        };
        
        var navbar_directive = {
            restrict: 'E',
            templateUrl: 'directives/navbar.html',
            link: function(scope, element, attrs, ctrl) {
                update_scope(scope);
                scope.$on('$routeChangeSuccess', function () {
                    update_scope(scope);
                });
            }
        };
        return navbar_directive;
    });
    
    directives.directive('choiceQuestion', function () {
        var directive = {
            restrict: 'E',
            transclude: true,
            scope: { text: '@'},
            controller: function ($scope) {
                var answers = $scope.answers = [];
                $scope.is_correct = false;
                $scope.is_answer_selected = false;
                $scope.is_question_answered = false;
       
                this.add_answer = function (answer) {
                    if (answer.is_correct) {
                        $scope.correct_answer_label = answer.label;
                    }
                    answers.push(answer);
                };
                this.select_answer = function (selected_answer) {
                    $scope.is_answer_selected = true;
                    angular.forEach(answers, function (answer) {
                        if (answer === selected_answer) {
                            $scope.is_correct = answer.is_correct;
                        } else {
                            answer.deselect_answer();
                        }
                    });
                };
                $scope.submit_answer = function () {
                    $scope.is_question_answered = true;
                    angular.forEach(answers, function (answer) {
                        answer.is_question_answered = true;
                    });
                    $scope.$emit('question:submitted', $scope.is_correct);
                };
                
            },
            replace: true,
            templateUrl: 'directives/choice_question.html',
        };
        return directive;
    });
    
    directives.directive('choiceAnswer', function() {
        return {
          require: '^choiceQuestion',
          restrict: 'E',
          transclude: true,
          scope: {},
          link: function (scope, element, attrs, question_controller) {
              scope.is_correct = ('correct' in attrs);
              scope.label = element.children(':first').text();
              
              question_controller.add_answer(scope);
              scope.select_answer = function () {
                  question_controller.select_answer(scope);
                  scope.is_selected = true;
              };
              scope.deselect_answer = function () {
                  scope.is_selected = false;
              };
              scope.is_selected = false;
          },
          templateUrl: 'directives/choice_answer.html',
          replace: true
        };
    });
    
    directives.directive('orderQuestion', function () {
        var directive = {
            restrict: 'E',
            transclude: true,
            scope: { text: '@'},
            controller: function ($scope) {
                var answers = $scope.answers = [];
                this.add_answer = function (answer) {
                    answers.push(answer);
                };
                
                var clear_selection = function () {
                    $scope.is_correct = true;
                    $scope.are_all_answers_selected = false;
                    $scope.is_question_answered = false;
                    $scope.next_selected_position = 1;
                    angular.forEach(answers, function (answer) {
                        answer.is_question_answered = false;
                        answer.clear_selection();
                    });
                };
                clear_selection();
                $scope.clear_selection = clear_selection;
                
                this.select_answer = function (selected_answer) {
                    var are_all_answers_selected = true;
                    selected_answer.set_selected_position($scope.next_selected_position);
                    $scope.is_correct &= 
                        (selected_answer.position === $scope.next_selected_position);
                    $scope.next_selected_position += 1;
                    angular.forEach(answers, function (answer) {
                        are_all_answers_selected &= answer.is_selected;
                    });
                    $scope.are_all_answers_selected = are_all_answers_selected;
                };
                $scope.submit_answer = function () {
                    $scope.is_question_answered = true;
                    $scope.ordered_answers = answers.sort(function (a, b) {
                        return a.position - b.position;
                    });
                    angular.forEach(answers, function (answer) {
                        answer.is_question_answered = true;
                    });
                    $scope.$emit('question:submitted', $scope.is_correct);
                };
                
            },
            replace: true,
            templateUrl: 'directives/order_question.html',
        };
        return directive;
    });
    
    directives.directive('orderAnswer', function() {
        return {
          require: '^orderQuestion',
          restrict: 'E',
          transclude: true,
          scope: {},
          link: function (scope, element, attrs, question_controller) {
              scope.position = parseInt(attrs.position, 10);
              scope.label = element.children(':first').text();
              
              question_controller.add_answer(scope);
              
              scope.set_selected_position = function (position) {
                  scope.selected_position = position;
              };
              scope.clear_selection = function () {
                  scope.selected_position = null;
                  scope.is_selected = false;
              };
              scope.selected_position = null;
              
              scope.select_answer = function () {
                  scope.is_selected = true;
                  question_controller.select_answer(scope);
              };
              scope.is_selected = false;
          },
          templateUrl: 'directives/order_answer.html',
          replace: true
        };
    });
    
    directives.directive('score', function (ScoreKeeper) {
        return {
            restrict: 'E',
            controller: function ($scope) {
                $scope.$on('score:updated', function (event, score) {
                    $scope.score = score;
                });
                $scope.score = ScoreKeeper.get_score();
            },
            template: '<span>{{ score }}</span>'
        };
    });
    
    directives.directive('matchDay', function (ScoreKeeper) {
        return {
            restrict: 'E',
            scope: { data: '='},
            controller: function ($scope) {
                var data = $scope.data;
                delete $scope.data;
                
                $scope.rest = data.rest;
                $scope.selected_day = 1;
                $scope.item = data.item;
                $scope.correct_answer = data.count;
                
                $scope.$watch('selected_day', function (selected_day) {
                    if (selected_day === 1) {
                        $scope.item = data.item;
                    } else {
                        $scope.item = data.plural || (data.item + 's');
                    }
                    
                    var is_correct = (selected_day === data.count);
                    $scope.$parent.set_answer_correctness(
                        data.count,
                        is_correct
                    );
                    $scope.is_correct = is_correct;
                });
                
                $scope.$parent.$watch('is_answer_submitted', function (value) {
                    $scope.is_answer_submitted = value;
                });
            },
            templateUrl: 'directives/match_day.html'
        };
    });
    
})(window.angular);
