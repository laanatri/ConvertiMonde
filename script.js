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
let svg;
let countriesGroup;

// Fonction appelée lors du zoom
function zoomed(event) {
  const t = event.transform;
  
  // Remplacer .attr par setAttribute
  countriesGroup.node().setAttribute("transform", `translate(${t.x}, ${t.y})scale(${t.k})`);
}

// Configuration du zoom avec approche personnalisée
function setupZoom(svgElement) {
  // Créer un zoom D3
  const zoom = d3.zoom();
  
  // Appliquer le zoom à l'élément SVG
  zoom(d3.select(svgElement));
  
  // Ajouter un écouteur d'événement pour le zoom
  svgElement.addEventListener('zoom', zoomed);
  
  return zoom;
}

// Fonction pour obtenir les dimensions d'un texte
function getTextBox(selection) {
  selection.each(function(d) {
    d.bbox = this.getBBox();
  });
}

// Initialisation des paramètres de zoom
function initiateZoom() {
  const mapHolder = document.getElementById("map-holder");
  const svgElement = document.querySelector("svg");
  minZoom = Math.max(mapHolder.clientWidth / w, mapHolder.clientHeight / h);
  maxZoom = 2 * minZoom;

  const zoomBehavior = d3.zoom()
    .scaleExtent([minZoom, maxZoom])
    .translateExtent([[0, 0], [w, h]]);
  
  // Ajouter un écouteur d'événement pour le zoom
  zoomBehavior.on("zoom", zoomed);
  
  // Appliquer le zoom initial
  const midX = (mapHolder.clientWidth - minZoom * w) / 2;
  const midY = (mapHolder.clientHeight - minZoom * h) / 2;

  svg.call(zoomBehavior.transform, d3.zoomIdentity.translate(midX, midY).scale(minZoom));
  
  // Stocker la référence au zoom pour une utilisation ultérieure
  svgElement._zoomBehavior = zoomBehavior;
}

// Fonction pour zoomer sur une zone spécifique de la carte
function boxZoom(box, centroid, paddingPerc) {
  const minXY = box[0];
  const maxXY = box[1];
  const svgElement = document.querySelector("svg");
  const zoomBehavior = svgElement._zoomBehavior;

  let zoomWidth = Math.abs(minXY[0] - maxXY[0]);
  let zoomHeight = Math.abs(minXY[1] - maxXY[1]);

  const zoomMidX = centroid[0];
  const zoomMidY = centroid[1];

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
  svg.transition()
    .duration(500)
    .call(zoomBehavior.transform, d3.zoomIdentity.translate(dleft, dtop).scale(zoomScale));
}

// Gestion du redimensionnement de la fenêtre
window.addEventListener('resize', function() {
  const mapHolder = document.getElementById("map-holder");
  const svgElement = document.querySelector("svg");
  
  // Redimensionnement du SVG avec setAttribute au lieu de .attr
  svgElement.setAttribute("width", mapHolder.clientWidth);
  svgElement.setAttribute("height", mapHolder.clientHeight);

  initiateZoom();
});

