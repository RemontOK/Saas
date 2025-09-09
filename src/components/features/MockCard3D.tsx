export function MockCard3D() {
  return (
    <div className="mock-card">
      <div className="chrome"><span className="dot" /></div>
      <div className="mock-ui">
        <div className="mock-row"></div>
        <div className="mock-row"></div>
        <div className="mock-row"></div>
        <div className="mock-row" style={{ width: '70%' }}></div>
        <div className="kpi">
          <div className="kpi-card">
            <div className="kpi-title">Ответы</div>
            <div className="kpi-value">+34%</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-title">Доставляемость</div>
            <div className="kpi-value">98.2%</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-title">Встречи</div>
            <div className="kpi-value">x2.1</div>
          </div>
        </div>
        <div className="chart">
          <div className="chart-bars">
            <div className="chart-bar" style={{ height: 28 }}></div>
            <div className="chart-bar" style={{ height: 42 }}></div>
            <div className="chart-bar" style={{ height: 36 }}></div>
            <div className="chart-bar" style={{ height: 64 }}></div>
            <div className="chart-bar" style={{ height: 72 }}></div>
            <div className="chart-bar" style={{ height: 58 }}></div>
            <div className="chart-bar" style={{ height: 90 }}></div>
            <div className="chart-bar" style={{ height: 76 }}></div>
          </div>
        </div>
      </div>
      <div className="edge-glow"></div>
      <div className="spark"></div>
    </div>
  );
}
