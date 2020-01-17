<template>
  <div class="leaflet-playback-control leaflet-control rounded-borders">
    <q-toolbar class="bg-grey-4">
      <q-btn glossy dense round color="purple"
             :icon="isPlaying ? 'pause' : 'play_arrow'"
             class="q-mr-sm"
             @click="playTrack" />
      <q-separator vertical inset />
      <div style="width: 210px; flex-shrink: 0">
        <q-input stack-label borderless
                 v-model="playbackTime"
                 dense readonly
                 label="Current Time"
                 class="q-mx-sm"
        >
          <template v-slot:prepend>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy transition-show="scale"
                             transition-hide="scale"
                             @before-show="showCalender"
                             ref="datePicker"
              >
                <q-date v-model="currentTimeString"
                        mask="YYYY-MM-DD HH:mm:ss"
                        @input="val => setCursor(val)" />
              </q-popup-proxy>
            </q-icon>
          </template>

          <template v-slot:append>
            <q-icon name="access_time" class="cursor-pointer">
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-time v-model="currentTimeString"
                        mask="YYYY-MM-DD HH:mm:ss"
                        format24h with-seconds
                        @input="val => setCursor(val)"/>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>
      <q-separator vertical inset />
      <q-slider v-model="currentTime"
                :min="startTime"
                :max="endTime"
                :step="tickLen"
                :readonly="!useSlider"
                color="light-green"
                class="q-mx-md"
                ref="trackSlider"
                @input="val => this.moveSlider(val)"
      />
      <q-separator vertical inset />
      <q-btn stack glossy color="secondary" icon="speed"
             class="q-ml-sm"
             :label="`${playSpeed}x`"
             @click="speedSetting = true"/>
    </q-toolbar>
    <q-dialog v-model="speedSetting">
      <q-card style="width: 300px" class="q-px-sm q-pb-md">
        <q-card-section>
          <div class="text-h6">Playback Setting</div>
        </q-card-section>

        <q-item dense>
          <q-item-section avatar>
            <q-icon name="speed" />
          </q-item-section>
          <q-item-section>
            <q-slider color="teal" v-model="playSpeed"
                      :min="1"
                      :max="10"
                      :step="0.1"
                      label
                      label-always
                      @input="val => this.setSpeed(val)"
            />
          </q-item-section>
        </q-item>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { LayerMixin, OptionsMixin, optionsMerger, findRealParent, propsBinder } from 'vue2-leaflet/src'
import { Control, DomEvent, setOptions } from 'leaflet'
import { date } from 'quasar'
import Util from 'src/boot/mapUtil'

