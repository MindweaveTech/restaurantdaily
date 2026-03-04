/**
 * Simple secrets manager using environment variables
 * Local: .env.local
 * Production: Vercel/GitHub environment variables
 */

class SecretsManager {
  /**
   * Get a secret from environment variables
   */
  getSecret(envKey: string): string | undefined {
    return process.env[envKey];
  }

  /**
   * Get Supabase configuration
   */
  getSupabaseConfig() {
    return {
      url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    };
  }

  /**
   * Get JWT secret for authentication
   */
  getJWTSecret(): string | undefined {
    return process.env.JWT_SECRET;
  }

  /**
   * Get Twilio configuration
   */
  getTwilioConfig() {
    return {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      fromNumber: process.env.TWILIO_FROM_NUMBER,
      whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER,
    };
  }
}

// Singleton instance
export const secretsManager = new SecretsManager();
