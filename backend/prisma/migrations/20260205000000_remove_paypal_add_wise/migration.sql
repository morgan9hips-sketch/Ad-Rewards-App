-- Migration: Remove PayPal fields and add Wise fields to withdrawals table
-- Also ensure signup_bonuses table exists

-- Add Wise-related columns to withdrawals table
-- Using ALTER TABLE ADD COLUMN IF NOT EXISTS for safety
DO $$
BEGIN
    -- Add wise_transfer_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='withdrawals' AND column_name='wise_transfer_id'
    ) THEN
        ALTER TABLE withdrawals ADD COLUMN wise_transfer_id VARCHAR(255);
    END IF;

    -- Add wise_recipient_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='withdrawals' AND column_name='wise_recipient_id'
    ) THEN
        ALTER TABLE withdrawals ADD COLUMN wise_recipient_id VARCHAR(255);
    END IF;

    -- Add wise_quote_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='withdrawals' AND column_name='wise_quote_id'
    ) THEN
        ALTER TABLE withdrawals ADD COLUMN wise_quote_id VARCHAR(255);
    END IF;

    -- Add bank_details column (JSON)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='withdrawals' AND column_name='bank_details'
    ) THEN
        ALTER TABLE withdrawals ADD COLUMN bank_details TEXT;
    END IF;
END $$;

-- Make paypal_email nullable (for backward compatibility)
ALTER TABLE withdrawals ALTER COLUMN paypal_email DROP NOT NULL;

-- Ensure signup_bonuses table exists (may already exist from previous migration)
CREATE TABLE IF NOT EXISTS signup_bonuses (
    id VARCHAR(191) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(191) NOT NULL UNIQUE,
    country_code VARCHAR(2) NOT NULL,
    user_number_in_region INTEGER NOT NULL,
    bonus_coins BIGINT NOT NULL DEFAULT 0,
    bonus_value_zar DECIMAL(12, 4) NOT NULL DEFAULT 0,
    bonus_value_usd DECIMAL(12, 4) NOT NULL DEFAULT 0,
    credited BOOLEAN NOT NULL DEFAULT false,
    credited_at TIMESTAMP(3),
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'signup_bonuses_user_id_fkey'
    ) THEN
        ALTER TABLE signup_bonuses 
        ADD CONSTRAINT signup_bonuses_user_id_fkey 
        FOREIGN KEY (user_id) 
        REFERENCES user_profiles(user_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS signup_bonuses_user_id_idx ON signup_bonuses(user_id);
CREATE INDEX IF NOT EXISTS signup_bonuses_country_code_idx ON signup_bonuses(country_code);

-- Add comments to document the migration
COMMENT ON TABLE withdrawals IS 'Supports both PayPal (legacy) and Wise (new) withdrawal methods';
COMMENT ON COLUMN withdrawals.bank_details IS 'JSON string containing Wise bank account details';
COMMENT ON COLUMN withdrawals.wise_transfer_id IS 'Wise Platform API transfer ID for tracking';
