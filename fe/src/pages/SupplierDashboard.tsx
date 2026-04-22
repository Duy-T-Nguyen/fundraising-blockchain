import React, { useState } from 'react';
import { Building } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useSupplier } from '../hooks/useSupplier';
import { useSupplierTasks } from '../hooks/useSupplierTasks';
import { useSupplierEvidence } from '../hooks/useSupplierEvidence';

// Modular Components
import { SupplierDashboardHeader } from '../components/supplier/SupplierDashboardHeader';
import { SupplierOverview } from '../components/supplier/SupplierOverview';
import { SupplierTaskQueue } from '../components/supplier/SupplierTaskQueue';
import { SupplierProfile } from '../components/supplier/SupplierProfile';

const SupplierDashboard: React.FC = () => {
  const { address, connect, isConnected } = useWallet();
  const { info, isLoading, isUpdating, updateInfo } = useSupplier(address || undefined);
  const { tasks, isLoading: isTasksLoading, refresh: refreshTasks } = useSupplierTasks(address || undefined);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'evidence' | 'profile'>('dashboard');

  // Custom Evidence Hook
  const {
    uploadingTaskId,
    uploadedEvidences,
    fileInputRef,
    startUpload,
    handleFileChange,
    openIPFS
  } = useSupplierEvidence(address || undefined, isConnected, connect);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] gap-6">
        <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Querying blockchain state...</p>
      </div>
    );
  }

  if (!info?.isRegistered) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#f8fafc]">
        <div className="w-24 h-24 bg-white border border-slate-100 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-sm">
          <Building size={40} className="text-slate-300" />
        </div>
        <h1 className="text-4xl font-black mb-4 text-slate-900 tracking-tight">Restricted Portal</h1>
        <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium leading-relaxed">
          Access to the Supplier Dashboard is exclusive to verified partners. 
          Your wallet is not currently whitelisted in the Supplier Registry.
        </p>
      </div>
    );
  }

  const activeTasksCount = tasks.filter(t => !t.complete).length;

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-4 lg:px-12">
        
        {/* Modular Header */}
        <SupplierDashboardHeader 
          name={info.name}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pendingTasksCount={activeTasksCount}
        />

        {/* Tab Content Orchestration */}
        <div className="relative">
          {activeTab === 'dashboard' && (
            <SupplierOverview 
              info={info}
              tasks={tasks}
              isLoading={isTasksLoading}
              onRefresh={refreshTasks}
            />
          )}

          {activeTab === 'evidence' && (
            <SupplierTaskQueue 
              tasks={tasks}
              isLoading={isTasksLoading}
              onRefresh={refreshTasks}
              uploadedEvidences={uploadedEvidences}
              uploadingTaskId={uploadingTaskId}
              onUpload={startUpload}
              onOpenIPFS={openIPFS}
            />
          )}

          {activeTab === 'profile' && (
            <SupplierProfile 
              info={info}
              isUpdating={isUpdating}
              onUpdate={updateInfo}
            />
          )}
        </div>

        {/* Hidden File Input for useSupplierEvidence */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={(e) => handleFileChange(e, refreshTasks)} 
        />
      </div>
    </div>
  );
};

export default SupplierDashboard;
