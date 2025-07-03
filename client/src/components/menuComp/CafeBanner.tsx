import Image from "next/image";
import { Clock } from "lucide-react";
import DietaryIcon from "./DietaryIcon";
import { log } from "@/lib/helper";
import Link from "next/link";

interface Cafe {
  name: string;
  tagline: string;
  bannerUrl: string;
  rating: number;
  openingTime: string;
  instaID?: string;
  isPureVeg?: boolean;
}

const CafeBanner = ({ cafe }: { cafe: Cafe }) => (
  log("CafeBanner", cafe),
  (
    <div className="relative w-full h-60 md:h-80 rounded-b-md overflow-hidden">
      {/* Banner Image */}
      {cafe.bannerUrl && (
        <Image
          src={cafe.bannerUrl}
          alt={`${cafe.name} banner`}
          fill
          className="object-cover object-center"
          priority
        />
      )}

      {/* Gradient Overlay for Contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Text Content */}
      <div className="absolute bottom-0 w-full px-5 py-6 flex flex-col gap-1 z-10">
        <h1 className="text-white text-2xl sm:text-3xl font-bold leading-snug tracking-tight">
          {cafe.name}
        </h1>
        <p className="text-white/90 text-sm sm:text-base font-medium leading-tight">
          {cafe.tagline}
        </p>

        <div className="flex flex-wrap items-center gap-4 mt-3 text-white text-xs sm:text-sm font-medium">
          {/* Pure Veg */}
          {cafe.isPureVeg && (
            <div className="flex items-center gap-1.5">
              <DietaryIcon type="veg" />
              <span className="text-white/90">Pure Veg</span>
            </div>
          )}

          {/* Opening Time */}
          {cafe.openingTime && (
            <div className="flex items-center gap-1.5">
              <Clock size={16} className="text-white/70" />
              <span>{cafe.openingTime}</span>
            </div>
          )}

          {/* Instagram */}
          {cafe.instaID && (
            <div className="flex items-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                width="20"
                height="20"
                viewBox="0 0 48 48"
              >
                <radialGradient
                  id="yOrnnhliCrdS2gy~4tD8ma_Xy10Jcu1L2Su_gr1"
                  cx="19.38"
                  cy="42.035"
                  r="44.899"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0" stop-color="#fd5"></stop>
                  <stop offset=".328" stop-color="#ff543f"></stop>
                  <stop offset=".348" stop-color="#fc5245"></stop>
                  <stop offset=".504" stop-color="#e64771"></stop>
                  <stop offset=".643" stop-color="#d53e91"></stop>
                  <stop offset=".761" stop-color="#cc39a4"></stop>
                  <stop offset=".841" stop-color="#c837ab"></stop>
                </radialGradient>
                <path
                  fill="url(#yOrnnhliCrdS2gy~4tD8ma_Xy10Jcu1L2Su_gr1)"
                  d="M34.017,41.99l-20,0.019c-4.4,0.004-8.003-3.592-8.008-7.992l-0.019-20	c-0.004-4.4,3.592-8.003,7.992-8.008l20-0.019c4.4-0.004,8.003,3.592,8.008,7.992l0.019,20	C42.014,38.383,38.417,41.986,34.017,41.99z"
                ></path>
                <radialGradient
                  id="yOrnnhliCrdS2gy~4tD8mb_Xy10Jcu1L2Su_gr2"
                  cx="11.786"
                  cy="5.54"
                  r="29.813"
                  gradientTransform="matrix(1 0 0 .6663 0 1.849)"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0" stop-color="#4168c9"></stop>
                  <stop
                    offset=".999"
                    stop-color="#4168c9"
                    stop-opacity="0"
                  ></stop>
                </radialGradient>
                <path
                  fill="url(#yOrnnhliCrdS2gy~4tD8mb_Xy10Jcu1L2Su_gr2)"
                  d="M34.017,41.99l-20,0.019c-4.4,0.004-8.003-3.592-8.008-7.992l-0.019-20	c-0.004-4.4,3.592-8.003,7.992-8.008l20-0.019c4.4-0.004,8.003,3.592,8.008,7.992l0.019,20	C42.014,38.383,38.417,41.986,34.017,41.99z"
                ></path>
                <path
                  fill="#fff"
                  d="M24,31c-3.859,0-7-3.14-7-7s3.141-7,7-7s7,3.14,7,7S27.859,31,24,31z M24,19c-2.757,0-5,2.243-5,5	s2.243,5,5,5s5-2.243,5-5S26.757,19,24,19z"
                ></path>
                <circle cx="31.5" cy="16.5" r="1.5" fill="#fff"></circle>
                <path
                  fill="#fff"
                  d="M30,37H18c-3.859,0-7-3.14-7-7V18c0-3.86,3.141-7,7-7h12c3.859,0,7,3.14,7,7v12	C37,33.86,33.859,37,30,37z M18,13c-2.757,0-5,2.243-5,5v12c0,2.757,2.243,5,5,5h12c2.757,0,5-2.243,5-5V18c0-2.757-2.243-5-5-5H18z"
                ></path>
              </svg>
              <Link
                href={`https://instagram.com/${cafe.instaID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline hover:text-white/90"
              >
              Follow us  @{cafe.instaID}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
);

export default CafeBanner;
