import React, { useState } from 'react';
import './App.css';

const WorkSystemModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [selectedPatternId, setSelectedPatternId] = useState(1);
  const [assignedDays, setAssignedDays] = useState({});
  const [formData, setFormData] = useState({
    name: '工場_変形1年',
    systemType: 'variable',
    unit: '1year',
    startDate: '2024-01-01',
    patterns: [
      { id: 1, name: '日勤', startTime: '08:00', endTime: '17:00', breakTime: '12:00-13:00', color: '#3b82f6' },
      { id: 2, name: '夜勤', startTime: '20:00', endTime: '05:00', breakTime: '00:00-01:00', color: '#a855f7' },
    ]
  });

  if (!isOpen) return null;

  const nextStep = () => setStep(s => Math.min(s + 1, 5));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const toggleDayAssignment = (day) => {
    setAssignedDays(prev => ({
      ...prev,
      [day]: prev[day] === selectedPatternId ? null : selectedPatternId
    }));
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {[1, 2, 3, 4, 5].map((s) => (
        <div key={s} className={`step-dot ${step >= s ? 'active' : ''} ${step === s ? 'current' : ''}`}>
          <span>{s}</span>
        </div>
      ))}
    </div>
  );

  const months = formData.unit === '1year' ? ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'] : ['1月'];

  return (
    <div className="modal-overlay">
      <div className={`modal-content glass wizard-step-${step}`}>
        <header className="modal-header">
          <div className="header-left">
            <h3>勤務形態を作成</h3>
            <span className="product-tag">WorkOn</span>
          </div>
          <button className="btn-close" onClick={onClose}>×</button>
        </header>

        {renderStepIndicator()}

        <div className="wizard-body">
          {step === 1 && (
            <div className="step-content animate-slide-in">
              <div className="form-section">
                <label className="required">勤務形態名</label>
                <input
                  type="text"
                  placeholder="例：工場_変形1年"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="form-section">
                <label className="required">労働時間制</label>
                <div className="radio-group">
                  {['固定労働時間制', 'フレックスタイム制', '裁量労働制', '変形労働時間制'].map(type => (
                    <label key={type} className="radio-label">
                      <input
                        type="radio"
                        name="systemType"
                        checked={formData.systemType === (type === '変形労働時間制' ? 'variable' : type)}
                        onChange={() => setFormData({ ...formData, systemType: type === '変形労働時間制' ? 'variable' : type })}
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="step-content animate-slide-in">
              <div className="form-section">
                <label className="required">変形の単位</label>
                <div className="radio-group horizontal">
                  <label className="radio-label">
                    <input type="radio" checked={formData.unit === '1month'} onChange={() => setFormData({ ...formData, unit: '1month' })} />
                    <span>1か月単位</span>
                  </label>
                  <label className="radio-label">
                    <input type="radio" checked={formData.unit === '1year'} onChange={() => setFormData({ ...formData, unit: '1year' })} />
                    <span>1年単位</span>
                  </label>
                </div>
              </div>
              <div className="form-section">
                <label className="required">変形労働の起算日</label>
                <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                <p className="helper-text">起算日を基準に、勤務形態専用の勤務カレンダーが生成されます</p>
              </div>
              <div className="info-card">
                <p>変形労働時間制では、勤務形態ごとに専用の勤務カレンダーを設定します。休日・労働日・労働時間は、この勤務カレンダーで一元管理されます。</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-content animate-slide-in">
              <h4>勤務パターン作成</h4>
              <p className="helper-text">カレンダーに割り当てるための勤務パターンを作成します。</p>
              <div className="pattern-list">
                {formData.patterns.map(p => (
                  <div key={p.id} className="pattern-item" style={{ borderLeft: `6px solid ${p.color}` }}>
                    <div className="pattern-info">
                      <span className="pattern-name">{p.name}</span>
                      <span className="pattern-time">{p.startTime} - {p.endTime} (休憩 {p.breakTime})</span>
                    </div>
                    <button className="btn-ghost" type="button">編集</button>
                    <button className="btn-ghost" type="button" style={{ color: '#ef4444' }}>×</button>
                  </div>
                ))}
              </div>
              <button className="btn-outline" type="button">+ 勤務パターンを追加</button>
            </div>
          )}

          {step === 4 && (
            <div className="calendar-assignment-view animate-slide-in">
              <div className="calendar-main">
                <div className="calendar-grid-container">
                  {months.map((month, mIdx) => (
                    <div key={month} className="month-block">
                      <div className="calendar-grid-header">{month}</div>
                      <div className="calendar-mock-grid">
                        {Array.from({ length: 31 }).map((_, i) => {
                          const dayKey = `${mIdx}-${i}`;
                          const assignedId = assignedDays[dayKey];
                          const pattern = formData.patterns.find(p => p.id === assignedId);
                          return (
                            <div
                              key={i}
                              className={`calendar-day ${assignedId ? 'assigned' : ''}`}
                              onClick={() => toggleDayAssignment(dayKey)}
                              style={assignedId ? { backgroundColor: pattern.color, color: 'white' } : {}}
                            >
                              <span className="day-num">{i + 1}</span>
                              {pattern && <span className="day-label">{pattern.name[0]}</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="calendar-sidebar">
                <div className="sidebar-section">
                  <h5>勤務パターンを選択</h5>
                  <div className="pattern-selector">
                    {formData.patterns.map(p => (
                      <div
                        key={p.id}
                        className={`pattern-pill-select ${selectedPatternId === p.id ? 'active' : ''}`}
                        onClick={() => setSelectedPatternId(p.id)}
                        style={{
                          borderColor: p.color,
                          backgroundColor: selectedPatternId === p.id ? p.color : 'transparent',
                          color: selectedPatternId === p.id ? 'white' : p.color
                        }}
                      >
                        {p.name}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="sidebar-section">
                  <h5>チェック結果</h5>
                  <div className="status-item ok">1日の労働時間制限: OK</div>
                  <div className={`status-item ${Object.keys(assignedDays).length > 5 ? 'ok' : 'attention'}`}>
                    連続勤務日数: {Object.keys(assignedDays).length > 5 ? 'OK' : '注意'}
                  </div>
                  <div className="status-item unconfirmed">年間労働日数: 未確認</div>
                </div>
                <div className="sidebar-info">
                  <p>カレンダーの日付をクリックしてパターンを割り当ててください。</p>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="step-content animate-slide-in">
              <h4>内容確認</h4>
              <div className="summary-list">
                <div className="summary-section">
                  <h5>基本設定</h5>
                  <div className="summary-item"><label>勤務形態名</label><span>{formData.name || '未入力'}</span></div>
                  <div className="summary-item"><label>起算日</label><span>{formData.startDate}</span></div>
                </div>
                <div className="summary-section">
                  <h5>カレンダー概要</h5>
                  <div className="summary-item"><label>変形の単位</label><span>{formData.unit === '1month' ? '1か月単位' : '1年単位'}</span></div>
                  <div className="summary-item"><label>割当済の日数</label><span>{Object.keys(assignedDays).length} 日</span></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="form-actions wizard-footer">
          {step > 1 && <button className="btn-secondary" onClick={prevStep}>戻る</button>}
          {step < 5 ? (
            <button className="btn-primary" onClick={nextStep}>
              {step === 2 ? '勤務カレンダーを作成' : '次へ'}
            </button>
          ) : (
            <button className="btn-primary" onClick={onClose}>作成する</button>
          )}
        </footer>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const menuItems = [
    { id: 'company', label: '会社情報・拠点事業所情報' },
    { id: 'employment', label: '雇用形態' },
    { id: 'org', label: '組織図' },
    { id: 'position', label: '役職' },
    { id: 'title', label: 'タイトル' },
    { id: 'grade', label: 'グレード・職務等級' },
    { id: 'eval', label: '評価区分' },
    { id: 'job', label: '職種' },
    { id: 'intro', label: '従業員紹介項目' },
    { id: 'payment', label: '支給・控除' },
    { id: 'custom', label: '従業員カスタム項目' },
    { id: 'working', label: '勤務形態', active: true },
    { id: 'cutoff', label: '締日支払形態' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>マスターデータ設定</h2>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div key={item.id} className={`nav-item ${item.active ? 'active' : ''}`}>
            <span>{item.label}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        ))}
      </nav>
    </aside>
  );
};

const WorkingArrangementList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const arrangements = [
    { name: '固定時間制', system: '固定時間', date: '2024/01/01～' },
    { name: '変形労働時間制', system: '変形労働', date: '2024/01/01～' },
    { name: 'フレックスタイム制', system: 'フレックス', date: '2024/01/01～' },
    { name: '裁量労働制', system: '裁量労働', date: '2024/01/01～' },
    { name: '専門業務型裁量労働制', system: '裁量労働', date: '2024/01/01～' },
  ];

  return (
    <div className="content-area">
      <header className="content-header">
        <h1>勤務形態</h1>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>+ 勤務形態を作成</button>
      </header>

      <WorkSystemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div className="filters">
        <div className="filter-group">
          <label>運用日</label>
          <div className="date-input">
            <input type="text" placeholder="年 / 月 / 日" />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>勤務形態名</th>
              <th>労働時間制</th>
              <th>運用日</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {arrangements.map((item, idx) => (
              <tr key={idx}>
                <td>{item.name}</td>
                <td>{item.system}</td>
                <td>{item.date}</td>
                <td className="actions">
                  <button className="btn-icon">
                    <span>•••</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination">
          <span>1-5 / 5件</span>
          <div className="page-controls">
            <button disabled>&lt;</button>
            <button disabled>&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="app-layout">
      <div className="global-nav">
        <div className="logo-box">
          <div className="logo-icon"></div>
        </div>
        <div className="nav-icons">
          <div className="icon"></div>
          <div className="icon"></div>
          <div className="icon"></div>
        </div>
      </div>
      <div className="main-wrapper">
        <Sidebar />
        <WorkingArrangementList />
      </div>
    </div>
  );
}

export default App;
