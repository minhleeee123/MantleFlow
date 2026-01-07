import { sendEmail } from './services/email';

const runTest = async () => {
    console.log('📧 Testing Email Service...');
    console.log('To: 22010483@st.phenikaa-uni.edu.vn');

    try {
        await sendEmail(
            '22010483@st.phenikaa-uni.edu.vn',
            '🧪 Test Email from Auto-Trading Bot',
            'Hello! If you receive this, the email integration is working perfectly. 🚀'
        );
        console.log('🎉 Test Completed Successfully!');
    } catch (error) {
        console.error('💥 Test Failed:', error);
    }
};

runTest();
