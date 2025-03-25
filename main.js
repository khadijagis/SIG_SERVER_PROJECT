require([
    "esri/config",
    "esri/Map",
    "esri/views/MapView",
    "esri/widgets/BasemapToggle",
    "esri/widgets/BasemapGallery",
    "esri/layers/FeatureLayer",
    "esri/PopupTemplate",
    "esri/widgets/Legend",
    "esri/widgets/DistanceMeasurement2D",
    "esri/widgets/Search",
    "esri/renderers/ClassBreaksRenderer",
    "esri/smartMapping/statistics/classBreaks"

], function (esriConfig, Map, MapView, BasemapToggle, BasemapGallery, FeatureLayer, PopupTemplate, Legend, DistanceMeasurement2D, Search, ClassBreaksRenderer, classBreaks) {

    let pop2004Renderer, pop1994Renderer, popComparisonRenderer;


    esriConfig.apiKey = "AAPTxy8BH1VEsoebNVZXo8HurNiAQH-39qxj5nbCUefBlq2lNWDAXtMnUmOPWFFazKSRLrWxAk91f4KEwaMq6jsecbqgep37gFrxm-bw4pnLqjoS6cqdNHkVjSKEReZm6t71-_VRCMfTp4-lyb-O8ag6iankvWPnnUGsDLMPQ9YCDK_3_G7ALCy9PAHE3TnE3T5x6YPX5iwypPrcAUicHFVD9JYhxkXZ3ce5FXhjiFzK8Kv-iaHz3XZ42ndKMDOo66ccAT1_XqOdHyna";

    const map = new Map({
        basemap: "arcgis-topographic" // Basemap par défaut
    });

    const view = new MapView({
        map: map,
        center: [-7.62, 33.59], // Longitude, latitude
        zoom: 13,
        container: "viewDiv"
    });

    // Ajouter le widget de mesure

    const distanceMeasurement = new DistanceMeasurement2D({
        view: view
    });
    view.ui.add(distanceMeasurement, "bottom-right");

    // Ajouter le BasemapToggle
    const basemapToggle = new BasemapToggle({
        view: view,
        nextBasemap: "arcgis-imagery" // Basemap alternatif
    });

    view.ui.add(basemapToggle, { position: "bottom-right" });

    // Ajouter le BasemapGallery
    const basemapGallery = new BasemapGallery({
        view: view
    });
    view.ui.add(basemapGallery, "top-right");

    // Légende
    let legend = new Legend({
        view: view,
    });
    view.ui.add(legend, "bottom-left");
    //widget search
    const search = new Search({
        view: view
    });
    view.ui.add(search, "top-left");

    // Fonction utilitaire pour créer des symboles
    function createFillSymbol(color) {
        return {
            type: "simple-fill",
            color: [...color, 0.7],
            outline: {
                color: [110, 110, 110],
                width: 0.7
            }
        };
    }
    // Couche Communes
    const Communeslayer = new FeatureLayer({
        url: "https://services5.arcgis.com/QSH6YPknm65jcM1C/arcgis/rest/services/communes2/FeatureServer/0",
        popupTemplate: {
            title: "Nom de la commune: {COMMUNE_AR}"

        }


    });


    let prefectureRenderer;
    let communeRenderer;

    // Récupérer les valeurs uniques pour les préfectures
    /*
    Communeslayer.when(function () {
        const query = Communeslayer.createQuery();
        query.outFields = ["PREFECTURE"]; // Champ 
        query.returnDistinctValues = true; // Récupérer uniquement les valeurs distinctes

        Communeslayer.queryFeatures(query).then(function (results) {
            const prefectures = results.features.map(function (feature) {
                return feature.attributes.PREFECTURE;
            });

            // Créer le renderer dynamique par préfecture
            prefectureRenderer = createPrefectureRenderer(prefectures);

            // Appliquer le renderer par défaut (par préfecture)
            Communeslayer.renderer = prefectureRenderer;
        });
    });
    */

    // Récupérer les valeurs uniques pour les communes/arrondissements

    Communeslayer.when(function () {
        // Récupérer les valeurs uniques pour les préfectures
        const queryPref = Communeslayer.createQuery();
        queryPref.outFields = ["PREFECTURE"];
        queryPref.returnDistinctValues = true;
        
        Communeslayer.queryFeatures(queryPref).then(function (results) {
            const prefectures = results.features.map(function (feature) {
                return feature.attributes.PREFECTURE;
            });
            prefectureRenderer = createPrefectureRenderer(prefectures);
        });
    
        // Récupérer les valeurs uniques pour les communes
        const queryComm = Communeslayer.createQuery();
        queryComm.outFields = ["COMMUNE_AR"];
        queryComm.returnDistinctValues = true;
    
        Communeslayer.queryFeatures(queryComm).then(function (results) {
            const communes = results.features.map(function (feature) {
                return feature.attributes.COMMUNE_AR;
            });
            communeRenderer = createCommuneRenderer(communes);
        });
    });
    
    Communeslayer.when(function () {
        const query = Communeslayer.createQuery();
        query.outFields = ["COMMUNE_AR"];
        query.returnDistinctValues = true;

        Communeslayer.queryFeatures(query).then(function (results) {
            const communes = results.features.map(function (feature) {
                return feature.attributes.COMMUNE_AR;
            });

            // Créer le renderer dynamique par commune/arrondissement
            communeRenderer = createCommuneRenderer(communes);
        });
    });

    // Fonction pour créer un renderer dynamique par préfecture
    function createPrefectureRenderer(prefectures) {
        const colors = [
            [255, 0, 0, 0.5],
            [0, 255, 0, 0.5],
            [0, 0, 255, 0.5],
            [255, 255, 0, 0.5],
            [255, 0, 255, 0.5],
            [0, 255, 255, 0.5],
            [128, 0, 128, 0.5],
            [255, 165, 0, 0.5],
        ];

        const uniqueValueInfos = prefectures.map(function (prefecture, index) {
            return {
                value: prefecture,
                symbol: {
                    type: "simple-fill",
                    color: colors[index % colors.length],
                    outline: {
                        color: [0, 0, 0],
                        width: 1
                    }
                }
            };
        });

        return {
            type: "unique-value",
            field: "PREFECTURE",
            uniqueValueInfos: uniqueValueInfos
        };
    }

    // Fonction pour créer un renderer dynamique par commune/arrondissement
    function createCommuneRenderer(communes) {
        const colors = [
            [255, 0, 0, 0.5],
            [0, 255, 0, 0.5],
            [0, 0, 255, 0.5],
            [255, 255, 0, 0.5],
            [255, 0, 255, 0.5],
            [0, 255, 255, 0.5],
            [128, 0, 128, 0.5],
            [255, 165, 0, 0.5],
        ];

        const uniqueValueInfos = communes.map(function (commune, index) {
            return {
                value: commune, // Valeur de la commune/arrondissement
                symbol: {
                    type: "simple-fill",
                    color: colors[index % colors.length],
                    outline: {
                        color: [0, 0, 0],
                        width: 1
                    }
                }
            };
        });

        return {
            type: "unique-value", // Symbologie unique par valeur
            field: "COMMUNE_AR", // Champ pour la commune/arrondissement
            uniqueValueInfos: uniqueValueInfos // Liste des communes avec leurs symboles
        };
    }

    // Renderer par surface (cinq classes)
    const surfaceRenderer = {
        type: "class-breaks",
        field: "Shape_Area", // Champ utilisé pour la symbologie
        defaultSymbol: { // Symbole par défaut pour les valeurs nulles ou vides
            type: "simple-fill",
            color: [150, 150, 150, 0.5], // Gris
            outline: {
                color: [100, 100, 100],
                width: 1
            }
        },
        classBreakInfos: [
            // Classe 1 : 600K - 40M m²
            {
                minValue: 600000,
                maxValue: 40000000,
                symbol: {
                    type: "simple-fill",
                    color: [255, 255, 204, 0.5],
                    outline: {
                        color: [255, 255, 204],
                        width: 1
                    }
                },
                label: "600K - 40M m²"
            },
            // Classe 2 : 40M - 80M m²
            {
                minValue: 40000000,
                maxValue: 80000000,
                symbol: {
                    type: "simple-fill",
                    color: [255, 204, 153, 0.5],
                    outline: {
                        color: [255, 204, 153],
                        width: 1
                    }
                },
                label: "40M - 80M m²"
            },
            // Classe 3 : 80M - 120M m²
            {
                minValue: 80000000,
                maxValue: 120000000,
                symbol: {
                    type: "simple-fill",
                    color: [255, 153, 102, 0.5],
                    outline: {
                        color: [255, 153, 102],
                        width: 1
                    }
                },
                label: "80M - 120M m²"
            },
            // Classe 4 : 120M - 160M m²
            {
                minValue: 120000000,
                maxValue: 160000000,
                symbol: {
                    type: "simple-fill",
                    color: [255, 102, 51, 0.5],
                    outline: {
                        color: [255, 102, 51],
                        width: 1
                    }
                },
                label: "120M - 160M m²"
            },
            // Classe 5 : 160M - 194M m²
            {
                minValue: 160000000,
                maxValue: 194000000,
                symbol: {
                    type: "simple-fill",
                    color: [255, 51, 0, 0.5],
                    outline: {
                        color: [255, 51, 0],
                        width: 1
                    }
                },
                label: "160M - 194M m²"
            }
        ]
    };
    const populationColors = [
        [255, 255, 178], // Jaune très clair
        [254, 204, 92],  // Jaune
        [253, 141, 60],  // Orange
        [240, 59, 32],   // Rouge-orange
        [189, 0, 38]     // Rouge foncé
    ];

    // Appliquer le renderer par défaut (optionnel)
    //Communeslayer.renderer = surfaceRenderer;

    // Gérer le changement de symbologie
    document.getElementById("communesSymbology").addEventListener("change", function (event) {
        const selectedValue = event.target.value;
        switch (selectedValue) {
            case "prefecture":
                console.log("Application du renderer par préfecture");
                Communeslayer.renderer = prefectureRenderer;
                break;
            case "commune":
                console.log("Application du renderer par commune/arrondissement");
                Communeslayer.renderer = communeRenderer;
                break;
            case "surface":
                console.log("Application du renderer par surface");
                Communeslayer.renderer = surfaceRenderer;
                break;

        }
    });



    // Couche Population
    const populationLayer = new FeatureLayer({
        url: "https://services5.arcgis.com/QSH6YPknm65jcM1C/arcgis/rest/services/casa_population1/FeatureServer/0",
        visible: true, // Visible par défaut
        popupTemplate: {
            title: "Population - {COMMUNE_AR}",
            content: [{
                type: "fields",
                fieldInfos: [
                    { fieldName: "TOTAL1994", label: "Population 1994", format: { digitSeparator: true } },
                    { fieldName: "TOTAL2004", label: "Population 2004", format: { digitSeparator: true } },
                    { fieldName: "densite200", label: "Densité (hab/km²)", format: { digitSeparator: true } }
                ]
            }]
        }
    });
    

    




// Fonction pour créer un renderer par classe de population
function createPopulationRenderer(field, title, minValue, maxValue) {
    const range = maxValue - minValue;
    const classSize = range / 5;
    
    return {
        type: "class-breaks",
        field: field,
        legendOptions: { title: title },
        classBreakInfos: [
            createClassBreak(minValue, minValue + classSize, populationColors[0]),
            createClassBreak(minValue + classSize, minValue + 2 * classSize, populationColors[1]),
            createClassBreak(minValue + 2 * classSize, minValue + 3 * classSize, populationColors[2]),
            createClassBreak(minValue + 3 * classSize, minValue + 4 * classSize, populationColors[3]),
            createClassBreak(minValue + 4 * classSize, maxValue, populationColors[4])
        ]
    };
}

// Fonction helper pour créer une classe
function createClassBreak(min, max, color) {
    return {
        minValue: min,
        maxValue: max,
        symbol: {
            type: "simple-fill",
            color: [...color, 0.7],
            outline: { color: [110, 110, 110], width: 0.7 }
        },
        label: `${Math.round(min/1000)}K - ${Math.round(max/1000)}K`
    };
}

// Fonction pour le renderer de comparaison avec diagrammes
function createComparisonRenderer() {
    return {
        type: "class-breaks",
        field: "TOTAL2004",
        legendOptions: { title: "Comparaison 1994/2004" },
        classBreakInfos: [
            createClassBreak(0, 1, [255, 255, 255]) // Classe factice pour le diagramme
        ],
        visualVariables: [{
            type: "size",
            field: "TOTAL1994",
            minDataValue: 3000,
            maxDataValue: 325000,
            minSize: 5,
            maxSize: 30,
            legendOptions: { title: "Population 1994" }
        }, {
            type: "color",
            field: "TOTAL2004",
            stops: [
                { value: 3000, color: [255, 255, 204] },
                { value: 325000, color: [255, 51, 0] }
            ],
            legendOptions: { title: "Population 2004" }
        }]
    };
}

// Initialisation des renderers
view.when(() => {
    populationLayer.when(() => {
        const query = populationLayer.createQuery();
        query.outStatistics = [
            { statisticType: "min", onStatisticField: "TOTAL1994", outStatisticFieldName: "min1994" },
            { statisticType: "max", onStatisticField: "TOTAL1994", outStatisticFieldName: "max1994" },
            { statisticType: "min", onStatisticField: "TOTAL2004", outStatisticFieldName: "min2004" },
            { statisticType: "max", onStatisticField: "TOTAL2004", outStatisticFieldName: "max2004" }
        ];

        populationLayer.queryFeatures(query).then(results => {
            const stats = results.features[0].attributes;
            const min1994 = stats.min1994 || 3000;
            const max1994 = stats.max1994 || 250000;
            const min2004 = stats.min2004 || 3000;
            const max2004 = stats.max2004 || 320000;

            pop1994Renderer = createPopulationRenderer("TOTAL1994", "Population 1994", min1994, max1994);
            pop2004Renderer = createPopulationRenderer("TOTAL2004", "Population 2004", min2004, max2004);
            popComparisonRenderer = createComparisonRenderer();
            
            populationLayer.renderer = pop2004Renderer;
            populationLayer.visible = true;
        });
    });
});

// Gestion du changement de mode de visualisation
document.getElementById("populationSymbology").addEventListener("change", function(e) {
    Communeslayer.visible = false;
    populationLayer.visible = true;
    
    switch(e.target.value) {
        case "pop1994":
            populationLayer.renderer = pop1994Renderer;
            break;
        case "pop2004":
            populationLayer.renderer = pop2004Renderer;
            break;
        case "comparison":
            populationLayer.renderer = popComparisonRenderer;
            break;
    }
    
    view.goTo(view.extent).catch(() => {});
});

    // Couche Voirie
    const Voirielayer = new FeatureLayer({
        url: "https://services5.arcgis.com/QSH6YPknm65jcM1C/arcgis/rest/services/Voiriecasa2/FeatureServer/0",
        popupTemplate: {
            title: "fenêtres contextuelles des voiries",
            content: `Route: {NOM}<br>Longueur: {LENGTH} m`
        }
    });

    // Couche Hôtels
    const Hotellayer = new FeatureLayer({
        url: "https://services5.arcgis.com/QSH6YPknm65jcM1C/arcgis/rest/services/Hotels2/FeatureServer/0",
        renderer: {
            type: "simple",
            symbol: {
                type: "simple-marker",
                color: [0, 255, 0],
                size: "8px",
                outline: {
                    color: [255, 255, 255],
                    width: "1px"
                }
            }
        },
        popupTemplate: {
            title: "fenêtres contextuelles des hotels",
            content: `Hotel: {HOTEL}<br>Adreese : {ADRESSE} m`
        }
    });

    // Couche Grandes surfaces
    const GrandeSurfacelayer = new FeatureLayer({
        url: "https://services5.arcgis.com/QSH6YPknm65jcM1C/arcgis/rest/services/Grande_surface2/FeatureServer/0",
        renderer: {
            type: "simple",
            symbol: {
                type: "simple-marker",
                style: "square",
                color: [0, 0, 255],
                size: "8px",
                outline: {
                    color: [255, 255, 255],
                    width: "1px"
                }
            }
        },
        popupTemplate: {
            title: "Fenetres contextuelles des Grandes surface: {NOM}",
            content: "Adresse: {Adresse}"
        }
    });
    // Gestion des événements
    document.getElementById("communesSymbology")?.addEventListener("change", function (e) {
        // Masquer la couche population
        populationLayer.visible = false;

        // Afficher la couche communes
        Communeslayer.visible = true;

        switch (e.target.value) {
            case "prefecture":
                Communeslayer.renderer = prefectureRenderer;
                break;
            case "commune":
                Communeslayer.renderer = communeRenderer;
                break;
            case "surface":
                Communeslayer.renderer = surfaceRenderer;
                break;
        }
    });

    document.getElementById("populationSymbology")?.addEventListener("change", function (e) {
        // Masquer la couche communes
        Communeslayer.visible = false;

        // Afficher la couche population
        populationLayer.visible = true;

        switch (e.target.value) {
            case "pop2004":
                populationLayer.renderer = pop2004Renderer;
                break;
            case "pop1994":
                populationLayer.renderer = pop1994Renderer;
                break;
            case "comparison":
                populationLayer.renderer = popComparisonRenderer;
                break;
        }
    });


    // Ajouter toutes les couches à la carte
    map.addMany([populationLayer, Communeslayer, Voirielayer, Hotellayer, GrandeSurfacelayer]);


});
