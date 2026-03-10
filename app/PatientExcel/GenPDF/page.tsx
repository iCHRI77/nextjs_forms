"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { downloadPatientExcelPDF } from '../../../lib/PatientExcelPDF';

const SAMPLE_DATA = {
    clientFullName: 'John Doe',
    mainOfficePhone: '+1 555-0123',
    dentalPracticeName: 'Sunshine Dental',
    languagesSpoken: 'English, Spanish',
    streetAddress: '789 Dental Lane',
    city: 'Sunnyvale',
    state: 'CA',
    zipCode: '94085',
    country: 'United States',
    multipleLocations: 'No',
    additionalLocations: '',
    timeZone: 'US/Pacific',
    receiveLeadNotifications: 'Yes',
    leadNotificationEmail: 'frontdesk@sunshinedental.com',
    consultationTimeSlots: {
        Monday: '9:00 AM - 5:00 PM',
        Tuesday: '9:00 AM - 5:00 PM',
        Wednesday: '9:00 AM - 1:00 PM',
        Thursday: '9:00 AM - 5:00 PM',
        Friday: '9:00 AM - 5:00 PM'
    },
    appointmentDetails: {
        minAppointmentNotice: '24 hours',
        appointmentDuration: '45 mins',
        maxAppointmentsPerDay: '12',
        noCallNoShowFee: 50
    },
    sameDayAppointments: 'Yes',
    apptDetailsEmail: 'office@sunshinedental.com',
    surveyEmail: 'marketing@sunshinedental.com',
    treatmentsPromoted: ['Dental Implants', 'Invisalign / Clear Aligners'],
    implantIncluded: ['Consultation', 'X-rays', 'Oral Exam'],
    diagnosticImagingPricing: 'Included',
    implantPricingRange: {
        FixedZirconiaArch: '$18,000',
        HybridFixedSolution: '$14,000',
        SnapOn: '$7,500',
        SingleImplant: '$3,500'
    },
    zirconiaIncluded: ['Surgery', 'Temporary', 'Final Arch'],
    hybridIncluded: ['Surgery', 'Fixed Bridge'],
    hybridMaterial: 'Zirconia',
    snapOnIncluded: ['Denture', 'Locators'],
    singleIncluded: ['Implant', 'Crown'],
    sedationPricing: '$450 per hour',
    implantNotes: 'Prefer evening appointments.',
    invisalignIncluded: ['Scanning', 'Clear Aligners', 'Post-treatment Retainers'],
    invisalignBrand: 'Invisalign',
    invisalignDiscount: '$500 off full treatment',
    invisalignPriceComp: '$5,500',
    invisalignPriceExpress: '$3,000',
    invisalignNotes: 'Free whitening included.',
    pricingNewExamXRays: '$99',
    pricingNewExamCleaning: '$149',
    pricingBasicCleaning: '$89',
    pricingDeepCleaning: '$199 per quad',
    pricingExtraction: '$150 - $400',
    pricingInvisalign: 'Starts at $3,500',
    pricingWhitening: '$350',
    pricingCrowns: '$1,200',
    pricingVeneers: '$1,500 per tooth',
    pricingBridge: '$3,500',
    pricingOtherCommonServices: ['Gum Grafting', 'Root Canal'],
    financingOptions: ['CareCredit', 'Cherry', 'Sunbit'],
    otherFinancing: 'Internal payment plans available',
    insuranceAccepted: ['PPO', 'Delta Dental', 'MetLife'],
    networkStatus: ['In-Network'],
    specificInsurance: 'BCBS, Aetna',
    dailyAdSpend: '$50 - $100',
    hasMarketingAssets: 'Yes',
    nearbyLandmarks: 'Next to Whole Foods',
    legalBusinessName: 'Sunshine Dental LLC',
    businessType: 'LLC',
    businessEIN: '12-3456789',
    businessEmail: 'admin@sunshinedental.com',
    businessWebsite: 'www.sunshinedental.com'
};

