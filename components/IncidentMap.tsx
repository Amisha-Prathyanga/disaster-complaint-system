import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Complaint, Priority } from '../types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom colored markers based on priority
const createColoredIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <div style="
          width: 10px;
          height: 10px;
          background-color: white;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

const getMarkerIcon = (priority: Priority) => {
  switch (priority) {
    case Priority.CRITICAL:
      return createColoredIcon('#dc2626'); // red-600
    case Priority.HIGH:
      return createColoredIcon('#ea580c'); // orange-600
    case Priority.MEDIUM:
      return createColoredIcon('#ca8a04'); // yellow-600
    case Priority.LOW:
      return createColoredIcon('#2563eb'); // blue-600
    default:
      return createColoredIcon('#64748b'); // slate-500
  }
};

interface IncidentMapProps {
  complaints: Complaint[];
  onSelectComplaint: (complaint: Complaint) => void;
}

export const IncidentMap: React.FC<IncidentMapProps> = ({ complaints, onSelectComplaint }) => {
  // Filter complaints that have coordinates
  const mappableComplaints = complaints.filter(c => c.latitude && c.longitude);

  // Calculate center of Sri Lanka as default
  const defaultCenter: [number, number] = [7.8731, 80.7718];
  const defaultZoom = 8;

  return (
    <div className="w-full h-full rounded-xl overflow-hidden shadow-sm border border-slate-200 relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {mappableComplaints.map((complaint) => (
          <Marker
            key={complaint.id}
            position={[complaint.latitude!, complaint.longitude!]}
            icon={getMarkerIcon(complaint.priority)}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-slate-900 mb-2">{complaint.title}</h3>
                <div className="space-y-1 text-sm">
                  <p className="text-slate-600">
                    <span className="font-medium">Category:</span> {complaint.category}
                  </p>
                  <p className="text-slate-600">
                    <span className="font-medium">Location:</span> {complaint.location}
                  </p>
                  <p>
                    <span className="font-medium">Priority:</span>{' '}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                      ${complaint.priority === Priority.CRITICAL ? 'bg-red-100 text-red-800' : 
                        complaint.priority === Priority.HIGH ? 'bg-orange-100 text-orange-800' : 
                        complaint.priority === Priority.MEDIUM ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                      {complaint.priority}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>{' '}
                    <span className="text-slate-700">{complaint.status}</span>
                  </p>
                </div>
                <button
                  onClick={() => onSelectComplaint(complaint)}
                  className="mt-3 w-full bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
