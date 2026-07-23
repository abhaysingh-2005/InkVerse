import React, {useState, createContext, useContext, useEffect} from 'react'
import axios from 'axios';
import {useNavigate} from 'react-router-dom'
import toast from 'react-hot-toast';



axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const AppContext = createContext();

export const AppProvider = ({ children })=>{

    const navigate = useNavigate()

    const [token, setToken] = useState(null)
    const [blogs, setBlogs] = useState([])
    const [input, setInput] = useState("")
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const fetchBlogs = async () => {
        try {
            const {data} = await axios.get('/api/blog/all');
            data.success ? setBlogs(data.blogs) : toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        }
    }

    const refreshBlogs = async () => {
        await fetchBlogs();
        setRefreshTrigger(prev => prev + 1);
    };

    useEffect(() => {
        fetchBlogs();
        const storedToken = localStorage.getItem('userToken') || localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            axios.defaults.headers.common['Authorization'] = storedToken.startsWith('Bearer ') ? storedToken : `Bearer ${storedToken}`;
        }
    }, []);


    const value ={
        axios, navigate, token, setToken, blogs, setBlogs, input, setInput, fetchBlogs, refreshTrigger, refreshBlogs
    }

    return (

        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = ()=>{
    return useContext(AppContext)
};