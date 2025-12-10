import TaskList from './TaskList';
import OfflineIndicator from './OfflineIndicator';

export default function App() {
    return (
        <div className="min-h-screen bg-[#FDFDFC] dark:bg-[#0a0a0a]">
            <TaskList />
            <OfflineIndicator />
        </div>
    );
}

