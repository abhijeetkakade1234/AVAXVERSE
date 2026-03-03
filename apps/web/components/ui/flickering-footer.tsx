"use client";

import { ChevronRight } from "lucide-react";
import * as Color from "color-bits";
import { motion } from "motion/react";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Helper function to convert any CSS color to rgba
export const getRGBA = (
    cssColor: React.CSSProperties["color"],
    fallback: string = "rgba(180, 180, 180)",
): string => {
    if (typeof window === "undefined") return fallback;
    if (!cssColor) return fallback;

    try {
        // Handle CSS variables
        if (typeof cssColor === "string" && cssColor.startsWith("var(")) {
            const element = document.createElement("div");
            element.style.color = cssColor;
            document.body.appendChild(element);
            const computedColor = window.getComputedStyle(element).color;
            document.body.removeChild(element);
            return Color.formatRGBA(Color.parse(computedColor));
        }

        return Color.formatRGBA(Color.parse(cssColor));
    } catch (e) {
        console.error("Color parsing failed:", e);
        return fallback;
    }
};

// Helper function to add opacity to an RGB color string
export const colorWithOpacity = (color: string, opacity: number): string => {
    if (!color.startsWith("rgb")) return color;
    return Color.formatRGBA(Color.alpha(Color.parse(color), opacity));
};

// Tremor Raw focusInput [v0.0.1]
export const focusInput = [
    "focus:ring-2",
    "focus:ring-blue-200 focus:dark:ring-blue-700/30",
    "focus:border-blue-500 focus:dark:border-blue-700",
];

// Tremor Raw focusRing [v0.0.1]
export const focusRing = [
    "outline outline-offset-2 outline-0 focus-visible:outline-2",
    "outline-blue-500 dark:outline-blue-500",
];

// Tremor Raw hasErrorInput [v0.0.1]
export const hasErrorInput = [
    "ring-2",
    "border-red-500 dark:border-red-700",
    "ring-red-200 dark:ring-red-700/30",
];

