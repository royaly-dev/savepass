import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

function Homepage() {

  const [test, setTest] = useState("tt");

  useEffect(() => {
    const t: any = window

    setTest(t.test.test()[0])

  }, [])

  return (
    <div className="p-5">
      <h1 className="font-bold text-2xl underline text-red-700">
        test : {test}
      </h1>
      <p className="mt-4 text-gray-600 animate-bounce">test tailwinds</p>
      <Card>
        <CardHeader>
          <CardTitle>Test shadcn ui title</CardTitle>
          <CardDescription>Test shadcn ui description</CardDescription>
          <CardAction>Test shadcn ui action</CardAction>
        </CardHeader>
        <CardContent>
          <p>Test shadcn ui content</p>
        </CardContent>
        <CardFooter>
          <p>Test shadcn ui footer</p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
      </Routes>
    </Router>
  );
}