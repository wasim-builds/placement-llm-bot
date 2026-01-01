import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function MainLayout() {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
            {/* Top Navbar */}
            <Navbar />

            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
