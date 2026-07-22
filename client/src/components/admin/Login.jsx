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
            // Google se mila hua id_token hum backend ko bhejenge
            const { data } = await axios.post('/api/admin/google-login', { 
                token: credentialResponse.credential 
            });

            if (data.success) {
                setToken(data.token);
                localStorage.setItem('token', data.token);
                axios.defaults.headers.common['Authorization'] = data.token;
                toast.success("Google Login Successful!");
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
                axios.defaults.headers.common['Authorization'] = data.token;
                toast.success("Login Successful!");
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    return (
        <div className='flex items-center justify-center h-screen'>
            <div className='w-full max-w-sm p-6 max-md:m-6 border border-primary/30 shadow-xl shadow-primary/15 rounded-lg'>
                <div className='flex flex-col items-center justify-center'>
                    <div className='w-full py-6 text-center'>
                        <h1 className='text-3xl font-bold'><span className='text-primary'>Admin</span> Login</h1>
                        <p className='font-light'>Enter your credential to access the admin panel </p>
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

                        {/* --- YAHAN SE NAYA CODE ADD KIYA HAI --- */}
                        {/* Beech mein OR line dikhane ke liye */}
                        <div className='flex items-center my-4 before:flex-1 before:border-t before:border-gray-300 after:flex-1 after:border-t after:border-gray-300'>
                            <p className='mx-4 text-center font-semibold text-gray-400 text-sm'>OR</p>
                        </div>

                        {/* Google Login Button */}
                        <div className='flex justify-center w-full'>
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => toast.error('Google Login Failed')}
                            />
                        </div>
                        {/* --- NAYA CODE END --- */}

                    </form>
                </div>
            </div>
        </div>
    )
}

// Dots (...) hata kar single semi-colon laga diya hai
export default Login;