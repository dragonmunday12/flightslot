import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER

let client: ReturnType<typeof twilio> | null = null

if (accountSid && authToken) {
  client = twilio(accountSid, authToken)
}

export type SMSOptions = {
  to: string
  message: string
}

/**
 * Send an SMS via Twilio
 */
export async function sendSMS(options: SMSOptions): Promise<boolean> {
  if (!client || !twilioPhoneNumber) {
    console.warn('Twilio not configured. SMS not sent.')
    return false
  }

  try {
    const message = await client.messages.create({
      body: options.message,
      from: twilioPhoneNumber,
      to: options.to,
    })

    console.log('SMS sent successfully:', message.sid)
    return true
  } catch (error) {
    console.error('Error sending SMS:', error)
    return false
  }
}

/**
 * Send welcome SMS to new student with PIN
 */
export async function sendStudentWelcomeSMS(
  studentName: string,
  phone: string,
  pin: string
): Promise<boolean> {
  const message = `Hi ${studentName}! Welcome to FlightSlot. Your instructor has added you to their event scheduling system.\n\nYour PIN: ${pin}\n\nVisit bprime.net and enter your PIN to view your schedule.`

  return sendSMS({
    to: phone,
    message,
  })
}

/**
 * Send request notification SMS to instructor
 */
export async function sendRequestNotificationSMS(
  instructorPhone: string,
  studentName: string,
  date: string,
  timeBlock: string
): Promise<boolean> {
  const message = `FlightSlot: New schedule request from ${studentName}\n\nDate: ${date}\nTime: ${timeBlock}\n\nReply APPROVE to confirm or visit bprime.net/instructor/requests to manage.`

  return sendSMS({
    to: instructorPhone,
    message,
  })
}

/**
 * Send request approval SMS to student
 */
export async function sendRequestApprovedSMS(
  studentPhone: string,
  studentName: string,
  date: string,
  timeBlock: string
): Promise<boolean> {
  const message = `Hi ${studentName}! Your schedule request has been approved.\n\nDate: ${date}\nTime: ${timeBlock}\n\nView your full schedule at bprime.net`

  return sendSMS({
    to: studentPhone,
    message,
  })
}

/**
 * Send PIN reset SMS to student
 */
export async function sendPinResetSMS(
  studentName: string,
  phone: string,
  newPin: string
): Promise<boolean> {
  const message = `Hi ${studentName}! Your FlightSlot PIN has been reset.\n\nNew PIN: ${newPin}\n\nVisit bprime.net to access your schedule.`

  return sendSMS({
    to: phone,
    message,
  })
}
