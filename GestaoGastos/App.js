import 'react-native-url-polyfill/auto';
import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Modal,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator
} from 'react-native';

// IMPORTANTE: Instale no terminal do seu projeto local:
// npm install @supabase/supabase-js react-native-url-polyfill
// npx expo install lucide-react-native react-native-svg

import { createClient } from '@supabase/supabase-js';
import {
  LayoutDashboard,
  Plus,
  Receipt,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Trash2,
  Users,
  Briefcase,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Lock,
  Mail,
  LogOut
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// ==========================================
// CONFIGURAÇÃO DO SUPABASE
// ==========================================
const SUPABASE_URL = 'https://enamvoamthbfimtsvgqa.supabase.co';
const SUPABASE_KEY = 'sb_publishable_CpzqeLlInSe81L1Sq46rQQ_NJSmTnP1';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- DESIGN TOKENS ---
const COLORS = {
  surface: '#f8f9ff',
  primary: '#0b1c30',
  mint: '#14B8A6',
  coral: '#EF4444',
  slate: '#64748B',
  white: '#FFFFFF',
  purple: '#A855F7',
  blue: '#3980f4',
  border: '#e5eeff'
};

// --- CONFIGURAÇÃO DE TEMPO (MANAUS - AMT UTC-4) ---
// Simulando a data do sistema para o nosso cenário atual
const getManausNow = () => new Date(2026, 4, 14); // 14 de Maio de 2026
const HOJE = getManausNow();

// --- LÓGICA DE CALENDÁRIO CORPORATIVO (MANAUS 2026) ---
const isFeriado = (date) => {
  if (!date) return false;
  const dia = date.getDate().toString().padStart(2, '0');
  const mes = (date.getMonth() + 1).toString().padStart(2, '0');
  const strDate = `${dia}/${mes}`;

  const feriadosManaus = [
    '01/01', '16/02', '17/02', '18/02', '03/04', '21/04', '01/05',
    '04/06', '05/09', '07/09', '12/10', '24/10', '02/11', '15/11',
    '20/11', '08/12', '25/12'
  ];
  return feriadosManaus.includes(strDate);
};

const isDiaUtil = (date) => {
  if (!date) return false;
  const day = date.getDay();
  return day !== 0 && day !== 6 && !isFeriado(date);
};

// Retrocede para o dia útil mais próximo caso a data-alvo caia num final de semana/feriado
const getPagamentoDate = (year, month, targetDay) => {
  const diasNoMes = new Date(year, month + 1, 0).getDate();
  const diaReal = Math.min(targetDay, diasNoMes); 
  let date = new Date(year, month, diaReal);
  
  while (!isDiaUtil(date)) {
    date.setDate(date.getDate() - 1);
  }
  return date;
};

// Conversores de Data
const formatDataBR = (date) => {
  if (!date) return '';
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
};

const dateToDB = (strBR) => {
  if (!strBR) return null;
  const [d, m, y] = strBR.split('/');
  return `${y}-${m}-${d}`;
};

const dbToDateBR = (strDB) => {
  if (!strDB) return '';
  const [y, m, d] = strDB.split('-');
  return `${d}/${m}/${y}`;
};

const getNomeMes = (index) => {
  return ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"][index];
};

// ==========================================
// TELA DE LOGIN 
// ==========================================
function LoginScreen({ onSession }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg('Preencha os campos obrigatórios.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      setErrorMsg('E-mail ou senha incorretos.');
    } else if (data.session) {
      onSession(data.session.user);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.loginContainer}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.loginContent}>
        
        <View style={styles.loginHeader}>
          <View style={styles.loginLogo}>
            <Briefcase size={40} color={COLORS.mint} />
          </View>
          <Text style={styles.loginSubtitle}>SISTEMA DE GESTÃO</Text>
          <Text style={styles.loginTitle}>EXECUTIVE<Text style={{ color: COLORS.mint }}> PRO</Text></Text>
        </View>

        <View style={styles.loginCard}>
          <Text style={styles.loginCardTitle}>Acesso Administrativo</Text>
          
          <View style={[styles.loginInputWrapper, errorMsg ? { borderColor: COLORS.coral } : {}]}>
            <Mail size={20} color={COLORS.slate} style={styles.loginInputIcon} />
            <TextInput 
              style={styles.loginInput} 
              placeholder="E-mail corporativo" 
              placeholderTextColor={COLORS.slate}
              value={email}
              onChangeText={(t) => { setEmail(t); setErrorMsg(''); }}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={[styles.loginInputWrapper, errorMsg ? { borderColor: COLORS.coral } : {}]}>
            <Lock size={20} color={COLORS.slate} style={styles.loginInputIcon} />
            <TextInput 
              style={styles.loginInput} 
              placeholder="Senha de acesso" 
              placeholderTextColor={COLORS.slate}
              value={password}
              onChangeText={(t) => { setPassword(t); setErrorMsg(''); }}
              secureTextEntry
            />
          </View>

          {!!errorMsg && <Text style={styles.loginErrorTxt}>{errorMsg}</Text>}

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.loginBtnTxt}>ENTRAR NO SISTEMA</Text>}
          </TouchableOpacity>
        </View>
        
        <Text style={styles.loginFooter}>Manaus (AMT UTC-4) • Conexão Segura Supabase</Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ==========================================
