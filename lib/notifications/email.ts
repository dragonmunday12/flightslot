import { Resend } from 'resend'

let resend: Resend | null = null

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null
  }
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

export type EmailOptions = {
  to: string
  subject: string
  html: string
}

/**
 * Send an email via Resend
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const client = getResendClient()

  if (!client) {
    console.warn('RESEND_API_KEY not configured. Email not sent.')
    return false
  }

  try {
    const { data, error } = await client.emails.send({
      from: 'FlightSlot <noreply@bprime.net>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    })

    if (error) {
      console.error('Error sending email:', error)
      return false
    }

    console.log('Email sent successfully:', data)
    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

/**
 * Send a new student welcome email with PIN
 */
export async function sendStudentWelcomeEmail(
  studentName: string,
  email: string,
  pin: string
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #0070f3; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .pin { font-size: 24px; font-weight: bold; color: #0070f3; text-align: center; padding: 20px; background-color: white; border: 2px dashed #0070f3; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to FlightSlot!</h1>
          </div>
          <div class="content">
            <p>Hi ${studentName},</p>
            <p>Your instructor has added you to FlightSlot, their flight scheduling system. You can now view your scheduled flight times online.</p>
            <p>Your personal PIN for accessing the calendar is:</p>
            <div class="pin">${pin}</div>
            <p><strong>How to access your schedule:</strong></p>
            <ol>
              <li>Visit <a href="https://bprime.net">bprime.net</a></li>
              <li>Enter your PIN when prompted</li>
              <li>View your assigned flight times</li>
              <li>Request additional time slots if needed</li>
            </ol>
            <p><strong>Keep your PIN safe!</strong> You can request a reset from your instructor if you forget it.</p>
          </div>
          <div class="footer">
            <p>FlightSlot - Flight Instructor Scheduling Made Easy</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: 'Welcome to FlightSlot - Your Access PIN',
    html,
  })
}

/**
 * Send a request notification email to instructor
 */
export async function sendRequestNotificationEmail(
  instructorEmail: string,
  studentName: string,
  date: string,
  timeBlock: string
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #0070f3; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .request-details { background-color: white; padding: 15px; border-left: 4px solid #0070f3; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Schedule Request</h1>
          </div>
          <div class="content">
            <p>You have a new schedule request from a student:</p>
            <div class="request-details">
              <p><strong>Student:</strong> ${studentName}</p>
              <p><strong>Date:</strong> ${date}</p>
              <p><strong>Time:</strong> ${timeBlock}</p>
            </div>
            <p>Please review and approve or deny this request in your FlightSlot dashboard.</p>
            <a href="https://bprime.net/instructor/requests" class="button">View Requests</a>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: instructorEmail,
    subject: `New Request from ${studentName}`,
    html,
  })
}

/**
 * Send request approval email to student
 */
export async function sendRequestApprovedEmail(
  studentEmail: string,
  studentName: string,
  date: string,
  timeBlock: string
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .schedule-details { background-color: white; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Request Approved!</h1>
          </div>
          <div class="content">
            <p>Hi ${studentName},</p>
            <p>Good news! Your instructor has approved your schedule request:</p>
            <div class="schedule-details">
              <p><strong>Date:</strong> ${date}</p>
              <p><strong>Time:</strong> ${timeBlock}</p>
            </div>
            <p>This time slot has been added to your schedule. You can view it in your FlightSlot calendar.</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: studentEmail,
    subject: 'Schedule Request Approved',
    html,
  })
}
