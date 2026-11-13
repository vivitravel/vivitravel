import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY ?? "");
  return _resend;
}
const FROM = process.env.RESEND_FROM ?? "Vivitravels <noreply@vivitravels.com.ar>";
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vivitravel.vercel.app";

function baseTemplate(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
      <!-- Header -->
      <tr>
        <td style="background:#092B4D;padding:28px 32px;">
          <a href="${SITE}" style="text-decoration:none;">
            <span style="color:#fff;font-size:22px;font-weight:800;letter-spacing:-.5px;">VIVITRAVELS</span>
          </a>
        </td>
      </tr>
      <!-- Body -->
      <tr>
        <td style="padding:36px 32px 24px;">
          ${body}
        </td>
      </tr>
      <!-- Footer -->
      <tr>
        <td style="padding:20px 32px 32px;border-top:1px solid #eef0f3;">
          <p style="margin:0;font-size:12px;color:#8a9ab0;line-height:1.6;">
            Recibiste este mail porque tenés una cuenta en Vivitravels.<br/>
            <a href="${SITE}" style="color:#087F9D;text-decoration:none;">vivitravels.com.ar</a>
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

export async function sendApprovalEmail({
  to,
  listingTitle,
  listingSlug,
}: {
  to: string;
  listingTitle: string;
  listingSlug: string;
}) {
  const url = `${SITE}/publicacion/${listingSlug}`;
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#092B4D;">¡Tu publicación fue aprobada!</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#4a5568;line-height:1.7;">
      Tu propuesta <strong>${listingTitle}</strong> ya está visible en Vivitravels y los viajeros pueden encontrarla.
    </p>
    <a href="${url}" style="display:inline-block;background:#087F9D;color:#fff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:10px;">
      Ver mi publicación
    </a>
    <p style="margin:28px 0 0;font-size:14px;color:#4a5568;line-height:1.7;">
      Podés ver las estadísticas (vistas, clics y guardados) desde tu
      <a href="${SITE}/prestador/estadisticas" style="color:#087F9D;">portal del prestador</a>.
    </p>`;

  return getResend().emails.send({
    from: FROM,
    to,
    subject: `✅ Tu publicación "${listingTitle}" fue aprobada`,
    html: baseTemplate("Publicación aprobada", body),
  });
}

export async function sendRejectionEmail({
  to,
  listingTitle,
  reason,
}: {
  to: string;
  listingTitle: string;
  reason: string;
}) {
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#092B4D;">Tu publicación necesita ajustes</h1>
    <p style="margin:0 0 20px;font-size:15px;color:#4a5568;line-height:1.7;">
      Revisamos tu propuesta <strong>${listingTitle}</strong> y por el momento no pudo ser aprobada.
    </p>
    <div style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:14px;color:#b91c1c;line-height:1.7;"><strong>Motivo:</strong> ${reason}</p>
    </div>
    <p style="margin:0 0 24px;font-size:15px;color:#4a5568;line-height:1.7;">
      Podés editar tu publicación, hacer las correcciones necesarias y volver a enviarla para revisión.
    </p>
    <a href="${SITE}/prestador/publicaciones" style="display:inline-block;background:#092B4D;color:#fff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:10px;">
      Ir a mis publicaciones
    </a>`;

  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Tu publicación "${listingTitle}" necesita ajustes`,
    html: baseTemplate("Publicación rechazada", body),
  });
}

export async function sendExpiryWarningEmail({
  to,
  providerName,
  planName,
  expiresAt,
}: {
  to: string;
  providerName: string;
  planName: string;
  expiresAt: Date;
}) {
  const dateStr = expiresAt.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#092B4D;">Tu plan vence pronto</h1>
    <p style="margin:0 0 20px;font-size:15px;color:#4a5568;line-height:1.7;">
      Hola <strong>${providerName}</strong>, te avisamos que tu plan <strong>${planName}</strong> vence el <strong>${dateStr}</strong>.
    </p>
    <p style="margin:0 0 24px;font-size:15px;color:#4a5568;line-height:1.7;">
      Para que tus publicaciones sigan activas, renovalo antes de esa fecha.
    </p>
    <a href="${SITE}/prestador/plan" style="display:inline-block;background:#FF991F;color:#092B4D;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:10px;">
      Renovar mi plan
    </a>`;

  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Tu plan ${planName} vence el ${dateStr}`,
    html: baseTemplate("Tu plan vence pronto", body),
  });
}
