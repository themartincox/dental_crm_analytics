-- Create email_logs table for tracking email notifications
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    to_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    template TEXT NOT NULL,
    data JSONB,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered', 'bounced')),
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_email_logs_to_email ON public.email_logs(to_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON public.email_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_template ON public.email_logs(template);

-- Add RLS policies
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Policy for system owner access
CREATE POLICY "System owner can view all email logs" ON public.email_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'super_admin'
        )
    );

-- Policy for practice admin access to their organization's emails
CREATE POLICY "Practice admin can view organization email logs" ON public.email_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'practice_admin'
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_email_logs_updated_at
    BEFORE UPDATE ON public.email_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_email_logs_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.email_logs IS 'Stores email notifications and marketing emails sent through the system';
COMMENT ON COLUMN public.email_logs.to_email IS 'Recipient email address';
COMMENT ON COLUMN public.email_logs.subject IS 'Email subject line';
COMMENT ON COLUMN public.email_logs.template IS 'Email template used (waitlist_notification, waitlist_welcome, contact_notification, etc.)';
COMMENT ON COLUMN public.email_logs.data IS 'JSON data used to populate the email template';
COMMENT ON COLUMN public.email_logs.status IS 'Current status of the email (pending, sent, failed, delivered, bounced)';
COMMENT ON COLUMN public.email_logs.error_message IS 'Error message if email failed to send';
COMMENT ON COLUMN public.email_logs.sent_at IS 'Timestamp when email was sent';
COMMENT ON COLUMN public.email_logs.delivered_at IS 'Timestamp when email was delivered';
