import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

// Extend Leaflet for Routing control
declare module "leaflet" {
  namespace Routing {
    function control(options: any): any;
    function osrmv1(options?: any): any;
  }
}

interface MapProps {
  lat?: number;
  lng?: number;
  zoom?: number;
}

const Map = ({
  lat = 14.840399050610214,
  lng = 120.81234277397385,
  zoom = 15,
}: MapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const routingControlRef = useRef<any>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [addingMarker, setAddingMarker] = useState(false);

  // Function to create main marker with white background
  const createMainMarkerIcon = () =>
    L.divIcon({
      className: "",
      html: `
    <div style="
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      width: 36px;
      height: 36px;
    ">
      <img src="/public/slfg.svg" style="width: 80%; height: 80%;" />
    </div>
  `,
      iconSize: [36, 36],
      iconAnchor: [18, 36], // bottom-center
      popupAnchor: [0, -36], // popup above marker
    });

  // Initialize map
  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = L.map("osm-map", {
      zoomControl: false,
      attributionControl: false,
    }).setView([lat, lng], zoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapRef.current);

    // Main marker with white bg
    L.marker([lat, lng], { icon: createMainMarkerIcon() })
      .addTo(mapRef.current)
      .bindPopup("SelfieGram Malolos")
      .openPopup();

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [lat, lng, zoom]);

  // Handle click to add marker & routing
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const handleClick = (e: L.LeafletMouseEvent) => {
      if (!addingMarker) return;

      userMarkerRef.current?.remove();
      routingControlRef.current?.remove();

      const userLatLng = e.latlng;

      // Add SelfieGram marker (gray pin)
      userMarkerRef.current = L.marker(userLatLng, {
        icon: L.icon({
          iconUrl: "https://cdn-icons-png.flaticon.com/512/252/252025.png",
          iconSize: [32, 32],
        }),
      }).addTo(map);

      // Add routing
      routingControlRef.current = L.Routing.control({
        waypoints: [userLatLng, L.latLng(lat, lng)],
        lineOptions: { styles: [{ color: "#212121", weight: 4 }] },
        router: L.Routing.osrmv1({
          serviceUrl: "https://router.project-osrm.org/route/v1",
          profile: "car",
        }),
        createMarker: (i: number, wp: any) =>
          i === 0
            ? userMarkerRef.current!
            : L.marker(wp.latLng, {
                icon: L.icon({
                  iconUrl:
                    "https://cdn-icons-png.flaticon.com/512/252/252025.png",
                  iconSize: [32, 32],
                }),
              }),
        addWaypoints: false,
        routeWhileDragging: false,
        draggableWaypoints: false,
      }).addTo(map);

      setAddingMarker(false);
    };

    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [addingMarker, lat, lng]);

  const handleAddMarker = () => setAddingMarker(true);
  const handleClearMarker = () => {
    userMarkerRef.current?.remove();
    routingControlRef.current?.remove();
    setAddingMarker(false);
  };
  const handleShowSelfieGram = () => {
    if (!mapRef.current) return;
    handleClearMarker();
    mapRef.current.setView([lat, lng], zoom);

    L.marker([lat, lng], { icon: createMainMarkerIcon() })
      .addTo(mapRef.current)
      .bindPopup("SelfieGram Malolos")
      .openPopup();
  };

  return (
    <div className="flex flex-col gap-1 -mt-8">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 justify-center mb-4">
        {["Add Marker", "Clear Marker", "Show SelfieGram"].map((label, i) => {
          const handler =
            i === 0
              ? handleAddMarker
              : i === 1
              ? handleClearMarker
              : handleShowSelfieGram;
          return (
            <button
              key={i}
              onClick={handler}
              className="px-4 py-2 bg-[#212121] text-white rounded-lg shadow hover:bg-gray-800 transition"
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Map */}
      <div
        id="osm-map"
        className="w-full rounded-xl shadow-lg border border-gray-300"
        style={{ height: "50vh" }} // map height is 50% of the viewport height
      />
    </div>
  );
};

export default Map;
