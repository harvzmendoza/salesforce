export default function ExampleComponent({ title = 'Example Component', children }) {
    return (
        <div className="p-4 border border-[#e3e3e0] dark:border-[#3E3E3A] rounded-sm bg-white dark:bg-[#161615]">
            <h2 className="text-xl font-medium mb-2 text-[#1b1b18] dark:text-[#EDEDEC]">
                {title}
            </h2>
            {children && (
                <div className="text-[#706f6c] dark:text-[#A1A09A]">
                    {children}
                </div>
            )}
        </div>
    );
}

