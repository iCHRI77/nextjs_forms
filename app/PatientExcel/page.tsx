"use client";
import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { downloadPatientExcelPDF } from '../../lib/PatientExcelPDF';

const PhoneInput = dynamic(
    () => import('react-phone-input-2').then(mod => mod.default),
    {
        ssr: false,
        loading: () => <input type="tel" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
    }
);

const Section = ({ title, children }: any) => (
    <div className="border border-gray-200 rounded-xl p-6 md:p-8 bg-gray-50 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-3">{title}</h2>
        {children}
    </div>
);

const InputField = ({ label, value, onChange, required = false, type = 'text', placeholder = '', multiline = false, description = '' }: any) => (
    <div className="flex flex-col w-full h-full mb-6">
        <div className="mb-2">
            {label && <label className="text-sm font-semibold text-gray-800 block leading-snug">{label} {required && <span className="text-red-500">*</span>}</label>}
            {description && <p className="text-xs text-gray-500 mt-1 italic leading-tight">{description}</p>}
        </div>
        <div className="mt-auto">
            {multiline ? (
                <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    required={required}
                    placeholder={placeholder || label}
                    value={value}
                    onChange={onChange}
                    rows={3}
                />
            ) : (
                <input
                    type={type}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    required={required}
                    placeholder={placeholder || (type !== 'date' ? label : '')}
                    value={value}
                    onChange={onChange}
                />
            )}
        </div>
    </div>
);

