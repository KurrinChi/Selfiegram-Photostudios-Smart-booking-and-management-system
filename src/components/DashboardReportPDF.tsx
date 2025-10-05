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
    padding: '40px',
    backgroundColor: 'white',
    fontFamily: '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    fontSize: '14px',
    lineHeight: '1.7',
    color: '#1a202c',
    minHeight: '100vh'
  };

  const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: '40px',
    padding: '40px 30px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
    color: 'white'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '38px',
    fontWeight: '800',
    color: 'white',
    marginBottom: '16px',
    letterSpacing: '-1px',
    textTransform: 'uppercase'
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '22px',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    marginTop: '8px',
    marginBottom: '12px'
  };

  const infoStyle: React.CSSProperties = {
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: '6px',
    fontSize: '15px',
    fontWeight: '500'
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '22px',
    fontWeight: '700',
    marginBottom: '24px',
    marginTop: '40px',
    color: '#2d3748',
    borderLeft: '4px solid #2d3748',
    paddingLeft: '16px',
    paddingTop: '8px',
    paddingBottom: '8px',
    backgroundColor: '#f7fafc'
  };

  const cardGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  };

  const cardStyle: React.CSSProperties = {
    padding: '24px',
    border: '2px solid #e2e8f0',
    borderRadius: '16px',
    backgroundColor: 'white',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05)'
  };

  const cardLabelStyle: React.CSSProperties = {
    fontSize: '13px',
    color: '#718096',
    marginBottom: '10px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const cardValueStyle: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: '800',
    color: '#2d3748',
    marginBottom: '12px',
    letterSpacing: '-1px'
  };

  const trendStyle = (isUp: boolean): React.CSSProperties => ({
    fontSize: '13px',
    color: isUp ? '#38a169' : '#e53e3e',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  });

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0',
    marginBottom: '30px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)'
  };

  const thStyle: React.CSSProperties = {
    padding: '16px 14px',
    backgroundColor: '#2d3748',
    fontWeight: '700',
    textAlign: 'left',
    fontSize: '14px',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const tdStyle: React.CSSProperties = {
    padding: '14px',
    borderBottom: '1px solid #e2e8f0',
    fontSize: '14px',
    verticalAlign: 'top',
    wordWrap: 'break-word',
    color: '#4a5568'
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>
          {data.companyInfo.name}
        </h1>
        <h2 style={subtitleStyle}>
          Business Performance Report
        </h2>
        <div style={{
          display: 'inline-block',
          backgroundColor: '#2d3748',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          marginTop: '16px',
          fontSize: '15px',
          fontWeight: '600'
        }}>
          Report Period: {data.dateRange.formattedRange}
        </div>
        <div style={{...infoStyle, fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)', marginTop: '16px', fontWeight: '500'}}>
          Generated: {format(new Date(data.reportGenerated), 'MMMM dd, yyyy • h:mm a')}
        </div>
        <div style={{marginTop: '20px', fontSize: '13px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '500'}}>
          {data.companyInfo.address} | {data.companyInfo.phone} | {data.companyInfo.email}
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{marginBottom: '50px'}}>
        <h3 style={sectionTitleStyle}>Executive Summary</h3>
        <div style={cardGridStyle}>
          {summaryCards.map((card) => (
            <div key={card.label} style={cardStyle}>
              <div style={cardLabelStyle}>{card.label}</div>
              <div style={cardValueStyle}>{card.value}</div>
              {!data.summary.hasDateRange && (
                <div style={trendStyle(card.trend.up)}>
                  <span style={{fontSize: '18px', marginRight: '4px', fontWeight: '700'}}>
                    {card.trend.up ? '↗' : '↘'}
                  </span>
                  <span>
                    {card.trend.value} {card.trend.up ? 'increase' : 'decrease'} vs. last week
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Income Table */}
      {data.weeklyIncome && data.weeklyIncome.length > 0 && (
        <div style={{marginBottom: '50px'}}>
          <h3 style={sectionTitleStyle}>Revenue Analysis (Last 10 Weeks)</h3>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={{...thStyle, width: '60%'}}>Week Period</th>
                <th style={{...thStyle, width: '40%', textAlign: 'right'}}>Gross Income</th>
              </tr>
            </thead>
            <tbody>
              {data.weeklyIncome.slice(-10).map((week, index) => (
                <tr key={index} style={index % 2 === 0 ? {backgroundColor: '#f8fafc'} : {backgroundColor: 'white'}}>
                  <td style={{...tdStyle, fontWeight: '600', color: '#2d3748'}}>
                    {week.week}
                  </td>
                  <td style={{...tdStyle, textAlign: 'right', fontWeight: '700', color: '#38a169', fontSize: '16px'}}>
                    ₱{week.income.toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </td>
                </tr>
              ))}
              <tr style={{backgroundColor: '#2d3748', color: 'white', fontWeight: '700'}}>
                <td style={{...tdStyle, borderBottom: 'none', color: 'white', fontSize: '15px'}}>
                  Total Revenue
                </td>
                <td style={{...tdStyle, textAlign: 'right', borderBottom: 'none', color: 'white', fontSize: '17px'}}>
                  ₱{data.weeklyIncome.slice(-10).reduce((sum, week) => sum + week.income, 0).toLocaleString('en-PH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Package Performance */}
      {data.packages && data.packages.length > 0 && (
        <div style={{marginBottom: '50px'}}>
          <h3 style={sectionTitleStyle}>Package Performance Analysis</h3>
          <div style={{overflowX: 'auto'}}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={{...thStyle, minWidth: '220px'}}>Package Name</th>
                  <th style={{...thStyle, minWidth: '110px', textAlign: 'center'}}>Total Bookings</th>
                  <th style={{...thStyle, minWidth: '140px', textAlign: 'center'}}>Revenue Generated</th>
                  <th style={{...thStyle, minWidth: '110px', textAlign: 'center'}}>Market Share</th>
                  <th style={{...thStyle, minWidth: '110px', textAlign: 'center'}}>Customer Rating</th>
                  <th style={{...thStyle, minWidth: '120px', textAlign: 'center'}}>Growth Trend</th>
                </tr>
              </thead>
              <tbody>
                {data.packages.map((pkg, index) => (
                  <tr key={index} style={index % 2 === 0 ? {backgroundColor: '#f8fafc'} : {backgroundColor: 'white'}}>
                    <td style={{...tdStyle, fontWeight: '700', color: '#2d3748', fontSize: '14px'}}>{pkg.name}</td>
                    <td style={{...tdStyle, textAlign: 'center', fontWeight: '600', fontSize: '14px'}}>
                      <span style={{
                        backgroundColor: '#edf2f7',
                        padding: '5px 12px',
                        borderRadius: '15px',
                        display: 'inline-block',
                        color: '#4a5568'
                      }}>
                        {pkg.totalBooking}
                      </span>
                    </td>
                    <td style={{...tdStyle, textAlign: 'center', fontWeight: '700', color: '#38a169', fontSize: '14px'}}>{pkg.revenue}</td>
                    <td style={{...tdStyle, textAlign: 'center', fontWeight: '600', fontSize: '14px'}}>
                      <span style={{
                        backgroundColor: '#ebf8ff',
                        color: '#2c5282',
                        padding: '5px 12px',
                        borderRadius: '15px',
                        display: 'inline-block'
                      }}>
                        {pkg.bookingPct}
                      </span>
                    </td>
                    <td style={{...tdStyle, textAlign: 'center', fontSize: '17px', color: '#f59e0b'}}>
                      {pkg.rating ? '★'.repeat(Math.floor(pkg.rating)) + '☆'.repeat(5 - Math.floor(pkg.rating)) : 'N/A'}
                    </td>
                    <td style={{
                      ...tdStyle, 
                      textAlign: 'center',
                      color: pkg.trendPositive ? '#38a169' : '#e53e3e',
                      fontWeight: '700',
                      fontSize: '15px'
                    }}>
                      <span style={{fontSize: '18px', marginRight: '6px', fontWeight: '900'}}>
                        {pkg.trendPositive ? '↑' : '↓'}
                      </span>
                      {pkg.trend}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        marginTop: '60px',
        paddingTop: '30px',
        borderTop: '3px solid #e2e8f0',
        background: 'linear-gradient(to bottom, #f8fafc, white)',
        padding: '30px 20px',
        borderRadius: '12px'
      }}>
        <div style={{
          marginBottom: '12px', 
          fontWeight: '700',
          fontSize: '14px',
          color: '#2d3748',
          letterSpacing: '0.5px'
        }}>
          This report was generated automatically by {data.companyInfo.name} Dashboard System
        </div>
        <div style={{
          fontSize: '13px',
          color: '#718096',
          fontWeight: '500'
        }}>
          © 2025 {data.companyInfo.name}. All rights reserved. | Confidential Business Report
        </div>
      </div>
    </div>
  );
};

export default DashboardReportPDF;