
import React, { useState, useMemo, useCallback } from 'react';
import { useTradingBot } from '../hooks/useTradingBot';
import { Trade, TradeStatus, BotConfig } from '../types';
import { SettingsIcon, PowerIcon, SparklesIcon, PlayIcon, PauseIcon } from './icons';
import { getMarketAnalysis } from '../services/geminiService';

const Header: React.FC<{
  onKillSwitch: () => void;
  onToggleConfig: () => void;
  onGetAnalysis: () => void;
  isBotRunning: boolean;
  onToggleBot: () => void;
  currentTime: Date;
}> = ({ onKillSwitch, onToggleConfig, onGetAnalysis, isBotRunning, onToggleBot, currentTime }) => (
  <header className="bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700 shadow-lg">
    <div className="flex items-center space-x-3">
      <img src="https://picsum.photos/40/40" alt="logo" className="rounded-full" />
      <h1 className="text-xl font-bold text-white tracking-wider">MochaBot Options Dashboard</h1>
    </div>
    <div className="text-center">
        <div className="text-sm text-gray-400">Current Time (IST)</div>
        <div className="text-lg font-mono font-semibold tracking-wider">{currentTime.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false })}</div>
    </div>
    <div className="flex items-center space-x-2">
      <button onClick={onGetAnalysis} className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center space-x-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500">
        <SparklesIcon className="w-5 h-5" />
        <span>AI Analysis</span>
      </button>
      <button onClick={onToggleConfig} className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-blue">
        <SettingsIcon className="w-6 h-6" />
      </button>
      <button onClick={onToggleBot} className={`p-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 ${isBotRunning ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'}`}>
        {isBotRunning ? <PauseIcon className="w-6 h-6"/> : <PlayIcon className="w-6 h-6"/>}
      </button>
      <button onClick={onKillSwitch} className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center space-x-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500">
        <PowerIcon className="w-5 h-5" />
        <span>KILL SWITCH</span>
      </button>
    </div>
  </header>
);

const SummaryCard: React.FC<{ title: string; value: string; color: string }> = ({ title, value, color }) => (
  <div className="bg-gray-800 p-4 rounded-lg shadow-md flex-1">
    <h3 className="text-sm text-gray-400 font-medium">{title}</h3>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </div>
);

