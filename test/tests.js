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

	asyncTest( 'is onComplete called', function( ) {
		timeout.setup( );
		$( '#feeds' ).feeds( {
			feeds: {
				'google': 'http://googleblog.blogspot.com/atom.xml'
			},
			onComplete: function( entries ) {
				ok( true );
				timeout.teardown( );
			}
		} );
	} );

	asyncTest( 'is an unreachable feed properly handled', function( ) {
		timeout.setup( );
		$( '#feeds' ).feeds( {
			feeds: {
				'feed': 'http://thisdoesntexits.wow'
			},
			onComplete: function( entries ) {
				equal( 0, entries.length );
				timeout.teardown( );
			}
		} );
	} );

	asyncTest( 'is context passed to onComplete', function( ) {
		timeout.setup( );
		$( '#feeds' ).feeds( {
			feeds: {
				'google': 'http://googleblog.blogspot.com/atom.xml'
			},
			onComplete: function( entries ) {
				equal( this, $( '#feeds' )[ 0 ] );
				timeout.teardown( );
			}
		} );
	} );
	
	asyncTest( 'is max settings respected', function( ) {
		timeout.setup( );
		$( '#feeds' ).feeds( {
			feeds: {
				'google': 'http://googleblog.blogspot.com/atom.xml'
			},
			max: 3,
			onComplete: function( entries ) {
				equal( entries.length, 3 );
				timeout.teardown( );
			}
		} );
	});
	
	asyncTest( 'is preprocess called', function( ) {
		timeout.setup( );
		$( '#feeds' ).feeds( {
			feeds: {
				'google': 'http://googleblog.blogspot.com/atom.xml'
			},
			max: 1,
			preprocess: function( feed ) {
				ok( true );
				timeout.teardown( );
			}
		} );
	} );

	asyncTest( 'are entries passed to preprocess', function( ) {
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
						
						deepEqual( this, entries[ entryCounter ] );
						entryCounter++;

						if ( entryCounter === entries.length ) {
							timeout.teardown( );
						}
					}
				} );
			}
		} );
	} );
	
	asyncTest( 'is feed data appended to entry', function( ) {
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
							equal( entries[ 0 ][ i ], feedData[ i ], 'property ' + i + ' was appended to entry' );
						}
						
						start( );
					}
				} );
			}
		} );
	});

	asyncTest( 'is data manipulated in preprocess', function( ) {
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
					equal( entries[ i ].foo, 'bar', 'property was added to entry' );
					equal( entries[ i ].title, 'generic', 'entry title was edited' );
				}
				timeout.teardown( );
			}
		} );
	} );

	asyncTest( 'are entries passed to onComplete when loading multiple feeds', function( ) {
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

						deepEqual( entry, expected, 'correct entry passed to onComplete' );
					}

					timeout.teardown( );
				}
			} );
		}
		
		loadEntries1( );
	} );

	asyncTest( 'are multiple feeds entries ordered', function( ) {
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
					ok( currentTime <= prevTime, 'current entry is newer than prevoius one' );
				}
				timeout.teardown( );
			}
		} );

	} );
	
	module( 'loadingTemplate' );

	test( 'is default loading template injected', function( ) {
		$( '#feeds' ).feeds( {
			feeds: {
				'google': 'http://googleblog.blogspot.com/atom.xml?1'
			}
		} );
		equal( $( '#feeds p' ).text( ), 'Loading entries ...' );
	} );

	test( 'is custom loading template injected', function( ) {
		$( '#feeds' ).feeds( {
			feeds: {
				'google': 'http://googleblog.blogspot.com/atom.xml?2'
			},
			loadingTemplate: '<div>my loading template</div>'
		} );
		equal( $( '#feeds div' ).text( ), 'my loading template' );
	} );
	
	test( 'loadingTemplate - as callback', function( ) {
		$( '#feeds' ).feeds( {
			feeds: {
				'google': 'http://googleblog.blogspot.com/atom.xml?3'
			},
			loadingTemplate: function( ) {
				return '<p>from callback</p>';
			}
		} );
		equal( $( '#feeds p' ).text( ), 'from callback' );
	} );
	
	test( 'loadingTemplate - "this" inside callback', function( ) {
		$( '#feeds' ).feeds( {
			feeds: {
				'google': 'http://googleblog.blogspot.com/atom.xml?4'
			},
			ssl: false,
			loadingTemplate: function( ) {
				equal( this.service, 'http://ajax.googleapis.com/ajax/services/feed/load?v=1.0', 'is context passed' );
				return '<p>from callback</p>';
			}
		} );
	} );
	
	module( 'entryTemplate' );
	
	asyncTest( 'feeds container is populated', function( ) {
		timeout.setup( );

		$( '#feeds' ).feeds( {
			feeds: {
				'google': 'http://googleblog.blogspot.com/atom.xml'
			},
			onComplete: function( entries ) {
				ok( $( this ).find( '> * ' ).length > 0, 'feeds container was populated' );
				timeout.teardown( );
			}
		} );
	} );

	asyncTest( 'are all entries passed to onComplete drawn', function( ) {
		timeout.setup( );

		$( '#feeds' ).feeds( {
			feeds: {
				'google': 'http://googleblog.blogspot.com/atom.xml'
			},
			onComplete: function( entries ) {
				equal( $( this ).find( '> *' ).length, entries.length );
				timeout.teardown( );
			}
		} );
	} );

	asyncTest( 'entries passed to onComplete correspond to entries drawn in feeds container', function( ) {
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
						'entry passed to onCompleted corrsponds to injected entry' );
					}
				} );
				timeout.teardown( );
			}
		} );
	} );

	asyncTest( 'is custom entry template used', function( ) {
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
						equal( $( this ).text( ), entries[ i ].title, 'entry was drawn using the custom template' );
					}
				} );

				timeout.teardown( );
			}
		} );
	} );

	asyncTest( 'are custom properties injected to custom entry template', function( ) {
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
						equal( $( this ).text( ), 'bar', 'custom property was drawn' );
					}
				} );

				timeout.teardown( );
			}
		} );
	} );

	asyncTest( 'are unrecognized properties stripped from entry tempate', function( ) {
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
						equal( $( this ).text( ), '', 'empty properties were stripped' );
					}
				} );

				timeout.teardown( );
			}
		} );
	} );
	
	asyncTest( 'entryTemplate - control structures', function( ) {
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
	
	asyncTest( 'entryTemplate - external template', function( ) {
		timeout.setup( );
		
		$( '#feeds' ).feeds( {
			feeds: {
				'google': 'http://googleblog.blogspot.com/atom.xml'
			},
			max: 1,
			entryTemplate:	'tmplTest',
			onComplete: function( entries ) {
				equal( $( '#feeds p' ).text( ), entries[ 0 ].title, 'is rendered title equal to entry title' );

				timeout.teardown( );
			}
		} );
	} );
	
	asyncTest( 'entryTemplate - as callback', function( ) {
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
				equal( $( '#feeds p' ).text( ), entries[ 0 ].title, 'is rendered title equal to entry title' );
				timeout.teardown( );
			}
		} );
	} );
	
	asyncTest( 'entryTemplate - "this" inside callback', function( ) {
		timeout.setup( );
		
		$( '#feeds' ).feeds( {
			feeds: {
				'google': 'http://googleblog.blogspot.com/atom.xml'
			},
			max: 1,
			ssl: false,
			entryTemplate:	function( entry ) {
				equal( this.service, 'http://ajax.googleapis.com/ajax/services/feed/load?v=1.0', 'is context passed' );
				return '<p>' + entry.title + '</p>';
			},
			onComplete: function( entries ) {
				timeout.teardown( );
			}
		} );
	} );
	
	module( 'ssl' );
	
	asyncTest( 'ssl - autodetect', function( ) {
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

				equal( protocol, this.service.substr( 0, protocol.length ), 'do protocols match' );
				
				timeout.teardown( );
			}
		} );
	} );
	
	asyncTest( 'ssl - force true', function( ) {
		timeout.setup( );
		
		$( '#feeds' ).feeds( {
			feeds: {
				'google': 'http://googleblog.blogspot.com/atom.xml'
			},
			max: 1,
			ssl: true,
			entryTemplate: function( entry ) {

				equal( 'https:', this.service.substr( 0, 'https:'.length ), 'do protocols match' );
				timeout.teardown( );
			}
		} );
	} );
	
	asyncTest( 'ssl - force false', function( ) {
		timeout.setup( );
		
		$( '#feeds' ).feeds( {
			feeds: {
				'google': 'http://googleblog.blogspot.com/atom.xml'
			},
			max: 1,
			ssl: false,
			entryTemplate: function( entry ) {

				equal( 'http:', this.service.substr( 0, 'http:'.length ), 'do protocols match' );
				timeout.teardown( );
			}
		} );
	} );

}( jQuery ) );
