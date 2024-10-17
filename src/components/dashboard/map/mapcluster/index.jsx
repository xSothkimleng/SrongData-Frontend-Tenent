import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import { useEffect, useRef } from 'react';

const MarkerClusterGroup = ({ children }) => {
  const map = useMap();
  const markersRef = useRef();

  useEffect(() => {
    markersRef.current = L.markerClusterGroup();
    map.addLayer(markersRef.current);

    return () => {
      map.removeLayer(markersRef.current);
    };
  }, [map]);

  useEffect(() => {
    const markers = [];

    children.forEach(child => {
      if (child.props.position) {
        const marker = L.marker(child.props.position);
        if (child.props.children) {
          marker.bindPopup(child.props.children.props.children);
        }
        markers.push(marker);
      }
    });

    markersRef.current.clearLayers();
    markersRef.current.addLayers(markers);
  }, [children]);

  return null;
};

export default MarkerClusterGroup;
