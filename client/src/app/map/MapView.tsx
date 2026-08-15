"use client";

import { useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import LocationMarker from "./LocationMarker";

type Issue = {
  id: number;
  title: string;
  category: string;
  status: string;
  position: [number, number];
};

const issues: Issue[] = [
  {
    id: 1,
    title: "Streetlight not working",
    category: "Streetlight",
    status: "Under review",
    position: [28.4595, 77.0266],
  },
  {
    id: 2,
    title: "Pothole on 5th Cross",
    category: "Road",
    status: "In progress",
    position: [28.4612, 77.0298],
  },
  {
    id: 3,
    title: "Overflowing garbage bin",
    category: "Garbage",
    status: "Resolved",
    position: [28.4578, 77.0235],
  },
];

export default function MapView() {
  const [selectedIssue, setSelectedIssue] =
    useState<Issue | null>(null);

  return (
    <MapContainer
      center={[28.4595, 77.0266]}
      zoom={14}
      scrollWheelZoom={true}
      className="h-full w-full"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* USER LOCATION */}
      <LocationMarker />

      {/* CIVIC ISSUES */}
      {issues.map((issue) => (
        <CircleMarker
          key={issue.id}
          center={issue.position}
          radius={10}
          pathOptions={{
            color: "#38d4c8",
            fillColor: "#159b91",
            fillOpacity: 0.9,
            weight: 3,
          }}
          eventHandlers={{
            click: () => {
              setSelectedIssue(issue);
            },
          }}
        >
          <Popup>
            <div className="min-w-[190px]">
              <p className="text-xs font-medium text-teal-600">
                {issue.category}
              </p>

              <h3 className="mt-1 text-sm font-semibold text-gray-900">
                {issue.title}
              </h3>

              <p className="mt-2 text-xs text-gray-500">
                Status: {issue.status}
              </p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}