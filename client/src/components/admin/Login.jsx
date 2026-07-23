import React, { useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import { toast } from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {

    const { axios, setToken } = useAppContext();

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const { data } = await axios.post('/api/admin/google-login', { 
                token: credentialResponse.credential 
            });

            if (data.success) {
                setToken(data.token);
                localStorage.setItem('token', data.token);
                localStorage.setItem('userToken', data.token);
                localStorage.setItem('userRole', 'Admin');
                localStorage.setItem('userName', 'Admin User');
                axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                toast.success("Google Admin Login Successful!");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const { data } = await axios.post('/api/admin/login', { email, password })

            if (data.success) {
                setToken(data.token)
                localStorage.setItem('token', data.token)
                localStorage.setItem('userToken', data.token)
                localStorage.setItem('userRole', 'Admin')
                localStorage.setItem('userName', 'Admin User')
                axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                toast.success("Login Successful!");
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleDemoAdmin = async () => {
        try {
            const { data } = await axios.post('/api/user/demo-login', { role: 'Admin' });
            if (data.success) {
                setToken(data.token);
                localStorage.setItem('token', data.token);
                localStorage.setItem('userToken', data.token);
                localStorage.setItem('userRole', 'Admin');
                localStorage.setItem('userName', data.user.name);
                axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                toast.success("Demo Admin Login Successful!");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    return (
        <div className='flex items-center justify-center h-screen'>
            <div className='w-full max-w-sm p-6 max-md:m-6 border border-primary/30 shadow-xl shadow-primary/15 rounded-lg'>
                <div className='flex flex-col items-center justify-center'>
                    <div className='w-full py-6 text-center'>
                        <h1 className='text-3xl font-bold'><span className='text-primary'>Admin</span> Login</h1>
                        <p className='font-light'>Enter your credentials to access the admin panel</p>
                    </div>
                    <form onSubmit={handleSubmit} className='mt-6 w-full sm:max-w-md text-gray-600'>
                        <div className='flex flex-col'>
                            <label> Email </label>
                            <input onChange={e => setEmail(e.target.value)} value={email} type="email" required placeholder='Write Your Email Id' className='border-b-2 border-gray-300 p-2 outline-none mb-6' />
                        </div>

                        <div className='flex flex-col'>
                            <label> Password </label>
                            <input onChange={e => setPassword(e.target.value)} value={password} type="password" required placeholder='Write Your Password' className='border-b-2 border-gray-300 p-2 outline-none mb-6' />
                        </div>

                        <button type="submit" className='w-full py-3 font-medium bg-primary text-white rounded cursor-pointer hover:bg-primary/90'>Login</button>

                        <div className='flex items-center my-4 before:flex-1 before:border-t before:border-gray-300 after:flex-1 after:border-t after:border-gray-300'>
                            <p className='mx-4 text-center font-semibold text-gray-400 text-sm'>OR</p>
                        </div>

                        <div className='flex justify-center w-full mb-3'>
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => toast.error('Google Login Failed')}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleDemoAdmin}
                            className='w-full py-2.5 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded cursor-pointer hover:bg-purple-100 transition'
                        >
                            🛡️ One-Click Demo Admin Login
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login;