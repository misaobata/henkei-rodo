import React, { useState } from 'react';
import './App.css';

const WorkSystemModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    systemType: 'fixed',
    startDate: '',
    endDate: '',
    workTimeType: 'all', // all or daily
    startTime: '09:00',
    endTime: '18:00',
    restTime: '12:00-13:00',
    patterns: [
      { id: 1, name: '日勤', startTime: '08:00', endTime: '17:00', breakTime: '12:00-13:00', color: '#3182ce' },
    ],
    assignedDays: {} // For variable type
  });

  if (!isOpen) return null;

  const steps = [
    { id: 1, title: '概要' },
    { id: 2, title: '労働時間・休憩・休日の設定' },
    { id: 3, title: '内容確認' }
  ];

  const handleNext = () => setStep(s => Math.min(s + 1, 3));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  return (
    <div className="modal-overlay">
      <div className="modal-content two-column">
        {/* Sidebar */}
        <div className="modal-sidebar">
          <h3>勤務形態を作成</h3>
          <div className="step-list">
            {steps.map(s => (
              <div key={s.id} className={`step-item ${step === s.id ? 'active' : ''} ${step > s.id ? 'complete' : ''}`}>
                <div className="step-number">{step > s.id ? '✓' : s.id}</div>
                <div className="step-label">
                  <span className="step-title">{s.title}</span>
                  {step > s.id && <span className="btn-fix">修正</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* content */}
        <div className="modal-main">
          <div className="modal-body">
            {step === 1 && (
              <div className="animate-slide-in">
                <h2 className="form-title">概要</h2>
                <div className="form-group">
                  <label className="required">勤務形態名</label>
                  <input
                    className="input-full"
                    type="text"
                    placeholder="テキストを入力"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="required">労働時間制</label>
                  <select
                    className="input-full"
                    value={formData.systemType}
                    onChange={e => setFormData({ ...formData, systemType: e.target.value })}
                  >
                    <option value="fixed">固定時間制</option>
                    <option value="variable">変形労働時間制</option>
                    <option value="flex">フレックスタイム制</option>
                    <option value="discretionary">裁量労働制</option>
                  </select>
                </div>
                <div className="form-group">
                  <div className="date-row">
                    <div className="date-field">
                      <label className="required">運用開始日</label>
                      <input
                        type="date"
                        className="input-full"
                        value={formData.startDate}
                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                      />
                    </div>
                    <div className="date-field">
                      <label>運用終了日</label>
                      <input
                        type="date"
                        className="input-full"
                        value={formData.endDate}
                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-slide-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <h2 className="form-title">労働時間・休憩・休日の設定</h2>

                <div className="section-summary">
                  <div className="summary-grid">
                    <span className="summary-label">勤務形態名</span>
                    <span className="summary-value">{formData.name || '未入力'}</span>
                    <span className="summary-label">労働時間制</span>
                    <span className="summary-value">
                      {formData.systemType === 'fixed' ? '固定時間制' :
                        formData.systemType === 'variable' ? '変形労働時間制' :
                          formData.systemType === 'flex' ? 'フレックスタイム制' : '裁量労働制'}
                    </span>
                  </div>
                </div>

                <div style={{ overflowY: 'auto', flex: 1 }}>
                  <div className="settings-section">
                    <h4>労働時間と休憩時間</h4>
                    <div className="form-group">
                      <label>設定の単位</label>
                      <div className="radio-list">
                        <label className="radio-item">
                          <input
                            type="radio"
                            checked={formData.workTimeType === 'all'}
                            onChange={() => setFormData({ ...formData, workTimeType: 'all' })}
                          />
                          <span>すべての曜日に同一に設定</span>
                        </label>
                        <label className="radio-item">
                          <input
                            type="radio"
                            checked={formData.workTimeType === 'daily'}
                            onChange={() => setFormData({ ...formData, workTimeType: 'daily' })}
                          />
                          <span>曜日別に設定</span>
                        </label>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="required">就業時間</label>
                      <div className="time-input-group">
                        <input type="text" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} />
                        <span>-</span>
                        <input type="text" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} />
                      </div>
                    </div>
                  </div>

                  <div className="settings-section">
                    <h4>休日・勤務カレンダー設定</h4>
                    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <p style={{ fontSize: '13px', marginBottom: '1rem', color: '#4a5568' }}>
                        {formData.systemType === 'variable' ?
                          '※変形労働時間制では、各日に勤務パターンの割り当てが必要です。' :
                          '※会社カレンダー以外の休日を設定する場合は、カレンダーから選択してください。'}
                      </p>

                      {/* Simplified Calendar Integration (Example for Fixed/Flex/Discretionary) */}
                      <div className="calendar-grid-header" style={{ fontSize: '14px', marginBottom: '0.5rem' }}>2024年1月</div>
                      <div className="calendar-mock-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                        {Array.from({ length: 31 }).map((_, i) => (
                          <div
                            key={i}
                            className="calendar-day"
                            onClick={() => {
                              const key = `1-${i + 1}`;
                              setFormData(prev => ({
                                ...prev,
                                assignedDays: { ...prev.assignedDays, [key]: !prev.assignedDays[key] }
                              }));
                            }}
                            style={{
                              aspectRatio: '1',
                              border: '1px solid #e2e8f0',
                              fontSize: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              backgroundColor: formData.assignedDays[`1-${i + 1}`] ? (formData.systemType === 'variable' ? '#3182ce' : '#e53e3e') : 'white',
                              color: formData.assignedDays[`1-${i + 1}`] ? 'white' : 'inherit'
                            }}
                          >
                            {i + 1}
                          </div>
                        ))}
                      </div>
                      <p style={{ fontSize: '11px', color: '#718096', marginTop: '0.5rem' }}>
                        {formData.systemType === 'variable' ? '青: 出勤日' : '赤: 設定休日'} として反映されます。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-slide-in">
                <h2 className="form-title">内容確認</h2>
                <div className="section-summary">
                  <h4 style={{ marginBottom: '1rem' }}>概要</h4>
                  <div className="summary-grid">
                    <span className="summary-label">勤務形態名</span>
                    <span className="summary-value">{formData.name || '未入力'}</span>
                    <span className="summary-label">労働時間制</span>
                    <span className="summary-value">
                      {formData.systemType === 'fixed' ? '固定時間制' :
                        formData.systemType === 'variable' ? '変形労働時間制' :
                          formData.systemType === 'flex' ? 'フレックスタイム制' : '裁量労働制'}
                    </span>
                    <span className="summary-label">運用日</span>
                    <span className="summary-value">{formData.startDate} ～ {formData.endDate}</span>
                  </div>
                </div>

                <div className="section-summary" style={{ marginTop: '2rem' }}>
                  <h4 style={{ marginBottom: '1rem' }}>労働時間・休憩・休日</h4>
                  <div className="summary-grid">
                    <span className="summary-label">就業時間</span>
                    <span className="summary-value">{formData.startTime} - {formData.endTime}</span>
                    <span className="summary-label">割当済の日数</span>
                    <span className="summary-value">{Object.keys(formData.assignedDays).length} 日</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button className="btn-secondary" onClick={onClose}>キャンセル</button>
            <div style={{ flex: 1 }}></div>
            {step > 1 && <button className="btn-secondary" onClick={handleBack}>戻る</button>}
            <button className="btn-primary" onClick={step === 3 ? onClose : handleNext}>
              {step === 3 ? '完了' : '次へ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const menuItems = [
    { id: 'working', label: '勤務形態', active: true },
    { id: 'employment', label: '雇用形態' },
    { id: 'org', label: '組織図' },
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
  ];

  return (
    <div className="content-area">
      <header className="content-header">
        <h1>勤務形態</h1>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>+ 勤務形態を作成</button>
      </header>

      <WorkSystemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>勤務形態名</th>
              <th>労働時間制</th>
              <th>運用日</th>
            </tr>
          </thead>
          <tbody>
            {arrangements.map((item, idx) => (
              <tr key={idx}>
                <td>{item.name}</td>
                <td>{item.system}</td>
                <td>{item.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="app-layout">
      <div className="global-nav">
        <div className="logo-icon"></div>
      </div>
      <div className="main-wrapper">
        <Sidebar />
        <WorkingArrangementList />
      </div>
    </div>
  );
}

export default App;
