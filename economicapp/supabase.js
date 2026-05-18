// ==========================================
// CONFIGURAÇÃO DO SUPABASE
// ==========================================

const SUPABASE_URL = 'https://enamvoamthbfimtsvgqa.supabase.co';
const SUPABASE_KEY = 'sb_publishable_CpzqeLlInSe81L1Sq46rQQ_NJSmTnP1';

// Verifica se a biblioteca do Supabase foi carregada corretamente pelo CDN no HTML
if (window.supabase) {
  // A biblioteca expõe 'window.supabase.createClient'. 
  // Vamos criar a instância e substituir a variável global para que o resto do sistema
  // possa chamar diretamente 'supabase.auth', 'supabase.from()', etc.
  
  const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  window.supabase = supabaseClient;
  
  console.log("Supabase inicializado com sucesso.");
} else {
  console.error("Erro: A biblioteca do Supabase não foi carregada. Certifique-se de que a tag <script> está no HTML antes de supabase.js.");
}