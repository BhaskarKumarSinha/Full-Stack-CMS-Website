/* eslint-disable */
// @ts-nocheck
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";
import CarouselManager from "../components/carousel/CarouselManager";
import CarouselDisplay from "../components/carousel/CarouselDisplay";
import ImagePicker from "../components/ImagePicker";
import FeaturesEditor from "./page-builder/FeaturesEditor";
import type { FeaturesContent } from "./page-builder/FeaturesEditor";
import FeaturesPreview from "./FeaturesPreview";
import HeroEditor from "./page-builder/HeroEditor";
import type { HeroContent } from "./page-builder/HeroEditor";
import BlogEditor from "./page-builder/BlogEditor";
import type { BlogContent } from "./page-builder/BlogEditor";
import TextImageBlockEditor from "./page-builder/TextImageBlockEditor";
import type { TextImageBlock } from "./page-builder/TextImageBlockEditor";
import NavItemsEditor from "../components/editors/NavItemsEditor";
import FooterSectionsEditor from "../components/editors/FooterSectionsEditor";

type SectionType =
  | "hero"
  | "cards"
  | "carousel"
  | "testimonials"
  | "blog"
  | "imagetextblock"
  | "cta";

type Section = {
  id: string;
  type: SectionType;
  title?: string;
  props?: SectionProps;
};

type Item = {
  title?: string;
  body?: string;
  quote?: string;
  author?: string;
  image?: string;
  photo?: string;
  company?: string;
  role?: string;
};

type SectionProps = {
  heading?: string;
  sub?: string;
  items?: Item[];
  summary?: string;
  [key: string]: unknown;
};

type ButtonStyle = {
  bgColor?: string;
  textColor?: string;
  hoverBgColor?: string;
  hoverTextColor?: string;
  borderColor?: string;
  borderWidth?: string;
  borderRadius?: string;
  paddingX?: string;
  paddingY?: string;
  fontSize?: string;
  fontWeight?: string;
  shadow?: string;
  variant?: "solid" | "outline" | "ghost" | "text" | "gradient";
  enableAnimation?: boolean;
  transformAmount?: number; // pixels to move up on hover (0 = no transform)
  transitionDuration?: number; // transition duration in seconds
};

type CTA = {
  headline?: string;
  subtext?: string;
  primaryText?: string;
  primaryUrl?: string;
  secondaryText?: string;
  secondaryUrl?: string;
  secondaryCtaVariant?: "outlined" | "text" | "ghost";
  ctaVariant?: 1 | 2 | 3 | 4;
  sideImage?: string;
  backgroundImage?: string;
  primaryButtonStyle?: ButtonStyle;
  secondaryButtonStyle?: ButtonStyle;
};

function uid(prefix = "s") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

const defaultNavHtml = `
<nav class="site-nav bg-gray-800 text-white p-4">
  <div class="max-w-6xl mx-auto">Site navigation — logo / links</div>
</nav>`;

const defaultFooterHtml = `
<footer class="site-footer bg-gray-900 text-white p-6">
  <div class="max-w-6xl mx-auto text-sm text-center"></div>
</footer>`;

// Inlined compiled CSS from build so preview windows have full styling
const previewCss = `@layer properties{@supports (((-webkit-hyphens:none)) and (not (margin-trim:inline))) or ((-moz-orient:inline) and (not (color:rgb(from red r g b)))){*,:before,:after,::backdrop{--tw-translate-x:0;--tw-translate-y:0;--tw-translate-z:0;--tw-scale-x:1;--tw-scale-y:1;--tw-scale-z:1;--tw-rotate-x:initial;--tw-rotate-y:initial;--tw-rotate-z:initial;--tw-skew-x:initial;--tw-skew-y:initial;--tw-space-y-reverse:0;--tw-border-style:solid;--tw-gradient-position:initial;--tw-gradient-from:#0000;--tw-gradient-via:#0000;--tw-gradient-to:#0000;--tw-gradient-stops:initial;--tw-gradient-via-stops:initial;--tw-gradient-from-position:0%;--tw-gradient-via-position:50%;--tw-gradient-to-position:100%;--tw-leading:initial;--tw-font-weight:initial;--tw-shadow:0 0 #0000;--tw-shadow-color:initial;--tw-shadow-alpha:100%;--tw-inset-shadow:0 0 #0000;--tw-inset-shadow-color:initial;--tw-inset-shadow-alpha:100%;--tw-ring-color:initial;--tw-ring-shadow:0 0 #0000;--tw-inset-ring-color:initial;--tw-inset-ring-shadow:0 0 #0000;--tw-ring-inset:initial;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-offset-shadow:0 0 #0000;--tw-outline-style:solid;--tw-blur:initial;--tw-brightness:initial;--tw-contrast:initial;--tw-grayscale:initial;--tw-hue-rotate:initial;--tw-invert:initial;--tw-opacity:initial;--tw-saturate:initial;--tw-sepia:initial;--tw-drop-shadow:initial;--tw-drop-shadow-color:initial;--tw-drop-shadow-alpha:100%;--tw-drop-shadow-size:initial;--tw-backdrop-blur:initial;--tw-backdrop-brightness:initial;--tw-backdrop-contrast:initial;--tw-backdrop-grayscale:initial;--tw-backdrop-hue-rotate:initial;--tw-backdrop-invert:initial;--tw-backdrop-opacity:initial;--tw-backdrop-saturate:initial;--tw-backdrop-sepia:initial;--tw-duration:initial}}}@layer theme{:root,:host{--font-sans:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";--font-mono:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;--color-red-50:oklch(97.1% .013 17.38);--color-red-100:oklch(93.6% .032 17.717);--color-red-200:oklch(88.5% .062 18.334);--color-red-400:oklch(70.4% .191 22.216);--color-red-500:oklch(63.7% .237 25.331);--color-red-600:oklch(57.7% .245 27.325);--color-red-700:oklch(50.5% .213 27.518);--color-red-900:oklch(39.6% .141 25.723);--color-orange-100:oklch(95.4% .038 75.164);--color-orange-600:oklch(64.6% .222 41.116);--color-yellow-50:oklch(98.7% .026 102.212);--color-yellow-100:oklch(97.3% .071 103.193);--color-yellow-400:oklch(85.2% .199 91.936);--color-yellow-500:oklch(79.5% .184 86.047);--color-yellow-600:oklch(68.1% .162 75.834);--color-yellow-800:oklch(47.6% .114 61.907);--color-green-50:oklch(98.2% .018 155.826);--color-green-100:oklch(96.2% .044 156.743);--color-green-200:oklch(92.5% .084 155.995);--color-green-500:oklch(72.3% .219 149.579);--color-green-600:oklch(62.7% .194 149.214);--color-green-700:oklch(52.7% .154 150.069);--color-green-800:oklch(44.8% .119 151.328);--color-emerald-600:oklch(59.6% .145 163.225);--color-emerald-700:oklch(50.8% .118 165.612);--color-blue-50:oklch(97% .014 254.604);--color-blue-100:oklch(93.2% .032 255.585);--color-blue-200:oklch(88.2% .059 254.128);--color-blue-300:oklch(80.9% .105 251.813);--color-blue-400:oklch(70.7% .165 254.624);--color-blue-500:oklch(62.3% .214 259.815);--color-blue-600:oklch(54.6% .245 262.881);--color-blue-700:oklch(48.8% .243 264.376);--color-blue-800:oklch(42.4% .199 265.638);--color-indigo-100:oklch(93% .034 272.788);--color-indigo-500:oklch(58.5% .233 277.117);--color-indigo-600:oklch(51.1% .262 276.966);--color-purple-50:oklch(97.7% .014 308.299);--color-purple-100:oklch(94.6% .033 307.174);--color-purple-300:oklch(82.7% .119 306.383);--color-purple-500:oklch(62.7% .265 303.9);--color-purple-600:oklch(55.8% .288 302.321);--color-purple-700:oklch(49.6% .265 301.924);--color-purple-800:oklch(43.8% .218 303.724);--color-pink-500:oklch(65.6% .241 354.308);--color-pink-600:oklch(59.2% .249 .584);--color-slate-50:oklch(98.4% .003 247.858);--color-slate-100:oklch(96.8% .007 247.896);--color-gray-50:oklch(98.5% .002 247.839);--color-gray-100:oklch(96.7% .003 264.542);--color-gray-200:oklch(92.8% .006 264.531);--color-gray-300:oklch(87.2% .01 258.338);--color-gray-400:oklch(70.7% .022 261.325);--color-gray-500:oklch(55.1% .027 264.364);--color-gray-600:oklch(44.6% .03 256.802);--color-gray-700:oklch(37.3% .034 259.733);--color-gray-800:oklch(27.8% .033 256.848);--color-gray-900:oklch(21% .034 264.665);--color-black:#000;--color-white:#fff;--spacing:.25rem;--container-md:28rem;--container-2xl:42rem;--container-3xl:48rem;--container-4xl:56rem;--container-6xl:72rem;--container-7xl:80rem;--text-xs:.75rem;--text-xs--line-height:calc(1/.75);--text-sm:.875rem;--text-sm--line-height:calc(1.25/.875);--text-lg:1.125rem;--text-lg--line-height:calc(1.75/1.125);--text-xl:1.25rem;--text-xl--line-height:calc(1.75/1.25);--text-2xl:1.5rem;--text-2xl--line-height:calc(2/1.5);--text-3xl:1.875rem;--text-3xl--line-height:calc(2/1.875);--text-4xl:2.25rem;--text-4xl--line-height:calc(2.5/2.25);--text-5xl:3rem;--text-5xl--line-height:calc(3/3);--text-6xl:3.75rem;--text-6xl--line-height:calc(3.75/3.75);--font-weight-medium:500;--font-weight-semibold:600;--font-weight-bold:700;--leading-relaxed:1.625;--radius-md:.375rem;--radius-lg:.5rem;--radius-xl:.75rem;--radius-2xl:1rem;--blur-sm:8px;--default-transition-duration:.15s;--default-transition-timing-function:cubic-bezier(.4,0,.2,1);--default-font-family:var(--font-sans);--default-mono-font-family:var(--font-mono)}}@layer base{*,:after,:before,::backdrop{box-sizing:border-box;border:0 solid;margin:0;padding:0}::file-selector-button{box-sizing:border-box;border:0 solid;margin:0;padding:0}html,:host{-webkit-text-size-adjust:100%;tab-size:4;line-height:1.5;font-family:var(--default-font-family,ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji");font-feature-settings:var(--default-font-feature-settings,normal);font-variation-settings:var(--default-font-variation-settings,normal);-webkit-tap-highlight-color:transparent}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;-webkit-text-decoration:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:var(--default-mono-font-family,ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace);font-feature-settings:var(--default-mono-font-feature-settings,normal);font-variation-settings:var(--default-mono-font-variation-settings,normal);font-size:1em}small{font-size:80%}sub,sup{vertical-align:baseline;font-size:75%;line-height:0;position:relative}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}:-moz-focusring{outline:auto}progress{vertical-align:baseline}summary{display:list-item}ol,ul,menu{list-style:none}img,svg,video,canvas,audio,iframe,embed,object{vertical-align:middle;display:block}img,video{max-width:100%;height:auto}button,input,select,optgroup,textarea{font:inherit;font-feature-settings:inherit;font-variation-settings:inherit;letter-spacing:inherit;color:inherit;opacity:1;background-color:#0000;border-radius:0}::file-selector-button{font:inherit;font-feature-settings:inherit;font-variation-settings:inherit;letter-spacing:inherit;color:inherit;opacity:1;background-color:#0000;border-radius:0}:where(select:is([multiple],[size])) optgroup{font-weight:bolder}:where(select:is([multiple],[size])) optgroup option{padding-inline-start:20px}::file-selector-button{margin-inline-end:4px}::placeholder{opacity:1}@supports (not ((-webkit-appearance:-apple-pay-button))) or (contain-intrinsic-size:1px){::placeholder{color:currentColor}@supports (color:color-mix(in lab,red,red)){::placeholder{color:color-mix(in oklab,currentcolor 50%,transparent)}}}textarea{resize:vertical}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-date-and-time-value{min-height:1lh;text-align:inherit}::-webkit-datetime-edit{display:inline-flex}::-webkit-datetime-edit-fields-wrapper{padding:0}::-webkit-datetime-edit{padding-block:0}::-webkit-datetime-edit-year-field{padding-block:0}::-webkit-datetime-edit-month-field{padding-block:0}::-webkit-datetime-edit-day-field{padding-block:0}::-webkit-datetime-edit-hour-field{padding-block:0}::-webkit-datetime-edit-minute-field{padding-block:0}::-webkit-datetime-edit-second-field{padding-block:0}::-webkit-datetime-edit-millisecond-field{padding-block:0}::-webkit-datetime-edit-meridiem-field{padding-block:0}::-webkit-calendar-picker-indicator{line-height:1}:-moz-ui-invalid{box-shadow:none}button,input:where([type=button],[type=reset],[type=submit]){appearance:button}::file-selector-button{appearance:button}::-webkit-inner-spin-button{height:auto}::-webkit-outer-spin-button{height:auto}[hidden]:where(:not([hidden=until-found])){display:none!important}}@layer components;@layer utilities{.pointer-events-none{pointer-events:none}.collapse{visibility:collapse}.visible{visibility:visible}.absolute{position:absolute}.fixed{position:fixed}.relative{position:relative}.static{position:static}.sticky{position:sticky}.inset-0{inset:calc(var(--spacing)*0)}.top-0{top:calc(var(--spacing)*0)}.top-1\/2{top:50%}.top-16{top:calc(var(--spacing)*16)}.right-4{right:calc(var(--spacing)*4)}.bottom-4{bottom:calc(var(--spacing)*4)}.left-1\/2{left:50%}.left-4{left:calc(var(--spacing)*4)}.z-10{z-index:10}.z-20{z-index:20}.z-50{z-index:50}.col-span-2{grid-column:span 2/span 2}.col-span-full{grid-column:1/-1}.container{width:100%}@media(min-width:40rem){.container{max-width:40rem}}@media(min-width:48rem){.container{max-width:48rem}}@media(min-width:64rem){.container{max-width:64rem}}@media(min-width:80rem){.container{max-width:80rem}}@media(min-width:96rem){.container{max-width:96rem}}.mx-auto{margin-inline:auto}.my-4{margin-block:calc(var(--spacing)*4)}.my-6{margin-block:calc(var(--spacing)*6)}.my-8{margin-block:calc(var(--spacing)*8)}.mt-1{margin-top:calc(var(--spacing)*1)}.mt-2{margin-top:calc(var(--spacing)*2)}.mt-3{margin-top:calc(var(--spacing)*3)}.mt-4{margin-top:calc(var(--spacing)*4)}.mt-6{margin-top:calc(var(--spacing)*6)}.mt-8{margin-top:calc(var(--spacing)*8)}.mr-2{margin-right:calc(var(--spacing)*2)}.mb-0{margin-bottom:calc(var(--spacing)*0)}.mb-1{margin-bottom:calc(var(--spacing)*1)}.mb-2{margin-bottom:calc(var(--spacing)*2)}.mb-3{margin-bottom:calc(var(--spacing)*3)}.mb-4{margin-bottom:calc(var(--spacing)*4)}.mb-6{margin-bottom:calc(var(--spacing)*6)}.mb-8{margin-bottom:calc(var(--spacing)*8)}.mb-12{margin-bottom:calc(var(--spacing)*12)}.mb-16{margin-bottom:calc(var(--spacing)*16)}.ml-2{margin-left:calc(var(--spacing)*2)}.ml-4{margin-left:calc(var(--spacing)*4)}.block{display:block}.flex{display:flex}.grid{display:grid}.hidden{display:none}.inline-block{display:inline-block}.inline-flex{display:inline-flex}.table{display:table}.aspect-square{aspect-ratio:1}.h-3{height:calc(var(--spacing)*3)}.h-4{height:calc(var(--spacing)*4)}.h-5{height:calc(var(--spacing)*5)}.h-6{height:calc(var(--spacing)*6)}.h-9{height:calc(var(--spacing)*9)}.h-10{height:calc(var(--spacing)*10)}.h-12{height:calc(var(--spacing)*12)}.h-16{height:calc(var(--spacing)*16)}.h-20{height:calc(var(--spacing)*20)}.h-24{height:calc(var(--spacing)*24)}.h-32{height:calc(var(--spacing)*32)}.h-36{height:calc(var(--spacing)*36)}.h-40{height:calc(var(--spacing)*40)}.h-48{height:calc(var(--spacing)*48)}.h-56{height:calc(var(--spacing)*56)}.h-64{height:calc(var(--spacing)*64)}.h-96{height:calc(var(--spacing)*96)}.h-\[calc\(100vh-250px\)\]{height:calc(100vh - 250px)}.h-auto{height:auto}.h-full{height:100%}.max-h-96{max-height:calc(var(--spacing)*96)}.max-h-\[80vh\]{max-height:80vh}.max-h-full{max-height:100%}.min-h-screen{min-height:100vh}.w-1\/2{width:50%}.w-3{width:calc(var(--spacing)*3)}.w-3\/4{width:75%}.w-4{width:calc(var(--spacing)*4)}.w-5{width:calc(var(--spacing)*5)}.w-6{width:calc(var(--spacing)*6)}.w-8{width:calc(var(--spacing)*8)}.w-12{width:calc(var(--spacing)*12)}.w-16{width:calc(var(--spacing)*16)}.w-24{width:calc(var(--spacing)*24)}.w-32{width:calc(var(--spacing)*32)}.w-40{width:calc(var(--spacing)*40)}.w-56{width:calc(var(--spacing)*56)}.w-64{width:calc(var(--spacing)*64)}.w-fit{width:fit-content}.w-full{width:100%}.w-screen{width:100vw}.max-w-2xl{max-width:var(--container-2xl)}.max-w-3xl{max-width:var(--container-3xl)}.max-w-4xl{max-width:var(--container-4xl)}.max-w-6xl{max-width:var(--container-6xl)}.max-w-7xl{max-width:var(--container-7xl)}.max-w-md{max-width:var(--container-md)}.min-w-0{min-width:calc(var(--spacing)*0)}.flex-1{flex:1}.table-auto{table-layout:auto}.-translate-x-1\/2{--tw-translate-x: -50% ;translate:var(--tw-translate-x)var(--tw-translate-y)}.-translate-y-1\/2{--tw-translate-y: -50% ;translate:var(--tw-translate-x)var(--tw-translate-y)}.scale-105{--tw-scale-x:105%;--tw-scale-y:105%;--tw-scale-z:105%;scale:var(--tw-scale-x)var(--tw-scale-y)}.rotate-6{rotate:6deg}.transform{transform:var(--tw-rotate-x,)var(--tw-rotate-y,)var(--tw-rotate-z,)var(--tw-skew-x,)var(--tw-skew-y,)}.cursor-grab{cursor:grab}.cursor-move{cursor:move}.cursor-not-allowed{cursor:not-allowed}.cursor-pointer{cursor:pointer}.resize{resize:both}.list-inside{list-style-position:inside}.list-decimal{list-style-type:decimal}.grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr))}.grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}.grid-cols-5{grid-template-columns:repeat(5,minmax(0,1fr))}.flex-col{flex-direction:column}.flex-wrap{flex-wrap:wrap}.flex-wrap-reverse{flex-wrap:wrap-reverse}.items-center{align-items:center}.items-end{align-items:flex-end}.items-start{align-items:flex-start}.justify-between{justify-content:space-between}.justify-center{justify-content:center}.justify-end{justify-content:flex-end}.gap-1{gap:calc(var(--spacing)*1)}.gap-2{gap:calc(var(--spacing)*2)}.gap-3{gap:calc(var(--spacing)*3)}.gap-4{gap:calc(var(--spacing)*4)}.gap-6{gap:calc(var(--spacing)*6)}.gap-8{gap:calc(var(--spacing)*8)}.gap-12{gap:calc(var(--spacing)*12)}:where(.space-y-1>:not(:last-child)){--tw-space-y-reverse:0;margin-block-start:calc(calc(var(--spacing)*1)*var(--tw-space-y-reverse));margin-block-end:calc(calc(var(--spacing)*1)*calc(1 - var(--tw-space-y-reverse)))}:where(.space-y-2>:not(:last-child)){--tw-space-y-reverse:0;margin-block-start:calc(calc(var(--spacing)*2)*var(--tw-space-y-reverse));margin-block-end:calc(calc(var(--spacing)*2)*calc(1 - var(--tw-space-y-reverse)))}:where(.space-y-3>:not(:last-child)){--tw-space-y-reverse:0;margin-block-start:calc(calc(var(--spacing)*3)*var(--tw-space-y-reverse));margin-block-end:calc(calc(var(--spacing)*3)*calc(1 - var(--tw-space-y-reverse)))}.truncate{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.overflow-auto{overflow:auto}.overflow-hidden{overflow:hidden}.overflow-x-auto{overflow-x:auto}.overflow-y-auto{overflow-y:auto}.rounded{border-radius:.25rem}.rounded-2xl{border-radius:var(--radius-2xl)}.rounded-full{border-radius:3.40282e38px}.rounded-lg{border-radius:var(--radius-lg)}.rounded-md{border-radius:var(--radius-md)}.rounded-xl{border-radius:var(--radius-xl)}.rounded-t-lg{border-top-left-radius:var(--radius-lg);border-top-right-radius:var(--radius-lg)}.rounded-r-lg{border-top-right-radius:var(--radius-lg);border-bottom-right-radius:var(--radius-lg)}.border{border-style:var(--tw-border-style);border-width:1px}.border-2{border-style:var(--tw-border-style);border-width:2px}.border-t{border-top-style:var(--tw-border-style);border-top-width:1px}.border-t-2{border-top-style:var(--tw-border-style);border-top-width:2px}.border-r{border-right-style:var(--tw-border-style);border-right-width:1px}.border-b{border-bottom-style:var(--tw-border-style);border-bottom-width:1px}.border-l-4{border-left-style:var(--tw-border-style);border-left-width:4px}.border-dashed{--tw-border-style:dashed;border-style:dashed}.border-blue-200{border-color:var(--color-blue-200)}...`;

