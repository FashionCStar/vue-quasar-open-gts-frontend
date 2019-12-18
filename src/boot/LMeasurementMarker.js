import L from 'leaflet'

L.Marker.Measurement = L[L.Layer ? 'Layer' : 'Class'].extend({
  options: {
    pane: 'markerPane'
  },

  initialize: function (latlng, measurement, title, rotation, options) {
    L.setOptions(this, options)

    this._latlng = latlng
    this._measurement = measurement
    this._title = title
    this._rotation = rotation
  },

  addTo: function (map) {
    map.addLayer(this)
    return this
  },

  onAdd: function (map) {
    this._map = map
    const pane = this.getPane ? this.getPane() : map.getPanes().markerPane
    const el = this._element = L.DomUtil.create('div', 'leaflet-zoom-animated leaflet-measure-path-measurement', pane)
    this.inner = L.DomUtil.create('div', '', el)
    this.inner.title = this._title
    this.inner.innerHTML = this._measurement

    map.on('zoomanim', this._animateZoom, this)

    this._setPosition()
  },

  onRemove: function (map) {
    map.off('zoomanim', this._animateZoom, this)
    const pane = this.getPane ? this.getPane() : map.getPanes().markerPane
    pane.removeChild(this._element)
    this._map = null
  },

  setLatLng: function (latlng) {
    try {
      this._latlng = latlng
      let pos = this._map.latLngToLayerPoint(this._latlng).round()
      if (this._zoom) {
        pos = this._map._latLngToNewLayerPoint(this._latlng, this._zoom, this._map.getCenter()).round()
      }
      L.DomUtil.setPosition(this._element, pos)
      this._element.style.transform += ' rotate(' + this._rotation + 'rad)'
    } catch (e) {
      console.log('ERROR', e)
    }
  },

  setRotation: function (rotation) {
    this._rotation = rotation
    this._element.style.transform = this._element.style.transform.replace(/\srotate.*/g, '')
    this._element.style.transform += ' rotate(' + this._rotation + 'rad)'
  },

  setMeasurement: function (distance) {
    this._measurement = distance
    this.inner.innerHTML = this._measurement
  },

  setTitle: function (title) {
    this._title = title
    this.inner.title = this._title
  },

  _setPosition: function () {
    L.DomUtil.setPosition(this._element, this._map.latLngToLayerPoint(this._latlng))
    this._element.style.transform += ' rotate(' + this._rotation + 'rad)'
  },

  _animateZoom: function (opt) {
    this._zoom = opt.zoom
    this._center = opt.center
    const pos = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center).round()
    L.DomUtil.setPosition(this._element, pos)
    this._element.style.transform += ' rotate(' + this._rotation + 'rad)'
  }
})

function LMeasurementMarker (latLng, measurement, title, rotation, options) {
  return new L.Marker.Measurement(latLng, measurement, title, rotation, options)
}

export { LMeasurementMarker }
