import React from 'react';
import { format } from 'date-fns';

interface ReportData {
  reportGenerated: string;
  dateRange: {
    start: string;
    end: string;
    hasCustomRange: boolean;
    formattedRange: string;
  };
  summary: {
    totalUsers: number;
    totalBookings: number;
    totalSales: number;
    totalAppointments: number;
    hasDateRange: boolean;
    salesTrend: { value: string; up: boolean };
    userTrend: { value: string; up: boolean };
    scheduleTrend: { value: string; up: boolean };
    appointmentsTrend: { value: string; up: boolean };
  };
  weeklyIncome: Array<{
    week: string;
    income: number;
  }>;
  packages: Array<{
    name: string;
    totalBooking: number;
    revenue: string;
    bookingPct: string;
    rating: number;
    trend: string;
    trendPositive: boolean;
  }>;
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

interface DashboardReportPDFProps {
  data: ReportData;
}

const DashboardReportPDF: React.FC<DashboardReportPDFProps> = ({ data }) => {
  const summaryCards = [
    {
      label: "Total Users",
      value: data.summary.totalUsers,
      trend: data.summary.userTrend,
    },
    {
      label: "Total Schedule",
      value: data.summary.totalBookings,
      trend: data.summary.scheduleTrend,
    },
    {
      label: "Total Sales",
      value: `₱ ${data.summary.totalSales?.toLocaleString() ?? "0"}`,
      trend: data.summary.salesTrend,
    },
    {
      label: "Total Appointments",
      value: data.summary.totalAppointments,
      trend: data.summary.appointmentsTrend,
    },
  ];

  const containerStyle: React.CSSProperties = {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '48px',
    backgroundColor: 'white',
    fontFamily: '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    fontSize: '13px',
    lineHeight: '1.6',
    color: '#212121',
    minHeight: '100vh'
  };

  const headerStyle: React.CSSProperties = {
    marginBottom: '40px',
    paddingBottom: '32px',
    borderBottom: '3px solid #212121',
  };

  const logoContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '20px',
    marginBottom: '24px'
  };

  const logoStyle: React.CSSProperties = {
    width: '80px',
    height: '80px',
    flexShrink: 0
  };

  const companyDetailsStyle: React.CSSProperties = {
    flex: 1
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: '700',
    color: '#212121',
    marginBottom: '8px',
    letterSpacing: '0.5px',
    lineHeight: '1.2'
  };

  const contactInfoStyle: React.CSSProperties = {
    fontSize: '11px',
    color: '#666',
    lineHeight: '1.6',
    marginTop: '8px'
  };

