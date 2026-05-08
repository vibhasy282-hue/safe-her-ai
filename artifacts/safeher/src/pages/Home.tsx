import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AIVoice from "@/components/AIVoice";
import SafeRoute from "@/components/SafeRoute";
import OfflineEmergency from "@/components/OfflineEmergency";
import SOSHiddenTriggers from "@/components/SOSHiddenTriggers";
import PrivacyNetwork from "@/components/PrivacyNetwork";
import ExtraFeatures from "@/components/ExtraFeatures";
import TrustedContacts from "@/components/TrustedContacts";
import CheckIn from "@/components/CheckIn";
import FloatingSOS from "@/components/FloatingSOS";
import Overlays from "@/components/Overlays";
import { useEmergencyStore } from "@/hooks/useEmergencyStore";
export default function Home() {
  const { initApp } = useEmergencyStore();
  const [currentLocation, setCurrentLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [results, setResults] = useState([]);
  useEffect(() => {
    initApp();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          setCurrentLocation(`${lat}, ${lng}`);
        },
        (error) => {
          console.error("Location error:", error);
        },
      );
    }
  }, [initApp]);

  return (
    <div className="relative min-h-screen text-text">
      {/* Background Particles */}
      <div className="bg-particles fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${10 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      <Navbar />

      <main className="relative z-10 pt-[80px]">
        <Hero />

        <div className="h-[1px] mx-8 bg-gradient-to-r from-transparent via-white/10 to-transparent my-4"></div>

        <AIVoice />

        <div className="h-[1px] mx-8 bg-gradient-to-r from-transparent via-white/10 to-transparent my-4"></div>

        <SafeRoute />

        <div className="h-[1px] mx-8 bg-gradient-to-r from-transparent via-white/10 to-transparent my-4"></div>

        <OfflineEmergency />

        <div className="h-[1px] mx-8 bg-gradient-to-r from-transparent via-white/10 to-transparent my-4"></div>

        <SOSHiddenTriggers />

        <div className="h-[1px] mx-8 bg-gradient-to-r from-transparent via-white/10 to-transparent my-4"></div>

        <PrivacyNetwork />

        <div className="h-[1px] mx-8 bg-gradient-to-r from-transparent via-white/10 to-transparent my-4"></div>

        <ExtraFeatures />

        <div className="h-[1px] mx-8 bg-gradient-to-r from-transparent via-white/10 to-transparent my-4"></div>

        <TrustedContacts />

        <div className="h-[1px] mx-8 bg-gradient-to-r from-transparent via-white/10 to-transparent my-4"></div>

        <CheckIn />
      </main>

      <footer className="text-center p-8 text-text-muted text-sm border-t border-white/10 mt-8 relative z-10">
        &copy; 2025 SafeHer AI. All rights reserved. Secure & Encrypted.
      </footer>

      <FloatingSOS />
      <Overlays />
    </div>
  );
}
