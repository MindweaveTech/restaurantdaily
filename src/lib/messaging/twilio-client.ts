import twilio from 'twilio';
import { PhoneValidator, phoneUtils } from './phone-validator';
import { OTPService } from './otp-service';
import { MessageTemplates, type OTPMessageData } from './message-templates';

export interface TwilioCredentials {
  accountSid: string;
  authToken: string;
  fromNumber: string;
  whatsappNumber: string;
  contentSid: string;
  webhookUrl: string;
}

export interface MessageResult {
  success: boolean;
  messageSid?: string;
  method: 'whatsapp' | 'sms';
  cost?: number;
  error?: string;
  deliveryStatus?: string;
}

export interface SendOTPOptions {
  phoneNumber: string;
  purpose?: 'login' | 'registration' | 'password_reset';
  preferredMethod?: 'whatsapp' | 'sms' | 'auto';
}

/**
 * Twilio client for SMS/WhatsApp messaging
 * Uses environment variables for configuration (local: .env.local, production: Vercel/GitHub)
 */
export class TwilioMessagingClient {
  private static credentials: TwilioCredentials | null = null;
  private static client: twilio.Twilio | null = null;

  /**
   * Get Twilio credentials from environment variables
   */
  private static async getCredentials(): Promise<TwilioCredentials> {
    if (this.credentials) return this.credentials;

    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      throw new Error(
        'Missing Twilio credentials. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in environment variables.'
      );
    }

