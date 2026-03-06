import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 40,
        backgroundColor: '#ffffff',
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 30,
        borderBottomWidth: 2,
        borderBottomColor: '#2563eb',
        paddingBottom: 15,
    },
    title: {
        fontSize: 24,
        color: '#1e3a8a',
        fontWeight: 'bold',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 10,
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    section: {
        marginBottom: 20,
    },
    field: {
        flexDirection: 'row',
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        paddingBottom: 4,
    },
    label: {
        fontSize: 10,
        color: '#475569',
        width: 100,
        fontWeight: 'bold',
    },
    value: {
        fontSize: 11,
        color: '#0f172a',
        flex: 1,
    },
    messageSection: {
        marginTop: 10,
        padding: 15,
        backgroundColor: '#f8fafc',
        borderRadius: 4,
    },
    messageLabel: {
        fontSize: 10,
        color: '#475569',
        fontWeight: 'bold',
        marginBottom: 8,
    },
    messageText: {
        fontSize: 11,
        color: '#334155',
        lineHeight: 1.5,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingTop: 10,
    },
    footerText: {
        fontSize: 8,
        color: '#94a3b8',
    }
});

interface FormSubmissionData {
    name: string;
    email: string;
    phone: string;
    message?: string;
}

export const FormSubmissionPDF = ({ data }: { data: FormSubmissionData }) => (
    <Document title={`Submission_${data.name}`}>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.title}>Form Submission Details</Text>
                <Text style={styles.subtitle}>Received on {new Date().toLocaleDateString()}</Text>
            </View>

            <View style={styles.section}>
                <View style={styles.field}>
                    <Text style={styles.label}>Full Name:</Text>
                    <Text style={styles.value}>{data.name}</Text>
                </View>
                <View style={styles.field}>
                    <Text style={styles.label}>Email Address:</Text>
                    <Text style={styles.value}>{data.email}</Text>
                </View>
                <View style={styles.field}>
                    <Text style={styles.label}>Phone Number:</Text>
                    <Text style={styles.value}>{data.phone}</Text>
                </View>
            </View>

            {data.message && (
                <View style={styles.messageSection}>
                    <Text style={styles.messageLabel}>Message:</Text>
                    <Text style={styles.messageText}>{data.message}</Text>
                </View>
            )}

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    © {new Date().getFullYear()} All Rights Reserved.
                </Text>
            </View>
        </Page>
    </Document>
);
