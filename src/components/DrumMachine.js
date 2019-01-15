import React, { Component } from 'react';
import key from 'keymaster';

import styles from '../styles/DrumMachine.css';
import Matrix from './Matrix';
import { Sequencer, Keyboard, toBPM, presets } from '../utils/Audio';
import Animation, { animationKey2IndexMapping } from '../utils/Animation';

import menuLogo from '../assets/images/logo.png';
import mi1 from '../assets/images/material-icon/ic_menu_white_24dp_2x.png';
import mi2 from '../assets/images/material-icon/ic_close_white_24dp_2x.png';
import mi3 from '../assets/images/material-icon/ic_pause_white_24dp_2x.png';
import mi4 from '../assets/images/material-icon/ic_play_arrow_white_24dp_2x.png';
import mi5 from '../assets/images/material-icon/ic_refresh_white_24dp_2x.png';
import mi6 from '../assets/images/material-icon/ic_shuffle_white_24dp_2x.png';

let fadeoutID;
let logoID;
let hintID;
let keys = '';
keys = new Array(26);
for (let i = 0; i < 26; i += 1) {
	keys[i] = String.fromCharCode(97 + i);
}
keys = keys.join(', ');

class DrumMachine extends Component {
  constructor() {
    super();
    const data = [];
    for (let i = 0; i < 16; i += 1) {
      data[i] = [];
      for (let j = 0; j < 8; j += 1) {
        // data[i][j] = (Math.random() > 0.15) ? 0 : 1;
        data[i][j] = 0;
      }
    }

    this.state = {
      data,
      currentBeat: 0, // now playing column
      playing: false,
      hidden: true,
      wait: true,
      bpm: 120,
      hover: { i: -1, j: -1 },
      // idle: false,
      // currentSample: 'A',
    };

    this.setCurrentBeat = this.setCurrentBeat.bind(this);
    this.playDrumAni = this.playDrumAni.bind(this);
    this.detectKeyboard = this.detectKeyboard.bind(this);

    this.sequencer = new Sequencer(
	    this.state.data,
	    this.setCurrentBeat,
	    this.playDrumAni,
    );

    this.keyboard = new Keyboard();

    this.toggleHidden = this.toggleHidden.bind(this);
		this.hideSpinner = this.hideSpinner.bind(this);
		this.showDOM = this.showDOM.bind(this);
		this.hideHint = this.hideHint.bind(this);
		// this.showLogo = this.showLogo.bind(this);
		this.handleResize = this.handleResize.bind(this);

  }

