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
    monthlyStatus: {}, // { '2024-01': 'draft', ... } 
    monthlySettings: {}, // { '2024-02': { mode: 'simple', days: 20, hours: 160 } } NEW
    monthDisplayType: 'start_month', // 'start_month' or 'end_month'
    inheritCompanyHolidays: true,
    customHolidaySettings: { // NEW
      legalHoliday: 0, // 0:Sun
      fixedHolidays: [6], // 6:Sat. Array of day indices
      useNationalHolidays: true
    },
    defaultPatternId: 1,
    // 固定時間制用
    fixedSettingUnit: 'all', // 'all' or 'daily'
    fixedAmRange: { start: '09:00', end: '13:00' },
    fixedPmRange: { start: '14:00', end: '18:00' },
    fixedDailySettings: [
      { day: '月', startTime: '09:00', endTime: '18:00', breakStartTime: '12:00', breakEndTime: '13:00', isHoliday: false },
      { day: '火', startTime: '09:00', endTime: '18:00', breakStartTime: '12:00', breakEndTime: '13:00', isHoliday: false },
      { day: '水', startTime: '09:00', endTime: '18:00', breakStartTime: '12:00', breakEndTime: '13:00', isHoliday: false },
      { day: '木', startTime: '09:00', endTime: '18:00', breakStartTime: '12:00', breakEndTime: '13:00', isHoliday: false },
      { day: '金', startTime: '09:00', endTime: '18:00', breakStartTime: '12:00', breakEndTime: '13:00', isHoliday: false },
      { day: '土', startTime: '09:00', endTime: '18:00', breakStartTime: '12:00', breakEndTime: '13:00', isHoliday: true },
      { day: '日', startTime: '09:00', endTime: '18:00', breakStartTime: '12:00', breakEndTime: '13:00', isHoliday: true },
    ],
    fixedCalendarType: 'inherit', // 'inherit' or 'add_holiday'
  });

  const [highlightedDays, setHighlightedDays] = useState([]);
  const [activeFixedDayIdx, setActiveFixedDayIdx] = useState(0);
  const [collapsedMonths, setCollapsedMonths] = useState({}); // { '2024-02': true } NEW

  // Preset holidays logic
  React.useEffect(() => {
    if (step === 4 && Object.keys(assignedDays).length === 0) {
      regenerateCalendar();
    }
  }, [step]);

  const regenerateCalendar = () => {
    const presets = {};
    const { inheritCompanyHolidays, customHolidaySettings } = formData;

    // Mocking for offset 0-11
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].forEach(offset => {
      [0, 1, 2, 3, 4].forEach(weekIdx => {
        [0, 1, 2, 3, 4, 5, 6].forEach(dayIdx => {
          const key = `${offset}-${weekIdx}-${dayIdx}`;
          let isHoliday = false;

          if (inheritCompanyHolidays) {
            if (dayIdx === 0 || dayIdx === 6) isHoliday = true; // Default Company Cal
          } else {
            if (dayIdx === customHolidaySettings.legalHoliday) isHoliday = true;
            if (customHolidaySettings.fixedHolidays.includes(dayIdx)) isHoliday = true;
            // Mock National Holiday logic would go here
          }

          if (isHoliday) presets[key] = 'holiday';
        });
      });
    });
    setAssignedDays(presets);

    // Initialize monthly settings (Simple mode for month 2+)
    if (formData.unit === '1year' && Object.keys(formData.monthlySettings).length === 0) {
      const newMonthlySettings = {};
      const newCollapsed = {};

      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].forEach((offset) => {
        const date = new Date(formData.startDate);
        date.setMonth(date.getMonth() + offset);
        const label = `${date.getFullYear()}年${date.getMonth() + 1}月`;

        if (offset > 0) {
          newMonthlySettings[label] = { mode: 'simple', days: 20, hours: 160 };
          newCollapsed[label] = true;
        } else {
          newMonthlySettings[label] = { mode: 'detailed', days: null, hours: null };
          newCollapsed[label] = false;
        }
      });

      setFormData(prev => ({ ...prev, monthlySettings: newMonthlySettings }));
      setCollapsedMonths(newCollapsed);
    }
  };

  // Re-generate if settings change (simplified for prototype)
  React.useEffect(() => {
    if (step === 4) {
      // In a real app we might ask confirmation before wiping custom assignments
      // For prototype we just re-run the updated logic on simpler triggers or manual button
    }
  }, [formData.inheritCompanyHolidays, formData.customHolidaySettings]);

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

  // CUD Friendly Colors (10 colors)
  const cudColors = [
    '#1a365d', // Navy
    '#7c3aed', // Purple
    '#059669', // Emerald
    '#d97706', // Amber
    '#dc2626', // Red
    '#0891b2', // Cyan
    '#e11d48', // Rose
    '#4f46e5', // Indigo
    '#ea580c', // Orange
    '#65a30d', // Lime
  ];

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
    let updatedPatterns;
    if (editingPattern.id) {
      updatedPatterns = formData.patterns.map(p => p.id === editingPattern.id ? editingPattern : p);
    } else {
      const newId = Math.max(0, ...formData.patterns.map(p => p.id)) + 1;
      updatedPatterns = [...formData.patterns, { ...editingPattern, id: newId }];
    }

    // Handle Default Pattern Logic
    if (editingPattern.isDefault) {
      // If this is set to default, unset others (UI logic mainly, state source of truth is defaultPatternId)
      setFormData({
        ...formData,
        patterns: updatedPatterns,
        defaultPatternId: editingPattern.id || (Math.max(0, ...formData.patterns.map(p => p.id)) + 1)
      });
    } else {
      // If unsetting default, ensure at least one default exists? 
      // For now just update patterns.
      setFormData({
        ...formData,
        patterns: updatedPatterns
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
                  <div className="radio-list-v2 vertical">
                    <label className={`radio-card horizontal ${formData.systemType === 'variable' && formData.unit === '1month' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="systemType"
                        checked={formData.systemType === 'variable' && formData.unit === '1month'}
                        onChange={() => setFormData({ ...formData, systemType: 'variable', unit: '1month' })}
                      />
                      <div className="radio-dot"></div>
                      <div className="radio-content">
                        <span className="radio-text">変形労働時間制（1ヶ月単位）</span>
                        <span className="radio-sub">毎月シフトを作成する形式です</span>
                      </div>
                    </label>
                    <label className={`radio-card horizontal ${formData.systemType === 'variable' && formData.unit === '1year' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="systemType"
                        checked={formData.systemType === 'variable' && formData.unit === '1year'}
                        onChange={() => setFormData({ ...formData, systemType: 'variable', unit: '1year' })}
                      />
                      <div className="radio-dot"></div>
                      <div className="radio-content">
                        <span className="radio-text">変形労働時間制（1年単位）</span>
                        <span className="radio-sub">年間カレンダーを事前に作成する形式です</span>
                      </div>
                    </label>
                    <label className={`radio-card horizontal ${formData.systemType === 'fixed' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="systemType"
                        checked={formData.systemType === 'fixed'}
                        onChange={() => setFormData({ ...formData, systemType: 'fixed', unit: '1month' })}
                      />
                      <div className="radio-dot"></div>
                      <div className="radio-content">
                        <span className="radio-text">固定時間制</span>
                        <span className="radio-sub">曜日ごとに決まった時間を設定します</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Variable Flow: Step 2, 3, 4, 5 */}
            {formData.systemType === 'variable' && (
              <>
                {step === 2 && (
                  <div className="animate-slide-in">
                    <h2 className="form-title">期間設定</h2>
                    {/* Unit Selection Removed (Moved to Step 1) */}
                    <div className="form-group">
                      <label className="required">変形労働の起算日</label>
                      <input type="date" className="input-full" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                    </div>

                    {/* Month Display Format Removed */}

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
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label>パターン名</label>
                            <label className="checkbox-label">
                              <input
                                type="checkbox"
                                checked={editingPattern.isDefault || formData.defaultPatternId === editingPattern.id}
                                onChange={e => setEditingPattern({ ...editingPattern, isDefault: e.target.checked })}
                              />
                              <span>デフォルトにする</span>
                            </label>
                          </div>
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
                          <div className="color-selector" style={{ flexWrap: 'wrap' }}>
                            {cudColors.map(c => (
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
                                <span className="p-name">
                                  {p.name}
                                  {formData.defaultPatternId === p.id && <span className="default-badge">Default</span>}
                                </span>
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
                        <button
                          className="btn-dashed-add"
                          onClick={() => {
                            if (formData.patterns.length >= 10) {
                              alert('パターンは最大10個までです');
                              return;
                            }
                            setEditingPattern({ name: '', startTime: '09:00', endTime: '18:00', breakStartTime: '12:00', breakEndTime: '13:00', color: cudColors[formData.patterns.length % 10], useAM: false, amStartTime: '09:00', amEndTime: '13:00', usePM: false, pmStartTime: '14:00', pmEndTime: '18:00' });
                          }}
                          disabled={formData.patterns.length >= 10}
                        >
                          + 勤務パターンを追加 {formData.patterns.length >= 10 && '(上限)'}
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
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((offset) => {
                          const date = new Date(formData.startDate);
                          date.setMonth(date.getMonth() + offset);
                          const monthLabel = `${date.getFullYear()}年${date.getMonth() + 1}月`;

                          const isCollapsed = collapsedMonths[monthLabel];
                          const settings = formData.monthlySettings[monthLabel] || { mode: 'detailed' };
                          const isSimple = settings.mode === 'simple';

                          return (
                            <div key={offset} className={`month-assignment-block ${isCollapsed ? 'collapsed' : ''}`}>
                              <div className="month-header" onClick={() => setCollapsedMonths(prev => ({ ...prev, [monthLabel]: !prev[monthLabel] }))} style={{ cursor: 'pointer' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span className={`toggle-icon ${isCollapsed ? 'collapsed' : ''}`}>▼</span>
                                  <span className="month-name">{monthLabel}</span>
                                </div>

                                <div className="month-status-action" onClick={e => e.stopPropagation()}>
                                  {formData.unit === '1year' && offset > 0 && (
                                    <div className="mode-toggle-group">
                                      <button
                                        className={`mode-btn ${!isSimple ? 'active' : ''}`}
                                        onClick={() => setFormData(prev => ({
                                          ...prev,
                                          monthlySettings: { ...prev.monthlySettings, [monthLabel]: { ...settings, mode: 'detailed' } }
                                        }))}
                                      >
                                        カレンダー
                                      </button>
                                      <button
                                        className={`mode-btn ${isSimple ? 'active' : ''}`}
                                        onClick={() => setFormData(prev => ({
                                          ...prev,
                                          monthlySettings: { ...prev.monthlySettings, [monthLabel]: { ...settings, mode: 'simple' } }
                                        }))}
                                      >
                                        簡易入力
                                      </button>
                                    </div>
                                  )}
                                  <button
                                    className={`status-tag ${formData.monthlyStatus[monthLabel] === 'published' ? 'published' : 'draft'}`}
                                    onClick={() => {
                                      setFormData(prev => ({
                                        ...prev,
                                        monthlyStatus: {
                                          ...prev.monthlyStatus,
                                          [monthLabel]: prev.monthlyStatus[monthLabel] === 'published' ? 'draft' : 'published'
                                        }
                                      }));
                                    }}
                                  >
                                    {formData.monthlyStatus[monthLabel] === 'published' ? '公開済み' : '作成中'}
                                  </button>
                                </div>

                                <div className="month-summary-mini">
                                  <span>所定労制上限: 177h</span>
                                  <span>設定済み: {isSimple ? settings.hours : 160}h</span>
                                  <span className="status-ok">残: {177 - (isSimple ? settings.hours : 160)}h</span>
                                </div>
                              </div>

                              {!isCollapsed && (
                                <>
                                  {isSimple ? (
                                    <div className="simple-mode-container animate-fade-in">
                                      <div className="simple-input-group">
                                        <label>労働日数</label>
                                        <div className="input-with-unit">
                                          <input
                                            type="number"
                                            value={settings.days}
                                            onChange={e => setFormData(prev => ({
                                              ...prev,
                                              monthlySettings: { ...prev.monthlySettings, [monthLabel]: { ...settings, days: Number(e.target.value) } }
                                            }))}
                                          />
                                          <span>日</span>
                                        </div>
                                      </div>
                                      <div className="simple-input-group">
                                        <label>総労働時間</label>
                                        <div className="input-with-unit">
                                          <input
                                            type="number"
                                            value={settings.hours}
                                            onChange={e => setFormData(prev => ({
                                              ...prev,
                                              monthlySettings: { ...prev.monthlySettings, [monthLabel]: { ...settings, hours: Number(e.target.value) } }
                                            }))}
                                          />
                                          <span>時間</span>
                                        </div>
                                      </div>
                                      <p className="helper-text">※ 簡易入力モードでは、日々の詳しいシフトは設定されません。</p>
                                    </div>
                                  ) : (
                                    <>
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
                                    </>
                                  )}
                                </>
                              )}
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
                                onChange={e => {
                                  setFormData({ ...formData, inheritCompanyHolidays: e.target.checked });
                                  setTimeout(regenerateCalendar, 0); // Hacky trigger update
                                }}
                              />
                              <span className="switch-text">会社カレンダーの休日を継承</span>
                            </label>
                          </div>

                          {!formData.inheritCompanyHolidays && (
                            <div className="custom-holiday-settings animate-fade-in">
                              <div className="setting-row">
                                <label>法定休日</label>
                                <select
                                  className="select-compact"
                                  value={formData.customHolidaySettings.legalHoliday}
                                  onChange={e => {
                                    const newSettings = { ...formData.customHolidaySettings, legalHoliday: Number(e.target.value) };
                                    setFormData({ ...formData, customHolidaySettings: newSettings });
                                    // Need to trigger regeneration manually since it depends on state that might not be flushed yet in this closure
                                    // Ideally we use useEffect, but for now we'll rely on the useEffect hook on step 4 or manually call it if we refactor.
                                    // Let's rely on a button or effect. Added Effect for this above.
                                  }}
                                >
                                  <option value={0}>毎週 日曜日</option>
                                  <option value={6}>毎週 土曜日</option>
                                  <option value={1}>毎週 月曜日</option>
                                </select>
                              </div>
                              <div className="setting-row">
                                <label>所定休日</label>
                                <div className="week-checkboxes">
                                  {['月', '火', '水', '木', '金', '土', '日'].map((day, idx) => {
                                    // Adjusted index to match 0=Sun, 1=Mon... wait, standard JS Day is 0=Sun. 
                                    // Our array is Mon=0... let's fix. 
                                    // Standard: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
                                    // Display: Mon(1), Tue(2)... Sat(6), Sun(0)
                                    const dayIndex = idx === 6 ? 0 : idx + 1;
                                    const isChecked = formData.customHolidaySettings.fixedHolidays.includes(dayIndex);

                                    return (
                                      <label key={day} className="day-check">
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={() => {
                                            let newFixed = [...formData.customHolidaySettings.fixedHolidays];
                                            if (isChecked) {
                                              newFixed = newFixed.filter(d => d !== dayIndex);
                                            } else {
                                              newFixed.push(dayIndex);
                                            }
                                            setFormData({
                                              ...formData,
                                              customHolidaySettings: { ...formData.customHolidaySettings, fixedHolidays: newFixed }
                                            });
                                          }}
                                        />
                                        <span>{day}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                              <div className="setting-row">
                                <label className="checkbox-label">
                                  <input
                                    type="checkbox"
                                    checked={formData.customHolidaySettings.useNationalHolidays}
                                    onChange={e => setFormData({
                                      ...formData,
                                      customHolidaySettings: { ...formData.customHolidaySettings, useNationalHolidays: e.target.checked }
                                    })}
                                  />
                                  <span>日本の祝日を休日に指定</span>
                                </label>
                              </div>
                              <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                                <button className="btn-link-small" onClick={regenerateCalendar}>カレンダーに適用</button>
                              </div>
                            </div>
                          )}
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
                    <h2 className="form-title">労働時間と休憩時間</h2>

                    <div className="form-section-v2">
                      <div className="form-group">
                        <label className="section-sub-label">設定の単位</label>
                        <div className="radio-list-v2">
                          <label className={`radio-card ${formData.fixedSettingUnit === 'all' ? 'active' : ''}`}>
                            <input type="radio" checked={formData.fixedSettingUnit === 'all'} onChange={() => setFormData({ ...formData, fixedSettingUnit: 'all' })} />
                            <div className="radio-dot"></div>
                            <span className="radio-text">すべての曜日一律に設定</span>
                          </label>
                          <label className={`radio-card ${formData.fixedSettingUnit === 'daily' ? 'active' : ''}`}>
                            <input type="radio" checked={formData.fixedSettingUnit === 'daily'} onChange={() => setFormData({ ...formData, fixedSettingUnit: 'daily' })} />
                            <div className="radio-dot"></div>
                            <span className="radio-text">曜日別に設定</span>
                          </label>
                        </div>
                      </div>

                      {formData.fixedSettingUnit === 'daily' && (
                        <div className="day-selector-v2">
                          {formData.fixedDailySettings.map((ds, idx) => (
                            <button
                              key={idx}
                              className={`day-tab-btn ${activeFixedDayIdx === idx ? 'active' : ''} ${ds.isHoliday ? 'holiday' : ''}`}
                              onClick={() => setActiveFixedDayIdx(idx)}
                            >
                              {ds.day}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="settings-panel-v2">
                        {formData.fixedSettingUnit === 'daily' && (
                          <div className="panel-header-v2">
                            <span className="active-day-name">{formData.fixedDailySettings[activeFixedDayIdx].day}曜日</span>
                            <button
                              className={`btn-toggle-holiday ${formData.fixedDailySettings[activeFixedDayIdx].isHoliday ? 'active' : ''}`}
                              onClick={() => {
                                const newSettings = [...formData.fixedDailySettings];
                                newSettings[activeFixedDayIdx].isHoliday = !newSettings[activeFixedDayIdx].isHoliday;
                                setFormData({ ...formData, fixedDailySettings: newSettings });
                              }}
                            >
                              {formData.fixedDailySettings[activeFixedDayIdx].isHoliday ? '休日に設定中' : '所定休日にする'}
                            </button>
                          </div>
                        )}

                        {!((formData.fixedSettingUnit === 'daily') && formData.fixedDailySettings[activeFixedDayIdx].isHoliday) ? (
                          <>
                            <div className="form-group">
                              <label className="required">就業時間</label>
                              <div className="time-range-input-v2">
                                <div className="time-box">
                                  <input
                                    type="text"
                                    value={formData.fixedSettingUnit === 'all' ? formData.fixedStartTime : formData.fixedDailySettings[activeFixedDayIdx].startTime}
                                    onChange={e => {
                                      if (formData.fixedSettingUnit === 'all') {
                                        setFormData({ ...formData, fixedStartTime: e.target.value });
                                      } else {
                                        const newSettings = [...formData.fixedDailySettings];
                                        newSettings[activeFixedDayIdx].startTime = e.target.value;
                                        setFormData({ ...formData, fixedDailySettings: newSettings });
                                      }
                                    }}
                                  />
                                  <span className="icon-clock">🕒</span>
                                </div>
                                <span className="dash"> - </span>
                                <div className="time-box">
                                  <input
                                    type="text"
                                    value={formData.fixedSettingUnit === 'all' ? formData.fixedEndTime : formData.fixedDailySettings[activeFixedDayIdx].endTime}
                                    onChange={e => {
                                      if (formData.fixedSettingUnit === 'all') {
                                        setFormData({ ...formData, fixedEndTime: e.target.value });
                                      } else {
                                        const newSettings = [...formData.fixedDailySettings];
                                        newSettings[activeFixedDayIdx].endTime = e.target.value;
                                        setFormData({ ...formData, fixedDailySettings: newSettings });
                                      }
                                    }}
                                  />
                                  <span className="icon-clock">🕒</span>
                                </div>
                              </div>
                            </div>

                            <div className="form-group">
                              <label>休憩時間</label>
                              <div className="time-range-input-v2">
                                <div className="time-box">
                                  <input
                                    type="text"
                                    value={formData.fixedSettingUnit === 'all' ? formData.fixedBreakTime.split('-')[0] : formData.fixedDailySettings[activeFixedDayIdx].breakStartTime}
                                    onChange={e => {
                                      if (formData.fixedSettingUnit === 'daily') {
                                        const newSettings = [...formData.fixedDailySettings];
                                        newSettings[activeFixedDayIdx].breakStartTime = e.target.value;
                                        setFormData({ ...formData, fixedDailySettings: newSettings });
                                      }
                                    }}
                                  />
                                  <span className="icon-clock">🕒</span>
                                </div>
                                <span className="dash"> - </span>
                                <div className="time-box">
                                  <input
                                    type="text"
                                    value={formData.fixedSettingUnit === 'all' ? formData.fixedBreakTime.split('-')[1] : formData.fixedDailySettings[activeFixedDayIdx].breakEndTime}
                                    onChange={e => {
                                      if (formData.fixedSettingUnit === 'daily') {
                                        const newSettings = [...formData.fixedDailySettings];
                                        newSettings[activeFixedDayIdx].breakEndTime = e.target.value;
                                        setFormData({ ...formData, fixedDailySettings: newSettings });
                                      }
                                    }}
                                  />
                                  <span className="icon-clock">🕒</span>
                                </div>
                              </div>
                            </div>

                            <div className="dual-column-v2">
                              <div className="form-group">
                                <label className="required">半休の範囲（午前）</label>
                                <div className="time-range-input-v2 compact">
                                  <div className="time-box">
                                    <input type="text" value={formData.fixedAmRange.start} onChange={e => setFormData({ ...formData, fixedAmRange: { ...formData.fixedAmRange, start: e.target.value } })} />
                                    <span className="icon-clock">🕒</span>
                                  </div>
                                  <span className="dash">-</span>
                                  <div className="time-box">
                                    <input type="text" value={formData.fixedAmRange.end} onChange={e => setFormData({ ...formData, fixedAmRange: { ...formData.fixedAmRange, end: e.target.value } })} />
                                    <span className="icon-clock">🕒</span>
                                  </div>
                                </div>
                              </div>
                              <div className="form-group">
                                <label className="required">半休の範囲（午後）</label>
                                <div className="time-range-input-v2 compact">
                                  <div className="time-box">
                                    <input type="text" value={formData.fixedPmRange.start} onChange={e => setFormData({ ...formData, fixedPmRange: { ...formData.fixedPmRange, start: e.target.value } })} />
                                    <span className="icon-clock">🕒</span>
                                  </div>
                                  <span className="dash">-</span>
                                  <div className="time-box">
                                    <input type="text" value={formData.fixedPmRange.end} onChange={e => setFormData({ ...formData, fixedPmRange: { ...formData.fixedPmRange, end: e.target.value } })} />
                                    <span className="icon-clock">🕒</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="holiday-status-v2">
                            この曜日は所定休日として設定されています。
                          </div>
                        )}
                      </div>

                      <div className="form-group" style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
                        <label className="section-sub-label">休日の設定方法</label>
                        <div className="radio-list-v2 vertical">
                          <label className={`radio-card horizontal ${formData.fixedCalendarType === 'inherit' ? 'active' : ''}`}>
                            <input type="radio" checked={formData.fixedCalendarType === 'inherit'} onChange={() => setFormData({ ...formData, fixedCalendarType: 'inherit' })} />
                            <div className="radio-dot"></div>
                            <div className="radio-content">
                              <span className="radio-text">会社カレンダーをそのまま適用</span>
                              <span className="radio-sub">日曜：法定休日、土曜：所定休日として反映されます</span>
                            </div>
                          </label>
                          <label className={`radio-card horizontal ${formData.fixedCalendarType === 'add_holiday' ? 'active' : ''}`}>
                            <input type="radio" checked={formData.fixedCalendarType === 'add_holiday'} onChange={() => setFormData({ ...formData, fixedCalendarType: 'add_holiday' })} />
                            <div className="radio-dot"></div>
                            <div className="radio-content">
                              <span className="radio-text">会社カレンダーに所定休日を追加</span>
                              <span className="radio-sub">会社カレンダーの休みに加え、独自に休日を追加できます</span>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="calendar-assignment-container animate-fade-in" style={{ height: '520px' }}>
                    <div className="cal-assignment-header">
                      <div className="operation-guide" style={{ flex: 1, marginBottom: 0 }}>
                        <div className="guide-title">操作ガイド</div>
                        <div className="guide-steps">
                          {formData.fixedCalendarType === 'inherit' ? (
                            <span className="g-step">会社カレンダーの内容を確認してください</span>
                          ) : (
                            <>
                              <span className="g-step">① 右の「休日」を選択</span>
                              <span className="g-arrow">→</span>
                              <span className="g-step">② 日付をクリックして追加</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="cal-assignment-main">
                      <div className="cal-scroll-area">
                        {months.map((month, mIdx) => (
                          <div key={month} className="month-assignment-block">
                            <div className="month-header">
                              <span className="month-name">{month}</span>
                            </div>
                            <div className="calendar-week-row header">
                              <div>日</div><div>月</div><div>火</div><div>水</div><div>木</div><div>金</div><div>土</div><div>計</div>
                            </div>
                            {/* Simplified grid for prototype: 5 weeks */}
                            {[0, 1, 2, 3, 4].map(wIdx => (
                              <div key={wIdx} className="calendar-week-row">
                                {[0, 1, 2, 3, 4, 5, 6].map(dIdx => {
                                  const dayNum = wIdx * 7 + dIdx + 1;
                                  if (dayNum > 31) return <div key={dIdx} className="cal-day-cell empty"></div>;

                                  const dayKey = `f-${mIdx}-${wIdx}-${dIdx}`;
                                  const isCompanyStat = dIdx === 0; // Sun
                                  const isCompanySched = dIdx === 6; // Sat
                                  const isAddedHoliday = assignedDays[dayKey] === 'holiday';

                                  const isReadonly = formData.fixedCalendarType === 'inherit' || isCompanyStat || isCompanySched;

                                  return (
                                    <div
                                      key={dIdx}
                                      className={`cal-day-cell ${isAddedHoliday ? 'assigned holiday' : ''} ${isCompanyStat ? 'holiday' : ''} ${isCompanySched ? 'holiday' : ''} ${isReadonly ? 'readonly' : ''}`}
                                      onClick={() => {
                                        if (!isReadonly && formData.fixedCalendarType === 'add_holiday') {
                                          setAssignedDays({
                                            ...assignedDays,
                                            [dayKey]: isAddedHoliday ? null : 'holiday'
                                          });
                                        }
                                      }}
                                    >
                                      <span className="day-number">{dayNum}</span>
                                      {(isCompanyStat || isCompanySched || isAddedHoliday) && <span className="holiday-label">休</span>}
                                    </div>
                                  );
                                })}
                                <div className="week-total-value">-</div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>

                      <div className="cal-assignment-sidebar">
                        <div className="sidebar-section pattern-picker">
                          <label className="sidebar-label">休日の追加</label>
                          {formData.fixedCalendarType === 'inherit' ? (
                            <p className="helper-text">会社カレンダーを適用中のため、個別の追加はできません。</p>
                          ) : (
                            <div
                              className="p-card-v2 active holiday-pill"
                              style={{ borderLeft: `6px solid #ef4444` }}
                            >
                              <span className="p-name">追加の所定休日</span>
                              <span className="p-time">終日</span>
                            </div>
                          )}
                        </div>

                        <div className="sidebar-section">
                          <label className="sidebar-label">設定状況</label>
                          <div className="summary-stat-group" style={{ margin: '0.5rem 0' }}>
                            <div className="stat-card">
                              <span className="stat-label">追加休日</span>
                              <span className="stat-val">{Object.values(assignedDays).filter(v => v === 'holiday').length}<span className="unit">日</span></span>
                            </div>
                          </div>
                          <div className="compliance-badge info">固定時間制</div>
                        </div>

                        <div className="sidebar-section">
                          <label className="sidebar-label">凡例</label>
                          <div className="check-list">
                            <div className="check-item"><span className="indicator" style={{ color: '#f87171' }}>■</span> 法定休日 (日)</div>
                            <div className="check-item"><span className="indicator" style={{ color: '#feb2b2' }}>■</span> 所定休日 (土)</div>
                            <div className="check-item"><span className="indicator" style={{ color: '#ef4444' }}>■</span> 追加した休日</div>
                          </div>
                        </div>
                      </div>
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
