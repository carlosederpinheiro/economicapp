-- Execute este script no SQL Editor do seu Supabase

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    subscription jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Segurança)
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Permite que usuários autenticados insiram inscrições para si mesmos
CREATE POLICY "Users can insert their own subscriptions"
ON public.push_subscriptions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Permite que usuários vejam suas próprias inscrições
CREATE POLICY "Users can view their own subscriptions"
ON public.push_subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
