import React, { Component } from 'react';
import key from 'keymaster';

import styles from '../styles/DrumMachine.scss';
import Matrix from './Matrix';
import keys from '../utils/Keys';
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
			instructionStage: 0,
			keyCount: 0,
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
		this.handleResize = this.handleResize.bind(this);
  }

  componentDidMount() {
		this.detectKeyboard();
    this.ani = Animation();

		fadeoutID = window.setTimeout(this.hideSpinner, 3500);
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
		this.levelTransition(4, 5);
		this.levelTransition(2, 3);

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
		this.levelTransition(4, 5);

    key(keys, (e, h) => {
			const { keyCount } = this.state;
			const index = animationKey2IndexMapping[h.shortcut];
      this.ani.triggerKeyAnimation(index);
			const char = (h.shortcut.charCodeAt(0) - 97).toString();
			this.keyboard.currentKey = char;
			this.keyboard.playKey();

			if (keyCount > 4) {
				this.levelTransition(1, 2);
			}

			this.levelTransition(0, 1);

			this.setState({
				keyCount: keyCount + 1,
			});
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

			this.levelTransition(3, 4);

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
		document.getElementById('spinner').style.display = 'none';
		document.getElementById('beactLogo').style.display = 'none';

		const rootDiv = document.getElementById('root');
		rootDiv.classList.add('fullHeight');
		this.setState({ wait: false });

    // wait till this time
		this.ani.setSequencerAnimationsCustomSettings();

	}

  toggleHidden() {
		this.levelTransition(4, 5);
    this.setState({
      hidden: !this.state.hidden,
    });
	}

	levelTransition(current, next) {
		const { instructionStage } = this.state;
		if (instructionStage === current) {
			this.setState({
				instructionStage: next,
			});
		}
	}

	tipsText(level) {
		if (level === 0) {
			return (
				<div>
					{/* <h3>🙋‍♀️Tips</h3> */}
					{/* <p>🔊Open your speaker.</p> */}
					{/* <p>🎹Press any key within [a-z] <br />on the keyboard.</p> */}
					<h3>🎹
						<br />
						Press any key in [a-z]
						<br />
						on the keyboard
					</h3>
				</div>
			);
		} else if (level === 1) {
			return (
				<div>
					<h3>👩‍🎤+🤟
						<br />
						Type your name or some words
					</h3>
				</div>
			);
		} else if (level === 2) {
			return (
				<div>
					<h3>🥁+👇
						<br />
						Click anywhere to trigger the drums.
					</h3>
				</div>
			);2
		} else if (level === 3) {
			return (
				<div>
					<h3>🤖+💃
						<br />
						press [1-8] to use preset patterns and dance
					</h3>
				</div>
			);
		} else if (level === 4) {
			return (
				<div>
					<h3>🎉 Awesome
						<br />
						press the top-left icon for more info and 🙋‍ tips
					</h3>
				</div>
			);
		}
	}

  render() {
		const {
			data, hover, hidden, wait, playing, instructionStage
		} = this.state;
    return (
      <div className={(wait === true) ? styles.hideDOM : styles.showDOM}>

        {(instructionStage < 5) ? (<div id={styles.hintMask}>
					<div id={styles.hintContainer}>
						{this.tipsText(instructionStage)}
          </div>
				</div>) : ''}

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
					<div className={styles.menuContent}>
						<h1>$Beact$</h1>
						<p>
							🎸🎨DJ and VJ all by yourself in seconds !
              It's made by{' '}
							<a href="https://vibertthio.com/portfolio/" target="_blank" rel="noreferrer noopener">
								Vibert Thio
							</a>
							{' Source code is on '}
							<a
								href="https://github.com/vibertthio/beact-client"
								target="_blank"
								rel="noreferrer noopener"
							>
								GitHub.
              </a>
						</p>

						<h1>$How To Use$</h1>
						<p>👇[space]: start/stop
						<br />🎹[a-z]: keyboard effect
						<br />🥁[click]: trigger drum sequencer
						<br />💯[1-8]: load preset beat pattern
						<br />🏃‍♀️[↑↓]: change BPM
						<br />🔥[←→]: change sound</p>
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
