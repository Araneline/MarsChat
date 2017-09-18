var shift = false;
var caps = false;

	function lang_change() {
		if($('#en_ru').attr('val') == "ru") {
			$('.en').removeClass('invisible');
			$('.en').addClass('keyboard_row2');
			$('.ru').addClass('invisible');
			$('.ru').removeClass('keyboard_row2');

			$('.en2').removeClass('invisible');
			$('.en2').addClass('keyboard_row');
			$('.ru2').addClass('invisible');
			$('.ru2').removeClass('keyboard_row');
			$('#en_ru').attr('val','en');
		} else {
			$('.ru').removeClass('invisible');
			$('.ru').addClass('keyboard_row2');
			$('.en').addClass('invisible');
			$('.en').removeClass('keyboard_row2');

			$('.ru2').removeClass('invisible');
			$('.ru2').addClass('keyboard_row');
			$('.en2').addClass('invisible');
			$('.en2').removeClass('keyboard_row');
			$('#en_ru').attr('val','ru');
		}
	}

	function cur_caret() {
		el = document.getElementById('inputMessage');
		var val = el.value;
    	return val.slice(0, el.selectionStart).length;
	}
	function setSelectionRange(input, selectionStart, selectionEnd) {
	  if (input.setSelectionRange) {
	    input.focus();
	    input.setSelectionRange(selectionStart, selectionEnd);
	  }
	  else if (input.createTextRange) {
	    var range = input.createTextRange();
	    range.collapse(true);
	    range.moveEnd('character', selectionEnd);
	    range.moveStart('character', selectionStart);
	    range.select();
	  }
	}

	function setCaretToPos (input, pos) {
	  setSelectionRange(input, pos, pos);
	}

	
		$(document).ready(function () {

			init();
			sfs.connect();

			
		$('#userList').perfectScrollbar();
		$('#scrollbar_window').perfectScrollbar({theme: 'message-theme'});			

		$("#send_icon").click(function() {
			onSendPublicMessageBtClick();
		});

		$('#inputMessage').keypress(function(e) {
		    if(e.which == 13) {
				onSendPublicMessageBtClick();
		    }
		});

		$('#toAllButton').click(function(){onToAllClick()});

		document.addEventListener('contextmenu', function(event){event.preventDefault();});

		var headHeight = $('#chatHeader').height();
		$('#chatHeader').css('min-height', headHeight);
		$('#chatHeader_container').css('min-height', headHeight);
		$('#chatHeader').css('max-height', headHeight);
		$('#chatHeader_container').css('max-height', headHeight);

		$('#keyboard_icon').click(function(){
		if ($('#keyboard_container').hasClass('invisible')) {
			//$('#keyboard_container').removeClass('invisible');
			$('#bottom_menu').css('flex','20');
			$('#logo').css('opacity','0');
			setTimeout(function(){$('#keyboard_container').removeClass('invisible')},700);
		} else {
			$('#keyboard_container').addClass('invisible');
			$('#bottom_menu').css('flex','1.5');
			setTimeout(function(){$('#logo').css('opacity','0.3')},700);
		}
	});

	$('.key').click(function(){
		var current_cursor = cur_caret();
		var text = $('#inputMessage').val().slice(0,current_cursor);
		var text2 = $('#inputMessage').val().slice(current_cursor,$('#inputMessage').val().length);
		switch ($(this).attr('id')) {
			case "backspace":
					text = text.slice(0,-1);
					text += text2;
					$('#inputMessage').val(text);
					$("#inputMessage").focus();
					setCaretToPos(document.getElementById("inputMessage"), current_cursor - 1);
				break
			case "enter_low":
				onSendPublicMessageBtClick();
				break
			case "<":
				$("#inputMessage").focus();
				var prev_length = $("#inputMessage").val().length;
				if (current_cursor > 0) {
					setCaretToPos(document.getElementById("inputMessage"), current_cursor - 1);
				}
				break
			case ">":
				$("#inputMessage").focus();
				el = document.getElementById('inputMessage');
				var val = el.value;
    			var current_cursor = val.slice(0, el.selectionStart).length;
				var prev_length = $("#inputMessage").val().length;
				if (current_cursor < val.length) {
					setCaretToPos(document.getElementById("inputMessage"), current_cursor + 1);
				}
				break
			case "shift":
				if ($(this).hasClass('pressed')) {
					shift = false;
					$(".shift").removeClass('pressed');
				} else {
					shift = true;
					$(".shift").addClass('pressed');
				}				
				break
			case "right_shift":
				if ($(this).hasClass('pressed')) {
					shift = false;
					$(".right_shift").removeClass('pressed');
				} else {
					shift = true;
					$(".right_shift").addClass('pressed');
				}			
				break
			case "cl":
				if ($(this).hasClass('pressedCaps')) {
					caps = false;
					$(this).removeClass('pressedCaps');
				} else {
					caps = true;
					$(this).addClass('pressedCaps');
				}				
				break
			case "en_ru":
				lang_change();
				break
			default:
				var clicked = $(':nth-child(1)', this).html();
				if (clicked.length == 1) {
					if ((shift == true) || (caps == true)) {
						clicked = clicked.toUpperCase();
						shift = false;
						if (caps != true) {
							$('.pressed').removeClass('pressed');
						}
					}
					text += clicked + text2;
					$('#inputMessage').val(text);
					$("#inputMessage").focus();
					setCaretToPos(document.getElementById("inputMessage"), current_cursor + 1);
				}
				break
		}
	});

	});