import nodemailer from 'nodemailer';

export const sendSwapSuccessEmail = async (
    toEmail: string,
    txHash: string,
    symbol: string,
    amount: number,
    type: 'BUY' | 'SELL',
    price: number
) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: toEmail,
            subject: `✅ SWAP SUCCESS: ${type} ${symbol}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
                    <h2 style="color: #4CAF50;">Giao dịch thành công! 🚀</h2>
                    <p>Hệ thống Auto-Trading vừa thực hiện một lệnh swap cho ví của bạn.</p>
                    
                    <ul style="background: #f9f9f9; padding: 15px;">
                        <li><strong>Loại lệnh:</strong> ${type}</li>
                        <li><strong>Token:</strong> ${symbol}</li>
                        <li><strong>Số lượng:</strong> ${amount}</li>
                        <li><strong>Mức giá:</strong> $${price}</li>
                    </ul>

                    <p>Xem chi tiết giao dịch trên Mantle Explorer:</p>
                    <a href="https://explorer.sepolia.mantle.xyz/tx/${txHash}" 
                       style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                       Xem trên Explorer
                    </a>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('📧 Email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        return false;
    }
};
