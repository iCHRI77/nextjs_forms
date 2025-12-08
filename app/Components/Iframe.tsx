// app/components/Iframe.tsx
'use client';                     // Necesario porque usaremos `window`
import React, { useEffect, useState } from 'react';
type IframeProps = {
    /** URL que se mostrará dentro del iframe */
    src: string;
    /** Altura opcional (por defecto 600px) */
    height?: string | number;
    /** Ancho opcional (por defecto 100%) */
    width?: string | number;
    /** Si quieres que el iframe tenga bordes redondeados, etc. */
    className?: string;
};
export const Iframe: React.FC<IframeProps> = ({
    src,
    height = 600,
    width = '100%',
    className = '',
}) => {
    const [resolvedSrc, setResolvedSrc] = useState<string>('');
    // En el cliente construimos la URL completa (para que funcione tanto en dev como prod)
    useEffect(() => {
        const base = window.location.origin; // ej. http://localhost:3000
        const fullUrl = src.startsWith('http')
            ? src
            : `${base}${src.startsWith('/') ? '' : '/'}${src}`;
        setResolvedSrc(fullUrl);
    }, [src]);
    return (
        <iframe
            src={resolvedSrc}
            title="Embedded FrontCare Wellness Form"
            width={width}
            height={height}
            className={className}
            style={{ border: 'none', borderRadius: '8px' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            sandbox="allow-scripts allow-same-origin allow-forms"
        />
    );
};