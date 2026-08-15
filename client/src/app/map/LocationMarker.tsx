"use client";

import { useEffect, useState } from "react";
import { Circle, CircleMarker, Popup, useMap } from "react-leaflet";

export default function LocationMarker() {
  const map = useMap();

  const [position, setPosition] = useState<[number, number] | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function locateUser() {
    if (!navigator.geolocation) {
      setError("Your browser does not support location.");
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (location) => {
        const lat = location.coords.latitude;
        const lng = location.coords.longitude;
        const accuracyValue = location.coords.accuracy;

        const newPosition: [number, number] = [lat, lng];

        setPosition(newPosition);
        setAccuracy(accuracyValue);

        map.flyTo(newPosition, 16, {
          duration: 1.5,
        });

        setLoading(false);
      },
      () => {
        setError(
          "Location permission denied. Please allow location access."
        );

        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  useEffect(() => {
    locateUser();
  }, []);

  return (
    <>
      {/* Locate button */}
      <button
        onClick={locateUser}
        disabled={loading}
        className="absolute bottom-6 right-6 z-[1000] flex items-center gap-2 rounded-xl border border-white/10 bg-[#071311]/90 px-4 py-3 text-sm font-medium text-white shadow-xl backdrop-blur-xl transition hover:bg-[#10201e] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="text-lg">⌖</span>

        {loading ? "Locating..." : "Use my location"}
      </button>

      {/* Error message */}
      {error && (
        <div className="absolute bottom-20 left-1/2 z-[1000] -translate-x-1/2 rounded-xl border border-red-400/20 bg-[#210f0f]/95 px-4 py-3 text-xs text-red-200 shadow-xl">
          {error}
        </div>
      )}

      {/* User position */}
      {position && (
        <>
          <Circle
            center={position}
            radius={accuracy ?? 50}
            pathOptions={{
              color: "#38d4c8",
              fillColor: "#38d4c8",
              fillOpacity: 0.08,
              weight: 1,
            }}
          />

          <CircleMarker
            center={position}
            radius={8}
            pathOptions={{
              color: "#ffffff",
              weight: 3,
              fillColor: "#159b91",
              fillOpacity: 1,
            }}
          >
            <Popup>
              <div className="text-sm">
                <strong>You are here</strong>

                <p className="mt-1 text-xs text-gray-500">
                  Accuracy: approximately{" "}
                  {Math.round(accuracy ?? 0)}m
                </p>
              </div>
            </Popup>
          </CircleMarker>
        </>
      )}
    </>
  );
}