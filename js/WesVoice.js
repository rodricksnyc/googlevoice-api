$(document).ready(function () {

	var currentPlaying, inputObj = {
		chargeNo: '',
		fileName: '',
		txtInput: '',
		fileType: 'MP3',
		lang: '',
		gender: '',
		certified: false,
		speakingRate : '1'
	}, missingFields = [];

	_.forEach(voiceList, (r, i) => {
		var li = `<li class="li-voice-item" value="${r.name}" title="Preview">${r.name}<br>
						<span class="span-human-lang">${r.ssmlGender}</span>
						<span class="span-play-btn" role="button"><img class="img-play-btn" src="src/play-circle-regular.svg" alt=""  title="Play"/><img class="img-pause-btn" src="src/pause-circle-solid.svg" alt=""  title="Pause"/></span>
						<span class="span-select-btn" role="button" title="Select Voice">Select</span>
						<img class="img-check-mark" src="src/icon_check.svg" alt="" title="Selected"/>
				  </li>`
		if (Number(i) % 2 == 0) {
			$('.ul-voice-list.col-1').append(li);
		} else {
			$('.ul-voice-list.col-2').append(li);
		}
	});

	$('.span-more').on('click', function () {
		$('.d-voice-selector').css({ height: "412px" });
		scrollPage('.d-voice');
		$(this).hide();
		$('.span-less').show();
	})

	$('.span-less').on('click', function () {
		$('.d-voice-selector').css({ height: "242px" });
		$(this).hide();
		$('.span-more').show();
	})

	function validateSubmit() {

		$('.p-final-warning-msg').html('<span class="f-600">An error occurred during form validation</span>, please see below:<br>');
		missingFields = [];


		if (inputObj.lang === '') {
			$('.p-final-warning-msg').append('Missing voice type<br>');
			missingFields.push('Input text');
		}

		if ($('.input-charge-no').val().length < 1) {
			$('.p-final-warning-msg').append('Missing charge number<br>');
			missingFields.push('Charge number, ');
		} else if (!$.isNumeric($('.input-charge-no').val())) {
			$('.p-final-warning-msg').append('Only numbers are allowed as Charge number<br>');
			missingFields.push('Charge number, ');
		} else {
			inputObj.chargeNo = $('.input-charge-no').val();
		}

		if ($('.input-file-name').val().length < 1) {
			$('.p-final-warning-msg').append('Missing file name<br>');
			missingFields.push('File name, ');
		} else if ($('.input-file-name').val().indexOf('.mp3') > -1 || $('.input-file-name').val().indexOf('.wav') > -1) {
			$('.p-final-warning-msg').append('Enter file name without any extensions<br>');
			missingFields.push('File name, ');
		} {
			inputObj.fileName = $('.input-file-name').val();
		}

		if ($('.input-text').val().length < 1) {
			$('.p-final-warning-msg').append('Missing input text<br>');
			missingFields.push('Input text, ');
		} else {
			inputObj.txtInput = $('.input-text').val();
		}

		if (inputObj.fileType === '') {
			$('.p-final-warning-msg').append('Missing file type');
			missingFields.push('File type');
		}

		if (missingFields.length > 0) {
			$('.p-final-warning-msg').show().addClass('fadeIn');
			inputObj.certified = false;
			return false;
		} else {
			inputObj.certified = true;
			return true;
		}
	}

	function showSuccessMsg() {
		$('.d-success').addClass('show').css({ height: window.innerHeight });
	}

	function API(v) {
		$('.p-final-error-msg').addClass('t-wesblue').show().text('Downloading...!! The time to download the audio file takes 1 - 9 seconds depending on the character count.');
		$.ajax(v).done(function (response) {
			if (response.audioContent) {
				saveAs(`data:audio/wav;base64,${response.audioContent}`, `${inputObj.fileName}.${inputObj.fileType}`);
				resetFields();
				showSuccessMsg();
				$('.p-final-error-msg').hide();
			}
		}).fail(function(error){
			resetFields();
			$('.p-final-error-msg').removeClass('t-wesblue').show().text('An error occured. Please try again !!');
			setTimeout(function(){
				$('.p-final-error-msg').hide();
			}, 2000)
		});
	}

	function resetFields() {
		$('.span-select-btn').each(function () {
			$(this).next().css({ visibility: 'hidden', opacity: '0' })
			$(this).show();
			inputObj.lang = '';
			$(this).parent().removeClass('selected bounceIn');
		});
		$('.input-charge-no').val('');
		$('.input-file-name').val('');
		$('.input-text').val('');
		$('.span-clear').removeClass('t-teal');
		$('.span-char-count').removeClass('red yellow').html(`0/5000 characters`);
		$('.span-mp3-btn, .span-wav-btn').removeClass('selected');
		$('.control input[type="checkbox"]').prop('checked', false);
		$('.control').css({ color: '#007e9d' });
		$('.control__indicator').css({ borderColor: '#007e9d' });
		$('.span-submit-btn').attr('status', 'disabled').html(`<img src="src/Rolling-0.8s-127px" class="img-loader">Submit`);
		inputObj = {
			chargeNo: '',
			fileName: '',
			txtInput: '',
			fileType: '',
			lang: '',
			gender: '',
			certified: false
		};
	}

	$('.span-submit-btn').on('click', function (e) {
		if ($(this).attr('status') === "active") {
			var ro = inputObj;
			if (ro.certified) {
				var settings = {
					"async": true,
					"crossDomain": true,
					"url": "https://texttospeech.googleapis.com/v1/text:synthesize",
					"method": "POST",
					"headers": {
						"x-goog-api-key": "AIzaSyAtzxAtTS9WuIZfwhuS-UuZ_Szz_NUEOps",
						"content-type": "application/json",
						"cache-control": "no-cache",
					},
					"processData": false,
					"data": `{'input':{'text':'${(ro.txtInput).replace(/[^\w\s]/gi, '')}'}, 'voice':{'languageCode':'${(ro.lang).substring(0, 5)}','name':'${ro.lang}','ssmlGender':'${ro.gender}'},'audioConfig':{'audioEncoding':'${ro.fileType}', 'speakingRate': ${ro.speakingRate}}}`
				};
				inputObj.fileType = inputObj.fileType === "MP3" ? "mp3" : "wav";
				$(this).attr('status', 'loading').html(`<img src="src/Rolling-0.8s-127px" class="img-loader"\>`);
				$('.a-background').remove();
				API(settings);
			} else {
				window.alert('An error occurred, please try after reloading this page.')
				e.preventDefault();
				return false;
			}
		} else {
			e.preventDefault();
			return false;
		}
	})

	$('.control input[type="checkbox"]').change(function (e) {
		if (!validateSubmit()) {
			$(this).prop('checked', false);
			e.preventDefault();
		}
		else {
			$('.span-submit-btn').attr('status', 'active');
			$('.p-final-warning-msg').hide();
			if ($(this).is(':checked')) {
				$('.control').css({ color: '#006837' });
				$('.control__indicator').css({ borderColor: '#006837' })
			} else {
				$('.control').css({ color: '#007e9d' });
				$('.control__indicator').css({ borderColor: '#007e9d' })
			}
		}
	})

	$('.input-text').on('focus', function () {
		$('.span-char-count').css({ top: '-1px' });
	})

	$('.input-text').on('blur', function () {
		if ($(this).val().length < 1) {
			$(this).addClass('required');
		} else {
			$(this).removeClass('required');
		}
		$('.span-char-count').css({ top: '0px' });
	})

	$('input[type="text"]').on('blur', function () {
		if ($(this).val().length < 1) {
			$(this).addClass('required');
		} else {
			$(this).removeClass('required');
		}
	})

	$('.input-charge-no, .input-file-name, .input-text').on('input', function () {
		if (inputObj.certified) {
			$('.control input[type="checkbox"]').prop('checked', false);
			$('.control').css({ color: '#007e9d' });
			$('.control__indicator').css({ borderColor: '#007e9d' });
			$('.span-submit-btn').attr('status', 'disabled');
		}
	})

	$('.input-text').on('input', function () {
		var inputTxtLength = $(this).val().length;
		$('.span-char-count').text(`${inputTxtLength}/5000 characters`);

		if (inputTxtLength == 0) {
			$('.span-clear').removeClass('t-teal');
			$('.span-char-count').removeClass('red yellow')
			return;
		}
		if (inputTxtLength > 0 && inputTxtLength <= 4500) {
			$('.span-clear').addClass('t-teal');
			$('.span-char-count').removeClass('red yellow')
		} else if (inputTxtLength > 4500 && inputTxtLength <= 4800) {
			$('.span-char-count').removeClass('red').addClass('yellow');
		} else {
			$('.span-char-count').removeClass('yellow').addClass('red');
		}
	})

	$('.span-clear').click(function () {
		$('.input-text').val('');
		$('.span-char-count').text(`0/5000 characters`);
		$('.span-char-count').removeClass('red yellow');
	})

	function scrollPage(e) {
		var $target = $(e), offSet = $target.offset().top - 20;
		$('html, body').stop().animate({
			'scrollTop': offSet
		}, 1200, 'swing');
	}

	var snd, src1;

	function initPreview(el) {

		var self = el;

		var Sound = function (src, name) {
			src1 = src;

			function pauseAtEnd() {
				$(currentPlaying).css({ left: "0px" });
				$(currentPlaying).next().css({ left: "32px" });
				currentPlaying = "";
			}

			if (snd) {
				snd.pause();
				pauseAtEnd();
			}
			snd = new Audio(src);
			snd.addEventListener("ended", function () {
				pauseAtEnd();
			});
		};

		var firstS = new Promise(
			function (resolve, reject) {
				var picked = _.pickBy(voiceList, (l) => {
					if (l.name === $(self).parent().parent().attr('value')) {
						return l;
					}
				})
				if (!!picked) {
					resolve(picked);
				} else {
					reject('An error occurred')
				}
			})

		var secondS = firstS.then(function (r, e) {
			if (!e) {
				var node = _.values(r)[0];
				Sound(`data:audio/wav;base64,${node.audioContent}`, node.name)
			}
		})

		secondS.then(function () {
			var playPromise = snd.play();
			if (playPromise !== undefined) {
				playPromise.then(_ => {
					currentPlaying = self;
				})
					.catch(error => {
						window.alert("An error occurred. Please try again.")
					});
			}
		})
	}

	$('.img-play-btn').on('click', function () {
		$(this).css({ left: "-32px" });
		$(this).next().css({ left: "0px" });
		initPreview(this);
	})

	$('.img-pause-btn').on('click', function (e) {
		if (snd) {
			snd.pause();
			currentPlaying = "";
			$(this).css({ left: "32px" });
			$(this).prev().css({ left: "0px" });
		} else {
			e.preventDefault();
		}
	})

	$('.span-select-btn').on('click', function () {
		$('.span-select-btn').each(function () {
			$(this).next().css({ visibility: 'hidden', opacity: '0' })
			$(this).show();
			inputObj.lang = '';
			$(this).parent().removeClass('selected bounceIn');
		})
		$(this).hide();
		$(this).next().css({ visibility: 'visible', opacity: '1' });
		inputObj.lang = $(this).parent().attr('value');
		inputObj.gender = $(this).parent().find('.span-human-lang').text();
		$(this).parent().addClass('selected animated bounceIn');
	})

	$('.span-mp3-btn, .span-wav-btn').on('click', function (e) {
		$('.span-mp3-btn, .span-wav-btn').removeClass('selected');
		if ($(this).hasClass('selected')) {
			e.preventDefault();
		} else {
			$(this).toggleClass('selected');
			inputObj.fileType = $(this).attr('value');
		}
	});

	$('.span-speed-btn').on('click', function (e) {
		$('.span-speed-btn').removeClass('selected');
		if ($(this).hasClass('selected')) {
			e.preventDefault();
		} else {
			$(this).toggleClass('selected');
			inputObj.speakingRate = $(this).attr('value');
		}
	});

	$('.d-success .span-close').on('click', function () {
		$('.d-success').removeClass('show');
	})
})