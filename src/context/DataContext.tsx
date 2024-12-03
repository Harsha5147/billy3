import React, { createContext, useContext, useState, useEffect } from 'react';
import { Report, Story, Question, Experience, Answer } from '../types';
import { db } from '../services/db';
import { useAuth } from './AuthContext';

interface DataContextType {
  reports: Report[];
  questions: Question[];
  experiences: Experience[];
  userReports: Report[];
  userQuestions: Question[];
  userExperiences: Experience[];
  addReport: (report: Omit<Report, 'id'>) => Promise<void>;
  addQuestion: (question: Omit<Question, 'id'>) => Promise<void>;
  addExperience: (experience: Omit<Experience, 'id'>) => Promise<void>;
  addAnswer: (questionId: string, answer: Omit<Answer, 'id'>) => Promise<void>;
  updateExperienceStatus: (id: string, status: 'approved' | 'rejected') => Promise<void>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [userReports, setUserReports] = useState<Report[]>([]);
  const [userQuestions, setUserQuestions] = useState<Question[]>([]);
  const [userExperiences, setUserExperiences] = useState<Experience[]>([]);

  const refreshData = async () => {
    try {
      const [allReports, allQuestions, allExperiences] = await Promise.all([
        db.getAllReports(),
        db.getAllQuestions(),
        db.getAllExperiences()
      ]);

      setReports(allReports);
      setQuestions(allQuestions);
      setExperiences(allExperiences);

      if (user) {
        setUserReports(allReports.filter(r => r.userId === user.id));
        setUserQuestions(allQuestions.filter(q => q.userId === user.id));
        setUserExperiences(allExperiences.filter(e => e.userId === user.id));
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  useEffect(() => {
    refreshData();
  }, [user]);

  const addReport = async (report: Omit<Report, 'id'>) => {
    await db.addReport(report as Report);
    await refreshData();
  };

  const addQuestion = async (question: Omit<Question, 'id'>) => {
    await db.addQuestion(question as Question);
    await refreshData();
  };

  const addExperience = async (experience: Omit<Experience, 'id'>) => {
    await db.addExperience(experience as Experience);
    await refreshData();
  };

  const addAnswer = async (questionId: string, answer: Omit<Answer, 'id'>) => {
    const question = questions.find(q => q.id === questionId);
    if (question) {
      const updatedQuestion = {
        ...question,
        answers: [...question.answers, { ...answer, id: Date.now().toString() }]
      };
      await db.updateQuestion(questionId, updatedQuestion);
      await refreshData();
    }
  };

  const updateExperienceStatus = async (id: string, status: 'approved' | 'rejected') => {
    await db.updateExperience(id, { status });
    await refreshData();
  };

  return (
    <DataContext.Provider value={{
      reports,
      questions,
      experiences,
      userReports,
      userQuestions,
      userExperiences,
      addReport,
      addQuestion,
      addExperience,
      addAnswer,
      updateExperienceStatus,
      refreshData
    }}>
      {children}
    </DataContext.Provider>
  );
};