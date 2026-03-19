export const useAuth = () => {

  // existing code...

  const sendSignupOTP = async (email: string) => {
    // code
  };

  const verifyOTP = async (email: string, otp: string, type: string) => {
    // code
  };

  const sendResetOTP = async (email: string) => {
    // code
  };

  return {
    // existing values
    sendSignupOTP,
    verifyOTP,
    sendResetOTP
  };
};
