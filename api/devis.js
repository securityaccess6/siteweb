const { Resend } = require("resend");

const DESTINATION_EMAIL = "asmaserhane634@gmail.com";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Méthode non autorisée." });
  }

  const { name, phone, service, message } = req.body || {};

  if (!name || !phone || !service) {
    return res.status(400).json({
      ok: false,
      error: "Champs requis manquants.",
    });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return res.status(500).json({
      ok: false,
      error: "RESEND_API_KEY manquante dans l'environnement.",
    });
  }

  const resend = new Resend(resendApiKey);

  try {
    const sentAt = new Date().toLocaleString("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    });
    const safeName = escapeHtml(name);
    const safePhone = escapeHtml(phone);
    const safeService = escapeHtml(service);
    const safeMessage = escapeHtml(message || "Aucun message");

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.45; color: #111827;">
        <h2 style="margin: 0 0 12px;">Nouvelle demande de devis</h2>
        <p style="margin: 0 0 14px;">
          <strong>Security Access</strong> - formulaire site web
        </p>
        <table style="border-collapse: collapse; width: 100%; max-width: 560px;">
          <tr><td style="padding: 6px 0;"><strong>Nom :</strong></td><td>${safeName}</td></tr>
          <tr><td style="padding: 6px 0;"><strong>Téléphone :</strong></td><td><a href="tel:${safePhone}">${safePhone}</a></td></tr>
          <tr><td style="padding: 6px 0;"><strong>Service :</strong></td><td>${safeService}</td></tr>
          <tr><td style="padding: 6px 0;"><strong>Reçu le :</strong></td><td>${sentAt}</td></tr>
        </table>
        <p style="margin: 14px 0 6px;"><strong>Message client :</strong></p>
        <p style="margin: 0; padding: 10px 12px; background: #f3f4f6; border-radius: 8px;">
          ${safeMessage}
        </p>
      </div>
    `;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: [DESTINATION_EMAIL],
      subject: `Nouveau devis (${service}) - ${name}`,
      html,
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "Echec de l'envoi de l'email.",
      details: error && error.message ? error.message : "Erreur inconnue",
    });
  }
};
