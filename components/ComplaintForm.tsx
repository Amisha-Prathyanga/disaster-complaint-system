import React, { useState } from 'react';
import { ComplaintCategory, Priority } from '../types';
import { MapPin, Send, AlertTriangle, Loader2 } from 'lucide-react';

interface ComplaintFormProps {
  onSubmit: (data: any) => void;
}

export const ComplaintForm: React.FC<ComplaintFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: ComplaintCategory.OTHER,
    location: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    dsd: 'Colombo', // Defaulting for demo simplicity
    contactName: '',
    contactPhone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log('Form field changed:', name, '=', value);
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      console.log('Updated formData:', updated);
      return updated;
    });
  };

  const handleGeoLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          location: `Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)}`,
          latitude: latitude,
          longitude: longitude
        }));
        setGeoLoading(false);
      },
      (error) => {
        alert("Unable to retrieve your location");
        setGeoLoading(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Assign default coordinates based on DSD if not already set via GPS
    let finalLatitude = formData.latitude;
    let finalLongitude = formData.longitude;
    
    if (!finalLatitude || !finalLongitude) {
      // Default coordinates for each DSD (approximate center of each division)
      const dsdCoordinates: Record<string, { lat: number; lng: number }> = {
        'Colombo': { lat: 6.9271, lng: 79.8612 },
        'Gampaha': { lat: 7.0917, lng: 80.0152 },
        'Kandy': { lat: 7.2906, lng: 80.6337 },
        'Galle': { lat: 6.0535, lng: 80.2210 },
        'Badulla': { lat: 6.9934, lng: 81.0550 }
      };
      
      const coords = dsdCoordinates[formData.dsd];
      if (coords) {
        finalLatitude = coords.lat;
        finalLongitude = coords.lng;
      }
    }
    
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const complaintData = {
      ...formData,
      latitude: finalLatitude,
      longitude: finalLongitude,
      status: 'New',
      priority: Priority.MEDIUM, // Default, will be adjusted by officer or AI later
      createdAt: new Date().toISOString()
    };
    
    // Debug logging
    console.log('Submitting complaint with DSD:', complaintData.dsd, 'Coordinates:', finalLatitude, finalLongitude);
    
    onSubmit(complaintData);
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
      <div className="bg-red-600 px-6 py-4 flex items-center gap-3">
        <AlertTriangle className="text-white h-6 w-6" />
        <h2 className="text-xl font-bold text-white">Report a Disaster Incident</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              required
            >
              {Object.values(ComplaintCategory).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Area / Division (DSD)</label>
            <select
              name="dsd"
              value={formData.dsd}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              required
            >
              <option value="Colombo">Colombo</option>
              <option value="Gampaha">Gampaha</option>
              <option value="Kandy">Kandy</option>
              <option value="Galle">Galle</option>
              <option value="Badulla">Badulla</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Incident Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Flooding in Main Street"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Provide detailed information about the incident..."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Location</label>
          <div className="flex gap-2">
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Address or GPS Coordinates"
              className="flex-grow px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              required
            />
            <button
              type="button"
              onClick={handleGeoLocation}
              disabled={geoLoading}
              className="px-4 py-2 bg-slate-100 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2"
            >
              {geoLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <MapPin className="h-4 w-4" />}
              <span className="hidden sm:inline">Use GPS</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Your Name (Optional)</label>
            <input
              type="text"
              name="contactName"
              value={formData.contactName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Contact Number (Optional)</label>
            <input
              type="tel"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Submit Complaint
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};