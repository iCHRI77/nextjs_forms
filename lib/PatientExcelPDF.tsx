'use client';

import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    pdf
} from '@react-pdf/renderer';

// --- Styles for the PDF ---
const styles = StyleSheet.create({
    page: {
        padding: 30,
        backgroundColor: '#ffffff',
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#2563eb',
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        color: '#1e3a8a',
        fontWeight: 'bold',
    },
    date: {
        fontSize: 10,
        color: '#64748b',
    },
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 12,
        color: '#2563eb',
        fontWeight: 'bold',
        marginBottom: 5,
        textTransform: 'uppercase',
        backgroundColor: '#f1f5f9',
        padding: 4,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 4,
        flexWrap: 'wrap',
    },
    label: {
        fontSize: 9,
        color: '#475569',
        width: 140,
        fontWeight: 'bold',
    },
    value: {
        fontSize: 9,
        color: '#0f172a',
        flex: 1,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    gridItem: {
        width: '50%',
        paddingRight: 10,
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 30,
        right: 30,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingTop: 8,
        textAlign: 'center',
    },
    footerText: {
        fontSize: 8,
        color: '#94a3b8',
    }
});

// Helper to format values
const formatValue = (val: unknown) => {
    if (Array.isArray(val)) return val.join(', ') || 'N/A';
    if (typeof val === 'object' && val !== null) {
        return Object.entries(val as Record<string, unknown>)
            .filter(([, v]) => v)
            .map(([k, v]) => `${k}: ${v}`)
            .join(' | ');
    }
    return val?.toString() || 'N/A';
};