const PositionsTable: React.FC<{
  title: string;
  trades: Trade[];
  onSquareOff?: (id: string) => void;
}> = ({ title, trades, onSquareOff }) => {
    const getStatusColor = (status: TradeStatus) => {
        if (status === TradeStatus.ACTIVE) return "text-cyan-400";
        if (status.includes("SL") || status.includes("KILLED")) return "text-red-400";
        if (status.includes("TP")) return "text-green-400";
        return "text-yellow-400";
    }
    
    return (
        <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <h2 className="text-lg font-semibold p-4 border-b border-gray-700">{title}</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-700/50 text-xs text-gray-400 uppercase">
                        <tr>
                            {['Type', 'Entry Price', 'Current Price', onSquareOff ? 'SL / TP' : 'Exit Price', 'PnL', 'Status', onSquareOff ? 'Action' : 'Exit Time'].map(h => (
                                <th key={h} scope="col" className="px-4 py-3">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {trades.length === 0 ? (
                            <tr><td colSpan={7} className="text-center py-8 text-gray-500">No positions found.</td></tr>
                        ) : (
                            trades.map(trade => (
                                <tr key={trade.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className={`px-4 py-3 font-medium ${trade.type === 'CALL' ? 'text-green-400' : 'text-orange-400'}`}>{trade.type}</td>
                                    <td className="px-4 py-3">{trade.entryPrice.toFixed(2)}</td>
                                    <td className="px-4 py-3">{trade.currentPrice.toFixed(2)}</td>
                                    <td className="px-4 py-3">{onSquareOff ? `${trade.stopLossPrice.toFixed(2)} / ${trade.takeProfitPrice.toFixed(2)}` : trade.exitPrice?.toFixed(2) ?? 'N/A'}</td>
                                    <td className={`px-4 py-3 font-semibold ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>{trade.pnl.toFixed(2)}</td>
                                    <td className={`px-4 py-3 font-semibold ${getStatusColor(trade.status)}`}>{trade.status}</td>
                                    <td className="px-4 py-3">
                                        {onSquareOff ? (
                                            <button onClick={() => onSquareOff(trade.id)} className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors">Square Off</button>
                                        ) : (
                                            trade.exitTime ? new Date(trade.exitTime).toLocaleTimeString('en-IN', {timeZone: 'Asia/Kolkata'}) : 'N/A'
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ConfigPanel: React.FC<{
    config: BotConfig;
    onUpdate: (newConfig: Partial<BotConfig>) => void;
    onClose: () => void;
}> = ({ config, onUpdate, onClose }) => {
    const [localConfig, setLocalConfig] = useState(config);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setLocalConfig(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : Number(value)
        }));
    };

    const handleSave = () => {
        onUpdate(localConfig);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-40 flex justify-end" onClick={onClose}>
            <div className="w-full max-w-md bg-gray-800 h-full shadow-2xl p-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-6">Bot Configuration</h2>
                <div className="space-y-4">
                    {Object.entries(localConfig).map(([key, value]) => (
                        <div key={key}>
                            <label className="block text-sm font-medium text-gray-400 capitalize mb-1">{key.replace(/([A-Z])/g, ' $1')}</label>
                            {typeof value === 'boolean' ? (
                                 <input type="checkbox" name={key} checked={value} onChange={handleChange} className="toggle-checkbox" />
                            ) : (
                                <input type="number" name={key} value={value} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-blue focus:outline-none"/>
                            )}
                        </div>
                    ))}
                </div>
                <div className="mt-8 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-500">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-blue-700">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

const LogPanel: React.FC<{logs: string[]}> = ({logs}) => (
    <div className="bg-gray-800 rounded-lg shadow-md flex-1">
        <h2 className="text-lg font-semibold p-4 border-b border-gray-700">Bot Logs</h2>
        <div className="h-64 overflow-y-auto p-4 font-mono text-xs space-y-1">
            {logs.map((log, i) => <p key={i} className="text-gray-400">{log}</p>)}
        </div>
    </div>
);

const AnalysisModal: React.FC<{analysis: string; isLoading: boolean; onClose: () => void}> = ({analysis, isLoading, onClose}) => (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-2xl p-6 border border-gray-700" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4 flex items-center space-x-2"><SparklesIcon className="w-6 h-6 text-indigo-400"/><span>Gemini Market Analysis</span></h2>
            {isLoading ? (
                <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
                </div>
            ) : (
                <p className="text-gray-300 leading-relaxed">{analysis}</p>
            )}
            <div className="mt-6 flex justify-end">
                <button onClick={onClose} className="px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-blue-700">Close</button>
            </div>
        </div>
    </div>
);

const Dashboard: React.FC = () => {
  const { trades, logs, config, currentTime, isBotRunning, updateConfig, squareOffAll, manualSquareOff, toggleBot } = useTradingBot();
  const [showConfig, setShowConfig] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);

  const activeTrades = useMemo(() => trades.filter(t => t.status === TradeStatus.ACTIVE), [trades]);
  const closedTrades = useMemo(() => trades.filter(t => t.status !== TradeStatus.ACTIVE), [trades]);

  const totalPnl = useMemo(() => trades.reduce((sum, trade) => sum + trade.pnl, 0), [trades]);
  const activePnl = useMemo(() => activeTrades.reduce((sum, trade) => sum + trade.pnl, 0), [activeTrades]);
  const bookedPnl = useMemo(() => closedTrades.reduce((sum, trade) => sum + trade.pnl, 0), [closedTrades]);

  const handleGetAnalysis = useCallback(async () => {
    setShowAnalysis(true);
    setIsAnalysisLoading(true);
    const result = await getMarketAnalysis(trades);
    setAnalysisResult(result);
    setIsAnalysisLoading(false);
  }, [trades]);

  return (
    <div className="flex flex-col h-screen">
      <Header
        onKillSwitch={squareOffAll}
        onToggleConfig={() => setShowConfig(p => !p)}
        onGetAnalysis={handleGetAnalysis}
        isBotRunning={isBotRunning}
        onToggleBot={toggleBot}
        currentTime={currentTime}
      />
      <main className="flex-1 p-6 overflow-y-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SummaryCard title="Total P&L" value={`${totalPnl.toFixed(2)}`} color={totalPnl >= 0 ? 'text-green-500' : 'text-red-500'} />
          <SummaryCard title="Active P&L" value={`${activePnl.toFixed(2)}`} color={activePnl >= 0 ? 'text-green-500' : 'text-red-500'} />
          <SummaryCard title="Booked P&L" value={`${bookedPnl.toFixed(2)}`} color={bookedPnl >= 0 ? 'text-green-500' : 'text-red-500'} />
        </div>
        
        <div className="space-y-6">
            <PositionsTable title="Active Positions" trades={activeTrades} onSquareOff={manualSquareOff} />
            <PositionsTable title="Closed Positions" trades={closedTrades} />
        </div>
        
        <div className="grid grid-cols-1">
            <LogPanel logs={logs} />
        </div>

      </main>
      {showConfig && <ConfigPanel config={config} onUpdate={updateConfig} onClose={() => setShowConfig(false)} />}
      {showAnalysis && <AnalysisModal analysis={analysisResult} isLoading={isAnalysisLoading} onClose={() => setShowAnalysis(false)} />}
    </div>
  );
};

export default Dashboard;
