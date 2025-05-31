import React, { useState, useEffect } from 'react';

interface ClientTimeDisplayProps {
    date: Date;
}

const ClientTimeDisplay: React.FC<ClientTimeDisplayProps> = ({ date }) => {
    const [timeString, setTimeString] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        
        const updateTime = () => {
            const now = new Date();
            const diff = now.getTime() - new Date(date).getTime();
            const minutes = Math.floor(diff / 60000);
            const hours = Math.floor(diff / 3600000);
            const days = Math.floor(diff / 86400000);

            if (days > 0) setTimeString(`${days}d`);
            else if (hours > 0) setTimeString(`${hours}h`);
            else if (minutes > 0) setTimeString(`${minutes}m`);
            else setTimeString('now');
        };

        if (mounted) {
            updateTime();
            const interval = setInterval(updateTime, 60000);
            return () => clearInterval(interval);
        }
    }, [date, mounted]);

    if (!mounted) return <span>...</span>;
    return <span>{timeString}</span>;
};

export default ClientTimeDisplay;