const SelectField = ({ label, value, onChange, options, required = false, description = '' }: any) => (
    <div className="flex flex-col w-full h-full mb-6 relative">
        <div className="mb-2">
            {label && <label className="text-sm font-semibold text-gray-800 block leading-snug">{label} {required && <span className="text-red-500">*</span>}</label>}
            {description && <p className="text-xs text-gray-500 mt-1 italic leading-tight">{description}</p>}
        </div>
        <div className="mt-auto relative">
            <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
                required={required}
                value={value}
                onChange={onChange}
            >
                <option value="" disabled>Select {label}</option>
                {options.map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
        </div>
    </div>
);

const RadioGroup = ({ label, name, value, onChange, options, required = false, description = '' }: any) => (
    <div className="flex flex-col gap-2 w-full mb-6">
        {label && <label className="text-sm font-semibold text-gray-800">{label} {required && <span className="text-red-500">*</span>}</label>}
        {description && <p className="text-xs text-gray-500 mb-2 italic">{description}</p>}
        <div className="flex flex-col gap-3">
            {options.map((opt: string) => (
                <label key={opt} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                        type="radio"
                        name={name}
                        value={opt}
                        checked={value === opt}
                        onChange={onChange}
                        required={required && !value}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    {opt}
                </label>
            ))}
        </div>
    </div>
);

const CheckboxGroup = ({ label, values, onChange, options, required = false, description = '' }: any) => (
    <div className="flex flex-col gap-2 w-full mb-6 relative">
        {label && <label className="text-sm font-semibold text-gray-800 z-10 relative">{label} {required && <span className="text-red-500">*</span>}</label>}
        {description && <p className="text-xs text-gray-500 mb-2 italic z-10 relative">{description}</p>}
        {required && (
            <input type="text" className="absolute top-0 left-0 w-full h-10 opacity-0 pointer-events-none" value={values?.length > 0 ? 'filled' : ''} onChange={() => { }} required />
        )}
        <div className="flex flex-col gap-3">
            {options.map((opt: string) => (
                <label key={opt} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                        type="checkbox"
                        value={opt}
                        checked={values.includes(opt)}
                        onChange={(e) => {
                            const checked = e.target.checked;
                            let arr = [...values];
                            if (checked) arr.push(opt);
                            else arr = arr.filter((v: string) => v !== opt);
                            onChange(arr);
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    {opt}
                </label>
            ))}
        </div>
    </div>
);

const AddressAutocomplete = ({ label, value, onChange, onSelect, required = false, description = '' }: any) => {
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchSuggestions = async (query: string) => {
        if (!query || query.length < 3) {
            setSuggestions([]);
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`, {
                headers: {
                    'Accept-Language': 'en-US,en;q=0.9'
                }
            });
            const data = await response.json();
            setSuggestions(data);
            setShowSuggestions(true);
        } catch (error) {
            console.error('Error fetching addresses:', error);
        }
        setLoading(false);
    };

    const handleSelect = (item: any) => {
        let streetAddress = item.display_name.split(',')[0];
        if (item.address?.road) {
            streetAddress = item.address.house_number ? `${item.address.house_number} ${item.address.road}` : item.address.road;
        }
        onChange({ target: { value: streetAddress } });
        setShowSuggestions(false);
        onSelect(item.address || {});
    };

    return (
        <div className="flex flex-col w-full h-full mb-6 relative" ref={wrapperRef}>
            <div className="mb-2">
                {label && <label className="text-sm font-semibold text-gray-800 block leading-snug">{label} {required && <span className="text-red-500">*</span>}</label>}
                {description && <p className="text-xs text-gray-500 mt-1 italic leading-tight">{description}</p>}
            </div>
            <div className="mt-auto relative">
                <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    required={required}
                    placeholder={label}
                    value={value}
                    onChange={(e) => {
                        onChange(e);
                        if (timeoutRef.current) clearTimeout(timeoutRef.current);
                        timeoutRef.current = setTimeout(() => fetchSuggestions(e.target.value), 500);
                    }}
                    onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                />

                {loading && (
                    <div className="absolute right-3 top-[14px]">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                    </div>
                )}

                <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden"
                        >
                            <ul className="max-h-60 overflow-y-auto m-0 p-0 list-none">
                                {suggestions.map((item, index) => {
                                    let streetAddress = item.display_name.split(',')[0];
                                    if (item.address?.road) {
                                        streetAddress = item.address.house_number ? `${item.address.house_number} ${item.address.road}` : item.address.road;
                                    }
                                    return (
                                        <li
                                            key={index}
                                            onClick={() => handleSelect(item)}
                                            className="px-4 py-3 cursor-pointer hover:bg-blue-50 text-sm border-b border-gray-100 last:border-0"
                                        >
                                            <div className="font-medium text-gray-800">{streetAddress}</div>
                                            <div className="text-xs text-gray-500 truncate">{item.display_name}</div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const TagInput = ({ label, values = [], onChange, placeholder = 'Type and press Enter', required = false, description = '' }: any) => {
    const [inputValue, setInputValue] = useState('');
    const handleKeyDown = (e: any) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            if (!values.includes(inputValue.trim())) {
                onChange([...values, inputValue.trim()]);
            }
            setInputValue('');
        }
    };
    const removeTag = (tag: string) => {
        onChange(values.filter((v: string) => v !== tag));
    };
    return (
        <div className="flex flex-col gap-1 w-full mb-6">
            {label && <label className="text-sm font-semibold text-gray-800">{label} {required && values.length === 0 && <span className="text-red-500">*</span>}</label>}
            {description && <p className="text-xs text-gray-500 mb-2 italic">{description}</p>}
            <div className="flex flex-col gap-2 p-3 border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-500">
                <div className="flex flex-wrap gap-2">
                    {values.length === 0 && !inputValue && <span className="text-gray-400 text-sm absolute pointer-events-none mt-[2px]">{placeholder}</span>}
                    {values.map((tag: string) => (
                        <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-blue-100 border border-blue-200 text-blue-800 rounded-full text-sm font-medium">
                            {tag}
                            <button type="button" onClick={() => removeTag(tag)} className="hover:text-blue-900 font-bold ml-1 transition-colors">&times;</button>
                        </span>
                    ))}
                    <input
                        type="text"
                        className="flex-1 w-full min-w-[120px] border-none focus:outline-none bg-transparent text-sm py-1"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        required={required && values.length === 0}
                    />
                </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Press Enter to add.</p>
        </div>
    );
};

const MultiSelectDropdown = ({ label, values = [], onChange, options, required = false, description = '', placeholder = 'Financing Options Available In-Office' }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleOption = (opt: string) => {
        if (values.includes(opt)) onChange(values.filter((v: string) => v !== opt));
        else onChange([...values, opt]);
    };
    return (
        <div className="flex flex-col gap-1 w-full mb-6 relative">
            {label && <label className="text-sm font-semibold text-gray-800 relative z-10">{label} {required && values.length === 0 && <span className="text-red-500">*</span>}</label>}
            {description && <p className="text-xs text-gray-500 mb-2 italic relative z-10">{description}</p>}

            {required && (
                <input type="text" className="absolute top-0 left-0 w-full h-[60px] opacity-0 pointer-events-none" value={values?.length > 0 ? 'filled' : ''} onChange={() => { }} required />
            )}

            <div
                className="min-h-[50px] p-3 border border-gray-300 rounded-md bg-white cursor-pointer flex flex-col focus-within:ring-2 focus-within:ring-blue-500 relative"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex flex-wrap gap-2 mb-2 pr-6">
                    {values.map((val: string) => (
                        <span key={val} className="flex items-center gap-1.5 px-2.5 py-0.5 bg-[#4fbb8b] text-white rounded text-sm font-medium">
                            {val}
                            <button type="button" onClick={(e) => { e.stopPropagation(); toggleOption(val); }} className="hover:text-red-200 font-bold ml-0.5 transition-colors">&times;</button>
                        </span>
                    ))}
                </div>
                <span className="text-gray-400 text-sm">{placeholder}</span>

                <div className="absolute right-3 top-4">
                    <svg className={`w-4 h-4 text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>

            {isOpen && (
                <div className="absolute top-[100%] left-0 w-full bg-white border border-gray-300 rounded-b-md shadow-lg z-50 max-h-60 overflow-y-auto mt-[-1px]">
                    {options.map((opt: string) => (
                        <div
                            key={opt}
                            className={`px-4 py-3 cursor-pointer text-sm transition-colors ${values.includes(opt) ? 'bg-[#dcebf8] text-[#1b3e64] font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                            onClick={() => toggleOption(opt)}
                        >
                            {opt}
                        </div>
                    ))}
                </div>
            )}
            {/* Invisible backdrop to close dropdown */}
            {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>}
        </div>
    );
};

const COUNTRIES = [
    "United States", "Canada", "United Kingdom", "Australia",
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda",
    "Argentina", "Armenia", "Austria", "Azerbaijan", "Bahamas", "Bahrain",
    "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
    "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria",
    "Burkina Faso", "Burundi", "Côte d'Ivoire", "Cabo Verde", "Cambodia",
    "Cameroon", "Central African Republic", "Chad", "Chile", "China", "Colombia",
    "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba",
    "Cyprus", "Czechia", "Democratic Republic of the Congo", "Denmark",
    "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
    "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini",
    "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia",
    "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea",
    "Guinea-Bissau", "Guyana", "Haiti", "Holy See", "Honduras", "Hungary",
    "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
    "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati",
    "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia",
    "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi",
    "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania",
    "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia",
    "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru",
    "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria",
    "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau",
    "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru",
    "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda",
    "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines",
    "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal",
    "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia",
    "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan",
    "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
    "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga",
    "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
    "Uganda", "Ukraine", "United Arab Emirates", "Uruguay", "Uzbekistan",
    "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const initialData = {
    // Client Info
    clientFullName: '', mainOfficePhone: '+1', dentalPracticeName: '', languagesSpoken: '',
    // Address
    streetAddress: '', city: '', state: '', zipCode: '', country: '',
    multipleLocations: '', additionalLocations: '', timeZone: '',
    // Lead Notifications
    receiveLeadNotifications: '', leadNotificationEmail: '',
    // Scheduling
    consultationTimeSlots: { Monday: '', Tuesday: '', Wednesday: '', Thursday: '', Friday: '', Saturday: '', Sunday: '' },
    appointmentDetails: { minAppointmentNotice: '', appointmentDuration: '', maxAppointmentsPerDay: '', noCallNoShowFee: 50 },
    sameDayAppointments: '',
    apptDetailsEmail: '', surveyEmail: '',
    // Treatments
    treatmentsPromoted: [] as string[],
    // Implants
    implantIncluded: [] as string[], diagnosticImagingPricing: '',
    implantPricingRange: { FixedZirconiaArch: '', HybridFixedSolution: '', SnapOn: '', SingleImplant: '' },
    zirconiaIncluded: [] as string[], hybridIncluded: [] as string[], hybridMaterial: '', snapOnIncluded: [] as string[], singleIncluded: [] as string[], sedationPricing: '', implantNotes: '',
    // Invisalign
    invisalignIncluded: [] as string[],
    invisalignBrand: '', invisalignDiscount: '',
    invisalignPriceComp: '', invisalignPriceExpress: '', invisalignNotes: '',
    // Other Pricing
    pricingNewExamXRays: '', pricingNewExamCleaning: '', pricingBasicCleaning: '', pricingDeepCleaning: '', pricingExtraction: '', pricingInvisalign: '', pricingWhitening: '', pricingCrowns: '', pricingVeneers: '', pricingBridge: '',
    pricingOtherCommonServices: [] as string[],
    // Financing
    financingOptions: [] as string[], otherFinancing: '',
    // Insurance
    insuranceAccepted: [] as string[], networkStatus: [] as string[], specificInsurance: '',
    // Marketing
    dailyAdSpend: '', hasMarketingAssets: '', nearbyLandmarks: '',
    // Business Legal
    legalBusinessName: '', businessType: '', businessEIN: '', businessEmail: '', businessWebsite: ''
};

export default function PatientExcel() {
    const [formData, setFormData] = useState<any>(initialData);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const stepNavRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (stepNavRef.current && stepNavRef.current.children[0]) {
            const container = stepNavRef.current;
            const buttonContainer = container.children[0] as HTMLElement;
            const activeButton = buttonContainer.children[currentStep] as HTMLElement;

            if (activeButton && container) {
                const containerRect = container.getBoundingClientRect();
                const buttonRect = activeButton.getBoundingClientRect();

                // Calculate how far off the center the button currently is
                const containerCenter = containerRect.left + (containerRect.width / 2);
                const buttonCenter = buttonRect.left + (buttonRect.width / 2);

                const scrollOffset = buttonCenter - containerCenter;

                // Smoothly scroll by the exact difference needed to center it
                container.scrollBy({
                    left: scrollOffset,
                    behavior: 'smooth'
                });
            }
        }
    }, [currentStep]);

    const handleAutoFill = () => {
        setFormData({
            clientFullName: 'test testing',
            mainOfficePhone: '+12345678912',
            dentalPracticeName: 'Random Dental Care',
            languagesSpoken: 'English, Spanish',
            streetAddress: '123 Random St',
            city: 'Random City',
            state: 'NY',
            zipCode: '10001',
            country: 'United States',
            multipleLocations: 'No',
            additionalLocations: '',
            timeZone: 'US/Eastern',
            receiveLeadNotifications: 'Yes',
            leadNotificationEmail: 'test@yopmail.com',
            consultationTimeSlots: { Monday: '9am-5pm', Tuesday: '9am-5pm', Wednesday: '9am-5pm', Thursday: '9am-5pm', Friday: '9am-5pm', Saturday: '', Sunday: '' },
            appointmentDetails: { minAppointmentNotice: '24 hours', appointmentDuration: '60 min', maxAppointmentsPerDay: '10', noCallNoShowFee: 50 },
            sameDayAppointments: 'Yes',
            apptDetailsEmail: 'test@yopmail.com',
            surveyEmail: 'test@yopmail.com',
            treatmentsPromoted: ['Dental Implants', 'Invisalign / Clear Aligners'],
            implantIncluded: ['Complimentary consultation', 'Oral exam', 'X-rays'],
            diagnosticImagingPricing: 'Free',
            implantPricingRange: { FixedZirconiaArch: '$15,000', HybridFixedSolution: '$12,000', SnapOn: '$8,000', SingleImplant: '$3,000' },
            zirconiaIncluded: ['Local anesthetic', 'Surgical implant placement', 'Final permanent fixed zirconia arch after healing'],
            hybridIncluded: ['Local anesthetic', 'Surgical implant placement', 'Fixed arch placed at the day of surgery'],
            hybridMaterial: '',
            snapOnIncluded: ['Local anesthetic', 'Surgical implant placement', 'Custom snap-on denture prosthetic'],
            singleIncluded: ['Local anesthetic', 'Surgical implant placement', 'Final permanent crown'],
            sedationPricing: '$500',
            implantNotes: 'Random implant notes for testing.',
            invisalignIncluded: ['Complimentary consultation', '3D digital scan', 'Retainers at end of treatment'],
            invisalignBrand: 'Invisalign',
            invisalignDiscount: '$500 Off',
            invisalignPriceComp: '$4,500',
            invisalignPriceExpress: '$2,500',
            invisalignNotes: 'Random clear aligner notes.',
            pricingNewExamXRays: '$99',
            pricingNewExamCleaning: '$149',
            pricingBasicCleaning: '$99',
            pricingDeepCleaning: '$250/quad',
            pricingExtraction: '$150-$300',
            pricingInvisalign: '$4,500',
            pricingWhitening: '$299',
            pricingCrowns: '$1,200',
            pricingVeneers: '$1,500/tooth',
            pricingBridge: '$3,000',
            pricingOtherCommonServices: [],
            financingOptions: ['CareCredit', 'Cherry', 'Sunbit'],
            otherFinancing: 'None',
            insuranceAccepted: ['Most major PPO plans'],
            networkStatus: ['In-network with selected plans'],
            specificInsurance: 'Delta Dental',
            dailyAdSpend: '$100',
            hasMarketingAssets: 'Yes',
            nearbyLandmarks: 'Near the Random Park',
            legalBusinessName: 'Random Dental LLC',
            businessType: 'LLC or Sole Proprietorship',
            businessEIN: '12-3456789',
            businessEmail: 'info@randomdental.com',
            businessWebsite: 'www.randomdental.com'
        });
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) setCurrentStep((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePrev = () => {
        if (currentStep > 0) setCurrentStep((prev) => prev - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const isStepComplete = (index: number): boolean => {
        switch (index) {
            case 0:
                return !!(formData.clientFullName && formData.mainOfficePhone && formData.dentalPracticeName && formData.languagesSpoken);
            case 1:
                return !!(formData.streetAddress && formData.city && formData.state && formData.zipCode && formData.country && formData.multipleLocations && formData.timeZone);
            case 2:
                return !!formData.receiveLeadNotifications;
            case 3:
                const hasTimeSlot = Object.values(formData.consultationTimeSlots || {}).some(val => !!val);
                return !!(hasTimeSlot && formData.sameDayAppointments && formData.appointmentDetails?.minAppointmentNotice && formData.appointmentDetails?.appointmentDuration && formData.appointmentDetails?.maxAppointmentsPerDay && formData.appointmentDetails?.noCallNoShowFee && formData.apptDetailsEmail && formData.surveyEmail);
            case 4:
                if (!formData.treatmentsPromoted || formData.treatmentsPromoted.length === 0) return false;
                if (formData.treatmentsPromoted.includes('Dental Implants')) {
                    if (!formData.implantIncluded || formData.implantIncluded.length === 0 ||
                        !formData.implantPricingRange?.FixedZirconiaArch ||
                        !formData.implantPricingRange?.HybridFixedSolution ||
                        !formData.implantPricingRange?.SnapOn ||
                        !formData.implantPricingRange?.SingleImplant ||
                        !formData.zirconiaIncluded || formData.zirconiaIncluded.length === 0 ||
                        !formData.hybridIncluded || formData.hybridIncluded.length === 0 ||
                        !formData.snapOnIncluded || formData.snapOnIncluded.length === 0 ||
                        !formData.singleIncluded || formData.singleIncluded.length === 0) {
                        return false;
                    }
                }
                if (formData.treatmentsPromoted.includes('Invisalign / Clear Aligners')) {
                    if (!formData.invisalignBrand || !formData.invisalignDiscount ||
                        !formData.invisalignPriceComp || !formData.invisalignPriceExpress) {
                        return false;
                    }
                }
                return true;
            case 5:
                return !!(formData.pricingNewExamXRays && formData.pricingNewExamCleaning &&
                    formData.pricingBasicCleaning && formData.pricingDeepCleaning &&
                    formData.pricingExtraction && formData.pricingInvisalign &&
                    formData.pricingWhitening && formData.pricingCrowns &&
                    formData.pricingVeneers && formData.pricingBridge);
            case 6:
                return !!(formData.financingOptions && formData.financingOptions.length > 0);
            case 7:
                return !!(formData.insuranceAccepted && formData.insuranceAccepted.length > 0 &&
                    formData.networkStatus && formData.networkStatus.length > 0);
            case 8:
                return !!(formData.dailyAdSpend && formData.hasMarketingAssets && formData.nearbyLandmarks);
            case 9:
                return !!(formData.legalBusinessName && formData.businessType && formData.businessEIN && formData.businessEmail && formData.businessWebsite);
            default:
                return false;
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // If not on the last step, just go to next step
        if (currentStep < steps.length - 1) {
            handleNext();
            return;
        }

        // We are on the last step, validate ALL steps before submitting
        const validateFormLocally = (): number => {
            for (let i = 0; i < steps.length; i++) {
                if (!isStepComplete(i)) {
                    return i;
                }
            }
            return -1;
        };

        const invalidStep = validateFormLocally();
        if (invalidStep !== -1) {
            setCurrentStep(invalidStep);
            setTimeout(() => {
                const form = e.target as HTMLFormElement;
                if (form && typeof form.reportValidity === 'function') {
                    form.reportValidity();
                }
            }, 400); // Ensure Framer Motion animation completes before reporting validity
            return;
        }

        setLoading(true);
        try {
            // Send data to the desired webhook for the OTHER GHL SUBACCOUNT
            const webhookUrl = 'https://services.leadconnectorhq.com/hooks/1gIXWAQInCRjk1efdwat/webhook-trigger/cb6b2701-c703-4e9d-82c3-a83efeb50e0b';


            // Format data for GHL requirements
            const timeZoneMap: Record<string, string> = {
                'US/Central': 'America/Chicago',
                'US/Eastern': 'America/New_York',
                'US/Mountain': 'America/Denver',
                'US/Pacific': 'America/Los_Angeles',
                'US/Alaska': 'America/Anchorage',
                'US/Hawaii': 'Pacific/Honolulu'
            };

            const formattedData = {
                ...formData,
                timeZone: timeZoneMap[formData.timeZone] || formData.timeZone,
                consultationTimeSlots: { ...formData.consultationTimeSlots },
                appointmentDetails: { ...formData.appointmentDetails },
                implantPricingRange: { ...formData.implantPricingRange },
                invisalignPricingDetails: {
                    "brand": formData.invisalignBrand,
                    "discount": formData.invisalignDiscount
                },
                invisalignTreatmentPriceRange: {
                    "comprehensive": formData.invisalignPriceComp,
                    "express": formData.invisalignPriceExpress
                },
                pricingOtherCommonServices: {
                    "pricingNewExamXRays": formData.pricingNewExamXRays,
                    "pricingNewExamCleaning": formData.pricingNewExamCleaning,
                    "pricingBasicCleaning": formData.pricingBasicCleaning,
                    "pricingDeepCleaning": formData.pricingDeepCleaning,
                    "pricingExtraction": formData.pricingExtraction,
                    "pricingInvisalign": formData.pricingInvisalign,
                    "pricingWhitening": formData.pricingWhitening,
                    "pricingCrowns": formData.pricingCrowns,
                    "pricingVeneers": formData.pricingVeneers,
                    "pricingBridge": formData.pricingBridge
                }
            };

            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formattedData),
            });

            // Send data to Supabase
            const { error: supabaseError } = await supabase
                .from('patient_excel_submissions')
                .insert([{ data: formattedData }]);

            if (supabaseError) {
                console.error('Supabase insert error:', supabaseError);
            }

            setSubmitted(true);

        } catch (error) {
            console.error('Webhook error:', error);
            setSubmitted(true);
        }
        setLoading(false);
    };


    const handleTextChange = (field: string) => (e: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: e.target.value }));
    };

    const handleCheckChange = (field: string) => (newArray: string[]) => {
        setFormData((prev: any) => ({ ...prev, [field]: newArray }));
    };

    const steps = [
        {
            title: "Client Information",
            content: (
                <Section title="Client Information">
                    <InputField label="Client Full Name" value={formData.clientFullName} onChange={handleTextChange('clientFullName')} required />
                    <div className="flex flex-col gap-1 w-full mb-4">
                        <label className="text-sm font-semibold text-gray-800">Main Office Phone Number <span className="text-red-500">*</span></label>
                        <PhoneInput
                            country={'us'}
                            value={formData.mainOfficePhone}
                            onChange={(phone: string) => setFormData({ ...formData, mainOfficePhone: phone })}
                            containerClass='phone-input-container w-full !bg-white'
                            inputProps={{ name: 'mainOfficePhone', required: true, className: "w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" }}
                        />
                    </div>
                    <InputField label="Dental Practice Name" value={formData.dentalPracticeName} onChange={handleTextChange('dentalPracticeName')} required />
                    <InputField label="What Languages are Spoken in your office?" value={formData.languagesSpoken} onChange={handleTextChange('languagesSpoken')} required />
                </Section>
            )
        },
        {
            title: "Practice Address",
            content: (
                <Section title="Practice Address">
                    <AddressAutocomplete
                        label="Street Address"
                        value={formData.streetAddress}
                        onChange={(e: any) => setFormData((prev: any) => ({ ...prev, streetAddress: e.target.value }))}
                        onSelect={(address: any) => {
                            setFormData((prev: any) => ({
                                ...prev,
                                city: address.city || address.town || address.village || '',
                                state: address.state || '',
                                zipCode: address.postcode || '',
                                country: address.country || ''
                            }));
                        }}
                        required
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                        <InputField label="City" value={formData.city} onChange={handleTextChange('city')} required />
                        <InputField label="State" value={formData.state} onChange={handleTextChange('state')} required />
                        <InputField label="Zip Code" value={formData.zipCode} onChange={handleTextChange('zipCode')} required />
                        <SelectField label="Country" value={formData.country} onChange={handleTextChange('country')} options={COUNTRIES} required />
                    </div>

                    <RadioGroup
                        label="Will you be advertising for more than one location?"
                        name="multipleLocations"
                        value={formData.multipleLocations}
                        onChange={handleTextChange('multipleLocations')}
                        options={['Yes', 'No']}
                        required
                    />

                    {formData.multipleLocations === 'Yes' && (
                        <InputField
                            label="Additional location address(es)"
                            value={formData.additionalLocations}
                            onChange={handleTextChange('additionalLocations')}
                            multiline
                            description="If yes, and the additional locations are branded under the same name, please list the full addresses below:"
                        />
                    )}

                    <RadioGroup
                        label="Time Zone"
                        name="timeZone"
                        value={formData.timeZone}
                        onChange={handleTextChange('timeZone')}
                        options={['US/Central', 'US/Eastern', 'US/Mountain', 'US/Pacific', 'US/Alaska', 'US/Hawaii']}
                        required
                    />
                </Section>
            )
        },
        {
            title: "Lead Notifications",
            content: (
                <Section title="Lead Notifications">
                    <RadioGroup
                        label="Would you like to receive lead notifications?"
                        name="receiveLeadNotifications"
                        value={formData.receiveLeadNotifications}
                        onChange={handleTextChange('receiveLeadNotifications')}
                        options={['Yes', 'No']}
                        required
                        description={
                            <>
                                Lead notifications are optional. You will still receive a lead tracking sheet documenting all opt-ins.<br />
                                Notifications can be helpful if a lead opts in and then calls your practice directly, allowing you to quickly identify the lead source.
                            </>
                        }
                    />
                    {formData.receiveLeadNotifications === 'Yes' && (
                        <InputField
                            label="If yes, email for lead notifications"
                            value={formData.leadNotificationEmail}
                            onChange={handleTextChange('leadNotificationEmail')}
                            type="text"
                            description="(For multiple emails, separate them with commas. Typically the main front desk email)"
                        />
                    )}
                </Section>
            )
        },
        {
            title: "Scheduling Logistics",
            content: (
                <Section title="Scheduling Logistics">
                    <div className="flex flex-col gap-2 w-full mb-6 text-black relative">
                        <label className="text-sm font-semibold text-gray-800 relative z-10">What designated consultation time slots are reserved for patients scheduled by our team? <span className="text-red-500">*</span></label>
                        <input type="text" className="absolute top-0 left-0 w-full h-10 opacity-0 pointer-events-none" value={Object.values(formData.consultationTimeSlots).some(val => val) ? 'filled' : ''} onChange={() => { }} required />
                        <p className='text-xs text-gray-500 mb-2 italic'>
                            Most offices either set aside specific blocks or allow full scheduling flexibility based on available ops or PMS capacity.<br />
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                <div key={day} className="flex flex-col xl:flex-row xl:items-center gap-2">
                                    <span className="w-full xl:w-24 text-sm text-gray-700 font-medium">{day}:</span>
                                    <input
                                        type="text"
                                        className="flex-1 w-full px-3 py-2 border border-gray-300 bg-white rounded-lg text-sm text-black focus:ring-blue-500 focus:outline-none focus:border-blue-500"
                                        placeholder="e.g. 9am-5pm"
                                        value={formData.consultationTimeSlots?.[day] || ''}
                                        onChange={(e) => setFormData((prev: any) => ({
                                            ...prev,
                                            consultationTimeSlots: {
                                                ...prev.consultationTimeSlots,
                                                [day]: e.target.value
                                            }
                                        }))}
                                    />
                                </div>
                            ))}
                        </div>
                        <p className='text-xs text-gray-500 mb-2 italic'>
                            Best practices include offering as much availability as possible, with a healthy balance of morning and afternoon appointments to accommodate patient schedules.
                        </p>
                    </div>

                    <RadioGroup
                        label="Can we schedule same-day appointments?"
                        name="sameDayAppointments"
                        value={formData.sameDayAppointments}
                        onChange={handleTextChange('sameDayAppointments')}
                        options={['Yes', 'No']}
                        required
                    />

                    <div className="mb-6">
                        <label className="text-sm font-semibold text-gray-800 block mb-3">Appointment Details <span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 pl-4 border-l-2 border-gray-200">
                            <InputField
                                label="Minimum appointment notice"
                                value={formData.appointmentDetails?.minAppointmentNotice || ''}
                                onChange={(e: any) => setFormData({ ...formData, appointmentDetails: { ...formData.appointmentDetails, minAppointmentNotice: e.target.value } })}
                                required
                            />
                            <InputField
                                label="Appointment duration (30 min or 60 min)"
                                value={formData.appointmentDetails?.appointmentDuration || ''}
                                onChange={(e: any) => setFormData({ ...formData, appointmentDetails: { ...formData.appointmentDetails, appointmentDuration: e.target.value } })}
                                required
                            />
                            <InputField
                                label="Maximum number of appointments per day"
                                value={formData.appointmentDetails?.maxAppointmentsPerDay || ''}
                                onChange={(e: any) => setFormData({ ...formData, appointmentDetails: { ...formData.appointmentDetails, maxAppointmentsPerDay: e.target.value } })}
                                required
                            />
                            <InputField
                                label="No-call, no-show fee"
                                value={formData.appointmentDetails?.noCallNoShowFee || ''}
                                onChange={(e: any) => setFormData({ ...formData, appointmentDetails: { ...formData.appointmentDetails, noCallNoShowFee: e.target.value } })}
                                required
                                description="Patients are informed of this fee at scheduling."
                            />
                        </div>
                    </div>

                    <p className='text-xs text-gray-500 mb-2 italic'>
                        Patients are informed of a no-call, no-show fee at the time of scheduling. Card details are collected and shared with your team if you choose to enforce the fee. Most partners do not enforce it and instead use it as a psychological commitment to support strong show rates. Enforcement is at your discretion.
                    </p>

                    <InputField
                        label="When a patient is scheduled by our team, which email should receive the appointment details and Slack invite?"
                        value={formData.apptDetailsEmail}
                        onChange={handleTextChange('apptDetailsEmail')}
                        type="text"
                        required
                        description="(For multiple emails, separate them with commas) Slack allows a maximum of two seats. We recommend inviting the main office email, which can be used by all team members to log in using a six-digit code sent to that inbox. There is no limit on the number of users or devices logged in at the same time."
                    />

                    <p className='text-xs text-gray-500 mb-2 italic'>
                        Patients should be added to your PMS as quickly as possible so they receive standard confirmation and reminder messages, which supports higher show rates.
                    </p>

                    <InputField
                        label="Which email address should receive the quick post-appointment survey that reports how the appointment went?"
                        value={formData.surveyEmail}
                        onChange={handleTextChange('surveyEmail')}
                        type="text"
                        required
                        description="(For multiple emails, separate them with commas) Surveys are sent automatically one hour after the patient’s appointment start time. They include quick multiple-choice questions and take roughly 30 seconds to complete."
                    />
                </Section>
            )
        },
        {
            title: "Marketing Promotions",
            content: (
                <Section title="Marketing Promotions">
                    <div className="flex flex-col gap-2 w-full mb-6 relative">
                        <label className="text-sm font-semibold text-gray-800 relative z-10">Treatment Being Promoted (Select All that Apply) <span className="text-red-500">*</span></label>
                        <input type="text" className="absolute top-0 left-0 w-full h-10 opacity-0 pointer-events-none" value={formData.treatmentsPromoted?.length > 0 ? 'filled' : ''} onChange={() => { }} required />
                        <label className="flex items-center gap-2 mt-2 cursor-pointer text-gray-700">
                            <input
                                type="checkbox"
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                checked={formData.treatmentsPromoted?.includes('Dental Implants') || false}
                                onChange={(e) => {
                                    const val = 'Dental Implants';
                                    setFormData((prev: any) => ({
                                        ...prev,
                                        treatmentsPromoted: e.target.checked
                                            ? [...(prev.treatmentsPromoted || []), val]
                                            : (prev.treatmentsPromoted || []).filter((t: string) => t !== val)
                                    }));
                                }}
                            />
                            Dental Implants
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                            <input
                                type="checkbox"
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                checked={formData.treatmentsPromoted?.includes('Invisalign / Clear Aligners') || false}
                                onChange={(e) => {
                                    const val = 'Invisalign / Clear Aligners';
                                    setFormData((prev: any) => ({
                                        ...prev,
                                        treatmentsPromoted: e.target.checked
                                            ? [...(prev.treatmentsPromoted || []), val]
                                            : (prev.treatmentsPromoted || []).filter((t: string) => t !== val)
                                    }));
                                }}
                            />
                            Invisalign / Clear Aligners
                        </label>
                    </div>

                    {formData.treatmentsPromoted?.includes('Dental Implants') && (
                        <div className="mt-8 pt-6 border-t border-gray-300">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Implant Promotion</h3>
                            <CheckboxGroup
                                label="What’s Included: (Select All that Apply)"
                                values={formData.implantIncluded}
                                onChange={handleCheckChange('implantIncluded')}
                                options={['Complimentary consultation', 'Oral exam', 'CBCT scan', 'X-rays', 'Personalized treatment plan']}
                                required
                            />
                            {!(formData.implantIncluded.includes('CBCT scan') || formData.implantIncluded.includes('X-rays')) && (
                                <InputField label="Diagnostic Imaging Pricing (if not included in initial consult):" value={formData.diagnosticImagingPricing} onChange={handleTextChange('diagnosticImagingPricing')} />
                            )}

                            <div className="mt-6 mb-4">
                                <label className="text-sm font-semibold text-gray-800 block mb-3">Implant Pricing <span className="text-red-500">*</span></label>
                                <p className="text-xs text-gray-500 mb-4 italic">Please provide a competitive price range, including:<br />● As low as price<br />● All-inclusive up-to price</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 pl-4 border-l-2 border-gray-200">
                                    <InputField label="Fixed Zirconia Arch:" value={formData.implantPricingRange.FixedZirconiaArch} onChange={(e: any) => setFormData({ ...formData, implantPricingRange: { ...formData.implantPricingRange, FixedZirconiaArch: e.target.value } })} required />
                                    <InputField label="Hybrid Fixed Solution:" value={formData.implantPricingRange.HybridFixedSolution} onChange={(e: any) => setFormData({ ...formData, implantPricingRange: { ...formData.implantPricingRange, HybridFixedSolution: e.target.value } })} required />
                                    <InputField label="Implant-Retained Dentures (Snap-On):" value={formData.implantPricingRange.SnapOn} onChange={(e: any) => setFormData({ ...formData, implantPricingRange: { ...formData.implantPricingRange, SnapOn: e.target.value } })} required />
                                    <InputField label="Single Dental Implant:" value={formData.implantPricingRange.SingleImplant} onChange={(e: any) => setFormData({ ...formData, implantPricingRange: { ...formData.implantPricingRange, SingleImplant: e.target.value } })} required />
                                </div>
                            </div>

                            <h4 className="font-bold text-gray-800 mt-8 mb-4">What Is Included in the "As Low As" Price <span className="text-red-500">*</span></h4>
                            <div className="pl-4 border-l-2 border-gray-200 space-y-6">
                                <CheckboxGroup
                                    label="Fixed Zirconia Arch (Select All that Apply)"
                                    values={formData.zirconiaIncluded}
                                    onChange={handleCheckChange('zirconiaIncluded')}
                                    options={['Local anesthetic', 'Local sedation', 'IV sedation', 'Removal of unhealthy or remaining teeth (if needed)', 'Bone grafting and bone reduction (if needed)', 'Surgical implant placement', 'Immediate provisional arch placed at surgery', 'Final permanent fixed zirconia arch after healing', 'Not Offered']}
                                    required
                                />

                                <CheckboxGroup
                                    label="Hybrid Fixed Solution (Select All that Apply)"
                                    values={formData.hybridIncluded}
                                    onChange={handleCheckChange('hybridIncluded')}
                                    options={['Local anesthetic', 'Local sedation', 'IV sedation', 'Removal of unhealthy or remaining teeth (if needed)', 'Bone grafting and bone reduction (if needed)', 'Surgical implant placement', 'Fixed arch placed at the day of surgery', 'Not Offered']}
                                    required
                                />

                                <InputField label="Material used in hybrid solution:" value={formData.hybridMaterial} onChange={handleTextChange('hybridMaterial')} description="(PMMA, Resin, Other)" />


                                <CheckboxGroup
                                    label="Implant-Retained Dentures (Snap-On) (Select All that Apply)"
                                    values={formData.snapOnIncluded}
                                    onChange={handleCheckChange('snapOnIncluded')}
                                    options={['Local anesthetic', 'Local sedation', 'IV sedation', 'Removal of unhealthy or remaining teeth (if needed)', 'Bone grafting and bone reduction (if needed)', 'Surgical implant placement', 'Abutments', 'Custom snap-on denture prosthetic', 'Not Offered']}
                                    required
                                />

                                <CheckboxGroup
                                    label="Single Dental Implant (Select All that Apply)"
                                    values={formData.singleIncluded}
                                    onChange={handleCheckChange('singleIncluded')}
                                    options={['Local anesthetic', 'Local sedation', 'IV sedation', 'Tooth removal (if needed)', 'Bone grafting and bone reduction (if needed)', 'Surgical implant placement', 'Abutment', 'Final permanent crown', 'Not Offered']}
                                    required
                                />
                            </div>

                            <div className="mt-8">
                                <h4 className="font-bold text-gray-800 mb-4">Sedation:</h4>
                                <div className="pl-4 border-l-2 border-gray-200 space-y-4">
                                    <InputField
                                        label="If IV sedation or general anesthesia is available but not included in the listed price, please provide the applicable sedation price range:"
                                        value={formData.sedationPricing}
                                        onChange={handleTextChange('sedationPricing')}
                                    />
                                    <InputField label="Any Additional Notes:" value={formData.implantNotes} onChange={handleTextChange('implantNotes')} multiline />
                                </div>
                            </div>
                        </div>
                    )}

                    {formData.treatmentsPromoted?.includes('Invisalign / Clear Aligners') && (
                        <div className="mt-8 pt-6 border-t border-gray-300">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Invisalign / Clear Aligner Promotion</h3>
                            <CheckboxGroup
                                label="What’s Included: (Select All that Apply)"
                                values={formData.invisalignIncluded}
                                onChange={handleCheckChange('invisalignIncluded')}
                                options={['Complimentary consultation', 'Oral examination', '3D digital scan', 'Treatment plan preparation', 'Electronic toothbrush', 'Retainers at end of treatment', 'Teeth whitening kit at end of treatment']}
                            />

                            <div className="mt-6">
                                <div className="flex flex-col gap-6 w-full pl-4 border-l-2 border-gray-200">
                                    <div>
                                        <label className="text-sm font-semibold text-gray-800 block mb-3">Invisalign Pricing Details <span className="text-red-500">*</span></label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                                            <InputField label="Clear aligner brand:" value={formData.invisalignBrand} onChange={handleTextChange('invisalignBrand')} required />
                                            <InputField label="Discount amount:" value={formData.invisalignDiscount} onChange={handleTextChange('invisalignDiscount')} required />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-gray-800 block mb-3">Treatment price range with discount <span className="text-red-500">*</span></label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                                            <InputField label="Comprehensive:" value={formData.invisalignPriceComp} onChange={handleTextChange('invisalignPriceComp')} required />
                                            <InputField label="Express:" value={formData.invisalignPriceExpress} onChange={handleTextChange('invisalignPriceExpress')} required />
                                        </div>
                                    </div>
                                    <InputField label="Any Additional notes" value={formData.invisalignNotes} onChange={handleTextChange('invisalignNotes')} multiline />
                                </div>
                            </div>
                        </div>
                    )}
                </Section>
            )
        },
        {
            title: "Pricing for Other Common Services",
            content: (
                <Section title="Pricing for Other Common Services">
                    <p className="text-sm text-gray-600 mb-6 italic">For internal reference only. These prices will not be used in marketing materials and are intended to help answer patient inquiries.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 mb-8">
                        <InputField label="New patient exam & X-rays:" value={formData.pricingNewExamXRays} onChange={handleTextChange('pricingNewExamXRays')} required />
                        <InputField label="New patient exam, X-rays & Basic Cleaning:" value={formData.pricingNewExamCleaning} onChange={handleTextChange('pricingNewExamCleaning')} required />
                        <InputField label="Basic Cleaning (standalone, if available):" value={formData.pricingBasicCleaning} onChange={handleTextChange('pricingBasicCleaning')} required />
                        <InputField label="Deep cleaning (Per quadrant, Full mouth):" value={formData.pricingDeepCleaning} onChange={handleTextChange('pricingDeepCleaning')} required />
                        <InputField label="Extraction (Simple to surgical price range):" value={formData.pricingExtraction} onChange={handleTextChange('pricingExtraction')} required />
                        <InputField label="Invisalign/clear aligners:" value={formData.pricingInvisalign} onChange={handleTextChange('pricingInvisalign')} required />
                        <InputField label="Teeth whitening (In-house & Take-home):" value={formData.pricingWhitening} onChange={handleTextChange('pricingWhitening')} required />
                        <InputField label="Crowns (including buildup):" value={formData.pricingCrowns} onChange={handleTextChange('pricingCrowns')} required />
                        <InputField label="Veneers:" value={formData.pricingVeneers} onChange={handleTextChange('pricingVeneers')} required />
                        <InputField label="Bridge (per unit):" value={formData.pricingBridge} onChange={handleTextChange('pricingBridge')} required />
                    </div>
                </Section>
            )
        },
        {
            title: "Financing Options",
            content: (
                <Section title="Financing Options">
                    <MultiSelectDropdown
                        label="Financing Options Available In-Office"
                        values={formData.financingOptions}
                        onChange={handleCheckChange('financingOptions')}
                        options={['Proceed', 'CareCredit', 'Cherry', 'Sunbit', 'HFD', 'LendingClub', 'Alphaeon', 'DocPay', 'Union Financial', 'iCredit', 'Momnt', 'Free Life Funding', 'Healthcare Financing of America']}
                        required
                    />
                    <InputField label="Other financing options" value={formData.otherFinancing} onChange={handleTextChange('otherFinancing')} />
                </Section>
            )
        },
        {
            title: "Insurance Information",
            content: (
                <Section title="Insurance Information">
                    <CheckboxGroup
                        label="Insurance Accepted (Select All that Apply)"
                        values={formData.insuranceAccepted}
                        onChange={handleCheckChange('insuranceAccepted')}
                        options={['Most major PPO plans', 'HMO plans', 'DMO plans', 'Medicaid', 'Medicare', 'No insurance accepted']}
                        required
                    />
                    <CheckboxGroup
                        label="Network Status"
                        values={formData.networkStatus}
                        onChange={handleCheckChange('networkStatus')}
                        options={['In-network with selected plans', 'Out-of-network with selected plans, but we help patients maximize benefits', 'Insurance reimburses patient only', 'Insurance reimburses office only', 'Insurance may reimburse patient or office, depending on the plan']}
                        required
                    />
                    <InputField label="Name of Specific Accepted Insurance Providers (optional)" value={formData.specificInsurance} onChange={handleTextChange('specificInsurance')} />
                </Section>
            )
        },
        {
            title: "Advertising & Marketing Details",
            content: (
                <Section title="Advertising & Marketing Details">
                    <InputField label="Daily ad spend budget" value={formData.dailyAdSpend} onChange={handleTextChange('dailyAdSpend')} required />
                    <RadioGroup
                        label="Do you have marketing assets available for use in advertisements?"
                        name="hasMarketingAssets"
                        value={formData.hasMarketingAssets}
                        onChange={handleTextChange('hasMarketingAssets')}
                        options={['Yes', 'No']}
                        required
                        description="If yes, we will send a recap email after our meeting with a reminder to share your marketing assets."
                    />
                    <InputField label="Nearby well-known landmarks" value={formData.nearbyLandmarks} onChange={handleTextChange('nearbyLandmarks')} required description="Examples: major retailers, shopping centers, popular restaurants, or highway exits/intersections" />
                </Section>
            )
        },
        {
            title: "Phone Number Verification",
            content: (
                <Section title="Phone Number Verification">
                    <InputField label="Legal business name" value={formData.legalBusinessName} onChange={handleTextChange('legalBusinessName')} required description="Enter the exact business name as registered with the government and listed on tax documents." />
                    <RadioGroup
                        label="Business type"
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleTextChange('businessType')}
                        options={['Cooperative', 'Corporation', 'LLC or Sole Proprietorship', 'Non-Profit Corporation', 'Partnership']}
                        required
                    />
                    <InputField label="Business registration number (EIN)" value={formData.businessEIN} onChange={handleTextChange('businessEIN')} required description="Must be a 9-digit number (e.g., 12-3456789)." />
                    <InputField label="Business email" value={formData.businessEmail} onChange={handleTextChange('businessEmail')} type="email" required />
                    <InputField label="Business website" value={formData.businessWebsite} onChange={handleTextChange('businessWebsite')} required />
                </Section>
            )
        }
    ];

    return (
        <div className='min-h-screen bg-white'>
            <div className='max-w-4xl mx-auto p-4 md:p-8'>
                <div className='mx-auto flex flex-col justify-center max-w-[100%] gap-4'>
                    <img className='mx-auto' src="/patient_excel_logo.png" alt="logo" width={125} />
                    <h1 className='mx-auto text-center mt-6 text-3xl md:text-4xl font-bold text-black mb-2'>
                        Patient Excel Onboarding
                    </h1>
                    <div className='relative mx-auto text-center mt-2 text-black mb-8 max-w-[80%]'>
                        <p>Please fill out your practice and promotional information to get started.</p>
                        {process.env.NODE_ENV === 'development' && (
                            <button
                                type="button"
                                onClick={handleAutoFill}
                                className="absolute md:-right-20 -top-12 md:top-0 bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1.5 rounded-md font-semibold transition-colors shadow-sm"
                            >
                                Auto-Fill Test Data
                            </button>
                        )}
                    </div>
                    {submitted ? (
                        <div className="bg-green-50 p-8 rounded-xl text-center space-y-6">
                            <div className="flex justify-center">
                                <div className="bg-green-100 p-3 rounded-full">
                                    <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-green-700 mb-2">Thank you!</h2>
                                <p className="text-green-600">Your information has been successfully submitted to Patient Excel.</p>
                            </div>

                            <div className="pt-6 border-t border-green-100">
                                <p className="text-sm text-gray-600 mb-4">You can now download a PDF summary of your onboarding information for your records.</p>
                                <button
                                    type="button"
                                    onClick={() => downloadPatientExcelPDF(formData)}
                                    className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Download PDF Summary
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Step Navigation Bar */}
                            <div
                                ref={stepNavRef}
                                className="flex w-full overflow-x-auto pb-4 mb-4 hide-scrollbar snap-x snap-mandatory scroll-smooth"
                            >
                                <div className="flex space-x-2 min-w-max mx-auto px-4">
                                    {steps.map((step, index) => {
                                        const complete = isStepComplete(index);
                                        const isActive = currentStep === index;

                                        return (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => setCurrentStep(index)}
                                                className={`flex items-center space-x-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all snap-center whitespace-nowrap border-2
                                                    ${isActive
                                                        ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm'
                                                        : 'bg-white border-transparent text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                <span>{step.title}</span>
                                                {complete ? (
                                                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                ) : (
                                                    <span className="relative flex h-3 w-3">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-400"></span>
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (currentStep < steps.length - 1) {
                                        handleNext();
                                    } else {
                                        handleFormSubmit(e);
                                    }
                                }}
                                className='mx-auto w-full'
                                noValidate
                            >
                                {/* Progress bar */}
                                <div className="w-full bg-gray-200 rounded-full h-2 mb-8 mt-4 overflow-hidden">
                                    <motion.div
                                        className="bg-blue-600 h-2 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>

                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentStep}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    >
                                        {steps[currentStep].content}
                                    </motion.div>
                                </AnimatePresence>

                                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                                    {currentStep > 0 ? (
                                        <button
                                            type="button"
                                            key="back-button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handlePrev();
                                            }}
                                            className="px-6 py-3 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                                        >
                                            Back
                                        </button>
                                    ) : (
                                        <div key="spacer" /> // Placeholder for spacing
                                    )}

                                    {currentStep < steps.length - 1 ? (
                                        <button
                                            type="button"
                                            key="next-button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleNext();
                                            }}
                                            className="px-8 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md"
                                        >
                                            Next
                                        </button>
                                    ) : (
                                        <button
                                            type='submit'
                                            key="submit-button"
                                            disabled={loading}
                                            className='px-10 py-3 rounded-lg font-semibold text-white bg-black hover:bg-gray-800 transition-colors shadow-md disabled:bg-gray-400'
                                        >
                                            {loading ? 'Submitting...' : 'SUBMIT INFORMATION'}
                                        </button>
                                    )}
                                </div>
                            </form>

                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
