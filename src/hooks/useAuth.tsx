import { useState } from 'react';
import { supabase } from '../supabaseClient';

const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const sendVerificationEmail = async (email) => {
        setLoading(true);
        setError(null);
        const { error } = await supabase.auth.sendMagicLinkEmail(email);
        setLoading(false);
        if (error) setError(error.message);
    };

    const sendPasswordResetEmail = async (email) => {
        setLoading(true);
        setError(null);
        const { error } = await supabase.auth.api.resetPasswordForEmail(email);
        setLoading(false);
        if (error) setError(error.message);
    };

    return {
        loading,
        error,
        sendVerificationEmail,
        sendPasswordResetEmail
    };
};

export default useAuth;