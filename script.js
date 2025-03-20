import { handleClickEvent } from "./countries.js";

const w = 3000;
const h = 1250;

// Variables pour les limites de zoom
let minZoom;
let maxZoom;

// Création de la projection géographique avec D3
const projection = d3.geoEquirectangular()
  .center([0, 15])
  .scale([w / (2 * Math.PI)])
  .translate([w / 2, h / 2]);

// Création du générateur de chemin géographique
const path = d3.geoPath().projection(projection);

// Variables globales pour les éléments du DOM
let svgElement;
let countriesGroupElement;

// Fonction appelée lors du zoom
function zoomed(event) {
  const t = event.transform;
  // Utiliser d3.select pour la transformation pour plus de fiabilité
  d3.select(countriesGroupElement).attr("transform", `translate(${t.x}, ${t.y})scale(${t.k})`);
}

// Initialisation des paramètres de zoom
function initiateZoom() {
  const mapHolder = document.getElementById("map-holder");
  if (!mapHolder) {
    console.error("Élément map-holder non trouvé");
    return;
  }
  
  minZoom = Math.max(mapHolder.clientWidth / w, mapHolder.clientHeight / h);
  maxZoom = 2 * minZoom;

  const zoomBehavior = d3.zoom()
    .scaleExtent([minZoom, maxZoom])
    .translateExtent([[0, 0], [w, h]])
    .on("zoom", zoomed);
  
  // Appliquer le zoom initial
  const midX = (mapHolder.clientWidth - minZoom * w) / 2;
  const midY = (mapHolder.clientHeight - minZoom * h) / 2;

  // Utiliser d3.select pour appliquer le zoom
  d3.select(svgElement)
    .call(zoomBehavior)
    .call(zoomBehavior.transform, d3.zoomIdentity.translate(midX, midY).scale(minZoom));
  
  // Stocker la référence au zoom pour une utilisation ultérieure
  svgElement._zoomBehavior = zoomBehavior;
}

// Fonction pour zoomer sur une zone spécifique de la carte
function boxZoom(box, centroid, paddingPerc) {
  if (!svgElement || !svgElement._zoomBehavior) {
    console.error("SVG ou comportement de zoom non initialisé");
    return;
  }
  
  const minXY = box[0];
  const maxXY = box[1];
  const zoomBehavior = svgElement._zoomBehavior;

  let zoomWidth = Math.abs(minXY[0] - maxXY[0]);
  let zoomHeight = Math.abs(minXY[1] - maxXY[1]);

  const zoomMidX = centroid[0];
  const zoomMidY = centroid[1];

  // Éviter les divisions par zéro
  if (zoomWidth < 1) zoomWidth = 1;
  if (zoomHeight < 1) zoomHeight = 1;

  // Ajout de padding à la zone de zoom
  zoomWidth = zoomWidth * (1 + paddingPerc / 100);
  zoomHeight = zoomHeight * (1 + paddingPerc / 100);

  // Calcul de l'échelle maximale possible
  const maxXscale = svgElement.clientWidth / zoomWidth;
  const maxYscale = svgElement.clientHeight / zoomHeight;
  let zoomScale = Math.min(maxXscale, maxYscale);

  // Limiter l'échelle aux valeurs min et max définies
  zoomScale = Math.min(zoomScale, maxZoom);
  zoomScale = Math.max(zoomScale, minZoom);

  // Calcul des décalages
  const offsetX = zoomScale * zoomMidX;
  const offsetY = zoomScale * zoomMidY;

  let dleft = Math.min(0, svgElement.clientWidth / 2 - offsetX);
  let dtop = Math.min(0, svgElement.clientHeight / 2 - offsetY);

  dleft = Math.max(svgElement.clientWidth - w * zoomScale, dleft);
  dtop = Math.max(svgElement.clientHeight - h * zoomScale, dtop);

  // Animation de zoom
  d3.select(svgElement)
    .transition()
    .duration(500)
    .call(zoomBehavior.transform, d3.zoomIdentity.translate(dleft, dtop).scale(zoomScale));
}

// Gestion du redimensionnement de la fenêtre
window.addEventListener('resize', function() {
  const mapHolder = document.getElementById("map-holder");
  if (!mapHolder || !svgElement) return;
  
  // Redimensionnement du SVG
  svgElement.setAttribute("width", mapHolder.clientWidth);
  svgElement.setAttribute("height", mapHolder.clientHeight);

  initiateZoom();
});

// Fonction pour ajouter les écouteurs d'événements aux pays
function addCountryEventListeners(countryElement, data) {
  if (!countryElement || !data || !data.properties) return;
  
  // Mouseover
  countryElement.addEventListener('mouseover', function() {
    const countryLabel = document.getElementById("countryLabel" + data.properties.iso_a3);
    if (countryLabel) {
      countryLabel.style.display = "block";
    }
  });
  
  // Mouseout
  countryElement.addEventListener('mouseout', function() {
    const countryLabel = document.getElementById("countryLabel" + data.properties.iso_a3);
    if (countryLabel) {
      countryLabel.style.display = "none";
    }
  });
  
  // Click
  countryElement.addEventListener('click', function() {
    // Réinitialiser tous les pays
    const countries = document.querySelectorAll(".country");
    countries.forEach(country => {
      country.classList.remove("country-on");
    });
    
    // Activer le pays cliqué
    this.classList.add("country-on");
    
    // Effectuer le zoom sur le pays
    boxZoom(path.bounds(data), path.centroid(data), 20);


    handleClickEvent(data);
  });
}

