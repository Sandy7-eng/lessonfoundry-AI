'use client';

import React, { useState } from 'react';
import type { LearningUnit, User } from '@/types';
import { MOCK_UNITS, MOCK_USER } from '@/lib/mockData';
import { Sidebar } from '@/components/common/Sidebar';
import { Header } from '@/components/common/Header';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { WorkspaceView } from '@/components/workspace/WorkspaceView';
import { QualityOverview } from '@/components/dashboard/QualityOverview';
import { NewUnitModal } from '@/components/dashboard/NewUnitModal';
import { StudentView } from '@/components/student/StudentView';
import { AuthModal } from '@/components/auth/AuthModal';

export default function Home() {
  const [units, setUnits] = useState<LearningUnit[]>(MOCK_UNITS);
  const [activeUnitId, setActiveUnitId] = useState<string>('unit-001');
  const [currentView, setCurrentView] = useState<'workspace' | 'dashboard' | 'quality-overview'>('workspace');
  const [isStudentMode, setIsStudentMode] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USER);

  // Modals
  const [isNewUnitModalOpen, setIsNewUnitModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeUnit = units.find((u) => u.id === activeUnitId) || units[0];

  // Update a single unit in state
  const handleUpdateUnit = (updated: LearningUnit) => {
    setUnits((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  };

  // Create new unit
  const handleCreateUnit = (newUnit: LearningUnit) => {
    setUnits((prev) => [newUnit, ...prev]);
    setActiveUnitId(newUnit.id);
    setCurrentView('workspace');
  };

  // Delete unit
  const handleDeleteUnit = (unitId: string) => {
    setUnits((prev) => prev.filter((u) => u.id !== unitId));
    if (activeUnitId === unitId) {
      const remaining = units.filter((u) => u.id !== unitId);
      if (remaining.length > 0) {
        setActiveUnitId(remaining[0].id);
      } else {
        setCurrentView('dashboard');
      }
    }
  };

  // Duplicate unit
  const handleDuplicateUnit = (unitId: string) => {
    const original = units.find((u) => u.id === unitId);
    if (!original) return;

    const duplicated: LearningUnit = {
      ...original,
      id: `unit-${Math.random().toString(36).slice(2, 9)}`,
      title: `${original.title} (Copy)`,
      status: 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setUnits((prev) => [duplicated, ...prev]);
  };

  // If in student mode, render full-screen student view
  if (isStudentMode && activeUnit) {
    return (
      <StudentView
        unit={activeUnit}
        onExit={() => setIsStudentMode(false)}
      />
    );
  }

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar
        units={units}
        activeUnitId={activeUnitId}
        onSelectUnit={(id) => {
          setActiveUnitId(id);
          setCurrentView('workspace');
        }}
        onGoToDashboard={() => setCurrentView('dashboard')}
        onOpenNewUnit={() => setIsNewUnitModalOpen(true)}
        onOpenQualityOverview={() => setCurrentView('quality-overview')}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        currentView={currentView}
      />

      {/* Main Area */}
      <div className="main-area">
        {/* Top Header */}
        <Header
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          activeUnit={currentView === 'workspace' ? activeUnit : null}
          currentView={currentView}
          onGoToDashboard={() => setCurrentView('dashboard')}
          onOpenNewUnit={() => setIsNewUnitModalOpen(true)}
          onOpenStudentMode={() => setIsStudentMode(true)}
          onOpenQualityOverview={() => setCurrentView('quality-overview')}
        />

        {/* View Routing */}
        <main className="content-area" style={{ padding: 0 }}>
          {currentView === 'dashboard' && (
            <div style={{ padding: 'var(--space-8)' }}>
              <DashboardView
                units={units}
                onSelectUnit={(id) => {
                  setActiveUnitId(id);
                  setCurrentView('workspace');
                }}
                onOpenNewUnit={() => setIsNewUnitModalOpen(true)}
                onOpenStudentMode={(id) => {
                  setActiveUnitId(id);
                  setIsStudentMode(true);
                }}
                onDeleteUnit={handleDeleteUnit}
                onDuplicateUnit={handleDuplicateUnit}
              />
            </div>
          )}

          {currentView === 'workspace' && activeUnit && (
            <WorkspaceView
              unit={activeUnit}
              onUpdateUnit={handleUpdateUnit}
              onOpenStudentMode={() => setIsStudentMode(true)}
            />
          )}

          {currentView === 'quality-overview' && (
            <div style={{ padding: 'var(--space-8)' }}>
              <QualityOverview
                units={units}
                onSelectUnit={(id) => {
                  setActiveUnitId(id);
                  setCurrentView('workspace');
                }}
              />
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <NewUnitModal
        isOpen={isNewUnitModalOpen}
        onClose={() => setIsNewUnitModalOpen(false)}
        onCreateUnit={handleCreateUnit}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUpdateUser={(u) => setCurrentUser(u)}
      />
    </div>
  );
}
