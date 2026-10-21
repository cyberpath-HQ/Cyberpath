"use client";

import { motion } from "framer-motion";
import {
    Check, Shield, Zap, Building, Star
} from "lucide-react";
import { translations } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/translations";

interface PricingProps {
    locale: Locale
}

const containerVariants = {
    hidden:  {
        opacity: 0,
    },
    visible: {
        opacity:    1,
        transition: {
            staggerChildren: 0.08,
            delayChildren:   0.15,
        },
    },
};

const itemVariants = {
    hidden:  {
        opacity: 0,
        y:       30,
    },
    visible: {
        opacity: 1,
        y:       0,
    },
};

function PricingBackground() {
    return (
        <div className="absolute inset-0 pointer-events-none -z-1">
            <motion.div
                animate={{
                    x: [
                        0,
                        30,
                        0,
                    ],
                    y: [
                        0,
                        -20,
                        0,
                    ],
                }}
                transition={{
                    duration: 15,
                    repeat:   Infinity,
                    ease:     `easeInOut`,
                }}
                className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50 rounded-full blur-[120px]"
            />
            <motion.div
                animate={{
                    x: [
                        0,
                        -20,
                        0,
                    ],
                    y: [
                        0,
                        30,
                        0,
                    ],
                }}
                transition={{
                    duration: 18,
                    repeat:   Infinity,
                    ease:     `easeInOut`,
                    delay:    2,
                }}
                className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[100px]"
            />
            <motion.div
                animate={{
                    rotate: [
                        0,
                        360,
                    ],
                }}
                transition={{
                    duration: 60,
                    repeat:   Infinity,
                    ease:     `linear`,
                }}
                className="absolute top-1/4 left-1/4 w-32 h-32 border border-blue-100/30 rounded-full"
            />
            <motion.div
                animate={{
                    rotate: [
                        0,
                        -360,
                    ],
                }}
                transition={{
                    duration: 80,
                    repeat:   Infinity,
                    ease:     `linear`,
                }}
                className="absolute bottom-1/4 right-1/4 w-24 h-24 border border-indigo-100/30 rounded-lg rotate-45"
            />
        </div>
    );
}

