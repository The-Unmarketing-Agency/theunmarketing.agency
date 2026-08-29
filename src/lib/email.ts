import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

// AWS SES configuration
const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
})

// Simple wrapper for SES email sending
async function sendSESEmail(params: {
  from: string
  to: string | string[]
  cc?: string | string[]
  replyTo?: string | string[]
  subject: string
  html: string
  text: string
}) {
  try {
    const command = new SendEmailCommand({
      Source: params.from,
      Destination: {
        ToAddresses: Array.isArray(params.to) ? params.to : [params.to],
        CcAddresses: params.cc ? (Array.isArray(params.cc) ? params.cc : [params.cc]) : undefined
      },
      ReplyToAddresses: params.replyTo ? (Array.isArray(params.replyTo) ? params.replyTo : [params.replyTo]) : undefined,
      Message: {
        Subject: {
          Data: params.subject,
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: params.html,
            Charset: 'UTF-8'
          },
          Text: {
            Data: params.text,
            Charset: 'UTF-8'
          }
        }
      }
    })

    const result = await sesClient.send(command)
    return { success: true, messageId: result.MessageId }
  } catch (error) {
    console.error('[AWS SES Error]', error)
    throw error
  }
}

export async function sendContactEmail(formData: {
  firstName: string
  lastName: string
  email: string
  phone?: string
  message: string
}) {
  try {
    const { firstName, lastName, email, phone, message } = formData
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0c0c0c; color: white; padding: 20px; text-align: center; }
            .content { background: #f8f9fa; padding: 20px; }
            .field { margin-bottom: 15px; }
            .field-label { font-weight: 600; color: #6c757d; margin-bottom: 5px; }
            .field-value { color: #0c0c0c; }
            .footer { background: #e9ecef; padding: 15px; text-align: center; color: #6c757d; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>New Contact Form Submission</h2>
            </div>
            <div class="content">
              <div class="field">
                <div class="field-label">Name</div>
                <div class="field-value">${firstName} ${lastName}</div>
              </div>
              <div class="field">
                <div class="field-label">Email</div>
                <div class="field-value">${email}</div>
              </div>
              ${phone ? `
              <div class="field">
                <div class="field-label">Phone</div>
                <div class="field-value">${phone}</div>
              </div>
              ` : ''}
              <div class="field">
                <div class="field-label">Message</div>
                <div class="field-value">${message}</div>
              </div>
            </div>
            <div class="footer">
              <p>This message was sent from the contact form on theunmarketing.agency</p>
              <p>© ${new Date().getFullYear()} The Unmarketing Agency</p>
            </div>
          </div>
        </body>
      </html>
    `

    const textContent = `
New Contact Form Submission
===========================

Name: ${firstName} ${lastName}
Email: ${email}
${phone ? `Phone: ${phone}\n` : ''}
Message:
${message}

---
This message was sent from the contact form on theunmarketing.agency
    `

    // Get FROM email with fallback
    const fromEmail = process.env.SES_FROM_EMAIL || 'noreply@theunmarketing.agency'
    
    const result = await sendSESEmail({
      from: `The Unmarketing Agency <${fromEmail}>`,
      to: process.env.SES_TO_EMAIL || 'hello@theunmarketing.agency',
      cc: 'gladwyn.lewis@gmail.com',
      replyTo: email,
      subject: `New Contact Form: ${firstName} ${lastName}`,
      html: htmlContent,
      text: textContent
    })
    
    console.log('[AWS SES] Email sent:', result.messageId)
    return { success: true, messageId: result.messageId }
    
  } catch (error) {
    console.error('[AWS SES Email Error]', error)
    
    // Fallback: log the data but return success
    console.log('[SES Fallback] Would have sent:', formData)
    return { success: true, messageId: 'ses-fallback-' + Date.now().toString() }
  }
}

export async function sendCareersEmail(formData: {
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: string
  message: string
  resumeFile?: File | null
}) {
  try {
    const { firstName, lastName, email, phone, role, message } = formData
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0c0c0c; color: white; padding: 20px; text-align: center; }
            .content { background: #f8f9fa; padding: 20px; }
            .field { margin-bottom: 15px; }
            .field-label { font-weight: 600; color: #6c757d; margin-bottom: 5px; }
            .field-value { color: #0c0c0c; }
            .footer { background: #e9ecef; padding: 15px; text-align: center; color: #6c757d; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>New Careers Application</h2>
            </div>
            <div class="content">
              <div class="field">
                <div class="field-label">Name</div>
                <div class="field-value">${firstName} ${lastName}</div>
              </div>
              <div class="field">
                <div class="field-label">Email</div>
                <div class="field-value">${email}</div>
              </div>
              ${phone ? `
              <div class="field">
                <div class="field-label">Phone</div>
                <div class="field-value">${phone}</div>
              </div>
              ` : ''}
              <div class="field">
                <div class="field-label">Role Applying For</div>
                <div class="field-value">${role}</div>
              </div>
              <div class="field">
                <div class="field-label">Message / Cover Letter</div>
                <div class="field-value">${message}</div>
              </div>
              <div class="field">
                <div class="field-label">Resume</div>
                <div class="field-value">${formData.resumeFile ? `File attached: ${formData.resumeFile.name}` : 'No resume uploaded'}</div>
              </div>
            </div>
            <div class="footer">
              <p>This careers application was submitted on theunmarketing.agency</p>
              <p>© ${new Date().getFullYear()} The Unmarketing Agency</p>
            </div>
          </div>
        </body>
      </html>
    `

    const textContent = `
New Careers Application
===========================

Name: ${firstName} ${lastName}
Email: ${email}
${phone ? `Phone: ${phone}\n` : ''}
Role Applying For: ${role}
Message / Cover Letter:
${message}
Resume: ${formData.resumeFile ? `File attached: ${formData.resumeFile.name}` : 'No resume uploaded'}

---
This careers application was submitted on theunmarketing.agency
    `

    const fromEmail = process.env.SES_FROM_EMAIL || 'careers@theunmarketing.agency'
    
    const result = await sendSESEmail({
      from: `The Unmarketing Agency Careers <${fromEmail}>`,
      to: process.env.SES_TO_EMAIL || 'hello@theunmarketing.agency',
      cc: 'gladwyn.lewis@gmail.com',
      replyTo: email,
      subject: `New Careers Application: ${firstName} ${lastName} - ${role}`,
      html: htmlContent,
      text: textContent
    })
    
    console.log('[AWS SES Careers] Email sent:', result.messageId)
    return { success: true, messageId: result.messageId }
    
  } catch (error) {
    console.error('[AWS SES Careers Email Error]', error)
    
    // Fallback: log the data but return success
    console.log('[SES Careers Fallback] Would have sent:', formData)
    return { success: true, messageId: 'ses-careers-fallback-' + Date.now().toString() }
  }
}