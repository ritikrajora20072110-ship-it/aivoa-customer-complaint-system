import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  startExtraction,
  updateProgress,
  finishExtraction,
  setExtractionError,
  addMessage,
  setChatLoading
} from '../store/copilotSlice';
import { populateFromAi } from '../store/complaintSlice';
import {
  UploadCloud,
  FileText,
  Send,
  Paperclip,
  Bot,
  User,
  Sparkles,
  Info,
  CheckCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { safeFetchJson } from '../utils/api';
import { parseFieldUpdateIntent } from '../utils/fieldParser';

export default function AICopilot() {
  const dispatch = useDispatch();
  const form = useSelector((state) => state.complaint);
  const {
    messages,
    isExtracting,
    extractionProgress,
    currentStatusText,
    isChatLoading,
    workflowSteps
  } = useSelector((state) => state.copilot);

  const [chatInput, setChatInput] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteContent, setPasteContent] = useState('');
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    dispatch(startExtraction());
    dispatch(addMessage({
      sender: 'user',
      text: `Uploaded file: **${file.name}** (${(file.size / 1024).toFixed(1)} KB). Please process and extract the complaint details.`
    }));

    // Simulated step progression for LangGraph visual feedback
    const timer1 = setTimeout(() => {
      dispatch(updateProgress({ progress: 35, statusText: 'Normalizing document and executing LangGraph Entity Extraction Agent...' }));
    }, 400);

    const timer2 = setTimeout(() => {
      dispatch(updateProgress({ progress: 70, statusText: 'Evaluating ICH Q9 Patient Risk & Formulating CAPA Plan...' }));
    }, 900);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const data = await safeFetchJson('/api/agent/extract', {
        method: 'POST',
        body: formData
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      dispatch(finishExtraction({ steps: data.workflow_steps }));
      dispatch(populateFromAi(data));

      dispatch(addMessage({
        sender: 'bot',
        text: data.copilot_message || 'Complaint details extracted successfully.',
        suggestions: [
          'What is the patient safety impact?',
          'Show recommended CAPA actions',
          'Check duplicate batch history',
          'Evaluate complaint completeness'
        ]
      }));

    } catch (err) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      dispatch(setExtractionError(err.message));
      dispatch(addMessage({
        sender: 'bot',
        text: `Extraction error: ${err.message}. You can also paste the raw complaint text directly.`
      }));
    } finally {
      setTimeout(scrollToBottom, 100);
    }
  };

  const handleTextExtract = async (textToExtract) => {
    if (!textToExtract.trim()) return;

    dispatch(startExtraction());
    dispatch(addMessage({
      sender: 'user',
      text: `Submitted complaint text for extraction:\n\n> "${textToExtract.slice(0, 150)}..."`
    }));

    setShowPasteModal(false);
    setPasteContent('');

    const timer1 = setTimeout(() => {
      dispatch(updateProgress({ progress: 40, statusText: 'Executing LangGraph QMS Entity Extraction...' }));
    }, 400);

    const timer2 = setTimeout(() => {
      dispatch(updateProgress({ progress: 75, statusText: 'Classifying ICH Q9 Defect Severity & Formulating RCA...' }));
    }, 900);

    try {
      const formData = new FormData();
      formData.append('text', textToExtract);

      const data = await safeFetchJson('/api/agent/extract', {
        method: 'POST',
        body: formData
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      dispatch(finishExtraction({ steps: data.workflow_steps }));
      dispatch(populateFromAi(data));

      dispatch(addMessage({
        sender: 'bot',
        text: data.copilot_message,
        suggestions: [
          'What is the patient safety impact?',
          'Recommend immediate quarantine actions',
          'Show 5-Whys Root Cause Analysis',
          'Review FDA 21 CFR compliance'
        ]
      }));

    } catch (err) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      dispatch(setExtractionError(err.message));
      dispatch(addMessage({
        sender: 'bot',
        text: `Extraction error: ${err.message}`
      }));
    } finally {
      setTimeout(scrollToBottom, 100);
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const query = chatInput.trim();
    if (!query || isChatLoading) return;

    setChatInput('');
    dispatch(addMessage({ sender: 'user', text: query }));
    dispatch(setChatLoading(true));
    setTimeout(scrollToBottom, 50);

    // 1. Instant client-side optimistic field update (0ms latency)
    const localUpdates = parseFieldUpdateIntent(query);
    if (localUpdates && typeof localUpdates === 'object') {
      Object.entries(localUpdates).forEach(([field, value]) => {
        dispatch(setField({ field, value }));
      });
    }

    try {
      const data = await safeFetchJson('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          complaint_context: form,
          chat_history: messages.map(m => ({ sender: m.sender, text: m.text }))
        })
      });

      // Apply any additional server-side conversational field updates
      const finalUpdates = data.updated_fields || localUpdates;
      if (finalUpdates && typeof finalUpdates === 'object') {
        Object.entries(finalUpdates).forEach(([field, value]) => {
          dispatch(setField({ field, value }));
        });
      }

      dispatch(addMessage({
        sender: 'bot',
        text: data.reply || (localUpdates ? `✅ **Field Updated**: Updated complaint form directly with requested changes.` : 'Acknowledged.'),
        suggestions: data.suggested_actions || ['Commit to QMS Ledger', 'What is the patient health risk under ICH Q9?'],
        updated_fields: finalUpdates
      }));
    } catch (err) {
      console.warn('Backend chat response error:', err);
      if (localUpdates) {
        // If field was already updated locally, confirm it gracefully even if backend network lagged
        dispatch(addMessage({
          sender: 'bot',
          text: `✅ **Field Updated**: Changed **${Object.keys(localUpdates).join(', ')}** in the form.\n\n*(Form field is synchronized. You can commit to QMS Ledger.)*`,
          updated_fields: localUpdates,
          suggestions: ['Commit to QMS Ledger', 'What is the patient health risk under ICH Q9?']
        }));
      } else {
        dispatch(addMessage({
          sender: 'bot',
          text: `Server communication notice: ${err.message || 'Unable to connect to backend on port 8000'}. Please ensure the server is active.`
        }));
      }
    } finally {
      dispatch(setChatLoading(false));
      setTimeout(scrollToBottom, 50);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.startsWith('Load ')) {
      if (suggestion.includes('Amoxicillin')) {
        handleTextExtract(`ATTN: Quality Assurance Department
From: Dr. Sarah Jenkins, St. Jude Regional Hospital
Product: Amoxicillin Trihydrate Capsules 500mg (FDF)
Strength: 500mg Oral Capsule (USP Grade)
Batch: AMX-2024-089A
Mfg Date: 2024-03-15 | Expiry Date: 2026-03-14
Originating Site Block: Sterile FDF Formulation Block C
Quantity Affected: 2,500 units
Impacted NPM: PVC/PVDC Blister foil backing
Defect: Yellow-brown capsule discoloration and mottled speckling observed on capsule shells with micro-pinhole sealing seam defects. Initial Severity: Major, Priority: High.`);
      } else if (suggestion.includes('Metformin')) {
        handleTextExtract(`CUSTOMER COMPLAINT / RAW MATERIAL REJECTION NOTICE
Customer: Apex BioPharma Finished Dosage Manufacturing Ltd.
Product: Metformin Hydrochloride API (Active Pharmaceutical Ingredient)
Strength: Bulk Pharmaceutical Grade (USP/Ph.Eur)
Batch: MET-API-9921 | Mfg Date: 2024-01-10 | Expiry Date: 2028-01-09
Site Block: API Chemical Synthesis Block 2
Quantity: 120 kg (3 HDPE Drums)
Impacted NPM: Double Polyethylene Drum Liners
Defect: Black metallic particulate contaminants (>0.5 mm) embedded within crystalline API powder during incoming sifter verification. Initial Severity: Critical, Priority: Urgent.`);
      } else if (suggestion.includes('Atorvastatin')) {
        handleTextExtract(`PHARMACEUTICAL PACKAGING DEFECT LOG
Customer: Medix Central Healthcare Logistics Corp.
Product: Atorvastatin Calcium 20mg Film-Coated Tablets
Batch: ATV-FDF-4402 | Mfg Date: 2024-05-18 | Expiry Date: 2027-05-17
Originating Site: Secondary Packaging Block D
Quantity Affected: 450 units
Defect: Thermal inkjet lot number and expiration date severely smudged and illegible on outer folding cartons. Initial Severity: Minor, Priority: Medium.`);
      } else if (suggestion.includes('Ciprofloxacin')) {
        handleTextExtract(`CRITICAL STERILITY DEFECT ADVISORY
Customer: Great Lakes Regional Trauma Center (Pharmacy Operations)
Product: Ciprofloxacin Injection 200mg/100mL (Sterile FDF)
Batch: CIP-INJ-2024-1102 | Mfg Date: 2024-04-10 | Expiry Date: 2026-04-09
Site Block: Aseptic Fill-Finish Block A (Cleanroom ISO 5)
Quantity Affected: 850 vials
Impacted NPM: Type I Borosilicate Glass Vial & Chlorobutyl Stopper
Defect: Hairline fractures along vial neck beneath aluminum flip-off crimp seal with confirmed solution seepage and breach of container-closure integrity. Initial Severity: Critical, Priority: Urgent.`);
      }
    } else {
      setChatInput(suggestion);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full min-h-[750px] transition-all">
      
      {/* Header matching Reference UI & Demo Video */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900">AI Complaint Intake Assistant</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-200">
                BETA
              </span>
            </div>
            <p className="text-xs text-slate-500">Drop complaint files or paste text below</p>
          </div>
        </div>
      </div>

      {/* INTAKE ACTIONS: Drag & Drop + Paste Button */}
      <div className="p-5 border-b border-slate-100 space-y-3 bg-slate-50/40">
        
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFileUpload(e.target.files?.[0])}
          accept=".pdf,.docx,.txt,.eml"
          className="hidden"
        />

        {/* Drag & Drop Box */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files?.[0]) {
              handleFileUpload(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center ${
            isDragOver
              ? 'border-blue-500 bg-blue-50/50'
              : 'border-slate-300 hover:border-blue-400 bg-white'
          }`}
        >
          <UploadCloud className="w-8 h-8 text-blue-500 mb-2" />
          <p className="text-xs font-semibold text-slate-700">
            Drag & drop complaint document here
          </p>
          <p className="text-[11px] text-blue-600 font-medium hover:underline mt-0.5">
            or click to browse
          </p>
        </div>

        {/* OR Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full"></div>
          <span className="bg-slate-50 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest absolute">
            OR
          </span>
        </div>

        {/* Paste Complaint Text / Email Button */}
        <button
          type="button"
          onClick={() => setShowPasteModal(true)}
          className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center space-x-2 transition shadow-2xs"
        >
          <FileText className="w-3.5 h-3.5 text-slate-500" />
          <span>Paste Complaint Text / Email</span>
        </button>

        {/* Supported Formats Callout Banner */}
        <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70 text-emerald-800 text-[11px]">
          <Info className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Supported formats: PDF, DOCX, TXT, EML • Max file size: 10MB</span>
        </div>

        {/* EXTRACTION PROGRESS SECTION */}
        {(isExtracting || extractionProgress > 0) && (
          <div className="pt-2 border-t border-slate-200/60">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              <span>Extraction Progress</span>
              <span className="text-blue-600">{extractionProgress}%</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 rounded-full"
                style={{ width: `${extractionProgress}%` }}
              ></div>
            </div>

            <p className="text-xs text-slate-600 mt-2 font-medium flex items-center space-x-1.5">
              {isExtracting && <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin flex-shrink-0" />}
              <span>{currentStatusText}</span>
            </p>
          </div>
        )}

      </div>

      {/* AI ASSISTANT CHAT FEED */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          AI Assistant
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-2.5 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
          >
            {/* Avatar */}
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-indigo-100 text-indigo-700'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-indigo-50/70 border border-indigo-100 text-slate-800'
              }`}
            >
              <div className="whitespace-pre-line">{msg.text}</div>
              
              {/* Field update confirmation badge */}
              {msg.updated_fields && (
                <div className="mt-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] flex items-center space-x-1.5 font-semibold">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Form updated: {Object.keys(msg.updated_fields).map(k => k.replace(/_/g, ' ')).join(', ')}</span>
                </div>
              )}

              <div className={`text-[10px] mt-1.5 text-right ${msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                {msg.timestamp}
              </div>

              {/* Suggestions / Prompt Chips */}
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-indigo-200/50 flex flex-wrap gap-1.5">
                  {msg.suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSuggestionClick(s)}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-100/70 border border-indigo-200 text-[11px] font-semibold text-indigo-700 transition active:scale-95 text-left"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isChatLoading && (
          <div className="flex items-center space-x-2 text-xs text-slate-400 italic">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
            <span>AIVOA Copilot is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* CHAT INPUT AREA */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <form onSubmit={handleSendMessage} className="relative flex items-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach Complaint Document"
            className="absolute left-3 text-slate-400 hover:text-slate-600 transition"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask me anything about this complaint..."
            className="w-full text-xs pl-9 pr-12 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition bg-slate-50/50 hover:bg-white"
          />

          <button
            type="submit"
            disabled={!chatInput.trim() || isChatLoading}
            className="absolute right-2 w-7 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white flex items-center justify-center transition active:scale-95 shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-400">
          <span className="font-semibold uppercase tracking-wider text-slate-400">Powered by LangGraph</span>
          <span>AI responses may contain errors. Please verify information.</span>
        </div>
      </div>

      {/* PASTE COMPLAINT MODAL */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Paste Complaint Text or Email</h3>
              </div>
              <button
                onClick={() => setShowPasteModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Paste the raw text of a customer complaint email, phone transcription, or QA defect notice.
              LangGraph will automatically extract all fields and populate the form.
            </p>

            <textarea
              rows={8}
              value={pasteContent}
              onChange={(e) => setPasteContent(e.target.value)}
              placeholder="Paste raw email or complaint memo here..."
              className="w-full text-xs p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition font-mono"
            />

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleTextExtract(pasteContent)}
                disabled={!pasteContent.trim()}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-blue-500/20"
              >
                Process with LangGraph
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
