// src/mailer.ts
import nodemailer from 'nodemailer'
import path from 'path'

/**
 * Arguments for sending a review email
 */
export interface ReviewEmailOptions {
  to: string             // recipient email address
  userName: string       // recipient's name
  reviewComments: string[]  // array of feedback lines
}

// 1. Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),  // e.g. 587
  secure: false,                        // STARTTLS (port 587)
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
})

/**
 * Build HTML for the review email, using a modern purple theme.
 */
function buildReviewEmail(opts: ReviewEmailOptions): string {
  const { userName, reviewComments } = opts
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your CV Review is Ready!</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
    }
    
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .header .subtitle {
      font-size: 16px;
      opacity: 0.9;
      font-weight: 300;
    }
    
    .content {
      padding: 40px 30px;
    }
    
    .greeting {
      font-size: 18px;
      color: #374151;
      margin-bottom: 24px;
      font-weight: 500;
    }
    
    .intro-text {
      font-size: 16px;
      color: #6b7280;
      margin-bottom: 32px;
      line-height: 1.7;
    }
    
    .review-section {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 32px;
      border-left: 4px solid #8b5cf6;
    }
    
    .review-title {
      font-size: 18px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
    }
    
    .review-title::before {
      content: "📝";
      margin-right: 8px;
      font-size: 20px;
    }
    
    .comments-list {
      list-style: none;
      padding: 0;
    }
    
    .comments-list li {
      background: white;
      padding: 12px 16px;
      margin-bottom: 8px;
      border-radius: 8px;
      border-left: 3px solid #8b5cf6;
      font-size: 15px;
      line-height: 1.6;
      color: #374151;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    
    .comments-list li:last-child {
      margin-bottom: 0;
    }
    
    .cta-section {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      margin-bottom: 32px;
    }
    
    .cta-text {
      color: white;
      font-size: 16px;
      margin-bottom: 20px;
      font-weight: 500;
    }
    
    .cta-button {
      display: inline-block;
      background: white;
      color: #7c3aed;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }
    
    .logo-section {
      text-align: center;
      margin-bottom: 24px;
    }
    
  .logo-section-img {
    width: 450px;          /* fixed max width */
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
    
    .footer {
      background: #f8fafc;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    
    .footer-brand {
      font-size: 20px;
      font-weight: 700;
      color: #7c3aed;
      margin-bottom: 8px;
    }
    
    .footer-tagline {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 12px;
    }
    
    .footer-website {
      font-size: 14px;
      color: #8b5cf6;
      text-decoration: none;
      font-weight: 500;
    }
    
    .footer-website:hover {
      text-decoration: underline;
    }
    
    .divider {
      height: 2px;
      background: linear-gradient(90deg, transparent, #8b5cf6, transparent);
      margin: 24px 0;
    }
    
    @media (max-width: 600px) {
      .email-container {
        margin: 10px;
        border-radius: 12px;
      }
      
      .header, .content, .footer {
        padding: 24px 20px;
      }
      
      .header h1 {
        font-size: 24px;
      }
      
      .review-section {
        padding: 20px;
      }
      
      .cta-section {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <h1>🎉 CV Review Complete!</h1>
      <div class="subtitle">Your professional feedback is ready</div>
    </div>
    
    <!-- Main Content -->
    <div class="content">
      <div class="greeting">
        Hello <strong>${userName}</strong>,
      </div>
      
      <div class="intro-text">
        Great news! An experienced senior professional in your domain has carefully reviewed your CV and provided valuable insights to help you stand out in your job search.
      </div>
      
      <!-- Review Comments Section -->
      <div class="review-section">
        <div class="review-title">
          Professional Feedback & Recommendations
        </div>
        <ul class="comments-list">
          ${reviewComments.map(comment => `<li>${comment}</li>`).join('')}
        </ul>
      </div>
      
      <div class="divider"></div>
      
      <!-- Call to Action -->
      <div class="cta-section">
        <div class="cta-text">
          Ready to take your career to the next level?
        </div>
        <a href="https://prepnest.in/?refercode=PrepGrow-sahib-singhprepgrowthpartner-02" class="cta-button">
          Explore PrepNest Services
        </a>
      </div>
      
      <!-- Logo Section -->
      <div class="logo-section">
        <img src="cid:prepnestImage" alt="PrepNest Logo" class="logo-section-img">
      </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <div class="footer-brand">PrepNest</div>
      <div class="footer-tagline">Simplifying your job journey</div>
      <a href="https://www.prepnest.in" class="footer-website">www.prepnest.in</a>
    </div>
  </div>
</body>
</html>
  `
}

/**
 * Send a CV review email with embedded PrepNest image.
 */
export async function sendReviewEmail(options: ReviewEmailOptions): Promise<void> {
  const html = buildReviewEmail(options)
  
  await transporter.sendMail({
    from: `"Communiqué, IIT Kharagpur" <${process.env.SMTP_USER}>`,
    to: options.to,
    subject: '🎉 Your CV Review is Ready!',
    html,
    attachments: [
      {
        filename: 'prepnest.jpg',
        path: path.resolve(__dirname, '../../assets/prepnest.jpg'),
        cid: 'prepnestImage',
      },
    ],
  })
}