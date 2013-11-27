(function (angular) {
    'use strict';
    
    var TWELVE_DAYS = {
        1: 'a partidge in a pear tree',
        2: 'two turtle doves',
        3: 'three french hens',
        4: 'four colly birds',
        5: 'five gold rings',
        6: 'six geese-a-laying',
        7: 'seven swans-a-swimming',
        8: 'eight maids-a-milking',
        9: 'nine ladies dancing',
        10: 'ten lords-a-leaping',
        11: 'eleven pipers piping',
        12: 'twelve drummers drumming'
    };
    
    var DAY_OBJECTS = [
       {
           count: 1,
           item: 'partidge',
           rest: ' in a pear tree'
       },
       {
           count: 2,
           item: 'turtle dove'
       },
       {
           count: 3,
           item: 'french hen'
       },
       {
           count: 4,
           item: 'colly bird'
       },
       {
           count: 5,
           item: 'gold ring'
       },
       {
           count: 6,
           item: 'goose',
           plural: 'geese',
           rest: '-a-laying'
       },
       {
           count: 7,
           item: 'sawn',
           rest: '-a-swiming'
       },
       {
           count: 8,
           item: 'maid',
           rest: '-a-milking',
       },
       {
           count: 9,
           item: 'lady',
           plural: 'ladies',
           rest: ' dancing'
       },
       {
           count: 10,
           item: 'lord',
           rest: '-a-leaping'
       },
       {
           count: 11,
           item: 'piper',
           rest: ' piping'
       },
       {
           count: 12,
           item: 'drummer',
           rest: ' drumming'
       }
    ];
    
    var IS_ORDER_QUESTION_ANSWERED_KEY = 'is-order-ques-answered';
    
    var FURTHEST_ANSWERED_QUESTION_KEY = 'furthest-answered-question';
    
    
    var controllers = angular.module('xmas.controllers', []);
    
    controllers.controller('WelcomeController', function () {});
    
    controllers.controller('QuizController', function ($scope, $location, nsls, ScoreKeeper) {
        if (nsls.get(IS_ORDER_QUESTION_ANSWERED_KEY)) {
            var next_question_id = (nsls.get(FURTHEST_ANSWERED_QUESTION_KEY) || 0) + 1;
            $location.path('/quiz/' + next_question_id);
        }
        
        ScoreKeeper.reset_score();
        var days_randomized = [];
        var day_count = DAY_OBJECTS.length;
        while (days_randomized.length < day_count) {
            var random_index = Math.round(Math.random() * (day_count - 1));
            var random_day_text = DAY_OBJECTS[random_index];
            if (days_randomized.indexOf(random_day_text) === -1) {
                days_randomized.push(random_day_text);
            }
        }
        $scope.days_randomized = days_randomized;
        
        var answers_correctness = [];
        $scope.set_answer_correctness = function (day, is_correct) {
            answers_correctness[day - 1] = is_correct;
        };
        
        $scope.is_answer_submitted = false;
        $scope.submit_answer = function () {
            $scope.is_answer_submitted = true;
            
            var correct_answer_count = 0;
            var incorrect_answer_count = 0;
            angular.forEach(answers_correctness, function (is_correct) {
                if (is_correct) {
                    correct_answer_count += 1;
                } else {
                    incorrect_answer_count += 1;
                }
            });
            $scope.correct_answer_count = correct_answer_count;
            $scope.incorrect_answer_count = incorrect_answer_count;
            ScoreKeeper.increment_score(correct_answer_count);
            nsls.put(IS_ORDER_QUESTION_ANSWERED_KEY, true);
        };
        
        $scope.goto_next = function () {
            $location.path('/quiz/1');
        };
    });
    controllers.controller('AboutController', function () {});
    
    controllers.controller('QuestionController', function ($scope, $routeParams, $location, nsls, ScoreKeeper) {
        var id = parseInt($routeParams.id, 10);
        
        // Handle skipping back to already answered questions
        if (!(id in TWELVE_DAYS)) {
            $location.path('/quiz');
            return;
        }
        
        var furthest_answered_question = nsls.get(FURTHEST_ANSWERED_QUESTION_KEY) || 0;
        if (id <= furthest_answered_question) {
            var next_question_id = furthest_answered_question + 1;
            $location.path('/quiz/' + next_question_id);
            return;
        }
        
        $scope.day = {
            number: id,
            description: TWELVE_DAYS[id]
        };
        $scope.question_partial = 'partials/questions/' + id + '.html';
        
        $scope.is_next_control_available = false;
        $scope.$on('question:submitted', function (event, is_correct) {
            nsls.put(FURTHEST_ANSWERED_QUESTION_KEY, id);
            if (is_correct) {
                ScoreKeeper.increment_score(1);
            }
            $scope.is_next_control_available = true;
        });
        
        $scope.goto_next = function () {
            var next_id = id + 1;
            if (next_id in TWELVE_DAYS) {
                $location.path('/quiz/' + next_id);
            } else {
                throw new Error('Unhandled end of quiz!');
            }
        };
    });

    controllers.controller('ScoreBoardController', function ($scope, Score) {
        $scope.is_loading_scores = true;
        Score.query({s: {value: -1}}, function (scores) {
            $scope.scores = scores;
            $scope.is_loading_scores = false;
        });

        
    });

    controllers.controller('AddScoreController', function ($scope, $location, Score, ScoreKeeper) {
        // TODO: Guard against getting here when not allowed
        $scope.score = {value: ScoreKeeper.get_score()};
        $scope.is_saving = false;

        $scope.add_score = function () {
            $scope.is_saving = true;
            Score.save($scope.score, function () {
                $location.path('/score-board');
            });
        };
    });
    
    var all = function (array) {
        var all_true = true;
        angular.forEach(array, function (value) {
            all_true = all_true && value;
        });
        return !! all_true;
    };
    
})(window.angular);
