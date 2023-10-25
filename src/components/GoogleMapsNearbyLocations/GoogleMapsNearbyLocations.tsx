import {
  GoogleMap,
  InfoWindow,
  MarkerF,
  useLoadScript,
} from "@react-google-maps/api";
import { useEffect, useRef, useState } from "react";
import { Spinner } from "theme-ui";
import "./GoogleMapsNearbyLocations.scss";
import Location from "./Location";

// Materials
// https://stackoverflow.com/questions/66944396/can-i-use-google-places-with-react-google-maps-api
// https://developers.google.com/maps/documentation/javascript/reference/places-service
// https://www.youtube.com/watch?v=WZcxJGmLbSo
// https://codesandbox.io/s/react-google-mapsapi-multiple-markers-infowindow-h6vlq?file=/src/Map.js:1227-1265

// Problem with markers
// https://github.com/JustFly1984/react-google-maps-api/issues/3048#issuecomment-1166410403

interface INearbyLocations {
  id: string;
  lat: number;
  longitude: number;
  name: string;
  rating: number;
  commentsCount: number;
}

const GoogleMapsNearbyLocations = () => {
  const [myPosition, setMyPosition] = useState({
    lat: 0,
    longitude: 0,
  });
  const mapRef = useRef<google.maps.Map | null>(null);
  const [activeMarker, setActiveMarker] = useState<string>();
  const { lat, longitude } = myPosition;
  const currentPosition = { lat: lat, lng: longitude };
  const [nearbyLocations, setNearbyLocations] = useState<INearbyLocations[]>(
    []
  );

  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Geolocation disabled");
    } else {
      navigator.geolocation.getCurrentPosition((position) => {
        setMyPosition({
          lat: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      });
    }
  }, []);

  const findNearbyPlaces = async () => {
    if (!mapRef.current) return;
    const service = new google.maps.places.PlacesService(mapRef.current);
    service.nearbySearch(
      { location: { lat, lng: longitude }, radius: 5000 },
      (res) => {
        if (!res) return;
        res.map((el) =>
          setNearbyLocations((prev) => [
            ...prev,
            {
              id: el.place_id || "0",
              lat: el.geometry?.location?.lat() || 0,
              longitude: el.geometry?.location?.lng() || 0,
              name: el.name ? el.name : "-",
              rating: el.rating || 0,
              commentsCount: el.user_ratings_total || 0,
            },
          ])
        );
      }
    );
  };

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || "",
    libraries: ["places", "drawing", "geometry"],
  });

  if (!isLoaded) {
    return <Spinner />;
  }

  return (
    <div className="map__container">
      <div className="map__nearby-locations" onClick={() => findNearbyPlaces()}>
        Generate nearby places
      </div>
      <div className="map">
        <GoogleMap
          zoom={15}
          center={currentPosition}
          mapContainerClassName={"map"}
          onLoad={(props) => {
            mapRef.current = props;
          }}
        >
          <MarkerF position={currentPosition} />
          <>
            {nearbyLocations.map((location, index) => {
              const nearbyLocationPosition = {
                lat: location.lat,
                lng: location.longitude,
              };
              const { name, rating, commentsCount } = location;

              return (
                <MarkerF
                  key={`${location.id}-${index}`}
                  position={nearbyLocationPosition}
                  onClick={() => setActiveMarker(location.id)}
                >
                  {activeMarker === location.id ? (
                    <InfoWindow onCloseClick={() => setActiveMarker(undefined)}>
                      <Location
                        name={name}
                        rating={rating}
                        commentsCount={commentsCount}
                      />
                    </InfoWindow>
                  ) : null}
                </MarkerF>
              );
            })}
          </>
        </GoogleMap>
      </div>
    </div>
  );
};

export default GoogleMapsNearbyLocations;
