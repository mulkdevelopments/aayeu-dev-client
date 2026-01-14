  'use client';

  import Image from 'next/image';
  import { Cinzel } from 'next/font/google';

  const cinzel = Cinzel({
    subsets: ['latin'],
    weight: ['400', '600'],
  });

  export default function MaintenancePage() {
    return (
      <>
        <style jsx global>{`
          @keyframes fadeDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fadeUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes widthGrow {
            from {
              width: 0;
              opacity: 0;
            }
            to {
              width: 200px;
              opacity: 1;
            }
          }

          @keyframes glow {
            0%, 100% {
              opacity: 0.6;
            }
            50% {
              opacity: 1;
            }
          }

          .fade-down {
            animation: fadeDown 1s ease-out;
          }

          .fade-up-1 {
            animation: fadeUp 1s ease-out 0.4s backwards;
          }

          .fade-up-2 {
            animation: fadeUp 1s ease-out 0.7s backwards;
          }

          .fade-up-3 {
            animation: fadeUp 1s ease-out 1s backwards;
          }

          .width-grow {
            animation: widthGrow 1.2s ease-out 0.3s backwards;
          }

          .glow-line {
            animation: glow 2s ease-in-out infinite;
            background: linear-gradient(
              90deg,
              transparent 0%,
              #E6C98A 50%,
              transparent 100%
            );
          }
        `}</style>

        <div className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center text-center overflow-hidden px-5">
          {/* Content Container */}
          <div className="relative z-[2] max-w-[900px] w-full">
            {/* Logo with Powered by */}
            <div className="fade-down   flex flex-col items-center">
              <div className="flex items-center gap-3 ">
                <Image
                  src="/assets/images/aayeu_w.png"
                  alt="AAYEU"
                  width={280}
                  height={100}
                  className="w-[280px] h-auto"
                  priority
                />
              </div>
           
            </div>

            {/* Top Divider */}
            <div
              className="width-grow h-[1px] mx-auto mb-4 glow-line"
              style={{
                width: '200px'
              }}
            />

            {/* Main Heading */}
            <h1 className={`${cinzel.className} fade-up-1 text-[2.0rem] sm:text-[3.5rem] md:text-[4rem] mb-8 font-light tracking-[3px] sm:tracking-[4px] leading-[1.3]`}
                style={{
                  background: 'linear-gradient(180deg, #D4AF37 0%, #E6C98A 50%, #D4AF37 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
              A NEW ERA OF
              <br />
              LUXURY IS COMING
            </h1>

            {/* Description */}
            <p className="fade-up-2 text-[1.15rem] sm:text-[1.25rem] text-[#aaa] leading-[1.8] mb-12 max-w-[700px] mx-auto font-light">
              AAYEU is preparing to open its doors.
              <br />
              A curated destination for fashion,
              <br />
              footwear, and lifestyle — crafted
              <br />
              for those who expect more.
            </p>

            {/* Bottom Divider */}
            

            {/* Launching Soon */}
            <p className="fade-up-3 text-[1.8rem] sm:text-[2.2rem] font-serif italic tracking-[2px]"
              style={{
                color: '#E6C98A'
              }}>
              Launching Soon
            </p>
            <div
              className="width-grow h-[1px] mx-auto mt-2 glow-line"
              style={{
                width: '200px'
              }}
            />
          </div>
        </div>
      </>
    );
  }
