
module.exports = TweetsApp = React.createClass({
    //render the component
    render : function(){
        return (
            <div className="tweets-app">
                <Tweets tweets={this.state.tweets}/>
                <Loader paging={this.state.paging}/>
                <NotificationBar count={this.state.count} onShowNewTweets={this.showNewTweets}/>
            </div>
        )
    },

    getInitialState : function(props){
        props = props || this.props;

        return {
            tweets : props.tweets,
            count : 0,
            page : 0,
            paging : false,
            skip : 0,
            done : false
        };
    },

    componentWillReceiveProps : function(newProps, oldProps){
        this.state(this.getInitialState(newProps));
    },

    //called directly after component rendering, only on client
    componentDidMount : function(){

        //preserve self reference
        var self = this;

        //initialize socket.io
        var socket = io.connect();

        //on tweet event emision...
        socket.on('tweet', function(data){
            //add a tweet to our queue
            self.addTweet(data);
        });

        //attach scroll event to the window for infinity paging
        window.addEventListener('scroll', this.checkWindowScroll);

    },

    //method to add a tweet to our timeline
    addTweet : function(){

        //get current application state
        var updated = this.state.tweets;

        //increment the unread count
        var count = this.state.count + 1;

        //increment the skip count
        var skip = this.state.skip + 1;

        //add tweet to the beginning of the tweets array
        updated.unshift(tweet);

        //set application state
        this.setState({ tweets : updated, count : count, skip : skip});
    },

    //method to show the unread tweets
    showNewTweets : function(){

        //get current application state
        var updated = this.state.tweets;

        //mark our tweets active
        updated.forEach(function(tweet){
            tweet.active = true;
        });

        //set aplication state (active tweets + reset unread count)
        this.setState({ tweets : updated, count : 0});
    },

    //method to check if more tweets should be loaded, by scroll position
    checkWindowScroll : function(){

        //get scroll pos & window data
        //clientHeight --> IE and innerHeight --> the rest
        var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

        //distance to the top
        var s = document.body.scrollTop;
        var scrolled = (h + s) > document.body.offsetHeight;

        //if scrolled enough, not currently paging and not complete...
        if(scrolled && !this.state.paging && !this.state.done){
            //set application state (paging, increment page)
            this.setState({ paging : true, page : this.state.page + 1});

            //get the next page of tweets from the server
            this.getPage(this.state.page);
        }
    },

    getPage : function(page){

        //setup our ajax request
        var request = new XMLHttpRequest();
        var self = this;

        request.open('GET', 'page/' + page + '/' + this.state.skip, true);
        request.onload = function(){

            //if everything is cool...
            if(request.status >= 200 && request.status < 400){
                //load our next page
                self.loadPagedTweets(JSON.parse(request.responseText));
            }else{
                //set application state (not paging, paging complete)
                self.setState({ paging : false, done : true});
            }
        };

        //fire
        request.send();
    },

    //method to load tweets fetched from the server
    loadPageTweets : function(tweets){

        //so meta lol
        var self = this;

        //if we still have tweets...
        if(tweets.length > 0){

            //get current application state
            var updated = this.state.tweets;

            //push them onto the end of the current tweets array
            tweets.forEach(function(tweet){
                updated.push(tweet);
            });

            //this app is so fast, I actually use a timeout for dramatic effect
            //otherwise you'd never see our super sexy loader svg
            setTimeout(function(){

                //set application state (not paging, add tweets)
                self.setState({ tweets : updated, paging : false});
            }, 1000);
        }else{

            //set application state (not paging, paging complete)
            this.setState({ done : true, paging : false});
        }
    }
});