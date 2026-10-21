"use client";

import { motion } from "framer-motion";
import { Calendar, ArrowRight, Shield, CheckCircle } from "lucide-react";
import { translations } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/translations";

interface ReservationSectionProps {
    locale: Locale;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.12 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

function ReservationBackground() {
    return (
        <div className="absolute inset-0 pointer-events-none -z-1">
            <motion.div
                animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl"
            />
            <motion.div
                animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-green-100/50 rounded-full blur-3xl"
            />
            <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/3 left-1/4 w-20 h-20 border border-blue-200/30 rotate-45"
            />
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 right-1/3 w-24 h-24 bg-green-200/20 rounded-full blur-2xl"
            />
        </div>
    );
}

export function ReservationSection({ locale }: ReservationSectionProps) {
    const t = translations[locale].reservation;

    return (
        <section className="py-20 md:py-28 relative overflow-hidden" id="reservation">
            <ReservationBackground />

            <div className="max-w-4xl mx-auto px-4 md:px-6">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={containerVariants}
                    className="bg-white rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden"
                >
                    <div className="grid lg:grid-cols-2">
                        <div className="p-6 md:p-8 lg:p-10">
                            <motion.div variants={itemVariants} className="flex items-center gap-3 mb-5 md:mb-6">
                                <div className="w-10 md:w-12 h-10 md:h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                                    <Calendar className="w-5 md:w-6 h-5 md:h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg md:text-xl font-bold text-neutral-900">{t.title}</h3>
                                    <p className="text-sm text-neutral-600">{t.subtitle}</p>
                                </div>
                            </motion.div>

                            <motion.p variants={itemVariants} className="text-neutral-600 mb-6 md:mb-8 text-sm md:text-base">
                                {t.description}
                            </motion.p>

                            <motion.div variants={itemVariants} className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                                {t.benefits.map((benefit, idx) => (
                                    <div key={idx} className="flex items-center gap-2 md:gap-3">
                                        <CheckCircle className="w-4 md:w-5 h-4 md:h-5 text-green-500 flex-shrink-0" />
                                        <span className="text-neutral-700 text-sm md:text-base">{benefit}</span>
                                    </div>
                                ))}
                            </motion.div>

                            <motion.a
                                variants={itemVariants}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                href="https://calendar.google.com/calendar/appointments/schedules/AcZssZ1zibCOv-HLIBvbUPnlaQQUies_LJ4gr6SUGnBfi4ccJDAA1obOUCqs5KIkwMlo8BDbNSQT-vlI"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25 text-sm md:text-base"
                            >
                                {t.button}
                                <ArrowRight className="w-4 md:w-5 h-4 md:h-5" />
                            </motion.a>
                        </div>

                        <div className="bg-neutral-900 p-6 md:p-8 lg:p-10 flex items-center justify-center">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="text-center"
                            >
                                <div className="w-16 md:w-20 h-16 md:h-20 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4 md:mb-6 shrink-0">
                                    <Shield className="w-8 md:w-10 h-8 md:h-10 text-blue-400" />
                                </div>
                                <h4 className="text-lg md:text-xl font-bold text-white mb-2">{t.duration}</h4>
                                <p className="text-neutral-400 text-sm md:text-base">{t.duration_label}</p>
                                <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-white/10">
                                    <p className="text-neutral-500 text-xs md:text-sm">{t.duration_desc}</p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}