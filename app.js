const STORAGE_KEYS = {
    history: "agroHistorial",
    form: "agroFormulario",
    priceCache: "agroPrecioInternet",
    parcel: "agroParcela",
    lastResult: "agroUltimoResultado"
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
const TEMPORAL_HORIZON_DAYS = 30;

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

const EXAMPLE_SCENARIOS = {
    soja: {
        lote: "Lote ejemplo soja",
        precio: 325000,
        humedadActual: 14.2,
        hectareas: 52,
        rendimiento: 3.4,
        costoSecada: 640,
        tarifaFlete: 11.8,
        distanciaFlete: 78,
        latitud: -35.9,
        longitud: -61.2
    },
    maiz: {
        lote: "Lote ejemplo maiz",
        precio: 245000,
        humedadActual: 15.8,
        hectareas: 44,
        rendimiento: 8.7,
        costoSecada: 520,
        tarifaFlete: 12.4,
        distanciaFlete: 85,
        latitud: -38.03,
        longitud: -60.1
    },
    trigo: {
        lote: "Lote ejemplo trigo",
        precio: 215000,
        humedadActual: 13.8,
        hectareas: 31,
        rendimiento: 4.6,
        costoSecada: 480,
        tarifaFlete: 10.2,
        distanciaFlete: 60,
        latitud: -36.6,
        longitud: -59.4
    },
    girasol: {
        lote: "Lote ejemplo girasol",
        precio: 360000,
        humedadActual: 11.8,
        hectareas: 28,
        rendimiento: 2.7,
        costoSecada: 700,
        tarifaFlete: 14,
        distanciaFlete: 90,
        latitud: -37.2,
        longitud: -61.0
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
        btnCargarEjemplo: $("btnCargarEjemplo"),
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
        temporalPanel: $("temporalPanel"),
        temporalResumen: $("temporalResumen"),
        temporalEstado: $("temporalEstado"),
        temporalMejorDia: $("temporalMejorDia"),
        temporalMejorDetalle: $("temporalMejorDetalle"),
        temporalDiferencia: $("temporalDiferencia"),
        temporalDiferenciaDetalle: $("temporalDiferenciaDetalle"),
        temporalHumedad: $("temporalHumedad"),
        temporalHumedadDetalle: $("temporalHumedadDetalle"),
        temporalRiesgo: $("temporalRiesgo"),
        temporalRiesgoDetalle: $("temporalRiesgoDetalle"),
        temporalLista: $("temporalLista"),
        temporalSelectedDayLabel: $("temporalSelectedDayLabel"),
        temporalSelectedState: $("temporalSelectedState"),
        temporalSelectedHumidity: $("temporalSelectedHumidity"),
        temporalSelectedNet: $("temporalSelectedNet"),
        temporalSelectedDelta: $("temporalSelectedDelta"),
        alertasLista: $("alertasLista"),
        alertasConteo: $("alertasConteo"),
        graficoRentabilidad: $("graficoRentabilidad"),
        dashboardPage: $("dashboardPage"),
        dashboardScenarioName: $("dashboardScenarioName"),
        dashboardUpdatedAt: $("dashboardUpdatedAt"),
        dashboardEmptyState: $("dashboardEmptyState"),
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

    const isEntryPage = Boolean(elements.cultivo);
    const isHistoryPage = Boolean(elements.tablaHistorial);
    const isMapPage = Boolean(elements.mapaLote) && !isEntryPage && !isHistoryPage;
    const isResultsPage = Boolean(elements.dashboardPage) && !isEntryPage && !isHistoryPage && !isMapPage;
    const isClimatePage = Boolean(elements.climaPanel) && !isEntryPage && !isHistoryPage && !isMapPage && !isResultsPage;

    if (!isEntryPage && !isResultsPage && !isHistoryPage && !isMapPage && !isClimatePage) {
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
        climateForecast: null,
        lastResult: null,
        temporalAnalysis: null,
        selectedTemporalDayKey: null
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

    const alertToneClasses = {
        success: "border-emerald-200 bg-emerald-50 text-emerald-900",
        warning: "border-amber-200 bg-amber-50 text-amber-900",
        danger: "border-red-200 bg-red-50 text-red-900",
        info: "border-blue-200 bg-blue-50 text-blue-900"
    };

    const alertToneBadgeClasses = {
        success: "border-emerald-200 bg-emerald-100 text-emerald-800",
        warning: "border-amber-200 bg-amber-100 text-amber-800",
        danger: "border-red-200 bg-red-100 text-red-800",
        info: "border-blue-200 bg-blue-100 text-blue-800"
    };

    let statusTimeoutId = null;

    if (isEntryPage) {
        initEntryPage();
    }

    if (isResultsPage) {
        initResultsPage();
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

    function initEntryPage() {
        bindEntryEvents();
        const savedForm = restoreFormState();
        restoreParcelState(savedForm);
        syncHumidityBase(elements.cultivo.value);
        restorePriceReferenceState();
        ensureLocationDefaults();
        updateClimateLocationLabel();
        initializeMap();

        fetchClimate(null, { includeDaily: true });

        if (shouldAutoLoadPrice()) {
            loadInternetPriceReference({ silent: true });
        }

        setActiveNav("form-section");
    }

    function initResultsPage() {
        bindResultsEvents();
        const lastResult = readLastScenario();

        if (lastResult) {
            renderResults(lastResult);
            if (hasValidCoordinates(lastResult.latitud, lastResult.longitud)) {
                fetchClimate({ latitud: lastResult.latitud, longitud: lastResult.longitud }, { includeDaily: true });
            } else {
                fetchClimate(null, { includeDaily: true });
            }
        } else {
            resetResultsPanel("Cargá un escenario en Datos para ver resultados y predicción.");
            fetchClimate(null, { includeDaily: true });
        }

        setActiveNav("resumen-section");
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

    function bindEntryEvents() {
        elements.cultivo.addEventListener("change", handleCropChange);
        elements.btnCalcular.addEventListener("click", () => runSimulation(false));
        elements.btnGuardar.addEventListener("click", () => runSimulation(true));
        elements.btnCargarEjemplo?.addEventListener("click", loadExampleScenario);
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

    function bindResultsEvents() {
        elements.btnActualizarClima?.addEventListener("click", () => {
            const lastResult = readLastScenario();
            if (lastResult && hasValidCoordinates(lastResult.latitud, lastResult.longitud)) {
                fetchClimate({ latitud: lastResult.latitud, longitud: lastResult.longitud }, { includeDaily: true, forceRender: true });
                return;
            }

            fetchClimate(null, { includeDaily: true, forceRender: true });
        });

        elements.temporalLista?.addEventListener("click", handleTemporalDaySelection);

        elements.navButtons.forEach((button) => {
            button.addEventListener("click", handleNavigationClick);
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

    function loadExampleScenario() {
        if (!elements.cultivo) {
            return;
        }

        const cropKey = elements.cultivo.value;
        const example = EXAMPLE_SCENARIOS[cropKey] || EXAMPLE_SCENARIOS.maiz;

        if (elements.lote) {
            elements.lote.value = example.lote;
        }

        if (elements.precio) {
            elements.precio.value = String(example.precio);
            markPriceAsManual();
        }

        if (elements.humedadActual) {
            elements.humedadActual.value = example.humedadActual.toFixed(1);
            markHumidityAsManual();
        }

        if (elements.hectareas) {
            elements.hectareas.value = String(example.hectareas);
            markHectareasAsManual();
        }

        if (elements.rendimiento) {
            elements.rendimiento.value = String(example.rendimiento);
        }

        if (elements.costoSecada) {
            elements.costoSecada.value = String(example.costoSecada);
        }

        if (elements.tarifaFlete) {
            elements.tarifaFlete.value = String(example.tarifaFlete);
        }

        if (elements.distanciaFlete) {
            elements.distanciaFlete.value = String(example.distanciaFlete);
        }

        if (elements.latitud) {
            elements.latitud.value = example.latitud.toFixed(4);
        }

        if (elements.longitud) {
            elements.longitud.value = example.longitud.toFixed(4);
        }

        syncHumidityBase(cropKey);
        saveFormState();
        showStatus("Ejemplo cargado. Ya podés tocar Calcular y ver el resultado.", "success");
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
            showStatus("Elegí una ubicación válida antes de cargarla al dashboard.", "warning");
            return;
        }

        saveFormState();
        window.location.href = "dashboard.html";
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
        window.location.href = "dashboard.html";
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
        writeJson(STORAGE_KEYS.lastResult, result);

        if (saveToHistory) {
            persistScenario(result);
        }

        if (isEntryPage) {
            showStatus("Escenario listo. Abriendo el dashboard de resultados...", "success");
            window.setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 140);
            return result;
        }

        showStatus(saveToHistory ? "Escenario guardado en el historial." : "Simulación actualizada.", "success");

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
        state.lastResult = result;
        writeJson(STORAGE_KEYS.lastResult, result);

        if (elements.dashboardScenarioName) {
            elements.dashboardScenarioName.textContent = `${result.lote ?? "Lote sin nombre"} · ${getCropLabel(result.cultivo)}`;
        }

        if (elements.dashboardUpdatedAt) {
            elements.dashboardUpdatedAt.textContent = `Última simulación: ${formatDateTime(result.createdAt)}`;
        }

        if (elements.dashboardEmptyState) {
            elements.dashboardEmptyState.classList.add("hidden");
        }

        if (elements.produccion) {
            elements.produccion.textContent = `${formatDecimal(result.produccion, 2)} tn`;
        }
        if (elements.ingreso) {
            elements.ingreso.textContent = formatCurrency(result.ingresoBruto);
        }
        if (elements.costos) {
            elements.costos.textContent = formatCurrency(result.gastosTotales);
        }
        if (elements.resultado) {
            elements.resultado.textContent = formatCurrency(result.ingresoNeto);
            elements.resultado.className = `mt-1 text-2xl font-extrabold ${result.ingresoNeto >= 0 ? "text-emerald-700" : "text-red-600"}`;
        }

        if (elements.recomendacion) {
            elements.recomendacion.textContent = result.recommendationText;
            elements.recomendacion.className = `mt-2 text-base font-semibold ${resultToneClasses[result.recommendationTone] ?? resultToneClasses.info}`;
        }

        renderTemporalAnalysis(result);
        renderAlerts(result);
    }

    function resetResultsPanel(message) {
        const fallback = message || "Cargá un escenario en Datos para ver resultados.";

        if (elements.dashboardScenarioName) {
            elements.dashboardScenarioName.textContent = "Sin escenario cargado";
        }

        if (elements.dashboardUpdatedAt) {
            elements.dashboardUpdatedAt.textContent = fallback;
        }

        if (elements.dashboardEmptyState) {
            elements.dashboardEmptyState.classList.remove("hidden");
            elements.dashboardEmptyState.textContent = fallback;
        }

        if (elements.produccion) {
            elements.produccion.textContent = "---";
        }
        if (elements.ingreso) {
            elements.ingreso.textContent = "---";
        }
        if (elements.costos) {
            elements.costos.textContent = "---";
        }
        if (elements.resultado) {
            elements.resultado.textContent = "---";
            elements.resultado.className = "mt-1 text-2xl font-extrabold text-slate-400";
        }
        if (elements.recomendacion) {
            elements.recomendacion.textContent = fallback;
            elements.recomendacion.className = "mt-2 text-base font-semibold text-slate-500";
        }

        resetTemporalPanel(fallback);
        resetAlertsPanel(fallback);
        clearChart();
    }

    function buildAlerts(result) {
        const alerts = [];
        const humidityGap = Number.isFinite(result.humedadActual) && Number.isFinite(result.humedadBase)
            ? result.humedadActual - result.humedadBase
            : NaN;
        const priceSource = result.precioSource || "manual";
        const priceUpdatedAt = parseDate(result.precioSourceUpdatedAt);
        const priceAgeHours = Number.isFinite(priceUpdatedAt) ? (Date.now() - priceUpdatedAt) / (1000 * 60 * 60) : NaN;

        if (result.ingresoNeto < 0) {
            alerts.push({
                tone: "danger",
                icon: "⛔",
                title: "Margen negativo",
                text: "El escenario pierde plata. Conviene revisar precio, humedad o flete antes de avanzar."
            });
        } else if (result.margenPct < 5) {
            alerts.push({
                tone: "warning",
                icon: "⚠️",
                title: "Margen muy ajustado",
                text: "El margen neto está por debajo del 5%. Hay poco colchón para absorber cambios."
            });
        } else if (result.margenPct < 12) {
            alerts.push({
                tone: "info",
                icon: "ℹ️",
                title: "Margen moderado",
                text: "El resultado es positivo, pero todavía conviene comparar con otras alternativas."
            });
        }

        if (Number.isFinite(humidityGap) && humidityGap > 4) {
            alerts.push({
                tone: "danger",
                icon: "🌾",
                title: "Humedad alta",
                text: `${getCropLabel(result.cultivo)} está ${formatDecimal(humidityGap, 1)} puntos por encima de la base. La secada puede pesar bastante.`
            });
        } else if (Number.isFinite(humidityGap) && humidityGap > 2) {
            alerts.push({
                tone: "warning",
                icon: "🌾",
                title: "Secada a revisar",
                text: `La humedad está ${formatDecimal(humidityGap, 1)} puntos arriba de la base. El castigo por secado ya empieza a notarse.`
            });
        }

        if (Number.isFinite(result.windKmH)) {
            if (result.windKmH > 35) {
                alerts.push({
                    tone: "danger",
                    icon: "🌬️",
                    title: "Viento fuerte",
                    text: `Hay ${formatDecimal(result.windKmH, 1)} km/h de viento. Mejor revisar la ventana de trabajo y seguridad.`
                });
            } else if (result.windKmH > 25) {
                alerts.push({
                    tone: "warning",
                    icon: "🌬️",
                    title: "Viento moderado",
                    text: `Con ${formatDecimal(result.windKmH, 1)} km/h conviene mirar la ventana operativa antes de entrar al lote.`
                });
            }
        }

        if (priceSource === "manual") {
            alerts.push({
                tone: "info",
                icon: "💲",
                title: "Precio manual",
                text: "El precio fue cargado a mano. Si estás por vender, conviene compararlo con una referencia de mercado."
            });
        } else if (Number.isFinite(priceAgeHours) && priceAgeHours > 24) {
            alerts.push({
                tone: "warning",
                icon: "💲",
                title: "Precio desactualizado",
                text: `La referencia de internet tiene ${formatDecimal(priceAgeHours, 1)} horas. Puede servir, pero revisala antes de decidir.`
            });
        }

        if (!alerts.length) {
            alerts.push({
                tone: "success",
                icon: "✅",
                title: "Todo en rango",
                text: "No aparecen alertas críticas. El escenario se ve ordenado para seguir analizando."
            });
        }

        return alerts;
    }

    function renderAlerts(result) {
        if (!elements.alertasLista || !elements.alertasConteo) {
            return;
        }

        const alerts = buildAlerts(result);
        const criticalCount = alerts.filter((alert) => alert.tone === "danger" || alert.tone === "warning").length;
        const summaryLabel = criticalCount === 0
            ? "Sin alertas críticas"
            : criticalCount === 1
                ? "1 alerta crítica"
                : `${criticalCount} alertas críticas`;

        elements.alertasConteo.textContent = summaryLabel;
        elements.alertasConteo.className = `rounded-full border px-3 py-1 text-[11px] font-semibold ${alertToneBadgeClasses[criticalCount === 0 ? "success" : "warning"]}`;

        elements.alertasLista.replaceChildren();

        alerts.forEach((alert) => {
            const card = document.createElement("article");
            card.className = `rounded-2xl border px-4 py-4 text-sm shadow-sm ${alertToneClasses[alert.tone] ?? alertToneClasses.info}`;

            const header = document.createElement("div");
            header.className = "flex items-start gap-3";

            const icon = document.createElement("div");
            icon.className = "mt-0.5 text-base";
            icon.textContent = alert.icon;

            const content = document.createElement("div");
            content.className = "min-w-0 flex-1";

            const title = document.createElement("p");
            title.className = "font-bold";
            title.textContent = alert.title;

            const text = document.createElement("p");
            text.className = "mt-1 leading-6 text-slate-600";
            text.textContent = alert.text;

            content.append(title, text);
            header.append(icon, content);
            card.appendChild(header);
            elements.alertasLista.appendChild(card);
        });
    }

    function resetAlertsPanel(message) {
        if (elements.alertasConteo) {
            elements.alertasConteo.textContent = "Sin cálculo";
            elements.alertasConteo.className = "rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-500";
        }

        if (elements.alertasLista) {
            elements.alertasLista.replaceChildren();
            const empty = document.createElement("div");
            empty.className = "rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-400";
            empty.textContent = message || "Calculá un escenario para ver alertas automáticas.";
            elements.alertasLista.appendChild(empty);
        }
    }

    function renderChart(result) {
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
            type: "line",
            data: {
                labels: ["Bruto", "Secada", "Flete", "Neto"],
                datasets: [{
                    label: "Escenario actual",
                    data: [
                        result?.ingresoBruto ?? 0,
                        result?.costoTotalSecada ?? 0,
                        result?.costoTotalFlete ?? 0,
                        result?.ingresoNeto ?? 0
                    ],
                    borderColor: "#2563eb",
                    backgroundColor: "rgba(37, 99, 235, 0.12)",
                    pointBackgroundColor: "#2563eb",
                    pointBorderColor: "#ffffff",
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    fill: true,
                    tension: 0.35,
                    borderWidth: 3
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

    function renderTemporalChart(todayRow, selectedRow) {
        if (!elements.graficoRentabilidad) {
            return;
        }

        if (!todayRow && !selectedRow) {
            clearChart();
            return;
        }

        const context = elements.graficoRentabilidad.getContext("2d");
        if (!context) {
            return;
        }

        if (state.chart) {
            state.chart.destroy();
        }

        const todayNet = todayRow?.ingresoNeto ?? 0;
        const selectedNet = selectedRow?.ingresoNeto ?? todayNet;
        const isImprovement = selectedNet >= todayNet;
        const chartColor = isImprovement ? "#2563eb" : "#dc2626";
        const selectedLabel = selectedRow?.dayLabel ?? "Día elegido";
        const magnitude = Math.max(Math.abs(todayNet), Math.abs(selectedNet), 1);
        const spread = Math.max(magnitude * 0.03, 50000);
        const axisMin = Math.min(todayNet, selectedNet) - spread;
        const axisMax = Math.max(todayNet, selectedNet) + spread;

        state.chart = new Chart(context, {
            type: "bar",
            data: {
                labels: ["Hoy", "Día elegido"],
                datasets: [{
                    label: "Margen neto",
                    data: [todayNet, selectedNet],
                    backgroundColor: [
                        "rgba(22, 163, 74, 0.78)",
                        isImprovement ? "rgba(37, 99, 235, 0.78)" : "rgba(220, 38, 38, 0.78)"
                    ],
                    borderColor: [
                        "#16a34a",
                        chartColor
                    ],
                    borderWidth: 2,
                    borderRadius: 14,
                    borderSkipped: false,
                    barPercentage: 0.55,
                    categoryPercentage: 0.62
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (tooltipItem) => {
                                const currentIndex = tooltipItem.dataIndex;
                                const value = formatCurrency(tooltipItem.parsed.y);
                                if (currentIndex === 0) {
                                    return ` Hoy: ${value}`;
                                }

                                const delta = selectedNet - todayNet;
                                return ` ${selectedLabel}: ${value} (${formatSignedCurrency(delta)})`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            color: "#64748b",
                            font: {
                                weight: "700"
                            }
                        }
                    },
                    y: {
                        min: axisMin,
                        max: axisMax,
                        grid: { color: "rgba(148, 163, 184, 0.22)" },
                        ticks: {
                            color: "#64748b",
                            callback: (value) => `$ ${formatCompactNumber(value)}`
                        }
                    }
                }
            }
        });
    }

    function clearChart() {
        if (state.chart) {
            state.chart.destroy();
            state.chart = null;
        }

        if (!elements.graficoRentabilidad) {
            return;
        }

        const context = elements.graficoRentabilidad.getContext("2d");
        if (!context) {
            return;
        }

        context.clearRect(0, 0, elements.graficoRentabilidad.width, elements.graficoRentabilidad.height);
    }

    function renderTemporalAnalysis(result) {
        if (!elements.temporalPanel || !elements.temporalLista) {
            return;
        }

        if (!result) {
            state.temporalAnalysis = null;
            state.selectedTemporalDayKey = null;
            resetTemporalPanel("Calcula un escenario para ver el calendario predictivo de 30 dias.");
            return;
        }

        const analysis = buildTemporalAnalysis(result);
        if (!analysis.available) {
            state.temporalAnalysis = null;
            state.selectedTemporalDayKey = null;
            resetTemporalPanel(analysis.message);
            return;
        }

        const { best, today, threshold, recommendation } = analysis;
        const selectedKey = state.selectedTemporalDayKey && analysis.rows.some((row) => row.key === state.selectedTemporalDayKey)
            ? state.selectedTemporalDayKey
            : today.key;
        const selectedRow = analysis.rows.find((row) => row.key === selectedKey) ?? today;
        state.temporalAnalysis = analysis;
        state.selectedTemporalDayKey = selectedRow.key;

        const deltaLabel = formatSignedCurrency(best.ingresoNeto - today.ingresoNeto);

        elements.temporalResumen.textContent = recommendation.summary;
        elements.temporalEstado.textContent = recommendation.stateLabel;
        elements.temporalEstado.className = `rounded-full border px-3 py-1 text-[11px] font-semibold ${recommendation.stateTone}`;
        elements.temporalMejorDia.textContent = best.dayLabel;
        elements.temporalMejorDetalle.textContent = `${formatCurrency(best.ingresoNeto)} neto · ${formatDecimal(best.waitingLossPct, 2)}% de merma · ${best.stateDetail}`;
        elements.temporalDiferencia.textContent = deltaLabel;
        elements.temporalDiferencia.className = `mt-1 text-lg font-extrabold ${best.ingresoNeto - today.ingresoNeto >= 0 ? "text-emerald-700" : "text-red-600"}`;
        elements.temporalDiferenciaDetalle.textContent = recommendation.deltaDetail(threshold);
        elements.temporalHumedad.textContent = `${formatDecimal(best.humidityEstimada, 1)}%`;
        elements.temporalHumedadDetalle.textContent = `La mejor ventana aparece con ${formatDecimal(best.precipitationChance, 0)}% de lluvia y ${formatDecimal(best.precipitationSum, 1)} mm esperados.`;
        if (elements.temporalRiesgo) {
            elements.temporalRiesgo.textContent = best.riskLabel;
            elements.temporalRiesgo.className = `mt-1 text-sm font-extrabold ${best.riskToneText}`;
        }
        if (elements.temporalRiesgoDetalle) {
            elements.temporalRiesgoDetalle.textContent = `${best.weatherLabel} · ${best.stateDetail}`;
        }

        elements.temporalLista.className = "mt-3";
        elements.temporalLista.innerHTML = buildTemporalCalendarMarkup(analysis, selectedRow.key);
        renderTemporalSelectionSummary(selectedRow, analysis);
        renderTemporalChart(analysis.today, selectedRow);
    }

    function resetTemporalPanel(message) {
        state.temporalAnalysis = null;
        state.selectedTemporalDayKey = null;
        if (elements.temporalResumen) {
            elements.temporalResumen.textContent = message;
        }
        if (elements.temporalEstado) {
            elements.temporalEstado.textContent = "Sin análisis";
            elements.temporalEstado.className = "rounded-full border border-emerald-200 bg-white px-3 py-1 text-[11px] font-semibold text-emerald-700";
        }
        if (elements.temporalMejorDia) {
            elements.temporalMejorDia.textContent = "---";
        }
        if (elements.temporalMejorDetalle) {
            elements.temporalMejorDetalle.textContent = "Esperando datos.";
        }
        if (elements.temporalDiferencia) {
            elements.temporalDiferencia.textContent = "---";
            elements.temporalDiferencia.className = "mt-1 text-lg font-extrabold text-slate-900";
        }
        if (elements.temporalDiferenciaDetalle) {
            elements.temporalDiferenciaDetalle.textContent = "Sin comparación disponible.";
        }
        if (elements.temporalHumedad) {
            elements.temporalHumedad.textContent = "---";
        }
        if (elements.temporalHumedadDetalle) {
            elements.temporalHumedadDetalle.textContent = "Sin cálculo aún.";
        }
        if (elements.temporalRiesgo) {
            elements.temporalRiesgo.textContent = "---";
            elements.temporalRiesgo.className = "mt-1 text-sm font-extrabold text-slate-900";
        }
        if (elements.temporalRiesgoDetalle) {
            elements.temporalRiesgoDetalle.textContent = "Sin lectura aún.";
        }
        if (elements.temporalLista) {
            elements.temporalLista.className = "mt-3";
            elements.temporalLista.replaceChildren();
            const empty = document.createElement("div");
            empty.className = "rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-400";
            empty.textContent = message;
            elements.temporalLista.appendChild(empty);
        }
        resetTemporalSelectionSummary();
    }

    function buildTemporalAnalysis(result) {
        const daily = state.climateForecast?.daily;
        const forecastSeries = buildTemporalForecastSeries(daily, TEMPORAL_HORIZON_DAYS);

        if (!forecastSeries.length) {
            return {
                available: false,
                message: "Necesitas pronostico climatico para armar el calendario. Cargalo y volve a calcular."
            };
        }

        const rows = [];
        const baseHumidity = Number.isFinite(result.humedadActual)
            ? result.humedadActual
            : Number.isFinite(result.humedadBase)
                ? result.humedadBase
                : 0;

        let previousHumidity = baseHumidity;
        let cumulativeLossPct = 0;

        forecastSeries.forEach((forecast, index) => {
            const humidityDelta = index === 0
                ? 0
                : estimateHumidityDelta(forecast, previousHumidity, result);

            if (index > 0) {
                previousHumidity = clampNumber(previousHumidity + humidityDelta, 0, 100);
            }

            const humidityEstimada = previousHumidity;
            const waitingLossPct = estimateDelayLossPct(index, forecast, humidityEstimada, result);
            cumulativeLossPct = index === 0
                ? 0
                : Math.min(8, cumulativeLossPct + Math.max(0.08, waitingLossPct * 0.22));

            const adjustedProduction = result.produccion * (1 - cumulativeLossPct / 100);
            const secadaPoints = Math.max(0, humidityEstimada - result.humedadBase);
            const costoSecada = adjustedProduction * secadaPoints * result.costoSecada;
            const costoFlete = adjustedProduction * result.tarifaFlete * result.distanciaFlete;
            const ingresoBruto = adjustedProduction * result.precio;
            const ingresoNeto = ingresoBruto - costoSecada - costoFlete;
            const deltaVsToday = index === 0 ? 0 : ingresoNeto - result.ingresoNeto;
            const humidityGap = humidityEstimada - result.humedadBase;
            const risk = getTemporalRisk(forecast, waitingLossPct, humidityGap);

            rows.push({
                index,
                date: forecast.date,
                key: toDateKey(forecast.date),
                dayLabel: formatTemporalDateLabel(forecast.date),
                dayNumber: forecast.date.getDate(),
                weatherLabel: forecast.weather.label,
                weatherIcon: forecast.weather.icon,
                humidityEstimada,
                humidityGap,
                waitingLossPct,
                cumulativeLossPct,
                secadaPoints,
                costoSecada,
                costoFlete,
                ingresoBruto,
                ingresoNeto,
                deltaVsToday,
                riskLabel: risk.label,
                riskLevel: risk.level,
                riskToneText: risk.toneText,
                badgeClass: risk.badgeClass,
                weatherCode: forecast.weatherCode,
                precipitationChance: forecast.precipitationChance,
                precipitationSum: forecast.precipitationSum,
                forecastHumidity: forecast.forecastHumidity,
                tempMax: forecast.tempMax,
                tempMin: forecast.tempMin,
                source: forecast.source,
                isProjected: forecast.source === "proyeccion"
            });
        });

        const today = rows[0];
        const bestPool = rows.filter((row) => row.riskLevel !== "danger");
        const rankingPool = bestPool.length ? bestPool : rows;
        const best = rankingPool.reduce((winner, row) => (row.ingresoNeto > winner.ingresoNeto ? row : winner), rankingPool[0]);
        const deltaBest = best.ingresoNeto - today.ingresoNeto;
        const threshold = Math.max(25000, Math.abs(today.ingresoNeto) * 0.018);
        const recommendation = buildTemporalRecommendation(best, deltaBest, threshold, rows);

        let previousState = null;
        const scoredRows = rows.map((row) => {
            const stateMeta = getTemporalStateMeta(row, best.key, threshold, previousState);
            previousState = stateMeta.state;
            return {
                ...row,
                ...stateMeta,
                isBest: row.key === best.key
            };
        });

        const projectedDays = scoredRows.filter((row) => row.isProjected).length;
        const counts = scoredRows.reduce((acc, row) => {
            acc[row.state] = (acc[row.state] || 0) + 1;
            return acc;
        }, {});

        return {
            available: true,
            rows: scoredRows,
            today: scoredRows[0],
            best: scoredRows.find((row) => row.key === best.key) ?? scoredRows[0],
            threshold,
            recommendation,
            projectedDays,
            summary: `Simulamos ${rows.length} dias cruzando clima, humedad, merma y costo operativo. Tocá una fecha para ver si conviene cosechar, esperar o frenar. ${projectedDays > 0 ? `Los ultimos ${projectedDays} dias son proyeccion.` : "Todo el horizonte entra dentro del pronostico real."}`,
            counts
        };
    }

    function buildTemporalForecastSeries(daily, horizonDays) {
        const times = Array.isArray(daily?.time) ? daily.time : [];
        if (!times.length) {
            return [];
        }

        const todayKey = toDateKey(new Date());
        let startIndex = times.findIndex((time) => time === todayKey);
        if (startIndex < 0) {
            startIndex = times.findIndex((time) => time >= todayKey);
        }
        if (startIndex < 0) {
            startIndex = Math.max(0, times.length - horizonDays);
        }

        const series = [];
        let previous = null;

        for (let index = 0; index < horizonDays; index += 1) {
            const forecast = buildTemporalForecastDay(daily, times, startIndex + index, previous);
            series.push(forecast);
            previous = forecast;
        }

        return series;
    }

    function buildTemporalForecastDay(daily, times, index, previous) {
        if (index < times.length) {
            const weatherCode = parseNumber(daily.weather_code?.[index]);
            const precipitationChance = parseNumber(daily.precipitation_probability_max?.[index]);
            const precipitationSum = parseNumber(daily.precipitation_sum?.[index]);
            const forecastHumidity = parseNumber(daily.relative_humidity_2m_mean?.[index]);
            const tempMax = parseNumber(daily.temperature_2m_max?.[index]);
            const tempMin = parseNumber(daily.temperature_2m_min?.[index]);
            const date = new Date(`${times[index]}T12:00:00`);

            return {
                date,
                weatherCode,
                precipitationChance,
                precipitationSum,
                forecastHumidity,
                tempMax,
                tempMin,
                weather: getWeatherMeta(weatherCode),
                source: "pronostico"
            };
        }

        const last = previous ?? {
            date: new Date(`${times[times.length - 1]}T12:00:00`),
            weatherCode: 3,
            precipitationChance: 20,
            precipitationSum: 0,
            forecastHumidity: 60,
            tempMax: 24,
            tempMin: 12,
            weather: getWeatherMeta(3),
            source: "pronostico"
        };
        const projectedDays = index - times.length + 1;
        const rainHeavy = isWetWeather(last);
        const weatherCode = rainHeavy ? 3 : (Number.isFinite(last.weatherCode) ? last.weatherCode : 2);
        const forecastHumidity = clampNumber((Number.isFinite(last.forecastHumidity) ? last.forecastHumidity : 60) + (rainHeavy ? 4 : -1.2), 0, 100);

        return {
            date: addDays(last.date, 1),
            weatherCode,
            precipitationChance: clampNumber((last.precipitationChance ?? 20) * 0.9 + (rainHeavy ? 8 : 0), 0, 100),
            precipitationSum: clampNumber((last.precipitationSum ?? 0) * 0.78, 0, 30),
            forecastHumidity,
            tempMax: clampNumber((last.tempMax ?? 24) - (0.05 * projectedDays), -5, 45),
            tempMin: clampNumber((last.tempMin ?? 12) - (0.03 * projectedDays), -10, 35),
            weather: getWeatherMeta(weatherCode),
            source: "proyeccion"
        };
    }

    function estimateHumidityDelta(forecast, humidity, result) {
        let delta = -0.18;

        if (isWetWeather(forecast)) {
            delta += 1.05;
        } else if (Number.isFinite(forecast.precipitationChance) && forecast.precipitationChance >= 50) {
            delta += 0.4;
        } else if (Number.isFinite(forecast.precipitationChance) && forecast.precipitationChance >= 25) {
            delta += 0.15;
        }

        if (Number.isFinite(forecast.tempMax)) {
            if (forecast.tempMax >= 34) {
                delta -= 0.24;
            } else if (forecast.tempMax >= 30) {
                delta -= 0.18;
            } else if (forecast.tempMax <= 18) {
                delta += 0.12;
            }
        }

        if (Number.isFinite(forecast.tempMin)) {
            if (forecast.tempMin >= 18) {
                delta += 0.06;
            } else if (forecast.tempMin <= 8) {
                delta -= 0.05;
            }
        }

        if (Number.isFinite(result.humedadBase) && humidity > result.humedadBase + 4) {
            delta -= 0.04;
        }

        return delta;
    }

    function estimateDelayLossPct(waitDays, forecast, humidity, result) {
        let lossPct = waitDays * 0.16;

        if (isWetWeather(forecast)) {
            lossPct += 0.7;
        } else if (Number.isFinite(forecast.precipitationChance) && forecast.precipitationChance >= 50) {
            lossPct += 0.35;
        } else if (Number.isFinite(forecast.precipitationChance) && forecast.precipitationChance >= 25) {
            lossPct += 0.12;
        }

        if (Number.isFinite(humidity) && Number.isFinite(result.humedadBase)) {
            const humidityGap = humidity - result.humedadBase;
            if (humidityGap > 3) {
                lossPct += 0.25;
            } else if (humidityGap > 1) {
                lossPct += 0.1;
            }
        }

        if (Number.isFinite(forecast.tempMax) && forecast.tempMax >= 32) {
            lossPct += 0.1;
        }

        if (Number.isFinite(forecast.tempMin) && forecast.tempMin <= 8) {
            lossPct += 0.08;
        }

        if (forecast.source === "proyeccion") {
            lossPct += Math.min(0.4, waitDays * 0.02);
        }

        return Math.min(lossPct, 6);
    }

    function getTemporalRisk(forecast, lossPct, humidityGap) {
        if (isWetWeather(forecast) || lossPct >= 1.4 || humidityGap > 4) {
            return {
                level: "danger",
                label: "Alto",
                toneText: "text-red-700",
                badgeClass: "border-red-200 bg-red-50 text-red-700"
            };
        }

        if ((Number.isFinite(forecast.precipitationChance) && forecast.precipitationChance >= 50) || lossPct >= 0.8 || humidityGap > 2) {
            return {
                level: "warning",
                label: "Medio",
                toneText: "text-amber-700",
                badgeClass: "border-amber-200 bg-amber-50 text-amber-700"
            };
        }

        return {
            level: "success",
            label: "Bajo",
            toneText: "text-emerald-700",
            badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700"
        };
    }

    function buildTemporalRecommendation(best, deltaBest, threshold, rows) {
        const projectedDays = rows.filter((row) => row.isProjected).length;

        if (best.index === 0) {
            return {
                stateLabel: "Cosechar hoy",
                stateTone: "border-emerald-200 bg-emerald-100 text-emerald-800",
                summary: "Hoy conviene entrar. Es la ventana más sólida para arrancar la cosecha.",
                deltaDetail: () => `Esperar no mejora el resultado de forma clara. Umbral de lectura: ${formatCurrency(threshold)}. ${projectedDays > 0 ? `Hay ${projectedDays} dias proyectados al final del horizonte.` : "Todo el horizonte esta cubierto por pronostico real."}`
            };
        }

        if (Math.abs(deltaBest) < threshold) {
            return {
                stateLabel: "Vigilar",
                stateTone: "border-amber-200 bg-amber-100 text-amber-800",
                summary: "La diferencia entre hoy y la mejor fecha es chica. Conviene vigilar antes de definir.",
                deltaDetail: (limit) => `La mejora esperada es marginal. Umbral de lectura: ${formatCurrency(limit)}.`
            };
        }

        if (deltaBest > 0) {
            return {
                stateLabel: "Esperar",
                stateTone: "border-sky-200 bg-sky-100 text-sky-800",
                summary: `La mejor ventana aparece ${formatTemporalDateLabel(best.date)}. Esperar podría mejorar el margen y dar una entrada más cómoda.`,
                deltaDetail: (limit) => `La mejora supera el umbral de referencia de ${formatCurrency(limit)}.`
            };
        }

        return {
            stateLabel: "Cosechar hoy",
            stateTone: "border-red-200 bg-red-100 text-red-800",
            summary: "Esperar no suma rentabilidad: hoy sigue siendo la mejor alternativa.",
            deltaDetail: (limit) => `La diferencia negativa supera el umbral de referencia de ${formatCurrency(limit)}.`
        };
    }

    function getTemporalActionLabel(state, isBest) {
        if (isBest) {
            return "Optimo";
        }

        const labels = {
            cosechar: "Cosechar",
            pausar: "Pausar",
            continuar: "Continuar",
            viable: "Viable",
            vigilar: "Vigilar"
        };

        return labels[state] ?? "Vigilar";
    }

    function getTemporalStateMeta(row, bestKey, threshold, previousState) {
        if (row.riskLevel === "danger") {
            return {
                state: "pausar",
                stateLabel: "Pausar",
                stateTone: "border-red-200 bg-red-50 text-red-700",
                stateCardClass: "border-red-200 bg-red-50/70",
                stateDetail: "Lluvia o exceso de humedad bloquean la jornada."
            };
        }

        if (row.key === bestKey) {
            return {
                state: "cosechar",
                stateLabel: "Cosechar",
                stateTone: "border-emerald-200 bg-emerald-50 text-emerald-700",
                stateCardClass: "border-emerald-200 bg-emerald-50/70",
                stateDetail: "Es la mejor ventana economica del horizonte."
            };
        }

        if (previousState === "pausar" && row.deltaVsToday >= -threshold * 0.1 && row.humidityGap <= 3) {
            return {
                state: "continuar",
                stateLabel: "Continuar",
                stateTone: "border-sky-200 bg-sky-50 text-sky-700",
                stateCardClass: "border-sky-200 bg-sky-50/70",
                stateDetail: "La ventana mejora y se puede retomar la cosecha."
            };
        }

        if (row.deltaVsToday >= threshold * 0.45 && row.humidityGap <= 2) {
            return {
                state: "viable",
                stateLabel: "Viable",
                stateTone: "border-green-200 bg-green-50 text-green-700",
                stateCardClass: "border-green-200 bg-green-50/70",
                stateDetail: "La fecha sigue siendo operativamente interesante."
            };
        }

        return {
            state: "vigilar",
            stateLabel: "Vigilar",
            stateTone: "border-amber-200 bg-amber-50 text-amber-700",
            stateCardClass: "border-amber-200 bg-amber-50/70",
            stateDetail: "La ventana no esta clara y conviene seguir mirando."
        };
    }

    function formatTemporalDateLabel(date) {
        if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
            return "Sin fecha";
        }

        return date.toLocaleDateString("es-AR", {
            weekday: "short",
            day: "2-digit",
            month: "2-digit"
        });
    }

    function buildTemporalCalendarMarkup(analysis, selectedKey = null) {
        const statePalette = {
            cosechar: {
                cell: "border-emerald-200 bg-emerald-50/90",
                badge: "border-emerald-200 bg-emerald-100 text-emerald-800"
            },
            continuar: {
                cell: "border-sky-200 bg-sky-50/90",
                badge: "border-sky-200 bg-sky-100 text-sky-800"
            },
            viable: {
                cell: "border-green-200 bg-green-50/90",
                badge: "border-green-200 bg-green-100 text-green-800"
            },
            vigilar: {
                cell: "border-amber-200 bg-amber-50/90",
                badge: "border-amber-200 bg-amber-100 text-amber-800"
            },
            pausar: {
                cell: "border-red-200 bg-red-50/90",
                badge: "border-red-200 bg-red-100 text-red-800"
            }
        };

        const legendItems = [
            ["cosechar", `Cosechar (${analysis.counts.cosechar ?? 0})`],
            ["continuar", `Continuar (${analysis.counts.continuar ?? 0})`],
            ["viable", `Viable (${analysis.counts.viable ?? 0})`],
            ["vigilar", `Vigilar (${analysis.counts.vigilar ?? 0})`],
            ["pausar", `Pausar (${analysis.counts.pausar ?? 0})`]
        ].map(([state, label]) => `
            <span class="rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statePalette[state].badge}">${label}</span>
        `).join("");

        const focusCards = [
            {
                label: "Hoy",
                value: `${analysis.today.dayNumber}`,
                tone: analysis.today.stateTone
            },
            {
                label: "Mejor fecha",
                value: `${analysis.best.dayNumber}`,
                tone: "border-emerald-200 bg-emerald-50 text-emerald-800"
            },
            {
                label: "Proyección",
                value: `${analysis.projectedDays}`,
                tone: "border-slate-200 bg-white text-slate-700"
            }
        ].map((item) => `
            <div class="rounded-2xl border px-3 py-2 ${item.tone}">
                <p class="text-[9px] font-bold uppercase tracking-[0.25em] opacity-70">${item.label}</p>
                <p class="mt-1 text-lg font-extrabold leading-none">${item.value}</p>
            </div>
        `).join("");

        const dayCells = analysis.rows.map((row) => {
            const isSelected = row.key === selectedKey;
            const forecastHumidity = Number.isFinite(row.forecastHumidity) ? row.forecastHumidity : NaN;
            const humidityTone = Number.isFinite(forecastHumidity)
                ? (forecastHumidity >= 75
                    ? "border-blue-200 bg-blue-50 text-blue-800"
                    : forecastHumidity >= 55
                        ? "border-cyan-200 bg-cyan-50 text-cyan-800"
                        : "border-emerald-200 bg-emerald-50 text-emerald-800")
                : "border-slate-200 bg-slate-50 text-slate-500";
            const rainChance = Number.isFinite(row.precipitationChance) ? `${formatDecimal(row.precipitationChance, 0)}%` : "--";
            const rainSum = Number.isFinite(row.precipitationSum) ? `${formatDecimal(row.precipitationSum, 1)} mm` : "--";
            const tempMax = Number.isFinite(row.tempMax) ? `${formatDecimal(row.tempMax, 0)}°` : "--";
            const tempMin = Number.isFinite(row.tempMin) ? `${formatDecimal(row.tempMin, 0)}°` : "--";
            return `
            <button type="button" data-day-key="${row.key}" class="temporal-day-cell h-[16.5rem] min-w-[9.25rem] rounded-[1.6rem] border p-3 text-left shadow-sm transition-all ${statePalette[row.state].cell} ${row.isBest ? "ring-2 ring-emerald-500/30" : ""} ${isSelected ? "scale-[1.02] ring-2 ring-slate-900/20 shadow-lg" : "hover:-translate-y-0.5 hover:shadow-md"}" aria-pressed="${isSelected ? "true" : "false"}">
                <div class="flex h-full flex-col justify-between gap-2 overflow-hidden">
                    <div class="flex items-start justify-between gap-2">
                        <div class="min-w-0">
                            <p class="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">${row.dayLabel}</p>
                            <p class="mt-1 text-2xl font-extrabold leading-none text-slate-900">${row.dayNumber}</p>
                        </div>
                        <div class="flex flex-col items-end gap-1">
                            ${row.isProjected ? `<span class="rounded-full border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-semibold text-slate-400">Proy</span>` : ""}
                            <span class="rounded-full border px-2 py-0.5 text-[9px] font-semibold ${statePalette[row.state].badge}">${row.stateLabel}</span>
                        </div>
                    </div>
                    <div class="rounded-2xl border border-white/70 bg-white/80 p-2.5 shadow-[0_10px_26px_rgba(15,23,42,0.06)]">
                        <div class="flex items-center justify-between gap-2">
                            <div class="min-w-0">
                                <p class="text-3xl leading-none">${row.weatherIcon}</p>
                                <p class="mt-1 truncate text-[10px] font-semibold text-slate-600">${row.weatherLabel}</p>
                            </div>
                            <div class="rounded-2xl border px-2.5 py-1.5 text-center ${humidityTone}">
                                <p class="text-[8px] font-bold uppercase tracking-[0.18em] opacity-70">Humedad</p>
                                <p class="mt-0.5 text-sm font-extrabold leading-none">${Number.isFinite(forecastHumidity) ? `${formatDecimal(forecastHumidity, 0)}%` : "--"}</p>
                            </div>
                        </div>
                        <div class="mt-2 grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                            <div class="rounded-xl border border-slate-100 bg-slate-50/80 px-2 py-1.5">
                                <p class="text-[8px] font-bold uppercase tracking-[0.16em] text-slate-400">Lluvia</p>
                                <p class="mt-0.5 font-semibold text-slate-700">${rainChance}</p>
                            </div>
                            <div class="rounded-xl border border-slate-100 bg-slate-50/80 px-2 py-1.5">
                                <p class="text-[8px] font-bold uppercase tracking-[0.16em] text-slate-400">Precip</p>
                                <p class="mt-0.5 font-semibold text-slate-700">${rainSum}</p>
                            </div>
                            <div class="rounded-xl border border-slate-100 bg-slate-50/80 px-2 py-1.5">
                                <p class="text-[8px] font-bold uppercase tracking-[0.16em] text-slate-400">Max</p>
                                <p class="mt-0.5 font-semibold text-slate-700">${tempMax}</p>
                            </div>
                            <div class="rounded-xl border border-slate-100 bg-slate-50/80 px-2 py-1.5">
                                <p class="text-[8px] font-bold uppercase tracking-[0.16em] text-slate-400">Min</p>
                                <p class="mt-0.5 font-semibold text-slate-700">${tempMin}</p>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center justify-between gap-2 text-[10px] text-slate-500">
                        <span class="truncate">${row.isBest ? "Mejor" : row.index === 0 ? "Hoy" : " "}</span>
                        <span class="font-semibold ${row.ingresoNeto >= 0 ? "text-slate-700" : "text-red-600"}">${formatSignedCurrency(row.deltaVsToday)}</span>
                    </div>
                </div>
            </button>
        `;}).join("");

        return `
            <div class="space-y-3">
                <div class="grid gap-2 sm:grid-cols-3">${focusCards}</div>
                <div class="flex flex-wrap gap-1.5">${legendItems}</div>
                <div class="calendar-month-scroll -mx-1 overflow-x-auto pb-2">
                    <div class="calendar-month-grid min-w-[1040px] px-2 sm:min-w-0">
                        <div class="flex gap-2">
                            ${dayCells}
                        </div>
                    </div>
                </div>
                <div class="rounded-2xl border border-slate-100 bg-white/80 px-3 py-2 text-[11px] text-slate-500">
                    ${analysis.projectedDays > 0
                        ? `Los ultimos ${analysis.projectedDays} dias usan proyeccion porque el pronostico real no llega tan lejos.`
                        : "Todo el horizonte entra dentro del pronostico disponible."}
                </div>
            </div>
        `;
    }

    function renderTemporalSelectionSummary(row, analysis) {
        if (!row) {
            resetTemporalSelectionSummary();
            return;
        }

        if (elements.temporalSelectedDayLabel) {
            elements.temporalSelectedDayLabel.textContent = `${row.dayLabel} ${row.dayNumber}`;
        }

        if (elements.temporalSelectedState) {
            elements.temporalSelectedState.textContent = row.stateLabel;
            elements.temporalSelectedState.className = `mt-2 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${row.stateTone}`;
        }

        if (elements.temporalSelectedHumidity) {
            elements.temporalSelectedHumidity.textContent = `${formatDecimal(row.humidityEstimada, 1)}%`;
        }

        if (elements.temporalSelectedNet) {
            elements.temporalSelectedNet.textContent = formatCurrency(row.ingresoNeto);
        }

        if (elements.temporalSelectedDelta) {
            elements.temporalSelectedDelta.textContent = `vs hoy: ${formatSignedCurrency(row.deltaVsToday)}`;
            elements.temporalSelectedDelta.className = `mt-1 text-[11px] font-semibold ${row.deltaVsToday >= 0 ? "text-emerald-700" : "text-red-600"}`;
        }
    }

    function resetTemporalSelectionSummary() {
        if (elements.temporalSelectedDayLabel) {
            elements.temporalSelectedDayLabel.textContent = "---";
        }
        if (elements.temporalSelectedState) {
            elements.temporalSelectedState.textContent = "---";
            elements.temporalSelectedState.className = "mt-2 inline-flex rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500";
        }
        if (elements.temporalSelectedHumidity) {
            elements.temporalSelectedHumidity.textContent = "---";
        }
        if (elements.temporalSelectedNet) {
            elements.temporalSelectedNet.textContent = "---";
        }
        if (elements.temporalSelectedDelta) {
            elements.temporalSelectedDelta.textContent = "---";
            elements.temporalSelectedDelta.className = "mt-1 text-[11px] font-semibold text-slate-500";
        }
    }

    function handleTemporalDaySelection(event) {
        const button = event.target.closest("button[data-day-key]");
        if (!button || !state.temporalAnalysis?.rows?.length) {
            return;
        }

        const nextKey = button.dataset.dayKey;
        if (!nextKey || nextKey === state.selectedTemporalDayKey) {
            return;
        }

        state.selectedTemporalDayKey = nextKey;
        renderTemporalAnalysis(state.lastResult);
    }

    function isWetWeather(forecast) {
        const code = Number.isFinite(forecast.weatherCode) ? forecast.weatherCode : NaN;
        const label = forecast.weather?.label || "";
        return (
            (Number.isFinite(forecast.precipitationChance) && forecast.precipitationChance >= 60) ||
            (Number.isFinite(forecast.precipitationSum) && forecast.precipitationSum >= 4) ||
            ["Llovizna", "Lluvia", "Chubascos", "Tormenta"].includes(label) ||
            (Number.isFinite(code) && ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95))
        );
    }

    function persistScenario(result) {
        const history = readHistory();
        history.push(result);
        writeHistory(history);
        writeJson(STORAGE_KEYS.lastResult, result);
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
        writeJson(STORAGE_KEYS.lastResult, entry);

        if (!isResultsPage) {
            window.location.href = "dashboard.html";
            return;
        }

        renderResults(entry);
        updateClimateLocationLabel(entry.latitud, entry.longitud);
        if (hasValidCoordinates(entry.latitud, entry.longitud)) {
            fetchClimate({ latitud: entry.latitud, longitud: entry.longitud }, { includeDaily: true });
        }
        setActiveNav("resumen-section");
        document.getElementById("resumen-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
        showStatus(`Escenario de ${entry.lote ?? "Lote sin nombre"} cargado en el dashboard.`, "success");
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
        if (isEntryPage || isClimatePage) {
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
            url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,relative_humidity_2m_mean,weather_code");
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

                renderTemporalAnalysis(state.lastResult);
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

                renderTemporalAnalysis(state.lastResult);
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
                    <span class="mt-0.5 block text-[10px] font-medium text-green-600">Lectura del escenario actual</span>
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
            const date = new Date(`${time}T12:00:00`);
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
            <div class="h-20 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70"></div>
        `);

        const dayCells = [];
        for (let day = 1; day <= daysInMonth; day += 1) {
            const date = new Date(baseDate.getFullYear(), baseDate.getMonth(), day, 12, 0, 0);
            const key = toDateKey(date);
            const record = lookup.get(key);
            const weather = record ? getWeatherMeta(record.weatherCode) : { icon: "-", label: "Sin dato" };
            const rain = record?.rain;
            const hasRain = Number.isFinite(rain);
            dayCells.push(`
                <div class="calendar-day-card min-h-20 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm ${day === baseDate.getDate() ? "ring-2 ring-green-600/20" : ""}">
                    <div class="flex items-start justify-between gap-2">
                        <div class="min-w-0">
                            <p class="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Dia ${day}</p>
                            <p class="mt-1 truncate text-xs font-semibold text-slate-800 sm:text-sm">${weather.label}</p>
                        </div>
                        <span class="shrink-0 text-base leading-none sm:text-lg">${weather.icon}</span>
                    </div>
                    <div class="mt-2 flex items-end justify-between gap-2 sm:mt-3">
                        <p class="text-[10px] text-slate-500 sm:text-[11px]">${record ? `${formatDecimal(record.max, 1)} C / ${formatDecimal(record.min, 1)} C` : "Sin pronostico"}</p>
                        <span class="rounded-full border px-2 py-0.5 text-[9px] font-semibold sm:text-[10px] ${hasRain && rain >= 60 ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-400"}">${hasRain ? `${formatDecimal(rain, 0)}% lluvia` : "-"}</span>
                    </div>
                </div>
            `);
        }

        const headers = weekdayLabels.map((label) => `
            <div class="pb-1 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">${label}</div>
        `).join("");

        return `
            <div class="calendar-month-scroll -mx-1 overflow-x-auto pb-1">
                <div class="calendar-month-grid min-w-[560px] px-1 sm:min-w-0">
                    <div class="grid grid-cols-7 gap-1.5 sm:gap-2">${headers}</div>
                    <div class="mt-2 grid grid-cols-7 gap-1.5 sm:gap-2">
                        ${emptyCells.join("")}
                        ${dayCells.join("")}
                    </div>
                </div>
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

    function addDays(date, days) {
        const next = new Date(date);
        next.setDate(next.getDate() + days);
        return next;
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

    function readLastScenario() {
        const lastResult = readJson(STORAGE_KEYS.lastResult, null);
        if (lastResult && typeof lastResult === "object") {
            return lastResult;
        }

        const history = readHistory();
        return history.length > 0 ? history[history.length - 1] : null;
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

    function formatSignedCurrency(value) {
        const amount = formatCurrency(Math.abs(Number.isFinite(value) ? value : 0));
        if (!Number.isFinite(value) || value === 0) {
            return amount;
        }

        return `${value > 0 ? "+" : "-"} ${amount}`;
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

    function clampNumber(value, min, max) {
        if (!Number.isFinite(value)) {
            return min;
        }

        return Math.min(Math.max(value, min), max);
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