// Fonction pour ajouter les écouteurs d'événements aux étiquettes
function addLabelEventListeners(labelElement, data) {
  if (!labelElement || !data || !data.properties) return;
  
  // Mouseover
  labelElement.addEventListener('mouseover', function() {
    this.style.display = "block";
  });
  
  // Mouseout
  labelElement.addEventListener('mouseout', function() {
    this.style.display = "none";
  });
  
  // Click
  labelElement.addEventListener('click', function() {
    // Réinitialiser tous les pays
    const countries = document.querySelectorAll(".country");
    countries.forEach(country => {
      country.classList.remove("country-on");
    });
    
    // Activer le pays associé
    const countryElement = document.getElementById("country" + data.properties.iso_a3);
    if (countryElement) {
      countryElement.classList.add("country-on");
    }
    
    // Effectuer le zoom sur le pays
    boxZoom(path.bounds(data), path.centroid(data), 20);
  });
}

// Fonction pour charger les données avec fetch
async function loadMapData() {
  try {
    const response = await fetch("https://raw.githubusercontent.com/andybarefoot/andybarefoot-www/master/maps/mapdata/custom50.json");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const json = await response.json();
    return json;
  } catch (error) {
    console.error("Erreur lors du chargement des données:", error);
    return null;
  }
}

// Fonction pour créer l'étiquette du pays
function createCountryLabel(feature) {
  if (!feature || !feature.properties) return null;
  
  const labelGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  labelGroup.classList.add("countryLabel");
  labelGroup.setAttribute("id", "countryLabel" + feature.properties.iso_a3);
  
  const centroid = path.centroid(feature);
  // Vérifier si le centroid est valide
  if (!centroid || centroid.length < 2 || isNaN(centroid[0]) || isNaN(centroid[1])) {
    console.warn("Centroïde invalide pour", feature.properties.name);
    return null;
  }
  
  labelGroup.setAttribute("transform", `translate(${centroid[0]}, ${centroid[1]})`);
  labelGroup.style.display = "none";
  
  // Créer le texte de l'étiquette
  const labelText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  labelText.classList.add("countryName");
  labelText.style.textAnchor = "middle";
  labelText.setAttribute("dx", 0);
  labelText.setAttribute("dy", 0);
  labelText.textContent = feature.properties.name;
  labelGroup.appendChild(labelText);
  
  // Créer le fond de l'étiquette (rectangle vide pour l'instant)
  const labelBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  labelBg.classList.add("countryLabelBg");
  labelBg.setAttribute("x", -2); // Position temporaire
  labelBg.setAttribute("y", -10); // Position temporaire
  labelBg.setAttribute("width", 4); // Taille temporaire
  labelBg.setAttribute("height", 12); // Taille temporaire
  
  // Insérer le fond avant le texte
  labelGroup.insertBefore(labelBg, labelText);
  
  return {
    group: labelGroup,
    background: labelBg,
    text: labelText
  };
}

// Fonction pour ajuster les dimensions du fond d'étiquette
function adjustLabelBackground(label) {
  if (!label || !label.text || !label.background) return;
  
  // Maintenant que l'élément est dans le DOM, on peut obtenir sa boîte englobante
  const bbox = label.text.getBBox();
  
  // Ajuster le fond
  label.background.setAttribute("x", bbox.x - 2);
  label.background.setAttribute("y", bbox.y);
  label.background.setAttribute("width", bbox.width + 4);
  label.background.setAttribute("height", bbox.height);
}

// Fonction d'initialisation de la carte
async function initMap() {
  const mapHolder = document.getElementById("map-holder");
  if (!mapHolder) {
    console.error("Élément map-holder non trouvé");
    return;
  }
  
  // Créer le SVG
  svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgElement.setAttribute("width", mapHolder.clientWidth);
  svgElement.setAttribute("height", mapHolder.clientHeight);
  mapHolder.appendChild(svgElement);
  
  // Chargement des données géographiques
  const json = await loadMapData();
  if (!json) {
    console.error("Impossible de charger les données de la carte");
    return;
  }
  
  // Créer le groupe de pays
  countriesGroupElement = document.createElementNS("http://www.w3.org/2000/svg", "g");
  countriesGroupElement.setAttribute("id", "map");
  svgElement.appendChild(countriesGroupElement);
  
  // Ajouter un rectangle de fond
  const backgroundRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  backgroundRect.setAttribute("x", 0);
  backgroundRect.setAttribute("y", 0);
  backgroundRect.setAttribute("width", w);
  backgroundRect.setAttribute("height", h);
  backgroundRect.setAttribute("fill", "#f0f0f0");
  countriesGroupElement.appendChild(backgroundRect);
  
  // Créer les pays et les étiquettes
  const labels = [];
  
  for (let i = 0; i < json.features.length; i++) {
    const feature = json.features[i];
    
    // Créer le chemin du pays
    const countryPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    countryPath.setAttribute("d", path(feature));
    countryPath.setAttribute("id", "country" + feature.properties.iso_a3);
    countryPath.classList.add("country");
    countriesGroupElement.appendChild(countryPath);
    
    // Ajouter les écouteurs d'événements
    addCountryEventListeners(countryPath, feature);
    
    // Créer l'étiquette du pays
    const label = createCountryLabel(feature);
    if (label) {
      countriesGroupElement.appendChild(label.group);
      labels.push(label);
      
      // Ajouter les écouteurs d'événements à l'étiquette
      addLabelEventListeners(label.group, feature);
    }
  }
  
  // Initialiser le zoom
  initiateZoom();
  
  // Ajuster les dimensions des fonds d'étiquettes après que tout soit dans le DOM
  // Utiliser un timeout pour s'assurer que le DOM est complètement rendu
  setTimeout(() => {
    labels.forEach(adjustLabelBackground);
  }, 0);
}

// Attendre que le DOM soit chargé avant d'initialiser la carte
document.addEventListener('DOMContentLoaded', initMap);