// Fonction pour ajouter les écouteurs d'événements aux pays
function addCountryEventListeners(countryElement, data) {
  // Mouseover
  countryElement.addEventListener('mouseover', function() {
    document.getElementById("countryLabel" + data.properties.iso_a3).style.display = "block";
  });
  
  // Mouseout
  countryElement.addEventListener('mouseout', function() {
    document.getElementById("countryLabel" + data.properties.iso_a3).style.display = "none";
  });
  
  // Click
  countryElement.addEventListener('click', function() {
    // Réinitialiser tous les pays
    document.querySelectorAll(".country").forEach(country => {
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
    document.querySelectorAll(".country").forEach(country => {
      country.classList.remove("country-on");
    });
    
    // Activer le pays associé
    document.getElementById("country" + data.properties.iso_a3).classList.add("country-on");
    
    // Effectuer le zoom sur le pays
    boxZoom(path.bounds(data), path.centroid(data), 20);
  });
}

// Fonction d'initialisation de la carte
function initMap() {
  const mapHolder = document.getElementById("map-holder");
  
  // Créer le SVG avec DOM API
  const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgElement.setAttribute("width", mapHolder.clientWidth);
  svgElement.setAttribute("height", mapHolder.clientHeight);
  mapHolder.appendChild(svgElement);
  
  // Configuration du zoom
  const zoomBehavior = d3.zoom().on("zoom", zoomed);
  
  // Utiliser D3 pour sélectionner et configurer le SVG
  svg = d3.select(svgElement).call(zoomBehavior);
  svgElement._zoomBehavior = zoomBehavior;
  
  // Chargement des données géographiques
  d3.json("https://raw.githubusercontent.com/andybarefoot/andybarefoot-www/master/maps/mapdata/custom50.json")
    .then(function(json) {
      // Créer le groupe de pays
      const countriesGroupElement = document.createElementNS("http://www.w3.org/2000/svg", "g");
      countriesGroupElement.setAttribute("id", "map");
      svgElement.appendChild(countriesGroupElement);
      
      // Utiliser D3 pour sélectionner le groupe
      countriesGroup = d3.select(countriesGroupElement);
      
      // Ajouter un rectangle de fond avec DOM API
      const backgroundRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      backgroundRect.setAttribute("x", 0);
      backgroundRect.setAttribute("y", 0);
      backgroundRect.setAttribute("width", w);
      backgroundRect.setAttribute("height", h);
      backgroundRect.setAttribute("fill", "#f0f0f0");
      countriesGroupElement.appendChild(backgroundRect);
      
      // Créer les pays
      json.features.forEach(function(feature) {
        const countryPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        countryPath.setAttribute("d", path(feature));
        countryPath.setAttribute("id", "country" + feature.properties.iso_a3);
        countryPath.classList.add("country");
        countriesGroupElement.appendChild(countryPath);
        
        // Ajouter les écouteurs d'événements
        addCountryEventListeners(countryPath, feature);
        
        // Créer l'étiquette du pays
        const labelGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        labelGroup.classList.add("countryLabel");
        labelGroup.setAttribute("id", "countryLabel" + feature.properties.iso_a3);
        
        const centroid = path.centroid(feature);
        labelGroup.setAttribute("transform", `translate(${centroid[0]}, ${centroid[1]})`);
        labelGroup.style.display = "none";
        
        // Créer le texte de l'étiquette
        const labelText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        labelText.classList.add("countryName");
        labelText.style.textAnchor = "middle";
        labelText.setAttribute("dx", 0);
        labelText.setAttribute("dy", 0);
        labelText.textContent = feature.properties.name;
        // console.log(feature.properties.name)
        labelGroup.appendChild(labelText);
        
        // Obtenir les dimensions du texte pour créer le fond
        // (Nous devons ajouter le groupe au DOM pour obtenir getBBox)
        countriesGroupElement.appendChild(labelGroup);
        const bbox = labelText.getBBox();
        
        // Créer le fond de l'étiquette
        const labelBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        labelBg.classList.add("countryLabelBg");
        labelBg.setAttribute("transform", `translate(${bbox.x - 2}, ${bbox.y})`);
        labelBg.setAttribute("width", bbox.width + 4);
        labelBg.setAttribute("height", bbox.height);
        
        // Insérer le fond avant le texte
        labelGroup.insertBefore(labelBg, labelText);
        
        // Ajouter les écouteurs d'événements à l'étiquette
        addLabelEventListeners(labelGroup, feature);
      });
      
      // Initialiser le zoom
      initiateZoom();
    })
    .catch(function(error) {
      console.error("Erreur lors du chargement des données:", error);
    });
}

// Attendre que le DOM soit chargé avant d'initialiser la carte
document.addEventListener('DOMContentLoaded', initMap);