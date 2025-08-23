import videoBackground from "../assets/video.mp4";

export default function VideoBackground({ children }) {
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
      <div className="fixed inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 z-10"></div>

      {/* Content */}
      <div className="relative z-20">
        {children}
      </div>
    </div>
  );
}
