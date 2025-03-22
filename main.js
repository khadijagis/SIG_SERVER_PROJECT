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
    "esri/widgets/Search"

], function (esriConfig, Map, MapView, BasemapToggle, BasemapGallery, FeatureLayer, PopupTemplate, Legend, DistanceMeasurement2D, Search) {

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
    // Couche Communes
    const Communeslayer = new FeatureLayer({
        url: "https://services5.arcgis.com/QSH6YPknm65jcM1C/arcgis/rest/services/communes2/FeatureServer/0",
        popupTemplate: {
            title: "Nom de la commune: {COMMUNE_AR}"// Titre du pop-up
            
        }
    });

    // Couche Population
    const populationlayer = new FeatureLayer({
        url: "https://services5.arcgis.com/QSH6YPknm65jcM1C/arcgis/rest/services/casa_population1/FeatureServer/0",
        popupTemplate: {
            title: "Population",
            content: "Densité: {densite200} hab/km²"
        }
    });

    // Couche Voirie
    const Voirielayer = new FeatureLayer({
        url: "https://services5.arcgis.com/QSH6YPknm65jcM1C/arcgis/rest/services/Voiriecasa2/FeatureServer/0",
        popupTemplate: {
            title: "fenêtres contextuelles des voiries",
            content: `Route: {NOM}<br>Longueur: {LENGTH} m` // Utilisez <br> pour un saut de ligne
        }
    });

    // Couche Hôtels
    const Hotellayer = new FeatureLayer({
        url: "https://services5.arcgis.com/QSH6YPknm65jcM1C/arcgis/rest/services/Hotels2/FeatureServer/0",
        renderer: {
            type: "simple",
            symbol: {
                type: "simple-marker",
                color: [0, 255, 0], // vert
                size: "8px",
                outline: {
                    color: [255, 255, 255], // Blanc
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
                style: "square", // Carré
                color: [0, 0, 255], // Bleu
                size: "8px",
                outline: {
                    color: [255, 255, 255], // Blanc
                    width: "1px"
                }
            }
        },
        popupTemplate: {
            title: "Fenetres contextuelles des Grandes surface: {NOM}",
            content: "Adresse: {Adresse}"
        }
    });

    // Ajouter toutes les couches à la carte
    map.addMany([Communeslayer, populationlayer, Voirielayer, Hotellayer, GrandeSurfacelayer]);
});