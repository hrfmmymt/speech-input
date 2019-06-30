import { LANGS } from './stats';

const template = document.createElement("template");
template.innerHTML = `<select id="speechInputSelect"></select>`;

export class SpeechRecognitionSelectLanguage extends HTMLElement {
  constructor() {
    super();
    this._initializeDOM();
  }

  _initializeDOM() {
    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.appendChild(template.content.cloneNode(true));

    // get DOM references
    this.selectBox = shadowRoot.querySelector("#speechInputSelect");

    // set event listner
    let i, l;
    for (i = 0, l = LANGS.length; i < l; i++) {
      const option = LANGS[i];
      this.selectBox.options.add(
        new Option(option.label, option.value, "", option.selected)
      );
    }

    this.selectBox.addEventListener("change", () => {
      this.onSelect();
    });
  }

  connectedCallback() {
    this.onSelect();
  }

  onSelect() {
    this.setAttribute(
      "data-lang",
      this.selectBox.options[this.selectBox.selectedIndex].value
    );
  }
}

customElements.define("select-langs", SpeechRecognitionSelectLanguage);
