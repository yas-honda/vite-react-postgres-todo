
import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import type { Task } from './types';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/getTasks');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred.');
      }
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddTask = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTaskText.trim()) {
      return;
    }

    try {
      const response = await fetch('/api/addTask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newTaskText }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add task. Status: ${response.status}`);
      }
      
      setNewTaskText('');
      await getTasks(); // Refresh the list
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred while adding the task.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-start justify-center pt-10 sm:pt-20 font-sans">
      <div className="w-full max-w-lg mx-4 p-6 sm:p-8 bg-gray-800 rounded-xl shadow-2xl">
        <h1 className="text-4xl font-bold text-center text-cyan-400 mb-6">
          My ToDo List
        </h1>
        
        <form onSubmit={handleAddTask} className="flex gap-3 mb-6">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Add a new task..."
            className="flex-grow bg-gray-700 border-2 border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
          />
          <button
            type="submit"
            className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500"
          >
            Add
          </button>
        </form>

        {error && <p className="text-red-400 text-center mb-4">{`Error: ${error}`}</p>}

        <div className="space-y-4">
          {loading ? (
             <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
             </div>
          ) : tasks.length > 0 ? (
            <ul className="divide-y divide-gray-700">
              {tasks.map((task) => (
                <li key={task.id} className="py-4 flex items-center justify-between">
                  <span className="text-lg">{task.text}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(task.created_at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 py-4">
              No tasks yet. Add one above!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
