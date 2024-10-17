'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from '@/components/dashboard/map/mapcluster';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import L from 'leaflet';
import { useEffect } from 'react';
import { GetContext } from '@/utils/language';
import useLang from '@/store/lang';

type MapProps = {
  data?: any,
};

const Map: React.FC<MapProps> = ({ data }) => {
  const lang = useLang(state => state.lang);
  useEffect(() => {
    // Fix for missing marker icon
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }, []);

  return (
    <MapContainer center={[11.582789, 104.8980768]} zoom={15} style={{ height: '80vh', width: '100%' }}>
      <TileLayer
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MarkerClusterGroup>
        {/* @ts-ignore */}
        {data.map((item, index) => (
          <Marker key={index} position={[item.lat, item.lon]}>
            <Popup>
              {`<div
                style="
                display: flex;
                flex-direction: column;
                overflow: auto;
                max-height: 210px;
                "
              >
                <table border="1">
                  <tbody>
                    <tr>
                      <th style="padding: 10px">${GetContext('lat', lang)}</th>
                      <td style="padding: 10px">${item.lat}</td>
                    </tr>
                    <tr>
                      <th style="padding: 10px">${GetContext('lon', lang)}</th>
                      <td style="padding: 10px">${item.lon}</td>
                    </tr>
                    <tr>
                      <th style="padding: 10px">${GetContext('submitter', lang)}</th>
                      <td style="padding: 10px">${item.submitted_by}</td>
                    </tr>
                    <tr>
                      <th style="padding: 10px">${GetContext('created_since', lang)}</th>
                      <td style="padding: 10px">${item.created_at}</td>
                    </tr>
                  </tbody>
                </table>
              </div>`}
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
};

export default Map;
