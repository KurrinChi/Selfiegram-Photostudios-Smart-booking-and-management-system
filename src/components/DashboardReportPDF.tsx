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
    maxWidth: '800px',
    margin: '0 auto',
    padding: '30px',
    backgroundColor: 'white',
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    fontSize: '14px',
    lineHeight: '1.6',
    color: 'black',
    minHeight: '100vh'
  };

  const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '2px solid rgb(209, 213, 219)'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '32px',
    fontWeight: 'bold',
    color: 'rgb(31, 41, 55)',
    marginBottom: '12px',
    letterSpacing: '-0.5px'
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '22px',
    fontWeight: '600',
    color: 'rgb(55, 65, 81)',
    marginTop: '20px',
    marginBottom: '12px'
  };

  const infoStyle: React.CSSProperties = {
    color: 'rgb(75, 85, 99)',
    marginBottom: '6px',
    fontSize: '15px'
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '20px',
    marginTop: '30px',
    color: 'rgb(31, 41, 55)',
    borderBottom: '2px solid rgb(229, 231, 235)',
    paddingBottom: '8px'
  };

  const cardGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  };

  const cardStyle: React.CSSProperties = {
    padding: '20px',
    border: '1px solid rgb(209, 213, 219)',
    borderRadius: '12px',
    backgroundColor: 'rgb(249, 250, 251)',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  };

  const cardLabelStyle: React.CSSProperties = {
    fontSize: '14px',
    color: 'rgb(75, 85, 99)',
    marginBottom: '8px',
    fontWeight: '500'
  };

  const cardValueStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'rgb(31, 41, 55)',
    marginBottom: '8px',
    letterSpacing: '-0.5px'
  };

  const trendStyle = (isUp: boolean): React.CSSProperties => ({
    fontSize: '13px',
    color: isUp ? 'rgb(5, 150, 105)' : 'rgb(220, 38, 38)',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  });

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '30px',
    border: '1px solid rgb(209, 213, 219)',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  };

  const thStyle: React.CSSProperties = {
    padding: '15px 12px',
    backgroundColor: 'rgb(243, 244, 246)',
    fontWeight: 'bold',
    textAlign: 'left',
    border: '1px solid rgb(209, 213, 219)',
    fontSize: '15px',
    color: 'rgb(31, 41, 55)'
  };

  const tdStyle: React.CSSProperties = {
    padding: '12px',
    border: '1px solid rgb(209, 213, 219)',
    fontSize: '14px',
    verticalAlign: 'top',
    wordWrap: 'break-word'
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>
          {data.companyInfo.name}
        </h1>
        <div style={infoStyle}>{data.companyInfo.address}</div>
        <div style={infoStyle}>{data.companyInfo.phone} | {data.companyInfo.email}</div>
        <h2 style={subtitleStyle}>
          Dashboard Report
        </h2>
        <div style={{...infoStyle, fontSize: '14px', marginTop: '10px'}}>
          <strong>Report Period:</strong> {data.dateRange.formattedRange}
        </div>
        <div style={{...infoStyle, fontSize: '13px', color: 'rgb(107, 114, 128)'}}>
          Generated on: {format(new Date(data.reportGenerated), 'PPP p')}
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{marginBottom: '40px'}}>
        <h3 style={sectionTitleStyle}>Summary Overview</h3>
        <div style={cardGridStyle}>
          {summaryCards.map((card) => (
            <div key={card.label} style={cardStyle}>
              <div style={cardLabelStyle}>{card.label}</div>
              <div style={cardValueStyle}>{card.value}</div>
              {!data.summary.hasDateRange && (
                <div style={trendStyle(card.trend.up)}>
                  <span style={{fontSize: '16px', marginRight: '4px'}}>
                    {card.trend.up ? '↑' : '↓'}
                  </span>
                  <span>
                    {card.trend.value} {card.trend.up ? 'Up' : 'Down'} from past week
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Income Table */}
      {data.weeklyIncome && data.weeklyIncome.length > 0 && (
        <div style={{marginBottom: '40px'}}>
          <h3 style={sectionTitleStyle}>Weekly Income Summary (Last 10 Weeks)</h3>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={{...thStyle, width: '60%'}}>Week Period</th>
                <th style={{...thStyle, width: '40%', textAlign: 'right'}}>Income</th>
              </tr>
            </thead>
            <tbody>
              {data.weeklyIncome.slice(-10).map((week, index) => (
                <tr key={index} style={index % 2 === 0 ? {backgroundColor: 'rgb(249, 250, 251)'} : {}}>
                  <td style={{...tdStyle, fontWeight: '500'}}>{week.week}</td>
                  <td style={{...tdStyle, textAlign: 'right', fontWeight: '600', color: 'rgb(5, 150, 105)'}}>
                    ₱ {week.income.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Package Performance */}
      {data.packages && data.packages.length > 0 && (
        <div style={{marginBottom: '40px'}}>
          <h3 style={sectionTitleStyle}>Package Performance</h3>
          <div style={{overflowX: 'auto'}}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={{...thStyle, minWidth: '200px'}}>Package Name</th>
                  <th style={{...thStyle, minWidth: '100px', textAlign: 'center'}}>Bookings</th>
                  <th style={{...thStyle, minWidth: '120px', textAlign: 'center'}}>Revenue</th>
                  <th style={{...thStyle, minWidth: '100px', textAlign: 'center'}}>Booking %</th>
                  <th style={{...thStyle, minWidth: '100px', textAlign: 'center'}}>Rating</th>
                  <th style={{...thStyle, minWidth: '100px', textAlign: 'center'}}>Trend</th>
                </tr>
              </thead>
              <tbody>
                {data.packages.map((pkg, index) => (
                  <tr key={index} style={index % 2 === 0 ? {backgroundColor: 'rgb(249, 250, 251)'} : {}}>
                    <td style={{...tdStyle, fontWeight: '500'}}>{pkg.name}</td>
                    <td style={{...tdStyle, textAlign: 'center'}}>{pkg.totalBooking}</td>
                    <td style={{...tdStyle, textAlign: 'center', fontWeight: '500'}}>{pkg.revenue}</td>
                    <td style={{...tdStyle, textAlign: 'center'}}>{pkg.bookingPct}</td>
                    <td style={{...tdStyle, textAlign: 'center', fontSize: '16px'}}>
                      {pkg.rating ? '★'.repeat(Math.floor(pkg.rating)) + '☆'.repeat(5 - Math.floor(pkg.rating)) : 'N/A'}
                    </td>
                    <td style={{
                      ...tdStyle, 
                      textAlign: 'center',
                      color: pkg.trendPositive ? 'rgb(5, 150, 105)' : 'rgb(220, 38, 38)',
                      fontWeight: '500'
                    }}>
                      <span style={{fontSize: '16px', marginRight: '4px'}}>
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
        marginTop: '50px',
        paddingTop: '20px',
        borderTop: '2px solid rgb(209, 213, 219)',
        fontSize: '13px',
        color: 'rgb(107, 114, 128)'
      }}>
        <div style={{marginBottom: '8px', fontWeight: '500'}}>
          This report was generated automatically by {data.companyInfo.name} Dashboard System
        </div>
        <div style={{fontSize: '12px'}}>
          © 2025 {data.companyInfo.name}. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default DashboardReportPDF;