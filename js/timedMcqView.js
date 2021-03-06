define([
    'core/js/adapt',
    'core/js/views/questionView'
], function(Adapt, QuestionView) {

    var timer;
    var timer2;
    var TimedMcqView = QuestionView.extend({

        events: {
            'inview': 'inview',
            'focus .timedMcq-item input':'onItemFocus',
            'blur .timedMcq-item input':'onItemBlur',
            'change .timedMcq-item input':'onItemSelected',
            'keyup .timedMcq-item input':'onKeyPress',
            'click .timedMcq-time-start' : 'startTimer'
        },

        resetQuestionOnRevisit: function() {
            this.setAllItemsEnabled(true);
            this.resetQuestion();
        },

        setupQuestion: function() {
            // if only one answer is selectable, we should display radio buttons not checkboxes
            this.model.set("_isRadio", (this.model.get("_selectable") == 1));
            
            this.model.set('_selectedItems', []);

            this.setupQuestionItemIndexes();

            this.setupRandomisation();
            
            this.restoreUserAnswers();

        },

        startTimer: function() {
            this.displayQuestions();
            var currentimedmcq = this.model.get('_id');
            window.setTimeout(function(){ 
                if ($('html').hasClass('accessibility')) {
                    $('.accessibility .' + currentimedmcq + ' .timedMcq__body-inner').a11y_focus();
                }
            }, 500);
            parent = this;
            timer = setInterval(
                    function(){ parent.decreaseTime() } , 1000
                );
        },

        displayQuestions: function() {
            this.$(".timedMcq__widget").css("visibility","visible");
            this.$(".btn__container").css("visibility","visible");
            this.$(".timedMcq-body-items").addClass("started");
            this.$(".timedMcq-time-start").addClass("started").prop("disabled", true);
            this.$(".timedMcq-time-instruction").addClass("started");
            this.$(".timedMcq-time").addClass("started");
            this.$(".aria-instruct").removeClass("display-none");
            this.$('.btn__action').removeClass("disabled").prop("disabled", false);
            $(".timedMcq-time-start").addClass("disabled").prop("disabled", true); //THIS LOCKES OTHER QUESTIONS UNTIL THIS ONE IS ANSWERED
        },

        checkTimeUp: function(){
            if(this.model.get('_seconds') > 0 ) {
                return false;
            }else{
                if ( $(".timedmcq").hasClass( "enabledimgtime" ) && !$(".timedmcq").hasClass( "embedimgtimeup" ) ) {
                    //don't do anything
                    $(".timedMcq-time-start").addClass("disabled").prop("disabled", true); //THIS LOCKES IMAGE TIMED QUESTIONS
                } else {
                    $(".timedMcq-time-start").removeClass("disabled").prop("disabled", false); //THIS UNLOCKES OTHER QUESTIONS
                    this.$( '.timedMcq-time' ).attr("tabindex","0").attr("aria-label","time left to answer 0 seconds").text( '0' );
                }
            }
            return true;
        },

        stopTimer: function(){
            clearInterval(timer);
        },

        stopTimer2: function(){
            $(".enabledimgtime .imgcounton").addClass("stoppedimgtimer");
            clearInterval(timer2);
        },

        decreaseTime: function(){
            var seconds = this.model.get("_seconds");
            this.model.set("_seconds", --seconds);
            this.$(".timedMcq-time").attr("tabindex","0").attr("aria-label","time left to answer "+seconds+" seconds").text(seconds); //Made the timer accessible
            if(this.checkTimeUp()) {
                this.disableQuestion(); 
            }
        },

        inview: function(event, visible, visiblePartX, visiblePartY) {
            if (visible) {
                if (visiblePartY === 'top') {
                    this._isVisibleTop = true;
                    this.stopTimer2();
                } else if (visiblePartY === 'bottom') {
                    this._isVisibleBottom = true;
                } else {
                    this._isVisibleTop = true;
                    this._isVisibleBottom = true;
                }

                if (this._isVisibleTop && this._isVisibleBottom) {
                    this.$('.component__widget').off('inview');
                }

            }
        },

        decreaseTime2: function(setupInView){
            var seconds = this.model.get("_seconds");
            var currentimedmcq = this.model.get('_id');

            $("." + currentimedmcq + ".enabledimgtime .timedMcq-time").addClass("imgcounton");
            $("." + currentimedmcq + ".enabledimgtime .timedMcq__widget").css("visibility","visible");
            $(".enabledimgtime .timedMcq-body-items").removeClass("started");
            $(".enabledimgtime .timedMcq-time-start").removeClass("started").prop("disabled", false);
            $(".enabledimgtime .timedMcq-time-instruction").removeClass("started");
            $(".enabledimgtime .timedMcq-time").removeClass("display-none").removeClass("started");
            $(".enabledimgtime .aria-instruct").addClass("display-none");
            $(".enabledimgtime .timedMcq-time-start").addClass("disabled").prop("disabled", true); //THIS LOCKES OTHER QUESTIONS UNTIL THIS ONE IS ANSWERED  

            this.model.set("_seconds", --seconds);
            $("." + currentimedmcq + " .timedMcq-time").attr("tabindex","0").attr("aria-label","time left to answer "+seconds+" seconds").text(seconds); //Made the timer accessible 
            if (seconds <= 0) {
                // On Countdown finish do this
               this.stopTimer2();
                $("." + currentimedmcq + ".timedmcq").addClass("embedimgtimeup");
                $("." + currentimedmcq + ".embedimgtimeup .timedMcq__widget").css("visibility","visible");
                $("." + currentimedmcq + ".embedimgtimeup .timedMcq-body-items").addClass("started");
                $("." + currentimedmcq + ".embedimgtimeup .timedMcq-time-start").addClass("started").prop("disabled", true);
                $("." + currentimedmcq + ".embedimgtimeup .timedMcq-time-instruction").addClass("started");
                $("." + currentimedmcq + ".embedimgtimeup .timedMcq-time").addClass("display-none").addClass("started").text( "0" );
                $("." + currentimedmcq + ".embedimgtimeup .aria-instruct").removeClass("display-none");
                $("." + currentimedmcq + ".embedimgtimeup .btn__action").removeClass("disabled").prop("disabled", false);
                $("." + currentimedmcq + ".embedimgtimeup .timedMcq-item input").removeClass("disabled").prop("disabled", false);
                $(".enabledimgtime .timedMcq-time-start").addClass("disabled").prop("disabled", true);//THIS LOCKES TIMED IMAGE QUESTIONS
                var currentimedmcq = this.model.get('_id');
                window.setTimeout(function(){
                    if ($('html').hasClass('accessibility')) { 
                        $('.accessibility .' + currentimedmcq + ' .timedMcq__body-inner').a11y_focus();
                    }
                }, 500);
            }
        },

        setupQuestionItemIndexes: function() {
            var items = this.model.get("_items");
            for (var i = 0, l = items.length; i < l; i++) {
                if (items[i]._index === undefined) items[i]._index = i;
            }
        },

        setupRandomisation: function() {
            if (this.model.get('_isRandom') && this.model.get('_isEnabled')) {
                this.model.set("_items", _.shuffle(this.model.get("_items")));
            }
        },

        restoreUserAnswers: function() {
            if (!this.model.get("_isSubmitted")) return;

            var selectedItems = [];
            var items = this.model.get("_items");
            var userAnswer = this.model.get("_userAnswer");

            var themcqtotalscore = parseFloat(this.model.get("_themcqtotalscore"));
            var therequiredscore = parseFloat(this.model.get("_therequiredscore"));
            var outofahundred = parseFloat(this.model.get("_outofahundred"));

            _.each(items, function(item, index) {
                item._isSelected = userAnswer[item._index];
                if (item._isSelected) {
                    selectedItems.push(item)
                }
            });

            this.model.set("_selectedItems", selectedItems);

            this.setQuestionAsSubmitted();
            this.markQuestion();
            this.setScore();
            this.showMarking();
            
            $(".timedmcq").addClass("mcqscoringpercent");
            if (this.model.get('_isSubmitted') && this.model.has('_userAnswer')) {
                
                var currentimedmcq = this.model.get('_id');
                var myarticleis = this.$el.parents('.article');
                var myarticleId = myarticleis.attr("data-adapt-id");
                var toshowScore = this.model.get("_feedback")._showmyScore;
                var percentageBar = this.model.get("_showPercentagebar");
                var percentBartxt = this.model.get("_showPercenttext");
                var themcqtotalscore2 = parseFloat($('.' + myarticleId + ' .masterscorehold .mymcqtotalscore').text());
                var therequiredscore2 = parseFloat($('.' + myarticleId + ' .masterscorehold .mymcqrequiredscore').text());
                var outofahundred2 = themcqtotalscore2 / therequiredscore2 * 100;

                if (toshowScore == true || percentageBar == true) {
                    window.setTimeout(function(){
                        $('.' + myarticleId + ' .mcqscoringaddup.' + currentimedmcq + ' .masterscorehold .mcqmovingbar').css("width", outofahundred2.toFixed(2)+"%").html("&nbsp;<span>" + percentBartxt + "</span> " + outofahundred2.toFixed(2) + "%").attr("aria-label", percentBartxt + outofahundred2.toFixed(2) + "%");
                        $("." + myarticleId + " .assessmentResults__instruction-inner").html("<p class='yourachievement1' style='font-size: 125%'>Your Overall Score is <span class='leavemyscore'>" + outofahundred2.toFixed(2) + "%</span></p><p class='yourachievement2' style='font-size: 125%'>You selected <span class='leavemyscore'>" + themcqtotalscore2 + "/" + therequiredscore2 + "</span> answers correctly.</p>");
                     }, 878);
                }
            }
            this.setupFeedback();
        },

        disableQuestion: function() {
            this.stopTimer();
            if(this.checkTimeUp()){
                this.timeUp();
            }
            this.setAllItemsEnabled(false);
        },

        enableQuestion: function() {
            this.setAllItemsEnabled(true);
        },

        timeUp: function(){
            var currentimedmcq = this.model.get('_id');

            if (  $("." + currentimedmcq + ".timedmcq").hasClass( "embedimgtimeup" ) ) {
                $("." + currentimedmcq + ".embedimgtimeup .btn__action").removeClass("disabled").prop("disabled", false);
            } else {
                this.model.set('_isCorrect', false);
                this.model.set('_isComplete', true);
                this.model.set('_isSubmitted', true);
                this.setupTimeUpFeedback();
                $("." + currentimedmcq + ".timedmcq .btn__action").prop("disabled", true);
                this._runModelCompatibleFunction('updateAttempts');
                this.$('.component__widget').addClass('is-submitted');
                this._runModelCompatibleFunction('storeUserAnswer');
                this._runModelCompatibleFunction('setScore');
                this._runModelCompatibleFunction('checkQuestionCompletion');
                if (this.model.shouldShowMarking) {
                    this.showMarking();
                }
                this.recordInteraction();
                Adapt.trigger('questionView:showFeedback', this);
            }
        },

        setAllItemsEnabled: function(isEnabled) {
            _.each(this.model.get('_items'), function(item, index){
                var $itemLabel = this.$('label').eq(index);
                var $itemInput = this.$('input').eq(index);

                if (isEnabled) {
                    $itemLabel.removeClass('disabled');
                    $itemInput.prop('disabled', false);
                } else {
                    $itemLabel.addClass('disabled');
                    $itemInput.prop('disabled', true);
                }
            }, this);
        },

        onQuestionRendered: function() {
            this.setReadyStatus();

            var seconds = this.model.get("_seconds");
            var currentimedmcq = this.model.get('_id');

            if (  this.$(".timedMcq__widget").hasClass( "submitted" ) || this.$(".timedMcq__widget").hasClass( "complete" ) ) {
                
                this.$( '.timedMcq-time' ).attr("tabindex","0").attr("aria-label","time left to answer 0 seconds").text( '0' );
                
                window.setTimeout(function(){
                    this.$( ".embedimgtimeup .timedMcq__widget").css("visibility","visible");
                    this.$( ".embedimgtimeup .btn__container").css("visibility","visible");
                    this.$( ".embedimgtimeup .timedMcq-body-items").addClass("started");
                    this.$( ".embedimgtimeup .timedMcq-time-start").addClass("started").prop("disabled", true);
                    this.$( ".embedimgtimeup .timedMcq-time-instruction").addClass("started");
                    this.$( ".embedimgtimeup .timedMcq-time").addClass("display-none").addClass("started").text( "0" );
                    this.$( ".embedimgtimeup .aria-instruct").removeClass("display-none");
                    this.$( ".embedimgtimeup .btn__action").removeClass("disabled").prop("disabled", false);
                    this.$( ".embedimgtimeup .timedMcq-item input").removeClass("disabled").prop("disabled", false);
                }, 233);
            }

            //BELOW DISPLAYS ANSWERS OR TIME UP RESPONSE ON REVISIT
            if ( $("." + currentimedmcq + ".timedmcq").hasClass( "enabledimgtime" ) ) {
                if (seconds <= 0) {
                    $("." + currentimedmcq + ".enabledimgtime .timedMcq__widget").css("visibility","visible");
                    $("." + currentimedmcq + ".enabledimgtime .timedMcq-body-items").css({"visibility":"visible","opacity":"1"}).addClass("started");
                    $("." + currentimedmcq + ".enabledimgtime .btn__container").css("visibility","visible");
                    $("." + currentimedmcq + ".enabledimgtime .timedMcq-time-start").addClass("display-none");
                    $("." + currentimedmcq + ".enabledimgtime .timedMcq-time-instruction").css({"visibility":"visible","opacity":"1"}).addClass("started");
                    $("." + currentimedmcq + ".enabledimgtime .timedMcq-time").addClass("display-none").removeClass("started");
                    $("." + currentimedmcq + ".enabledimgtime .aria-instruct").addClass("display-none");
                }
            } else if ( this.$( ".timedMcq-time" ).text() == "0" ) {
                $("." + currentimedmcq + ".timedmcq").addClass("timeuplock");
                $("." + currentimedmcq + ".timeuplock .timedMcq-body-items").addClass("started");
                $("." + currentimedmcq + ".timeuplock .timedMcq-time-start").addClass("started").prop("disabled", true);
                 window.setTimeout(function(){
                    $("." + currentimedmcq + ".timeuplock .timedMcq-item input").addClass("disabled").prop("disabled", true);
                    $("." + currentimedmcq + ".timeuplock .timedMcq-item label").css("cursor","default").addClass("disabled").prop("disabled", true);
                    $("." + currentimedmcq + ".timeuplock .btn__action").addClass("disabled").prop("disabled", true);
                }, 253);
                $("." + currentimedmcq + ".timeuplock .timedMcq-time-instruction").addClass("started");
                $("." + currentimedmcq + ".timeuplock .aria-instruct").removeClass("display-none");
            }

            //THIS OVERRIDES THE TIMER AS IT HAS BEEN UNENABLED ON THE COMPONENT
            if (this.model.get('_timeroffEnabled') && this.model.get('_isEnabled')) {
                $("." + currentimedmcq + ".timedmcq").addClass("timeuplock").addClass("notimenabled");
                $("." + currentimedmcq + ".timeuplock .timedMcq-body-items").addClass("started");
                $("." + currentimedmcq + ".timeuplock .timedMcq-time-start").addClass("started").prop("disabled", true);
                $("." + currentimedmcq + ".timeuplock .timedMcq-item label").css("cursor","pointer");
                $("." + currentimedmcq + ".timeuplock .btn__action").removeClass("disabled").prop("disabled", false);
                $("." + currentimedmcq + ".timeuplock .timedMcq-time-instruction").addClass("started");
                $("." + currentimedmcq + ".timeuplock .aria-instruct").removeClass("display-none");
            }

            $(".timedmcq").addClass("mcqscoringpercent");
            if (this.model.get('_isSubmitted') && this.model.has('_userAnswer')) {
                
                var currentimedmcq = this.model.get('_id');
                var myarticleis = this.$el.parents('.article');
                var myarticleId = myarticleis.attr("data-adapt-id");
                var toshowScore = this.model.get("_feedback")._showmyScore;
                var percentageBar = this.model.get("_showPercentagebar");
                var percentBartxt = this.model.get("_showPercenttext");
                var themcqtotalscore2 = parseFloat($('.' + myarticleId + ' .masterscorehold .mymcqtotalscore').text());
                var therequiredscore2 = parseFloat($('.' + myarticleId + ' .masterscorehold .mymcqrequiredscore').text());
                var outofahundred2 = themcqtotalscore2 / therequiredscore2 * 100;

                if (toshowScore == true || percentageBar == true) {
                    window.setTimeout(function(){
                        $('.' + myarticleId + ' .mcqscoringaddup.' + currentimedmcq + ' .masterscorehold .mcqmovingbar').css("width", outofahundred2.toFixed(2)+"%").html("&nbsp;<span>" + percentBartxt + "</span> " + outofahundred2.toFixed(2) + "%").attr("aria-label", percentBartxt + outofahundred2.toFixed(2) + "%");
                        $("." + myarticleId + " .assessmentResults__instruction-inner").html("<p class='yourachievement1' style='font-size: 125%'>Your Overall Score is <span class='leavemyscore'>" + outofahundred2.toFixed(2) + "%</span></p><p class='yourachievement2' style='font-size: 125%'>You selected <span class='leavemyscore'>" + themcqtotalscore2 + "/" + therequiredscore2 + "</span> answers correctly.</p>");
                     }, 878);
                }
            }

        },

        onKeyPress: function(event) {
            if (event.which === 13) { //<ENTER> keypress
                this.onItemSelected(event);
            }
        },

        onItemFocus: function(event) {
            if(this.model.get('_isEnabled') && !this.model.get('_isSubmitted')){
                $("label[for='"+$(event.currentTarget).attr('id')+"']").addClass('highlighted');
            }
        },
        
        onItemBlur: function(event) {
            $("label[for='"+$(event.currentTarget).attr('id')+"']").removeClass('highlighted');
        },

        onItemSelected: function(event) {
            if(this.model.get('_isEnabled') && !this.model.get('_isSubmitted')){
                var selectedItemObject = this.model.get('_items')[$(event.currentTarget).parent('.component-item').index()];
                this.toggleItemSelected(selectedItemObject, event);
            }
        },

        toggleItemSelected:function(item, clickEvent) {
            var selectedItems = this.model.get('_selectedItems');
            var itemIndex = _.indexOf(this.model.get('_items'), item),
                $itemLabel = this.$('label').eq(itemIndex),
                $itemInput = this.$('input').eq(itemIndex),
                selected = !$itemLabel.hasClass('selected');
            
                if(selected) {
                    if(this.model.get('_selectable') === 1){
                        this.$('label').removeClass('selected');
                        this.$('input').prop('checked', false);
                        this.deselectAllItems();
                        selectedItems[0] = item;
                    } else if(selectedItems.length < this.model.get('_selectable')) {
                     selectedItems.push(item);
                 } else {
                    clickEvent.preventDefault();
                    return;
                }
                $itemLabel.addClass('selected');
                $itemLabel.a11y_selected(true);
            } else {
                selectedItems.splice(_.indexOf(selectedItems, item), 1);
                $itemLabel.removeClass('selected');
                $itemLabel.a11y_selected(false);
            }
            $itemInput.prop('checked', selected);
            item._isSelected = selected;
            this.model.set('_selectedItems', selectedItems);
        },

        // check if the user is allowed to submit the question
        canSubmit: function() {
            var count = 0;
            var currentimedmcq = this.model.get('_id');

            _.each(this.model.get('_items'), function(item) {
                if (item._isSelected) {
                    count++;
                }
            }, this);

            $(".timedMcq-time-start").removeClass("disabled").prop("disabled", false); //THIS UNLOCKES OTHER QUESTIONS
         
            return (count >= 0) ? true : false;

        },

        // Blank method to add functionality for when the user cannot submit
        // Could be used for a popup or explanation dialog/hint
        onCannotSubmit: function() {},

        // This is important for returning or showing the users answer
        // This should preserve the state of the users answers
        storeUserAnswer: function() {
            var userAnswer = [];

            var items = this.model.get('_items').slice(0);
            items.sort(function(a, b) {
                return a._index - b._index;
            });

            _.each(items, function(item, index) {
                userAnswer.push(item._isSelected);
            }, this);
            this.model.set('_userAnswer', userAnswer);
        },

        isCorrect: function() {

            var numberOfRequiredAnswers = 0;
            var numberOfCorrectAnswers = 0;
            var numberOfIncorrectAnswers = 0;

            _.each(this.model.get('_items'), function(item, index) {

                var itemSelected = (item._isSelected || false);

                if (item._shouldBeSelected) {
                    numberOfRequiredAnswers ++;

                    if (itemSelected) {
                        numberOfCorrectAnswers ++;
                        
                        item._isCorrect = true;

                        this.model.set('_isAtLeastOneCorrectSelection', true);
                    }

                } else if (!item._shouldBeSelected && itemSelected) {
                    numberOfIncorrectAnswers ++;
                }

            }, this);

            this.model.set('_numberOfCorrectAnswers', numberOfCorrectAnswers);
            this.model.set('_numberOfRequiredAnswers', numberOfRequiredAnswers);

            // Check if correct answers matches correct items and there are no incorrect selections
            var answeredCorrectly = (numberOfCorrectAnswers === numberOfRequiredAnswers) && (numberOfIncorrectAnswers === 0);
            return answeredCorrectly;
        },

        _setupLinkedModel: function() {
            
            var currentimedmcq = this.model.get('_id');
            var numberOfCorrectAnswers = this.model.get("_numberOfCorrectAnswers");
            var numberOfRequiredAnswers = this.model.get("_numberOfRequiredAnswers");
            var toshowScore = this.model.get("_feedback")._showmyScore;
            var percentageBar = this.model.get("_showPercentagebar");
            var percentBartxt = this.model.get("_showPercenttext");
            var themcqtotalscore = parseFloat(this.model.get("_themcqtotalscore"));
            var therequiredscore = parseFloat(this.model.get("_therequiredscore"));
            var mypercentcount = parseFloat($(".mcqscoringpercent").length);
            var myscorecount = parseFloat($('.mcqscoringaddup').length)+1;
            var outofahundred = parseFloat(this.model.get("_outofahundred"));
            var myarticleis = this.$el.parents('.article');
            var myarticleId = myarticleis.attr("data-adapt-id");
            
            if (toshowScore == true || percentageBar == true) {
                $("." + myarticleId + " .timedmcq."+currentimedmcq).addClass("mcqscoringaddup");
                $('.' + myarticleId + ' .mcqscoringaddup.'+currentimedmcq+' .masterscorehold .mymcqtotalscore').text(numberOfCorrectAnswers);
                $('.' + myarticleId + ' .mcqscoringaddup .mymcqtotalscore').each(function() {
                    themcqtotalscore += parseFloat($(this).text());
                });

                console.log("Total MCQ score is now: " + themcqtotalscore);

                $('.' + myarticleId + ' .mcqscoringaddup.' + currentimedmcq + ' .masterscorehold .mymcqrequiredscore').text(numberOfRequiredAnswers);
                $('.' + myarticleId + ' .mcqscoringaddup .mymcqrequiredscore').each(function() {
                    therequiredscore += parseFloat($(this).text());
                });

                var outofahundred = themcqtotalscore / therequiredscore * 100;

                window.setTimeout(function(){
                    $('.' + myarticleId + ' .mcqscoringaddup.' + currentimedmcq + ' .masterscorehold .mcqmovingbar').css("width", outofahundred.toFixed(2)+"%").html("&nbsp;<span>" + percentBartxt + "</span> " + outofahundred.toFixed(2) + "%").attr("aria-label", percentBartxt + outofahundred.toFixed(2) + "%");
                    $("." + myarticleId + " .assessmentResults__instruction-inner").html("<p class='yourachievement1' style='font-size: 125%'>Your Overall Score is <span class='leavemyscore'>" + outofahundred.toFixed(2) + "%</span></p><p class='yourachievement2' style='font-size: 125%'>You selected <span class='leavemyscore'>" + themcqtotalscore + "/" + therequiredscore + "</span> answers correctly.</p>");
                 }, 777);

                if (myscorecount == mypercentcount) {
                    this.model.set('_themcqtotalscore', themcqtotalscore);
                    this.model.set('_therequiredscore', therequiredscore);
                    this.model.set('_outofahundred', outofahundred);
                }

                console.log("The Require Total MCQ score is: " + therequiredscore);
                console.log("Percentage MCQ score is: " + outofahundred.toFixed(2));
            }

        },

        mycorrectScoring: function() {
            var numberOfCorrectAnswers = this.model.get("_numberOfCorrectAnswers");
            var numberOfRequiredAnswers = this.model.get("_numberOfRequiredAnswers");
            var toshowScore = this.model.get("_feedback")._showmyScore;
            var rightoScore = this.model.get("_feedback").correct;

            if (toshowScore == true) {
                this.model.set({
                    feedbackMessage: rightoScore + "<div class='scoreoutof'><p>You selected <span class='leavemyscore'>" + numberOfCorrectAnswers + "/" + numberOfRequiredAnswers + "</span> answers correctly.</p></div>"
                });
            } else {
                //DO NOTHING
            }

        },
        mypartlyScoring: function() {
            var numberOfCorrectAnswers = this.model.get("_numberOfCorrectAnswers");
            var numberOfRequiredAnswers = this.model.get("_numberOfRequiredAnswers");
            var toshowScore = this.model.get("_feedback")._showmyScore;
            var partlyScore = this.model.get("_feedback")._partlyCorrect.final;

            if (toshowScore == true) {
                this.model.set({
                    feedbackMessage: partlyScore + "<div class='scoreoutof'><p>You selected <span class='leavemyscore'>" + numberOfCorrectAnswers + "/" + numberOfRequiredAnswers + "</span> answers correctly.</p></div>"
                });
            } else {
                //DO NOTHING
            }

        },
        myincorrectScoring: function() {
            var numberOfCorrectAnswers = this.model.get("_numberOfCorrectAnswers");
            var numberOfRequiredAnswers = this.model.get("_numberOfRequiredAnswers");
            var toshowScore = this.model.get("_feedback")._showmyScore;
            var wrongoScore = this.model.get("_feedback")._incorrect.final;

            if (toshowScore == true) {
                this.model.set({
                    feedbackMessage: wrongoScore + "<div class='scoreoutof'><p>You selected <span class='leavemyscore'>" + numberOfCorrectAnswers + "/" + numberOfRequiredAnswers + "</span> answers correctly.</p></div>"
                });
            } else {
                //DO NOTHING
            }

        },
        myindividualScoring: function() {
            var numberOfCorrectAnswers = this.model.get("_numberOfCorrectAnswers");
            var numberOfRequiredAnswers = this.model.get("_numberOfRequiredAnswers");
            var toshowScore = this.model.get("_feedback")._showmyScore;
            var individualScore = this.model.get('_selectedItems')[0].feedback;

            if (toshowScore == true) {
                this.model.set({
                    feedbackMessage: individualScore + "<div class='scoreoutof'><p>You selected <span class='leavemyscore'>" + numberOfCorrectAnswers + "/" + numberOfRequiredAnswers + "</span> answers correctly.</p></div>"
                });
            } else {
                //DO NOTHING
            }

        },

        // Sets the score based upon the questionWeight
        // Can be overwritten if the question needs to set the score in a different way
        setScore: function() {
            var questionWeight = this.model.get("_questionWeight");
            var answeredCorrectly = this.model.get('_isCorrect');
            var score = answeredCorrectly ? questionWeight : 0;
            this.model.set('_score', score);
        },

        setupFeedback: function() {

            if (this.model.get('_isCorrect')) {
                this.setupCorrectFeedback() + this.mycorrectScoring();
            } else if (this.isPartlyCorrect()) {
                this.setupPartlyCorrectFeedback() + this.mypartlyScoring();
            } 
             else {
                // apply individual item feedback
                if((this.model.get('_selectable') === 1) && this.model.get('_selectedItems')[0].feedback) {
                    this.setupIndividualFeedback(this.model.get('_selectedItems')[0]) + this.myindividualScoring();
                    return;
                } else {
                    this.setupIncorrectFeedback() + this.myincorrectScoring();
                }
            }
            $(".enabledimgtime .timedMcq-time-start").addClass("disabled").prop("disabled", true);//THIS LOCKES TIMED IMAGE QUESTIONS
            this._setupLinkedModel();
        },

        setupTimeUpFeedback: function() {
             this.model.set({
                feedbackTitle: this.model.get('title'),
                feedbackMessage: this.model.get("_feedback").timeUp
             });
             $(".enabledimgtime .timedMcq-time-start").addClass("disabled").prop("disabled", true);//THIS LOCKES TIMED IMAGE QUESTIONS
        },

        setupIndividualFeedback: function(selectedItem) {
             this.model.set({
                 feedbackTitle: this.model.get('title'),
                 feedbackMessage: selectedItem.feedback
             });
             $(".enabledimgtime .timedMcq-time-start").addClass("disabled").prop("disabled", true);//THIS LOCKES TIMED IMAGE QUESTIONS
        },

        // This is important and should give the user feedback on how they answered the question
        // Normally done through ticks and crosses by adding classes
        showMarking: function() {
            _.each(this.model.get('_items'), function(item, i) {
                var $item = this.$('.component-item').eq(i);
                $item.removeClass('correct incorrect').addClass(item._isCorrect ? 'correct' : 'incorrect');
            }, this);
        },

        isPartlyCorrect: function() {
            return this.model.get('_isAtLeastOneCorrectSelection');
        },

        resetUserAnswer: function() {
            this.model.set({_userAnswer: []});
        },

        // Used by the question view to reset the look and feel of the component.
        resetQuestion: function() {

            this.deselectAllItems();
            this.resetItems();
        },

        deselectAllItems: function() {
            this.$el.a11y_selected(false);
            _.each(this.model.get('_items'), function(item) {
                item._isSelected = false;
            }, this);
        },

        resetItems: function() {
            this.$('.component-item label').removeClass('selected');
            this.$('.component-item').removeClass('correct incorrect');
            this.$('input').prop('checked', false);
            this.model.set({
                _selectedItems: [],
                _isAtLeastOneCorrectSelection: false
            });
        },

        showCorrectAnswer: function() {
            _.each(this.model.get('_items'), function(item, index) {
                this.setOptionSelected(index, item._shouldBeSelected);
            }, this);
        },

        setOptionSelected:function(index, selected) {
            var $itemLabel = this.$('label').eq(index);
            var $itemInput = this.$('input').eq(index);
            if (selected) {
                $itemLabel.addClass('selected');
                $itemInput.prop('checked', true);
            } else {
                $itemLabel.removeClass('selected');
                $itemInput.prop('checked', false);
            }
        },

        hideCorrectAnswer: function() {
            _.each(this.model.get('_items'), function(item, index) {
                this.setOptionSelected(index, this.model.get('_userAnswer')[item._index]);
            }, this);
        },

        /**
        * used by adapt-contrib-spoor to get the user's answers in the format required by the cmi.interactions.n.student_response data field
        * returns the user's answers as a string in the format "1,5,2"
        */
        getResponse:function() {
            var selected = _.where(this.model.get('_items'), {'_isSelected':true});
            var selectedIndexes = _.pluck(selected, '_index');
            // indexes are 0-based, we need them to be 1-based for cmi.interactions
            for (var i = 0, count = selectedIndexes.length; i < count; i++) {
                selectedIndexes[i]++;
            }
            return selectedIndexes.join(',');
        },

        /**
        * used by adapt-contrib-spoor to get the type of this question in the format required by the cmi.interactions.n.type data field
        */
        getResponseType:function() {
            return "choice";
        }

    });

    //Adapt.register("timedMcq", timedMcq);

    return TimedMcqView;
});
