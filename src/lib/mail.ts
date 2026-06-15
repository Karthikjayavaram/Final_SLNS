import nodemailer from 'nodemailer';

const isSmtpConfigured =
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

const transporter = isSmtpConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

interface BookingEmailData {
  name: string;
  phone: string;
  email?: string;
  eventType: string;
  eventDate: string;
  location: string;
  budget?: number;
  specialRequirements?: string;
}

export async function sendBookingNotification(data: BookingEmailData): Promise<void> {
  const subject = `🎉 New Booking Request: ${data.eventType} by ${data.name}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0A0A0A; color: #F5F0E8;">
      <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #AA7C11;">
        <h1 style="color: #D4B56B; font-size: 28px; margin: 0;">SLNS Events</h1>
        <p style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 3px;">New Booking Request</p>
      </div>
      <div style="padding: 24px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #AA7C11; font-weight: bold;">Client Name</td><td style="padding: 8px 0;">${data.name}</td></tr>
          <tr><td style="padding: 8px 0; color: #AA7C11; font-weight: bold;">Phone</td><td style="padding: 8px 0;">${data.phone}</td></tr>
          <tr><td style="padding: 8px 0; color: #AA7C11; font-weight: bold;">Email</td><td style="padding: 8px 0;">${data.email || 'Not provided'}</td></tr>
          <tr><td style="padding: 8px 0; color: #AA7C11; font-weight: bold;">Event Type</td><td style="padding: 8px 0;">${data.eventType}</td></tr>
          <tr><td style="padding: 8px 0; color: #AA7C11; font-weight: bold;">Event Date</td><td style="padding: 8px 0;">${data.eventDate}</td></tr>
          <tr><td style="padding: 8px 0; color: #AA7C11; font-weight: bold;">Location</td><td style="padding: 8px 0;">${data.location}</td></tr>
          <tr><td style="padding: 8px 0; color: #AA7C11; font-weight: bold;">Budget</td><td style="padding: 8px 0;">${data.budget ? `₹${data.budget.toLocaleString('en-IN')}` : 'Not specified'}</td></tr>
          <tr><td style="padding: 8px 0; color: #AA7C11; font-weight: bold;">Requirements</td><td style="padding: 8px 0;">${data.specialRequirements || 'None'}</td></tr>
        </table>
      </div>
      <div style="text-align: center; padding: 16px 0; border-top: 1px solid #222; color: #666; font-size: 12px;">
        <p>This booking was submitted via slnsevents.com</p>
      </div>
    </div>
  `;

  if (transporter) {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      subject,
      html,
    });
    console.log(`[Email] Booking notification sent for ${data.name}`);
  } else {
    console.log('[Email] SMTP not configured. Booking notification:');
    console.log(`  Subject: ${subject}`);
    console.log(`  Name: ${data.name}, Phone: ${data.phone}, Event: ${data.eventType}`);
  }
}
