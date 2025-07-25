import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

// Fix default marker icon issue with Leaflet in React (Vite)
L.Icon.Default.imagePath = '';
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function LocationSelector({ setLocation }) {
  useMapEvents({
    click(e) {
      setLocation([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center);
    }
  }, [center, map]);
  return null;
}

function App() {
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    contact: '',
    location: null,
  });
  const [mapCenter, setMapCenter] = useState([51.505, -0.09]);
  const mapRef = useRef();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setMapCenter([latitude, longitude]);
        },
        () => {},
        { enableHighAccuracy: true }
      );
    }
  }, []);

  useEffect(() => {
    if (mapRef.current && mapCenter) {
      mapRef.current.setView(mapCenter);
    }
  }, [mapCenter, mapRef]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.name && form.location) {
      setGroups([...groups, form]);
      setForm({ name: '', description: '', contact: '', location: null });
    }
  };

  const setLocation = (loc) => {
    setForm((f) => ({ ...f, location: loc }));
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <div className="community-form-overlay">
        <h2>Add Community Group</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Name:</label><br />
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div>
            <label>Description:</label><br />
            <textarea name="description" value={form.description} onChange={handleChange} />
          </div>
          <div>
            <label>Contact Info:</label><br />
            <input name="contact" value={form.contact} onChange={handleChange} />
          </div>
          <div>
            <label>Location:</label><br />
            <span>{form.location ? `${form.location[0].toFixed(4)}, ${form.location[1].toFixed(4)}` : 'Click on the map'}</span>
          </div>
          <button type="submit" disabled={!form.name || !form.location} style={{ marginTop: 10 }}>Add Group</button>
        </form>
      </div>
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: '100vh', width: '100vw', zIndex: 0 }}
        whenCreated={(mapInstance) => { mapRef.current = mapInstance; }}
      >
        <RecenterMap center={mapCenter} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationSelector setLocation={setLocation} />
        {groups.map((group, idx) => (
          <Marker key={idx} position={group.location}>
            <Popup>
              <strong>{group.name}</strong><br />
              {group.description && <span>{group.description}<br /></span>}
              {group.contact && <span>Contact: {group.contact}</span>}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default App;