export default function GenPDFPage() {
    const [jsonData, setJsonData] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    const handleLoadSample = () => {
        setJsonData(JSON.stringify(SAMPLE_DATA, null, 4));
        setError(null);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(jsonData);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setJsonData(text);
            setError(null);
        } catch (err) {
            setError("Couldn't access clipboard.");
        }
    };

    const handleGeneratePDF = async () => {
        setError(null);
        setIsGenerating(true);

        try {
            if (!jsonData.trim()) {
                throw new Error('Please enter some JSON data.');
            }

            let parsedData;
            try {
                parsedData = JSON.parse(jsonData);
            } catch {
                throw new Error('Invalid JSON format. Please check your input.');
            }

            const success = await downloadPatientExcelPDF(parsedData);
            if (!success) {
                throw new Error('Failed to generate PDF. Please check the data structure.');
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred.');
            }
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-500">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-4xl mx-auto"
            >
                <header className="mb-10 text-center">
                    <motion.div
                        initial={{ y: -20 }}
                        animate={{ y: 0 }}
                        className="inline-block px-4 py-1.5 mb-4 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-widest"
                    >
                        Internal Utility
                    </motion.div>
                    <h1 className="text-5xl font-black text-slate-900 mb-3 tracking-tight">
                        JSON <span className="text-blue-600">to</span> PDF
                    </h1>
                    <p className="text-slate-500 text-lg max-w-lg mx-auto leading-relaxed">
                        Generate high-fidelity onboarding documents directly from your form data.
                    </p>
                </header>

                <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden border border-slate-100">
                    <div className="p-1.5 bg-slate-50 border-b border-slate-100 flex justify-between items-center px-6">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-400" />
                            <div className="w-3 h-3 rounded-full bg-amber-400" />
                            <div className="w-3 h-3 rounded-full bg-emerald-400" />
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            onboarding_data.json
                        </div>
                        <div className="w-12" />
                    </div>

                    <div className="p-8">
                        <div className="flex flex-wrap gap-3 mb-6">
                            <button
                                onClick={handleLoadSample}
                                className="flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 px-5 py-2.5 rounded-2xl hover:bg-blue-100 transition-all active:scale-95"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0l-4-4m4 4v12" /></svg>
                                Load Sample
                            </button>
                            <button
                                onClick={handlePaste}
                                className="flex items-center gap-2 text-sm font-bold text-slate-600 bg-slate-50 px-5 py-2.5 rounded-2xl hover:bg-slate-100 transition-all active:scale-95"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                Paste Clipboard
                            </button>
                            <div className="flex-1" />
                            <button
                                onClick={handleCopy}
                                className={`flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-2xl transition-all active:scale-95 ${copySuccess ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 bg-slate-50 hover:bg-slate-100'
                                    }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                                {copySuccess ? 'Copied!' : 'Copy JSON'}
                            </button>
                        </div>

                        <div className="group relative">
                            <textarea
                                className={`w-full h-[500px] p-6 font-mono text-sm leading-relaxed bg-[#1e293b] text-blue-100 rounded-4xl border-4 focus:outline-none transition-all shadow-inner ${error ? 'border-red-500/30' : 'border-white group-hover:border-blue-500/10 focus:border-blue-500/20'
                                    }`}
                                placeholder="// Paste your JSON data here..."
                                value={jsonData}
                                onChange={(e) => {
                                    setJsonData(e.target.value);
                                    if (error) setError(null);
                                }}
                            />
                            <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-100 transition-opacity">
                                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
                            </div>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="mt-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-sm font-semibold flex items-center gap-3"
                                >
                                    <div className="bg-red-100 p-1.5 rounded-full">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </div>
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="mt-10 flex gap-4">
                            <button
                                onClick={handleGeneratePDF}
                                disabled={isGenerating}
                                className="flex-1 flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black text-lg py-5 px-10 rounded-4xl shadow-[0_15px_30px_rgba(37,99,235,0.3)] hover:shadow-[0_20px_40px_rgba(37,99,235,0.4)] transform hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all"
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-transparent"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 9h1.5m1.5 0H13m-4 4h1.5m1.5 0H13m-4 4h1.5m1.5 0H13" /></svg>
                                        Generate Document
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => setJsonData('')}
                                className="px-8 py-5 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>
                </div>

                <footer className="mt-12 text-center text-slate-400">
                    <p className="text-sm font-medium">
                        Patient Excel Onboarding Engine v1.2
                    </p>
                    <div className="flex justify-center gap-6 mt-4 opacity-50">
                        <div className="w-2 h-2 rounded-full bg-slate-300" />
                        <div className="w-2 h-2 rounded-full bg-slate-300" />
                        <div className="w-2 h-2 rounded-full bg-slate-300" />
                    </div>
                </footer>
            </motion.div>
        </div>
    );
}
