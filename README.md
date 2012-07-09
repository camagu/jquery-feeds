jQuery Feeds - RSS aggregator for your site
===========================================

Use the jQuery Feeds Plugin to retrieve and display multiple RSS feeds' entries in chronological order.

Features
--------

- Fetches multiple feeds
- Entries are combined and displayed in chronological order
- Fully customizable markup
- Fully customizable loader
- Manipulate entries' properties
- Uses the [Google Feed API](https://developers.google.com/feed/) to retrieve feeds

Basic usage
-----------

Download the [production version](https://raw.github.com/camagu/jquery-feeds/master/dist/jquery.feeds.min.js) or the [development version](https://raw.github.com/camagu/jquery-feeds/master/dist/jquery.feeds.js) and add it to your site:

```html
<script src="jquery.js"></script>
<script src="jquery.feeds.js"></script>
```

And attach some feeds to a container:

```javascript
$('#container').feeds({
	feeds: {
		feed1: 'http://url/to/rss/feed',
		feed2: 'http://url/to/another/rss/feed'
		// key: 'url', ...
	}
});
```
	
The feeds' keys (i.e. *feed1* and *feed2* in the example) are used to identify the source of the entries. You can use any alphanum string as a key but try to keep them short and descriptive (e.g. *google*, *jquery*, *smashingmag*).

-----------------------------------------------------------------------------------------------------------------------

You can also set the max number of items for each feed by using the *max* option:

```javascript
$('#container').feeds({
	feeds: {
		// Your feeds ...
	},
    max: 3
});
```

By default *max* is set to -1, which means it should fetch the maximum number of entries supported by the Google Feed API (which is 100).

*__Note:__ the more feeds you load and the more entries you get the longer it will take the plugin to load them.*

Manipulating entries
--------------------

You can manipulate the properties of each entry by implementing the *preprocess* callback. Say you want to modify the entries' *publishedDate* format (inside the callback *this* corresponds to the current entry):

```javascript
$('#container').feeds({
    feeds: {
        // Your feeds ...
    },
    preprocess: function ( feed ) {
        // Change the publishedDate format from UTC to dd-mm-yyyy
        var date = new Date(this.publishedDate);
        var pieces = [date.getDate(), date.getMonth(), date.getFullYear()]
        this.publishedDate = pieces.join('-');
    }
});
```

*__Tip:__ you can use js libraries such as [moment.js](http://momentjs.com) to format your dates.*

Available properties are:

- title
- publishedDate
- content
- contentSnippet (< 120 characters, no html tags)
- link
- mediaGroup
- categories
- source (the feed identifier, added by the plugin)
- feedUrl (the url of the rss feed)
- feedTitle (the title of the feed)
- feedLink (the url of the HTML version of the feed)
- feedDescription (the feed description)
- feedAuthor (the feed author)

Refer to the [Google developer's guide](https://developers.google.com/feed/v1/jsondevguide#resultJson) for more information.

onComplete callback
-------------------

By implementing the *onComplete* callback you can manipulate the container after the entries are rendered. Say you want to change all the anchors' *target* value to *_blank* (inside the callback *this* corresponds to the container):

```javascript
$('#container').feeds({
    feeds: {
        // Your feeds ...
    },
    onComplete: function (entries) {
        $(this).find('a').attr('target', '_blank');
    }
});
```
    
Templating
----------

The plugin uses a modified version of [John Resing](http://ejohn.org/)'s [JavaScript Micro-Templating](http://ejohn.org/blog/javascript-micro-templating/) function to render the entries.

A template is a regular HTML string where you can execute or print javascript statements inside *<! ... !>* or *<!= ... !>* tags respectively.

```html
<article>
	<header>
		<h1><a href="<!=link!>"><!=title!></a></h1>
		<p><!=publishedDate!></p>
		<! if (categories) { !>
			<ul>
				<! for (var i in categories) { !>
					<li><!=categories[i]!></li>
				<! } !>
			</ul>
		<! } !>
	</header>
	<div><!=contentSnippet!></div>
	<footer>
		<p>via: <a href="<!=feedLink!>"><!=feedTitle!></a></p>
	</footer>
</article>
```

All the entry's properties are passed to the template as variables.

To use a template you could either pass it as a string to the *entryTemplate* option ...

```javascript
$('#container').feeds({
    feeds: {
        // Your feeds ...
    },
	entryTemplate: '<p><!=title!></p>'
});
```

... or you could write it inside a *script* tag which *type* is set to *text/html* and pass it's *id* to the *entryTemplate* option:

```html
<script type="text/html" id="exampleTemplate">
	<p><!=title!></p>
</script>
```

```javascript
$('#container').feeds({
    feeds: {
        // Your feeds ...
    },
	entryTemplate: 'exampleTemplate'
});
```

### Custom callback

Alternatively, you can pass a function to *entryTemplate*. You can use this option to:

- use different templates based on some arbitrary logic
- use external template engines (e.g. [handlebars](http://handlebarsjs.com/), [jsrender](https://github.com/BorisMoore/jsrender/), [jqote](http://aefxx.com/))
- define your own presentation logic

Examples:

```javascript
// Use different templates based on source
$('#container').feeds({
	feeds: {
		blog: 'http://url/to/blog',
		twitter: 'http://url/to/twitter/feed'
	},
	entryTemplate: function(entry) {
		var template = '';
		
		if (entry.source == 'blog') {
			// Full view for blog entry
			template =	'<div>' +
						'<h1><a href="<!=link!>"><!=title!></a></h1>' +
						'<p><!=publishedDate!></p>' +
						'<div><!=contentSnippet!></div>';
		} else if (entry.source == 'twitter') {
			// Just the content for twitter entries
			template = '<div><!=content!></div>';
		}
		
		// Render the template
		return this.tmpl(template, entry);
	}
});
```

```javascript
// Using jsrender instead of built-in template function
$('#container').feeds({
	feeds: {
		// Your feeds ...
	},
	entryTemplate: function(entry) {
		return $('#myJsrenderTemplate').render(entry);
	}
});
```

```javascript
// Using your own presentation logic
$('#container').feeds({
	feeds: {
		// Your feeds ...
	},
	entryTemplate: function(entry) {
		return '<p>' + entry.title + '</p>';
	}
});
```

--------------------------------------------------------------------------------------------------------------------------

You can change the loader template as well by passing a template, it's *id* or a callback to the *loadingTemplate* option:

```javascript
$('#container').feeds({
    feeds: {
        // Your feeds ...
    },
    loadingTemplate: '<p>Fetching entries, please wait.</p>'
});
```
    
Options
-------

```javascript
// Feeds to retrieve
feeds: {
    // identifier: url, ...
},

// Maximum number of entries to fetch per feed, -1 for maximum available
max: -1,

// Called when all entries are rendered
onComplete: function( entries ) { },

// Called for each entry
preprocess: function( feed ) { },

// Template injected to container while feeds are loaded
loadingTemplate: '<p class="feeds-loader">Loading entries ...</p>',

// Template used to render each entry
entryTemplate:	'<div class="feeds-entry feeds-source-<!=source!>">' + 
				'<a class="feed-entry-title" target="_blank" href="<!=link!>" title="<!=title!>"><!=title!></a>' +
				'<div class="feed-entry-date"><!=publishedDate!></div>' + 
				'<div class="feed-entry-content"><!=contentSnippet!></div>' + 
				'</div>'
```

Changelog
---------

**0.4**
- Implemented alternative use of *entryTemplate* and *loadingTemplate* as callback

**v0.3**
- Rewrote templating system

**v0.2**
- Cloned publishedDate property to avoid sorting problems
- Added feed data to entries
 
**v0.1**
- First version
                  
License
-------

Copyright (c) 2012 Camilo Aguilar

Licensed under the MIT and GPL licenses.

Contributing
------------

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

Please don't edit files in the `dist` subdirectory as they are generated via grunt. You'll find source code in the `src` subdirectory!