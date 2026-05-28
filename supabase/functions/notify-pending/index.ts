import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import webPush from "npm:web-push@3.6.7";

const PUBLIC_VAPID_KEY = Deno.env.get('PUBLIC_VAPID_KEY') || '';
const PRIVATE_VAPID_KEY = Deno.env.get('PRIVATE_VAPID_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Configuração do Web Push
webPush.setVapidDetails(
  'mailto:contato@mourao.com',
  PUBLIC_VAPID_KEY,
  PRIVATE_VAPID_KEY
);

serve(async (req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Pegar data atual no fuso de Manaus
    const now = new Date();
    const manausTimeStr = now.toLocaleString("en-US", { timeZone: "America/Manaus" });
    const manausDate = new Date(manausTimeStr);
    const year = manausDate.getFullYear();
    const month = String(manausDate.getMonth() + 1).padStart(2, '0');
    const day = String(manausDate.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    // Buscar contas (fin_bills) que não estão pagas e vencem até hoje
    const { data: bills, error: billsError } = await supabase
      .from('fin_bills')
      .select('id, description, val')
      .neq('status', 'PAGO')
      .lte('venc', todayStr);

    if (billsError) throw billsError;

    if (!bills || bills.length === 0) {
      return new Response(JSON.stringify({ message: "Nenhum pagamento pendente." }), { headers: { "Content-Type": "application/json" } });
    }

    // Buscar todas as assinaturas push
    const { data: subs, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('subscription');

    if (subsError) throw subsError;

    let notificationsSent = 0;
    
    const payload = JSON.stringify({
      title: "Pagamentos Pendentes!",
      body: `Você tem ${bills.length} conta(s) para pagar ou em atraso. Abra o app para verificar.`,
      icon: "/icone192.png",
      url: "/"
    });

    // Enviar notificações
    for (const row of subs) {
      try {
        await webPush.sendNotification(row.subscription, payload);
        notificationsSent++;
      } catch (err) {
        console.error("Erro ao enviar push:", err);
      }
    }

    return new Response(JSON.stringify({ message: `Push enviado para ${notificationsSent} dispositivos.` }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
