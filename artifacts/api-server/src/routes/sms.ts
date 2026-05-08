import { Router } from "express";
import twilio from "twilio";

const router = Router();

router.post("/sms/sos", async (req, res) => {
  const { contacts, location, message } = req.body as {
    contacts: string[];
    location?: { lat: number; lng: number } | null;
    message?: string;
  };

  req.log.info({ contacts, location }, "[SMS] Incoming SOS request");

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  req.log.info({
    sidConfigured: !!accountSid,
    sidPrefix: accountSid?.substring(0, 6),
    tokenLength: authToken?.length,
    fromNumber,
  }, "[SMS] Twilio config check");

  if (!accountSid || !authToken || !fromNumber) {
    req.log.error("[SMS] Twilio credentials missing");
    res.status(500).json({ error: "Twilio credentials not configured" });
    return;
  }

  if (!contacts || contacts.length === 0) {
    req.log.warn("[SMS] No contacts in request body");
    res.status(400).json({ error: "No emergency contacts provided" });
    return;
  }

  const client = twilio(accountSid, authToken);

  const locationText = location
    ? `\nLocation: https://maps.google.com/?q=${location.lat},${location.lng}`
    : "\nLocation: unavailable";

  const body =
    message ||
    `🚨 EMERGENCY SOS from SafeHer!\n\nI need help immediately. This is an automated distress signal.${locationText}\n\nPlease call me or emergency services right away.`;

  req.log.info({ recipients: contacts, from: fromNumber }, "[SMS] Attempting to send to recipients");

  const results = await Promise.allSettled(
    contacts.map((to) => {
      req.log.info({ from: fromNumber, to }, "[SMS] Sending message");
      return client.messages.create({ body, from: fromNumber, to });
    })
  );

  const sent: string[] = [];
  const failed: { to: string; error: string }[] = [];

  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      req.log.info({ to: contacts[i], messageSid: result.value.sid }, "[SMS] Message delivered");
      sent.push(contacts[i]);
    } else {
      req.log.error({ to: contacts[i], error: (result.reason as Error).message }, "[SMS] Message failed");
      failed.push({ to: contacts[i], error: (result.reason as Error).message });
    }
  });

  req.log.info({ sent, failed }, "[SMS] Final SOS results");
  res.json({ sent, failed });
});

export default router;
