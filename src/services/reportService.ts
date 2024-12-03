import { Report } from '../types';
import { storageService } from './storageService';
import { geoUtils } from '../utils/geoUtils';

export const reportService = {
  submitReport(report: Report) {
    const reports = storageService.getReports();
    reports.push(report);
    storageService.saveReports(reports);
    return this.checkCriticalArea(report.location.lat, report.location.lng);
  },

  getReportsByLocation(lat: number, lng: number, radiusKm: number = 1) {
    const reports = storageService.getReports();
    return reports.filter(report => {
      const distance = geoUtils.calculateDistance(
        lat,
        lng,
        report.location.lat,
        report.location.lng
      );
      return distance <= radiusKm;
    });
  },

  getCriticalAreas() {
    const reports = storageService.getReports();
    const locations = new Map<string, { count: number; reports: Report[] }>();

    reports.forEach(report => {
      const key = `${report.location.lat.toFixed(4)},${report.location.lng.toFixed(4)}`;
      if (!locations.has(key)) {
        locations.set(key, { count: 0, reports: [] });
      }
      const location = locations.get(key)!;
      location.count++;
      location.reports.push(report);
    });

    return Array.from(locations.entries())
      .filter(([, data]) => data.count >= 3)
      .map(([key, data]) => ({
        location: key.split(',').map(Number),
        count: data.count,
        reports: data.reports,
        severity: this.calculateSeverity(data.count)
      }));
  },

  calculateSeverity(count: number): 'low' | 'medium' | 'high' | 'critical' {
    if (count >= 10) return 'critical';
    if (count >= 7) return 'high';
    if (count >= 3) return 'medium';
    return 'low';
  },

  checkCriticalArea(lat: number, lng: number) {
    const nearbyReports = this.getReportsByLocation(lat, lng);
    const isCritical = nearbyReports.length >= 3;

    if (isCritical) {
      // Update reports status to 'reported'
      nearbyReports.forEach(report => {
        report.status = 'reported';
        storageService.updateReport(report);
      });
    }

    return {
      isCritical,
      count: nearbyReports.length,
      reports: nearbyReports
    };
  },

  reportToCybercrime(reports: Report[]) {
    // Update status of all reports to 'reported'
    reports.forEach(report => {
      report.status = 'reported';
      storageService.updateReport(report);
    });

    // In a real application, this would make an API call to the cybercrime portal
    console.log('Reports submitted to cybercrime portal:', reports);
    
    return {
      success: true,
      message: 'Reports have been submitted to cybercrime authorities',
      reportedCount: reports.length
    };
  }
};