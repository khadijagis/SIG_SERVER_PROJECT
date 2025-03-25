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
    view: view,
    container: "basemapGalleryContainer" // Nouveau conteneur dédié
});


  // Légende
  let legend = new Legend({
      view: view,
  });
  view.ui.add(legend,  {
    position: "top-left",
    index: 0 // Place le widget de recherche après l'outil de zoom
});
  //widget search
  const search = new Search({
      view: view
  });
  view.ui.add(search, {
    position: "top-left",
    index: 0 // Place le widget de recherche après l'outil de zoom
});
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

  // Récupérer les valeurs uniques pour les communes/arrondissements
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

  // Appliquer le renderer par défaut (optionnel)
  Communeslayer.renderer = surfaceRenderer;

  // Gérer le changement de symbologie
  document.getElementById("symbologySelector").addEventListener("change", function (event) {
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
          default:
              console.log("Aucun renderer sélectionné");
              break;
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

  // Ajouter toutes les couches à la carte
  map.addMany([Communeslayer, populationlayer, Voirielayer, Hotellayer, GrandeSurfacelayer]);
  


  //Partie 3
  // Configuration des filtres pour les hôtels
  function setupHotelFilter() {
    const hotelFilter = document.getElementById("hotelCategoryFilter");
    
    const query = Hotellayer.createQuery();
    query.outFields = ["CATÉGORIE"];
    query.returnDistinctValues = true; // Nécessaire pour les serveurs ArcGIS

    Hotellayer.queryFeatures(query).then(results => {
        // Utilisation d'un Set pour les valeurs uniques
        const uniqueCategories = new Set();

        results.features.forEach(feature => {
            // Normalisation : suppression des espaces et conversion en majuscules
            const category = feature.attributes.CATÉGORIE
                .trim()
                .toUpperCase();
            
            uniqueCategories.add(category);
        });

        // Conversion du Set en array trié
        const sortedCategories = Array.from(uniqueCategories).sort();

        // Remplissage du dropdown
        sortedCategories.forEach(category => {
            const option = document.createElement("option");
            option.value = category;
            option.text = category;
            hotelFilter.appendChild(option);
        });
    });

    // Gestionnaire d'événements inchangé
    hotelFilter.addEventListener("change", function(e) {
      const category = e.target.value;
      Hotellayer.definitionExpression = category ? `CATÉGORIE = '${category}'` : "";
  });
}

// Configuration des filtres pour les grandes surfaces
function setupStoreFilter() {
  const storeFilter = document.getElementById("storeTypeFilter");
  
  const query = GrandeSurfacelayer.createQuery();
  query.outFields = ["Type"];
  query.returnDistinctValues = true;

  GrandeSurfacelayer.queryFeatures(query).then(results => {
      const uniqueTypes = new Set();

      // Normalisation des valeurs
      results.features.forEach(feature => {
          const typeValue = feature.attributes.Type
              .trim() // Enlève les espaces
              .toUpperCase(); // Uniformise la casse
          
          uniqueTypes.add(typeValue);
      });

      // Tri alphabétique et création des options
      Array.from(uniqueTypes)
          .sort()
          .forEach(type => {
              const option = document.createElement("option");
              option.value = type;
              option.textContent = type;
              storeFilter.appendChild(option);
          });
  });

  storeFilter.addEventListener("change", function(e) {
    const type = e.target.value;
    GrandeSurfacelayer.definitionExpression = type ? `Type = '${type}'` : "";
});
}

// Initialisation des filtres
setupHotelFilter();
setupStoreFilter();
});

