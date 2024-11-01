import { supabase } from './supabase';

export const sendTwoFactorCode = async (email: string): Promise<void> => {
  try {
    const code = generateCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Code expires in 10 minutes

    // Delete any existing codes for this email
    await supabase.from('two_factor_codes').delete().eq('email', email);

    // Save the new code to the database
    const { error } = await supabase.from('two_factor_codes').insert({
      email,
      code,
      expires_at: expiresAt.toISOString(),
    });

    if (error) throw error;

    // Send the code via email (placeholder implementation)
    await sendEmail(
      email,
      'Your FitFaster Verification Code',
      `Your verification code is: ${code}\n\nThis code will expire in 10 minutes.`,
    );
  } catch (error) {
    console.error('Error sending two-factor code:', error);
    throw new Error('Failed to send verification code. Please try again.');
  }
};

export const verifyTwoFactorCodeService = async (email: string, code: string): Promise<boolean> => {
  try {
    const now = new Date().toISOString();

    // Get the code and check if it's valid and not expired
    const { data, error } = await supabase
      .from('two_factor_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .gt('expires_at', now)
      .single();

    if (error || !data) {
      return false;
    }

    // Delete the code after successful verification
    await supabase.from('two_factor_codes').delete().eq('email', email);

    return true;
  } catch (error) {
    console.error('Error verifying two-factor code:', error);
    return false;
  }
};

// Generate a 6-digit verification code
const generateCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Placeholder email sending function
// In production, this should be replaced with a real email service implementation
const sendEmail = async (to: string, subject: string, text: string): Promise<void> => {
  // TODO: Implement real email sending logic
  // For now, just log the email details in development
  if (process.env.NODE_ENV === 'development') {
    console.log('==== Email Details ====');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Text:', text);
    console.log('====================');
  }
};
