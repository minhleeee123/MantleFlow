import { sendEmail } from './services/email';

const runTest = async () => {
    console.log('📧 Testing Email Service...');
    console.log('To: 22010483@st.phenikaa-uni.edu.vn');

    try {
        await sendEmail(
            '22010483@st.phenikaa-uni.edu.vn',
            '🧪 Test Email from Auto-Trading Bot',
            `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f0f2f5; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.08); border: 1px solid #e1e4e8; }
                    
                    /* Header */
                    .header { background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); color: #ffffff; padding: 30px 20px; text-align: center; }
                    .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px; }
                    .header-subtitle { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 2px; margin-top: 8px; }

                    /* Content */
                    .content { padding: 40px 30px; color: #333333; }
                    
                    .hero-section { text-align: center; margin-bottom: 35px; border-bottom: 2px dashed #f0f0f0; padding-bottom: 30px; }
                    .status-badge { background-color: #e3f9e5; color: #1b5e20; padding: 8px 16px; border-radius: 20px; font-weight: 700; font-size: 13px; display: inline-block; margin-bottom: 15px; border: 1px solid #c8e6c9; }
                    .hero-title { font-size: 20px; margin: 10px 0 5px; color: #111; font-weight: 700; }
                    .hero-desc { color: #666; font-size: 15px; line-height: 1.5; margin: 0; }

                    /* Metrics Grid */
                    .details-box { background-color: #f8f9fa; border-radius: 8px; padding: 20px; border: 1px solid #eaeaea; }
                    .metric-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #ececec; }
                    .metric-row:last-child { border-bottom: none; }
                    
                    .metric-label { font-weight: 600; color: #555555; font-size: 14px; display: flex; align-items: center; gap: 8px; }
                    .metric-value { font-weight: 700; color: #000000; font-size: 14px; font-family: 'SF Mono', 'Segoe UI Mono', 'Roboto Mono', monospace; text-align: right; }
                    
                    /* CTA */
                    .cta-button { display: block; width: 100%; text-align: center; background-color: #000000; color: #ffffff; padding: 18px 0; text-decoration: none; font-weight: 700; margin-top: 30px; border-radius: 8px; transition: transform 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
                    .cta-button:hover { background-color: #333; transform: translateY(-1px); }

                    /* Footer */
                    .footer { background-color: #fafafa; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eaeaea; line-height: 1.6; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>MANTLEFLOW</h1>
                        <div class="header-subtitle">Autonomous Trading Agent</div>
                    </div>
                    <div class="content">
                        <div class="hero-section">
                            <span class="status-badge">✅ SYSTEM OPERATIONAL</span>
                            <h2 class="hero-title">Email Integration Active</h2>
                            <p class="hero-desc">The system has successfully established a secure notification channel.</p>
                        </div>
                        
                        <div class="details-box">
                            <div class="metric-row">
                                <span class="metric-label">📡 Connection Status:</span>
                                <span class="metric-value" style="color: #2e7d32">CONNECTED</span>
                            </div>
                            <div class="metric-row">
                                <span class="metric-label">⏱️ Latency:</span>
                                <span class="metric-value">45ms</span>
                            </div>
                            <div class="metric-row">
                                <span class="metric-label">🛡️ Security Protocol:</span>
                                <span class="metric-value">TLS v1.3</span>
                            </div>
                            <div class="metric-row">
                                <span class="metric-label">🌍 Server Region:</span>
                                <span class="metric-value">Asia-Southeast (Singapore)</span>
                            </div>
                            <div class="metric-row" style="border-bottom: none;">
                                <span class="metric-label">📅 Timestamp:</span>
                                <span class="metric-value">${new Date().toLocaleString()}</span>
                            </div>
                        </div>

                        <a href="http://localhost:5173" class="cta-button">OPEN DASHBOARD &rarr;</a>
                    </div>
                    <div class="footer">
                        <p>This is an automated notification from your MantleFlow Trading Node.<br>
                        Please do not reply to this email.</p>
                        <p>&copy; 2024 MantleFlow Finance. Secured by Mantle Network.</p>
                    </div>
                </div>
            </body>
            </html>
            `
        );
        console.log('🎉 Test Completed Successfully!');
    } catch (error) {
        console.error('💥 Test Failed:', error);
    }
};

runTest();
