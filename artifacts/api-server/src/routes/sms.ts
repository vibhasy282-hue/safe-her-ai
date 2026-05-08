import { Router } from "express";
import twilio from "twilio";

const router = Router();

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error("geocode request failed");
    const data = await res.json() as {
      locality?: string;
      city?: string;
      principalSubdivision?: string;
      countryName?: string;
    };
    const parts = [
      data.locality || data.city,
      data.principalSubdivision,
      data.countryName,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

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

  // Guard: never send to the Twilio sender number itself
  const normalise = (n: string) => n.replace(/\s+/g, "").trim();
  const filteredContacts = contacts.filter(c => normalise(c) !== normalise(fromNumber));
  const selfFiltered = contacts.filter(c => normalise(c) === normalise(fromNumber));

  if (selfFiltered.length > 0) {
    req.log.warn({ removed: selfFiltered }, "[SMS] Removed Twilio sender number from recipient list");
  }

  if (filteredContacts.length === 0) {
    req.log.warn("[SMS] All contacts were the sender number — nothing to send");
    res.status(400).json({ error: "Emergency contact cannot be the same as the Twilio sender number" });
    return;
  }

  // Build location string with human-readable address
  let locationText = "\nLocation: unavailable";
  if (location) {
    const address = await reverseGeocode(location.lat, location.lng);
    const mapsUrl = `https://maps.google.com/?q=${location.lat},${location.lng}`;
    locationText = `\nLocation: ${address}\nMap: ${mapsUrl}`;
    req.log.info({ address, mapsUrl }, "[SMS] Resolved location address");
  }

  const body =
    message ||
    `🚨 EMERGENCY SOS — SafeHer Alert!\n\nI need help immediately. This is an automated distress signal.\n${locationText}\n\nPlease call me or contact emergency services (112 / 911) right away.`;

  req.log.info({ recipients: filteredContacts, from: fromNumber }, "[SMS] Attempting to send to recipients");

  const client = twilio(accountSid, authToken);

  const results = await Promise.allSettled(
    filteredContacts.map((to) => {
      req.log.info({ from: fromNumber, to }, "[SMS] Sending message");
      return client.messages.create({ body, from: fromNumber, to });
    })
  );

  const sent: string[] = [];
  const failed: { to: string; error: string }[] = [];

  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      req.log.info({ to: filteredContacts[i], messageSid: result.value.sid }, "[SMS] Message delivered");
      sent.push(filteredContacts[i]);
    } else {
      req.log.error({ to: filteredContacts[i], error: (result.reason as Error).message }, "[SMS] Message failed");
      failed.push({ to: filteredContacts[i], error: (result.reason as Error).message });
    }
  });

  req.log.info({ sent, failed }, "[SMS] Final SOS results");
  res.json({ sent, failed, selfFiltered });
});

export default router;
