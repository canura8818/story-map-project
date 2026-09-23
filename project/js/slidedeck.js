/**
 * A slide deck object
 */
class SlideDeck {
  /**
   * Constructor for the SlideDeck object.
   * @param {Node} container The container element for the slides.
   * @param {NodeList} slides A list of HTML elements containing the slide text.
   * @param {L.map} map The Leaflet map where data will be shown.
   * @param {object} slideOptions The options to create each slide's L.geoJSON
   *                              layer, keyed by slide ID.
   */
  constructor(container, slides, map, slideOptions = {}) {
    this.container = container;
    this.slides = slides;
    this.map = map;
    this.slideOptions = slideOptions;

    this.dataLayer = L.layerGroup().addTo(map);
    this.currentSlideIndex = 0;
  }

  /**
   * ### updateDataLayer
   *
   * The updateDataLayer function will clear any markers or shapes previously
   * added to the GeoJSON layer on the map, and replace them with the data
   * provided in the `data` argument. The `data` should contain a GeoJSON
   * FeatureCollection object.
   *
   * @param {object} data A GeoJSON FeatureCollection object
   * @param {object} options Options to pass to L.geoJSON
   * @return {L.GeoJSONLayer} The new GeoJSON layer that has been added to the
   *                          data layer group.
   */
  updateDataLayer(data, options) {
    this.dataLayer.clearLayers();

    const defaultOptions = {
      pointToLayer: (p, latlng) => L.marker(latlng),
      style: (feature) => feature.properties.style,
      onEachFeature: (feature, layer) => {
        if (feature.properties && feature.properties.label) {
          layer.bindTooltip(feature.properties.label);
        }
      },
    };
    const geoJsonLayer = L.geoJSON(data, options || defaultOptions)
      .addTo(this.dataLayer);

    return geoJsonLayer;
  }

  /**
   * ### getSlideFeatureCollection
   *
   * Load the slide's features from a GeoJSON file.
   *
   * @param {HTMLElement} slide The slide's HTML element. The element id should match the key for the slide's GeoJSON file
   * @return {object} The FeatureCollection as loaded from the data file
   */
  async getSlideFeatureCollection(slide) {
    if (slide.id === 'title-slide') {
      return { type: "FeatureCollection", features: [] };
    }
    
    const resp = await fetch(`data/${slide.id}.geojson`);
    const data = await resp.json();
    return data;
  }

  /**
   * ### hideAllSlides
   *
   * Add the hidden class to all slides' HTML elements.
   *
   * @param {NodeList} slides The set of all slide elements, in order.
   */
  hideAllSlides() {
    for (const slide of this.slides) {
      slide.classList.add('hidden');
    }
  }

  /**
   * ### syncMapToSlide
   *
   * Go to the slide that mathces the specified ID.
   *
   * @param {HTMLElement} slide The slide's HTML element
   */
  async syncMapToSlide(slide) {
    const collection = await this.getSlideFeatureCollection(slide);
    const options = this.slideOptions[slide.id];
    const layer = this.updateDataLayer(collection, options);
    const erosionPanel = document.getElementById('erosion-panel');
    let shorelineLayer = null;

    /**
     * Create a bounds object from a GeoJSON bbox array.
     * @param {Array} bbox The bounding box of the collection
     * @return {L.latLngBounds} The bounds object
     */
    const boundsFromBbox = (bbox) => {
      const [west, south, east, north] = bbox;
      const bounds = L.latLngBounds(
        L.latLng(south, west),
        L.latLng(north, east),
      );
      return bounds;
    };

    /**
     * Create a temporary event handler that will show tooltips on the map
     * features, after the map is done "flying" to contain the data layer.
     */
    const handleFlyEnd = () => {
      if (slide.showpopups) {
        layer.eachLayer((l) => {
          l.bindTooltip(l.feature.properties.label, { permanent: true });
          l.openTooltip();
        });
      }
      this.map.removeEventListener('moveend', handleFlyEnd);
    };

    this.map.addEventListener('moveend', handleFlyEnd);

    if (collection.bbox && collection.bbox.length === 4) {
      this.map.flyToBounds(boundsFromBbox(collection.bbox));
    } 
    else if (slide.id === 'LULC') {
      erosionPanel.classList.remove('hidden');
      if (!shorelineLayer) {
        const resp = await fetch('data/Shoreline_Public_Access.geojson');
        const data = await resp.json();
        shorelineLayer = L.geoJSON(data, {
          pointToLayer: (feature, latlng) => L.circleMarker(latlng, {
            pane: 'markerPane',
            radius: 6,
            fillColor: '#ff9900',
            weight: 2,
            fillOpacity: 1
          })
        });
        shorelineLayer.addTo(this.map);
      }
    } else if (layer.getLayers().length > 0 && layer.getBounds().isValid()) {
      this.map.flyToBounds(layer.getBounds());
    } else {
      this.map.flyTo([21.316903, -157.858093], 10);
      erosionPanel.classList.add('hidden');
      erosionPanel.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        if (cb.checked) {
          cb.checked = false;
          cb.dispatchEvent(new Event('change')); 
        }
      })
    }
  }

  /**
   * Show the slide with ID matched by currentSlideIndex. If currentSlideIndex is
   * null, then show the first slide.
   */
  syncMapToCurrentSlide() {
    const slide = this.slides[this.currentSlideIndex];
    this.syncMapToSlide(slide);
  }

  /**
   * Increment the currentSlideIndex and show the corresponding slide. If the
   * current slide is the final slide, then the next is the first.
   */
  goNextSlide() {
    this.currentSlideIndex++;

    if (this.currentSlideIndex === this.slides.length) {
      this.currentSlideIndex = 0;
    }

    this.syncMapToCurrentSlide();
  }

  /**
   * Decrement the currentSlideIndes and show the corresponding slide. If the
   * current slide is the first slide, then the previous is the final.
   */
  goPrevSlide() {
    this.currentSlideIndex--;

    if (this.currentSlideIndex < 0) {
      this.currentSlideIndex = this.slides.length - 1;
    }

    this.syncMapToCurrentSlide();
  }

  /**
   * ### preloadFeatureCollections
   *
   * Initiate a fetch on all slide data so that the browser can cache the
   * requests. This way, when a specific slide is loaded it has a better chance
   * of loading quickly.
   */
  preloadFeatureCollections() {
    for (const slide of this.slides) {
      this.getSlideFeatureCollection(slide);
    }
  }

  /**
   * Calculate the current slide index based on the current scroll position.
   */
  calcCurrentSlideIndex() {
    // Height of the viewport
    const windowHeight = window.innerHeight;

    // How far down the page we've scrolled so far; calculated from the top of
    // the page
    const scrollPos = window.scrollY;

    // Amount of next slide that must be visible above the bottom of the window
    // to trigger a slide transition
    const scrollPeek = 64;

    // When the next slide peeks above the bottom of the viewport a certain
    // amount, we consider that we've reached the next slide.
    const currentSlideThreshold = scrollPos + windowHeight - scrollPeek;

    // Create a variable to hold the index of each slide as we check it.
    let i;

    // Start from the last slide and work backwards to find the current slide.
    for (i = this.slides.length - 1; i > 0; i--) {
      const slidePos
        = this.slides[i].offsetTop + this.container.offsetTop;
      if (slidePos <= currentSlideThreshold) {
        break;
      }
    }

    if (i !== this.currentSlideIndex) {
      this.currentSlideIndex = i;
      this.syncMapToCurrentSlide();
    }
  }
}

export { SlideDeck };