// --- PDF Template Component ---
export const PatientOnboardingPDF = ({ data }: { data: Record<string, any> }) => (
    <Document title={`Onboarding_${data.dentalPracticeName || 'Patient_Excel'}`}>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Patient Excel Onboarding Summary</Text>
                <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>
            </View>

            {/* Step 0: Client Info */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Client Information</Text>
                <View style={styles.grid}>
                    <View style={styles.gridItem}>
                        <View style={styles.row}><Text style={styles.label}>Full Name:</Text><Text style={styles.value}>{data.clientFullName}</Text></View>
                        <View style={styles.row}><Text style={styles.label}>Office Phone:</Text><Text style={styles.value}>{data.mainOfficePhone}</Text></View>
                    </View>
                    <View style={styles.gridItem}>
                        <View style={styles.row}><Text style={styles.label}>Practice Name:</Text><Text style={styles.value}>{data.dentalPracticeName}</Text></View>
                        <View style={styles.row}><Text style={styles.label}>Languages Spoken:</Text><Text style={styles.value}>{data.languagesSpoken}</Text></View>
                    </View>
                </View>
            </View>

            {/* Step 1: Address */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Practice Address</Text>
                <View style={styles.row}><Text style={styles.label}>Street:</Text><Text style={styles.value}>{data.streetAddress}</Text></View>
                <View style={styles.grid}>
                    <View style={styles.gridItem}>
                        <View style={styles.row}><Text style={styles.label}>City/State/Zip:</Text><Text style={styles.value}>{data.city}, {data.state} {data.zipCode}</Text></View>
                        <View style={styles.row}><Text style={styles.label} >Multiple Locations:</Text><Text style={styles.value}>{data.multipleLocations}</Text></View>
                    </View>
                    <View style={styles.gridItem}>
                        <View style={styles.row}><Text style={styles.label}>Country:</Text><Text style={styles.value}>{data.country}</Text></View>
                        <View style={styles.row}><Text style={styles.label}>Time Zone:</Text><Text style={styles.value}>{data.timeZone}</Text></View>
                    </View>
                </View>
                {data.multipleLocations === 'Yes' && (
                    <View style={styles.row}><Text style={styles.label}>Additional addresses:</Text><Text style={styles.value}>{data.additionalLocations}</Text></View>
                )}
            </View>

            {/* Step 2: Leads */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Lead Notifications</Text>
                <View style={styles.row}><Text style={styles.label}>Receive notifications:</Text><Text style={styles.value}>{data.receiveLeadNotifications}</Text></View>
                {data.receiveLeadNotifications === 'Yes' && (
                    <View style={styles.row}><Text style={styles.label}>Email(s):</Text><Text style={styles.value}>{data.leadNotificationEmail}</Text></View>
                )}
            </View>

            {/* Step 3: Scheduling */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Scheduling Logistics</Text>
                <View style={styles.row}><Text style={styles.label}>Consultation Time Slots:</Text><Text style={styles.value}>{formatValue(data.consultationTimeSlots)}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Same-Day Appointments:</Text><Text style={styles.value}>{data.sameDayAppointments}</Text></View>
                <View style={styles.grid}>
                    <View style={styles.gridItem}>
                        <View style={styles.row}><Text style={styles.label}>Min Notice:</Text><Text style={styles.value}>{data.appointmentDetails?.minAppointmentNotice}</Text></View>
                        <View style={styles.row}><Text style={styles.label}>Duration:</Text><Text style={styles.value}>{data.appointmentDetails?.appointmentDuration}</Text></View>
                    </View>
                    <View style={styles.gridItem}>
                        <View style={styles.row}><Text style={styles.label}>Max per day:</Text><Text style={styles.value}>{data.appointmentDetails?.maxAppointmentsPerDay}</Text></View>
                        <View style={styles.row}><Text style={styles.label}>No-show fee:</Text><Text style={styles.value}>${data.appointmentDetails?.noCallNoShowFee}</Text></View>
                    </View>
                </View>
                <View style={styles.row}><Text style={styles.label}>Email for details/Slack:</Text><Text style={styles.value}>{data.apptDetailsEmail}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Email for survey:</Text><Text style={styles.value}>{data.surveyEmail}</Text></View>
            </View>

            {/* Step 4: Marketing Promotions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Marketing Promotions</Text>
                <View style={styles.row}><Text style={styles.label}>Treatments Promoted:</Text><Text style={styles.value}>{formatValue(data.treatmentsPromoted)}</Text></View>

                {data.treatmentsPromoted?.includes('Dental Implants') && (
                    <View style={{ marginTop: 10, borderLeftWidth: 1, borderLeftColor: '#e2e8f0', paddingLeft: 10 }}>
                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1e3a8a', marginBottom: 5 }}>Implant Promotion Details:</Text>
                        <View style={styles.row}><Text style={styles.label}>{"What's Included:"}</Text><Text style={styles.value}>{formatValue(data.implantIncluded)}</Text></View>
                        {data.diagnosticImagingPricing && (
                            <View style={styles.row}><Text style={styles.label}>Imaging Pricing:</Text><Text style={styles.value}>{data.diagnosticImagingPricing}</Text></View>
                        )}
                        <Text style={{ fontSize: 9, fontWeight: 'bold', marginTop: 5, marginBottom: 2 }}>Implant Pricing Range:</Text>
                        <View style={styles.grid}>
                            <View style={styles.gridItem}>
                                <View style={styles.row}><Text style={{ fontSize: 8, width: 90 }}>Zirconia Arch:</Text><Text style={{ fontSize: 8 }}>{data.implantPricingRange?.FixedZirconiaArch}</Text></View>
                                <View style={styles.row}><Text style={{ fontSize: 8, width: 90 }}>Hybrid Solution:</Text><Text style={{ fontSize: 8 }}>{data.implantPricingRange?.HybridFixedSolution}</Text></View>
                            </View>
                            <View style={styles.gridItem}>
                                <View style={styles.row}><Text style={{ fontSize: 8, width: 90 }}>Snap-On:</Text><Text style={{ fontSize: 8 }}>{data.implantPricingRange?.SnapOn}</Text></View>
                                <View style={styles.row}><Text style={{ fontSize: 8, width: 90 }}>Single Implant:</Text><Text style={{ fontSize: 8 }}>{data.implantPricingRange?.SingleImplant}</Text></View>
                            </View>
                        </View>

                        <Text style={{ fontSize: 9, fontWeight: 'bold', marginTop: 5 }}>{"What's included in \"As Low As\" price:"}</Text>
                        <View style={styles.row}><Text style={styles.label}>Zirconia:</Text><Text style={styles.value}>{formatValue(data.zirconiaIncluded)}</Text></View>
                        <View style={styles.row}><Text style={styles.label}>Hybrid:</Text><Text style={styles.value}>{formatValue(data.hybridIncluded)}</Text></View>
                        {data.hybridMaterial && <View style={styles.row}><Text style={styles.label}>Hybrid Material:</Text><Text style={styles.value}>{data.hybridMaterial}</Text></View>}
                        <View style={styles.row}><Text style={styles.label}>Snap-On:</Text><Text style={styles.value}>{formatValue(data.snapOnIncluded)}</Text></View>
                        <View style={styles.row}><Text style={styles.label}>Single Implant:</Text><Text style={styles.value}>{formatValue(data.singleIncluded)}</Text></View>
                        <View style={styles.row}><Text style={styles.label}>Sedation Pricing:</Text><Text style={styles.value}>{data.sedationPricing}</Text></View>
                        {data.implantNotes && <View style={styles.row}><Text style={styles.label}>Additional Notes:</Text><Text style={styles.value}>{data.implantNotes}</Text></View>}
                    </View>
                )}

                {data.treatmentsPromoted?.includes('Invisalign / Clear Aligners') && (
                    <View style={{ marginTop: 10, borderLeftWidth: 1, borderLeftColor: '#e2e8f0', paddingLeft: 10 }}>
                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1e3a8a', marginBottom: 5 }}>Invisalign Promotion Details:</Text>
                        <View style={styles.row}><Text style={styles.label}>{"What's Included:"}</Text><Text style={styles.value}>{formatValue(data.invisalignIncluded)}</Text></View>
                        <View style={styles.grid}>
                            <View style={styles.gridItem}>
                                <View style={styles.row}><Text style={styles.label}>Brand:</Text><Text style={styles.value}>{data.invisalignBrand}</Text></View>
                                <View style={styles.row}><Text style={styles.label}>Discount:</Text><Text style={styles.value}>{data.invisalignDiscount}</Text></View>
                            </View>
                            <View style={styles.gridItem}>
                                <View style={styles.row}><Text style={styles.label}>Comp. Price:</Text><Text style={styles.value}>{data.invisalignPriceComp}</Text></View>
                                <View style={styles.row}><Text style={styles.label}>Express Price:</Text><Text style={styles.value}>{data.invisalignPriceExpress}</Text></View>
                            </View>
                        </View>
                        {data.invisalignNotes && <View style={styles.row}><Text style={styles.label}>Additional Notes:</Text><Text style={styles.value}>{data.invisalignNotes}</Text></View>}
                    </View>
                )}
            </View>

            {/* Step 5: Other Pricing */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pricing for Other Common Services</Text>
                <View style={styles.grid}>
                    <View style={styles.gridItem}>
                        <View style={styles.row}><Text style={styles.label}>New patient exam & X-rays:</Text><Text style={styles.value}>{data.pricingNewExamXRays}</Text></View>
                        <View style={styles.row}><Text style={styles.label}>New patient exam, X-rays & Basic Cleaning:</Text><Text style={styles.value}>{data.pricingNewExamCleaning}</Text></View>
                        <View style={styles.row}><Text style={styles.label}>Basic Cleaning:</Text><Text style={styles.value}>{data.pricingBasicCleaning}</Text></View>
                        <View style={styles.row}><Text style={styles.label}>Deep Cleaning:</Text><Text style={styles.value}>{data.pricingDeepCleaning}</Text></View>
                        <View style={styles.row}><Text style={styles.label}>Extraction:</Text><Text style={styles.value}>{data.pricingExtraction}</Text></View>
                    </View>
                    <View style={styles.gridItem}>
                        <View style={styles.row}><Text style={styles.label}>Invisalign:</Text><Text style={styles.value}>{data.pricingInvisalign}</Text></View>
                        <View style={styles.row}><Text style={styles.label}>Whitening:</Text><Text style={styles.value}>{data.pricingWhitening}</Text></View>
                        <View style={styles.row}><Text style={styles.label}>Crowns:</Text><Text style={styles.value}>{data.pricingCrowns}</Text></View>
                        <View style={styles.row}><Text style={styles.label}>Veneers:</Text><Text style={styles.value}>{data.pricingVeneers}</Text></View>
                        <View style={styles.row}><Text style={styles.label}>Bridge:</Text><Text style={styles.value}>{data.pricingBridge}</Text></View>
                    </View>
                </View>
            </View>

            {/* Step 6: Financing */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Financing Options</Text>
                <View style={styles.row}><Text style={styles.label}>Options available:</Text><Text style={styles.value}>{formatValue(data.financingOptions)}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Other Financing:</Text><Text style={styles.value}>{data.otherFinancing || 'N/A'}</Text></View>
            </View>

            {/* Step 7: Insurance */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Insurance Information</Text>
                <View style={styles.row}><Text style={styles.label}>Accepted Insurance:</Text><Text style={styles.value}>{formatValue(data.insuranceAccepted)}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Network Status:</Text><Text style={styles.value}>{formatValue(data.networkStatus)}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Specific Providers:</Text><Text style={styles.value}>{data.specificInsurance || 'N/A'}</Text></View>
            </View>

            {/* Step 8: Advertising */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Advertising & Marketing Details</Text>
                <View style={styles.row}><Text style={styles.label}>Daily Ad Budget:</Text><Text style={styles.value}>{data.dailyAdSpend}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Marketing Assets:</Text><Text style={styles.value}>{data.hasMarketingAssets}</Text></View>
                <View style={styles.row}><Text style={styles.label}>Nearby Landmarks:</Text><Text style={styles.value}>{data.nearbyLandmarks}</Text></View>
            </View>

            {/* Step 9: Legal (Phone Number Verification) */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Business Legal Information</Text>
                <View style={styles.grid}>
                    <View style={styles.gridItem}>
                        <View style={styles.row}><Text style={styles.label}>Legal Business Name:</Text><Text style={styles.value}>{data.legalBusinessName}</Text></View>
                        <View style={styles.row}><Text style={styles.label}>Business Type:</Text><Text style={styles.value}>{data.businessType}</Text></View>
                    </View>
                    <View style={styles.gridItem}>
                        <View style={styles.row}><Text style={styles.label}>Business EIN:</Text><Text style={styles.value}>{data.businessEIN}</Text></View>
                        <View style={styles.row}><Text style={styles.label}>Business Email:</Text><Text style={styles.value}>{data.businessEmail}</Text></View>
                    </View>
                </View>
                <View style={styles.row}><Text style={styles.label}>Business Website:</Text><Text style={styles.value}>{data.businessWebsite}</Text></View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Document strictly for internal onboarding purposes. © {new Date().getFullYear()} Patient Excel
                </Text>
            </View>
        </Page>
    </Document>
);

// Helper function to trigger download
export const downloadPatientExcelPDF = async (data: Record<string, any>) => {
    try {
        const blob = await pdf(<PatientOnboardingPDF data={data} />).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Onboarding_${data.dentalPracticeName?.replace(/\s+/g, '_') || 'Submission'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return true;
    } catch (error) {
        console.error('Error generating PDF:', error);
        return false;
    }
};

