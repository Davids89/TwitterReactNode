var Tweet = require('../models/Tweet');

/**
 * This file is the stream connection between user and models.
 * When a new tweet is created, the stream save it in the database and then send an advice to
 * the UI
 * @param stream
 * @param io
 */

module.exports = function(stream, io){

    //When tweets are sent our way

    stream.on('data', function(data){

        //we create a new tweet object
        var tweet = {
            twid : data['id'],
            active : false,
            author : data['user']['name'],
            avatar : data['user']['profile_image_url'],
            body : data['text'],
            date : data['created_at'],
            screenname : data['user']['screen_name']
        };

        //create a new model instance with the object
        var tweetEntry = new Tweet(tweet);

        //save to db
        tweetEntry.save(function(err){
            if(!err){
                io.emit('tweet', tweet); //this emit an event
            }
        })

    })
};