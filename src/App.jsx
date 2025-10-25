import React, { useState, useEffect } from 'react';
import { RefreshCw, HelpCircle, TrendingUp } from 'lucide-react';

const CLAUDE_API_KEY = 'your-anthropic-api-key'; // Replace with your Claude key

const topics = {
  junior: ['Algebra', 'Geometry', 'Probability'],
  leaving: ['Functions', 'Trigonometry', 'Calculus'],
};

const generatePrompt = (topic, level) => {
  return `Generate a math question for an Irish secondary student studying ${level} level ${topic}. Format it clearly and include the correct answer and a hint.`;
};

const explainPrompt = (question, level) => {
  return `Explain how to solve this math question for an Irish secondary student at ${level} level: "${question}". Use step-by-step exam-style language.`;
};

const hintPrompt = (question, level) => {
  return `Give a helpful hint for solving this math question without revealing the answer. Question: "${question}". Level: ${level}.`;
};

const callClaude = async (prompt) => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': CLAUDE_API_KEY,
      'content-type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-2.1',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const data = await response.json();
  return data?.content?.[0]?.text || 'AI explanation unavailable.';
};

export default function App() {
  const [level, setLevel] = useState('junior');
  const [topic, setTopic] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [hint, setHint] = useState('');
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [explanation, setExplanation] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [streak, setStreak] = useState(0);
  const [total, setTotal] = useState(0);
  const [correct, setCorrect] = useState(0);

  const loadQuestion = async () => {
    const selectedTopic = topics[level][Math.floor(Math.random() * topics[level].length)];
    setTopic(selectedTopic);
    const prompt = generatePrompt(selectedTopic, level);
    const raw = await callClaude(prompt);
    const parts = raw.split('Answer:');
    setQuestion(parts[0].trim());
    setAnswer(parts[1]?.trim() || '');
    setHint('');
    setExplanation('');
    setInput('');
    setFeedback('');
    setShowHint(false);
  };

  const handleSubmit = async () => {
    setTotal(total + 1);
    if (input.trim() === answer.trim()) {
      setFeedback('✅ Correct!');
      setCorrect(correct + 1);
      setStreak(streak + 1);
    } else {
      setFeedback(`❌ Incorrect. Correct answer: ${answer}`);
      setStreak(0);
    }
    const explain = await callClaude(explainPrompt(question, level));
    setExplanation(explain);
  };

  const handleHint = async () => {
    const hintText = await callClaude(hintPrompt(question, level));
    setHint(hintText);
    setShowHint(true);
  };

  useEffect(() => {
    loadQuestion();
  }, [level]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-6 flex flex-col items-center justify-center font-sans">
      <h1 className="text-3xl font-bold mb-4">📚 Smart Math Coach</h1>
      <div className="mb-4">
        <label className="mr-2">Level:</label>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="text-black p-2 rounded"
        >
          <option value="junior">Junior Cycle</option>
          <option value="leaving">Leaving Cert</option>
        </select>
      </div>

      <div className="bg-white text-black rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-2">Topic: {topic}</h2>
        <p className="mb-4">{question}</p>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Your answer"
          className="border p-2 w-full mb-2"
        />
        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-4 py-2 rounded mr-2"
        >
          Submit Answer
        </button>
        <button
          onClick={handleHint}
          className="bg-yellow-500 text-white px-4 py-2 rounded"
        >
          <HelpCircle className="inline mr-1" /> Why?
        </button>
        {feedback && <p className="mt-4 font-bold">{feedback}</p>}
        {showHint && <p className="mt-2 italic text-sm text-gray-700">{hint}</p>}
        {explanation && (
          <div className="mt-4 text-sm text-gray-800 bg-gray-100 p-3 rounded">
            <strong>AI Explanation:</strong>
            <p>{explanation}</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={loadQuestion}
          className="bg-blue-500 px-4 py-2 rounded text-white"
        >
          <RefreshCw className="inline mr-1" /> Try Another
        </button>
        <div className="text-sm">
          <TrendingUp className="inline mr-1" />
          Streak: {streak} | Accuracy: {total ? Math.round((correct / total) * 100) : 0}%
        </div>
      </div>
    </div>
  );
}
