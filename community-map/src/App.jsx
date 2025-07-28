import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import './App.css';

// Fix Leaflet marker icon issue in Vite/React
L.Icon.Default.imagePath = '';
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Color palette for community group markers
const MARKER_COLORS = [
  '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
  '#F9E79F', '#A9DFBF', '#FAD7A0', '#D5A6BD', '#A3E4D7'
];

// Default map center (London)
const DEFAULT_CENTER = [51.505, -0.09];
const DEFAULT_ZOOM = 13;

/**
 * Generate a random color from the marker color palette
 */
const getRandomColor = () => {
  return MARKER_COLORS[Math.floor(Math.random() * MARKER_COLORS.length)];
};

/**
 * Create a custom colored marker icon for community groups
 */
const createCommunityMarkerIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 30px;
      height: 30px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      position: relative;
      transition: transform 0.2s ease;
    " onmouseenter="this.style.transform='rotate(-45deg) scale(1.1)'" onmouseleave="this.style.transform='rotate(-45deg) scale(1)'"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

/**
 * Component to handle map click events for setting location
 */
function LocationSelector({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

/**
 * Component to recenter map when center prop changes
 */
function RecenterMap({ center }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center);
    }
  }, [center, map]);
  
  return null;
}

/**
 * Main application component
 */
function App() {
  const [communityGroups, setCommunityGroups] = useState([]);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contact: '',
    location: null,
  });
  const mapRef = useRef();

  // Get user's location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter([latitude, longitude]);
        },
        (error) => {
          console.log('Geolocation not available or denied');
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Recenter map when mapCenter changes
  useEffect(() => {
    if (mapRef.current && mapCenter) {
      mapRef.current.setView(mapCenter);
    }
  }, [mapCenter, mapRef]);

  /**
   * Handle form input changes
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Handle form submission
   */
  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    if (formData.name && formData.location) {
      const newGroup = {
        ...formData,
        id: Date.now(), // Simple ID generation
        color: getRandomColor()
      };
      
      setCommunityGroups(prev => [...prev, newGroup]);
      setFormData({
        name: '',
        description: '',
        contact: '',
        location: null,
      });
    }
  };

  /**
   * Handle location selection from map click
   */
  const handleLocationSelect = (location) => {
    setFormData(prev => ({ ...prev, location }));
  };

  return (
    <div className="app-container">
      {/* Community Group Form */}
      <div className="community-form-overlay">
        <h2>Add Community Group</h2>
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter group name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter group description"
              rows="3"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="contact">Contact Info:</label>
            <input
              id="contact"
              name="contact"
              type="text"
              value={formData.contact}
              onChange={handleInputChange}
              placeholder="Enter contact information"
            />
          </div>
          
          <div className="form-group">
            <label>Location:</label>
            <div className="location-display">
              {formData.location 
                ? `${formData.location[0].toFixed(4)}, ${formData.location[1].toFixed(4)}`
                : 'Click on the map to set location'
              }
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={!formData.name || !formData.location}
            className="submit-button"
          >
            Add Group
          </button>
        </form>
      </div>

      {/* Interactive Map */}
      <MapContainer
        center={mapCenter}
        zoom={DEFAULT_ZOOM}
        className="map-container"
        ref={mapRef}
      >
        <RecenterMap center={mapCenter} />
        <LocationSelector onLocationSelect={handleLocationSelect} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Community Group Markers */}
        {communityGroups.map((group) => (
          <Marker 
            key={group.id} 
            position={group.location}
            icon={createCommunityMarkerIcon(group.color)}
          >
            <Popup>
              <div className="popup-content">
                <h3>{group.name}</h3>
                {group.description && <p>{group.description}</p>}
                {group.contact && (
                  <p className="contact-info">
                    <strong>Contact:</strong> {group.contact}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default App;
