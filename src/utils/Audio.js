import Tone, { Sequence, Transport, Players, now } from 'tone';
// import axios from 'axios';
import uuid4 from 'uuid/v4';
import StartAudioContext from 'startaudiocontext';
import { keysUrls, keysNotes } from './config/keys.config';
import { drumUrls, drumNotes, presets } from './config/drum.config';

let temperId = uuid4();

export class Sequencer {

  constructor(
    matrix,
    setCurrentBeat,
    playDrumAni,
  ) {
    StartAudioContext(Tone.context);

    this.matrix = matrix;
    this.number = 0;
    this.playing = true;
    this.notes = drumNotes; // [1, 2, 3, 4, 5, 6, 7, 8]
    this.currentSampleIndex = 0;
    this.loadSamples();
    this.sequence = new Sequence((time, col) => {
      this.beat = col;
      setCurrentBeat(this.beat);

      // 16 columns, each column: ex. [1, 0, 0, 0, 1, 1, 0, 1]
      const column = this.matrix[col];
      const nowPlayingAni = [];
      for (let i = 0; i < this.notes.length; i += 1) {

        // make sure no play while loading
        if (column[i] === 1 && !this.loadingSamples) {
          const vel = (Math.random() * 0.5) + 0.5;
          this.samples.volume.value = 10 * Math.log10(vel);
          this.samples._players[this.notes[i]].start(time);
          nowPlayingAni.push(i);
        }
      }
      playDrumAni(nowPlayingAni);


    }, Array.from(Array(this.matrix.length).keys()), '16n');
    Transport.start();
  }

  static getBeat() {
    return this.beat;
  }

  isPlaying() {
    return this.playing;
  }

  start() {
    this.playing = true;
    this.sequence.start();
  }

  stop() {
    this.playing = false;
    this.sequence.stop();
  }

  changeSampleSet(up) {
    this.currentSampleIndex =
      (this.currentSampleIndex + (up ? 1 : -1)) % drumUrls.length;
    if (this.currentSampleIndex < 0) {
      this.currentSampleIndex += drumUrls.length;
    }

    console.log(this.currentSampleIndex);
    this.loadSamples();
  }

  loadSamples() {
    console.log(`start loading drum sound bank : ${this.currentSampleIndex}`);
    this.loadingSamples = true;
    this.samples = new Players(drumUrls[this.currentSampleIndex], () => {
      this.loadingSamples = false;
    }).toMaster();
    this.samples.volume.value = -2;
    this.samples.fadeOut = 0.4;
  }

}

export class Keyboard {

  constructor() {
    this.currentKey = null;
    this.record = [];
    this.notes = keysNotes;
    this.samples = new Players(keysUrls[0]);
    for (let i = 0; i < Object.keys(keysUrls[0]).length; i += 1) {
      this.samples.add(i, keysUrls[0][i + 1]);
    }
    this.samples.volume.value = 2;
    this.samples.fadeOut = 0.1;
    this.currentSampleIndex = 0;
  }

  playKey() {
    console.log(`key: ${this.currentKey}`);
    if (this.currentKey !== null && !this.loadingSamples) {
      this.samples.get(this.currentKey).start().toMaster();
      this.currentKey = null;
    }
  }


	changeSampleSet(up) {
	  this.currentSampleIndex =
	    (this.currentSampleIndex + (up ? 1 : -1)) % keysUrls.length;
	  if (this.currentSampleIndex < 0) {
	    this.currentSampleIndex += keysUrls.length;
	  }

	  console.log(this.currentSampleIndex);
	  this.loadSamples();
	}

	loadSamples() {
	  console.log(`start loading key sound bank : ${this.currentSampleIndex}`);
	  this.loadingSamples = true;
    this.samples = new Players(keysUrls[this.currentSampleIndex], () => {
      this.loadingSamples = false;
    }).toMaster();
    this.samples.volume.value = -2;
    this.samples.fadeOut = 0.4;
	}
}

const toBPM = (val, rampTime) => {
  const target = val.toFixed();
  Transport.bpm.rampTo(target, rampTime);
};

export {
  toBPM,
  presets,
};