export const Icons = {
    logo: ({ className }: { className?: string }) => (
        <svg
            width="42"
            height="24"
            viewBox="0 0 42 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("size-4 fill-[var(--secondary)]", className)}
        >
            <g clipPath="url(#clip0_322_9172)">
                <path
                    d="M22.3546 0.96832C22.9097 0.390834 23.6636 0.0664062 24.4487 0.0664062C27.9806 0.0664062 31.3091 0.066408 34.587 0.0664146C41.1797 0.0664284 44.481 8.35854 39.8193 13.2082L29.6649 23.7718C29.1987 24.2568 28.4016 23.9133 28.4016 23.2274V13.9234L29.5751 12.7025C30.5075 11.7326 29.8472 10.0742 28.5286 10.0742H13.6016L22.3546 0.96832Z"
                    fill="current"
                />
                <path
                    d="M19.6469 23.0305C19.0919 23.608 18.338 23.9324 17.5529 23.9324C14.021 23.9324 10.6925 23.9324 7.41462 23.9324C0.821896 23.9324 -2.47942 15.6403 2.18232 10.7906L12.3367 0.227022C12.8029 -0.257945 13.6 0.0855283 13.6 0.771372L13.6 10.0754L12.4265 11.2963C11.4941 12.2662 12.1544 13.9246 13.473 13.9246L28.4001 13.9246L19.6469 23.0305Z"
                    fill="current"
                />
            </g>
            <defs>
                <clipPath id="clip0_322_9172">
                    <rect width="42" height="24" fill="white" />
                </clipPath>
            </defs>
        </svg>
    ),
    soc2: ({ className }: { className?: string }) => (
        <svg
            width="46"
            height="45"
            viewBox="0 0 46 45"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("size-4", className)}
        >
            <g>
                <rect
                    x="3"
                    y="0.863281"
                    width="40"
                    height="40"
                    rx="20"
                    fill="url(#paint0_linear_1_4900)"
                />
                <g>
                    <rect
                        x="6.15784"
                        y="4.021"
                        width="33.6842"
                        height="33.6842"
                        rx="16.8421"
                        fill="url(#paint1_linear_1_4900)"
                    />
                    <path
                        d="M15.0475 29.6233C13.7506 29.6233 12.9548 28.8938 12.8738 27.8033L13.8464 27.7443C13.9348 28.4222 14.3401 28.798 15.0622 28.798C15.6812 28.798 16.0348 28.5696 16.0348 28.1201C16.0348 27.7148 15.8285 27.4717 14.7601 27.2212C13.4633 26.9264 12.977 26.558 12.977 25.7033C12.977 24.7896 13.6917 24.1559 14.8633 24.1559C16.1159 24.1559 16.8012 24.8854 16.9191 25.8948L15.9538 25.9391C15.8875 25.3717 15.5117 24.9812 14.8485 24.9812C14.2959 24.9812 13.957 25.2612 13.957 25.6664C13.957 26.0938 14.2001 26.2559 15.1359 26.4696C16.5433 26.7717 17.0148 27.2875 17.0148 28.0685C17.0148 29.0264 16.2338 29.6233 15.0475 29.6233ZM19.9915 29.6233C18.4367 29.6233 17.5009 28.5843 17.5009 26.897C17.5009 25.2096 18.4367 24.1559 19.9915 24.1559C21.5536 24.1559 22.4894 25.2096 22.4894 26.897C22.4894 28.5843 21.5536 29.6233 19.9915 29.6233ZM19.9915 28.7906C20.942 28.7906 21.502 28.0906 21.502 26.897C21.502 25.7033 20.942 24.9885 19.9915 24.9885C19.0557 24.9885 18.4883 25.7033 18.4883 26.897C18.4883 28.0906 19.0557 28.7906 19.9915 28.7906ZM25.324 29.6233C23.8945 29.6233 22.8997 28.6064 22.8997 26.897C22.8997 25.2169 23.865 24.1559 25.3313 24.1559C26.665 24.1559 27.3797 24.8559 27.6082 26.0422L26.6061 26.0938C26.4734 25.4085 26.0534 24.9885 25.3313 24.9885C24.4397 24.9885 23.8871 25.7327 23.8871 26.897C23.8871 28.0759 24.4545 28.7906 25.324 28.7906C26.105 28.7906 26.5176 28.3412 26.6355 27.5896L27.6082 27.6412C27.4313 28.8717 26.6429 29.6233 25.324 29.6233ZM29.6489 29.5054C29.6489 28.238 30.1205 27.5085 31.5573 26.7569C32.2721 26.3812 32.53 26.1748 32.53 25.7327C32.53 25.298 32.2426 24.9885 31.6826 24.9885C31.0858 24.9885 30.7321 25.3348 30.651 25.9685L29.6637 25.9096C29.7668 24.8191 30.4889 24.1559 31.6826 24.1559C32.8395 24.1559 33.5173 24.7896 33.5173 25.718C33.5173 26.5212 33.1416 26.897 32.1173 27.4422C31.2479 27.9064 30.8279 28.3485 30.7984 28.6727H33.5173V29.5054H29.6489Z"
                        fill="#101828"
                    />
                    <path
                        d="M13.0537 17.8882L14.9621 12.6566H15.6253L17.5263 17.8882H16.9811L16.4211 16.3187H14.159L13.599 17.8882H13.0537ZM14.3285 15.8324H16.2516L15.2937 13.1061L14.3285 15.8324ZM18.026 17.8882V12.6566H18.5271V17.8882H18.026ZM21.5495 18.0061C20.1642 18.0061 19.2506 16.9745 19.2506 15.2798C19.2506 13.585 20.1642 12.5387 21.5495 12.5387C22.7727 12.5387 23.4506 13.2387 23.6642 14.3292L23.1337 14.3661C22.9863 13.5482 22.4632 13.0324 21.5495 13.0324C20.4811 13.0324 19.7737 13.8798 19.7737 15.2798C19.7737 16.6798 20.4811 17.5124 21.5495 17.5124C22.5074 17.5124 23.0453 16.9598 23.1779 16.0608L23.7085 16.0977C23.5242 17.2471 22.7727 18.0061 21.5495 18.0061ZM24.5062 17.8882V12.6566H26.3409C27.4904 12.6566 28.1683 13.2461 28.1683 14.2187C28.1683 15.1913 27.4904 15.7808 26.3409 15.7808H25.0072V17.8882H24.5062ZM25.0072 15.2945H26.3409C27.1957 15.2945 27.6378 14.9187 27.6378 14.2187C27.6378 13.5113 27.1957 13.1429 26.3409 13.1429H25.0072V15.2945ZM27.9425 17.8882L29.851 12.6566H30.5141L32.4152 17.8882H31.8699L31.3099 16.3187H29.0478L28.4878 17.8882H27.9425ZM29.2173 15.8324H31.1404L30.1825 13.1061L29.2173 15.8324Z"
                        fill="#6A7282"
                    />
                    <line
                        x1="10.4938"
                        y1="21.2488"
                        x2="34.988"
                        y2="21.2488"
                        stroke="#E5E7EB"
                        strokeWidth="0.263158"
                    />
                </g>
            </g>
            <defs>
                <linearGradient
                    id="paint0_linear_1_4900"
                    x1="9.88803"
                    y1="6.55415"
                    x2="36.0447"
                    y2="35.5773"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#F9FAFB" />
                    <stop offset="1" stopColor="#E5E7EB" />
                </linearGradient>
                <linearGradient
                    id="paint1_linear_1_4900"
                    x1="11.9583"
                    y1="8.8133"
                    x2="33.9849"
                    y2="33.2538"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#E5E7EB" />
                    <stop offset="1" stopColor="#F9FAFB" />
                </linearGradient>
            </defs>
        </svg>
    ),
    soc2Dark: ({ className }: { className?: string }) => (
        <svg
            width="46"
            height="45"
            viewBox="0 0 46 45"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("size-4", className)}
        >
            <g>
                <rect
                    x="3"
                    y="0.863281"
                    width="40"
                    height="40"
                    rx="20"
                    fill="url(#paint0_linear_1_2018)"
                />
                <g>
                    <rect
                        x="6.1579"
                        y="4.021"
                        width="33.6842"
                        height="33.6842"
                        rx="16.8421"
                        fill="url(#paint1_linear_1_2018)"
                    />
                    <path
                        d="M15.0441 29.6233C14.6118 29.6233 14.2385 29.5496 13.9241 29.4022C13.6097 29.2499 13.3617 29.0362 13.1799 28.7612C12.9982 28.4861 12.8925 28.1668 12.8631 27.8033L13.8357 27.7443C13.8701 27.9752 13.9364 28.1692 14.0346 28.3264C14.1329 28.4787 14.2655 28.5966 14.4325 28.6801C14.6045 28.7587 14.8132 28.798 15.0589 28.798C15.3683 28.798 15.6066 28.7415 15.7736 28.6285C15.9455 28.5106 16.0315 28.3412 16.0315 28.1201C16.0315 27.9777 15.9971 27.8573 15.9283 27.7591C15.8596 27.6559 15.7343 27.5626 15.5525 27.4791C15.3708 27.3906 15.1055 27.3047 14.7567 27.2212C14.3097 27.118 13.9585 27.005 13.7031 26.8822C13.4476 26.7545 13.261 26.5973 13.1431 26.4106C13.0301 26.224 12.9736 25.9882 12.9736 25.7033C12.9736 25.3987 13.0473 25.131 13.1946 24.9001C13.3469 24.6643 13.5655 24.4826 13.8504 24.3548C14.1353 24.2222 14.4718 24.1559 14.8599 24.1559C15.2627 24.1559 15.6115 24.2296 15.9062 24.3769C16.201 24.5243 16.4318 24.7282 16.5989 24.9885C16.7659 25.2489 16.869 25.551 16.9083 25.8948L15.9431 25.9391C15.9234 25.7475 15.8669 25.5805 15.7736 25.438C15.6803 25.2906 15.555 25.1777 15.3978 25.0991C15.2455 25.0205 15.0613 24.9812 14.8452 24.9812C14.5701 24.9812 14.3515 25.045 14.1894 25.1727C14.0273 25.2955 13.9462 25.4601 13.9462 25.6664C13.9462 25.8089 13.9806 25.9268 14.0494 26.0201C14.1182 26.1134 14.2336 26.1945 14.3957 26.2633C14.5627 26.3271 14.8059 26.3959 15.1252 26.4696C15.5869 26.5678 15.9553 26.6931 16.2304 26.8454C16.5055 26.9927 16.702 27.1671 16.8199 27.3685C16.9427 27.565 17.0041 27.7984 17.0041 28.0685C17.0041 28.3829 16.9231 28.658 16.761 28.8938C16.5989 29.1247 16.368 29.304 16.0683 29.4317C15.7736 29.5594 15.4322 29.6233 15.0441 29.6233ZM19.9881 29.6233C19.4723 29.6233 19.0277 29.5152 18.6544 29.2991C18.2811 29.078 17.9937 28.7636 17.7923 28.3559C17.5909 27.9433 17.4902 27.4569 17.4902 26.897C17.4902 26.3369 17.5909 25.8506 17.7923 25.438C17.9937 25.0254 18.2811 24.7085 18.6544 24.4875C19.0277 24.2664 19.4723 24.1559 19.9881 24.1559C20.5039 24.1559 20.9484 24.2664 21.3218 24.4875C21.7 24.7085 21.9874 25.0254 22.1839 25.438C22.3853 25.8506 22.486 26.3369 22.486 26.897C22.486 27.4569 22.3853 27.9433 22.1839 28.3559C21.9874 28.7636 21.7 29.078 21.3218 29.2991C20.9484 29.5152 20.5039 29.6233 19.9881 29.6233ZM19.9881 28.7906C20.3025 28.7906 20.5727 28.717 20.7986 28.5696C21.0246 28.4173 21.1965 28.1987 21.3144 27.9138C21.4323 27.6289 21.4913 27.2899 21.4913 26.897C21.4913 26.4991 21.4323 26.1577 21.3144 25.8727C21.1965 25.5878 21.0246 25.3692 20.7986 25.2169C20.5727 25.0647 20.3025 24.9885 19.9881 24.9885C19.6737 24.9885 19.4035 25.0647 19.1776 25.2169C18.9565 25.3692 18.7846 25.5878 18.6618 25.8727C18.5439 26.1577 18.4849 26.4991 18.4849 26.897C18.4849 27.2899 18.5439 27.6289 18.6618 27.9138C18.7846 28.1987 18.9565 28.4173 19.1776 28.5696C19.4035 28.717 19.6737 28.7906 19.9881 28.7906ZM25.3276 29.6233C24.8511 29.6233 24.4311 29.5152 24.0676 29.2991C23.7041 29.078 23.4192 28.7612 23.2129 28.3485C23.0066 27.9359 22.9034 27.452 22.9034 26.897C22.9034 26.3468 23.0041 25.8654 23.2055 25.4527C23.4069 25.0352 23.6894 24.7159 24.0529 24.4948C24.4213 24.2689 24.8511 24.1559 25.3423 24.1559C25.9908 24.1559 26.5016 24.318 26.875 24.6422C27.2532 24.9664 27.4988 25.4331 27.6118 26.0422L26.6097 26.0938C26.5459 25.745 26.4059 25.4748 26.1897 25.2833C25.9785 25.0868 25.696 24.9885 25.3423 24.9885C25.0476 24.9885 24.7897 25.0671 24.5687 25.2243C24.3525 25.3766 24.1855 25.5977 24.0676 25.8875C23.9546 26.1724 23.8981 26.5089 23.8981 26.897C23.8981 27.285 23.9571 27.6215 24.075 27.9064C24.1929 28.1913 24.3599 28.4099 24.576 28.5622C24.7922 28.7145 25.0452 28.7906 25.335 28.7906C25.7132 28.7906 26.0104 28.6875 26.2266 28.4812C26.4427 28.2699 26.5802 27.9727 26.6392 27.5896L27.6413 27.6412C27.5381 28.2699 27.2876 28.7587 26.8897 29.1075C26.4967 29.4513 25.976 29.6233 25.3276 29.6233ZM29.6598 29.5054C29.6598 29.078 29.7187 28.7071 29.8366 28.3927C29.9594 28.0734 30.1584 27.7836 30.4335 27.5233C30.7086 27.2629 31.0868 27.0075 31.5682 26.7569C31.8236 26.6194 32.0177 26.504 32.1503 26.4106C32.2879 26.3124 32.3861 26.2117 32.445 26.1085C32.5089 26.0054 32.5408 25.8801 32.5408 25.7327C32.5408 25.5068 32.4671 25.3275 32.3198 25.1948C32.1724 25.0573 31.9636 24.9885 31.6935 24.9885C31.3987 24.9885 31.1629 25.072 30.9861 25.2391C30.8093 25.4061 30.7012 25.6492 30.6619 25.9685L29.6745 25.9096C29.7236 25.3594 29.9226 24.9296 30.2714 24.6201C30.625 24.3106 31.0991 24.1559 31.6935 24.1559C32.0717 24.1559 32.3984 24.2222 32.6735 24.3548C32.9535 24.4826 33.1647 24.6643 33.3071 24.9001C33.4545 25.1359 33.5282 25.4085 33.5282 25.718C33.5282 25.9882 33.4815 26.2166 33.3882 26.4033C33.2998 26.5899 33.1573 26.7619 32.9608 26.9191C32.7693 27.0762 32.4917 27.2506 32.1282 27.4422C31.7057 27.6682 31.384 27.8892 31.1629 28.1054C30.9419 28.3166 30.824 28.5057 30.8093 28.6727H33.5282V29.5054H29.6598Z"
                        fill="#F4F4F5"
                    />
                    <path
                        d="M14.883 12.6566H15.5462L17.4546 17.8882H16.9094L16.3494 16.3187H14.0873L13.5273 17.8882H12.982L14.883 12.6566ZM16.1799 15.8324L15.2146 13.1061L14.2567 15.8324H16.1799ZM18.0764 12.6566H18.5775V17.8882H18.0764V12.6566ZM21.6147 18.0061C21.1578 18.0061 20.755 17.898 20.4062 17.6819C20.0624 17.4608 19.7947 17.144 19.6031 16.7313C19.4115 16.3187 19.3157 15.8349 19.3157 15.2798C19.3157 14.7247 19.4115 14.2408 19.6031 13.8282C19.7947 13.4106 20.0624 13.0913 20.4062 12.8703C20.755 12.6492 21.1578 12.5387 21.6147 12.5387C22.2091 12.5387 22.6831 12.6959 23.0368 13.0103C23.3905 13.3247 23.6238 13.7643 23.7368 14.3292L23.2062 14.3661C23.1277 13.9485 22.9533 13.6219 22.6831 13.3861C22.4178 13.1503 22.0617 13.0324 21.6147 13.0324C21.261 13.0324 20.9491 13.1233 20.6789 13.305C20.4136 13.4819 20.2073 13.7398 20.0599 14.0787C19.9175 14.4177 19.8462 14.818 19.8462 15.2798C19.8462 15.7415 19.9175 16.1419 20.0599 16.4808C20.2073 16.8149 20.4136 17.0703 20.6789 17.2471C20.9491 17.424 21.261 17.5124 21.6147 17.5124C22.0862 17.5124 22.4596 17.3871 22.7347 17.1366C23.0098 16.8812 23.1817 16.5226 23.2505 16.0608L23.781 16.0977C23.6877 16.6871 23.4519 17.1538 23.0736 17.4977C22.7003 17.8366 22.214 18.0061 21.6147 18.0061ZM24.571 12.6566H26.4058C26.784 12.6566 27.1082 12.7205 27.3784 12.8482C27.6535 12.971 27.8647 13.1503 28.0121 13.3861C28.1594 13.617 28.2331 13.8945 28.2331 14.2187C28.2331 14.538 28.1594 14.8156 28.0121 15.0513C27.8647 15.2871 27.6535 15.4689 27.3784 15.5966C27.1082 15.7194 26.784 15.7808 26.4058 15.7808H25.0721V17.8882H24.571V12.6566ZM26.4058 15.2945C26.8331 15.2945 27.1549 15.2036 27.371 15.0219C27.5921 14.8401 27.7026 14.5724 27.7026 14.2187C27.7026 13.865 27.5921 13.5973 27.371 13.4156C27.1549 13.2338 26.8331 13.1429 26.4058 13.1429H25.0721V15.2945H26.4058ZM29.923 12.6566H30.5861L32.4945 17.8882H31.9493L31.3893 16.3187H29.1272L28.5672 17.8882H28.0219L29.923 12.6566ZM31.2198 15.8324L30.2545 13.1061L29.2967 15.8324H31.2198Z"
                        fill="#D4D4D8"
                    />
                    <line
                        x1="10.4938"
                        y1="21.2488"
                        x2="34.9881"
                        y2="21.2488"
                        stroke="#E4E4E7"
                        strokeWidth="0.263158"
                    />
                </g>
            </g>
            <defs>
                <linearGradient
                    id="paint0_linear_1_2018"
                    x1="9.88803"
                    y1="6.55415"
                    x2="36.0447"
                    y2="35.5773"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#27272A" />
                    <stop offset="1" stopColor="#52525C" />
                </linearGradient>
                <linearGradient
                    id="paint1_linear_1_2018"
                    x1="11.9583"
                    y1="8.8133"
                    x2="33.985"
                    y2="33.2538"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#52525C" />
                    <stop offset="1" stopColor="#27272A" />
                </linearGradient>
            </defs>
        </svg>
    ),
};