    console.log('📱 Using Twilio credentials from environment variables');
    this.credentials = {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      fromNumber: process.env.TWILIO_FROM_NUMBER || '+14155238886',
      whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',
      contentSid: process.env.TWILIO_CONTENT_SID || '',
      webhookUrl: process.env.TWILIO_WEBHOOK_URL || ''
    };
    return this.credentials;
  }

  /**
   * Get initialized Twilio client
   */
  private static async getClient(): Promise<twilio.Twilio> {
    if (this.client) return this.client;

    const credentials = await this.getCredentials();
    this.client = twilio(credentials.accountSid, credentials.authToken);

    return this.client;
  }

  /**
   * Send OTP via SMS (primary method)
   */
  static async sendOTP(options: SendOTPOptions): Promise<MessageResult> {
    try {
      // Validate phone number
      const phoneValidation = PhoneValidator.validate(options.phoneNumber);
      if (!phoneValidation.isValid) {
        return {
          success: false,
          method: 'sms',
          error: phoneValidation.error
        };
      }

      // Generate OTP
      const otp = await OTPService.generateOTP(
        phoneValidation.formatted!,
        options.purpose || 'login'
      );

      // Prepare message data
      const messageData: OTPMessageData = {
        otpCode: otp.code,
        expiryTime: OTPService.getExpiryTimeText(otp.expiresAt)
      };

      // Send via SMS (primary method)
      const smsResult = await this.sendSMS(phoneValidation.formatted!, messageData);
      return smsResult;

    } catch (error) {
      console.error('Error sending OTP:', error);
      return {
        success: false,
        method: 'sms',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Send message via WhatsApp using plain text (sandbox mode)
   */
  private static async sendWhatsApp(
    phoneNumber: string,
    messageData: OTPMessageData
  ): Promise<MessageResult> {
    try {
      const client = await this.getClient();
      const credentials = await this.getCredentials();

      const whatsappNumber = phoneUtils.toWhatsAppFormat(phoneNumber);

      // Use plain text message for sandbox mode instead of content templates
      const messageBody = `🍽️ *Restaurant Daily*

Your verification code: *${messageData.otpCode}*
Expires in: ${messageData.expiryTime}

Keep this code secure and don't share it.`;

      const message = await client.messages.create({
        from: credentials.whatsappNumber,
        to: whatsappNumber,
        body: messageBody
      });

      const countryCode = PhoneValidator.getCountryCode(phoneNumber) || 'IN';
      const estimatedCost = MessageTemplates.getEstimatedCost('whatsapp', countryCode);

      return {
        success: true,
        messageSid: message.sid,
        method: 'whatsapp',
        cost: estimatedCost,
        deliveryStatus: message.status
      };

    } catch (error) {
      console.error('WhatsApp delivery failed:', error);
      return {
        success: false,
        method: 'whatsapp',
        error: error instanceof Error ? error.message : 'WhatsApp delivery failed'
      };
    }
  }

  /**
   * Send message via SMS as fallback
   */
  private static async sendSMS(
    phoneNumber: string,
    messageData: OTPMessageData
  ): Promise<MessageResult> {
    try {
      const client = await this.getClient();
      const credentials = await this.getCredentials();

      const smsContent = MessageTemplates.getSMSContent(messageData);

      // Validate SMS length
      const lengthValidation = MessageTemplates.validateSMSLength(smsContent);
      if (!lengthValidation.isValid) {
        return {
          success: false,
          method: 'sms',
          error: `SMS content too long (${lengthValidation.length} chars, max 480)`
        };
      }

      const message = await client.messages.create({
        from: credentials.fromNumber,
        to: phoneNumber,
        body: smsContent
      });

      const countryCode = PhoneValidator.getCountryCode(phoneNumber) || 'IN';
      const estimatedCost = MessageTemplates.getEstimatedCost('sms', countryCode);

      return {
        success: true,
        messageSid: message.sid,
        method: 'sms',
        cost: estimatedCost,
        deliveryStatus: message.status
      };

    } catch (error) {
      console.error('SMS delivery failed:', error);
      return {
        success: false,
        method: 'sms',
        error: error instanceof Error ? error.message : 'SMS delivery failed'
      };
    }
  }

  /**
   * Get message delivery status
   */
  static async getMessageStatus(messageSid: string): Promise<{
    status: string;
    errorCode?: string;
    errorMessage?: string;
  }> {
    try {
      const client = await this.getClient();
      const message = await client.messages(messageSid).fetch();

      return {
        status: message.status,
        errorCode: message.errorCode?.toString() || undefined,
        errorMessage: message.errorMessage || undefined
      };
    } catch (error) {
      throw new Error(`Failed to get message status: ${error}`);
    }
  }

  /**
   * Test connection to Twilio service
   */
  static async testConnection(): Promise<{
    success: boolean;
    accountSid?: string;
    error?: string;
  }> {
    try {
      const credentials = await this.getCredentials();
      const client = await this.getClient();

      // Test by fetching account information
      const account = await client.api.accounts(credentials.accountSid).fetch();

      return {
        success: true,
        accountSid: account.sid
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }

  /**
   * Send test message for validation (SMS only)
   */
  static async sendTestMessage(
    phoneNumber: string
  ): Promise<MessageResult> {
    const testData: OTPMessageData = {
      otpCode: '123456',
      expiryTime: '5 minutes'
    };

    return await this.sendSMS(phoneNumber, testData);
  }

  /**
   * Send staff invitation via SMS
   */
  static async sendStaffInvitation(
    phoneNumber: string,
    restaurantName: string,
    invitationLink: string,
    expiresAt: string
  ): Promise<MessageResult> {
    try {
      // Validate phone number
      const phoneValidation = PhoneValidator.validate(phoneNumber);
      if (!phoneValidation.isValid) {
        return {
          success: false,
          method: 'sms',
          error: phoneValidation.error
        };
      }

      // Format expiry date
      const expiryDate = new Date(expiresAt);
      const formattedExpiry = expiryDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      // Get client and credentials
      const client = await this.getClient();
      const credentials = await this.getCredentials();

      // Create SMS invitation message (shorter for SMS)
      const messageBody = `Restaurant Daily: You're invited to join ${restaurantName}. Accept here: ${invitationLink} (expires ${formattedExpiry})`;

      // Send SMS
      const message = await client.messages.create({
        from: credentials.fromNumber,
        to: phoneValidation.formatted!,
        body: messageBody
      });

      const countryCode = PhoneValidator.getCountryCode(phoneNumber) || 'IN';
      const estimatedCost = MessageTemplates.getEstimatedCost('sms', countryCode);

      return {
        success: true,
        messageSid: message.sid,
        method: 'sms',
        cost: estimatedCost,
        deliveryStatus: message.status
      };

    } catch (error) {
      console.error('SMS invitation failed:', error);
      return {
        success: false,
        method: 'sms',
        error: error instanceof Error ? error.message : 'SMS delivery failed'
      };
    }
  }

  /**
   * Get account usage statistics (for monitoring)
   */
  static async getUsageStats(): Promise<{
    messagesSent: number;
    totalCost: number;
    period: string;
  }> {
    try {
      const client = await this.getClient();

      // Get usage for current month
      const currentMonth = new Date();
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

      const usage = await client.usage.records.list({
        category: 'sms',
        startDate: startDate,
        endDate: currentMonth
      });

      const totalUsage = usage.reduce((sum, record) => sum + parseInt(record.usage || '0'), 0);
      const totalCost = usage.reduce((sum, record) => sum + parseFloat((record.price || '0').toString()), 0);

      return {
        messagesSent: totalUsage,
        totalCost: Math.abs(totalCost), // Twilio costs are negative
        period: startDate.toISOString().slice(0, 7) // YYYY-MM format
      };
    } catch (error) {
      throw new Error(`Failed to get usage stats: ${error}`);
    }
  }
}

export default TwilioMessagingClient;