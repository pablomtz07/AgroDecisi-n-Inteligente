const STORAGE_KEYS = {
    history: "agroHistorial",
    form: "agroFormulario",
    pendingScenario: "agroPendingScenario",
    priceCache: "agroPrecioInternet",
    parcel: "agroParcela"
};

const CROPS = {
    soja: { label: "Soja", baseHumidity: 13.5 },
    maiz: { label: "Maíz", baseHumidity: 14.5 },
    trigo: { label: "Trigo", baseHumidity: 14.0 },
    girasol: { label: "Girasol", baseHumidity: 11.0 }
};

const DEFAULT_LOCATION = {
    latitud: -38.03,
    longitud: -60.10
};

const DEFAULT_MAP_ZOOM = 12;
const MAP_PAGE_ZOOM = 17;

const PRICE_CACHE_TTL_MS = 60 * 60 * 1000;

const PRICE_SOURCES = {
    soja: {
        label: "Soja",
        yahooSymbol: "ZS=F",
        bushelsPerTon: 36.7437
    },
    maiz: {
        label: "Maiz",
        yahooSymbol: "ZC=F",
        bushelsPerTon: 39.3683
    },
    trigo: {
        label: "Trigo",
        yahooSymbol: "ZW=F",
        bushelsPerTon: 36.7437
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const $ = (id) => document.getElementById(id);

    const elements = {
        lote: $("lote"),
        cultivo: $("cultivo"),
        precio: $("precio"),
        costoSecada: $("costoSecada"),
        precioFuente: $("precioFuente"),
        btnCargarPrecio: $("btnCargarPrecio"),
        humedadActual: $("humedadActual"),
        humedadOrigen: $("humedadOrigen"),
        humedadBase: $("humedadBase"),
        btnUsarHumedadClima: $("btnUsarHumedadClima"),
        hectareas: $("hectareas"),
        rendimiento: $("rendimiento"),
        tarifaFlete: $("tarifaFlete"),
        distanciaFlete: $("distanciaFlete"),
        latitud: $("latitud"),
        longitud: $("longitud"),
        btnCargarUbicacion: $("btnCargarUbicacion"),
        btnCalcular: $("btnCalcular"),
        btnGuardar: $("btnGuardar"),
        btnUsarUbicacion: $("btnUsarUbicacion"),
        btnBorrarHistorial: $("btnBorrarHistorial"),
        btnExportarHistorial: $("btnExportarHistorial"),
        btnIniciarParcela: $("btnIniciarParcela"),
        btnFinalizarParcela: $("btnFinalizarParcela"),
        btnLimpiarParcela: $("btnLimpiarParcela"),
        filtroLote: $("filtroLote"),
        filtroCultivo: $("filtroCultivo"),
        btnLimpiarFiltros: $("btnLimpiarFiltros"),
        summaryCount: $("summaryCount"),
        summaryAvgMargin: $("summaryAvgMargin"),
        summaryBest: $("summaryBest"),
        summaryWorst: $("summaryWorst"),
        tablaHistorial: $("tablaHistorial"),
        produccion: $("produccion"),
        ingreso: $("ingreso"),
        costos: $("costos"),
        resultado: $("resultado"),
        recomendacion: $("recomendacion"),
        graficoRentabilidad: $("graficoRentabilidad"),
        clima: $("clima"),
        climaUbicacion: $("climaUbicacion"),
        climaPanel: $("climaPanel"),
        climaHero: $("climaHero"),
        climaSubtitulo: $("climaSubtitulo"),
        climaResumenActual: $("climaResumenActual"),
        climaResumenDetalle: $("climaResumenDetalle"),
        climaTempActual: $("climaTempActual"),
        climaHumActual: $("climaHumActual"),
        climaVientoActual: $("climaVientoActual"),
        climaLluviaActual: $("climaLluviaActual"),
        climaSemanal: $("climaSemanal"),
        climaCalendario: $("climaCalendario"),
        climaMesLabel: $("climaMesLabel"),
        climaMesDetalle: $("climaMesDetalle"),
        btnActualizarClima: $("btnActualizarClima"),
        parcelaResumen: $("parcelaResumen"),
        parcelaArea: $("parcelaArea"),
        heroParcelaResumen: $("heroParcelaResumen"),
        heroParcelaArea: $("heroParcelaArea"),
        hectareasOrigen: $("hectareasOrigen"),
        btnRecalcularHectareas: $("btnRecalcularHectareas"),
        btnEditarHectareas: $("btnEditarHectareas"),
        mapaLote: $("mapaLote"),
        formStatus: $("formStatus"),
        mapaDescripcion: $("mapaDescripcion"),
        navButtons: document.querySelectorAll("[data-scroll-to]")
    };

    const isDashboardPage = Boolean(elements.cultivo);
    const isHistoryPage = Boolean(elements.tablaHistorial);
    const isMapPage = Boolean(elements.mapaLote) && !isDashboardPage && !isHistoryPage;
    const isClimatePage = Boolean(elements.climaPanel) && !isDashboardPage && !isHistoryPage && !isMapPage;

    if (!isDashboardPage && !isHistoryPage && !isMapPage && !isClimatePage) {
        return;
    }

    const state = {
        chart: null,
        climate: null,
        map: null,
        mapMarker: null,
        parcelLayer: null,
        parcelPreviewLayer: null,
        parcelPoints: [],
        parcelDrawing: false,
        humiditySource: "manual",
        priceRequestId: 0,
        climateForecast: null
    };

    const fieldIds = [
        "lote",
        "latitud",
        "longitud",
        "cultivo",
        "precio",
        "costoSecada",
        "humedadActual",
        "hectareas",
        "rendimiento",
        "tarifaFlete",
        "distanciaFlete"
    ];

    const resultToneClasses = {
        success: "text-emerald-700",
        warning: "text-amber-600",
        danger: "text-red-600",
        info: "text-slate-600"
    };

    let statusTimeoutId = null;

    if (isDashboardPage) {
        initDashboardPage();
    }

    if (isHistoryPage) {
        initHistoryPage();
    }

    if (isMapPage) {
        initMapPage();
    }

    if (isClimatePage) {
        initClimatePage();
    }

    function initDashboardPage() {
        bindDashboardEvents();
        const savedForm = restoreFormState();
        restoreParcelState(savedForm);
        syncHumidityBase(elements.cultivo.value);
        restorePriceReferenceState();
        ensureLocationDefaults();
        updateClimateLocationLabel();
        initializeMap();

        if (!applyPendingScenario()) {
            fetchClimate();
        }

        if (shouldAutoLoadPrice()) {
            loadInternetPriceReference({ silent: true });
        }

        setActiveNav("dashboard-section");
    }

    function initHistoryPage() {
        bindHistoryEvents();
        renderHistory();
    }

    function initMapPage() {
        bindMapEvents();
        restoreMapState();
        initializeMap();
        updateClimateLocationLabel();
        updateParcelSummary();

        if (hasValidCoordinates()) {
            updateMapLocation(undefined, undefined, { recenter: true });
        }
    }

    function initClimatePage() {
        bindClimateEvents();
        ensureLocationDefaults();
        updateClimateLocationLabel();
        fetchClimate(null, { includeDaily: true });
    }

    function bindDashboardEvents() {
        elements.cultivo.addEventListener("change", handleCropChange);
        elements.btnCalcular.addEventListener("click", () => runSimulation(false));
        elements.btnGuardar.addEventListener("click", () => runSimulation(true));
        elements.btnCargarPrecio?.addEventListener("click", () => loadInternetPriceReference({ force: true }));
        elements.btnUsarHumedadClima?.addEventListener("click", () => {
            syncHumidityFromClimate({ force: true });
            showStatus("Humedad tomada desde el clima.", "success");
        });
        elements.btnRecalcularHectareas?.addEventListener("click", () => handleRecalculateParcelArea({ focus: true }));
        elements.btnEditarHectareas?.addEventListener("click", toggleHectareasManualMode);

        elements.navButtons.forEach((button) => {
            button.addEventListener("click", handleNavigationClick);
        });

        fieldIds.forEach((id) => {
            const field = elements[id];
            if (!field) {
                return;
            }

            field.addEventListener("input", () => {
                if (id === "precio") {
                    markPriceAsManual();
                }
                if (id === "humedadActual") {
                    markHumidityAsManual();
                }
                if (id === "hectareas") {
                    markHectareasAsManual();
                }
                clearFieldState(field);
                saveFormState();
            });

            field.addEventListener("change", () => {
                clearFieldState(field);
                saveFormState();
                if (id === "latitud" || id === "longitud") {
                    updateClimateLocationLabel();
                    if (hasValidCoordinates()) {
                        updateMapLocation();
                        fetchClimate();
                    }
                }
            });
        });
    }

    function bindClimateEvents() {
        elements.btnUsarUbicacion?.addEventListener("click", handleUseLocation);
        elements.btnActualizarClima?.addEventListener("click", () => fetchClimate(null, { includeDaily: true, forceRender: true }));

        ["latitud", "longitud"].forEach((id) => {
            const field = elements[id];
            if (!field) {
                return;
            }

            field.addEventListener("change", () => {
                updateClimateLocationLabel();
                saveFormState();
                fetchClimate(null, { includeDaily: true, forceRender: true });
            });
        });
    }

    function bindMapEvents() {
        elements.btnUsarUbicacion?.addEventListener("click", handleUseLocation);
        elements.btnCargarUbicacion?.addEventListener("click", handleMapConfirmLocation);
        elements.btnIniciarParcela?.addEventListener("click", startParcelDrawing);
        elements.btnFinalizarParcela?.addEventListener("click", finishParcelDrawing);
        elements.btnLimpiarParcela?.addEventListener("click", clearParcelDrawing);

        elements.navButtons.forEach((button) => {
            button.addEventListener("click", handleNavigationClick);
        });

        fieldIds.forEach((id) => {
            const field = elements[id];
            if (!field) {
                return;
            }

            field.addEventListener("input", () => {
                clearFieldState(field);
                saveFormState();
            });

            field.addEventListener("change", () => {
                clearFieldState(field);
                saveFormState();
                if (id === "latitud" || id === "longitud") {
                    updateClimateLocationLabel();
                    if (hasValidCoordinates()) {
                        updateMapLocation(undefined, undefined, { recenter: true });
                    }
                }
            });
        });
    }

    function bindHistoryEvents() {
        elements.btnBorrarHistorial?.addEventListener("click", clearHistory);
        elements.btnExportarHistorial?.addEventListener("click", exportHistory);
        elements.btnLimpiarFiltros?.addEventListener("click", clearFilters);
        elements.tablaHistorial?.addEventListener("click", handleHistoryAction);

        elements.filtroLote?.addEventListener("input", renderHistory);
        elements.filtroCultivo?.addEventListener("change", renderHistory);
    }

    function handleCropChange() {
        const previousPriceSource = elements.precio?.dataset.priceSource || "manual";
        const priceSource = getSelectedPriceSource();
        syncHumidityBase(elements.cultivo.value);

        if (!priceSource && previousPriceSource === "internet" && elements.precio) {
            elements.precio.value = "";
            markPriceAsManual();
        }

        saveFormState();
        if (priceSource && shouldAutoLoadPrice()) {
            loadInternetPriceReference({ silent: true });
        } else {
            if (priceSource) {
                updatePriceReferenceLabel();
            } else if (elements.precioFuente) {
                elements.precioFuente.textContent = elements.precio.value ? "Referencia: precio cargado manualmente" : "Referencia: sin cargar";
            }
        }
    }

    function handleNavigationClick(event) {
        const targetId = event.currentTarget.dataset.scrollTo;
        if (!targetId) {
            return;
        }

        setActiveNav(targetId);
        const target = document.getElementById(targetId);
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function setActiveNav(targetId) {
        elements.navButtons.forEach((button) => {
            button.dataset.active = String(button.dataset.scrollTo === targetId);
        });
    }

    function syncHumidityBase(cultivo) {
        const config = CROPS[cultivo] ?? CROPS.maiz;
        elements.humedadBase.value = config.baseHumidity.toFixed(1);
    }

    function ensureLocationDefaults() {
        if (elements.latitud && !elements.latitud.value) {
            elements.latitud.value = DEFAULT_LOCATION.latitud.toFixed(4);
        }

        if (elements.longitud && !elements.longitud.value) {
            elements.longitud.value = DEFAULT_LOCATION.longitud.toFixed(4);
        }

        saveFormState();
    }

    function initializeMap() {
        if (!elements.mapaLote || state.map || !window.L) {
            return;
        }

        const coordinates = getClimateCoordinates();
        const viewZoom = isMapPage ? MAP_PAGE_ZOOM : DEFAULT_MAP_ZOOM;
        state.map = L.map(elements.mapaLote, { zoomControl: true }).setView([coordinates.latitud, coordinates.longitud], viewZoom);

        const tileLayerConfig = isMapPage
            ? {
                url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                attribution: "Tiles &copy; Esri"
            }
            : {
                url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            };

        L.tileLayer(tileLayerConfig.url, {
            maxZoom: 19,
            attribution: tileLayerConfig.attribution
        }).addTo(state.map);

        state.map.on("click", (event) => {
            if (isMapPage && state.parcelDrawing) {
                addParcelPoint(event.latlng.lat, event.latlng.lng);
                return;
            }

            applyCoordinates(event.latlng.lat, event.latlng.lng, { showStatusMessage: true });
        });

        updateMapLocation(coordinates.latitud, coordinates.longitud, { recenter: true });
    }

    function updateMapLocation(latitud = parseNumber(elements.latitud?.value), longitud = parseNumber(elements.longitud?.value), options = {}) {
        if (!window.L || !elements.mapaLote) {
            return;
        }

        if (!state.map) {
            initializeMap();
        }

        if (!state.map || !hasValidCoordinates(latitud, longitud)) {
            return;
        }

        const { recenter = true } = options;
        const latLng = [latitud, longitud];

        if (state.mapMarker) {
            state.mapMarker.setLatLng(latLng);
        } else {
            state.mapMarker = L.marker(latLng).addTo(state.map);
        }

        state.mapMarker.bindPopup(
            `<strong>${escapeHtml(elements.lote?.value?.trim() || "Lote sin nombre")}</strong><br>${formatDecimal(latitud, 4)}, ${formatDecimal(longitud, 4)}`
        );

        if (recenter) {
            state.map.setView(latLng, state.map.getZoom() || DEFAULT_MAP_ZOOM);
        }

        if (typeof state.map.invalidateSize === "function") {
            window.requestAnimationFrame(() => state.map?.invalidateSize());
        }
    }

    function applyCoordinates(latitud, longitud, options = {}) {
        const { refreshClimate = true, recenterMap = true, showStatusMessage = false } = options;

        if (elements.latitud) {
            elements.latitud.value = Number(latitud).toFixed(4);
        }

        if (elements.longitud) {
            elements.longitud.value = Number(longitud).toFixed(4);
        }

        saveFormState();
        updateClimateLocationLabel(latitud, longitud);
        updateMapLocation(latitud, longitud, { recenter: recenterMap });

        if (refreshClimate) {
            fetchClimate({ latitud, longitud });
        }

        if (showStatusMessage) {
            showStatus("Ubicación actualizada desde el mapa.", "success");
        }
    }

    function handleConfirmLocation() {
        if (!hasValidCoordinates()) {
            showStatus("ElegÃ­ una ubicaciÃ³n vÃ¡lida antes de cargarla al dashboard.", "warning");
            return;
        }

        saveFormState();
        window.location.href = "index.html#dashboard-section";
    }

    function handleMapConfirmLocation() {
        if (!hasValidCoordinates()) {
            showStatus("Elegí una ubicación válida antes de cargarla al dashboard.", "warning");
            return;
        }

        if (state.parcelPoints.length >= 3) {
            const centroid = getParcelCentroid(state.parcelPoints);
            if (centroid) {
                elements.latitud.value = centroid.lat.toFixed(4);
                elements.longitud.value = centroid.lng.toFixed(4);
            }
            renderParcelPreview(true);
        }

        state.parcelDrawing = false;
        persistParcelState();
        saveFormState();
        window.location.href = "index.html#dashboard-section";
    }

    function startParcelDrawing() {
        if (!isMapPage) {
            return;
        }

        state.parcelDrawing = true;
        state.parcelPoints = [];
        clearParcelLayers();
        persistParcelState();
        updateParcelSummary();
        showStatus("Modo parcela activado. Tocá el mapa para sumar vértices.", "info");
    }

    function addParcelPoint(latitud, longitud) {
        if (!state.parcelDrawing) {
            applyCoordinates(latitud, longitud, { refreshClimate: false, recenterMap: true, showStatusMessage: false });
            return;
        }

        state.parcelPoints.push([latitud, longitud]);
        elements.latitud.value = Number(latitud).toFixed(4);
        elements.longitud.value = Number(longitud).toFixed(4);
        renderParcelPreview();
        updateParcelSummary();
        saveFormState();
    }

    function finishParcelDrawing() {
        if (!isMapPage) {
            return;
        }

        if (state.parcelPoints.length < 3) {
            showStatus("Necesitás al menos 3 puntos para cerrar la parcela.", "warning");
            return;
        }

        state.parcelDrawing = false;
        persistParcelState();
        renderParcelPreview(true);

        const centroid = getParcelCentroid(state.parcelPoints);
        if (centroid) {
            elements.latitud.value = centroid.lat.toFixed(4);
            elements.longitud.value = centroid.lng.toFixed(4);
            updateMapLocation(centroid.lat, centroid.lng, { recenter: true });
            updateClimateLocationLabel(centroid.lat, centroid.lng);
        }

        syncParcelAreaToHectareas(calculateParcelAreaHectares(state.parcelPoints), { force: true });
        saveFormState();
        updateParcelSummary();
        showStatus("Parcela guardada. El centro quedó listo para cargar al dashboard.", "success");
    }

    function clearParcelDrawing() {
        if (!isMapPage) {
            return;
        }

        state.parcelDrawing = false;
        state.parcelPoints = [];
        clearParcelLayers();
        writeJson(STORAGE_KEYS.parcel, null);
        if (elements.hectareas) {
            elements.hectareas.value = "";
        }
        setHectareasSource("manual");
        saveFormState();
        updateParcelSummary();
        showStatus("Parcela limpiada.", "info");
    }

    function restoreFormState() {
        const savedForm = readJson(STORAGE_KEYS.form, null);
        if (!savedForm || Array.isArray(savedForm)) {
            restoreHectareasState(null);
            return null;
        }

        if (savedForm.cultivo && CROPS[savedForm.cultivo]) {
            elements.cultivo.value = savedForm.cultivo;
        }

        syncHumidityBase(elements.cultivo.value);

        fieldIds.forEach((id) => {
            if (id === "cultivo") {
                return;
            }

            const field = elements[id];
            if (!field || savedForm[id] === undefined || savedForm[id] === null) {
                return;
            }

            field.value = savedForm[id];
        });

        restorePriceReferenceState(savedForm);
        restoreHectareasState(savedForm);
        restoreHumidityState(savedForm);
        return savedForm;
    }

    function saveFormState() {
        const payload = readJson(STORAGE_KEYS.form, {});
        const nextPayload = payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {};

        fieldIds.forEach((id) => {
            const field = elements[id];
            if (field) {
                nextPayload[id] = field.value;
            }
        });

        nextPayload.precioSource = elements.precio?.dataset.priceSource || nextPayload.precioSource || "manual";
        nextPayload.precioSourceLabel = elements.precioFuente?.textContent || nextPayload.precioSourceLabel || "";
        nextPayload.precioSourceUpdatedAt = elements.precio?.dataset.priceSourceUpdatedAt || nextPayload.precioSourceUpdatedAt || "";
        nextPayload.precioSourceSymbol = elements.precio?.dataset.priceSourceSymbol || nextPayload.precioSourceSymbol || "";
        nextPayload.precioSourceName = elements.precio?.dataset.priceSourceName || nextPayload.precioSourceName || "";
        nextPayload.hectareasSource = elements.hectareas?.dataset.areaSource || nextPayload.hectareasSource || "manual";
        nextPayload.humedadSource = elements.humedadActual?.dataset.humiditySource || nextPayload.humedadSource || "manual";

        writeJson(STORAGE_KEYS.form, nextPayload);
    }

    function restoreMapState() {
        if (!elements.latitud || !elements.longitud) {
            return;
        }

        const savedForm = readJson(STORAGE_KEYS.form, null);
        if (savedForm && typeof savedForm === "object" && !Array.isArray(savedForm)) {
            if (savedForm.latitud !== undefined && savedForm.latitud !== null) {
                elements.latitud.value = savedForm.latitud;
            }

            if (savedForm.longitud !== undefined && savedForm.longitud !== null) {
                elements.longitud.value = savedForm.longitud;
            }
        }

        if (!hasValidCoordinates()) {
            elements.latitud.value = DEFAULT_LOCATION.latitud.toFixed(4);
            elements.longitud.value = DEFAULT_LOCATION.longitud.toFixed(4);
        }

        saveFormState();
        restoreParcelState(readJson(STORAGE_KEYS.form, null));
    }

    function restoreHectareasState(savedForm = null) {
        if (!elements.hectareas) {
            return;
        }

        const savedParcel = readJson(STORAGE_KEYS.parcel, null);
        const parcelArea = Array.isArray(savedParcel?.points) ? calculateParcelAreaHectares(savedParcel.points) : 0;
        const storedHectareas = parseNumber(savedForm?.hectareas ?? elements.hectareas.value);
        const hasExplicitSource = savedForm && Object.prototype.hasOwnProperty.call(savedForm, "hectareasSource");

        let source = savedForm?.hectareasSource || elements.hectareas.dataset.areaSource || "manual";
        if (!hasExplicitSource && parcelArea > 0) {
            if (!Number.isFinite(storedHectareas) || Math.abs(storedHectareas - parcelArea) < 0.05) {
                source = "parcel";
            }
        }

        if (source === "parcel") {
            setHectareasSource("parcel");
            elements.hectareas.readOnly = true;
            return;
        }

        setHectareasSource("manual");
        elements.hectareas.readOnly = false;
    }

    function restoreHumidityState(savedForm = null) {
        if (!elements.humedadActual) {
            return;
        }

        const hasExplicitSource = savedForm && Object.prototype.hasOwnProperty.call(savedForm, "humedadSource");
        const source = hasExplicitSource
            ? (savedForm.humedadSource || "manual")
            : (elements.humedadActual.dataset.humiditySource || "manual");

        setHumiditySource(source);
    }

    function syncHumidityFromClimate(options = {}) {
        const { force = false } = options;
        if (!elements.humedadActual || !state.climate || !Number.isFinite(state.climate.humidity)) {
            return false;
        }

        if (!force && getHumiditySource() === "manual") {
            return false;
        }

        elements.humedadActual.value = state.climate.humidity.toFixed(1);
        setHumiditySource("climate");
        saveFormState();
        return true;
    }

    function restoreParcelState(savedForm = null) {
        const savedParcel = readJson(STORAGE_KEYS.parcel, null);
        if (!savedParcel || typeof savedParcel !== "object" || !Array.isArray(savedParcel.points)) {
            updateParcelSummary();
            return;
        }

        state.parcelDrawing = Boolean(savedParcel.drawing);
        state.parcelPoints = savedParcel.points
            .map((point) => [parseNumber(point?.[0]), parseNumber(point?.[1])])
            .filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng));

        renderParcelPreview(true);
        const shouldAutoFill = (savedForm?.hectareasSource || elements.hectareas?.dataset.areaSource || "manual") !== "manual";
        if (shouldAutoFill) {
            syncParcelAreaToHectareas(calculateParcelAreaHectares(state.parcelPoints), { force: true });
        }
        updateParcelSummary();
    }

    function persistParcelState() {
        writeJson(STORAGE_KEYS.parcel, {
            drawing: state.parcelDrawing,
            points: state.parcelPoints,
            areaHectares: calculateParcelAreaHectares(state.parcelPoints),
            updatedAt: new Date().toISOString()
        });
    }

    function clearParcelLayers() {
        if (state.parcelLayer && state.map) {
            state.map.removeLayer(state.parcelLayer);
        }

        if (state.parcelPreviewLayer && state.map) {
            state.map.removeLayer(state.parcelPreviewLayer);
        }

        state.parcelLayer = null;
        state.parcelPreviewLayer = null;
    }

    function renderParcelPreview(finalize = false) {
        if (!state.map || !window.L) {
            return;
        }

        clearParcelLayers();

        if (state.parcelPoints.length === 0) {
            return;
        }

        const layerPoints = [...state.parcelPoints];
        const style = {
            color: "#ef4444",
            weight: 3,
            fillColor: "#f87171",
            fillOpacity: finalize && layerPoints.length >= 3 ? 0.18 : 0.1
        };

        if (finalize && layerPoints.length >= 3) {
            state.parcelLayer = L.polygon(layerPoints, style).addTo(state.map);
            state.parcelLayer.bindPopup(buildParcelPopup());
            if (typeof state.map.fitBounds === "function") {
                state.map.fitBounds(state.parcelLayer.getBounds().pad(0.08));
            }
            return;
        }

        state.parcelPreviewLayer = layerPoints.length >= 3
            ? L.polygon(layerPoints, style).addTo(state.map)
            : L.polyline(layerPoints, style).addTo(state.map);
    }

    function buildParcelPopup() {
        const area = calculateParcelAreaHectares(state.parcelPoints);
        const points = state.parcelPoints.length;
        return `
            <strong>Parcela marcada</strong><br>
            Vértices: ${points}<br>
            Área estimada: ${formatDecimal(area, 2)} ha
        `;
    }

    function updateParcelSummary() {
        const parcelArea = calculateParcelAreaHectares(state.parcelPoints);

        if (elements.parcelaResumen) {
            if (state.parcelPoints.length >= 3) {
                elements.parcelaResumen.textContent = `Parcela marcada: ${state.parcelPoints.length} vértices · ${formatDecimal(parcelArea, 2)} ha`;
            } else if (state.parcelPoints.length > 0) {
                elements.parcelaResumen.textContent = `Parcela en dibujo: ${state.parcelPoints.length} vértices`;
            } else {
                elements.parcelaResumen.textContent = "Parcela: sin marcar";
            }
        }

        if (elements.parcelaArea) {
            elements.parcelaArea.textContent = state.parcelPoints.length >= 3 ? `${formatDecimal(parcelArea, 2)} ha` : "--";
        }

        if (elements.heroParcelaResumen) {
            if (state.parcelPoints.length >= 3) {
                elements.heroParcelaResumen.textContent = `Marcada · ${state.parcelPoints.length} vértices`;
            } else if (state.parcelPoints.length > 0) {
                elements.heroParcelaResumen.textContent = `En dibujo · ${state.parcelPoints.length} vértices`;
            } else {
                elements.heroParcelaResumen.textContent = "Pendiente";
            }
        }

        if (elements.heroParcelaArea) {
            elements.heroParcelaArea.textContent = state.parcelPoints.length >= 3 ? `${formatDecimal(parcelArea, 2)} ha` : "--";
        }
    }

    function syncParcelAreaToHectareas(areaOverride = null, options = {}) {
        if (!elements.hectareas) {
            return;
        }

        const { force = false } = options;
        if (!force && getHectareasSource() === "manual") {
            return;
        }

        const area = Number.isFinite(areaOverride) ? areaOverride : calculateParcelAreaHectares(state.parcelPoints);
        if (!Number.isFinite(area) || area <= 0) {
            return;
        }

        elements.hectareas.value = area.toFixed(2);
        setHectareasSource("parcel");
        saveFormState();
    }

    function handleRecalculateParcelArea(options = {}) {
        const { focus = false } = options;
        const area = calculateParcelAreaHectares(state.parcelPoints);

        if (!Number.isFinite(area) || area <= 0) {
            showStatus("No hay una parcela guardada para recalcular.", "warning");
            return;
        }

        syncParcelAreaToHectareas(area, { force: true });
        if (focus) {
            elements.hectareas?.focus();
        }
        updateParcelSummary();
        showStatus("Hectáreas recalculadas desde la parcela.", "success");
    }

    function toggleHectareasManualMode() {
        if (getHectareasSource() === "parcel") {
            setHectareasSource("manual");
            saveFormState();
            elements.hectareas?.focus();
            showStatus("Hectáreas quedó en modo manual.", "info");
            return;
        }

        handleRecalculateParcelArea({ focus: true });
    }

    function markHectareasAsManual() {
        setHectareasSource("manual");
    }

    function setHectareasSource(source) {
        if (!elements.hectareas) {
            return;
        }

        const normalizedSource = source === "parcel" ? "parcel" : "manual";
        elements.hectareas.dataset.areaSource = normalizedSource;
        elements.hectareas.readOnly = normalizedSource === "parcel";
        elements.hectareas.setAttribute("aria-readonly", String(normalizedSource === "parcel"));
        elements.hectareas.classList.toggle("bg-slate-100", normalizedSource === "parcel");
        elements.hectareas.classList.toggle("bg-slate-50", normalizedSource !== "parcel");

        if (elements.hectareasOrigen) {
            elements.hectareasOrigen.textContent = normalizedSource === "parcel"
                ? "Origen: parcela"
                : "Origen: manual";
        }

        if (elements.btnEditarHectareas) {
            elements.btnEditarHectareas.textContent = normalizedSource === "parcel" ? "Editar" : "Auto";
        }
    }

    function getHectareasSource() {
        return elements.hectareas?.dataset.areaSource || "manual";
    }

    function setHumiditySource(source) {
        if (!elements.humedadActual) {
            return;
        }

        const normalizedSource = source === "manual" ? "manual" : "climate";
        elements.humedadActual.dataset.humiditySource = normalizedSource;

        if (elements.humedadOrigen) {
            elements.humedadOrigen.textContent = normalizedSource === "climate"
                ? "Origen: clima"
                : "Origen: manual";
        }

        if (elements.btnUsarHumedadClima) {
            elements.btnUsarHumedadClima.textContent = normalizedSource === "climate" ? "Editar manual" : "Usar clima";
        }
    }

    function getHumiditySource() {
        return elements.humedadActual?.dataset.humiditySource || "manual";
    }

    function markHumidityAsManual() {
        setHumiditySource("manual");
    }

    function calculateParcelAreaHectares(points) {
        if (!Array.isArray(points) || points.length < 3) {
            return 0;
        }

        const projected = points.map(([lat, lng]) => projectToMeters(lat, lng));
        let area = 0;

        for (let index = 0; index < projected.length; index += 1) {
            const current = projected[index];
            const next = projected[(index + 1) % projected.length];
            area += current.x * next.y - next.x * current.y;
        }

        return Math.abs(area) / 2 / 10000;
    }

    function getParcelCentroid(points) {
        if (!Array.isArray(points) || points.length < 3) {
            return null;
        }

        const projected = points.map(([lat, lng]) => projectToMeters(lat, lng));
        let twiceArea = 0;
        let centroidX = 0;
        let centroidY = 0;

        for (let index = 0; index < projected.length; index += 1) {
            const current = projected[index];
            const next = projected[(index + 1) % projected.length];
            const cross = current.x * next.y - next.x * current.y;
            twiceArea += cross;
            centroidX += (current.x + next.x) * cross;
            centroidY += (current.y + next.y) * cross;
        }

        if (twiceArea === 0) {
            return null;
        }

        const factor = 1 / (3 * twiceArea);
        return projectFromMeters(centroidX * factor, centroidY * factor);
    }

    function projectToMeters(latitud, longitud) {
        const radius = 6378137;
        const x = radius * (Number(longitud) * Math.PI / 180);
        const y = radius * Math.log(Math.tan(Math.PI / 4 + (Number(latitud) * Math.PI / 360)));
        return { x, y };
    }

    function projectFromMeters(x, y) {
        const radius = 6378137;
        const lng = x / radius * 180 / Math.PI;
        const lat = (2 * Math.atan(Math.exp(y / radius)) - Math.PI / 2) * 180 / Math.PI;
        return { lat, lng };
    }

    function getSelectedPriceSource() {
        return PRICE_SOURCES[elements.cultivo?.value] ?? null;
    }

    function shouldAutoLoadPrice() {
        if (!elements.precio) {
            return false;
        }

        const hasPriceValue = Boolean((elements.precio.value || "").trim());
        const priceSource = elements.precio.dataset.priceSource || "manual";
        return !hasPriceValue || priceSource === "internet";
    }

    function restorePriceReferenceState(savedForm = null) {
        if (!elements.precio || !elements.precioFuente) {
            return;
        }

        const priceValue = (elements.precio.value || "").trim();
        const hasSavedSource = savedForm && Object.prototype.hasOwnProperty.call(savedForm, "precioSource");
        const savedSource = hasSavedSource
            ? (savedForm.precioSource || (priceValue ? "manual" : ""))
            : (elements.precio.dataset.priceSource || (priceValue ? "manual" : ""));
        const savedLabel = savedForm?.precioSourceLabel || "";
        const savedUpdatedAt = savedForm?.precioSourceUpdatedAt || "";
        const savedSymbol = savedForm?.precioSourceSymbol || "";
        const savedSourceName = savedForm?.precioSourceName || "";

        elements.precio.dataset.priceSource = savedSource || (priceValue ? "manual" : "");
        elements.precio.dataset.priceSourceUpdatedAt = savedUpdatedAt || "";
        elements.precio.dataset.priceSourceSymbol = savedSymbol || "";
        elements.precio.dataset.priceSourceName = savedSourceName || "";

        if (savedLabel) {
            elements.precioFuente.textContent = savedLabel;
            return;
        }

        if (priceValue) {
            elements.precioFuente.textContent = elements.precio.dataset.priceSource === "internet"
                ? "Referencia: precio cargado desde internet"
                : "Referencia: precio cargado manualmente";
            return;
        }

        elements.precioFuente.textContent = "Referencia: sin cargar";
    }

    function markPriceAsManual() {
        if (!elements.precio || !elements.precioFuente) {
            return;
        }

        elements.precio.dataset.priceSource = "manual";
        delete elements.precio.dataset.priceSourceUpdatedAt;
        delete elements.precio.dataset.priceSourceSymbol;
        delete elements.precio.dataset.priceSourceName;

        if ((elements.precio.value || "").trim()) {
            elements.precioFuente.textContent = "Referencia: precio cargado manualmente";
        } else {
            elements.precioFuente.textContent = "Referencia: sin cargar";
        }
    }

    function updatePriceReferenceLabel(message = null) {
        if (!elements.precioFuente) {
            return;
        }

        if (message) {
            elements.precioFuente.textContent = message;
            return;
        }

        const priceSource = elements.precio?.dataset.priceSource || "manual";
        const hasPriceValue = Boolean((elements.precio?.value || "").trim());

        if (!hasPriceValue) {
            elements.precioFuente.textContent = "Referencia: sin cargar";
            return;
        }

        elements.precioFuente.textContent = priceSource === "internet"
            ? "Referencia: precio cargado desde internet"
            : "Referencia: precio cargado manualmente";
    }

    function getCachedPriceReference(crop) {
        const cache = readJson(STORAGE_KEYS.priceCache, {});
        const entry = cache?.[crop];
        if (!entry) {
            return null;
        }

        const cachedAt = parseDate(entry.cachedAt);
        if (!Number.isFinite(cachedAt) || Date.now() - cachedAt > PRICE_CACHE_TTL_MS) {
            return null;
        }

        return entry;
    }

    function saveCachedPriceReference(crop, reference) {
        const cache = readJson(STORAGE_KEYS.priceCache, {});
        const nextCache = cache && !Array.isArray(cache) ? cache : {};
        nextCache[crop] = {
            ...reference,
            cachedAt: new Date().toISOString()
        };

        writeJson(STORAGE_KEYS.priceCache, nextCache);
    }

    function applyInternetPriceReference(reference) {
        if (!elements.precio || !elements.precioFuente) {
            return;
        }

        elements.precio.value = Number.isFinite(reference.arsPerTon) ? reference.arsPerTon.toFixed(2) : "";
        elements.precio.dataset.priceSource = "internet";
        elements.precio.dataset.priceSourceUpdatedAt = reference.updatedAt || "";
        elements.precio.dataset.priceSourceSymbol = reference.symbol || "";
        elements.precio.dataset.priceSourceName = reference.sourceName || "";

        const updatedAtLabel = reference.updatedAt ? ` · ${formatDateTime(reference.updatedAt)}` : "";
        elements.precioFuente.textContent = `Referencia automatica: ${reference.cropLabel} US$ ${formatDecimal(reference.priceUsdPerBushel, 2)}/bu · dolar ${reference.dollarName} $ ${formatDecimal(reference.arsPerUsd, 0)}/US$${updatedAtLabel}`;
        clearFieldState(elements.precio);
        saveFormState();
    }

    async function loadInternetPriceReference(options = {}) {
        const { force = false, silent = false } = options;
        const priceSource = getSelectedPriceSource();
        const requestedCrop = elements.cultivo?.value;

        if (!priceSource) {
            updatePriceReferenceLabel("Referencia: girasol sin carga automatica");
            if (!silent) {
                showStatus("Girasol no tiene una referencia automatica confiable. Deje el precio manual.", "warning");
            }
            return null;
        }

        if (!force) {
            const cached = getCachedPriceReference(elements.cultivo.value);
            if (cached) {
                if (requestedCrop !== elements.cultivo?.value) {
                    return null;
                }
                applyInternetPriceReference(cached);
                if (!silent) {
                    showStatus(`Precio cargado desde cache para ${priceSource.label}.`, "info");
                }
                return cached;
            }
        }

        const requestId = ++state.priceRequestId;

        if (elements.btnCargarPrecio) {
            elements.btnCargarPrecio.disabled = true;
            elements.btnCargarPrecio.textContent = "Cargando...";
        }

        if (elements.precioFuente) {
            elements.precioFuente.textContent = `Cargando referencia para ${priceSource.label}...`;
        }

        try {
            const [commodityQuote, dollarQuote] = await Promise.all([
                fetchCommodityQuote(priceSource.yahooSymbol),
                fetchDollarReference()
            ]);

            if (requestId !== state.priceRequestId) {
                return null;
            }

            if (requestedCrop !== elements.cultivo?.value) {
                return null;
            }

            const reference = {
                crop: elements.cultivo.value,
                cropLabel: priceSource.label,
                symbol: priceSource.yahooSymbol,
                sourceName: commodityQuote.sourceName,
                dollarName: dollarQuote.sourceName,
                priceUsdPerBushel: commodityQuote.priceUsdPerBushel,
                arsPerUsd: dollarQuote.arsPerUsd,
                usdPerTon: commodityQuote.priceUsdPerBushel * priceSource.bushelsPerTon,
                arsPerTon: commodityQuote.priceUsdPerBushel * priceSource.bushelsPerTon * dollarQuote.arsPerUsd,
                updatedAt: commodityQuote.updatedAt || dollarQuote.updatedAt || new Date().toISOString()
            };

            saveCachedPriceReference(elements.cultivo.value, reference);
            applyInternetPriceReference(reference);

            if (!silent) {
                showStatus(`Precio cargado desde internet para ${priceSource.label}.`, "success");
            }

            return reference;
        } catch (error) {
            const cached = getCachedPriceReference(elements.cultivo.value);
            if (cached) {
                applyInternetPriceReference(cached);
                if (!silent) {
                    showStatus(`No se pudo actualizar desde internet. Use el ultimo precio guardado para ${priceSource.label}.`, "warning");
                }
                return cached;
            }

            updatePriceReferenceLabel("Referencia: sin conectar");
            if (!silent) {
                showStatus(`No se pudo cargar el precio de internet para ${priceSource.label}.`, "danger");
            }

            return null;
        } finally {
            if (elements.btnCargarPrecio) {
                elements.btnCargarPrecio.disabled = false;
                elements.btnCargarPrecio.textContent = "Precio internet";
            }
        }
    }

    async function fetchCommodityQuote(symbol) {
        const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d&interval=1d`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const result = data?.chart?.result?.[0];
        const meta = result?.meta ?? {};
        let priceRaw = parseNumber(meta.regularMarketPrice);

        if (!Number.isFinite(priceRaw)) {
            const closeSeries = result?.indicators?.quote?.[0]?.close ?? [];
            const lastClose = [...closeSeries].reverse().find((value) => Number.isFinite(parseNumber(value)));
            priceRaw = parseNumber(lastClose);
        }

        if (!Number.isFinite(priceRaw)) {
            throw new Error("No se pudo leer el precio del futuro");
        }

        const currency = String(meta.currency || "").toUpperCase();
        const priceUsdPerBushel = currency === "USX" ? priceRaw / 100 : priceRaw;
        const updatedAt = Number.isFinite(meta.regularMarketTime)
            ? new Date(meta.regularMarketTime * 1000).toISOString()
            : new Date().toISOString();

        return {
            sourceName: meta.shortName || meta.fullExchangeName || symbol,
            priceUsdPerBushel,
            updatedAt
        };
    }

    async function fetchDollarReference() {
        const response = await fetch("https://dolarapi.com/v1/dolares/oficial");
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const arsPerUsd = parseNumber(data?.venta);
        if (!Number.isFinite(arsPerUsd)) {
            throw new Error("No se pudo leer el tipo de cambio");
        }

        return {
            sourceName: data?.nombre || "Dolar oficial",
            arsPerUsd,
            updatedAt: data?.fechaActualizacion || new Date().toISOString()
        };
    }

    function parseDate(value) {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? NaN : date.getTime();
    }

    function clearFieldState(field) {
        field.classList.remove("border-red-400", "ring-4", "ring-red-500/10");
        field.removeAttribute("aria-invalid");
    }

    function markFieldInvalid(field) {
        field.classList.add("border-red-400", "ring-4", "ring-red-500/10");
        field.setAttribute("aria-invalid", "true");
    }

    function clearInvalidState() {
        fieldIds.forEach((id) => {
            const field = elements[id];
            if (!field) {
                return;
            }

            clearFieldState(field);
        });
    }

    function highlightInvalidFields(invalidIds) {
        invalidIds.forEach((id) => {
            const field = elements[id];
            if (field) {
                markFieldInvalid(field);
            }
        });

        const firstField = invalidIds
            .map((id) => elements[id])
            .find(Boolean);

        firstField?.focus();
    }

    function runSimulation(saveToHistory) {
        const form = readFormValues();
        const validation = validateForm(form);

        if (!validation.valid) {
            highlightInvalidFields(validation.invalidIds);
            showStatus(validation.message, "danger");
            return null;
        }

        clearInvalidState();

        const result = calculateScenario(form);
        renderResults(result);

        if (saveToHistory) {
            persistScenario(result);
            showStatus("Escenario guardado en el historial.", "success");
        } else {
            showStatus("Simulación actualizada.", "info");
        }

        return result;
    }

    function readFormValues() {
        const lote = (elements.lote.value || "").trim();
        const cultivo = elements.cultivo.value;
        const humidityBase = CROPS[cultivo]?.baseHumidity ?? parseNumber(elements.humedadBase.value) ?? 0;
        const humiditySource = getHumiditySource();
        let humidityActual = readHumidityValue();

        if (!Number.isFinite(humidityActual) && humiditySource === "climate" && Number.isFinite(state.climate?.humidity)) {
            humidityActual = state.climate.humidity;
        }

        return {
            lote: lote || "Lote sin nombre",
            latitud: parseNumber(elements.latitud.value),
            longitud: parseNumber(elements.longitud.value),
            cultivo,
            precio: parseNumber(elements.precio.value),
            precioSource: elements.precio?.dataset.priceSource || "manual",
            precioSourceLabel: elements.precioFuente?.textContent || "",
            precioSourceUpdatedAt: elements.precio?.dataset.priceSourceUpdatedAt || "",
            precioSourceSymbol: elements.precio?.dataset.priceSourceSymbol || "",
            precioSourceName: elements.precio?.dataset.priceSourceName || "",
            costoSecada: parseNumber(elements.costoSecada.value),
            humedadActual: humidityActual,
            humedadBase: humidityBase,
            hectareas: parseNumber(elements.hectareas.value),
            rendimiento: parseNumber(elements.rendimiento.value),
            tarifaFlete: parseOptionalNumber(elements.tarifaFlete?.value, 0),
            distanciaFlete: parseOptionalNumber(elements.distanciaFlete?.value, 0)
        };
    }

    function readHumidityValue() {
        if (!elements.humedadActual) {
            return NaN;
        }

        const rawValue = String(elements.humedadActual.value ?? "").trim();

        return normalizeHumidityInput(rawValue);
    }

    function normalizeHumidityInput(rawValue) {
        const text = String(rawValue ?? "").trim();

        if (!text) {
            return NaN;
        }

        const parsed = parseNumber(text);
        if (Number.isFinite(parsed)) {
            if (parsed > 100 && parsed <= 1000 && !/[.,]/.test(text)) {
                const scaled = parsed / 10;
                if (scaled >= 0 && scaled <= 100) {
                    return scaled;
                }
            }
            return parsed;
        }

        const match = text.match(/[-+]?\d+(?:[.,]\d+)?/);
        if (match) {
            const extracted = parseNumber(match[0]);
            if (Number.isFinite(extracted)) {
                return extracted;
            }
        }

        return NaN;
    }

    function validateForm(form) {
        const invalidIds = [];
        const humidityActual = form.humedadActual;

        if (!Number.isFinite(form.precio) || form.precio <= 0) {
            invalidIds.push("precio");
        }

        if (!Number.isFinite(form.hectareas) || form.hectareas <= 0) {
            invalidIds.push("hectareas");
        }

        if (!Number.isFinite(form.rendimiento) || form.rendimiento <= 0) {
            invalidIds.push("rendimiento");
        }

        if (!Number.isFinite(humidityActual) || humidityActual < 0 || humidityActual > 100) {
            invalidIds.push("humedadActual");
        } else {
            form.humedadActual = humidityActual;
            if (elements.humedadActual && elements.humedadActual.value !== String(humidityActual)) {
                elements.humedadActual.value = humidityActual.toFixed(1);
                saveFormState();
            }
        }

        if (!Number.isFinite(form.latitud) || form.latitud < -90 || form.latitud > 90) {
            invalidIds.push("latitud");
        }

        if (!Number.isFinite(form.longitud) || form.longitud < -180 || form.longitud > 180) {
            invalidIds.push("longitud");
        }

        if (!Number.isFinite(form.costoSecada) || form.costoSecada < 0) {
            invalidIds.push("costoSecada");
        }

        if (!Number.isFinite(form.tarifaFlete) || form.tarifaFlete < 0) {
            invalidIds.push("tarifaFlete");
        }

        if (!Number.isFinite(form.distanciaFlete) || form.distanciaFlete < 0) {
            invalidIds.push("distanciaFlete");
        }

        if (invalidIds.length > 0) {
            const labels = {
                precio: "precio",
                hectareas: "hectáreas",
                rendimiento: "rendimiento",
                humedadActual: "humedad actual",
                latitud: "latitud",
                longitud: "longitud",
                costoSecada: "costo de secada",
                tarifaFlete: "tarifa de flete",
                distanciaFlete: "distancia de flete"
            };

            const fields = invalidIds.map((id) => labels[id] ?? id);
            return {
                valid: false,
                invalidIds,
                message: `Completá correctamente: ${fields.join(", ")}.`
            };
        }

        return { valid: true, invalidIds: [] };
    }

    function calculateScenario(form) {
        const produccion = form.hectareas * form.rendimiento;
        const ingresoBruto = produccion * form.precio;
        const puntosSecada = Math.max(0, form.humedadActual - form.humedadBase);
        const costoTotalSecada = produccion * puntosSecada * form.costoSecada;
        const costoTotalFlete = produccion * form.tarifaFlete * form.distanciaFlete;
        const gastosTotales = costoTotalSecada + costoTotalFlete;
        const ingresoNeto = ingresoBruto - gastosTotales;
        const margenPct = ingresoBruto > 0 ? (ingresoNeto / ingresoBruto) * 100 : 0;
        const recommendation = buildRecommendation({
            ...form,
            produccion,
            ingresoBruto,
            costoTotalSecada,
            costoTotalFlete,
            gastosTotales,
            ingresoNeto,
            margenPct,
            puntosSecada,
            latitud: form.latitud,
            longitud: form.longitud,
            climateHumidity: state.climate?.humidity ?? null,
            windKmH: state.climate?.wind ?? null
        });

        return {
            id: Date.now(),
            createdAt: new Date().toISOString(),
            ...form,
            produccion,
            ingresoBruto,
            costoTotalSecada,
            costoTotalFlete,
            gastosTotales,
            ingresoNeto,
            margenPct,
            puntosSecada,
            latitud: form.latitud,
            longitud: form.longitud,
            climateHumidity: state.climate?.humidity ?? null,
            windKmH: state.climate?.wind ?? null,
            recommendationTone: recommendation.tone,
            recommendationText: recommendation.text
        };
    }

    function buildRecommendation(result) {
        const cropName = CROPS[result.cultivo]?.label ?? result.cultivo;
        const humidityGap = Math.max(0, result.humedadActual - result.humedadBase);
        const marginPct = result.margenPct;
        const parts = [];
        let tone = "success";

        if (result.ingresoNeto < 0) {
            tone = "danger";
            parts.push(`Margen negativo: ${formatCurrency(result.ingresoNeto)}.`);
        } else if (marginPct >= 20) {
            parts.push("Buen escenario: el margen sobre ingresos es saludable.");
        } else if (marginPct >= 5) {
            tone = "warning";
            parts.push("Margen positivo, pero con poco colchón.");
        } else {
            tone = "warning";
            parts.push("El margen está muy ajustado y conviene comparar alternativas.");
        }

        if (humidityGap <= 0) {
            parts.push(`${cropName} está por debajo de la humedad base, sin castigo por secada.`);
        } else if (humidityGap <= 2) {
            tone = tone === "danger" ? "danger" : "warning";
            parts.push(`Secada moderada: ${formatDecimal(humidityGap, 1)} puntos por encima de la base.`);
        } else {
            tone = "warning";
            parts.push(`Secada alta: ${formatDecimal(humidityGap, 1)} puntos adicionales recortan el resultado.`);
        }

        if (Number.isFinite(result.windKmH)) {
            if (result.windKmH > 35) {
                tone = "danger";
                parts.push(`Viento fuerte (${formatDecimal(result.windKmH, 1)} km/h) eleva el riesgo operativo.`);
            } else if (result.windKmH > 25 && tone !== "danger") {
                tone = "warning";
                parts.push(`Viento moderado (${formatDecimal(result.windKmH, 1)} km/h): revisá la ventana de trabajo.`);
            }
        }

        return {
            tone,
            text: parts.join(" ")
        };
    }

    function renderResults(result) {
        elements.produccion.textContent = `${formatDecimal(result.produccion, 2)} tn`;
        elements.ingreso.textContent = formatCurrency(result.ingresoBruto);
        elements.costos.textContent = formatCurrency(result.gastosTotales);
        elements.resultado.textContent = formatCurrency(result.ingresoNeto);
        elements.resultado.className = `mt-1 text-2xl font-extrabold ${result.ingresoNeto >= 0 ? "text-emerald-700" : "text-red-600"}`;

        elements.recomendacion.textContent = result.recommendationText;
        elements.recomendacion.className = `mt-2 text-base font-semibold ${resultToneClasses[result.recommendationTone] ?? resultToneClasses.info}`;

        renderChart(result.ingresoBruto, result.gastosTotales, result.ingresoNeto);
    }

    function renderChart(bruto, gastos, neto) {
        if (!elements.graficoRentabilidad) {
            return;
        }

        const context = elements.graficoRentabilidad.getContext("2d");
        if (!context) {
            return;
        }

        if (state.chart) {
            state.chart.destroy();
        }

        state.chart = new Chart(context, {
            type: "bar",
            data: {
                labels: ["Ingreso Bruto", "Gastos Totales", "Margen Neto"],
                datasets: [{
                    data: [bruto, gastos, neto],
                    backgroundColor: ["#16a34a", "#f97316", neto >= 0 ? "#2563eb" : "#dc2626"],
                    borderRadius: 12,
                    borderSkipped: false,
                    barThickness: 42
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (tooltipItem) => ` ${formatCurrency(tooltipItem.parsed.y)}`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: "#e2e8f0" },
                        ticks: {
                            callback: (value) => `$ ${formatCompactNumber(value)}`
                        }
                    }
                }
            }
        });
    }

    function persistScenario(result) {
        const history = readHistory();
        history.push(result);
        writeHistory(history);
        renderHistory();
    }

    function renderHistory() {
        if (!elements.tablaHistorial) {
            return;
        }

        const history = filterHistory(readHistory());
        elements.tablaHistorial.replaceChildren();
        renderHistorySummary(history);

        if (history.length === 0) {
            const emptyRow = document.createElement("tr");
            const emptyCell = document.createElement("td");
            emptyCell.colSpan = 8;
            emptyCell.className = "p-4 text-center italic text-slate-400";
            emptyCell.textContent = hasActiveFilters()
                ? "No se encontraron escenarios que coincidan con los filtros."
                : "No hay escenarios guardados para comparar todavía.";
            emptyRow.appendChild(emptyCell);
            elements.tablaHistorial.appendChild(emptyRow);
            return;
        }

        const fragment = document.createDocumentFragment();
        [...history].reverse().forEach((entry) => {
            const row = document.createElement("tr");
            row.className = "transition-colors hover:bg-slate-50";

            appendCell(row, entry.lote ?? "Lote sin nombre", "p-3 font-semibold text-slate-700");
            appendCell(row, getCropLabel(entry.cultivo), "p-3 font-semibold uppercase text-xs text-slate-700");
            appendCell(row, `${formatDecimal(entry.produccion, 2)} tn`, "p-3");
            appendCell(row, `${formatDecimal(entry.humedadActual, 1)}%`, "p-3 font-medium text-amber-600");
            appendCell(row, formatCurrency(entry.gastosTotales), "p-3 text-red-500");
            appendCell(row, formatCurrency(entry.ingresoNeto), `p-3 font-bold ${entry.ingresoNeto >= 0 ? "text-emerald-600" : "text-red-600"}`);
            appendCell(row, formatDateTime(entry.createdAt), "p-3 text-slate-500");

            const actionCell = document.createElement("td");
            actionCell.className = "p-3";

            const actionsWrap = document.createElement("div");
            actionsWrap.className = "flex items-center gap-2";

            const loadButton = document.createElement("button");
            loadButton.type = "button";
            loadButton.dataset.action = "load";
            loadButton.dataset.id = String(entry.id);
            loadButton.className = "rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[11px] font-bold text-blue-700 transition-colors hover:bg-blue-100";
            loadButton.textContent = "Cargar";
            loadButton.setAttribute("aria-label", `Cargar escenario de ${getCropLabel(entry.cultivo)}`);

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.dataset.action = "delete";
            deleteButton.dataset.id = String(entry.id);
            deleteButton.className = "rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-bold text-red-600 transition-colors hover:bg-red-100";
            deleteButton.textContent = "✕";
            deleteButton.setAttribute("aria-label", `Eliminar escenario de ${getCropLabel(entry.cultivo)}`);

            actionsWrap.appendChild(loadButton);
            actionsWrap.appendChild(deleteButton);
            actionCell.appendChild(actionsWrap);
            row.appendChild(actionCell);
            fragment.appendChild(row);
        });

        elements.tablaHistorial.appendChild(fragment);
    }

    function renderHistorySummary(history) {
        if (elements.summaryCount) {
            elements.summaryCount.textContent = String(history.length);
        }

        if (history.length === 0) {
            if (elements.summaryAvgMargin) {
                elements.summaryAvgMargin.textContent = "--";
            }
            if (elements.summaryBest) {
                elements.summaryBest.textContent = "--";
            }
            if (elements.summaryWorst) {
                elements.summaryWorst.textContent = "--";
            }
            return;
        }

        const avgMargin = history.reduce((sum, entry) => sum + (entry.margenPct ?? 0), 0) / history.length;
        const best = history.reduce((acc, entry) => (entry.ingresoNeto > acc.ingresoNeto ? entry : acc), history[0]);
        const worst = history.reduce((acc, entry) => (entry.ingresoNeto < acc.ingresoNeto ? entry : acc), history[0]);

        if (elements.summaryAvgMargin) {
            elements.summaryAvgMargin.textContent = `${formatDecimal(avgMargin, 1)}%`;
        }

        if (elements.summaryBest) {
            elements.summaryBest.textContent = `${entrySummaryLabel(best)} · ${formatCurrency(best.ingresoNeto)}`;
        }

        if (elements.summaryWorst) {
            elements.summaryWorst.textContent = `${entrySummaryLabel(worst)} · ${formatCurrency(worst.ingresoNeto)}`;
        }
    }

    function handleHistoryAction(event) {
        const actionButton = event.target.closest("button[data-action]");
        if (!actionButton) {
            return;
        }

        const { action, id } = actionButton.dataset;
        const historyItem = readHistory().find((item) => item.id === Number(id));
        if (!historyItem) {
            return;
        }

        if (action === "delete") {
            deleteHistoryItem(Number(id));
        }

        if (action === "load") {
            loadHistoryItem(historyItem);
        }
    }

    function loadHistoryItem(entry) {
        if (!isDashboardPage) {
            writeJson(STORAGE_KEYS.pendingScenario, { id: entry.id });
            window.location.href = "index.html";
            return;
        }

        if (elements.lote) {
            elements.lote.value = entry.lote ?? "";
        }

        if (elements.cultivo) {
            elements.cultivo.value = entry.cultivo ?? "maiz";
        }

        syncHumidityBase(elements.cultivo.value);

        if (elements.precio) elements.precio.value = entry.precio ?? "";
        if (elements.costoSecada) elements.costoSecada.value = entry.costoSecada ?? "";
        if (elements.humedadActual) {
            elements.humedadActual.value = entry.humedadActual ?? "";
            setHumiditySource("manual");
        }
        if (elements.hectareas) elements.hectareas.value = entry.hectareas ?? "";
        setHectareasSource("manual");
        if (elements.rendimiento) elements.rendimiento.value = entry.rendimiento ?? "";
        if (elements.tarifaFlete) elements.tarifaFlete.value = entry.tarifaFlete ?? "";
        if (elements.distanciaFlete) elements.distanciaFlete.value = entry.distanciaFlete ?? "";
        if (elements.latitud && Number.isFinite(entry.latitud)) elements.latitud.value = entry.latitud;
        if (elements.longitud && Number.isFinite(entry.longitud)) elements.longitud.value = entry.longitud;

        restorePriceReferenceState(entry);

        saveFormState();
        renderResults(entry);
        updateClimateLocationLabel(entry.latitud, entry.longitud);
        if (hasValidCoordinates(entry.latitud, entry.longitud)) {
            fetchClimate({ latitud: entry.latitud, longitud: entry.longitud });
        }
        setActiveNav("dashboard-section");
        document.getElementById("dashboard-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
        showStatus(`Escenario de ${entry.lote ?? "Lote sin nombre"} cargado en el formulario.`, "success");
    }

    function applyPendingScenario() {
        const pending = readJson(STORAGE_KEYS.pendingScenario, null);
        if (!pending || typeof pending.id !== "number") {
            return false;
        }

        const historyItem = readHistory().find((item) => item.id === pending.id);
        writeJson(STORAGE_KEYS.pendingScenario, null);

        if (!historyItem) {
            return false;
        }

        loadHistoryItem(historyItem);
        return true;
    }

    function deleteHistoryItem(id) {
        const history = readHistory().filter((item) => item.id !== id);
        writeHistory(history);
        renderHistory();
        showStatus("Escenario eliminado del historial.", "info");
    }

    function clearHistory() {
        const history = readHistory();
        if (history.length === 0) {
            showStatus("El historial ya está vacío.", "info");
            return;
        }

        const confirmed = window.confirm("¿Querés limpiar todo el historial de escenarios?");
        if (!confirmed) {
            return;
        }

        writeHistory([]);
        renderHistory();
        showStatus("Historial limpiado.", "success");
    }

    function clearFilters() {
        if (elements.filtroLote) {
            elements.filtroLote.value = "";
        }

        if (elements.filtroCultivo) {
            elements.filtroCultivo.value = "";
        }

        renderHistory();
        showStatus("Filtros limpiados.", "info");
    }

    function exportHistory() {
        const history = readHistory();
        if (history.length === 0) {
            showStatus("No hay escenarios para exportar.", "info");
            return;
        }

        const headers = [
            "Fecha",
            "Lote",
            "Cultivo",
            "Producción (tn)",
            "Latitud",
            "Longitud",
            "Humedad actual (%)",
            "Humedad ambiente (%)",
            "Viento (km/h)",
            "Gastos totales",
            "Margen neto",
            "Margen (%)",
            "Recomendación"
        ];

        const rows = history.map((entry) => ([
            formatDateTime(entry.createdAt),
            entry.lote ?? "Lote sin nombre",
            getCropLabel(entry.cultivo),
            formatDecimal(entry.produccion, 2),
            entry.latitud === null || entry.latitud === undefined ? "" : formatDecimal(entry.latitud, 4),
            entry.longitud === null || entry.longitud === undefined ? "" : formatDecimal(entry.longitud, 4),
            formatDecimal(entry.humedadActual, 1),
            entry.climateHumidity === null || entry.climateHumidity === undefined ? "" : formatDecimal(entry.climateHumidity, 1),
            entry.windKmH === null || entry.windKmH === undefined ? "" : formatDecimal(entry.windKmH, 1),
            formatDecimal(entry.gastosTotales, 2),
            formatDecimal(entry.ingresoNeto, 2),
            formatDecimal(entry.margenPct, 2),
            entry.recommendationText ?? ""
        ].map(csvEscape).join(",")));

        const csv = [headers.map(csvEscape).join(","), ...rows].join("\n");
        const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `historial_cosecha_${formatFileStamp(new Date())}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);

        showStatus("CSV exportado correctamente.", "success");
    }

    function fetchClimate(overrideCoordinates = null, options = {}) {
        const { includeDaily = false, forceRender = false } = options;
        const coordinates = getClimateCoordinates(overrideCoordinates);
        const renderDashboard = Boolean(elements.clima);
        const renderClimatePage = Boolean(elements.climaPanel);

        updateClimateLocationLabel(coordinates.latitud, coordinates.longitud);
        if (isDashboardPage || isClimatePage) {
            updateMapLocation(coordinates.latitud, coordinates.longitud, { recenter: false });
        }

        if (renderDashboard) {
            elements.clima.innerHTML = `
                <div class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <span class="animate-pulse text-slate-400">Conectando con estación meteorológica...</span>
                </div>
            `;
        }

        if (renderClimatePage && forceRender) {
            renderClimateSkeleton();
        }

        const url = new URL("https://api.open-meteo.com/v1/forecast");
        url.searchParams.set("latitude", String(coordinates.latitud));
        url.searchParams.set("longitude", String(coordinates.longitud));
        url.searchParams.set("timezone", "auto");
        url.searchParams.set("current", "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,precipitation");

        if (includeDaily || renderClimatePage) {
            url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,weather_code");
            url.searchParams.set("past_days", "31");
            url.searchParams.set("forecast_days", "16");
        }

        fetch(url.toString())
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                return response.json();
            })
            .then((data) => {
                const current = data.current ?? {};
                const temperature = parseNumber(current.temperature_2m);
                const humidity = parseNumber(current.relative_humidity_2m);
                const wind = parseNumber(current.wind_speed_10m);
                const weatherCode = parseNumber(current.weather_code);
                const precipitation = parseNumber(current.precipitation);

                if (!Number.isFinite(temperature) || !Number.isFinite(humidity) || !Number.isFinite(wind)) {
                    throw new Error("Datos climáticos incompletos");
                }

                state.climate = {
                    temperature,
                    humidity,
                    wind,
                    weatherCode,
                    precipitation
                };
                state.climateForecast = data;

                if (renderDashboard) {
                    renderDashboardClimate({
                        temperature,
                        humidity,
                        wind,
                        weatherCode,
                        precipitation
                    });
                }

                if (renderClimatePage) {
                    renderClimatePageData(data, coordinates);
                }
            })
            .catch(() => {
                state.climate = null;
                state.climateForecast = null;

                if (renderDashboard) {
                    elements.clima.innerHTML = `
                        <div class="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
                            ⚠️ No se pudo conectar con la estación meteorológica. Podés completar la humedad manualmente.
                        </div>
                    `;
                }

                if (renderClimatePage) {
                    renderClimateError();
                }
            });
    }

    function renderDashboardClimate(current) {
        if (!elements.clima) {
            return;
        }

        const weather = getWeatherMeta(current.weatherCode);
        const rainText = Number.isFinite(current.precipitation) ? `${formatDecimal(current.precipitation, 1)} mm` : "--";

        elements.clima.innerHTML = `
            <div class="grid gap-4 text-center sm:grid-cols-4">
                <div class="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                    <p class="text-xs font-bold uppercase tracking-wider text-slate-400">🌡️ Temperatura</p>
                    <p class="mt-1 text-xl font-extrabold text-slate-700">${formatDecimal(current.temperature, 1)} °C</p>
                </div>
                <div class="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm ring-2 ring-green-600/20">
                    <p class="text-xs font-bold uppercase tracking-wider text-slate-400">💧 Humedad Ambiente</p>
                    <p class="mt-1 text-xl font-extrabold text-green-700">${formatDecimal(current.humidity, 1)}%</p>
                    <span class="mt-0.5 block text-[10px] font-medium text-green-600">Sincronizado con el formulario</span>
                </div>
                <div class="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                    <p class="text-xs font-bold uppercase tracking-wider text-slate-400">💨 Velocidad Viento</p>
                    <p class="mt-1 text-xl font-extrabold ${current.wind > 35 ? "text-red-500" : "text-slate-700"}">${formatDecimal(current.wind, 1)} km/h</p>
                </div>
                <div class="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                    <p class="text-xs font-bold uppercase tracking-wider text-slate-400">🌧️ Lluvia</p>
                    <p class="mt-1 text-xl font-extrabold text-slate-700">${rainText}</p>
                    <span class="mt-0.5 block text-[10px] font-medium text-slate-500">${weather.label}</span>
                </div>
            </div>
        `;
    }

    function renderClimateSkeleton() {
        if (elements.climaResumenActual) {
            elements.climaResumenActual.textContent = "--";
        }
        if (elements.climaResumenDetalle) {
            elements.climaResumenDetalle.textContent = "Cargando pronóstico...";
        }
        if (elements.climaTempActual) {
            elements.climaTempActual.textContent = "--";
        }
        if (elements.climaHumActual) {
            elements.climaHumActual.textContent = "--";
        }
        if (elements.climaVientoActual) {
            elements.climaVientoActual.textContent = "--";
        }
        if (elements.climaLluviaActual) {
            elements.climaLluviaActual.textContent = "--";
        }
        if (elements.climaSemanal) {
            elements.climaSemanal.innerHTML = "";
        }
        if (elements.climaCalendario) {
            elements.climaCalendario.innerHTML = "";
        }
    }

    function renderClimateError() {
        if (elements.climaResumenActual) {
            elements.climaResumenActual.textContent = "Sin datos";
        }
        if (elements.climaResumenDetalle) {
            elements.climaResumenDetalle.textContent = "No se pudo cargar el pronóstico.";
        }
        if (elements.climaSemanal) {
            elements.climaSemanal.innerHTML = `
                <div class="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
                    No se pudo traer el pronóstico semanal.
                </div>
            `;
        }
        if (elements.climaCalendario) {
            elements.climaCalendario.innerHTML = `
                <div class="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
                    No se pudo traer el calendario mensual.
                </div>
            `;
        }
    }

    function renderClimatePageData(data, coordinates) {
        const current = data.current ?? {};
        const daily = data.daily ?? {};
        const forecastTimes = Array.isArray(daily.time) ? daily.time : [];
        const todayKey = toDateKey(new Date());
        const currentWeather = getWeatherMeta(parseNumber(current.weather_code));
        const dailyIndex = forecastTimes.indexOf(todayKey);
        const todayRain = dailyIndex >= 0 ? parseNumber(daily.precipitation_probability_max?.[dailyIndex]) : NaN;

        if (elements.climaResumenActual) {
            elements.climaResumenActual.textContent = `${formatDecimal(current.temperature_2m, 1)} °C`;
        }

        if (elements.climaResumenDetalle) {
            elements.climaResumenDetalle.textContent = `${currentWeather.icon} ${currentWeather.label} · Humedad ${formatDecimal(current.relative_humidity_2m, 1)}%`;
        }

        if (elements.climaTempActual) {
            elements.climaTempActual.textContent = `${formatDecimal(current.temperature_2m, 1)} °C`;
        }

        if (elements.climaHumActual) {
            elements.climaHumActual.textContent = `${formatDecimal(current.relative_humidity_2m, 1)}%`;
        }

        if (elements.climaVientoActual) {
            elements.climaVientoActual.textContent = `${formatDecimal(current.wind_speed_10m, 1)} km/h`;
        }

        if (elements.climaLluviaActual) {
            elements.climaLluviaActual.textContent = Number.isFinite(todayRain) ? `${formatDecimal(todayRain, 0)}%` : "--";
        }

        if (elements.climaSubtitulo) {
            elements.climaSubtitulo.textContent = `Pronóstico semanal y calendario mensual para ${formatDecimal(coordinates.latitud, 4)}, ${formatDecimal(coordinates.longitud, 4)}`;
        }

        if (elements.climaMesLabel) {
            elements.climaMesLabel.textContent = formatMonthLabel(new Date());
        }

        if (elements.climaMesDetalle) {
            elements.climaMesDetalle.textContent = `Mostrando ${forecastTimes.length} días con datos climáticos disponibles.`;
        }

        if (elements.climaSemanal) {
            elements.climaSemanal.innerHTML = buildWeeklyForecastMarkup(daily);
        }

        if (elements.climaCalendario) {
            elements.climaCalendario.innerHTML = buildMonthlyCalendarMarkup(daily, new Date());
        }
    }

    function buildWeeklyForecastMarkup(daily) {
        const times = Array.isArray(daily.time) ? daily.time : [];
        if (times.length === 0) {
            return `
                <div class="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-500">
                    No hay pronóstico semanal disponible.
                </div>
            `;
        }

        return times.slice(0, 7).map((time, index) => {
            const weather = getWeatherMeta(parseNumber(daily.weather_code?.[index]));
            const max = parseNumber(daily.temperature_2m_max?.[index]);
            const min = parseNumber(daily.temperature_2m_min?.[index]);
            const rain = parseNumber(daily.precipitation_probability_max?.[index]);
            const date = new Date(`${time}T00:00:00`);
            const label = date.toLocaleDateString("es-AR", { weekday: "short" });

            return `
                <div class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <p class="text-xs font-bold uppercase tracking-wider text-slate-400">${label}</p>
                    <p class="mt-2 text-2xl">${weather.icon}</p>
                    <p class="mt-2 text-sm font-semibold text-slate-800">${weather.label}</p>
                    <p class="mt-1 text-sm text-slate-500">${formatDecimal(max, 1)}° / ${formatDecimal(min, 1)}°</p>
                    <p class="mt-2 text-xs font-semibold text-slate-400">Lluvia ${Number.isFinite(rain) ? `${formatDecimal(rain, 0)}%` : "--"}</p>
                </div>
            `;
        }).join("");
    }

    function buildMonthlyCalendarMarkup(daily, baseDate) {
        const times = Array.isArray(daily.time) ? daily.time : [];
        const monthStart = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
        const monthEnd = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
        const daysInMonth = monthEnd.getDate();
        const startOffset = (monthStart.getDay() + 6) % 7;
        const lookup = new Map();

        times.forEach((time, index) => {
            lookup.set(time, {
                weatherCode: parseNumber(daily.weather_code?.[index]),
                max: parseNumber(daily.temperature_2m_max?.[index]),
                min: parseNumber(daily.temperature_2m_min?.[index]),
                rain: parseNumber(daily.precipitation_probability_max?.[index])
            });
        });

        const weekdayLabels = ["L", "M", "X", "J", "V", "S", "D"];
        const emptyCells = Array.from({ length: startOffset }, () => `
            <div class="h-24 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70"></div>
        `);

        const dayCells = [];
        for (let day = 1; day <= daysInMonth; day += 1) {
            const date = new Date(baseDate.getFullYear(), baseDate.getMonth(), day);
            const key = toDateKey(date);
            const record = lookup.get(key);
            const weather = record ? getWeatherMeta(record.weatherCode) : { icon: "—", label: "Sin dato" };
            const rain = record?.rain;
            dayCells.push(`
                <div class="min-h-24 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm ${day === baseDate.getDate() ? "ring-2 ring-green-600/20" : ""}">
                    <div class="flex items-start justify-between gap-2">
                        <div>
                            <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">${day}</p>
                            <p class="mt-1 text-sm font-semibold text-slate-800">${weather.label}</p>
                        </div>
                        <span class="text-lg">${weather.icon}</span>
                    </div>
                    <p class="mt-3 text-[11px] text-slate-500">${record ? `${formatDecimal(record.max, 1)}° / ${formatDecimal(record.min, 1)}°` : "Sin pronóstico"}</p>
                    <p class="mt-1 text-[11px] font-semibold ${Number.isFinite(rain) && rain >= 60 ? "text-blue-600" : "text-slate-400"}">${Number.isFinite(rain) ? `Lluvia ${formatDecimal(rain, 0)}%` : ""}</p>
                </div>
            `);
        }

        const headers = weekdayLabels.map((label) => `
            <div class="pb-1 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">${label}</div>
        `).join("");

        return `
            <div class="grid grid-cols-7 gap-2">${headers}</div>
            <div class="mt-2 grid grid-cols-7 gap-2">
                ${emptyCells.join("")}
                ${dayCells.join("")}
            </div>
        `;
    }

    function getWeatherMeta(code) {
        const value = Number.isFinite(code) ? code : NaN;
        if (!Number.isFinite(value)) {
            return { label: "Sin dato", icon: "🌤️" };
        }

        if (value === 0) {
            return { label: "Despejado", icon: "☀️" };
        }
        if (value === 1 || value === 2) {
            return { label: "Parcial", icon: "🌤️" };
        }
        if (value === 3) {
            return { label: "Nublado", icon: "☁️" };
        }
        if (value === 45 || value === 48) {
            return { label: "Niebla", icon: "🌫️" };
        }
        if (value >= 51 && value <= 57) {
            return { label: "Llovizna", icon: "🌦️" };
        }
        if (value >= 61 && value <= 67) {
            return { label: "Lluvia", icon: "🌧️" };
        }
        if (value >= 71 && value <= 77) {
            return { label: "Nieve", icon: "🌨️" };
        }
        if (value >= 80 && value <= 82) {
            return { label: "Chubascos", icon: "🌧️" };
        }
        if (value >= 95) {
            return { label: "Tormenta", icon: "⛈️" };
        }

        return { label: "Variable", icon: "🌤️" };
    }

    function formatMonthLabel(date) {
        return new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" }).format(date);
    }

    function toDateKey(date) {
        const pad = (number) => String(number).padStart(2, "0");
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    }

    function handleUseLocation() {
        if (!navigator.geolocation) {
            showStatus("Tu navegador no soporta geolocalización.", "danger");
            return;
        }

        if (!window.isSecureContext) {
            showStatus("Para usar tu ubicación exacta necesitás abrir la app en HTTPS o localhost.", "danger");
            return;
        }

        elements.btnUsarUbicacion.disabled = true;
        elements.btnUsarUbicacion.textContent = "Buscando...";

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitud = position.coords.latitude;
                const longitud = position.coords.longitude;

                applyCoordinates(latitud, longitud, { recenterMap: true });
                showStatus((elements.clima || elements.climaPanel) ? "Ubicación obtenida y clima actualizado." : "Ubicación obtenida y cargada al mapa.", "success");
                resetLocationButton();
            },
            (error) => {
                const message =
                    error.code === error.PERMISSION_DENIED
                        ? "No diste permiso para usar tu ubicación."
                        : "No se pudo obtener tu ubicación exacta.";
                showStatus(message, "danger");
                resetLocationButton();
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
    }

    function resetLocationButton() {
        if (elements.btnUsarUbicacion) {
            elements.btnUsarUbicacion.disabled = false;
            elements.btnUsarUbicacion.textContent = "Usar mi ubicación";
        }
    }

    function showStatus(message, tone = "info") {
        if (!elements.formStatus) {
            return;
        }

        window.clearTimeout(statusTimeoutId);
        elements.formStatus.textContent = message;
        elements.formStatus.dataset.tone = tone;
        elements.formStatus.className = `status-banner rounded-2xl border px-4 py-3 text-sm font-medium shadow-sm ${getStatusClass(tone)}`;
        elements.formStatus.classList.remove("hidden");

        statusTimeoutId = window.setTimeout(() => {
            elements.formStatus.classList.add("hidden");
        }, tone === "danger" ? 7000 : 4500);
    }

    function getStatusClass(tone) {
        switch (tone) {
            case "success":
                return "border-emerald-200 bg-emerald-50 text-emerald-700";
            case "warning":
                return "border-amber-200 bg-amber-50 text-amber-700";
            case "danger":
                return "border-red-200 bg-red-50 text-red-700";
            default:
                return "border-blue-200 bg-blue-50 text-blue-700";
        }
    }

    function readHistory() {
        const history = readJson(STORAGE_KEYS.history, []);
        return Array.isArray(history) ? history : [];
    }

    function getClimateCoordinates(overrideCoordinates = null) {
        if (overrideCoordinates && Number.isFinite(overrideCoordinates.latitud) && Number.isFinite(overrideCoordinates.longitud)) {
            return overrideCoordinates;
        }

        const latitud = parseNumber(elements.latitud?.value);
        const longitud = parseNumber(elements.longitud?.value);

        if (hasValidCoordinates(latitud, longitud)) {
            return { latitud, longitud };
        }

        return DEFAULT_LOCATION;
    }

    function hasValidCoordinates(latitud = parseNumber(elements.latitud?.value), longitud = parseNumber(elements.longitud?.value)) {
        return Number.isFinite(latitud) && Number.isFinite(longitud) && latitud >= -90 && latitud <= 90 && longitud >= -180 && longitud <= 180;
    }

    function updateClimateLocationLabel(latitud = parseNumber(elements.latitud?.value), longitud = parseNumber(elements.longitud?.value)) {
        if (!elements.climaUbicacion) {
            return;
        }

        if (!hasValidCoordinates(latitud, longitud)) {
            elements.climaUbicacion.textContent = "Ubicación: coordenadas no válidas";
            return;
        }

        elements.climaUbicacion.textContent = `Ubicación: ${formatDecimal(latitud, 4)}, ${formatDecimal(longitud, 4)}`;
    }

    function filterHistory(history) {
        const loteQuery = normalizeSearchText(elements.filtroLote?.value || "");
        const cultivoQuery = elements.filtroCultivo?.value || "";

        return history.filter((entry) => {
            const loteMatch = !loteQuery || normalizeSearchText(entry.lote ?? "").includes(loteQuery);
            const cultivoMatch = !cultivoQuery || entry.cultivo === cultivoQuery;
            return loteMatch && cultivoMatch;
        });
    }

    function hasActiveFilters() {
        return Boolean((elements.filtroLote?.value || "").trim() || (elements.filtroCultivo?.value || ""));
    }

    function writeHistory(history) {
        writeJson(STORAGE_KEYS.history, history);
    }

    function appendCell(row, value, className) {
        const cell = document.createElement("td");
        cell.className = className;
        cell.textContent = value;
        row.appendChild(cell);
    }

    function entrySummaryLabel(entry) {
        const lote = entry.lote ?? "Lote sin nombre";
        const cultivo = getCropLabel(entry.cultivo);
        return `${lote} · ${cultivo}`;
    }

    function getCropLabel(cultivo) {
        return CROPS[cultivo]?.label ?? cultivo ?? "Desconocido";
    }

    function formatCurrency(value) {
        return `$ ${new Intl.NumberFormat("es-AR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(Number.isFinite(value) ? value : 0)}`;
    }

    function formatDecimal(value, digits = 2) {
        return new Intl.NumberFormat("es-AR", {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits
        }).format(Number.isFinite(value) ? value : 0);
    }

    function formatCompactNumber(value) {
        return new Intl.NumberFormat("es-AR", {
            maximumFractionDigits: 0
        }).format(Number.isFinite(value) ? value : 0);
    }

    function formatDateTime(value) {
        if (!value) {
            return "Sin fecha";
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return "Sin fecha";
        }

        return new Intl.DateTimeFormat("es-AR", {
            dateStyle: "medium",
            timeStyle: "short"
        }).format(date);
    }

    function formatFileStamp(date) {
        const pad = (number) => String(number).padStart(2, "0");
        return [
            date.getFullYear(),
            pad(date.getMonth() + 1),
            pad(date.getDate()),
            pad(date.getHours()),
            pad(date.getMinutes())
        ].join("-");
    }

    function parseNumber(value) {
        if (typeof value === "number") {
            return Number.isFinite(value) ? value : NaN;
        }

        const text = String(value ?? "")
            .trim()
            .replace(/\s+/g, "")
            .replace(/%/g, "");

        if (!text) {
            return NaN;
        }

        let normalized = text;
        if (text.includes(",") && text.includes(".")) {
            normalized = text.replace(/\./g, "").replace(",", ".");
        } else if (text.includes(",")) {
            normalized = text.replace(",", ".");
        }

        const parsed = Number.parseFloat(normalized);
        return Number.isFinite(parsed) ? parsed : NaN;
    }

    function parseOptionalNumber(value, fallback = 0) {
        const parsed = parseNumber(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    function normalizeSearchText(value) {
        return String(value ?? "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }

    function csvEscape(value) {
        const text = String(value ?? "");
        if (/[",\n;]/.test(text)) {
            return `"${text.replace(/"/g, '""')}"`;
        }

        return text;
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function readJson(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) {
                return fallback;
            }

            return JSON.parse(raw);
        } catch {
            return fallback;
        }
    }

    function writeJson(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            // Si localStorage falla, seguimos sin bloquear la app.
        }
    }
});