  componentDidMount() {
    this.detectKeyboard();
    this.ani = Animation();

		/**
	   * hide loading spinner and wait 3.5s after DOM is loaded.
	   */
	  const outShowDOM = this.hideSpinner;
    // const outShowLogo = this.showLogo;
		function startTimer() {
			fadeoutID = window.setTimeout(outShowDOM, 3500);
		}
		startTimer();
		this.startSequencer();
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  setCurrentBeat(currentBeat) {
    this.setState({
      currentBeat,
    });
  }

	clearClicked() {
		const { data } = this.state;
		let i;
		let j;
		for (i = 0; i < 16; i += 1) {
			for (j = 0; j < 8; j += 1) {
				data[i][j] = 0;
			}
		}
		this.setState({
			data,
		});
	}

	randomClicked() {
		const { data } = this.state;
		for (let i = 0; i < 16; i += 1) {
			for (let j = 0; j < 8; j += 1) {
				data[i][j] = (Math.random() > 0.8) ? 1 : 0;
			}
		}
		this.setState({
			data,
		});
	}

  handleClick(i, j) {
		const { data } = this.state;
    data[i][j] = (data[i][j] === 0) ? 1 : 0;
    this.setState({
      data,
    });
  }

  handleResize() {
    this.ani.resize(window.innerWidth, window.innerHeight);
  }

  startSequencer() {
    this.sequencer.start();
    this.setState({
      playing: true,
    });
  }

  stopSequencer() {
		this.sequencer.stop();
		this.setState({
			playing: false,
			currentBeat: 0,
		});
  }

  playDrumAni(column) {
    for (let i = 0; i < column.length; i += 1) {
      this.ani.triggerSequencerAnimation(column[i]);
    }
  }

  detectKeyboard() {
    key(keys, (e, h) => {
			const index = animationKey2IndexMapping[h.shortcut];
      this.ani.triggerKeyAnimation(index);
			const char = (h.shortcut.charCodeAt(0) - 97).toString();
			this.keyboard.currentKey = char;
			this.keyboard.playKey();
    });

		// start / stop
		key('space', () => {
			if (!this.state.playing) {
				this.startSequencer();
			} else {
				this.stopSequencer();
			}
		});

		// speed
    key('up', () => {
      const { bpm } = this.state;
      if (bpm > 70 && bpm < 300) {
        this.setState({ bpm: bpm + 10 }, () => toBPM(this.state.bpm, 1));
      }
    });
    key('down', () => {
      const { bpm } = this.state;
      if (bpm > 70 && bpm < 300) {
        this.setState({ bpm: bpm - 10 }, () => toBPM(this.state.bpm, 1));
      }
    });

		// change sound bank
		key('right', () => {
			this.sequencer.changeSampleSet(true);
		});
		key('left', () => {
			this.sequencer.changeSampleSet(false);
		});

		// change sequencer animation bank
		key('shift+right', () => {
			this.ani.changeSequencerAnimations(true);
		});
		key('shift+left', () => {
			this.ani.changeSequencerAnimations(false);
		});

		// change key animation/sound bank
		key('shift+up', () => {
			this.ani.changeKeyAnimations(true);
			this.keyboard.changeSampleSet(true);
			if (this.keyboard.currentSampleIndex === 1) {
				this.setState({ narutoBool: true });
			} else {
				this.setState({ narutoBool: false });
			}
		});
		key('shift+down', () => {
			this.ani.changeKeyAnimations(false);
			this.keyboard.changeSampleSet(false);
			if (this.keyboard.currentSampleIndex === 1) {
				this.setState({ narutoBool: true });
			} else {
				this.setState({ narutoBool: false });
			}
		});

		// loading presets
		key('1, 2, 3, 4, 5, 6, 7, 8', (e, h) => {
			const index = h.shortcut.charCodeAt(0) - 49;
			const { data } = this.state;
			for (let i = 0; i < 16; i += 1) {
				for (let j = 0; j < 8; j += 1) {
					data[i][j] = presets[index][i][j];
				}
			}
			this.setState({
				data,
			});
		});

		// toggle menu
		key('shift+m', () => this.setState({ hidden: !this.state.hidden }));
  }

	hideSpinner() {
		const spinner = document.getElementById('spinner');
		spinner.classList.add('loaded');
 		const loadingTitle = document.getElementById('loadingTitle');
 		loadingTitle.classList.add('loaded');
		const logo = document.getElementById('beactLogo');
		logo.classList.add('showLogo');
		const showLogo = () => {
			const beactLogo = document.getElementById('beactLogo');
			beactLogo.classList.remove('showLogo');
			window.clearTimeout(logoID);
		};
		logoID = window.setTimeout(showLogo, 2000);
 		window.clearTimeout(fadeoutID);
		fadeoutID = window.setTimeout(this.showDOM, 3000);
 	}

	showDOM() {
		const rootDiv = document.getElementById('root');
		rootDiv.classList.add('fullHeight');
		this.setState({ wait: false });

    // wait till this time
    this.ani.setSequencerAnimationsCustomSettings();
		hintID = window.setTimeout(this.hideHint, 5000);
	}

  toggleHidden() {
    this.setState({
      hidden: !this.state.hidden,
    });
  }

  // eslint-disable-next-line class-methods-use-this
	hideHint() {
		const hm = document.getElementById(styles.hintMask);
		hm.style.display = 'none';
		window.clearTimeout(hintID);
	}

  render() {
		const {
			data, hover, hidden, wait, playing,
		} = this.state;
    return (
      <div className={(wait === true) ? styles.hideDOM : styles.showDOM}>
        <div id={styles.hintMask}>
          <div>
            <div>1. Open your speaker.</div>
            <div>2. You can press any keys, arrows, space...</div>
            <div>3. Click the grids on drum-pad.</div>
          </div>
        </div>
				<button
					className={`${styles.icon} ${styles.menuIcon} ${(hidden === true) ? '' : styles.displayHide}`}
					onTouchTap={() => this.toggleHidden()}
				>
					<img src={mi1} alt="menu" />
				</button>
        {(playing) ?
          <button
            className={`${styles.icon} ${styles.toggleIcon} ${(hidden === true) ? '' : styles.displayHide}`}
            onTouchTap={() => this.stopSequencer()}
          >
            <img src={mi3} alt="pause" />
          </button> :
          <button
            className={`${styles.icon} ${styles.toggleIcon} ${(hidden === true) ? '' : styles.displayHide}`}
            onTouchTap={() => this.startSequencer()}
          >
            <img src={mi4} alt="play" />
          </button>}
        <button
          className={
					`${styles.icon}
					 ${styles.clearIcon}
					 ${(hidden === true) ? '' : styles.displayHide}`
				  }
          onTouchTap={() => this.clearClicked()}
        >
          <img src={mi5} alt="refresh" />
        </button>
        <button
          className={
						`${styles.icon}
						 ${styles.randomIcon}
						 ${(hidden === true) ? '' : styles.displayHide}`
					}
          onTouchTap={() => this.randomClicked()}
        >
          <img src={mi6} alt="shuffle" />
        </button>

        <div
          className={
					`${styles.menu}
					 ${(hidden === true) ? styles.toggleRevMenu : styles.toggleMenu}`
				  }
        >
          <div className={styles.colorMenu}>
            <div className={`${styles.projectName} ${styles.noFuncRow}`}>
              <span>Beact</span>
            </div>
            <div className={`${styles.contributors} ${styles.noFuncRow}`}>
              <span>by Vibert, Joey, Scya, 2018</span>
            </div>
          </div>
        </div>

        <button
          className={
						`${styles.mask}
						 ${(hidden === false ? styles.showMask : styles.hideMask)}`}
          onClick={() => this.toggleHidden()}
        >
          <img src={menuLogo} alt="BEACT" className={styles.menuLogo} />
        </button>
        <Matrix
          data={data}
          hover={hover}
          playing={this.state.playing}
          currentBeat={this.state.currentBeat}
          onClick={(i, j) => this.handleClick(i, j)}
          onHover={(i, j) => this.handleHover(i, j)}
        />
        <div className={styles.animation} id="animation" />
        <div>
          <input
            type="text"
            id="one"
            onKeyPress={this.detectKeyboard}
          />
        </div>
      </div>
    );
  }
}

export default DrumMachine;
