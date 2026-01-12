'use client';

import Image from 'next/image';

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
            width: 60px;
            opacity: 1;
          }
        }

        .fade-down {
          animation: fadeDown 1s ease-out;
        }

        .fade-up-1 {
          animation: fadeUp 1s ease-out 0.3s backwards;
        }

        .fade-up-2 {
          animation: fadeUp 1s ease-out 0.6s backwards;
        }

        .width-grow {
          animation: widthGrow 1s ease-out 0.9s backwards;
        }
      `}</style>

      <div className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Background Glow Effect */}
        <div
          className="absolute w-[600px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[1]"
          style={{
            background: 'radial-gradient(circle, rgba(251, 201, 91, 0.09) 0%, transparent 70%)'
          }}
        />

        {/* Content Container */}
        <div className="relative z-[2] px-5 max-w-[600px]">
          {/* Logo */}
          <div className="fade-down mb-10">
            <Image
              src="/assets/images/aayeu_w.png"
              alt="AAYEU"
              width={200}
              height={80}
              className="mx-auto"
              priority
            />
          </div>

          {/* Divider */}
          <div
            className="width-grow h-[2px] mx-auto mb-[30px]"
            style={{
              width: '60px',
              background: 'linear-gradient(90deg, transparent, #fbc95b, transparent)'
            }}
          />

          {/* Heading */}
          <h1 className="fade-up-1 text-[2.5rem] mb-5 font-light tracking-[2px]">
            WE ARE UPGRADING
          </h1>

          {/* Description */}
          <p className="fade-up-2 text-[1.1rem] text-[#888] leading-[1.6] mb-10">
            We are currently performing scheduled maintenance to improve your shopping experience.
            We will be back shortly with an exclusive new collection.
          </p>

          {/* Copyright */}
          <p className="text-[0.9rem] text-[#555]">
            &copy; 2025 AAYEU. All rights reserved.
          </p>
        </div>
      </div>
    </>
  );
}
