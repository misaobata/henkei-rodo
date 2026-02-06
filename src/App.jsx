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
      { id: 1, name: '日勤', startTime: '08:00', endTime: '17:00', breakTime: '12:00-13:00', color: '#1a365d' },
      { id: 2, name: '夜勤', startTime: '20:00', endTime: '05:00', breakTime: '00:00-01:00', color: '#7c3aed' },
    ]
  });

  if (!isOpen) return null;

  const steps = [
    { id: 1, title: '基本情報' },
    { id: 2, title: '期間設定' },
    { id: 3, title: '勤務パターン作成' },
    { id: 4, title: 'カレンダー割当' },
    { id: 5, title: '内容確認' }
  ];

  const handleNext = () => setStep(s => Math.min(s + 1, 5));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const toggleDayAssignment = (day) => {
    setAssignedDays(prev => ({
      ...prev,
      [day]: prev[day] === selectedPatternId ? null : selectedPatternId
    }));
  };

  const months = formData.unit === '1year' ? ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'] : ['1月'];

  return (
    <div className="modal-overlay">
      <div className={`modal-content two-column wizard-step-${step}`}>
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
                    onChange={e => setFormData({ ...formData, systemType: e.target.value })}
                  >
                    <option value="variable">変形労働時間制</option>
                    <option value="fixed">固定時間制</option>
                    <option value="flex">フレックスタイム制</option>
                    <option value="discretionary">裁量労働制</option>
                  </select>
                </div>
              </div>
            )}

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
                  <input
                    type="date"
                    className="input-full"
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  />
                  <p className="helper-text">起算日を基準に、勤務形態専用の勤務カレンダーが生成されます</p>
                </div>
                <div className="alert-card">
                  <p>変形労働時間制では、各勤務形態ごとに独立したカレンダーを設定します。会社全体のカレンダー設定は参照されません。</p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-slide-in">
                <h2 className="form-title">勤務パターン作成</h2>
                <p className="helper-text">カレンダーに割り当てるための勤務パターンを作成・管理します。</p>
                <div className="pattern-list-compact">
                  {formData.patterns.map(p => (
                    <div key={p.id} className="pattern-item-card" style={{ borderLeft: `6px solid ${p.color}` }}>
                      <div className="pattern-card-info">
                        <span className="p-name">{p.name}</span>
                        <span className="p-time">{p.startTime} - {p.endTime} (休憩 {p.breakTime})</span>
                      </div>
                      <div className="pattern-actions">
                        <button className="text-btn">編集</button>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="btn-dashed-add">+ 勤務パターンを追加</button>
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
                          {Array.from({ length: 31 }).map((_, i) => {
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
                                {pattern && <span className="d-tag">{pattern.name[0]}</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="cal-v2-sidebar">
                  <div className="cal-v2-section">
                    <label>パターン選択</label>
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
                  <div className="cal-v2-section">
                    <label>チェック結果</label>
                    <div className="check-results">
                      <div className="check-item ok">週平均労働時間: OK</div>
                      <div className="check-item warning">連続勤務日数: 注意</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="animate-slide-in">
                <h2 className="form-title">内容確認</h2>
                <div className="summary-scroll">
                  <div className="summary-section-v2">
                    <h5>基本情報</h5>
                    <div className="s-grid-v2">
                      <span>形態名</span><span className="val">{formData.name}</span>
                      <span>単位</span><span className="val">{formData.unit === '1year' ? '1年単位' : '1か月単位'}</span>
                      <span>起算日</span><span className="val">{formData.startDate}</span>
                    </div>
                  </div>
                  <div className="summary-section-v2">
                    <h5>カレンダー設定</h5>
                    <div className="s-grid-v2">
                      <span>設定済日数</span><span className="val">{Object.keys(assignedDays).length} 日</span>
                      <span>パターン数</span><span className="val">{formData.patterns.length} 件</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button className="btn-secondary" onClick={onClose}>キャンセル</button>
            <div style={{ flex: 1 }}></div>
            {step > 1 && <button className="btn-secondary" onClick={handleBack}>戻る</button>}
            <button className="btn-primary" onClick={step === 5 ? onClose : handleNext}>
              {step === 5 ? '作成する' : (step === 2 ? 'カレンダーを作成' : '次へ')}
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
    { name: '工場_変形1年', system: '変形労働', date: '2024/01/01～' },
    { name: '固定時間制', system: '固定時間', date: '2024/01/01～' },
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
