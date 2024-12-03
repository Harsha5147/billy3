import { Report } from '../types';

export const cybercrimeService = {
  async reportToCybercrime(reports: Report[], location: string) {
    // In a real application, this would make an API call to the cybercrime portal
    console.log(`Reporting ${reports.length} incidents from ${location} to cybercrime authorities`);

    // Update report status
    reports.forEach(report => {
      report.status = 'reported';
    });

    return {
      success: true,
      reportedCount: reports.length,
      message: `Successfully reported ${reports.length} incidents from ${location} to cybercrime authorities`
    };
  },

  shouldReportToCybercrime(reports: Report[]): boolean {
    if (reports.length < 3) return false;
    
    // Check if any reports are already reported
    const unreportedCount = reports.filter(r => r.status !== 'reported').length;
    return unreportedCount >= 3;
  }
};