  const reportTitleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: '700',
    color: '#212121',
    marginTop: '24px',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  };

  const reportMetaStyle: React.CSSProperties = {
    fontSize: '11px',
    color: '#666',
    lineHeight: '1.7'
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: '700',
    marginBottom: '20px',
    marginTop: '40px',
    color: '#212121',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    paddingBottom: '8px',
    borderBottom: '2px solid #212121'
  };

  const cardGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginBottom: '30px'
  };

  const cardStyle: React.CSSProperties = {
    padding: '20px',
    border: '1.5px solid #d0d0d0',
    backgroundColor: 'white'
  };

  const cardLabelStyle: React.CSSProperties = {
    fontSize: '10px',
    color: '#666',
    marginBottom: '8px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const cardValueStyle: React.CSSProperties = {
    fontSize: '26px',
    fontWeight: '700',
    color: '#212121',
    marginBottom: '10px',
    letterSpacing: '-0.5px'
  };

  const trendStyle = (isUp: boolean): React.CSSProperties => ({
    fontSize: '11px',
    color: '#666',
    fontWeight: '600',
  });

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '30px',
    border: '1.5px solid #d0d0d0'
  };

  const thStyle: React.CSSProperties = {
    padding: '12px 14px',
    backgroundColor: '#f5f5f5',
    fontWeight: '700',
    textAlign: 'left',
    fontSize: '11px',
    color: '#212121',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '2px solid #212121'
  };

  const tdStyle: React.CSSProperties = {
    padding: '12px 14px',
    borderBottom: '1px solid #e0e0e0',
    fontSize: '12px',
    color: '#212121'
  };

  const footerStyle: React.CSSProperties = {
    marginTop: '60px',
    paddingTop: '24px',
    borderTop: '2px solid #d0d0d0',
    textAlign: 'center'
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={logoContainerStyle}>
          <img 
            src="/slfg.svg" 
            alt="Selfigram Logo" 
            style={logoStyle}
          />
          <div style={companyDetailsStyle}>
            <h1 style={titleStyle}>
              SELFIGRAM PHOTOSTUDIOS
            </h1>
            <div style={contactInfoStyle}>
              <p style={{margin: '2px 0'}}>3rd Floor Kim Kar Building F Estrella St., Malolos, Philippines</p>
              <p style={{margin: '2px 0'}}>0968 885 6035</p>
              <p style={{margin: '2px 0'}}>selfiegrammalolos@gmail.com</p>
            </div>
          </div>
        </div>
        
        <div>
          <h2 style={reportTitleStyle}>
            Dashboard Report
          </h2>
          <div style={reportMetaStyle}>
            <p style={{margin: '4px 0'}}>
              <strong>Report Period:</strong> {data.dateRange.formattedRange}
            </p>
            <p style={{margin: '4px 0'}}>
              <strong>Generated:</strong> {format(new Date(data.reportGenerated), 'MMMM dd, yyyy • h:mm a')}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{marginBottom: '40px'}}>
        <h3 style={sectionTitleStyle}>Executive Summary</h3>
        <div style={cardGridStyle}>
          {summaryCards.map((card) => (
            <div key={card.label} style={cardStyle}>
              <div style={cardLabelStyle}>{card.label}</div>
              <div style={cardValueStyle}>{card.value}</div>
              {!data.summary.hasDateRange && (
                <div style={trendStyle(card.trend.up)}>
                  <span style={{fontSize: '14px', marginRight: '4px'}}>
                    {card.trend.up ? '↑' : '↓'}
                  </span>
                  {card.trend.value} vs. last week
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Income Table */}
      {data.weeklyIncome && data.weeklyIncome.length > 0 && (
        <div style={{marginBottom: '40px'}}>
          <h3 style={sectionTitleStyle}>Revenue Analysis</h3>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={{...thStyle, width: '60%'}}>Week Period</th>
                <th style={{...thStyle, width: '40%', textAlign: 'right'}}>Gross Income</th>
              </tr>
            </thead>
            <tbody>
              {data.weeklyIncome.slice(-10).map((week, index) => (
                <tr key={index}>
                  <td style={{...tdStyle, fontWeight: '600'}}>
                    {week.week}
                  </td>
                  <td style={{...tdStyle, textAlign: 'right', fontWeight: '600'}}>
                    ₱{week.income.toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </td>
                </tr>
              ))}
              <tr style={{backgroundColor: '#f5f5f5'}}>
                <td style={{...tdStyle, borderBottom: 'none', fontWeight: '700', borderTop: '2px solid #212121'}}>
                  Total Revenue
                </td>
                <td style={{...tdStyle, textAlign: 'right', borderBottom: 'none', fontWeight: '700', borderTop: '2px solid #212121'}}>
                  ₱{data.weeklyIncome.slice(-10).reduce((sum, week) => sum + week.income, 0).toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Package Performance */}
      {data.packages && data.packages.length > 0 && (
        <div style={{marginBottom: '40px'}}>
          <h3 style={sectionTitleStyle}>Package Performance</h3>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={{...thStyle, minWidth: '180px'}}>Package Name</th>
                <th style={{...thStyle, minWidth: '90px', textAlign: 'center'}}>Bookings</th>
                <th style={{...thStyle, minWidth: '110px', textAlign: 'right'}}>Revenue</th>
                <th style={{...thStyle, minWidth: '80px', textAlign: 'center'}}>Share</th>
                <th style={{...thStyle, minWidth: '80px', textAlign: 'center'}}>Rating</th>
                <th style={{...thStyle, minWidth: '90px', textAlign: 'center'}}>Trend</th>
              </tr>
            </thead>
            <tbody>
              {data.packages.map((pkg, index) => (
                <tr key={index}>
                  <td style={{...tdStyle, fontWeight: '600'}}>{pkg.name}</td>
                  <td style={{...tdStyle, textAlign: 'center', fontWeight: '600'}}>
                    {pkg.totalBooking}
                  </td>
                  <td style={{...tdStyle, textAlign: 'right', fontWeight: '600'}}>{pkg.revenue}</td>
                  <td style={{...tdStyle, textAlign: 'center'}}>
                    {pkg.bookingPct}
                  </td>
                  <td style={{...tdStyle, textAlign: 'center'}}>
                    {pkg.rating ? `${pkg.rating.toFixed(1)}/5` : 'N/A'}
                  </td>
                  <td style={{
                    ...tdStyle, 
                    textAlign: 'center',
                    fontWeight: '600'
                  }}>
                    <span style={{fontSize: '14px', marginRight: '4px'}}>
                      {pkg.trendPositive ? '↑' : '↓'}
                    </span>
                    {pkg.trend}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div style={footerStyle}>
        <div style={{
          fontSize: '11px',
          color: '#666',
          lineHeight: '1.7'
        }}>
          <p style={{margin: '4px 0', fontWeight: '600'}}>
            This report was generated automatically by Selfigram Photostudios Dashboard System
          </p>
          <p style={{margin: '4px 0', color: '#999'}}>
            Report ID: RPT-{format(new Date(data.reportGenerated), 'yyyyMMdd-HHmmss')}
          </p>
          <p style={{margin: '4px 0', color: '#999'}}>
            © 2025 Selfigram Photostudios. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardReportPDF;