export function Pricing({
    locale,
}: PricingProps) {
    const t = translations[locale].pricing;
    const planKeys = [
        `scudo`,
        `fortezza`,
        `bastione`,
    ] as const;

    const icons = {
        scudo:    Shield,
        fortezza: Zap,
        bastione: Building,
    };

    return (
        <section className="py-24 md:py-32 relative overflow-hidden" id="pricing">
            <PricingBackground />

            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{
                        once:   true,
                        margin: `-100px`,
                    }}
                    variants={containerVariants}
                    className="text-center mb-12 md:mb-16"
                >
                    <motion.p variants={itemVariants} className="text-xs font-bold text-blue-600 uppercase tracking-[0.2em] mb-4">
                        {t.subtitle}
                    </motion.p>
                    <motion.h2 variants={itemVariants} className="text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900">
                        {t.title}
                    </motion.h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8 max-w-5xl mx-auto">
                    {planKeys.map((key, idx) => {
                        const plan = t.plans[key];
                        const Icon = icons[key];
                        const isHighlighted = key === `fortezza`;

                        return (
                            <motion.div
                                key={key}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{
                                    once: true,
                                }}
                                transition={{
                                    delay: idx * 0.1,
                                }}
                                variants={itemVariants}
                                className={`relative flex flex-col p-5 md:p-6 lg:p-8 rounded-xl md:rounded-2xl transition-all duration-300 ${
                                    isHighlighted
                                        ? `bg-neutral-900 text-white shadow-2xl scale-[1.02] z-10`
                                        : `bg-white border border-neutral-200 shadow-lg hover:shadow-xl`
                                }`}
                            >
                                {isHighlighted && (
                                    <div className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2 z-20">
                                        <span className="px-3 md:px-4 py-1 md:py-1.5 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center gap-1.5">
                                            <motion.span
                                                initial={{
                                                    scale: 0,
                                                }}
                                                animate={{
                                                    scale: [
                                                        0,
                                                        1.1,
                                                        1,
                                                    ],
                                                }}
                                                transition={{
                                                    duration: 0.4,
                                                    ease:     `easeOut`,
                                                }}
                                            >
                                                <Star className="w-3 md:w-4" />
                                            </motion.span>
                                            {t.popular}
                                        </span>
                                    </div>
                                )}

                                <div className="mb-4 md:mb-6">
                                    <div className={`size-10 md:size-12 rounded-xl flex items-center justify-center mb-3 md:mb-4 ${
                                        isHighlighted ? `bg-blue-500/20` : `bg-blue-50`
                                    }`}>
                                        <Icon className={`w-5 md:w-6 ${ isHighlighted ? `text-blue-400` : `text-blue-600` }`} />
                                    </div>
                                    <h3 className={`text-lg md:text-xl font-bold mb-1 md:mb-2 ${ isHighlighted ? `text-white` : `text-neutral-900` }`}>
                                        {plan.name}
                                    </h3>
                                    <p className={`text-sm ${ isHighlighted ? `text-neutral-400` : `text-neutral-500` }`}>
                                        {plan.description}
                                    </p>
                                </div>

                                <div className="mb-2">
                                    <p className={`text-xs mt-1 md:mt-2 ${ isHighlighted ? `text-blue-400` : `text-blue-600` }`}>
                                        {plan.starting_at}
                                    </p>
                                    <div className="flex items-baseline gap-1">
                                        <span className={`text-3xl md:text-4xl lg:text-5xl font-extrabold ${ isHighlighted ? `text-white` : `text-neutral-900` }`}>
                                            {plan.price}
                                        </span>
                                        <span className={`text-sm ${ isHighlighted ? `text-neutral-400` : `text-neutral-500` }`}>
                                            {plan.period}
                                        </span>
                                    </div>
                                    <p className={`text-xs mt-1 md:mt-2 ${ isHighlighted ? `text-blue-400` : `text-blue-600` }`}>
                                        {plan.endpoints}
                                    </p>
                                </div>

                                <ul className="flex-1 space-y-2 md:space-y-3 my-4 md:my-6">
                                    {plan.features.map((feature, fIdx) => (
                                        <li key={fIdx} className="flex items-start gap-2 md:gap-3">
                                            <div className={`w-4 md:w-5 h-4 md:h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                                isHighlighted ? `bg-blue-500` : `bg-blue-100`
                                            }`}>
                                                <Check className={`w-2.5 md:w-3 ${ isHighlighted ? `text-white` : `text-blue-600` }`} />
                                            </div>
                                            <span className={`text-sm ${ isHighlighted ? `text-neutral-300` : `text-neutral-600` }`}>
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <a
                                    href="#reservation"
                                    className={`w-full py-3 md:py-4 rounded-full text-center font-bold transition-all hover:scale-[1.02] ${
                                        isHighlighted
                                            ? `bg-white text-neutral-900 hover:bg-neutral-100`
                                            : `bg-neutral-900 text-white hover:bg-neutral-800`
                                    }`}
                                >
                                    {plan.cta}
                                </a>
                                <small className={`text-xs mt-3 ${ isHighlighted ? `text-neutral-500` : `text-neutral-400` }`}>
                                    {plan.note}
                                </small>
                            </motion.div>
                        );
                    })}
                </div>

                <motion.p
                    initial={{
                        opacity: 0,
                    }}
                    whileInView={{
                        opacity: 1,
                    }}
                    viewport={{
                        once: true,
                    }}
                    className="mt-8 md:mt-10 text-center text-xs text-balance max-w-2/3 mx-auto text-neutral-500"
                >
                    {t.note}
                </motion.p>
            </div>
        </section>
    );
}