// SISTEMA PRINCIPAL (Conectado às Tabelas fin_)
// ==========================================
function MainApp({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('inicio'); 
  const [viewDate, setViewDate] = useState(new Date(2026, 4, 1)); 
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  const [employees, setEmployees] = useState([]);
  const [contas, setContas] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('CONTA'); 
  const [editId, setEditId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null); 

  // Form states
  const [fName, setFName] = useState('');
  const [fVal, setFVal] = useState('');
  const [fVenc, setFVenc] = useState('');
  const [fFreq, setFFreq] = useState('MENSAL');
  const [fStatus, setFStatus] = useState('NO PRAZO');

  // --- BUSCA INICIAL DE DADOS ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: emps } = await supabase.from('fin_employees').select('*');
      if (emps) setEmployees(emps);

      const { data: bills } = await supabase.from('fin_bills').select('*');
      if (bills) {
        setContas(bills.map(b => ({
          id: b.id,
          desc: b.description,
          val: Number(b.val),
          venc: dbToDateBR(b.venc),
          status: b.status
        })));
      }

      const { data: pays } = await supabase.from('fin_salary_payments').select('*');
      if (pays) {
        const historyMap = {};
        pays.forEach(p => {
          historyMap[p.instance_id] = { dbId: p.id, valorPago: Number(p.amount_paid), status: 'PAGO' };
        });
        setPaymentHistory(historyMap);
      }
    } catch (error) {
      console.log('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const changeMonth = (offset) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  // --- LÓGICA DE FOLHA E RESÍDUOS ---
  const salaryEntries = useMemo(() => {
    const list = [];
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    employees.forEach(emp => {
      const mesKey = `${year}-${month}`;
      const empSalary = Number(emp.salary);

      if (emp.freq === 'QUINZENAL') {
        const idP1 = `sal-${emp.id}-${mesKey}-P1`;
        const idP2 = `sal-${emp.id}-${mesKey}-P2`;
        const dateP1 = getPagamentoDate(year, month, 15);
        const dateP2 = getPagamentoDate(year, month, 30);
        
        const dataP1 = paymentHistory[idP1];
        const dataP2 = paymentHistory[idP2];

        // Lógica Parte 1
        const valP1 = dataP1 ? dataP1.valorPago : empSalary / 2;
        list.push({
          id: idP1, empId: emp.id, desc: `SALÁRIO: ${emp.name} (PARTE 1)`, val: valP1, venc: formatDataBR(dateP1),
          status: dataP1 ? 'PAGO' : (HOJE > dateP1 ? 'VENCIDO' : 'NO PRAZO'), tipo: 'SALARIO', rawDate: dateP1
        });

        // Lógica Parte 2 (Resíduo: Salário total - o que foi pago na Parte 1)
        const valP2 = dataP2 ? dataP2.valorPago : (empSalary - valP1);
        list.push({
          id: idP2, empId: emp.id, desc: `SALÁRIO: ${emp.name} (PARTE 2)`, val: valP2, venc: formatDataBR(dateP2),
          status: dataP2 ? 'PAGO' : (HOJE > dateP2 ? 'VENCIDO' : 'NO PRAZO'), tipo: 'SALARIO', rawDate: dateP2
        });
      } else {
        const idFull = `sal-${emp.id}-${mesKey}-FULL`;
        const dateFull = getPagamentoDate(year, month, 30);
        const dataFull = paymentHistory[idFull];
        list.push({
          id: idFull, empId: emp.id, desc: `SALÁRIO: ${emp.name}`, val: empSalary, venc: formatDataBR(dateFull),
          status: dataFull ? 'PAGO' : (HOJE > dateFull ? 'VENCIDO' : 'NO PRAZO'), tipo: 'SALARIO', rawDate: dateFull
        });
      }
    });
    return list;
  }, [employees, paymentHistory, viewDate]);

  const registrosMes = useMemo(() => {
    const list = [
      ...contas.filter(c => {
        if (!c.venc) return false;
        const [d, m, y] = c.venc.split('/').map(Number);
        return m === (viewDate.getMonth() + 1) && y === viewDate.getFullYear();
      }).map(c => {
        const [d, m, y] = c.venc.split('/').map(Number);
        return { ...c, tipo: 'CONTA', rawDate: new Date(y, m - 1, d) };
      }),
      ...salaryEntries
    ];
    return list.sort((a, b) => a.rawDate - b.rawDate);
  }, [contas, salaryEntries, viewDate]);

  const registrosHome = useMemo(() => {
    return registrosMes.filter(item => {
      const isAtrasado = item.status === 'VENCIDO';
      const isHoje = formatDataBR(item.rawDate) === formatDataBR(HOJE);
      return (isAtrasado || isHoje) && item.status !== 'PAGO';
    });
  }, [registrosMes]);

  const stats = useMemo(() => {
    const totalMes = registrosMes.reduce((acc, curr) => acc + (curr.val || 0), 0);
    const totalPago = registrosMes.filter(i => i.status === 'PAGO').reduce((acc, curr) => acc + (curr.val || 0), 0);
    const pendente = totalMes - totalPago;
    return { totalMes, totalPago, pendente };
  }, [registrosMes]);

  const getTimeLabel = (date, status) => {
    if (!date) return { txt: '', color: COLORS.slate };
    if (status === 'PAGO') return { txt: 'Liquidado', color: COLORS.mint };
    const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const d2 = new Date(HOJE.getFullYear(), HOJE.getMonth(), HOJE.getDate());
    const diff = Math.ceil((d1 - d2) / (1000 * 60 * 60 * 24));
    if (diff === 0) return { txt: 'Vence Hoje', color: COLORS.blue };
    if (diff < 0) return { txt: `${Math.abs(diff)}d atrasado`, color: COLORS.coral };
    return { txt: `Faltam ${diff}d`, color: COLORS.slate };
  };

  // --- CRUD COM O BANCO DE DADOS ---
  const handleOpenModal = (mode, item = null) => {
    setModalMode(mode);
    setSelectedItem(item);
    if (item) {
      setEditId(item.id);
      const safeDesc = item.desc || '';
      const safeVal = item.val != null ? item.val.toString() : '';
      const safeVenc = item.venc || '';
      const safeStatus = item.status || 'NO PRAZO';
      const safeName = item.name || '';
      const safeFreq = item.freq || 'MENSAL';

      if (mode === 'CONTA') {
        setFName(safeDesc); setFVal(safeVal); setFVenc(safeVenc); setFStatus(safeStatus);
      } else if (mode === 'PAGAR_SALARIO') {
        setFName(safeDesc.replace('SALÁRIO: ', '')); setFVal(safeVal); setFVenc(safeVenc); setFStatus(safeStatus);
      } else if (mode === 'RH') {
        setFName(safeName); setFVal(safeVal); setFFreq(safeFreq);
      }
    } else {
      setEditId(null); setSelectedItem(null); setFName(''); setFVal(''); setFVenc(formatDataBR(HOJE)); setFStatus('NO PRAZO'); setFFreq('MENSAL');
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!fName || !fVal) return;
    setProcessing(true);
    const numericVal = parseFloat(fVal.toString().replace(',', '.'));
    
    try {
      if (modalMode === 'CONTA') {
        const payload = { description: fName.toUpperCase(), val: numericVal, venc: dateToDB(fVenc), status: fStatus };
        if (editId) {
          await supabase.from('fin_bills').update(payload).eq('id', editId);
        } else {
          payload.created_by = user.id;
          await supabase.from('fin_bills').insert([payload]);
        }
      } else if (modalMode === 'RH') {
        const payload = { name: fName.toUpperCase(), salary: numericVal, freq: fFreq };
        if (editId) {
          await supabase.from('fin_employees').update(payload).eq('id', editId);
        } else {
          payload.created_by = user.id;
          await supabase.from('fin_employees').insert([payload]);
        }
      }
      await fetchData(); 
      setIsModalOpen(false);
    } catch (error) {
      console.log(error);
    } finally {
      setProcessing(false);
    }
  };

  const togglePayment = async () => {
    if (!editId || !selectedItem) return;
    setProcessing(true);
    
    try {
      if (paymentHistory[editId]) {
        // Estorno - Deleta registro de pagamento
        await supabase.from('fin_salary_payments').delete().eq('instance_id', editId);
      } else {
        // Confirmar Pagamento
        const numericVal = parseFloat((fVal || '0').toString().replace(',', '.'));
        await supabase.from('fin_salary_payments').insert([{
          employee_id: selectedItem.empId,
          instance_id: editId,
          amount_paid: numericVal,
          paid_by: user.id
        }]);
      }
      await fetchData();
      setIsModalOpen(false);
    } catch (error) {
      console.log(error);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!editId) return;
    setProcessing(true);
    try {
      if (modalMode === 'CONTA') await supabase.from('fin_bills').delete().eq('id', editId);
      else if (modalMode === 'RH') await supabase.from('fin_employees').delete().eq('id', editId);
      
      await fetchData();
      setIsModalOpen(false);
    } catch (error) {
      console.log(error);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.surface }}>
        <ActivityIndicator size="large" color={COLORS.mint} />
        <Text style={{ marginTop: 10, color: COLORS.slate, fontWeight: '700' }}>Sincronizando banco de dados...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* HEADER E NAVEGAÇÃO DE MÊS */}
      <View style={styles.header}>
        <View style={styles.rowBetween}>
          <View style={styles.timezoneBadge}>
             <MapPin size={10} color={COLORS.slate} />
             <Text style={styles.timezoneText}>MANAUS (AMT UTC-4)</Text>
          </View>
          
          <TouchableOpacity onPress={handleSignOut} style={styles.logoutBtn}>
            <LogOut size={16} color={COLORS.coral} />
            <Text style={styles.logoutBtnTxt}>Sair</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.navRow}>
          <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navBtn}>
            <ChevronLeft size={24} color={COLORS.primary}/>
          </TouchableOpacity>
          <View style={styles.monthBox}>
            <Text style={styles.monthName}>{getNomeMes(viewDate.getMonth())}</Text>
            <Text style={styles.yearName}>{viewDate.getFullYear()}</Text>
          </View>
          <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navBtn}>
            <ChevronRight size={24} color={COLORS.primary}/>
          </TouchableOpacity>
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>PAGO NO MÊS</Text>
            <Text style={[styles.summaryVal, { color: COLORS.mint }]}>R$ {stats.totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>EM ABERTO</Text>
            <Text style={[styles.summaryVal, { color: COLORS.coral }]}>R$ {stats.pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollPadding} showsVerticalScrollIndicator={false}>
        {activeTab === 'equipe' ? (
          <View>
            <Text style={styles.sectionTitle}>Gestão de Colaboradores</Text>
            {employees.map(emp => (
              <TouchableOpacity key={emp.id} style={styles.employeeCard} onPress={() => handleOpenModal('RH', emp)}>
                <View style={styles.row}>
                  <View style={styles.avatar}><Text style={styles.avatarTxt}>{emp.name.slice(0, 1)}</Text></View>
                  <View>
                    <Text style={styles.empName}>{emp.name}</Text>
                    <Text style={styles.empSub}>{emp.freq === 'MENSAL' ? 'Dia 30' : 'Dias 15 e 30'}</Text>
                  </View>
                </View>
                <Text style={styles.empSalary}>R$ {Number(emp.salary).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>{activeTab === 'inicio' ? 'Atenção Hoje' : 'Fluxo Completo'}</Text>
                <Text style={styles.todayLabel}>Hoje: {formatDataBR(HOJE)}</Text>
              </View>
              {activeTab === 'inicio' && <AlertCircle size={20} color={COLORS.coral} />}
            </View>

            {(activeTab === 'inicio' ? registrosHome : registrosMes).map(item => {
              const label = getTimeLabel(item.rawDate, item.status);
              return (
                <TouchableOpacity 
                  key={item.id} 
                  style={[styles.itemCard, item.tipo === 'SALARIO' && styles.itemSalarioBorder]} 
                  onPress={() => item.tipo === 'CONTA' ? handleOpenModal('CONTA', item) : handleOpenModal('PAGAR_SALARIO', item)}
                >
                  <View style={styles.rowCenter}>
                    <View style={[styles.itemIcon, { backgroundColor: item.tipo === 'SALARIO' ? COLORS.purple + '10' : COLORS.blue + '10' }]}>
                      {item.tipo === 'SALARIO' ? <Users size={18} color={COLORS.purple} /> : <Briefcase size={18} color={COLORS.blue} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemDesc} numberOfLines={1}>{item.desc}</Text>
                      <Text style={[styles.itemTime, { color: label.color }]}>{label.txt} ({item.venc.slice(0, 5)})</Text>
                    </View>
                  </View>
                  <View style={styles.itemRight}>
                    <Text style={styles.itemVal}>R$ {(item.val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
                    <StatusPill status={item.status} />
                  </View>
                </TouchableOpacity>
              );
            })}

            {activeTab === 'inicio' && registrosHome.length === 0 && (
              <View style={styles.emptyState}>
                <CheckCircle2 size={40} color={COLORS.mint} />
                <Text style={styles.emptyText}>Tudo em dia por hoje!</Text>
              </View>
            )}

            {activeTab === 'extrato' && (
              <View style={styles.progressCard}>
                <Text style={styles.progTitle}>Meta de Liquidação do Mês</Text>
                <View style={styles.progBarBg}>
                   <View style={[styles.progBarFill, { width: `${stats.totalMes > 0 ? (stats.totalPago / stats.totalMes) * 100 : 0}%` }]} />
                </View>
                <View style={styles.rowBetween}>
                  <Text style={styles.progSub}>{Math.round(stats.totalMes > 0 ? (stats.totalPago / stats.totalMes) * 100 : 0)}% concluído</Text>
                  <Text style={styles.progSub}>R$ {stats.totalMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
                </View>
              </View>
            )}
          </View>
        )}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* FAB ADICIONAR */}
      <TouchableOpacity 
        style={[styles.fab, activeTab === 'equipe' && { backgroundColor: COLORS.purple }]} 
        onPress={() => handleOpenModal(activeTab === 'equipe' ? 'RH' : 'CONTA')}
      >
        <Plus size={32} color="white" strokeWidth={3} />
      </TouchableOpacity>

      {/* TABS NATIVAS */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('inicio')}>
          <LayoutDashboard size={24} color={activeTab === 'inicio' ? COLORS.mint : '#CBD5E1'} />
          <Text style={[styles.tabText, { color: activeTab === 'inicio' ? COLORS.mint : COLORS.slate }]}>HOME</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('equipe')}>
          <Users size={24} color={activeTab === 'equipe' ? COLORS.purple : '#CBD5E1'} />
          <Text style={[styles.tabText, { color: activeTab === 'equipe' ? COLORS.purple : COLORS.slate }]}>EQUIPE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('extrato')}>
          <Receipt size={24} color={activeTab === 'extrato' ? COLORS.mint : '#CBD5E1'} />
          <Text style={[styles.tabText, { color: activeTab === 'extrato' ? COLORS.mint : COLORS.slate }]}>EXTRATO</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContent}>
            <View style={styles.modalIndicator} />
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{modalMode === 'PAGAR_SALARIO' ? 'Confirmar Pagamento' : (editId ? 'Editar' : 'Novo')}</Text>
                <Text style={styles.modalSub}>Sincronizado na Nuvem</Text>
              </View>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}><X size={24} color={COLORS.slate}/></TouchableOpacity>
            </View>

            {modalMode === 'PAGAR_SALARIO' ? (
              <View>
                <View style={styles.salaryCard}>
                  <Text style={styles.label}>NOME DO BENEFICIÁRIO</Text>
                  <Text style={styles.salaryNameText}>{fName}</Text>
                  <View style={styles.rowBetween}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.label}>VALOR EFETUADO (R$)</Text>
                      <TextInput style={styles.salaryInput} value={fVal} onChangeText={setFVal} keyboardType="numeric" />
                    </View>
                    <View style={{ alignItems: 'flex-end', marginLeft: 15 }}>
                      <Text style={styles.label}>VENCIMENTO</Text>
                      <Text style={styles.salaryValText}>{fVenc.slice(0, 5)}</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity style={[styles.btnPayHuge, { backgroundColor: paymentHistory[editId] ? COLORS.slate : COLORS.mint }]} onPress={togglePayment} disabled={processing}>
                  {processing ? <ActivityIndicator color={COLORS.white} /> : (
                    <>
                      <DollarSign size={24} color="white" />
                      <Text style={styles.btnPayHugeText}>{paymentHistory[editId] ? 'ESTORNAR PAGAMENTO' : 'CONFIRMAR PAGAMENTO'}</Text>
                    </>
                  )}
                </TouchableOpacity>
                <Text style={styles.hint}>* Quinzenais: O resíduo será calculado automaticamente na Parte 2.</Text>
              </View>
            ) : (
              <View style={styles.formContainer}>
                <Text style={styles.label}>DESCRIÇÃO / NOME</Text>
                <TextInput style={styles.input} value={fName} onChangeText={setFName} placeholder="Ex: ALUGUEL" placeholderTextColor={COLORS.slate} />
                <View style={styles.formRow}>
                  <View style={{ flex: 1, marginRight: 10 }}><Text style={styles.label}>VALOR (R$)</Text><TextInput style={styles.input} value={fVal} onChangeText={setFVal} keyboardType="numeric" placeholder="0,00" /></View>
                  <View style={{ flex: 1 }}>
                    {modalMode === 'CONTA' ? (
                      <><Text style={styles.label}>DATA VENC.</Text><TextInput style={styles.input} value={fVenc} onChangeText={setFVenc} placeholder="DD/MM/AAAA" /></>
                    ) : (
                      <><Text style={styles.label}>FREQUÊNCIA</Text>
                        <View style={styles.toggleRow}>
                          <TouchableOpacity onPress={() => setFFreq('MENSAL')} style={[styles.toggleBtn, fFreq === 'MENSAL' && styles.toggleBtnActive]}><Text style={[styles.toggleTxt, fFreq === 'MENSAL' && { color: 'white' }]}>Mensal</Text></TouchableOpacity>
                          <TouchableOpacity onPress={() => setFFreq('QUINZENAL')} style={[styles.toggleBtn, fFreq === 'QUINZENAL' && styles.toggleBtnActive]}><Text style={[styles.toggleTxt, fFreq === 'QUINZENAL' && { color: 'white' }]}>15 dias</Text></TouchableOpacity>
                        </View>
                      </>
                    )}
                  </View>
                </View>
                {modalMode === 'CONTA' && (
                  <View style={styles.statusRow}>{['PAGO', 'NO PRAZO', 'VENCIDO'].map(s => <TouchableOpacity key={s} onPress={() => setFStatus(s)} style={[styles.statusOption, fStatus === s && { backgroundColor: COLORS.primary }]}><Text style={[styles.statusOptionTxt, fStatus === s && { color: 'white' }]}>{s}</Text></TouchableOpacity>)}</View>
                )}
                <View style={styles.modalActions}>
                  {editId && (
                    <TouchableOpacity style={styles.btnDelete} onPress={handleDelete} disabled={processing}>
                      {processing ? <ActivityIndicator color={COLORS.white} /> : <Trash2 size={24} color="white" />}
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={[styles.btnSave, { backgroundColor: modalMode === 'CONTA' ? COLORS.mint : COLORS.purple }]} onPress={handleSave} disabled={processing}>
                    {processing ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.btnSaveText}>SALVAR DADOS</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ==========================================
// ROOT COMPONENT: CONTROLADOR DE SESSÃO
// ==========================================
export default function App() {
  const [sessionUser, setSessionUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionUser(session?.user ?? null);
      setChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (checking) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.mint} />
      </View>
    );
  }

  if (!sessionUser) {
    return <LoginScreen onSession={(user) => setSessionUser(user)} />;
  }

  return <MainApp user={sessionUser} onLogout={() => setSessionUser(null)} />;
}

// --- COMPONENTE DE STATUS PILL ---
const StatusPill = ({ status }) => {
  const configs = {
    'PAGO': { bg: '#ECFDF5', txt: '#047857', icon: <CheckCircle2 size={10} color="#047857" /> },
    'VENCIDO': { bg: '#FFF1F2', txt: '#E11D48', icon: <AlertCircle size={10} color="#E11D48" /> },
    'NO PRAZO': { bg: '#EFF6FF', txt: '#1D4ED8', icon: <Clock size={10} color="#1D4ED8" /> }
  };
  const c = configs[status] || configs['NO PRAZO'];
  return (
    <View style={[styles.pill, { backgroundColor: c.bg, borderColor: c.txt + '20' }]}>{c.icon}<Text style={[styles.pillTxt, { color: c.txt }]}>{status}</Text></View>
  );
};

// --- ESTILOS NATIVOS ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  
  // Estilos Login
  loginContainer: { flex: 1, backgroundColor: COLORS.primary },
  loginContent: { flex: 1, justifyContent: 'center', padding: 24 },
  loginHeader: { alignItems: 'center', marginBottom: 40 },
  loginLogo: { width: 80, height: 80, borderRadius: 24, backgroundColor: 'rgba(20, 184, 166, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(20, 184, 166, 0.2)' },
  loginSubtitle: { fontSize: 12, fontWeight: '900', color: COLORS.slate, letterSpacing: 3, marginBottom: 4 },
  loginTitle: { fontSize: 28, fontWeight: '900', color: COLORS.white, letterSpacing: -1 },
  loginCard: { backgroundColor: COLORS.white, padding: 24, borderRadius: 24, elevation: 10 },
  loginCardTitle: { fontSize: 16, fontWeight: '900', color: COLORS.primary, marginBottom: 20 },
  loginInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 16, paddingHorizontal: 16, height: 60 },
  loginInputIcon: { marginRight: 12 },
  loginInput: { flex: 1, fontSize: 16, fontWeight: '600', color: COLORS.primary },
  loginBtn: { backgroundColor: COLORS.mint, height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  loginBtnTxt: { color: COLORS.white, fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  loginErrorTxt: { color: COLORS.coral, fontSize: 12, fontWeight: '700', textAlign: 'center', marginBottom: 10, marginTop: -5 },
  loginFooter: { textAlign: 'center', color: COLORS.slate, fontSize: 10, fontWeight: '600', marginTop: 30 },
  
  // Estilos App Principal
  header: { backgroundColor: 'white', paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 40 : 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  timezoneBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  timezoneText: { fontSize: 8, fontWeight: '900', color: COLORS.slate },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF1F2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, gap: 4 },
  logoutBtnTxt: { color: COLORS.coral, fontSize: 10, fontWeight: '900' },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 15 },
  navBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  monthBox: { alignItems: 'center' },
  monthName: { fontSize: 18, fontWeight: '900', color: COLORS.primary, letterSpacing: 1 },
  yearName: { fontSize: 12, fontWeight: '700', color: COLORS.slate },
  summary: { flexDirection: 'row', gap: 12 },
  summaryBox: { flex: 1, backgroundColor: 'white', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  summaryLabel: { fontSize: 8, fontWeight: '900', color: COLORS.slate, marginBottom: 4 },
  summaryVal: { fontSize: 13, fontWeight: '900' },
  content: { flex: 1 },
  scrollPadding: { paddingHorizontal: 20, paddingTop: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 13, fontWeight: '900', color: COLORS.primary, textTransform: 'uppercase' },
  todayLabel: { fontSize: 10, color: COLORS.slate, fontWeight: '700' },
  itemCard: { backgroundColor: 'white', padding: 16, borderRadius: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#F8FAFC' },
  itemSalarioBorder: { borderLeftWidth: 4, borderLeftColor: COLORS.purple },
  itemIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  itemDesc: { fontSize: 11, fontWeight: '800', color: COLORS.primary, marginBottom: 2 },
  itemTime: { fontSize: 9, fontWeight: '700' },
  itemVal: { fontSize: 14, fontWeight: '900', color: COLORS.primary },
  itemRight: { alignItems: 'flex-end' },
  pill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, gap: 4, marginTop: 4 },
  pillTxt: { fontSize: 8, fontWeight: '900' },
  employeeCard: { backgroundColor: 'white', padding: 16, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  avatar: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.purple + '15', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  avatarTxt: { fontSize: 16, fontWeight: '900', color: COLORS.purple },
  empName: { fontSize: 14, fontWeight: '800', color: COLORS.primary },
  empSub: { fontSize: 10, color: COLORS.slate },
  empSalary: { fontSize: 14, fontWeight: '900', color: COLORS.purple },
  progressCard: { backgroundColor: COLORS.primary, padding: 20, borderRadius: 24, marginTop: 15 },
  progTitle: { color: 'white', fontSize: 11, fontWeight: '900', marginBottom: 15 },
  progBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden', marginBottom: 10 },
  progBarFill: { height: '100%', backgroundColor: COLORS.mint },
  progSub: { color: 'white', opacity: 0.6, fontSize: 9, fontWeight: 'bold' },
  emptyState: { alignItems: 'center', padding: 40, gap: 10 },
  emptyText: { fontSize: 12, fontWeight: '700', color: COLORS.slate },
  fab: { position: 'absolute', bottom: 110, right: 24, width: 64, height: 64, borderRadius: 22, backgroundColor: COLORS.mint, alignItems: 'center', justifyContent: 'center', elevation: 8 },
  tabBar: { position: 'absolute', bottom: 0, width: width, height: 90, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-around', paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  tabItem: { alignItems: 'center' },
  tabText: { fontSize: 9, fontWeight: '900', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(11, 28, 48, 0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 50 },
  modalIndicator: { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: COLORS.primary },
  modalSub: { fontSize: 11, color: COLORS.slate },
  formContainer: { gap: 15 },
  label: { fontSize: 9, fontWeight: '900', color: COLORS.slate, letterSpacing: 1, marginBottom: 5 },
  input: { backgroundColor: '#F8FAFC', borderRadius: 14, padding: 15, fontSize: 14, fontWeight: '700', color: COLORS.primary, borderWidth: 1, borderColor: '#F1F5F9' },
  formRow: { flexDirection: 'row', alignItems: 'center' },
  toggleRow: { flexDirection: 'row', gap: 5, flex: 1 },
  toggleBtn: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9', alignItems: 'center' },
  toggleBtnActive: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  toggleTxt: { fontSize: 10, fontWeight: '900', color: COLORS.slate },
  statusRow: { flexDirection: 'row', gap: 5, marginTop: 5 },
  statusOption: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#F1F5F9', alignItems: 'center' },
  statusOptionTxt: { fontSize: 9, fontWeight: '900', color: COLORS.slate },
  modalActions: { flexDirection: 'row', marginTop: 10, gap: 10 },
  btnDelete: { backgroundColor: COLORS.coral, width: 60, height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  btnSave: { flex: 1, height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center', elevation: 3 },
  btnSaveText: { color: 'white', fontSize: 12, fontWeight: '900' },
  salaryCard: { backgroundColor: '#F8FAFC', padding: 20, borderRadius: 20, marginBottom: 25, borderStyle: 'dashed', borderWidth: 1, borderColor: COLORS.slate },
  salaryNameText: { fontSize: 18, fontWeight: '900', color: COLORS.primary, marginBottom: 15 },
  salaryValText: { fontSize: 15, fontWeight: '800', color: COLORS.primary },
  salaryInput: { backgroundColor: 'white', padding: 12, borderRadius: 12, fontSize: 18, fontWeight: '900', color: COLORS.mint, borderWidth: 2, borderColor: COLORS.mint },
  btnPayHuge: { height: 70, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, elevation: 4 },
  btnPayHugeText: { color: 'white', fontSize: 14, fontWeight: '900' },
  hint: { fontSize: 10, color: COLORS.slate, textAlign: 'center', marginTop: 15, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowCenter: { flexDirection: 'row', alignItems: 'center', flex: 1 }
});