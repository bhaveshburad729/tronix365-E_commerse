import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
            setQuery('');
        }
    };

    return (
        <form onSubmit={handleSearch} className="relative w-full md:w-auto">
            <input
                type="text"
                placeholder="Search products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full md:w-64 bg-white/10 border border-white/10 rounded-full py-2 pl-4 pr-10 text-white placeholder-gray-400 focus:outline-none focus:border-tronix-primary focus:bg-white/20 transition-all"
            />
            <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
                <Search size={18} />
            </button>
        </form>
    );
};

export default SearchBar;
