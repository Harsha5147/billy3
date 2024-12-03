import Dexie, { Table } from 'dexie';
import { Report, Question, Experience, Answer } from '../types';

export class CyberGuardDB extends Dexie {
  reports!: Table<Report>;
  questions!: Table<Question>;
  experiences!: Table<Experience>;

  constructor() {
    super('CyberGuardDB');
    
    this.version(1).stores({
      reports: '++id, userId, status, severity, timestamp',
      questions: '++id, userId, status, timestamp',
      experiences: '++id, userId, status, timestamp'
    });
  }

  async getAllReports(): Promise<Report[]> {
    return await this.reports.toArray();
  }

  async getReportsByUser(userId: string): Promise<Report[]> {
    return await this.reports.where('userId').equals(userId).toArray();
  }

  async addReport(report: Report): Promise<string> {
    return await this.reports.add(report);
  }

  async updateReport(id: string, changes: Partial<Report>): Promise<number> {
    return await this.reports.update(id, changes);
  }

  async getAllQuestions(): Promise<Question[]> {
    return await this.questions.toArray();
  }

  async addQuestion(question: Question): Promise<string> {
    return await this.questions.add(question);
  }

  async updateQuestion(id: string, changes: Partial<Question>): Promise<number> {
    return await this.questions.update(id, changes);
  }

  async getAllExperiences(): Promise<Experience[]> {
    return await this.experiences.toArray();
  }

  async addExperience(experience: Experience): Promise<string> {
    return await this.experiences.add(experience);
  }

  async updateExperience(id: string, changes: Partial<Experience>): Promise<number> {
    return await this.experiences.update(id, changes);
  }
}

export const db = new CyberGuardDB();