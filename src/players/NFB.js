import React, { Component } from 'react'
import { canPlay, MATCH_URL_NFB } from '../patterns'

const ORIGIN = 'https://www.nfb.ca' || 'http://localhost:3000'

export default class NFB extends Component {
  static displayName = 'NFB'
  static canPlay = canPlay.nfb
  duration = null
  currentTime = null
  secondsLoaded = null

  componentDidMount () {
    this.props.onMount && this.props.onMount(this)
  }

  componentWillUnmount () {
    globalThis.removeEventListener('message', this.handleMessage)
  }

  load (url) {
    if (!this.iframe) return
    globalThis.addEventListener('message', this.handleMessage)
    if (this.props.muted) {
      this.player.mute()
    }
  }

  handleMessage = (event) => {
    if (event.origin !== ORIGIN) {
      return
    }
    if (typeof event.data.eventName !== 'string') {
      return
    }

    if (event.data.eventName === 'error') {
      this.props.onError(event.data.data)
    }
    if (event.data.eventName === 'loadComplete') {
      this.props.onReady()
    }
    if (event.data.eventName === 'playerStatusChange') {
      if (event.data.data.playerStatus === 2) {
        this.props.onPlay()
      }
      if (event.data.data.playerStatus === 3) {
        this.props.onPause()
      }
      if (event.data.data.playerStatus === 4) {
        this.props.onEnded()
      }
    }
    if (event.data.eventName === 'playerMetadataChange') {
      this.duration = event.data.data.duration / 1000
      this.currentTime = event.data.data.currentTime / 1000
      this.secondsLoaded = event.data.data.maximumBuffered / 1000
    }
  }

  postMessage = (eventName, data = {}) => {
    if (!this.iframe || !this.iframe.contentWindow) {
      return
    }
    this.iframe.contentWindow.postMessage(
      {
        eventName,
        data,
        sourceConnectorType: 1,
      },
      ORIGIN
    )
  }

  play () {
    console.log(this)
    this.postMessage('play')
  }

  pause () {
    this.postMessage('pause')
  }

  stop () {
    // Nothing to do
  }

  seekTo (seconds) {
    this.postMessage('seek', { time: seconds * 1000 })
  }

  setVolume (fraction) {
    this.postMessage('volumeChange', { volume: fraction })
  }

  setLoop (loop) {
    // Not supported
  }

  mute = () => {
    this.postMessage('mute', { mute: true })
  }

  unmute = () => {
    this.postMessage('unmute', { mute: true })
  }

  getDuration () {
    return this.duration
  }

  getCurrentTime () {
    return this.currentTime
  }

  getSecondsLoaded () {
    return this.secondsLoaded
  }

  ref = iframe => {
    this.iframe = iframe
  }

  render () {
    const id = this.props.url.match(MATCH_URL_NFB)[1]
    const { playing, muted, playsinline, controls, loop, config, onError } = this.props
    const style = {
      width: '100%',
      height: '100%'
    }
    return (
      <iframe
        ref={this.ref}
        src={`https://www.nfb.ca/film/${id}`}
        frameBorder='0'
        scrolling='no'
        style={style}
        allow='encrypted-media; autoplay; fullscreen;'
        allowFullScreen
        title="NFB player"
        allowtransparency="true"
        webkitallowfullscreen="true"
        mozallowfullscreen="true"
        playing={playing ? 1 : 0} // pass playing as a boolean converted to 1 or 0
        referrerPolicy="no-referrer"
    />
    )
  }
}
