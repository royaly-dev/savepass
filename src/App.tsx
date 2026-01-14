import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import MasterPasswordSetup from '@/components/MasterPasswordSetup';
import MasterPasswordCheck from '@/components/MasterPasswordCheck';

function Homepage() {

  const [test, setTest] = useState("tt");

  useEffect(() => {
    const t: any = window

    setTest(t.savepass.IsRegistred())

  }, [])

  return (
    <>
      <MasterPasswordCheck />
      <MasterPasswordSetup />
    </>
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