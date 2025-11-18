"use client";

import {
  Authenticated,
  Unauthenticated,
} from "convex/react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Navigation } from "./components/shared/navigation/Navigation";
import { DashboardPage } from "./components/pages/dashboardPage/DashboardPage";
import { UsersPage } from "./components/pages/usersPage/UsersPage";
import { ListsPage } from "./components/pages/listsPage/ListsPage";
import { SendPage } from "./components/pages/sendPage/SendPage";
import { AnalyticsPage } from "./components/pages/analyticsPage/AnalyticsPage";
import { ListDetailPage } from "./components/pages/listDetailPage/ListDetailPage";
import { SignInForm } from "./components/shared/auth/SignInForm";

export default function App() {
  return (
    <>
      <Authenticated>
        <Navigation />
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/lists" element={<ListsPage />} />
            <Route path="/lists/:listId" element={<ListDetailPage />} />
            <Route path="/send" element={<SendPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </Authenticated>
      <Unauthenticated>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <SignInForm />
        </div>
      </Unauthenticated>
    </>
  );
}
