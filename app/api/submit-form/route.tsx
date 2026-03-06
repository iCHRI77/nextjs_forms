import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { createClient } from '@supabase/supabase-js';
import { FormSubmissionPDF } from '@/lib/FormSubmissionPDF';

// Configuración de Supabase (usando Service Role para evitar políticas de RLS en el servidor si es necesario)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const ghlWebhookUrl = process.env.GHL_WEBHOOK_URL || '';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, message } = body;

    // 1. Validación básica
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios (nombre, email, teléfono)' },
        { status: 400 }
      );
    }

    // 2. Generación del PDF
    // Usamos renderToBuffer de @react-pdf/renderer para obtener un Buffer directamente
    const pdfBuffer = await renderToBuffer(<FormSubmissionPDF data={{ name, email, phone, message }} />);

    // 3. Almacenamiento en Supabase Storage
    const fileName = `submission-${Date.now()}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from('form-submissions')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error al subir a Supabase:', uploadError);
      throw new Error('Error al guardar el archivo en el storage.');
    }

    // 4. Obtención de URL Pública
    const { data: { publicUrl } } = supabase.storage
      .from('form-submissions')
      .getPublicUrl(fileName);

    // 5. Envío a Webhook (GHL)
    if (ghlWebhookUrl) {
      const ghlResponse = await fetch(ghlWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...body,
          pdf_url: publicUrl,
          submitted_at: new Date().toISOString(),
        }),
      });

      if (!ghlResponse.ok) {
        console.warn('GHL Webhook respondió con error:', ghlResponse.status);
        // Opcional: podrías fallar aquí o continuar si el PDF ya se guardó
      }
    } else {
      console.warn('GHL_WEBHOOK_URL no está configurada.');
    }

    return NextResponse.json({
      success: true,
      message: 'Formulario procesado correctamente.',
      pdf_url: publicUrl,
    }, { status: 200 });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error en Route Handler:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.', details: errorMessage },
      { status: 500 }
    );
  }
}
