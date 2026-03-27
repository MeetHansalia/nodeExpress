'use client';
import { useState } from "react";
import axios from 'axios';

export default function Home() {
  const [jokes, setJokes] = useState([]);
  const [loading, setLoading] = useState(false);

  const getJokes = async () => {
    setLoading(true);
    axios.get('http://localhost:4000/api/jokes')
      .then((response) => {
        setJokes(response.data);
      })
      .catch((error) => {
        console.error('Error fetching jokes:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Full stack project</h1>

      <button className="bg-blue-500 text-white p-2 rounded-md" onClick={getJokes} disabled={loading}>{loading ? 'Loading...' : 'Get Jokes'}</button>
      <div>
        {jokes.map((joke) => (
          <div key={joke.id}>
            <h2>{joke.id}</h2>
            <p>Joke - {joke.joke}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
