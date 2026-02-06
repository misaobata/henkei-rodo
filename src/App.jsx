import React, { useState } from 'react';
import './App.css';

const WorkSystemModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [selectedPatternId, setSelectedPatternId] = useState(1);
  const [assignedDays, setAssignedDays] = useState({});
  const [editingPattern, setEditingPattern] = useState(null);

  const [formData, setFormData] = useState({
    name: '工場_変形1年',
    systemType: 'variable',
    unit: '1year',
    startDate: '2024-01-01',
    fixedStartTime: '09:00',
    fixedEndTime: '18:00',
    fixedBreakTime: '12:00-13:00',
    patterns: [
      { id: 1, name: '日勤', startTime: '08:00', endTime: '17:00', breakTime: '12:00-13:00', color: '#1a365d' },
      { id: 2, name: '夜勤', startTime: '20:00', endTime: '05:00', breakTime: '00:00-01:00', color: '#7c3aed' },
    ]
  });

  if (!isOpen) return null;

  // Define steps dynamically based on system type
  const steps = formData.systemType === 'variable'
    ? [
      { id: 1, title: '基本情報' },
      { id: 2, title: '期間設定' },
      { id: 3, title: '勤務パターン作成' },
      { id: 4, title: 'カレンダー割当' },
      { id: 5, title: '内容確認' }
    ]
    : [
      { id: 1, title: '基本情報' },
      { id: 2, title: '勤務設定' },
      { id: 3, title: 'カレンダー設定' },
      { id: 4, title: '内容確認' }
    ];

  const currentStepData = steps.find(s => s.id === (formData.systemType === 'variable' ? step : (step > 2 ? step - 1 : step)));
  // Mapping logic for non-variable steps to avoid state complexity
  const displayStep = step;

  const handleNext = () => setStep(s => Math.min(s + 1, formData.systemType === 'variable' ? 5 : 4));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const toggleDayAssignment = (day) => {
    setAssignedDays(prev => ({
      ...prev,
      [day]: prev[day] === selectedPatternId ? null : selectedPatternId
    }));
  };

  const handleEditPattern = (pattern) => {
    setEditingPattern({ ...pattern });
  };

  const handleSavePattern = () => {
    if (editingPattern.id) {
      setFormData({
        ...formData,
        patterns: formData.patterns.map(p => p.id === editingPattern.id ? editingPattern : p)
      });
    } else {
      const newId = Math.max(0, ...formData.patterns.map(p => p.id)) + 1;
      setFormData({
        ...formData,
        patterns: [...formData.patterns, { ...editingPattern, id: newId }]
      });
    }
    setEditingPattern(null);
  };

  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

  return (
    <div className="modal-overlay">
      <div className={`modal-content two-column wizard-step-${step}`}>
        {/* Sidebar */}
        <div className="modal-sidebar">
          <h3>勤務形態を作成</h3>
          <div className="step-list">
            {steps.map((s, idx) => (
              <div key={s.id} className={`step-item ${step === idx + 1 ? 'active' : ''} ${step > idx + 1 ? 'complete' : ''}`}>
                <div className="step-number">{step > idx + 1 ? '✓' : idx + 1}</div>
                <div className="step-label">
                  <span className="step-title">{s.title}</span>
                  {step > idx + 1 && <span className="btn-fix">修正</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="modal-main">
          <div className="modal-body">
            {step === 1 && (
              <div className="animate-slide-in">
                <h2 className="form-title">基本情報</h2>
                <div className="form-group">
                  <label className="required">勤務形態名</label>
                  <input
                    className="input-full"
                    type="text"
                    placeholder="例：工場_変形1年"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="required">労働時間制</label>
                  <select
                    className="input-full"
                    value={formData.systemType}
                    onChange={e => {
                      setFormData({ ...formData, systemType: e.target.value });
                      setStep(1); // Reset step if type changes to keep layout consistent
                    }}
                  >
                    <option value="variable">変形労働時間制</option>
                    <option value="fixed">固定時間制</option>
                  </select>
                </div>
              </div>
            )}

            {/* Variable Flow: Step 2, 3, 4, 5 */}
            {formData.systemType === 'variable' && (
              <>
                {step === 2 && (
                  <div className="animate-slide-in">
                    <h2 className="form-title">期間設定</h2>
                    <div className="form-group">
                      <label className="required">変形の単位</label>
                      <div className="radio-list horizontal">
                        <label className="radio-item">
                          <input type="radio" checked={formData.unit === '1month'} onChange={() => setFormData({ ...formData, unit: '1month' })} />
                          <span>1か月単位</span>
                        </label>
                        <label className="radio-item">
                          <input type="radio" checked={formData.unit === '1year'} onChange={() => setFormData({ ...formData, unit: '1year' })} />
                          <span>1年単位</span>
                        </label>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="required">変形労働の起算日</label>
                      <input type="date" className="input-full" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="animate-slide-in">
                    <h2 className="form-title">勤務パターン作成</h2>
                    {editingPattern ? (
                      <div className="pattern-edit-form">
                        <div className="form-group">
                          <label>パターン名</label>
                          <input type="text" value={editingPattern.name} onChange={e => setEditingPattern({ ...editingPattern, name: e.target.value })} />
                        </div>
                        <div className="date-row">
                          <div className="form-group">
                            <label>開始時間</label>
                            <input type="text" value={editingPattern.startTime} onChange={e => setEditingPattern({ ...editingPattern, startTime: e.target.value })} />
                          </div>
                          <div className="form-group">
                            <label>終了時間</label>
                            <input type="text" value={editingPattern.endTime} onChange={e => setEditingPattern({ ...editingPattern, endTime: e.target.value })} />
                          </div>
                        </div>
                        <div className="form-group">
                          <label>カラー</label>
                          <div className="color-selector">
                            {['#1a365d', '#7c3aed', '#059669', '#d97706', '#dc2626'].map(c => (
                              <div
                                key={c}
                                className={`color-box ${editingPattern.color === c ? 'active' : ''}`}
                                style={{ backgroundColor: c }}
                                onClick={() => setEditingPattern({ ...editingPattern, color: c })}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="edit-actions">
                          <button className="btn-secondary" onClick={() => setEditingPattern(null)}>キャンセル</button>
                          <button className="btn-primary" onClick={handleSavePattern}>保存</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="pattern-list-compact">
                          {formData.patterns.map(p => (
                            <div key={p.id} className="pattern-item-card" style={{ borderLeft: `6px solid ${p.color}` }}>
                              <div className="pattern-card-info">
                                <span className="p-name">{p.name}</span>
                                <span className="p-time">{p.startTime} - {p.endTime}</span>
                              </div>
                              <button className="text-btn" onClick={() => handleEditPattern(p)}>編集</button>
                            </div>
                          ))}
                        </div>
                        <button className="btn-dashed-add" onClick={() => setEditingPattern({ name: '', startTime: '09:00', endTime: '18:00', breakTime: '12:00-13:00', color: '#059669' })}>
                          + 勤務パターンを追加
                        </button>
                      </>
                    )}
                  </div>
                )}

                {step === 4 && (
                  <div className="animate-slide-in calendar-mapping-v2">
                    <div className="cal-v2-main">
                      <h2 className="form-title">カレンダー割当</h2>
                      <div className="cal-v2-scroll-area">
                        {months.map((month, mIdx) => (
                          <div key={month} className="cal-v2-month-block">
                            <div className="cal-v2-month-name">{month}</div>
                            <div className="cal-v2-grid">
                              {Array.from({ length: 30 }).map((_, i) => {
                                const dayKey = `${mIdx}-${i}`;
                                const assignedId = assignedDays[dayKey];
                                const pattern = formData.patterns.find(p => p.id === assignedId);
                                return (
                                  <div
                                    key={i}
                                    className={`cal-v2-day ${assignedId ? 'assigned' : ''}`}
                                    onClick={() => toggleDayAssignment(dayKey)}
                                    style={assignedId ? { backgroundColor: pattern.color, color: 'white' } : {}}
                                  >
                                    <span className="d-num">{i + 1}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="cal-v2-sidebar">
                      <label>選択中パターン</label>
                      <div className="p-selector-v2">
                        {formData.patterns.map(p => (
                          <div
                            key={p.id}
                            className={`p-pill-v2 ${selectedPatternId === p.id ? 'active' : ''}`}
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
                  </div>
                )}

                {step === 5 && (
                  <div className="animate-slide-in">
                    <h2 className="form-title">内容確認</h2>
                    <div className="summary-section-v2">
                      <div className="s-grid-v2">
                        <span>形態名</span><span className="val">{formData.name}</span>
                        <span>労働時間制</span><span className="val">変形労働時間制</span>
                        <span>設定日数</span><span className="val">{Object.keys(assignedDays).length} 日</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Fixed Flow: Step 2, 3, 4 */}
            {formData.systemType === 'fixed' && (
              <>
                {step === 2 && (
                  <div className="animate-slide-in">
                    <h2 className="form-title">勤務設定</h2>
                    <div className="form-group">
                      <label>標準の就業時間</label>
                      <div className="date-row">
                        <input type="text" value={formData.fixedStartTime} onChange={e => setFormData({ ...formData, fixedStartTime: e.target.value })} />
                        <span style={{ padding: '8px' }}>-</span>
                        <input type="text" value={formData.fixedEndTime} onChange={e => setFormData({ ...formData, fixedEndTime: e.target.value })} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>休憩時間</label>
                      <input type="text" className="input-full" value={formData.fixedBreakTime} onChange={e => setFormData({ ...formData, fixedBreakTime: e.target.value })} />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="animate-slide-in">
                    <h2 className="form-title">カレンダー設定</h2>
                    <p className="helper-text">休日とする日付をカレンダーから選択してください（赤色は休日）。</p>
                    <div className="cal-v2-scroll-area" style={{ height: '400px' }}>
                      {months.map((month, mIdx) => (
                        <div key={month} className="cal-v2-month-block">
                          <div className="cal-v2-month-name">{month}</div>
                          <div className="cal-v2-grid">
                            {Array.from({ length: 30 }).map((_, i) => {
                              const dayKey = `f-${mIdx}-${i}`;
                              const isHoliday = assignedDays[dayKey];
                              return (
                                <div
                                  key={i}
                                  className="cal-v2-day"
                                  onClick={() => setAssignedDays({ ...assignedDays, [dayKey]: !isHoliday })}
                                  style={{ backgroundColor: isHoliday ? '#dc2626' : 'white', color: isHoliday ? 'white' : 'inherit' }}
                                >
                                  {i + 1}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="animate-slide-in">
                    <h2 className="form-title">内容確認</h2>
                    <div className="summary-section-v2">
                      <div className="s-grid-v2">
                        <span>形態名</span><span className="val">{formData.name}</span>
                        <span>労働時間制</span><span className="val">固定時間制</span>
                        <span>就業時間</span><span className="val">{formData.fixedStartTime} - {formData.fixedEndTime}</span>
                        <span>設定休日数</span><span className="val">{Object.keys(assignedDays).filter(k => k.startsWith('f-')).length} 日</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="modal-footer">
            <button className="btn-secondary" onClick={onClose}>キャンセル</button>
            <div style={{ flex: 1 }}></div>
            {step > 1 && <button className="btn-secondary" onClick={handleBack}>戻る</button>}
            <button className="btn-primary" onClick={displayStep === steps.length ? onClose : handleNext}>
              {displayStep === steps.length ? '作成する' : '次へ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Sidebar = () => (
  <aside className="sidebar">
    <div className="sidebar-header"><h2>マスターデータ設定</h2></div>
    <nav className="sidebar-nav">
      <div className="nav-item active"><span>勤務形態</span></div>
      <div className="nav-item"><span>雇用形態</span></div>
    </nav>
  </aside>
);

const WorkingArrangementList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="content-area">
      <header className="content-header">
        <h1>勤務形態</h1>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>+ 勤務形態を作成</button>
      </header>
      <WorkSystemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <div className="table-container">
        <table>
          <thead><tr><th>勤務形態名</th><th>労働時間制</th><th>運用日</th></tr></thead>
          <tbody>
            <tr><td>工場_変形1年</td><td>変形労働</td><td>2024/01/01～</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="app-layout">
      <div className="global-nav"><div className="logo-icon"></div></div>
      <div className="main-wrapper"><Sidebar /><WorkingArrangementList /></div>
    </div>
  );
}

export default App;
