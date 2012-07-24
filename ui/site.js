$(document).ready(function() {
	
	/* ==================================================================
	   Site scripts
	   ================================================================== */

	/* --------------------------------------------------------------------------
	   Add target _blank to outbound links except github
	   http://stackoverflow.com/questions/5885465/jquery-to-add-blank-to-external-link
	   -------------------------------------------------------------------------- */
	  
	$('a').filter(function() {
		return this.hostname
			&& this.hostname.replace(/^www\./, '') !== location.hostname.replace(/^www\./, '');
	}).attr('target', '_blank');
	
	/* --------------------------------------------------------------------------
	   Track outbound links event
	   -------------------------------------------------------------------------- */
	  
	$(function() {
		$('a').filter(function() {
			return this.hostname && this.hostname.replace(/^www\./, '') !== location.hostname.replace(/^www\./, '');
		}).click(function(e) {
			if (_gaq) {
				_gaq.push(['_trackEvent', 'Outbound Links', 'Click', $(this).attr('href')]);
				
				if ($(this).attr('target') !== '_blank') {
					e.preventDefault();
					
					var href = $(this).attr('href');
					setTimeout(function() {
						document.location = href;
					}, 150);
				}
			}
		});
	});
	
	/* --------------------------------------------------------------------------
	   Demos page behavior
	   -------------------------------------------------------------------------- */
	  
	$('.openCode').click(function(e) {
		e.preventDefault();
		$(this).parent().hide();
		$('.content .code').slideDown();
		
		_gaq.push(['_trackEvent', 'Internal Actions', 'Show code']);
	});
});