import { APPNAME } from './stats';
import './select-langs';

let srEnable = false;
let srActivated = false;
let mediaRecorder = null;

const template = document.createElement("template");
template.innerHTML = `
  <style>
    *,
    ::before,
    ::after {
      box-sizing: border-box;
    }

    :host {
      contain: content;
      display: block;
    }

    :host([hidden]) {
      display: none;
    }

    .${APPNAME}-wrapper {
      display: flex;
      flex-direction: column;
      width: 50vw;
      height: 100vh;
    }

    .${APPNAME}-wrapper .ta,
    .${APPNAME}-wrapper .buttons {
      margin-bottom: 2em;
    }
  </style>

  <div class="${APPNAME}-wrapper">
    <textarea id="speechInputContent" cols="50" rows="10" class="ta"></textarea>
    <select-langs></select-langs>
    <label for="recordToggle">
      <input type="checkbox" id="recordToggle" />recording while speech recognize
    </label>
    <div class="buttons">
      <button id="speechStart" class="btn">start</button>
      <button id="speechStop" class="btn">stop</button>
    </div>
    <audio id="player" controls></audio>
  </div>`;

class SpeechRecognitionToTextarea extends HTMLElement {
  constructor() {
    super();
    this._initializeDOM();
  }

  _initializeDOM() {
    const shadowRoot = this.attachShadow({ mode: "closed" });
    shadowRoot.appendChild(template.content.cloneNode(true));

    // get DOM references
    this.startBtn = shadowRoot.querySelector("#speechStart");
    this.stopBtn = shadowRoot.querySelector("#speechStop");
    this.textArea = shadowRoot.querySelector("#speechInputContent");
    this.checkbox = shadowRoot.querySelector("#recordToggle");
    this.audio = shadowRoot.querySelector("#player");

    this.select = shadowRoot.querySelector("select-langs");

    // set event listner
    this.startBtn.addEventListener(
      "click",
      () => this.startRecognition(),
      false
    );
    this.stopBtn.addEventListener("click", () => this.stopRecognition(), false);
    this.checkbox.addEventListener(
      "change",
      () => {
        const isChecked = this.checkbox.checked;
        if (isChecked) {
          this.recordable = true;
        } else {
          this.recordable = false;
        }
      },
      false
    );
  }

  connectedCallback() {
    if (!window.SpeechRecognition)
      window.SpeechRecognition =
        window.webkitSpeechRecognition || window.mozSpeechRecognition;
    srEnable = !!window.SpeechRecognition;
  }

  startRecognition() {
    if (!srEnable) {
      console.log("SpeechRecognition is not available");
      return;
    }

    const speechRecognition = new window.SpeechRecognition();
    speechRecognition.lang = this.select.dataset.lang;
    srActivated = true;
    speechRecognition.start();
    console.log("speechRecognition.start()", speechRecognition);

    const stopListening = () => {
      srActivated = false;
      speechRecognition.stop();
      this.stopRecording();
    };

    const getRecognizedText = event => {
      const text = event.results[0][0].transcript;
      return text;
    };

    speechRecognition.addEventListener("error", event => {
      const message = event.message || String(event.error);
      console.error(message);
      stopListening();
    });

    speechRecognition.addEventListener("speechstart", () => {
      console.log("SpeechRecognition: onspeechstart");
    });

    speechRecognition.addEventListener("result", event => {
      console.log("SpeechRecognition: onresult", event);
      const speechInputContent = document.getElementById("speechInputContent");
      const text = getRecognizedText(event);
      console.log(text);
      this.textArea.value += `${text}\n`;
    });

    speechRecognition.addEventListener("end", () => {
      console.log("SpeechRecogintion: end");
      this.pauseRecording(); // recording pause / restart
      if (srActivated) {
        speechRecognition.start();
      }
    });

    if (this.recordable) this.recording();
  }

  stopRecognition() {
    srActivated = false;
    const speechRecognition = new window.SpeechRecognition();
    speechRecognition.stop();
    this.stopRecording();
  }

  recording() {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(stream => {
        const mediaStream = stream;
        this.startRecording(mediaStream);
      })
      .catch(error => {
        console.log(error);
      });
  }

  startRecording(s) {
    const chunks = [];
    const codec = "audio/webm";

    mediaRecorder = new MediaRecorder(s, {
      audioBitsPerSecond: 128000,
      mimeType: codec
    });

    mediaRecorder.addEventListener("dataavailable", e => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    });

    mediaRecorder.addEventListener("stop", () => {
      this.audio.src = window.URL.createObjectURL(
        new Blob(chunks, {
          type: codec
        })
      );
    });

    mediaRecorder.start();
    console.log("mediaRecorderState:onStart:", mediaRecorder.state);
  }

  stopRecording() {
    if (mediaRecorder === null) {
      return;
    }

    mediaRecorder.stop();
    console.log("mediaRecorderState:onStop:", mediaRecorder.state);
    mediaRecorder = null;
  }

  pauseRecording() {
    if (mediaRecorder === null) {
      return;
    }

    if (mediaRecorder.state === "recording") {
      mediaRecorder.pause();
    } else if (mediaRecorder.state === "paused") {
      mediaRecorder.resume();
    }

    console.log("mediaRecorderState:onPause:", mediaRecorder.state);
  }
}

customElements.define(APPNAME, SpeechRecognitionToTextarea);
