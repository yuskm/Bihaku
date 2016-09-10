function speech(element) {
    this.element  = element;
    this.recognition = null;
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

	if( !window.SpeechRecognition ) {
		alert( 'お使いのブラウザでは、Speech APIがサポートされていません。' );;
	} else {
        this.recognition = new window.SpeechRecognition();
		this.recognition.onerror = function( event ) {
/**/        logWrite( 'ERROR:' + event.error );
		}

        var thisObj = this; // for callback

		this.recognition.onstart =
		this.recognition.onend =
		this.recognition.onaudiostart =
		this.recognition.onaudioend =
		this.recognition.onsoundstart =
		this.recognition.onsoundend =
		this.recognition.onspeechstart =
		this.recognition.onspeechend = function( event ) {
/**/        logWrite( 'EVENT:' + event.type );
			if( event.type == 'end' ) {
				thisObj.element['recognition'].disabled = false;
			}
		}

		this.recognition.onnomatch =
        this.recognition.onresult = function( event ) {
			if( 0 < event.results.length ) {
				var alternative = event.results[ 0 ][ 0 ];
/**/            logWrite( 'TEXT:' + alternative.transcript );
/**/            logWrite( 'CONF:' + alternative.confidence );
                /* 入力音声を使って処理したいことを以下にかく。 */
			}
		}
	}
}

speech.prototype.recongitionStart = function() {
/**/logWrite( 'recognition start' );
    this.element['recognition'].disabled = true;
    speech.recognition.start();
}
