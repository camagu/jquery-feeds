/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false*/
/*global start:false, stop:false ok:false, equal:false, notEqual:false, deepEqual:false*/
/*global notDeepEqual:false, strictEqual:false, notStrictEqual:false, raises:false*/
( function( $ ) {
	
	var timeout = {
		to: null,
		setup: function( ) {
			this.to = setTimeout( function( ) {
				ok( false, 'Timed out' );
				start( );
			}, 10000 );
		},
		teardown: function( ) {
			clearTimeout( this.to );
			start( );
		}
	}
	
	module( 'feeds' );

	asyncTest( 'onComplete callback', function( ) {
		timeout.setup( );
		$( '#feeds' ).feeds( {
			feeds: {
				'google': 'http://googleblog.blogspot.com/atom.xml'
			},
			onComplete: function( entries ) {
				ok( true, 'was onComplete called' );
				timeout.teardown( );
			}
		} );
	} );

	asyncTest( 'unreachable feed', function( ) {
		timeout.setup( );
		$( '#feeds' ).feeds( {
			feeds: {
				'feed': 'http://thisdoesntexits.wow'
			},
			onComplete: function( entries ) {
				equal( 0, entries.length, 'was unreachable feed handled' );
				timeout.teardown( );
			}
		} );
	} );

	asyncTest( 'onComplete context', function( ) {
		timeout.setup( );
		$( '#feeds' ).feeds( {
			feeds: {
				'google': 'http://googleblog.blogspot.com/atom.xml'
			},
			onComplete: function( entries ) {
				equal( this, $( '#feeds' )[ 0 ], 'was feeds container passed as context to onComplete' );
				timeout.teardown( );
			}
		} );
	} );
	
	asyncTest( 'max', function( ) {
		timeout.setup( );
		$( '#feeds' ).feeds( {
			feeds: {
				'google': 'http://googleblog.blogspot.com/atom.xml'
			},
			max: 3,
			onComplete: function( entries ) {
				equal( entries.length, 3, 'was "max" option respected' );
				timeout.teardown( );
			}
		} );
	});
	
	asyncTest( 'preprocess callback', function( ) {
		timeout.setup( );
		$( '#feeds' ).feeds( {
			feeds: {
				'google': 'http://googleblog.blogspot.com/atom.xml'
			},
			max: 1,
			preprocess: function( feed ) {
				ok( true, 'was preprocess called' );
				timeout.teardown( );
			}
		} );
	} );

	asyncTest( 'preprocess entries', function( ) {
		timeout.setup( );
		$.ajax( {
			url: 'https://ajax.googleapis.com/ajax/services/feed/load?v=1.0',
			dataType: 'jsonp',
			data: {
				q: 'http://googleblog.blogspot.com/atom.xml',
				num: -1
			},
			success: function( data ) {
				var entries = data.responseData.feed.entries;
				var entryCounter = 0;

				expect( entries.length );

				$( '#feeds' ).feeds( {
					feeds: {
						'google': 'http://googleblog.blogspot.com/atom.xml'
					},
					preprocess: function( feed ) {
						entries[ entryCounter ].source = this.source;
						entries[ entryCounter ].publishedDateRaw = this.publishedDateRaw;
						entries[ entryCounter ].feedUrl = data.responseData.feed.feedUrl;
						entries[ entryCounter ].feedTitle = data.responseData.feed.title;
						entries[ entryCounter ].feedLink = data.responseData.feed.link;
						entries[ entryCounter ].feedDescription = data.responseData.feed.description;
						entries[ entryCounter ].feedAuthor = data.responseData.feed.author;
						
						deepEqual( this, entries[ entryCounter ], 'was the entry passed to preprocess equal to the one passed by the service' );
						entryCounter++;

						if ( entryCounter === entries.length ) {
							timeout.teardown( );
						}
					}
				} );
			}
		} );
	} );
	
	asyncTest( 'feed properties', function( ) {
		timeout.setup( );
		$.ajax( {
			url: 'https://ajax.googleapis.com/ajax/services/feed/load?v=1.0',
			dataType: 'jsonp',
			data: {
				q: 'http://googleblog.blogspot.com/atom.xml',
				num: 1
			},
			success: function( data ) {
				timeout.teardown( );
				
				var properties = [ 'feedUrl', 'title', 'link', 'description', 'author' ];
				for ( var i in properties ) {
					if ( typeof data.responseData.feed[ properties[ i ] ] === 'undefined' ) {
						ok( false, 'Propery ' + properties[ i ] + ' is not defined' );
						start( );
						return;
					}
				}
				
				var feedData = {
					feedUrl: data.responseData.feed.feedUrl,
					feedTitle: data.responseData.feed.title,
					feedLink: data.responseData.feed.link,
					feedDescription: data.responseData.feed.description,
					feedAuthor: data.responseData.feed.author
				};
				
				$( '#feeds' ).feeds( {
					feeds: {
						'google': 'http://googleblog.blogspot.com/atom.xml'
					},
					max: 1,
					onComplete: function( entries ) {
						if ( typeof entries[ 0 ] === 'undefined' ) {
							ok( false, 'No entries loaded' );
							start( );
						}

						expect( feedData.length );
						for ( var i in feedData ) {
							equal( entries[ 0 ][ i ], feedData[ i ], 'was property ' + i + ' appended to entry' );
						}
						
						start( );
					}
				} );
			}
		} );
	});

	asyncTest( 'entry manipulation on preprocess', function( ) {
		timeout.setup( );
		$( '#feeds' ).feeds( {
			feeds: {
				'google': 'http://googleblog.blogspot.com/atom.xml'
			},
			preprocess: function( feed ) {
				this.foo = 'bar';
				this.title = 'generic';
			},
			onComplete: function( entries ) {
				expect( entries.length * 2 );
				for ( var i in entries ) {
					equal( entries[ i ].foo, 'bar', 'was property added to entry' );
					equal( entries[ i ].title, 'generic', 'was entry title edited' );
				}
				timeout.teardown( );
			}
		} );
	} );

	asyncTest( 'multiple feeds entries passed to onComplete', function( ) {
		timeout.setup( );
		
		var entries1 = {};
		var entries2 = {};

		function loadEntries1( ) {
			$.ajax( {
				url: 'https://ajax.googleapis.com/ajax/services/feed/load?v=1.0',
				dataType: 'jsonp',
				data: {
					q: 'http://googleblog.blogspot.com/atom.xml',
					num: -1
				},
				success: function( data ) {
					entries1 = data.responseData.feed.entries;
					for ( var i in entries1 ) {
						entries1[ i ].source = 'feed1';
						entries1[ i ].publishedDateRaw = entries1[ i ].publishedDate;
						entries1[ i ].feedUrl = data.responseData.feed.feedUrl;
						entries1[ i ].feedTitle = data.responseData.feed.title;
						entries1[ i ].feedLink = data.responseData.feed.link;
						entries1[ i ].feedDescription = data.responseData.feed.description;
						entries1[ i ].feedAuthor = data.responseData.feed.author;
					}
					loadEntries2( );
				}
			} );
		}

		function loadEntries2( ) {
			$.ajax( {
				url: 'https://ajax.googleapis.com/ajax/services/feed/load?v=1.0',
				dataType: 'jsonp',
				data: {
					q: 'http://blog.jquery.com/feed/',
					num: -1
				},
				success: function( data ) {
					entries2 = data.responseData.feed.entries;
					for ( var i in entries2 ) {
						entries2[ i ].source = 'feed2';
						entries2[ i ].publishedDateRaw = entries2[ i ].publishedDate;
						entries2[ i ].feedUrl = data.responseData.feed.feedUrl;
						entries2[ i ].feedTitle = data.responseData.feed.title;
						entries2[ i ].feedLink = data.responseData.feed.link;
						entries2[ i ].feedDescription = data.responseData.feed.description;
						entries2[ i ].feedAuthor = data.responseData.feed.author;
					}
					loadFeeds( );
				}
			} );
		}

		function loadFeeds( ) {
			$( '#feeds' ).feeds( {
				feeds: {
					'feed1': 'http://googleblog.blogspot.com/atom.xml',
					'feed2': 'http://blog.jquery.com/feed/'
				},
				onComplete: function( entries ) {
					expect( entries1.length + entries2.length );

					var feed1Pointer = 0;
					var feed2Pointer = 0;

					for ( var i in entries ) {
						var entry = entries[ i ];
						
						var expected = null;
						if ( entry.source === 'feed1' ) {
							expected = entries1[ feed1Pointer ];
							feed1Pointer++;
						} else {
							expected = entries2[ feed2Pointer ];
							feed2Pointer++;
						}

						deepEqual( entry, expected, 'was the correct entry passed to onComplete' );
					}

					timeout.teardown( );
				}
			} );
		}
		
		loadEntries1( );
	} );

	asyncTest( 'multiple feeds entries sort', function( ) {
		timeout.setup( );
		$( '#feeds' ).feeds( {
			feeds: {
				'feed1': 'http://googleblog.blogspot.com/atom.xml',
				'feed2': 'http://blog.jquery.com/feed/'
			},
			onComplete: function( entries ) {
				expect( entries.length - 1 );
				for ( var i in entries ) {
					if ( parseInt( i, 10 ) === 0 ) {
						continue;
					}

					var currentTime = new Date( entries[ i ].publishedDateRaw ).getTime( );
					var prevTime = new Date( entries[ i - 1 ].publishedDateRaw ).getTime( );
					ok( currentTime <= prevTime, 'is current entry newer than prevoius one' );
				}
				timeout.teardown( );
			}
		} );

	} );
	
	module( 'loadingTemplate' );

	test( 'default', function( ) {
		$( '#feeds' ).feeds( {
			feeds: {
				'google': 'http://googleblog.blogspot.com/atom.xml?1'
			}
		} );
		equal( $( '#feeds p' ).text( ), 'Loading entries ...', 'was default loading template injected' );
	} );

	test( 'custom', function( ) {
		$( '#feeds' ).feeds( {
			feeds: {
				'google': 'http://googleblog.blogspot.com/atom.xml?2'
			},
			loadingTemplate: '<div>my loading template</div>'
		} );
		equal( $( '#feeds div' ).text( ), 'my loading template', 'was custom template injected' );
	} );
	
	test( 'as callback', function( ) {
		$( '#feeds' ).feeds( {
			feeds: {
				'google': 'http://googleblog.blogspot.com/atom.xml?3'
			},
			loadingTemplate: function( ) {
				return '<p>from callback</p>';
			}
		} );
		equal( $( '#feeds p' ).text( ), 'from callback', 'was callback for loading template called' );
	} );
	
	test( 'context in callback', function( ) {
		$( '#feeds' ).feeds( {
			feeds: {
				'google': 'http://googleblog.blogspot.com/atom.xml?4'
			},
			ssl: false,
			loadingTemplate: function( ) {
				equal( this.service, 'http://ajax.googleapis.com/ajax/services/feed/load?v=1.0', 'was context passed to loading template context' );
				return '<p>from callback</p>';
			}
		} );
	} );
	
	module( 'entryTemplate' );
	
	asyncTest( 'populating feeds container', function( ) {
		timeout.setup( );

		$( '#feeds' ).feeds( {
			feeds: {
				'google': 'http://googleblog.blogspot.com/atom.xml'
			},
			onComplete: function( entries ) {
				ok( $( this ).find( '> * ' ).length > 0, 'was feeds container populated' );
				timeout.teardown( );
			}
		} );
	} );

	asyncTest( 'render entries', function( ) {
		timeout.setup( );

		$( '#feeds' ).feeds( {
			feeds: {
				'google': 'http://googleblog.blogspot.com/atom.xml'
			},
			onComplete: function( entries ) {
				equal( $( this ).find( '> *' ).length, entries.length, 'where all entries rendered' );
				timeout.teardown( );
			}
		} );
	} );

	asyncTest( 'rendered entries properties', function( ) {
		timeout.setup( );
		$( '#feeds' ).feeds( {
			feeds: {
				'google': 'http://googleblog.blogspot.com/atom.xml'
			},
			onComplete: function( entries ) {
				expect( $( '.feeds-entry' ).length );
				$( '.feeds-entry' ).each( function( i ) {
					if ( typeof entries[ i ] === 'undefined' ) {
						ok( false );
					} else {
						ok(
							$( this ).find( '.feed-entry-title' ).text( ) === entries[ i ].title &&
							$( this ).find( '.feed-entry-title' ).attr( 'href' ) === entries[ i ].link &&
							$( this ).find( '.feed-entry-date' ).text( ) === entries[ i ].publishedDate &&
							$( this ).find( '.feed-entry-content' ).text( ) === $( '<div />' ).html( entries[ i ].contentSnippet ).text( ),
						'do entry passed to onCompleted corresponds to rendered one' );
					}
				} );
				timeout.teardown( );
			}
		} );
	} );

	asyncTest( 'custom template', function( ) {
		timeout.setup( );
		$( '#feeds' ).feeds( {
			feeds: {
				'google': 'http://googleblog.blogspot.com/atom.xml'
			},
			entryTemplate: '<p><!=title!></p>',
			onComplete: function( entries ) {
				expect( $( '#feeds > p' ).length );
				$( '#feeds > p' ).each( function( i ) {
					if ( typeof entries[ i ] === 'undefined' ) {
						ok( false, 'entry is not defined' );
					} else {
						equal( $( this ).text( ), entries[ i ].title, 'was entry rendered using the custom template' );
					}
				} );

				timeout.teardown( );
			}
		} );
	} );

	asyncTest( 'render custom entry properties', function( ) {
		timeout.setup( );
		$( '#feeds' ).feeds( {
			feeds: {
				'google': 'http://googleblog.blogspot.com/atom.xml'
			},
			entryTemplate: '<p><!=foo!></p>',
			preprocess: function( ) {
				this.foo = 'bar';
			},
			onComplete: function( entries ) {
				expect( $( '#feeds > p' ).length );
				$( '#feeds > p' ).each( function( i ) {
					if ( typeof entries[ i ] === 'undefined' ) {
						ok( false, 'entry is not defined' );
					} else {
						equal( $( this ).text( ), 'bar', 'was custom property rendered' );
					}
				} );

				timeout.teardown( );
			}
		} );
	} );

	asyncTest( 'ignore unrecognized properties', function( ) {
		timeout.setup( );
		$( '#feeds' ).feeds( {
			feeds: {
				'google': 'http://googleblog.blogspot.com/atom.xml'
			},
			entryTemplate: '<p><!=foo!></p>',
			onComplete: function( entries ) {
				expect( $( '#feeds > p' ).length );
				$( '#feeds > p' ).each( function( i ) {
					if ( typeof entries[ i ] === 'undefined' ) {
						ok( false, 'entry is not defined' );
					} else {
						equal( $( this ).text( ), '', 'was unrecognized property ignored' );
					}
				} );

				timeout.teardown( );
			}
		} );
	} );
	
	asyncTest( 'control structures', function( ) {
		timeout.setup( );

		$( '#qunit-fixture' ).append( '<div id="feeds" />' );
		$( '#feeds' ).feeds( {
			feeds: {
				'google': 'http://googleblog.blogspot.com/atom.xml',
				'jquery': 'http://blog.jquery.com/feed/'
			},
			max: 1,
			entryTemplate:	'<div><! if ( source !== "google" ) { !>' +
								'<p class="message">not google</p>' +
							'<! } else if ( source === "google" ) { !>' +
								'<p class="message">is google</p>' +
							'<! } !><ul class="categories">' +
							'<! for ( var i in categories) { !>' +
								'<li><!= categories[ i ] !></li>' +
							'<! } !></ul></div>',
			onComplete: function( entries ) {
				expect( 4 );
				
				$( '#feeds > div' ).each( function( i ) {
					var shouldEqual = entries[ i ].source === 'google' ? 'is google' : 'not google';
					equal( $( this ).find( '.message' ).text( ), shouldEqual, 'was conditional used' );
					
					var categories = [];
					$( this ).find( '.categories li' ).each( function( ) {
						categories.push( $( this ).text() );
					});
					deepEqual( categories, entries[ i ].categories, 'was loop used' );
				} );

				timeout.teardown( );
			}
		} );
	} );
	
	asyncTest( 'external template', function( ) {
		timeout.setup( );
		
		$( '#feeds' ).feeds( {
			feeds: {
				'google': 'http://googleblog.blogspot.com/atom.xml'
			},
			max: 1,
			entryTemplate:	'tmplTest',
			onComplete: function( entries ) {
				equal( $( '#feeds p' ).text( ), entries[ 0 ].title, 'was rendered title equal to entry title' );

				timeout.teardown( );
			}
		} );
	} );
	
	asyncTest( 'as callback', function( ) {
		timeout.setup( );
		
		$( '#feeds' ).feeds( {
			feeds: {
				'google': 'http://googleblog.blogspot.com/atom.xml'
			},
			max: 1,
			entryTemplate:	function( entry ) {
				return '<p>' + entry.title + '</p>';
			},
			onComplete: function( entries ) {
				equal( $( '#feeds p' ).text( ), entries[ 0 ].title, 'was rendered title equal to entry title' );
				timeout.teardown( );
			}
		} );
	} );
	
	asyncTest( 'context in callback', function( ) {
		timeout.setup( );
		
		$( '#feeds' ).feeds( {
			feeds: {
				'google': 'http://googleblog.blogspot.com/atom.xml'
			},
			max: 1,
			ssl: false,
			entryTemplate:	function( entry ) {
				equal( this.service, 'http://ajax.googleapis.com/ajax/services/feed/load?v=1.0', 'was context passed' );
				return '<p>' + entry.title + '</p>';
			},
			onComplete: function( entries ) {
				timeout.teardown( );
			}
		} );
	} );
	
	module( 'ssl' );
	
	asyncTest( 'auto', function( ) {
		timeout.setup( );

		$( '#feeds' ).feeds( {
			feeds: {
				'google': 'http://googleblog.blogspot.com/atom.xml'
			},
			max: 1,
			entryTemplate: function( entry ) {
				var protocol = this.settings.ssl === 'auto' ? document.location.protocol : this.settings.ssl ? 'https:' : 'http:';
				if ( $.inArray( protocol, [ 'http:', 'https:' ]) === -1 ) {
					protocol = 'https:';
				}

				equal( protocol, this.service.substr( 0, protocol.length ), 'did protocols matched' );
				
				timeout.teardown( );
			}
		} );
	} );
	
	asyncTest( 'true', function( ) {
		timeout.setup( );
		
		$( '#feeds' ).feeds( {
			feeds: {
				'google': 'http://googleblog.blogspot.com/atom.xml'
			},
			max: 1,
			ssl: true,
			entryTemplate: function( entry ) {

				equal( 'https:', this.service.substr( 0, 'https:'.length ), 'did protocols matched' );
				timeout.teardown( );
			}
		} );
	} );
	
	asyncTest( 'false', function( ) {
		timeout.setup( );
		
		$( '#feeds' ).feeds( {
			feeds: {
				'google': 'http://googleblog.blogspot.com/atom.xml'
			},
			max: 1,
			ssl: false,
			entryTemplate: function( entry ) {
				equal( 'http:', this.service.substr( 0, 'http:'.length ), 'did protocols matched' );
				timeout.teardown( );
			}
		} );
	} );

}( jQuery ) );
