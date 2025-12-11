/* Video Section */
export default function VideoSection() {
  return (
    <div className="col-span-12 md:col-span-7">
      <div className="relative w-full h-80 md:h-[520px] overflow-hidden">
        <video
          className="w-full h-full object-contain"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src="/assets/video/bnr_vdo.webm" type="video/webm" />
          <source src="/assets/video/bnr_vdo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}
