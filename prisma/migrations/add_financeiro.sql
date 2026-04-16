-- Migration: sistema financeiro de saldo instrutor + chave PIX do instrutor
-- Rodar no Supabase SQL Editor ou via psql

ALTER TABLE "PerfilInstrutor"
  ADD COLUMN IF NOT EXISTS "saldoDevedor" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "pixChave"     TEXT;

ALTER TABLE "Aula"
  ADD COLUMN IF NOT EXISTS "modoPagamento"    TEXT             NOT NULL DEFAULT 'PLATAFORMA',
  ADD COLUMN IF NOT EXISTS "taxaPlataforma"   DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "repasseInstrutor" DOUBLE PRECISION NOT NULL DEFAULT 0;
