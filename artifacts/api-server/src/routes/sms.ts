import { Router } from "express";
import twilio from "twilio";

const router = Router();

router.post("/sms/sos", async (req, res) => {
  const { contacts, location, message } = req.body as {
    contacts: string[];
    location?: { lat: number; lng: number } | null;
    message?: string;
  };

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    res.status(500).json({ error: "Twilio credentials not configured" });
    return;
  }

  if (!contacts || contacts.length === 0) {
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

  const results = await Promise.allSettled(
    contacts.map((to) =>
      client.messages.create({ body, from: fromNumber, to })
    )
  );

  const sent: string[] = [];
  const failed: { to: string; error: string }[] = [];

  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      sent.push(contacts[i]);
    } else {
      failed.push({ to: contacts[i], error: (result.reason as Error).message });
    }
  });

  req.log.info({ sent, failed }, "SOS SMS results");

  res.json({ sent, failed });
});

export default router;