export default {
  name: 'LPlayback',
  mixins: [ LayerMixin, OptionsMixin ],
  props: {
    disableClickPropagation: {
      type: Boolean,
      custom: true,
      default: true
    },
    trackData: {
      type: [Array, Object],
      default: null
    },
    timeZone: {
      type: String,
      default: ''
    },
    isPlayback: {
      type: Boolean,
      default: false
    },
    useSlider: {
      type: Boolean,
      default: true
    },
    toggleSidebarCalender: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      speedSetting: false,
      playSpeed: 1,
      tickLen: 5,
      isPlaying: false,

      currentTime: 0,
      startTime: 0,
      endTime: 250,
      currentTimeString: '2019-02-28 08:23:58',
      playbackTime: '28/02/2019 08:23:58',

      ticks: [],
      playbackInterval: null,
      transitionTime: 250
    }
  },
  watch: {
    trackData: function (val) {
      this.setData()
    },
    currentTime: function (val) {
      this.updateTime()
    },
    isPlayback: function (val) {
      this.isPlaying = val
    }
  },
  mounted () {
    const LControl = Control.extend({
      options: {
        position: 'bottomleft'
      },
      initialize: function (trackData, options) {
        setOptions(this, options)

        this.trackData = trackData
        this.element = undefined
      },
      onAdd () {
        return this.element
      },
      setElement (el) {
        this.element = el
      }
    })
    const options = optionsMerger(this.controlOptions, this)
    this.mapObject = new LControl(options)
    propsBinder(this, this.mapObject, this.$options.props)
    this.parentContainer = findRealParent(this.$parent)
    this.mapObject.setElement(this.$el)

    const now = new Date()
    this.currentTime = now.getTime() / 1000
    this.startTime = this.currentTime
    this.endTime = this.currentTime
    this.currentTimeString = date.formatDate(now, 'YYYY-MM-DD HH:mm:ss')

    if (this.disableClickPropagation) {
      DomEvent.disableClickPropagation(this.$el)
    }
    this.mapObject.addTo(this.parentContainer.mapObject)
    this.$nextTick(() => {
      this.$emit('ready', this.mapObject)
    })
  },
  methods: {
    setData () {
      this.ticks = []
      this.startTime = 0
      this.endTime = 0

      if (this.trackData.length > 0) {
        for (let i = 0; i < this.trackData.length; i++) {
          this.initializeTicks(this.trackData[i], i)
          if (i < 1) {
            this.startTime = this.ticks[i].startTime
            this.endTime = this.ticks[i].endTime
          } else {
            const trackStartTime = this.ticks[i].startTime
            const trackEndTime = this.ticks[i].endTime
            if (trackStartTime < this.startTime) {
              this.startTime = trackStartTime
            }

            if (trackEndTime > this.endTime) {
              this.endTime = trackEndTime
            }
          }
        }
        this.currentTime = this.startTime
        this.updateTime()
      }
    },
    initializeTicks (track, index) {
      this.ticks[index] = {
        startTime: 0,
        endTime: 0,
        ticks: []
      }

      let ticks = this.ticks[index].ticks
      const tickLen = this.tickLen
      let t = 0

      // handle edge case of only one t sample
      if (track.length === 1) {
        ticks[track[0].timestamp] = {
          lat: track[0].latitude,
          lng: track[0].longitude,
          info: Util.getMarkerInfo(track[0], this.timeZone)
        }
        this.ticks[index].startTime = track[0].timestamp
        this.ticks[index].endTime = track[0].timestamp
        return
      }

      // iterating through the rest of the samples
      for (let i = 0; i < track.length - 1; i++) {
        const currSample = track[i]
        const nextSample = track[i + 1]
        const currSampleTime = track[i].timestamp
        const nextSampleTime = track[i + 1].timestamp
        t = currSampleTime
        let tMod = t % tickLen

        if (tMod !== 0) {
          const rem = tickLen - tMod
          const ratio = rem / (nextSampleTime - currSampleTime)
          t += rem

          ticks[t] = this.interpolatePoint(currSample, nextSample, ratio)
        } else {
          ticks[t] = {
            lat: currSample.latitude,
            lng: currSample.longitude,
            info: Util.getMarkerInfo(currSample, this.timeZone)
          }
        }

        if (i < 1) {
          this.ticks[index].startTime = t
        }
        t += tickLen
        while (t < nextSampleTime) {
          const ratio = (t - currSampleTime) / (nextSampleTime - currSampleTime)
          ticks[t] = this.interpolatePoint(currSample, nextSample, ratio)
          t += tickLen
        }
      }
      this.ticks[index].endTime = t - tickLen
    },
    interpolatePoint: function (start, end, ratio) {
      try {
        const delta = [end.latitude - start.latitude, end.longitude - start.longitude]
        const offset = [delta[0] * ratio, delta[1] * ratio]
        return {
          lat: start.latitude + offset[0],
          lng: start.longitude + offset[1],
          info: ''
        }
      } catch (e) {
        console.log('err: cant interpolate a point')
        console.log(['start', start])
        console.log(['end', end])
        console.log(['ratio', ratio])
      }
    },
    playTrack () {
      this.isPlaying = !this.isPlaying
      if (this.isPlaying) {
        this.playStart()
      } else {
        this.playStop()
      }
    },
    playStart () {
      if (this.playbackInterval) return
      this.playbackInterval = window.setInterval(this.tick, this.transitionTime)
    },
    playStop () {
      if (!this.playbackInterval) return
      clearInterval(this.playbackInterval)
      this.playbackInterval = null
    },
    tick () {
      if (this.currentTime >= this.endTime) {
        clearInterval(this.playbackInterval)
        this.playbackInterval = null
        this.isPlaying = false
        return
      }
      if (this.currentTime < this.startTime) {
        this.currentTime = this.startTime
      }
      this.currentTime += this.tickLen
      this.moveSlider()
    },
    moveSlider (val) {
      this.updateTime()
      const curPositions = []
      for (let i = 0; i < this.ticks.length; i++) {
        if (this.currentTime < this.ticks[i].startTime) {
          curPositions.push(this.ticks[i].ticks[this.ticks[i].startTime])
        } else if (this.currentTime > this.ticks[i].endTime) {
          curPositions.push(this.ticks[i].ticks[this.ticks[i].endTime])
        } else if (this.ticks[i].ticks[this.currentTime]) {
          curPositions.push(this.ticks[i].ticks[this.currentTime])
        }
      }

      if (curPositions.length > 0) {
        this.$emit('update:markerPos', curPositions)
      }
    },
    setCursor: function (dateString) {
      console.log('SELECTED TIME', dateString)
      const newDate = new Date(dateString)
      let timeStamp = newDate.getTime() / 1000
      const mod = timeStamp % this.tickLen
      if (mod !== 0) {
        timeStamp += this.tickLen - mod
      }
      this.currentTime = timeStamp
      this.moveSlider()
      this.$emit('update:boundTime', timeStamp)
    },
    setTimestamp: function (timeStamp) {
      const mod = timeStamp % this.tickLen
      if (mod !== 0) {
        timeStamp += this.tickLen - mod
      }
      this.currentTime = timeStamp
    },
    setSpeed (speed) {
      this.speed = speed
      this.transitionTime = 250 / this.speed
      if (this.playbackInterval) {
        this.playStop()
        this.playStart()
      }
    },
    updateTime () {
      const timeOffset = Util.timeZoneList.find(zone => zone.desc === this.timeZone).offset
      const timeStamp = new Date((this.currentTime + timeOffset) * 1000)
      this.currentTimeString = date.formatDate(timeStamp, 'YYYY-MM-DD HH:mm:ss')
      this.playbackTime = date.formatDate(timeStamp, 'DD/MM/YYYY HH:mm:ss')
    },
    showCalender (e) {
      this.$emit('toggle:datePicker')
      if (this.toggleSidebarCalender) {
        this.$refs.datePicker.hide()
      }
    }
  }
}
</script>

<style scoped>
  .leaflet-playback-control {
    margin-left: 10px;
    width: 600px;
  }
</style>
