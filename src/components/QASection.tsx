import React, { useState } from 'react';
import { MessageCircle, ThumbsUp, Share2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Question {
  id: string;
  userId: string;
  username: string;
  title: string;
  content: string;
  timestamp: Date;
  answers: Answer[];
  isAnonymous: boolean;
}

interface Answer {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: Date;
  isAnonymous: boolean;
  likes: number;
}

const QASection: React.FC = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState({ title: '', content: '', isAnonymous: false });
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [newAnswer, setNewAnswer] = useState({ content: '', isAnonymous: false });

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const question: Question = {
      id: Date.now().toString(),
      userId: user.id,
      username: newQuestion.isAnonymous ? 'Anonymous' : user.username,
      title: newQuestion.title,
      content: newQuestion.content,
      timestamp: new Date(),
      answers: [],
      isAnonymous: newQuestion.isAnonymous
    };

    setQuestions([question, ...questions]);
    setNewQuestion({ title: '', content: '', isAnonymous: false });
  };

  const handleAnswerSubmit = (questionId: string) => {
    if (!user || !selectedQuestion) return;

    const answer: Answer = {
      id: Date.now().toString(),
      userId: user.id,
      username: newAnswer.isAnonymous ? 'Anonymous' : user.username,
      content: newAnswer.content,
      timestamp: new Date(),
      isAnonymous: newAnswer.isAnonymous,
      likes: 0
    };

    const updatedQuestions = questions.map(q =>
      q.id === questionId
        ? { ...q, answers: [...q.answers, answer] }
        : q
    );

    setQuestions(updatedQuestions);
    setNewAnswer({ content: '', isAnonymous: false });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6">Q&A Community</h2>
        
        <form onSubmit={handleQuestionSubmit} className="mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question Title
              </label>
              <input
                type="text"
                value={newQuestion.title}
                onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="What would you like to ask?"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Details
              </label>
              <textarea
                value={newQuestion.content}
                onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                rows={4}
                placeholder="Provide more context about your question..."
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={newQuestion.isAnonymous}
                onChange={(e) => setNewQuestion({ ...newQuestion, isAnonymous: e.target.checked })}
                className="rounded text-indigo-600"
              />
              <label htmlFor="anonymous" className="text-sm text-gray-600">
                Post anonymously
              </label>
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Ask Question
            </button>
          </div>
        </form>

        <div className="space-y-6">
          {questions.map((question) => (
            <div key={question.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{question.title}</h3>
                  <p className="text-sm text-gray-500">
                    Asked by {question.username} • {new Date(question.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedQuestion(selectedQuestion?.id === question.id ? null : question)}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  {question.answers.length} answers
                </button>
              </div>
              <p className="text-gray-700 mb-4">{question.content}</p>
              
              {selectedQuestion?.id === question.id && (
                <div className="mt-4 space-y-4">
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Answers</h4>
                    {question.answers.map((answer) => (
                      <div key={answer.id} className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm text-gray-500">
                            {answer.username} • {new Date(answer.timestamp).toLocaleDateString()}
                          </p>
                          <div className="flex items-center gap-2">
                            <button className="flex items-center gap-1 text-gray-500 hover:text-indigo-600">
                              <ThumbsUp size={16} />
                              <span>{answer.likes}</span>
                            </button>
                            <button className="text-gray-500 hover:text-indigo-600">
                              <Share2 size={16} />
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-700">{answer.content}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Add an Answer</h4>
                    <div className="space-y-4">
                      <textarea
                        value={newAnswer.content}
                        onChange={(e) => setNewAnswer({ ...newAnswer, content: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        rows={3}
                        placeholder="Share your experience or advice..."
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`anonymous-answer-${question.id}`}
                            checked={newAnswer.isAnonymous}
                            onChange={(e) => setNewAnswer({ ...newAnswer, isAnonymous: e.target.checked })}
                            className="rounded text-indigo-600"
                          />
                          <label htmlFor={`anonymous-answer-${question.id}`} className="text-sm text-gray-600">
                            Answer anonymously
                          </label>
                        </div>
                        <button
                          onClick={() => handleAnswerSubmit(question.id)}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Submit Answer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QASection;