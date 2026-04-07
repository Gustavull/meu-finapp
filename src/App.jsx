import React, { useState, useMemo, useEffect } from 'react';
import { 
  Home, CreditCard, List, Plus, TrendingUp, TrendingDown, 
  Wallet, X, PieChart, Landmark, Sun, Moon, 
  BarChart3, Briefcase, PlusCircle, History, Info,
  Calendar, CheckCircle2, Clock, Settings, AlertCircle,
  ArrowUpCircle, ArrowDownCircle, Bell, Target, PiggyBank,
  ArrowRightLeft, AlertTriangle, Gauge, Tag, Trash2, Edit3,
  Download, Upload
} from 'lucide-react';

// --- CONFIGURAÇÕES INICIAIS ---
const colorOptions = [
  { name: 'Vermelho', class: 'bg-rose-500' },
  { name: 'Azul', class: 'bg-blue-500' },
  { name: 'Verde', class: 'bg-emerald-500' },
  { name: 'Amarelo', class: 'bg-amber-500' },
  { name: 'Roxo', class: 'bg-purple-500' },
];

const defaultCategories = [
  { id: '1', name: 'Alimentação', color: 'bg-rose-500', type: 'expense', budget: 1000 },
  { id: '2', name: 'Moradia', color: 'bg-blue-500', type: 'expense', budget: 2500 },
  { id: '3', name: 'Transporte', color: 'bg-amber-500', type: 'expense', budget: 400 },
  { id: '4', name: 'Salário', color: 'bg-emerald-500', type: 'income', budget: 0 },
];

