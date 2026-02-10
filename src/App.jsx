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
      { id: 1, name: '日勤', startTime: '08:00', endTime: '17:00', breakStartTime: '12:00', breakEndTime: '13:00', color: '#1a365d', useAM: false, amStartTime: '08:00', amEndTime: '12:00', usePM: false, pmStartTime: '13:00', pmEndTime: '17:00' },
      { id: 2, name: '夜勤', startTime: '20:00', endTime: '05:00', breakStartTime: '00:00', breakEndTime: '01:00', color: '#7c3aed', useAM: false, amStartTime: '20:00', amEndTime: '00:00', usePM: false, pmStartTime: '01:00', pmEndTime: '05:00' },
    ],
    // 1年単位の変形用
    monthlyTotalHours: {}, // { '2024-01': 160, '2024-02': 150, ... }
    monthDisplayType: 'start_month', // 'start_month' or 'end_month'
    inheritCompanyHolidays: true
  });

  const [highlightedDays, setHighlightedDays] = useState([]);

  // Preset holidays logic
  React.useEffect(() => {
    if (step === 4 && Object.keys(assignedDays).length === 0) {
      const presets = {};
      // Mocking for offset 0-11
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].forEach(offset => {
        [0, 1, 2, 3, 4].forEach(weekIdx => {
          presets[`${offset}-${weekIdx}-0`] = 'holiday'; // Sunday: Statutory
          presets[`${offset}-${weekIdx}-6`] = 'holiday'; // Saturday: Scheduled
        });
      });
      setAssignedDays(presets);
    }
  }, [step]);

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

                    {formData.unit === '1month' && (
                      <div className="form-group animate-fade-in">
                        <label className="required">月度の表示形式（サマリ）</label>
                        <div className="radio-list">
                          <label className="radio-item">
                            <input type="radio" checked={formData.monthDisplayType === 'start_month'} onChange={() => setFormData({ ...formData, monthDisplayType: 'start_month' })} />
                            <span>月度開始日の月を表示</span>
                          </label>
                          <label className="radio-item">
                            <input type="radio" checked={formData.monthDisplayType === 'end_month'} onChange={() => setFormData({ ...formData, monthDisplayType: 'end_month' })} />
                            <span>月度終了日の月を表示</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {formData.unit === '1year' && (
                      <div className="form-alert critical animate-fade-in">
                        <div className="alert-header">
                          <span className="alert-icon">⚠</span>
                          <strong>1年単位の変形労働時間制について</strong>
                        </div>
                        <ul className="alert-list">
                          <li>年間の労働日数（280日以内など）・連続勤務日数の制約が非常に厳格になります。</li>
                          <li>導入には労使協定の締結と届出が必要です。</li>
                          <li>後のカレンダー割当ステップで、コンプライアンス・チェック結果を必ず最終確認してください。</li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {step === 3 && (
                  <div className="animate-slide-in">
                    <h2 className="form-title">勤務パターン作成</h2>
                    <p className="step-description">勤務パターンは、次のステップでカレンダーの日付に割り当てて使用します。</p>

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
                        <div className="date-row">
                          <div className="form-group">
                            <label>休憩開始</label>
                            <input type="text" value={editingPattern.breakStartTime} onChange={e => setEditingPattern({ ...editingPattern, breakStartTime: e.target.value })} />
                          </div>
                          <div className="form-group">
                            <label>休憩終了</label>
                            <input type="text" value={editingPattern.breakEndTime} onChange={e => setEditingPattern({ ...editingPattern, breakEndTime: e.target.value })} />
                          </div>
                        </div>

                        <div className="half-day-settings">
                          <div className="half-day-option">
                            <label className="checkbox-label">
                              <input type="checkbox" checked={editingPattern.useAM} onChange={e => setEditingPattern({ ...editingPattern, useAM: e.target.checked })} />
                              <span>AM半休設定</span>
                            </label>
                            {editingPattern.useAM && (
                              <div className="half-day-inputs">
                                <input type="text" value={editingPattern.amStartTime} onChange={e => setEditingPattern({ ...editingPattern, amStartTime: e.target.value })} placeholder="09:00" />
                                <span className="dash">-</span>
                                <input type="text" value={editingPattern.amEndTime} onChange={e => setEditingPattern({ ...editingPattern, amEndTime: e.target.value })} placeholder="13:00" />
                              </div>
                            )}
                          </div>
                          <div className="half-day-option">
                            <label className="checkbox-label">
                              <input type="checkbox" checked={editingPattern.usePM} onChange={e => setEditingPattern({ ...editingPattern, usePM: e.target.checked })} />
                              <span>PM半休設定</span>
                            </label>
                            {editingPattern.usePM && (
                              <div className="half-day-inputs">
                                <input type="text" value={editingPattern.pmStartTime} onChange={e => setEditingPattern({ ...editingPattern, pmStartTime: e.target.value })} placeholder="14:00" />
                                <span className="dash">-</span>
                                <input type="text" value={editingPattern.pmEndTime} onChange={e => setEditingPattern({ ...editingPattern, pmEndTime: e.target.value })} placeholder="18:00" />
                              </div>
                            )}
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
                                <div className="p-details">
                                  <span className="p-time">{p.startTime} - {p.endTime} (休 {p.breakStartTime} - {p.breakEndTime})</span>
                                  {(p.useAM || p.usePM) && (
                                    <div className="half-day-badges">
                                      {p.useAM && <span className="h-badge">AM: {p.amStartTime}-{p.amEndTime}</span>}
                                      {p.usePM && <span className="h-badge">PM: {p.pmStartTime}-{p.pmEndTime}</span>}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <button className="text-btn" onClick={() => handleEditPattern(p)}>編集</button>
                            </div>
                          ))}
                        </div>
                        <button className="btn-dashed-add" onClick={() => setEditingPattern({ name: '', startTime: '09:00', endTime: '18:00', breakStartTime: '12:00', breakEndTime: '13:00', color: '#059669', useAM: false, amStartTime: '09:00', amEndTime: '13:00', usePM: false, pmStartTime: '14:00', pmEndTime: '18:00' })}>
                          + 勤務パターンを追加
                        </button>
                      </>
                    )}
                  </div>
                )}

                {step === 4 && (
                  <div className={`animate-slide-in calendar-assignment-container ${formData.unit}`}>
                    <div className="cal-assignment-header-main">
                      <div className="operation-guide">
                        <div className="guide-title">操作ガイド</div>
                        <div className="guide-steps">
                          <span className="g-step">① 右のパターンを選択</span>
                          <span className="g-arrow">→</span>
                          <span className="g-step">② 日付をクリックして割当</span>
                        </div>
                      </div>
                      <div className="cal-assignment-header">
                        <h2 className="form-title">カレンダー割当</h2>
                        <div className="cal-view-controls">
                          <div className="control-group">
                            <label>表示期間:</label>
                            <span className="period-badge">12ヶ月分 + 翌年度</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="cal-assignment-main">
                      <div className="cal-scroll-area">
                        {(formData.unit === '1year' ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] : [0]).map((offset) => {
                          const date = new Date(formData.startDate);
                          date.setMonth(date.getMonth() + offset);
                          const monthLabel = `${date.getFullYear()}年${date.getMonth() + 1}月`;

                          return (
                            <div key={offset} className="month-assignment-block">
                              <div className="month-header">
                                <span className="month-name">{monthLabel}</span>
                                <div className="month-summary-mini">
                                  <span>所定労制上限: 177h</span>
                                  <span>設定済み: 160h</span>
                                  <span className="status-ok">残: 17h</span>
                                </div>
                              </div>
                              <div className="calendar-week-row header">
                                <div>日</div><div>月</div><div>火</div><div>水</div><div>木</div><div>金</div><div>土</div>
                                <div className="week-total-label">週計</div>
                              </div>
                              {[0, 1, 2, 3, 4].map(weekIdx => (
                                <div key={weekIdx} className="calendar-week-row">
                                  {[0, 1, 2, 3, 4, 5, 6].map(dayIdx => {
                                    const dayKey = `${offset}-${weekIdx}-${dayIdx}`;
                                    const assignedId = assignedDays[dayKey];
                                    const pattern = assignedId === 'holiday' ? { color: '#fee2e2', name: '休日' } : formData.patterns.find(p => p.id === assignedId);
                                    return (
                                      <div
                                        key={dayIdx}
                                        className={`cal-day-cell ${assignedId ? (assignedId === 'holiday' ? 'holiday' : 'assigned') : ''} ${highlightedDays.includes(dayKey) ? 'compliance-highlight' : ''}`}
                                        style={assignedId && assignedId !== 'holiday' ? { backgroundColor: pattern.color, color: 'white' } : (assignedId === 'holiday' ? { backgroundColor: '#fee2e2' } : {})}
                                        onClick={() => toggleDayAssignment(dayKey)}
                                      >
                                        <span className="day-num">{weekIdx * 7 + dayIdx + 1}</span>
                                        {assignedId === 'holiday' && <span className="holiday-label">休</span>}
                                      </div>
                                    );
                                  })}
                                  <div className="week-total-value">40h</div>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>

                      <div className="cal-assignment-sidebar">
                        <div className="sidebar-section setting-panel">
                          <label className="sidebar-label">カレンダー設定</label>
                          <div className="toggle-item">
                            <label className="switch-label">
                              <input
                                type="checkbox"
                                checked={formData.inheritCompanyHolidays}
                                onChange={e => setFormData({ ...formData, inheritCompanyHolidays: e.target.checked })}
                              />
                              <span className="switch-text">会社カレンダーの休日を継承</span>
                            </label>
                          </div>
                        </div>

                        <div className="sidebar-section pattern-picker">
                          <label className="sidebar-label">勤務パターン・休日</label>
                          <div className="p-list-v2">
                            {formData.patterns.map(p => (
                              <div
                                key={p.id}
                                className={`p-card-v2 ${selectedPatternId === p.id ? 'active' : ''}`}
                                onClick={() => setSelectedPatternId(p.id)}
                                style={{
                                  borderLeft: `4px solid ${p.color}`,
                                  backgroundColor: selectedPatternId === p.id ? '#f0f4f8' : 'white'
                                }}
                              >
                                <span className="p-name">{p.name}</span>
                                <span className="p-time">{p.startTime}-{p.endTime}</span>
                              </div>
                            ))}
                            <div
                              className={`p-card-v2 holiday-pill ${selectedPatternId === 'holiday' ? 'active' : ''}`}
                              onClick={() => setSelectedPatternId('holiday')}
                              style={{ borderLeft: '4px solid #f87171' }}
                            >
                              <span className="p-name">法定・所定休日</span>
                            </div>
                          </div>
                        </div>

                        {formData.unit === '1year' ? (
                          <>
                            <div className="sidebar-section compliance-panel">
                              <label className="sidebar-label title-with-icon">
                                <span>コンプライアンス・チェック</span>
                                <span className="icon-help">?</span>
                              </label>
                              <div className="check-list">
                                <div className="check-item ok"><span className="indicator">✅</span> 1日の労働時間 ≤10h</div>
                                <div className="check-item ok"><span className="indicator">✅</span> 1週の労働時間 ≤52h</div>
                                <div className="check-item warning">
                                  <span className="indicator">⚠️</span>
                                  <span>連続勤務日数 (原則6日)</span>
                                  <button className="btn-link-small" onClick={() => setHighlightedDays(['0-1-1', '0-1-2', '0-1-3', '0-1-4', '0-1-5', '0-1-6', '0-2-0'])}>該当箇所を表示</button>
                                </div>
                                <div className="check-item ok"><span className="indicator">✅</span> 年間労働日数 ≤280/313日</div>
                              </div>
                            </div>
                            <div className="sidebar-section annual-summary highlight">
                              <label className="sidebar-label">年間サマリー</label>
                              <div className="summary-stat-group">
                                <div className="stat-card">
                                  <span className="stat-label">労働日数</span>
                                  <span className="stat-val">250<span className="unit">日</span></span>
                                </div>
                                <div className="stat-card">
                                  <span className="stat-label">労働時間</span>
                                  <span className="stat-val">2,000<span className="unit">h</span></span>
                                </div>
                              </div>
                              <div className="compliance-badge success">設定成立見込み</div>
                            </div>
                          </>
                        ) : (
                          <div className="sidebar-section simple-summary">
                            <label className="sidebar-label">月間サマリー</label>
                            <div className="summary-stat-main">
                              <span className="stat-total">160<span className="slash">/</span>177<span className="h">h</span></span>
                              <div className="progress-bar-container">
                                <div className="progress-bar" style={{ width: '90%' }}></div>
                              </div>
                            </div>
                            <div className="compliance-badge info">1ヶ月単位（シンプル）</div>
                            <p className="helper-text flush">月間の法定上限内に収まるよう調整してください。</p>
                          </div>
                        )}
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
