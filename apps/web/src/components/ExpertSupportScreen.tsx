import React, { useState } from 'react';
import { Language, ScreenType } from '../types';
import { FARMING_TIPS } from '../data/mockData';

interface ExpertSupportScreenProps {
  lang: Language;
  onNavigate: (screen: ScreenType) => void;
  onShowToast: (msg: string) => void;
}

export const ExpertSupportScreen: React.FC<ExpertSupportScreenProps> = ({
  lang,
  onNavigate: _onNavigate,
  onShowToast,
}) => {
  const isTe = lang === 'te';
  const [activeModal, setActiveModal] = useState<'chat' | 'call' | 'question' | 'tips' | null>(null);
  
  // Chat state
  const [chatInput, setChatInput] = useState<string>('');
  const [chatLog, setChatLog] = useState<{ sender: 'farmer' | 'expert'; text: string; time: string }[]>([
    {
      sender: 'expert',
      text: isTe
        ? 'నమస్కారం! నేను డా. ఎం.ఎస్. రావు, సీనియర్ అగ్రోనమిస్ట్. మీ పంట సమస్య ఏమిటి?'
        : 'Namaskaram! I am Dr. M.S. Rao, Senior Agronomist at Akanksha Agree Tech Hub. How can I assist your crop today?',
      time: 'Just now',
    },
  ]);

  // Ask Question form state
  const [questionCrop, setQuestionCrop] = useState<string>('Paddy (వరిధాన్యం)');
  const [questionText, setQuestionText] = useState<string>('');

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatLog(prev => [...prev, { sender: 'farmer', text: msg, time: 'Just now' }]);
    setChatInput('');

    setTimeout(() => {
      let reply = isTe
        ? 'మీ సమస్య పరిశీలించబడింది. వరి పిలకల దశలో ఉన్నట్లయితే మోనోక్రోటోఫాస్ లేదా క్లోరాంట్రానిలిప్రోల్ పిచికారీ చేయండి.'
        : 'Recommended Treatment: Apply 50ml Flubendiamide per acre mixed with 200L water during early morning.';
      if (msg.toLowerCase().includes('drip') || msg.toLowerCase().includes('నీరు')) {
        reply = isTe
          ? 'డ్రిప్ లాటరల్స్ ప్రెషర్ 1.2 kg/cm² వద్ద నిర్వహించండి. నెలకు ఒకసారి ఆసిడ్ ట్రీట్మెంట్ చేయండి.'
          : 'For drip irrigation clogging, flush submain valves and perform 0.5% hydrochloric acid flushing.';
      }
      setChatLog(prev => [...prev, { sender: 'expert', text: reply, time: 'Just now' }]);
    }, 1000);
  };

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    setActiveModal(null);
    setQuestionText('');
    onShowToast(isTe ? 'మీ ప్రశ్న అగ్రోనమిస్ట్‌కు పంపబడింది! 2 గంటల్లో SMS ద్వారా సమాధానం అందుతుంది.' : 'Question sent to Agronomist team! Expert reply will arrive in 2 hours.');
  };

  return (
    <div className="screen-content support-screen">
      {/* Visual Header Banner (Image 1 Frame 8) */}
      <div className="category-hero-card support-hero">
        <div className="category-hero-text">
          <span className="hero-tag-badge">24x7 Certified Agronomists</span>
          <h2>{isTe ? 'వ్యవసాయ నిపుణులతో మాట్లాడండి' : 'Talk to Our Farming Experts'}</h2>
          <p>{isTe ? 'అధిక దిగుబడులు మరియు సమగ్ర సస్యరక్షణ కోసం ఉచిత సలహాలు' : 'Get Expert Advice for Better Farming, Pest Management & High Yields'}</p>
        </div>
        <div className="category-hero-icon">👨‍🔬🌾</div>
      </div>

      {/* 4 Interactive Option Cards (Image 1 Frame 8) */}
      <div className="support-menu-list">
        {/* 1. Chat with Expert */}
        <div
          className="support-action-card"
          onClick={() => setActiveModal('chat')}
        >
          <div className="support-card-left">
            <span className="support-card-icon chat-icon">💬</span>
            <div className="support-card-text">
              <h4 className="support-item-title">{isTe ? 'నిపుణులతో చాట్ చేయండి' : 'Chat with Expert'}</h4>
              <p className="support-item-sub">{isTe ? 'తక్షణ ఆన్‌లైన్ సమాధానాలు పొందండి' : 'Get instant answers to crop diseases'}</p>
            </div>
          </div>
          <span className="support-arrow-indicator">›</span>
        </div>

        {/* 2. Call an Expert */}
        <div
          className="support-action-card"
          onClick={() => setActiveModal('call')}
        >
          <div className="support-card-left">
            <span className="support-card-icon call-icon">📞</span>
            <div className="support-card-text">
              <h4 className="support-item-title">{isTe ? 'నిపుణుడికి కాల్ చేయండి' : 'Call an Expert'}</h4>
              <p className="support-item-sub">{isTe ? 'మా వ్యవసాయ నిపుణుడితో ప్రత్యక్షంగా మాట్లాడండి' : 'Talk directly to our agricultural specialist'}</p>
            </div>
          </div>
          <span className="support-arrow-indicator">›</span>
        </div>

        {/* 3. Ask a Question */}
        <div
          className="support-action-card"
          onClick={() => setActiveModal('question')}
        >
          <div className="support-card-left">
            <span className="support-card-icon ask-icon">❓</span>
            <div className="support-card-text">
              <h4 className="support-item-title">{isTe ? 'ప్రశ్న అడగండి' : 'Ask a Question'}</h4>
              <p className="support-item-sub">{isTe ? 'మీ పొలం ఫోటో పెట్టి పరిష్కారం పొందండి' : 'Submit photo query for diagnosis'}</p>
            </div>
          </div>
          <span className="support-arrow-indicator">›</span>
        </div>

        {/* 4. Farming Tips */}
        <div
          className="support-action-card"
          onClick={() => setActiveModal('tips')}
        >
          <div className="support-card-left">
            <span className="support-card-icon tips-icon">💡</span>
            <div className="support-card-text">
              <h4 className="support-item-title">{isTe ? 'వ్యవసాయ సూచనలు & వార్తలు' : 'Farming Tips'}</h4>
              <p className="support-item-sub">{isTe ? 'తాజా సూచనలు మరియు విపణి ధరలు' : 'Latest agronomy advisory & mandi rates'}</p>
            </div>
          </div>
          <span className="support-arrow-indicator">›</span>
        </div>
      </div>

      {/* Chat Modal */}
      {activeModal === 'chat' && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal-dialog chat-dialog expert-chat-dialog" onClick={e => e.stopPropagation()}>
            <div className="chat-modal-header">
              <div className="chat-driver-info">
                <strong>👨‍🔬 Dr. M.S. Rao (Senior Agronomist)</strong>
                <span className="online-tag">● Live Advisory</span>
              </div>
              <button type="button" className="close-btn" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div className="chat-messages-container">
              {chatLog.map((m, idx) => (
                <div key={idx} className={`chat-bubble ${m.sender}`}>
                  <p>{m.text}</p>
                  <span className="chat-time">{m.time}</span>
                </div>
              ))}
            </div>
            <div className="chat-input-bar">
              <input
                type="text"
                placeholder={isTe ? 'మీ ప్రశ్నను టైప్ చేయండి (ఉదా: వరిలో ఆకుమచ్చ)...' : 'Ask anything (e.g. paddy leaf blast treatment)...'}
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendChat()}
              />
              <button type="button" className="send-chat-btn" onClick={handleSendChat}>➤</button>
            </div>
          </div>
        </div>
      )}

      {/* Call Simulator Modal */}
      {activeModal === 'call' && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal-dialog call-dialog" onClick={e => e.stopPropagation()}>
            <div className="call-avatar-circle">👨‍🔬</div>
            <h3>{isTe ? 'కిసాన్ వ్యవసాయ సహాయ కేంద్రం' : 'Toll-Free Kisan Agri Helpline'}</h3>
            <p className="calling-status">1800-180-1551 (Connecting to Hub...)</p>
            <div className="call-animation-waves">
              <span /><span /><span />
            </div>
            <div className="call-features-list">
              <span>✓ Telugu & English Support</span>
              <span>✓ Certified Agronomists Available</span>
            </div>
            <button
              type="button"
              className="end-call-btn"
              onClick={() => setActiveModal(null)}
            >
              End Call ❌
            </button>
          </div>
        </div>
      )}

      {/* Ask Question Form Modal */}
      {activeModal === 'question' && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{isTe ? 'నిపుణుడిని ప్రశ్న అడగండి' : 'Ask a Question to Agronomist'}</h3>
              <button type="button" className="close-btn" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <form onSubmit={handleQuestionSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>{isTe ? 'పంట రకం' : 'Target Crop'}</label>
                  <select value={questionCrop} onChange={e => setQuestionCrop(e.target.value)}>
                    <option value="Paddy (వరిధాన్యం)">Paddy (వరిధాన్యం)</option>
                    <option value="Cotton (పత్తి)">Cotton (పత్తి)</option>
                    <option value="Chilli (మిర్చి)">Chilli (మిర్చి)</option>
                    <option value="Maize (మొక్కజొన్న)">Maize (మొక్కజొన్న)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>{isTe ? 'సమస్య వివరణ' : 'Describe Problem / Symptoms'}</label>
                  <textarea
                    rows={3}
                    placeholder={isTe ? 'లక్షణాలు, ఆకుల రంగు, పురుగు రకం వివరించండి...' : 'Describe pest symptoms, leaf discoloration, soil status...'}
                    value={questionText}
                    onChange={e => setQuestionText(e.target.value)}
                    required
                  />
                </div>
                <div className="photo-upload-mock">
                  <span>📷 {isTe ? 'పొలం ఫోటో జోడించండి (ఐచ్ఛికం)' : 'Attach Field Photo (Optional)'}</span>
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn-primary-action">
                  {isTe ? 'ప్రశ్న సమర్పించండి' : 'Submit Query'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Farming Tips Modal */}
      {activeModal === 'tips' && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{isTe ? 'తాజా వ్యవసాయ సూచనలు' : 'Expert Agronomy Advisory'}</h3>
              <button type="button" className="close-btn" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="tips-cards-col">
                {FARMING_TIPS.map(tip => (
                  <div key={tip.id} className="farming-tip-card">
                    <span className="tip-glyph">{tip.icon}</span>
                    <div className="tip-info">
                      <h4>{isTe ? tip.titleTe : tip.title}</h4>
                      <p>{isTe ? tip.summaryTe : tip.summary}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-primary-action"
                onClick={() => setActiveModal(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