const defaultAccounts = [{ id: 'acc-1', name: 'Conta Corrente', type: 'checking', balance: 0 }];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('fin_theme') === 'dark');
  
  const [transactions, setTransactions] = useState(() => JSON.parse(localStorage.getItem('fin_transactions')) || []);
  const [accounts, setAccounts] = useState(() => JSON.parse(localStorage.getItem('fin_accounts')) || defaultAccounts);
  const [categories, setCategories] = useState(() => JSON.parse(localStorage.getItem('fin_categories')) || defaultCategories);

  const currentMonth = new Date().toISOString().slice(0, 7);

  // --- SINCRONIZAÇÃO E TEMA ---
  useEffect(() => {
    localStorage.setItem('fin_transactions', JSON.stringify(transactions));
    localStorage.setItem('fin_accounts', JSON.stringify(accounts));
    localStorage.setItem('fin_categories', JSON.stringify(categories));
    localStorage.setItem('fin_theme', darkMode ? 'dark' : 'light');
    
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [transactions, accounts, categories, darkMode]);

  // --- CÁLCULOS DE DASHBOARD ---
  // Alterado para pt-BR e BRL (Real)
  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const balance = income - expenses;

    const categoryBudgets = categories.filter(c => c.type === 'expense').map(cat => {
      const spent = transactions
        .filter(t => t.categoryId === cat.id && t.date.startsWith(currentMonth))
        .reduce((sum, t) => sum + t.amount, 0);
      return { ...cat, spent, percent: cat.budget > 0 ? (spent / cat.budget) * 100 : 0 };
    });

    return { balance, income, expenses, categoryBudgets };
  }, [transactions, categories, currentMonth]);

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Painel Principal</h2>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Resumo da sua saúde financeira</p>
        </div>
        <button onClick={() => setDarkMode(!darkMode)} className="p-3 rounded-2xl bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-sm transition-all hover:scale-110">
           {darkMode ? <Sun size={20} className="text-amber-500"/> : <Moon size={20} className="text-slate-500"/>}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-[2.5rem] shadow-xl bg-indigo-600 text-white">
          <p className="text-[10px] font-black uppercase opacity-70 tracking-widest mb-1">Saldo Total</p>
          <h3 className="text-4xl font-black">{formatCurrency(stats.balance)}</h3>
        </div>
        <div className={`p-8 rounded-[2.5rem] border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Entradas</p>
          <h3 className="text-4xl font-black">{formatCurrency(stats.income)}</h3>
        </div>
        <div className={`p-8 rounded-[2.5rem] border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Saídas</p>
          <h3 className="text-4xl font-black text-rose-500">{formatCurrency(stats.expenses)}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={`p-8 rounded-[3rem] border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
           <h3 className="text-xl font-black mb-8 flex items-center gap-2"><Gauge size={24} className="text-indigo-500"/> Orçamentos</h3>
           <div className="space-y-6">
              {stats.categoryBudgets.slice(0, 4).map(cat => (
                <div key={cat.id}>
                   <div className="flex justify-between mb-2">
                      <span className="text-sm font-black">{cat.name}</span>
                      <span className={`text-xs font-black ${cat.percent > 100 ? 'text-rose-500' : 'text-slate-500'}`}>
                        {formatCurrency(cat.spent)} / {formatCurrency(cat.budget)}
                      </span>
                   </div>
                   <div className="h-3 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-700 ${cat.percent > 100 ? 'bg-rose-500' : 'bg-indigo-500'}`} 
                        style={{ width: `${Math.min(cat.percent, 100)}%` }}
                      />
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className={`p-8 rounded-[3rem] border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
           <h3 className="text-xl font-black mb-8 flex items-center gap-2"><History size={24} className="text-indigo-500"/> Histórico Recente</h3>
           <div className="space-y-4">
              {transactions.slice(-4).reverse().map(tx => (
                <div key={tx.id} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
                   <div>
                      <p className="text-sm font-black">{tx.description}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">{tx.date}</p>
                   </div>
                   <span className={`font-black ${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                   </span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${darkMode ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-800'}`}>
      {/* Sidebar */}
      <aside className={`w-full md:w-72 border-r flex flex-col md:h-screen sticky top-0 z-20 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="p-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl">F</div>
          <div><h1 className="font-black text-2xl tracking-tighter">FinApp</h1><p className="text-[10px] font-black text-indigo-500 uppercase">Gestão 360</p></div>
        </div>
        
        <nav className="flex-1 px-6 space-y-2">
          {[
            { id: 'dashboard', icon: <Home size={20}/>, label: 'Início' },
            { id: 'transactions', icon: <List size={20}/>, label: 'Movimentos' },
            { id: 'categories', icon: <Tag size={20}/>, label: 'Categorias' },
          ].map(item => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)} 
              className={`flex items-center gap-4 w-full p-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              {item.icon}<span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-8">
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-5 rounded-2xl font-black shadow-xl flex items-center justify-center gap-3 text-sm active:scale-95 transition-transform"
          >
            <PlusCircle size={20}/> Novo Gasto
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'dashboard' && renderDashboard()}
          
          {activeTab === 'transactions' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-black mb-8">Extrato Completo</h2>
              <div className={`rounded-[2rem] border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black uppercase text-slate-400">
                      <th className="p-6 text-left">Data</th>
                      <th className="p-6 text-left">Descrição</th>
                      <th className="p-6 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-slate-800">
                    {transactions.slice().reverse().map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="p-6 text-xs font-bold text-slate-400">{tx.date}</td>
                        <td className="p-6">
                          <p className="font-black text-sm">{tx.description}</p>
                          <p className="text-[10px] text-indigo-500 font-bold uppercase">{categories.find(c => c.id === tx.categoryId)?.name}</p>
                        </td>
                        <td className={`p-6 text-right font-black ${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="animate-in fade-in duration-500">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black">Categorias</h2>
                <button onClick={() => setIsCategoryModalOpen(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest">Adicionar</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {categories.map(cat => (
                  <div key={cat.id} className={`p-6 rounded-[2rem] border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                    <div className={`w-10 h-10 rounded-xl ${cat.color} mb-4`}></div>
                    <h4 className="font-black text-lg">{cat.name}</h4>
                    <p className="text-xs font-bold text-slate-400 uppercase">{cat.type}</p>
                    {cat.type === 'expense' && <p className="mt-2 font-black text-indigo-500">{formatCurrency(cat.budget)}/mês</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-10 rounded-[3rem] shadow-2xl ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-8"><h3 className="text-2xl font-black">Novo Lançamento</h3><button onClick={() => setIsModalOpen(false)}><X/></button></div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.target);
              const data = {
                id: Date.now(),
                type: f.get('type'),
                amount: parseFloat(f.get('amount')),
                description: f.get('desc'),
                categoryId: f.get('cat'),
                date: new Date().toLocaleDateString('pt-BR') // Alterado para padrão Brasil
              };
              setTransactions([...transactions, data]);
              setIsModalOpen(false);
            }} className="space-y-4">
              <select name="type" className="w-full p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none font-bold outline-none">
                <option value="expense">Despesa</option>
                <option value="income">Receita</option>
              </select>
              <input name="desc" placeholder="Descrição" required className="w-full p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none font-bold outline-none" />
              <input name="amount" type="number" step="0.01" placeholder="Valor R$" required className="w-full p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none font-black text-xl outline-none" />
              <select name="cat" className="w-full p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none font-bold outline-none">
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl">Confirmar</button>
            </form>
          </div>
        </div>
      )}

      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-10 rounded-[3rem] shadow-2xl ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-8"><h3 className="text-2xl font-black text-indigo-500">Nova Categoria</h3><button onClick={() => setIsCategoryModalOpen(false)}><X/></button></div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.target);
              const data = {
                id: Date.now().toString(),
                name: f.get('name'),
                type: f.get('type'),
                budget: parseFloat(f.get('budget') || 0),
                color: colorOptions[Math.floor(Math.random() * colorOptions.length)].class
              };
              setCategories([...categories, data]);
              setIsCategoryModalOpen(false);
            }} className="space-y-4">
              <input name="name" placeholder="Nome da Categoria" required className="w-full p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none font-bold outline-none" />
              <select name="type" className="w-full p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none font-bold outline-none">
                <option value="expense">Despesa</option>
                <option value="income">Receita</option>
              </select>
              <input name="budget" type="number" placeholder="Orçamento Mensal R$" className="w-full p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none font-bold outline-none" />
              <button type="submit" className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-5 rounded-2xl font-black uppercase">Criar Categoria</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
