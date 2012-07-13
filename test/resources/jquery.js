/* Taken from  https://github.com/jquery/jquery/blob/master/src/intro.js */

/*jshint evil: true */
(function() {

var parts = document.location.search.slice( 1 ).split( "&" ),
	length = parts.length,
	i = 0,
	current,
	version = "stable",
	file = "http://code.jquery.com/jquery-git.js";

for ( ; i < length; i++ ) {
	current = parts[ i ].split( "=" );
	if ( current[ 0 ] === "jquery" ) {
		version = current[ 1 ];
		break;
	}
}

switch (version) {
	case 'stable':
		file = "http://code.jquery.com/jquery.js";
		break;
		
	case "git":
		file = "http://code.jquery.com/jquery-git.js";
		break;
		
	default:
		file = "http://code.jquery.com/jquery-" + version + ".js";
}

document.write( "<script src='" + file + "'></script>" );

}());