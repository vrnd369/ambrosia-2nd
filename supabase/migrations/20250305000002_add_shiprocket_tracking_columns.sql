-- Add Shiprocket tracking columns to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shiprocket_shipment_id INTEGER;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS awb_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipment_status TEXT;
