import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './components/common/NotificationSystem';
import ProtectedRoute from './components/common/ProtectedRoute';

// Authentication Components
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';

// Dashboard Components
import AdminDashboard from './components/admin/AdminDashboard';
import UserDashboard from './components/user/UserDashboard';
import UserProfile from './components/user/UserProfile';

// Audit Management Components
import AuditDashboard from './components/audit/AuditDashboard';
import CreateAudit from './components/audit/CreateAudit';
import AuditDetail from './components/audit/AuditDetail';
import AuditSynthese from './components/audit/AuditSynthese';
import PointsForts from './components/audit/PointsForts';
import Constats from './components/audit/Constats';
import PlanActionComponent from './components/audit/PlanAction';

// Project Security Management Components
import ProjectDashboard from './components/project/ProjectDashboard';
import CreateProject from './components/project/CreateProject';
import CreateProjet from './components/project/CreateProjet';
import ProjectDetail from './components/project/ProjectDetail';

// SWOT Analysis Components
import SWOTDashboard from './components/swot/SWOTDashboard';
import CreateSWOT from './components/swot/CreateSWOT';
import CreateSWOTConstat from './components/swot/CreateSWOTConstat';
import CreateSWOTProjet from './components/swot/CreateSWOTProjet';
import EditSWOTProjet from './components/swot/EditSWOTProjet';
import SWOTProjetDashboard from './components/swot/SWOTProjetDashboard';
import SWOTDetail from './components/swot/SWOTDetail';

// Risk Analysis Components
import RiskDashboard from './components/risk/RiskDashboard';
import CreateRisk from './components/risk/CreateRisk';
import CreateRisqueConstat from './components/risk/CreateRisqueConstat';
import CreateRisqueProjet from './components/risk/CreateRisqueProjet';
import RisqueProjetDashboard from './components/risk/RisqueProjetDashboard';
import RiskDetail from './components/risk/RiskDetail';

// Conception Components
import ConceptionDashboard from './components/conception/ConceptionDashboard';
import CreateConception from './components/conception/CreateConception';
import CreateConceptionConstat from './components/conception/CreateConceptionConstat';
import CreateConceptionProjet from './components/conception/CreateConceptionProjet';
import ConceptionProjetDashboard from './components/conception/ConceptionProjetDashboard';
import ConceptionDetail from './components/conception/ConceptionDetail';

// Normes Components
import NormesDashboard from './components/normes/NormesDashboard';
import CreateNorme from './components/normes/CreateNorme';
import NormeDetail from './components/normes/NormeDetail';

// Preuves Components
import PreuvesDashboard from './components/preuves/PreuvesDashboard';
import CreatePreuve from './components/preuves/CreatePreuve';
import PreuveDetail from './components/preuves/PreuveDetail';

// Recommandations Components
import RecommandationsDashboard from './components/recommandations/RecommandationsDashboard';
import CreateRecommandation from './components/recommandations/CreateRecommandation';
import RecommandationDetail from './components/recommandations/RecommandationDetail';

// Constats Components
import ConstatsDashboard from './components/constats/ConstatsDashboard';
import CreateConstat from './components/constats/CreateConstat';
import ConstatDetail from './components/constats/ConstatDetail';

// Plan Actions Components
import PlanActionsDashboard from './components/planactions/PlanActionsDashboard';
import CreatePlanAction from './components/planactions/CreatePlanAction';
import PlanActionDetail from './components/planactions/PlanActionDetail';

// Reports Components
import ReportsDashboard from './components/reports/ReportsDashboard';

// PAS Components
import PASProjetDashboard from './components/pas/PASProjetDashboard';
import CreatePASProjet from './components/pas/CreatePASProjet';
import PASDetail from './components/pas/PASDetail';

// SecuriteProjet Components
import SecuriteProjetForm from './components/securite/SecuriteProjetForm';
import LandingPage from './components/LandingPage';