export default function PageBuilder() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [pageId, setPageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!id);

  const defaultNavStyle = {
    backgroundColor: "#ffffff",
    textColor: "#0f172a",
    hoverBackground: "#f8fafc",
    hoverTextColor: "#0f172a",
    hoverEffect: "underline",
    underlineColor: "#2563eb",
    underlineThickness: 2,
    underlineTransitionMs: 220,
    underlineDelayMs: 50,
  };

  const defaultFooterStyle = {
    backgroundColor: "#111827",
    textColor: "#d1d5db",
    hoverBackground: "#111827",
    hoverTextColor: "#ffffff",
    hoverEffect: "background",
    underlineColor: "#2563eb",
    underlineThickness: 2,
    underlineTransitionMs: 220,
    underlineDelayMs: 50,
  };

  const [navConfig, _setNavConfig] = useState<any>({
    brandName: "My Site",
    logoUrl: "",
    navItems: [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
    ],
    navStyle: defaultNavStyle,
  });
  const [navHtml, setNavHtml] = useState<string>(() =>
    renderNavHtml({
      brandName: "My Site",
      logoUrl: "",
      navItems: [
        { label: "Home", href: "/" },
        { label: "About", href: "/about" },
      ],
    })
  );

  const [footerConfig, _setFooterConfig] = useState<any>({
    companyName: "My Company",
    description: "Short description",
    footerSections: [],
  });
  const [footerSectionsText, setFooterSectionsText] = useState<
    Record<string | number, string>
  >({});
  const [footerHtml, setFooterHtml] = useState<string>(
    renderFooterHtml(
      // use current footerConfig/text on init
      {
        companyName: footerConfig.companyName,
        footerSections: footerConfig.footerSections,
      },
      footerSectionsText
    )
  );

  const setNavConfig = (next: any) => {
    if (typeof next === "function") {
      _setNavConfig((prev: any) => {
        const computed = next(prev);
        setNavHtml(renderNavHtml(computed));
        return computed;
      });
    } else {
      _setNavConfig(next);
      setNavHtml(renderNavHtml(next));
    }
  };

  // Load site config from localStorage (saved by NavbarSettings) so preview matches
  // the navbar settings page when available.
  useState(() => {
    try {
      const raw = localStorage.getItem("cms_site_config");
      if (raw) {
        const parsed = JSON.parse(raw || "{}");
        if (parsed && parsed.navConfig) {
          const merged = {
            ...navConfig,
            ...parsed.navConfig,
            navStyle: {
              ...defaultNavStyle,
              ...(parsed.navConfig.navStyle || {}),
            },
          };
          _setNavConfig(merged);
          setNavHtml(renderNavHtml(merged));
        }
      }
    } catch (e) {
      /* ignore */
    }
  });

  const setFooterConfig = (next: any) => {
    _setFooterConfig(next);
    setFooterHtml(renderFooterHtml(next, footerSectionsText));
  };

  // Load saved footer config from localStorage (if Navbar/Footer settings saved together)
  useState(() => {
    try {
      const raw = localStorage.getItem("cms_site_config");
      if (raw) {
        const parsed = JSON.parse(raw || "{}");
        if (parsed && parsed.footerConfig) {
          const merged = {
            ...footerConfig,
            ...parsed.footerConfig,
            footerStyle: {
              ...defaultFooterStyle,
              ...(parsed.footerConfig.footerStyle || {}),
            },
          };
          _setFooterConfig(merged);
          setFooterHtml(renderFooterHtml(merged, footerSectionsText));
        }
      }
    } catch (e) {
      /* ignore */
    }
  });

  function renderNavHtml(c: any) {
    const brand = c?.brandName || "";
    const logo = c?.logoUrl
      ? `<img src="${c.logoUrl}" alt="${brand}" style="height:28px;"/>`
      : "";
    const items = (c?.navItems || [])
      .map((it: any) => {
        const label = it?.label || it?.title || it?.name || it?.value || "";
        const href = it?.href || it?.url || "#";
        if (it.children && it.children.length > 0) {
          const childrenHtml = (it.children || [])
            .map((ch: any) => {
              const chLabel =
                ch?.label || ch?.title || ch?.name || ch?.value || "";
              const chHref = ch?.href || ch?.url || "#";
              return `<a href="${chHref}" class="nav-link child-link block px-3 py-2">${chLabel}</a>`;
            })
            .join("");
          return `<div class="nav-item has-children relative inline-block" data-child-open="false">
            <a href="${href}" class="nav-link parent-link inline-block px-3 py-2">${label} ▾</a>
            <div class="child-menu absolute bg-white text-black rounded shadow-md mt-2" style="display:none">${childrenHtml}</div>
          </div>`;
        }
        return `<a href="${href}" class="nav-link inline-block px-3 py-2">${label}</a>`;
      })
      .join("");

    const style = c?.navStyle || defaultNavStyle;
    const hoverEffect = style.hoverEffect || defaultNavStyle.hoverEffect;
    const underlineColor =
      style.underlineColor || defaultNavStyle.underlineColor;
    const underlineThickness = Number(
      style.underlineThickness || defaultNavStyle.underlineThickness || 2
    );
    const underlineTransition = Number(
      style.underlineTransitionMs ||
        defaultNavStyle.underlineTransitionMs ||
        220
    );
    const underlineDelay = Number(
      style.underlineDelayMs || defaultNavStyle.underlineDelayMs || 50
    );

    // add a unique id for this nav so the script targets it reliably
    const navId = `site-nav-${Math.random().toString(36).slice(2, 8)}`;

    // Base CSS for nav and links, include responsive rules
    let css = `
      .site-nav{background:${style.backgroundColor};color:${style.textColor};padding:0.75rem}
      .site-nav > div{display:flex;align-items:center;justify-content:space-between;gap:1rem}
      .site-nav .nav-items{display:flex;gap:0.5rem;align-items:center}
      #${navId} .nav-link{color:${style.textColor} !important;position:relative;padding:0.5rem 0.75rem;border-radius:4px;display:inline-block;text-decoration:none}
      .site-nav .brand{font-weight:700;display:flex;align-items:center;gap:.5rem}

      /* Responsive: keep brand and button on one line; hide nav items until opened */
      @media (max-width: 640px){
        .site-nav > div{flex-direction:row;align-items:center;position:relative}
        /* hidden by default on mobile (will be shown when hamburger opens) */
        .site-nav .nav-items{display:none !important;position:absolute;right:0;top:calc(100% + 6px);min-width:160px;background:${style.backgroundColor};padding:0.25rem;border-radius:6px;box-shadow:0 6px 18px rgba(0,0,0,0.12);z-index:60}
        /* show dropdown when open (anchored near the button) */
        .site-nav[data-open="true"] .nav-items{display:flex !important;flex-direction:column;gap:0.25rem}
        /* top-level links on mobile: full-width, inherit nav colors */
        #${navId} .nav-link{padding:0.6rem 0.9rem;border-radius:4px;text-align:left;font-size:0.98rem;background:${style.backgroundColor} !important;color:${style.textColor} !important;display:block;width:100%}
        /* child links should match top-level link styling on mobile for this nav */
        #${navId} .child-menu a, #${navId} .child-link{display:block;width:100%;padding:0.6rem 0.9rem;color:${style.textColor} !important;background:${style.backgroundColor} !important;text-decoration:none}
        .mobile-menu-button{margin-left:0.5rem}
      }
    `;

    // Hover behaviors (apply same to child links)
    if (hoverEffect === "background") {
      css += `#${navId} .nav-link:hover{background:${style.hoverBackground} !important;color:${style.hoverTextColor} !important;}`;
      css += `#${navId} .child-link:hover{background:${style.hoverBackground} !important;color:${style.hoverTextColor} !important;}`;
    } else if (hoverEffect === "text-color") {
      css += `#${navId} .nav-link:hover{color:${style.hoverTextColor} !important;}`;
      css += `#${navId} .child-link:hover{color:${style.hoverTextColor} !important;}`;
    } else if (
      hoverEffect === "underline" ||
      hoverEffect === "underline-and-bg"
    ) {
      css += `
        #${navId} .nav-link::after{content:'';position:absolute;left:10%;right:10%;bottom:-6px;height:${underlineThickness}px;background:${underlineColor};transform:scaleX(0);transform-origin:left;transition:transform ${underlineTransition}ms ease ${underlineDelay}ms}
        #${navId} .nav-link:hover::after{transform:scaleX(1)}
      `;
      css += `
        #${navId} .child-link::after{content:'';position:absolute;left:10%;right:10%;bottom:-6px;height:${underlineThickness}px;background:${underlineColor};transform:scaleX(0);transform-origin:left;transition:transform ${underlineTransition}ms ease ${underlineDelay}ms}
        #${navId} .child-link:hover::after{transform:scaleX(1)}
      `;
      if (hoverEffect === "underline-and-bg") {
        css += `#${navId} .nav-link:hover{background:${style.hoverBackground} !important;color:${style.hoverTextColor} !important;}`;
        css += `#${navId} .child-link:hover{background:${style.hoverBackground} !important;color:${style.hoverTextColor} !important;}`;
      }
    } else {
      // default fallback
      css += `#${navId} .child-link:hover{background:${style.hoverBackground} !important;color:${style.hoverTextColor} !important;}`;
      css += `#${navId} .child-link:hover{background:${style.hoverBackground} !important;color:${style.hoverTextColor} !important;}`;
    }

    // child menu behavior (desktop hover and mobile inline)
    css += `
      /* desktop: child menu is absolutely positioned dropdown; stack items vertically without affecting nav height */
      #${navId} .nav-item{position:relative}
      /* ensure child menus are hidden by default (override any utility classes) */
      #${navId} .nav-item{overflow:visible}
      #${navId} .nav-item .child-menu{min-width:160px;overflow:hidden;display:none !important;flex-direction:column;position:absolute;top:calc(100% + 10px);left:0;z-index:120}
      #${navId} .nav-item:hover > .child-menu, #${navId} .nav-item[data-child-open="true"] > .child-menu{display:flex !important;flex-direction:column !important;pointer-events:auto}
      #${navId} .child-menu a, #${navId} .child-link{display:block;padding:.5rem .75rem;color:${style.textColor} !important;background:transparent;text-decoration:none;white-space:nowrap}
      #${navId} .child-menu{background:${style.backgroundColor} !important;color:${style.textColor} !important;border-radius:6px;box-shadow:0 6px 18px rgba(0,0,0,0.08)}
      #${navId} .nav-item[data-child-open="true"] .child-menu{display:flex}
      /* Mobile: child menus are part of flow and full-width */
      @media (max-width:640px){
        #${navId} .child-menu{position:static;box-shadow:none;margin-top:0;padding:0;background:transparent;color:inherit;border-radius:0;left:auto;top:auto}
        #${navId} .child-link{padding-left:1.25rem}
      }
    `;

    // Ensure nav-items render as a column on mobile for THIS nav only; child menus stay hidden until toggled
    css += `
      @media (max-width:640px){
        /* top-level nav-items stack vertically only when this nav is opened (avoid global overrides) */
        #${navId}[data-open="true"] .nav-items { display:flex !important; flex-direction:column !important; gap:0 !important; }
        #${navId} .nav-items .nav-item, #${navId} .nav-items a.nav-link { display:block !important; width:100% !important; box-sizing:border-box; }
        #${navId} .nav-item.has-children { display:block !important; width:100% }
        #${navId} .parent-link{display:flex;justify-content:space-between;align-items:center;width:100%}
        /* child menus remain hidden until parent toggled to avoid showing on load */
        #${navId} .child-menu{display:none !important;padding-left:0}
        #${navId} .nav-item[data-child-open="true"] .child-menu{display:flex !important;flex-direction:column}
      }
    `;

    // mobile toggle button (no inline onclick; script will handle state and icon)
    const mobileButton = `<button class="mobile-menu-button" aria-expanded="false" aria-controls="${navId}-items" style="background:transparent;border:0;color:inherit;font-size:1.25rem">☰</button>`;

    // extend CSS with mobile button visibility and collapsed/expanded rules
    css += `
      .mobile-menu-button{display:none}
      @media (max-width:640px){
        .mobile-menu-button{display:inline-block;margin-left:auto}
        #${navId} .nav-items{display:none}
        #${navId}[data-open="true"] .nav-items{display:flex;flex-direction:column;gap:0.25rem;min-width:160px;box-shadow:0 6px 18px rgba(0,0,0,0.12)}
        #${navId}[data-open="true"] .nav-items .nav-link{display:block;padding:0.6rem 1rem;text-align:left;background:${style.backgroundColor};color:${style.textColor};width:100%}
        /* ensure child menu items also render full-width and inherit nav colors */
        #${navId}[data-open="true"] .child-menu a{display:block;padding:0.6rem 1rem;background:${style.backgroundColor};color:${style.textColor};width:100%}
      }
    `;

    const navHtml = `<nav id="${navId}" class="site-nav p-4"><style>${css}</style><div class="max-w-6xl mx-auto flex items-center justify-between">${
      logo
        ? `<div class="flex items-center gap-3"><span class="brand">${logo}<span class="font-bold ml-2">${brand}</span></span></div>`
        : `<div class="brand font-bold">${brand}</div>`
    }${mobileButton}<div id="${navId}-items" class="nav-items">${items}</div></div></nav>`;

    const script = `<script>(function(){try{const nav=document.getElementById('${navId}');if(!nav) return;const btn=nav.querySelector('.mobile-menu-button');const items=nav.querySelector('.nav-items');
  const setOpen=(open)=>{nav.setAttribute('data-open', open? 'true':'false'); if(btn) btn.setAttribute('aria-expanded', open? 'true':'false'); if(items){ if(open){ items.classList.add('open'); } else { items.classList.remove('open'); } } if(btn) btn.textContent = open ? '\u00D7' : '\u2630';};
  // initialize closed state explicitly
  nav.setAttribute('data-open','false'); if(items) items.classList.remove('open'); if(btn) btn.textContent='\u2630';
  if(btn){ btn.addEventListener('click', function(e){ e.stopPropagation(); setOpen(nav.getAttribute('data-open')!=='true'); }); }
      // Parent link toggles for child menus (separate click vs hover state)
      const parentLinks = nav.querySelectorAll('.nav-item.has-children > .parent-link');
      // initialize all parent items as closed and ensure child menus hidden on touch devices
      nav.querySelectorAll('.nav-item.has-children').forEach(function(p){ p.setAttribute('data-child-click','false'); p.setAttribute('data-child-hover','false'); p.setAttribute('data-child-open','false'); const cm = p.querySelector('.child-menu'); if(cm) {
          // if device supports hover, don't force inline display:none so CSS :hover can work
          var supportsHover = window.matchMedia && window.matchMedia('(hover: hover)').matches;
          if(!supportsHover){ cm.style.setProperty('display','none','important'); } else { cm.style.removeProperty('display'); }
        } });
      function isTouchDevice(){ return !(window.matchMedia && window.matchMedia('(hover: hover)').matches); }

      function updateChildVisibility(parent){ const childMenu = parent.querySelector('.child-menu'); if(!childMenu) return; const clickOpen = parent.getAttribute('data-child-click') === 'true'; const hoverOpen = parent.getAttribute('data-child-hover') === 'true'; const show = clickOpen || hoverOpen; if(show){ childMenu.style.setProperty('display','flex','important'); parent.setAttribute('data-child-open','true'); } else { childMenu.style.setProperty('display','none','important'); parent.setAttribute('data-child-open','false'); } }

      parentLinks.forEach(function(pl){ const parent = pl.parentElement; const childMenu = parent?.querySelector('.child-menu'); if(!parent || !childMenu) return;
        // Click toggles child menu (both mobile & desktop)
        pl.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); const clickState = parent.getAttribute('data-child-click') === 'true'; parent.setAttribute('data-child-click', clickState ? 'false' : 'true'); updateChildVisibility(parent); });

        // Hover (desktop/hover-capable devices): set transient hover flag
        parent.addEventListener('mouseenter', function(){ if(!isTouchDevice()){ parent.setAttribute('data-child-hover','true'); updateChildVisibility(parent); } });
        parent.addEventListener('mouseleave', function(){ if(!isTouchDevice()){ parent.setAttribute('data-child-hover','false'); updateChildVisibility(parent); } });
      });
      document.addEventListener('click', function(e){ if(nav.getAttribute('data-open')==='true'){ if(!nav.contains(e.target)){ setOpen(false); // also close child menus
            nav.querySelectorAll('.nav-item[data-child-open="true"]').forEach(function(n){ n.setAttribute('data-child-open','false'); const cm = n.querySelector('.child-menu'); if(cm) cm.style.setProperty('display','none','important'); }); } } // close any child menus when clicking outside them on mobile
        if(!window.matchMedia('(hover: hover)').matches){ // if touched outside any open child-menu, close them
          const anyOpen = nav.querySelector('.nav-item[data-child-open="true"]'); if(anyOpen && !nav.contains(e.target)){ nav.querySelectorAll('.nav-item[data-child-open="true"]').forEach(function(n){ n.setAttribute('data-child-open','false'); const cm = n.querySelector('.child-menu'); if(cm) cm.style.setProperty('display','none','important'); }); }
        }
      });
      document.addEventListener('keydown', function(e){ if(e.key === 'Escape'){ setOpen(false); nav.querySelectorAll('.nav-item[data-child-open="true"]').forEach(function(n){ n.setAttribute('data-child-open','false'); const cm = n.querySelector('.child-menu'); if(cm) cm.style.setProperty('display','none','important'); }); } }); // initialize
    if(nav.getAttribute('data-open')==='true'){ if(items) items.classList.add('open'); if(btn) btn.textContent='\u00D7'; }
    }catch(e){console.warn(e)}})();</script>`;

    return navHtml + script;
  }

  // Minimal preview CSS to avoid using the large compiled CSS in previews
  const minimalPreviewCss = `
  /* Minimal preview stylesheet for Page Builder preview */
  *{box-sizing:border-box}
  :root{--bg:#ffffff;--text:#111827}
  body{background:var(--bg);color:var(--text);font-family:ui-sans-serif,system-ui,sans-serif;margin:0;padding:0;line-height:1.5}
  h1,h2,h3,h4,h5,h6{margin:0}
  p{margin:0}
  img{max-width:100%;height:auto;display:block}
  a{color:#2563eb;text-decoration:none}
  a.px-4.py-2{padding:.5rem 1rem;border-radius:.375rem;display:inline-block}
  section{display:block}
  
  /* Navigation */
  .site-nav{background:#1f2937;color:#fff;padding:1rem}
  .site-nav .nav-items{gap:.5rem}
  .site-nav .nav-link{color:inherit;text-decoration:none;padding:.5rem .75rem;border-radius:4px}
  .site-footer{background:#111827;color:#d1d5db;padding:1.5rem}
  
  /* Utility classes */
  .p-4{padding:1rem}.p-8{padding:2rem}.p-12{padding:3rem}
  .mb-2{margin-bottom:.5rem}.mb-3{margin-bottom:.75rem}.mb-4{margin-bottom:1rem}
  .mt-2{margin-top:.5rem}
  .mx-auto{margin-left:auto;margin-right:auto}
  .text-center{text-align:center}.text-white{color:#fff}.text-gray-600{color:#4b5563}.text-gray-700{color:#374151}.text-gray-800{color:#111827}.text-sm{font-size:.875rem}.text-lg{font-size:1.125rem}.text-2xl{font-size:1.5rem}.text-4xl{font-size:2.25rem}.font-bold{font-weight:700}.font-semibold{font-weight:600}
  .flex{display:flex}.grid{display:grid}.gap-3{gap:.75rem}.gap-4{gap:1rem}.gap-6{gap:1.5rem}.items-center{align-items:center}.justify-center{justify-content:center}.space-y-4>:not(:last-child){margin-bottom:1rem}
  .relative{position:relative}.absolute{position:absolute}.inset-0{top:0;right:0;bottom:0;left:0}.z-10{z-index:10}
  .overflow-hidden{overflow:hidden}.h-40{height:10rem}.h-48{height:12rem}.h-64{height:16rem}.h-full{height:100%}.w-full{width:100%}.object-cover{object-fit:cover}.bg-cover{background-size:cover}.bg-center{background-position:center}
  .rounded{border-radius:.25rem}.rounded-md{border-radius:.375rem}.rounded-lg{border-radius:.5rem}.shadow-sm{box-shadow:0 1px 2px rgba(0,0,0,0.04)}.border{border:1px solid #d1d5db}
  .bg-white{background:#fff}.bg-gray-50{background:transparent}.bg-gray-200{background:transparent}.bg-blue-600{background:#2563eb;color:#fff}
  .max-w-6xl{max-width:72rem;margin-inline:auto}.max-w-4xl{max-width:56rem;margin-inline:auto}
  
  /* Hero section */
  .hero{padding:3rem;color:#fff}
  .hero h1{font-size:2.25rem;font-weight:700;margin-bottom:.5rem}
  .hero p{font-size:1rem;margin-bottom:1rem}
  
  /* Cards section */
  .cards{padding:2rem;background:#fff}
  .cards h2{font-size:1.5rem;font-weight:700;margin-bottom:1rem}
  .cards .grid{display:grid;gap:1.5rem}
  .cards .grid.grid-cols-1{grid-template-columns:1fr}
  .cards .grid.grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}
  .cards .grid.grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}
  .cards .card{padding:1rem;border-radius:.5rem;transition:all 0.3s ease;cursor:pointer}
  .cards .card h3{font-weight:600;font-size:1.125rem;margin-bottom:.5rem}
  .cards .card p{font-size:.875rem;color:#4b5563}
  .cards .card.minimal{border:1px solid #f0f0f0;background:#fafafa}
  .cards .card.minimal:hover{background:#f5f5f5;border-color:#ddd}
  .cards .card.shadow{border:1px solid #e5e7eb;box-shadow:0 1px 2px rgba(0,0,0,0.04)}
  .cards .card.shadow:hover{box-shadow:0 4px 12px rgba(0,0,0,0.15);transform:translateY(-2px)}
  .cards .card.gradient{border:none;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff}
  .cards .card.gradient h3{color:#fff}
  .cards .card.gradient p{color:rgba(255,255,255,0.9)}
  .cards .card.gradient:hover{transform:translateY(-4px);box-shadow:0 8px 24px rgba(102,126,234,0.4)}
  .cards .card.modern{border:2px solid #667eea;background:#f8f9ff}
  .cards .card.modern h3{color:#667eea}
  .cards .card.modern:hover{background:#667eea;color:#fff;border-color:#667eea}
  .cards .card.modern:hover h3{color:#fff}
  .cards .card.modern:hover p{color:rgba(255,255,255,0.9)}
  
  /* Carousel section */
  .carousel{padding:2rem}
  .carousel h2{font-size:1.5rem;font-weight:700;margin-bottom:1rem}
  .carousel-wrapper{position:relative;display:flex;align-items:center;gap:1rem}
  .carousel-inner{display:flex;overflow:hidden;border-radius:0.5rem;width:100%;position:relative}
  .carousel-display{position:relative;height:280px !important;border-radius:0.5rem;overflow:hidden;display:flex;align-items:center;justify-content:center}
  .carousel-item{width:100% !important;height:100% !important;object-fit:cover;display:block}
  .carousel button{width:12px !important;height:12px !important;border-radius:50%;border:none;cursor:pointer;transition:all 0.3s;padding:0;min-width:12px;min-height:12px}
  .carousel .grid{display:flex;gap:1rem;transition:transform 0.5s ease-in-out;width:100%}
  .carousel .grid>div{flex:0 0 calc(33.333% - 0.67rem);border-radius:.5rem;overflow:hidden;transition:all 0.3s ease;cursor:pointer;background:#fff;min-width:280px}
  .carousel .grid>div.style-minimal{border:1px solid #f0f0f0;background:#fafafa}
  .carousel .grid>div.style-minimal:hover{background:#f5f5f5;border-color:#ddd}
  .carousel .grid>div.style-shadow{box-shadow:0 1px 2px rgba(0,0,0,0.04);border:1px solid #e5e7eb}
  .carousel .grid>div.style-shadow:hover{box-shadow:0 4px 12px rgba(0,0,0,0.15);transform:translateY(-2px)}
  .carousel .grid>div.style-gradient{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff}
  .carousel .grid>div.style-gradient:hover{transform:translateY(-4px);box-shadow:0 8px 24px rgba(102,126,234,0.4)}
  .carousel .grid>div.style-modern{border:2px solid #667eea;background:#f8f9ff}
  .carousel .grid>div.style-modern:hover{background:#667eea;color:#fff;border-color:#667eea}
  .carousel .grid>div h4{padding-top:.75rem;margin:0;padding-left:.75rem;padding-right:.75rem;font-weight:600}
  .carousel .grid>div p{padding:0 .75rem .75rem .75rem;font-size:.875rem;color:#4b5563;margin:0}
  .carousel .grid>div.style-gradient h4,.carousel .grid>div.style-gradient p{color:rgba(255,255,255,0.95)}
  .carousel-btn{position:absolute;top:50%;transform:translateY(-50%);width:40px;height:40px;background:#667eea;color:#fff;border:none;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:10;transition:all 0.3s ease;font-size:1.25rem}
  .carousel-btn:hover{background:#5568d3;transform:translateY(-50%) scale(1.1)}
  .carousel-btn.prev{left:0}
  .carousel-btn.next{right:0}
  .carousel-btn.next{right:0}
  
  /* Image + Text block */
  .imagetextblock{padding:3rem 1.5rem}
  .imagetextblock .content{display:flex;flex-direction:column;justify-content:center}
  .imagetextblock .text-center .content{text-align:center}
  .imagetextblock .img{flex:0 0 auto;overflow:hidden;border-radius:.75rem;transition:all 0.3s ease;max-height:320px;display:flex;align-items:center}
  .imagetextblock .img:hover{box-shadow:0 12px 32px rgba(0,0,0,0.12);transform:translateY(-2px)}
  .imagetextblock .img img{width:100%;height:auto;max-height:320px;display:block;object-fit:cover}
  .imagetextblock h2{font-size:1.875rem;font-weight:800;margin-bottom:.75rem;line-height:1.2}
  .imagetextblock h3{font-size:1.125rem;font-weight:600;margin-bottom:.75rem}
  .imagetextblock p{font-size:.95rem;line-height:1.6;color:#374151;margin-bottom:1.25rem}
  .imagetextblock a{display:inline-block;padding:.65rem 1.5rem;background:#667eea;color:#fff;border-radius:.375rem;text-decoration:none;font-weight:500;transition:all 0.3s cubic-bezier(0.4,0,0.2,1)}
  .imagetextblock a:hover{background:#5568d3;transform:translateY(-2px);box-shadow:0 6px 16px rgba(102,126,234,0.35)}
  @media(max-width:1024px){.imagetextblock .img{max-width:100% !important;max-height:280px}.imagetextblock .img img{max-height:280px}.imagetextblock h2{font-size:1.5rem}.imagetextblock p{font-size:.9rem}}
  @media(max-width:768px){.imagetextblock{padding:2rem 1rem}.imagetextblock h2{font-size:1.375rem}.imagetextblock a{padding:.5rem 1.25rem;font-size:.9rem}.imagetextblock .text-center .content{text-align:center}}
  
  /* Testimonials section */
  .testimonials{padding:2rem}
  .testimonials h2{font-size:1.5rem;font-weight:700;margin-bottom:1rem}
  .testimonials-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem}
  .testimonials blockquote{padding:1.5rem;background:#fff;border:1px solid #e5e7eb;border-left:4px solid #667eea;border-radius:.5rem;box-shadow:0 1px 2px rgba(0,0,0,0.04);margin-bottom:1rem;transition:all 0.3s ease}
  .testimonials blockquote:hover{box-shadow:0 4px 12px rgba(0,0,0,0.1);transform:translateX(4px)}
  .testimonials blockquote.style-gradient{border:none;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;border-left:none}
  .testimonials blockquote.style-gradient:hover{box-shadow:0 8px 24px rgba(102,126,234,0.4);transform:translateX(4px)}
  .testimonials blockquote.style-modern{border:2px solid #667eea;border-left:4px solid #667eea;background:#f8f9ff}
  .testimonials blockquote.style-modern:hover{background:#667eea;color:#fff;border-color:#667eea}
  .testimonials p{color:#111827;margin:0 0 .5rem 0}
  .testimonials blockquote.style-gradient p,.testimonials blockquote.style-gradient cite{color:rgba(255,255,255,0.95)}
  .testimonials blockquote.style-modern:hover p,.testimonials blockquote.style-modern:hover cite{color:#fff}
  .testimonials cite{display:block;color:#4b5563;font-size:.875rem;margin-top:.5rem;font-weight:600;font-style:normal}
  /* GFG-style testimonial cards */
  .testimonials-carousel{display:flex;gap:1.5rem;overflow-x:auto;scroll-snap-type:x mandatory;padding:1rem 0;scrollbar-width:none}
  .testimonials-carousel::-webkit-scrollbar{display:none}
  .testimonial-card{flex:0 0 320px;scroll-snap-align:start;background:#fff;border-radius:1rem;box-shadow:0 4px 20px rgba(0,0,0,0.08);padding:1.5rem;position:relative;transition:all 0.3s ease}
  .testimonial-card:hover{transform:translateY(-4px);box-shadow:0 8px 30px rgba(0,0,0,0.12)}
  .testimonial-card .quote-icon{position:absolute;top:1rem;right:1rem;width:40px;height:40px;opacity:0.15}
  .testimonial-card .quote-icon svg{width:100%;height:100%;fill:#667eea}
  .testimonial-card .testimonial-text{font-size:0.95rem;line-height:1.6;color:#374151;margin-bottom:1rem;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}
  .testimonial-card .testimonial-author{display:flex;align-items:center;gap:0.75rem;margin-top:auto;padding-top:1rem;border-top:1px solid #e5e7eb}
  .testimonial-card .author-photo{width:48px;height:48px;border-radius:50%;object-fit:cover;border:2px solid #667eea}
  .testimonial-card .author-info{flex:1}
  .testimonial-card .author-name{font-weight:600;color:#111827;font-size:0.95rem;margin:0}
  .testimonial-card .author-company{font-size:0.8rem;color:#667eea;font-weight:500;margin:0}
  
  /* CTA section */
  .block-cta{padding:2rem;border-radius:.5rem;text-align:center;transition:all 0.3s ease}
  .block-cta.style-default{background:#f8fafc}
  .block-cta.style-gradient{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff}
  .block-cta.style-modern{background:#f8f9ff;border:2px solid #667eea}
  .block-cta.style-dark{background:#1f2937;color:#fff}
  .block-cta h2{font-size:1.5rem;font-weight:700;margin-bottom:.5rem}
  .block-cta.style-gradient h2,.block-cta.style-dark h2{color:#fff}
  .block-cta.style-modern h2{color:#667eea}
  .block-cta p{margin-bottom:1rem}
  .block-cta.style-gradient p,.block-cta.style-dark p{color:rgba(255,255,255,0.9)}
  .block-cta .flex{display:flex;justify-content:center;gap:.75rem}
  .block-cta a{padding:.5rem 1rem;border-radius:.375rem;text-decoration:none;transition:all 0.3s ease;font-weight:500}
  .block-cta a.primary{background:#667eea;color:#fff}
  .block-cta a.primary:hover{background:#5568d3;transform:translateY(-2px);box-shadow:0 4px 12px rgba(102,126,234,0.4)}
  .block-cta a.secondary{border:1px solid #667eea;color:#667eea}
  .block-cta a.secondary:hover{background:#667eea;color:#fff}
  .block-cta.style-gradient a.primary{background:rgba(255,255,255,0.2);color:#fff}
  .block-cta.style-gradient a.primary:hover{background:rgba(255,255,255,0.3)}
  .block-cta.style-dark a.primary{background:#667eea;color:#fff}
  .block-cta.style-dark a.primary:hover{background:#5568d3}
  
  /* Blog section */
  .blog-post{background:#fff;display:flex;flex-direction:column}
  .blog-header{}
  .blog-header h1{font-size:3rem;font-weight:700;line-height:1.2;margin-bottom:1rem;margin-top:0}
  .blog-header img{width:100%;height:24rem;object-fit:cover;border-radius:0.5rem;box-shadow:0 8px 24px rgba(0,0,0,0.15);margin-bottom:2rem}
  .blog-header p{font-size:1.25rem;line-height:1.6;margin-bottom:1.5rem;margin-top:0}
  .blog-content{max-width:100%;margin:0 auto;width:100%}
  .blog-content h2{font-size:1.875rem;font-weight:700;margin-bottom:1rem;margin-top:2rem;line-height:1.3}
  .blog-content h2:first-child{margin-top:0}
  .blog-content h3{font-size:1.5rem;font-weight:600;margin-bottom:0.75rem;margin-top:1.5rem;line-height:1.3}
  .blog-content p{font-size:1.0625rem;line-height:1.75;margin-bottom:1rem;margin-top:0}
  .blog-content img{max-width:100%;height:auto;border-radius:0.5rem;box-shadow:0 4px 12px rgba(0,0,0,0.1);display:block;margin:1.5rem 0}
  .blog-content blockquote{margin:1.5rem 0;padding:1.5rem;border-left:4px solid #667eea;font-size:1.125rem;font-style:italic;color:#374151;border-radius:0.25rem;margin-top:1.5rem}
  .blog-content hr{margin:2.5rem 0;border:none;border-top:1px solid #e5e7eb;opacity:0.5}
  
  /* Responsive: desktop */
  @media (min-width:768px){
    .md\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr)) !important}
    .md\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr)) !important}
  }
  
  /* Responsive: mobile */
  @media (max-width:767px){
    section{padding:1.5rem}
    .hero{padding:1.5rem;text-align:center}
    .cards .grid{grid-template-columns:1fr !important}
    .carousel .grid{grid-template-columns:1fr !important}
    .imagetextblock .grid{grid-template-columns:1fr !important}
    .block-cta .flex{flex-direction:column}
    .md\:grid-cols-2{grid-template-columns:1fr !important}
    .md\:grid-cols-3{grid-template-columns:1fr !important}
  }
  
  /* Navigation mobile */
  @media (max-width:640px){
    .site-nav .nav-items{display:none}
    .site-nav[data-open="true"] .nav-items{display:flex;flex-direction:column}
    .site-nav .child-menu{display:none}
    .site-nav .nav-item[data-child-open="true"] .child-menu{display:block}
    .site-footer .footer-container{grid-template-columns:1fr}
  }
  `;

  function renderFooterHtml(f: any, textMap: Record<string | number, string>) {
    const sections = f?.footerSections || [];
    const style = f?.footerStyle || defaultFooterStyle;

    const underlineColor =
      style.underlineColor || defaultFooterStyle.underlineColor;
    const underlineThickness = Number(
      style.underlineThickness || defaultFooterStyle.underlineThickness || 2
    );
    const underlineTransition = Number(
      style.underlineTransitionMs ||
        defaultFooterStyle.underlineTransitionMs ||
        220
    );
    const underlineDelay = Number(
      style.underlineDelayMs || defaultFooterStyle.underlineDelayMs || 50
    );

    const cols = sections
      .map((sec: any, idx: number) => {
        const heading = sec.heading || "";
        const text = textMap?.[idx] ?? "";
        const links = text
          ? text
              .split(",")
              .map((l: string) => `<li>${l.trim()}</li>`)
              .join("")
          : (sec.links || [])
              .map((l: any) =>
                typeof l === "string"
                  ? `<li>${l}</li>`
                  : `<li><a href="${l.href || "#"}">${l.label || ""}</a></li>`
              )
              .join("");
        return `<div><h4 class="font-semibold mb-2">${heading}</h4><ul class="space-y-1 text-sm">${links}</ul></div>`;
      })
      .join("");

    // Build footer CSS to reflect footerStyle settings (hover effects etc.) and be responsive
    const colsCount = Math.max(1, sections.length);
    // company column slightly larger (1.2fr) to stand out but still balanced
    // If there's only one footer section (two columns total), make both columns equal width
    const containerColsTemplate =
      colsCount === 1 ? `repeat(2,1fr)` : `1.12fr repeat(${colsCount},1fr)`;
    const companyPadding = colsCount === 1 ? `0` : `0.75rem`;
    let css = `
      .site-footer{background:${style.backgroundColor};color:${
      style.textColor
    };padding:1.5rem}
      .site-footer .footer-container{max-width:72rem;margin-inline:auto;display:grid;grid-template-columns:${containerColsTemplate};gap:1rem;align-items:start}
      .site-footer .footer-grid{display:grid;grid-template-columns:repeat(${colsCount},1fr);gap:1rem}
      .site-footer .footer-company{padding-right:${companyPadding}}
      .site-footer .footer-company h3{margin-bottom:0.35rem}
      .site-footer .footer-grid > div{padding:0.25rem}
      .site-footer ul{padding:0;margin:0;list-style:none}
      .site-footer a{color:${style.textColor};text-decoration:none}
      .site-footer a:hover{color:${style.hoverTextColor}}

      /* Responsive: switch to single column on narrower screens, keep company first and center columns */
      @media (max-width: 1024px){
        .site-footer .footer-grid{grid-template-columns:repeat(${Math.max(
          1,
          Math.min(colsCount, 3)
        )},1fr)}
      }
      @media (max-width: 768px){
        .site-footer .footer-container{grid-template-columns:1fr;justify-items:center;text-align:center}
        .site-footer .footer-grid{grid-template-columns:1fr;justify-items:center;text-align:center}
        .site-footer .footer-company{order:0;margin-bottom:0;padding-bottom:0.5rem;padding-right:0}
        .site-footer .footer-grid > div{order:1;justify-self:center}
        .site-footer .footer-grid ul{display:inline-block;text-align:left}
      }
      @media (max-width: 480px){
        .site-footer .footer-container{grid-template-columns:1fr}
        .site-footer .footer-grid{grid-template-columns:1fr}
      }
    `;

    if (style.hoverEffect === "background") {
      css += `.site-footer a:hover{background:${style.hoverBackground};padding:0.125rem;border-radius:4px}`;
    } else if (style.hoverEffect === "text-color") {
      css += `.site-footer a:hover{color:${style.hoverTextColor}}`;
    } else if (
      style.hoverEffect === "underline" ||
      style.hoverEffect === "underline-and-bg"
    ) {
      css += `
        .site-footer a{position:relative}
        .site-footer a::after{content:'';position:absolute;left:0;right:0;height:${underlineThickness}px;bottom:-6px;background:${underlineColor};transform:scaleX(0);transform-origin:left;transition:transform ${underlineTransition}ms ease ${underlineDelay}ms}
        .site-footer a:hover::after{transform:scaleX(1)}
      `;
      if (style.hoverEffect === "underline-and-bg") {
        css += `.site-footer a:hover{background:${style.hoverBackground};padding:0.125rem;border-radius:4px}`;
      }
    } else {
      css += `.site-footer a:hover{background:${style.hoverBackground}}`;
    }

    const companyName = f?.companyName || f?.name || f?.title || "";
    const companyHtml = `<div class="footer-company"><h3 class="font-bold mb-2">${companyName}</h3><p class="text-sm text-muted">${
      f?.description || ""
    }</p></div>`;

    const gridHtml = `<div class="footer-container">${companyHtml}<div class='footer-grid'>${cols}</div></div>`;

    // Return footer with inline styles using data attribute to allow CSS customization
    // The styles are injected as a style tag before the footer for better HTML structure
    const footerWithStyles = `<style id="footer-styles">${css}</style><footer class="site-footer">${gridHtml}</footer>`;
    return footerWithStyles;
  }

  const initialSections: Section[] = [
    {
      id: uid("hero"),
      type: "hero",
      title: "Hero Section",
      props: { heading: "Welcome", sub: "Subtitle" },
    },
    {
      id: uid("cards"),
      type: "cards",
      title: "Cards",
      props: { items: [{ title: "Card A", body: "..." }] },
    },
    {
      id: uid("carousel"),
      type: "carousel",
      title: "Carousel",
      props: {
        variant: 1,
        autoScroll: false,
        items: [
          {
            id: uid("slide"),
            image:
              "https://images.unsplash.com/photo-1506765515384-028b60a970df?w=900&h=500&fit=crop",
            title: "Slide 1",
          },
          {
            id: uid("slide"),
            image:
              "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&h=500&fit=crop",
            title: "Slide 2",
          },
        ],
      },
    },
    {
      id: uid("testimonials"),
      type: "testimonials",
      title: "Testimonials",
      props: { items: [] },
    },
    {
      id: uid("cta"),
      type: "cta",
      title: "Call To Action",
      props: {},
    },
  ];

  const [sections, setSections] = useState<Section[]>(initialSections);

  const [dragId, setDragId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isDraggingOverlay, setIsDraggingOverlay] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >(() => {
    const map: Record<string, boolean> = {};
    initialSections.forEach((s) => (map[s.id] = true));
    return map;
  });
  const [navExpanded, setNavExpanded] = useState(false);
  const [footerExpanded, setFooterExpanded] = useState(false);
  const [pageTitle, setPageTitle] = useState<string>("New Page");
  const [pagePath, setPagePath] = useState<string>("/new-page");

  // Load page data when editing an existing page
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    // Helper function to parse sections from page layout array (inside useEffect to avoid closure issues)
    const parseSectionsFromHTML = (html: string, page: any): Section[] => {
      // Valid section types that PageBuilder supports
      const validTypes = [
        "hero",
        "cards",
        "carousel",
        "testimonials",
        "blog",
        "imagetextblock",
        "cta",
      ];

      // If the page has a layout array, use that to reconstruct sections
      if (page && page.layout && Array.isArray(page.layout)) {
        console.log("Layout is array with", page.layout.length, "items");
        console.log("Layout items:", page.layout);

        const sections = page.layout
          .filter((block: any) => {
            console.log(
              "Checking block type:",
              block.type,
              "is valid:",
              validTypes.includes(block.type)
            );
            return validTypes.includes(block.type);
          })
          .map((block: any) => {
            const section = {
              id: block._id?.toString() || uid(block.type),
              type: block.type as SectionType,
              title: block.title || `${block.type} Section`,
              props: block.props || {},
            };
            if (block.type === "blog") {
              console.log("Loaded blog section:", section);
            }
            return section;
          });
        console.log("All loaded sections:", sections);
        return sections;
      }
      // Fallback: return empty if no layout is available
      console.log("No valid layout found. page.layout =", page?.layout);
      return [];
    };

    const loadPage = async () => {
      try {
        const res = await api.getPageById(id);
        const page = res.data;
        console.log("Full page data from API:", page);
        console.log("Page content length:", page?.content?.length);
        console.log("Page layout:", JSON.stringify(page?.layout, null, 2));
        if (page) {
          setPageId(id);
          setPageTitle(page.title || "New Page");
          setPagePath(page.path || "/new-page");

          // Parse sections from the layout array
          console.log("Page layout array:", page.layout);
          const parsedSections = parseSectionsFromHTML("", page);
          console.log(
            "Loaded page sections:",
            JSON.stringify(parsedSections, null, 2)
          );

          // Always update sections if we have any parsed sections
          if (parsedSections.length > 0) {
            console.log("Setting sections from parsed layout");
            setSections(parsedSections);
            // Initialize all sections as collapsed
            const collapsedMap: Record<string, boolean> = {};
            parsedSections.forEach((s) => (collapsedMap[s.id] = true));
            setCollapsedSections(collapsedMap);
          } else {
            console.log(
              "No sections parsed. Layout:",
              page.layout,
              "Length:",
              page.layout?.length
            );
            // If page exists but has no layout, it's a new page - use defaults
            // If page has layout but nothing parsed, it's old format
            if (
              page.layout &&
              Array.isArray(page.layout) &&
              page.layout.length > 0
            ) {
              // Has layout items but couldn't parse - old format
              console.log("Old format detected - showing empty");
              setSections([]);
            } else {
              // New page or no layout - use defaults
              console.log("Using default sections");
              // Don't setSections - keep initialSections
            }
          }
        }
      } catch (err) {
        console.error("Failed to load page:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [id]);

  const addSection = (type: SectionType) => {
    const s: Section = {
      id: uid(type),
      type,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Section`,
      props: {},
    };
    if (type === "cards") s.props = { items: [{ title: "Item 1", body: "" }] };
    if (type === "carousel")
      s.props = {
        variant: 1,
        autoScroll: false,
        items: [
          {
            id: uid("slide"),
            image:
              "https://images.unsplash.com/photo-1506765515384-028b60a970df?w=900&h=500&fit=crop",
            title: "Slide 1",
          },
          {
            id: uid("slide"),
            image:
              "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&h=500&fit=crop",
            title: "Slide 2",
          },
        ],
      };
    setSections((prev) => [...prev, s]);
    setCollapsedSections((prev) => ({ ...prev, [s.id]: true }));
  };

  const removeSection = (id: string) =>
    setSections((prev) => prev.filter((s) => s.id !== id));

  const getHeroContent = (s: Section): HeroContent => {
    const hc = (s.props as SectionProps)?.heroContent as
      | Partial<HeroContent>
      | undefined;
    return {
      headline: hc?.headline || (s.props?.heading as string) || "Welcome",
      subheading: hc?.subheading || (s.props?.sub as string) || "",
      primaryCta: hc?.primaryCta || "Get Started",
      primaryCtaUrl: hc?.primaryCtaUrl || "#",
      secondaryCta: hc?.secondaryCta || "Learn More",
      secondaryCtaUrl: hc?.secondaryCtaUrl || "#",
      secondaryCtaVariant:
        (hc?.secondaryCtaVariant as HeroContent["secondaryCtaVariant"]) ||
        "outlined",
      backgroundImage: hc?.backgroundImage || "",
      sideImage: hc?.sideImage || "",
      backgroundColor: hc?.backgroundColor || "#ffffff",
      textColor: hc?.textColor || "#111827",
      primaryButtonStyle: hc?.primaryButtonStyle || undefined,
      secondaryButtonStyle: hc?.secondaryButtonStyle || undefined,
    } as HeroContent;
  };

  const setHeroContent = (s: Section, content: HeroContent) => {
    setSections((prev) =>
      prev.map((x) =>
        x.id === s.id
          ? { ...x, props: { ...x.props, heroContent: content } }
          : x
      )
    );
  };

  const getHeroVariant = (s: Section) =>
    (Number(((s.props as SectionProps)?.variant as number) || 1) || 1) as
      | 1
      | 2
      | 3
      | 4;

  const setHeroVariant = (s: Section, v: 1 | 2 | 3 | 4) => {
    setSections((prev) =>
      prev.map((x) =>
        x.id === s.id ? { ...x, props: { ...x.props, variant: v } } : x
      )
    );
  };

  const getFeaturesContent = (s: Section): FeaturesContent => {
    const f = (s.props as SectionProps)?.features as
      | FeaturesContent
      | undefined;
    if (f) return f;
    // build from items
    const cards = ((s.props?.items || []) as Item[]).map((it) => ({
      id: uid("card"),
      title: it.title || "",
      description: it.body || "",
      image: it.image || "",
    }));
    return {
      sectionTitle: s.title || "Features",
      variant: 2,
      cards,
      columnsPerRow: 3,
      cardStyle: "shadow",
      cardCssCustom: {},
    } as FeaturesContent;
  };

  const getCtaContent = (s: Section): CTA => {
    const c = (s.props as SectionProps)?.cta as CTA | undefined;
    return {
      headline:
        c?.headline || (s.props?.heading as string) || "Ready to get started?",
      subtext: c?.subtext || (s.props?.sub as string) || "",
      primaryText: c?.primaryText || "Get Started",
      primaryUrl: c?.primaryUrl || "#",
      secondaryText: c?.secondaryText || "Learn More",
      secondaryUrl: c?.secondaryUrl || "#",
      secondaryCtaVariant: c?.secondaryCtaVariant || "outlined",
      ctaVariant: c?.ctaVariant || 1,
      sideImage: c?.sideImage || "",
      backgroundImage: c?.backgroundImage || "",
      backgroundColor: c?.backgroundColor || "#f8fafc",
      textColor: c?.textColor || "#111827",
      primaryButtonStyle: c?.primaryButtonStyle || undefined,
      secondaryButtonStyle: c?.secondaryButtonStyle || undefined,
    };
  };

  const setCtaContent = (s: Section, content: CTA) => {
    setSections((prev) =>
      prev.map((x) =>
        x.id === s.id ? { ...x, props: { ...x.props, cta: content } } : x
      )
    );
  };

  const getBlogContent = (s: Section): BlogContent => {
    const b = (s.props as SectionProps)?.blog as BlogContent | undefined;
    if (b) return b;
    // default blog content
    return {
      title: s.title || "New Blog",
      subtitle: "",
      author: "",
      date: "",
      featuredImage: "",
      blocks: [],
      styles: {
        headerBackground: "#ffffff",
        titleColor: "#111827",
        textColor: "#374151",
        accentColor: "#2563eb",
      },
    };
  };

  const setBlogContent = (s: Section, content: BlogContent) => {
    setSections((prev) =>
      prev.map((x) =>
        x.id === s.id ? { ...x, props: { ...x.props, blog: content } } : x
      )
    );
  };

  const setFeaturesContent = (s: Section, content: FeaturesContent) => {
    const mappedItems = (content.cards || []).map((c) => ({
      title: c.title,
      body: c.description,
      image: c.image,
    }));
    // Ensure cardCssCustom and cardStyle are preserved
    const updatedContent = {
      ...content,
      cardStyle: content.cardStyle || "shadow",
      cardCssCustom: content.cardCssCustom || {},
    };
    setSections((prev) =>
      prev.map((x) =>
        x.id === s.id
          ? {
              ...x,
              props: {
                ...x.props,
                features: updatedContent,
                items: mappedItems,
              },
            }
          : x
      )
    );
  };

  const getTextImageBlock = (s: Section): TextImageBlock => {
    const img = (s.props as SectionProps) || {};
    return {
      id: s.id,
      type: "text-image",
      layout: (img.layout as TextImageBlock["layout"]) || "text-left",
      text: {
        heading: (img.heading as string) || (s.title as string) || "",
        subheading: (img.sub as string) || "",
        description: (img.body as string) || "",
        buttonText: (img.buttonText as string) || "",
        buttonUrl: (img.buttonUrl as string) || "",
      },
      image: {
        url: (img.image as string) || "",
        alt: (img.alt as string) || (img.heading as string) || "",
      },
      styles: {
        backgroundColor: (img.backgroundColor as string) || "#ffffff",
        textColor: (img.textColor as string) || "#111827",
        headingFontSize: (img.headingFontSize as string) || "24px",
        padding: (img.padding as string) || "24px",
        borderRadius: (img.borderRadius as string) || "8px",
      },
      buttonStyle:
        (img.buttonStyle as TextImageBlock["buttonStyle"]) || undefined,
    } as TextImageBlock;
  };

  const setTextImageBlock = (s: Section, block: TextImageBlock) => {
    setSections((prev) =>
      prev.map((x) =>
        x.id === s.id
          ? {
              ...x,
              props: {
                ...x.props,
                layout: block.layout,
                heading: block.text.heading,
                sub: block.text.subheading,
                body: block.text.description,
                buttonText: block.text.buttonText,
                buttonUrl: block.text.buttonUrl,
                image: block.image.url,
                alt: block.image.alt,
                backgroundColor: block.styles.backgroundColor,
                textColor: block.styles.textColor,
                headingFontSize: block.styles.headingFontSize,
                padding: block.styles.padding,
                borderRadius: block.styles.borderRadius,
                buttonStyle: block.buttonStyle,
              },
            }
          : x
      )
    );
  };

  const renderSectionHtml = (s: Section) => {
    switch (s.type) {
      case "hero": {
        const hc = getHeroContent(s);
        const variant = getHeroVariant(s);

        // Primary button styles from hero content
        const pbs = hc.primaryButtonStyle || {};
        const pbBgColor = pbs.bgColor || "#2563eb";
        const pbTextColor = pbs.textColor || "#ffffff";
        const pbHoverBgColor = pbs.hoverBgColor || "#1d4ed8";
        const pbHoverTextColor = pbs.hoverTextColor || "#ffffff";
        const pbBorderRadius = pbs.borderRadius || "0.375rem";
        const pbFontSize = pbs.fontSize || "1rem";
        const pbVariant = pbs.variant || "solid";
        const pbShadow = pbs.shadow || "md";
        const pbEnableAnimation = pbs.enableAnimation !== false; // default true
        const pbTransformAmount = pbs.transformAmount ?? 2; // default 2px
        const pbTransitionDuration = pbs.transitionDuration ?? 0.3; // default 0.3s

        // Secondary button styles
        const sbs = hc.secondaryButtonStyle || {};
        const sbBgColor = sbs.bgColor || "transparent";
        const sbTextColor = sbs.textColor || "#2563eb";
        const sbBorderColor = sbs.borderColor || "#2563eb";
        const sbHoverBgColor = sbs.hoverBgColor || "#2563eb";
        const sbHoverTextColor = sbs.hoverTextColor || "#ffffff";
        const sbBorderRadius = sbs.borderRadius || "0.375rem";
        const sbVariant = sbs.variant || "outline";
        const sbEnableAnimation = sbs.enableAnimation !== false; // default true
        const sbTransformAmount = sbs.transformAmount ?? 2; // default 2px
        const sbTransitionDuration = sbs.transitionDuration ?? 0.3; // default 0.3s

        // Shadow helper
        const getShadowValue = (
          shadow: string,
          color: string = "37,99,235"
        ) => {
          switch (shadow) {
            case "none":
              return "none";
            case "sm":
              return `0 2px 8px rgba(${color},0.2)`;
            case "md":
              return `0 4px 15px rgba(${color},0.3)`;
            case "lg":
              return `0 8px 25px rgba(${color},0.35)`;
            case "xl":
              return `0 12px 35px rgba(${color},0.4)`;
            default:
              return `0 4px 15px rgba(${color},0.3)`;
          }
        };

        const getShadowHoverValue = (
          shadow: string,
          color: string = "37,99,235"
        ) => {
          switch (shadow) {
            case "none":
              return "none";
            case "sm":
              return `0 4px 12px rgba(${color},0.25)`;
            case "md":
              return `0 8px 25px rgba(${color},0.4)`;
            case "lg":
              return `0 12px 35px rgba(${color},0.45)`;
            case "xl":
              return `0 16px 45px rgba(${color},0.5)`;
            default:
              return `0 8px 25px rgba(${color},0.4)`;
          }
        };

        // Convert hex to rgb for shadow
        const hexToRgb = (hex: string) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return `${r},${g},${b}`;
        };

        const pbShadowColor = hexToRgb(pbBgColor);
        const pbShadowValue = getShadowValue(pbShadow, pbShadowColor);
        const pbShadowHover = getShadowHoverValue(pbShadow, pbShadowColor);

        // Primary button style generation
        const getPrimaryButtonStyle = () => {
          let style = `padding:0.5rem 1rem;border-radius:${pbBorderRadius};text-decoration:none;font-weight:600;font-size:${pbFontSize};cursor:pointer;display:inline-block;`;
          if (pbEnableAnimation) {
            style += `transition:all ${pbTransitionDuration}s ease;`;
          }

          switch (pbVariant) {
            case "outline":
              style += `background:transparent;color:${pbBgColor};border:2px solid ${pbBgColor};`;
              break;
            case "ghost":
              style += `background:${pbBgColor}15;color:${pbBgColor};border:none;`;
              break;
            case "gradient":
              style += `background:linear-gradient(135deg, ${pbBgColor} 0%, ${pbHoverBgColor} 100%);color:${pbTextColor};border:none;box-shadow:${pbShadowValue};`;
              break;
            default: // solid
              style += `background:${pbBgColor};color:${pbTextColor};border:none;box-shadow:${pbShadowValue};`;
          }
          return style;
        };

        // Secondary button style generation
        const getSecondaryButtonStyle = () => {
          let style = `padding:0.5rem 1rem;border-radius:${sbBorderRadius};text-decoration:none;font-weight:600;font-size:${pbFontSize};cursor:pointer;display:inline-block;`;
          if (sbEnableAnimation) {
            style += `transition:all ${sbTransitionDuration}s ease;`;
          }

          switch (sbVariant) {
            case "solid":
              style += `background:${sbBgColor};color:${sbTextColor};border:none;`;
              break;
            case "ghost":
              style += `background:${sbTextColor}15;color:${sbTextColor};border:none;`;
              break;
            case "text":
              style += `background:transparent;color:${sbTextColor};border:none;text-decoration:underline;`;
              break;
            default: // outline
              style += `background:transparent;color:${sbTextColor};border:2px solid ${sbBorderColor};`;
          }
          return style;
        };

        // Generate hover handlers (Hero section)
        const getPrimaryHoverIn = () => {
          if (!pbEnableAnimation) return "";
          const transform =
            pbTransformAmount > 0
              ? `this.style.transform='translateY(-${pbTransformAmount}px)';`
              : "";
          switch (pbVariant) {
            case "outline":
              return `this.style.background='${pbBgColor}';this.style.color='${pbTextColor}';${transform}`;
            case "ghost":
              return `this.style.background='${pbBgColor}25';${transform}`;
            case "gradient":
              return `${transform}this.style.boxShadow='${pbShadowHover}'`;
            default:
              return `this.style.background='${pbHoverBgColor}';this.style.color='${pbHoverTextColor}';this.style.boxShadow='${pbShadowHover}';${transform}`;
          }
        };

        const getPrimaryHoverOut = () => {
          if (!pbEnableAnimation) return "";
          const transform =
            pbTransformAmount > 0
              ? `this.style.transform='translateY(0)';`
              : "";
          switch (pbVariant) {
            case "outline":
              return `this.style.background='transparent';this.style.color='${pbBgColor}';${transform}`;
            case "ghost":
              return `this.style.background='${pbBgColor}15';${transform}`;
            case "gradient":
              return `${transform}this.style.boxShadow='${pbShadowValue}'`;
            default:
              return `this.style.background='${pbBgColor}';this.style.color='${pbTextColor}';this.style.boxShadow='${pbShadowValue}';${transform}`;
          }
        };

        const getSecondaryHoverIn = () => {
          if (!sbEnableAnimation) return "";
          const transform =
            sbTransformAmount > 0
              ? `this.style.transform='translateY(-${sbTransformAmount}px)';`
              : "";
          switch (sbVariant) {
            case "solid":
              return `this.style.background='${sbHoverBgColor}';this.style.color='${sbHoverTextColor}';${transform}`;
            case "ghost":
              return `this.style.background='${sbTextColor}25';${transform}`;
            case "text":
              return `this.style.color='${sbHoverBgColor}';${transform}`;
            default:
              return `this.style.background='${sbHoverBgColor}';this.style.color='${sbHoverTextColor}';this.style.borderColor='${sbHoverBgColor}';${transform}`;
          }
        };

        const getSecondaryHoverOut = () => {
          if (!sbEnableAnimation) return "";
          const transform =
            sbTransformAmount > 0
              ? `this.style.transform='translateY(0)';`
              : "";
          switch (sbVariant) {
            case "solid":
              return `this.style.background='${sbBgColor}';this.style.color='${sbTextColor}';${transform}`;
            case "ghost":
              return `this.style.background='${sbTextColor}15';${transform}`;
            case "text":
              return `this.style.color='${sbTextColor}';${transform}`;
            default:
              return `this.style.background='transparent';this.style.color='${sbTextColor}';this.style.borderColor='${sbBorderColor}';${transform}`;
          }
        };

        const primaryBtnHtml = `<a href="${
          hc.primaryCtaUrl || "#"
        }" style="${getPrimaryButtonStyle()}"${
          pbEnableAnimation
            ? ` onmouseover="${getPrimaryHoverIn()}" onmouseout="${getPrimaryHoverOut()}"`
            : ""
        }>${hc.primaryCta}</a>`;
        const secondaryBtnHtml = hc.secondaryCta
          ? `<a href="${
              hc.secondaryCtaUrl || "#"
            }" style="${getSecondaryButtonStyle()}"${
              sbEnableAnimation
                ? ` onmouseover="${getSecondaryHoverIn()}" onmouseout="${getSecondaryHoverOut()}"`
                : ""
            }>${hc.secondaryCta}</a>`
          : "";

        // Variant 2 & 3: Image + text layout
        if (variant === 2 || variant === 3) {
          const imageLeft = variant === 2;
          const bgColor = hc.backgroundColor || "#ffffff";
          const textColor = hc.textColor || "#111827";
          const imgHtml =
            hc.sideImage && String(hc.sideImage).length > 0
              ? `<img src="${hc.sideImage}" alt="side" style="width:100%;height:100%;object-fit:cover;border-radius:0.75rem;"/>`
              : `<div style="width:100%;height:320px;background:#e5e7eb;display:flex;align-items:center;justify-content:center;border-radius:0.75rem;color:#6b7280;">No image</div>`;
          const textContent = `<div class="hero-text-col" style="display:flex;flex-direction:column;justify-content:center;align-items:flex-start;text-align:left;"><h1 style="font-size:2.5rem;font-weight:700;margin-bottom:1rem;line-height:1.2;color:${textColor};">${
            hc.headline
          }</h1>${
            hc.subheading
              ? `<p style="font-size:1.125rem;margin-bottom:1.5rem;line-height:1.6;color:${textColor};opacity:0.8;">${hc.subheading}</p>`
              : ""
          }<div class="hero-btn-row" style="display:flex;gap:0.75rem;flex-wrap:wrap;justify-content:flex-start;">${primaryBtnHtml}${secondaryBtnHtml}</div></div>`;
          return `<section class="hero hero-section" style="padding:4rem 2rem;background-color:${bgColor};"><div class="hero-grid" style="max-width:72rem;margin:0 auto;display:flex;flex-direction:column;gap:1rem;">${
            imageLeft
              ? `<div class="hero-img" style="aspect-ratio:4/3;">${imgHtml}</div><div>${textContent}</div>`
              : `<div class="hero-img" style="aspect-ratio:4/3;">${imgHtml}</div><div>${textContent}</div>`
          }</div></section>`;
        }

        // Variant 4: Full background image with overlay
        if (variant === 4) {
          const bgColor = hc.backgroundColor || "rgba(0,0,0,0.5)";
          const textColor = hc.textColor || "#ffffff";
          const bgImageStyle = hc.backgroundImage
            ? `background-image:linear-gradient(${bgColor}, ${bgColor}),url('${hc.backgroundImage}');background-size:cover;background-position:center;`
            : `background-color:${bgColor};`;

          const v4PrimaryStyle = `padding:0.875rem 2rem;border-radius:${pbBorderRadius};text-decoration:none;font-weight:600;font-size:${pbFontSize};transition:all ${pbTransitionDuration}s ease;cursor:pointer;display:inline-block;background:${pbBgColor};color:${pbTextColor};border:none;box-shadow:${pbShadowValue};`;
          const v4SecondaryStyle = `padding:0.875rem 2rem;border-radius:${sbBorderRadius};text-decoration:none;font-weight:600;font-size:${pbFontSize};transition:all ${sbTransitionDuration}s ease;cursor:pointer;display:inline-block;border:2px solid ${textColor};color:${textColor};background:transparent;`;
          const v4PrimaryTransformIn =
            pbTransformAmount > 0
              ? `this.style.transform='translateY(-${pbTransformAmount}px)';`
              : "";
          const v4PrimaryTransformOut =
            pbTransformAmount > 0
              ? `this.style.transform='translateY(0)';`
              : "";
          const v4SecondaryTransformIn =
            sbTransformAmount > 0
              ? `this.style.transform='translateY(-${sbTransformAmount}px)';`
              : "";
          const v4SecondaryTransformOut =
            sbTransformAmount > 0
              ? `this.style.transform='translateY(0)';`
              : "";

          return (
            `<section class="hero" style="${bgImageStyle}min-height:500px;display:flex;align-items:center;justify-content:center;"><div style="width:100%;max-width:64rem;margin:0 auto;padding:3rem 2rem;text-align:center;"><h1 style="font-size:3rem;font-weight:800;margin-bottom:1rem;line-height:1.2;color:${textColor};text-shadow:0 2px 8px rgba(0,0,0,0.3);">${
              hc.headline
            }</h1><p style="font-size:1.25rem;margin-bottom:2rem;line-height:1.6;color:${textColor};opacity:0.95;text-shadow:0 1px 4px rgba(0,0,0,0.2);">${
              hc.subheading || ""
            }</p><div style="display:flex;justify-content:center;gap:1rem;flex-wrap:wrap;">` +
            `<a href="${
              hc.primaryCtaUrl || "#"
            }" style="${v4PrimaryStyle}" onmouseover="this.style.background='${pbHoverBgColor}';this.style.boxShadow='${pbShadowHover}';${v4PrimaryTransformIn}" onmouseout="this.style.background='${pbBgColor}';this.style.boxShadow='${pbShadowValue}';${v4PrimaryTransformOut}">${
              hc.primaryCta
            }</a>` +
            (hc.secondaryCta
              ? `<a href="${
                  hc.secondaryCtaUrl || "#"
                }" style="${v4SecondaryStyle}" onmouseover="this.style.background='${textColor}';this.style.color='${
                  bgColor.includes("rgba") ? "#000" : bgColor
                }';${v4SecondaryTransformIn}" onmouseout="this.style.background='transparent';this.style.color='${textColor}';${v4SecondaryTransformOut}">${
                  hc.secondaryCta
                }</a>`
              : "") +
            `</div></div></section>`
          );
        }

        // Variant 1: Simple hero with background color/gradient
        const bgColor = hc.backgroundColor || "#ffffff";
        const textColor = hc.textColor || "#111827";
        const bgStyle = hc.backgroundImage
          ? `background-image:url('${hc.backgroundImage}');background-size:cover;background-position:center;background-color:${bgColor};`
          : `background-color:${bgColor};`;
        return `<section class="hero" style="${bgStyle}padding:4rem 2rem;"><div style="max-width:72rem;margin:0 auto;text-align:center;"><h1 style="font-size:2.5rem;font-weight:700;margin-bottom:0.75rem;line-height:1.2;color:${textColor};">${
          hc.headline
        }</h1><p style="font-size:1.125rem;margin-bottom:1.5rem;line-height:1.6;color:${textColor};opacity:0.8;">${
          hc.subheading || ""
        }</p><div style="display:flex;justify-content:center;gap:0.75rem;flex-wrap:wrap;">${primaryBtnHtml}${secondaryBtnHtml}</div></div></section>`;
      }
      case "cards": {
        const f = getFeaturesContent(s);
        const cols = Math.min(3, f.columnsPerRow || 3);
        const gridClass =
          cols === 2
            ? "grid-cols-2"
            : cols === 1
            ? "grid-cols-1"
            : "grid-cols-3";
        const variant = f.variant || 2;
        const cardStyle = f.cardStyle || "shadow";

        // Get custom CSS values with defaults
        const css = f.cardCssCustom || {};
        const textColor = css.textColor;
        const hoverTextColor = css.hoverTextColor;
        const bgColor = css.backgroundColor;
        const hoverBgColor = css.hoverBackgroundColor;
        const borderColor = css.borderColor;
        const borderWidth = css.borderWidth;
        const borderRadius = css.borderRadius;
        const shadowColor = css.shadowColor;
        const shadowBlur = css.shadowBlur;
        const shadowSpread = css.shadowSpread;
        const shadowOffsetX = css.shadowOffsetX;
        const shadowOffsetY = css.shadowOffsetY;
        const transitionDuration = css.transitionDuration;
        const hoverTransform = css.hoverTransform;
        const padding = css.padding;
        const gradientStart = css.gradientStart;
        const gradientEnd = css.gradientEnd;
        const gradientAngle = css.gradientAngle;

        // Helper function to convert hex to rgba
        const hexToRgba = (hex: string, alpha: number = 0.15) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return `rgba(${r},${g},${b},${alpha})`;
        };

        // Check if any custom styles are applied
        const hasCustomStyles =
          textColor ||
          hoverTextColor ||
          bgColor ||
          hoverBgColor ||
          (gradientStart && gradientEnd) ||
          borderColor ||
          shadowColor ||
          borderRadius ||
          padding;

        // Build inline style only for customized properties (when user has set them)
        // This allows CSS classes to control base styling
        let cardInlineStyle = "";
        let cardHoverStyle = "";

        // Set text color with default for custom styled cards
        if (textColor) {
          cardInlineStyle += `color:${textColor}!important;`;
        } else if (hasCustomStyles) {
          cardInlineStyle += `color:#1f2937!important;`;
        }

        // Only apply gradient if BOTH start and end colors are explicitly set
        if (gradientStart && gradientEnd) {
          cardInlineStyle += `background: linear-gradient(${
            gradientAngle || "135deg"
          }, ${gradientStart} 0%, ${gradientEnd} 100%)!important;`;
          cardHoverStyle += `background: linear-gradient(${
            gradientAngle || "135deg"
          }, ${gradientStart} 0%, ${gradientEnd} 100%)!important;`;
        } else if (bgColor || hoverBgColor) {
          if (bgColor)
            cardInlineStyle += `background-color:${bgColor}!important;`;
          if (hoverBgColor)
            cardHoverStyle += `background-color:${hoverBgColor}!important;`;
        }
        if (borderColor)
          cardInlineStyle += `border-color:${borderColor}!important;`;
        if (borderWidth)
          cardInlineStyle += `border-width:${borderWidth}!important;`;
        if (borderRadius)
          cardInlineStyle += `border-radius:${borderRadius}!important;`;
        if (padding) cardInlineStyle += `padding:${padding}!important;`;
        if (transitionDuration)
          cardInlineStyle += `transition:all ${transitionDuration}!important;`;

        // Shadow styling - only add if customized
        if (
          shadowColor ||
          shadowBlur ||
          shadowSpread ||
          shadowOffsetX ||
          shadowOffsetY
        ) {
          const sx = shadowOffsetX || "0px";
          const sy = shadowOffsetY || "2px";
          const sb = shadowBlur || "8px";
          const ss = shadowSpread || "0px";
          const sc = shadowColor
            ? hexToRgba(shadowColor, 0.15)
            : "rgba(0,0,0,0.1)";
          cardInlineStyle += `box-shadow:${sx} ${sy} ${sb} ${ss} ${sc}!important;`;

          const scHover = shadowColor
            ? hexToRgba(shadowColor, 0.25)
            : "rgba(0,0,0,0.15)";
          const sbHover = shadowBlur
            ? `${Number(shadowBlur.replace("px", "")) + 4}px`
            : "12px";
          cardHoverStyle += `box-shadow:${sx} ${sy} ${sbHover} ${ss} ${scHover}!important;`;
        }

        // Don't apply hoverTextColor to card - only title changes (handled via JS on h3)
        if (hoverTransform)
          cardHoverStyle += `transform:${hoverTransform}!important;`;

        let cardHtml = "";
        // Generate unique event handler names to avoid conflicts
        const handlerId = Math.random().toString(36).substr(2, 9);
        const hoverHandler = `(e)=>{e.currentTarget.setAttribute('style','${cardInlineStyle}')}`;
        const outHandler = `(e)=>{e.currentTarget.setAttribute('style','${cardInlineStyle}')}`;

        // Escape single quotes for use in event handlers
        const escapedInlineStyle = cardInlineStyle.replace(/'/g, "\\'");
        const escapedHoverStyle = cardHoverStyle.replace(/'/g, "\\'");

        // Base text color for description (stays same on hover)
        const descTextColor =
          textColor || (hasCustomStyles ? "#1f2937" : "inherit");
        // Title hover color handling
        const titleBaseColor =
          textColor || (hasCustomStyles ? "#1f2937" : "inherit");
        const titleHoverColor = hoverTextColor || titleBaseColor;

        // Helper to wrap card in link if link is provided
        const wrapInLink = (cardContent: string, link?: string) => {
          if (link) {
            const isExternal = link.startsWith("http");
            const target = isExternal
              ? ' target="_blank" rel="noopener noreferrer"'
              : "";
            return `<a href="${link}" style="text-decoration:none;color:inherit;display:block"${target}>${cardContent}</a>`;
          }
          return cardContent;
        };

        if (variant === 1) {
          // Variant 1: Simple (title + description only)
          cardHtml = ((f.cards || []) as any[])
            .map((it: any) =>
              wrapInLink(
                `<div class="card ${cardStyle}" ${
                  cardInlineStyle ? `style="${cardInlineStyle}"` : ""
                } onmouseover="this.style.cssText='${escapedInlineStyle}${escapedHoverStyle}';this.querySelector('h3').style.color='${titleHoverColor}'" onmouseout="this.style.cssText='${escapedInlineStyle}';this.querySelector('h3').style.color='${titleBaseColor}'"><h3 style="font-weight:600;font-size:1.125rem;color:${titleBaseColor};transition:color 0.3s">${
                  it.title
                }</h3><p style="font-size:0.875rem;color:${descTextColor};opacity:0.85">${
                  it.description || ""
                }</p></div>`,
                it.link
              )
            )
            .join("");
        } else if (variant === 2) {
          // Variant 2: With icon/badge and multiple text fields
          cardHtml = ((f.cards || []) as any[])
            .map((it: any) =>
              wrapInLink(
                `<div class="card ${cardStyle}" ${
                  cardInlineStyle ? `style="${cardInlineStyle}"` : ""
                } onmouseover="this.style.cssText='${escapedInlineStyle}${escapedHoverStyle}';this.querySelector('h3').style.color='${titleHoverColor}'" onmouseout="this.style.cssText='${escapedInlineStyle}';this.querySelector('h3').style.color='${titleBaseColor}'"><div style="margin-bottom:12px">${
                  it.icon && String(it.icon).length > 0
                    ? `<span style="font-size:1.875rem">${it.icon}</span>`
                    : it.badge
                    ? `<span style="display:inline-block;padding:4px 8px;background:#667eea;color:#fff;font-size:0.75rem;border-radius:4px">${it.badge}</span>`
                    : ""
                }</div><h3 style="font-weight:600;font-size:1.125rem;color:${titleBaseColor};transition:color 0.3s">${
                  it.title
                }</h3>${
                  it.subtitle
                    ? `<p style="font-size:0.75rem;margin-bottom:8px;color:${descTextColor};opacity:0.7">${it.subtitle}</p>`
                    : ""
                }<p style="font-size:0.875rem;color:${descTextColor};opacity:0.85">${
                  it.description || ""
                }</p></div>`,
                it.link
              )
            )
            .join("");
        } else if (variant === 3) {
          // Variant 3: With images
          cardHtml = ((f.cards || []) as any[])
            .map((it: any) =>
              wrapInLink(
                `<div class="card ${cardStyle}" ${
                  cardInlineStyle ? `style="${cardInlineStyle}"` : ""
                } onmouseover="this.style.cssText='${escapedInlineStyle}${escapedHoverStyle}';this.querySelector('h3').style.color='${titleHoverColor}'" onmouseout="this.style.cssText='${escapedInlineStyle}';this.querySelector('h3').style.color='${titleBaseColor}'"><div style="overflow:hidden;height:160px;margin-bottom:12px;border-radius:${borderRadius}">${
                  it.image && String(it.image).length > 0
                    ? `<img src="${it.image}" alt="${
                        it.title || ""
                      }" style="width:100%;height:100%;object-fit:cover"/>`
                    : `<div style="width:100%;height:100%;background:#ddd;display:flex;align-items:center;justify-content:center;color:#666">No image</div>`
                }</div><h3 style="font-weight:600;font-size:1.125rem;color:${titleBaseColor};transition:color 0.3s">${
                  it.title
                }</h3><p style="font-size:0.875rem;color:${descTextColor};opacity:0.85">${
                  it.description || ""
                }</p></div>`,
                it.link
              )
            )
            .join("");
        }

        return `<section class="cards p-8"><div class="max-w-6xl mx-auto"><h2 class="text-2xl font-bold mb-4">${
          f.sectionTitle || "Features"
        }</h2><div class="grid ${gridClass} gap-6">${cardHtml}</div></div></section>`;
      }
      case "carousel": {
        const carouselVariant = s.props?.variant || 1;
        const items = (s.props?.items || []) as any[];
        const autoScroll = s.props?.autoScroll || false;
        const carouselId = `carousel-${s.id}`;

        // Variant 2: Show ONE item at a time with dot navigation
        if (carouselVariant === 2) {
          return `<section class="carousel p-8"><div class="max-w-6xl mx-auto">
            <h2 class="text-2xl font-bold mb-4">${
              s.title || "Testimonials"
            }</h2>
            <div id="${carouselId}" class="relative" style="position:relative;display:inline-block;width:100%">
              <div class="carousel-display" style="position:relative;background-image:url('${
                items[0]?.backgroundImage || ""
              }');background-size:cover;background-position:center">
                ${items
                  .map(
                    (it: any, idx: number) => `
                  <div class="carousel-item" style="display:${
                    idx === 0 ? "flex" : "none"
                  };flex-direction:column;justify-content:flex-end;background-image:url('${
                      it.backgroundImage || ""
                    }');background-size:cover;background-position:center;position:absolute;top:0;left:0;right:0;bottom:0" data-index="${idx}">
                    <div class="absolute inset-0 bg-black opacity-40" style="z-index:1"></div>
                    <div style="background:rgba(0,0,0,0.7);padding:1.5rem;position:relative;z-index:2;color:#fff">
                      <div style="color:#fbbf24;margin-bottom:0.5rem;font-size:1.2rem">${"★".repeat(
                        it.stars || 5
                      )}</div>
                      <p style="font-size:1rem;color:#fff;margin-bottom:0.5rem;font-style:italic">"${
                        it.text || ""
                      }"</p>
                      <p style="font-size:0.875rem;color:#e5e7eb">— ${
                        it.author || "Anonymous"
                      }</p>
                    </div>
                  </div>
                `
                  )
                  .join("")}
              </div>
              <div style="position:absolute;bottom:1rem;left:50%;transform:translateX(-50%);display:flex;justify-content:center;gap:0.5rem;z-index:10">
                ${items
                  .map(
                    (it: any, idx: number) => `
                  <button data-index="${idx}" style="${
                      idx === 0 ? "background:#667eea" : "background:#ccc"
                    }" onclick="
                    const carousel = document.getElementById('${carouselId}');
                    carousel.setAttribute('data-index', '${idx}');
                    carousel.querySelectorAll('.carousel-item').forEach(el => el.style.display = 'none');
                    const items = carousel.querySelectorAll('.carousel-item');
                    items.forEach((el, i) => { if (i === ${idx}) el.style.display = 'flex'; });
                    carousel.querySelectorAll('button').forEach((b, i) => b.style.background = i === ${idx} ? '#667eea' : '#ccc');
                  "></button>
                `
                  )
                  .join("")}
              </div>
            </div>
          </div></section>
          ${
            autoScroll
              ? `<script>
            (function() {
              const carousel = document.getElementById('${carouselId}');
              if (!carousel) return;
              let currentIndex = 0;
              const items = ${items.length};
              setInterval(() => {
                currentIndex = (currentIndex + 1) % items;
                const buttons = carousel.querySelectorAll('button');
                const carouselItems = carousel.querySelectorAll('.carousel-item');
                carouselItems.forEach(el => el.style.display = 'none');
                carouselItems[currentIndex].style.display = 'flex';
                buttons.forEach((b, i) => b.style.background = i === currentIndex ? '#667eea' : '#ccc');
              }, 4000);
            })();
          </script>`
              : ""
          }`;
        }

        // Variant 3: Typed Image Carousel with type filter, navigation, and auto-scroll
        if (carouselVariant === 3) {
          const types = Array.from(
            new Set(items.map((it: any) => it.type || "default"))
          );
          return `<section class="carousel p-8"><div class="max-w-6xl mx-auto">
            <h2 class="text-2xl font-bold mb-4">${s.title || "Gallery"}</h2>
            <div id="${carouselId}" data-current="0">
              <div class="carousel-display" style="position:relative;margin-bottom:1rem;height:280px;border-radius:0.5rem;overflow:hidden">
                ${items
                  .map(
                    (it: any, idx: number) => `
                  <img src="${
                    it.image ||
                    "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22400%22 height=%22280%22/%3E%3C/svg%3E"
                  }" alt="" class="carousel-item" style="display:${
                      idx === 0 ? "block" : "none"
                    };width:100%;height:100%;object-fit:cover" data-index="${idx}" data-type="${
                      it.type || "default"
                    }"/>
                `
                  )
                  .join("")}
                <!-- Navigation arrows -->
                <button class="carousel-prev" style="position:absolute;left:0.5rem;top:50%;transform:translateY(-50%);width:2.5rem;height:2.5rem;background:rgba(0,0,0,0.5);color:#fff;border:none;border-radius:50%;cursor:pointer;font-size:1.5rem;display:flex;align-items:center;justify-content:center" onclick="
                  const carousel = document.getElementById('${carouselId}');
                  const items = carousel.querySelectorAll('.carousel-item');
                  let current = parseInt(carousel.dataset.current || 0);
                  items[current].style.display = 'none';
                  current = (current - 1 + items.length) % items.length;
                  items[current].style.display = 'block';
                  carousel.dataset.current = current;
                  carousel.querySelectorAll('.dot-nav button').forEach((b,i) => b.style.background = i === current ? '#667eea' : '#ccc');
                ">‹</button>
                <button class="carousel-next" style="position:absolute;right:0.5rem;top:50%;transform:translateY(-50%);width:2.5rem;height:2.5rem;background:rgba(0,0,0,0.5);color:#fff;border:none;border-radius:50%;cursor:pointer;font-size:1.5rem;display:flex;align-items:center;justify-content:center" onclick="
                  const carousel = document.getElementById('${carouselId}');
                  const items = carousel.querySelectorAll('.carousel-item');
                  let current = parseInt(carousel.dataset.current || 0);
                  items[current].style.display = 'none';
                  current = (current + 1) % items.length;
                  items[current].style.display = 'block';
                  carousel.dataset.current = current;
                  carousel.querySelectorAll('.dot-nav button').forEach((b,i) => b.style.background = i === current ? '#667eea' : '#ccc');
                ">›</button>
              </div>
              <!-- Dot navigation -->
              <div class="dot-nav" style="display:flex;gap:0.25rem;justify-content:center;margin-bottom:0.75rem">
                ${items
                  .map(
                    (it: any, idx: number) => `
                  <button style="width:0.5rem;height:0.5rem;border-radius:50%;border:none;cursor:pointer;background:${
                    idx === 0 ? "#667eea" : "#ccc"
                  }" onclick="
                    const carousel = document.getElementById('${carouselId}');
                    const items = carousel.querySelectorAll('.carousel-item');
                    items.forEach(el => el.style.display = 'none');
                    items[${idx}].style.display = 'block';
                    carousel.dataset.current = ${idx};
                    carousel.querySelectorAll('.dot-nav button').forEach((b,i) => b.style.background = i === ${idx} ? '#667eea' : '#ccc');
                  "></button>
                `
                  )
                  .join("")}
              </div>
              <!-- Category filter buttons -->
              <div style="display:flex;gap:0.5rem;justify-content:center;flex-wrap:wrap">
                ${types
                  .map(
                    (type: any) => `
                  <button data-type="${type}" style="padding:0.5rem 1rem;border:1px solid #667eea;background:${
                      type === types[0] ? "#667eea" : "#fff"
                    };color:${
                      type === types[0] ? "#fff" : "#667eea"
                    };border-radius:0.375rem;cursor:pointer;transition:all 0.3s;font-weight:500" onclick="
                    const carousel = document.getElementById('${carouselId}');
                    const allItems = carousel.querySelectorAll('.carousel-item');
                    const firstItem = Array.from(allItems).find(el => el.getAttribute('data-type') === '${type}');
                    if (!firstItem) return;
                    const idx = Array.from(allItems).indexOf(firstItem);
                    allItems.forEach(el => el.style.display = 'none');
                    allItems[idx].style.display = 'block';
                    carousel.dataset.current = idx;
                    carousel.querySelectorAll('.dot-nav button').forEach((b,i) => b.style.background = i === idx ? '#667eea' : '#ccc');
                    carousel.querySelectorAll('[data-type]').forEach(b => {
                      b.style.background = b.getAttribute('data-type') === '${type}' ? '#667eea' : '#fff';
                      b.style.color = b.getAttribute('data-type') === '${type}' ? '#fff' : '#667eea';
                    });
                  ">${type}</button>
                `
                  )
                  .join("")}
              </div>
            </div>
          </div></section>
          ${
            autoScroll
              ? `<script>
            (function() {
              const carousel = document.getElementById('${carouselId}');
              if (!carousel) return;
              const items = carousel.querySelectorAll('.carousel-item');
              setInterval(() => {
                let current = parseInt(carousel.dataset.current || 0);
                items[current].style.display = 'none';
                current = (current + 1) % items.length;
                items[current].style.display = 'block';
                carousel.dataset.current = current;
                carousel.querySelectorAll('.dot-nav button').forEach((b,i) => b.style.background = i === current ? '#667eea' : '#ccc');
              }, 4000);
            })();
          </script>`
              : ""
          }`;
        }

        if (carouselVariant === 4) {
          const totalPages = Math.ceil(items.length / 3);
          return `<section class="carousel p-8"><div class="max-w-6xl mx-auto">
            <h2 class="text-2xl font-bold mb-4">${
              s.title || "Featured Items"
            }</h2>
            <div id="${carouselId}" data-page="0" data-total="${totalPages}" style="position:relative;padding:0 3rem">
              <!-- Navigation arrows -->
              ${
                totalPages > 1
                  ? `
              <button class="carousel-prev" style="position:absolute;left:0;top:50%;transform:translateY(-50%);width:2.5rem;height:2.5rem;background:linear-gradient(135deg,#667eea 0%,#5a67d8 100%);color:#fff;border:none;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:10;box-shadow:0 4px 12px rgba(102,126,234,0.4);transition:all 0.3s ease" onmouseover="this.style.transform='translateY(-50%) scale(1.1)';this.style.boxShadow='0 6px 16px rgba(102,126,234,0.5)'" onmouseout="this.style.transform='translateY(-50%)';this.style.boxShadow='0 4px 12px rgba(102,126,234,0.4)'" onclick="
                const carousel = document.getElementById('${carouselId}');
                const track = carousel.querySelector('.carousel-track');
                let current = parseInt(carousel.dataset.page || 0);
                current = (current - 1 + ${totalPages}) % ${totalPages};
                track.style.transform = 'translateX(-' + (current * 100) + '%)';
                carousel.dataset.page = current;
              "><svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' viewBox='0 0 24 24' stroke='currentColor' stroke-width='2.5'><path stroke-linecap='round' stroke-linejoin='round' d='M15 19l-7-7 7-7'/></svg></button>
              <button class="carousel-next" style="position:absolute;right:0;top:50%;transform:translateY(-50%);width:2.5rem;height:2.5rem;background:linear-gradient(135deg,#667eea 0%,#5a67d8 100%);color:#fff;border:none;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:10;box-shadow:0 4px 12px rgba(102,126,234,0.4);transition:all 0.3s ease" onmouseover="this.style.transform='translateY(-50%) scale(1.1)';this.style.boxShadow='0 6px 16px rgba(102,126,234,0.5)'" onmouseout="this.style.transform='translateY(-50%)';this.style.boxShadow='0 4px 12px rgba(102,126,234,0.4)'" onclick="
                const carousel = document.getElementById('${carouselId}');
                const track = carousel.querySelector('.carousel-track');
                let current = parseInt(carousel.dataset.page || 0);
                current = (current + 1) % ${totalPages};
                track.style.transform = 'translateX(-' + (current * 100) + '%)';
                carousel.dataset.page = current;
              "><svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' viewBox='0 0 24 24' stroke='currentColor' stroke-width='2.5'><path stroke-linecap='round' stroke-linejoin='round' d='M9 5l7 7-7 7'/></svg></button>
              `
                  : ""
              }
              
              <!-- Sliding container -->
              <div style="overflow:hidden">
                <div class="carousel-track" style="display:flex;transition:transform 0.5s ease-in-out">
              ${Array.from({ length: totalPages })
                .map((_, pageIdx) => {
                  const pageItems = items.slice(pageIdx * 3, (pageIdx + 1) * 3);
                  return `
                <div class="carousel-page" style="flex-shrink:0;width:100%;display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem">
                  ${pageItems
                    .map(
                      (it: any) => `
                    <div style="border:1px solid #e5e7eb;border-radius:0.5rem;overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,0.04);transition:all 0.3s;cursor:pointer" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';this.style.transform='translateY(-2px)'" onmouseout="this.style.boxShadow='0 1px 2px rgba(0,0,0,0.04)';this.style.transform='translateY(0)'">
                      <img src="${
                        it.image ||
                        "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22400%22 height=%22200%22/%3E%3C/svg%3E"
                      }" alt="${
                        it.title || ""
                      }" style="width:100%;height:200px;object-fit:cover;display:block"/>
                      <div style="padding:1rem">
                        <h4 style="font-weight:600;margin:0;margin-bottom:0.5rem">${
                          it.title || "Untitled"
                        }</h4>
                        <p style="font-size:0.875rem;color:#4b5563;margin:0">${
                          it.description || ""
                        }</p>
                      </div>
                    </div>
                  `
                    )
                    .join("")}
                </div>
              `;
                })
                .join("")}
                </div>
              </div>
            </div>
          </div></section>
          ${
            autoScroll && totalPages > 1
              ? `<script>
            (function() {
              const carousel = document.getElementById('${carouselId}');
              if (!carousel) return;
              const track = carousel.querySelector('.carousel-track');
              const totalPages = ${totalPages};
              setInterval(() => {
                let current = parseInt(carousel.dataset.page || 0);
                current = (current + 1) % totalPages;
                track.style.transform = 'translateX(-' + (current * 100) + '%)';
                carousel.dataset.page = current;
              }, 5000);
            })();
          </script>`
              : ""
          }`;
        }

        // Variant 1: Simple Image Carousel - show ONE item with dot navigation
        return `<section class="carousel p-8"><div class="max-w-6xl mx-auto">
          <h2 class="text-2xl font-bold mb-4">${s.title || "Carousel"}</h2>
          <div id="${carouselId}" class="relative" style="position:relative;width:100%">
            <div class="carousel-display">
              ${items
                .map(
                  (it: any, idx: number) => `
                <img src="${
                  it.image ||
                  "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22400%22 height=%22280%22/%3E%3C/svg%3E"
                }" alt="${
                    it.title || "slide-" + idx
                  }" class="carousel-item" style="display:${
                    idx === 0 ? "block" : "none"
                  }" data-index="${idx}"/>
              `
                )
                .join("")}
            </div>
            ${
              items.length > 1
                ? `
            <div style="position:absolute;bottom:1rem;left:50%;transform:translateX(-50%);display:flex;justify-content:center;gap:0.5rem;z-index:10">
              ${items
                .map(
                  (it: any, idx: number) => `
                <button data-index="${idx}" style="${
                    idx === 0 ? "background:#667eea" : "background:#ccc"
                  }" onclick="
                  const carousel = document.getElementById('${carouselId}');
                  carousel.setAttribute('data-index', '${idx}');
                  carousel.querySelectorAll('.carousel-item').forEach(el => el.style.display = 'none');
                  const items = carousel.querySelectorAll('.carousel-item');
                  items.forEach((el, i) => { if (i === ${idx}) el.style.display = 'block'; });
                  carousel.querySelectorAll('button').forEach((b, i) => b.style.background = i === ${idx} ? '#667eea' : '#ccc');
                "></button>
              `
                )
                .join("")}
            </div>
            `
                : ""
            }
          </div>
        </div></section>
        ${
          autoScroll && items.length > 1
            ? `<script>
          (function() {
            const carousel = document.getElementById('${carouselId}');
            if (!carousel) return;
            let currentIndex = 0;
            const items = ${items.length};
            setInterval(() => {
              currentIndex = (currentIndex + 1) % items;
              const buttons = carousel.querySelectorAll('button');
              const carouselItems = carousel.querySelectorAll('.carousel-item');
              carouselItems.forEach(el => el.style.display = 'none');
              carouselItems[currentIndex].style.display = 'block';
              buttons.forEach((b, i) => b.style.background = i === currentIndex ? '#667eea' : '#ccc');
            }, 4000);
          })();
        </script>`
            : ""
        }`;
      }
      case "imagetextblock": {
        const b = getTextImageBlock(s);
        const imageHtml = b.image?.url
          ? `<img src="${b.image.url}" alt="${
              b.image.alt || ""
            }" class="w-full h-auto max-h-80 object-cover rounded"/>`
          : "";

        const contentInner = `<h2 class="text-2xl font-bold mb-3" style="color:${
          b.styles?.textColor || "#111827"
        }">${b.text.heading || ""}</h2>${
          b.text.subheading
            ? `<h3 class="text-lg font-semibold mb-3" style="color:${
                b.styles?.textColor || "#111827"
              }">${b.text.subheading}</h3>`
            : ""
        }<p class="text-sm leading-relaxed mb-5" style="color:${
          b.styles?.textColor || "#374151"
        }">${b.text.description || ""}</p>${
          b.text.buttonText
            ? (() => {
                // Button styling for imagetextblock
                const bs = b.buttonStyle || {};
                const btnBgColor = bs.bgColor || "#2563eb";
                const btnTextColor = bs.textColor || "#ffffff";
                const btnHoverBgColor = bs.hoverBgColor || "#1d4ed8";
                const btnBorderRadius = bs.borderRadius || "0.375rem";
                const btnVariant = bs.variant || "solid";
                const btnShadow = bs.shadow || "md";
                const btnEnableAnimation = bs.enableAnimation !== false;
                const btnTransformAmount = bs.transformAmount ?? 2;
                const btnTransitionDuration = bs.transitionDuration ?? 0.3;

                const hexToRgb = (hex: string) => {
                  const r = parseInt(hex.slice(1, 3), 16);
                  const g = parseInt(hex.slice(3, 5), 16);
                  const b = parseInt(hex.slice(5, 7), 16);
                  return `${r},${g},${b}`;
                };

                const getShadowValue = (shadow: string, color: string) => {
                  switch (shadow) {
                    case "none":
                      return "none";
                    case "sm":
                      return `0 2px 8px rgba(${color},0.2)`;
                    case "md":
                      return `0 4px 15px rgba(${color},0.3)`;
                    case "lg":
                      return `0 8px 25px rgba(${color},0.35)`;
                    case "xl":
                      return `0 12px 35px rgba(${color},0.4)`;
                    default:
                      return `0 4px 15px rgba(${color},0.3)`;
                  }
                };

                const shadowColor = hexToRgb(btnBgColor);
                const shadowValue = getShadowValue(btnShadow, shadowColor);
                const shadowHover = getShadowValue(
                  btnShadow === "none"
                    ? "none"
                    : btnShadow === "sm"
                    ? "md"
                    : btnShadow === "md"
                    ? "lg"
                    : "xl",
                  shadowColor
                );

                let btnStyle = `display:inline-block;width:fit-content;padding:0.5rem 1rem;border-radius:${btnBorderRadius};font-weight:600;cursor:pointer;text-decoration:none;white-space:nowrap;`;
                if (btnEnableAnimation) {
                  btnStyle += `transition:all ${btnTransitionDuration}s ease;`;
                }

                switch (btnVariant) {
                  case "outline":
                    btnStyle += `background:transparent;color:${btnBgColor};border:2px solid ${btnBgColor};`;
                    break;
                  case "ghost":
                    btnStyle += `background:${btnBgColor}15;color:${btnBgColor};border:none;`;
                    break;
                  case "gradient":
                    btnStyle += `background:linear-gradient(135deg, ${btnBgColor} 0%, ${btnHoverBgColor} 100%);color:${btnTextColor};border:none;box-shadow:${shadowValue};`;
                    break;
                  default: // solid
                    btnStyle += `background:${btnBgColor};color:${btnTextColor};border:none;box-shadow:${shadowValue};`;
                }

                const getHoverIn = () => {
                  if (!btnEnableAnimation) return "";
                  const transform =
                    btnTransformAmount > 0
                      ? `this.style.transform='translateY(-${btnTransformAmount}px)';`
                      : "";
                  switch (btnVariant) {
                    case "outline":
                      return `this.style.background='${btnBgColor}';this.style.color='${btnTextColor}';${transform}`;
                    case "ghost":
                      return `this.style.background='${btnBgColor}25';${transform}`;
                    default:
                      return `this.style.background='${btnHoverBgColor}';this.style.boxShadow='${shadowHover}';${transform}`;
                  }
                };

                const getHoverOut = () => {
                  if (!btnEnableAnimation) return "";
                  const transform =
                    btnTransformAmount > 0
                      ? `this.style.transform='translateY(0)';`
                      : "";
                  switch (btnVariant) {
                    case "outline":
                      return `this.style.background='transparent';this.style.color='${btnBgColor}';${transform}`;
                    case "ghost":
                      return `this.style.background='${btnBgColor}15';${transform}`;
                    default:
                      return `this.style.background='${btnBgColor}';this.style.boxShadow='${shadowValue}';${transform}`;
                  }
                };

                const hoverAttrs = btnEnableAnimation
                  ? ` onmouseover="${getHoverIn()}" onmouseout="${getHoverOut()}"`
                  : "";

                return `<a href="${
                  b.text.buttonUrl || "#"
                }" style="${btnStyle}"${hoverAttrs}>${b.text.buttonText}</a>`;
              })()
            : ""
        }`;

        // Content HTML for left/right layouts (not centered)
        const contentHtml = `<div class="content flex flex-col justify-center">${contentInner}</div>`;

        // Content HTML for top/bottom layouts (centered)
        const contentHtmlCentered = `<div class="content flex flex-col justify-center items-center text-center">${contentInner}</div>`;

        let layoutHtml = "";
        switch (b.layout) {
          case "text-left":
            layoutHtml = `<div class="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 items-center"><div class="w-full flex flex-col justify-center" style="flex:0 0 55%">${contentHtml}</div><div class="img w-full flex justify-center" style="flex:0 0 45%">${imageHtml}</div></div>`;
            break;
          case "text-right":
            layoutHtml = `<div class="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 items-center"><div class="img w-full flex justify-center" style="flex:0 0 45%">${imageHtml}</div><div class="w-full flex flex-col justify-center" style="flex:0 0 55%;margin-left:1.5rem">${contentHtml}</div></div>`;
            break;
          case "text-top":
            layoutHtml = `<div class="max-w-6xl mx-auto"><div class="w-full text-center mb-6" style="margin-bottom:1.5rem">${contentHtmlCentered}</div><div class="img w-full flex justify-center">${imageHtml}</div></div>`;
            break;
          case "text-bottom":
            layoutHtml = `<div class="max-w-6xl mx-auto"><div class="img w-full flex justify-center" style="margin-bottom:1.5rem">${imageHtml}</div><div class="w-full text-center">${contentHtmlCentered}</div></div>`;
            break;
          case "text-full":
            layoutHtml = `<div class="max-w-6xl mx-auto"><div class="w-full mb-6" style="margin-bottom:1.5rem">${contentHtml}</div><div class="img w-full flex justify-center">${imageHtml}</div></div>`;
            break;
          default:
            layoutHtml = `<div class="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center"><div class="img max-w-xs flex justify-center">${imageHtml}</div><div class="flex justify-center">${contentHtml}</div></div>`;
        }

        return `<section class="imagetextblock px-6 py-12" style="background-color:${
          b.styles?.backgroundColor || "#ffffff"
        };border-radius:${b.styles?.borderRadius || "0.5rem"};padding:${
          b.styles?.padding || "2rem"
        }">${layoutHtml}</section>`;
      }
      case "testimonials": {
        const testimonialStyle = s.props?.style || "shadow";
        const testimonialVariant = Number(s.props?.variant) || 1;

        // Custom CSS colors
        const sectionBgColor = (s.props?.sectionBgColor as string) || "#ffffff";
        const cardBgColor = (s.props?.cardBgColor as string) || "#ffffff";
        const textColor = (s.props?.textColor as string) || "#374151";
        const titleColor = (s.props?.titleColor as string) || "#111827";
        const accentColor = (s.props?.accentColor as string) || "#667eea";
        const companyColor = (s.props?.companyColor as string) || "#667eea";

        // Animation options
        const hoverAnimation = (s.props?.hoverAnimation as string) || "lift";
        const transitionSpeed = (s.props?.transitionSpeed as string) || "0.3s";
        const transitionEasing =
          (s.props?.transitionEasing as string) || "ease";
        const hoverBgColor = (s.props?.hoverBgColor as string) || accentColor;
        const hoverTextColor = (s.props?.hoverTextColor as string) || "#ffffff";
        const shadowIntensity =
          (s.props?.shadowIntensity as string) || "medium";

        // Generate unique ID for this section's styles
        const sectionId = `testimonials-${s.id.replace(/[^a-zA-Z0-9]/g, "")}`;

        // Shadow values based on intensity
        const getShadow = () => {
          switch (shadowIntensity) {
            case "none":
              return "none";
            case "light":
              return "0 2px 8px rgba(0,0,0,0.06)";
            case "heavy":
              return "0 8px 30px rgba(0,0,0,0.15)";
            default:
              return "0 4px 12px rgba(0,0,0,0.1)";
          }
        };

        const getHoverShadow = () => {
          switch (shadowIntensity) {
            case "none":
              return "none";
            case "light":
              return "0 4px 12px rgba(0,0,0,0.1)";
            case "heavy":
              return "0 12px 40px rgba(0,0,0,0.2)";
            default:
              return "0 8px 24px rgba(0,0,0,0.15)";
          }
        };

        // Generate hover transform based on animation type
        const getHoverTransform = () => {
          switch (hoverAnimation) {
            case "none":
              return "";
            case "lift":
              return "transform:translateY(-6px);";
            case "scale":
              return "transform:scale(1.03);";
            case "slideRight":
              return "transform:translateX(8px);";
            case "glow":
              return `box-shadow:0 0 20px ${hoverBgColor}40;`;
            case "borderGrow":
              return `border-width:3px;border-color:${hoverBgColor};`;
            case "fillColor":
              return `background:${hoverBgColor} !important;`;
            default:
              return "transform:translateY(-6px);";
          }
        };

        // GFG-style carousel variant
        if (testimonialVariant === 4) {
          const hoverStyles = `<style>
            .${sectionId}-card{transition:all ${transitionSpeed} ${transitionEasing};box-shadow:${getShadow()}}
            .${sectionId}-card:hover{${getHoverTransform()}box-shadow:${getHoverShadow()}}
            ${
              hoverAnimation === "fillColor"
                ? `.${sectionId}-card:hover p,.${sectionId}-card:hover .author-name{color:${hoverTextColor} !important}`
                : ""
            }
          </style>`;
          const cardsHtml = ((s.props?.items || []) as Item[])
            .map((t: Item) => {
              const photoHtml = t.photo
                ? `<img src="${t.photo}" alt="${
                    t.author || ""
                  }" style="width:48px;height:48px;border-radius:50%;object-fit:cover;border:2px solid ${accentColor}"/>`
                : `<div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,${accentColor},#764ba2);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;font-size:1.25rem">${(
                    t.author || "A"
                  )
                    .charAt(0)
                    .toUpperCase()}</div>`;
              return `<div class="${sectionId}-card" style="flex:0 0 320px;scroll-snap-align:start;background:${cardBgColor};border-radius:1rem;padding:1.5rem;position:relative">
                <div style="position:absolute;top:1rem;right:1rem;width:40px;height:40px;opacity:0.15"><svg viewBox="0 0 24 24" fill="${accentColor}"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg></div>
                <p style="font-size:0.95rem;line-height:1.6;color:${textColor};margin-bottom:1rem;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden">${
                t.quote || t.body || ""
              }</p>
                <div style="display:flex;align-items:center;gap:0.75rem;margin-top:auto;padding-top:1rem;border-top:1px solid #e5e7eb">
                  ${photoHtml}
                  <div style="flex:1">
                    <p class="author-name" style="font-weight:600;color:${titleColor};font-size:0.95rem;margin:0">${
                t.author || ""
              }</p>
                    <p style="font-size:0.8rem;color:${companyColor};font-weight:500;margin:0">${
                t.company || (t as any).role || ""
              }</p>
                  </div>
                </div>
              </div>`;
            })
            .join("");
          return `${hoverStyles}<section style="padding:2rem;background:${sectionBgColor}"><div style="max-width:72rem;margin:0 auto"><h2 style="font-size:1.5rem;font-weight:700;margin-bottom:1.5rem;color:${titleColor}">${
            s.title || "Testimonials"
          }</h2><div style="display:flex;gap:1.5rem;overflow-x:auto;scroll-snap-type:x mandatory;padding:1rem 0;scrollbar-width:none">${cardsHtml}</div></div></section>`;
        }

        // Original grid variants with custom colors and hover effects
        const getHoverStyles = () => {
          let hoverEffect = getHoverTransform();

          // Add shadow effect if not "none" animation
          if (hoverAnimation !== "none") {
            hoverEffect += `box-shadow:${getHoverShadow()};`;
          }

          // For fillColor animation, also change text colors
          const textColorChange =
            hoverAnimation === "fillColor"
              ? `.${sectionId}-quote:hover p,.${sectionId}-quote:hover cite{color:${hoverTextColor} !important}`
              : "";

          return `<style>
            .${sectionId}-quote{transition:all ${transitionSpeed} ${transitionEasing};box-shadow:${getShadow()}}
            .${sectionId}-quote:hover{${hoverEffect}}
            ${textColorChange}
          </style>`;
        };

        const getCardStyle = () => {
          if (testimonialStyle === "gradient") {
            return `background:linear-gradient(135deg,${accentColor} 0%,#764ba2 100%);color:#fff;border:none;border-radius:0.5rem;padding:1.5rem`;
          } else if (testimonialStyle === "modern") {
            return `background:${cardBgColor};border:2px solid ${accentColor};border-left:4px solid ${accentColor};border-radius:0.5rem;padding:1.5rem`;
          }
          return `background:${cardBgColor};border:1px solid #e5e7eb;border-left:4px solid ${accentColor};border-radius:0.5rem;padding:1.5rem`;
        };

        const getTextStyle = () => {
          if (testimonialStyle === "gradient") {
            return `color:rgba(255,255,255,0.95)`;
          }
          return `color:${textColor}`;
        };

        const getCiteStyle = () => {
          if (testimonialStyle === "gradient") {
            return `display:block;color:rgba(255,255,255,0.9);font-size:0.875rem;margin-top:0.5rem;font-weight:600;font-style:normal`;
          }
          return `display:block;color:${companyColor};font-size:0.875rem;margin-top:0.5rem;font-weight:600;font-style:normal`;
        };

        return `${getHoverStyles()}<section style="padding:2rem;background:${sectionBgColor}"><div style="max-width:72rem;margin:0 auto"><h2 style="font-size:1.5rem;font-weight:700;margin-bottom:1rem;color:${titleColor}">${
          s.title || "Testimonials"
        }</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem">${(
          (s.props?.items || []) as Item[]
        )
          .map(
            (t: Item) =>
              `<blockquote class="${sectionId}-quote" style="${getCardStyle()}"><p style="${getTextStyle()};margin:0 0 0.5rem 0">${
                t.quote || t.body || ""
              }</p><cite style="${getCiteStyle()}">— ${
                t.author || t.title || ""
              }${t.company ? `, ${t.company}` : ""}</cite></blockquote>`
          )
          .join("")}</div></div></section>`;
      }
      case "blog": {
        const blogContent = getBlogContent(s);
        const styles = blogContent.styles || {};

        // Helper function to parse formatted text: links, highlights, and colored text
        const parseFormattedText = (text: string): string => {
          if (!text) return "";
          return (
            text
              // Parse links [text](url)
              .replace(
                /\[([^\]]+)\]\(([^)]+)\)/g,
                `<a href="$2" target="_blank" rel="noopener noreferrer" style="color:${
                  styles.accentColor || "#2563eb"
                };text-decoration:underline;font-weight:500">$1</a>`
              )
              // Parse highlights with color ==#color|text==
              .replace(
                /==(#[0-9a-fA-F]{3,6})\|([^=]+)==/g,
                `<mark style="background-color:$1;color:#000;padding:0 0.25rem;border-radius:0.125rem">$2</mark>`
              )
              // Parse highlights without color ==text== (default yellow)
              .replace(
                /==([^=|]+)==/g,
                `<mark style="background-color:#fef08a;color:#000;padding:0 0.25rem;border-radius:0.125rem">$1</mark>`
              )
              // Parse colored text {#color|text}
              .replace(
                /\{(#[0-9a-fA-F]{3,6})\|([^}]+)\}/g,
                `<span style="color:$1;font-weight:500">$2</span>`
              )
          );
        };

        // Backward compatibility alias
        const parseMarkdownLinks = parseFormattedText;

        let blocksHtml = "";
        if (blogContent.blocks && blogContent.blocks.length > 0) {
          blocksHtml = blogContent.blocks
            .map((block) => {
              switch (block.type) {
                case "heading":
                  return `<h2 style="font-size:1.875rem;font-weight:700;margin:2rem 0 1rem 0;color:${
                    styles.titleColor || "#111827"
                  };line-height:1.3">${block.content || ""}</h2>`;
                case "subheading":
                  return `<h3 style="font-size:1.5rem;font-weight:600;margin:1.5rem 0 0.75rem 0;color:${
                    styles.titleColor || "#111827"
                  };line-height:1.3">${block.content || ""}</h3>`;
                case "paragraph": {
                  // Parse content with lists and links
                  const parseContentWithLists = (text: string): string => {
                    if (!text) return "";

                    const lines = text.split("\n");
                    let result = "";
                    let currentListType: "bullet" | "number" | "alpha" | null =
                      null;
                    let listItems: string[] = [];

                    const flushList = () => {
                      if (listItems.length > 0) {
                        const tag = currentListType === "bullet" ? "ul" : "ol";
                        const listStyle =
                          currentListType === "number"
                            ? "decimal"
                            : currentListType === "alpha"
                            ? "lower-alpha"
                            : "disc";
                        result += `<${tag} style="margin:1rem 0;padding-left:1.5rem;list-style-type:${listStyle}">`;
                        listItems.forEach((item) => {
                          result += `<li style="margin-bottom:0.5rem">${parseMarkdownLinks(
                            item
                          )}</li>`;
                        });
                        result += `</${tag}>`;
                        listItems = [];
                        currentListType = null;
                      }
                    };

                    lines.forEach((line) => {
                      const trimmedLine = line.trim();

                      // Check for bullet points (• or -)
                      if (
                        trimmedLine.startsWith("• ") ||
                        trimmedLine.startsWith("- ")
                      ) {
                        if (currentListType !== "bullet") {
                          flushList();
                          currentListType = "bullet";
                        }
                        listItems.push(trimmedLine.substring(2));
                      }
                      // Check for numbered list (1. 2. 3. etc)
                      else if (/^\d+\.\s/.test(trimmedLine)) {
                        if (currentListType !== "number") {
                          flushList();
                          currentListType = "number";
                        }
                        listItems.push(trimmedLine.replace(/^\d+\.\s/, ""));
                      }
                      // Check for alphabetical list (a. b. c. etc)
                      else if (/^[a-z]\.\s/i.test(trimmedLine)) {
                        if (currentListType !== "alpha") {
                          flushList();
                          currentListType = "alpha";
                        }
                        listItems.push(trimmedLine.replace(/^[a-z]\.\s/i, ""));
                      }
                      // Regular text
                      else {
                        flushList();
                        if (trimmedLine) {
                          result += `<p style="margin:0 0 0.75rem">${parseMarkdownLinks(
                            trimmedLine
                          )}</p>`;
                        }
                      }
                    });

                    flushList();
                    return result;
                  };

                  return `<div style="font-size:1.0625rem;line-height:1.75;margin:0 0 1.25rem;color:${
                    styles.textColor || "#374151"
                  }">${parseContentWithLists(block.content || "")}</div>`;
                }
                case "image":
                  return `<div style="margin:2rem 0"><img src="${
                    block.images?.[0] || ""
                  }" alt="${
                    block.alt || ""
                  }" style="width:100%;height:auto;max-height:500px;border-radius:0.5rem;box-shadow:0 4px 12px rgba(0,0,0,0.1);object-fit:cover;display:block;margin:0"/></div>`;
                case "image-grid": {
                  const gridImages = (block.images || [])
                    .map(
                      (img) =>
                        `<div><img src="${img}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:0.5rem"/></div>`
                    )
                    .join("");
                  const gridCols =
                    block.images?.length === 1
                      ? "1fr"
                      : block.images?.length === 2
                      ? "1fr 1fr"
                      : "repeat(3,1fr)";
                  return `<div style="display:grid;grid-template-columns:${gridCols};gap:1rem;margin:2rem 0">${gridImages}</div>`;
                }
                case "quote":
                  return `<blockquote style="margin:2rem 0;padding:1.5rem 2rem;border-left:4px solid ${
                    styles.accentColor || "#2563eb"
                  };background:${
                    styles.headerBackground || "#f9fafb"
                  };font-size:1.125rem;font-style:italic;color:${
                    styles.textColor || "#374151"
                  };line-height:1.7;border-radius:0.25rem;box-sizing:border-box">"${
                    block.content || ""
                  }"</blockquote>`;
                case "divider":
                  return `<hr style="margin:2.5rem 0;border:none;border-top:1px solid #e5e7eb;opacity:0.5;padding:0"/>`;
                case "link":
                  return `<p style="font-size:1.125rem;line-height:1.7;margin:1rem 0"><a href="${
                    block.linkUrl || "#"
                  }" target="${block.openInNewTab ? "_blank" : "_self"}" rel="${
                    block.openInNewTab ? "noopener noreferrer" : ""
                  }" style="color:${
                    styles.accentColor || "#2563eb"
                  };text-decoration:underline;font-weight:500">${
                    block.linkText || "Link"
                  }</a></p>`;
                case "list": {
                  const listTag =
                    block.listStyle === "number" || block.listStyle === "alpha"
                      ? "ol"
                      : "ul";
                  const listStyleType =
                    block.listStyle === "number"
                      ? "decimal"
                      : block.listStyle === "alpha"
                      ? "lower-alpha"
                      : "disc";
                  const listItems = (block.listItems || [])
                    .map(
                      (item: string) =>
                        `<li style="margin-bottom:0.5rem">${parseMarkdownLinks(
                          item
                        )}</li>`
                    )
                    .join("");
                  return `<${listTag} style="margin:1.5rem 0;padding-left:1.5rem;color:${
                    styles.textColor || "#374151"
                  };font-size:1.0625rem;line-height:1.75;list-style-type:${listStyleType}">${listItems}</${listTag}>`;
                }
                case "cta-button": {
                  const sizeStyles = {
                    small: "padding:0.5rem 1rem;font-size:0.875rem",
                    medium: "padding:0.75rem 1.5rem;font-size:1rem",
                    large: "padding:1rem 2rem;font-size:1.125rem",
                  };
                  const bgStyle =
                    block.ctaStyle === "primary"
                      ? `background-color:${
                          styles.accentColor || "#2563eb"
                        };color:#fff`
                      : block.ctaStyle === "secondary"
                      ? `background-color:${
                          styles.textColor || "#374151"
                        };color:#fff`
                      : `background-color:transparent;border:2px solid ${
                          styles.accentColor || "#2563eb"
                        };color:${styles.accentColor || "#2563eb"}`;
                  return `<div style="margin:1.5rem 0;text-align:center"><a href="${
                    block.ctaUrl || "#"
                  }" target="_blank" rel="noopener noreferrer" style="${
                    sizeStyles[block.ctaSize || "medium"]
                  };${bgStyle};display:inline-block;border-radius:0.5rem;font-weight:600;text-decoration:none;transition:opacity 0.2s">${
                    block.ctaText || "Get Started"
                  }</a></div>`;
                }
                case "video": {
                  const getEmbedUrl = (url: string, type: string) => {
                    if (type === "youtube") {
                      const match = url.match(
                        /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/
                      );
                      return match
                        ? `https://www.youtube.com/embed/${match[1]}`
                        : url;
                    } else if (type === "vimeo") {
                      const match = url.match(/vimeo\.com\/(\d+)/);
                      return match
                        ? `https://player.vimeo.com/video/${match[1]}`
                        : url;
                    }
                    return url;
                  };
                  const isUploaded = block.videoType === "uploaded";
                  const embedUrl = isUploaded
                    ? block.videoUrl
                    : getEmbedUrl(
                        block.videoUrl || "",
                        block.videoType || "youtube"
                      );
                  if (!block.videoUrl) return "";
                  if (isUploaded) {
                    return `<div style="margin:2rem 0"><div style="position:relative;width:100%;padding-bottom:56.25%;border-radius:0.5rem;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1)"><video src="${embedUrl}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover" controls title="Video"></video></div></div>`;
                  }
                  return `<div style="margin:2rem 0"><div style="position:relative;width:100%;padding-bottom:56.25%;border-radius:0.5rem;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1)"><iframe src="${embedUrl}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen title="Video"></iframe></div></div>`;
                }
                case "video-grid": {
                  const getEmbedUrl = (url: string, type: string) => {
                    if (type === "youtube") {
                      const match = url.match(
                        /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/
                      );
                      return match
                        ? `https://www.youtube.com/embed/${match[1]}`
                        : "";
                    } else if (type === "vimeo") {
                      const match = url.match(/vimeo\.com\/(\d+)/);
                      return match
                        ? `https://player.vimeo.com/video/${match[1]}`
                        : "";
                    }
                    return "";
                  };
                  const gridCols = block.videoGridCols || 2;
                  const isUploaded = block.videoGridType === "uploaded";
                  const videosHtml = (block.videoUrls || [])
                    .filter((url: string) => url && url.trim())
                    .map((url: string) => {
                      if (isUploaded) {
                        return `<div style="position:relative;padding-bottom:56.25%;border-radius:0.5rem;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1)"><video src="${url}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover" controls title="Video"></video></div>`;
                      }
                      const embedUrl = getEmbedUrl(
                        url,
                        block.videoGridType || "youtube"
                      );
                      return embedUrl
                        ? `<div style="position:relative;padding-bottom:56.25%;border-radius:0.5rem;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1)"><iframe src="${embedUrl}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen title="Video"></iframe></div>`
                        : "";
                    })
                    .join("");
                  return `<div style="margin:2rem 0;display:grid;grid-template-columns:repeat(${gridCols},1fr);gap:1rem">${videosHtml}</div>`;
                }
                default:
                  return "";
              }
            })
            .join("");
        } else {
          blocksHtml = `<p style="text-align:center;color:#999;font-style:italic">No content yet</p>`;
        }

        return `<article class="blog-post" style="background:${
          styles.headerBackground || "#ffffff"
        };color:${
          styles.textColor || "#374151"
        }"><div class="blog-header" style="background:${
          styles.headerBackground || "#ffffff"
        };padding:3rem 2rem"><div class="max-w-6xl mx-auto" style="width:100%">${
          blogContent.featuredImage
            ? `<img src="${blogContent.featuredImage}" alt="${
                blogContent.title || ""
              }" style="width:100%;height:auto;height:24rem;object-fit:cover;border-radius:0.5rem;box-shadow:0 8px 24px rgba(0,0,0,0.15);margin-bottom:2rem;display:block"/>`
            : ""
        }<h1 style="font-size:3.5rem;font-weight:700;margin-bottom:1rem;margin-top:0;color:${
          styles.titleColor || "#111827"
        };line-height:1.2">${
          blogContent.title || "Blog Post"
        }</h1><p style="font-size:1.25rem;color:${
          styles.textColor || "#666"
        };margin-bottom:2rem;margin-top:0;line-height:1.6">${
          blogContent.subtitle || ""
        }</p><div style="display:flex;align-items:center;gap:1rem;font-size:0.875rem;color:${
          styles.textColor || "#666"
        };margin-bottom:2rem">${
          blogContent.author
            ? `<span style="font-weight:600">${blogContent.author}</span>`
            : ""
        }${
          blogContent.author && blogContent.date
            ? `<span style="opacity:0.5">•</span>`
            : ""
        }${
          blogContent.date ? `<span>${blogContent.date}</span>` : ""
        }</div><div class="blog-content" style="max-width:100%;margin:0 auto">${blocksHtml}</div></div></div></article>`;
      }
      case "cta": {
        const c = (s.props as SectionProps)?.cta as CTA | undefined;
        const ctaVariant = c?.ctaVariant || 1;
        const headline = c?.headline || "Ready to get started?";
        const subtext = c?.subtext || "";
        const primaryText = c?.primaryText || "Get Started";
        const primaryUrl = c?.primaryUrl || "#";
        const secondaryText = c?.secondaryText || "";
        const secondaryUrl = c?.secondaryUrl || "#";
        const bgColor = c?.backgroundColor || "#f8fafc";
        const textColor = c?.textColor || "#111827";
        const sideImage = c?.sideImage || "";
        const backgroundImage = c?.backgroundImage || "";

        // Primary button styles
        const pbs = c?.primaryButtonStyle || {};
        const pbBgColor = pbs.bgColor || "#667eea";
        const pbTextColor = pbs.textColor || "#ffffff";
        const pbHoverBgColor = pbs.hoverBgColor || "#5568d3";
        const pbHoverTextColor = pbs.hoverTextColor || "#ffffff";
        const pbBorderRadius = pbs.borderRadius || "0.5rem";
        const pbFontSize = pbs.fontSize || "1rem";
        const pbVariant = pbs.variant || "solid";
        const pbShadow = pbs.shadow || "md";
        const pbEnableAnimation = pbs.enableAnimation !== false; // default true
        const pbTransformAmount = pbs.transformAmount ?? 2; // default 2px
        const pbTransitionDuration = pbs.transitionDuration ?? 0.3; // default 0.3s

        // Secondary button styles
        const sbs = c?.secondaryButtonStyle || {};
        const sbBgColor = sbs.bgColor || "transparent";
        const sbTextColor = sbs.textColor || "#667eea";
        const sbBorderColor = sbs.borderColor || "#667eea";
        const sbHoverBgColor = sbs.hoverBgColor || "#667eea";
        const sbHoverTextColor = sbs.hoverTextColor || "#ffffff";
        const sbBorderRadius = sbs.borderRadius || "0.5rem";
        const sbVariant = sbs.variant || "outline";
        const sbEnableAnimation = sbs.enableAnimation !== false; // default true
        const sbTransformAmount = sbs.transformAmount ?? 2; // default 2px
        const sbTransitionDuration = sbs.transitionDuration ?? 0.3; // default 0.3s

        // Shadow helper
        const getShadowValue = (
          shadow: string,
          color: string = "102,126,234"
        ) => {
          switch (shadow) {
            case "none":
              return "none";
            case "sm":
              return `0 2px 8px rgba(${color},0.2)`;
            case "md":
              return `0 4px 15px rgba(${color},0.3)`;
            case "lg":
              return `0 8px 25px rgba(${color},0.35)`;
            case "xl":
              return `0 12px 35px rgba(${color},0.4)`;
            default:
              return `0 4px 15px rgba(${color},0.3)`;
          }
        };

        const getShadowHoverValue = (
          shadow: string,
          color: string = "102,126,234"
        ) => {
          switch (shadow) {
            case "none":
              return "none";
            case "sm":
              return `0 4px 12px rgba(${color},0.25)`;
            case "md":
              return `0 8px 25px rgba(${color},0.4)`;
            case "lg":
              return `0 12px 35px rgba(${color},0.45)`;
            case "xl":
              return `0 16px 45px rgba(${color},0.5)`;
            default:
              return `0 8px 25px rgba(${color},0.4)`;
          }
        };

        // Convert hex to rgb for shadow
        const hexToRgb = (hex: string) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return `${r},${g},${b}`;
        };

        const pbShadowColor = hexToRgb(pbBgColor);
        const pbShadowValue = getShadowValue(pbShadow, pbShadowColor);
        const pbShadowHover = getShadowHoverValue(pbShadow, pbShadowColor);

        // Primary button style generation (CTA)
        const getPrimaryButtonStyle = () => {
          let style = `padding:0.875rem 2rem;border-radius:${pbBorderRadius};text-decoration:none;font-weight:600;font-size:${pbFontSize};cursor:pointer;white-space:nowrap;display:inline-block;`;
          if (pbEnableAnimation) {
            style += `transition:all ${pbTransitionDuration}s cubic-bezier(0.4,0,0.2,1);`;
          }

          switch (pbVariant) {
            case "outline":
              style += `background:transparent;color:${pbBgColor};border:2px solid ${pbBgColor};`;
              break;
            case "ghost":
              style += `background:${pbBgColor}15;color:${pbBgColor};border:none;`;
              break;
            case "gradient":
              style += `background:linear-gradient(135deg, ${pbBgColor} 0%, ${pbHoverBgColor} 100%);color:${pbTextColor};border:none;box-shadow:${pbShadowValue};`;
              break;
            default: // solid
              style += `background:${pbBgColor};color:${pbTextColor};border:none;box-shadow:${pbShadowValue};`;
          }
          return style;
        };

        // Secondary button style generation (CTA)
        const getSecondaryButtonStyle = () => {
          let style = `padding:0.75rem 2rem;border-radius:${sbBorderRadius};text-decoration:none;font-weight:600;font-size:${pbFontSize};cursor:pointer;white-space:nowrap;display:inline-block;`;
          if (sbEnableAnimation) {
            style += `transition:all ${sbTransitionDuration}s cubic-bezier(0.4,0,0.2,1);`;
          }

          switch (sbVariant) {
            case "solid":
              style += `background:${sbBgColor};color:${sbTextColor};border:none;`;
              break;
            case "ghost":
              style += `background:${sbTextColor}15;color:${sbTextColor};border:none;`;
              break;
            case "text":
              style += `background:transparent;color:${sbTextColor};border:none;text-decoration:underline;`;
              break;
            default: // outline
              style += `background:transparent;color:${sbTextColor};border:2px solid ${sbBorderColor};`;
          }
          return style;
        };

        // Generate hover handlers (CTA section)
        const getPrimaryHoverIn = () => {
          if (!pbEnableAnimation) return "";
          const transform =
            pbTransformAmount > 0
              ? `this.style.transform='translateY(-${pbTransformAmount}px)';`
              : "";
          switch (pbVariant) {
            case "outline":
              return `this.style.background='${pbBgColor}';this.style.color='${pbTextColor}';${transform}`;
            case "ghost":
              return `this.style.background='${pbBgColor}25';${transform}`;
            case "gradient":
              return `${transform}this.style.boxShadow='${pbShadowHover}'`;
            default:
              return `this.style.background='${pbHoverBgColor}';this.style.color='${pbHoverTextColor}';this.style.boxShadow='${pbShadowHover}';${transform}`;
          }
        };

        const getPrimaryHoverOut = () => {
          if (!pbEnableAnimation) return "";
          const transform =
            pbTransformAmount > 0
              ? `this.style.transform='translateY(0)';`
              : "";
          switch (pbVariant) {
            case "outline":
              return `this.style.background='transparent';this.style.color='${pbBgColor}';${transform}`;
            case "ghost":
              return `this.style.background='${pbBgColor}15';${transform}`;
            case "gradient":
              return `${transform}this.style.boxShadow='${pbShadowValue}'`;
            default:
              return `this.style.background='${pbBgColor}';this.style.color='${pbTextColor}';this.style.boxShadow='${pbShadowValue}';${transform}`;
          }
        };

        const getSecondaryHoverIn = () => {
          if (!sbEnableAnimation) return "";
          const transform =
            sbTransformAmount > 0
              ? `this.style.transform='translateY(-${sbTransformAmount}px)';`
              : "";
          switch (sbVariant) {
            case "solid":
              return `this.style.background='${sbHoverBgColor}';this.style.color='${sbHoverTextColor}';${transform}`;
            case "ghost":
              return `this.style.background='${sbTextColor}25';${transform}`;
            case "text":
              return `this.style.color='${sbHoverBgColor}';${transform}`;
            default:
              return `this.style.background='${sbHoverBgColor}';this.style.color='${sbHoverTextColor}';this.style.borderColor='${sbHoverBgColor}';${transform}`;
          }
        };

        const getSecondaryHoverOut = () => {
          if (!sbEnableAnimation) return "";
          const transform =
            sbTransformAmount > 0
              ? `this.style.transform='translateY(0)';`
              : "";
          switch (sbVariant) {
            case "solid":
              return `this.style.background='${sbBgColor}';this.style.color='${sbTextColor}';${transform}`;
            case "ghost":
              return `this.style.background='${sbTextColor}15';${transform}`;
            case "text":
              return `this.style.color='${sbTextColor}';${transform}`;
            default:
              return `this.style.background='transparent';this.style.color='${sbTextColor}';this.style.borderColor='${sbBorderColor}';${transform}`;
          }
        };

        const primaryBtnHtml = `<a href="${primaryUrl}" style="${getPrimaryButtonStyle()}"${
          pbEnableAnimation
            ? ` onmouseover="${getPrimaryHoverIn()}" onmouseout="${getPrimaryHoverOut()}"`
            : ""
        }>${primaryText}</a>`;
        const secondaryBtnHtml = secondaryText
          ? `<a href="${secondaryUrl}" style="${getSecondaryButtonStyle()}"${
              sbEnableAnimation
                ? ` onmouseover="${getSecondaryHoverIn()}" onmouseout="${getSecondaryHoverOut()}"`
                : ""
            }>${secondaryText}</a>`
          : "";

        // Variant 1: Centered
        if (ctaVariant === 1) {
          return `<section class="block-cta" style="background:${bgColor};color:${textColor};padding:4rem 2rem;text-align:center;border-radius:1rem;margin:3rem 0;display:flex;align-items:center;justify-content:center"><div class="max-w-3xl mx-auto" style="width:100%;display:flex;flex-direction:column;align-items:center"><h2 style="color:${textColor};font-size:2.5rem;font-weight:800;margin-bottom:1rem;line-height:1.2;width:100%;text-align:center">${headline}</h2><p style="color:${textColor};margin-bottom:2rem;font-size:1.125rem;line-height:1.6;opacity:0.9;width:100%;text-align:center">${subtext}</p><div style="display:flex;justify-content:center;align-items:center;gap:1rem;flex-wrap:wrap;width:100%">${primaryBtnHtml}${secondaryBtnHtml}</div></div></section>`;
        }

        // Variant 2: Image Left
        if (ctaVariant === 2) {
          return `<section class="block-cta" style="background:${bgColor};color:${textColor};padding:3rem 2rem;margin:3rem 0;border-radius:1rem;display:flex;align-items:center"><div class="max-w-6xl mx-auto" style="display:grid;grid-template-columns:1fr 1.1fr;gap:3rem;align-items:center;width:100%"><div style="flex:1"><img src="${
            sideImage ||
            "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22400%22 height=%22300%22/%3E%3C/svg%3E"
          }" alt="CTA" style="width:100%;height:100%;border-radius:0.75rem;object-fit:cover;box-shadow:0 10px 30px rgba(0,0,0,0.1);display:block"/></div><div style="display:flex;flex-direction:column;align-items:flex-start;justify-content:center"><h2 style="color:${textColor};font-size:2.25rem;font-weight:800;margin-bottom:0.75rem;line-height:1.2;width:100%;text-align:left">${headline}</h2><p style="color:${textColor};margin-bottom:1.5rem;font-size:1.0625rem;line-height:1.7;opacity:0.85;width:100%;text-align:left">${subtext}</p><div style="display:flex;gap:0.75rem;flex-wrap:wrap;align-items:center;width:100%">${primaryBtnHtml}${secondaryBtnHtml}</div></div></div></section>`;
        }

        // Variant 3: Image Right
        if (ctaVariant === 3) {
          return `<section class="block-cta" style="background:${bgColor};color:${textColor};padding:3rem 2rem;margin:3rem 0;border-radius:1rem;display:flex;align-items:center"><div class="max-w-6xl mx-auto" style="display:grid;grid-template-columns:1.1fr 1fr;gap:3rem;align-items:center;width:100%"><div style="display:flex;flex-direction:column;align-items:flex-start;justify-content:center"><h2 style="color:${textColor};font-size:2.25rem;font-weight:800;margin-bottom:0.75rem;line-height:1.2;width:100%;text-align:left">${headline}</h2><p style="color:${textColor};margin-bottom:1.5rem;font-size:1.0625rem;line-height:1.7;opacity:0.85;width:100%;text-align:left">${subtext}</p><div style="display:flex;gap:0.75rem;flex-wrap:wrap;align-items:center;width:100%">${primaryBtnHtml}${secondaryBtnHtml}</div></div><div style="flex:1"><img src="${
            sideImage ||
            "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22400%22 height=%22300%22/%3E%3C/svg%3E"
          }" alt="CTA" style="width:100%;height:100%;border-radius:0.75rem;object-fit:cover;box-shadow:0 10px 30px rgba(0,0,0,0.1);display:block"/></div></div></section>`;
        }

        // Variant 4: Background Image
        if (ctaVariant === 4) {
          // For background image variant, adjust button colors for visibility
          const v4PrimaryStyle = `padding:0.875rem 2rem;border-radius:${pbBorderRadius};text-decoration:none;font-weight:600;font-size:${pbFontSize};transition:all ${pbTransitionDuration}s cubic-bezier(0.4,0,0.2,1);cursor:pointer;white-space:nowrap;display:inline-block;background:${pbBgColor};color:${pbTextColor};border:none;box-shadow:${pbShadowValue};`;
          const v4SecondaryStyle = `padding:0.75rem 2rem;border-radius:${sbBorderRadius};text-decoration:none;font-weight:600;font-size:${pbFontSize};transition:all ${sbTransitionDuration}s cubic-bezier(0.4,0,0.2,1);cursor:pointer;white-space:nowrap;display:inline-block;border:2px solid #fff;color:#fff;background:rgba(255,255,255,0.1);backdrop-filter:blur(10px);`;
          const v4PrimaryTransformIn =
            pbTransformAmount > 0
              ? `this.style.transform='translateY(-${pbTransformAmount}px)';`
              : "";
          const v4PrimaryTransformOut =
            pbTransformAmount > 0
              ? `this.style.transform='translateY(0)';`
              : "";
          const v4SecondaryTransformIn =
            sbTransformAmount > 0
              ? `this.style.transform='translateY(-${sbTransformAmount}px)';`
              : "";
          const v4SecondaryTransformOut =
            sbTransformAmount > 0
              ? `this.style.transform='translateY(0)';`
              : "";

          return `<section class="block-cta" style="background:linear-gradient(135deg,rgba(0,0,0,0.5) 0%,rgba(0,0,0,0.3) 100%),url('${backgroundImage}') center/cover no-repeat;color:#fff;padding:5rem 2rem;text-align:center;margin:3rem 0;border-radius:1rem;position:relative;min-height:400px;display:flex;align-items:center;justify-content:center"><div class="max-w-3xl mx-auto" style="width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center"><h2 style="color:#fff;font-size:2.5rem;font-weight:800;margin-bottom:1rem;line-height:1.2;text-shadow:0 2px 8px rgba(0,0,0,0.3);width:100%;text-align:center">${headline}</h2><p style="color:rgba(255,255,255,0.95);margin-bottom:2rem;font-size:1.125rem;line-height:1.6;text-shadow:0 1px 4px rgba(0,0,0,0.2);width:100%;text-align:center">${subtext}</p><div style="display:flex;justify-content:center;align-items:center;gap:1rem;flex-wrap:wrap;width:100%"><a href="${primaryUrl}" style="${v4PrimaryStyle}" onmouseover="this.style.background='${pbHoverBgColor}';this.style.boxShadow='${pbShadowHover}';${v4PrimaryTransformIn}" onmouseout="this.style.background='${pbBgColor}';this.style.boxShadow='${pbShadowValue}';${v4PrimaryTransformOut}">${primaryText}</a>${
            secondaryText
              ? `<a href="${secondaryUrl}" style="${v4SecondaryStyle}" onmouseover="this.style.background='#fff';this.style.color='${pbBgColor}';this.style.boxShadow='0 4px 15px rgba(255,255,255,0.3)';${v4SecondaryTransformIn}" onmouseout="this.style.background='rgba(255,255,255,0.1)';this.style.color='#fff';this.style.boxShadow='none';${v4SecondaryTransformOut}">${secondaryText}</a>`
              : ""
          }</div></div></section>`;
        }

        return `<section class="block-cta"><div class="max-w-4xl mx-auto"><h2>${headline}</h2></div></section>`;
      }
      default:
        return `<section><h2>${s.title}</h2></section>`;
    }
  };

  const onSave = async () => {
    const title = pageTitle || prompt("Page title", "New Page") || "New Page";
    const path = pagePath || prompt("Page path", "/new-page") || "/new-page";
    setSaving(true);
    try {
      const htmlParts: string[] = [];
      htmlParts.push(navHtml || defaultNavHtml);
      sections.forEach((s) => htmlParts.push(renderSectionHtml(s)));

      // Extract footer CSS from footerHtml and remove style tag from HTML
      let footerHtmlContent = footerHtml || defaultFooterHtml;
      let footerCss = "";
      const styleMatch = footerHtmlContent.match(
        /<style[^>]*>([\s\S]*?)<\/style>/
      );
      if (styleMatch) {
        footerCss = styleMatch[1];
        // Remove the style tag from the footer HTML
        footerHtmlContent = footerHtmlContent.replace(
          /<style[^>]*>[\s\S]*?<\/style>/,
          ""
        );
      }

      htmlParts.push(footerHtmlContent);

      // Wrap styles in a proper style tag - use minimalPreviewCss which is optimized + footer CSS
      const allCss = footerCss
        ? `${minimalPreviewCss}${footerCss}`
        : minimalPreviewCss;
      const styledHtml = `${htmlParts.join("\n")}`;
      const finalHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>${allCss}</style></head><body>${styledHtml}</body></html>`;

      // Convert sections to layout array format for storage
      const layoutArray = sections.map((s) => ({
        type: s.type,
        title: s.title,
        props: s.props || {},
      }));

      console.log("=== SAVING PAGE ===");
      console.log("Title:", title);
      console.log("Path:", path);
      console.log("Sections count:", sections.length);
      console.log("Layout array:", JSON.stringify(layoutArray, null, 2));

      if (pageId) {
        // Update existing page
        await api.updatePage(pageId, {
          title,
          path,
          content: finalHtml,
          layout: layoutArray,
          published: true,
        });
        alert("Page updated successfully!");
      } else {
        // Create new page
        await api.createPage({
          title,
          path,
          content: finalHtml,
          layout: layoutArray,
          published: true,
        });
        alert("Page created successfully!");
      }
      navigate("/admin/pages");
    } catch (err) {
      console.error(err);
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    const title = "Preview Page";
    console.log("=== PREVIEW DEBUG ===");
    console.log("Total sections:", sections.length);
    const htmlParts: string[] = [];
    htmlParts.push(navHtml || defaultNavHtml);
    sections.forEach((s, idx) => {
      console.log(`Section ${idx}:`, s.type, s);
      if (s.type === "hero") {
        const heroContent = getHeroContent(s);
        console.log(`  Hero content:`, heroContent);
      }
      htmlParts.push(renderSectionHtml(s));
    });

    // Extract footer CSS from footerHtml and remove style tag from HTML
    let footerHtmlContent = footerHtml || defaultFooterHtml;
    let footerCss = "";
    const styleMatch = footerHtmlContent.match(
      /<style[^>]*>([\s\S]*?)<\/style>/
    );
    if (styleMatch) {
      footerCss = styleMatch[1];
      // Remove the style tag from the footer HTML
      footerHtmlContent = footerHtmlContent.replace(
        /<style[^>]*>[\s\S]*?<\/style>/,
        ""
      );
    }

    htmlParts.push(footerHtmlContent);

    // Build complete HTML with all CSS embedded (minimalPreviewCss + footer-specific CSS)
    const allCss = footerCss
      ? `${minimalPreviewCss}${footerCss}`
      : minimalPreviewCss;
    const finalHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
  <style>${allCss}</style>
</head>
  <body style="background:#ffffff;color:#111827">
${htmlParts.join("\n")}
</body>
</html>`;

    console.log(
      "Preview HTML (first 1000 chars):",
      finalHtml.substring(0, 1000)
    );
    const base = window.location.origin;
    const finalHtmlWithUrls = finalHtml
      .replace(
        /(src|href)=(['"])\/(?!\/)([^'"\s>]+)\2/g,
        (_m, attr, q, path) => `${attr}=${q}${base}/${path}${q}`
      )
      .replace(
        /url\((['"]?)\/(?!\/)([^)'"]+)\1\)/g,
        (_m, q, path) => `url(${q}${base}/${path}${q})`
      );

    try {
      const blob = new Blob([finalHtmlWithUrls], { type: "text/html" });
      const blobUrl = URL.createObjectURL(blob);
      console.log("Opening blob URL:", blobUrl);
      window.open(blobUrl, "_blank");
      // Keep blob URL alive for a bit
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } catch (err) {
      console.error("Blob preview failed:", err);
      alert("Preview failed. Check console for errors.");
    }
  };

  return (
    <div className="pagebuilder-root min-h-screen p-6 bg-slate-50">
      <style>{`
        /* Scope: make all buttons inside PageBuilder white with dark text */
        .pagebuilder-root button {
          background: white !important;
          color: #111827 !important;
          border-color: #e5e7eb !important;
        }
        .pagebuilder-root button:disabled {
          opacity: 0.8 !important;
        }
      `}</style>
      <div className="max-w-7xl mx-auto grid gap-6">
        <main className="space-y-4">
          <div className="bg-white p-4 rounded shadow">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">
                Page Builder — Inline Sections
              </h1>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 bg-green-600 text-white rounded"
                  onClick={onSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save & Publish"}
                </button>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Page Title
                </label>
                <input
                  type="text"
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="New Page"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Page URL
                </label>
                <input
                  type="text"
                  value={pagePath}
                  onChange={(e) => setPagePath(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="/new-page"
                />
              </div>
            </div>

            {/* Inline add toolbar (not a separate menu) */}
            <div className="mt-3 flex gap-2">
              <button
                className="px-2 py-1 border rounded"
                onClick={() => addSection("hero")}
              >
                + Hero
              </button>
              <button
                className="px-2 py-1 border rounded"
                onClick={() => addSection("cards")}
              >
                + Cards
              </button>
              <button
                className="px-2 py-1 border rounded"
                onClick={() => addSection("carousel")}
              >
                + Carousel
              </button>
              <button
                className="px-2 py-1 border rounded"
                onClick={() => addSection("cta")}
              >
                + CTA
              </button>
              <button
                className="px-2 py-1 border rounded"
                onClick={() => addSection("testimonials")}
              >
                + Testimonials
              </button>
              <button
                className="px-2 py-1 border rounded"
                onClick={() => addSection("imagetextblock")}
              >
                + ImageTextBlock
              </button>
              <button
                className="px-2 py-1 border rounded"
                onClick={() => addSection("blog")}
              >
                + Blog
              </button>
            </div>

            <h2 className="font-semibold my-4">
              Sections (line-by-line editable, drag to reorder)
            </h2>
            <div className="space-y-4">
              {sections.map((s, idx) => (
                <div
                  key={s.id}
                  draggable
                  onDragStart={(e) => {
                    setDragId(s.id);
                    try {
                      e.dataTransfer.setData("text/plain", s.id);
                    } catch {
                      /* ignore */
                    }
                    setIsDraggingOverlay(true);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const fromId = (e.dataTransfer.getData("text/plain") ||
                      dragId) as string;
                    const fromIdx = sections.findIndex((x) => x.id === fromId);
                    if (fromIdx === -1) return;
                    const copy = sections.slice();
                    const [moved] = copy.splice(fromIdx, 1);
                    copy.splice(idx, 0, moved);
                    setSections(copy);
                    setIsDraggingOverlay(false);
                    setDragId(null);
                  }}
                  className="p-4 bg-white rounded shadow flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="cursor-move px-2 py-1 border rounded text-sm">
                        ☰
                      </div>
                      <input
                        value={s.title || ""}
                        onChange={(e) =>
                          setSections((prev) =>
                            prev.map((x) =>
                              x.id === s.id
                                ? { ...x, title: e.target.value }
                                : x
                            )
                          )
                        }
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        {s.type}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setCollapsedSections((prev) => ({
                            ...prev,
                            [s.id]: !prev[s.id],
                          }))
                        }
                        className="px-2 py-1 border rounded"
                      >
                        {collapsedSections[s.id] ? "Expand" : "Minimize"}
                      </button>
                      <button
                        onClick={() => {
                          // move up
                          if (idx === 0) return;
                          const copy = sections.slice();
                          const [moved] = copy.splice(idx, 1);
                          copy.splice(idx - 1, 0, moved);
                          setSections(copy);
                        }}
                        className="px-2 py-1 border rounded"
                      >
                        Up
                      </button>
                      <button
                        onClick={() => {
                          if (idx === sections.length - 1) return;
                          const copy = sections.slice();
                          const [moved] = copy.splice(idx, 1);
                          copy.splice(idx + 1, 0, moved);
                          setSections(copy);
                        }}
                        className="px-2 py-1 border rounded"
                      >
                        Down
                      </button>
                      <button
                        onClick={() => {
                          removeSection(s.id);
                        }}
                        className="px-2 py-1 border rounded text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Inline editor per section type */}
                  <div>
                    {collapsedSections[s.id] ? (
                      <div className="p-3 border rounded bg-gray-50 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          {s.title || s.type}
                        </div>
                        <button
                          onClick={() =>
                            setCollapsedSections((prev) => ({
                              ...prev,
                              [s.id]: false,
                            }))
                          }
                          className="px-2 py-1 border rounded"
                        >
                          Expand
                        </button>
                      </div>
                    ) : (
                      <div>
                        {s.type === "hero" && (
                          <div>
                            <HeroEditor
                              heroVariant={getHeroVariant(s)}
                              setHeroVariant={(v) => setHeroVariant(s, v)}
                              heroContent={getHeroContent(s)}
                              setHeroContent={(c) => setHeroContent(s, c)}
                            />
                          </div>
                        )}

                        {s.type === "cards" && (
                          <div>
                            <FeaturesEditor
                              content={getFeaturesContent(s)}
                              onChange={(c) => setFeaturesContent(s, c)}
                            />
                            <FeaturesPreview content={getFeaturesContent(s)} />
                          </div>
                        )}

                        {s.type === "carousel" && (
                          <div>
                            <CarouselManager
                              initialConfig={{
                                id: s.id,
                                name: s.title || "Carousel",
                                items: s.props?.items || [],
                                variant: Number(s.props?.variant) || 1,
                                autoScroll: !!s.props?.autoScroll,
                              }}
                              onChange={(cfg: unknown) => {
                                const c = cfg as SectionProps;
                                setSections((prev) =>
                                  prev.map((x) =>
                                    x.id === s.id
                                      ? { ...x, props: { ...x.props, ...c } }
                                      : x
                                  )
                                );
                              }}
                            />
                            <div className="text-xs text-gray-500 mt-2">
                              Carousel editor (uses shared CarouselManager)
                            </div>
                            <div className="mt-3">
                              <h4 className="font-semibold mb-2">Preview</h4>
                              <CarouselDisplay
                                config={{
                                  ...s.props,
                                  variant: Number(s.props?.variant) || 1,
                                  items: s.props?.items || [],
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {s.type === "testimonials" && (
                          <div className="space-y-4">
                            {/* Variant Selection */}
                            <div>
                              <label className="block text-sm font-semibold text-black mb-2">
                                Testimonial Style
                              </label>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {[
                                  { value: 1, label: "Grid - Shadow" },
                                  { value: 2, label: "Grid - Gradient" },
                                  { value: 3, label: "Grid - Modern" },
                                  { value: 4, label: "Carousel Cards" },
                                ].map((v) => (
                                  <button
                                    key={v.value}
                                    onClick={() =>
                                      setSections((prev) =>
                                        prev.map((x) =>
                                          x.id === s.id
                                            ? {
                                                ...x,
                                                props: {
                                                  ...x.props,
                                                  variant: v.value,
                                                  style:
                                                    v.value === 1
                                                      ? "shadow"
                                                      : v.value === 2
                                                      ? "gradient"
                                                      : v.value === 3
                                                      ? "modern"
                                                      : "cards",
                                                },
                                              }
                                            : x
                                        )
                                      )
                                    }
                                    className={`px-3 py-2 text-xs rounded border transition ${
                                      (Number(s.props?.variant) || 1) ===
                                      v.value
                                        ? "bg-blue-500 text-white border-blue-500"
                                        : "bg-white text-gray-700 hover:bg-gray-50"
                                    }`}
                                  >
                                    {v.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* CSS Customization Options */}
                            <div className="p-3 border rounded bg-gray-50">
                              <label className="block text-sm font-semibold text-black mb-3">
                                🎨 Style Customization
                              </label>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Section Background
                                  </label>
                                  <div className="flex gap-2">
                                    <input
                                      type="color"
                                      value={
                                        (s.props?.sectionBgColor as string) ||
                                        "#ffffff"
                                      }
                                      onChange={(e) =>
                                        setSections((prev) =>
                                          prev.map((x) =>
                                            x.id === s.id
                                              ? {
                                                  ...x,
                                                  props: {
                                                    ...x.props,
                                                    sectionBgColor:
                                                      e.target.value,
                                                  },
                                                }
                                              : x
                                          )
                                        )
                                      }
                                      className="w-10 h-8 border rounded cursor-pointer"
                                    />
                                    <input
                                      type="text"
                                      value={
                                        (s.props?.sectionBgColor as string) ||
                                        "#ffffff"
                                      }
                                      onChange={(e) =>
                                        setSections((prev) =>
                                          prev.map((x) =>
                                            x.id === s.id
                                              ? {
                                                  ...x,
                                                  props: {
                                                    ...x.props,
                                                    sectionBgColor:
                                                      e.target.value,
                                                  },
                                                }
                                              : x
                                          )
                                        )
                                      }
                                      className="flex-1 px-2 py-1 border rounded text-black text-xs"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Card Background
                                  </label>
                                  <div className="flex gap-2">
                                    <input
                                      type="color"
                                      value={
                                        (s.props?.cardBgColor as string) ||
                                        "#ffffff"
                                      }
                                      onChange={(e) =>
                                        setSections((prev) =>
                                          prev.map((x) =>
                                            x.id === s.id
                                              ? {
                                                  ...x,
                                                  props: {
                                                    ...x.props,
                                                    cardBgColor: e.target.value,
                                                  },
                                                }
                                              : x
                                          )
                                        )
                                      }
                                      className="w-10 h-8 border rounded cursor-pointer"
                                    />
                                    <input
                                      type="text"
                                      value={
                                        (s.props?.cardBgColor as string) ||
                                        "#ffffff"
                                      }
                                      onChange={(e) =>
                                        setSections((prev) =>
                                          prev.map((x) =>
                                            x.id === s.id
                                              ? {
                                                  ...x,
                                                  props: {
                                                    ...x.props,
                                                    cardBgColor: e.target.value,
                                                  },
                                                }
                                              : x
                                          )
                                        )
                                      }
                                      className="flex-1 px-2 py-1 border rounded text-black text-xs"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Text Color
                                  </label>
                                  <div className="flex gap-2">
                                    <input
                                      type="color"
                                      value={
                                        (s.props?.textColor as string) ||
                                        "#374151"
                                      }
                                      onChange={(e) =>
                                        setSections((prev) =>
                                          prev.map((x) =>
                                            x.id === s.id
                                              ? {
                                                  ...x,
                                                  props: {
                                                    ...x.props,
                                                    textColor: e.target.value,
                                                  },
                                                }
                                              : x
                                          )
                                        )
                                      }
                                      className="w-10 h-8 border rounded cursor-pointer"
                                    />
                                    <input
                                      type="text"
                                      value={
                                        (s.props?.textColor as string) ||
                                        "#374151"
                                      }
                                      onChange={(e) =>
                                        setSections((prev) =>
                                          prev.map((x) =>
                                            x.id === s.id
                                              ? {
                                                  ...x,
                                                  props: {
                                                    ...x.props,
                                                    textColor: e.target.value,
                                                  },
                                                }
                                              : x
                                          )
                                        )
                                      }
                                      className="flex-1 px-2 py-1 border rounded text-black text-xs"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Title Color
                                  </label>
                                  <div className="flex gap-2">
                                    <input
                                      type="color"
                                      value={
                                        (s.props?.titleColor as string) ||
                                        "#111827"
                                      }
                                      onChange={(e) =>
                                        setSections((prev) =>
                                          prev.map((x) =>
                                            x.id === s.id
                                              ? {
                                                  ...x,
                                                  props: {
                                                    ...x.props,
                                                    titleColor: e.target.value,
                                                  },
                                                }
                                              : x
                                          )
                                        )
                                      }
                                      className="w-10 h-8 border rounded cursor-pointer"
                                    />
                                    <input
                                      type="text"
                                      value={
                                        (s.props?.titleColor as string) ||
                                        "#111827"
                                      }
                                      onChange={(e) =>
                                        setSections((prev) =>
                                          prev.map((x) =>
                                            x.id === s.id
                                              ? {
                                                  ...x,
                                                  props: {
                                                    ...x.props,
                                                    titleColor: e.target.value,
                                                  },
                                                }
                                              : x
                                          )
                                        )
                                      }
                                      className="flex-1 px-2 py-1 border rounded text-black text-xs"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Accent Color
                                  </label>
                                  <div className="flex gap-2">
                                    <input
                                      type="color"
                                      value={
                                        (s.props?.accentColor as string) ||
                                        "#667eea"
                                      }
                                      onChange={(e) =>
                                        setSections((prev) =>
                                          prev.map((x) =>
                                            x.id === s.id
                                              ? {
                                                  ...x,
                                                  props: {
                                                    ...x.props,
                                                    accentColor: e.target.value,
                                                  },
                                                }
                                              : x
                                          )
                                        )
                                      }
                                      className="w-10 h-8 border rounded cursor-pointer"
                                    />
                                    <input
                                      type="text"
                                      value={
                                        (s.props?.accentColor as string) ||
                                        "#667eea"
                                      }
                                      onChange={(e) =>
                                        setSections((prev) =>
                                          prev.map((x) =>
                                            x.id === s.id
                                              ? {
                                                  ...x,
                                                  props: {
                                                    ...x.props,
                                                    accentColor: e.target.value,
                                                  },
                                                }
                                              : x
                                          )
                                        )
                                      }
                                      className="flex-1 px-2 py-1 border rounded text-black text-xs"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Company Color
                                  </label>
                                  <div className="flex gap-2">
                                    <input
                                      type="color"
                                      value={
                                        (s.props?.companyColor as string) ||
                                        "#667eea"
                                      }
                                      onChange={(e) =>
                                        setSections((prev) =>
                                          prev.map((x) =>
                                            x.id === s.id
                                              ? {
                                                  ...x,
                                                  props: {
                                                    ...x.props,
                                                    companyColor:
                                                      e.target.value,
                                                  },
                                                }
                                              : x
                                          )
                                        )
                                      }
                                      className="w-10 h-8 border rounded cursor-pointer"
                                    />
                                    <input
                                      type="text"
                                      value={
                                        (s.props?.companyColor as string) ||
                                        "#667eea"
                                      }
                                      onChange={(e) =>
                                        setSections((prev) =>
                                          prev.map((x) =>
                                            x.id === s.id
                                              ? {
                                                  ...x,
                                                  props: {
                                                    ...x.props,
                                                    companyColor:
                                                      e.target.value,
                                                  },
                                                }
                                              : x
                                          )
                                        )
                                      }
                                      className="flex-1 px-2 py-1 border rounded text-black text-xs"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Animation & Transition Options */}
                            <div className="p-3 border rounded bg-gray-50">
                              <label className="block text-sm font-semibold text-black mb-3">
                                ✨ Animation & Hover Effects
                              </label>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Hover Animation
                                  </label>
                                  <select
                                    value={
                                      (s.props?.hoverAnimation as string) ||
                                      "lift"
                                    }
                                    onChange={(e) =>
                                      setSections((prev) =>
                                        prev.map((x) =>
                                          x.id === s.id
                                            ? {
                                                ...x,
                                                props: {
                                                  ...x.props,
                                                  hoverAnimation:
                                                    e.target.value,
                                                },
                                              }
                                            : x
                                        )
                                      )
                                    }
                                    className="w-full px-2 py-1.5 border rounded text-black text-xs"
                                  >
                                    <option value="none">None</option>
                                    <option value="lift">Lift Up</option>
                                    <option value="scale">Scale Up</option>
                                    <option value="slideRight">
                                      Slide Right
                                    </option>
                                    <option value="glow">Glow Shadow</option>
                                    <option value="borderGrow">
                                      Border Grow
                                    </option>
                                    <option value="fillColor">
                                      Fill Color
                                    </option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Transition Speed
                                  </label>
                                  <select
                                    value={
                                      (s.props?.transitionSpeed as string) ||
                                      "0.3s"
                                    }
                                    onChange={(e) =>
                                      setSections((prev) =>
                                        prev.map((x) =>
                                          x.id === s.id
                                            ? {
                                                ...x,
                                                props: {
                                                  ...x.props,
                                                  transitionSpeed:
                                                    e.target.value,
                                                },
                                              }
                                            : x
                                        )
                                      )
                                    }
                                    className="w-full px-2 py-1.5 border rounded text-black text-xs"
                                  >
                                    <option value="0.15s">Fast (0.15s)</option>
                                    <option value="0.3s">Normal (0.3s)</option>
                                    <option value="0.5s">Slow (0.5s)</option>
                                    <option value="0.8s">
                                      Very Slow (0.8s)
                                    </option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Transition Easing
                                  </label>
                                  <select
                                    value={
                                      (s.props?.transitionEasing as string) ||
                                      "ease"
                                    }
                                    onChange={(e) =>
                                      setSections((prev) =>
                                        prev.map((x) =>
                                          x.id === s.id
                                            ? {
                                                ...x,
                                                props: {
                                                  ...x.props,
                                                  transitionEasing:
                                                    e.target.value,
                                                },
                                              }
                                            : x
                                        )
                                      )
                                    }
                                    className="w-full px-2 py-1.5 border rounded text-black text-xs"
                                  >
                                    <option value="ease">Ease</option>
                                    <option value="ease-in">Ease In</option>
                                    <option value="ease-out">Ease Out</option>
                                    <option value="ease-in-out">
                                      Ease In-Out
                                    </option>
                                    <option value="linear">Linear</option>
                                    <option value="cubic-bezier(0.68,-0.55,0.265,1.55)">
                                      Bounce
                                    </option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Hover Background
                                  </label>
                                  <div className="flex gap-2">
                                    <input
                                      type="color"
                                      value={
                                        (s.props?.hoverBgColor as string) ||
                                        "#667eea"
                                      }
                                      onChange={(e) =>
                                        setSections((prev) =>
                                          prev.map((x) =>
                                            x.id === s.id
                                              ? {
                                                  ...x,
                                                  props: {
                                                    ...x.props,
                                                    hoverBgColor:
                                                      e.target.value,
                                                  },
                                                }
                                              : x
                                          )
                                        )
                                      }
                                      className="w-10 h-8 border rounded cursor-pointer"
                                    />
                                    <input
                                      type="text"
                                      value={
                                        (s.props?.hoverBgColor as string) ||
                                        "#667eea"
                                      }
                                      onChange={(e) =>
                                        setSections((prev) =>
                                          prev.map((x) =>
                                            x.id === s.id
                                              ? {
                                                  ...x,
                                                  props: {
                                                    ...x.props,
                                                    hoverBgColor:
                                                      e.target.value,
                                                  },
                                                }
                                              : x
                                          )
                                        )
                                      }
                                      className="flex-1 px-2 py-1 border rounded text-black text-xs"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Hover Text Color
                                  </label>
                                  <div className="flex gap-2">
                                    <input
                                      type="color"
                                      value={
                                        (s.props?.hoverTextColor as string) ||
                                        "#ffffff"
                                      }
                                      onChange={(e) =>
                                        setSections((prev) =>
                                          prev.map((x) =>
                                            x.id === s.id
                                              ? {
                                                  ...x,
                                                  props: {
                                                    ...x.props,
                                                    hoverTextColor:
                                                      e.target.value,
                                                  },
                                                }
                                              : x
                                          )
                                        )
                                      }
                                      className="w-10 h-8 border rounded cursor-pointer"
                                    />
                                    <input
                                      type="text"
                                      value={
                                        (s.props?.hoverTextColor as string) ||
                                        "#ffffff"
                                      }
                                      onChange={(e) =>
                                        setSections((prev) =>
                                          prev.map((x) =>
                                            x.id === s.id
                                              ? {
                                                  ...x,
                                                  props: {
                                                    ...x.props,
                                                    hoverTextColor:
                                                      e.target.value,
                                                  },
                                                }
                                              : x
                                          )
                                        )
                                      }
                                      className="flex-1 px-2 py-1 border rounded text-black text-xs"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Shadow Intensity
                                  </label>
                                  <select
                                    value={
                                      (s.props?.shadowIntensity as string) ||
                                      "medium"
                                    }
                                    onChange={(e) =>
                                      setSections((prev) =>
                                        prev.map((x) =>
                                          x.id === s.id
                                            ? {
                                                ...x,
                                                props: {
                                                  ...x.props,
                                                  shadowIntensity:
                                                    e.target.value,
                                                },
                                              }
                                            : x
                                        )
                                      )
                                    }
                                    className="w-full px-2 py-1.5 border rounded text-black text-xs"
                                  >
                                    <option value="none">None</option>
                                    <option value="light">Light</option>
                                    <option value="medium">Medium</option>
                                    <option value="heavy">Heavy</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                            {(((s.props?.items || []) as Item[]) || []).map(
                              (t: Item, idx: number) => (
                                <div
                                  key={idx}
                                  className="p-3 border rounded bg-white"
                                >
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-semibold text-gray-600">
                                      Testimonial #{idx + 1}
                                    </span>
                                    <button
                                      onClick={() =>
                                        setSections((prev) =>
                                          prev.map((x) => {
                                            if (x.id !== s.id) return x;
                                            const items = (
                                              [
                                                ...(x.props?.items || []),
                                              ] as Item[]
                                            ).filter((_, i) => i !== idx);
                                            return {
                                              ...x,
                                              props: { ...x.props, items },
                                            };
                                          })
                                        )
                                      }
                                      className="text-red-500 hover:text-red-700 text-xs"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                  <label className="block text-sm font-semibold text-black">
                                    Quote
                                  </label>
                                  <textarea
                                    value={t.quote || t.body || ""}
                                    onChange={(e) =>
                                      setSections((prev) =>
                                        prev.map((x) => {
                                          if (x.id !== s.id) return x;
                                          const items = (
                                            [
                                              ...(x.props?.items || []),
                                            ] as Item[]
                                          ).slice();
                                          items[idx] = {
                                            ...(items[idx] || {}),
                                            quote: e.target.value,
                                          };
                                          return {
                                            ...x,
                                            props: { ...x.props, items },
                                          };
                                        })
                                      )
                                    }
                                    rows={3}
                                    className="w-full px-3 py-2 border rounded text-black mb-2"
                                    placeholder="Enter the testimonial text..."
                                  />
                                  <div className="grid md:grid-cols-2 gap-3 mb-2">
                                    <div>
                                      <label className="block text-sm font-semibold text-black">
                                        Author Name
                                      </label>
                                      <input
                                        type="text"
                                        value={t.author || ""}
                                        onChange={(e) =>
                                          setSections((prev) =>
                                            prev.map((x) => {
                                              if (x.id !== s.id) return x;
                                              const items = (
                                                [
                                                  ...(x.props?.items || []),
                                                ] as Item[]
                                              ).slice();
                                              items[idx] = {
                                                ...(items[idx] || {}),
                                                author: e.target.value,
                                              };
                                              return {
                                                ...x,
                                                props: { ...x.props, items },
                                              };
                                            })
                                          )
                                        }
                                        className="w-full px-3 py-2 border rounded text-black"
                                        placeholder="John Doe"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-semibold text-black">
                                        Company / Position
                                      </label>
                                      <input
                                        type="text"
                                        value={t.company || t.role || ""}
                                        onChange={(e) =>
                                          setSections((prev) =>
                                            prev.map((x) => {
                                              if (x.id !== s.id) return x;
                                              const items = (
                                                [
                                                  ...(x.props?.items || []),
                                                ] as Item[]
                                              ).slice();
                                              items[idx] = {
                                                ...(items[idx] || {}),
                                                company: e.target.value,
                                              };
                                              return {
                                                ...x,
                                                props: { ...x.props, items },
                                              };
                                            })
                                          )
                                        }
                                        className="w-full px-3 py-2 border rounded text-black"
                                        placeholder="Placed at Google / CEO at Company"
                                      />
                                    </div>
                                  </div>
                                  {/* Photo field for variant 4 with ImagePicker */}
                                  {(Number(s.props?.variant) || 1) === 4 && (
                                    <div>
                                      <label className="block text-sm font-semibold text-black mb-1">
                                        Author Photo
                                      </label>
                                      <ImagePicker
                                        label=""
                                        value={t.photo || ""}
                                        onChange={(url) =>
                                          setSections((prev) =>
                                            prev.map((x) => {
                                              if (x.id !== s.id) return x;
                                              const items = (
                                                [
                                                  ...(x.props?.items || []),
                                                ] as Item[]
                                              ).slice();
                                              items[idx] = {
                                                ...(items[idx] || {}),
                                                photo: url,
                                              };
                                              return {
                                                ...x,
                                                props: { ...x.props, items },
                                              };
                                            })
                                          )
                                        }
                                      />
                                    </div>
                                  )}
                                </div>
                              )
                            )}

                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  setSections((prev) =>
                                    prev.map((x) =>
                                      x.id === s.id
                                        ? {
                                            ...x,
                                            props: {
                                              ...x.props,
                                              items: [
                                                ...(((x.props?.items ||
                                                  []) as Item[]) || []),
                                                {
                                                  quote: "",
                                                  author: "",
                                                  company: "",
                                                  photo: "",
                                                },
                                              ],
                                            },
                                          }
                                        : x
                                    )
                                  )
                                }
                                className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                              >
                                + Add Testimonial
                              </button>
                            </div>

                            {/* Preview for variant 4 */}
                            {(Number(s.props?.variant) || 1) === 4 &&
                              ((s.props?.items || []) as Item[]).length > 0 && (
                                <div className="mt-4 border-t pt-4">
                                  <h4 className="font-semibold mb-3 text-sm text-gray-600">
                                    Preview
                                  </h4>
                                  <div className="flex gap-4 overflow-x-auto pb-2">
                                    {((s.props?.items || []) as Item[]).map(
                                      (t, idx) => (
                                        <div
                                          key={idx}
                                          className="flex-shrink-0 w-72 bg-white border rounded-xl p-4 shadow-sm relative"
                                        >
                                          <div className="absolute top-3 right-3 w-8 h-8 opacity-10">
                                            <svg
                                              viewBox="0 0 24 24"
                                              fill="#667eea"
                                            >
                                              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                                            </svg>
                                          </div>
                                          <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                                            {t.quote || "Testimonial text..."}
                                          </p>
                                          <div className="flex items-center gap-2 pt-2 border-t">
                                            {t.photo ? (
                                              <img
                                                src={t.photo}
                                                alt={t.author || ""}
                                                className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                                              />
                                            ) : (
                                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                                {(t.author || "A")
                                                  .charAt(0)
                                                  .toUpperCase()}
                                              </div>
                                            )}
                                            <div>
                                              <p className="font-semibold text-sm text-gray-800">
                                                {t.author || "Author Name"}
                                              </p>
                                              <p className="text-xs text-blue-600">
                                                {t.company ||
                                                  t.role ||
                                                  "Company/Position"}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        )}

                        {s.type === "cta" && (
                          <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-semibold text-black">
                                  Background Color
                                </label>
                                <div className="flex gap-2">
                                  <input
                                    type="color"
                                    value={
                                      getCtaContent(s).backgroundColor ||
                                      "#f8fafc"
                                    }
                                    onChange={(e) =>
                                      setCtaContent(s, {
                                        ...getCtaContent(s),
                                        backgroundColor: e.target.value,
                                      })
                                    }
                                    className="w-12 h-10 border rounded cursor-pointer"
                                  />
                                  <input
                                    type="text"
                                    value={
                                      getCtaContent(s).backgroundColor ||
                                      "#f8fafc"
                                    }
                                    onChange={(e) =>
                                      setCtaContent(s, {
                                        ...getCtaContent(s),
                                        backgroundColor: e.target.value,
                                      })
                                    }
                                    className="flex-1 px-3 py-2 border rounded text-black text-sm"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-black">
                                  Text Color
                                </label>
                                <div className="flex gap-2">
                                  <input
                                    type="color"
                                    value={
                                      getCtaContent(s).textColor || "#111827"
                                    }
                                    onChange={(e) =>
                                      setCtaContent(s, {
                                        ...getCtaContent(s),
                                        textColor: e.target.value,
                                      })
                                    }
                                    className="w-12 h-10 border rounded cursor-pointer"
                                  />
                                  <input
                                    type="text"
                                    value={
                                      getCtaContent(s).textColor || "#111827"
                                    }
                                    onChange={(e) =>
                                      setCtaContent(s, {
                                        ...getCtaContent(s),
                                        textColor: e.target.value,
                                      })
                                    }
                                    className="flex-1 px-3 py-2 border rounded text-black text-sm"
                                  />
                                </div>
                              </div>
                            </div>

                            <label className="block text-sm font-semibold text-black">
                              CTA Variant
                            </label>
                            <select
                              value={getCtaContent(s).ctaVariant || 1}
                              onChange={(e) =>
                                setCtaContent(s, {
                                  ...getCtaContent(s),
                                  ctaVariant: Number(e.target.value) as
                                    | 1
                                    | 2
                                    | 3
                                    | 4,
                                })
                              }
                              className="w-full px-3 py-2 border rounded text-black"
                            >
                              <option value={1}>Variant 1 — Centered</option>
                              <option value={2}>Variant 2 — Image Left</option>
                              <option value={3}>Variant 3 — Image Right</option>
                              <option value={4}>
                                Variant 4 — Background Image
                              </option>
                            </select>

                            {(getCtaContent(s).ctaVariant === 2 ||
                              getCtaContent(s).ctaVariant === 3) && (
                              <ImagePicker
                                label="Side Image URL"
                                value={getCtaContent(s).sideImage || ""}
                                onChange={(url) =>
                                  setCtaContent(s, {
                                    ...getCtaContent(s),
                                    sideImage: url,
                                  })
                                }
                              />
                            )}

                            {getCtaContent(s).ctaVariant === 4 && (
                              <ImagePicker
                                label="Background Image URL"
                                value={getCtaContent(s).backgroundImage || ""}
                                onChange={(url) =>
                                  setCtaContent(s, {
                                    ...getCtaContent(s),
                                    backgroundImage: url,
                                  })
                                }
                              />
                            )}

                            <label className="block text-sm font-semibold text-black">
                              Headline
                            </label>
                            <input
                              type="text"
                              value={getCtaContent(s).headline || ""}
                              onChange={(e) =>
                                setCtaContent(s, {
                                  ...getCtaContent(s),
                                  headline: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border rounded text-black"
                            />

                            <label className="block text-sm font-semibold text-black">
                              Subtext
                            </label>
                            <textarea
                              value={getCtaContent(s).subtext || ""}
                              onChange={(e) =>
                                setCtaContent(s, {
                                  ...getCtaContent(s),
                                  subtext: e.target.value,
                                })
                              }
                              rows={3}
                              className="w-full px-3 py-2 border rounded text-black"
                            />

                            <div className="grid md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-semibold text-black">
                                  Primary Text
                                </label>
                                <input
                                  type="text"
                                  value={getCtaContent(s).primaryText || ""}
                                  onChange={(e) =>
                                    setCtaContent(s, {
                                      ...getCtaContent(s),
                                      primaryText: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 border rounded text-black"
                                />
                                <label className="block text-xs font-semibold text-gray-600 mt-2">
                                  Primary URL
                                </label>
                                <input
                                  type="text"
                                  value={getCtaContent(s).primaryUrl || ""}
                                  onChange={(e) =>
                                    setCtaContent(s, {
                                      ...getCtaContent(s),
                                      primaryUrl: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 border rounded text-black"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-black">
                                  Secondary Text
                                </label>
                                <input
                                  type="text"
                                  value={getCtaContent(s).secondaryText || ""}
                                  onChange={(e) =>
                                    setCtaContent(s, {
                                      ...getCtaContent(s),
                                      secondaryText: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 border rounded text-black"
                                />
                                <label className="block text-xs font-semibold text-gray-600 mt-2">
                                  Secondary URL
                                </label>
                                <input
                                  type="text"
                                  value={getCtaContent(s).secondaryUrl || ""}
                                  onChange={(e) =>
                                    setCtaContent(s, {
                                      ...getCtaContent(s),
                                      secondaryUrl: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 border rounded text-black"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-black">
                                Secondary CTA Style
                              </label>
                              <select
                                value={
                                  getCtaContent(s).secondaryCtaVariant ||
                                  "outlined"
                                }
                                onChange={(e) =>
                                  setCtaContent(s, {
                                    ...getCtaContent(s),
                                    secondaryCtaVariant: e.target
                                      .value as CTA["secondaryCtaVariant"],
                                  })
                                }
                                className="w-full px-3 py-2 border rounded text-black"
                              >
                                <option value="outlined">Outlined</option>
                                <option value="text">Text</option>
                                <option value="ghost">Ghost</option>
                              </select>
                            </div>

                            {/* Button Customization Section */}
                            <div className="p-3 border rounded bg-gray-50 mt-4">
                              <label className="block text-sm font-semibold text-black mb-3">
                                🎨 Button Customization
                              </label>

                              {/* Primary Button Options */}
                              <div className="mb-4 p-3 bg-white rounded border">
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                  Primary Button
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-xs text-gray-600 mb-1">
                                      Variant
                                    </label>
                                    <select
                                      value={
                                        getCtaContent(s).primaryButtonStyle
                                          ?.variant || "solid"
                                      }
                                      onChange={(e) =>
                                        setCtaContent(s, {
                                          ...getCtaContent(s),
                                          primaryButtonStyle: {
                                            ...getCtaContent(s)
                                              .primaryButtonStyle,
                                            variant: e.target
                                              .value as ButtonStyle["variant"],
                                          },
                                        })
                                      }
                                      className="w-full px-2 py-1 border rounded text-black text-sm"
                                    >
                                      <option value="solid">Solid</option>
                                      <option value="outline">Outline</option>
                                      <option value="ghost">Ghost</option>
                                      <option value="gradient">Gradient</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-600 mb-1">
                                      Border Radius
                                    </label>
                                    <select
                                      value={
                                        getCtaContent(s).primaryButtonStyle
                                          ?.borderRadius || "0.5rem"
                                      }
                                      onChange={(e) =>
                                        setCtaContent(s, {
                                          ...getCtaContent(s),
                                          primaryButtonStyle: {
                                            ...getCtaContent(s)
                                              .primaryButtonStyle,
                                            borderRadius: e.target.value,
                                          },
                                        })
                                      }
                                      className="w-full px-2 py-1 border rounded text-black text-sm"
                                    >
                                      <option value="0">Square</option>
                                      <option value="0.25rem">
                                        Slightly Rounded
                                      </option>
                                      <option value="0.375rem">Rounded</option>
                                      <option value="0.5rem">
                                        More Rounded
                                      </option>
                                      <option value="1rem">Pill</option>
                                      <option value="9999px">Full Pill</option>
                                    </select>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  <div>
                                    <label className="block text-xs text-gray-600 mb-1">
                                      Background
                                    </label>
                                    <input
                                      type="color"
                                      value={
                                        getCtaContent(s).primaryButtonStyle
                                          ?.bgColor || "#667eea"
                                      }
                                      onChange={(e) =>
                                        setCtaContent(s, {
                                          ...getCtaContent(s),
                                          primaryButtonStyle: {
                                            ...getCtaContent(s)
                                              .primaryButtonStyle,
                                            bgColor: e.target.value,
                                          },
                                        })
                                      }
                                      className="w-full h-8 border rounded cursor-pointer"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-600 mb-1">
                                      Text Color
                                    </label>
                                    <input
                                      type="color"
                                      value={
                                        getCtaContent(s).primaryButtonStyle
                                          ?.textColor || "#ffffff"
                                      }
                                      onChange={(e) =>
                                        setCtaContent(s, {
                                          ...getCtaContent(s),
                                          primaryButtonStyle: {
                                            ...getCtaContent(s)
                                              .primaryButtonStyle,
                                            textColor: e.target.value,
                                          },
                                        })
                                      }
                                      className="w-full h-8 border rounded cursor-pointer"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  <div>
                                    <label className="block text-xs text-gray-600 mb-1">
                                      Hover BG
                                    </label>
                                    <input
                                      type="color"
                                      value={
                                        getCtaContent(s).primaryButtonStyle
                                          ?.hoverBgColor || "#5568d3"
                                      }
                                      onChange={(e) =>
                                        setCtaContent(s, {
                                          ...getCtaContent(s),
                                          primaryButtonStyle: {
                                            ...getCtaContent(s)
                                              .primaryButtonStyle,
                                            hoverBgColor: e.target.value,
                                          },
                                        })
                                      }
                                      className="w-full h-8 border rounded cursor-pointer"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-600 mb-1">
                                      Hover Text
                                    </label>
                                    <input
                                      type="color"
                                      value={
                                        getCtaContent(s).primaryButtonStyle
                                          ?.hoverTextColor || "#ffffff"
                                      }
                                      onChange={(e) =>
                                        setCtaContent(s, {
                                          ...getCtaContent(s),
                                          primaryButtonStyle: {
                                            ...getCtaContent(s)
                                              .primaryButtonStyle,
                                            hoverTextColor: e.target.value,
                                          },
                                        })
                                      }
                                      className="w-full h-8 border rounded cursor-pointer"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  <div>
                                    <label className="block text-xs text-gray-600 mb-1">
                                      Font Size
                                    </label>
                                    <select
                                      value={
                                        getCtaContent(s).primaryButtonStyle
                                          ?.fontSize || "1rem"
                                      }
                                      onChange={(e) =>
                                        setCtaContent(s, {
                                          ...getCtaContent(s),
                                          primaryButtonStyle: {
                                            ...getCtaContent(s)
                                              .primaryButtonStyle,
                                            fontSize: e.target.value,
                                          },
                                        })
                                      }
                                      className="w-full px-2 py-1 border rounded text-black text-sm"
                                    >
                                      <option value="0.75rem">Small</option>
                                      <option value="0.875rem">Medium</option>
                                      <option value="1rem">Default</option>
                                      <option value="1.125rem">Large</option>
                                      <option value="1.25rem">X-Large</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-600 mb-1">
                                      Shadow
                                    </label>
                                    <select
                                      value={
                                        getCtaContent(s).primaryButtonStyle
                                          ?.shadow || "md"
                                      }
                                      onChange={(e) =>
                                        setCtaContent(s, {
                                          ...getCtaContent(s),
                                          primaryButtonStyle: {
                                            ...getCtaContent(s)
                                              .primaryButtonStyle,
                                            shadow: e.target.value,
                                          },
                                        })
                                      }
                                      className="w-full px-2 py-1 border rounded text-black text-sm"
                                    >
                                      <option value="none">None</option>
                                      <option value="sm">Small</option>
                                      <option value="md">Medium</option>
                                      <option value="lg">Large</option>
                                      <option value="xl">X-Large</option>
                                    </select>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 mt-3">
                                  <input
                                    type="checkbox"
                                    id={`ctaPrimaryAnimation-${s.id}`}
                                    checked={
                                      getCtaContent(s).primaryButtonStyle
                                        ?.enableAnimation !== false
                                    }
                                    onChange={(e) =>
                                      setCtaContent(s, {
                                        ...getCtaContent(s),
                                        primaryButtonStyle: {
                                          ...getCtaContent(s)
                                            .primaryButtonStyle,
                                          enableAnimation: e.target.checked,
                                        },
                                      })
                                    }
                                    className="w-4 h-4 rounded border-gray-300"
                                  />
                                  <label
                                    htmlFor={`ctaPrimaryAnimation-${s.id}`}
                                    className="text-xs text-gray-600"
                                  >
                                    Enable Hover Animation
                                  </label>
                                </div>
                                {getCtaContent(s).primaryButtonStyle
                                  ?.enableAnimation !== false && (
                                  <div className="grid grid-cols-2 gap-2 mt-2">
                                    <div>
                                      <label className="block text-xs text-gray-600 mb-1">
                                        Transform (px)
                                      </label>
                                      <input
                                        type="number"
                                        min="0"
                                        max="20"
                                        value={
                                          getCtaContent(s).primaryButtonStyle
                                            ?.transformAmount ?? 2
                                        }
                                        onChange={(e) =>
                                          setCtaContent(s, {
                                            ...getCtaContent(s),
                                            primaryButtonStyle: {
                                              ...getCtaContent(s)
                                                .primaryButtonStyle,
                                              transformAmount: Number(
                                                e.target.value
                                              ),
                                            },
                                          })
                                        }
                                        className="w-full px-2 py-1 border rounded text-black text-xs"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs text-gray-600 mb-1">
                                        Duration (s)
                                      </label>
                                      <input
                                        type="number"
                                        min="0"
                                        max="2"
                                        step="0.1"
                                        value={
                                          getCtaContent(s).primaryButtonStyle
                                            ?.transitionDuration ?? 0.3
                                        }
                                        onChange={(e) =>
                                          setCtaContent(s, {
                                            ...getCtaContent(s),
                                            primaryButtonStyle: {
                                              ...getCtaContent(s)
                                                .primaryButtonStyle,
                                              transitionDuration: Number(
                                                e.target.value
                                              ),
                                            },
                                          })
                                        }
                                        className="w-full px-2 py-1 border rounded text-black text-xs"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Secondary Button Options */}
                              <div className="p-3 bg-white rounded border">
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                  Secondary Button
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-xs text-gray-600 mb-1">
                                      Variant
                                    </label>
                                    <select
                                      value={
                                        getCtaContent(s).secondaryButtonStyle
                                          ?.variant || "outline"
                                      }
                                      onChange={(e) =>
                                        setCtaContent(s, {
                                          ...getCtaContent(s),
                                          secondaryButtonStyle: {
                                            ...getCtaContent(s)
                                              .secondaryButtonStyle,
                                            variant: e.target
                                              .value as ButtonStyle["variant"],
                                          },
                                        })
                                      }
                                      className="w-full px-2 py-1 border rounded text-black text-sm"
                                    >
                                      <option value="solid">Solid</option>
                                      <option value="outline">Outline</option>
                                      <option value="ghost">Ghost</option>
                                      <option value="text">Text Link</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-600 mb-1">
                                      Border Radius
                                    </label>
                                    <select
                                      value={
                                        getCtaContent(s).secondaryButtonStyle
                                          ?.borderRadius || "0.5rem"
                                      }
                                      onChange={(e) =>
                                        setCtaContent(s, {
                                          ...getCtaContent(s),
                                          secondaryButtonStyle: {
                                            ...getCtaContent(s)
                                              .secondaryButtonStyle,
                                            borderRadius: e.target.value,
                                          },
                                        })
                                      }
                                      className="w-full px-2 py-1 border rounded text-black text-sm"
                                    >
                                      <option value="0">Square</option>
                                      <option value="0.25rem">
                                        Slightly Rounded
                                      </option>
                                      <option value="0.375rem">Rounded</option>
                                      <option value="0.5rem">
                                        More Rounded
                                      </option>
                                      <option value="1rem">Pill</option>
                                      <option value="9999px">Full Pill</option>
                                    </select>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  <div>
                                    <label className="block text-xs text-gray-600 mb-1">
                                      Background
                                    </label>
                                    <input
                                      type="color"
                                      value={
                                        getCtaContent(s).secondaryButtonStyle
                                          ?.bgColor || "#ffffff"
                                      }
                                      onChange={(e) =>
                                        setCtaContent(s, {
                                          ...getCtaContent(s),
                                          secondaryButtonStyle: {
                                            ...getCtaContent(s)
                                              .secondaryButtonStyle,
                                            bgColor: e.target.value,
                                          },
                                        })
                                      }
                                      className="w-full h-8 border rounded cursor-pointer"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-600 mb-1">
                                      Text/Border
                                    </label>
                                    <input
                                      type="color"
                                      value={
                                        getCtaContent(s).secondaryButtonStyle
                                          ?.textColor || "#667eea"
                                      }
                                      onChange={(e) =>
                                        setCtaContent(s, {
                                          ...getCtaContent(s),
                                          secondaryButtonStyle: {
                                            ...getCtaContent(s)
                                              .secondaryButtonStyle,
                                            textColor: e.target.value,
                                            borderColor: e.target.value,
                                          },
                                        })
                                      }
                                      className="w-full h-8 border rounded cursor-pointer"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  <div>
                                    <label className="block text-xs text-gray-600 mb-1">
                                      Hover BG
                                    </label>
                                    <input
                                      type="color"
                                      value={
                                        getCtaContent(s).secondaryButtonStyle
                                          ?.hoverBgColor || "#667eea"
                                      }
                                      onChange={(e) =>
                                        setCtaContent(s, {
                                          ...getCtaContent(s),
                                          secondaryButtonStyle: {
                                            ...getCtaContent(s)
                                              .secondaryButtonStyle,
                                            hoverBgColor: e.target.value,
                                          },
                                        })
                                      }
                                      className="w-full h-8 border rounded cursor-pointer"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-600 mb-1">
                                      Hover Text
                                    </label>
                                    <input
                                      type="color"
                                      value={
                                        getCtaContent(s).secondaryButtonStyle
                                          ?.hoverTextColor || "#ffffff"
                                      }
                                      onChange={(e) =>
                                        setCtaContent(s, {
                                          ...getCtaContent(s),
                                          secondaryButtonStyle: {
                                            ...getCtaContent(s)
                                              .secondaryButtonStyle,
                                            hoverTextColor: e.target.value,
                                          },
                                        })
                                      }
                                      className="w-full h-8 border rounded cursor-pointer"
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 mt-3">
                                  <input
                                    type="checkbox"
                                    id={`ctaSecondaryAnimation-${s.id}`}
                                    checked={
                                      getCtaContent(s).secondaryButtonStyle
                                        ?.enableAnimation !== false
                                    }
                                    onChange={(e) =>
                                      setCtaContent(s, {
                                        ...getCtaContent(s),
                                        secondaryButtonStyle: {
                                          ...getCtaContent(s)
                                            .secondaryButtonStyle,
                                          enableAnimation: e.target.checked,
                                        },
                                      })
                                    }
                                    className="w-4 h-4 rounded border-gray-300"
                                  />
                                  <label
                                    htmlFor={`ctaSecondaryAnimation-${s.id}`}
                                    className="text-xs text-gray-600"
                                  >
                                    Enable Hover Animation
                                  </label>
                                </div>
                                {getCtaContent(s).secondaryButtonStyle
                                  ?.enableAnimation !== false && (
                                  <div className="grid grid-cols-2 gap-2 mt-2">
                                    <div>
                                      <label className="block text-xs text-gray-600 mb-1">
                                        Transform (px)
                                      </label>
                                      <input
                                        type="number"
                                        min="0"
                                        max="20"
                                        value={
                                          getCtaContent(s).secondaryButtonStyle
                                            ?.transformAmount ?? 2
                                        }
                                        onChange={(e) =>
                                          setCtaContent(s, {
                                            ...getCtaContent(s),
                                            secondaryButtonStyle: {
                                              ...getCtaContent(s)
                                                .secondaryButtonStyle,
                                              transformAmount: Number(
                                                e.target.value
                                              ),
                                            },
                                          })
                                        }
                                        className="w-full px-2 py-1 border rounded text-black text-xs"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs text-gray-600 mb-1">
                                        Duration (s)
                                      </label>
                                      <input
                                        type="number"
                                        min="0"
                                        max="2"
                                        step="0.1"
                                        value={
                                          getCtaContent(s).secondaryButtonStyle
                                            ?.transitionDuration ?? 0.3
                                        }
                                        onChange={(e) =>
                                          setCtaContent(s, {
                                            ...getCtaContent(s),
                                            secondaryButtonStyle: {
                                              ...getCtaContent(s)
                                                .secondaryButtonStyle,
                                              transitionDuration: Number(
                                                e.target.value
                                              ),
                                            },
                                          })
                                        }
                                        className="w-full px-2 py-1 border rounded text-black text-xs"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="mt-3">
                              <h4 className="font-semibold mb-2">Preview</h4>

                              {(() => {
                                // Helper functions for CTA button preview styles
                                const hexToRgb = (hex: string) => {
                                  const r = parseInt(hex.slice(1, 3), 16);
                                  const g = parseInt(hex.slice(3, 5), 16);
                                  const b = parseInt(hex.slice(5, 7), 16);
                                  return `${r},${g},${b}`;
                                };

                                const getShadowValue = (
                                  shadow: string,
                                  color: string
                                ) => {
                                  switch (shadow) {
                                    case "none":
                                      return "none";
                                    case "sm":
                                      return `0 2px 8px rgba(${color},0.2)`;
                                    case "md":
                                      return `0 4px 15px rgba(${color},0.3)`;
                                    case "lg":
                                      return `0 8px 25px rgba(${color},0.35)`;
                                    case "xl":
                                      return `0 12px 35px rgba(${color},0.4)`;
                                    default:
                                      return `0 4px 15px rgba(${color},0.3)`;
                                  }
                                };

                                const getCtaPrimaryButtonStyle =
                                  (): React.CSSProperties => {
                                    const bs =
                                      getCtaContent(s).primaryButtonStyle || {};
                                    const bgColor = bs.bgColor || "#667eea";
                                    const textColor = bs.textColor || "#ffffff";
                                    const hoverBgColor =
                                      bs.hoverBgColor || "#5568d3";
                                    const borderRadius =
                                      bs.borderRadius || "0.5rem";
                                    const variant = bs.variant || "solid";
                                    const shadow = bs.shadow || "md";
                                    const enableAnimation =
                                      bs.enableAnimation !== false;

                                    const shadowColor = hexToRgb(bgColor);
                                    const shadowValue = getShadowValue(
                                      shadow,
                                      shadowColor
                                    );

                                    const baseStyle: React.CSSProperties = {
                                      padding: "0.5rem 1rem",
                                      borderRadius,
                                      fontWeight: 600,
                                      textDecoration: "none",
                                      display: "inline-block",
                                      ...(enableAnimation && {
                                        transition: "all 0.3s ease",
                                      }),
                                    };

                                    switch (variant) {
                                      case "outline":
                                        return {
                                          ...baseStyle,
                                          background: "transparent",
                                          color: bgColor,
                                          border: `2px solid ${bgColor}`,
                                        };
                                      case "ghost":
                                        return {
                                          ...baseStyle,
                                          background: `${bgColor}15`,
                                          color: bgColor,
                                          border: "none",
                                        };
                                      case "gradient":
                                        return {
                                          ...baseStyle,
                                          background: `linear-gradient(135deg, ${bgColor} 0%, ${hoverBgColor} 100%)`,
                                          color: textColor,
                                          border: "none",
                                          boxShadow: shadowValue,
                                        };
                                      default:
                                        return {
                                          ...baseStyle,
                                          background: bgColor,
                                          color: textColor,
                                          border: "none",
                                          boxShadow: shadowValue,
                                        };
                                    }
                                  };

                                const getCtaSecondaryButtonStyle =
                                  (): React.CSSProperties => {
                                    const bs =
                                      getCtaContent(s).secondaryButtonStyle ||
                                      {};
                                    const bgColor = bs.bgColor || "#ffffff";
                                    const textColor = bs.textColor || "#667eea";
                                    const borderColor =
                                      bs.borderColor || "#667eea";
                                    const borderRadius =
                                      bs.borderRadius || "0.5rem";
                                    const variant = bs.variant || "outline";
                                    const enableAnimation =
                                      bs.enableAnimation !== false;

                                    const baseStyle: React.CSSProperties = {
                                      padding: "0.5rem 1rem",
                                      borderRadius,
                                      fontWeight: 600,
                                      textDecoration: "none",
                                      display: "inline-block",
                                      ...(enableAnimation && {
                                        transition: "all 0.3s ease",
                                      }),
                                    };

                                    switch (variant) {
                                      case "solid":
                                        return {
                                          ...baseStyle,
                                          background: bgColor,
                                          color: textColor,
                                          border: "none",
                                        };
                                      case "ghost":
                                        return {
                                          ...baseStyle,
                                          background: `${textColor}15`,
                                          color: textColor,
                                          border: "none",
                                        };
                                      case "text":
                                        return {
                                          ...baseStyle,
                                          background: "transparent",
                                          color: textColor,
                                          border: "none",
                                          textDecoration: "underline",
                                        };
                                      default:
                                        return {
                                          ...baseStyle,
                                          background: "transparent",
                                          color: textColor,
                                          border: `2px solid ${borderColor}`,
                                        };
                                    }
                                  };

                                // Hover handlers for primary button
                                const getPrimaryHoverHandlers = () => {
                                  const bs =
                                    getCtaContent(s).primaryButtonStyle || {};
                                  const bgColor = bs.bgColor || "#667eea";
                                  const textColor = bs.textColor || "#ffffff";
                                  const hoverBgColor =
                                    bs.hoverBgColor || "#5568d3";
                                  const hoverTextColor =
                                    bs.hoverTextColor || "#ffffff";
                                  const variant = bs.variant || "solid";
                                  const shadow = bs.shadow || "md";
                                  const enableAnimation =
                                    bs.enableAnimation !== false;

                                  const shadowColor = hexToRgb(bgColor);
                                  const shadowValue = getShadowValue(
                                    shadow,
                                    shadowColor
                                  );
                                  const shadowHover = getShadowValue(
                                    shadow === "none"
                                      ? "none"
                                      : shadow === "sm"
                                      ? "md"
                                      : shadow === "md"
                                      ? "lg"
                                      : "xl",
                                    shadowColor
                                  );

                                  const handleMouseEnter = (
                                    e: React.MouseEvent<HTMLAnchorElement>
                                  ) => {
                                    if (!enableAnimation) return;
                                    const btn = e.currentTarget;
                                    btn.style.transform = "translateY(-2px)";
                                    switch (variant) {
                                      case "outline":
                                        btn.style.background = bgColor;
                                        btn.style.color = textColor;
                                        break;
                                      case "ghost":
                                        btn.style.background = `${bgColor}25`;
                                        break;
                                      case "gradient":
                                        btn.style.boxShadow = shadowHover;
                                        break;
                                      default: // solid
                                        btn.style.background = hoverBgColor;
                                        btn.style.color = hoverTextColor;
                                        btn.style.boxShadow = shadowHover;
                                    }
                                  };

                                  const handleMouseLeave = (
                                    e: React.MouseEvent<HTMLAnchorElement>
                                  ) => {
                                    if (!enableAnimation) return;
                                    const btn = e.currentTarget;
                                    btn.style.transform = "translateY(0)";
                                    switch (variant) {
                                      case "outline":
                                        btn.style.background = "transparent";
                                        btn.style.color = bgColor;
                                        break;
                                      case "ghost":
                                        btn.style.background = `${bgColor}15`;
                                        break;
                                      case "gradient":
                                        btn.style.boxShadow = shadowValue;
                                        break;
                                      default: // solid
                                        btn.style.background = bgColor;
                                        btn.style.color = textColor;
                                        btn.style.boxShadow = shadowValue;
                                    }
                                  };

                                  return { handleMouseEnter, handleMouseLeave };
                                };

                                // Hover handlers for secondary button
                                const getSecondaryHoverHandlers = () => {
                                  const bs =
                                    getCtaContent(s).secondaryButtonStyle || {};
                                  const bgColor = bs.bgColor || "#ffffff";
                                  const textColor = bs.textColor || "#667eea";
                                  const hoverBgColor =
                                    bs.hoverBgColor || "#667eea";
                                  const hoverTextColor =
                                    bs.hoverTextColor || "#ffffff";
                                  const borderColor =
                                    bs.borderColor || "#667eea";
                                  const variant = bs.variant || "outline";
                                  const enableAnimation =
                                    bs.enableAnimation !== false;

                                  const handleMouseEnter = (
                                    e: React.MouseEvent<HTMLAnchorElement>
                                  ) => {
                                    if (!enableAnimation) return;
                                    const btn = e.currentTarget;
                                    btn.style.transform = "translateY(-2px)";
                                    switch (variant) {
                                      case "solid":
                                        btn.style.background = hoverBgColor;
                                        btn.style.color = hoverTextColor;
                                        break;
                                      case "ghost":
                                        btn.style.background = `${textColor}25`;
                                        break;
                                      case "text":
                                        btn.style.color = hoverBgColor;
                                        break;
                                      default: // outline
                                        btn.style.background = hoverBgColor;
                                        btn.style.color = hoverTextColor;
                                        btn.style.borderColor = hoverBgColor;
                                    }
                                  };

                                  const handleMouseLeave = (
                                    e: React.MouseEvent<HTMLAnchorElement>
                                  ) => {
                                    if (!enableAnimation) return;
                                    const btn = e.currentTarget;
                                    btn.style.transform = "translateY(0)";
                                    switch (variant) {
                                      case "solid":
                                        btn.style.background = bgColor;
                                        btn.style.color = textColor;
                                        break;
                                      case "ghost":
                                        btn.style.background = `${textColor}15`;
                                        break;
                                      case "text":
                                        btn.style.color = textColor;
                                        break;
                                      default: // outline
                                        btn.style.background = "transparent";
                                        btn.style.color = textColor;
                                        btn.style.borderColor = borderColor;
                                    }
                                  };

                                  return { handleMouseEnter, handleMouseLeave };
                                };

                                const primaryHover = getPrimaryHoverHandlers();
                                const secondaryHover =
                                  getSecondaryHoverHandlers();

                                return (
                                  <>
                                    {/* Variant 1: Centered */}
                                    {getCtaContent(s).ctaVariant === 1 && (
                                      <div
                                        className="p-6 border rounded text-center"
                                        style={{
                                          backgroundColor:
                                            getCtaContent(s).backgroundColor ||
                                            "#f8fafc",
                                          color:
                                            getCtaContent(s).textColor ||
                                            "#111827",
                                        }}
                                      >
                                        <h3 className="text-xl font-bold mb-2">
                                          {getCtaContent(s).headline}
                                        </h3>
                                        <p className="text-sm mb-4">
                                          {getCtaContent(s).subtext}
                                        </p>
                                        <div className="flex justify-center gap-3 flex-wrap">
                                          <a
                                            href={
                                              getCtaContent(s).primaryUrl || "#"
                                            }
                                            style={getCtaPrimaryButtonStyle()}
                                            onMouseEnter={
                                              primaryHover.handleMouseEnter
                                            }
                                            onMouseLeave={
                                              primaryHover.handleMouseLeave
                                            }
                                          >
                                            {getCtaContent(s).primaryText}
                                          </a>
                                          {getCtaContent(s).secondaryText && (
                                            <a
                                              href={
                                                getCtaContent(s).secondaryUrl ||
                                                "#"
                                              }
                                              style={getCtaSecondaryButtonStyle()}
                                              onMouseEnter={
                                                secondaryHover.handleMouseEnter
                                              }
                                              onMouseLeave={
                                                secondaryHover.handleMouseLeave
                                              }
                                            >
                                              {getCtaContent(s).secondaryText}
                                            </a>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {/* Variant 2: Image Left */}
                                    {getCtaContent(s).ctaVariant === 2 && (
                                      <div
                                        className="border rounded"
                                        style={{
                                          backgroundColor:
                                            getCtaContent(s).backgroundColor ||
                                            "#f8fafc",
                                          color:
                                            getCtaContent(s).textColor ||
                                            "#111827",
                                        }}
                                      >
                                        <div className="grid md:grid-cols-2 gap-4 p-6">
                                          <img
                                            src={
                                              getCtaContent(s).sideImage ||
                                              "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22400%22 height=%22300%22/%3E%3C/svg%3E"
                                            }
                                            alt="CTA"
                                            className="w-full h-48 object-cover rounded"
                                          />
                                          <div>
                                            <h3 className="text-xl font-bold mb-2">
                                              {getCtaContent(s).headline}
                                            </h3>
                                            <p className="text-sm mb-4">
                                              {getCtaContent(s).subtext}
                                            </p>
                                            <div className="flex gap-3">
                                              <a
                                                href={
                                                  getCtaContent(s).primaryUrl ||
                                                  "#"
                                                }
                                                style={getCtaPrimaryButtonStyle()}
                                                onMouseEnter={
                                                  primaryHover.handleMouseEnter
                                                }
                                                onMouseLeave={
                                                  primaryHover.handleMouseLeave
                                                }
                                              >
                                                {getCtaContent(s).primaryText}
                                              </a>
                                              {getCtaContent(s)
                                                .secondaryText && (
                                                <a
                                                  href={
                                                    getCtaContent(s)
                                                      .secondaryUrl || "#"
                                                  }
                                                  style={getCtaSecondaryButtonStyle()}
                                                  onMouseEnter={
                                                    secondaryHover.handleMouseEnter
                                                  }
                                                  onMouseLeave={
                                                    secondaryHover.handleMouseLeave
                                                  }
                                                >
                                                  {
                                                    getCtaContent(s)
                                                      .secondaryText
                                                  }
                                                </a>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Variant 3: Image Right */}
                                    {getCtaContent(s).ctaVariant === 3 && (
                                      <div
                                        className="border rounded"
                                        style={{
                                          backgroundColor:
                                            getCtaContent(s).backgroundColor ||
                                            "#f8fafc",
                                          color:
                                            getCtaContent(s).textColor ||
                                            "#111827",
                                        }}
                                      >
                                        <div className="grid md:grid-cols-2 gap-4 p-6">
                                          <div>
                                            <h3 className="text-xl font-bold mb-2">
                                              {getCtaContent(s).headline}
                                            </h3>
                                            <p className="text-sm mb-4">
                                              {getCtaContent(s).subtext}
                                            </p>
                                            <div className="flex gap-3">
                                              <a
                                                href={
                                                  getCtaContent(s).primaryUrl ||
                                                  "#"
                                                }
                                                style={getCtaPrimaryButtonStyle()}
                                                onMouseEnter={
                                                  primaryHover.handleMouseEnter
                                                }
                                                onMouseLeave={
                                                  primaryHover.handleMouseLeave
                                                }
                                              >
                                                {getCtaContent(s).primaryText}
                                              </a>
                                              {getCtaContent(s)
                                                .secondaryText && (
                                                <a
                                                  href={
                                                    getCtaContent(s)
                                                      .secondaryUrl || "#"
                                                  }
                                                  style={getCtaSecondaryButtonStyle()}
                                                  onMouseEnter={
                                                    secondaryHover.handleMouseEnter
                                                  }
                                                  onMouseLeave={
                                                    secondaryHover.handleMouseLeave
                                                  }
                                                >
                                                  {
                                                    getCtaContent(s)
                                                      .secondaryText
                                                  }
                                                </a>
                                              )}
                                            </div>
                                          </div>
                                          <img
                                            src={
                                              getCtaContent(s).sideImage ||
                                              "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22400%22 height=%22300%22/%3E%3C/svg%3E"
                                            }
                                            alt="CTA"
                                            className="w-full h-48 object-cover rounded"
                                          />
                                        </div>
                                      </div>
                                    )}

                                    {/* Variant 4: Background Image */}
                                    {getCtaContent(s).ctaVariant === 4 && (
                                      <div
                                        className="p-8 border rounded text-center text-white relative overflow-hidden"
                                        style={{
                                          backgroundImage: `url('${
                                            getCtaContent(s).backgroundImage
                                          }')`,
                                          backgroundSize: "cover",
                                          backgroundPosition: "center",
                                          minHeight: "300px",
                                        }}
                                      >
                                        <div
                                          className="absolute inset-0"
                                          style={{
                                            backgroundColor: "rgba(0,0,0,0.4)",
                                          }}
                                        ></div>
                                        <div className="relative z-10">
                                          <h3 className="text-xl font-bold mb-2">
                                            {getCtaContent(s).headline}
                                          </h3>
                                          <p className="text-sm mb-4">
                                            {getCtaContent(s).subtext}
                                          </p>
                                          <div className="flex justify-center gap-3 flex-wrap">
                                            <a
                                              href={
                                                getCtaContent(s).primaryUrl ||
                                                "#"
                                              }
                                              style={getCtaPrimaryButtonStyle()}
                                              onMouseEnter={
                                                primaryHover.handleMouseEnter
                                              }
                                              onMouseLeave={
                                                primaryHover.handleMouseLeave
                                              }
                                            >
                                              {getCtaContent(s).primaryText}
                                            </a>
                                            {getCtaContent(s).secondaryText && (
                                              <a
                                                href={
                                                  getCtaContent(s)
                                                    .secondaryUrl || "#"
                                                }
                                                style={getCtaSecondaryButtonStyle()}
                                                onMouseEnter={
                                                  secondaryHover.handleMouseEnter
                                                }
                                                onMouseLeave={
                                                  secondaryHover.handleMouseLeave
                                                }
                                              >
                                                {getCtaContent(s).secondaryText}
                                              </a>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        )}
                        {s.type === "imagetextblock" && (
                          <div>
                            <TextImageBlockEditor
                              block={getTextImageBlock(s)}
                              onChange={(b) => setTextImageBlock(s, b)}
                              initialExpanded={true}
                            />
                          </div>
                        )}
                        {s.type === "blog" && (
                          <div>
                            <BlogEditor
                              blog={getBlogContent(s)}
                              onChange={(b) => setBlogContent(s, b)}
                              initialExpanded={true}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              <div className="bg-white p-3 rounded border">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">Navigation</div>
                  <div className="flex gap-2">
                    <button
                      className="px-2 py-1 border rounded"
                      onClick={() => setNavExpanded((v) => !v)}
                    >
                      {navExpanded ? "Minimize" : "Expand"}
                    </button>
                  </div>
                </div>
                {navExpanded ? (
                  <div className="mt-3">
                    <NavItemsEditor
                      navConfig={navConfig}
                      setNavConfig={setNavConfig}
                    />
                    <div className="mt-4 border-t pt-4">
                      <h3 className="font-medium mb-2">Navigation Style</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm mb-1">
                            Background
                          </label>
                          <input
                            type="color"
                            value={
                              (navConfig as any).navStyle?.backgroundColor ||
                              defaultNavStyle.backgroundColor
                            }
                            onChange={(e) =>
                              setNavConfig((prev: any) => ({
                                ...prev,
                                navStyle: {
                                  ...(prev?.navStyle || {}),
                                  backgroundColor: e.target.value,
                                },
                              }))
                            }
                            className="w-16 h-9 p-0 border rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-sm mb-1">
                            Text Color
                          </label>
                          <input
                            type="color"
                            value={
                              (navConfig as any).navStyle?.textColor ||
                              defaultNavStyle.textColor
                            }
                            onChange={(e) =>
                              setNavConfig((prev: any) => ({
                                ...prev,
                                navStyle: {
                                  ...(prev?.navStyle || {}),
                                  textColor: e.target.value,
                                },
                              }))
                            }
                            className="w-16 h-9 p-0 border rounded"
                          />
                        </div>

                        <div>
                          <label className="block text-sm mb-1">
                            Hover Background
                          </label>
                          <input
                            type="color"
                            value={
                              (navConfig as any).navStyle?.hoverBackground ||
                              defaultNavStyle.hoverBackground
                            }
                            onChange={(e) =>
                              setNavConfig((prev: any) => ({
                                ...prev,
                                navStyle: {
                                  ...(prev?.navStyle || {}),
                                  hoverBackground: e.target.value,
                                },
                              }))
                            }
                            className="w-16 h-9 p-0 border rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-sm mb-1">
                            Hover Text Color
                          </label>
                          <input
                            type="color"
                            value={
                              (navConfig as any).navStyle?.hoverTextColor ||
                              defaultNavStyle.hoverTextColor
                            }
                            onChange={(e) =>
                              setNavConfig((prev: any) => ({
                                ...prev,
                                navStyle: {
                                  ...(prev?.navStyle || {}),
                                  hoverTextColor: e.target.value,
                                },
                              }))
                            }
                            className="w-16 h-9 p-0 border rounded"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-sm mb-1">
                            Hover Effect
                          </label>
                          <select
                            value={
                              (navConfig as any).navStyle?.hoverEffect ||
                              defaultNavStyle.hoverEffect
                            }
                            onChange={(e) =>
                              setNavConfig((prev: any) => ({
                                ...prev,
                                navStyle: {
                                  ...(prev?.navStyle || {}),
                                  hoverEffect: e.target.value,
                                },
                              }))
                            }
                            className="w-full px-2 py-1 border rounded"
                          >
                            <option value="underline">Underline</option>
                            <option value="text-color">Text Color</option>
                            <option value="background">Background</option>
                            <option value="underline-and-bg">
                              Underline + Background
                            </option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm mb-1">
                            Underline Color
                          </label>
                          <input
                            type="color"
                            value={
                              (navConfig as any).navStyle?.underlineColor ||
                              defaultNavStyle.underlineColor
                            }
                            onChange={(e) =>
                              setNavConfig((prev: any) => ({
                                ...prev,
                                navStyle: {
                                  ...(prev?.navStyle || {}),
                                  underlineColor: e.target.value,
                                },
                              }))
                            }
                            className="w-16 h-9 p-0 border rounded"
                          />
                        </div>

                        <div>
                          <label className="block text-sm mb-1">
                            Underline Thickness
                          </label>
                          <input
                            type="number"
                            value={
                              (navConfig as any).navStyle?.underlineThickness ||
                              defaultNavStyle.underlineThickness
                            }
                            onChange={(e) =>
                              setNavConfig((prev: any) => ({
                                ...prev,
                                navStyle: {
                                  ...(prev?.navStyle || {}),
                                  underlineThickness: Number(e.target.value),
                                },
                              }))
                            }
                            className="w-full px-2 py-1 border rounded"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 text-sm text-gray-700">
                    Quick view: {navConfig.brandName || "(no brand)"} —{" "}
                    {navConfig.navItems?.length || 0} links
                  </div>
                )}
              </div>

              <div className="bg-white p-3 rounded border">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">Footer</div>
                  <div className="flex gap-2">
                    <button
                      className="px-2 py-1 border rounded"
                      onClick={() => setFooterExpanded((v) => !v)}
                    >
                      {footerExpanded ? "Minimize" : "Expand"}
                    </button>
                  </div>
                </div>
                {footerExpanded ? (
                  <div className="mt-3">
                    <FooterSectionsEditor
                      footerConfig={footerConfig}
                      setFooterConfig={setFooterConfig}
                      footerSectionsText={footerSectionsText}
                      setFooterSectionsText={(t) => {
                        setFooterSectionsText(t);
                        setFooterHtml(renderFooterHtml(footerConfig, t));
                      }}
                      editingFooter={true}
                    />
                    <div className="mt-4 border-t pt-4">
                      <h3 className="font-medium mb-2">Footer Style</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm mb-1">
                            Background
                          </label>
                          <input
                            type="color"
                            value={
                              (footerConfig as any).footerStyle
                                ?.backgroundColor ||
                              defaultFooterStyle.backgroundColor
                            }
                            onChange={(e) =>
                              setFooterConfig({
                                ...footerConfig,
                                footerStyle: {
                                  ...(footerConfig as any).footerStyle,
                                  backgroundColor: e.target.value,
                                },
                              })
                            }
                            className="w-16 h-9 p-0 border rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-sm mb-1">
                            Text Color
                          </label>
                          <input
                            type="color"
                            value={
                              (footerConfig as any).footerStyle?.textColor ||
                              defaultFooterStyle.textColor
                            }
                            onChange={(e) =>
                              setFooterConfig({
                                ...footerConfig,
                                footerStyle: {
                                  ...(footerConfig as any).footerStyle,
                                  textColor: e.target.value,
                                },
                              })
                            }
                            className="w-16 h-9 p-0 border rounded"
                          />
                        </div>

                        <div>
                          <label className="block text-sm mb-1">
                            Hover Background
                          </label>
                          <input
                            type="color"
                            value={
                              (footerConfig as any).footerStyle
                                ?.hoverBackground ||
                              defaultFooterStyle.hoverBackground
                            }
                            onChange={(e) =>
                              setFooterConfig({
                                ...footerConfig,
                                footerStyle: {
                                  ...(footerConfig as any).footerStyle,
                                  hoverBackground: e.target.value,
                                },
                              })
                            }
                            className="w-16 h-9 p-0 border rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-sm mb-1">
                            Hover Text Color
                          </label>
                          <input
                            type="color"
                            value={
                              (footerConfig as any).footerStyle
                                ?.hoverTextColor ||
                              defaultFooterStyle.hoverTextColor
                            }
                            onChange={(e) =>
                              setFooterConfig({
                                ...footerConfig,
                                footerStyle: {
                                  ...(footerConfig as any).footerStyle,
                                  hoverTextColor: e.target.value,
                                },
                              })
                            }
                            className="w-16 h-9 p-0 border rounded"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-sm mb-1">
                            Hover Effect
                          </label>
                          <select
                            value={
                              (footerConfig as any).footerStyle?.hoverEffect ||
                              defaultFooterStyle.hoverEffect
                            }
                            onChange={(e) =>
                              setFooterConfig({
                                ...footerConfig,
                                footerStyle: {
                                  ...(footerConfig as any).footerStyle,
                                  hoverEffect: e.target.value as any,
                                },
                              })
                            }
                            className="w-full px-2 py-1 border rounded"
                          >
                            <option value="text-color">Text Color</option>
                            <option value="underline">Underline</option>
                            <option value="background">Background</option>
                            <option value="underline-and-bg">
                              Underline + Background
                            </option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm mb-1">
                            Underline Color
                          </label>
                          <input
                            type="color"
                            value={
                              (footerConfig as any).footerStyle
                                ?.underlineColor ||
                              defaultFooterStyle.underlineColor
                            }
                            onChange={(e) =>
                              setFooterConfig({
                                ...footerConfig,
                                footerStyle: {
                                  ...(footerConfig as any).footerStyle,
                                  underlineColor: e.target.value,
                                },
                              })
                            }
                            className="w-16 h-9 p-0 border rounded"
                          />
                        </div>

                        <div>
                          <label className="block text-sm mb-1">
                            Underline Thickness (px)
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={
                              (footerConfig as any).footerStyle
                                ?.underlineThickness ||
                              defaultFooterStyle.underlineThickness
                            }
                            onChange={(e) =>
                              setFooterConfig({
                                ...footerConfig,
                                footerStyle: {
                                  ...(footerConfig as any).footerStyle,
                                  underlineThickness: Number(e.target.value),
                                },
                              })
                            }
                            className="w-full px-2 py-1 border rounded"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 text-sm text-gray-700">
                    Quick view: {footerConfig.companyName || "(no company)"} —{" "}
                    {footerConfig.footerSections?.length || 0} columns
                  </div>
                )}
              </div>

              {/* footer preview removed per user request */}
            </div>

            <div className="mt-4 flex gap-2 justify-end">
              <button
                className="px-3 py-1 border rounded"
                onClick={() => {
                  console.log("PREVIEW BUTTON CLICKED");
                  handlePreview();
                }}
              >
                Preview Page
              </button>
              <button
                className="px-3 py-1 bg-green-600 text-white rounded"
                onClick={onSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save & Publish"}
              </button>
            </div>
          </div>

          {isDraggingOverlay && (
            <div className="absolute top-16 right-4 bg-white p-2 rounded shadow z-50">
              <div className="text-sm mb-2">Drop position</div>
              {sections.map((_, idx) => (
                <div
                  key={idx}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    const fromIdx = sections.findIndex((s) => s.id === dragId);
                    if (fromIdx === -1) return;
                    const copy = sections.slice();
                    const [moved] = copy.splice(fromIdx, 1);
                    copy.splice(idx, 0, moved);
                    setSections(copy);
                    setIsDraggingOverlay(false);
                    setDragId(null);
                  }}
                  className="px-2 py-1 border rounded mb-1 cursor-pointer hover:bg-gray-100"
                >
                  {idx + 1}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
