const nodemailer = require('nodemailer')
const emailQueue = require('../queue/emailQueue')

const sendConfirmationEmail = async (registration) => {
  const { full_name, email, id } = registration

  const html = `
    <div style="background-color: #050B14; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(145deg, #0A1628, #11223A); background-color: #0A1628; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6); border: 1px solid #1E3A5F;">
        
        <!-- Top Banner / Header -->
        <div style="background: linear-gradient(90deg, #00C853, #00E676); background-color: #00C853; padding: 20px; text-align: center;">
          <h2 style="margin: 0; color: #050B14; font-size: 16px; letter-spacing: 4px; text-transform: uppercase; font-weight: 800;">Official Event Pass</h2>
        </div>

          <!-- Inner Card Content -->
        <div style="padding: 40px 30px; text-align: center;">
          <p style="color: #00E676; font-size: 14px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; margin-top: 0;">Welcome to</p>
          <h1 style="color: #FFFFFF; font-size: 38px; margin: 0 0 35px 0; font-weight: 800; letter-spacing: -1px; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">AI For Everybody</h1>

          <!-- The "Card" for the user -->
          <div style="background: rgba(255, 255, 255, 0.03); border: 2px dashed rgba(0, 200, 83, 0.5); border-radius: 16px; padding: 35px 20px; margin-bottom: 35px; box-shadow: inset 0 0 20px rgba(0,0,0,0.2);">
            <p style="color: #8C9BAB; font-size: 15px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 1px;">Specially Reserved For</p>
            <h2 style="color: #FFD700; font-size: 32px; margin: 0; font-style: italic; font-family: 'Georgia', serif; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">${full_name}</h2>
            
            <div style="margin-top: 30px; background: white; padding: 15px; display: inline-block; border-radius: 12px;">
                <img src="https://api.qrserver.com/v1/create-qr-code/?data=https://ai4you.mindsetai.cloud/verify/${registration.qr_token}&size=200x200" alt="Ticket QR Code" style="display: block; width: 150px; height: 150px;" />
            </div>
            <p style="color: #8C9BAB; font-size: 12px; margin-top: 15px; margin-bottom: 0;">Present this code at the entrance</p>
          </div>

          <!-- Details -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 35px; background: rgba(0,0,0,0.2); border-radius: 12px; overflow: hidden;">
            <tr>
              <td align="center" style="padding: 15px 10px; width: 33%;">
                <p style="color: #00E676; font-size: 11px; text-transform: uppercase; margin: 0 0 5px 0; letter-spacing: 1px;">Date</p>
                <p style="color: #FFFFFF; font-size: 14px; margin: 0; font-weight: bold;">Mar 21, 2026</p>
              </td>
              <td align="center" style="padding: 15px 10px; width: 33%; border-left: 1px solid rgba(255,255,255,0.05); border-right: 1px solid rgba(255,255,255,0.05);">
                <p style="color: #00E676; font-size: 11px; text-transform: uppercase; margin: 0 0 5px 0; letter-spacing: 1px;">Time</p>
                <p style="color: #FFFFFF; font-size: 14px; margin: 0; font-weight: bold;">10:00 – 16:00</p>
              </td>
              <td align="center" style="padding: 15px 10px; width: 33%;">
                <p style="color: #00E676; font-size: 11px; text-transform: uppercase; margin: 0 0 5px 0; letter-spacing: 1px;">Venue</p>
                <p style="color: #FFFFFF; font-size: 14px; margin: 0; font-weight: bold;">Djeuga Palace</p>
              </td>
            </tr>
          </table>

          <!-- Bottom actions -->
          <p style="color: #A0B0C0; font-size: 15px; line-height: 1.6; margin-bottom: 0;">
            Bring your smartphone or laptop. You'll leave with <strong style="color: #FFF;">finished, real work</strong> created during the session. We are thrilled to host you!
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #060D17; padding: 25px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                <tr>
                    <td align="center">
                        <p style="color: #4A5B6C; font-size: 11px; margin: 0; line-height: 16px;">
                            Designed & Developed by 
                            <img src="${process.env.CLIENT_URL || 'https://ai4you.mindsetai.cloud'}/favicon.png" alt="eWebCity" style="height: 16px; width: auto; display: inline-block; vertical-align: middle; margin: 0 4px; filter: grayscale(100%) brightness(200%);" /> 
                            eWebCity
                        </p>
                    </td>
                </tr>
            </table>
        </div>
      </div>
    </div>
  `

  try {
    // Add to email queue instead of sending directly
    await emailQueue.add({
      type: 'confirmation',
      from: process.env.EMAIL_FROM,
      registrationId: id,
      to: email,
      subject: '✅ Registration Confirmed — AI For Everybody | 21 March 2026',
      html,
    }, {
        attempts: 5,
        backoff: 5000
    })
    return true
  } catch (err) {
    console.error('Email queue error:', err.message)
    return false
  }
}

