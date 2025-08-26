import videoBackground from "../assets/video.mp4";
import photo1 from "../assets/Photo1.jpg";
import photo2 from "../assets/Photo2.jpg";
import photo3 from "../assets/Photo3.jpg";
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

export default function VideoBackground({ children }) {
  const { role } = useSelector((state) => state.auth);
  const location = useLocation();
  const [currentMedia, setCurrentMedia] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const videoRef = useRef(null);

  // Check if we're on the provider browse page
  const isProviderBrowsePage =
    location.pathname === "/providers" && role === "USER";

  // Array of media items: 3 photos + 1 video (only for provider browse page)
  const mediaItems = [
    { type: "image", src: photo1 },
    { type: "image", src: photo2 },
    { type: "image", src: photo3 },
    { type: "video", src: videoBackground },
  ];

  // Function to switch media with smooth transition (only for provider browse page)
  const switchMedia = () => {
    if (!isProviderBrowsePage) return;

    setIsTransitioning(true);

    // Wait for fade out, then change media
    setTimeout(() => {
      setCurrentMedia((prev) => {
        const nextMedia = (prev + 1) % mediaItems.length;
        console.log(
          `Switching from media ${prev} to media ${nextMedia} (${mediaItems[nextMedia].type})`
        );
        return nextMedia;
      });

      // Wait a bit, then fade in
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }, 500); // Half second fade out
  };

  // Handle media switching (only for provider browse page)
  useEffect(() => {
    if (!isProviderBrowsePage) return;

    const interval = setInterval(switchMedia, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, [isProviderBrowsePage]);

  // Handle video loading when currentMedia changes to video (only for provider browse page)
  useEffect(() => {
    if (
      !isProviderBrowsePage ||
      mediaItems[currentMedia].type !== "video" ||
      !videoRef.current
    )
      return;

    videoRef.current.load();
    videoRef.current.play().catch((error) => {
      console.error("Error playing video:", error);
    });
  }, [currentMedia, isProviderBrowsePage]);

  const currentItem = mediaItems[currentMedia];

  // For provider browse page, show photo/video background
  if (isProviderBrowsePage) {
    return (
      <div className="min-h-[calc(100vh-5rem)] relative">
        {/* Full Page Media Background */}
        {currentItem.type === "video" ? (
          <video
            ref={videoRef}
            key={`video-${currentMedia}`}
            autoPlay
            loop
            muted
            playsInline
            className={`fixed inset-0 w-full h-full object-cover z-0 transition-opacity duration-1000 ${
              isTransitioning ? "opacity-0" : "opacity-100"
            }`}
          >
            <source src={currentItem.src} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div
            key={`image-${currentMedia}`}
            className={`fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-0 transition-all duration-1000 ${
              isTransitioning ? "opacity-0" : "opacity-100"
            }`}
            style={{
              backgroundImage: `url(${currentItem.src})`,
            }}
          />
        )}

        {/* Debug info - remove this in production */}
        <div className="fixed top-4 left-4 bg-black/70 text-white p-2 rounded z-30 text-sm">
          Current Media: {currentMedia + 1} of {mediaItems.length} (
          {currentItem.type})
        </div>

        {/* Overlay for readability */}
        <div className="fixed inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 z-10 pointer-events-none"></div>

        {/* Content */}
        <div className="relative z-20">{children}</div>
      </div>
    );
  }

  // For all other pages, show only video background
  return (
    <div className="min-h-[calc(100vh-5rem)] relative">
      {/* Full Page Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0"
      >
        <source src={videoBackground} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay for readability */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 z-10 pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-20">{children}</div>
    </div>
  );
}
