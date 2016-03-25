var JSX = require('node-jsx').install();
var React = require('react');
var TweetsApp = require('./components/TweetsApp.react');
var Tweet = require('./models/Tweet');

module.exports = {
    index : function(req, res){
        //call static model method to get tweets in the db
        Tweet.getTweets(0,0, function(tweets, pages){

            //Render React to a string, passing in our fetched tweets
            var markup = React.renderComponentToString(
                TweetsApp({
                    tweets : tweets
                })
            );

            //render home template
            res.render('home', {
                markup : markup, //pass rendered react markup
                state : JSON.stringify(tweets) //pass current state to client side
            });
        });
    },

    page : function(req, res){
        //fecth tweets by page via param
        Tweet.getTweets(req.params.page, res.params.skip, function(tweets){
           res.send(tweets);
        });
    }
};