const sendMarketingEmail = async (email, full_name, subject, htmlBody) => {
  const html = `
    <div style="background-color: #050B14; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(145deg, #0A1628, #11223A); background-color: #0A1628; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6); border: 1px solid #1E3A5F;">
        
        <!-- Header -->
        <div style="background: linear-gradient(90deg, #00C853, #00E676); background-color: #00C853; padding: 20px; text-align: center;">
          <h2 style="margin: 0; color: #050B14; font-size: 16px; letter-spacing: 2px; text-transform: uppercase; font-weight: 800;">Special Update</h2>
        </div>

        <!-- Body -->
        <div style="padding: 40px 30px;">
          <p style="color: #00E676; font-size: 16px; margin-bottom: 20px;">Hi ${full_name},</p>
          <div style="color: #A0B0C0; font-size: 15px; line-height: 1.6;">
            ${htmlBody}
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #060D17; padding: 25px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                <tr>
                    <td align="center">
                        <p style="color: #4A5B6C; font-size: 11px; margin: 0; line-height: 16px;">
                            Designed & Developed by 
                            <img src="${process.env.CLIENT_URL || 'https://ai4you.mindsetai.cloud'}/favicon.png" alt="eWebCity" style="height: 16px; width: auto; display: inline-block; vertical-align: middle; margin: 0 4px; filter: grayscale(100%) brightness(200%);" /> 
                            eWebCity
                        </p>
                    </td>
                </tr>
            </table>
        </div>
      </div>
    </div>
  `

  try {
    await emailQueue.add({
      type: 'marketing',
      from: process.env.EMAIL_FROM,
      to: email,
      subject,
      html,
    }, {
        attempts: 5,
        backoff: 5000
    })
    return true
  } catch (err) {
    console.error('Marketing Email queue error:', err.message)
    return false
  }
}

const sendAdminNotificationEmail = async (registration) => {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM;

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #00C853;">New Registration Alert</h2>
      <p>A new user has just registered for the AI For Everybody event.</p>
      
      <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <table width="100%" cellpadding="8" style="border-collapse: collapse;">
          <tr>
            <td width="30%"><strong>Name:</strong></td>
            <td>${registration.full_name}</td>
          </tr>
          <tr>
            <td><strong>Email:</strong></td>
            <td>${registration.email}</td>
          </tr>
          <tr>
            <td><strong>Phone:</strong></td>
            <td>${registration.country_code || ''} ${registration.phone}</td>
          </tr>
          <tr>
            <td><strong>Profession:</strong></td>
            <td>${registration.profession}</td>
          </tr>
          <tr>
            <td><strong>AI Experience:</strong></td>
            <td>${registration.ai_experience}</td>
          </tr>
          <tr>
            <td><strong>Payment ID (MoMo):</strong></td>
            <td><strong style="color: #00C853;">${registration.transaction_id || 'N/A'}</strong></td>
          </tr>
          <tr>
            <td><strong>Date:</strong></td>
            <td>${new Date().toLocaleString()}</td>
          </tr>
        </table>
      </div>
      
      <p style="font-size: 12px; color: #888;">This is an automated notification from your registration system.</p>
    </div>
  `

  try {
    await emailQueue.add({
      type: 'notification',
      from: process.env.EMAIL_FROM,
      to: adminEmail,
      subject: `🎉 New Registration: ${registration.full_name}`,
      html,
    }, {
        attempts: 5,
        backoff: 5000
    })
    return true
  } catch (err) {
    console.error('Admin Notification Email queue error:', err.message)
    return false
  }
}

module.exports = { sendConfirmationEmail, sendMarketingEmail, sendAdminNotificationEmail }