// Dashboard redirect component
const DashboardRedirect: React.FC = () => {
  const { user } = useAuth();
  
  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }
  if (user?.role === 'RSSI') {
    return <Navigate to="/rssi" replace />;
  }
  return <Navigate to="/ssi" replace />;
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Landing Page (always shown at /) */}
          <Route path="/" element={<LandingPage />} />
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes - Admin */}
          <Route path="/admin" element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
          } />

          {/* Protected Routes - SSI Users */}
          <Route path="/ssi" element={
            <ProtectedRoute requiredRole="SSI">
              <UserDashboard />
            </ProtectedRoute>
          } />

          {/* Protected Routes - RSSI Users */}
          <Route path="/rssi" element={
            <ProtectedRoute requiredRole="RSSI">
                <UserDashboard />
              </ProtectedRoute>
          } />

          {/* Dashboard redirect route */}
          <Route path="/dashboard" element={
            <ProtectedRoute requiredRole={["SSI", "RSSI", "ADMIN"]}>
              <DashboardRedirect />
            </ProtectedRoute>
          } />

          {/* Protected Route - User Profile (All authenticated users) */}
          <Route path="/profile" element={
            <ProtectedRoute requiredRole={["SSI", "RSSI", "ADMIN"]}>
              <UserProfile />
            </ProtectedRoute>
          } />

          {/* Protected Routes - Audit Management (SSI & RSSI) */}
          <Route path="/audits" element={
            <ProtectedRoute requiredRole={["SSI", "RSSI"]}>
              <AuditDashboard />
            </ProtectedRoute>
          } />
          <Route path="/audits/new" element={
            <ProtectedRoute requiredRole={["SSI", "RSSI"]}>
              <CreateAudit />
            </ProtectedRoute>
          } />
          <Route path="/audits/:id" element={
            <ProtectedRoute requiredRole={["SSI", "RSSI"]}>
              <AuditDetail />
            </ProtectedRoute>
          } />
          <Route path="/audits/:id/synthese" element={
            <ProtectedRoute requiredRole={["SSI", "RSSI"]}>
              <AuditSynthese />
            </ProtectedRoute>
          } />
          <Route path="/audits/:id/points-forts" element={
            <ProtectedRoute requiredRole={["SSI", "RSSI"]}>
              <PointsForts />
            </ProtectedRoute>
          } />
          <Route path="/audits/:id/constats" element={
            <ProtectedRoute requiredRole={["SSI", "RSSI"]}>
              <Constats />
            </ProtectedRoute>
          } />
          <Route path="/audits/:id/plan-action" element={
            <ProtectedRoute requiredRole={["SSI", "RSSI"]}>
              <PlanActionComponent />
            </ProtectedRoute>
          } />

          {/* Protected Routes - Project Security Management (SSI & RSSI) */}
          <Route path="/projects" element={
            <ProtectedRoute requiredRole={["SSI", "RSSI"]}>
              <ProjectDashboard />
            </ProtectedRoute>
          } />
          <Route path="/projects/new" element={
            <ProtectedRoute requiredRole={["SSI", "RSSI"]}>
              <CreateProject />
            </ProtectedRoute>
          } />
          <Route path="/projets/new" element={
            <ProtectedRoute requiredRole={["SSI", "RSSI"]}>
              <CreateProjet />
            </ProtectedRoute>
          } />
          <Route path="/projets/:id" element={
            <ProtectedRoute requiredRole={["SSI", "RSSI"]}>
              <ProjectDetail />
            </ProtectedRoute>
          } />

          {/* Protected Routes - SWOT Analysis (SSI & RSSI) */}
          <Route path="/projects/:id/swot" element={
            <ProtectedRoute requiredRole={["SSI", "RSSI"]}>
              <SWOTDashboard />
            </ProtectedRoute>
          } />
          <Route path="/projects/:id/swot/new" element={
            <ProtectedRoute requiredRole={["SSI", "RSSI"]}>
              <CreateSWOT />
            </ProtectedRoute>
          } />
          <Route path="/projects/:id/swot/:swotId" element={
            <ProtectedRoute requiredRole={["SSI", "RSSI"]}>
              <SWOTDetail />
            </ProtectedRoute>
          } />

          {/* Protected Routes - Risk Analysis (SSI & RSSI) */}
          <Route path="/projects/:id/risks" element={
            <ProtectedRoute requiredRole={["SSI", "RSSI"]}>
              <RiskDashboard />
            </ProtectedRoute>
          } />
          <Route path="/projects/:id/risks/new" element={
            <ProtectedRoute requiredRole={["SSI", "RSSI"]}>
              <CreateRisk />
            </ProtectedRoute>
          } />
          <Route path="/projects/:id/risks/:riskId" element={
            <ProtectedRoute requiredRole={["SSI", "RSSI"]}>
              <RiskDetail />
            </ProtectedRoute>
          } />

          {/* Protected Routes - Conception (SSI & RSSI) */}
          <Route path="/projects/:id/conception" element={
            <ProtectedRoute requiredRole={["SSI", "RSSI"]}>
              <ConceptionDashboard />
            </ProtectedRoute>
          } />
          <Route path="/projects/:id/conception/new" element={
            <ProtectedRoute requiredRole={["SSI", "RSSI"]}>
              <CreateConception />
            </ProtectedRoute>
          } />
          <Route path="/projects/:id/conception/:conceptionId" element={
            <ProtectedRoute requiredRole={["SSI", "RSSI"]}>
              <ConceptionDetail />
            </ProtectedRoute>
          } />

          {/* Protected Routes - Normes (All Users) */}
          <Route path="/normes" element={
            <ProtectedRoute requiredRole={["ADMIN", "SSI", "RSSI"]}>
              <NormesDashboard />
            </ProtectedRoute>
          } />
          <Route path="/normes/new" element={
            <ProtectedRoute requiredRole={["SSI", "RSSI"]}>
              <CreateNorme />
            </ProtectedRoute>
          } />
          <Route path="/normes/:normeId" element={
            <ProtectedRoute requiredRole={["ADMIN", "SSI", "RSSI"]}>
              <NormeDetail />
            </ProtectedRoute>
          } />

          {/* Protected Routes - Preuves (All Users) */}
          <Route path="/preuves" element={
            <ProtectedRoute requiredRole={["ADMIN", "SSI", "RSSI"]}>
              <PreuvesDashboard />
            </ProtectedRoute>
          } />
          <Route path="/preuves/new" element={
            <ProtectedRoute requiredRole={["SSI", "RSSI"]}>
              <CreatePreuve />
            </ProtectedRoute>
          } />
          <Route path="/preuves/:preuveId" element={
            <ProtectedRoute requiredRole={["ADMIN", "SSI", "RSSI"]}>
              <PreuveDetail />
            </ProtectedRoute>
          } />

            {/* Protected Routes - Recommandations (All Users) */}
            <Route path="/recommandations" element={
              <ProtectedRoute requiredRole={["ADMIN", "SSI", "RSSI"]}>
                <RecommandationsDashboard />
              </ProtectedRoute>
            } />
            <Route path="/recommandations/new" element={
              <ProtectedRoute requiredRole={["SSI", "RSSI"]}>
                <CreateRecommandation />
              </ProtectedRoute>
            } />
            <Route path="/recommandations/:recommandationId" element={
              <ProtectedRoute requiredRole={["ADMIN", "SSI", "RSSI"]}>
                <RecommandationDetail />
              </ProtectedRoute>
            } />

            {/* Protected Routes - Constats (All Users) */}
            <Route path="/constats" element={
              <ProtectedRoute requiredRole={["ADMIN", "SSI", "RSSI"]}>
                <ConstatsDashboard />
              </ProtectedRoute>
            } />
            <Route path="/constats/new" element={
              <ProtectedRoute requiredRole={["SSI", "RSSI"]}>
                <CreateConstat />
              </ProtectedRoute>
            } />
            <Route path="/constats/:constatId" element={
              <ProtectedRoute requiredRole={["ADMIN", "SSI", "RSSI"]}>
                <ConstatDetail />
              </ProtectedRoute>
            } />

            {/* Protected Routes - Plan Actions (All Users) */}
            <Route path="/planactions" element={
              <ProtectedRoute requiredRole={["ADMIN", "SSI", "RSSI"]}>
                <PlanActionsDashboard />
              </ProtectedRoute>
            } />
            <Route path="/planactions/new" element={
              <ProtectedRoute requiredRole={["SSI", "RSSI"]}>
                <CreatePlanAction />
              </ProtectedRoute>
            } />
            <Route path="/planactions/:planActionId" element={
              <ProtectedRoute requiredRole={["ADMIN", "SSI", "RSSI"]}>
                <PlanActionDetail />
              </ProtectedRoute>
            } />

            {/* Protected Routes - Reports (All Users) */}
            <Route path="/reports" element={
              <ProtectedRoute requiredRole={["ADMIN", "SSI", "RSSI"]}>
                <ReportsDashboard />
              </ProtectedRoute>
            } />


            {/* Protected Routes - SWOT for Constats */}
            <Route path="/swot/constat/new" element={
              <ProtectedRoute requiredRole={["SSI", "RSSI"]}>
                <CreateSWOTConstat />
              </ProtectedRoute>
            } />

            {/* Protected Routes - SWOT for Projets */}
            <Route path="/swot/projet/new" element={
              <ProtectedRoute requiredRole={["SSI", "RSSI"]}>
                <CreateSWOTProjet />
              </ProtectedRoute>
            } />
            <Route path="/swot/projet/edit" element={
              <ProtectedRoute requiredRole={["SSI", "RSSI"]}>
                <EditSWOTProjet />
              </ProtectedRoute>
            } />

            {/* Protected Routes - Risques for Constats */}
            <Route path="/risques/constat/new" element={
              <ProtectedRoute requiredRole={["SSI", "RSSI"]}>
                <CreateRisqueConstat />
              </ProtectedRoute>
            } />

            {/* Protected Routes - Risques for Projets */}
            <Route path="/risques/projet/new" element={
              <ProtectedRoute requiredRole={["SSI", "RSSI"]}>
                <CreateRisqueProjet />
              </ProtectedRoute>
            } />

            {/* Protected Routes - Conceptions for Constats */}
            <Route path="/conceptions/constat/new" element={
              <ProtectedRoute requiredRole={["SSI", "RSSI"]}>
                <CreateConceptionConstat />
              </ProtectedRoute>
            } />

            {/* Protected Routes - Conceptions for Projets */}
            <Route path="/conceptions/projet/new" element={
              <ProtectedRoute requiredRole={["SSI", "RSSI"]}>
                <CreateConceptionProjet />
              </ProtectedRoute>
            } />
            <Route path="/conceptions/projet" element={
              <ProtectedRoute requiredRole={["SSI", "RSSI"]}>
                <ConceptionProjetDashboard />
              </ProtectedRoute>
            } />
            
            {/* Protected Routes - Conception Detail */}
            <Route path="/conceptions/:id" element={
              <ProtectedRoute requiredRole={["SSI", "RSSI"]}>
                <ConceptionDetail />
              </ProtectedRoute>
            } />

            {/* Protected Routes - SWOT for Projets */}
            <Route path="/swot/projet" element={
              <ProtectedRoute requiredRole={["SSI", "RSSI"]}>
                <SWOTProjetDashboard />
              </ProtectedRoute>
            } />
            
            {/* Protected Routes - SWOT Detail */}
            <Route path="/swot/:id" element={
              <ProtectedRoute requiredRole={["SSI", "RSSI"]}>
                <SWOTDetail />
              </ProtectedRoute>
            } />

            {/* Protected Routes - Risques for Projets */}
            <Route path="/risques/projet" element={
              <ProtectedRoute requiredRole={["SSI", "RSSI"]}>
                <RisqueProjetDashboard />
              </ProtectedRoute>
            } />
            
            {/* Protected Routes - Risque Detail */}
            <Route path="/risques/:id" element={
              <ProtectedRoute requiredRole={["SSI", "RSSI"]}>
                <RiskDetail />
              </ProtectedRoute>
            } />

            {/* Protected Routes - PAS for Projets */}
            <Route path="/pas/projet" element={
              <ProtectedRoute requiredRole={["SSI", "RSSI"]}>
                <PASProjetDashboard />
              </ProtectedRoute>
            } />
            <Route path="/pas/projet/new" element={
              <ProtectedRoute requiredRole={["SSI", "RSSI"]}>
                <CreatePASProjet />
              </ProtectedRoute>
            } />
            <Route path="/pas/:id" element={
              <ProtectedRoute requiredRole={["SSI", "RSSI"]}>
                <PASDetail />
              </ProtectedRoute>
            } />

            {/* Protected Routes - SecuriteProjet (Security Configuration) */}
            <Route path="/securite-projet/new" element={
              <ProtectedRoute requiredRole={["SSI", "RSSI"]}>
                <SecuriteProjetForm />
              </ProtectedRoute>
            } />
          
          {/* Default redirect for authenticated users */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