interface FlickeringGridProps extends React.HTMLAttributes<HTMLDivElement> {
    squareSize?: number;
    gridGap?: number;
    flickerChance?: number;
    color?: string;
    width?: number;
    height?: number;
    className?: string;
    maxOpacity?: number;
    text?: string;
    textColor?: string;
    fontSize?: number;
    fontWeight?: number | string;
}

export const FlickeringGrid: React.FC<FlickeringGridProps> = ({
    squareSize = 3,
    gridGap = 3,
    flickerChance = 0.2,
    color = "#B4B4B4",
    width,
    height,
    className,
    maxOpacity = 0.15,
    text = "",
    fontSize = 140,
    fontWeight = 600,
    ...props
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = useState(false);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

    const memoizedColor = useMemo(() => getRGBA(color), [color]);

    const drawGrid = useCallback(
        (
            ctx: CanvasRenderingContext2D,
            width: number,
            height: number,
            cols: number,
            rows: number,
            squares: Float32Array,
            dpr: number,
        ) => {
            ctx.clearRect(0, 0, width, height);

            const maskCanvas = document.createElement("canvas");
            maskCanvas.width = width;
            maskCanvas.height = height;
            const maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true });
            if (!maskCtx) return;

            if (text) {
                maskCtx.save();
                maskCtx.scale(dpr, dpr);
                maskCtx.fillStyle = "white";
                maskCtx.font = `${fontWeight} ${fontSize}px "Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
                maskCtx.textAlign = "center";
                maskCtx.textBaseline = "middle";
                maskCtx.fillText(text, width / (2 * dpr), height / (2 * dpr));
                maskCtx.restore();
            }

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const x = i * (squareSize + gridGap) * dpr;
                    const y = j * (squareSize + gridGap) * dpr;
                    const squareWidth = squareSize * dpr;
                    const squareHeight = squareSize * dpr;

                    const maskData = maskCtx.getImageData(x, y, squareWidth, squareHeight).data;
                    const hasText = maskData.some((value, index) => index % 4 === 0 && value > 0);

                    const opacity = squares[i * rows + j];
                    const finalOpacity = hasText ? Math.min(1, opacity * 3 + 0.4) : opacity;

                    ctx.fillStyle = colorWithOpacity(memoizedColor, finalOpacity);
                    ctx.fillRect(x, y, squareWidth, squareHeight);
                }
            }
        },
        [memoizedColor, squareSize, gridGap, text, fontSize, fontWeight],
    );

    const setupCanvas = useCallback(
        (canvas: HTMLCanvasElement, width: number, height: number) => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            const cols = Math.ceil(width / (squareSize + gridGap));
            const rows = Math.ceil(height / (squareSize + gridGap));

            const squares = new Float32Array(cols * rows);
            for (let i = 0; i < squares.length; i++) {
                squares[i] = Math.random() * maxOpacity;
            }

            return { cols, rows, squares, dpr };
        },
        [squareSize, gridGap, maxOpacity],
    );

    const updateSquares = useCallback(
        (squares: Float32Array, deltaTime: number) => {
            for (let i = 0; i < squares.length; i++) {
                if (Math.random() < flickerChance * deltaTime) {
                    squares[i] = Math.random() * maxOpacity;
                }
            }
        },
        [flickerChance, maxOpacity],
    );

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let gridParams: ReturnType<typeof setupCanvas>;

        const updateCanvasSize = () => {
            const newWidth = width || container.clientWidth;
            const newHeight = height || container.clientHeight;
            setCanvasSize({ width: newWidth, height: newHeight });
            gridParams = setupCanvas(canvas, newWidth, newHeight);
        };

        updateCanvasSize();

        let lastTime = 0;
        const animate = (time: number) => {
            if (!isInView) return;
            const deltaTime = (time - lastTime) / 1000;
            lastTime = time;

            updateSquares(gridParams.squares, deltaTime);
            drawGrid(
                ctx,
                canvas.width,
                canvas.height,
                gridParams.cols,
                gridParams.rows,
                gridParams.squares,
                gridParams.dpr,
            );
            animationFrameId = requestAnimationFrame(animate);
        };

        const resizeObserver = new ResizeObserver(() => updateCanvasSize());
        resizeObserver.observe(container);

        const intersectionObserver = new IntersectionObserver(
            ([entry]) => setIsInView(entry.isIntersecting),
            { threshold: 0 },
        );
        intersectionObserver.observe(canvas);

        if (isInView) {
            animationFrameId = requestAnimationFrame(animate);
        }

        return () => {
            cancelAnimationFrame(animationFrameId);
            resizeObserver.disconnect();
            intersectionObserver.disconnect();
        };
    }, [setupCanvas, updateSquares, drawGrid, width, height, isInView]);

    return (
        <div ref={containerRef} className={cn(`h-full w-full ${className}`)} {...props}>
            <canvas
                ref={canvasRef}
                className="pointer-events-none"
                style={{
                    width: canvasSize.width,
                    height: canvasSize.height,
                }}
            />
        </div>
    );
};

export function useMediaQuery(query: string) {
    const [value, setValue] = useState(false);

    useEffect(() => {
        function checkQuery() {
            const result = window.matchMedia(query);
            setValue(result.matches);
        }
        checkQuery();
        window.addEventListener("resize", checkQuery);
        const mediaQuery = window.matchMedia(query);
        mediaQuery.addEventListener("change", checkQuery);
        return () => {
            window.removeEventListener("resize", checkQuery);
            mediaQuery.removeEventListener("change", checkQuery);
        };
    }, [query]);

    return value;
}

export const siteConfig = {
    hero: {
        description: "Unified on-chain operating layer integrating identity, trust, work, finance, and governance into one seamless ecosystem on Avalanche C-Chain.",
    },
    footerLinks: [
        {
            title: "Ecosystem",
            links: [
                // { id: 1, title: "Identity", url: "/identity" },
                { id: 1, title: "Marketplace", url: "/jobs" },
                { id: 2, title: "Governance", url: "/governance" },
                { id: 3, title: "Explorer", url: "#" },
            ],
        },
        // {
        //     title: "Resources",
        //     links: [
        //         { id: 5, title: "Documentation", url: "#" },
        //         { id: 6, title: "Whitepaper", url: "#" },
        //         { id: 7, title: "Brand Kit", url: "#" },
        //         { id: 8, title: "Legal", url: "#" },
        //     ],
        // },
        {
            title: "Connect",
            links: [
                { id: 9, title: "Twitter", url: "#" },
                { id: 10, title: "Discord", url: "#" },
                { id: 11, title: "Telegram", url: "#" },
                { id: 12, title: "GitHub", url: "#" },
            ],
        },
    ],
};

export const FlickeringFooter = () => {
    const tablet = useMediaQuery("(max-width: 1024px)");

    return (
        <footer id="footer" className="w-full pb-0 bg-background border-t">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between p-10">
                <div className="flex flex-col items-start justify-start gap-y-5 max-w-xs mx-0">
                    <Link href="/" className="flex items-center gap-2">
                        <Icons.logo className="size-8" />
                        <p className="text-xl font-semibold text-primary">AVAXVERSE</p>
                    </Link>
                    <p className="tracking-tight text-muted-foreground font-medium">
                        {siteConfig.hero.description}
                    </p>
                    <div>   </div>
                </div>
                <div className="pt-3 md:w-1/2">
                    <div className="flex flex-col items-start justify-start md:flex-row md:items-center md:justify-between gap-y-5 lg:pl-10">
                        {siteConfig.footerLinks.map((column, columnIndex) => (
                            <ul key={columnIndex} className="flex flex-col gap-y-2">
                                <li className="mb-2 text-sm font-semibold text-primary">
                                    {column.title}
                                </li>
                                {column.links.map((link) => (
                                    <li
                                        key={link.id}
                                        className="group inline-flex cursor-pointer items-center justify-start gap-1 text-[15px]/snug text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        <Link href={link.url}>{link.title}</Link>
                                        <div className="flex size-4 items-center justify-center border border-border rounded translate-x-0 transform opacity-0 transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:opacity-100">
                                            <ChevronRight className="h-4 w-4 " />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ))}
                    </div>
                </div>
            </div>
            <div className="w-full h-48 md:h-64 relative mt-24 z-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-background z-10 from-40%" />
                <div className="absolute inset-0 mx-6">
                    <FlickeringGrid
                        text={"AVAXVERSE"}
                        fontSize={tablet ? 70 : 230}
                        className="h-full w-full"
                        squareSize={2}
                        gridGap={tablet ? 2 : 3}
                        color="#6B7280"
                        maxOpacity={0.3}
                        flickerChance={0.1}
                    />
                </div>
            </div>
        </footer>
    );
};
